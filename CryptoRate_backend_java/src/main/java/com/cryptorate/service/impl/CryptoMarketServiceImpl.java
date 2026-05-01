package com.cryptorate.service.impl;

import com.cryptorate.common.exception.ApiException;
import com.cryptorate.config.CoinlayerConfig;
import com.cryptorate.dto.CoinlayerResponse;
import com.cryptorate.entity.RateHistory;
import com.cryptorate.entity.User;
import com.cryptorate.mapper.RateHistoryMapper;
import com.cryptorate.mapper.UserFavoriteMapper;
import com.cryptorate.mapper.UserMapper;
import com.cryptorate.service.CryptoMarketService;
import com.cryptorate.service.FeishuAlertService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final UserMapper userMapper;
    private final UserFavoriteMapper userFavoriteMapper;
    private final FeishuAlertService feishuAlertService;

    @Autowired
    public CryptoMarketServiceImpl(OkHttpClient okHttpClient,
            ObjectMapper objectMapper,
            CoinlayerConfig coinlayerConfig,
            RateHistoryMapper rateHistoryMapper,
            UserMapper userMapper,
            UserFavoriteMapper userFavoriteMapper,
            @Lazy FeishuAlertService feishuAlertService) {
        this.okHttpClient = okHttpClient;
        this.objectMapper = objectMapper;
        this.coinlayerConfig = coinlayerConfig;
        this.rateHistoryMapper = rateHistoryMapper;
        this.userMapper = userMapper;
        this.userFavoriteMapper = userFavoriteMapper;
        this.feishuAlertService = feishuAlertService;
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
                    
                    // 触发异动预警检查
                    checkMarketFluctuations(rates);
                    
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
     * 检查行情异动并发送告警
     *
     * @param currentRates 当前最新的汇率数据
     */
    private void checkMarketFluctuations(Map<String, BigDecimal> currentRates) {
        log.info("开始执行行情异动预警检查...");

        // 1. 获取所有开启了飞书预警的活跃用户
        List<User> alertUsers = userMapper.selectUsersWithFeishuAlertEnabled();
        if (alertUsers == null || alertUsers.isEmpty()) {
            log.debug("当前没有用户开启飞书预警，跳过检查");
            return;
        }

        for (User user : alertUsers) {
            // 2. 获取该用户的自选币种
            List<String> userSymbols = userFavoriteMapper.selectSymbolsByUserId(user.getId());
            if (userSymbols == null || userSymbols.isEmpty()) {
                continue;
            }

            for (String symbol : userSymbols) {
                BigDecimal currentPrice = currentRates.get(symbol);
                if (currentPrice == null) continue;

                // 3. 获取该币种在数据库中的上一条记录（由于当前数据刚插入，最新一条是 currentPrice，所以找倒数第二条）
                // 为了简化，我们直接取数据库中最近的一条记录（它是 currentPrice 插入之前的最后一条）
                RateHistory lastHistory = rateHistoryMapper.selectLatestBySymbol(symbol);
                if (lastHistory == null || lastHistory.getRate() == null) continue;

                BigDecimal lastPrice = lastHistory.getRate();
                
                // 4. 计算波动幅度 ( (current - last) / last )
                // 如果 lastPrice 为 0 则跳过防止除以 0
                if (lastPrice.compareTo(BigDecimal.ZERO) == 0) continue;

                BigDecimal diff = currentPrice.subtract(lastPrice);
                BigDecimal changeRate = diff.divide(lastPrice, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));

                // 5. 判定阈值（绝对值是否 >= 5%）
                if (changeRate.abs().compareTo(new BigDecimal("5")) >= 0) {
                    String trend = changeRate.signum() >= 0 ? "up" : "down";
                    String reason = String.format("行情剧烈波动：较上一次采样价格 (%s) %s 了 %s%%",
                            lastPrice.toPlainString(),
                            trend.equals("up") ? "上涨" : "下跌",
                            changeRate.abs().setScale(2, RoundingMode.HALF_UP).toPlainString());

                    log.info("检测到异动！用户: {}, 币种: {}, 涨跌幅: {}%", user.getUsername(), symbol, changeRate);
                    feishuAlertService.sendPriceAlert(symbol, currentPrice, lastPrice, trend, reason, user.getFeishuWebhook());
                }
            }
        }
    }

    @Override
    public int syncHistoricalRates(List<String> symbols, int days) {
        log.info("开始执行历史数据智能采样同步，币种: {}, 回溯天数: {}", symbols, days);
        int totalRows = 0;
        java.time.LocalDate today = java.time.LocalDate.now();
        
        // 智能采样策略：
        // 1. 最近 7 天：每天一个点
        // 2. 1个月内：每 2 天一个点
        // 3. 3个月内：每 7 天一个点
        // 4. 1年内：每 30 天一个点
        List<java.time.LocalDate> targetDates = new ArrayList<>();
        for (int i = 0; i <= days; i++) {
            if (i <= 7 || (i <= 30 && i % 2 == 0) || (i <= 90 && i % 7 == 0) || (i % 30 == 0)) {
                targetDates.add(today.minusDays(i));
            }
        }

        log.info("计算得出共需同步 {} 个日期的采样数据", targetDates.size());

        for (java.time.LocalDate date : targetDates) {
            String dateStr = date.toString();
            String url = String.format("%s/%s?access_key=%s&symbols=%s",
                    coinlayerConfig.getBaseUrl(),
                    dateStr,
                    coinlayerConfig.getAccessKey(),
                    String.join(",", symbols));

            Request request = new Request.Builder().url(url).get().build();
            try (Response response = okHttpClient.newCall(request).execute()) {
                if (response.isSuccessful() && response.body() != null) {
                    CoinlayerResponse res = objectMapper.readValue(response.body().string(), CoinlayerResponse.class);
                    if (res != null && res.getSuccess() && res.getRates() != null) {
                        List<RateHistory> batch = new ArrayList<>();
                        long timestamp = res.getTimestamp() != null ? res.getTimestamp() : 
                                       date.atStartOfDay(java.time.ZoneId.systemDefault()).toEpochSecond();
                        
                        for (Map.Entry<String, BigDecimal> entry : res.getRates().entrySet()) {
                            RateHistory rh = new RateHistory();
                            rh.setSymbol(entry.getKey());
                            rh.setRate(entry.getValue());
                            rh.setTimestamp(timestamp);
                            rh.setCreatedAt(LocalDateTime.now());
                            batch.add(rh);
                        }
                        if (!batch.isEmpty()) {
                            totalRows += rateHistoryMapper.batchInsert(batch);
                        }
                    }
                }
                // 频率限制保护
                Thread.sleep(300); 
            } catch (Exception e) {
                log.error("同步日期 {} 数据失败: {}", dateStr, e.getMessage());
            }
        }
        log.info("同步完成，共计入库 {} 条记录", totalRows);
        return totalRows;
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
