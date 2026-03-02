package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.dto.HistoryRateDTO;
import com.cryptorate.dto.LatestRateDTO;
import com.cryptorate.service.RateService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 汇率数据采集与查询控制器
 * 
 * <p>提供汇率数据查询接口</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/rates")
public class RateController {

    private final RateService rateService;

    @Autowired
    public RateController(RateService rateService) {
        this.rateService = rateService;
    }

    /**
     * 获取系统支持的币种
     * 
     * <p>接口: GET /api/v1/rates/symbols</p>
     * 
     * @return 币种代码列表
     */
    @GetMapping("/symbols")
    public R<List<String>> getSymbols() {
        log.info("接收到获取币种列表请求");
        List<String> symbols = rateService.getSupportedSymbols();
        return R.ok(symbols);
    }

    /**
     * 搜索币种（按币种代码模糊匹配）
     * 
     * <p>接口: GET /api/v1/rates/search</p>
     * <p>可选参数: keyword（搜索关键词，为空时返回全部）</p>
     * 
     * @param keyword 搜索关键词（可选）
     * @return 匹配的币种代码列表
     */
    @GetMapping("/search")
    public R<List<String>> searchSymbols(@RequestParam(required = false) String keyword) {
        log.info("接收到搜索币种请求，关键词: {}", keyword);
        List<String> symbols = rateService.searchSymbols(keyword);
        return R.ok(symbols);
    }

    /**
     * 获取最新实时汇率
     * 
     * <p>接口: GET /api/v1/rates/latest</p>
     * <p>可选参数: symbol（筛选指定币种）</p>
     * 
     * @param symbol 币种代码（可选）
     * @return 最新汇率列表
     */
    @GetMapping("/latest")
    public R<List<LatestRateDTO>> getLatestRates(@RequestParam(required = false) String symbol) {
        log.info("接收到获取最新汇率请求，筛选币种: {}", symbol);
        List<LatestRateDTO> rates = rateService.getLatestRates(symbol);
        return R.ok(rates);
    }

    /**
     * 查询历史汇率（图表专用）
     * 
     * <p>接口: GET /api/v1/rates/history</p>
     * <p>必填参数: symbol（币种代码）、start（开始日期）、end（结束日期）</p>
     * 
     * @param symbol 币种代码
     * @param start  开始日期（格式：yyyy-MM-dd）
     * @param end    结束日期（格式：yyyy-MM-dd）
     * @return 历史汇率列表
     */
    @GetMapping("/history")
    public R<List<HistoryRateDTO>> getHistoryRates(
            @RequestParam String symbol,
            @RequestParam String start,
            @RequestParam String end) {
        log.info("接收到查询历史汇率请求，币种: {}, 时间范围: {} - {}", symbol, start, end);
        List<HistoryRateDTO> history = rateService.getHistoryRates(symbol, start, end);
        return R.ok(history);
    }
}
