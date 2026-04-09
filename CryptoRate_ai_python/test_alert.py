import requests
import json
import time

def test_ai_alert(symbol, price, change, reason):
    url = "http://127.0.0.1:8000/ai/alert"
    
    payload = {
        "symbol": symbol,
        "price": price,
        "change": change,
        "reason": reason
    }
    
    headers = {"Content-Type": "application/json"}

    print(f"[*] [PUSHING] {symbol} fluctuation ({'+' if change > 0 else ''}{change}%)...")
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print(f"[OK] {symbol} Pushed! AI analysis generated and sent to Feishu.")
            print("-" * 30)
            print(f"AI Preview: {response.json().get('data')[:100]}...")
            print("-" * 30)
        else:
            print(f"[FAIL] {symbol} Failed, Status Code: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Exception: {str(e)}")

if __name__ == "__main__":
    print("=" * 50)
    print("CryptoRate Feishu Bot: Simulation (Long Text Version)")
    print("=" * 50)

    scenarios = [
        {
            "symbol": "BTC", "price": 68500.25, "change": 8.2,
            "reason": (
                "根据 Bloomberg 终端最新播报，美联储在最新的议息会议纪要中释放了明确的鸽派信号，"
                "暗示市场对下季度降息的预期已从 25BP 提升至 50BP。与此同时，全球最大的资产管理公司 BlackRock 披露，"
                "其现货比特币 ETF (IBIT) 的日流入量突破 12 亿美元，创下历史单日交易记录。这种由传统机构资金主导的"
                "正反馈循环，正在从根本上重塑比特币的供应深度，多头情绪目前在 68,000 美元关口表现出极强的韧性。"
            )
        },
        {
            "symbol": "ETH", "price": 3120.45, "change": -5.4,
            "reason": (
                "链上分析工具 TokenTerminal 监测到，多个处于长期休眠状态的「远古鲸鱼」地址在过去 2 小时内"
                "高频向交易所总计划转了 5.8 万枚以太坊，价值近 1.8 亿美元。这一异常动向在加密社区引发了剧烈的抛售担忧。"
                "此外，开发者社区传出坎昆升级测试网在负载压力测试中出现了短暂的共识延迟故障，尽管官方解释为参数微调，"
                "但在当前宏观环境脆弱的背景下，技术层面的不确定性直接导致了市场的非理性短期抛压。"
            )
        },
        {
            "symbol": "SOL", "price": 158.88, "change": 14.2,
            "reason": (
                "Solana 生态近期表现出惊人的反弹力，继其官方手机 Saga 第二代预订量突破 10 万台里程碑后，"
                "多个基于 Solana 链的头部 DePIN 项目（去中心化物理基础设施）宣布实现了里程碑式的跨链互操作性突破。"
                "Pantera Capital 最新发布的研报指出，Solana 的月度活跃地址数已连续 3 个月超过以太坊，"
                "这种应用层面的繁荣直接吸引了大量风投资金（VC）的二轮注资，技术与基本面的双利好共同推动了其价格大幅溢价。"
            )
        }
    ]

    for item in scenarios:
        test_ai_alert(item["symbol"], item["price"], item["change"], item["reason"])
        print("\n[Wait] 正在处理 AI 播报任务，请稍候 3 秒...\n")
        time.sleep(3)

    print("\n" + "=" * 50)
    print("🎉 所有模拟推送任务已执行完毕！请在飞书机器人中进行最后审阅。")
    print("=" * 50)
