import os
import asyncio
import json
from typing import Dict, Any
from dotenv import load_dotenv

# LangChain 相关
from langchain_community.chat_models import ChatTongyi
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain.tools import tool

# MCP 相关
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

load_dotenv()

# =============================================
# 1. 核心提示词设计 (红线约束)
# =============================================
AGENT_SYSTEM_PROMPT = """
你是一个极其专业、严谨且冷静的 [CryptoRate 加密货币市场智能智库]。
你的职责是实时分析市场异动，并生成一段客观、中立的数据简析。

# ⚠️ 绝对红线 (Red-Line Constraints)
1. **内容纯净性**：你只需要输出你生成的“AI 简析”正文。
2. **严禁 Meta-Talk**：严禁输出任何解释性文字（如“我将调用工具...”、“生成的播报如下：”）。
3. **严禁代码块**：严禁在输出中包含任何 Markdown 代码块（即使用 ``` 包裹的内容）或 JSON 源码。
4. **禁止建议**：严禁输出“抄底”、“逃顶”、“建议买入”等主观交易倾向词汇。
5. **免责性**：不要输出任何免责声明，系统卡片底部已预置。

# 输出任务
根据异动数据，生成一段 100 字以内的客观分析。直接输出内容，不要有任何前缀或后缀。
"""

class FeishuAlertAgent:
    def __init__(self):
        self.api_key = os.getenv("DASHSCOPE_API_KEY")
        self.webhook_url = os.getenv("FEISHU_WEBHOOK_URL")
        self.mcp_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../mcp_servers/feishu_mcp_server/bot.py"))
        
        # 使用低温度确保输出稳定性
        self.llm = ChatTongyi(
            model="qwen-max",
            dashscope_api_key=self.api_key,
            temperature=0.01 
        )

    def _sanitize_analysis(self, text: str) -> str:
        """
        数据清洗：暴力过滤所有 AI 产生的 meta-talk、工具名以及代码块
        """
        import re
        
        # 1. 移除 Markdown 代码块
        text = re.sub(r"```[\s\S]*?```", "", text)
        
        # 2. 移除常见的 AI 解释前缀和后缀
        patterns = [
            r"接下来.*调用.*工具",
            r"生成的.*如下",
            r"调用.*send_interactive_card.*",
            r"分析如下",
            r"根据数据",
            r"\[Indicator\].*"
        ]
        for p in patterns:
            text = re.sub(p, "", text, flags=re.IGNORECASE)
            
        # 3. 清理多余的空白行
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        return "\n".join(lines)

    async def run_alert_workflow(self, symbol: str, price: float, change: float):
        """
        Agentic Workflow: 思考 -> 清洗内容 -> 调用卡片接口
        """
        prompt = f"当前异动数据：币种={symbol}, 当前价格={price}, 5分钟变化率={change}%。直接开始你的分析。"
        
        server_params = StdioServerParameters(
            command="python",
            args=[self.mcp_path, "--webhook", self.webhook_url],
            env=os.environ.copy()
        )

        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                
                messages = [
                    SystemMessage(content=AGENT_SYSTEM_PROMPT),
                    HumanMessage(content=prompt)
                ]
                
                # 获取 LLM 原始输出
                response = self.llm.invoke(messages)
                raw_analysis = response.content.strip()

                # 执行自动化清洗，确保没有任何干扰信息
                clean_analysis = self._sanitize_analysis(raw_analysis)

                if not clean_analysis:
                    clean_analysis = "市场近期波动较大，请关注后续数据更新。"

                # 自动判别 UI 元素
                indicator = "🟢" if change > 0 else "🔴"
                template = "green" if change > 0 else "red"
                title = f"{indicator} CryptoRate 异动播报：{symbol}"
                
                # 组装最终卡片内容
                card_content = (
                    f"**异动详情**：{symbol} 当前价 ${price}，波动幅度 {change}%\n"
                    f"**AI 简析**：{clean_analysis}"
                )

                print(f"[*] Agent 正在发送纯净分析到飞书...")
                
                # 调用飞书 MCP 工具
                result = await session.call_tool(
                    "send_interactive_card", 
                    arguments={
                        "title": title,
                        "content": card_content,
                        "template": template
                    }
                )
                
                print(f"[*] MCP 工具响应: {result.content[0].text if result.content else 'None'}")
                return clean_analysis

# 单测入口
if __name__ == "__main__":
    agent = FeishuAlertAgent()
    asyncio.run(agent.run_alert_workflow("SOL", 145.2, -5.4))
