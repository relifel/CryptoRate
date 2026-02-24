package com.cryptorate.mapper;

import com.cryptorate.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 用户数据访问接口
 * 
 * <p>MyBatis Mapper 接口，对应 UserMapper.xml</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
 */
@Mapper
public interface UserMapper {

    /**
     * 插入用户
     * 
     * @param user 用户对象
     * @return 影响的行数
     */
    int insert(User user);

    /**
     * 根据 ID 删除用户
     * 
     * @param id 用户ID
     * @return 影响的行数
     */
    int deleteById(@Param("id") Long id);

    /**
     * 更新用户信息
     * 
     * @param user 用户对象
     * @return 影响的行数
     */
    int update(User user);

    /**
     * 根据 ID 查询用户
     * 
     * @param id 用户ID
     * @return 用户对象
     */
    User selectById(@Param("id") Long id);

    /**
     * 根据用户名查询用户
     * 
     * @param username 用户名
     * @return 用户对象
     */
    User selectByUsername(@Param("username") String username);

    /**
     * 检查用户名是否存在
     * 
     * @param username 用户名
     * @return 存在返回 true，否则返回 false
     */
    boolean existsByUsername(@Param("username") String username);
}
