package com.cryptorate.config;

import okhttp3.ConnectionPool;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * OkHttp 客户端配置类
 * 
 * <p>配置全局的 OkHttpClient Bean，用于所有 HTTP 请求</p>
 * 
 * <h3>核心配置说明：</h3>
 * <ul>
 *   <li><b>连接池</b>: 最大空闲连接 200，保持存活 5 分钟</li>
 *   <li><b>超时配置</b>: 连接超时 5s，读超时 5s，写超时 5s</li>
 *   <li><b>日志拦截器</b>: 开发环境打印完整请求/响应日志</li>
 *   <li><b>重试机制</b>: 失败时自动重试</li>
 * </ul>
 * 
 * @author CryptoRate Team
 * @version 1.0
 * @since 2026-02-13
 */
@Configuration
public class OkHttpConfig {

    /**
     * 连接超时时间（秒）
     */
    private static final int CONNECT_TIMEOUT = 5;

    /**
     * 读取超时时间（秒）
     */
    private static final int READ_TIMEOUT = 5;

    /**
     * 写入超时时间（秒）
     */
    private static final int WRITE_TIMEOUT = 5;

    /**
     * 连接池最大空闲连接数
     */
    private static final int MAX_IDLE_CONNECTIONS = 200;

    /**
     * 连接池连接保持存活时间（分钟）
     */
    private static final int KEEP_ALIVE_DURATION = 5;

    /**
     * 创建 OkHttpClient Bean
     * 
     * <p>这是全局唯一的 HTTP 客户端实例，通过依赖注入使用</p>
     * 
     * <h4>使用示例：</h4>
     * <pre>
     * {@code
     * @Autowired
     * private OkHttpClient okHttpClient;
     * 
     * public void makeRequest() {
     *     Request request = new Request.Builder()
     *         .url("https://api.example.com")
     *         .build();
     *     
     *     // 同步请求（推荐使用 try-with-resources）
     *     try (Response response = okHttpClient.newCall(request).execute()) {
     *         if (response.isSuccessful()) {
     *             String body = response.body().string();
     *             // 处理响应...
     *         }
     *     } catch (IOException e) {
     *         // 处理异常...
     *     }
     * }
     * }
     * </pre>
     * 
     * @return 配置完成的 OkHttpClient 实例
     */
    @Bean
    public OkHttpClient okHttpClient() {
        // 创建日志拦截器
        HttpLoggingInterceptor loggingInterceptor = createLoggingInterceptor();

        // 创建连接池
        // 参数1: 最大空闲连接数
        // 参数2: 连接保持存活时间
        // 参数3: 时间单位
        ConnectionPool connectionPool = new ConnectionPool(
                MAX_IDLE_CONNECTIONS,
                KEEP_ALIVE_DURATION,
                TimeUnit.MINUTES
        );

        // 构建 OkHttpClient
        return new OkHttpClient.Builder()
                // 连接超时：建立 TCP 连接的最大等待时间
                .connectTimeout(CONNECT_TIMEOUT, TimeUnit.SECONDS)
                // 读取超时：从服务器读取数据的最大等待时间
                .readTimeout(READ_TIMEOUT, TimeUnit.SECONDS)
                // 写入超时：向服务器写入数据的最大等待时间
                .writeTimeout(WRITE_TIMEOUT, TimeUnit.SECONDS)
                // 连接池：复用 HTTP 连接，提高性能
                .connectionPool(connectionPool)
                // 失败重试：网络错误时自动重试
                .retryOnConnectionFailure(true)
                // 添加日志拦截器：用于调试和监控
                .addInterceptor(loggingInterceptor)
                .build();
    }

    /**
     * 创建 HTTP 日志拦截器
     * 
     * <p>在开发环境打印完整的请求和响应日志，包括：</p>
     * <ul>
     *   <li>请求 URL 和 Headers</li>
     *   <li>请求 Body（如果有）</li>
     *   <li>响应状态码和 Headers</li>
     *   <li>响应 Body</li>
     * </ul>
     * 
     * <p><b>注意</b>：生产环境建议改为 BASIC 级别，避免日志过多</p>
     * 
     * @return 日志拦截器实例
     */
    private HttpLoggingInterceptor createLoggingInterceptor() {
        HttpLoggingInterceptor interceptor = new HttpLoggingInterceptor();
        
        // 设置日志级别
        // NONE: 不打印日志
        // BASIC: 打印请求和响应的基本信息（URL、状态码、耗时）
        // HEADERS: 打印请求和响应的 Headers
        // BODY: 打印完整的请求和响应内容（包括 Body）
        interceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
        
        return interceptor;
    }
}
