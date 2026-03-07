package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.dto.FavoriteUpdateDTO;
import com.cryptorate.entity.UserFavorite;
import com.cryptorate.interceptor.JwtInterceptor;
import com.cryptorate.service.FavoriteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 用户收藏控制器 (v2)
 *
 * <p>
 * 提供加密货币收藏的完整 RESTful 接口。所有接口均需 JWT 认证。
 * </p>
 *
 * <pre>
 * POST   /api/v1/favorites/{symbol}        添加收藏
 * DELETE /api/v1/favorites/{symbol}        取消收藏
 * DELETE /api/v1/favorites/batch           批量取消收藏
 * GET    /api/v1/favorites/list            获取收藏列表（完整对象）
 * PUT    /api/v1/favorites/{symbol}/note   更新备注
 * PUT    /api/v1/favorites/{symbol}/alert  设置价格提醒
 * PUT    /api/v1/favorites/sort            持久化排序
 * </pre>
 *
 * @author CryptoRate Team
 * @version 2.0
 * @since 2026-03-08
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @Autowired
    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    // ─── 基础 CRUD ─────────────────────────────────────

    /** 添加收藏 */
    @PostMapping("/{symbol}")
    public R<Void> addFavorite(@PathVariable String symbol, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("POST /favorites/{}, userId={}", symbol, userId);
        favoriteService.addFavorite(userId, symbol);
        return R.ok("收藏成功", null);
    }

    /** 取消收藏 */
    @DeleteMapping("/{symbol}")
    public R<Void> removeFavorite(@PathVariable String symbol, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("DELETE /favorites/{}, userId={}", symbol, userId);
        favoriteService.removeFavorite(userId, symbol);
        return R.ok("已取消收藏", null);
    }

    /** 批量取消收藏 */
    @DeleteMapping("/batch")
    public R<Void> batchRemove(@RequestBody Map<String, List<String>> body, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        List<String> symbols = body.get("symbols");
        log.info("DELETE /favorites/batch, userId={}, symbols={}", userId, symbols);
        favoriteService.batchRemove(userId, symbols);
        return R.ok("批量取消完成", null);
    }

    /** 获取完整收藏列表（含备注、提醒等） */
    @GetMapping("/list")
    public R<List<UserFavorite>> getFavorites(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        List<UserFavorite> list = favoriteService.getFavorites(userId);
        return R.ok(list);
    }

    // ─── 扩展功能 ─────────────────────────────────────

    /** 更新备注 */
    @PutMapping("/{symbol}/note")
    public R<Void> updateNote(@PathVariable String symbol,
            @Valid @RequestBody FavoriteUpdateDTO dto,
            HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("PUT /favorites/{}/note, userId={}", symbol, userId);
        favoriteService.updateNote(userId, symbol, dto.getNote());
        return R.ok("备注已更新", null);
    }

    /** 设置价格提醒阈值 */
    @PutMapping("/{symbol}/alert")
    public R<Void> updatePriceAlert(@PathVariable String symbol,
            @Valid @RequestBody FavoriteUpdateDTO dto,
            HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("PUT /favorites/{}/alert, userId={}", symbol, userId);
        favoriteService.updatePriceAlert(userId, symbol, dto.getPriceUpper(), dto.getPriceLower());
        return R.ok("提醒已设置", null);
    }

    /** 持久化排序（接收 [{symbol, sortOrder}] 数组） */
    @PutMapping("/sort")
    public R<Void> updateSort(@RequestBody List<Map<String, Object>> sortList,
            HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("PUT /favorites/sort, userId={}, count={}", userId, sortList.size());
        for (Map<String, Object> item : sortList) {
            String symbol = (String) item.get("symbol");
            Integer sortOrder = (Integer) item.get("sortOrder");
            favoriteService.updateSortOrder(userId, symbol, sortOrder);
        }
        return R.ok("排序已保存", null);
    }

    // ─── 辅助方法 ─────────────────────────────────────

    private Long getCurrentUserId(HttpServletRequest request) {
        Object userIdObj = request.getAttribute(JwtInterceptor.CURRENT_USER_ID);
        if (userIdObj == null) {
            log.error("无法从 request 属性中获取 userId");
            throw new RuntimeException("用户未登录");
        }
        return (Long) userIdObj;
    }
}
