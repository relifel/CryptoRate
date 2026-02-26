package com.cryptorate.common.exception;

import com.cryptorate.common.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 *
 * <p>统一拦截系统中的各类异常，并将其转换为标准的 JSON 响应格式（{@link R}）。</p>
 *
 * <h3>处理的异常类型：</h3>
 * <ul>
 *   <li>{@link MethodArgumentNotValidException} — @Valid 校验失败，返回 400</li>
 *   <li>{@link UnauthorizedException} — JWT 鉴权失败，返回 401</li>
 *   <li>{@link ApiException} — 业务自定义异常，返回对应状态码</li>
 *   <li>{@link RuntimeException} — 运行时异常，返回 500</li>
 *   <li>{@link Exception} — 其他所有异常，返回 500</li>
 * </ul>
 *
 * @author CryptoRate Team
 * @version 2.0
 * @since 2026-02-27
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理参数校验失败异常（@Valid 触发）
     *
     * <p>当 Controller 方法参数使用 {@code @Valid} 且校验不通过时抛出。
     * 提取第一条字段错误信息返回给前端，避免暴露过多内部细节。</p>
     *
     * @param e MethodArgumentNotValidException
     * @return 400 响应 + 第一条校验错误信息
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleValidationException(MethodArgumentNotValidException e) {
        BindingResult bindingResult = e.getBindingResult();
        FieldError fieldError = bindingResult.getFieldError();
        String errorMessage = fieldError != null ? fieldError.getDefaultMessage() : "参数校验失败";
        log.warn("参数校验失败: {}", errorMessage);
        return R.error(400, errorMessage);
    }

    /**
     * 处理未授权异常（JWT 校验失败）
     *
     * <p>当 Token 缺失、无效或过期时，由拦截器或业务层抛出 {@link UnauthorizedException}。</p>
     *
     * @param e UnauthorizedException
     * @return 401 响应
     */
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(UnauthorizedException.class)
    public R<Void> handleUnauthorizedException(UnauthorizedException e) {
        log.warn("未授权访问: {}", e.getMessage());
        return R.error(401, e.getMessage());
    }

    /**
     * 处理业务自定义异常
     *
     * <p>由 Service 层主动抛出，用于表示业务规则校验失败（如用户名已存在、密码错误等）。</p>
     *
     * @param e ApiException
     * @return 对应状态码响应
     */
    @ExceptionHandler(ApiException.class)
    public R<Void> handleApiException(ApiException e) {
        log.error("业务异常: code={}, message={}", e.getCode(), e.getMessage());
        return R.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理运行时异常
     *
     * @param e RuntimeException
     * @return 500 响应
     */
    @ExceptionHandler(RuntimeException.class)
    public R<Void> handleRuntimeException(RuntimeException e) {
        log.error("运行时异常: {}", e.getMessage(), e);
        return R.error("系统异常: " + e.getMessage());
    }

    /**
     * 处理其他所有未捕获异常
     *
     * @param e Exception
     * @return 500 响应
     */
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e) {
        log.error("系统异常: {}", e.getMessage(), e);
        return R.error("系统内部错误，请联系管理员");
    }
}
