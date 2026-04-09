import asyncio
import os
from alert_agent import FeishuAlertAgent
from dotenv import load_dotenv

async def debug():
    load_dotenv()
    print(f"DASHSCOPE_API_KEY: {os.getenv('DASHSCOPE_API_KEY')[:10]}...")
    print(f"FEISHU_WEBHOOK_URL: {os.getenv('FEISHU_WEBHOOK_URL')[:30]}...")
    
    agent = FeishuAlertAgent()
    try:
        print("[*] Starting debug alert workflow...")
        result = await agent.run_alert_workflow("BTC", 68000, 5.5, "Test reason: market is pumping.")
        print(f"[OK] Result: {result}")
    except Exception as e:
        print(f"[ERROR] Caught exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug())
