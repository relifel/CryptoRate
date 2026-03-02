package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.service.CryptoMarketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 管理后台控制接口
 * 
 * <p>提供管理员操作接口</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final CryptoMarketService cryptoMarketService;

    @Autowired
    public AdminController(CryptoMarketService cryptoMarketService) {
        this.cryptoMarketService = cryptoMarketService;
    }

    /**
     * 手动触发数据采集
     * 
     * <p>接口: POST /api/v1/admin/sync</p>
     * <p>立即调用 Coinlayer API 并更新数据库中的汇率数据</p>
     * 
     * @return 同步结果
     */
    @PostMapping("/sync")
    public R<String> syncData() {
        log.info("接收到手动同步数据请求");
        
        try {
            int count = cryptoMarketService.syncRatesToDatabase();
            String message = String.format("成功同步 %d 条汇率数据", count);
            log.info(message);
            return R.ok(message);
        } catch (Exception e) {
            log.error("同步数据失败: {}", e.getMessage(), e);
            return R.error("同步数据失败: " + e.getMessage());
        }
    }
}
