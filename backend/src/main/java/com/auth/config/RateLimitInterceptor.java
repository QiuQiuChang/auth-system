package com.auth.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 基于 IP 的接口频率限制拦截器
 * - 登录接口：5 次/分钟
 * - 注册接口：3 次/小时
 */
@Slf4j
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        String ip = getClientIp(request);

        // 登录接口限流：5 次/分钟
        if (path.endsWith("/api/auth/login")) {
            Bucket bucket = loginBuckets.computeIfAbsent(ip, k -> createLoginBucket());
            if (!bucket.tryConsume(1)) {
                log.warn("登录接口频率超限 - IP: {}", ip);
                sendRateLimitResponse(response, "登录请求过于频繁,请稍后再试");
                return false;
            }
        }

        // 注册接口限流：3 次/小时
        if (path.endsWith("/api/auth/register")) {
            Bucket bucket = registerBuckets.computeIfAbsent(ip, k -> createRegisterBucket());
            if (!bucket.tryConsume(1)) {
                log.warn("注册接口频率超限 - IP: {}", ip);
                sendRateLimitResponse(response, "注册请求过于频繁,请稍后再试");
                return false;
            }
        }

        return true;
    }

    /**
     * 创建登录限流桶：5 次/分钟
     */
    private Bucket createLoginBucket() {
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    /**
     * 创建注册限流桶：3 次/小时
     */
    private Bucket createRegisterBucket() {
        Bandwidth limit = Bandwidth.classic(3, Refill.intervally(3, Duration.ofHours(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    /**
     * 获取客户端真实 IP（支持代理）
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 如果有多个代理，取第一个
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    /**
     * 返回 429 Too Many Requests
     */
    private void sendRateLimitResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        String json = String.format("{\"code\":429,\"message\":\"%s\"}", message);
        response.getWriter().write(json);
    }
}
