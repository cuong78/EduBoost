package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.response.QuestionBankResponse;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.DifficultyLevel;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import com.fptu.eduBoostBackend.entities.enums.QuestionType;
import com.fptu.eduBoostBackend.repositories.*;
import com.fptu.eduBoostBackend.service.FileStorageService;
import com.fptu.eduBoostBackend.service.WordImportService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.*;
import org.apache.xmlbeans.XmlCursor;
import org.apache.xmlbeans.XmlObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
// No mock dependency — using custom ByteArrayMultipartFile
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import java.io.*;
import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WordImportServiceImpl implements WordImportService {

    private final QuestionBankRepository questionBankRepository;
    private final LessonRepository lessonRepository;
    private final CognitiveLevelRepository cognitiveLevelRepository;
    private final FileStorageService fileStorageService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.deepseek.api-key:}")
    private String deepseekApiKey;

    // OMML Namespace
    private static final String MATH_NS = "http://schemas.openxmlformats.org/officeDocument/2006/math";
    private static final String WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

    @Override
    @Transactional
    public List<QuestionBankResponse> importFromWord(MultipartFile file, Long lessonId, boolean useAiClassification) {
        log.info("Importing questions from Word file: {} for lesson: {}", file.getOriginalFilename(), lessonId);

        // Validate
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();

        try (InputStream is = file.getInputStream();
             XWPFDocument document = new XWPFDocument(is)) {

            // 1. Build image mapping: rId -> MinIO URL
            Map<String, String> imageMap = extractAndUploadImages(document);

            // 2. Parse paragraphs to text with LaTeX math
            List<String> textBlocks = new ArrayList<>();
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                String text = parseParagraph(paragraph, imageMap);
                if (!text.isBlank()) {
                    textBlocks.add(text);
                }
            }

            String fullContent = String.join("\n", textBlocks);
            log.info("Parsed {} text blocks from Word document", textBlocks.size());

            // 3. Split by "Câu N:" pattern
            String[] rawQuestions = fullContent.split("(?=Câu\\s+\\d+[:.])");

            List<QuestionBank> questions = new ArrayList<>();
            CognitiveLevel defaultLevel = cognitiveLevelRepository.findAll().stream()
                    .findFirst().orElse(null);

            for (String rawQ : rawQuestions) {
                rawQ = rawQ.trim();
                if (rawQ.isEmpty() || !rawQ.matches("(?s)Câu\\s+\\d+[:.].+")) continue;

                try {
                    QuestionBank q = parseQuestion(rawQ, lesson, currentUser, defaultLevel);
                    if (q != null) {
                        questions.add(q);
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse question: {}", e.getMessage());
                }
            }

            // Save all questions
            questions = questionBankRepository.saveAll(questions);
            log.info("Saved {} questions from Word file", questions.size());

            // 4. AI classification if requested
            if (useAiClassification && !deepseekApiKey.isBlank() && !questions.isEmpty()) {
                classifyQuestionsWithAI(questions);
                questions = questionBankRepository.saveAll(questions);
            }

            return questions.stream().map(this::mapToResponse).collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error importing Word file: {}", e.getMessage(), e);
            throw new RuntimeException("Error importing Word file: " + e.getMessage(), e);
        }
    }

    // ======================== IMAGE EXTRACTION ========================

    private Map<String, String> extractAndUploadImages(XWPFDocument document) {
        Map<String, String> imageMap = new HashMap<>();

        for (XWPFPictureData pic : document.getAllPictures()) {
            try {
                String extension = pic.suggestFileExtension();
                String contentType = "image/" + (extension.equals("emf") || extension.equals("wmf") ? "png" : extension);
                String fileName = UUID.randomUUID() + "." + extension;
                byte[] data = pic.getData();

                // Create a simple MultipartFile from bytes
                MultipartFile multipartFile = new MultipartFile() {
                    @Override public String getName() { return "image"; }
                    @Override public String getOriginalFilename() { return fileName; }
                    @Override public String getContentType() { return contentType; }
                    @Override public boolean isEmpty() { return data.length == 0; }
                    @Override public long getSize() { return data.length; }
                    @Override public byte[] getBytes() { return data; }
                    @Override public InputStream getInputStream() { return new ByteArrayInputStream(data); }
                    @Override public void transferTo(java.io.File dest) throws IOException {
                        try (FileOutputStream fos = new FileOutputStream(dest)) { fos.write(data); }
                    }
                };

                String objectKey = fileStorageService.storeFile(multipartFile);
                // Map by relationship IDs — all relations for this picture
                imageMap.put(pic.getPackagePart().getPartName().getName(), objectKey);
                log.debug("Uploaded image: {} -> {}", pic.getFileName(), objectKey);

            } catch (Exception e) {
                log.warn("Failed to upload image {}: {}", pic.getFileName(), e.getMessage());
            }
        }

        return imageMap;
    }

    // ======================== PARAGRAPH PARSING ========================

    private String parseParagraph(XWPFParagraph paragraph, Map<String, String> imageMap) {
        StringBuilder result = new StringBuilder();

        // Get the underlying XML
        XmlObject xmlObj = paragraph.getCTP().copy();
        Node domNode = xmlObj.getDomNode();

        NodeList children = domNode.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            Node child = children.item(i);
            String localName = child.getLocalName();
            if (localName == null) continue;

            switch (localName) {
                case "r":
                    result.append(parseRun(child));
                    break;
                case "oMathPara":
                case "oMath":
                    String math = parseOmmlToLatex(child);
                    if (!math.isBlank()) {
                        result.append("$").append(math).append("$");
                    }
                    break;
                case "hyperlink":
                    result.append(parseHyperlink(child));
                    break;
                case "drawing":
                case "pict":
                    String imgUrl = extractImageUrl(child, paragraph, imageMap);
                    if (imgUrl != null) {
                        result.append("[IMG:").append(imgUrl).append("]");
                    }
                    break;
            }
        }

        // Also check for images via runs
        for (XWPFRun run : paragraph.getRuns()) {
            if (run.getEmbeddedPictures() != null) {
                for (XWPFPicture pic : run.getEmbeddedPictures()) {
                    try {
                        String picName = pic.getPictureData().getPackagePart().getPartName().getName();
                        String url = imageMap.get(picName);
                        if (url != null && !result.toString().contains(url)) {
                            result.append("[IMG:").append(url).append("]");
                        }
                    } catch (Exception e) {
                        // ignore
                    }
                }
            }
        }

        return result.toString();
    }

    private String parseRun(Node runNode) {
        StringBuilder text = new StringBuilder();
        boolean isSuperscript = false;
        boolean isSubscript = false;
        boolean isHighlight = false;

        NodeList children = runNode.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            Node child = children.item(i);
            String localName = child.getLocalName();
            if (localName == null) continue;

            if ("rPr".equals(localName)) {
                // Check properties
                NodeList props = child.getChildNodes();
                for (int j = 0; j < props.getLength(); j++) {
                    Node prop = props.item(j);
                    if ("vertAlign".equals(prop.getLocalName())) {
                        String val = getAttrVal(prop);
                        if ("superscript".equals(val)) isSuperscript = true;
                        if ("subscript".equals(val)) isSubscript = true;
                    }
                    if ("highlight".equals(prop.getLocalName())) {
                        isHighlight = true;
                    }
                }
            } else if ("t".equals(localName)) {
                String t = getNodeText(child);
                if (t != null) {
                    if (isSuperscript) t = "^{" + t + "}";
                    else if (isSubscript) t = "_{" + t + "}";
                    if (isHighlight) t = "[[HL]]" + t + "[[HL]]";
                    text.append(t);
                }
            }
        }

        return text.toString();
    }

    private String parseHyperlink(Node node) {
        StringBuilder text = new StringBuilder();
        NodeList children = node.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            Node child = children.item(i);
            if ("r".equals(child.getLocalName())) {
                text.append(parseRun(child));
            }
        }
        return text.toString();
    }

    private String extractImageUrl(Node node, XWPFParagraph para, Map<String, String> imageMap) {
        // Try to find blip reference
        return findBlipUrl(node, imageMap);
    }

    private String findBlipUrl(Node node, Map<String, String> imageMap) {
        if (node == null) return null;

        if ("blip".equals(node.getLocalName())) {
            // Get r:embed attribute
            Node embed = node.getAttributes() != null ? node.getAttributes().getNamedItemNS(
                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships", "embed") : null;
            if (embed != null) {
                // This gives us a relationship ID, would need to resolve
                // For simplicity, search imageMap by key pattern
                for (Map.Entry<String, String> entry : imageMap.entrySet()) {
                    return entry.getValue(); // Return first match as fallback
                }
            }
        }

        // Recurse into children
        NodeList children = node.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            String result = findBlipUrl(children.item(i), imageMap);
            if (result != null) return result;
        }
        return null;
    }

    // ======================== OMML TO LATEX CONVERSION ========================

    private String parseOmmlToLatex(Node node) {
        if (node == null) return "";

        StringBuilder result = new StringBuilder();
        NodeList children = node.getChildNodes();

        for (int i = 0; i < children.getLength(); i++) {
            Node child = children.item(i);
            String localName = child.getLocalName();
            if (localName == null) {
                String txt = getNodeText(child);
                if (txt != null && !txt.isBlank()) {
                    result.append(txt);
                }
                continue;
            }

            switch (localName) {
                case "oMathPara":
                case "oMath":
                    result.append(parseOmmlToLatex(child));
                    break;

                case "sSup": {
                    // Superscript: base^{sup}
                    String base = parseOmmlToLatex(getChildByName(child, "e"));
                    String sup = parseOmmlToLatex(getChildByName(child, "sup"));
                    result.append(base).append("^{").append(sup).append("}");
                    break;
                }
                case "sSub": {
                    // Subscript: base_{sub}
                    String base = parseOmmlToLatex(getChildByName(child, "e"));
                    String sub = parseOmmlToLatex(getChildByName(child, "sub"));
                    result.append(base).append("_{").append(sub).append("}");
                    break;
                }
                case "sSubSup": {
                    // Both: base_{sub}^{sup}
                    String base = parseOmmlToLatex(getChildByName(child, "e"));
                    String sub = parseOmmlToLatex(getChildByName(child, "sub"));
                    String sup = parseOmmlToLatex(getChildByName(child, "sup"));
                    result.append(base).append("_{").append(sub).append("}^{").append(sup).append("}");
                    break;
                }
                case "sPre": {
                    // Pre-script: _{sub}^{sup}base
                    String base = parseOmmlToLatex(getChildByName(child, "e"));
                    String sub = parseOmmlToLatex(getChildByName(child, "sub"));
                    String sup = parseOmmlToLatex(getChildByName(child, "sup"));
                    result.append("{}_{").append(sub).append("}^{").append(sup).append("}").append(base);
                    break;
                }
                case "f": {
                    // Fraction: \frac{num}{den}
                    String num = parseOmmlToLatex(getChildByName(child, "num"));
                    String den = parseOmmlToLatex(getChildByName(child, "den"));
                    String fType = getChrFromPr(child, "fPr", "type");
                    if ("lin".equals(fType)) {
                        result.append(num).append("/").append(den);
                    } else {
                        result.append("\\frac{").append(num).append("}{").append(den).append("}");
                    }
                    break;
                }
                case "rad": {
                    // Radical: \sqrt[deg]{content}
                    String deg = parseOmmlToLatex(getChildByName(child, "deg")).trim();
                    String content = parseOmmlToLatex(getChildByName(child, "e"));
                    if (!deg.isEmpty()) {
                        result.append("\\sqrt[").append(deg).append("]{").append(content).append("}");
                    } else {
                        result.append("\\sqrt{").append(content).append("}");
                    }
                    break;
                }
                case "nary": {
                    // N-ary: \sum_{sub}^{sup} content
                    String symbol = getChrFromPr(child, "naryPr", "chr");
                    String sub = parseOmmlToLatex(getChildByName(child, "sub")).trim();
                    String sup = parseOmmlToLatex(getChildByName(child, "sup")).trim();
                    String content = parseOmmlToLatex(getChildByName(child, "e"));

                    String latexCmd = mapNarySymbol(symbol);
                    result.append(latexCmd);
                    if (!sub.isEmpty()) result.append("_{").append(sub).append("}");
                    if (!sup.isEmpty()) result.append("^{").append(sup).append("}");
                    result.append("{").append(content).append("}");
                    break;
                }
                case "d": {
                    // Delimiter: (content) / [content] / |content|
                    String begChr = "(";
                    String endChr = ")";
                    Node dPr = getChildByName(child, "dPr");
                    if (dPr != null) {
                        String b = getChrVal(dPr, "begChr");
                        String e_chr = getChrVal(dPr, "endChr");
                        if (b != null) begChr = b;
                        if (e_chr != null) endChr = e_chr;
                    }
                    // Collect all 'e' elements
                    List<String> parts = new ArrayList<>();
                    NodeList dChildren = child.getChildNodes();
                    for (int j = 0; j < dChildren.getLength(); j++) {
                        if ("e".equals(dChildren.item(j).getLocalName())) {
                            parts.add(parseOmmlToLatex(dChildren.item(j)));
                        }
                    }
                    // Map delimiters to LaTeX
                    String leftDelim = mapDelimiter(begChr, true);
                    String rightDelim = mapDelimiter(endChr, false);
                    result.append(leftDelim).append(String.join(", ", parts)).append(rightDelim);
                    break;
                }
                case "func": {
                    // Function: sin, cos, tan, log, lim
                    String fName = parseOmmlToLatex(getChildByName(child, "fName")).trim();
                    String content = parseOmmlToLatex(getChildByName(child, "e"));
                    String latexFunc = mapFunctionName(fName);
                    result.append(latexFunc).append("(").append(content).append(")");
                    break;
                }
                case "acc": {
                    // Accent: hat, bar, vec, dot, tilde
                    String accChar = getChrFromPr(child, "accPr", "chr");
                    String content = parseOmmlToLatex(getChildByName(child, "e"));
                    result.append(mapAccent(accChar, content));
                    break;
                }
                case "bar": {
                    // Overbar/Underbar
                    String content = parseOmmlToLatex(getChildByName(child, "e"));
                    String pos = getChrFromPr(child, "barPr", "pos");
                    if ("bot".equals(pos)) {
                        result.append("\\underline{").append(content).append("}");
                    } else {
                        result.append("\\overline{").append(content).append("}");
                    }
                    break;
                }
                case "limLow": {
                    String base = parseOmmlToLatex(getChildByName(child, "e"));
                    String lim = parseOmmlToLatex(getChildByName(child, "lim"));
                    result.append(base).append("_{").append(lim).append("}");
                    break;
                }
                case "limUpp": {
                    String base = parseOmmlToLatex(getChildByName(child, "e"));
                    String lim = parseOmmlToLatex(getChildByName(child, "lim"));
                    result.append(base).append("^{").append(lim).append("}");
                    break;
                }
                case "eqArr": {
                    // Equation array
                    List<String> eqs = new ArrayList<>();
                    NodeList arrChildren = child.getChildNodes();
                    for (int j = 0; j < arrChildren.getLength(); j++) {
                        if ("e".equals(arrChildren.item(j).getLocalName())) {
                            eqs.add(parseOmmlToLatex(arrChildren.item(j)));
                        }
                    }
                    result.append("\\begin{cases}").append(String.join(" \\\\ ", eqs)).append("\\end{cases}");
                    break;
                }
                case "m": {
                    // Matrix
                    List<String> rows = new ArrayList<>();
                    NodeList mChildren = child.getChildNodes();
                    for (int j = 0; j < mChildren.getLength(); j++) {
                        if ("mr".equals(mChildren.item(j).getLocalName())) {
                            List<String> cols = new ArrayList<>();
                            NodeList mrChildren = mChildren.item(j).getChildNodes();
                            for (int k = 0; k < mrChildren.getLength(); k++) {
                                if ("e".equals(mrChildren.item(k).getLocalName())) {
                                    cols.add(parseOmmlToLatex(mrChildren.item(k)));
                                }
                            }
                            rows.add(String.join(" & ", cols));
                        }
                    }
                    result.append("\\begin{pmatrix}").append(String.join(" \\\\ ", rows)).append("\\end{pmatrix}");
                    break;
                }
                case "groupChr": {
                    String content = parseOmmlToLatex(getChildByName(child, "e"));
                    String chr = getChrFromPr(child, "groupChrPr", "chr");
                    if ("⏟".equals(chr) || chr == null) {
                        result.append("\\underbrace{").append(content).append("}");
                    } else if ("⏞".equals(chr)) {
                        result.append("\\overbrace{").append(content).append("}");
                    } else {
                        result.append(content);
                    }
                    break;
                }
                case "box":
                case "borderBox":
                case "phant": {
                    result.append(parseOmmlToLatex(getChildByName(child, "e")));
                    break;
                }

                // Text elements
                case "t": {
                    String t = getNodeText(child);
                    if (t != null) result.append(escapeLatexText(t));
                    break;
                }
                case "r": {
                    result.append(parseOmmlRun(child));
                    break;
                }

                // Skip property elements
                default:
                    if (localName.endsWith("Pr")) break;
                    result.append(parseOmmlToLatex(child));
                    break;
            }
        }

        return result.toString();
    }

    private String parseOmmlRun(Node runNode) {
        StringBuilder text = new StringBuilder();
        NodeList children = runNode.getChildNodes();
        boolean isSuperscript = false;
        boolean isSubscript = false;

        for (int i = 0; i < children.getLength(); i++) {
            Node child = children.item(i);
            String localName = child.getLocalName();
            if (localName == null) continue;

            if ("rPr".equals(localName)) {
                NodeList props = child.getChildNodes();
                for (int j = 0; j < props.getLength(); j++) {
                    Node prop = props.item(j);
                    if ("sty".equals(prop.getLocalName())) {
                        // Math style — skip for now
                    }
                }
            } else if ("t".equals(localName)) {
                String t = getNodeText(child);
                if (t != null) text.append(t);
            }
        }
        return text.toString();
    }

    // ======================== QUESTION PARSING ========================

    private QuestionBank parseQuestion(String rawText, Lesson lesson, User user, CognitiveLevel defaultLevel) {
        // Remove "Câu N:" prefix
        String cleaned = rawText.replaceFirst("Câu\\s+\\d+[:.\\s]*", "").trim();
        if (cleaned.isEmpty()) return null;

        // Detect question type
        QuestionType questionType = detectQuestionType(cleaned);

        // Extract correct answer
        String correctAnswer = extractCorrectAnswer(cleaned, questionType);

        // Extract explanation
        String explanation = extractExplanation(cleaned);

        // Clean question text (remove answer section and explanation)
        String questionText = cleanQuestionText(cleaned, questionType);

        // Extract image URLs from text
        String questionImageUrl = null;
        String answerImageUrl = null;

        // Find images in question text
        Pattern imgPattern = Pattern.compile("\\[IMG:([^\\]]+)\\]");
        Matcher imgMatcher = imgPattern.matcher(questionText);
        if (imgMatcher.find()) {
            questionImageUrl = imgMatcher.group(1);
        }

        // Check for images in answer area
        String answerArea = cleaned.length() > questionText.length() ? cleaned.substring(questionText.length()) : "";
        Matcher ansImgMatcher = imgPattern.matcher(answerArea);
        if (ansImgMatcher.find()) {
            answerImageUrl = ansImgMatcher.group(1);
        }

        // Keep [IMG:objectKey] placeholders in questionText — MathRenderer will render them as <img>
        // questionText = questionText.replaceAll("\\[IMG:[^\\]]+\\]", "").trim();

        if (questionText.isBlank()) return null;

        return QuestionBank.builder()
                .lesson(lesson)
                .questionText(questionText)
                .correctAnswer(correctAnswer != null ? correctAnswer : "")
                .explanation(explanation)
                .questionType(questionType)
                .cognitiveLevel(defaultLevel)
                .difficultyLevel(DifficultyLevel.MEDIUM)
                .sourceType(QuestionSourceType.IMPORTED)
                .imageUrl(questionImageUrl)
                .answerImageUrl(answerImageUrl)
                .createdBy(user)
                .usageCount(0)
                .build();
    }

    private QuestionType detectQuestionType(String text) {
        // Clean highlight markers for detection
        String cleanText = text.replaceAll("\\[\\[HL\\]\\]", "");

        // Check for A. B. C. D. options
        if (Pattern.compile("^\\s*[A-D][.)]\\s", Pattern.MULTILINE).matcher(cleanText).find()) {
            return QuestionType.MULTIPLE_CHOICE;
        }

        // Check for Đúng/Sai
        if (Pattern.compile("\\b[Đđ]úng\\b.*\\b[Ss]ai\\b|\\b[Ss]ai\\b.*\\b[Đđ]úng\\b", Pattern.DOTALL)
                .matcher(cleanText).find()) {
            return QuestionType.TRUE_FALSE;
        }

        // Default to fill blank (includes essay)
        return QuestionType.FILL_BLANK;
    }

    private String extractCorrectAnswer(String text, QuestionType type) {
        String cleanText = text;

        if (type == QuestionType.MULTIPLE_CHOICE) {
            // Priority 1: Highlighted answer
            Matcher hlMatch = Pattern.compile("\\[\\[HL\\]\\]\\s*([A-D])").matcher(text);
            if (hlMatch.find()) {
                String letter = hlMatch.group(1).toUpperCase();
                return extractOptionText(cleanText.replaceAll("\\[\\[HL\\]\\]", ""), letter);
            }

            // Priority 2: "Đáp án: X" or "Chọn X"
            Matcher ansMatch = Pattern.compile(
                    "(?:Đáp án(?:\\s+đúng)?(?:\\s+là)?|Chọn(?:\\s+là)?)[:\\s]*([A-D])",
                    Pattern.CASE_INSENSITIVE).matcher(cleanText);
            if (ansMatch.find()) {
                String letter = ansMatch.group(1).toUpperCase();
                return extractOptionText(cleanText.replaceAll("\\[\\[HL\\]\\]", ""), letter);
            }
        } else if (type == QuestionType.TRUE_FALSE) {
            Matcher m = Pattern.compile("(?:Đáp án|Chọn)[:\\s]*(Đúng|Sai)", Pattern.CASE_INSENSITIVE).matcher(text);
            if (m.find()) return m.group(1);

            // Check in explanation
            if (Pattern.compile("\\bĐúng\\b").matcher(text).find()) return "Đúng";
            if (Pattern.compile("\\bSai\\b").matcher(text).find()) return "Sai";
        } else {
            // FILL_BLANK
            Matcher m = Pattern.compile("(?:Đáp án|Chọn)[:\\s]*([^.\\n]+)", Pattern.CASE_INSENSITIVE).matcher(text);
            if (m.find()) return m.group(1).trim();
        }

        return "";
    }

    private String extractOptionText(String text, String letter) {
        Pattern p = Pattern.compile(
                "\\b" + letter + "[.)\\s]\\s*(.*?)(?=\\s*\\b[A-D][.)\\s]|\\s*Lời giải:|\\s*Đáp án:|\\s*Chọn|$)",
                Pattern.DOTALL);
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1).trim();
        }
        return letter;
    }

    private String extractExplanation(String text) {
        Matcher m = Pattern.compile("Lời giải[:\\s]*(.*)", Pattern.DOTALL).matcher(text);
        if (m.find()) return m.group(1).trim();
        return "";
    }

    private String cleanQuestionText(String text, QuestionType type) {
        // Remove highlight markers
        text = text.replaceAll("\\[\\[HL\\]\\]", "");

        if (type == QuestionType.MULTIPLE_CHOICE) {
            // Step 1: Remove everything from "Lời giải:", "Đáp án đúng", "Chọn X" onwards
            Matcher m = Pattern.compile("(Lời giải:|Đáp án đúng|Chọn [A-D])", Pattern.CASE_INSENSITIVE).matcher(text);
            if (m.find()) {
                text = text.substring(0, m.start());
            }
            // Step 2: Remove the A./B./C./D. option lines — keep only lines BEFORE the first option
            // Find the position of the first option line (A. or A))
            Matcher optionStart = Pattern.compile("^\\s*[A-D][.)\\s]", Pattern.MULTILINE).matcher(text);
            if (optionStart.find()) {
                text = text.substring(0, optionStart.start());
            }
        } else {
            Matcher m = Pattern.compile("(Lời giải:|Đáp án:)", Pattern.CASE_INSENSITIVE).matcher(text);
            if (m.find()) {
                text = text.substring(0, m.start());
            }
        }

        // Clean up whitespace
        return Arrays.stream(text.split("\n"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining("\n"));
    }

    // ======================== AI CLASSIFICATION ========================

    private void classifyQuestionsWithAI(List<QuestionBank> questions) {
        List<CognitiveLevel> levels = cognitiveLevelRepository.findAll();
        if (levels.isEmpty()) return;

        int batchSize = 20;
        for (int i = 0; i < questions.size(); i += batchSize) {
            int end = Math.min(i + batchSize, questions.size());
            List<QuestionBank> batch = questions.subList(i, end);

            try {
                classifyBatch(batch, levels);
            } catch (Exception e) {
                log.warn("AI classification failed for batch {}: {}", i / batchSize, e.getMessage());
            }
        }
    }

    private void classifyBatch(List<QuestionBank> batch, List<CognitiveLevel> levels) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Phân loại mức độ nhận thức cho các câu hỏi sau. Các mức độ có thể: ");
        prompt.append(levels.stream().map(CognitiveLevel::getLevel).collect(Collectors.joining(", ")));
        prompt.append(".\n\nTrả về JSON array với format: [{\"index\": 0, \"level\": \"Nhận biết\"}, ...]\n\n");

        for (int i = 0; i < batch.size(); i++) {
            prompt.append("Câu ").append(i).append(": ").append(batch.get(i).getQuestionText()).append("\n");
        }

        Map<String, Object> requestBody = Map.of(
                "model", "deepseek-chat",
                "messages", List.of(
                        Map.of("role", "system", "content", "Bạn là chuyên gia giáo dục. Phân loại mức độ nhận thức câu hỏi theo Bloom's Taxonomy."),
                        Map.of("role", "user", "content", prompt.toString())
                ),
                "temperature", 0.3
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(deepseekApiKey);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.deepseek.com/v1/chat/completions",
                    HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers),
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String content = root.path("choices").path(0).path("message").path("content").asText();

                // Extract JSON array from response
                Matcher jsonMatcher = Pattern.compile("\\[.*\\]", Pattern.DOTALL).matcher(content);
                if (jsonMatcher.find()) {
                    JsonNode results = objectMapper.readTree(jsonMatcher.group());
                    Map<String, CognitiveLevel> levelMap = levels.stream()
                            .collect(Collectors.toMap(CognitiveLevel::getLevel, l -> l, (a, b) -> a));

                    for (JsonNode item : results) {
                        int idx = item.path("index").asInt(-1);
                        String levelName = item.path("level").asText("");
                        if (idx >= 0 && idx < batch.size() && levelMap.containsKey(levelName)) {
                            batch.get(idx).setCognitiveLevel(levelMap.get(levelName));
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("DeepSeek API call failed: {}", e.getMessage());
        }
    }

    // ======================== UTILITY METHODS ========================

    private Node getChildByName(Node parent, String localName) {
        if (parent == null) return null;
        NodeList children = parent.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            if (localName.equals(children.item(i).getLocalName())) {
                return children.item(i);
            }
        }
        return null;
    }

    /**
     * Safe replacement for getTextContent() which throws
     * "DOM Level 3 Not implemented" in xmlbeans.
     * Recursively collects text from child nodes.
     */
    private String getNodeText(Node node) {
        if (node == null) return "";
        short type = node.getNodeType();
        if (type == Node.TEXT_NODE || type == Node.CDATA_SECTION_NODE) {
            return node.getNodeValue() != null ? node.getNodeValue() : "";
        }
        StringBuilder sb = new StringBuilder();
        NodeList children = node.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            sb.append(getNodeText(children.item(i)));
        }
        return sb.toString();
    }

    private String getAttrVal(Node node) {
        if (node == null || node.getAttributes() == null) return null;
        Node val = node.getAttributes().getNamedItemNS(WORD_NS, "val");
        if (val == null) val = node.getAttributes().getNamedItem("val");
        if (val == null) val = node.getAttributes().getNamedItemNS(MATH_NS, "val");
        return val != null ? val.getNodeValue() : null;
    }

    private String getChrFromPr(Node parent, String prName, String chrName) {
        Node pr = getChildByName(parent, prName);
        if (pr == null) return null;
        Node chr = getChildByName(pr, chrName);
        return chr != null ? getAttrVal(chr) : null;
    }

    private String getChrVal(Node parent, String childName) {
        Node child = getChildByName(parent, childName);
        return child != null ? getAttrVal(child) : null;
    }

    private String mapNarySymbol(String symbol) {
        if (symbol == null) return "\\sum";
        return switch (symbol) {
            case "∑" -> "\\sum";
            case "∏" -> "\\prod";
            case "∫" -> "\\int";
            case "∬" -> "\\iint";
            case "∮" -> "\\oint";
            case "⋃" -> "\\bigcup";
            case "⋂" -> "\\bigcap";
            default -> "\\sum";
        };
    }

    private String mapDelimiter(String chr, boolean isLeft) {
        if (chr == null) return isLeft ? "(" : ")";
        return switch (chr) {
            case "(", ")" -> chr;
            case "[", "]" -> chr;
            case "{" -> "\\{";
            case "}" -> "\\}";
            case "|" -> "|";
            case "‖" -> "\\|";
            case "⌊" -> "\\lfloor ";
            case "⌋" -> "\\rfloor ";
            case "⌈" -> "\\lceil ";
            case "⌉" -> "\\rceil ";
            case "⟨" -> "\\langle ";
            case "⟩" -> "\\rangle ";
            default -> chr;
        };
    }

    private String mapFunctionName(String name) {
        if (name == null) return "";
        return switch (name.toLowerCase().trim()) {
            case "sin" -> "\\sin";
            case "cos" -> "\\cos";
            case "tan" -> "\\tan";
            case "cot" -> "\\cot";
            case "sec" -> "\\sec";
            case "csc" -> "\\csc";
            case "log" -> "\\log";
            case "ln" -> "\\ln";
            case "lim" -> "\\lim";
            case "min" -> "\\min";
            case "max" -> "\\max";
            case "exp" -> "\\exp";
            default -> "\\operatorname{" + name + "}";
        };
    }

    private String mapAccent(String accChar, String content) {
        if (accChar == null) return "\\hat{" + content + "}";
        return switch (accChar) {
            case "\u0302", "^" -> "\\hat{" + content + "}";
            case "\u0303", "~" -> "\\tilde{" + content + "}";
            case "\u0304", "¯" -> "\\overline{" + content + "}";
            case "\u20D7", "→" -> "\\vec{" + content + "}";
            case "\u0307", "˙" -> "\\dot{" + content + "}";
            case "\u0308", "¨" -> "\\ddot{" + content + "}";
            default -> "\\hat{" + content + "}";
        };
    }

    private String escapeLatexText(String text) {
        // Only escape special chars that could break LaTeX
        // Don't escape everything, since Vietnamese text should pass through
        return text
                .replace("\\", "\\\\")
                .replace("&", "\\&")
                .replace("#", "\\#")
                .replace("_", "\\_");
    }

    private QuestionBankResponse mapToResponse(QuestionBank question) {
        return QuestionBankResponse.builder()
                .id(question.getId())
                .lessonId(question.getLesson().getId())
                .lessonName("Bài " + question.getLesson().getLessonNumber() + ": " + question.getLesson().getLessonName())
                .questionText(question.getQuestionText())
                .correctAnswer(question.getCorrectAnswer())
                .explanation(question.getExplanation())
                .questionType(question.getQuestionType())
                .cognitiveLevelId(question.getCognitiveLevel().getId())
                .cognitiveLevel(question.getCognitiveLevel().getLevel())
                .difficultyLevel(question.getDifficultyLevel())
                .sourceType(question.getSourceType())
                .sourceReference(question.getSourceReference())
                .createdById(question.getCreatedBy().getUserId())
                .createdByName(question.getCreatedBy().getFullName())
                .usageCount(question.getUsageCount())
                .imageUrl(question.getImageUrl())
                .answerImageUrl(question.getAnswerImageUrl())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
}
