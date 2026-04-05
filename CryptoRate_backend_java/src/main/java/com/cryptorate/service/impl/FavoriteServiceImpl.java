package com.cryptorate.service.impl;

import com.cryptorate.common.exception.ApiException;
import com.cryptorate.entity.UserFavorite;
import com.cryptorate.mapper.UserFavoriteMapper;
import com.cryptorate.service.FavoriteService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户收藏业务实现类
 *
 * <p>
 * 实现 {@link FavoriteService} 接口，提供收藏的增、删、批量删、
 * 排序、备注、价格提醒等完整功能。所有操作均绑定 userId 防止越权。
 * </p>
 *
 * @author CryptoRate Team
 * @version 2.0
 * @since 2026-03-08
 */
@Slf4j
@Service
public class FavoriteServiceImpl implements FavoriteService {

    private final UserFavoriteMapper favoriteMapper;

    @Autowired
    public FavoriteServiceImpl(UserFavoriteMapper favoriteMapper) {
        this.favoriteMapper = favoriteMapper;
    }

    @Override
    public void addFavorite(Long userId, String symbol) {
        if (userId == null) {
            log.error("添加收藏失败：userId 为空");
            throw new ApiException(401, "请登录后再进行操作");
        }
        
        log.info("用户 {} 尝试添加收藏: {}", userId, symbol);
        String upperSymbol = symbol.toUpperCase();

        // 幂等校验：如果库中已存在，则记录并返回，不报错
        UserFavorite existing = favoriteMapper.selectByUserIdAndSymbol(userId, upperSymbol);
        if (existing != null) {
            log.info("用户 {} 已收藏过 {}，忽略重复操作", userId, upperSymbol);
            return;
        }

        UserFavorite favorite = new UserFavorite();
        favorite.setUserId(userId);
        favorite.setSymbol(upperSymbol);
        favorite.setSortOrder(0); // 显式设为默认值 0
        favorite.setCreatedAt(LocalDateTime.now());

        try {
            int rows = favoriteMapper.insert(favorite);
            if (rows <= 0) {
                log.error("数据库插入失败，可能由于并发或其他原因：userId={}, symbol={}", userId, upperSymbol);
                throw new ApiException(500, "系统繁忙，收藏失败");
            }
            log.info("收藏成功：userId={}, symbol={}", userId, upperSymbol);
        } catch (Exception e) {
            log.error("执行收藏插入 SQL 时发生异常: {}", e.getMessage(), e);
            throw new ApiException(500, "服务异常，请稍后再试");
        }
    }

    @Override
    public void removeFavorite(Long userId, String symbol) {
        log.info("用户 {} 取消收藏: {}", userId, symbol);
        int rows = favoriteMapper.deleteByUserIdAndSymbol(userId, symbol.toUpperCase());
        log.info("取消收藏结果: userId={}, symbol={}, affected={}", userId, symbol, rows);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchRemove(Long userId, List<String> symbols) {
        if (symbols == null || symbols.isEmpty()) {
            log.warn("批量取消收藏：symbols 为空，跳过");
            return;
        }
        // 统一转大写
        List<String> upperSymbols = symbols.stream().map(String::toUpperCase).toList();
        log.info("用户 {} 批量取消收藏: {}", userId, upperSymbols);
        int rows = favoriteMapper.batchDeleteBySymbols(userId, upperSymbols);
        log.info("批量取消完成，affected={}", rows);
    }

    @Override
    public List<String> getFavoriteSymbols(Long userId) {
        log.info("查询用户 {} 的收藏列表（仅代码）", userId);
        return favoriteMapper.selectSymbolsByUserId(userId);
    }

    @Override
    public List<UserFavorite> getFavorites(Long userId) {
        log.info("查询用户 {} 的完整收藏列表", userId);
        return favoriteMapper.selectByUserId(userId);
    }

    @Override
    public void updateNote(Long userId, String symbol, String note) {
        log.info("更新备注: userId={}, symbol={}, note={}", userId, symbol, note);
        int rows = favoriteMapper.updateNote(userId, symbol.toUpperCase(), note);
        if (rows <= 0) {
            log.warn("备注更新失败（可能未收藏该币种）: userId={}, symbol={}", userId, symbol);
            throw new ApiException(404, "未找到该收藏记录");
        }
    }

    @Override
    public void updatePriceAlert(Long userId, String symbol, BigDecimal priceUpper, BigDecimal priceLower) {
        log.info("设置价格提醒: userId={}, symbol={}, upper={}, lower={}", userId, symbol, priceUpper, priceLower);
        int rows = favoriteMapper.updatePriceAlert(userId, symbol.toUpperCase(), priceUpper, priceLower);
        if (rows <= 0) {
            log.warn("价格提醒设置失败: userId={}, symbol={}", userId, symbol);
            throw new ApiException(404, "未找到该收藏记录");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateSortOrder(Long userId, String symbol, Integer sortOrder) {
        log.info("更新排序: userId={}, symbol={}, sortOrder={}", userId, symbol, sortOrder);
        favoriteMapper.updateSortOrder(userId, symbol.toUpperCase(), sortOrder);
    }
}
