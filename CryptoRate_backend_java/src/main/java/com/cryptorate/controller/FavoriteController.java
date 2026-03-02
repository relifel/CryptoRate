package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.interceptor.JwtInterceptor;
import com.cryptorate.service.FavoriteService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 用户收藏控制器
 *
 * <p>
 * 提供加密货币收藏的 RESTful 接口。所有接口均需 JWT 认证，
 * userId 从拦截器注入的 request attribute 中获取，防止越权。
 * </p>
 *
 * <h3>接口列表：</h3>
 * <ul>
 * <li>POST /api/v1/favorites/{symbol} — 添加收藏</li>
 * <li>DELETE /api/v1/favorites/{symbol} — 取消收藏</li>
 * <li>GET /api/v1/favorites/list — 获取收藏列表</li>
 * </ul>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-27
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

    /**
     * 从 request 中获取当前登录用户的 ID
     *
     * <p>
     * userId 由 {@link JwtInterceptor} 在校验 Token 后写入 request attribute。
     * 如果获取不到，说明用户未登录或 Token 无效（正常情况下拦截器会先阻止请求）。
     * </p>
     *
     * @param request HTTP 请求
     * @return 当前用户ID
     * @throws RuntimeException 获取不到 userId（理论上不会触发）
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        Object userIdObj = request.getAttribute(JwtInterceptor.CURRENT_USER_ID);
        if (userIdObj == null) {
            log.error("无法从 request 属性中获取 userId，拦截器可能未正确配置");
            throw new RuntimeException("用户未登录");
        }
        return (Long) userIdObj;
    }

    /**
     * 添加收藏
     *
     * <p>
     * 接口: POST /api/v1/favorites/{symbol}
     * </p>
     * <p>
     * 幂等操作：重复收藏同一币种不会报错。
     * </p>
     *
     * @param symbol  币种代码（如 BTC、ETH）
     * @param request HTTP 请求（用于获取 userId）
     * @return 成功响应
     */
    @PostMapping("/{symbol}")
    public R<Void> addFavorite(@PathVariable String symbol, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("收藏请求: userId={}, symbol={}", userId, symbol);
        favoriteService.addFavorite(userId, symbol);
        return R.ok("收藏成功", null);
    }

    /**
     * 取消收藏
     *
     * <p>
     * 接口: DELETE /api/v1/favorites/{symbol}
     * </p>
     * <p>
     * 幂等操作：取消未收藏的币种不会报错。
     * </p>
     *
     * @param symbol  币种代码
     * @param request HTTP 请求
     * @return 成功响应
     */
    @DeleteMapping("/{symbol}")
    public R<Void> removeFavorite(@PathVariable String symbol, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("取消收藏请求: userId={}, symbol={}", userId, symbol);
        favoriteService.removeFavorite(userId, symbol);
        return R.ok("已取消收藏", null);
    }

    /**
     * 获取当前用户的收藏列表
     *
     * <p>
     * 接口: GET /api/v1/favorites/list
     * </p>
     * <p>
     * 返回用户已收藏的所有币种代码列表。
     * </p>
     *
     * @param request HTTP 请求
     * @return 币种代码列表（如 ["BTC", "ETH", "SOL"]）
     */
    @GetMapping("/list")
    public R<List<String>> getFavorites(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        List<String> symbols = favoriteService.getFavoriteSymbols(userId);
        return R.ok(symbols);
    }
}
