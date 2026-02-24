package com.cryptorate.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 全局配置
 *
 * <p>配置跨域（CORS）策略，允许前端页面（运行在 3000/3001 等端口）
 * 调用本后端 API（运行在 8080 端口）。</p>
 *
 * <h3>为什么需要 CORS？</h3>
 * <p>浏览器的同源策略（Same-Origin Policy）禁止页面向不同域/端口发送 Ajax 请求。
 * 前端开发服务器通常运行在 localhost:3000 或 localhost:3001，
 * 后端运行在 localhost:8080，端口不同即视为"跨域"，必须在后端显式允许。</p>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-22
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * 配置全局跨域规则
     *
     * <ul>
     *   <li>允许来源：localhost 的常见开发端口（3000、3001、5173 等）</li>
     *   <li>允许方法：GET / POST / PUT / DELETE / OPTIONS</li>
     *   <li>允许携带 Cookie 和自定义请求头（如 X-User-Id、X-Username）</li>
     *   <li>预检缓存：3600 秒，减少 OPTIONS 预检请求频率</li>
     * </ul>
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // 允许前端开发服务器的所有常用端口
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                // 允许携带认证信息（Cookie、Authorization 等）
                .allowCredentials(true)
                // 预检请求缓存时间（秒）
                .maxAge(3600);
    }
}
