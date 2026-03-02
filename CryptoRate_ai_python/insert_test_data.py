import os
from dotenv import load_dotenv

# 使用最新的 langchain_milvus 官方支持库
from langchain_milvus import Milvus as MilvusVectorStore
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_core.documents import Document

# --------- 1. 加载配置 ---------
# 使用 dotenv 从本地 .env 文件中加载敏感环境变量
print("[*] 正在加载环境变量配置...")
load_dotenv()

MILVUS_URI = os.getenv("MILVUS_URI")
MILVUS_TOKEN = os.getenv("MILVUS_TOKEN")
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY")

COLLECTION_NAME = "crypto_knowledge_base"

# 进行必须的安全性检查
if not DASHSCOPE_API_KEY or DASHSCOPE_API_KEY == "你的_DASHSCOPE_API_KEY":
    raise ValueError("[!] 未找到有效的 DASHSCOPE_API_KEY，请在 .env 中正确配置！")
if not MILVUS_URI or not MILVUS_TOKEN:
    raise ValueError("[!] 未找到有效的 MILVUS_URI 或 MILVUS_TOKEN，请在 .env 中正确配置！")

# --------- 2. 初始化模型 ---------
print("[*] 正在初始化阿里云百炼 (DashScope) Embedding 模型...")
embeddings = DashScopeEmbeddings(
    dashscope_api_key=DASHSCOPE_API_KEY
    # 不指定 model 参数，默认使用 text-embedding-v1
)

# --------- 3. 构建业务测试数据 ---------
print("[*] 正在构造核心加密货币业务测试文档数据...")
docs = [
    Document(
        page_content=(
            "比特币(BTC)在最近一周内经历了一次显著的市场突破，"
            "价格迅速攀升至关键阻力位上方。机构资金的持续流入被认为是推动这一波上涨的主要动力，"
            "市场情绪呈现强烈的看涨趋势。"
        ),
        metadata={"symbol": "BTC", "source": "market_analysis"}
    ),
    Document(
        page_content=(
            "以太坊(ETH)核心开发者宣布下一个重大网络升级将在下个月正式部署。"
            "此次升级旨在进一步降低 Layer 2 网络的交易费用并提升主网的整体吞吐量。"
            "分析师预计这将大幅增强以太坊在 DeFi 和智能合约领域的竞争力。"
        ),
        metadata={"symbol": "ETH", "source": "network_update"}
    ),
    Document(
        page_content=(
            "宏观经济数据对加密加密市场产生了深远影响。"
            "随着全球主要央行释放出降息的信号，传统金融市场的资金开始寻找更高收益的替代资产。"
            "这一宏观背景为整个加密货币市场，特别是具有市值主导地位的资产，提供了坚实的价值支撑。"
        ),
        metadata={"symbol": "MACRO", "source": "economic_report"}
    ),
]

# --------- 4. 执行向量化与数据插入 ---------
print(f"[*] 准备连接 Zilliz Cloud 并向集合 '{COLLECTION_NAME}' 插入 {len(docs)} 条数据...")
print("[*] (此过程包括了 API 端的文本向量化运算和云端的入库，请稍候...)")

try:
    # drop_old=True: 如果集合已存在，自动删除并按新模型的向量维度重建（解决模型切换时的维度冲突问题）
    vector_store = MilvusVectorStore.from_documents(
        documents=docs,
        embedding=embeddings,
        connection_args={
            "uri": MILVUS_URI,
            "token": MILVUS_TOKEN,
        },
        collection_name=COLLECTION_NAME,
        auto_id=True,
        drop_old=True  # 自动删除旧集合，按新向量维度重建
    )
    
    print("\n✅ [" + "="*30 + "] ✅")
    print(f"🎉 成功插入 {len(docs)} 条测试数据到 {COLLECTION_NAME}！")
    print("✅ [" + "="*30 + "] ✅\n")
    
except Exception as e:
    print(f"\n[!] 插入过程中发生错误: {e}")
    print("    -> 提示：如果报 embedding 相关错误，请确认 .env 中 DASHSCOPE_API_KEY 配置正确且模型已开通。")
