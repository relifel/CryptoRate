package com.cryptorate.service.impl;

import com.cryptorate.dto.AssetDTO;
import com.cryptorate.entity.UserAsset;
import com.cryptorate.mapper.UserAssetMapper;
import com.cryptorate.service.AssetService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户资产管理业务实现类
 *
 * <p>
 * 实现 {@link AssetService} 接口，管理用户的加密货币持仓记录。
 * </p>
 *
 * @author CryptoRate Team
 * @version 1.1
 * @since 2026-03-07
 */
@Slf4j
@Service
public class AssetServiceImpl implements AssetService {

    private final UserAssetMapper userAssetMapper;

    @Autowired
    public AssetServiceImpl(UserAssetMapper userAssetMapper) {
        this.userAssetMapper = userAssetMapper;
    }

    @Override
    public List<AssetDTO> getAssets(Long userId) {
        log.info("查询用户资产，用户ID: {}", userId);

        List<UserAsset> assets = userAssetMapper.selectByUserId(userId);

        return assets.stream().map(asset -> {
            AssetDTO dto = new AssetDTO();
            dto.setId(asset.getId());
            dto.setSymbol(asset.getSymbol());
            dto.setAmount(asset.getAmount());
            dto.setCost(asset.getCost());
            // 暂不对接实时行情，currentPrice / totalValue 留空
            dto.setCurrentPrice(null);
            dto.setTotalValue(null);
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public UserAsset saveAsset(Long userId, String symbol, BigDecimal amount, BigDecimal cost) {
        log.info("保存资产，用户ID: {}, 币种: {}, 数量: {}, 成本: {}", userId, symbol, amount, cost);

        // 币种代码统一大写
        String upperSymbol = symbol.toUpperCase();

        // 检查是否已存在
        UserAsset existingAsset = userAssetMapper.selectByUserIdAndSymbol(userId, upperSymbol);

        if (existingAsset != null) {
            // 更新数量和成本
            existingAsset.setAmount(amount);
            existingAsset.setCost(cost != null ? cost : BigDecimal.ZERO);
            existingAsset.setUpdatedAt(LocalDateTime.now());
            userAssetMapper.update(existingAsset);
            log.info("更新资产成功，ID: {}", existingAsset.getId());
            return existingAsset;
        } else {
            // 新增资产
            UserAsset newAsset = new UserAsset();
            newAsset.setUserId(userId);
            newAsset.setSymbol(upperSymbol);
            newAsset.setAmount(amount);
            newAsset.setCost(cost != null ? cost : BigDecimal.ZERO);
            newAsset.setCreatedAt(LocalDateTime.now());
            newAsset.setUpdatedAt(LocalDateTime.now());
            userAssetMapper.insert(newAsset);
            log.info("添加资产成功，ID: {}", newAsset.getId());
            return newAsset;
        }
    }

    @Override
    public void deleteAsset(Long assetId, Long userId) {
        log.info("删除资产，ID: {}, 用户ID: {}", assetId, userId);

        int rows = userAssetMapper.deleteByIdAndUserId(assetId, userId);
        if (rows > 0) {
            log.info("删除资产成功");
        } else {
            log.warn("删除资产失败（资产不存在或不属于当前用户），ID: {}, 用户ID: {}", assetId, userId);
            throw new RuntimeException("资产不存在或无权删除");
        }
    }
}
