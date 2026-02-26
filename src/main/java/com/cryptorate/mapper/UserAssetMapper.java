package com.cryptorate.mapper;

import com.cryptorate.entity.UserAsset;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户资产数据访问接口
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Mapper
public interface UserAssetMapper {

    /**
     * 插入资产记录
     *
     * @param userAsset 用户资产
     * @return 影响的行数
     */
    int insert(UserAsset userAsset);

    /**
     * 根据 ID 删除资产记录
     *
     * @param id 资产ID
     * @return 影响的行数
     */
    int deleteById(@Param("id") Long id);

    /**
     * 根据 ID 和用户 ID 删除资产记录（防越权）
     *
     * @param id     资产ID
     * @param userId 用户ID
     * @return 影响的行数
     */
    int deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * 更新资产数量
     *
     * @param userAsset 用户资产
     * @return 影响的行数
     */
    int update(UserAsset userAsset);

    /**
     * 根据 ID 查询资产记录
     *
     * @param id 资产ID
     * @return 用户资产
     */
    UserAsset selectById(@Param("id") Long id);

    /**
     * 查询指定用户的所有资产记录
     *
     * @param userId 用户ID
     * @return 用户资产列表
     */
    List<UserAsset> selectByUserId(@Param("userId") Long userId);

    /**
     * 查询指定用户的指定币种资产
     *
     * @param userId 用户ID
     * @param symbol 币种代码
     * @return 用户资产
     */
    UserAsset selectByUserIdAndSymbol(@Param("userId") Long userId, @Param("symbol") String symbol);
}
