package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.dto.StatsSummaryDTO;
import com.cryptorate.service.StatsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 数据统计分析控制器
 * 
 * <p>提供数据统计分析接口</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/stats")
public class StatsController {

    private final StatsService statsService;

    @Autowired
    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    /**
     * 获取汇率统计摘要
     * 
     * <p>接口: GET /api/v1/stats/summary/{symbol}</p>
     * <p>查询参数: range（时间范围：7d、30d，默认 7d）</p>
     * 
     * @param symbol 币种代码
     * @param range  时间范围（7d、30d）
     * @return 统计摘要
     */
    @GetMapping("/summary/{symbol}")
    public R<StatsSummaryDTO> getSummary(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "7d") String range) {
        log.info("接收到获取统计摘要请求，币种: {}, 范围: {}", symbol, range);
        StatsSummaryDTO summary = statsService.getSummary(symbol, range);
        return R.ok(summary);
    }
}
