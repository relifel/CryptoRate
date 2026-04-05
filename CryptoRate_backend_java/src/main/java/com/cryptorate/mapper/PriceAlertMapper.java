package com.cryptorate.mapper;

import com.cryptorate.entity.PriceAlert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户价格告警 Mapper 接口
 * 
 * @author CryptoRate Team
 * @since 2026-04-04
 */
@Mapper
public interface PriceAlertMapper {

    /** 插入告警规则 */
    int insert(PriceAlert alert);

    /** 更新告警规则（含策略变更） */
    int update(PriceAlert alert);

    /** 触发后更新触发时间 */
    int updateLastTriggered(@Param("id") Long id);

    /** 物理删除或通过 id 获取 */
    PriceAlert selectById(@Param("id") Long id);

    /** 查询用户的所有告警 */
    List<PriceAlert> selectByUserId(@Param("userId") Long userId);

    /**
     * 【核心监控查询】
     * 捞出某个币种当前所有处于监控中 (ACTIVE) 的告警规则
     */
    List<PriceAlert> findActiveAlertsBySymbol(@Param("symbol") String symbol);

    /** 批量删除 */
    int deleteById(@Param("id") Long id, @Param("userId") Long userId);
}
