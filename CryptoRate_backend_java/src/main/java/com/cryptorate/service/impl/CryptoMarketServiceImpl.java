package com.cryptorate.service.impl;

import com.cryptorate.common.exception.ApiException;
import com.cryptorate.config.CoinlayerConfig;
import com.cryptorate.dto.CoinlayerResponse;
import com.cryptorate.entity.RateHistory;
import com.cryptorate.mapper.RateHistoryMapper;
import com.cryptorate.service.CryptoMarketService;
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
 * 加密货币市场数据业务实现类
 *
 * <p>
 * 实现 {@link CryptoMarketService} 接口，
 * 通过 OkHttp 调用 Coinlayer API 获取实时汇率并同步入库。
 * </p>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-03-07
 */
@Slf4j
@Service
public class CryptoMarketServiceImpl implements CryptoMarketService {

    private final OkHttpClient okHttpClient;
    private final ObjectMapper objectMapper;
    private final CoinlayerConfig coinlayerConfig;
    private final RateHistoryMapper rateHistoryMapper;

    @Autowired
    public CryptoMarketServiceImpl(OkHttpClient okHttpClient,
            ObjectMapper objectMapper,
            CoinlayerConfig coinlayerConfig,
            RateHistoryMapper rateHistoryMapper) {
        this.okHttpClient = okHttpClient;
        this.objectMapper = objectMapper;
        this.coinlayerConfig = coinlayerConfig;
        this.rateHistoryMapper = rateHistoryMapper;
    }

    @Override
    public Map<String, BigDecimal> getRealTimeRates() {
        log.info("开始获取 Coinlayer 实时汇率数据...");

        String url = String.format("%s/live?access_key=%s",
                coinlayerConfig.getBaseUrl(),
                coinlayerConfig.getAccessKey());

        log.debug("请求 URL: {}", url);

        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();

        try (Response response = okHttpClient.newCall(request).execute()) {

            if (!response.isSuccessful()) {
                int code = response.code();
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

            if (response.body() == null) {
                log.error("响应 Body 为空");
                throw new ApiException("API 响应内容为空");
            }

            String jsonBody = response.body().string();
            log.debug("响应 Body: {}", jsonBody);

            CoinlayerResponse coinlayerResponse = objectMapper.readValue(jsonBody, CoinlayerResponse.class);

            if (coinlayerResponse.getSuccess() == null || !coinlayerResponse.getSuccess()) {
                String errorMsg = "Coinlayer API 调用失败";
                if (coinlayerResponse.getError() != null) {
                    errorMsg = String.format("Coinlayer API 错误: [%d] %s",
                            coinlayerResponse.getError().getCode(),
                            coinlayerResponse.getError().getInfo());
                }
                log.error(errorMsg);
                throw new ApiException(errorMsg);
            }

            Map<String, BigDecimal> rates = coinlayerResponse.getRates();

            if (rates == null || rates.isEmpty()) {
                log.warn("汇率数据为空");
                throw new ApiException("汇率数据为空");
            }

            log.info("成功获取 {} 个加密货币的实时汇率", rates.size());
            return rates;

        } catch (IOException e) {
            log.error("调用 Coinlayer API 时发生异常: {}", e.getMessage(), e);
            throw new ApiException("调用 Coinlayer API 失败: " + e.getMessage(), e);
        }
    }

    @Override
    public BigDecimal getRateBySymbol(String symbol) {
        Map<String, BigDecimal> rates = getRealTimeRates();

        BigDecimal rate = rates.get(symbol.toUpperCase());
        if (rate == null) {
            throw new ApiException(String.format("未找到货币 %s 的汇率数据", symbol));
        }

        return rate;
    }

    @Override
    public int syncRatesToDatabase() {
        log.info("开始同步汇率数据到数据库...");

        try {
            Map<String, BigDecimal> rates = fetchRatesWithRetry();

            if (rates == null || rates.isEmpty()) {
                log.warn("未获取到任何汇率数据，同步取消");
                return 0;
            }

            long timestamp = System.currentTimeMillis() / 1000;
            LocalDateTime now = LocalDateTime.now();

            List<RateHistory> historyList = new ArrayList<>();
            for (Map.Entry<String, BigDecimal> entry : rates.entrySet()) {
                RateHistory history = new RateHistory();
                history.setSymbol(entry.getKey());
                history.setRate(entry.getValue());
                history.setTimestamp(timestamp);
                history.setCreatedAt(now);
                historyList.add(history);
            }

            if (!historyList.isEmpty()) {
                try {
                    int rows = rateHistoryMapper.batchInsert(historyList);
                    log.info("成功同步 {} 条汇率数据到数据库", rows);
                    return rows;
                } catch (Exception e) {
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
     * 带重试机制的获取汇率数据（首次失败后等待 2 秒重试一次）
     */
    private Map<String, BigDecimal> fetchRatesWithRetry() {
        try {
            return getRealTimeRates();
        } catch (ApiException e) {
            String msg = e.getMessage();
            // 如果是限流错误，不重试
            if (msg != null && (msg.contains("429") || msg.contains("rate_limit"))) {
                throw e;
            }

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
