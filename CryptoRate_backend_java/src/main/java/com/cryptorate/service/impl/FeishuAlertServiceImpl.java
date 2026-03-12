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
     * @param triggerPrice 触发价 (此处作为参考传入 Agent)
     * @param trend        趋势 (up/down)
     */
    @Override
    public void sendPriceAlert(String coinSymbol, BigDecimal currentPrice, BigDecimal triggerPrice, String trend) {
        log.info("[System] 检测到行情异动，正在启动 AI 智能告警流程: {}", coinSymbol);

        try {
            // 1. 计算波动百分比 (简单演示：(当前-触发)/触发)
            BigDecimal change = currentPrice.subtract(triggerPrice)
                    .divide(triggerPrice, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));

            // 2. 构造 AI 请求
            AiAlertRequest alertRequest = AiAlertRequest.builder()
                    .symbol(coinSymbol)
                    .price(currentPrice)
                    .change(change)
                    .build();

            // 3. 构造 Http Header
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<AiAlertRequest> entity = new HttpEntity<>(alertRequest, headers);

            // 4. 调用 Python AI Alert 接口 (触发 Agent + MCP 流程)
            log.info("[Agent] 正在请求 AI Agent 生成异动播报并调用 MCP 发送飞书...");
            restTemplate.postForEntity(AI_ALERT_URL, entity, String.class);
            
            log.info("[System] AI 智能告警指令下达成功。");

        } catch (Exception e) {
            // 确保告警系统的故障不会影响主交易数据采集
            log.error("[System] AI 智能告警系统故障: {}", e.getMessage());
        }
    }
}
