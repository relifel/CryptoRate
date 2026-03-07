package com.cryptorate.service;

import com.cryptorate.dto.AssetDTO;
import com.cryptorate.entity.UserAsset;

import java.math.BigDecimal;
import java.util.List;

/**
 * 用户资产管理服务接口
 *
 * @author CryptoRate Team
 * @version 1.1
 * @since 2026-02-14
 */
public interface AssetService {

    /**
     * 查询用户的所有资产记录
     *
     * @param userId 用户ID（从 JWT 获取）
     * @return 资产列表
     */
    List<AssetDTO> getAssets(Long userId);

    /**
     * 添加或修改资产
     *
     * @param userId 用户ID（从 JWT 获取）
     * @param symbol 币种代码
     * @param amount 持有数量
     * @param cost   持仓总成本
     * @return 资产对象
     */
    UserAsset saveAsset(Long userId, String symbol, BigDecimal amount, BigDecimal cost);

    /**
     * 删除资产记录（防越权：必须校验 userId）
     *
     * @param assetId 资产ID
     * @param userId  当前用户ID（从 JWT 获取）
     */
    void deleteAsset(Long assetId, Long userId);
}
