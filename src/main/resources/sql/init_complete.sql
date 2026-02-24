-- ========================================
-- CryptoRate 数据库初始化脚本
-- 完整版 - 包含所有必需的表
-- ========================================
-- 作者: CryptoRate Team
-- 版本: 3.0
-- 日期: 2026-02-22
-- ========================================

-- ========================================
-- 1. 创建数据库
-- ========================================
CREATE DATABASE IF NOT EXISTS cryptorate
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE cryptorate;

-- ========================================
-- 2. 用户表
-- ========================================
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ========================================
-- 3. 汇率历史记录表
-- ========================================
DROP TABLE IF EXISTS `rate_history`;

CREATE TABLE `rate_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `symbol` VARCHAR(20) NOT NULL COMMENT '加密货币代码（如BTC、ETH）',
    `rate` DECIMAL(20, 8) NOT NULL COMMENT '汇率（相对于USD）',
    `timestamp` BIGINT NOT NULL COMMENT 'Unix时间戳（秒）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_symbol` (`symbol`),
    KEY `idx_timestamp` (`timestamp`),
    KEY `idx_symbol_timestamp` (`symbol`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='汇率历史记录表';

-- ========================================
-- 4. 用户资产表
-- ========================================
DROP TABLE IF EXISTS `user_asset`;

CREATE TABLE `user_asset` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '资产ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `symbol` VARCHAR(20) NOT NULL COMMENT '加密货币代码',
    `amount` DECIMAL(20, 8) NOT NULL DEFAULT 0 COMMENT '持有数量',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_symbol` (`symbol`),
    UNIQUE KEY `uk_user_symbol` (`user_id`, `symbol`),
    CONSTRAINT `fk_asset_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户资产表';

-- ========================================
-- 5. 用户收藏表（新增）
-- ========================================
DROP TABLE IF EXISTS `user_favorite`;

CREATE TABLE `user_favorite` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `symbol` VARCHAR(20) NOT NULL COMMENT '加密货币代码',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    UNIQUE KEY `uk_user_symbol` (`user_id`, `symbol`),
    CONSTRAINT `fk_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

-- ========================================
-- 6. 插入测试数据 - 用户
-- ========================================
INSERT INTO `user` (`username`, `password`, `email`) VALUES
('admin', '123456', 'admin@cryptorate.com'),
('test', '123456', 'test@cryptorate.com'),
('alice', 'password123', 'alice@example.com'),
('bob', 'password123', 'bob@example.com');

-- ========================================
-- 7. 插入测试数据 - 汇率历史
-- ========================================
INSERT INTO `rate_history` (`symbol`, `rate`, `timestamp`, `created_at`) VALUES
-- BTC 历史数据
('BTC', 42350.50, UNIX_TIMESTAMP('2024-05-01 10:00:00'), '2024-05-01 10:00:00'),
('BTC', 43200.75, UNIX_TIMESTAMP('2024-05-02 10:00:00'), '2024-05-02 10:00:00'),
('BTC', 42800.30, UNIX_TIMESTAMP('2024-05-03 10:00:00'), '2024-05-03 10:00:00'),
('BTC', 43500.00, UNIX_TIMESTAMP('2024-05-04 10:00:00'), '2024-05-04 10:00:00'),
('BTC', 44000.00, UNIX_TIMESTAMP('2024-05-05 10:00:00'), '2024-05-05 10:00:00'),
-- ETH 历史数据
('ETH', 2250.75, UNIX_TIMESTAMP('2024-05-01 10:00:00'), '2024-05-01 10:00:00'),
('ETH', 2300.50, UNIX_TIMESTAMP('2024-05-02 10:00:00'), '2024-05-02 10:00:00'),
('ETH', 2280.25, UNIX_TIMESTAMP('2024-05-03 10:00:00'), '2024-05-03 10:00:00'),
('ETH', 2320.00, UNIX_TIMESTAMP('2024-05-04 10:00:00'), '2024-05-04 10:00:00'),
('ETH', 2350.00, UNIX_TIMESTAMP('2024-05-05 10:00:00'), '2024-05-05 10:00:00'),
-- BNB 历史数据
('BNB', 320.50, UNIX_TIMESTAMP('2024-05-01 10:00:00'), '2024-05-01 10:00:00'),
('BNB', 325.75, UNIX_TIMESTAMP('2024-05-02 10:00:00'), '2024-05-02 10:00:00'),
('BNB', 318.20, UNIX_TIMESTAMP('2024-05-03 10:00:00'), '2024-05-03 10:00:00'),
('BNB', 330.00, UNIX_TIMESTAMP('2024-05-04 10:00:00'), '2024-05-04 10:00:00'),
('BNB', 335.00, UNIX_TIMESTAMP('2024-05-05 10:00:00'), '2024-05-05 10:00:00');

-- ========================================
-- 8. 插入测试数据 - 用户资产
-- ========================================
INSERT INTO `user_asset` (`user_id`, `symbol`, `amount`) VALUES
(1, 'BTC', 0.5),
(1, 'ETH', 2.0),
(1, 'BNB', 10.0),
(2, 'BTC', 1.0),
(2, 'USDT', 1000.0),
(3, 'ETH', 5.0),
(3, 'SOL', 50.0);

-- ========================================
-- 9. 插入测试数据 - 用户收藏
-- ========================================
INSERT INTO `user_favorite` (`user_id`, `symbol`) VALUES
(1, 'BTC'),
(1, 'ETH'),
(2, 'BTC'),
(2, 'BNB'),
(3, 'ETH'),
(3, 'SOL');

-- ========================================
-- 10. 验证结果
-- ========================================
SELECT '===== 数据库初始化完成 =====' AS message;

SELECT '用户表数据:' AS '';
SELECT * FROM `user`;

SELECT '汇率历史表数据:' AS '';
SELECT * FROM `rate_history`;

SELECT '用户资产表数据:' AS '';
SELECT * FROM `user_asset`;

SELECT '用户收藏表数据:' AS '';
SELECT * FROM `user_favorite`;
