-- ============================================================
-- 收藏表扩展迁移脚本
-- 为 user_favorite 表新增排序、备注、价格提醒字段
-- 执行方式：在 Navicat 中选中 cryptorate 数据库，直接运行
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `user_favorite`
    ADD COLUMN `sort_order`   INT            DEFAULT 0    COMMENT '排序权重（越小越靠前）' AFTER `symbol`,
    ADD COLUMN `note`         VARCHAR(200)   DEFAULT NULL COMMENT '用户备注' AFTER `sort_order`,
    ADD COLUMN `price_upper`  DECIMAL(20,8)  DEFAULT NULL COMMENT '价格提醒上限' AFTER `note`,
    ADD COLUMN `price_lower`  DECIMAL(20,8)  DEFAULT NULL COMMENT '价格提醒下限' AFTER `price_upper`;

SET FOREIGN_KEY_CHECKS = 1;

-- 确认结果
SELECT id, user_id, symbol, sort_order, note, price_upper, price_lower, created_at
FROM `user_favorite` LIMIT 5;
