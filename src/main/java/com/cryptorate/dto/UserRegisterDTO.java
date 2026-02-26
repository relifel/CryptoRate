package com.cryptorate.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * 用户注册请求数据传输对象（DTO）
 *
 * <p>用于接收并校验前端发送的注册请求参数。
 * 使用 Jakarta Bean Validation 注解进行字段约束，
 * 配合 Controller 层的 {@code @Valid} 注解触发校验。</p>
 *
 * <h3>校验规则：</h3>
 * <ul>
 *   <li>username：不能为空，长度 3~20 个字符</li>
 *   <li>password：不能为空，长度 6~20 个字符</li>
 *   <li>email：可选，若填写则必须符合邮箱格式</li>
 * </ul>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-27
 */
@Data
public class UserRegisterDTO {

    /**
     * 用户名（必填，3~20 位字符）
     */
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度必须在 3~20 个字符之间")
    private String username;

    /**
     * 密码（必填，6~20 位字符）
     *
     * <p>前端传输明文密码，后端使用 BCrypt 加密后存入数据库，
     * 数据库和内存中均不会保留明文密码。</p>
     */
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度必须在 6~20 个字符之间")
    private String password;

    /**
     * 邮箱（可选，若填写需符合邮箱格式）
     */
    @Email(message = "邮箱格式不正确")
    private String email;
}
