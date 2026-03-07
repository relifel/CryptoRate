package com.cryptorate.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 收藏项更新 DTO（备注 + 价格提醒）
 *
 * <p>
 * 用于 PUT /api/v1/favorites/{symbol}/note 和 /alert 接口。
 * </p>
 *
 * @author CryptoRate Team
 * @since 2026-03-08
 */
@Data
public class FavoriteUpdateDTO {

    /** 备注内容（最长 200 字） */
    @Size(max = 200, message = "备注不能超过 200 个字符")
    private String note;

    /** 价格提醒上限 */
    private BigDecimal priceUpper;

    /** 价格提醒下限 */
    private BigDecimal priceLower;
}
