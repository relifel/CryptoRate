package com.cryptorate.service;

import com.cryptorate.common.exception.ApiException;
import com.cryptorate.entity.User;
import com.cryptorate.mapper.UserMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 用户业务逻辑服务
 * 
 * <p>提供用户的 CRUD 操作</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
 */
@Slf4j
@Service
public class UserService {

    private final UserMapper userMapper;

    @Autowired
    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    /**
     * 用户注册
     * 
     * <p>创建新用户，自动设置创建时间</p>
     * 
     * @param user 用户对象
     * @return 创建的用户（包含生成的 ID）
     * @throws RuntimeException 当用户名已存在时抛出
     */
    public User register(User user) {
        log.info("用户注册，用户名: {}", user.getUsername());

        String username = user.getUsername() != null ? user.getUsername().trim() : "";
        if (username.isEmpty()) {
            throw new ApiException(400, "请输入用户名");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new ApiException(400, "请输入密码");
        }
        if (userMapper.existsByUsername(username)) {
            log.warn("用户名已存在: {}", username);
            throw new ApiException(400, "用户名已存在");
        }
        user.setUsername(username);

        // 设置创建时间
        user.setCreatedAt(LocalDateTime.now());

        // 插入用户
        // 注意：这里应该对密码进行加密，生产环境建议使用 BCrypt
        // 示例：user.setPassword(passwordEncoder.encode(user.getPassword()));
        int rows = userMapper.insert(user);
        
        if (rows > 0) {
            log.info("用户注册成功，用户ID: {}", user.getId());
            return user;
        } else {
            log.error("用户注册失败");
            throw new ApiException(500, "用户注册失败");
        }
    }

    /**
     * 根据 ID 查询用户
     * 
     * @param id 用户ID
     * @return 用户对象，不存在则返回 null
     */
    public User getUserById(Long id) {
        log.info("查询用户，ID: {}", id);
        User user = userMapper.selectById(id);
        
        if (user != null) {
            log.info("查询用户成功: {}", user.getUsername());
            // 清除密码信息，避免泄露
            user.setPassword(null);
        } else {
            log.warn("用户不存在，ID: {}", id);
        }
        
        return user;
    }

    /**
     * 用户登录（校验用户名与密码）
     *
     * @param username 用户名
     * @param password 明文密码（当前未加密，生产环境建议使用 BCrypt 校验）
     * @return 登录成功的用户信息（不含密码）
     * @throws ApiException 用户名不存在或密码错误时抛出 401
     */
    public User login(String username, String password) {
        log.info("用户登录，用户名: {}", username);

        User user = userMapper.selectByUsername(username);
        if (user == null) {
            log.warn("登录失败，用户不存在: {}", username);
            throw new ApiException(401, "用户名或密码错误");
        }
        if (password == null || !password.equals(user.getPassword())) {
            log.warn("登录失败，密码错误: {}", username);
            throw new ApiException(401, "用户名或密码错误");
        }

        user.setPassword(null);
        log.info("用户登录成功，用户ID: {}", user.getId());
        return user;
    }

    /**
     * 根据用户名查询用户
     * 
     * @param username 用户名
     * @return 用户对象，不存在则返回 null
     */
    public User getUserByUsername(String username) {
        log.info("根据用户名查询用户: {}", username);
        User user = userMapper.selectByUsername(username);
        
        if (user != null) {
            log.info("查询用户成功，ID: {}", user.getId());
            // 清除密码信息，避免泄露
            user.setPassword(null);
        } else {
            log.warn("用户不存在: {}", username);
        }
        
        return user;
    }

    /**
     * 更新用户信息
     * 
     * @param user 用户对象（包含 ID）
     * @return 更新后的用户对象
     * @throws RuntimeException 当用户不存在时抛出
     */
    public User updateUser(User user) {
        log.info("更新用户信息，ID: {}", user.getId());

        // 检查用户是否存在
        User existingUser = userMapper.selectById(user.getId());
        if (existingUser == null) {
            log.warn("用户不存在，ID: {}", user.getId());
            throw new RuntimeException("用户不存在");
        }

        // 如果更新了用户名，检查新用户名是否已被占用
        if (user.getUsername() != null && !user.getUsername().equals(existingUser.getUsername())) {
            if (userMapper.existsByUsername(user.getUsername())) {
                log.warn("用户名已被占用: {}", user.getUsername());
                throw new RuntimeException("用户名已被占用");
            }
        }

        // 如果更新了密码，应该进行加密（这里简化处理）
        // 生产环境建议：if (user.getPassword() != null) { user.setPassword(passwordEncoder.encode(user.getPassword())); }

        // 执行更新
        int rows = userMapper.update(user);
        
        if (rows > 0) {
            log.info("用户信息更新成功");
            return getUserById(user.getId());
        } else {
            log.error("用户信息更新失败");
            throw new RuntimeException("用户信息更新失败");
        }
    }

    /**
     * 删除用户
     * 
     * @param id 用户ID
     * @throws RuntimeException 当用户不存在时抛出
     */
    public void deleteUser(Long id) {
        log.info("删除用户，ID: {}", id);

        // 检查用户是否存在
        User user = userMapper.selectById(id);
        if (user == null) {
            log.warn("用户不存在，ID: {}", id);
            throw new RuntimeException("用户不存在");
        }

        // 执行删除
        int rows = userMapper.deleteById(id);
        
        if (rows > 0) {
            log.info("用户删除成功");
        } else {
            log.error("用户删除失败");
            throw new RuntimeException("用户删除失败");
        }
    }
}
