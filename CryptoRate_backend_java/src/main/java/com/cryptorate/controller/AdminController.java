package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.entity.User;
import com.cryptorate.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 管理员专用控制器
 *
 * <p>
 * 提供对全平台用户的管理接口，包括列表全览、状态管控、重置密码及物理删除。
 * 所有接口均受到 JwtInterceptor 的 ADMIN 角色校验保护。
 * </p>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-04-20
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/user")
public class AdminController {

    private final UserService userService;

    @Autowired
    public AdminController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 获取所有用户列表（支持关键字搜索）
     *
     * @param keyword 搜索关键字（可选，匹配用户名或邮箱）
     * @return 统一响应体，包含用户列表
     */
    @GetMapping("/list")
    public R<List<User>> getUserList(@RequestParam(required = false) String keyword) {
        log.info("管理员获取用户列表，搜索关键字: {}", keyword);
        List<User> users = userService.getAllUsers(keyword);
        return R.ok(users);
    }

    /**
     * 更新用户状态（冻结/启用）
     *
     * @param body 包含 id 和 status 的 Map
     * @return 统一响应体
     */
    @PutMapping("/status")
    public R<Void> updateUserStatus(@RequestBody Map<String, Object> body) {
        Long id = Long.valueOf(body.get("id").toString());
        String status = (String) body.get("status");
        log.info("管理员更新用户状态，ID: {}, 目标状态: {}", id, status);
        userService.updateUserStatus(id, status);
        return R.ok();
    }

    /**
     * 重置用户密码为系统预设初始密码 (123456)
     *
     * @param id 用户 ID
     * @return 统一响应体
     */
    @PutMapping("/password/reset/{id}")
    public R<Void> resetPassword(@PathVariable Long id) {
        log.info("管理员重置用户密码，ID: {}", id);
        userService.resetUserPassword(id);
        return R.ok();
    }

    /**
     * 彻底删除用户账号
     *
     * @param id 用户 ID
     * @return 统一响应体
     */
    @DeleteMapping("/{id}")
    public R<Void> deleteUser(@PathVariable Long id) {
        log.info("管理员删除用户账号，ID: {}", id);
        userService.deleteUser(id);
        return R.ok();
    }
}
