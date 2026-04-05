package com.cryptorate.service.impl;

import com.cryptorate.common.exception.ApiException;
import com.cryptorate.entity.PriceAlert;
import com.cryptorate.mapper.PriceAlertMapper;
import com.cryptorate.service.AlertRuleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 告警规则服务实现类 (含 V2 冷却机制)
 */
@Slf4j
@Service
public class AlertRuleServiceImpl implements AlertRuleService {

    private final PriceAlertMapper alertMapper;

    @Autowired
    public AlertRuleServiceImpl(PriceAlertMapper alertMapper) {
        this.alertMapper = alertMapper;
    }

    @Override
    public PriceAlert createAlert(Long userId, PriceAlert alert) {
        alert.setUserId(userId);
        alert.setStatus("ACTIVE"); // 默认开启
        if (alert.getCooldownMinutes() == null) {
            alert.setCooldownMinutes(60); // 默认 1 小时冷却
        }
        alertMapper.insert(alert);
        return alert;
    }

    @Override
    public List<PriceAlert> getUserAlerts(Long userId) {
        return alertMapper.selectByUserId(userId);
    }

    @Override
    public void updateStatus(Long id, Long userId, String status) {
        PriceAlert alert = PriceAlert.builder().id(id).userId(userId).status(status).build();
        alertMapper.update(alert);
    }

    /**
     * 【核心巡逻判断逻辑】 
     * 实现了价格对比 + 冷却时间双重校验
     */
    @Override
    public boolean checkAndTrigger(PriceAlert alert, BigDecimal currentPrice) {
        // 1. 基本价格条件判断
        boolean conditionMet = false;
        BigDecimal target = alert.getTargetValue();
        
        switch (alert.getAlertType()) {
            case "PRICE_ABOVE":
                conditionMet = currentPrice.compareTo(target) >= 0;
                break;
            case "PRICE_BELOW":
                conditionMet = currentPrice.compareTo(target) <= 0;
                break;
            // 跌幅判断等逻辑可在此扩展
        }

        if (!conditionMet) return false;

        // 2. 【V2 冷却时间校验】重点逻辑
        LocalDateTime lastTrigger = alert.getLastTriggeredAt();
        if (lastTrigger != null) {
            long minutesPassed = Duration.between(lastTrigger, LocalDateTime.now()).toMinutes();
            if (minutesPassed < alert.getCooldownMinutes()) {
                log.info("告警规则 {} 满足价格条件，但处于冷却期内 (已过 {}/{} 分钟)，跳过发送", 
                    alert.getId(), minutesPassed, alert.getCooldownMinutes());
                return false;
            }
        }

        // 3. 满足触发条件且过了冷却期
        log.info("🚀 触发告警！规则 ID: {}, 当前价: {}, 目标价: {}", 
            alert.getId(), currentPrice, target);
        
        // 更新数据库中的触发时间，规则保持 ACTIVE 状态以支持循环监控
        alertMapper.updateLastTriggered(alert.getId());
        
        return true; 
    }

    @Override
    public void deleteAlert(Long id, Long userId) {
        alertMapper.deleteById(id, userId);
    }
}
