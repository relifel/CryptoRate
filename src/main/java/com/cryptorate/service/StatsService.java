package com.cryptorate.service;

import com.cryptorate.dto.StatsSummaryDTO;
import com.cryptorate.entity.RateHistory;
import com.cryptorate.mapper.RateHistoryMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * 数据统计分析服务
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Slf4j
@Service
public class StatsService {

    private final RateHistoryMapper rateHistoryMapper;

    @Autowired
    public StatsService(RateHistoryMapper rateHistoryMapper) {
        this.rateHistoryMapper = rateHistoryMapper;
    }

    /**
     * 获取汇率统计摘要
     *
     * @param symbol 币种代码
     * @param range  时间范围（7d, 30d）
     * @return 统计摘要
     */
    public StatsSummaryDTO getSummary(String symbol, String range) {
        log.info("获取统计摘要，币种: {}, 范围: {}", symbol, range);

        // 计算时间范围
        long endTime = Instant.now().getEpochSecond();
        long startTime;
        
        if ("30d".equals(range)) {
            startTime = Instant.now().minus(30, ChronoUnit.DAYS)
                    .atZone(ZoneId.systemDefault())
                    .toEpochSecond();
        } else {
            // 默认 7 天
            startTime = Instant.now().minus(7, ChronoUnit.DAYS)
                    .atZone(ZoneId.systemDefault())
                    .toEpochSecond();
        }

        // 查询统计数据
        BigDecimal maxValue = rateHistoryMapper.selectMaxRate(symbol, startTime, endTime);
        BigDecimal minValue = rateHistoryMapper.selectMinRate(symbol, startTime, endTime);
        BigDecimal avgValue = rateHistoryMapper.selectAvgRate(symbol, startTime, endTime);

        // 获取最新价格和起始价格，计算涨跌
        List<RateHistory> historyList = rateHistoryMapper.selectBySymbolAndTimeRange(symbol, startTime, endTime);
        
        BigDecimal priceChange = BigDecimal.ZERO;
        String priceChangePercent = "0.0%";
        
        if (!historyList.isEmpty()) {
            BigDecimal firstPrice = historyList.get(0).getRate();
            BigDecimal lastPrice = historyList.get(historyList.size() - 1).getRate();
            
            priceChange = lastPrice.subtract(firstPrice);
            
            if (firstPrice.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percent = priceChange.divide(firstPrice, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                priceChangePercent = percent.setScale(1, RoundingMode.HALF_UP) + "%";
            }
        }

        // 构建响应
        StatsSummaryDTO dto = new StatsSummaryDTO();
        dto.setSymbol(symbol);
        dto.setMaxValue(maxValue != null ? maxValue : BigDecimal.ZERO);
        dto.setMinValue(minValue != null ? minValue : BigDecimal.ZERO);
        dto.setAvgValue(avgValue != null ? avgValue.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        dto.setPriceChange(priceChange.setScale(2, RoundingMode.HALF_UP));
        dto.setPriceChangePercent(priceChangePercent);

        return dto;
    }
}
