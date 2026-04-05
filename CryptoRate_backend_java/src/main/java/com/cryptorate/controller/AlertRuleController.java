package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.entity.PriceAlert;
import com.cryptorate.interceptor.JwtInterceptor;
import com.cryptorate.service.AlertRuleService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 用户告警规则控制器 (V2)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/alerts")
public class AlertRuleController {

    private final AlertRuleService alertRuleService;

    @Autowired
    public AlertRuleController(AlertRuleService alertRuleService) {
        this.alertRuleService = alertRuleService;
    }

    /** 1. 添加监控规则 */
    @PostMapping
    public R<PriceAlert> addAlert(@RequestBody PriceAlert alert, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("用户 {} 正在创建告警: {}", userId, alert.getSymbol());
        return R.ok(alertRuleService.createAlert(userId, alert));
    }

    /** 2. 获取当前用户的所有规则 */
    @GetMapping("/list")
    public R<List<PriceAlert>> getAlerts(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return R.ok(alertRuleService.getUserAlerts(userId));
    }

    /** 3. 修改规则状态 (启用/禁用) */
    @PutMapping("/{id}/status")
    public R<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        String status = body.get("status");
        alertRuleService.updateStatus(id, userId, status);
        return R.ok("状态已更新", null);
    }

    /** 4. 删除规则 */
    @DeleteMapping("/{id}")
    public R<Void> deleteAlert(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        alertRuleService.deleteAlert(id, userId);
        return R.ok("告警规则已移除", null);
    }

    // 复用项目原有的 ID 提取逻辑
    private Long getCurrentUserId(HttpServletRequest request) {
        Object userIdObj = request.getAttribute(JwtInterceptor.CURRENT_USER_ID);
        if (userIdObj == null) {
            throw new RuntimeException("用户未授权");
        }
        return (Long) userIdObj;
    }
}
