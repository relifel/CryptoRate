package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.dto.AnalysisReportDTO;
import com.cryptorate.service.AnalysisService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 智能辅助功能控制器
 * 
 * <p>提供智能分析接口</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/analysis")
public class AnalysisController {

    private final AnalysisService analysisService;

    @Autowired
    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    /**
     * 生成行情解读
     * 
     * <p>接口: GET /api/v1/analysis/explain/{symbol}</p>
     * 
     * @param symbol 币种代码
     * @return 行情解读报告
     */
    @GetMapping("/explain/{symbol}")
    public R<AnalysisReportDTO> explainMarket(@PathVariable String symbol) {
        log.info("接收到生成行情解读请求，币种: {}", symbol);
        AnalysisReportDTO report = analysisService.generateReport(symbol);
        return R.ok(report);
    }
}
