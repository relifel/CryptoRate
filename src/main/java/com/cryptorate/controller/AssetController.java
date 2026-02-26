package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.dto.AssetDTO;
import com.cryptorate.entity.UserAsset;
import com.cryptorate.interceptor.JwtInterceptor;
import com.cryptorate.service.AssetService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.List;

/**
 * 用户资产管理控制器
 *
 * <p>
 * 提供用户资产的 CRUD 接口。所有接口均需 JWT 认证，
 * userId 从拦截器注入的 request attribute 中获取，防止越权。
 * </p>
 *
 * <h3>接口列表：</h3>
 * <ul>
 * <li>GET /api/v1/assets — 查询当前用户的资产列表</li>
 * <li>POST /api/v1/assets — 添加/修改资产（同币种自动覆盖）</li>
 * <li>DELETE /api/v1/assets/{id} — 删除资产记录</li>
 * </ul>
 *
 * @author CryptoRate Team
 * @version 1.1
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
     * 从 request 中获取当前登录用户的 ID
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        Object userIdObj = request.getAttribute(JwtInterceptor.CURRENT_USER_ID);
        if (userIdObj == null) {
            log.error("无法从 request 属性中获取 userId");
            throw new RuntimeException("用户未登录");
        }
        return (Long) userIdObj;
    }

    /**
     * 查询当前用户的资产列表
     *
     * <p>
     * 接口: GET /api/v1/assets
     * </p>
     */
    @GetMapping
    public R<List<AssetDTO>> getAssets(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("查询资产请求，用户ID: {}", userId);
        List<AssetDTO> assets = assetService.getAssets(userId);
        return R.ok(assets);
    }

    /**
     * 添加/修改资产
     *
     * <p>
     * 接口: POST /api/v1/assets
     * </p>
     * <p>
     * 同一用户同一币种只保留一条记录，重复提交自动覆盖。
     * </p>
     */
    @PostMapping
    public R<UserAsset> saveAsset(@RequestBody AssetRequest body, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("保存资产请求，用户ID: {}, 币种: {}, 数量: {}, 成本: {}",
                userId, body.getSymbol(), body.getAmount(), body.getCost());

        UserAsset asset = assetService.saveAsset(userId, body.getSymbol(), body.getAmount(), body.getCost());
        return R.ok(asset);
    }

    /**
     * 删除资产记录
     *
     * <p>
     * 接口: DELETE /api/v1/assets/{id}
     * </p>
     * <p>
     * 仅能删除自己的资产，后端会校验 userId。
     * </p>
     */
    @DeleteMapping("/{id}")
    public R<Void> deleteAsset(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("删除资产请求，资产ID: {}, 用户ID: {}", id, userId);
        assetService.deleteAsset(id, userId);
        return R.ok("删除成功", null);
    }

    /**
     * 资产请求对象
     */
    @Data
    public static class AssetRequest {
        /** 加密货币代码（如 BTC） */
        private String symbol;
        /** 持有数量 */
        private BigDecimal amount;
        /** 持仓总成本（USD） */
        private BigDecimal cost;
    }
}
