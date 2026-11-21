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
public class TokenBlacklistService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String BLACKLIST_PREFIX = "token:blacklist:";

    public void addToBlacklist(String token, long expirationMs) {
        try {
            String key = BLACKLIST_PREFIX + token;
            long ttlSeconds = expirationMs / 1000;

            if (ttlSeconds > 0) {
                redisTemplate.opsForValue().set(key, true, ttlSeconds, TimeUnit.SECONDS);
                log.info("Token 已加入黑名单，过期时间: {}秒", ttlSeconds);
            }
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis 不可用，无法将 Token 加入黑名单");
        }
    }

    public boolean isBlacklisted(String token) {
        try {
            String key = BLACKLIST_PREFIX + token;
            Boolean blacklisted = (Boolean) redisTemplate.opsForValue().get(key);
            return Boolean.TRUE.equals(blacklisted);
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis 不可用，跳过 Token 黑名单检查");
            return false; // Redis 不可用时不阻止访问
        }
    }
}
