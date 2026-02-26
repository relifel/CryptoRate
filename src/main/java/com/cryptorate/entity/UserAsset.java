package com.cryptorate.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户资产实体类
 * 
 * <p>
 * 映射数据库中的 user_asset 表
 * </p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Data
public class UserAsset implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 资产ID（主键，自增）
     */
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 加密货币代码（如 BTC、ETH）
     */
    private String symbol;

    /**
     * 持有数量
     */
    private BigDecimal amount;

    /**
     * 持仓总成本（USD）
     */
    private BigDecimal cost;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updatedAt;
}
