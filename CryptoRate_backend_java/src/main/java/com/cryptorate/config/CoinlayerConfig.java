package com.cryptorate.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Coinlayer API 配置类
 * 
 * <p>从 application.yml 读取 Coinlayer API 的配置信息</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "coinlayer")
public class CoinlayerConfig {

    /**
     * API 访问密钥
     */
    private String accessKey;

    /**
     * API 基础 URL
     */
    private String baseUrl;

    /**
     * 默认目标货币
     */
    private String target = "USD";

    /**
     * 请求超时时间（秒）
     */
    private Integer timeout = 5;
}
