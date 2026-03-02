-- ===============================================
-- user_favorite 表：用户收藏的加密货币
-- ===============================================
-- 每个用户可以收藏多个币种，但同一用户不能重复收藏同一币种
-- 通过 (user_id, symbol) 联合唯一索引保证

CREATE TABLE IF NOT EXISTS `user_favorite` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '收藏记录ID（主键）',
    `user_id`     BIGINT       NOT NULL                COMMENT '用户ID（关联 user 表）',
    `symbol`      VARCHAR(20)  NOT NULL                COMMENT '加密货币代码（如 BTC、ETH）',
    `created_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_symbol` (`user_id`, `symbol`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';
