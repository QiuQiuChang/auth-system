package com.auth.service;
import com.auth.dto.ChatMessage;
import com.auth.dto.ChatResponse;
import com.auth.entity.User;
import com.auth.exception.InsufficientPointsException;
import com.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final AiClientService aiClientService;
    private final UserRepository userRepository;
    private static final int CHAT_COST_POINTS = 10;

    @Transactional
    public ChatResponse chat(List<ChatMessage> messages, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        // AI助手聊天不扣积分
        String lastMessage = messages.get(messages.size() - 1).getContent();
        String response = aiClientService.chat(lastMessage);
        return ChatResponse.builder()
            .content(response)
            .pointsUsed(0)
            .remainingPoints(user.getPoints())
            .build();
    }

    public SseEmitter chatStream(List<ChatMessage> messages, String username) {
        SseEmitter emitter = new SseEmitter(300000L);
        new Thread(() -> {
            try {
                ChatResponse response = chat(messages, username);
                String content = response.getContent();
                for (int i = 0; i < content.length(); i += 10) {
                    emitter.send(content.substring(i, Math.min(i + 10, content.length())));
                    Thread.sleep(50);
                }
                emitter.send(SseEmitter.event().name("done").data(response));
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        }).start();
        return emitter;
    }
}
