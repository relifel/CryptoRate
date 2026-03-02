package com.cryptorate.dto;

import lombok.Data;

/**
 * AI 问答响应 DTO
 *
 * <p>
 * 对应 Python AI 服务 {@code POST /ai/ask} 的响应体格式：
 * 
 * <pre>
 * {
 *   "answer": "根据最新数据，比特币近期...",
 *   "code": 200
 * }
 * </pre>
 * </p>
 *
 * @author CryptoRate Team
 * @since 2026-03-03
 */
@Data
public class AiAskResponse {

    /**
     * 大模型生成的回答内容
     */
    private String answer;

    /**
     * Python 服务内部状态码（200 表示成功，500 表示异常）
     */
    private Integer code;
}
