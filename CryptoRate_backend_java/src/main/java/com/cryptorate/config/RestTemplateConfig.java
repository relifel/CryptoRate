package com.cryptorate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * RestTemplate 配置类
 *
 * <p>
 * 注册一个全局共享的 {@link RestTemplate} Bean，用于 Java 服务内部向外部
 * HTTP 接口（如 Python AI 服务）发起请求。
 * </p>
 *
 * <p>
 * 配置了连接超时（5 秒）和读取超时（30 秒），防止 AI 服务响应慢时阻塞 Java 线程。
 * </p>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-03-03
 */
@Configuration
public class RestTemplateConfig {

    /**
     * 连接超时时间（毫秒）
     * 超过此时间未建立连接则抛出异常
     */
    private static final int CONNECT_TIMEOUT_MS = 5_000;

    /**
     * 读取超时时间（毫秒）
     * AI 推理耗时较长，给予充足的等待时间
     */
    private static final int READ_TIMEOUT_MS = 30_000;

    /**
     * 注册 RestTemplate Bean
     *
     * @return 配置了超时参数的 RestTemplate 实例
     */
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        factory.setReadTimeout(READ_TIMEOUT_MS);
        return new RestTemplate(factory);
    }
}
