package com.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String LOGIN_ATTEMPT_PREFIX = "login:attempt:";
    private static final String ACCOUNT_LOCK_PREFIX = "login:lock:";
    private static final int MAX_ATTEMPTS = 5;
    private static final int ATTEMPT_TTL_MINUTES = 15;
    private static final int LOCK_DURATION_MINUTES = 15;

    public void loginSucceeded(String username) {
        try {
            String attemptKey = LOGIN_ATTEMPT_PREFIX + username;
            redisTemplate.delete(attemptKey);
            log.info("登录成功，清除失败记录 - 用户: {}", username);
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis 不可用，跳过清除失败记录 - 用户: {}", username);
        }
    }

    public void loginFailed(String username) {
        try {
            String attemptKey = LOGIN_ATTEMPT_PREFIX + username;
            Long attempts = redisTemplate.opsForValue().increment(attemptKey);

            if (attempts == null) {
                attempts = 1L;
            }

            if (attempts == 1) {
                redisTemplate.expire(attemptKey, ATTEMPT_TTL_MINUTES, TimeUnit.MINUTES);
            }

            log.warn("登录失败 - 用户: {}, 失败次数: {}/{}", username, attempts, MAX_ATTEMPTS);

            if (attempts >= MAX_ATTEMPTS) {
                lockAccount(username);
            }
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis 不可用，无法记录登录失败次数 - 用户: {}", username);
        }
    }

    public boolean isAccountLocked(String username) {
        try {
            String lockKey = ACCOUNT_LOCK_PREFIX + username;
            Boolean locked = (Boolean) redisTemplate.opsForValue().get(lockKey);
            return Boolean.TRUE.equals(locked);
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis 不可用，跳过账户锁定检查 - 用户: {}", username);
            return false; // Redis 不可用时不阻止登录
        }
    }

    private void lockAccount(String username) {
        try {
            String lockKey = ACCOUNT_LOCK_PREFIX + username;
            redisTemplate.opsForValue().set(lockKey, true, LOCK_DURATION_MINUTES, TimeUnit.MINUTES);
            log.warn("账户已锁定 - 用户: {}, 锁定时长: {}分钟", username, LOCK_DURATION_MINUTES);
        } catch (RedisConnectionFailureException e) {
            log.error("Redis 不可用，无法锁定账户 - 用户: {}", username);
        }
    }

    public int getFailedAttempts(String username) {
        try {
            String attemptKey = LOGIN_ATTEMPT_PREFIX + username;
            Object value = redisTemplate.opsForValue().get(attemptKey);
            if (value == null) {
                return 0;
            }
            return value instanceof Integer ? (Integer) value : Integer.parseInt(value.toString());
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis 不可用，无法获取失败次数 - 用户: {}", username);
            return 0;
        }
    }
}
