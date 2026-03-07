package com.cryptorate.service;

import com.cryptorate.dto.StatsSummaryDTO;

/**
 * 数据统计分析服务
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
public interface StatsService {

    /**
     * 获取汇率统计摘要
     *
     * @param symbol 币种代码
     * @param range  时间范围（7d, 30d）
     * @return 统计摘要
     */
    StatsSummaryDTO getSummary(String symbol, String range);
}
