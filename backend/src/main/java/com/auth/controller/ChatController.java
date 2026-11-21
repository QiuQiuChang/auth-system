package com.auth.controller;
import com.auth.dto.ChatOptions;
import com.auth.dto.ChatRequest;
import com.auth.dto.ChatResponse;
import com.auth.service.ChatService;
import com.auth.service.MultimodalChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final MultimodalChatService multimodalChatService;

    @PostMapping("/message")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {
        ChatResponse response = chatService.chat(request.getMessages(), authentication.getName());
        Map<String, Object> body = new HashMap<>();
        body.put("code", 200);
        body.put("message", "成功");
        body.put("data", response);
        return ResponseEntity.ok(body);
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamMessage(@Valid @RequestBody ChatRequest request, Authentication authentication) {
        return chatService.chatStream(request.getMessages(), authentication.getName());
    }

    @PostMapping("/vision")
    public ResponseEntity<Map<String, Object>> sendVisionMessage(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            System.out.println("=== ChatController.sendVisionMessage 开始 ===");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> messages = (List<Map<String, Object>>) request.get("messages");

            System.out.println("消息数量: " + messages.size());
            System.out.println("用户: " + authentication.getName());

            ChatResponse response = multimodalChatService.chatWithVision(messages, authentication.getName());

            System.out.println("=== 准备返回响应 ===");
            System.out.println("Response: " + response);

            Map<String, Object> result = Map.of(
                "code", 200,
                "message", "成功",
                "data", response
            );

            System.out.println("=== 返回结果 ===");
            System.out.println(result);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("=== ChatController 错误 ===");
            System.err.println("错误: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "code", 500,
                    "message", "服务器错误: " + e.getMessage(),
                    "data", null
                ));
        }
    }

    @PostMapping(value = "/vision/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter sendVisionMessageStream(@RequestBody Map<String, Object> request,
                                               Authentication authentication) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> messages = (List<Map<String, Object>>) request.get("messages");

        @SuppressWarnings("unchecked")
        Map<String, Object> optionsMap = (Map<String, Object>) request.getOrDefault("options", new HashMap<>());

        ChatOptions options = ChatOptions.builder()
            .temperature(getDoubleOrDefault(optionsMap, "temperature", 0.7))
            .topP(getDoubleOrDefault(optionsMap, "topP", 0.9))
            .maxTokens(getIntegerOrDefault(optionsMap, "maxTokens", 2048))
            .stream(true)
            .enableThinking(getBooleanOrDefault(optionsMap, "enableThinking", false))
            .thinkingBudget(getIntegerOrDefault(optionsMap, "thinkingBudget", 2048))
            .build();

        return multimodalChatService.chatWithVisionStream(messages, authentication.getName(), options);
    }

    private Double getDoubleOrDefault(Map<String, Object> map, String key, Double defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return defaultValue;
    }

    private Integer getIntegerOrDefault(Map<String, Object> map, String key, Integer defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return defaultValue;
    }

    private Boolean getBooleanOrDefault(Map<String, Object> map, String key, Boolean defaultValue) {
        Object value = map.get(key);
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return defaultValue;
    }
}
