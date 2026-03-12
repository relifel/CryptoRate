import requests
import json

def test_ai_alert():
    url = "http://127.0.0.1:8000/ai/alert"
    
    # 模拟一个异动数据：SOL 暴涨了 12%
    payload = {
        "symbol": "SOL",
        "price": 145.8,
        "change": 12.5
    }
    
    headers = {
        "Content-Type": "application/json"
    }

    print(f"[*] 正在模拟向 AI 发送异动数据: {payload['symbol']} +{payload['change']}%...")
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print("✅ 测试指令下达成功！")
            print("AI 响应内容:")
            print("-" * 30)
            print(response.json().get("data"))
            print("-" * 30)
            print("\n🚀 请检查你的飞书群，应该已经收到 AI 生成的播报卡片了！")
        else:
            print(f"❌ 测试失败，状态码: {response.status_code}")
            print(f"错误信息: {response.text}")
            print("\n💡 提示：请确保 Python 后端 (main.py) 已启动。")
            
    except Exception as e:
        print(f"❌ 发生异常: {str(e)}")
        print("\n💡 提示：请确认 Python 后端服务运行在 http://127.0.0.1:8000")

if __name__ == "__main__":
    test_ai_alert()
