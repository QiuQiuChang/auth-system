package com.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 混合视频生成服务
 * 主：Replicate (快速、高质量)
 * 备：Hugging Face (免费降级方案)
 */
@Service
public class AiVideoService {

    private final RestTemplate restTemplate;
    private final String replicateApiKey;
    private final String huggingfaceApiKey;

    // Replicate API
    private static final String REPLICATE_API = "https://api.replicate.com/v1/predictions";
    private static final String REPLICATE_MODEL_VERSION = "6c9132aee14409cd6568d030453f1ba50f5f3412b844fe67f78a9eb62d55664f";
    // 使用 Tencent Hunyuan Video 模型

    // Hugging Face API (备用)
    private static final String HF_API = "https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b";

    private static final int MAX_WAIT_SECONDS = 180;
    private static final int POLL_INTERVAL_MILLIS = 3000;

    public AiVideoService(
            @Value("${app.replicate.api-key:}") String replicateApiKey,
            @Value("${app.huggingface.api-key:}") String huggingfaceApiKey) {

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15000);
        factory.setReadTimeout(180000);
        this.restTemplate = new RestTemplate(factory);
        this.replicateApiKey = replicateApiKey;
        this.huggingfaceApiKey = huggingfaceApiKey;

        // 启动日志
        System.out.println("=== AiVideoService 初始化 ===");
        System.out.println("Replicate API Key: " + (replicateApiKey != null && !replicateApiKey.isEmpty() ? "已配置" : "未配置"));
        System.out.println("Hugging Face API Key: " + (huggingfaceApiKey != null && !huggingfaceApiKey.isEmpty() ? "已配置" : "不需要(可选)"));
        System.out.println("===============================");
    }

    @SuppressWarnings("unchecked")
    public String generateVideo(String prompt, Integer durationSeconds) {
        // 优先使用 Replicate
        if (replicateApiKey != null && !replicateApiKey.isEmpty()) {
            try {
                System.out.println("尝试使用 Replicate 生成视频...");
                return generateWithReplicate(prompt, durationSeconds);
            } catch (Exception e) {
                System.err.println("Replicate 生成失败，降级到 Hugging Face: " + e.getMessage());
                // 失败后降级到 Hugging Face
            }
        } else {
            System.out.println("Replicate API Key 未配置，使用 Hugging Face...");
        }

        // 降级到 Hugging Face
        try {
            return generateWithHuggingFace(prompt);
        } catch (Exception e) {
            throw new RuntimeException("视频生成失败 (Replicate 和 Hugging Face 都不可用): " + e.getMessage());
        }
    }

    /**
     * 使用 Replicate 生成视频 (主方案)
     */
    @SuppressWarnings("unchecked")
    private String generateWithReplicate(String prompt, Integer durationSeconds) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + replicateApiKey);
        headers.set("Prefer", "wait");

        // 构建请求体
        Map<String, Object> input = new HashMap<>();
        input.put("prompt", prompt);
        input.put("video_length", "5s"); // Hunyuan Video 使用 5s

        Map<String, Object> body = new HashMap<>();
        body.put("version", REPLICATE_MODEL_VERSION);
        body.put("input", input);

        System.out.println("发送 Replicate 请求: " + prompt);

        try {
            // 提交任务
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    REPLICATE_API,
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            Map<String, Object> respBody = response.getBody();
            if (respBody == null) {
                throw new RuntimeException("Replicate 返回空响应");
            }

            String predictionId = (String) respBody.get("id");
            String status = (String) respBody.get("status");

            System.out.println("Replicate 任务ID: " + predictionId + ", 状态: " + status);

            // 如果已经完成，直接返回
            if ("succeeded".equals(status)) {
                return extractReplicateVideoUrl(respBody);
            }

            // 轮询等待结果
            return pollReplicateResult(predictionId, headers);

        } catch (Exception e) {
            throw new RuntimeException("Replicate API 调用失败: " + e.getMessage(), e);
        }
    }

    /**
     * 轮询 Replicate 结果
     */
    @SuppressWarnings("unchecked")
    private String pollReplicateResult(String predictionId, HttpHeaders headers) {
        String pollUrl = REPLICATE_API + "/" + predictionId;
        long deadline = System.currentTimeMillis() + MAX_WAIT_SECONDS * 1000L;

        while (System.currentTimeMillis() < deadline) {
            try {
                Thread.sleep(POLL_INTERVAL_MILLIS);

                ResponseEntity<Map> pollResp = restTemplate.exchange(
                        pollUrl,
                        HttpMethod.GET,
                        new HttpEntity<>(headers),
                        Map.class
                );

                Map<String, Object> pollBody = pollResp.getBody();
                if (pollBody == null) continue;

                String status = (String) pollBody.get("status");
                System.out.println("Replicate 状态: " + status);

                if ("succeeded".equals(status)) {
                    return extractReplicateVideoUrl(pollBody);
                } else if ("failed".equals(status) || "canceled".equals(status)) {
                    Object error = pollBody.get("error");
                    throw new RuntimeException("Replicate 生成失败: " + error);
                }
                // processing 或 starting 状态，继续等待

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("等待被中断");
            }
        }

        throw new RuntimeException("Replicate 生成超时（超过 " + MAX_WAIT_SECONDS + " 秒）");
    }

    /**
     * 从 Replicate 响应中提取视频 URL
     */
    @SuppressWarnings("unchecked")
    private String extractReplicateVideoUrl(Map<String, Object> response) {
        Object output = response.get("output");
        if (output instanceof List) {
            List<String> outputs = (List<String>) output;
            if (!outputs.isEmpty()) {
                return outputs.get(0);
            }
        } else if (output instanceof String) {
            return (String) output;
        }
        throw new RuntimeException("Replicate 未返回视频 URL");
    }

    /**
     * 使用 Hugging Face 生成视频 (备用方案)
     */
    private String generateWithHuggingFace(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (huggingfaceApiKey != null && !huggingfaceApiKey.isEmpty()) {
            headers.set("Authorization", "Bearer " + huggingfaceApiKey);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("inputs", prompt);
        body.put("options", Map.of("wait_for_model", true));

        System.out.println("发送 Hugging Face 请求: " + prompt);
        System.out.println("注意: Hugging Face 可能需要 2-5 分钟...");

        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    HF_API,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    byte[].class
            );

            byte[] videoData = response.getBody();
            if (videoData == null || videoData.length == 0) {
                throw new RuntimeException("Hugging Face 返回空数据");
            }

            // Hugging Face 直接返回视频二进制数据，需要转换为 base64 或保存到文件
            // 这里简化处理，返回提示信息
            System.out.println("Hugging Face 生成成功，视频大小: " + videoData.length + " bytes");

            // TODO: 实际项目中应该将视频保存到云存储（如 OSS）并返回 URL
            return "data:video/mp4;base64," + java.util.Base64.getEncoder().encodeToString(videoData);

        } catch (Exception e) {
            throw new RuntimeException("Hugging Face API 调用失败: " + e.getMessage(), e);
        }
    }

    /**
     * 根据时长计算帧数 (CogVideoX-5B 使用 10 FPS)
     */
    private int resolveNumFrames(Integer durationSeconds) {
        if (durationSeconds == null) {
            return 50; // 默认 5 秒 * 10 FPS
        }
        // CogVideoX-5B 支持 49 帧（约 5 秒）
        int frames = durationSeconds * 10;
        return Math.max(25, Math.min(frames, 49)); // 限制在 2.5-5 秒
    }
}
