package com.cryptorate.service;

import java.math.BigDecimal;

/**
 * 飞书告警服务接口
 *
 * <p>
 * 提供向飞书机器人发送价格告警通知的功能。
 * </p>
 *
 * @author CryptoRate Team
 * @since 2026-03-12
 */
public interface FeishuAlertService {

    /**
     * 发送价格告警通知到飞书
     *
     * @param coinSymbol   数字货币代码 (例: BTC)
     * @param currentPrice 当前实时价格
     * @param triggerPrice 用户设定的触发阈值
     * @param trend        异动趋势 ("up" 为上涨, "down" 为下跌)
     * @param reason       异动深度原因 (情报描述)
     */
    void sendPriceAlert(String coinSymbol, BigDecimal currentPrice, BigDecimal triggerPrice, String trend, String reason);
}
