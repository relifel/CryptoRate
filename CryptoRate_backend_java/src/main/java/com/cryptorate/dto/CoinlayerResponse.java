package com.cryptorate.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Coinlayer API 响应数据传输对象
 * 
 * <p>映射 Coinlayer API 的 JSON 响应结构</p>
 * 
 * <h3>API 响应示例：</h3>
 * <pre>
 * {
 *   "success": true,
 *   "timestamp": 1705924800,
 *   "target": "USD",
 *   "rates": {
 *     "BTC": 42350.50,
 *     "ETH": 2250.75,
 *     "USDT": 1.00
 *   }
 * }
 * </pre>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)  // 忽略未知字段，提高兼容性
public class CoinlayerResponse {

    /**
     * 请求是否成功
     * 
     * <p>true 表示成功，false 表示失败（通常伴随 error 字段）</p>
     */
    @JsonProperty("success")
    private Boolean success;

    /**
     * 响应时间戳（Unix 时间戳，秒）
     */
    @JsonProperty("timestamp")
    private Long timestamp;

    /**
     * 目标货币（汇率的基准货币）
     * 
     * <p>默认为 "USD"（美元）</p>
     */
    @JsonProperty("target")
    private String target;

    /**
     * 加密货币汇率映射
     * 
     * <p>键：加密货币代码（如 BTC、ETH）</p>
     * <p>值：相对于目标货币的汇率（如 1 BTC = 42350.50 USD）</p>
     */
    @JsonProperty("rates")
    private Map<String, BigDecimal> rates;

    /**
     * 错误信息（当 success=false 时存在）
     */
    @JsonProperty("error")
    private ErrorInfo error;

    /**
     * 错误信息内部类
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ErrorInfo {
        /**
         * 错误码
         */
        @JsonProperty("code")
        private Integer code;

        /**
         * 错误描述
         */
        @JsonProperty("info")
        private String info;
    }
}
