package com.cryptorate;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * CryptoRate 加密货币追踪系统 - 启动类
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
 */
@SpringBootApplication
@MapperScan("com.cryptorate.mapper")  // 扫描 MyBatis Mapper 接口
@EnableScheduling                      // 开启 Spring 定时任务支持
public class CryptoRateApplication {

    public static void main(String[] args) {
        SpringApplication.run(CryptoRateApplication.class, args);
        System.out.println("=================================================");
        System.out.println("     CryptoRate 加密货币追踪系统启动成功！");
        System.out.println("     访问地址: http://localhost:8080");
        System.out.println("=================================================");
    }
}
