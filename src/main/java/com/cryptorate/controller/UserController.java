package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.entity.User;
import com.cryptorate.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户管理控制器
 * 
 * <p>提供用户的 CRUD 接口</p>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
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
     * <h4>请求示例：</h4>
     * <pre>
     * POST http://localhost:8080/user/register
     * Content-Type: application/json
     * 
     * {
     *   "username": "testuser",
     *   "password": "123456",
     *   "email": "test@example.com"
     * }
     * </pre>
     * 
     * <h4>响应示例：</h4>
     * <pre>
     * {
     *   "code": 200,
     *   "msg": "注册成功",
     *   "data": {
     *     "id": 1,
     *     "username": "testuser",
     *     "email": "test@example.com",
     *     "createdAt": "2026-02-13 10:30:00"
     *   },
     *   "timestamp": 1705924800000
     * }
     * </pre>
     * 
     * @param user 用户信息
     * @return 统一响应格式
     */
    @PostMapping("/register")
    public R<User> register(@RequestBody User user) {
        log.info("接收到用户注册请求，用户名: {}", user != null ? user.getUsername() : null);

        if (user == null || user.getUsername() == null || user.getUsername().trim().isEmpty()
                || user.getPassword() == null || user.getPassword().isEmpty()) {
            return R.error(400, "请输入用户名和密码");
        }

        User registeredUser = userService.register(user);
        registeredUser.setPassword(null);
        return R.ok("注册成功", registeredUser);
    }

    /**
     * 用户登录
     *
     * <p>接口: POST /user/login</p>
     * <p>请求体: { "username": "xxx", "password": "xxx" }</p>
     * <p>成功返回用户信息（不含密码），失败返回 401</p>
     *
     * @param user 至少包含 username、password
     * @return 统一响应格式，data 为登录用户信息
     */
    @PostMapping("/login")
    public R<User> login(@RequestBody User user) {
        log.info("接收到用户登录请求，用户名: {}", user != null ? user.getUsername() : null);

        if (user == null || user.getUsername() == null || user.getPassword() == null) {
            return R.error(400, "请输入用户名和密码");
        }

        User loggedIn = userService.login(user.getUsername().trim(), user.getPassword());
        return R.ok("登录成功", loggedIn);
    }

    /**
     * 根据 ID 查询用户
     * 
     * <h4>请求示例：</h4>
     * <pre>
     * GET http://localhost:8080/user/1
     * </pre>
     * 
     * <h4>响应示例：</h4>
     * <pre>
     * {
     *   "code": 200,
     *   "msg": "success",
     *   "data": {
     *     "id": 1,
     *     "username": "testuser",
     *     "email": "test@example.com",
     *     "createdAt": "2026-02-13 10:30:00"
     *   },
     *   "timestamp": 1705924800000
     * }
     * </pre>
     * 
     * @param id 用户ID
     * @return 统一响应格式
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
     * <h4>请求示例：</h4>
     * <pre>
     * GET http://localhost:8080/user/username/testuser
     * </pre>
     * 
     * @param username 用户名
     * @return 统一响应格式
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
     * <h4>请求示例：</h4>
     * <pre>
     * PUT http://localhost:8080/user/1
     * Content-Type: application/json
     * 
     * {
     *   "username": "newname",
     *   "email": "newemail@example.com"
     * }
     * </pre>
     * 
     * @param id   用户ID
     * @param user 用户信息（只包含需要更新的字段）
     * @return 统一响应格式
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
     * <h4>请求示例：</h4>
     * <pre>
     * DELETE http://localhost:8080/user/1
     * </pre>
     * 
     * <h4>响应示例：</h4>
     * <pre>
     * {
     *   "code": 200,
     *   "msg": "删除成功",
     *   "data": null,
     *   "timestamp": 1705924800000
     * }
     * </pre>
     * 
     * @param id 用户ID
     * @return 统一响应格式
     */
    @DeleteMapping("/{id}")
    public R<Void> deleteUser(@PathVariable Long id) {
        log.info("接收到删除用户请求，ID: {}", id);
        
        userService.deleteUser(id);
        
        return R.ok("删除成功", null);
    }
}
