package com.cryptorate.mapper;

import com.cryptorate.entity.RateHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;

/**
 * 汇率历史数据访问接口
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-14
 */
@Mapper
public interface RateHistoryMapper {

    /**
     * 插入汇率历史记录
     *
     * @param rateHistory 汇率历史记录
     * @return 影响的行数
     */
    int insert(RateHistory rateHistory);

    /**
     * 批量插入汇率历史记录
     *
     * @param list 汇率历史记录列表
     * @return 影响的行数
     */
    int batchInsert(@Param("list") List<RateHistory> list);

    /**
     * 获取所有支持的币种代码
     *
     * @return 币种代码列表
     */
    List<String> selectAllSymbols();

    /**
     * 获取指定币种的最新汇率记录
     *
     * @param symbol 币种代码
     * @return 汇率历史记录
     */
    RateHistory selectLatestBySymbol(@Param("symbol") String symbol);

    /**
     * 获取所有币种的最新汇率记录
     *
     * @return 汇率历史记录列表
     */
    List<RateHistory> selectAllLatestRates();

    /**
     * 查询指定币种在指定时间范围内的历史汇率
     *
     * @param symbol    币种代码
     * @param startTime 开始时间戳
     * @param endTime   结束时间戳
     * @return 汇率历史记录列表
     */
    List<RateHistory> selectBySymbolAndTimeRange(@Param("symbol") String symbol,
                                                   @Param("startTime") Long startTime,
                                                   @Param("endTime") Long endTime);

    /**
     * 获取指定币种在指定时间范围内的最大值
     *
     * @param symbol    币种代码
     * @param startTime 开始时间戳
     * @param endTime   结束时间戳
     * @return 最大值
     */
    BigDecimal selectMaxRate(@Param("symbol") String symbol,
                              @Param("startTime") Long startTime,
                              @Param("endTime") Long endTime);

    /**
     * 获取指定币种在指定时间范围内的最小值
     *
     * @param symbol    币种代码
     * @param startTime 开始时间戳
     * @param endTime   结束时间戳
     * @return 最小值
     */
    BigDecimal selectMinRate(@Param("symbol") String symbol,
                              @Param("startTime") Long startTime,
                              @Param("endTime") Long endTime);

    /**
     * 获取指定币种在指定时间范围内的平均值
     *
     * @param symbol    币种代码
     * @param startTime 开始时间戳
     * @param endTime   结束时间戳
     * @return 平均值
     */
    BigDecimal selectAvgRate(@Param("symbol") String symbol,
                              @Param("startTime") Long startTime,
                              @Param("endTime") Long endTime);
}
