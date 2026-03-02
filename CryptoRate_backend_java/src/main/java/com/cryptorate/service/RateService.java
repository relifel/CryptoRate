package com.cryptorate.service;

import com.cryptorate.dto.HistoryRateDTO;
import com.cryptorate.dto.LatestRateDTO;
import com.cryptorate.entity.RateHistory;
import com.cryptorate.mapper.RateHistoryMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * 汇率数据服务
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Slf4j
@Service
public class RateService {

    /** 当数据库无币种数据时使用的默认币种列表，保证前端列表与搜索功能可用 */
    private static final List<String> DEFAULT_SYMBOLS = List.of(
            "BTC", "ETH", "BNB", "SOL", "XRP", "DOGE", "ADA", "AVAX", "DOT", "MATIC",
            "LINK", "UNI", "LTC", "ATOM", "ETC", "XLM", "BCH", "NEAR", "APT", "FIL"
    );

    private final RateHistoryMapper rateHistoryMapper;

    @Autowired
    public RateService(RateHistoryMapper rateHistoryMapper) {
        this.rateHistoryMapper = rateHistoryMapper;
    }

    /**
     * 获取系统支持的所有币种代码
     * <p>若数据库中尚无汇率记录，返回默认币种列表，保证前端列表与搜索可用。</p>
     *
     * @return 币种代码列表
     */
    public List<String> getSupportedSymbols() {
        log.info("获取系统支持的币种");
        List<String> symbols = rateHistoryMapper.selectAllSymbols();
        if (symbols == null || symbols.isEmpty()) {
            log.info("数据库暂无币种数据，使用默认币种列表（共 {} 个）", DEFAULT_SYMBOLS.size());
            return new ArrayList<>(DEFAULT_SYMBOLS);
        }
        log.info("共支持 {} 个币种", symbols.size());
        return symbols;
    }

    /**
     * 根据关键词搜索币种（支持按币种代码模糊匹配）
     * <p>若数据库中无币种，在默认币种列表中搜索，保证搜索功能可用。</p>
     *
     * @param keyword 搜索关键词（可选，为空时返回全部币种，最多50个）
     * @return 匹配的币种代码列表
     */
    public List<String> searchSymbols(String keyword) {
        log.info("搜索币种，关键词: {}", keyword);
        List<String> allSymbols = rateHistoryMapper.selectAllSymbols();
        if (allSymbols == null || allSymbols.isEmpty()) {
            allSymbols = new ArrayList<>(DEFAULT_SYMBOLS);
        }
        if (keyword == null || keyword.trim().isEmpty()) {
            int limit = Math.min(50, allSymbols.size());
            return new ArrayList<>(allSymbols.subList(0, limit));
        }
        String lowerKeyword = keyword.trim().toLowerCase();
        List<String> matched = allSymbols.stream()
                .filter(symbol -> symbol != null && symbol.toLowerCase().contains(lowerKeyword))
                .limit(50)
                .collect(Collectors.toList());
        log.info("搜索到 {} 个匹配币种", matched.size());
        return matched;
    }

    /**
     * 获取最新实时汇率（可选筛选币种）
     *
     * @param symbol 币种代码（可选）
     * @return 最新汇率列表
     */
    public List<LatestRateDTO> getLatestRates(String symbol) {
        log.info("获取最新实时汇率，筛选币种: {}", symbol);

        List<RateHistory> historyList;
        
        if (symbol != null && !symbol.isEmpty()) {
            // 获取指定币种的最新汇率
            RateHistory history = rateHistoryMapper.selectLatestBySymbol(symbol);
            historyList = history != null ? List.of(history) : List.of();
        } else {
            // 获取所有币种的最新汇率
            historyList = rateHistoryMapper.selectAllLatestRates();
        }

        // 转换为 DTO
        return historyList.stream().map(this::convertToLatestRateDTO).collect(Collectors.toList());
    }

    /**
     * 查询历史汇率（图表专用）
     *
     * @param symbol 币种代码
     * @param start  开始日期（格式：yyyy-MM-dd）
     * @param end    结束日期（格式：yyyy-MM-dd）
     * @return 历史汇率列表
     */
    public List<HistoryRateDTO> getHistoryRates(String symbol, String start, String end) {
        log.info("查询历史汇率，币种: {}, 开始: {}, 结束: {}", symbol, start, end);

        // 将日期字符串转换为时间戳
        Long startTime = parseDate(start);
        Long endTime = parseDate(end);

        // 查询数据库
        List<RateHistory> historyList = rateHistoryMapper.selectBySymbolAndTimeRange(symbol, startTime, endTime);

        // 转换为 DTO
        return historyList.stream().map(this::convertToHistoryRateDTO).collect(Collectors.toList());
    }

    /**
     * 将 RateHistory 转换为 LatestRateDTO
     */
    private LatestRateDTO convertToLatestRateDTO(RateHistory history) {
        LatestRateDTO dto = new LatestRateDTO();
        dto.setSymbol(history.getSymbol());
        dto.setRate(history.getRate());
        dto.setTimestamp(history.getTimestamp());
        
        // 将时间戳转换为格式化字符串
        LocalDateTime dateTime = LocalDateTime.ofInstant(
                Instant.ofEpochSecond(history.getTimestamp()), 
                ZoneId.systemDefault()
        );
        dto.setLastUpdate(dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        return dto;
    }

    /**
     * 将 RateHistory 转换为 HistoryRateDTO
     */
    private HistoryRateDTO convertToHistoryRateDTO(RateHistory history) {
        HistoryRateDTO dto = new HistoryRateDTO();
        
        // 将时间戳转换为日期字符串
        LocalDate date = Instant.ofEpochSecond(history.getTimestamp())
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        dto.setDate(date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        dto.setRate(history.getRate());
        
        return dto;
    }

    /**
     * 将日期字符串转换为 Unix 时间戳（秒）
     */
    private Long parseDate(String dateStr) {
        LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return date.atStartOfDay(ZoneId.systemDefault()).toEpochSecond();
    }
}
