package com.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 通用 AI API 调用服务，兼容 OpenAI 接口格式（DeepSeek、通义千问等）
 */
@Service
public class AiClientService {

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String apiKey;
    private final String model;

    public AiClientService(
            @Value("${app.ai.api-url}") String apiUrl,
            @Value("${app.ai.api-key:}") String apiKey,
            @Value("${app.ai.model}") String model) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(120000);
        this.restTemplate = new RestTemplate(factory);

        // 添加Jackson消息转换器，确保JSON序列化正确
        this.restTemplate.getMessageConverters().add(0,
            new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter());

        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.model = model;

        // 调试日志
        System.out.println("=== AiClientService 初始化 ===");
        System.out.println("API URL: " + apiUrl);
        System.out.println("Model: " + model);
        System.out.println("==================================");
    }

    /**
     * 发送聊天请求，返回 AI 回复文本
     * @param userMessage 用户消息
     * @return AI 回复内容
     */
    public String chat(String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("Authorization", "Bearer " + apiKey);
        }

        // 构建 messages 数组
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);

        // 构建请求体
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("temperature", 0.7);
        body.put("max_tokens", 2048);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, String> message = (Map<String, String>) choice.get("message");
                    if (message != null) {
                        return message.get("content");
                    }
                }
            }
            return "";
        } catch (Exception e) {
            throw new RuntimeException("AI 服务调用失败: " + e.getMessage(), e);
        }
    }
}
