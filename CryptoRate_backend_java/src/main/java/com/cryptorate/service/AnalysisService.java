package com.cryptorate.service;

import com.cryptorate.dto.AnalysisReportDTO;

/**
 * 智能分析服务
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
public interface AnalysisService {

    /**
     * 生成行情解读
     *
     * @param symbol 币种代码
     * @return 解读报告
     */
    AnalysisReportDTO generateReport(String symbol);
}
