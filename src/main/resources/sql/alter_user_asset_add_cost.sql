-- ===============================================
-- user_asset 表迁移：新增 cost 字段
-- ===============================================
-- cost 用于记录用户持仓的总成本（用户手动输入）

ALTER TABLE `user_asset`
    ADD COLUMN `cost` DECIMAL(18, 8) DEFAULT 0.00000000 COMMENT '持仓总成本（USD）'
    AFTER `amount`;
