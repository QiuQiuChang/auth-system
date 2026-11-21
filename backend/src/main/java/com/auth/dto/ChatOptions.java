package com.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 聊天请求参数配置
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatOptions {

    @Builder.Default
    private Double temperature = 0.7;

    @Builder.Default
    private Double topP = 0.9;

    @Builder.Default
    private Integer maxTokens = 2048;

    @Builder.Default
    private Boolean stream = false;

    @Builder.Default
    private Boolean enableThinking = false;

    @Builder.Default
    private Integer thinkingBudget = 2048;
}
