package com.cryptorate.common;

import lombok.Data;

import java.io.Serializable;

/**
 * 统一响应结果封装类
 * 
 * <p>用于统一所有 API 接口的响应格式，包含状态码、消息和数据</p>
 * 
 * @param <T> 响应数据的类型
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
 */
@Data
public class R<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 状态码（200 表示成功，其他表示失败）
     */
    private Integer code;

    /**
     * 响应消息
     */
    private String msg;

    /**
     * 响应数据
     */
    private T data;

    /**
     * 时间戳
     */
    private Long timestamp;

    /**
     * 私有构造方法，防止外部直接实例化
     */
    private R() {
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * 成功响应（包含数据）
     * 
     * @param data 响应数据
     * @param <T>  数据类型
     * @return 统一响应对象
     */
    public static <T> R<T> ok(T data) {
        R<T> result = new R<>();
        result.setCode(200);
        result.setMsg("success");
        result.setData(data);
        return result;
    }

    /**
     * 成功响应（不包含数据）
     * 
     * @param <T> 数据类型
     * @return 统一响应对象
     */
    public static <T> R<T> ok() {
        return ok(null);
    }

    /**
     * 成功响应（自定义消息）
     * 
     * @param msg  响应消息
     * @param data 响应数据
     * @param <T>  数据类型
     * @return 统一响应对象
     */
    public static <T> R<T> ok(String msg, T data) {
        R<T> result = new R<>();
        result.setCode(200);
        result.setMsg(msg);
        result.setData(data);
        return result;
    }

    /**
     * 失败响应（默认消息）
     * 
     * @param <T> 数据类型
     * @return 统一响应对象
     */
    public static <T> R<T> error() {
        return error(500, "系统异常，请稍后重试");
    }

    /**
     * 失败响应（自定义消息）
     * 
     * @param msg 错误消息
     * @param <T> 数据类型
     * @return 统一响应对象
     */
    public static <T> R<T> error(String msg) {
        return error(500, msg);
    }

    /**
     * 失败响应（自定义状态码和消息）
     * 
     * @param code 状态码
     * @param msg  错误消息
     * @param <T>  数据类型
     * @return 统一响应对象
     */
    public static <T> R<T> error(Integer code, String msg) {
        R<T> result = new R<>();
        result.setCode(code);
        result.setMsg(msg);
        result.setData(null);
        return result;
    }

    /**
     * 判断是否成功
     * 
     * @return true-成功，false-失败
     */
    public boolean isSuccess() {
        return this.code != null && this.code == 200;
    }
}
