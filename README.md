# CryptoRate - 加密货币追踪系统 💰

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![JDK](https://img.shields.io/badge/JDK-17-orange.svg)](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
[![OkHttp](https://img.shields.io/badge/OkHttp-4.12.0-blue.svg)](https://square.github.io/okhttp/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)

## 📖 项目简介

CryptoRate 是一个基于 **Spring Boot 3** 的加密货币实时追踪系统，通过 **OkHttp 4** 集成 **Coinlayer API** 获取加密货币的实时汇率数据，并提供完整的用户管理功能。

### ✨ 核心特性

- 🚀 **实时汇率追踪** - 集成 Coinlayer API，实时获取 BTC、ETH 等主流加密货币价格
- 🔐 **用户管理系统** - 完整的用户 CRUD 操作（注册、查询、更新、删除）
- 🌐 **OkHttp 4 集成** - 使用现代化的 HTTP 客户端，性能优越
- 💾 **MyBatis 持久化** - 使用 XML 映射模式，灵活可控
- 📊 **统一响应格式** - 标准化的 RESTful API 响应结构
- 🛡️ **全局异常处理** - 完善的异常捕获和错误提示

---

## 🛠️ 技术栈

### 核心框架
- **Spring Boot**: 3.2.2 (基于 JDK 17)
- **构建工具**: Maven 3.6+
- **数据库**: MySQL 8.0
- **ORM 框架**: MyBatis 3.0.3 (Mapper XML 模式)

### 关键依赖
- **HTTP 客户端**: OkHttp 4.12.0 (用于所有外部 API 调用)
- **JSON 处理**: Jackson (解析 API 响应)
- **工具库**: Lombok (简化实体类代码)
- **连接池**: HikariCP (Spring Boot 3 默认)

---

## 📂 项目结构

```
CryptoRate/
├── pom.xml                                 # Maven 配置文件
├── README.md                               # 项目说明文档（本文件）
├── src/
│   ├── main/
│   │   ├── java/com/cryptorate/
│   │   │   ├── CryptoRateApplication.java # Spring Boot 启动类
│   │   │   ├── common/                    # 公共模块
│   │   │   │   ├── R.java                 # 统一响应格式
│   │   │   │   └── exception/             # 异常处理
│   │   │   │       ├── ApiException.java
│   │   │   │       └── GlobalExceptionHandler.java
│   │   │   ├── config/                    # 配置类
│   │   │   │   ├── OkHttpConfig.java      # OkHttp 配置（核心）
│   │   │   │   └── CoinlayerConfig.java   # Coinlayer API 配置
│   │   │   ├── controller/                # 控制器层
│   │   │   │   ├── MarketController.java  # 市场数据接口
│   │   │   │   └── UserController.java    # 用户管理接口
│   │   │   ├── service/                   # 业务逻辑层
│   │   │   │   ├── CryptoMarketService.java # 加密货币服务（OkHttp 实现）
│   │   │   │   └── UserService.java       # 用户服务
│   │   │   ├── mapper/                    # MyBatis Mapper 接口
│   │   │   │   └── UserMapper.java
│   │   │   ├── entity/                    # 实体类
│   │   │   │   └── User.java
│   │   │   └── dto/                       # 数据传输对象
│   │   │       └── CoinlayerResponse.java
│   │   └── resources/
│   │       ├── application.yml            # 应用配置
│   │       ├── mapper/                    # MyBatis XML 映射文件
│   │       │   └── UserMapper.xml
│   │       └── sql/
│   │           └── init.sql               # 数据库初始化脚本
│   └── test/                               # 测试代码
└── target/                                 # 编译输出目录
```

---

## 🚀 快速开始

### 环境准备

在开始之前，请确保你的开发环境已安装以下工具：

| 工具 | 版本要求 | 下载地址 |
|------|---------|---------|
| JDK | 17 或更高 | [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) |
| Maven | 3.6 或更高 | [Maven 官网](https://maven.apache.org/download.cgi) |
| MySQL | 8.0 或更高 | [MySQL 官网](https://dev.mysql.com/downloads/mysql/) |
| Postman | 最新版 | [Postman 官网](https://www.postman.com/downloads/) |

**验证安装**：

```bash
java -version   # 应显示 17 或更高版本
mvn -version    # 应显示 3.6 或更高版本
mysql --version # 应显示 8.0 或更高版本
```

---

### 第一步：克隆项目

```bash
git clone https://github.com/your-repo/CryptoRate.git
cd CryptoRate
```

---

### 第二步：初始化数据库

#### 2.1 登录 MySQL

```bash
mysql -u root -p
# 输入密码: userpassword
```

#### 2.2 执行初始化脚本

在 MySQL 命令行中执行：

```sql
SOURCE src/main/resources/sql/init.sql;
```

或者手动执行以下 SQL：

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS cryptorate 
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE cryptorate;

-- 创建用户表
CREATE TABLE `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 插入测试数据
INSERT INTO `user` (`username`, `password`, `email`, `created_at`) VALUES
('admin', 'xxxxxx', 'admin@cryptorate.com', NOW()),
('test', 'xxxxxx', 'test@cryptorate.com', NOW());
```

#### 2.3 验证数据

```sql
SELECT * FROM user;
```

应该看到 2 条测试用户数据。

---

### 第三步：配置项目

项目配置文件：`src/main/resources/application.yml`

**当前配置（已配置完成）**：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/cryptorate?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: yourusername
    password: yourpassword  # 你的 MySQL 密码

coinlayer:
  access-key: yourAPI Key  # 你的 Coinlayer API Key
  base-url: http://api.coinlayer.com
```

> ℹ️ **提示**：如果你的 MySQL 密码不同，请修改 `password` 字段。

---

### 第四步：启动项目

在项目根目录执行以下命令：

```bash
# 清理并编译项目
mvn clean package

# 启动项目
mvn spring-boot:run
```

或者直接运行打包后的 JAR 文件：

```bash
java -jar target/CryptoRate-1.0-SNAPSHOT.jar
```

**启动成功标志**：

```
=================================================
     CryptoRate 加密货币追踪系统启动成功！
     访问地址: http://localhost:8080
=================================================
```

---

## 🧪 使用 Postman 测试接口

### 安装 Postman

1. 访问 [Postman 官网](https://www.postman.com/downloads/)
2. 下载并安装适合你操作系统的版本
3. 启动 Postman

---

### 创建 Postman 工作区

#### 步骤 1：创建新的 Collection

1. 打开 Postman
2. 点击左侧的 **"Collections"**
3. 点击 **"+"** 按钮或 **"Create a collection"**
4. 命名为：`CryptoRate API`
5. 点击 **"Create"**

#### 步骤 2：配置基础 URL（可选）

1. 在 Collection 上右键点击 **"Edit"**
2. 切换到 **"Variables"** 标签页
3. 添加变量：
   - Variable: `base_url`
   - Initial Value: `http://localhost:8080`
   - Current Value: `http://localhost:8080`
4. 点击 **"Save"**

---

### 📍 接口测试详细步骤

## 一、市场数据接口测试

### 1.1 获取所有加密货币的实时汇率

#### 步骤 1：创建请求

1. 在 `CryptoRate API` Collection 中点击 **"Add request"**
2. 命名为：`获取所有汇率`

#### 步骤 2：配置请求

- **请求方法**：`GET`
- **请求 URL**：`http://localhost:8080/market/rates`
- **Headers**：无需添加

#### 步骤 3：发送请求

点击 **"Send"** 按钮

#### 步骤 4：查看响应

**成功响应示例**（状态码 200）：

```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "BTC": 42350.50,
        "ETH": 2250.75,
        "USDT": 1.00,
        "BNB": 320.25,
        "SOL": 105.80
    },
    "timestamp": 1707907200000
}
```

**响应字段说明**：
- `code`: 状态码（200 表示成功）
- `msg`: 提示信息
- `data`: 加密货币汇率数据（键：货币代码，值：美元汇率）
- `timestamp`: 响应时间戳

---

### 1.2 获取指定加密货币的实时汇率

#### 步骤 1：创建请求

1. 在 Collection 中点击 **"Add request"**
2. 命名为：`获取单个货币汇率`

#### 步骤 2：配置请求

- **请求方法**：`GET`
- **请求 URL**：`http://localhost:8080/market/rate/BTC`
  - 可以替换 `BTC` 为其他货币代码（如 `ETH`、`USDT`）

#### 步骤 3：发送请求

点击 **"Send"** 按钮

#### 步骤 4：查看响应

**成功响应示例**：

```json
{
    "code": 200,
    "msg": "success",
    "data": 42350.50,
    "timestamp": 1707907200000
}
```

**测试其他货币**：
- ETH: `http://localhost:8080/market/rate/ETH`
- USDT: `http://localhost:8080/market/rate/USDT`

---

## 二、用户管理接口测试

### 2.1 用户注册

#### 步骤 1：创建请求

1. 在 Collection 中点击 **"Add request"**
2. 命名为：`用户注册`

#### 步骤 2：配置请求

- **请求方法**：`POST`
- **请求 URL**：`http://localhost:8080/user/register`

#### 步骤 3：设置请求头

切换到 **"Headers"** 标签页，添加：

| Key | Value |
|-----|-------|
| Content-Type | application/json |

#### 步骤 4：设置请求体

1. 切换到 **"Body"** 标签页
2. 选择 **"raw"**
3. 右侧下拉选择 **"JSON"**
4. 输入以下 JSON 数据：

```json
{
    "username": "postman_test",
    "password": "123456",
    "email": "postman@example.com"
}
```

#### 步骤 5：发送请求

点击 **"Send"** 按钮

#### 步骤 6：查看响应

**成功响应示例**（状态码 200）：

```json
{
    "code": 200,
    "msg": "注册成功",
    "data": {
        "id": 3,
        "username": "postman_test",
        "password": null,
        "email": "postman@example.com",
        "createdAt": "2026-02-14 10:30:00"
    },
    "timestamp": 1707907200000
}
```

> ⚠️ **注意**：出于安全考虑，响应中的 `password` 字段会被清空（返回 null）。

**失败响应示例**（用户名已存在）：

```json
{
    "code": 500,
    "msg": "系统异常: 用户名已存在",
    "data": null,
    "timestamp": 1707907200000
}
```

---

### 2.2 根据 ID 查询用户

#### 步骤 1：创建请求

1. 在 Collection 中点击 **"Add request"**
2. 命名为：`根据ID查询用户`

#### 步骤 2：配置请求

- **请求方法**：`GET`
- **请求 URL**：`http://localhost:8080/user/1`
  - 将 `1` 替换为你想查询的用户 ID

#### 步骤 3：发送请求

点击 **"Send"** 按钮

#### 步骤 4：查看响应

**成功响应示例**：

```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "id": 1,
        "username": "admin",
        "password": null,
        "email": "admin@cryptorate.com",
        "createdAt": "2026-02-14 09:00:00"
    },
    "timestamp": 1707907200000
}
```

**失败响应示例**（用户不存在）：

```json
{
    "code": 404,
    "msg": "用户不存在",
    "data": null,
    "timestamp": 1707907200000
}
```

---

### 2.3 根据用户名查询用户

#### 步骤 1：创建请求

1. 在 Collection 中点击 **"Add request"**
2. 命名为：`根据用户名查询用户`

#### 步骤 2：配置请求

- **请求方法**：`GET`
- **请求 URL**：`http://localhost:8080/user/username/admin`
  - 将 `admin` 替换为你想查询的用户名

#### 步骤 3：发送请求

点击 **"Send"** 按钮

#### 步骤 4：查看响应

响应格式与 "根据 ID 查询用户" 相同。

---

### 2.4 更新用户信息

#### 步骤 1：创建请求

1. 在 Collection 中点击 **"Add request"**
2. 命名为：`更新用户信息`

#### 步骤 2：配置请求

- **请求方法**：`PUT`
- **请求 URL**：`http://localhost:8080/user/3`
  - 将 `3` 替换为你想更新的用户 ID

#### 步骤 3：设置请求头

切换到 **"Headers"** 标签页，添加：

| Key | Value |
|-----|-------|
| Content-Type | application/json |

#### 步骤 4：设置请求体

1. 切换到 **"Body"** 标签页
2. 选择 **"raw"**
3. 右侧下拉选择 **"JSON"**
4. 输入以下 JSON 数据（只需包含要更新的字段）：

```json
{
    "username": "postman_updated",
    "email": "updated@example.com"
}
```

> 💡 **提示**：你可以只更新部分字段，不需要的字段可以不传。

#### 步骤 5：发送请求

点击 **"Send"** 按钮

#### 步骤 6：查看响应

**成功响应示例**：

```json
{
    "code": 200,
    "msg": "更新成功",
    "data": {
        "id": 3,
        "username": "postman_updated",
        "password": null,
        "email": "updated@example.com",
        "createdAt": "2026-02-14 10:30:00"
    },
    "timestamp": 1707907200000
}
```

---

### 2.5 删除用户

#### 步骤 1：创建请求

1. 在 Collection 中点击 **"Add request"**
2. 命名为：`删除用户`

#### 步骤 2：配置请求

- **请求方法**：`DELETE`
- **请求 URL**：`http://localhost:8080/user/3`
  - 将 `3` 替换为你想删除的用户 ID

> ⚠️ **警告**：删除操作不可逆，请谨慎操作！

#### 步骤 3：发送请求

点击 **"Send"** 按钮

#### 步骤 4：查看响应

**成功响应示例**：

```json
{
    "code": 200,
    "msg": "删除成功",
    "data": null,
    "timestamp": 1707907200000
}
```

**失败响应示例**（用户不存在）：

```json
{
    "code": 500,
    "msg": "系统异常: 用户不存在",
    "data": null,
    "timestamp": 1707907200000
}
```

---

## 📊 完整的测试流程示例

### 完整测试场景：用户的完整生命周期

按照以下顺序进行测试，可以验证系统的完整功能：

1. **用户注册** → `POST /user/register`
   - 创建一个新用户（记住返回的 `id`）

2. **查询用户（ID）** → `GET /user/{id}`
   - 使用上一步返回的 `id` 查询用户信息

3. **查询用户（用户名）** → `GET /user/username/{username}`
   - 使用用户名查询

4. **更新用户信息** → `PUT /user/{id}`
   - 修改用户的邮箱或用户名

5. **再次查询用户** → `GET /user/{id}`
   - 验证信息是否已更新

6. **删除用户** → `DELETE /user/{id}`
   - 删除该用户

7. **再次查询用户** → `GET /user/{id}`
   - 应该返回 404，验证删除成功

8. **获取加密货币汇率** → `GET /market/rates`
   - 测试市场数据接口

---

## 💾 导出 Postman Collection

### 导出步骤

1. 在 Postman 中右键点击 `CryptoRate API` Collection
2. 选择 **"Export"**
3. 选择 **"Collection v2.1"**（推荐）
4. 点击 **"Export"**
5. 保存为 `CryptoRate_Postman_Collection.json`

### 分享给团队

将导出的 JSON 文件分享给团队成员，他们可以：
1. 打开 Postman
2. 点击 **"Import"**
3. 选择你导出的 JSON 文件
4. 所有接口配置会自动导入

---

## 🎯 API 接口总览

| 接口名称 | 方法 | URL | 说明 |
|---------|------|-----|------|
| 获取所有汇率 | GET | `/market/rates` | 获取所有加密货币的实时汇率 |
| 获取单个汇率 | GET | `/market/rate/{symbol}` | 获取指定货币的汇率（如 BTC） |
| 用户注册 | POST | `/user/register` | 注册新用户 |
| 根据ID查询用户 | GET | `/user/{id}` | 通过用户ID查询用户信息 |
| 根据用户名查询 | GET | `/user/username/{username}` | 通过用户名查询用户信息 |
| 更新用户信息 | PUT | `/user/{id}` | 更新用户信息 |
| 删除用户 | DELETE | `/user/{id}` | 删除用户 |

---

## 🐛 常见问题排查

### 问题 1：启动时报 "端口被占用"

**错误信息**：
```
Web server failed to start. Port 8080 was already in use.
```

**解决方案**：

方式 1：修改端口号（推荐）

编辑 `src/main/resources/application.yml`：

```yaml
server:
  port: 8081  # 改成其他端口
```

方式 2：关闭占用 8080 端口的程序

Windows:
```bash
netstat -ano | findstr :8080
taskkill /PID <进程ID> /F
```

Linux/Mac:
```bash
lsof -i :8080
kill -9 <进程ID>
```

---

### 问题 2：连接数据库失败

**错误信息**：
```
java.sql.SQLException: Access denied for user 'root'@'localhost'
```

**解决方案**：

1. 检查 MySQL 服务是否启动
   ```bash
   # Windows
   net start mysql80
   
   # Linux/Mac
   sudo systemctl start mysql
   ```

2. 验证用户名和密码
   ```bash
   mysql -u root -p148017805
   ```

3. 确认数据库 `cryptorate` 已创建
   ```sql
   SHOW DATABASES LIKE 'cryptorate';
   ```

---

### 问题 3：Coinlayer API 调用失败

**错误信息**：
```
Coinlayer API 错误: [101] Invalid API Key
```

**解决方案**：

1. 验证 API Key 是否正确
   - 登录 [Coinlayer 官网](https://coinlayer.com/)
   - 查看 Dashboard 确认 API Key

2. 检查配置文件 `application.yml`
   ```yaml
   coinlayer:
     access-key: 3b4fb0d39af519933feb7c0fe5bc2472  # 确认是否正确
   ```

3. 检查 API 调用次数限制
   - 免费版每月限制 100 次请求
   - 登录 Coinlayer 查看剩余额度

---

### 问题 4：Postman 显示 "Could not get any response"

**可能原因**：

1. **项目未启动** - 确认控制台显示启动成功信息
2. **URL 错误** - 检查是否为 `http://localhost:8080`（不是 https）
3. **防火墙阻止** - 临时关闭防火墙测试

**解决方案**：

1. 先在浏览器访问 `http://localhost:8080/market/rates`
2. 如果浏览器能访问，Postman 才能访问
3. 检查 Postman 的代理设置（Settings → Proxy → 关闭代理）

---

### 问题 5：用户注册后密码显示为 null

**说明**：

这是**正常行为**，不是错误！

- 为了安全，系统在返回用户信息时会清除 `password` 字段
- 密码已正确存储在数据库中，只是不在 API 响应中显示

**验证方法**：

在 MySQL 中查询：
```sql
SELECT * FROM user WHERE username = 'postman_test';
```

你会看到密码已正确存储。

---

## 📚 进阶使用

### 使用 Postman 环境变量

#### 步骤 1：创建环境

1. 点击右上角的 **"Environments"**
2. 点击 **"+"** 创建新环境
3. 命名为：`Development`

#### 步骤 2：添加变量

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| base_url | http://localhost:8080 | http://localhost:8080 |
| user_id | 1 | 1 |

#### 步骤 3：使用变量

在请求 URL 中使用：
- `{{base_url}}/market/rates`
- `{{base_url}}/user/{{user_id}}`

这样切换环境时（开发/测试/生产），只需要修改环境变量即可。

---

### 使用 Postman Tests 自动化测试

在请求的 **"Tests"** 标签页添加脚本：

```javascript
// 测试状态码是否为 200
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// 测试响应时间
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// 测试响应数据格式
pm.test("Response has correct structure", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('code');
    pm.expect(jsonData).to.have.property('msg');
    pm.expect(jsonData).to.have.property('data');
});

// 保存用户 ID 到环境变量（用于后续请求）
if (pm.response.json().data && pm.response.json().data.id) {
    pm.environment.set("user_id", pm.response.json().data.id);
}
```

---

## 📖 学习资源

### 官方文档

- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [MyBatis 中文文档](https://mybatis.org/mybatis-3/zh/index.html)
- [OkHttp 官方文档](https://square.github.io/okhttp/)
- [Postman 学习中心](https://learning.postman.com/)

### 核心代码说明

#### OkHttp 使用示例

查看 `src/main/java/com/cryptorate/service/CryptoMarketService.java`：

```java
// 使用 try-with-resources 确保 Response 自动关闭
try (Response response = okHttpClient.newCall(request).execute()) {
    if (!response.isSuccessful()) {
        throw new ApiException(response.code(), "HTTP 请求失败");
    }
    
    String jsonBody = response.body().string();
    return objectMapper.readValue(jsonBody, CoinlayerResponse.class);
} catch (IOException e) {
    throw new ApiException("调用 API 失败: " + e.getMessage(), e);
}
```

---

## 🎓 项目亮点

### 1. 专业的 OkHttp 配置

- ✅ 连接池管理（200 个空闲连接，保持 5 分钟）
- ✅ 超时配置（连接/读/写 均 5 秒）
- ✅ HTTP 日志拦截器（完整请求/响应日志）
- ✅ 自动重试机制

### 2. 规范的代码结构

- ✅ 分层清晰：Controller → Service → Mapper
- ✅ 统一响应格式：`R<T>` 封装所有接口返回
- ✅ 全局异常处理：`@RestControllerAdvice`
- ✅ 详细的代码注释：每个关键方法都有 JavaDoc

### 3. 健壮的异常处理

- ✅ try-with-resources 确保资源正确关闭
- ✅ 空指针检查
- ✅ HTTP 状态码验证
- ✅ 业务逻辑验证

---

## 🔧 后续优化建议

- [ ] **集成 Spring Security** - 实现 JWT Token 认证
- [ ] **添加 Redis 缓存** - 缓存加密货币汇率，减少 API 调用
- [ ] **密码加密** - 使用 BCrypt 加密存储用户密码
- [ ] **集成 Swagger** - 自动生成 API 文档
- [ ] **单元测试** - 使用 JUnit 5 + Mockito
- [ ] **Docker 部署** - 容器化部署

---

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 👨‍💻 开发团队

- **开发者**: CryptoRate Team
- **版本**: 1.0-SNAPSHOT
- **最后更新**: 2026-02-14

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系我们：

- **Issue**: [GitHub Issues](https://github.com/your-repo/CryptoRate/issues)
- **Email**: support@cryptorate.com

---

**祝你使用愉快！🎉**

如果觉得项目有帮助，欢迎 ⭐ Star 支持我们！
