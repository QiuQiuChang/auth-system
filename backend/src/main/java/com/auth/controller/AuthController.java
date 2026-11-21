package com.auth.controller;

import com.auth.dto.*;
import com.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.PublicKey;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PublicKey rsaPublicKey;

    @GetMapping("/public-key")
    public ResponseEntity<Map<String, Object>> getPublicKey() {
        String encoded = Base64.getEncoder().encodeToString(rsaPublicKey.getEncoded());
        String pem = "-----BEGIN PUBLIC KEY-----\n" + encoded + "\n-----END PUBLIC KEY-----";
        Map<String, Object> body = new HashMap<>();
        body.put("code", 200);
        body.put("data", Map.of("publicKey", pem));
        return ResponseEntity.ok(body);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = authService.register(request);
        Map<String, Object> body = new HashMap<>();
        body.put("code", 201);
        body.put("message", "注册成功");
        body.put("data", user);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse auth = authService.login(request);
        Map<String, Object> body = new HashMap<>();
        body.put("code", 200);
        body.put("message", "登录成功");
        body.put("data", auth);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        UserResponse user = authService.getCurrentUser(authentication.getName());
        Map<String, Object> body = new HashMap<>();
        body.put("code", 200);
        body.put("message", "success");
        body.put("data", user);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("code", 200);
        body.put("message", "退出登录成功");
        body.put("data", Map.of("success", true));
        return ResponseEntity.ok(body);
    }
}
