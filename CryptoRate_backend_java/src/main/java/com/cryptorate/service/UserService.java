package com.cryptorate.service;

import com.cryptorate.common.exception.ApiException;
import com.cryptorate.dto.UserLoginDTO;
import com.cryptorate.dto.UserRegisterDTO;
import com.cryptorate.entity.User;
import com.cryptorate.mapper.UserMapper;
import com.cryptorate.utils.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 用户业务逻辑服务
 *
 * <p>提供用户注册、登录、CRUD 等核心业务操作。</p>
 *
 * <h3>安全设计：</h3>
 * <ul>
 *   <li>注册时使用 BCrypt 算法对密码进行哈希加密再入库，数据库中不存储明文密码</li>
 *   <li>登录时使用 {@link BCryptPasswordEncoder#matches} 比对明文密码与哈希值</li>
 *   <li>登录成功后生成 JWT Token，后续请求通过 Token 鉴权，无需 Session</li>
 * </ul>
 *
 * @author CryptoRate Team
 * @version 2.0
 * @since 2026-02-27
 */
@Slf4j
@Service
public class UserService {

    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Autowired
    public UserService(UserMapper userMapper, JwtUtils jwtUtils) {
        this.userMapper = userMapper;
        // BCryptPasswordEncoder 默认强度为 10，安全强度与性能的平衡点
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtUtils = jwtUtils;
    }

    /**
     * 用户注册
     *
     * <p>处理流程：</p>
     * <ol>
     *   <li>校验用户名是否已存在（数据库唯一性检查）</li>
     *   <li>使用 BCrypt 对明文密码进行哈希加密</li>
     *   <li>设置注册时间并插入数据库</li>
     *   <li>返回用户信息（密码字段置空，防止泄露）</li>
     * </ol>
     *
     * @param dto 注册请求 DTO（已经过 @Valid 校验）
     * @return 注册成功的用户信息（不含密码）
     * @throws ApiException 当用户名已存在时抛出 400 异常
     */
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
     * 用户登录（校验密码 + 生成 JWT Token）
     *
     * <p>处理流程：</p>
     * <ol>
     *   <li>根据用户名查询数据库</li>
     *   <li>使用 BCrypt 比对明文密码与数据库中的哈希值</li>
     *   <li>验证通过后调用 {@link JwtUtils#generateToken} 生成 JWT</li>
     * </ol>
     *
     * <p>为避免用户名枚举攻击，用户名不存在和密码错误均返回同一错误信息。</p>
     *
     * @param dto 登录请求 DTO（已经过 @Valid 校验）
     * @return JWT Token 字符串（前端需存入 localStorage 并在后续请求头中携带）
     * @throws ApiException 用户名不存在或密码错误时抛出 401 异常
     */
    public String login(UserLoginDTO dto) {
        log.info("用户登录请求，用户名: {}", dto.getUsername());

        // 1. 根据用户名查询用户（含密码哈希）
        User user = userMapper.selectByUsername(dto.getUsername().trim());
        if (user == null) {
            log.warn("登录失败，用户不存在: {}", dto.getUsername());
            throw new ApiException(401, "用户名或密码错误");
        }

        // 2. BCrypt 比对密码（matches 方法自动处理 salt）
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            log.warn("登录失败，密码错误，用户名: {}", dto.getUsername());
            throw new ApiException(401, "用户名或密码错误");
        }

        // 3. 生成 JWT Token
        String token = jwtUtils.generateToken(user.getId(), user.getUsername());
        log.info("用户登录成功，生成 JWT Token，用户ID: {}", user.getId());

        return token;
    }

    /**
     * 根据 ID 查询用户（不含密码）
     *
     * @param id 用户ID
     * @return 用户对象（密码字段为 null），不存在则返回 null
     */
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

    /**
     * 根据用户名查询用户（不含密码）
     *
     * @param username 用户名
     * @return 用户对象（密码字段为 null），不存在则返回 null
     */
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

    /**
     * 更新用户信息
     *
     * <p>若更新密码，同样使用 BCrypt 加密后入库。</p>
     *
     * @param user 用户对象（包含 ID）
     * @return 更新后的用户对象（不含密码）
     * @throws ApiException 用户不存在或用户名已被占用时抛出
     */
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

    /**
     * 删除用户
     *
     * @param id 用户ID
     * @throws ApiException 用户不存在时抛出 404 异常
     */
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
}
