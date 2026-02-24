package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.dto.AssetDTO;
import com.cryptorate.entity.UserAsset;
import com.cryptorate.service.AssetService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * 用户资产管理控制器
 * 
 * <p>提供用户资产管理接口</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/assets")
public class AssetController {

    private final AssetService assetService;

    @Autowired
    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    /**
     * 查询个人资产记录
     * 
     * <p>接口: GET /api/v1/assets</p>
     * <p>注意：暂时使用固定用户 ID（1），后续集成认证后从 Token 获取</p>
     * 
     * @return 资产列表
     */
    @GetMapping
    public R<List<AssetDTO>> getAssets() {
        // TODO: 从认证 Token 中获取用户 ID
        Long userId = 1L;
        log.info("接收到查询资产请求，用户ID: {}", userId);
        List<AssetDTO> assets = assetService.getAssets(userId);
        return R.ok(assets);
    }

    /**
     * 添加/修改资产
     * 
     * <p>接口: POST /api/v1/assets</p>
     * 
     * @param request 资产请求
     * @return 资产对象
     */
    @PostMapping
    public R<UserAsset> saveAsset(@RequestBody AssetRequest request) {
        // TODO: 从认证 Token 中获取用户 ID
        Long userId = 1L;
        log.info("接收到保存资产请求，用户ID: {}, 币种: {}, 数量: {}", 
                userId, request.getSymbol(), request.getAmount());
        
        UserAsset asset = assetService.saveAsset(userId, request.getSymbol(), request.getAmount());
        return R.ok(asset);
    }

    /**
     * 删除资产记录
     * 
     * <p>接口: DELETE /api/v1/assets/{id}</p>
     * 
     * @param id 资产ID
     * @return 成功响应
     */
    @DeleteMapping("/{id}")
    public R<Void> deleteAsset(@PathVariable Long id) {
        log.info("接收到删除资产请求，ID: {}", id);
        assetService.deleteAsset(id);
        return R.ok("删除成功", null);
    }

    /**
     * 资产请求对象
     */
    @Data
    public static class AssetRequest {
        private String symbol;
        private BigDecimal amount;
    }
}
