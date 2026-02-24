# CryptoRate Frontend - 加密货币追踪前端系统

## 📖 项目简介

基于 **React 18 + Vite + Tailwind CSS** 的现代化加密货币价格追踪平台，提供实时价格查看、K线图表、AI智能分析等功能。

### ✨ 核心特性

- 🚀 **实时价格追踪** - 集成后端API，自动刷新价格数据
- 📊 **K线图表** - 专业的蜡烛图展示价格走势
- 🤖 **AI智能分析** - 一键获取市场分析和投资建议
- ⭐ **收藏管理** - 收藏关注的币种，快速切换查看
- 📈 **统计分析** - 最高/最低/平均价格，涨跌幅统计
- 💻 **全屏适配** - 桌面端三栏布局，充分利用屏幕空间

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2.0 | UI框架 |
| Vite | 5.0.8 | 构建工具 |
| Tailwind CSS | 3.4.0 | 样式框架 |
| Recharts | 2.10.3 | 图表库 |
| Lucide React | 0.295.0 | 图标库 |

---

## 🚀 快速启动

### 前置条件

- Node.js 16+
- 后端服务已启动 (CryptoRate on port 8080)

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问：`http://localhost:3001`

### 构建生产版本

```bash
npm run build
```

---

## 📂 项目结构

```
CryptoRate_front/
├── src/
│   ├── api/
│   │   └── index.js           # API请求封装
│   ├── utils/
│   │   └── dateUtils.js       # 日期工具函数
│   ├── App.jsx                # 主应用组件
│   ├── main.jsx               # 入口文件
│   └── index.css              # 全局样式
├── public/                     # 静态资源
├── index.html                  # HTML模板
├── package.json                # 项目配置
├── vite.config.js             # Vite配置
├── tailwind.config.js         # Tailwind配置
├── 启动指南.md                 # 详细启动指南
└── 前端API对接说明.md          # API对接文档
```

---

## 🔗 API集成说明

### 已对接的后端接口

#### 汇率数据接口
- `GET /api/v1/rates/symbols` - 获取支持的币种
- `GET /api/v1/rates/latest` - 获取最新实时汇率
- `GET /api/v1/rates/history` - 查询历史汇率

#### 统计分析接口
- `GET /api/v1/stats/summary/{symbol}` - 获取统计摘要

#### 智能分析接口
- `GET /api/v1/analysis/explain/{symbol}` - 生成AI行情解读

#### 管理后台接口
- `POST /api/v1/admin/sync` - 手动同步数据

### API配置

在 `src/api/index.js` 中配置后端地址：

```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  BASE_URL_V1: 'http://localhost:8080/api/v1',
};
```

---

## 🎨 功能特点

### 三栏布局设计

- **左侧栏**（280px）：币种列表，搜索功能
- **中间区域**（自适应）：K线图表，价格信息，时间范围选择
- **右侧栏**（380px）：收藏管理，市场统计，AI分析

### 数据更新策略

1. **实时刷新**：每30秒自动获取最新价格
2. **按需加载**：切换币种/时间范围时加载对应数据
3. **并行请求**：历史数据和统计数据同时请求

### 错误处理

- ✅ 网络错误显示友好提示
- ✅ API失败自动降级到模拟数据
- ✅ 加载状态清晰显示
- ✅ 空数据状态友好提示

---

## 📊 支持的币种

- **BTC** (Bitcoin) - 比特币
- **ETH** (Ethereum) - 以太坊
- **BNB** (Binance Coin) - 币安币

---

## 🔧 开发说明

### 添加新币种

在 `src/App.jsx` 的 `cryptoConfig` 中添加：

```javascript
const cryptoConfig = {
  // ... 现有币种
  SOL: {
    name: 'Solana',
    symbol: 'SOL',
    basePrice: 100,
    color: '#14F195',
    icon: '◎',
    volume24h: '3.5B'
  }
};
```

### 修改自动刷新间隔

在 `src/App.jsx` 中修改：

```javascript
// 从30秒改为60秒
const interval = setInterval(fetchLatestRates, 60000);
```

### 自定义API地址

修改 `src/api/index.js`：

```javascript
const API_CONFIG = {
  BASE_URL: 'https://your-api.com',
  BASE_URL_V1: 'https://your-api.com/api/v1',
};
```

---

## 📝 开发规范

### 代码风格
- 使用函数式组件和Hooks
- 遵循 ESLint 规范
- 组件拆分遵循单一职责原则

### 命名规范
- 组件：大驼峰（PascalCase）
- 函数/变量：小驼峰（camelCase）
- 常量：全大写（UPPER_CASE）

### Git提交规范
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 样式调整
- `refactor:` 代码重构

---

## 🎯 后续开发计划

### 即将实现
- [ ] 用户登录/注册功能
- [ ] 个人资产管理页面
- [ ] 更多币种支持
- [ ] 价格预警功能

### 长期规划
- [ ] WebSocket实时推送
- [ ] 移动端适配
- [ ] 深度图表分析
- [ ] 多语言支持

---

## 📄 相关文档

- 📘 [启动指南.md](./启动指南.md) - 详细的启动和使用说明
- 📗 [前端API对接说明.md](./前端API对接说明.md) - API对接详细文档
- 📙 后端API文档 - 查看 `CryptoRate/API接口文档与测试指南.md`

---

## 👨‍💻 开发团队

- **项目名称**: CryptoRate
- **版本**: 1.0.0
- **最后更新**: 2026-02-17

---

## 📞 技术支持

如遇问题，请查看：
1. 浏览器控制台错误信息
2. 后端服务日志
3. 相关文档说明

---

**祝你使用愉快！🎉**
