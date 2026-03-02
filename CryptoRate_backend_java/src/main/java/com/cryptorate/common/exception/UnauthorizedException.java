package com.cryptorate.common.exception;

import lombok.Getter;

/**
 * 未授权异常（HTTP 401）
 *
 * <p>当 JWT Token 缺失、无效或已过期时抛出此异常。
 * 由 {@link GlobalExceptionHandler} 统一捕获并返回 401 状态码给客户端。</p>
 *
 * <h3>触发场景：</h3>
 * <ul>
 *   <li>请求头中未携带 Authorization</li>
 *   <li>Token 格式错误或签名不匹配</li>
 *   <li>Token 已过期（超过 24 小时）</li>
 * </ul>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-27
 */
@Getter
public class UnauthorizedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /** 错误码，固定为 401 */
    private final Integer code = 401;

    /**
     * 构造方法
     *
     * @param message 错误描述信息（如 "Token 已过期，请重新登录"）
     */
    public UnauthorizedException(String message) {
        super(message);
    }
}
