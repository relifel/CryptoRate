package com.cryptorate.common.exception;

import lombok.Getter;

/**
 * API 调用异常类
 * 
 * <p>用于封装外部 API 调用过程中发生的异常（如 Coinlayer API）</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
 */
@Getter
public class ApiException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * 错误码
     */
    private final Integer code;

    /**
     * 构造方法（默认错误码 500）
     * 
     * @param message 错误消息
     */
    public ApiException(String message) {
        super(message);
        this.code = 500;
    }

    /**
     * 构造方法（自定义错误码）
     * 
     * @param code    错误码
     * @param message 错误消息
     */
    public ApiException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    /**
     * 构造方法（包含原始异常）
     * 
     * @param message 错误消息
     * @param cause   原始异常
     */
    public ApiException(String message, Throwable cause) {
        super(message, cause);
        this.code = 500;
    }

    /**
     * 构造方法（完整参数）
     * 
     * @param code    错误码
     * @param message 错误消息
     * @param cause   原始异常
     */
    public ApiException(Integer code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}
