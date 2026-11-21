package com.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ToolExecuteRequest {

    @NotBlank(message = "工具标识不能为空")
    private String slug;

    private java.util.Map<String, Object> inputs;
}
