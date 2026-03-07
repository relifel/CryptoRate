package com.cryptorate.mapper;

import com.cryptorate.entity.UserFavorite;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;

/**
 * 用户收藏数据访问接口
 *
 * @author CryptoRate Team
 * @version 2.0
 * @since 2026-02-27
 */
@Mapper
public interface UserFavoriteMapper {

    /**
     * 插入收藏记录
     */
    int insert(UserFavorite favorite);

    /**
     * 根据用户ID和币种删除收藏
     */
    int deleteByUserIdAndSymbol(@Param("userId") Long userId, @Param("symbol") String symbol);

    /**
     * 批量删除收藏（按 symbol 列表）
     */
    int batchDeleteBySymbols(@Param("userId") Long userId, @Param("symbols") List<String> symbols);

    /**
     * 查询用户的所有收藏记录（按 sort_order 升序）
     */
    List<UserFavorite> selectByUserId(@Param("userId") Long userId);

    /**
     * 查询用户是否已收藏某币种
     */
    UserFavorite selectByUserIdAndSymbol(@Param("userId") Long userId, @Param("symbol") String symbol);

    /**
     * 查询用户已收藏的所有币种代码
     */
    List<String> selectSymbolsByUserId(@Param("userId") Long userId);

    /**
     * 更新备注
     */
    int updateNote(@Param("userId") Long userId, @Param("symbol") String symbol, @Param("note") String note);

    /**
     * 更新价格提醒阈值
     */
    int updatePriceAlert(@Param("userId") Long userId, @Param("symbol") String symbol,
            @Param("priceUpper") BigDecimal priceUpper, @Param("priceLower") BigDecimal priceLower);

    /**
     * 更新排序权重
     */
    int updateSortOrder(@Param("userId") Long userId, @Param("symbol") String symbol,
            @Param("sortOrder") Integer sortOrder);
}
