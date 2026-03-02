package com.cryptorate.dto;

import lombok.Data;

/**
 * 行情解读报告数据传输对象
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Data
public class AnalysisReportDTO {

    /**
     * 加密货币代码
     */
    private String symbol;

    /**
     * 解读报告
     */
    private String report;
}
