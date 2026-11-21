package com.auth.controller;

import com.auth.dto.ToolExecuteRequest;
import com.auth.dto.ToolExecuteResponse;
import com.auth.dto.ToolResponse;
import com.auth.service.ToolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tools")
@RequiredArgsConstructor
public class ToolController {

    private final ToolService toolService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> listTools() {
        List<ToolResponse> tools = toolService.listTools();
        Map<String, Object> body = new HashMap<>();
        body.put("code", 200);
        body.put("message", "获取工具列表成功");
        body.put("data", tools);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> listCategories() {
        List<String> categories = toolService.listCategories();
        Map<String, Object> body = new HashMap<>();
        body.put("code", 200);
        body.put("message", "获取分类列表成功");
        body.put("data", categories);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Map<String, Object>> getTool(@PathVariable String slug) {
        ToolResponse tool = toolService.getTool(slug);
        Map<String, Object> body = new HashMap<>();
        body.put("code", 200);
        body.put("message", "获取工具详情成功");
        body.put("data", tool);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/{slug}/execute")
    public ResponseEntity<Map<String, Object>> execute(
            @PathVariable String slug,
            @Valid @RequestBody ToolExecuteRequest request,
            Authentication authentication) {
        ToolExecuteResponse result = toolService.execute(slug, request.getInputs(), authentication.getName());
        Map<String, Object> body = new HashMap<>();
        body.put("code", 200);
        body.put("message", "执行成功");
        body.put("data", result);
        return ResponseEntity.ok(body);
    }
}
