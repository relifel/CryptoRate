package com.cryptorate.service;

import com.cryptorate.entity.PriceAlert;
import java.math.BigDecimal;
import java.util.List;

/**
 * 告警规则服务接口
 */
public interface AlertRuleService {

    /** 添加新的告警规则 */
    PriceAlert createAlert(Long userId, PriceAlert alert);

    /** 获取用户所有规则 */
    List<PriceAlert> getUserAlerts(Long userId);

    /** 手动 开启/关闭/删除 规则 */
    void updateStatus(Long id, Long userId, String status);

    /** 
     * 【核心判断逻辑】
     * 检查当前行情是否触发了告警，并应用冷却时间机制
     */
    boolean checkAndTrigger(PriceAlert alert, BigDecimal currentPrice);

    /** 物理删除规则 */
    void deleteAlert(Long id, Long userId);
}
