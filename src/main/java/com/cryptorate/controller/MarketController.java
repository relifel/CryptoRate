package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.service.CryptoMarketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 加密货币市场数据控制器
 * 
 * <p>提供加密货币实时汇率查询接口</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
 */
@Slf4j
@RestController
@RequestMapping("/market")
public class MarketController {

    private final CryptoMarketService cryptoMarketService;

    @Autowired
    public MarketController(CryptoMarketService cryptoMarketService) {
        this.cryptoMarketService = cryptoMarketService;
    }

    /**
     * 获取所有加密货币的实时汇率
     * 
     * <p>调用 Coinlayer API，返回所有加密货币相对于美元的汇率</p>
     * 
     * <h4>请求示例：</h4>
     * <pre>
     * GET http://localhost:8080/market/rates
     * </pre>
     * 
     * <h4>响应示例：</h4>
     * <pre>
     * {
     *   "code": 200,
     *   "msg": "success",
     *   "data": {
     *     "BTC": 42350.50,
     *     "ETH": 2250.75,
     *     "USDT": 1.00
     *   },
     *   "timestamp": 1705924800000
     * }
     * </pre>
     * 
     * @return 统一响应格式，包含汇率数据
     */
    @GetMapping("/rates")
    public R<Map<String, BigDecimal>> getRealTimeRates() {
        log.info("接收到获取实时汇率请求");
        
        // 调用 Service 层获取数据
        Map<String, BigDecimal> rates = cryptoMarketService.getRealTimeRates();
        
        log.info("成功返回 {} 个加密货币的汇率数据", rates.size());
        return R.ok(rates);
    }

    /**
     * 获取指定加密货币的实时汇率
     * 
     * <p>根据货币代码查询单个加密货币的汇率</p>
     * 
     * <h4>请求示例：</h4>
     * <pre>
     * GET http://localhost:8080/market/rate/BTC
     * </pre>
     * 
     * <h4>响应示例：</h4>
     * <pre>
     * {
     *   "code": 200,
     *   "msg": "success",
     *   "data": 42350.50,
     *   "timestamp": 1705924800000
     * }
     * </pre>
     * 
     * @param symbol 加密货币代码（如 BTC、ETH）
     * @return 统一响应格式，包含该货币的汇率
     */
    @GetMapping("/rate/{symbol}")
    public R<BigDecimal> getRateBySymbol(@PathVariable String symbol) {
        log.info("接收到获取 {} 汇率请求", symbol);
        
        BigDecimal rate = cryptoMarketService.getRateBySymbol(symbol);
        
        log.info("成功返回 {} 的汇率: {}", symbol, rate);
        return R.ok(rate);
    }
}
