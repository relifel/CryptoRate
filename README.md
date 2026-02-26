# CryptoRate - 加密货币追踪系统 💰

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![JDK](https://img.shields.io/badge/JDK-17-orange.svg)](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)

## 📖 项目简介

CryptoRate 是一个基于 **Spring Boot 3 + React** 的加密货币实时追踪系统，通过 Coinlayer API 获取加密货币实时汇率，提供用户管理、JWT 认证、数据统计和 AI 分析等功能。

### ✨ 核心特性

- 🚀 **实时汇率追踪** — Coinlayer API 集成 + 定时采集 + 历史数据存储
- 🔐 **JWT 认证系统** — BCrypt 密码加密 + Token 鉴权 + 拦截器保护
- 📊 **数据统计分析** — 最高/最低/平均价、涨跌幅、K 线图
- 🤖 **AI 智能分析** — 自动生成行情分析报告
- 💾 **MyBatis 持久层** — XML 映射模式，灵活可控
- 🛡️ **全局异常处理** — 统一响应格式 `R<T>` + 参数校验

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | Spring Boot 3.2.2 (JDK 17) |
| 数据库 | MySQL 8.0 + MyBatis |
| 认证 | JWT (jjwt 0.12) + BCrypt |
| HTTP 客户端 | OkHttp 4.12.0 |
| 前端框架 | React 18 + Vite |
| UI 组件 | Recharts（图表） + Lucide（图标） |
| 构建工具 | Maven 3.6+ / npm |

---

## 📂 项目结构

```
CryptoRate/
├── pom.xml
├── README.md
├── TODO.md                                    # 剩余任务清单
├── src/main/java/com/cryptorate/
│   ├── CryptoRateApplication.java             # 启动类
│   ├── common/
│   │   ├── R.java                             # 统一响应格式
│   │   └── exception/
│   │       ├── ApiException.java              # 业务异常
│   │       ├── GlobalExceptionHandler.java    # 全局异常处理
│   │       └── UnauthorizedException.java     # 401 异常
│   ├── config/
│   │   ├── OkHttpConfig.java                  # OkHttp 客户端配置
│   │   ├── CoinlayerConfig.java               # Coinlayer API 配置
│   │   ├── CorsConfig.java                    # CORS 跨域过滤器
│   │   └── WebMvcConfig.java                  # MVC + JWT 拦截器注册
│   ├── interceptor/
│   │   └── JwtInterceptor.java                # JWT 认证拦截器
│   ├── utils/
│   │   └── JwtUtils.java                      # JWT 工具类
│   ├── controller/
│   │   ├── UserController.java                # 用户（登录/注册/CRUD）
│   │   ├── RateController.java                # 汇率数据
│   │   ├── StatsController.java               # 统计分析
│   │   ├── AnalysisController.java            # AI 分析
│   │   ├── AssetController.java               # 用户资产（收藏）
│   │   ├── AdminController.java               # 管理后台
│   │   └── MarketController.java              # 市场数据（兼容旧版）
│   ├── service/                               # 业务逻辑层
│   ├── mapper/                                # MyBatis Mapper 接口
│   ├── entity/                                # 实体类
│   ├── dto/                                   # 数据传输对象
│   └── scheduler/
│       └── RateScheduler.java                 # 定时采集任务
├── src/main/resources/
│   ├── application.yml                        # 应用配置
│   ├── mapper/                                # MyBatis XML 映射文件
│   └── sql/init.sql                           # 数据库初始化脚本
└── frontend/                                  # React 前端
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                            # 主页面
        ├── main.jsx                           # 入口
        ├── api/index.js                       # API 封装 + JWT 拦截器
        ├── pages/Login.jsx                    # 登录/注册页
        └── utils/dateUtils.js                 # 日期工具
```

---

## 🚀 快速开始

### 环境要求

| 工具 | 版本 |
|------|------|
| JDK | 17+ |
| Maven | 3.6+ |
| MySQL | 8.0+ |
| Node.js | 18+ |

### 1. 初始化数据库

```sql
CREATE DATABASE IF NOT EXISTS cryptorate
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

也可直接执行 `src/main/resources/sql/init.sql`。

### 2. 修改配置

编辑 `src/main/resources/application.yml`，修改数据库密码和 API Key：

```yaml
spring:
  datasource:
    password: 你的MySQL密码

coinlayer:
  access-key: 你的Coinlayer_API_Key
```

### 3. 启动后端

```bash
# 在 CryptoRate 根目录
mvn spring-boot:run
```

> ⚠️ 如果系统 Java 不是 JDK 17，需先设置：
> ```powershell
> $env:JAVA_HOME = "D:\develop\java\jdk-17"
> ```

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:3000`，后端在 `http://localhost:8080`。

---

## 🎯 API 接口总览

### 公开接口（无需 Token）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/user/register` | 用户注册 |
| POST | `/user/login` | 用户登录（返回 JWT Token） |
| GET | `/api/v1/rates/symbols` | 获取支持的币种列表 |
| GET | `/api/v1/rates/latest` | 获取最新汇率 |
| GET | `/api/v1/rates/history` | 获取历史汇率 |
| GET | `/api/v1/rates/search` | 搜索币种 |
| GET | `/api/v1/stats/summary/{symbol}` | 获取统计摘要 |
| GET | `/api/v1/analysis/explain/{symbol}` | 获取 AI 分析报告 |
| GET | `/market/rates` | 获取所有汇率（兼容旧版） |
| GET | `/market/rate/{symbol}` | 获取单个汇率（兼容旧版） |

### 需认证接口（请求头携带 `Authorization: Bearer <token>`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/assets` | 获取用户资产/收藏 |
| POST | `/api/v1/assets` | 添加资产/收藏 |
| DELETE | `/api/v1/assets/{id}` | 删除资产/收藏 |
| GET | `/api/v1/admin/**` | 管理后台接口 |

---

## 🔐 认证说明

### 登录获取 Token

```bash
curl -X POST http://localhost:8080/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'
```

响应的 `data` 字段即为 JWT Token 字符串。

### 携带 Token 访问受保护接口

```bash
curl http://localhost:8080/api/v1/assets \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

### 安全设计

- 密码使用 **BCrypt** 哈希存储（数据库中不存明文）
- JWT 使用 **HMAC-SHA256** 签名，24 小时过期
- 拦截器自动校验 Token + CORS 预检请求（OPTIONS）放行

> ⚠️ 已有旧账号（明文密码）需要**重新注册**才能登录。

---

## ⏰ 定时采集配置

在 `application.yml` 中可配置采集频率：

```yaml
scheduler:
  enabled: true                    # 是否启用定时任务
  initial-delay-ms: 30000          # 启动后等待时间
  rate-sync-interval-ms: 86400000  # 采集间隔（当前 24 小时）
```

| 频率 | 毫秒值 | 每月消耗 | 免费额度（100次/月） |
|------|--------|---------|---------------------|
| 每 24 小时 | `86400000` | ≈30 次 | ✅ 推荐 |
| 每 12 小时 | `43200000` | ≈60 次 | ✅ 安全 |
| 每 6 小时 | `21600000` | ≈120 次 | ❌ 超限 |

---

## 🐛 常见问题

| 问题 | 解决方案 |
|------|---------|
| 端口 8080 被占用 | 修改 `application.yml` 中 `server.port` 或关闭占用进程 |
| 数据库连接失败 | 检查 MySQL 服务是否启动，确认密码正确 |
| Coinlayer API 429 | API 免费额度用尽，降低采集频率或等待下月重置 |
| CORS 跨域错误 | 确认后端已启动，检查 `CorsConfig.java` 配置 |
| 旧账号无法登录 | 密码已改为 BCrypt 加密，需重新注册 |

---

## 🔧 后续优化方向

- [ ] Redis 缓存热门汇率数据
- [ ] Swagger/SpringDoc API 文档
- [ ] Docker 容器化部署
- [ ] 单元测试（JUnit 5 + Mockito）
- [ ] 移动端响应式适配

详见 [TODO.md](TODO.md) 完整任务清单。

---

## 📄 许可证

本项目采用 MIT 许可证。

**开发者**: CryptoRate Team | **版本**: 1.0-SNAPSHOT | **最后更新**: 2026-02-27
