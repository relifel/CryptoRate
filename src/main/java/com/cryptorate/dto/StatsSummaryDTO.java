package com.cryptorate.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 统计摘要数据传输对象
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Data
public class StatsSummaryDTO {

    /**
     * 加密货币代码
     */
    private String symbol;

    /**
     * 最大值
     */
    private BigDecimal maxValue;

    /**
     * 最小值
     */
    private BigDecimal minValue;

    /**
     * 平均值
     */
    private BigDecimal avgValue;

    /**
     * 价格变化
     */
    private BigDecimal priceChange;

    /**
     * 价格变化百分比
     */
    private String priceChangePercent;
}
