package com.auth.service;

import com.auth.dto.AuthResponse;
import com.auth.dto.LoginRequest;
import com.auth.dto.RegisterRequest;
import com.auth.dto.UserResponse;
import com.auth.entity.User;
import com.auth.exception.DuplicateResourceException;
import com.auth.repository.UserRepository;
import com.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Cipher;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LoginAttemptService loginAttemptService;
    private final TokenBlacklistService tokenBlacklistService;
    @Qualifier("rsaPrivateKey")
    private final Key rsaPrivateKey;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + username));
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities("USER")
                .build();
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("用户名已存在");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("邮箱已注册");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(decryptPassword(request.getPassword())))
                .build();

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String username = request.getUsername();

        // 检查 Redis 中的账户锁定状态
        if (loginAttemptService.isAccountLocked(username)) {
            log.warn("账户锁定中 - 用户: {}", username);
            throw new BadCredentialsException("账户已被锁定，请15分钟后重试");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("用户名或密码错误"));

        String plainPassword = decryptPassword(request.getPassword());

        if (!passwordEncoder.matches(plainPassword, user.getPassword())) {
            // 登录失败，记录到 Redis
            loginAttemptService.loginFailed(username);
            log.warn("登录失败 - 用户: {}, 失败次数: {}",
                username, loginAttemptService.getFailedAttempts(username));
            throw new BadCredentialsException("用户名或密码错误");
        }

        // 登录成功，清除失败记录
        loginAttemptService.loginSucceeded(username);

        String token = jwtUtil.generateToken(user.getUsername());
        log.info("登录成功 - 用户: {}", user.getUsername());
        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在"));
        return mapToUserResponse(user);
    }

    public void logout(String token) {
        try {
            long expirationMs = jwtUtil.getExpirationMs(token);
            tokenBlacklistService.addToBlacklist(token, expirationMs);
            log.info("用户已退出登录");
        } catch (Exception e) {
            log.error("退出登录失败", e);
        }
    }

    private String decryptPassword(String encryptedPassword) {
        try {
            Cipher cipher = Cipher.getInstance("RSA");
            cipher.init(Cipher.DECRYPT_MODE, rsaPrivateKey);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedPassword));
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new BadCredentialsException("密码解密失败");
        }
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .points(user.getPoints())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
