package com.cryptorate.service;

import com.cryptorate.dto.AssetDTO;
import com.cryptorate.entity.RateHistory;
import com.cryptorate.entity.UserAsset;
import com.cryptorate.mapper.RateHistoryMapper;
import com.cryptorate.mapper.UserAssetMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户资产管理服务
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Slf4j
@Service
public class AssetService {

    private final UserAssetMapper userAssetMapper;
    private final RateHistoryMapper rateHistoryMapper;

    @Autowired
    public AssetService(UserAssetMapper userAssetMapper, RateHistoryMapper rateHistoryMapper) {
        this.userAssetMapper = userAssetMapper;
        this.rateHistoryMapper = rateHistoryMapper;
    }

    /**
     * 查询个人资产记录
     *
     * @param userId 用户ID
     * @return 资产列表
     */
    public List<AssetDTO> getAssets(Long userId) {
        log.info("查询用户资产，用户ID: {}", userId);

        List<UserAsset> assets = userAssetMapper.selectByUserId(userId);

        // 转换为 DTO 并计算当前价值
        return assets.stream().map(asset -> {
            AssetDTO dto = new AssetDTO();
            dto.setId(asset.getId());
            dto.setSymbol(asset.getSymbol());
            dto.setAmount(asset.getAmount());

            // 获取当前价格
            RateHistory latestRate = rateHistoryMapper.selectLatestBySymbol(asset.getSymbol());
            BigDecimal currentPrice = latestRate != null ? latestRate.getRate() : BigDecimal.ZERO;
            dto.setCurrentPrice(currentPrice);

            // 计算总价值
            BigDecimal totalValue = asset.getAmount().multiply(currentPrice).setScale(2, RoundingMode.HALF_UP);
            dto.setTotalValue(totalValue);

            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * 添加或修改资产
     *
     * @param userId 用户ID
     * @param symbol 币种代码
     * @param amount 数量
     * @return 资产对象
     */
    public UserAsset saveAsset(Long userId, String symbol, BigDecimal amount) {
        log.info("保存资产，用户ID: {}, 币种: {}, 数量: {}", userId, symbol, amount);

        // 检查是否已存在
        UserAsset existingAsset = userAssetMapper.selectByUserIdAndSymbol(userId, symbol);

        if (existingAsset != null) {
            // 更新数量
            existingAsset.setAmount(amount);
            existingAsset.setUpdatedAt(LocalDateTime.now());
            userAssetMapper.update(existingAsset);
            log.info("更新资产成功");
            return existingAsset;
        } else {
            // 新增资产
            UserAsset newAsset = new UserAsset();
            newAsset.setUserId(userId);
            newAsset.setSymbol(symbol);
            newAsset.setAmount(amount);
            newAsset.setCreatedAt(LocalDateTime.now());
            newAsset.setUpdatedAt(LocalDateTime.now());
            userAssetMapper.insert(newAsset);
            log.info("添加资产成功，ID: {}", newAsset.getId());
            return newAsset;
        }
    }

    /**
     * 删除资产记录
     *
     * @param id 资产ID
     */
    public void deleteAsset(Long id) {
        log.info("删除资产，ID: {}", id);

        UserAsset asset = userAssetMapper.selectById(id);
        if (asset == null) {
            log.warn("资产不存在，ID: {}", id);
            throw new RuntimeException("资产不存在");
        }

        int rows = userAssetMapper.deleteById(id);
        if (rows > 0) {
            log.info("删除资产成功");
        } else {
            log.error("删除资产失败");
            throw new RuntimeException("删除资产失败");
        }
    }
}
