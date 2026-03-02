package com.cryptorate.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 最新汇率数据传输对象
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Data
public class LatestRateDTO {

    /**
     * 加密货币代码
     */
    private String symbol;

    /**
     * 汇率（相对于USD）
     */
    private BigDecimal rate;

    /**
     * Unix 时间戳（秒）
     */
    private Long timestamp;

    /**
     * 最后更新时间（格式化）
     */
    private String lastUpdate;
}
