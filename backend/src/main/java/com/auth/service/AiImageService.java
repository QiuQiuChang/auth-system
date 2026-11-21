package com.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * SiliconFlow 图片生成服务
 */
@Service
public class AiImageService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String imageModel;
    private static final String IMAGE_API = "https://api.siliconflow.cn/v1/images/generations";

    public AiImageService(
            @Value("${app.ai.api-key}") String apiKey,
            @Value("${app.ai.text-to-image-model:Qwen/Qwen-Image}") String imageModel) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(60000);
        this.restTemplate = new RestTemplate(factory);
        this.apiKey = apiKey;
        this.imageModel = imageModel;
    }

    /**
     * 生成图片，返回图片 URL
     * @param prompt 图片描述提示词
     * @param size   图片尺寸，如 1024x768
     * @return 图片 URL
     */
    @SuppressWarnings("unchecked")
    public String generateImage(String prompt, String size) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("Authorization", "Bearer " + apiKey);
        }

        // 构建请求体
        Map<String, Object> body = new HashMap<>();
        body.put("model", imageModel);
        body.put("prompt", prompt);
        if (size != null && !size.isEmpty()) {
            body.put("size", size);
        }

        // extra_body: response_format = url
        Map<String, String> extraBody = new HashMap<>();
        extraBody.put("response_format", "url");
        body.put("extra_body", extraBody);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    IMAGE_API, new HttpEntity<>(body, headers), Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) responseBody.get("data");
                if (data != null && !data.isEmpty()) {
                    Object url = data.get(0).get("url");
                    if (url != null) return url.toString();
                }
            }
            return "";
        } catch (Exception e) {
            throw new RuntimeException("图片生成失败: " + e.getMessage(), e);
        }
    }
}
