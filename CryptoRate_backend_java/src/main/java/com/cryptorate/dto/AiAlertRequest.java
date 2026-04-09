package com.cryptorate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * AI 告警请求 DTO
 * 
 * 用于向 Python AI 服务发起异动分析与播报请求
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAlertRequest {
    /** 币种代码 (如 BTC) */
    private String symbol;
    
    /** 当前价格 */
    private BigDecimal price;
    
    /** 变化比例 (如 5.5 代表 5.5%) */
    private BigDecimal change;

    /** 异动深度原因 (Mock/Real Reason) */
    private String reason;
}
