package com.cryptorate.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户实体类
 *
 * <p>
 * 映射数据库中的 user 表，包含基础个人信息字段。
 * </p>
 *
 * @author CryptoRate Team
 * @version 2.0
 * @since 2026-02-13
 */
@Data
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 用户ID（主键，自增） */
    private Long id;

    /** 用户名（唯一，注册后不可修改） */
    private String username;

    /** 密码（BCrypt 加密存储，JSON 序列化时忽略） */
    @JsonIgnore
    private String password;

    /** 邮箱 */
    private String email;

    /** 昵称（展示名） */
    private String nickname;

    /** 角色：ADMIN (管理员), USER (普通用户) */
    private String role;

    /** 状态：ACTIVE (正常), DISABLED (禁用) */
    private String status;

    /** 创建时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createdAt;

    /** 最后更新时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}
