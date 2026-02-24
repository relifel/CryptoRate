# CryptoRate API 接口文档与 Postman 测试指南 📚

本文档提供了 CryptoRate 系统所有 API 接口的详细说明和 Postman 测试步骤。

---

## 📋 目录

1. [通用说明](#通用说明)
2. [汇率数据采集与查询接口](#汇率数据采集与查询接口)
3. [数据统计分析接口](#数据统计分析接口)
4. [用户资产管理接口](#用户资产管理接口)
5. [智能辅助功能接口](#智能辅助功能接口)
6. [管理后台控制接口](#管理后台控制接口)
7. [用户管理接口](#用户管理接口)
8. [市场数据接口](#市场数据接口)

---

## 通用说明

### 基础信息

- **Base URL (新接口)**: `http://localhost:8080/api/v1`
- **Base URL (原有接口)**: `http://localhost:8080`
- **内容类型**: `application/json`
- **认证方式**: 暂未实现（后续可添加 Bearer Token）

### 通用响应格式

所有接口均返回统一的 JSON 结构：

```json
{
  "code": 200,          // 状态码：200-成功，其他-失败
  "msg": "success",     // 提示信息
  "data": {...},        // 具体业务数据
  "timestamp": 1707907200000  // 响应时间戳
}
```

### 错误码定义

| 错误码 | 描述 |
|--------|------|
| 200    | 操作成功 |
| 400    | 参数校验失败 |
| 404    | 资源不存在 |
| 500    | 服务器内部错误 |

---

## 汇率数据采集与查询接口

### 1. 获取系统支持的币种

#### 接口信息
- **接口地址**: `GET /api/v1/rates/symbols`
- **功能描述**: 查询当前系统支持的所有加密货币代码

---

### 1.1 搜索币种

#### 接口信息
- **接口地址**: `GET /api/v1/rates/search`
- **查询参数**: `keyword`（可选，按币种代码模糊匹配，为空时返回前 50 个）
- **功能描述**: 根据关键词搜索币种，支持按币种代码模糊匹配

#### Postman 测试步骤

**步骤 1**: 创建请求
- 命名为：`搜索币种`

**步骤 2**: 配置请求
- 请求方法：`GET`
- 请求 URL：`http://localhost:8080/api/v1/rates/search`
- 可选参数（Params）：
  - Key: `keyword`，Value: `BTC`（示例：搜索包含 BTC 的币种）

**成功响应示例**（keyword=BTC）：
```json
{
  "code": 200,
  "msg": "success",
  "data": ["BTC", "WBTC"],
  "timestamp": 1707907200000
}
```

**成功响应示例**（无 keyword 或 keyword 为空）：
```json
{
  "code": 200,
  "msg": "success",
  "data": ["BTC", "ETH", "BNB", "..."],
  "timestamp": 1707907200000
}
```

---

#### Postman 测试步骤

**步骤 1**: 创建请求
- 在 Collection 中点击 "Add request"
- 命名为：`获取支持的币种`

**步骤 2**: 配置请求
- 请求方法：`GET`
- 请求 URL：`http://localhost:8080/api/v1/rates/symbols`

**步骤 3**: 发送请求并查看响应

**成功响应示例**：
```json
{
  "code": 200,
  "msg": "success",
  "data": ["BTC", "ETH", "SOL", "BNB", "XRP"],
  "timestamp": 1707907200000
}
```

---

### 2. 获取最新实时汇率

#### 接口信息
- **接口地址**: `GET /api/v1/rates/latest`
- **查询参数**: `symbol`（可选，筛选指定币种）
- **功能描述**: 获取最近一次采集到的实时汇率数据

#### Postman 测试步骤

**步骤 1**: 创建请求
- 命名为：`获取最新实时汇率`

**步骤 2**: 配置请求
- 请求方法：`GET`
- 请求 URL：`http://localhost:8080/api/v1/rates/latest`

**可选参数**（在 Params 标签页添加）：
| Key | Value | 说明 |
|-----|-------|------|
| symbol | BTC | 筛选指定币种（可选） |

**成功响应示例**（不带参数）：
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "symbol": "BTC",
      "rate": 65432.21,
      "timestamp": 1715678400,
      "lastUpdate": "2024-05-14 10:00:00"
    },
    {
      "symbol": "ETH",
      "rate": 3200.50,
      "timestamp": 1715678400,
      "lastUpdate": "2024-05-14 10:00:00"
    }
  ],
  "timestamp": 1707907200000
}
```

**成功响应示例**（带 symbol=BTC）：
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "symbol": "BTC",
      "rate": 65432.21,
      "timestamp": 1715678400,
      "lastUpdate": "2024-05-14 10:00:00"
    }
  ],
  "timestamp": 1707907200000
}
```

---

### 3. 查询历史汇率（图表专用）

#### 接口信息
- **接口地址**: `GET /api/v1/rates/history`
- **查询参数**:
  - `symbol`（必填）：币种代码
  - `start`（必填）：开始日期（格式：yyyy-MM-dd）
  - `end`（必填）：结束日期（格式：yyyy-MM-dd）

#### Postman 测试步骤

**步骤 1**: 创建请求
- 命名为：`查询历史汇率`

**步骤 2**: 配置请求
- 请求方法：`GET`
- 请求 URL：`http://localhost:8080/api/v1/rates/history`

**步骤 3**: 添加查询参数（在 Params 标签页）

| Key | Value | 说明 |
|-----|-------|------|
| symbol | BTC | 币种代码 |
| start | 2024-05-01 | 开始日期 |
| end | 2024-05-10 | 结束日期 |

**成功响应示例**：
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    { "date": "2024-05-01", "rate": 62000.00 },
    { "date": "2024-05-02", "rate": 63500.50 },
    { "date": "2024-05-03", "rate": 62800.30 }
  ],
  "timestamp": 1707907200000
}
```

---

## 数据统计分析接口

### 4. 获取汇率统计摘要

#### 接口信息
- **接口地址**: `GET /api/v1/stats/summary/{symbol}`
- **路径参数**: `symbol`（如 BTC）
- **查询参数**: `range`（时间范围：7d、30d，默认 7d）
- **功能描述**: 计算指定周期内的极值、均值和涨跌幅

#### Postman 测试步骤

**步骤 1**: 创建请求
- 命名为：`获取统计摘要`

**步骤 2**: 配置请求
- 请求方法：`GET`
- 请求 URL：`http://localhost:8080/api/v1/stats/summary/BTC`

**步骤 3**: 添加查询参数（可选）

| Key | Value | 说明 |
|-----|-------|------|
| range | 7d | 7天或30天（默认7d） |

**成功响应示例**：
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "symbol": "BTC",
    "maxValue": 69000.00,
    "minValue": 58000.00,
    "avgValue": 63500.00,
    "priceChange": 1200.50,
    "priceChangePercent": "2.1%"
  },
  "timestamp": 1707907200000
}
```

---

## 用户资产管理接口

### 5. 查询个人资产记录

#### 接口信息
- **接口地址**: `GET /api/v1/assets`
- **功能描述**: 查询当前用户的所有资产记录

> ⚠️ **注意**：当前版本使用固定用户 ID（1），后续集成认证后从 Token 获取

#### Postman 测试步骤

**步骤 1**: 创建请求
- 命名为：`查询个人资产`

**步骤 2**: 配置请求
- 请求方法：`GET`
- 请求 URL：`http://localhost:8080/api/v1/assets`

**成功响应示例**：
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "symbol": "BTC",
      "amount": 0.5,
      "currentPrice": 65000.00,
      "totalValue": 32500.00
    },
    {
      "id": 2,
      "symbol": "ETH",
      "amount": 2.0,
      "currentPrice": 3200.00,
      "totalValue": 6400.00
    }
  ],
  "timestamp": 1707907200000
}
```

---

### 6. 添加/修改资产

#### 接口信息
- **接口地址**: `POST /api/v1/assets`
- **请求体**: JSON 格式
- **功能描述**: 添加新资产或修改现有资产数量

#### Postman 测试步骤

**步骤 1**: 创建请求
- 命名为：`添加/修改资产`

**步骤 2**: 配置请求
- 请求方法：`POST`
- 请求 URL：`http://localhost:8080/api/v1/assets`

**步骤 3**: 设置请求头
| Key | Value |
|-----|-------|
| Content-Type | application/json |

**步骤 4**: 设置请求体（Body → raw → JSON）

```json
{
  "symbol": "ETH",
  "amount": 2.0
}
```

**成功响应示例**：
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 2,
    "userId": 1,
    "symbol": "ETH",
    "amount": 2.0,
    "createdAt": "2026-02-14 10:30:00",
    "updatedAt": "2026-02-14 10:30:00"
  },
  "timestamp": 1707907200000
}
```

---

### 7. 删除资产记录

#### 接口信息
- **接口地址**: `DELETE /api/v1/assets/{id}`
- **路径参数**: `id`（资产ID）
- **功能描述**: 删除指定的资产记录

#### Postman 测试步骤

**步骤 1**: 创建请求
- 命名为：`删除资产`

**步骤 2**: 配置请求
- 请求方法：`DELETE`
- 请求 URL：`http://localhost:8080/api/v1/assets/2`

**成功响应示例**：
```json
{
  "code": 200,
  "msg": "删除成功",
  "data": null,
  "timestamp": 1707907200000
}
```

---

## 智能辅助功能接口

### 8. 生成行情解读

#### 接口信息
- **接口地址**: `GET /api/v1/analysis/explain/{symbol}`
- **路径参数**: `symbol`（币种代码）
- **功能描述**: 根据汇率变动数据生成文字化解读描述

#### Postman 测试步骤

**步骤 1**: 创建请求
- 命名为：`生成行情解读`

**步骤 2**: 配置请求
- 请求方法：`GET`
- 请求 URL：`http://localhost:8080/api/v1/analysis/explain/BTC`

**成功响应示例**：
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "symbol": "BTC",
    "report": "BTC 在过去 24 小时内价格表现平稳。最高价格为 $66,000.00，最低为 $64,000.00。整体呈现平稳趋势，涨跌幅为 0.5%。"
  },
  "timestamp": 1707907200000
}
```

---

## 管理后台控制接口

### 9. 手动触发数据采集

#### 接口信息
- **接口地址**: `POST /api/v1/admin/sync`
- **功能描述**: 立即调用 Coinlayer API 并更新数据库中的汇率数据

#### Postman 测试步骤

**步骤 1**: 创建请求
- 命名为：`手动同步数据`

**步骤 2**: 配置请求
- 请求方法：`POST`
- 请求 URL：`http://localhost:8080/api/v1/admin/sync`

**成功响应示例**：
```json
{
  "code": 200,
  "msg": "success",
  "data": "成功同步 150 条汇率数据",
  "timestamp": 1707907200000
}
```

---

## 用户管理接口

### 10. 用户注册
- **接口地址**: `POST /user/register`
- **请求体**: `{"username": "test", "password": "123456", "email": "test@example.com"}`

### 11. 查询用户
- **接口地址**: `GET /user/{id}`

### 12. 更新用户
- **接口地址**: `PUT /user/{id}`
- **请求体**: `{"username": "newname", "email": "new@example.com"}`

### 13. 删除用户
- **接口地址**: `DELETE /user/{id}`

> 详细测试步骤请参考 README.md 文档

---

## 市场数据接口

### 14. 获取所有汇率
- **接口地址**: `GET /market/rates`

### 15. 获取单个汇率
- **接口地址**: `GET /market/rate/{symbol}`

> 详细测试步骤请参考 README.md 文档

---

## 完整测试流程

### 流程 1：数据采集与查询

1. **手动同步数据** → `POST /api/v1/admin/sync`
   - 从 Coinlayer API 获取最新数据并保存到数据库

2. **查询支持的币种** → `GET /api/v1/rates/symbols`
   - 查看系统支持哪些币种

3. **获取最新汇率** → `GET /api/v1/rates/latest`
   - 查看所有币种的最新价格

4. **查询历史汇率** → `GET /api/v1/rates/history`
   - 查看某个币种的历史价格走势

5. **获取统计摘要** → `GET /api/v1/stats/summary/BTC`
   - 查看 BTC 的统计数据

---

### 流程 2：资产管理

1. **添加资产** → `POST /api/v1/assets`
   - 添加持有的 BTC 和 ETH

2. **查询资产** → `GET /api/v1/assets`
   - 查看所有资产及其当前价值

3. **修改资产** → `POST /api/v1/assets`
   - 修改持有数量

4. **删除资产** → `DELETE /api/v1/assets/{id}`
   - 删除不再持有的资产

---

### 流程 3：智能分析

1. **生成行情解读** → `GET /api/v1/analysis/explain/BTC`
   - 获取 BTC 的智能分析报告

---

## 数据库初始化

在测试接口前，请先执行数据库初始化脚本：

```bash
mysql -u root -p148017805
SOURCE src/main/resources/sql/init.sql;
SOURCE src/main/resources/sql/update_tables.sql;
```

---

## Postman Collection 导入

### 创建环境变量

1. 点击右上角 "Environments"
2. 创建新环境 "CryptoRate Development"
3. 添加变量：
   - `base_url_v1`: `http://localhost:8080/api/v1`
   - `base_url`: `http://localhost:8080`

### 使用变量

在请求 URL 中使用：
- `{{base_url_v1}}/rates/symbols`
- `{{base_url}}/market/rates`

---

## 常见问题

### Q1: 数据库中没有历史数据怎么办？

**解决方案**：
1. 执行 `update_tables.sql` 脚本插入测试数据
2. 或者调用 `POST /api/v1/admin/sync` 接口同步实时数据

### Q2: 查询历史汇率返回空数据？

**原因**：数据库中没有指定时间范围的数据

**解决方案**：
1. 检查数据库中的数据时间范围
2. 调整查询的 start 和 end 参数

### Q3: 资产管理接口使用的是哪个用户？

**说明**：当前版本使用固定用户 ID（1），对应数据库中的 admin 用户

---

## 接口测试检查清单

- [ ] 所有汇率接口正常返回数据
- [ ] 统计分析接口计算正确
- [ ] 资产管理 CRUD 操作正常
- [ ] 智能分析生成报告
- [ ] 手动同步数据成功
- [ ] 错误情况返回正确的错误码和提示

---

## 技术支持

如有问题，请查看：
- 项目 README.md
- 代码中的详细注释
- 控制台日志输出

**祝测试顺利！** 🎉
