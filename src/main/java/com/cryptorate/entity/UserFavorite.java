package com.cryptorate.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户收藏实体类
 *
 * <p>
 * 映射数据库中的 user_favorite 表，记录用户收藏的加密货币
 * </p>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-27
 */
@Data
public class UserFavorite implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 收藏记录ID（主键，自增） */
    private Long id;

    /** 用户ID */
    private Long userId;

    /** 加密货币代码（如 BTC、ETH） */
    private String symbol;

    /** 收藏时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createdAt;
}
