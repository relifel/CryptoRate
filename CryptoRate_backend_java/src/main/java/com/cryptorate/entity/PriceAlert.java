package com.cryptorate.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户价格告警规则实体类
 * 
 * <p>映射数据库中的 crypto_price_alert 表</p>
 * 
 * @author CryptoRate Team
 * @version 2.0
 * @since 2026-04-04
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceAlert implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 主键ID */
    private Long id;

    /** 用户ID */
    private Long userId;

    /** 币种代号 (如 BTC, ETH) */
    private String symbol;

    /** 
     * 告警类型 
     * PRICE_ABOVE: 高于目标价
     * PRICE_BELOW: 低于目标价
     * DROP_PERCENT: 剧烈跌幅
     */
    private String alertType;

    /** 目标阈值 (价格或百分比) */
    private BigDecimal targetValue;

    /** 告警冷却时间 (分钟)，默认 60 */
    private Integer cooldownMinutes;

    /** 最近一次触发并发送成功的时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime lastTriggeredAt;

    /** 
     * 状态 
     * ACTIVE: 监控中
     * TRIGGERED: 已触发 (针对单次告警)
     * DISABLED: 已禁用
     */
    private String status;

    /** 创建时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createdAt;

    /** 更新时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updatedAt;
}
