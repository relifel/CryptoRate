package com.cryptorate.service;

import com.cryptorate.dto.HistoryRateDTO;
import com.cryptorate.dto.LatestRateDTO;

import java.util.List;

/**
 * 汇率数据服务
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
public interface RateService {

    /**
     * 获取系统支持的所有币种代码
     *
     * @return 币种代码列表
     */
    List<String> getSupportedSymbols();

    /**
     * 根据关键词搜索币种
     *
     * @param keyword 搜索关键词
     * @return 匹配的币种代码列表
     */
    List<String> searchSymbols(String keyword);

    /**
     * 获取最新实时汇率
     *
     * @param symbol 币种代码
     * @return 最新汇率列表
     */
    List<LatestRateDTO> getLatestRates(String symbol);

    /**
     * 查询历史汇率
     *
     * @param symbol 币种代码
     * @param start  开始日期
     * @param end    结束日期
     * @return 历史汇率列表
     */
    List<HistoryRateDTO> getHistoryRates(String symbol, String start, String end);
}
