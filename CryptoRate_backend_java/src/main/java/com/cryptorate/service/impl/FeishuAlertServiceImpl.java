package com.cryptorate.service.impl;

import com.cryptorate.dto.AiAlertRequest;
import com.cryptorate.service.FeishuAlertService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 智能飞书告警服务实现类 (Agentic MCP 版)
 *
 * <p>
 * 彻底抛弃硬编码模板。
 * 该实现将行情异动数据转发给 Python AI Agent，
 * 由 Agent 联通 feishu_mcp_server (@Chenzhi-Ana) 进行市场解读并播报。
 * </p>
 */
@Slf4j
@Service
public class FeishuAlertServiceImpl implements FeishuAlertService {

    /** Python AI 告警分析接口地址 */
    private static final String AI_ALERT_URL = "http://127.0.0.1:8000/ai/alert";

    private final RestTemplate restTemplate;

    @Autowired
    public FeishuAlertServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * 发送智能价格告警
     * 
     * @param coinSymbol   币种
     * @param currentPrice 当前价
     * @param triggerPrice 触发价
     * @param trend        趋势 (up/down)
     * @param reason       异动深度原因 (情报描述)
     * @param webhookUrl   用户特定 Webhook 地址 (可选)
     */
    @Override
    public void sendPriceAlert(String coinSymbol, BigDecimal currentPrice, BigDecimal triggerPrice, String trend, String reason, String webhookUrl) {
        log.info("[System] 检测到行情异动，正在启动 AI 智能告警流程: {}, Webhook: {}", coinSymbol, webhookUrl != null ? "User-Specific" : "Default");

        try {
            // 1. 计算波动百分比
            BigDecimal change = currentPrice.subtract(triggerPrice)
                    .divide(triggerPrice, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));

            // 2. 构造 AI 请求
            AiAlertRequest alertRequest = AiAlertRequest.builder()
                    .symbol(coinSymbol)
                    .price(currentPrice)
                    .change(change)
                    .reason(reason) 
                    .webhookUrl(webhookUrl) // 填充 Webhook
                    .build();

            // 3. 构造 Http Header
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<AiAlertRequest> entity = new HttpEntity<>(alertRequest, headers);

            // 4. 调用 Python AI Alert 接口 (触发 Agent + MCP 流程)
            log.info("[Agent] 正在请求 AI Agent 生成异动播报并发送到指定飞书 Webhook...");
            restTemplate.postForEntity(AI_ALERT_URL, entity, String.class);
            
            log.info("[System] AI 智能告警指令下达成功。");

        } catch (Exception e) {
            log.error("[System] AI 智能告警系统故障: {}", e.getMessage());
        }
    }

    /**
     * 发送市场每日简报
     *
     * @param webhookUrl 目标飞书 Webhook 地址
     * @param content    简报 Markdown 内容
     */
    @Override
    public void sendMarketBriefing(String webhookUrl, String content) {
        if (webhookUrl == null || webhookUrl.isEmpty()) {
            log.warn("[Feishu] Webhook URL 为空，无法发送简报");
            return;
        }

        try {
            // 构造飞书 Markdown 消息格式
            // 格式参考: https://open.feishu.cn/document/common-capabilities/dispatch-messages-and-groups/message-types/content-types/post
            Map<String, Object> body = Map.of(
                "msg_type", "interactive",
                "card", Map.of(
                    "header", Map.of(
                        "title", Map.of("tag", "plain_text", "content", "📊 CryptoRate AI 市场每日简报"),
                        "template", "blue"
                    ),
                    "elements", List.of(
                        Map.of(
                            "tag", "markdown",
                            "content", content
                        ),
                        Map.of(
                            "tag", "note",
                            "elements", List.of(Map.of("tag", "plain_text", "content", "生成时间: " + LocalDateTime.now()))
                        )
                    )
                )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            restTemplate.postForLocation(webhookUrl, entity);
            log.info("[Feishu] 每日简报已成功发送至 Webhook");

        } catch (Exception e) {
            log.error("[Feishu] 发送每日简报失败: {}", e.getMessage());
        }
    }
}
