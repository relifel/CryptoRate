package com.cryptorate.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * 用户个人资料更新 DTO
 *
 * <p>
 * 用于 {@code PUT /user/profile} 接口，只允许修改昵称和邮箱，
 * 不涉及密码和用户名。
 * </p>
 *
 * @author CryptoRate Team
 * @since 2026-03-08
 */
@Data
public class ProfileUpdateDTO {

    /** 昵称（1-20 字符） */
    @Size(max = 20, message = "昵称不能超过 20 个字符")
    private String nickname;

    /** 邮箱 */
    @Email(message = "邮箱格式不正确")
    private String email;

    /** 飞书预警开关 (0:关闭, 1:开启) */
    private Integer feishuAlertEnabled;

    /** 飞书自定义 Webhook 地址 */
    private String feishuWebhook;

    /**
     * 是否订阅 AI 每日简报 (0-否, 1-是)
     */
    private Integer dailyBriefingEnabled;
}
