package com.cryptorate.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 工具类
 *
 * <p>负责生成、解析、校验 JSON Web Token（JWT），以实现无状态的用户认证。</p>
 *
 * <h3>JWT 结构说明：</h3>
 * <ul>
 *   <li><b>Header</b>：算法类型（HS256）</li>
 *   <li><b>Payload</b>：claims，包含 userId、username、签发时间、过期时间</li>
 *   <li><b>Signature</b>：用密钥对 Header+Payload 进行 HMAC-SHA256 签名</li>
 * </ul>
 *
 * <h3>配置项（application.yml）：</h3>
 * <pre>
 * jwt:
 *   secret: "your-secret-key"   # 签名密钥（建议 256 位以上）
 *   expiration: 86400000         # 过期时间，单位毫秒，默认 24 小时
 * </pre>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-27
 */
@Slf4j
@Component
public class JwtUtils {

    /** JWT 签名密钥，从 application.yml 读取 */
    @Value("${jwt.secret}")
    private String secret;

    /** Token 过期时间（毫秒），从 application.yml 读取 */
    @Value("${jwt.expiration}")
    private long expiration;

    /**
     * 获取 HMAC-SHA256 签名密钥
     *
     * <p>将配置文件中的字符串密钥转换为 jjwt 所需的 SecretKey 对象。
     * 若密钥长度不足，会自动补全以满足 HMAC-SHA256 的 256 位要求。</p>
     *
     * @return SecretKey 签名密钥对象
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 生成 JWT Token
     *
     * <p>将用户 ID 和用户名写入 JWT 的 payload（claims），
     * 并设置 24 小时过期时间，使用 HMAC-SHA256 算法签名。</p>
     *
     * <h4>生成示例：</h4>
     * <pre>
     * String token = jwtUtils.generateToken(1L, "testuser");
     * // 返回类似: eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.xxx
     * </pre>
     *
     * @param userId   用户 ID（写入 claims，用于后续接口鉴权）
     * @param username 用户名（写入 claims，便于 Token 可读性调试）
     * @return 签名后的 JWT Token 字符串
     */
    public String generateToken(Long userId, String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        String token = Jwts.builder()
                .claim("userId", userId)
                .claim("username", username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();

        log.debug("生成 JWT Token，用户ID: {}, 用户名: {}, 过期时间: {}", userId, username, expiryDate);
        return token;
    }

    /**
     * 从 Token 中获取所有 Claims（载荷信息）
     *
     * <p>解析并验证 Token 签名。若 Token 已过期、签名不正确或格式错误，
     * 会抛出相应的 JwtException。</p>
     *
     * @param token JWT Token 字符串（不含 "Bearer " 前缀）
     * @return 解析后的 Claims 对象（包含 userId、username 等信息）
     * @throws JwtException Token 无效、过期或格式错误时抛出
     */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 从 Token 中提取用户 ID
     *
     * <p>用于后端拦截器、Controller 层快速获取当前登录用户 ID，
     * 实现接口的用户隔离（只能操作自己的数据）。</p>
     *
     * <h4>使用示例：</h4>
     * <pre>
     * Long userId = jwtUtils.getUserIdFromToken(token);
     * </pre>
     *
     * @param token JWT Token 字符串（不含 "Bearer " 前缀）
     * @return 用户 ID
     * @throws JwtException Token 无效时抛出
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("userId", Long.class);
    }

    /**
     * 从 Token 中提取用户名
     *
     * @param token JWT Token 字符串（不含 "Bearer " 前缀）
     * @return 用户名
     * @throws JwtException Token 无效时抛出
     */
    public String getUsernameFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("username", String.class);
    }

    /**
     * 校验 Token 是否有效（未过期、签名正确）
     *
     * <p>安全调用 parseToken，捕获所有异常并返回布尔值，
     * 适合在拦截器中做快速判断。</p>
     *
     * @param token JWT Token 字符串
     * @return true-有效，false-无效或已过期
     */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT Token 已过期: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("不支持的 JWT Token: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT Token 格式错误: {}", e.getMessage());
        } catch (JwtException e) {
            log.warn("JWT Token 校验失败: {}", e.getMessage());
        }
        return false;
    }
}
