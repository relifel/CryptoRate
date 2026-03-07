package com.cryptorate.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 修改密码 DTO
 *
 * <p>
 * 用于 {@code PUT /user/password} 接口。
 * 必须提供旧密码（防止他人在用户解锁状态下修改密码），
 * 新密码和确认密码必须一致。
 * </p>
 *
 * @author CryptoRate Team
 * @since 2026-03-08
 */
@Data
public class ChangePasswordDTO {

    /** 旧密码（明文） */
    @NotBlank(message = "旧密码不能为空")
    private String oldPassword;

    /** 新密码（6-30 字符） */
    @NotBlank(message = "新密码不能为空")
    @Size(min = 6, max = 30, message = "新密码长度为 6-30 个字符")
    private String newPassword;

    /** 确认新密码（需与 newPassword 一致，后端服务层校验） */
    @NotBlank(message = "确认密码不能为空")
    private String confirmPassword;
}
