package com.cryptorate.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 历史汇率数据传输对象
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Data
public class HistoryRateDTO {

    /**
     * 日期（格式：yyyy-MM-dd）
     */
    private String date;

    /**
     * 汇率
     */
    private BigDecimal rate;
}
