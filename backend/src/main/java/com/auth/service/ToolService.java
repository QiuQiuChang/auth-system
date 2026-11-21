package com.auth.service;

import com.auth.dto.ToolExecuteResponse;
import com.auth.dto.ToolResponse;
import com.auth.entity.ToolConfig;
import com.auth.entity.User;
import com.auth.exception.InsufficientPointsException;
import com.auth.repository.ToolConfigRepository;
import com.auth.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ToolService {

    private final ToolConfigRepository toolConfigRepository;
    private final UserRepository userRepository;
    private final AiClientService aiClientService;
    private final AiVideoService aiVideoService;
    private final AiImageService aiImageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 获取所有启用的工具列表
     */
    public List<ToolResponse> listTools() {
        return toolConfigRepository.findByStatusOrderBySortOrderAsc(1)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * 获取所有启用的工具分类
     */
    public List<String> listCategories() {
        return toolConfigRepository.findByStatusOrderBySortOrderAsc(1)
                .stream()
                .map(ToolConfig::getCategory)
                .filter(c -> c != null && !c.isEmpty())
                .distinct()
                .toList();
    }

    /**
     * 根据 slug 获取工具详情
     */
    public ToolResponse getTool(String slug) {
        ToolConfig config = toolConfigRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("工具不存在: " + slug));
        if (config.getStatus() != 1) {
            throw new RuntimeException("工具已禁用: " + slug);
        }
        return toResponse(config);
    }

    /**
     * 执行工具（需传入用户名以扣减积分）
     */
    @Transactional
    public ToolExecuteResponse execute(String slug, Map<String, Object> inputs, String username) {
        ToolConfig config = toolConfigRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("工具不存在: " + slug));
        if (config.getStatus() != 1) {
            throw new RuntimeException("工具已禁用: " + slug);
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        int currentPoints = user.getPoints() != null ? user.getPoints() : 0;
        int requiredPoints = 50;
        if (currentPoints < requiredPoints) {
            throw new InsufficientPointsException("积分不足，当前: " + currentPoints + "，需要: " + requiredPoints);
        }

        // 替换 Prompt 模板中的占位符
        String prompt = config.getPromptTemplate();
        if (inputs != null) {
            for (Map.Entry<String, Object> entry : inputs.entrySet()) {
                String placeholder = "{{" + entry.getKey() + "}}";
                String value = entry.getValue() != null ? entry.getValue().toString() : "";
                prompt = prompt.replace(placeholder, value);
            }
        }

        // 调用 AI（根据输出类型选择服务）
        String result;
        if ("video".equals(config.getOutputType())) {
            result = aiVideoService.generateVideo(prompt, resolveVideoDuration(inputs));
        } else if ("image".equals(config.getOutputType())) {
            String size = inputs != null && inputs.containsKey("size")
                    ? inputs.get("size").toString() : "1024x768";
            result = aiImageService.generateImage(prompt, size);
        } else {
            result = aiClientService.chat(prompt);
        }

        // 扣减积分
        user.setPoints(user.getPoints() - 50);
        userRepository.save(user);

        return ToolExecuteResponse.builder()
                .slug(config.getSlug())
                .toolName(config.getName())
                .result(result)
                .outputType(config.getOutputType())
                .remainingPoints(user.getPoints())
                .build();
    }

    private Integer resolveVideoDuration(Map<String, Object> inputs) {
        if (inputs == null || !inputs.containsKey("duration")) {
            return null;
        }
        Object duration = inputs.get("duration");
        if (duration instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(duration.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 查询当前积分
     */
    public int getCurrentPoints(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return user.getPoints() != null ? user.getPoints() : 0;
    }

    /**
     * 充值积分
     */
    @Transactional
    public int addPoints(String username, int points) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        user.setPoints(user.getPoints() + points);
        userRepository.save(user);
        return user.getPoints();
    }

    /**
     * ToolConfig 实体 → ToolResponse DTO
     */
    private ToolResponse toResponse(ToolConfig config) {
        List<Map<String, Object>> inputFields = Collections.emptyList();
        if (config.getInputFields() != null && !config.getInputFields().isEmpty()) {
            try {
                inputFields = objectMapper.readValue(
                        config.getInputFields(),
                        new TypeReference<List<Map<String, Object>>>() {}
                );
            } catch (Exception ignored) {
            }
        }

        return ToolResponse.builder()
                .id(config.getId())
                .name(config.getName())
                .slug(config.getSlug())
                .description(config.getDescription())
                .icon(config.getIcon())
                .category(config.getCategory())
                .outputType(config.getOutputType())
                .sortOrder(config.getSortOrder())
                .inputFields(inputFields)
                .createdAt(config.getCreatedAt())
                .build();
    }
}
