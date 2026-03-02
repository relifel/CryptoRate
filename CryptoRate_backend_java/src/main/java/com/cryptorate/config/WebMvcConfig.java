package com.cryptorate.config;

import com.cryptorate.interceptor.JwtInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 全局配置
 *
 * <p>
 * 注册 JWT 拦截器，保护需要登录才能访问的接口。
 * </p>
 *
 * <h3>注意：CORS 配置已移至 {@link CorsConfig}（使用 CorsFilter）</h3>
 * <p>
 * CorsFilter 是 Servlet 级别的过滤器，优先级高于 HandlerInterceptor，
 * 能确保 OPTIONS 预检请求在到达 JwtInterceptor 之前就被正确响应。
 * </p>
 *
 * @author CryptoRate Team
 * @version 2.1
 * @since 2026-02-27
 * @see CorsConfig
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;

    @Autowired
    public WebMvcConfig(JwtInterceptor jwtInterceptor) {
        this.jwtInterceptor = jwtInterceptor;
    }

    /**
     * 注册 JWT 拦截器
     *
     * <p>
     * 拦截 {@code /api/**} 路径，放行公开接口和静态资源。
     * </p>
     *
     * @param registry 拦截器注册器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                // 拦截需要登录的接口
                .addPathPatterns("/api/**")
                // 放行公开数据接口（无需 Token 即可访问）
                .excludePathPatterns(
                        // 用户认证接口
                        "/user/login",
                        "/user/register",
                        // 汇率、统计、分析等数据查询接口（公开）
                        "/api/v1/rates/**",
                        "/api/v1/stats/**",
                        "/api/v1/analysis/**",
                        // 前端页面路由
                        "/",
                        "/login",
                        "/register",
                        // 静态资源
                        "/static/**",
                        "/favicon.ico",
                        "/error");
    }
}
