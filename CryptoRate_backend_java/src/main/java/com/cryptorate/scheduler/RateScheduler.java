package com.cryptorate.scheduler;

import com.cryptorate.service.CryptoMarketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 汇率数据定时采集任务
 *
 * <p>定期调用 Coinlayer API，将最新汇率同步到数据库。</p>
 *
 * <h3>★ 修改采集频率 / 禁用定时任务</h3>
 * <p>打开 <b>src/main/resources/application.yml</b>，在 {@code scheduler} 节点下：</p>
 * <pre>
 * scheduler:
 *   enabled: true                    # ★ false = 完全禁用（遇到 429 时设为 false）
 *   initial-delay-ms: 30000          # 启动后延迟 30 秒执行第一次
 *   rate-sync-interval-ms: 86400000  # ★ 采集间隔，单位毫秒，86400000 = 24 小时
 * </pre>
 *
 * <h3>Coinlayer 免费版限额说明</h3>
 * <ul>
 *   <li>免费套餐：每月 100 次</li>
 *   <li>每 24 小时 ≈ 30 次/月  ✓ 推荐</li>
 *   <li>每  6 小时 ≈ 120 次/月 ✗ 超限</li>
 *   <li>每  1 小时 ≈ 720 次/月 ✗ 超限</li>
 * </ul>
 *
 * @author CryptoRate Team
 * @version 1.2
 * @since 2026-02-19
 */
@Slf4j
@Component
public class RateScheduler {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /** 是否启用定时同步，false 时跳过所有定时采集 */
    @Value("${scheduler.enabled:true}")
    private boolean schedulerEnabled;

    private final CryptoMarketService cryptoMarketService;

    @Autowired
    public RateScheduler(CryptoMarketService cryptoMarketService) {
        this.cryptoMarketService = cryptoMarketService;
    }

    /**
     * 定时同步汇率到数据库
     *
     * <p>采集间隔和启动延迟均从 application.yml 中读取：</p>
     * <ul>
     *   <li>{@code scheduler.enabled}：是否启用（false 可完全禁用，避免 429）</li>
     *   <li>{@code scheduler.initial-delay-ms}：启动后首次执行的延迟（毫秒）</li>
     *   <li>{@code scheduler.rate-sync-interval-ms}：每次执行的固定间隔（毫秒）</li>
     * </ul>
     *
     * <p>遇到 429（超出 API 限额）时，只打印警告日志，不重试，
     * 等待下一个周期再次尝试，避免频繁请求让限额雪上加霜。</p>
     */
    @Scheduled(
        initialDelayString  = "${scheduler.initial-delay-ms:30000}",
        fixedRateString     = "${scheduler.rate-sync-interval-ms:86400000}"
    )
    public void syncRatesPeriodically() {
        // 检查开关，禁用时直接跳过
        if (!schedulerEnabled) {
            log.debug("[定时任务] scheduler.enabled=false，本次定时同步已跳过");
            return;
        }

        String now = LocalDateTime.now().format(FORMATTER);
        log.info("[定时任务] {} 开始自动同步汇率数据...", now);

        try {
            int count = cryptoMarketService.syncRatesToDatabase();
            log.info("[定时任务] {} 自动同步完成，共写入 {} 条记录", now, count);

        } catch (Exception e) {
            String msg = e.getMessage() == null ? "" : e.getMessage();

            // 429：API 调用次数超限，只打印警告，不打印完整堆栈
            if (msg.contains("429") || msg.contains("rate_limit")) {
                log.warn("[定时任务] {} Coinlayer API 调用次数已超出免费限额（HTTP 429）。" +
                         "请在 application.yml 中将 scheduler.enabled 设为 false 暂停同步，" +
                         "等额度重置后再改回 true。", now);
            } else if (msg.contains("API") || msg.contains("连接")) {
                log.warn("[定时任务] {} API 调用失败: {}。将在下次定时任务时重试。", now, msg);
            } else {
                log.error("[定时任务] {} 自动同步失败：{}", now, msg, e);
            }
            // 不向上抛出，保证定时器在下一个周期继续执行
        }
    }
}
