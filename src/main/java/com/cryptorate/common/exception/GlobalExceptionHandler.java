package com.cryptorate.common.exception;

import com.cryptorate.common.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 * 
 * <p>统一处理系统中的异常，并转换为标准的响应格式</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理 API 调用异常
     * 
     * @param e API 异常对象
     * @return 统一响应结果
     */
    @ExceptionHandler(ApiException.class)
    public R<Void> handleApiException(ApiException e) {
        log.error("API 调用异常: code={}, message={}", e.getCode(), e.getMessage(), e);
        return R.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理运行时异常
     * 
     * @param e 运行时异常对象
     * @return 统一响应结果
     */
    @ExceptionHandler(RuntimeException.class)
    public R<Void> handleRuntimeException(RuntimeException e) {
        log.error("运行时异常: {}", e.getMessage(), e);
        return R.error("系统异常: " + e.getMessage());
    }

    /**
     * 处理其他所有异常
     * 
     * @param e 异常对象
     * @return 统一响应结果
     */
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e) {
        log.error("系统异常: {}", e.getMessage(), e);
        return R.error("系统内部错误，请联系管理员");
    }
}
