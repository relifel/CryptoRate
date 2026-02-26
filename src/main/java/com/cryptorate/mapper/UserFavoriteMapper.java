package com.cryptorate.mapper;

import com.cryptorate.entity.UserFavorite;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户收藏数据访问接口
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-27
 */
@Mapper
public interface UserFavoriteMapper {

    /**
     * 插入收藏记录
     *
     * @param favorite 收藏实体
     * @return 影响行数
     */
    int insert(UserFavorite favorite);

    /**
     * 根据用户ID和币种删除收藏
     *
     * @param userId 用户ID
     * @param symbol 币种代码
     * @return 影响行数
     */
    int deleteByUserIdAndSymbol(@Param("userId") Long userId, @Param("symbol") String symbol);

    /**
     * 查询用户的所有收藏记录
     *
     * @param userId 用户ID
     * @return 收藏列表
     */
    List<UserFavorite> selectByUserId(@Param("userId") Long userId);

    /**
     * 查询用户是否已收藏某币种
     *
     * @param userId 用户ID
     * @param symbol 币种代码
     * @return 收藏记录（null 表示未收藏）
     */
    UserFavorite selectByUserIdAndSymbol(@Param("userId") Long userId, @Param("symbol") String symbol);

    /**
     * 查询用户已收藏的所有币种代码
     *
     * @param userId 用户ID
     * @return 币种代码列表
     */
    List<String> selectSymbolsByUserId(@Param("userId") Long userId);
}
