package com.fptu.eduBoostBackend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptu.eduBoostBackend.dto.request.AIGenerateFromResourceRequest;
import com.fptu.eduBoostBackend.dto.request.AIGenerateFromUrlRequest;
import com.fptu.eduBoostBackend.dto.request.AIGenerateVariationsRequest;
import com.fptu.eduBoostBackend.dto.response.AIGenerateFromResourceResponse;
import com.fptu.eduBoostBackend.dto.response.AIGenerateFromUrlResponse;
import com.fptu.eduBoostBackend.dto.response.AIGenerateVariationsResponse;
import com.fptu.eduBoostBackend.dto.response.AIGeneratedQuestionResponse;
import com.fptu.eduBoostBackend.entities.CognitiveLevel;
import com.fptu.eduBoostBackend.entities.Lesson;
import com.fptu.eduBoostBackend.entities.LessonResource;
import com.fptu.eduBoostBackend.entities.QuestionBank;
import com.fptu.eduBoostBackend.entities.enums.QuestionType;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.CognitiveLevelRepository;
import com.fptu.eduBoostBackend.repositories.LessonRepository;
import com.fptu.eduBoostBackend.repositories.LessonResourceRepository;
import com.fptu.eduBoostBackend.repositories.QuestionBankRepository;
import com.fptu.eduBoostBackend.service.AIQuestionGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIQuestionGeneratorServiceImpl implements AIQuestionGeneratorService {

    private final LessonResourceRepository lessonResourceRepository;
    private final LessonRepository lessonRepository;
    private final CognitiveLevelRepository cognitiveLevelRepository;
    private final QuestionBankRepository questionBankRepository;
    private final ObjectMapper objectMapper;

    @Value("${ai.deepseek.api-key:}")
    private String deepseekApiKey;

    @Value("${ai.deepseek.model:deepseek-chat}")
    private String deepseekModel;

    private static final String DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

    @Override
    public AIGenerateFromResourceResponse generateFromResource(AIGenerateFromResourceRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("Starting AI question generation for resource: {}, lesson: {}", 
                request.getResourceId(), request.getLessonId());

        // 1. Validate and fetch resource
        LessonResource resource = lessonResourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        // 2. Validate lesson
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId()));

        // 3. Check if resource has extracted content
        String content = resource.getExtractedContent();
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Resource does not have extracted content. Please upload a PDF/DOCX file.");
        }

        // 4. Fetch cognitive levels
        List<CognitiveLevel> cognitiveLevels = cognitiveLevelRepository.findAll();
        
        // 5. Build prompt and call AI
        String prompt = buildPrompt(content, request, cognitiveLevels, lesson);
        
        // 6. Call DeepSeek API
        AIResponse aiResponse = callDeepSeekAPI(prompt, request.getNumberOfQuestions());
        
        // 7. Parse response
        List<AIGeneratedQuestionResponse> questions = parseAIResponse(aiResponse.content, request.getQuestionType());
        
        long generationTime = System.currentTimeMillis() - startTime;
        log.info("AI generation completed in {}ms, generated {} questions", generationTime, questions.size());

        return AIGenerateFromResourceResponse.builder()
                .resourceId(resource.getId())
                .lessonId(lesson.getId())
                .resourceName(resource.getResourceName())
                .lessonName(lesson.getLessonName())
                .generatedQuestions(questions)
                .totalQuestionsGenerated(questions.size())
                .tokensUsed(aiResponse.totalTokens)
                .generationTimeMs(generationTime)
                .aiProvider("DEEPSEEK")
                .warnings(new ArrayList<>())
                .build();
    }

    private String buildPrompt(String content, AIGenerateFromResourceRequest request, 
                               List<CognitiveLevel> cognitiveLevels, Lesson lesson) {
        
        StringBuilder sb = new StringBuilder();
        
        sb.append("Bạn là một giáo viên chuyên nghiệp tại Việt Nam. ");
        sb.append("Hãy tạo câu hỏi trắc nghiệm dựa trên nội dung tài liệu sau.\n\n");
        
        // Lesson context
        sb.append("### THÔNG TIN BÀI HỌC:\n");
        sb.append("- Bài học: ").append(lesson.getLessonName()).append("\n");
        sb.append("- Số thứ tự: Bài ").append(lesson.getLessonNumber()).append("\n\n");
        
        // Cognitive levels info
        sb.append("### MỨC ĐỘ NHẬN THỨC (Bloom's Taxonomy):\n");
        for (CognitiveLevel level : cognitiveLevels) {
            sb.append("- ").append(level.getLevel());
            if (level.getDescription() != null) {
                sb.append(": ").append(level.getDescription());
            }
            sb.append("\n");
        }
        sb.append("\n");
        
        // Distribution
        sb.append("### YÊU CẦU PHÂN BỔ CÂU HỎI:\n");
        sb.append("- Tổng số câu cần tạo: ").append(request.getNumberOfQuestions()).append("\n");
        
        if (request.getCognitiveLevelDistribution() != null && !request.getCognitiveLevelDistribution().isEmpty()) {
            sb.append("- Phân bổ theo mức độ:\n");
            for (Map.Entry<String, Integer> entry : request.getCognitiveLevelDistribution().entrySet()) {
                sb.append("  + ").append(entry.getKey()).append(": ").append(entry.getValue()).append(" câu\n");
            }
        }
        sb.append("\n");
        
        // Content
        sb.append("### NỘI DUNG TÀI LIỆU:\n");
        // Truncate if too long
        String truncatedContent = content.length() > 60000 ? content.substring(0, 60000) + "..." : content;
        sb.append(truncatedContent);
        sb.append("\n\n");
        
        // Output format
        sb.append("### YÊU CẦU OUTPUT:\n");
        sb.append("Trả về JSON array với format sau (CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC):\n");
        sb.append("```json\n");
        sb.append("[\n");
        sb.append("  {\n");
        sb.append("    \"questionText\": \"Nội dung câu hỏi\",\n");
        sb.append("    \"correctAnswer\": \"Đáp án đúng\",\n");
        sb.append("    \"wrongAnswers\": [\"Đáp án sai 1\", \"Đáp án sai 2\", \"Đáp án sai 3\"],\n");
        sb.append("    \"explanation\": \"Giải thích tại sao đáp án đúng\",\n");
        sb.append("    \"cognitiveLevel\": \"Nhận biết | Thông hiểu | Vận dụng | Vận dụng cao\"\n");
        sb.append("  }\n");
        sb.append("]\n");
        sb.append("```\n");
        
        return sb.toString();
    }

    private AIResponse callDeepSeekAPI(String prompt, int numberOfQuestions) {
        if (deepseekApiKey == null || deepseekApiKey.isEmpty()) {
            throw new BadRequestException("DeepSeek API key is not configured. Please set ai.deepseek.api-key");
        }

        RestTemplate restTemplate = new RestTemplate();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(deepseekApiKey);

        // Build request body (OpenAI-compatible format)
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", deepseekModel);
        requestBody.put("max_tokens", Math.max(4096, numberOfQuestions * 500));
        requestBody.put("temperature", 0.7);
        
        List<Map<String, String>> messages = new ArrayList<>();
        
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "Bạn là giáo viên chuyên tạo câu hỏi trắc nghiệm. Luôn trả về JSON hợp lệ.");
        messages.add(systemMessage);
        
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        messages.add(userMessage);
        
        requestBody.put("messages", messages);

        try {
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
            
            log.info("Calling DeepSeek API with model: {}", deepseekModel);
            ResponseEntity<String> response = restTemplate.exchange(
                    DEEPSEEK_API_URL, HttpMethod.POST, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            
            String content = "";
            JsonNode choices = root.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).get("message");
                if (message != null && message.has("content")) {
                    content = message.get("content").asText();
                }
            }
            
            int totalTokens = 0;
            JsonNode usage = root.get("usage");
            if (usage != null && usage.has("total_tokens")) {
                totalTokens = usage.get("total_tokens").asInt();
            }
            
            log.info("DeepSeek response received. Total tokens: {}", totalTokens);
            return new AIResponse(content, totalTokens);
            
        } catch (Exception e) {
            log.error("Error calling DeepSeek API", e);
            throw new BadRequestException("Error calling AI service: " + e.getMessage());
        }
    }

    private List<AIGeneratedQuestionResponse> parseAIResponse(String content, QuestionType questionType) {
        List<AIGeneratedQuestionResponse> questions = new ArrayList<>();
        
        try {
            String jsonContent = extractJsonFromResponse(content);
            
            List<Map<String, Object>> rawQuestions = objectMapper.readValue(
                    jsonContent, new TypeReference<List<Map<String, Object>>>() {});
            
            for (Map<String, Object> raw : rawQuestions) {
                AIGeneratedQuestionResponse question = AIGeneratedQuestionResponse.builder()
                        .questionText((String) raw.get("questionText"))
                        .correctAnswer((String) raw.get("correctAnswer"))
                        .wrongAnswers((List<String>) raw.get("wrongAnswers"))
                        .explanation((String) raw.get("explanation"))
                        .cognitiveLevel((String) raw.get("cognitiveLevel"))
                        .questionType(questionType)
                        .build();
                questions.add(question);
            }
        } catch (Exception e) {
            log.error("Error parsing AI response: {}", e.getMessage());
            throw new BadRequestException("Error parsing AI response. Please try again.");
        }
        
        return questions;
    }

    private String extractJsonFromResponse(String content) {
        content = content.trim();
        if (content.startsWith("```json")) content = content.substring(7);
        else if (content.startsWith("```")) content = content.substring(3);
        if (content.endsWith("```")) content = content.substring(0, content.length() - 3);
        
        int start = content.indexOf('[');
        int end = content.lastIndexOf(']');
        if (start != -1 && end != -1 && end > start) {
            content = content.substring(start, end + 1);
        }
        return content.trim();
    }

    private static class AIResponse {
        String content;
        int totalTokens;
        AIResponse(String content, int totalTokens) {
            this.content = content;
            this.totalTokens = totalTokens;
        }
    }

    @Override
    public AIGenerateVariationsResponse generateVariations(AIGenerateVariationsRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("Starting AI variation generation for {} base questions, {} variations each", 
                request.getBaseQuestionIds().size(), request.getNumberOfVariations());

        // 1. Fetch base questions
        List<QuestionBank> baseQuestions = questionBankRepository.findAllById(request.getBaseQuestionIds());
        if (baseQuestions.isEmpty()) {
            throw new ResourceNotFoundException("No questions found with the provided IDs");
        }

        // 2. Fetch cognitive levels for reference
        List<CognitiveLevel> cognitiveLevels = cognitiveLevelRepository.findAll();
        
        // 3. Build prompt and call AI
        String prompt = buildVariationsPrompt(baseQuestions, request.getNumberOfVariations(), cognitiveLevels);
        
        // 4. Call DeepSeek API
        int estimatedQuestions = baseQuestions.size() * request.getNumberOfVariations();
        AIResponse aiResponse = callDeepSeekAPI(prompt, estimatedQuestions);
        
        // 5. Parse response and group by base question
        List<AIGenerateVariationsResponse.VariationGroup> variationGroups = 
                parseVariationsResponse(aiResponse.content, baseQuestions, cognitiveLevels);
        
        int totalVariations = variationGroups.stream()
                .mapToInt(g -> g.getVariations().size())
                .sum();
        
        long generationTime = System.currentTimeMillis() - startTime;
        log.info("AI variations completed in {}ms, generated {} variations", generationTime, totalVariations);

        return AIGenerateVariationsResponse.builder()
                .variationGroups(variationGroups)
                .totalVariationsGenerated(totalVariations)
                .tokensUsed(aiResponse.totalTokens)
                .generationTimeMs(generationTime)
                .aiProvider("DEEPSEEK")
                .warnings(new ArrayList<>())
                .build();
    }

    @Override
    public AIGenerateFromUrlResponse generateFromUrl(AIGenerateFromUrlRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("Starting AI question generation from URL: {}", request.getUrl());

        // 1. Validate lesson
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId()));

        // 2. Fetch content from URL using Jsoup
        String content;
        String title;
        try {
            Document doc = Jsoup.connect(request.getUrl())
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(30000)
                    .get();
            
            title = doc.title();
            // Extract main text content, remove scripts and styles
            doc.select("script, style, nav, footer, header, aside").remove();
            content = doc.body().text();
            
            if (content == null || content.trim().isEmpty()) {
                throw new BadRequestException("Could not extract content from URL");
            }
        } catch (Exception e) {
            log.error("Error fetching URL content: {}", e.getMessage());
            throw new BadRequestException("Failed to fetch content from URL: " + e.getMessage());
        }

        // 3. Fetch cognitive levels
        List<CognitiveLevel> cognitiveLevels = cognitiveLevelRepository.findAll();
        
        // 4. Build prompt and call AI
        String prompt = buildUrlPrompt(content, title, request, cognitiveLevels, lesson);
        
        // 5. Call DeepSeek API
        AIResponse aiResponse = callDeepSeekAPI(prompt, request.getNumberOfQuestions());
        
        // 6. Parse response
        List<AIGeneratedQuestionResponse> questions = parseAIResponse(aiResponse.content, request.getQuestionType());
        
        long generationTime = System.currentTimeMillis() - startTime;
        log.info("AI URL generation completed in {}ms, generated {} questions", generationTime, questions.size());

        return AIGenerateFromUrlResponse.builder()
                .sourceUrl(request.getUrl())
                .lessonId(lesson.getId())
                .lessonName(lesson.getLessonName())
                .extractedTitle(title)
                .contentLength(content.length())
                .generatedQuestions(questions)
                .totalQuestionsGenerated(questions.size())
                .tokensUsed(aiResponse.totalTokens)
                .generationTimeMs(generationTime)
                .aiProvider("DEEPSEEK")
                .warnings(new ArrayList<>())
                .build();
    }

    private String buildVariationsPrompt(List<QuestionBank> baseQuestions, int numberOfVariations, 
                                         List<CognitiveLevel> cognitiveLevels) {
        StringBuilder sb = new StringBuilder();
        
        sb.append("Bạn là một giáo viên chuyên nghiệp tại Việt Nam. ");
        sb.append("Hãy tạo các biến thể (variations) cho các câu hỏi gốc sau đây.\n\n");
        
        sb.append("### YÊU CẦU:\n");
        sb.append("- Tạo ").append(numberOfVariations).append(" biến thể cho MỖI câu hỏi gốc\n");
        sb.append("- Biến thể phải giữ nguyên ý nghĩa và mức độ khó tương đương\n");
        sb.append("- Thay đổi cách diễn đạt, số liệu, hoặc ngữ cảnh\n");
        sb.append("- Đảm bảo đáp án mới phù hợp với câu hỏi mới\n\n");
        
        sb.append("### MỨC ĐỘ NHẬN THỨC:\n");
        for (CognitiveLevel level : cognitiveLevels) {
            sb.append("- ").append(level.getLevel()).append("\n");
        }
        sb.append("\n");
        
        sb.append("### CÁC CÂU HỎI GỐC:\n");
        for (int i = 0; i < baseQuestions.size(); i++) {
            QuestionBank q = baseQuestions.get(i);
            sb.append("\nCâu hỏi gốc #").append(q.getId()).append(":\n");
            sb.append("- Nội dung: ").append(q.getQuestionText()).append("\n");
            sb.append("- Đáp án đúng: ").append(q.getCorrectAnswer()).append("\n");
            sb.append("- Mức độ: ").append(q.getCognitiveLevel().getLevel()).append("\n");
            if (q.getExplanation() != null) {
                sb.append("- Giải thích: ").append(q.getExplanation()).append("\n");
            }
        }
        
        sb.append("\n### YÊU CẦU OUTPUT:\n");
        sb.append("Trả về JSON với format sau (CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC):\n");
        sb.append("```json\n");
        sb.append("{\n");
        sb.append("  \"variations\": [\n");
        sb.append("    {\n");
        sb.append("      \"baseQuestionId\": 1,\n");
        sb.append("      \"variationList\": [\n");
        sb.append("        {\n");
        sb.append("          \"questionText\": \"Nội dung câu hỏi biến thể\",\n");
        sb.append("          \"correctAnswer\": \"Đáp án đúng\",\n");
        sb.append("          \"wrongAnswers\": [\"Sai 1\", \"Sai 2\", \"Sai 3\"],\n");
        sb.append("          \"explanation\": \"Giải thích\",\n");
        sb.append("          \"cognitiveLevel\": \"Nhận biết | Thông hiểu | Vận dụng | Vận dụng cao\"\n");
        sb.append("        }\n");
        sb.append("      ]\n");
        sb.append("    }\n");
        sb.append("  ]\n");
        sb.append("}\n");
        sb.append("```\n");
        
        return sb.toString();
    }

    private String buildUrlPrompt(String content, String title, AIGenerateFromUrlRequest request,
                                  List<CognitiveLevel> cognitiveLevels, Lesson lesson) {
        StringBuilder sb = new StringBuilder();
        
        sb.append("Bạn là một giáo viên chuyên nghiệp tại Việt Nam. ");
        sb.append("Hãy tạo câu hỏi trắc nghiệm dựa trên nội dung bài viết sau.\n\n");
        
        sb.append("### THÔNG TIN BÀI HỌC:\n");
        sb.append("- Bài học: ").append(lesson.getLessonName()).append("\n");
        sb.append("- Số thứ tự: Bài ").append(lesson.getLessonNumber()).append("\n\n");
        
        sb.append("### TIÊU ĐỀ BÀI VIẾT:\n");
        sb.append(title).append("\n\n");
        
        sb.append("### MỨC ĐỘ NHẬN THỨC:\n");
        for (CognitiveLevel level : cognitiveLevels) {
            sb.append("- ").append(level.getLevel()).append("\n");
        }
        sb.append("\n");
        
        sb.append("### YÊU CẦU:\n");
        sb.append("- Tổng số câu cần tạo: ").append(request.getNumberOfQuestions()).append("\n");
        sb.append("- Câu hỏi phải liên quan đến nội dung bài viết\n");
        sb.append("- Phân bổ đều các mức độ nhận thức\n\n");
        
        sb.append("### NỘI DUNG BÀI VIẾT:\n");
        String truncatedContent = content.length() > 50000 ? content.substring(0, 50000) + "..." : content;
        sb.append(truncatedContent);
        sb.append("\n\n");
        
        sb.append("### YÊU CẦU OUTPUT:\n");
        sb.append("Trả về JSON array với format sau (CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC):\n");
        sb.append("```json\n");
        sb.append("[\n");
        sb.append("  {\n");
        sb.append("    \"questionText\": \"Nội dung câu hỏi\",\n");
        sb.append("    \"correctAnswer\": \"Đáp án đúng\",\n");
        sb.append("    \"wrongAnswers\": [\"Đáp án sai 1\", \"Đáp án sai 2\", \"Đáp án sai 3\"],\n");
        sb.append("    \"explanation\": \"Giải thích tại sao đáp án đúng\",\n");
        sb.append("    \"cognitiveLevel\": \"Nhận biết | Thông hiểu | Vận dụng | Vận dụng cao\"\n");
        sb.append("  }\n");
        sb.append("]\n");
        sb.append("```\n");
        
        return sb.toString();
    }

    private List<AIGenerateVariationsResponse.VariationGroup> parseVariationsResponse(
            String content, List<QuestionBank> baseQuestions, List<CognitiveLevel> cognitiveLevels) {
        
        List<AIGenerateVariationsResponse.VariationGroup> groups = new ArrayList<>();
        
        try {
            String jsonContent = extractJsonFromResponse(content);
            // Handle both object format and array format
            JsonNode root = objectMapper.readTree(jsonContent);
            
            JsonNode variationsNode = root.has("variations") ? root.get("variations") : root;
            
            if (variationsNode.isArray()) {
                for (JsonNode groupNode : variationsNode) {
                    long baseId = groupNode.get("baseQuestionId").asLong();
                    
                    // Find base question
                    QuestionBank baseQ = baseQuestions.stream()
                            .filter(q -> q.getId().equals(baseId))
                            .findFirst()
                            .orElse(null);
                    
                    if (baseQ == null) continue;
                    
                    List<AIGeneratedQuestionResponse> variations = new ArrayList<>();
                    JsonNode variationList = groupNode.get("variationList");
                    
                    if (variationList != null && variationList.isArray()) {
                        for (JsonNode varNode : variationList) {
                            List<String> wrongAnswers = new ArrayList<>();
                            if (varNode.has("wrongAnswers")) {
                                for (JsonNode wa : varNode.get("wrongAnswers")) {
                                    wrongAnswers.add(wa.asText());
                                }
                            }
                            
                            AIGeneratedQuestionResponse var = AIGeneratedQuestionResponse.builder()
                                    .questionText(varNode.has("questionText") ? varNode.get("questionText").asText() : "")
                                    .correctAnswer(varNode.has("correctAnswer") ? varNode.get("correctAnswer").asText() : "")
                                    .wrongAnswers(wrongAnswers)
                                    .explanation(varNode.has("explanation") ? varNode.get("explanation").asText() : "")
                                    .cognitiveLevel(varNode.has("cognitiveLevel") ? varNode.get("cognitiveLevel").asText() : "")
                                    .questionType(baseQ.getQuestionType())
                                    .build();
                            variations.add(var);
                        }
                    }
                    
                    groups.add(AIGenerateVariationsResponse.VariationGroup.builder()
                            .baseQuestionId(baseQ.getId())
                            .baseQuestionText(baseQ.getQuestionText())
                            .variations(variations)
                            .build());
                }
            }
        } catch (Exception e) {
            log.error("Error parsing variations response: {}", e.getMessage());
            throw new BadRequestException("Error parsing AI response. Please try again.");
        }
        
        return groups;
    }
}