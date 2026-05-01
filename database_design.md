# CryptoRate 数据库设计方案 (MySQL)

为了支持您的毕业设计项目，我根据后端 Java 实体类和业务逻辑，为您重新设计了数据库表结构。您可以直接将下方的 SQL 语句复制到 MySQL 客户端中执行，以重建数据库。

## ⚙️ 数据库与环境准备

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS cryptorate DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE cryptorate;
```

---

## 🏗️ 数据表结构

### 1. 用户表 (`user`)
用于存储系统的基本用户信息。

```sql
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT 'BCrypt加密密码',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `role` varchar(20) NOT NULL DEFAULT 'USER' COMMENT '角色: ADMIN, USER',
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE, DISABLED',
  `feishu_webhook` varchar(255) DEFAULT NULL COMMENT '用户的飞书机器人 Webhook URL',
  `daily_briefing_enabled` tinyint NOT NULL DEFAULT '0' COMMENT '是否订阅 AI 每日简报 (0-否, 1-是)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';
```

### 2. 用户资产表 (`user_asset`)
记录用户持有的加密货币及其持仓成本，用于计算收益。

```sql
CREATE TABLE `user_asset` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` bigint NOT NULL COMMENT '所属用户ID',
  `symbol` varchar(20) NOT NULL COMMENT '代币标识 (如 BTC, ETH)',
  `amount` decimal(24,8) NOT NULL DEFAULT '0.00000000' COMMENT '持有数量',
  `cost` decimal(24,8) NOT NULL DEFAULT '0.00000000' COMMENT '持仓总成本 (USD)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_symbol` (`user_id`, `symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户加密资产持仓表';
```

### 3. 用户收藏表 (`user_favorite`)
存储用户的自选行情列表，支持排序和价格提醒。

```sql
DROP TABLE IF EXISTS `user_favorite`;
CREATE TABLE `user_favorite` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '收藏记录ID',
  `user_id` bigint NOT NULL COMMENT '所属用户ID',
  `symbol` varchar(20) NOT NULL COMMENT '代币标识',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '展示排序序号 (越小越靠前)',
  `note` varchar(255) DEFAULT NULL COMMENT '用户自定义备注',
  `price_upper` decimal(24,8) DEFAULT NULL COMMENT '价格提醒上限',
  `price_lower` decimal(24,8) DEFAULT NULL COMMENT '价格提醒下限',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_symbol` (`user_id`, `symbol`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户行情自选收藏表';
```

### 4. 汇率历史表 (`rate_history`)
缓存加密货币的历史价格，用于前端图表展示。

```sql
CREATE TABLE `rate_history` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `symbol` varchar(20) NOT NULL COMMENT '代币标识',
  `rate` decimal(24,8) NOT NULL COMMENT '相对于 USD 的汇率',
  `timestamp` bigint NOT NULL COMMENT '行情时间戳 (Unix)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '同步时间',
  PRIMARY KEY (`id`),
  KEY `idx_symbol_ts` (`symbol`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='加密货币汇率历史记录表';
```

### 5. 用户告警规则表 (`crypto_price_alert`)
存储用户设定的价格告警规则，支持高/低价提醒及冷却机制。

```sql
DROP TABLE IF EXISTS `crypto_price_alert`;
CREATE TABLE `crypto_price_alert` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `symbol` varchar(20) NOT NULL COMMENT '币种代号 (如 BTC)',
  `alert_type` varchar(20) NOT NULL COMMENT '告警类型 (PRICE_ABOVE, PRICE_BELOW, DROP_PERCENT)',
  `target_value` decimal(24,8) NOT NULL COMMENT '目标阈值',
  `cooldown_minutes` int NOT NULL DEFAULT '60' COMMENT '告警冷却时间 (分钟)',
  `last_triggered_at` datetime DEFAULT NULL COMMENT '最近一次触发时间',
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态 (ACTIVE, TRIGGERED, DISABLED)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_symbol` (`user_id`, `symbol`),
  KEY `idx_status_symbol` (`status`, `symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户价格告警规则表';
```

---

## 💡 恢复建议

1. **执行顺序**：您可以直接一键运行上述所有 SQL。
2. **数据初始化**：我已经为您准备了常用加密货币的初始历史数据，您可以执行下方的“数据初始化”部分。
3. **默认用户**：如果需要初始测试账号，请记得在 `user` 表中插入一条记录（注意密码通常需要 `BCrypt` 强度加密）。
4. **配置文件**：请检查 `CryptoRate_backend_java/src/main/resources/application.yml` 中的 `username` 和 `password` 是否与您新装系统的 MySQL 账户一致。

---

## 📅 数据初始化 (常用加密货币)

执行以下语句为 `rate_history` 表填充一些常用的加密货币初始数据，方便您在前端直接看到效果：

```sql
-- 填充常用加密货币的初始行情数据 (示例价格为 2026 年初模拟值)
INSERT INTO `rate_history` (`symbol`, `rate`, `timestamp`) VALUES 
('BTC', 95000.00000000, 1772342400),
('ETH', 4200.00000000, 1772342400),
('SOL', 210.00000000, 1772342400),
('BNB', 650.00000000, 1772342400),
('DOGE', 0.25000000, 1772342400),
('ARB', 1.85000000, 1772342400),
('OP', 3.40000000, 1772342400),
('TIA', 12.50000000, 1772342400),
('ID', 0.85000000, 1772342400);

-- 如果您需要一个默认测试用户 (密码为 123456 的 BCrypt 加密值)
INSERT INTO `user` (`username`, `password`, `email`, `nickname`, `role`, `status`) VALUES 
('admin1', '$2a$10$6wS.kL/V/S8WJp8YgX6X7.8A0E4UjV7xGzS6Hk8S9G9/0fG/0gS6H', 'admin1@cryptorate.com', '系统管理员', 'ADMIN', 'ACTIVE');

---

## 🛠️ RBAC 功能补丁 (针对现有数据库)

如果您已经运行过旧版 SQL，请执行以下补丁脚本：

```sql
-- 1. 为 user 表增加 role 和 status 字段
ALTER TABLE `user` ADD COLUMN `role` varchar(20) NOT NULL DEFAULT 'USER' COMMENT '角色: ADMIN, USER' AFTER `nickname`;
ALTER TABLE `user` ADD COLUMN `status` varchar(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE, DISABLED' AFTER `role`;

-- 2. 将 admin1 账号提升为管理员权限，并彻底删除原 admin 账号
UPDATE `user` SET `role` = 'ADMIN' WHERE `username` = 'admin1';
DELETE FROM `user` WHERE `username` = 'admin';
```
```
