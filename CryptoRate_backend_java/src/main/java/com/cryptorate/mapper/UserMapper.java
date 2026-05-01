package com.cryptorate.mapper;

import com.cryptorate.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 用户数据访问接口
 * 
 * <p>
 * MyBatis Mapper 接口，对应 UserMapper.xml
 * </p>
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
     * 更新用户信息（通用，支持所有字段）
     * 
     * @param user 用户对象
     * @return 影响的行数
     */
    int update(User user);

    /**
     * 更新个人资料字段（昵称、邮箱、手机、头像、简介），不涉及密码
     *
     * @param user 用户对象（含需更新的资料字段和 id）
     * @return 影响的行数
     */
    int updateProfile(User user);

    /**
     * 更新用户状态（激活/禁用）
     *
     * @param id     用户ID
     * @param status 状态 (ACTIVE/DISABLED)
     * @return 影响行数
     */
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    /**
     * 仅更新密码字段
     *
     * @param id       用户ID
     * @param password 已加密的新密码
     * @return 影响的行数
     */
    int updatePassword(@Param("id") Long id, @Param("password") String password);

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

    /**
     * 获取所有用户信息（支持关键字搜索）
     *
     * @param keyword 搜索关键字（用户名或邮箱）
     * @return 用户列表
     */
    java.util.List<User> selectAll(@Param("keyword") String keyword);

    /**
     * 获取所有开启了飞书预警的用户列表
     *
     * @return 开启预警的用户列表
     */
    java.util.List<User> selectUsersWithFeishuAlertEnabled();

    /**
     * 获取所有订阅了 AI 每日简报的用户列表
     *
     * @return 订阅简报的用户列表
     */
    java.util.List<User> selectUsersWithDailyBriefingEnabled();
}
