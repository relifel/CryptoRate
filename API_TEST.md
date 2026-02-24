# CryptoRate API 测试文档

## 快速测试指南

本文档提供了所有 API 接口的测试示例，你可以使用 **curl**、**Postman** 或 **API 测试工具** 进行测试。

---

## 前置准备

### 1. 启动 MySQL 数据库

```bash
# 登录 MySQL
mysql -u root -p

# 执行初始化脚本
SOURCE src/main/resources/sql/init.sql;
```

### 2. 修改配置文件

编辑 `src/main/resources/application.yml`：

```yaml
# 修改数据库密码
spring:
  datasource:
    password: your_mysql_password

# 配置 Coinlayer API Key
coinlayer:
  access-key: your_coinlayer_api_key
```

### 3. 启动应用

```bash
# 方式 1: Maven 启动
mvn spring-boot:run

# 方式 2: 打包后运行
mvn clean package
java -jar target/CryptoRate-1.0-SNAPSHOT.jar
```

启动成功后，应该看到：

```
=================================================
     CryptoRate 加密货币追踪系统启动成功！
     访问地址: http://localhost:8080
=================================================
```

---

## 一、市场数据接口

### 1.1 获取所有加密货币的实时汇率

**接口**: `GET /market/rates`

**curl 测试**:

```bash
curl -X GET http://localhost:8080/market/rates
```

**响应示例**:

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
  "timestamp": 1705924800000
}
```

---

### 1.2 获取指定加密货币的实时汇率

**接口**: `GET /market/rate/{symbol}`

**curl 测试**:

```bash
# 获取 BTC 价格
curl -X GET http://localhost:8080/market/rate/BTC

# 获取 ETH 价格
curl -X GET http://localhost:8080/market/rate/ETH
```

**响应示例**:

```json
{
  "code": 200,
  "msg": "success",
  "data": 42350.50,
  "timestamp": 1705924800000
}
```

---

## 二、用户管理接口

### 2.1 用户注册

**接口**: `POST /user/register`

**curl 测试**:

```bash
curl -X POST http://localhost:8080/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456",
    "email": "test@example.com"
  }'
```

**请求体**:

```json
{
  "username": "testuser",
  "password": "123456",
  "email": "test@example.com"
}
```

**响应示例**:

```json
{
  "code": 200,
  "msg": "注册成功",
  "data": {
    "id": 5,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-02-13 10:30:00"
  },
  "timestamp": 1705924800000
}
```

---

### 2.2 根据 ID 查询用户

**接口**: `GET /user/{id}`

**curl 测试**:

```bash
# 查询 ID 为 1 的用户
curl -X GET http://localhost:8080/user/1
```

**响应示例**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@cryptorate.com",
    "createdAt": "2026-02-13 10:00:00"
  },
  "timestamp": 1705924800000
}
```

**用户不存在时的响应**:

```json
{
  "code": 404,
  "msg": "用户不存在",
  "data": null,
  "timestamp": 1705924800000
}
```

---

### 2.3 根据用户名查询用户

**接口**: `GET /user/username/{username}`

**curl 测试**:

```bash
curl -X GET http://localhost:8080/user/username/admin
```

**响应示例**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@cryptorate.com",
    "createdAt": "2026-02-13 10:00:00"
  },
  "timestamp": 1705924800000
}
```

---

### 2.4 更新用户信息

**接口**: `PUT /user/{id}`

**curl 测试**:

```bash
# 更新 ID 为 5 的用户
curl -X PUT http://localhost:8080/user/5 \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newname",
    "email": "newemail@example.com"
  }'
```

**请求体**（只需包含需要更新的字段）:

```json
{
  "username": "newname",
  "email": "newemail@example.com"
}
```

**响应示例**:

```json
{
  "code": 200,
  "msg": "更新成功",
  "data": {
    "id": 5,
    "username": "newname",
    "email": "newemail@example.com",
    "createdAt": "2026-02-13 10:30:00"
  },
  "timestamp": 1705924800000
}
```

---

### 2.5 删除用户

**接口**: `DELETE /user/{id}`

**curl 测试**:

```bash
# 删除 ID 为 5 的用户
curl -X DELETE http://localhost:8080/user/5
```

**响应示例**:

```json
{
  "code": 200,
  "msg": "删除成功",
  "data": null,
  "timestamp": 1705924800000
}
```

---

## 三、常见错误处理

### 3.1 API 调用失败

**场景**: Coinlayer API Key 无效或网络错误

**响应示例**:

```json
{
  "code": 500,
  "msg": "Coinlayer API 错误: [101] Invalid API Key",
  "data": null,
  "timestamp": 1705924800000
}
```

---

### 3.2 用户名重复

**场景**: 注册时用户名已存在

**响应示例**:

```json
{
  "code": 500,
  "msg": "系统异常: 用户名已存在",
  "data": null,
  "timestamp": 1705924800000
}
```

---

## 四、Postman 测试集合

你可以将以下内容保存为 `CryptoRate.postman_collection.json`，然后导入到 Postman：

```json
{
  "info": {
    "name": "CryptoRate API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Market",
      "item": [
        {
          "name": "Get All Rates",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8080/market/rates",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["market", "rates"]
            }
          }
        },
        {
          "name": "Get Rate by Symbol",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8080/market/rate/BTC",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["market", "rate", "BTC"]
            }
          }
        }
      ]
    },
    {
      "name": "User",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"password\": \"123456\",\n  \"email\": \"test@example.com\"\n}"
            },
            "url": {
              "raw": "http://localhost:8080/user/register",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["user", "register"]
            }
          }
        },
        {
          "name": "Get User by ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8080/user/1",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["user", "1"]
            }
          }
        },
        {
          "name": "Update User",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"newname\",\n  \"email\": \"newemail@example.com\"\n}"
            },
            "url": {
              "raw": "http://localhost:8080/user/5",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["user", "5"]
            }
          }
        },
        {
          "name": "Delete User",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "http://localhost:8080/user/5",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["user", "5"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## 五、性能监控

### 查看 OkHttp 日志

启动应用后，所有 HTTP 请求都会打印详细日志（需要在 `application.yml` 中开启）：

```
--> GET http://api.coinlayer.com/live?access_key=xxx
--> END GET
<-- 200 OK http://api.coinlayer.com/live?access_key=xxx (235ms)
content-type: application/json
content-length: 1024
<-- END HTTP (1024-byte body)
```

---

## 六、故障排查

### 问题 1: 连接数据库失败

**错误信息**:

```
java.sql.SQLException: Access denied for user 'root'@'localhost'
```

**解决方案**:

- 检查 `application.yml` 中的数据库用户名和密码
- 确保 MySQL 服务已启动

---

### 问题 2: Coinlayer API 调用失败

**错误信息**:

```
Coinlayer API 错误: [101] Invalid API Key
```

**解决方案**:

- 前往 [Coinlayer 官网](https://coinlayer.com/) 注册并获取免费 API Key
- 在 `application.yml` 中配置正确的 `coinlayer.access-key`

---

### 问题 3: 端口被占用

**错误信息**:

```
Web server failed to start. Port 8080 was already in use.
```

**解决方案**:

- 修改 `application.yml` 中的端口号：

```yaml
server:
  port: 8081
```

---

## 七、下一步

- ✅ 集成 Spring Security 实现用户认证
- ✅ 添加 Redis 缓存加密货币数据
- ✅ 实现密码加密存储（BCrypt）
- ✅ 添加分页查询功能
- ✅ 集成 Swagger API 文档

---

## 联系方式

如有问题，请参考 `README.md` 或查看项目源码中的详细注释。
