package com.cryptorate.service;

import com.cryptorate.common.exception.ApiException;
import com.cryptorate.entity.UserFavorite;
import com.cryptorate.mapper.UserFavoriteMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户收藏业务服务
 *
 * <p>
 * 管理用户对加密货币的收藏（添加/取消/查询），
 * 所有操作均绑定 userId 防止越权。
 * </p>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-27
 */
@Slf4j
@Service
public class FavoriteService {

    private final UserFavoriteMapper favoriteMapper;

    @Autowired
    public FavoriteService(UserFavoriteMapper favoriteMapper) {
        this.favoriteMapper = favoriteMapper;
    }

    /**
     * 添加收藏
     *
     * <p>
     * 如果用户已收藏该币种，直接返回（幂等操作）。
     * </p>
     *
     * @param userId 当前用户ID（从 JWT 解析）
     * @param symbol 币种代码
     */
    public void addFavorite(Long userId, String symbol) {
        log.info("用户 {} 添加收藏: {}", userId, symbol);

        // 检查是否已收藏（幂等：重复收藏不报错）
        UserFavorite existing = favoriteMapper.selectByUserIdAndSymbol(userId, symbol.toUpperCase());
        if (existing != null) {
            log.info("用户 {} 已收藏 {}，无需重复添加", userId, symbol);
            return;
        }

        UserFavorite favorite = new UserFavorite();
        favorite.setUserId(userId);
        favorite.setSymbol(symbol.toUpperCase());
        favorite.setCreatedAt(LocalDateTime.now());

        int rows = favoriteMapper.insert(favorite);
        if (rows <= 0) {
            log.error("收藏失败，用户: {}, 币种: {}", userId, symbol);
            throw new ApiException(500, "收藏失败");
        }
        log.info("收藏成功，用户: {}, 币种: {}", userId, symbol);
    }

    /**
     * 取消收藏
     *
     * <p>
     * 如果用户未收藏该币种，直接返回（幂等操作）。
     * </p>
     *
     * @param userId 当前用户ID（从 JWT 解析）
     * @param symbol 币种代码
     */
    public void removeFavorite(Long userId, String symbol) {
        log.info("用户 {} 取消收藏: {}", userId, symbol);

        int rows = favoriteMapper.deleteByUserIdAndSymbol(userId, symbol.toUpperCase());
        if (rows > 0) {
            log.info("取消收藏成功，用户: {}, 币种: {}", userId, symbol);
        } else {
            log.info("用户 {} 未收藏 {}，无需取消", userId, symbol);
        }
    }

    /**
     * 获取用户收藏的币种代码列表
     *
     * @param userId 当前用户ID（从 JWT 解析）
     * @return 已收藏的币种代码列表（如 ["BTC", "ETH"]）
     */
    public List<String> getFavoriteSymbols(Long userId) {
        log.info("查询用户 {} 的收藏列表", userId);
        return favoriteMapper.selectSymbolsByUserId(userId);
    }

    /**
     * 获取用户的完整收藏记录（含收藏时间）
     *
     * @param userId 当前用户ID
     * @return 收藏记录列表
     */
    public List<UserFavorite> getFavorites(Long userId) {
        return favoriteMapper.selectByUserId(userId);
    }
}
