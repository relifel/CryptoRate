-- ========================================
-- CryptoRate 数据库初始化脚本
-- ========================================
-- 作者: CryptoRate Team
-- 版本: 1.0
-- 日期: 2026-02-13
-- 说明: 创建数据库和用户表
-- ========================================

-- ========================================
-- 1. 创建数据库
-- ========================================
CREATE DATABASE IF NOT EXISTS cryptorate 
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE cryptorate;

-- ========================================
-- 2. 创建用户表
-- ========================================
DROP TABLE IF EXISTS `user`;

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

-- ========================================
-- 3. 插入测试数据
-- ========================================
-- 注意：生产环境应该删除这些测试数据
-- 密码未加密，仅用于测试

INSERT INTO `user` (`username`, `password`, `email`, `created_at`) VALUES
('admin', '123456', 'admin@cryptorate.com', NOW()),
('test', '123456', 'test@cryptorate.com', NOW()),
('alice', 'password123', 'alice@example.com', NOW()),
('bob', 'password123', 'bob@example.com', NOW());

-- ========================================
-- 4. 验证数据
-- ========================================
SELECT 'User table initialized successfully!' AS message;
SELECT * FROM `user`;
