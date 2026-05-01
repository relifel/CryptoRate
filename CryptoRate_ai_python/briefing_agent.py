import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# LangChain 相关
from langchain_community.chat_models import ChatTongyi
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

# =============================================
# 1. 每日简报提示词设计
# =============================================
BRIEFING_SYSTEM_PROMPT = """
你是一个顶级的 [CryptoRate 宏观金融分析师]。
你的任务是根据实时搜索到的市场信息，为用户生成一份客观、精要的“加密货币市场每日简报”。

# 任务要求：
1. **时效性**：侧重于过去 24 小时内的核心事件。
2. **结构化**：简报必须包含以下板块：
   - ⚡ **今日头条**：最重大的加密货币行业新闻或政策变动。
   - 📈 **行情概览**：主流币种 (BTC/ETH) 的大致走势及原因分析。
   - 💡 **热点题材**：当前市场讨论热度最高的赛道或项目。
   - 🏦 **宏观影响**：对加密市场产生影响的传统金融或宏观经济因素。
3. **输出规范**：
   - 使用 Markdown 格式。
   - 严禁 Meta-Talk（如“好的，我为您搜索到了...”）。
   - 严禁投资建议。
   - 语言简练、专业、且具备洞察力。
   - 总字数控制在 400 字以内。

# 搜索指令：
请主动搜索：加密货币今日头条新闻、美联储宏观动态对币市影响、主流公链动态、过去24小时跌涨幅最大的山寨币原因。
"""

class DailyBriefingAgent:
    def __init__(self):
        self.api_key = os.getenv("DASHSCOPE_API_KEY")
        
        # 实例化 Qwen-Max，开启搜索能力
        # 注意：DashScope 的 enable_search 是通过 extra_body 传递给底层的
        self.llm = ChatTongyi(
            model="qwen-max",
            dashscope_api_key=self.api_key,
            temperature=0.7,
            extra_body={
                "enable_search": True
            }
        )

    async def generate_briefing(self) -> str:
        """
        利用 Qwen-Max 自带的搜索功能生成每日简报
        """
        print("[*] DailyBriefingAgent 开始搜集全网资讯并生成简报...")
        
        messages = [
            SystemMessage(content=BRIEFING_SYSTEM_PROMPT),
            HumanMessage(content="请根据最新的市场搜索结果，生成今日（2026年4月20日）的加密货币市场每日简报。")
        ]
        
        try:
            # invoke 是同步的，如果需要异步可以使用 ainvoke
            response = await self.llm.ainvoke(messages)
            return response.content
        except Exception as e:
            print(f"[!] 生成每日简报失败: {e}")
            return f"暂时无法获取今日简报，请稍后再试。错误: {str(e)}"

if __name__ == "__main__":
    import asyncio
    agent = DailyBriefingAgent()
    async def test():
        content = await agent.generate_briefing()
        print("\n--- 简报展示 ---\n")
        print(content)
    asyncio.run(test())
