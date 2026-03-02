package com.cryptorate.interceptor;

import com.cryptorate.utils.JwtUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 认证拦截器
 *
 * <p>
 * 实现 {@link HandlerInterceptor}，在每次 HTTP 请求到达 Controller 之前，
 * 从请求头中提取并校验 JWT Token，实现接口的登录保护。
 * </p>
 *
 * <h3>工作流程：</h3>
 * <ol>
 * <li>从请求头 {@code Authorization} 中读取 Token（格式：{@code Bearer <token>}）</li>
 * <li>调用 {@link JwtUtils#validateToken} 校验 Token 有效性</li>
 * <li>校验通过：将 userId 存入 {@link HttpServletRequest} 属性，供 Controller 使用</li>
 * <li>校验失败：直接写入 JSON 响应（HTTP 401），阻止请求继续传递</li>
 * </ol>
 *
 * <h3>配置放行路径（在 WebMvcConfig 中设置）：</h3>
 * <ul>
 * <li>POST /user/login — 登录接口，无需 Token</li>
 * <li>POST /user/register — 注册接口，无需 Token</li>
 * <li>/static/** — 静态资源，无需 Token</li>
 * </ul>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-27
 * @see JwtUtils
 * @see com.cryptorate.config.WebMvcConfig
 */
@Slf4j
@Component
public class JwtInterceptor implements HandlerInterceptor {

    /** Authorization 请求头名称 */
    private static final String AUTHORIZATION_HEADER = "Authorization";

    /** Bearer Token 前缀 */
    private static final String BEARER_PREFIX = "Bearer ";

    /** 存储在 request 中的用户 ID 属性名 */
    public static final String CURRENT_USER_ID = "currentUserId";

    /** 存储在 request 中的用户名属性名 */
    public static final String CURRENT_USERNAME = "currentUsername";

    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper;

    @Autowired
    public JwtInterceptor(JwtUtils jwtUtils, ObjectMapper objectMapper) {
        this.jwtUtils = jwtUtils;
        this.objectMapper = objectMapper;
    }

    /**
     * 请求预处理：校验 JWT Token
     *
     * <p>
     * 该方法在 Controller 方法执行之前被调用。
     * 校验通过返回 {@code true}（放行），否则写入 401 响应并返回 {@code false}（拦截）。
     * </p>
     *
     * @param request  HTTP 请求对象
     * @param response HTTP 响应对象
     * @param handler  目标 Handler（通常为 Controller 方法）
     * @return {@code true} - 放行请求；{@code false} - 拦截请求（已写入 401 响应）
     */
    @Override
    public boolean preHandle(HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws Exception {
        String requestURI = request.getRequestURI();
        log.debug("JWT 拦截器校验请求: {} {}", request.getMethod(), requestURI);

        // 0. 放行 CORS 预检请求（OPTIONS）
        // 浏览器跨域时会先发 OPTIONS 请求探测服务端是否允许，
        // 该请求不携带 Authorization 头，必须直接放行，否则 CORS 握手失败
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            log.debug("放行 CORS 预检请求: {}", requestURI);
            return true;
        }

        // 1. 从请求头中获取 Authorization
        String authHeader = request.getHeader(AUTHORIZATION_HEADER);

        // 2. 检查 Authorization 头是否存在且以 "Bearer " 开头
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.warn("请求 [{}] 缺少有效的 Authorization 头", requestURI);
            writeUnauthorizedResponse(response, "未登录或 Token 已过期，请重新登录");
            return false;
        }

        // 3. 提取 Token（去除 "Bearer " 前缀）
        String token = authHeader.substring(BEARER_PREFIX.length());

        // 4. 校验 Token 有效性
        if (!jwtUtils.validateToken(token)) {
            log.warn("请求 [{}] 携带了无效的 JWT Token", requestURI);
            writeUnauthorizedResponse(response, "Token 无效或已过期，请重新登录");
            return false;
        }

        // 5. Token 有效：将用户信息存入 request 属性，供 Controller 层使用
        Long userId = jwtUtils.getUserIdFromToken(token);
        String username = jwtUtils.getUsernameFromToken(token);
        request.setAttribute(CURRENT_USER_ID, userId);
        request.setAttribute(CURRENT_USERNAME, username);
        log.debug("JWT 校验通过，当前用户: ID={}, username={}", userId, username);

        return true;
    }

    /**
     * 向响应中写入 401 未授权的 JSON 错误信息
     *
     * <p>
     * 格式与项目统一响应格式 {@code R} 保持一致：
     * </p>
     * 
     * <pre>
     * {
     *   "code": 401,
     *   "msg": "...",
     *   "data": null,
     *   "timestamp": 1234567890000
     * }
     * </pre>
     *
     * @param response HTTP 响应对象
     * @param message  错误消息
     * @throws IOException IO 写入异常
     */
    private void writeUnauthorizedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> body = new HashMap<>();
        body.put("code", 401);
        body.put("msg", message);
        body.put("data", null);
        body.put("timestamp", System.currentTimeMillis());

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
