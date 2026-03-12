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
- 🚨 **飞书机器人告警播报**：支持手动模板告警及 AI 智能深度分析播报（MCP 驱动）

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

### 4. MCP 辅助说明文档 📚
为了方便理解和配置飞书 AI 告警功能，请参考以下文档：
- [飞书 MCP 集成全流程指南](./Feishu_MCP_Integration_Guide.md)
- [获取飞书 Webhook 详尽教程](./How_to_get_Feishu_Webhook.md)
- [MCP 实现原理深度拆解](./MCP_Implementation_DeepDive.md)
- [给小白的 MCP 通俗原理解析](./MCP_Explainer_Simplified.md)

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

**开发者**: relifel | **版本**: 1.1.2 | **最后更新**: 2026-03-11

---

## 📝 任务反思与项目改进 (2026.03)

### 本阶段完成任务
1. **风格巨变**：成功将 UI 从早期的“科幻赛博”风格平滑迁移至“Hyper-Minimalism”极简金融实验室风格，视觉质感提升显著。
2. **交互升级**：实现了行情列表的独立卡片流布局及丝滑的 Accordion 展开动效，解决了传统表格数据展示单调且局促的问题。
3. **链路连通**：完成了前端登录系统与 Spring Boot 后端的深度联通，支持 JWT 持久化会话以及个人资料同步。
4. **AI 播报集成**：成功接入了基于 MCP 协议的飞书智能播报 Agent，实现了从行情异动到 AI 自动深度分析并推送精美卡片的全流程。
5. **体验优化**：解决了 AI 回复中夹带代码/JSON 的问题，通过 Interactive Card 提升了告警消息的视觉品质。

### 项目潜在问题与改进方向
- **[改进] 实时图表接入**：当前展开面板中的 K 线图为占位组件，后续计划接入 `Lightweight Charts` 或 `ECharts` 实现真实数据渲染。
- **[优化] 响应式深度调节**：目前的超宽屏适配较佳，但在小屏移动端，大型概览卡片（LargeStatCard）的排版仍有优化空间，建议引入更多容器查询（Container Queries）。
- **[扩展] 状态管理选型**：随着业务逻辑（收藏、资产、AI 对话）的复杂化，考虑将 `useOutletContext` 迁移至 `Zustand` 或 `TanStack Query` 以获得更好的数据缓存与同步体验。
- **[性能] 虚拟列表渲染**：如果行情数据量达到 1000+ 条，建议在列表中引入 `react-window` 虚拟化技术，以保证流畅的滚动响应。
