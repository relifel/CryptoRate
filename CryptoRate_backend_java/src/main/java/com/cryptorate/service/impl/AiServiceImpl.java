package com.cryptorate.service.impl;

import com.cryptorate.dto.AiAskRequest;
import com.cryptorate.dto.AiAskResponse;
import com.cryptorate.service.AiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

/**
 * AI 问答服务实现类
 *
 * <p>
 * 使用 {@link RestTemplate} 向本地运行的 Python FastAPI AI 服务
 * （{@code http://127.0.0.1:8000/ai/ask}）发起 POST 请求，
 * 并将响应结果映射为 {@link AiAskResponse} 返回。
 * </p>
 *
 * <h3>异常处理策略：</h3>
 * <ul>
 * <li>{@link ResourceAccessException}：Python 服务未启动或网络不通时触发，
 * 返回友好错误提示。</li>
 * <li>其他 {@link Exception}：兜底捕获，防止异常向上传播导致 Controller 崩溃。</li>
 * </ul>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-03-03
 */
@Slf4j
@Service
public class AiServiceImpl implements AiService {

    /** Python AI 服务的接口地址（与 main.py 中的端口保持一致） */
    private static final String AI_SERVICE_URL = "http://127.0.0.1:8000/ai/ask";

    private final RestTemplate restTemplate;

    @Autowired
    public AiServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * 向 Python AI 服务发起问答请求
     *
     * <p>
     * 流程：
     * <ol>
     * <li>构造带有 Content-Type: application/json 的请求头</li>
     * <li>将用户问题封装为 {@link AiAskRequest} 请求体</li>
     * <li>通过 RestTemplate 发起 POST 请求</li>
     * <li>将响应体映射为 {@link AiAskResponse} 并返回</li>
     * </ol>
     * </p>
     *
     * @param question 用户的问题字符串
     * @return 包含大模型回答的响应对象；发生异常时返回带错误信息的对象
     */
    @Override
    public AiAskResponse ask(String question) {
        log.info("[AI Service] 正在向 Python AI 服务发起请求，问题: {}", question);

        try {
            // 1. 构造 HTTP 请求头，指定 JSON 格式
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 2. 构造请求体 DTO
            AiAskRequest requestBody = new AiAskRequest();
            requestBody.setQuestion(question);

            HttpEntity<AiAskRequest> httpEntity = new HttpEntity<>(requestBody, headers);

            // 3. 发起 POST 请求，并将响应体自动反序列化为 AiAskResponse
            ResponseEntity<AiAskResponse> response = restTemplate.postForEntity(
                    AI_SERVICE_URL,
                    httpEntity,
                    AiAskResponse.class);

            AiAskResponse result = response.getBody();
            log.info("[AI Service] 请求成功，Python 响应状态码: {}",
                    result != null ? result.getCode() : "null");

            return result;

        } catch (ResourceAccessException e) {
            // Python 服务未启动、端口不通等连接层异常
            log.error("[AI Service] 无法连接到 Python AI 服务，请确认服务已启动: {}", e.getMessage());
            AiAskResponse errorResponse = new AiAskResponse();
            errorResponse.setCode(503);
            errorResponse.setAnswer("AI 服务暂时不可用，请稍后重试。（Python 服务未启动或连接超时）");
            return errorResponse;

        } catch (Exception e) {
            // 兜底异常：解析失败、未知错误等
            log.error("[AI Service] 调用 AI 服务时发生未知异常: {}", e.getMessage(), e);
            AiAskResponse errorResponse = new AiAskResponse();
            errorResponse.setCode(500);
            errorResponse.setAnswer("AI 服务内部错误，请联系管理员。");
            return errorResponse;
        }
    }
}
