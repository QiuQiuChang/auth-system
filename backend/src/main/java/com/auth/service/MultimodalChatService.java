package com.auth.service;
import com.auth.dto.ChatOptions;
import com.auth.dto.ChatResponse;
import com.auth.entity.User;
import com.auth.exception.InsufficientPointsException;
import com.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;

@Service
public class MultimodalChatService {
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String apiKey;
    private final String imageModel;
    private static final int VISION_COST_POINTS = 20;

    public MultimodalChatService(
            UserRepository userRepository,
            @Value("${app.ai.api-url}") String apiUrl,
            @Value("${app.ai.api-key}") String apiKey,
            @Value("${app.ai.image-model:Qwen/Qwen3-VL-8B-Instruct}") String imageModel) {
        this.userRepository = userRepository;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.imageModel = imageModel;

        // 调试日志：启动时打印配置
        System.out.println("=== MultimodalChatService 初始化 ===");
        System.out.println("API URL: " + apiUrl);
        System.out.println("Image Model: " + imageModel);
        System.out.println("API Key: " + (apiKey != null ? apiKey.substring(0, 10) + "..." : "null"));
        System.out.println("=====================================");

        // 创建RestTemplate实例，设置超时
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000);
        factory.setReadTimeout(60000);
        this.restTemplate = new RestTemplate(factory);

        // 添加Jackson消息转换器，确保JSON序列化正确
        this.restTemplate.getMessageConverters().add(0,
            new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter());
    }

    @Transactional
    public ChatResponse chatWithVision(List<Map<String, Object>> messages, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));

        // AI助手聊天（包括vision）不扣积分

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", imageModel);
        body.put("messages", messages);
        body.put("max_tokens", 2048);

        // 调试日志
        System.out.println("=== Vision API 请求 ===");
        System.out.println("URL: " + apiUrl);
        System.out.println("Model: " + imageModel);
        System.out.println("Body: " + body);
        System.out.println("======================");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);

            System.out.println("=== Vision API 响应 ===");
            System.out.println("Status: " + response.getStatusCode());
            System.out.println("Body: " + response.getBody());
            System.out.println("======================");

            String content = "";

            if (response.getBody() != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, String> message = (Map<String, String>) choices.get(0).get("message");
                    if (message != null) {
                        content = message.get("content");
                    }
                }
            }

            ChatResponse chatResponse = ChatResponse.builder()
                .content(content)
                .pointsUsed(0)
                .remainingPoints(user.getPoints())
                .build();

            System.out.println("=== 返回给前端 ===");
            System.out.println("Content length: " + content.length());
            System.out.println("Response: " + chatResponse);
            System.out.println("==================");

            return chatResponse;
        } catch (Exception e) {
            System.err.println("=== Vision API 错误 ===");
            System.err.println("错误类型: " + e.getClass().getName());
            System.err.println("错误消息: " + e.getMessage());
            e.printStackTrace();
            System.err.println("=====================");
            throw new RuntimeException("AI服务调用失败: " + e.getMessage(), e);
        }
    }

    /**
     * 流式聊天 - 支持实时输出和思维链
     */
    public SseEmitter chatWithVisionStream(List<Map<String, Object>> messages,
                                            String username,
                                            ChatOptions options) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));

        SseEmitter emitter = new SseEmitter(300000L);

        // 保存当前Security上下文
        SecurityContext securityContext = SecurityContextHolder.getContext();

        // 使用 DelegatingSecurityContextRunnable 包装异步任务
        Runnable task = new org.springframework.security.concurrent.DelegatingSecurityContextRunnable(
            () -> {
                BufferedReader reader = null;
                HttpURLConnection conn = null;
                try {
                    conn = createStreamConnection(messages, options);
                    reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream()));

                    String line;
                    StringBuilder fullContent = new StringBuilder();

                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("data: ")) {
                            String data = line.substring(6);
                            if (!"[DONE]".equals(data)) {
                                emitter.send(SseEmitter.event()
                                    .name("message")
                                    .data(data));

                                // 累积完整内容用于日志
                                try {
                                    ObjectMapper mapper = new ObjectMapper();
                                    Map<String, Object> chunk = mapper.readValue(data, Map.class);
                                    List<Map<String, Object>> choices = (List) chunk.get("choices");
                                    if (choices != null && !choices.isEmpty()) {
                                        Map<String, Object> delta = (Map) choices.get(0).get("delta");
                                        if (delta != null && delta.get("content") != null) {
                                            fullContent.append(delta.get("content"));
                                        }
                                    }
                                } catch (Exception ignored) {}
                            }
                        }
                    }

                    System.out.println("=== 流式响应完成 ===");
                    System.out.println("总长度: " + fullContent.length() + " 字符");

                    emitter.send(SseEmitter.event()
                        .name("done")
                        .data("{\"pointsUsed\":0,\"remainingPoints\":" + user.getPoints() + "}"));
                    emitter.complete();

                } catch (Exception e) {
                    System.err.println("流式响应错误: " + e.getMessage());
                    e.printStackTrace();
                    try {
                        emitter.send(SseEmitter.event()
                            .name("error")
                            .data("{\"message\":\"" + e.getMessage() + "\"}"));
                    } catch (Exception ignored) {}
                    emitter.completeWithError(e);
                } finally {
                    // 清理 Security Context
                    SecurityContextHolder.clearContext();
                    try {
                        if (reader != null) reader.close();
                        if (conn != null) conn.disconnect();
                    } catch (Exception ignored) {}
                }
            },
            securityContext
        );

        new Thread(task).start();

        return emitter;
    }

    /**
     * 创建流式连接
     */
    private HttpURLConnection createStreamConnection(List<Map<String, Object>> messages,
                                                       ChatOptions options) throws Exception {
        // 验证并清理 messages
        List<Map<String, Object>> cleanedMessages = new ArrayList<>();
        for (Map<String, Object> msg : messages) {
            Map<String, Object> cleanMsg = new LinkedHashMap<>();

            // 只保留 role 和 content 字段
            Object role = msg.get("role");
            Object content = msg.get("content");

            if (role != null && content != null) {
                cleanMsg.put("role", role.toString());
                // 保持 content 的原始类型（可能是 String 或 List）
                cleanMsg.put("content", content);
                cleanedMessages.add(cleanMsg);
            }
        }

        System.out.println("=== 创建流式连接 ===");
        System.out.println("Original messages: " + messages);
        System.out.println("Cleaned messages: " + cleanedMessages);
        System.out.println("Temperature: " + options.getTemperature());
        System.out.println("Thinking: " + options.getEnableThinking());
        System.out.println("===================");

        URL url = new URL(apiUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + apiKey);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Accept", "text/event-stream");
        conn.setDoOutput(true);
        conn.setReadTimeout(60000);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", imageModel);
        body.put("messages", cleanedMessages);  // 使用清理后的 messages
        body.put("max_tokens", options.getMaxTokens());
        body.put("temperature", options.getTemperature());
        body.put("top_p", options.getTopP());
        body.put("stream", true);

        if (options.getEnableThinking()) {
            body.put("thinking", Map.of(
                "type", "enabled",
                "budget_tokens", options.getThinkingBudget()
            ));
        }

        ObjectMapper mapper = new ObjectMapper();
        String requestBody = mapper.writeValueAsString(body);
        System.out.println("Request body: " + requestBody);

        conn.getOutputStream().write(requestBody.getBytes("UTF-8"));

        return conn;
    }
}
