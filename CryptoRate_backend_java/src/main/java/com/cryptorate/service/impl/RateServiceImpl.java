package com.cryptorate.service.impl;

import com.cryptorate.dto.HistoryRateDTO;
import com.cryptorate.dto.LatestRateDTO;
import com.cryptorate.entity.RateHistory;
import com.cryptorate.mapper.RateHistoryMapper;
import com.cryptorate.service.RateService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 汇率数据业务实现类
 *
 * <p>
 * 实现 {@link RateService} 接口，提供币种列表、实时汇率和历史汇率查询。
 * </p>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-03-07
 */
@Slf4j
@Service
public class RateServiceImpl implements RateService {

    /** 当数据库无币种数据时使用的默认币种列表，保证前端列表与搜索功能可用 */
    private static final List<String> DEFAULT_SYMBOLS = List.of(
            "BTC", "ETH", "BNB", "SOL", "XRP", "DOGE", "ADA", "AVAX", "DOT", "MATIC",
            "LINK", "UNI", "LTC", "ATOM", "ETC", "XLM", "BCH", "NEAR", "APT", "FIL");

    private final RateHistoryMapper rateHistoryMapper;

    @Autowired
    public RateServiceImpl(RateHistoryMapper rateHistoryMapper) {
        this.rateHistoryMapper = rateHistoryMapper;
    }

    @Override
    public List<String> getSupportedSymbols() {
        log.debug("获取系统支持的币种");
        List<String> symbols = rateHistoryMapper.selectAllSymbols();
        if (symbols == null || symbols.isEmpty()) {
            log.info("数据库暂无币种数据，使用默认币种列表（共 {} 个）", DEFAULT_SYMBOLS.size());
            return new ArrayList<>(DEFAULT_SYMBOLS);
        }
        log.info("共支持 {} 个币种", symbols.size());
        return symbols;
    }

    @Override
    public List<String> searchSymbols(String keyword) {
        log.debug("搜索币种，关键词: {}", keyword);
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

    @Override
    public List<LatestRateDTO> getLatestRates(String symbol) {
        log.debug("获取最新实时汇率，筛选币种: {}", symbol);

        List<RateHistory> historyList;

        if (symbol != null && !symbol.isEmpty()) {
            RateHistory history = rateHistoryMapper.selectLatestBySymbol(symbol);
            historyList = history != null ? List.of(history) : List.of();
        } else {
            historyList = rateHistoryMapper.selectAllLatestRates();
        }

        return historyList.stream().map(this::convertToLatestRateDTO).collect(Collectors.toList());
    }

    @Override
    public List<HistoryRateDTO> getHistoryRates(String symbol, String start, String end) {
        log.debug("查询历史汇率，币种: {}, 开始: {}, 结束: {}", symbol, start, end);

        Long startTime = parseDate(start);
        Long endTime = parseDate(end);

        List<RateHistory> historyList = rateHistoryMapper.selectBySymbolAndTimeRange(symbol, startTime, endTime);

        return historyList.stream().map(this::convertToHistoryRateDTO).collect(Collectors.toList());
    }

    /** 将 RateHistory 转换为 LatestRateDTO */
    private LatestRateDTO convertToLatestRateDTO(RateHistory history) {
        LatestRateDTO dto = new LatestRateDTO();
        dto.setSymbol(history.getSymbol());
        dto.setRate(history.getRate());
        dto.setTimestamp(history.getTimestamp());

        LocalDateTime dateTime = LocalDateTime.ofInstant(
                Instant.ofEpochSecond(history.getTimestamp()),
                ZoneId.systemDefault());
        dto.setLastUpdate(dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        return dto;
    }

    /** 将 RateHistory 转换为 HistoryRateDTO */
    private HistoryRateDTO convertToHistoryRateDTO(RateHistory history) {
        HistoryRateDTO dto = new HistoryRateDTO();

        LocalDate date = Instant.ofEpochSecond(history.getTimestamp())
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        dto.setDate(date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        dto.setRate(history.getRate());

        return dto;
    }

    /** 将日期字符串转换为 Unix 时间戳（秒） */
    private Long parseDate(String dateStr) {
        LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return date.atStartOfDay(ZoneId.systemDefault()).toEpochSecond();
    }
}
