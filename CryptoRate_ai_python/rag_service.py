import os
from dotenv import load_dotenv

# LangChain 相关依赖
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_community.chat_models import ChatTongyi
from langchain_milvus.vectorstores import Milvus as MilvusVectorStore  # 官方最新包，正确导入路径
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain

# --------- 1. 加载环境变量 ---------
load_dotenv()

MILVUS_URI = os.getenv("MILVUS_URI")
MILVUS_TOKEN = os.getenv("MILVUS_TOKEN")
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY")

COLLECTION_NAME = "crypto_knowledge_base"

# --------- 2. RAG 服务类封装 ---------
class CryptoRAGService:
    def __init__(self):
        """
        初始化 RAG 服务，包含大模型、Embedding 模型、向量数据库连接和问答链。
        """
        if not DASHSCOPE_API_KEY or DASHSCOPE_API_KEY == "你的_DASHSCOPE_API_KEY":
            raise ValueError("[!] 未检测到有效的 DASHSCOPE_API_KEY，请检查 .env 文件。")
            
        if not MILVUS_URI or not MILVUS_TOKEN:
            raise ValueError("[!] 未检测到 MILVUS_URI 或 MILVUS_TOKEN，请检查 .env 文件。")

        # 1. 实例化 Embedding 模型 (text-embedding-v2 生成 1536维)
        print("[*] 正在加载 DashScope Embeddings (text-embedding-v2)...")
        self.embeddings = DashScopeEmbeddings(
            dashscope_api_key=DASHSCOPE_API_KEY
            # 不指定 model 参数，默认使用 text-embedding-v1
        )

        # 2. 实例化大语言模型 (Qwen)
        print("[*] 正在加载大语言模型 ChatTongyi (qwen-turbo)...")
        self.llm = ChatTongyi(
            model="qwen3-max",
            dashscope_api_key=DASHSCOPE_API_KEY,
            temperature=0.3
        )

        # 3. 实例化 Zilliz Cloud / Milvus 连接 (VectorStore)
        print(f"[*] 正在连接 Milvus 集合: {COLLECTION_NAME}...")
        self.vectorstore = MilvusVectorStore(
            embedding_function=self.embeddings,
            connection_args={"uri": MILVUS_URI, "token": MILVUS_TOKEN},
            collection_name=COLLECTION_NAME,
            auto_id=True
        )
        # 将 VectorStore 转化为 Retriever (检索器)
        self.retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 3}  # 检索最相关的 3 条上下文片段
        )

        # 4. 构建 Prompt Template
        print("[*] 正在构建 LangChain LCEL 检索问答链...")
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
        
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}")
        ])

        # 5. 组装 LCEL Chain
        # a. 填充合并文档的链 (负责将检索到的 documents 塞进 prompt 的 context 变量里)
        self.question_answer_chain = create_stuff_documents_chain(self.llm, self.prompt_template)
        
        # b. 串联检索器与合并链
        # 将用户的 {input} 先交给 retriever 检索文档，然后带着文档一起传给 question_answer_chain
        self.rag_chain = create_retrieval_chain(self.retriever, self.question_answer_chain)
        print("✅ RAG 问答链初始化完成！")

    def ask(self, query: str) -> dict:
        """
        调用 RAG 问答链回答问题。
        返回包含检索到的文档内容和最终回答结果的字典。
        """
        print(f"\n💬 [User Query]: {query}")
        print("⏳ 正在检索上下文并生成回答...")
        
        # 使用 LCEL 链进行调用
        response = self.rag_chain.invoke({"input": query})
        
        # 提取相关信息进行打印
        answer = response.get("answer", "")
        retrieved_docs = response.get("context", [])
        
        print("\n" + "="*50)
        print("🔍 [检索到的文档 (Context Top-3)]")
        print("="*50)
        if not retrieved_docs:
            print("  (未检索到任何相关文档)")
        else:
            for idx, doc in enumerate(retrieved_docs, start=1):
                # 假设 Milvus schema 中包含了这些 metadata
                symbol = doc.metadata.get("symbol", "未知")
                pk_id = doc.metadata.get("pk", "未知")
                print(f"[{idx}] Symbol: {symbol} | ID: {pk_id}")
                # 打印前 150 个字符的截断内容
                content_preview = doc.page_content[:150].replace('\n', ' ')
                print(f"    内容: {content_preview}...")
            
        print("\n" + "="*50)
        print("🤖 [LLM RAG 回答]")
        print("="*50)
        print(answer)
        print("="*50 + "\n")
        
        return response

# --------- 3. 用于直接运行并测试的入口 ---------
if __name__ == "__main__":
    print("\n🚀 [CryptoRate Agent] - LangChain RAG 模块自检测试启动")
    
    try:
        # 实例化服务
        rag_service = CryptoRAGService()
        
        # 执行测试查询
        test_question = "目前比特币的最新市场趋势是什么？"
        rag_service.ask(test_question)
        
    except Exception as e:
        print(f"\n[!] 运行过程中出现异常: {e}")
        print("    -> 提示: 验证你的 .env 文件中的 DASHSCOPE_API_KEY 和 Zilliz 连接凭证。")
