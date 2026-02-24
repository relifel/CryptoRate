package com.cryptorate.service;

import com.cryptorate.common.exception.ApiException;
import com.cryptorate.config.CoinlayerConfig;
import com.cryptorate.dto.CoinlayerResponse;
import com.cryptorate.entity.RateHistory;
import com.cryptorate.mapper.RateHistoryMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 加密货币市场数据服务
 * 
 * <p>通过 OkHttp 调用 Coinlayer API，获取实时加密货币汇率</p>
 * 
 * <h3>核心功能：</h3>
 * <ul>
 *   <li>获取所有加密货币的实时汇率（相对于美元）</li>
 *   <li>使用 OkHttp 4 发起同步 HTTP 请求</li>
 *   <li>使用 Jackson 解析 JSON 响应</li>
 *   <li>完善的异常处理和资源管理</li>
 * </ul>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
 */
@Slf4j
@Service
public class CryptoMarketService {

    /**
     * OkHttp 客户端（由配置类注入）
     */
    private final OkHttpClient okHttpClient;

    /**
     * Jackson JSON 处理器（Spring Boot 自动配置）
     */
    private final ObjectMapper objectMapper;

    /**
     * Coinlayer API 配置
     */
    private final CoinlayerConfig coinlayerConfig;

    /**
     * 汇率历史数据访问接口
     */
    private final RateHistoryMapper rateHistoryMapper;

    /**
     * 构造方法注入依赖
     * 
     * @param okHttpClient       OkHttp 客户端
     * @param objectMapper       JSON 处理器
     * @param coinlayerConfig    Coinlayer 配置
     * @param rateHistoryMapper  汇率历史 Mapper
     */
    @Autowired
    public CryptoMarketService(OkHttpClient okHttpClient, 
                               ObjectMapper objectMapper,
                               CoinlayerConfig coinlayerConfig,
                               RateHistoryMapper rateHistoryMapper) {
        this.okHttpClient = okHttpClient;
        this.objectMapper = objectMapper;
        this.coinlayerConfig = coinlayerConfig;
        this.rateHistoryMapper = rateHistoryMapper;
    }

    /**
     * 获取实时加密货币汇率
     * 
     * <p>调用 Coinlayer API 的 /live 端点，返回所有加密货币相对于美元的汇率</p>
     * 
     * <h4>使用示例：</h4>
     * <pre>
     * {@code
     * Map<String, BigDecimal> rates = cryptoMarketService.getRealTimeRates();
     * BigDecimal btcPrice = rates.get("BTC");  // 获取 BTC 价格
     * System.out.println("BTC 当前价格: $" + btcPrice);
     * }
     * </pre>
     * 
     * <h4>核心步骤：</h4>
     * <ol>
     *   <li>构建带有 API Key 的请求 URL</li>
     *   <li>创建 OkHttp Request 对象</li>
     *   <li>使用 try-with-resources 执行请求并自动关闭 Response</li>
     *   <li>检查 HTTP 状态码</li>
     *   <li>读取响应 Body 并反序列化为 DTO</li>
     *   <li>验证业务成功标识</li>
     *   <li>返回汇率数据</li>
     * </ol>
     * 
     * @return 加密货币汇率映射（键：货币代码，值：汇率）
     * @throws ApiException 当 API 调用失败时抛出
     */
    public Map<String, BigDecimal> getRealTimeRates() {
        log.info("开始获取 Coinlayer 实时汇率数据...");

        // ============================
        // 步骤 1: 构建请求 URL
        // ============================
        // 拼接 API 端点和访问密钥
        // 格式: http://api.coinlayer.com/live?access_key=YOUR_KEY
        String url = String.format("%s/live?access_key=%s", 
                coinlayerConfig.getBaseUrl(), 
                coinlayerConfig.getAccessKey());
        
        log.debug("请求 URL: {}", url);

        // ============================
        // 步骤 2: 创建 OkHttp Request 对象
        // ============================
        Request request = new Request.Builder()
                .url(url)  // 设置请求 URL
                .get()     // 使用 GET 方法
                .build();  // 构建 Request 对象

        // ============================
        // 步骤 3: 执行 HTTP 请求
        // ============================
        // 【重要】使用 try-with-resources 确保 Response 自动关闭
        // Response 实现了 Closeable 接口，必须在使用后关闭，否则会导致连接泄漏
        try (Response response = okHttpClient.newCall(request).execute()) {
            
            // ============================
            // 步骤 4: 检查 HTTP 状态码
            // ============================
            // isSuccessful() 检查状态码是否在 200-299 范围内
            if (!response.isSuccessful()) {
                int code = response.code();
                // 429：调用次数超出 API 免费限额，给出专属提示
                if (code == 429) {
                    String errorMsg = "Coinlayer API 调用次数已超出免费限额（HTTP 429 Too Many Requests）。" +
                            "免费套餐每月仅有 100 次调用，请在 application.yml 中" +
                            "将 scheduler.rate-sync-interval-ms 设置为 86400000（24 小时）或更大值，" +
                            "或登录 https://coinlayer.com 升级套餐。";
                    log.warn(errorMsg);
                    throw new ApiException(code, errorMsg);
                }
                String errorMsg = String.format("HTTP 请求失败，状态码: %d", code);
                log.error(errorMsg);
                throw new ApiException(code, errorMsg);
            }

            // ============================
            // 步骤 5: 读取响应 Body
            // ============================
            // 【注意】response.body() 可能为 null，需要进行空指针检查
            if (response.body() == null) {
                log.error("响应 Body 为空");
                throw new ApiException("API 响应内容为空");
            }

            // 将响应体转换为字符串
            String jsonBody = response.body().string();
            log.debug("响应 Body: {}", jsonBody);

            // ============================
            // 步骤 6: 反序列化 JSON
            // ============================
            // 使用 Jackson ObjectMapper 将 JSON 字符串转换为 Java 对象
            CoinlayerResponse coinlayerResponse = objectMapper.readValue(
                    jsonBody, 
                    CoinlayerResponse.class
            );

            // ============================
            // 步骤 7: 验证业务成功标识
            // ============================
            // Coinlayer API 在 JSON 中有一个 success 字段，表示业务逻辑是否成功
            // 即使 HTTP 状态码是 200，业务逻辑也可能失败（如 API Key 无效）
            if (coinlayerResponse.getSuccess() == null || !coinlayerResponse.getSuccess()) {
                // 提取错误信息
                String errorMsg = "Coinlayer API 调用失败";
                if (coinlayerResponse.getError() != null) {
                    errorMsg = String.format("Coinlayer API 错误: [%d] %s",
                            coinlayerResponse.getError().getCode(),
                            coinlayerResponse.getError().getInfo());
                }
                log.error(errorMsg);
                throw new ApiException(errorMsg);
            }

            // ============================
            // 步骤 8: 提取汇率数据
            // ============================
            Map<String, BigDecimal> rates = coinlayerResponse.getRates();
            
            // 空指针检查
            if (rates == null || rates.isEmpty()) {
                log.warn("汇率数据为空");
                throw new ApiException("汇率数据为空");
            }

            log.info("成功获取 {} 个加密货币的实时汇率", rates.size());
            return rates;

        } catch (IOException e) {
            // ============================
            // 异常处理: 网络异常或 JSON 解析异常
            // ============================
            // IOException 包括：
            // 1. 网络连接失败
            // 2. 超时异常
            // 3. JSON 解析失败（Jackson 会抛出 JsonProcessingException，它是 IOException 的子类）
            log.error("调用 Coinlayer API 时发生异常: {}", e.getMessage(), e);
            throw new ApiException("调用 Coinlayer API 失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取指定加密货币的实时汇率
     * 
     * <p>从所有汇率中提取指定货币的价格</p>
     * 
     * @param symbol 加密货币代码（如 BTC、ETH）
     * @return 该货币的汇率
     * @throws ApiException 当货币不存在时抛出
     */
    public BigDecimal getRateBySymbol(String symbol) {
        Map<String, BigDecimal> rates = getRealTimeRates();
        
        BigDecimal rate = rates.get(symbol.toUpperCase());
        if (rate == null) {
            throw new ApiException(String.format("未找到货币 %s 的汇率数据", symbol));
        }
        
        return rate;
    }

    /**
     * 同步汇率数据到数据库
     *
     * <p>从 Coinlayer API 获取最新汇率并保存到数据库</p>
     *
     * @return 同步的记录数
     */
    public int syncRatesToDatabase() {
        log.info("开始同步汇率数据到数据库...");

        try {
            // 获取最新汇率（带重试机制）
            Map<String, BigDecimal> rates = fetchRatesWithRetry();

            if (rates == null || rates.isEmpty()) {
                log.warn("未获取到任何汇率数据，同步取消");
                return 0;
            }

            // 当前时间戳
            long timestamp = System.currentTimeMillis() / 1000;
            LocalDateTime now = LocalDateTime.now();

            // 转换为 RateHistory 对象列表
            List<RateHistory> historyList = new ArrayList<>();
            for (Map.Entry<String, BigDecimal> entry : rates.entrySet()) {
                RateHistory history = new RateHistory();
                history.setSymbol(entry.getKey());
                history.setRate(entry.getValue());
                history.setTimestamp(timestamp);
                history.setCreatedAt(now);
                historyList.add(history);
            }

            // 批量插入数据库
            if (!historyList.isEmpty()) {
                try {
                    int rows = rateHistoryMapper.batchInsert(historyList);
                    log.info("成功同步 {} 条汇率数据到数据库", rows);
                    return rows;
                } catch (Exception e) {
                    // 数据库异常（如表不存在）
                    log.error("批量插入汇率数据失败: {}. 请确保数据库表已创建。", e.getMessage());
                    throw new ApiException("数据库写入失败: " + e.getMessage(), e);
                }
            }

            return 0;
        } catch (Exception e) {
            log.error("同步汇率数据失败: {}", e.getMessage(), e);
            throw new ApiException("同步汇率数据失败: " + e.getMessage(), e);
        }
    }

    /**
     * 带重试机制的获取汇率数据
     * 首次失败后等待 2 秒重试一次
     *
     * @return 汇率数据 map
     */
    private Map<String, BigDecimal> fetchRatesWithRetry() {
        try {
            return getRealTimeRates();
        } catch (ApiException e) {
            String msg = e.getMessage();
            // 如果是限流错误，不重试，等待下次定时任务
            if (msg != null && (msg.contains("429") || msg.contains("rate_limit"))) {
                throw e;
            }

            // 其他错误，重试一次
            log.warn("首次获取汇率失败，2秒后重试... 错误: {}", msg);
            try {
                Thread.sleep(2000);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
            return getRealTimeRates();
        }
    }
}
