package com.cryptorate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * CORS 跨域过滤器配置
 *
 * <p>
 * 使用 {@link CorsFilter}（Servlet Filter）代替 {@code addCorsMappings}（Interceptor
 * 级别），
 * 因为 Filter 在 Spring MVC 拦截器之前执行，能够保证 CORS 预检请求（OPTIONS）
 * 在到达 {@link com.cryptorate.interceptor.JwtInterceptor} 之前就被正确响应。
 * </p>
 *
 * <h3>为什么不用 addCorsMappings？</h3>
 * <p>
 * addCorsMappings 注册的 CORS 处理逻辑与 HandlerInterceptor 处于同一层级，
 * 当 JwtInterceptor 先于 CORS 处理执行时，OPTIONS 请求会被拦截并返回 401，
 * 导致浏览器报 CORS 错误。CorsFilter 作为 Servlet Filter，优先级高于所有 Interceptor。
 * </p>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-27
 */
@Configuration
public class CorsConfig {

    /**
     * 创建 CORS 过滤器 Bean
     *
     * <p>
     * 配置规则：
     * </p>
     * <ul>
     * <li>允许来源：localhost 和 127.0.0.1 的任意端口</li>
     * <li>允许方法：GET / POST / PUT / DELETE / OPTIONS / PATCH</li>
     * <li>允许请求头：全部（包括 Authorization）</li>
     * <li>暴露响应头：Authorization（前端可读取）</li>
     * <li>允许携带凭证：true（Cookie、Authorization）</li>
     * <li>预检缓存时间：3600 秒</li>
     * </ul>
     *
     * @return CorsFilter 实例
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // 允许的来源（支持通配端口）
        config.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "http://127.0.0.1:*"));

        // 允许的 HTTP 方法
        config.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // 允许所有请求头（包括 Authorization）
        config.addAllowedHeader("*");

        // 暴露 Authorization 响应头，前端可读取
        config.addExposedHeader("Authorization");

        // 允许携带认证信息（Cookie、Authorization 头等）
        config.setAllowCredentials(true);

        // 预检请求缓存时间（秒），减少 OPTIONS 请求频率
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 对所有路径生效
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
