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

## 🎨 UI/UX 设计规范 (2026.03 重构)

项目已进行全面的视觉升级，遵循 **Hyper-Minimalism (超感官极简主义)** 规范：

- **背景系统**：采用 `bg-slate-50` 极浅灰白底色，配合 CSS 绘制的 `32px` 极其淡的坐标纸网格线 (`bg-graph-paper`)。
- **物理切角 (Chamfer)**：核心卡片使用 `clip-path` 物理切角样式，打破常规圆角的单调感，增加专业性。
- **卡片式列表**：行情列表由传统的 `<table>` 重构为独立悬浮的 **长条卡片 (Card-based Table Rows)**。
- **色彩管理**：绝对禁止霓虹、发光渲染。使用 `emerald-500` (涨) 和 `rose-500` (跌) 的明快色彩，配合 `Slate` 灰阶系列营造高级感。
- **微动效**：仅保留极其轻微的 `translate-y-[-1px]` 浮动和物理阴影加深效果。

---

**开发者**: relifel | **版本**: 1.1.0 | **最后更新**: 2026-03-11
