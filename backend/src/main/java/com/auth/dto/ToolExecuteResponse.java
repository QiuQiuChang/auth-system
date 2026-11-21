package com.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolExecuteResponse {

    private String slug;
    private String toolName;
    private String result;
    private String outputType;
    private int remainingPoints;
}
