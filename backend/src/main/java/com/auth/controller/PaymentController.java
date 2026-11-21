package com.auth.controller;

import com.auth.service.ToolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final ToolService toolService;

    private static final List<Map<String, Object>> PLANS = List.of(
        Map.of("id", "plan_50", "name", "50 次套餐", "price", "9.9", "points", 2500, "badge", "热门"),
        Map.of("id", "plan_200", "name", "200 次套餐", "price", "19.9", "points", 10000, "badge", "超值"),
        Map.of("id", "plan_unlimited", "name", "月度无限卡", "price", "49.9", "points", 9999, "badge", "畅享")
    );

    @GetMapping("/plans")
    public ResponseEntity<Map<String, Object>> getPlans() {
        Map<String, Object> body = new HashMap<>();
        body.put("code", 200);
        body.put("data", PLANS);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/debug-reset-points")
    public ResponseEntity<Map<String, Object>> debugResetPoints(
            @RequestBody(required = false) Map<String, Object> body,
            Authentication authentication) {
        int target = 300;
        if (body != null && body.get("points") instanceof Number) {
            target = ((Number) body.get("points")).intValue();
        }
        // 先清空再设置
        String username = authentication.getName();
        int current = toolService.getCurrentPoints(username);
        toolService.addPoints(username, target - current);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "积分已重置为 " + target);
        result.put("data", Map.of("points", target));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/recharge")
    public ResponseEntity<Map<String, Object>> recharge(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String planId = request.get("planId");
        Map<String, Object> plan = PLANS.stream()
                .filter(p -> p.get("id").equals(planId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("无效的充值套餐"));

        int points = (int) plan.get("points");
        int newBalance = toolService.addPoints(authentication.getName(), points);

        Map<String, Object> body = new HashMap<>();
        body.put("code", 200);
        body.put("message", "充值成功！+" + points + " 积分已到账");
        body.put("data", Map.of("points", newBalance));
        return ResponseEntity.ok(body);
    }
}
