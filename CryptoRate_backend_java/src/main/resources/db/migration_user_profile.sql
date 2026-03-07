-- ============================================================
-- User Profile 模块数据库迁移脚本（精简版）
-- 为现有 user 表新增 nickname 和 update_time 字段
-- 执行方式：在 Navicat 中选中 cryptorate 数据库，直接运行本脚本
-- ============================================================

-- 临时关闭外键检查，防止外键约束报错
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `user`
    ADD COLUMN `nickname`    VARCHAR(50)  NULL COMMENT '昵称' AFTER `email`,
    ADD COLUMN `update_time` DATETIME     NULL COMMENT '最后更新时间' AFTER `created_at`;

-- 为现有数据填充 update_time 默认值
UPDATE `user` SET `update_time` = `created_at` WHERE `update_time` IS NULL;

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 确认结果
SELECT id, username, email, nickname, created_at, update_time FROM `user` LIMIT 5;
