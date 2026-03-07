package com.cryptorate.service;

import com.cryptorate.entity.UserFavorite;

import java.math.BigDecimal;
import java.util.List;

/**
 * 用户收藏业务服务接口
 *
 * @author CryptoRate Team
 * @version 2.0
 * @since 2026-02-27
 */
public interface FavoriteService {

    /**
     * 添加收藏
     */
    void addFavorite(Long userId, String symbol);

    /**
     * 取消收藏
     */
    void removeFavorite(Long userId, String symbol);

    /**
     * 批量取消收藏
     */
    void batchRemove(Long userId, List<String> symbols);

    /**
     * 获取用户收藏的币种代码列表
     */
    List<String> getFavoriteSymbols(Long userId);

    /**
     * 获取用户的完整收藏记录（含备注、提醒等）
     */
    List<UserFavorite> getFavorites(Long userId);

    /**
     * 更新收藏项的备注
     */
    void updateNote(Long userId, String symbol, String note);

    /**
     * 更新收藏项的价格提醒阈值
     */
    void updatePriceAlert(Long userId, String symbol, BigDecimal priceUpper, BigDecimal priceLower);

    /**
     * 更新收藏项的排序权重
     */
    void updateSortOrder(Long userId, String symbol, Integer sortOrder);
}
