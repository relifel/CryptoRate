package com.cryptorate.service;

import com.cryptorate.dto.AnalysisReportDTO;
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
 * 智能分析服务
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Slf4j
@Service
public class AnalysisService {

    private final RateHistoryMapper rateHistoryMapper;

    @Autowired
    public AnalysisService(RateHistoryMapper rateHistoryMapper) {
        this.rateHistoryMapper = rateHistoryMapper;
    }

    /**
     * 生成行情解读
     *
     * @param symbol 币种代码
     * @return 解读报告
     */
    public AnalysisReportDTO generateReport(String symbol) {
        log.info("生成行情解读，币种: {}", symbol);

        // 获取最近 24 小时的数据
        long endTime = Instant.now().getEpochSecond();
        long startTime = Instant.now().minus(24, ChronoUnit.HOURS)
                .atZone(ZoneId.systemDefault())
                .toEpochSecond();

        List<RateHistory> historyList = rateHistoryMapper.selectBySymbolAndTimeRange(symbol, startTime, endTime);

        if (historyList.isEmpty()) {
            AnalysisReportDTO dto = new AnalysisReportDTO();
            dto.setSymbol(symbol);
            dto.setReport(String.format("%s 暂无最近 24 小时的数据。", symbol));
            return dto;
        }

        // 计算统计数据
        BigDecimal maxPrice = rateHistoryMapper.selectMaxRate(symbol, startTime, endTime);
        BigDecimal minPrice = rateHistoryMapper.selectMinRate(symbol, startTime, endTime);
        
        BigDecimal firstPrice = historyList.get(0).getRate();
        BigDecimal lastPrice = historyList.get(historyList.size() - 1).getRate();
        BigDecimal priceChange = lastPrice.subtract(firstPrice);
        
        BigDecimal changePercent = BigDecimal.ZERO;
        if (firstPrice.compareTo(BigDecimal.ZERO) > 0) {
            changePercent = priceChange.divide(firstPrice, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // 生成报告文本
        String trend = changePercent.compareTo(BigDecimal.ZERO) > 0 ? "上涨" : 
                      (changePercent.compareTo(BigDecimal.ZERO) < 0 ? "下跌" : "平稳");
        
        String report = String.format(
                "%s 在过去 24 小时内价格表现%s。最高价格为 $%,.2f，最低为 $%,.2f。" +
                "整体呈现%s趋势，涨跌幅为 %s%%。",
                symbol,
                changePercent.abs().compareTo(BigDecimal.valueOf(1)) < 0 ? "平稳" : "波动较大",
                maxPrice,
                minPrice,
                changePercent.abs().compareTo(BigDecimal.valueOf(0.1)) < 0 ? "平稳" : (trend + "小幅"),
                changePercent.setScale(1, RoundingMode.HALF_UP)
        );

        AnalysisReportDTO dto = new AnalysisReportDTO();
        dto.setSymbol(symbol);
        dto.setReport(report);

        return dto;
    }
}
