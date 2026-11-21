package com.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private String icon;
    private String category;
    private String outputType;
    private Integer sortOrder;
    private List<Map<String, Object>> inputFields;
    private LocalDateTime createdAt;
}

