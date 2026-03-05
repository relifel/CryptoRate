import os
import contextlib
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# LangChain 相关依赖
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_community.chat_models import ChatTongyi
from langchain_milvus.vectorstores import Milvus as MilvusVectorStore
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain

# =============================================
# 1. 常量与环境变量
# =============================================
load_dotenv()

MILVUS_URI: Optional[str] = os.getenv("MILVUS_URI")
MILVUS_TOKEN: Optional[str] = os.getenv("MILVUS_TOKEN")
DASHSCOPE_API_KEY: Optional[str] = os.getenv("DASHSCOPE_API_KEY")
COLLECTION_NAME = "crypto_knowledge"

# =============================================
# 2. Pydantic 数据模型 (DTO)
# =============================================
class AskRequest(BaseModel):
    """POST /ai/ask 请求体"""
    question: str

class AskResponse(BaseModel):
    """POST /ai/ask 响应体"""
    answer: str
    code: int = 200

# =============================================
# 3. 生命周期管理 (Lifespan)
#    在服务启动时一次性初始化 RAG 资源，挂载到 app.state
# =============================================
@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI 生命周期：startup 时初始化 RAG 链，shutdown 时释放资源"""
    print("="*50)
    print("  [Startup] 正在初始化 CryptoMonitor AI Service...")
    print("="*50)

    # 验证环境变量
    if not DASHSCOPE_API_KEY:
        raise RuntimeError("[!] 缺少 DASHSCOPE_API_KEY，请检查 .env 文件！")
    if not MILVUS_URI or not MILVUS_TOKEN:
        raise RuntimeError("[!] 缺少 MILVUS_URI 或 MILVUS_TOKEN，请检查 .env 文件！")

    # a. 初始化 Embedding 模型（默认 text-embedding-v1）
    print("[*] 加载 DashScope Embeddings (text-embedding-v1)...")
    embeddings = DashScopeEmbeddings(dashscope_api_key=DASHSCOPE_API_KEY)

    # b. 连接 Zilliz Cloud / Milvus 向量数据库
    print(f"[*] 连接 Milvus 集合: {COLLECTION_NAME}...")
    vectorstore = MilvusVectorStore(
        embedding_function=embeddings,
        connection_args={"uri": MILVUS_URI, "token": MILVUS_TOKEN},
        collection_name=COLLECTION_NAME,
        auto_id=True
    )

    # c. 实例化大语言模型
    print("[*] 加载大语言模型 ChatTongyi (qwen3-max)...")
    llm = ChatTongyi(
        model="qwen3-max",
        dashscope_api_key=DASHSCOPE_API_KEY,
        temperature=0.3
    )

    # d. 构建 Prompt 模板（加密货币分析师设定）
    system_prompt = (
        "你是一个极其专业的加密货币市场分析师和金融助手。\n"
        "你的任务是根据下面提供的[检索知识片段(Context)]，客观、准确地回答用户关于加密货币的问题。\n"
        "如果你在给定的片段中找不到答案，请诚实地说明你无法提供信息，不要凭空编造。\n"
        "回复要点应清晰、有层次、用词专业。\n\n"
        "---------------------\n"
        "[检索知识片段(Context)]:\n"
        "{context}\n"
        "---------------------\n"
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}")
    ])

    # e. 使用 LCEL 语法构建完整的 RAG 检索问答链
    print("[*] 构建 LangChain LCEL RAG 检索问答链...")
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(
        vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3}),
        question_answer_chain
    )

    # 将构建好的链挂载到 app.state，供所有路由函数共享访问
    app.state.rag_chain = rag_chain
    print("✅ RAG 服务初始化完成！监听中...\n")

    yield  # 从 startup 切换到应用运行

    # ---- shutdown 阶段 ----
    print("\n[Shutdown] 服务正在关闭，释放资源...")

# =============================================
# 4. FastAPI 实例与 CORS 中间件
# =============================================
app = FastAPI(
    title="CryptoMonitor AI Service",
    description="基于 LangChain + Milvus + DashScope 的加密货币 RAG 问答接口",
    version="1.0.0",
    lifespan=lifespan
)

# 配置跨域：允许所有来源（开发调试用，生产环境请按需收紧）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================
# 5. 核心接口
# =============================================
@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok", "service": "CryptoMonitor AI Service"}


@app.post("/ai/ask", response_model=AskResponse)
async def ask_question(body: AskRequest, request: Request):
    """
    核心 RAG 问答接口。
    接收用户问题，从 app.state 获取预初始化的 RAG 链，
    检索向量数据库并调用大语言模型生成回答，返回结构化响应。
    """
    # 从 app.state 获取预热好的全局 RAG 链（无需重复初始化，极速响应）
    rag_chain = request.app.state.rag_chain

    if not body.question or not body.question.strip():
        return JSONResponse(
            status_code=400,
            content={"answer": "问题不能为空", "code": 400}
        )

    try:
        print(f"[*] 收到问题: {body.question}")

        # 调用 RAG 链：先检索上下文，再送入 LLM 生成答案
        result = rag_chain.invoke({"input": body.question})
        answer = result.get("answer", "抱歉，无法生成有效回答。")

        print(f"[*] 回答生成完毕，长度: {len(answer)} 字")
        return AskResponse(answer=answer, code=200)

    except Exception as e:
        # 捕获所有异常，打印详细日志，并返回标准化 500 响应
        print(f"[!] /ai/ask 接口发生异常: {e}")
        return JSONResponse(
            status_code=500,
            content={"answer": f"服务内部错误: {str(e)}", "code": 500}
        )

# =============================================
# 6. 直接运行入口
# =============================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
