package com.cryptorate.service;

import com.cryptorate.dto.AiAskResponse;

/**
 * AI 问答服务接口
 *
 * <p>
 * 封装了向 Python AI 微服务发起 HTTP 请求的核心逻辑，
 * 隔离底层 HTTP 调用细节，便于单元测试和后续替换实现。
 * </p>
 *
 * @author CryptoRate Team
 * @since 2026-03-03
 */
public interface AiService {

    /**
     * 向 Python AI 服务发起问答请求
     *
     * @param question 用户的问题字符串
     * @return Python 服务返回的 {@link AiAskResponse}，包含模型回答和状态码
     */
    AiAskResponse ask(String question);
}
