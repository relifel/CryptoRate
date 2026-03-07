package com.cryptorate.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户收藏实体类
 *
 * <p>
 * 映射数据库中的 user_favorite 表，记录用户收藏的加密货币
 * 及其排序权重、备注、价格提醒等附加信息。
 * </p>
 *
 * @author CryptoRate Team
 * @version 2.0
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

    /** 排序权重（越小越靠前，默认 0） */
    private Integer sortOrder;

    /** 用户自定义备注 */
    private String note;

    /** 价格提醒上限 */
    private BigDecimal priceUpper;

    /** 价格提醒下限 */
    private BigDecimal priceLower;

    /** 收藏时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createdAt;
}
