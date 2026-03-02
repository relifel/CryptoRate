# CryptoRate 加密货币智能追踪系统 💰

> 一个基于 **Spring Boot + React + Python FastAPI** 的全栈加密货币行情追踪与 AI 智能问答系统，毕业设计作品。

---

## 📁 项目结构

```
CryptoRate/ (Monorepo)
├── CryptoRate_backend_java/    # Java 后端 (Spring Boot)
├── CryptoRate_front/           # React 前端
└── CryptoRate_ai_python/       # Python AI 服务 (FastAPI + LangChain + Milvus)
```

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────┐
│            React 前端 (Vite)             │
│         http://localhost:5173            │
└────────────┬──────────────┬─────────────┘
             │              │
     /api/* /user/*     /ai/ask
             │              │
             ▼              ▼
┌─────────────────┐  ┌──────────────────────┐
│  Spring Boot    │  │  FastAPI + LangChain  │
│  Java 后端      │  │  Python AI 服务       │
│  :8080          │  │  :8000               │
└────────┬────────┘  └──────────┬───────────┘
         │                      │
         ▼                      ▼
┌───────────────┐    ┌───────────────────────┐
│   MySQL 数据库 │    │  Zilliz Cloud (Milvus) │
│   用户 / 资产  │    │  向量知识库            │
└───────────────┘    └───────────────────────┘
                              │
                              ▼
                     ┌───────────────────┐
                     │  阿里云百炼 DashScope │
                     │  Embedding + Qwen LLM│
                     └───────────────────┘
```

---

## 🚀 各模块说明

### 1. Java 后端 (`CryptoRate_backend_java/`)
基于 Spring Boot 3 构建的核心业务后端。

**主要功能：**
- 🔐 JWT 认证（HttpOnly Cookie）
- 👤 用户注册 / 登录 / 管理
- 💰 加密资产管理（持仓查看、成本记录）
- 📈 加密货币实时行情（Coinlayer API）

**运行：**
```bash
cd CryptoRate_backend_java
mvn spring-boot:run
# 服务监听 http://localhost:8080
```

---

### 2. React 前端 (`CryptoRate_front/`)
基于 Vite + React 构建的现代化 SPA 前端。

**主要功能：**
- 📊 实时行情展示 Dashboard
- 💼 个人资产管理界面
- 💬 AI 智能问答聊天框

**运行：**
```bash
cd CryptoRate_front
npm install
npm run dev
# 服务监听 http://localhost:5173
```

---

### 3. Python AI 服务 (`CryptoRate_ai_python/`)
基于 FastAPI + LangChain 构建的 RAG 智能问答微服务。

**主要功能：**
- 🤖 RAG 检索增强问答（Retrieval-Augmented Generation）
- 🔎 向量相似度检索（Zilliz Cloud / Milvus）
- 🧠 千问大模型回答（DashScope / qwen3-max）
- 📡 `POST /ai/ask` 接口供前端调用

**运行：**
```bash
cd CryptoRate_ai_python
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
# 服务监听 http://localhost:8000
# 接口文档: http://localhost:8000/docs
```

详细说明见 [`CryptoRate_ai_python/README.md`](./CryptoRate_ai_python/README.md)。

---

## ⚙️ 环境变量配置

复制 `.env.example` 为 `.env` 并填入你的配置：

| 变量 | 说明 | 所属模块 |
|---|---|---|
| `MILVUS_URI` | Zilliz Cloud 集群地址 | Python AI |
| `MILVUS_TOKEN` | Zilliz Cloud API Key | Python AI |
| `DASHSCOPE_API_KEY` | 阿里云百炼 API Key | Python AI |

---

## 🛠️ 技术栈

| 层级 | 技术 |
|---|---|
| 前端 | React, Vite, Tailwind CSS |
| Java 后端 | Spring Boot 3, MyBatis, Spring Security, JWT |
| Python AI | FastAPI, LangChain, langchain-milvus, DashScope |
| 向量数据库 | Zilliz Cloud (Milvus) |
| 大模型 | 阿里云百炼 qwen3-max / text-embedding-v1 |
| 数据库 | MySQL 8.0 |

---

**开发者**: relifel | **版本**: 1.0.0 | **最后更新**: 2026-03
