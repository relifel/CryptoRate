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
    private final com.cryptorate.service.FeishuAlertService feishuAlertService;

    @Autowired
    public AdminController(CryptoMarketService cryptoMarketService, com.cryptorate.service.FeishuAlertService feishuAlertService) {
        this.cryptoMarketService = cryptoMarketService;
        this.feishuAlertService = feishuAlertService;
    }

    /**
     * 模拟发送飞书告警（纯后端测试）
     * 
     * <p>接口: GET /api/v1/admin/sim-feishu-alert</p>
     */
    @GetMapping("/sim-feishu-alert")
    public R<String> simulateFeishuAlert() {
        log.info("接收到手动模拟飞书推送请求...");
        
        try {
            // 场景 1: BTC 暴涨
            String btcReason = "根据 Bloomberg 最新报道，美联储在最新的议息会议纪要中释放了明确的鸽派信号，市场对下季度降息的预期大幅升温。与此同时，全球最大的资产管理公司 BlackRock 宣布其现货比特币 ETF 的持仓量突破历史新高，机构资金的持续增量流入导致市场深度在短时间内被迅速消化，引发了典型的供应挤压式暴涨，多头情绪目前占据绝对主导地位。";
            feishuAlertService.sendPriceAlert("BTC", new java.math.BigDecimal("68500.25"), new java.math.BigDecimal("63000.00"), "up", btcReason);

            // 场景 2: ETH 恐慌抛售
            String ethReason = "链上监测数据显示，多个处于长期休眠状态的「远古鲸鱼」地址在过去 2 小时内向交易所合计转入了超过 5 万枚以太坊，这一异常动向迅速在推特及社区内部引发了潜在抛压的恐慌情绪。此外，由于以太坊主网在测试网坎昆升级过程中出现了短暂的数据同步延迟，虽然开发组已解释为正常参数调整，但市场对于升级进度的不确定性担忧依然导致了短时的非理性抛售。";
            feishuAlertService.sendPriceAlert("ETH", new java.math.BigDecimal("3120.45"), new java.math.BigDecimal("3300.00"), "down", ethReason);

            // 场景 3: SOL 机构建仓
            String solReason = "Solana 生态近期表现异常强劲，继其官方手机 Saga 第二代预订量突破 10 万台后，多个基于 Solana 构建的头部 DePIN 项目宣布实现技术重大突破。技术分析师指出，SOL 在突破了 140 美元的关键阻力位后，触发了大量高频交易算法的买入指令，且灰度信托（Grayscale）最新确认将大幅调增其 Solana 信托的权重占比，基本面与技术面的双重利好共同推动了这一波动。";
            feishuAlertService.sendPriceAlert("SOL", new java.math.BigDecimal("158.88"), new java.math.BigDecimal("138.00"), "up", solReason);

            return R.ok("模拟告警任务已全部下达，请查收飞书播报。");
        } catch (Exception e) {
            log.error("模拟发送失败: {}", e.getMessage(), e);
            return R.error("模拟模拟失敗: " + e.getMessage());
        }
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

    /**
     * 手动进行历史行情数据同步（采样同步）
     * 
     * <p>接口: POST /api/v1/admin/sync-history</p>
     * 
     * @param days 回溯天数（默认 365 天）
     * @return 同步结果
     */
    @PostMapping("/sync-history")
    public R<String> syncHistoryData(@RequestParam(defaultValue = "365") int days) {
        log.info("接收到手动同步历史数据请求，天数: {}", days);
        java.util.List<String> coreSymbols = java.util.List.of("BTC", "ETH", "USDT", "SOL", "BNB");
        try {
            int count = cryptoMarketService.syncHistoricalRates(coreSymbols, days);
            String message = String.format("成功同步 %d 条历史汇率记录", count);
            return R.ok(message);
        } catch (Exception e) {
            log.error("同步历史数据失败: {}", e.getMessage(), e);
            return R.error("同步历史数据失败: " + e.getMessage());
        }
    }
}
