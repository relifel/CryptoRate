-- ========================================
-- CryptoRate 数据库扩展表结构
-- ========================================
-- 作者: CryptoRate Team
-- 版本: 2.0
-- 日期: 2026-02-14
-- 说明: 添加汇率历史表和资产管理表
-- ========================================

USE cryptorate;

-- ========================================
-- 1. 创建汇率历史记录表
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
-- 2. 创建用户资产表
-- ========================================
DROP TABLE IF EXISTS `user_asset`;

CREATE TABLE `user_asset` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '资产ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `symbol` VARCHAR(20) NOT NULL COMMENT '加密货币代码',
    `amount` DECIMAL(20, 8) NOT NULL COMMENT '持有数量',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_symbol` (`symbol`),
    UNIQUE KEY `uk_user_symbol` (`user_id`, `symbol`),
    CONSTRAINT `fk_asset_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户资产表';

-- ========================================
-- 3. 插入测试数据（汇率历史）
-- ========================================
INSERT INTO `rate_history` (`symbol`, `rate`, `timestamp`, `created_at`) VALUES
('BTC', 42350.50, UNIX_TIMESTAMP('2024-05-01 10:00:00'), '2024-05-01 10:00:00'),
('BTC', 43200.75, UNIX_TIMESTAMP('2024-05-02 10:00:00'), '2024-05-02 10:00:00'),
('BTC', 42800.30, UNIX_TIMESTAMP('2024-05-03 10:00:00'), '2024-05-03 10:00:00'),
('ETH', 2250.75, UNIX_TIMESTAMP('2024-05-01 10:00:00'), '2024-05-01 10:00:00'),
('ETH', 2300.50, UNIX_TIMESTAMP('2024-05-02 10:00:00'), '2024-05-02 10:00:00'),
('ETH', 2280.25, UNIX_TIMESTAMP('2024-05-03 10:00:00'), '2024-05-03 10:00:00');

-- ========================================
-- 4. 插入测试数据（用户资产）
-- ========================================
INSERT INTO `user_asset` (`user_id`, `symbol`, `amount`) VALUES
(1, 'BTC', 0.5),
(1, 'ETH', 2.0),
(2, 'BTC', 1.0),
(2, 'USDT', 1000.0);

-- ========================================
-- 5. 验证数据
-- ========================================
SELECT 'Database tables created successfully!' AS message;
SELECT COUNT(*) AS rate_history_count FROM rate_history;
SELECT COUNT(*) AS user_asset_count FROM user_asset;
