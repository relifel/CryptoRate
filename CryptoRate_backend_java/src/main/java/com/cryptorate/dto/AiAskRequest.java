package com.cryptorate.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

/**
 * AI 问答请求 DTO（Data Transfer Object）
 *
 * <p>
 * 用于接收前端通过 {@code POST /api/ai/chat} 传来的问题，
 * 以及向 Python AI 服务转发请求时的请求体格式。
 * </p>
 *
 * <p>
 * Python AI 服务 {@code POST /ai/ask} 接口规范：
 * 
 * <pre>
 * {
 *   "question": "目前比特币的最新市场趋势是什么？"
 * }
 * </pre>
 * </p>
 *
 * @author CryptoRate Team
 * @since 2026-03-03
 */
@Data
public class AiAskRequest {

    /**
     * 用户提出的问题，不能为空
     */
    @NotBlank(message = "问题不能为空")
    private String question;
}
