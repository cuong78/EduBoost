package com.fptu.eduBoostBackend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/ai-chat")
@RequiredArgsConstructor
@Slf4j
public class AiChatController {

    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;

    @Value("${ai.deepseek.api-key:}")
    private String deepseekApiKey;

    private static final String DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
    private static final String SYSTEM_PROMPT =
        "Bạn là gia sư AI EduBoost, chuyên hỗ trợ học sinh Việt Nam cấp THCS và THPT. " +
        "Hãy giúp học sinh hiểu bài, giải thích rõ ràng từng bước, " +
        "dùng ngôn ngữ thân thiện phù hợp với lứa tuổi học sinh. " +
        "Nếu cần minh họa hình học hoặc biểu đồ đơn giản, hãy dùng SVG inline. " +
        "Trả lời bằng tiếng Việt trừ khi học sinh hỏi bằng ngôn ngữ khác.";

    /**
     * POST /api/ai-chat/message
     * Body: { "message": "...", "history": [{"role":"user","content":"..."},{"role":"assistant","content":"..."}] }
     */
    @PostMapping("/message")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> body) {
        if (deepseekApiKey == null || deepseekApiKey.isBlank()) {
            throw new BadRequestException("AI service not configured");
        }

        String userMessage = (String) body.get("message");
        if (userMessage == null || userMessage.isBlank()) {
            throw new BadRequestException("Message cannot be empty");
        }

        // Build conversation history
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

        // Include prior history (max 10 turns to keep tokens low)
        List<?> history = (List<?>) body.getOrDefault("history", List.of());
        int start = Math.max(0, history.size() - 20);
        for (int i = start; i < history.size(); i++) {
            if (history.get(i) instanceof Map<?, ?> turn) {
                String role = String.valueOf(turn.get("role"));
                String content = String.valueOf(turn.get("content"));
                if (List.of("user", "assistant").contains(role)) {
                    messages.add(Map.of("role", role, "content", content));
                }
            }
        }
        messages.add(Map.of("role", "user", "content", userMessage));

        // Call DeepSeek
        try {
            RestTemplate rt = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(deepseekApiKey);

            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("model", "deepseek-chat");
            reqBody.put("max_tokens", 1500);
            reqBody.put("temperature", 0.7);
            reqBody.put("messages", messages);

            String json = objectMapper.writeValueAsString(reqBody);
            ResponseEntity<String> resp = rt.exchange(DEEPSEEK_URL, HttpMethod.POST,
                    new HttpEntity<>(json, headers), String.class);

            JsonNode root = objectMapper.readTree(resp.getBody());
            String reply = root.path("choices").get(0).path("message").path("content").asText("");
            int tokens = root.path("usage").path("total_tokens").asInt(0);

            return ResponseEntity.ok(Map.of(
                "reply", reply,
                "tokensUsed", tokens
            ));
        } catch (Exception e) {
            log.error("AI chat error: {}", e.getMessage());
            throw new BadRequestException("AI service error: " + e.getMessage());
        }
    }
}
