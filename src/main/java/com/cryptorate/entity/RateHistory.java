package com.cryptorate.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 汇率历史记录实体类
 * 
 * <p>映射数据库中的 rate_history 表</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Data
public class RateHistory implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 记录ID（主键，自增）
     */
    private Long id;

    /**
     * 加密货币代码（如 BTC、ETH）
     */
    private String symbol;

    /**
     * 汇率（相对于 USD）
     */
    private BigDecimal rate;

    /**
     * Unix 时间戳（秒）
     */
    private Long timestamp;

    /**
     * 记录创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createdAt;
}
