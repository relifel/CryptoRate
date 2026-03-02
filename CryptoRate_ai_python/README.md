# CryptoRate AI 服务 🤖

> 基于 **FastAPI + LangChain + Milvus + 阿里云百炼** 的加密货币 RAG 智能问答微服务。

---

## 📂 目录结构

```
CryptoRate_ai_python/
├── main.py              # FastAPI 服务入口 + /ai/ask 接口
├── rag_service.py       # RAG 检索问答逻辑（独立运行测试用）
├── insert_test_data.py  # 向 Milvus 插入测试知识库数据
├── requirements.txt     # Python 依赖列表
├── .env.example         # 环境变量模板（复制为 .env 并填入真实值）
└── .gitignore           # 排除 .env、.venv 等敏感文件
```

---

## ⚡ 快速开始

### 1. 配置环境变量
```bash
# 复制模板
cp .env.example .env
```
打开 `.env`，填入你的配置：
```env
MILVUS_URI="https://你的集群.cloud.zilliz.com"
MILVUS_TOKEN="你的_Zilliz_API_Key"
DASHSCOPE_API_KEY="你的_DashScope_API_Key"
```

### 2. 创建虚拟环境并安装依赖
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1     # Windows PowerShell
pip install -r requirements.txt
```

### 3. 向量数据库写入测试数据（首次运行）
```bash
.\.venv\Scripts\python.exe insert_test_data.py
```

### 4. 启动 FastAPI 服务
```bash
.\.venv\Scripts\python.exe main.py
# 服务运行在 http://localhost:8000
```

---

## 📡 接口文档

启动服务后访问：**[http://localhost:8000/docs](http://localhost:8000/docs)**

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/health` | 健康检查 |
| `POST` | `/ai/ask` | RAG 智能问答 |

### POST `/ai/ask` 示例

**请求：**
```json
{ "question": "目前比特币的最新市场趋势是什么？" }
```

**响应：**
```json
{
  "answer": "根据最新数据，比特币近期...",
  "code": 200
}
```

---

## 🏗️ 技术架构

```
用户问题
    │
    ▼
FastAPI /ai/ask
    │
    ▼
DashScopeEmbeddings        ← 将问题转化为向量
    │
    ▼
Milvus (Zilliz Cloud)      ← 向量相似度检索 Top-3 上下文
    │
    ▼
ChatTongyi (qwen3-max)     ← 结合上下文生成分析回答
    │
    ▼
返回 AskResponse (JSON)
```

---

## 🛠️ 依赖说明

| 包 | 作用 |
|---|---|
| `fastapi` / `uvicorn` | Web 框架和 ASGI 服务器 |
| `langchain-classic` | LCEL 检索链（create_retrieval_chain） |
| `langchain-milvus` | 官方 Milvus 向量存储集成 |
| `langchain-community` | DashScopeEmbeddings / ChatTongyi |
| `python-dotenv` | 本地环境变量加载 |
| `pymilvus` | Milvus 底层 SDK |
