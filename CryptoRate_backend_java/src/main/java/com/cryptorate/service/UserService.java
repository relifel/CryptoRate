package com.cryptorate.service;

import com.cryptorate.dto.ChangePasswordDTO;
import com.cryptorate.dto.ProfileUpdateDTO;
import com.cryptorate.dto.UserLoginDTO;
import com.cryptorate.dto.UserRegisterDTO;
import com.cryptorate.entity.User;

/**
 * 用户业务逻辑服务接口
 *
 * <p>
 * 定义用户注册、登录、个人资料管理等核心业务契约。
 * 由 {@link impl.UserServiceImpl} 提供具体实现。
 * </p>
 *
 * @author CryptoRate Team
 * @version 3.0
 * @since 2026-03-08
 */
public interface UserService {

    // ======================================================
    // 认证相关
    // ======================================================

    /**
     * 用户注册
     *
     * @param dto 注册请求 DTO（用户名、密码、邮箱）
     * @return 注册成功的用户信息（不含密码）
     */
    User register(UserRegisterDTO dto);

    /**
     * 用户登录
     *
     * @param dto 登录请求 DTO（用户名、密码）
     * @return JWT Token 字符串
     */
    String login(UserLoginDTO dto);

    // ======================================================
    // CRUD
    // ======================================================

    /**
     * 根据 ID 查询用户（不含密码）
     *
     * @param id 用户ID
     * @return 用户对象，不存在则返回 null
     */
    User getUserById(Long id);

    /**
     * 根据用户名查询用户（不含密码）
     *
     * @param username 用户名
     * @return 用户对象，不存在则返回 null
     */
    User getUserByUsername(String username);

    /**
     * 更新用户信息（通用，支持所有可更新字段）
     *
     * @param user 用户对象（包含 ID）
     * @return 更新后的用户对象（不含密码）
     */
    User updateUser(User user);

    /**
     * 删除用户
     *
     * @param id 用户ID
     */
    void deleteUser(Long id);

    // ======================================================
    // 个人中心
    // ======================================================

    /**
     * 获取当前用户个人资料（不含密码）
     *
     * @param userId 当前登录用户 ID（从 JWT 解析）
     * @return 用户资料
     */
    User getProfile(Long userId);

    /**
     * 更新个人资料（昵称、邮箱、手机、头像、简介）
     *
     * @param userId 当前登录用户 ID
     * @param dto    资料更新 DTO
     * @return 更新后的用户资料
     */
    User updateProfile(Long userId, ProfileUpdateDTO dto);

    /**
     * 修改密码（需校验旧密码）
     *
     * @param userId 当前登录用户 ID
     * @param dto    修改密码 DTO（旧密码、新密码、确认密码）
     */
    void changePassword(Long userId, ChangePasswordDTO dto);

    // ======================================================
    // 管理员功能
    // ======================================================

    /**
     * 管理员：全览用户（支持关键字搜索）
     *
     * @param keyword 搜索关键字（可选）
     * @return 用户列表
     */
    java.util.List<User> getAllUsers(String keyword);

    /**
     * 管理员：更新用户状态
     *
     * @param id     用户 ID
     * @param status 状态 (ACTIVE/DISABLED)
     */
    void updateUserStatus(Long id, String status);

    /**
     * 管理员：重置用户密码为初始密文 (123456)
     *
     * @param id 用户 ID
     */
    void resetUserPassword(Long id);
}
