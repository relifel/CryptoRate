package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.dto.UserLoginDTO;
import com.cryptorate.dto.UserRegisterDTO;
import com.cryptorate.entity.User;
import com.cryptorate.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户管理控制器
 *
 * <p>提供用户注册、登录及 CRUD 接口。</p>
 *
 * <h3>认证策略：</h3>
 * <ul>
 *   <li>{@code POST /user/register} — 开放接口，无需 Token</li>
 *   <li>{@code POST /user/login} — 开放接口，无需 Token，成功后返回 JWT</li>
 *   <li>其余接口受拦截器保护，需携带有效 Token</li>
 * </ul>
 *
 * @author CryptoRate Team
 * @version 2.0
 * @since 2026-02-27
 */
@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 用户注册
     *
     * <p>接口：{@code POST /user/register}</p>
     * <p>无需登录即可访问（公开接口）。</p>
     *
     * <h4>请求体示例：</h4>
     * <pre>
     * {
     *   "username": "testuser",
     *   "password": "123456",
     *   "email": "test@example.com"
     * }
     * </pre>
     *
     * <h4>响应示例（成功）：</h4>
     * <pre>
     * {
     *   "code": 200,
     *   "msg": "注册成功",
     *   "data": { "id": 1, "username": "testuser", "email": "test@example.com" }
     * }
     * </pre>
     *
     * @param dto 注册请求 DTO，由 {@code @Valid} 触发字段校验
     * @return 注册成功的用户信息（不含密码）
     */
    @PostMapping("/register")
    public R<User> register(@Valid @RequestBody UserRegisterDTO dto) {
        log.info("接收到用户注册请求，用户名: {}", dto.getUsername());
        User registeredUser = userService.register(dto);
        return R.ok("注册成功", registeredUser);
    }

    /**
     * 用户登录
     *
     * <p>接口：{@code POST /user/login}</p>
     * <p>无需登录即可访问（公开接口）。</p>
     * <p>登录成功后返回 JWT Token，前端需将 Token 存入 {@code localStorage}，
     * 后续所有需要认证的请求均需在请求头中携带：{@code Authorization: Bearer <token>}</p>
     *
     * <h4>请求体示例：</h4>
     * <pre>
     * {
     *   "username": "testuser",
     *   "password": "123456"
     * }
     * </pre>
     *
     * <h4>响应示例（成功）：</h4>
     * <pre>
     * {
     *   "code": 200,
     *   "msg": "登录成功",
     *   "data": "eyJhbGciOiJIUzI1NiJ9..."
     * }
     * </pre>
     *
     * @param dto 登录请求 DTO，由 {@code @Valid} 触发字段校验
     * @return JWT Token 字符串（data 字段）
     */
    @PostMapping("/login")
    public R<String> login(@Valid @RequestBody UserLoginDTO dto) {
        log.info("接收到用户登录请求，用户名: {}", dto.getUsername());
        String token = userService.login(dto);
        return R.ok("登录成功", token);
    }

    /**
     * 根据 ID 查询用户
     *
     * <p>接口：{@code GET /user/{id}}</p>
     *
     * @param id 用户ID
     * @return 用户信息（不含密码）
     */
    @GetMapping("/{id}")
    public R<User> getUserById(@PathVariable Long id) {
        log.info("接收到查询用户请求，ID: {}", id);
        User user = userService.getUserById(id);
        if (user == null) {
            return R.error(404, "用户不存在");
        }
        return R.ok(user);
    }

    /**
     * 根据用户名查询用户
     *
     * <p>接口：{@code GET /user/username/{username}}</p>
     *
     * @param username 用户名
     * @return 用户信息（不含密码）
     */
    @GetMapping("/username/{username}")
    public R<User> getUserByUsername(@PathVariable String username) {
        log.info("接收到查询用户请求，用户名: {}", username);
        User user = userService.getUserByUsername(username);
        if (user == null) {
            return R.error(404, "用户不存在");
        }
        return R.ok(user);
    }

    /**
     * 更新用户信息
     *
     * <p>接口：{@code PUT /user/{id}}</p>
     *
     * @param id   用户ID
     * @param user 需要更新的用户信息（只填写要更新的字段）
     * @return 更新后的用户信息
     */
    @PutMapping("/{id}")
    public R<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        log.info("接收到更新用户请求，ID: {}", id);
        user.setId(id);
        User updatedUser = userService.updateUser(user);
        return R.ok("更新成功", updatedUser);
    }

    /**
     * 删除用户
     *
     * <p>接口：{@code DELETE /user/{id}}</p>
     *
     * @param id 用户ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public R<Void> deleteUser(@PathVariable Long id) {
        log.info("接收到删除用户请求，ID: {}", id);
        userService.deleteUser(id);
        return R.ok("删除成功", null);
    }
}
