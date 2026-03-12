# 🛠️ MCP 协议：从“概念”到“代码实现”的深度拆解

你问得很专业！**MCP（Model Context Protocol）** 确实只是一个协议（一套标准），就像“插座接口的标准”。但要让电器动起来，我们需要**插头**、**电线**和**插座**。

在我们的代码里，MCP 是通过 **“跨进程通信 (IPC)”** 跑起来的。

---

## 1. 物理上的实现：两个独立的“盒子”

在你的电脑里，其实同时跑着两个不同的程序：

*   **程序 A (MCP Client)**：这就是我们的 `alert_agent.py`（AI 大脑）。
*   **程序 B (MCP Server)**：这就是 `mcp_servers/feishu_mcp_server/bot.py`（飞书操作员）。

**协议是如何显灵的？**
这两个程序之间连着一根“无形的线”，我们称之为 **stdio（标准输入输出流）**。

---

## 2. 核心代码是怎么写的？

### A. 服务端 (Server)：定义“插座”
在 `bot.py` 中，我们并没有写很复杂的逻辑，关键是这几行：
```python
# 1. 初始化一个 MCP 服务端实例
mcp = FastMCP("feishu-bot")

# 2. 标注一个“工具” (Tool)
@mcp.tool()
async def send_message(state: str):
    # 这里写发送飞书的真实 HTTP 代码
    ...

# 3. 运行服务，通过标准输入输出对话
mcp.run(transport='stdio')
```
**它的作用**：它大声告诉全世界：“我有一个叫 `send_message` 的技能，谁想用我就通过命令行跟我说话！”

---

### B. 客户端 (Client)：连上“插座”
在 `alert_agent.py` 中，我们通过代码主动去连这个服务：
```python
# 1. 告诉系统：我要连哪个程序？用什么参数连？
server_params = StdioServerParameters(
    command="python",
    args=["./bot.py", "--webhook", "..."]
)

# 2. 启动连接管道 (stdio_client)
async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # 3. 双方握手，交换“技能列表”
        await session.initialize()
        
        # 4. 远程驱动工具
        await session.call_tool("send_message", {"state": "分析好的行情文案"})
```

---

## 3. 大模型 (LLM) 是怎么参与其中的？

这是最关键的一环：**为什么 AI 知道去调用它？**

1.  **技能自白**：当 `session.initialize()` 握手成功后，`bot.py` 会把 `send_message` 这个工具的名字和它的用途（发送飞书消息）传给 AI。
2.  **AI 理解**：AI 在思考时，会看到它的“技能包”里多了一个飞书工具。
3.  **决策调用**：AI 觉得自己写完行情分析了，于是发给 Python 一个指令：“我想用一下 `send_message` 这个工具，内容是 XXX”。
4.  **传输执行**：Python 收到 AI 的意图，通过 MCP 协议转化成 JSON 格式，扔给 `bot.py`，最后飞书消息就发出去了。

---

## 4. 总结：代码里的“三步走”

1.  **运行**：Python 代码在后台通过子进程（Subprocess）启动了 `bot.py`。
2.  **对话**：它们不再通过复杂的 API 调来调去，而是像在聊天室里打字一样，通过 `stdin/stdout` 互通消息。
3.  **标准化**：这些聊天的内容全部符合 MCP 协议规定的 JSON 格式（比如：`{"method": "tools/call", ...}`）。

**所以，MCP 在代码里不是一个看不见的空气，它是你代码里活生生的“管道”！**

---
**CryptoRate 开发组** 🚀
*技术架构深度解析*
