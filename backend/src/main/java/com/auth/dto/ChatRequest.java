package com.auth.dto;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;
@Data
public class ChatRequest {
    @NotEmpty(message = "消息不能为空")
    private List<ChatMessage> messages;
    private Boolean stream = false;
}
