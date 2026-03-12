# 🚀 CryptoRate 系统启动指南 (STARTUP_GUIDE)

为了确保 **CryptoRate** 全栈系统正常运行，请按照以下顺序启动各模块。推荐使用三个独立的终端窗口分别操作。

---

## 1. Java 后端 (核心业务)
*负责用户管理、资产管理、JWT认证及实时行情推送。*

- **目录**: `CryptoRate_backend_java`
- **准备工作**: 确保 MySQL 已启动并配置正确。
- **启动命令**:
  ```bash
  cd CryptoRate_backend_java
  mvn spring-boot:run
  ```
- **验证**: 浏览器访问 `http://localhost:8080/health` (如有) 或查看日志。

---

## 2. Python AI 服务 (大脑 & 告警)
*负责 RAG 知识问答、行情深度分析及飞书 MCP 告警。*

- **目录**: `CryptoRate_ai_python`
- **启动命令**:
  ```bash
  cd CryptoRate_ai_python
  .\.venv\Scripts\Activate.ps1  # 激活虚拟环境
  python main.py
  ```
- **验证**: 端口 `8000` 启动，看到 "✅ RAG 服务初始化完成" 字样。

---

## 3. React 前端 (界面展示)
*负责用户交互、行情面板及 AI 分析对话。*

- **目录**: `CryptoRate_front`
- **启动命令**:
  ```bash
  cd CryptoRate_front
  npm run dev
  ```
- **验证**: 浏览器访问 `http://localhost:5173`。

---

## 🛠️ 辅助功能测试 (可选)
### 飞书智能告警测试
在 Python 服务启动后，运行以下脚本模拟一个行情异动，验证飞书机器人是否能收到 AI 分析卡片：
```bash
cd CryptoRate_ai_python
.\.venv\Scripts\python.exe test_alert.py
```

---

## 💡 常见问题 (Tips)
1. **环境变量**: 确保 `CryptoRate_ai_python/.env` 中已填入正确的 `DASHSCOPE_API_KEY` 和 `MILVUS` 相关配置。
2. **连接超时**: 如果后端无法访问，请检查防火墙或端口是否冲突。
3. **AI 白屏**: 若页面显示不全，请确保 Python 服务已正常启动且 8000 端口可用。
