# 📖 CryptoRate 飞书 MCP 智能集成指南
> **技术栈**：Model Context Protocol (MCP) | Spring Boot | Python Agent | Feishu SDK

本指南详细说明了 CryptoRate 项目如何通过 MCP 协议（@Chenzhi-Ana/feishu_mcp_server）将 AI Agent 的智能分析能力与飞书办公自动化深度集成，打造“分析-播报”一体化的行情预警系统。

---

## 1. 核心架构说明 (Architecture Overview)

### 1.1 什么是 MCP？
**Model Context Protocol (MCP)** 是由 Anthropic 提出的开放协议，旨在解决大模型与外部工具/数据源之间的连接标准化问题。在本项目中，MCP 扮演了 **“AI 的手”** 的角色，使大模型能够打破沙盒限制，自主发现并调用飞书的推送接口。

### 1.2 智能化播报数据链路
系统采用了 **“被动监听 - 主动代理”** 的 Agentic Workflow 架构：

1.  **事件触发 (Java Side)**：Spring Boot 后台监控发现行情异动（如价格突破阈值）。
2.  **唤醒 Agent (API Bridge)**：后台将原始数据（币种、实时价、涨跌幅）通过 HTTP 请求投递给 Python AI 微服务。
3.  **大模型思考 (Thinking Agent)**：AI 微服务加载带有 **MCP Client** 的 Agent，利用 LLM（如 Qwen-Max）对异动进行客观背后的原因推导。
4.  **工具发现与调用 (MCP Protocol)**：Agent 通过 **stdio 管道方式** 自动向 `feishu_mcp_server` 发现 `send_message` 工具。
5.  **最终播报 (Lark/Feishu)**：Agent 将生成的专业报告通过 MCP 工具实时推送到飞书群组。

---

## 2. 前置准备与 API Keys (Prerequisites)

在运行本系统前，请确保以下环境与凭证已准备就绪：

### 2.1 环境要求
*   **Java**: JDK 17+ (Spring Boot 3.x)
*   **Python**: 3.10+ (建议使用 `uv` 管理虚拟环境)
*   **Git**: 用于克隆 MCP Server 代码

### 2.2 核心凭证配置
| 凭证名称 | 获取渠道 | 配置位置 |
| :--- | :--- | :--- |
| **DashScope API Key** | [阿里云百炼平台](https://bailian.console.aliyun.com/) | `CryptoRate_ai_python/.env` |
| **Feishu Webhook URL** | 飞书群机器人设置 | `CryptoRate_ai_python/.env` |

> 💡 **飞书权限说明**：请在飞书机器人后台确保已勾选“发送群消息”权限，并开启 Webhook 调试。如果开启了签名校验，请在配置连接字符串时包含 Secret。

---

## 3. 安装与启动指南 (Installation)

本项目集成了 `@Chenzhi-Ana/feishu_mcp_server`，支持以下两种部署方式：

### 方式 A：独立运行 (快速调试)
推荐在开发阶段使用，直接利用 `uv` 环境启动标准输入输出流。

1.  **克隆工具库**：
    ```bash
    git clone https://github.com/Chenzhi-Ana/feishu_mcp_server.git
    ```
2.  **手动启动并测试**：
    ```bash
    cd feishu_mcp_server
    uv run bot.py --webhook "https://open.feishu.cn/open-apis/bot/v2/hook/xxxx"
    ```

### 方式 B：Smithery 全球集成 (自动化流程)
如果您使用的是 Claude/Desktop 等支持 Smithery 协议的客户端，可以一键安装：

```bash
npx -y @smithery/cli install @Chenzhi-Ana/feishu_mcp_server --client claude
```

---

## 4. 项目集成代码示例 (Project Integration)

在 AI 微服务层，我们通过以下核心逻辑将环境变量与 MCP Server 挂接，使 LLM 客户端获得调用能力：

```python
from mcp import StdioServerParameters, ClientSession
from mcp.client.stdio import stdio_client

# 1. 定义 MCP Server 连接参数
server_params = StdioServerParameters(
    command="python",
    args=["./mcp_servers/feishu_mcp_server/bot.py", "--webhook", os.getenv("FEISHU_WEBHOOK_URL")],
    env=os.environ.copy()
)

# 2. 在 Agent 执行上下文中使用
async def dispatch_alert_task(analysis_content):
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            # Agent 自主感知并调用 feishu-bot 中的 send_message 工具
            await session.call_tool("send_message", arguments={"state": analysis_content})
```

---

## 5. 合规与业务红线 (Compliance & Guardrails)

### 5.1 客观性红线
作为一款金融实验室级别的行情监控工具，CryptoRate 严禁 Agent 提供任何带有交易引导性质的内容。

*   **Prompt 约束**：在 `System Prompt` 中明确禁止 Agent 使用以下词汇：`抄底`、`止损`、`加仓`、`逃顶`、`买入信号`。
*   **文案强制要求**：AI 生成的所有分析报告后，必须强制追加以下免责声明：
    > ⚠️ **声明**：本项目仅做客观数据监测与分析，所有内容均不构成任何具体的投资建议或购买意见。加密资产波动巨大，请用户注意市场风险。

### 5.2 数据合规性
飞书推送的消息应仅包含：行情实时数据、已有的公开市场消息解析、技术指标解读。不涉及任何未公开信息或私人投资预测。

---
**CryptoRate 开发组** 
*2026-03-12*
