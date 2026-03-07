package com.cryptorate.controller;

import com.cryptorate.common.R;
import com.cryptorate.dto.ChangePasswordDTO;
import com.cryptorate.dto.ProfileUpdateDTO;
import com.cryptorate.entity.User;
import com.cryptorate.service.UserService;
import com.cryptorate.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户个人中心控制器
 *
 * <p>
 * 提供当前登录用户的个人资料查询和修改接口。
 * 所有接口均需要通过 JWT 鉴权拦截器验证身份。
 * </p>
 *
 * <pre>
 * GET  /user/profile        查看个人资料
 * PUT  /user/profile        修改个人资料（昵称、邮箱、手机、头像、简介）
 * PUT  /user/password       修改密码（旧密码校验）
 * </pre>
 *
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-03-08
 */
@Slf4j
@RestController
@RequestMapping("/user")
public class ProfileController {

    private final UserService userService;
    private final JwtUtils jwtUtils;

    @Autowired
    public ProfileController(UserService userService, JwtUtils jwtUtils) {
        this.userService = userService;
        this.jwtUtils = jwtUtils;
    }

    /**
     * 获取当前用户的个人资料
     *
     * @param request HTTP 请求（用于提取 JWT Token 中的用户ID）
     * @return 用户资料（不含密码）
     */
    @GetMapping("/profile")
    public R<User> getProfile(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("GET /user/profile, 用户ID: {}", userId);
        User profile = userService.getProfile(userId);
        return R.ok(profile);
    }

    /**
     * 更新当前用户的个人资料
     *
     * @param dto     资料更新 DTO（昵称、邮箱、手机号、头像、简介）
     * @param request HTTP 请求
     * @return 更新后的用户资料
     */
    @PutMapping("/profile")
    public R<User> updateProfile(@Valid @RequestBody ProfileUpdateDTO dto,
            HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("PUT /user/profile, 用户ID: {}", userId);
        User updated = userService.updateProfile(userId, dto);
        return R.ok(updated);
    }

    /**
     * 修改当前用户的密码
     *
     * @param dto     修改密码 DTO（旧密码、新密码、确认密码）
     * @param request HTTP 请求
     * @return 操作结果
     */
    @PutMapping("/password")
    public R<Void> changePassword(@Valid @RequestBody ChangePasswordDTO dto,
            HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        log.info("PUT /user/password, 用户ID: {}", userId);
        userService.changePassword(userId, dto);
        return R.ok();
    }

    /**
     * 从 HTTP 请求头中提取 JWT Token 并解析出当前用户ID
     *
     * @param request HTTP 请求
     * @return 当前登录用户ID
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7); // "Bearer " 之后的部分
        return jwtUtils.getUserIdFromToken(token);
    }
}
