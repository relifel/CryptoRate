package com.cryptorate.service.impl;

import com.cryptorate.common.exception.ApiException;
import com.cryptorate.dto.ChangePasswordDTO;
import com.cryptorate.dto.ProfileUpdateDTO;
import com.cryptorate.dto.UserLoginDTO;
import com.cryptorate.dto.UserRegisterDTO;
import com.cryptorate.entity.User;
import com.cryptorate.mapper.UserMapper;
import com.cryptorate.service.UserService;
import com.cryptorate.utils.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 用户业务逻辑实现类
 *
 * <p>
 * 实现 {@link UserService} 接口，提供用户注册、登录、CRUD 等核心业务。
 * </p>
 *
 * <h3>安全设计：</h3>
 * <ul>
 * <li>注册时使用 BCrypt 算法对密码进行哈希加密再入库，数据库中不存储明文密码</li>
 * <li>登录时使用 {@link BCryptPasswordEncoder#matches} 比对明文密码与哈希值</li>
 * <li>登录成功后生成 JWT Token，后续请求通过 Token 鉴权，无需 Session</li>
 * </ul>
 *
 * @author CryptoRate Team
 * @version 2.0
 * @since 2026-03-07
 */
@Slf4j
@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Autowired
    public UserServiceImpl(UserMapper userMapper, JwtUtils jwtUtils) {
        this.userMapper = userMapper;
        // BCryptPasswordEncoder 默认强度为 10，安全强度与性能的平衡点
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtUtils = jwtUtils;
    }

    /**
     * {@inheritDoc}
     *
     * <p>
     * 处理流程：
     * <ol>
     * <li>校验用户名是否已存在（数据库唯一性检查）</li>
     * <li>使用 BCrypt 对明文密码进行哈希加密</li>
     * <li>设置注册时间并插入数据库</li>
     * <li>返回用户信息（密码字段置空，防止泄露）</li>
     * </ol>
     * </p>
     */
    @Override
    public User register(UserRegisterDTO dto) {
        log.info("用户注册请求，用户名: {}", dto.getUsername());

        String username = dto.getUsername().trim();

        // 1. 检查用户名是否已存在
        if (userMapper.existsByUsername(username)) {
            log.warn("注册失败，用户名已存在: {}", username);
            throw new ApiException(400, "用户名已存在，请换一个用户名");
        }

        // 2. BCrypt 加密密码（不存明文）
        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        log.debug("密码加密完成，用户名: {}", username);

        // 3. 构造 User 实体
        User user = new User();
        user.setUsername(username);
        user.setPassword(encodedPassword);
        user.setEmail(dto.getEmail());
        user.setRole("USER");      // 默认角色为普通用户
        user.setStatus("ACTIVE");  // 默认状态为激活
        user.setCreatedAt(LocalDateTime.now());

        // 4. 插入数据库
        int rows = userMapper.insert(user);
        if (rows <= 0) {
            log.error("用户注册失败，数据库插入返回 0，用户名: {}", username);
            throw new ApiException(500, "注册失败，请稍后再试");
        }

        log.info("用户注册成功，用户ID: {}, 用户名: {}", user.getId(), username);

        // 5. 返回前清除密码字段，避免密码哈希值泄露给前端
        user.setPassword(null);
        return user;
    }

    /**
     * {@inheritDoc}
     *
     * <p>
     * 为避免用户名枚举攻击，用户名不存在和密码错误均返回同一错误信息。
     * </p>
     */
    @Override
    public String login(UserLoginDTO dto) {
        log.info("用户登录请求，用户名: {}", dto.getUsername());

        // 1. 根据用户名查询用户（含密码哈希）
        User user = userMapper.selectByUsername(dto.getUsername().trim());
        if (user == null) {
            log.warn("登录失败，用户不存在: {}", dto.getUsername());
            throw new ApiException(401, "账号或密码错误，请重新输入");
        }

        // 2. 检查账号状态
        if ("DISABLED".equals(user.getStatus())) {
            log.warn("登录失败，账号已被禁用，用户名: {}", dto.getUsername());
            throw new ApiException(403, "您的账号已被禁用，请联系管理员");
        }

        // 3. BCrypt 比对密码（matches 方法自动处理 salt）
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            log.warn("登录失败，密码错误，用户名: {}", dto.getUsername());
            throw new ApiException(401, "账号或密码错误，请重新输入");
        }

        // 4. 生成 JWT Token (包含角色信息)
        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole());
        log.info("用户登录成功，生成 JWT Token，用户ID: {}, 角色: {}", user.getId(), user.getRole());

        return token;
    }

    @Override
    public User getUserById(Long id) {
        log.info("查询用户，ID: {}", id);
        User user = userMapper.selectById(id);

        if (user != null) {
            log.debug("查询用户成功: {}", user.getUsername());
            user.setPassword(null);
        } else {
            log.warn("用户不存在，ID: {}", id);
        }

        return user;
    }

    @Override
    public User getUserByUsername(String username) {
        log.info("根据用户名查询用户: {}", username);
        User user = userMapper.selectByUsername(username);

        if (user != null) {
            log.debug("查询用户成功，ID: {}", user.getId());
            user.setPassword(null);
        } else {
            log.warn("用户不存在: {}", username);
        }

        return user;
    }

    @Override
    public User updateUser(User user) {
        log.info("更新用户信息，ID: {}", user.getId());

        User existingUser = userMapper.selectById(user.getId());
        if (existingUser == null) {
            log.warn("用户不存在，ID: {}", user.getId());
            throw new ApiException(404, "用户不存在");
        }

        // 检查新用户名是否被占用
        if (user.getUsername() != null && !user.getUsername().equals(existingUser.getUsername())) {
            if (userMapper.existsByUsername(user.getUsername())) {
                log.warn("用户名已被占用: {}", user.getUsername());
                throw new ApiException(400, "用户名已被占用");
            }
        }

        // 若更新密码，先 BCrypt 加密
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        int rows = userMapper.update(user);
        if (rows > 0) {
            log.info("用户信息更新成功，ID: {}", user.getId());
            return getUserById(user.getId());
        } else {
            log.error("用户信息更新失败，ID: {}", user.getId());
            throw new ApiException(500, "用户信息更新失败");
        }
    }

    @Override
    public void deleteUser(Long id) {
        log.info("删除用户，ID: {}", id);

        User user = userMapper.selectById(id);
        if (user == null) {
            log.warn("用户不存在，ID: {}", id);
            throw new ApiException(404, "用户不存在");
        }

        int rows = userMapper.deleteById(id);
        if (rows > 0) {
            log.info("用户删除成功，ID: {}", id);
        } else {
            log.error("用户删除失败，ID: {}", id);
            throw new ApiException(500, "用户删除失败");
        }
    }

    // ======================================================
    // 个人中心相关方法
    // ======================================================

    @Override
    public User getProfile(Long userId) {
        log.info("获取用户个人资料，ID: {}", userId);
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new ApiException(404, "用户不存在");
        }
        // 密码字段已由 @JsonIgnore 过滤，这里仅保险性清除
        user.setPassword(null);
        return user;
    }

    @Override
    public User updateProfile(Long userId, ProfileUpdateDTO dto) {
        log.info("更新用户个人资料，ID: {}", userId);

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new ApiException(404, "用户不存在");
        }

        // 将 DTO 字段写入实体（null 字段由 XML 动态 SQL 忽略）
        user.setNickname(dto.getNickname());
        user.setEmail(dto.getEmail());
        user.setFeishuAlertEnabled(dto.getFeishuAlertEnabled());
        user.setFeishuWebhook(dto.getFeishuWebhook());

        // 使用专用的 updateProfile SQL，只更新资料字段，不影响密码
        userMapper.updateProfile(user);
        log.info("用户资料更新成功，ID: {}", userId);

        return getProfile(userId);
    }

    @Override
    public void changePassword(Long userId, ChangePasswordDTO dto) {
        log.info("用户修改密码，ID: {}", userId);

        // 1. 新密码与确认密码必须一致
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new ApiException(400, "新密码与确认密码不一致");
        }

        // 2. 查询当前用户（需要密码哈希来校验旧密码）
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new ApiException(404, "用户不存在");
        }

        // 3. 校验旧密码
        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            log.warn("修改密码失败，旧密码错误，ID: {}", userId);
            throw new ApiException(400, "旧密码错误");
        }

        // 4. BCrypt 加密新密码并写入数据库
        String encodedNewPassword = passwordEncoder.encode(dto.getNewPassword());
        userMapper.updatePassword(userId, encodedNewPassword);
        log.info("密码修改成功，ID: {}", userId);
    }

    // ======================================================
    // 管理员功能实现
    // ======================================================

    @Override
    public java.util.List<User> getAllUsers(String keyword) {
        log.info("管理员：获取用户全览，关键字: {}", keyword);
        java.util.List<User> users = userMapper.selectAll(keyword);
        // 清除敏感字段
        users.forEach(u -> u.setPassword(null));
        return users;
    }

    @Override
    public void updateUserStatus(Long id, String status) {
        log.info("管理员：更新用户状态，ID: {}, 状态: {}", id, status);
        int rows = userMapper.updateStatus(id, status);
        if (rows <= 0) {
            throw new ApiException(404, "用户不存在");
        }
    }

    @Override
    public void resetUserPassword(Long id) {
        log.info("管理员：重置用户密码，ID: {}", id);
        
        // 1. 动态生成密文，确保与当前系统的加密逻辑 100% 一致
        String defaultPassword = "123456";
        String encodedPassword = passwordEncoder.encode(defaultPassword);
        
        // 2. 更新数据库
        int rows = userMapper.updatePassword(id, encodedPassword);
        
        // 3. 校验执行结果
        if (rows > 0) {
            log.info("密码重置成功，ID: {}, 默认密码: {}", id, defaultPassword);
        } else {
            log.error("密码重置失败，未找到该用户，ID: {}", id);
            throw new ApiException(404, "重置失败，用户不存在");
        }
    }
}
