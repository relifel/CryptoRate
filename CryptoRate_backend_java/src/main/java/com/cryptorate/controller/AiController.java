package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.dto.AiAskRequest;
import com.cryptorate.dto.AiAskResponse;
import com.cryptorate.service.AiService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * AI 智能问答控制器
 *
 * <p>
 * 对外暴露 {@code POST /api/ai/chat} 接口，供前端直接调用。
 * </p>
 *
 * <p>
 * 接口描述：
 * <ul>
 * <li>接收前端传来的用户问题</li>
 * <li>通过 {@link AiService} 转发至 Python AI 微服务</li>
 * <li>将大模型的回答包装成统一的 {@link R} 格式返回给前端</li>
 * </ul>
 * </p>
 *
 * <h3>示例请求（POST /api/ai/chat）：</h3>
 * 
 * <pre>
 * {
 *   "question": "目前比特币的最新市场趋势是什么？"
 * }
 * </pre>
 *
 * <h3>示例响应：</h3>
 * 
 * <pre>
 * {
 *   "code": 200,
 *   "msg": "success",
 *   "data": "根据最新数据，比特币近期呈现出显著的上涨趋势...",
 *   "timestamp": 1709436000000
 * }
 * </pre>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-03-03
 */
@Slf4j
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    @Autowired
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    /**
     * AI 智能问答接口
     *
     * <p>
     * 接口路径：{@code POST /api/ai/chat}
     * </p>
     * <p>
     * 需要 JWT 认证（由拦截器统一验证）。
     * </p>
     *
     * @param request 包含用户问题的请求 DTO，{@code @Valid} 触发非空校验
     * @return 统一响应对象，data 字段为大模型生成的回答字符串
     */
    @PostMapping("/chat")
    public R<String> chat(@Valid @RequestBody AiAskRequest request) {
        log.info("[AI Controller] 收到问答请求，问题: {}", request.getQuestion());

        // 调用服务层，向 Python AI 微服务发起请求
        AiAskResponse aiResponse = aiService.ask(request.getQuestion());

        // Python 服务返回非 200 状态码，视为调用失败
        if (aiResponse == null || aiResponse.getCode() == null || aiResponse.getCode() != 200) {
            String errorMsg = aiResponse != null ? aiResponse.getAnswer() : "AI 服务无响应";
            log.warn("[AI Controller] AI 服务返回异常，错误信息: {}", errorMsg);
            return R.error(errorMsg);
        }

        log.info("[AI Controller] 问答成功，回答长度: {} 字", aiResponse.getAnswer().length());
        return R.ok(aiResponse.getAnswer());
    }
}
