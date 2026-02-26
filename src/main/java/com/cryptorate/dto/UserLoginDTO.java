package com.cryptorate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 用户登录请求数据传输对象（DTO）
 *
 * <p>用于接收并校验前端发送的登录请求参数。
 * 配合 Controller 层的 {@code @Valid} 注解触发校验。</p>
 *
 * <h3>校验规则：</h3>
 * <ul>
 *   <li>username：不能为空</li>
 *   <li>password：不能为空</li>
 * </ul>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-27
 */
@Data
public class UserLoginDTO {

    /**
     * 用户名（必填）
     */
    @NotBlank(message = "用户名不能为空")
    private String username;

    /**
     * 密码（必填，传输明文，后端使用 BCrypt 比对）
     */
    @NotBlank(message = "密码不能为空")
    private String password;
}
