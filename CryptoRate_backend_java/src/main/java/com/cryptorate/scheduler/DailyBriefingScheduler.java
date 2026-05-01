package com.cryptorate.scheduler;

import com.cryptorate.entity.User;
import com.cryptorate.mapper.UserMapper;
import com.cryptorate.service.FeishuAlertService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * AI 每日简报定时推送任务
 * 
 * <p>每天早上 8:00 自动触发，搜集全网当日行情简报并通过飞书推送给订阅用户。</p>
 * 
 * @author CryptoRate Team
 * @since 2026-04-20
 */
@Slf4j
@Component
public class DailyBriefingScheduler {

    @Value("${scheduler.daily-briefing-enabled:false}")
    private boolean dailyBriefingEnabled;

    @Value("${cryptorate.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final UserMapper userMapper;
    private final FeishuAlertService feishuAlertService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    public DailyBriefingScheduler(UserMapper userMapper, FeishuAlertService feishuAlertService) {
        this.userMapper = userMapper;
        this.feishuAlertService = feishuAlertService;
    }

    /**
     * 触发每日简报推送
     * Cron: 每天早上 8:00:00
     */
    @Scheduled(cron = "${scheduler.daily-briefing-cron:0 0 8 * * ?}")
    public void executeDailyBriefing() {
        if (!dailyBriefingEnabled) {
            log.info("[每日简报] 任务已根据配置禁用");
            return;
        }

        log.info("[每日简报] {} 开始执行每日简报生成与推送任务...", LocalDateTime.now());

        try {
            // 1. 获取订阅了简报的用户列表
            List<User> subscribedUsers = userMapper.selectUsersWithDailyBriefingEnabled();
            if (subscribedUsers.isEmpty()) {
                log.info("[每日简报] 当前没有订阅用户，跳过执行");
                return;
            }

            // 2. 调用 Python AI 服务获取今日简报内容
            String briefContent = fetchDailyBriefContent();
            
            if (briefContent == null || briefContent.isEmpty()) {
                log.warn("[每日简报] 获取简报内容为空，任务取消");
                return;
            }

            // 3. 分发推送
            int successCount = 0;
            for (User user : subscribedUsers) {
                String webhook = user.getFeishuWebhook();
                if (webhook == null || webhook.isEmpty()) {
                    continue;
                }

                try {
                    // 调用已有的 FeishuAlertService 发送 Markdown 消息
                    feishuAlertService.sendMarketBriefing(webhook, briefContent);
                    successCount++;
                } catch (Exception e) {
                    log.error("[每日简报] 推送给用户 {} 失败: {}", user.getUsername(), e.getMessage());
                }
            }

            log.info("[每日简报] 任务完成。成功推送给 {}/{} 名用户", successCount, subscribedUsers.size());

        } catch (Exception e) {
            log.error("[每日简报] 任务执行中发生异常", e);
        }
    }

    private String fetchDailyBriefContent() {
        try {
            String url = aiServiceUrl + "/ai/daily_brief";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("content")) {
                return (String) response.get("content");
            }
        } catch (Exception e) {
            log.error("[每日简报] 调用 Python AI 服务失败: {}", e.getMessage());
        }
        return null;
    }
}
