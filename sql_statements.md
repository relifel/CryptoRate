# CryptoRate 数据库 SQL 脚本 (中文版)

根据您的 E-R 图设计，以下是将表名和字段名全部替换为中文后的 SQL 建表语句。

> [!NOTE]
> 请注意：如果您的后端 Java 代码（如 MyBatis 或 JPA）使用的是英文实体类名和属性名，直接运行此脚本会导致数据库字段与代码不匹配。此版本主要用于符合毕业设计的文档展示要求。

## 1. 数据库创建
```sql
CREATE DATABASE IF NOT EXISTS `加密货币汇率系统` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `加密货币汇率系统`;
```

## 2. 数据表定义

### 2.1 用户表 (`用户`)
对应 E-R 图中的 **用户** 实体。
```sql
CREATE TABLE `用户` (
  `用户ID` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `用户名` varchar(50) NOT NULL COMMENT '用户名',
  `密码` varchar(100) NOT NULL COMMENT '密码 (BCrypt加密)',
  `邮箱` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `昵称` varchar(50) DEFAULT NULL COMMENT '昵称',
  `角色` varchar(20) NOT NULL DEFAULT 'USER' COMMENT '角色: 管理员, 普通用户',
  `状态` varchar(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: 激活, 禁用',
  `飞书通知地址` varchar(255) DEFAULT NULL COMMENT '飞书机器人通知地址',
  `每日简报开启` tinyint NOT NULL DEFAULT '0' COMMENT '是否开启每日简报',
  `创建时间` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `修改时间` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`用户ID`),
  UNIQUE KEY `uk_用户名` (`用户名`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';
```

### 2.2 用户资产表 (`用户资产`)
对应 E-R 图中的 **用户资产** 实体。
```sql
CREATE TABLE `用户资产` (
  `资产记录ID` bigint NOT NULL AUTO_INCREMENT COMMENT '资产记录ID',
  `用户ID` bigint NOT NULL COMMENT '用户ID (关联用户表)',
  `代币标识` varchar(20) NOT NULL COMMENT '代币标识 (如 BTC, ETH)',
  `持有数量` decimal(24,8) NOT NULL DEFAULT '0.00000000' COMMENT '持有数量',
  `持仓总成本` decimal(24,8) NOT NULL DEFAULT '0.00000000' COMMENT '持仓总成本 (USD)',
  `记录创建时间` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  `最后更新时间` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  PRIMARY KEY (`资产记录ID`),
  KEY `idx_用户ID` (`用户ID`),
  CONSTRAINT `fk_资产_用户` FOREIGN KEY (`用户ID`) REFERENCES `用户` (`用户ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户加密资产持仓表';
```

### 2.3 用户自选收藏表 (`用户自选收藏`)
对应 E-R 图中的 **用户自选收藏** 实体。
```sql
CREATE TABLE `用户自选收藏` (
  `收藏记录ID` bigint NOT NULL AUTO_INCREMENT COMMENT '收藏记录ID',
  `用户ID` bigint NOT NULL COMMENT '用户ID',
  `代币标识` varchar(20) NOT NULL COMMENT '代币标识',
  `自定义备注` varchar(255) DEFAULT NULL COMMENT '自定义备注',
  `价格提醒上限` decimal(24,8) DEFAULT NULL COMMENT '价格提醒上限',
  `价格提醒下限` decimal(24,8) DEFAULT NULL COMMENT '价格提醒下限',
  `展示排序` int NOT NULL DEFAULT '0' COMMENT '展示排序',
  `收藏时间` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`收藏记录ID`),
  UNIQUE KEY `uk_用户_代币` (`用户ID`, `代币标识`),
  CONSTRAINT `fk_收藏_用户` FOREIGN KEY (`用户ID`) REFERENCES `用户` (`用户ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户自选行情收藏表';
```

### 2.4 汇率历史表 (`汇率历史`)
对应 E-R 图中的 **汇率历史** 实体。
```sql
CREATE TABLE `汇率历史` (
  `记录ID` bigint NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `代币标识` varchar(20) NOT NULL COMMENT '代币标识',
  `相对美元汇率` decimal(24,8) NOT NULL COMMENT '相对美元汇率',
  `行情时间戳` bigint NOT NULL COMMENT '行情时间戳 (Unix)',
  `同步时间` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '同步时间',
  PRIMARY KEY (`记录ID`),
  KEY `idx_代币_时间戳` (`代币标识`, `行情时间戳`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='加密货币汇率历史表';
```

### 2.5 价格告警规则表 (`价格告警规则`)
对应 E-R 图中的 **价格告警规则** 实体。
```sql
CREATE TABLE `价格告警规则` (
  `告警规则ID` bigint NOT NULL AUTO_INCREMENT COMMENT '告警规则ID',
  `用户ID` bigint NOT NULL COMMENT '用户ID',
  `代币标识` varchar(20) NOT NULL COMMENT '代币标识',
  `目标阈值` decimal(24,8) NOT NULL COMMENT '目标阈值',
  `告警类型` varchar(20) NOT NULL COMMENT '告警类型 (高于, 低于)',
  `冷却时间_分钟` int NOT NULL DEFAULT '60' COMMENT '冷却时间 (分钟)',
  `状态` varchar(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
  `创建时间` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `更新时间` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `最近触发时间` datetime DEFAULT NULL COMMENT '最近触发时间',
  PRIMARY KEY (`告警规则ID`),
  KEY `idx_用户_代币` (`用户ID`, `代币标识`),
  CONSTRAINT `fk_告警_用户` FOREIGN KEY (`用户ID`) REFERENCES `用户` (`用户ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='价格告警规则表';
```
