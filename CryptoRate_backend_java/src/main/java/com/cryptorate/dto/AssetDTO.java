package com.cryptorate.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 资产数据传输对象
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Data
public class AssetDTO {

    /**
     * 资产ID
     */
    private Long id;

    /**
     * 加密货币代码
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
     * 当前价格（暂未对接实时行情时为 null）
     */
    private BigDecimal currentPrice;

    /**
     * 总价值（暂未对接实时行情时为 null）
     */
    private BigDecimal totalValue;
}
