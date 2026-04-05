package com.cryptorate.service;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 加密货币市场数据服务
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
 */
public interface CryptoMarketService {

    /**
     * 获取实时加密货币汇率
     * 
     * @return 加密货币汇率映射（键：货币代码，值：汇率）
     */
    Map<String, BigDecimal> getRealTimeRates();

    /**
     * 获取指定加密货币的实时汇率
     * 
     * @param symbol 加密货币代码（如 BTC、ETH）
     * @return 该货币的汇率
     */
    BigDecimal getRateBySymbol(String symbol);

    /**
     * 同步汇率数据到数据库
     *
     * @return 同步的记录数
     */
    int syncRatesToDatabase();

    /**
     * 同步历史汇率数据到数据库（采样同步）
     * @param symbols 币种列表
     * @param days 回溯天数
     * @return 同步的记录数
     */
    int syncHistoricalRates(java.util.List<String> symbols, int days);
}
