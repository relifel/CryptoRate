r"""
insert_zilliz.py
================
加密货币知识库数据灌入流水线

功能：
  1. 从 data/knowledge_base/ 目录递归加载所有 .md 文件
  2. 使用 MarkdownHeaderTextSplitter 按标题结构做语义初步切分
  3. 使用 RecursiveCharacterTextSplitter 做二次精细切分
  4. 通过 DashScopeEmbeddings 将文本块向量化
  5. 调用 langchain_milvus 将向量批量写入 Zilliz Cloud

运行方式：
  .venv\Scripts\python.exe insert_zilliz.py
"""

import os
import pathlib
from dotenv import load_dotenv

# ── LangChain 文档加载
from langchain_community.document_loaders import DirectoryLoader, TextLoader

# ── LangChain 文本切分器
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

# ── Embedding 模型（阿里云百炼通义千问）
from langchain_community.embeddings import DashScopeEmbeddings

# ── Milvus / Zilliz Cloud 向量库（使用官方最新包）
from langchain_milvus.vectorstores import Milvus as MilvusVectorStore

# ─────────────────────────────────────────────
# 1. 加载环境变量
# ─────────────────────────────────────────────
load_dotenv()

ZILLIZ_URI     = os.getenv("ZILLIZ_CLOUD_URI")
ZILLIZ_TOKEN   = os.getenv("ZILLIZ_CLOUD_API_KEY")
DASHSCOPE_KEY  = os.getenv("DASHSCOPE_API_KEY")

# 安全检查：缺少任何一个关键配置都提前报错，避免运行到一半才失败
if not ZILLIZ_URI or not ZILLIZ_TOKEN:
    raise ValueError("[!] 缺少 ZILLIZ_CLOUD_URI 或 ZILLIZ_CLOUD_API_KEY，请检查 .env 文件！")
if not DASHSCOPE_KEY:
    raise ValueError("[!] 缺少 DASHSCOPE_API_KEY，请检查 .env 文件！")

# 集合名称（Zilliz Cloud 中的 Collection）
COLLECTION_NAME = "crypto_knowledge"

# 知识库根目录（相对于本脚本所在目录）
KNOWLEDGE_BASE_DIR = pathlib.Path(__file__).parent / "data" / "knowledge_base"

# ─────────────────────────────────────────────
# 2. 文档加载
# ─────────────────────────────────────────────
print("=" * 55)
print("  🚀 CryptoRate 知识库数据灌入流水线 启动")
print("=" * 55)

if not KNOWLEDGE_BASE_DIR.exists():
    raise FileNotFoundError(
        f"[!] 知识库目录不存在: {KNOWLEDGE_BASE_DIR}\n"
        "    请在该目录下放置 .md 格式的知识库文件后重新运行。"
    )

print(f"\n[1/4] 📂 正在加载目录: {KNOWLEDGE_BASE_DIR}")

# DirectoryLoader 递归扫描所有 .md 文件，强制 UTF-8 编码读取
loader = DirectoryLoader(
    path=str(KNOWLEDGE_BASE_DIR),
    glob="**/*.md",                                    # 递归匹配子目录下的 .md
    loader_cls=TextLoader,
    loader_kwargs={"encoding": "utf-8"},               # 强制 UTF-8，避免乱码
    use_multithreading=True,                           # 多线程加速大批量加载
    show_progress=True,
)

raw_docs = loader.load()
print(f"    ✅ 共加载 {len(raw_docs)} 个文档文件")

if not raw_docs:
    print("[!] 未加载到任何文档，请检查知识库目录内是否存在 .md 文件。")
    exit(0)

# ─────────────────────────────────────────────
# 3. 智能切片（两阶段）
# ─────────────────────────────────────────────
print(f"\n[2/4] ✂️  正在执行智能切片（Markdown 结构 + 递归字符）...")

# ── 阶段一：按 Markdown 标题结构做语义切分
#    H1 (#) 和 H2 (##) 作为分割点，元数据保留标题信息
markdown_header_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[
        ("#",  "标题一"),
        ("##", "标题二"),
        ("###","标题三"),
    ],
    strip_headers=False,   # 保留标题内容在文本中，便于检索理解
)

header_split_docs = []
for doc in raw_docs:
    splits = markdown_header_splitter.split_text(doc.page_content)
    # 将原始文档的 source 元数据传递给每个切片
    for split in splits:
        split.metadata.update({"source": doc.metadata.get("source", "unknown")})
    header_split_docs.extend(splits)

print(f"    第一阶段（Markdown 标题切分）：{len(header_split_docs)} 个语义块")

# ── 阶段二：对已按标题拆分的块，再按字符数做精细切分
#    避免单个标题下内容过长，超出 Embedding 模型 Token 限制
recursive_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,         # 每块最大字符数（中文约 400 字）
    chunk_overlap=100,      # 块间重叠，保留上下文连贯性
    separators=["\n\n", "\n", "。", "；", "，", " ", ""],  # 优先按段落/句子切
)

final_chunks = recursive_splitter.split_documents(header_split_docs)
print(f"    第二阶段（递归字符切分）：最终 {len(final_chunks)} 个数据块")

# 打印首块内容预览（调试用）
if final_chunks:
    print(f"\n    ── 首块内容预览（前 120 字）──")
    print(f"    {final_chunks[0].page_content[:120].replace(chr(10), ' ')}...")
    print(f"    Metadata: {final_chunks[0].metadata}")

# ─────────────────────────────────────────────
# 4. 初始化 Embedding 模型
# ─────────────────────────────────────────────
print(f"\n[3/4] 🧠 正在初始化 DashScope Embedding 模型（text-embedding-v1）...")

embeddings = DashScopeEmbeddings(
    dashscope_api_key=DASHSCOPE_KEY
    # 不指定 model 参数，默认使用 text-embedding-v1（1536 维）
)

print("    ✅ Embedding 模型初始化完成")

# ─────────────────────────────────────────────
# 5. 向量化并写入 Zilliz Cloud
# ─────────────────────────────────────────────
print(f"\n[4/4] ☁️  正在向量化并写入 Zilliz Cloud...")
print(f"    集合名称 : {COLLECTION_NAME}")
print(f"    目标地址 : {ZILLIZ_URI}")
print(f"    数据块总数: {len(final_chunks)}")
print(f"    ⏳ 请稍候，此过程涉及 API 向量化和云端入库，预计需要一段时间...\n")

vector_store = MilvusVectorStore.from_documents(
    documents=final_chunks,
    embedding=embeddings,
    connection_args={
        "uri":   ZILLIZ_URI,
        "token": ZILLIZ_TOKEN,
    },
    collection_name=COLLECTION_NAME,
    auto_id=True,
    drop_old=True,   # 每次运行前清空旧数据，方便反复测试
)

print("\n" + "=" * 55)
print(f"  🎉 数据灌入完成！")
print(f"     共写入 {len(final_chunks)} 个文档块")
print(f"     集合：{COLLECTION_NAME} @ Zilliz Cloud")
print("=" * 55 + "\n")
