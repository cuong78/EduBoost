import { useEffect, useState } from "react";
import {
  FileText,
  BookOpen,
  Layers,
  Save,
  Upload,
  Sparkles,
  FileUp,
  Copy,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
} from "lucide-react";
import { knowledgeService } from "../../services/knowledgeService";
import { questionBankService } from "../../services/questionBankService";
import { showErrorToast, showSuccessToast } from "../../utils/show-toast";
import RichTextEditor from "../../components/common/RichTextEditor";
import MathRenderer from "../../components/common/MathRenderer";

const GRADE_OPTIONS = [6, 7, 8, 9, 10, 11, 12];

// Tên môn (keyword match không phân biệt hoa thường) theo nhóm khối
const SUBJECT_KEYWORDS_BY_GRADE = {
  // Lớp 6-9: Toán và Khoa học tự nhiên
  middle: ["toán", "khoa học tự nhiên", "vật lý", "hóa học"],
  // Lớp 10-12: Toán, Vật lý, Hóa học
  high: ["toán", "vật lý", "hóa học"],
};

/** Lọc danh sách môn theo khối lớp */
const filterSubjectsByGrade = (subjects, grade) => {
  const keywords =
    grade >= 6 && grade <= 9
      ? SUBJECT_KEYWORDS_BY_GRADE.middle
      : SUBJECT_KEYWORDS_BY_GRADE.high;
  return subjects.filter((s) => {
    const name = (s.subjectName || s.name || "").toLowerCase();
    return keywords.some((kw) => name.includes(kw));
  });
};

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Trắc nghiệm" },
  { value: "TRUE_FALSE", label: "Đúng/Sai" },
  { value: "FILL_BLANK", label: "Điền khuyết" },
];

// Cognitive levels will be loaded from API

const CreateQuestion = () => {
  const [activeTab, setActiveTab] = useState("manual"); // manual, import, ai-resource, ai-variation

  // Common: Knowledge structure picker
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [gradeLevel, setGradeLevel] = useState(6);

  const [loadingChapters, setLoadingChapters] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState("");

  const [loadingLessons, setLoadingLessons] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [lessonId, setLessonId] = useState("");
  const [gradeConfirmed, setGradeConfirmed] = useState(false);
  const [subjectConfirmed, setSubjectConfirmed] = useState(false);
  const [chapterConfirmed, setChapterConfirmed] = useState(false);
  const [lessonConfirmed, setLessonConfirmed] = useState(false);

  // Tab 1: Manual
  const [questionText, setQuestionText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [wrongAnswer1, setWrongAnswer1] = useState("");
  const [wrongAnswer2, setWrongAnswer2] = useState("");
  const [wrongAnswer3, setWrongAnswer3] = useState("");
  const [explanation, setExplanation] = useState("");
  const [questionType, setQuestionType] = useState("MULTIPLE_CHOICE");
  const [cognitiveLevelId, setCognitiveLevelId] = useState(null);
  const [cognitiveLevels, setCognitiveLevels] = useState([]);
  const [loadingCognitiveLevels, setLoadingCognitiveLevels] = useState(false);

  // Duplicate check state
  const [duplicateCheckResult, setDuplicateCheckResult] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // Tab 2: Import from Word file (.docx)
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importedQuestions, setImportedQuestions] = useState([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [savingImported, setSavingImported] = useState(false);

  // Preview/Confirm state for manual tab
  const [showManualPreview, setShowManualPreview] = useState(false);
  const [savingManual, setSavingManual] = useState(false);

  // Tab 3: AI from resource
  const [loadingResources, setLoadingResources] = useState(false);
  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([]);
  const [showAiResourcePreview, setShowAiResourcePreview] = useState(false);
  const [savingAiResource, setSavingAiResource] = useState(false);
  const [editingAiQuestionIndex, setEditingAiQuestionIndex] = useState(null);

  // Tab 4: AI variation from existing questions
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [loadingExistingQuestions, setLoadingExistingQuestions] =
    useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [numberOfVariations, setNumberOfVariations] = useState(3);
  const [variationGenerating, setVariationGenerating] = useState(false);
  const [variationGroups, setVariationGroups] = useState([]);
  const [showVariationPreview, setShowVariationPreview] = useState(false);
  const [savingVariation, setSavingVariation] = useState(false);
  const [editingVariationIndex, setEditingVariationIndex] = useState(null);
  const [editingGroupIndex, setEditingGroupIndex] = useState(null);

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const data = await knowledgeService.getSubjects();
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setSubjects(list);
    } catch (e) {
      setSubjects([]);
      showErrorToast("Không tải được danh sách môn học");
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Tính toán danh sách môn đã lọc theo gradeLevel
  const filteredSubjects = filterSubjectsByGrade(subjects, gradeLevel);

  const loadChapters = async (sid, grade) => {
    if (!sid) return;
    setLoadingChapters(true);
    try {
      const data = await knowledgeService.getChaptersBySubject(sid, grade);
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setChapters(list);
      setChapterId("");
    } catch (e) {
      setChapters([]);
      setChapterId("");
    } finally {
      setLoadingChapters(false);
    }
  };

  const loadLessons = async (cid) => {
    if (!cid) return;
    setLoadingLessons(true);
    try {
      const data = await knowledgeService.getLessonsByChapter(cid);
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setLessons(list);
      setLessonId("");
    } catch (e) {
      setLessons([]);
      setLessonId("");
    } finally {
      setLoadingLessons(false);
    }
  };

  const loadResources = async (lid) => {
    if (!lid) return;
    setLoadingResources(true);
    try {
      const data = await knowledgeService.getResourcesByLesson(lid);
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setResources(list);
    } catch (e) {
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (subjectId) {
      loadChapters(subjectId, gradeLevel);
    } else {
      setChapters([]);
      setChapterId("");
    }
  }, [subjectId, gradeLevel]);

  useEffect(() => {
    if (chapterId) {
      loadLessons(chapterId);
    } else {
      setLessons([]);
      setLessonId("");
    }
  }, [chapterId]);

  const handleSelectGrade = (nextGrade) => {
    setGradeLevel(Number(nextGrade));
    setGradeConfirmed(true);
    setSubjectConfirmed(false);
    setChapterConfirmed(false);
    setLessonConfirmed(false);
    setSubjectId("");
    setChapterId("");
    setLessonId("");
  };

  const handleSelectSubject = (nextSubjectId) => {
    setSubjectId(String(nextSubjectId));
    setSubjectConfirmed(true);
    setChapterConfirmed(false);
    setLessonConfirmed(false);
    setChapterId("");
    setLessonId("");
  };

  const handleSelectChapter = (nextChapterId) => {
    setChapterId(String(nextChapterId));
    setChapterConfirmed(true);
    setLessonConfirmed(false);
    setLessonId("");
  };

  const handleSelectLesson = (nextLessonId) => {
    setLessonId(String(nextLessonId));
    setLessonConfirmed(true);
  };

  useEffect(() => {
    if (lessonId && activeTab === "ai-resource") {
      loadResources(lessonId);
    }
  }, [lessonId, activeTab]);

  useEffect(() => {
    loadCognitiveLevels();
  }, []);

  const loadCognitiveLevels = async () => {
    setLoadingCognitiveLevels(true);
    try {
      const data = await questionBankService.getCognitiveLevels();
      setCognitiveLevels(data);
      if (data.length > 0 && !cognitiveLevelId) {
        setCognitiveLevelId(data[0].id);
      }
    } catch (e) {
      showErrorToast("Không tải được danh sách mức độ nhận thức");
    } finally {
      setLoadingCognitiveLevels(false);
    }
  };

  // Tab 1: Manual - Xác nhận trước khi lưu
  const handleConfirmManual = () => {
    if (!lessonId) return showErrorToast("Vui lòng chọn bài học");
    if (!questionText.trim() || !correctAnswer.trim())
      return showErrorToast("Vui lòng nhập câu hỏi và đáp án đúng");
    if (!cognitiveLevelId)
      return showErrorToast("Vui lòng chọn mức độ nhận thức");

    // Hiển thị preview để xác nhận
    setShowManualPreview(true);
  };

  // Tab 1: Manual - Hủy xác nhận, quay lại chỉnh sửa
  const handleCancelManualPreview = () => {
    setShowManualPreview(false);
  };

  // Tab 1: Manual save - Lưu vào database sau khi đã xác nhận
  const handleSaveManual = async () => {
    if (!lessonId) return showErrorToast("Vui lòng chọn bài học");
    if (!questionText.trim() || !correctAnswer.trim())
      return showErrorToast("Vui lòng nhập câu hỏi và đáp án đúng");
    if (!cognitiveLevelId)
      return showErrorToast("Vui lòng chọn mức độ nhận thức");

    setSavingManual(true);
    try {
      // 1. Check duplicate first
      setCheckingDuplicate(true);
      let dupResult = null;
      try {
        dupResult = await questionBankService.checkDuplicate({
          questionText: questionText.trim(),
          lessonId: Number(lessonId),
          chapterId: chapterId ? Number(chapterId) : null,
        });
        setDuplicateCheckResult(dupResult);
      } catch (e) {
        // Don't block save if check fails
        console.warn("Duplicate check failed:", e);
      } finally {
        setCheckingDuplicate(false);
      }

      // 2. Save question
      const data = {
        lessonId: Number(lessonId),
        questionText: questionText.trim(),
        correctAnswer: correctAnswer.trim(),
        wrongAnswer1: questionType === "MULTIPLE_CHOICE" && wrongAnswer1.trim() ? wrongAnswer1.trim() : null,
        wrongAnswer2: questionType === "MULTIPLE_CHOICE" && wrongAnswer2.trim() ? wrongAnswer2.trim() : null,
        wrongAnswer3: questionType === "MULTIPLE_CHOICE" && wrongAnswer3.trim() ? wrongAnswer3.trim() : null,
        explanation: explanation.trim() || null,
        questionType: questionType,
        cognitiveLevelId: cognitiveLevelId,
        sourceType: "MANUAL",
      };
      await questionBankService.createQuestion(data);
      showSuccessToast("Đã lưu câu hỏi thành công");
      // Reset form
      setQuestionText("");
      setCorrectAnswer("");
      setWrongAnswer1("");
      setWrongAnswer2("");
      setWrongAnswer3("");
      setExplanation("");
      setDuplicateCheckResult(null);
      setShowManualPreview(false);
    } catch (e) {
      showErrorToast(
        "Lỗi lưu câu hỏi: " +
          (e?.response?.data?.message || e?.message || "Không xác định"),
      );
    } finally {
      setSavingManual(false);
    }
  };

  // Tab 2: Import from Word file (.docx) - Backend parse
  const handleImportFile = async () => {
    if (!lessonId) return showErrorToast("Vui lòng chọn bài học");
    if (!importFile) return showErrorToast("Vui lòng chọn file");
    setImporting(true);
    try {
      const response = await questionBankService.importFromWord(
        importFile,
        Number(lessonId),
        true, // useAiClassification
      );
      const questions = Array.isArray(response) ? response : (response.questions || response.importedQuestions || []);
      // Map to include cognitiveLevelId (default to first if available)
      const mappedQuestions = questions.map((q) => ({
        ...q,
        cognitiveLevelId:
          q.cognitiveLevelId ||
          (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null),
      }));
      setImportedQuestions(mappedQuestions);
      showSuccessToast(
        `Đã import và lưu ${mappedQuestions.length} câu hỏi vào ngân hàng câu hỏi`,
      );
    } catch (e) {
      showErrorToast(
        "Import thất bại: " +
          (e?.response?.data?.message || e?.message || "Lỗi không xác định"),
      );
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    questionBankService.downloadWordTemplate();
    showSuccessToast("Đã tải hướng dẫn template");
  };

  const handleEditImportedQuestion = (index) => {
    setEditingQuestionIndex(index);
  };

  const handleSaveImportedQuestion = async (index, updated) => {
    const question = importedQuestions[index];
    if (!question?.id) {
      showErrorToast("Không tìm thấy ID câu hỏi để cập nhật");
      return;
    }
    try {
      await questionBankService.updateQuestion(question.id, {
        ...question,
        ...updated,
      });
      const newList = [...importedQuestions];
      newList[index] = { ...newList[index], ...updated };
      setImportedQuestions(newList);
      setEditingQuestionIndex(null);
      showSuccessToast("Đã cập nhật câu hỏi thành công");
    } catch (e) {
      showErrorToast(
        "Cập nhật thất bại: " +
          (e?.response?.data?.message || e?.message || "Lỗi không xác định"),
      );
    }
  };

  const handleDeleteImportedQuestion = async (index) => {
    const question = importedQuestions[index];
    if (question?.id) {
      try {
        await questionBankService.deleteQuestion(question.id);
        showSuccessToast("Đã xóa câu hỏi khỏi ngân hàng");
      } catch (e) {
        showErrorToast(
          "Xóa thất bại: " +
            (e?.response?.data?.message || e?.message || "Lỗi không xác định"),
        );
        return;
      }
    }
    setImportedQuestions(importedQuestions.filter((_, i) => i !== index));
  };

  // Tab 3: AI from resource
  const [aiNumberOfQuestions, setAiNumberOfQuestions] = useState(5);

  const handleGenerateFromResource = async () => {
    if (!selectedResourceId) return showErrorToast("Vui lòng chọn tài nguyên");
    if (!lessonId) return showErrorToast("Vui lòng chọn bài học");

    setAiGenerating(true);
    try {
      const response = await questionBankService.generateFromResource({
        resourceId: Number(selectedResourceId),
        lessonId: Number(lessonId),
        numberOfQuestions: aiNumberOfQuestions,
        questionType: "MULTIPLE_CHOICE",
        aiProvider: "DEEPSEEK",
      });

      // Map AI response to local format
      const mappedQuestions = response.generatedQuestions.map((q) => {
        // Find cognitive level ID from name
        const cogLevel = cognitiveLevels.find((l) =>
          l.level.toLowerCase().includes(q.cognitiveLevel?.toLowerCase() || ""),
        );

        return {
          questionText: q.questionText || "",
          correctAnswer: q.correctAnswer || "",
          explanation: q.explanation || "",
          wrongAnswers: q.wrongAnswers || [],
          questionType: q.questionType || "MULTIPLE_CHOICE",
          cognitiveLevelId:
            cogLevel?.id ||
            (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null),
        };
      });

      setAiGeneratedQuestions(mappedQuestions);
      showSuccessToast(
        `Đã tạo ${mappedQuestions.length} câu hỏi từ AI (${response.tokensUsed} tokens, ${response.generationTimeMs}ms)`,
      );
    } catch (e) {
      console.error("AI generate error:", e);
      showErrorToast(
        "AI generate thất bại: " +
          (e?.response?.data?.message || e?.message || "Lỗi không xác định"),
      );
    } finally {
      setAiGenerating(false);
    }
  };

  const handleEditAiQuestion = (index) => {
    setEditingAiQuestionIndex(index);
  };

  const handleSaveAiQuestion = (index, updated) => {
    const newList = [...aiGeneratedQuestions];
    newList[index] = { ...newList[index], ...updated };
    setAiGeneratedQuestions(newList);
    setEditingAiQuestionIndex(null);
    showSuccessToast("Đã cập nhật câu hỏi");
  };

  const handleDeleteAiQuestion = (index) => {
    setAiGeneratedQuestions(aiGeneratedQuestions.filter((_, i) => i !== index));
    showSuccessToast("Đã xóa câu hỏi");
  };

  const handleShowAiResourcePreview = () => {
    if (!lessonId) return showErrorToast("Vui lòng chọn bài học");
    if (aiGeneratedQuestions.length === 0)
      return showErrorToast("Chưa có câu hỏi để xem trước");
    setShowAiResourcePreview(true);
  };

  const handleSaveAiResourceQuestions = async () => {
    if (!lessonId) return showErrorToast("Vui lòng chọn bài học");
    if (aiGeneratedQuestions.length === 0)
      return showErrorToast("Chưa có câu hỏi để lưu");
    setSavingAiResource(true);
    try {
      const questions = aiGeneratedQuestions.map((q) => ({
        lessonId: Number(lessonId),
        questionText: q.questionText || "",
        correctAnswer: q.correctAnswer || "",
        wrongAnswer1: q.wrongAnswers?.[0] || null,
        wrongAnswer2: q.wrongAnswers?.[1] || null,
        wrongAnswer3: q.wrongAnswers?.[2] || null,
        explanation: q.explanation || null,
        questionType: q.questionType || "MULTIPLE_CHOICE",
        cognitiveLevelId:
          q.cognitiveLevelId ||
          (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null),
        sourceType: "AI_GENERATED",
      }));
      await questionBankService.createQuestionsBatch(questions);
      showSuccessToast(
        "Đã lưu " + aiGeneratedQuestions.length + " câu hỏi vào ngân hàng",
      );
      setAiGeneratedQuestions([]);
      setShowAiResourcePreview(false);
    } catch (e) {
      showErrorToast(
        "Lưu thất bại: " +
          (e?.response?.data?.message || e?.message || "Lỗi không xác định"),
      );
    } finally {
      setSavingAiResource(false);
    }
  };

  // Tab 4: AI variation
  const handleGenerateVariation = async () => {
    if (selectedQuestionIds.length === 0) {
      return showErrorToast("Vui lòng chọn ít nhất 1 câu hỏi để tạo biến thể");
    }
    setVariationGenerating(true);
    try {
      const response = await questionBankService.generateVariations({
        baseQuestionIds: selectedQuestionIds,
        numberOfVariations: numberOfVariations,
        aiProvider: "DEEPSEEK",
      });

      // Map response to local format with cognitive level IDs
      const mappedGroups = response.variationGroups.map((group) => {
        const mappedVariations = group.variations.map((v) => {
          const cogLevel = cognitiveLevels.find((l) =>
            l.level
              .toLowerCase()
              .includes(v.cognitiveLevel?.toLowerCase() || ""),
          );
          return {
            questionText: v.questionText || "",
            correctAnswer: v.correctAnswer || "",
            explanation: v.explanation || "",
            wrongAnswers: v.wrongAnswers || [],
            questionType: v.questionType || "MULTIPLE_CHOICE",
            cognitiveLevelId:
              cogLevel?.id ||
              (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null),
          };
        });
        return {
          baseQuestionId: group.baseQuestionId,
          baseQuestionText: group.baseQuestionText,
          variations: mappedVariations,
        };
      });

      setVariationGroups(mappedGroups);
      const totalVariations = mappedGroups.reduce(
        (sum, g) => sum + g.variations.length,
        0,
      );
      showSuccessToast(
        `Đã tạo ${totalVariations} biến thể từ AI (${response.tokensUsed} tokens, ${response.generationTimeMs}ms)`,
      );
    } catch (e) {
      console.error("AI variation error:", e);
      showErrorToast(
        "AI generate thất bại: " +
          (e?.response?.data?.message || e?.message || "Lỗi không xác định"),
      );
    } finally {
      setVariationGenerating(false);
    }
  };

  const loadExistingQuestions = async () => {
    if (!lessonId) return;
    setLoadingExistingQuestions(true);
    try {
      const data = await questionBankService.getQuestions({
        lessonId: Number(lessonId),
        size: 200,
      });
      const list = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
      setExistingQuestions(list);
    } catch (e) {
      setExistingQuestions([]);
      showErrorToast("Không tải được danh sách câu hỏi");
    } finally {
      setLoadingExistingQuestions(false);
    }
  };

  useEffect(() => {
    if (activeTab === "ai-variation" && lessonId) {
      loadExistingQuestions();
    }
  }, [activeTab, lessonId]);

  const handleToggleQuestionSelection = (questionId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId],
    );
  };

  const handleSelectAllQuestions = () => {
    if (selectedQuestionIds.length === existingQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(existingQuestions.map((q) => q.id));
    }
  };

  const handleEditVariationInGroup = (groupIdx, varIdx) => {
    setEditingGroupIndex(groupIdx);
    setEditingVariationIndex(varIdx);
  };

  const handleSaveVariationInGroup = (groupIdx, varIdx, updated) => {
    const newGroups = [...variationGroups];
    newGroups[groupIdx].variations[varIdx] = {
      ...newGroups[groupIdx].variations[varIdx],
      ...updated,
    };
    setVariationGroups(newGroups);
    setEditingGroupIndex(null);
    setEditingVariationIndex(null);
    showSuccessToast("Đã cập nhật biến thể");
  };

  const handleDeleteVariationInGroup = (groupIdx, varIdx) => {
    const newGroups = [...variationGroups];
    newGroups[groupIdx].variations = newGroups[groupIdx].variations.filter(
      (_, i) => i !== varIdx,
    );
    // Remove group if no variations left
    if (newGroups[groupIdx].variations.length === 0) {
      newGroups.splice(groupIdx, 1);
    }
    setVariationGroups(newGroups);
    showSuccessToast("Đã xóa biến thể");
  };

  const handleShowVariationPreview = () => {
    if (!lessonId) return showErrorToast("Vui lòng chọn bài học");
    const totalVariations = variationGroups.reduce(
      (sum, g) => sum + g.variations.length,
      0,
    );
    if (totalVariations === 0)
      return showErrorToast("Chưa có biến thể để xem trước");
    setShowVariationPreview(true);
  };

  const handleSaveVariationQuestions = async () => {
    if (!lessonId) return showErrorToast("Vui lòng chọn bài học");
    const allVariations = variationGroups.flatMap((g) => g.variations);
    if (allVariations.length === 0)
      return showErrorToast("Chưa có biến thể để lưu");
    setSavingVariation(true);
    try {
      const questions = allVariations.map((q) => ({
        lessonId: Number(lessonId),
        questionText: q.questionText || "",
        correctAnswer: q.correctAnswer || "",
        wrongAnswer1: q.wrongAnswers?.[0] || null,
        wrongAnswer2: q.wrongAnswers?.[1] || null,
        wrongAnswer3: q.wrongAnswers?.[2] || null,
        explanation: q.explanation || null,
        questionType: q.questionType || "MULTIPLE_CHOICE",
        cognitiveLevelId:
          q.cognitiveLevelId ||
          (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null),
        sourceType: "AI_GENERATED",
      }));
      await questionBankService.createQuestionsBatch(questions);
      showSuccessToast(
        "Đã lưu " + allVariations.length + " biến thể vào ngân hàng",
      );
      setVariationGroups([]);
      setShowVariationPreview(false);
      setSelectedQuestionIds([]);
      loadExistingQuestions(); // Refresh the list
    } catch (e) {
      showErrorToast(
        "Lưu thất bại: " +
          (e?.response?.data?.message || e?.message || "Lỗi không xác định"),
      );
    } finally {
      setSavingVariation(false);
    }
  };

  return (
    <div className="create-question-page">
      <div className="page-header">
        <div>
          <h2>
            <FileText size={22} /> Tạo question
          </h2>
          <p>Chọn phương thức tạo câu hỏi phù hợp với nhu cầu của bạn.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs glass">
        <button
          className={`tab ${activeTab === "manual" ? "active" : ""}`}
          onClick={() => setActiveTab("manual")}
          data-tour="cq-tab-manual"
        >
          <FileText size={18} /> Nhập tay
        </button>
        <button
          className={`tab ${activeTab === "import" ? "active" : ""}`}
          onClick={() => setActiveTab("import")}
          data-tour="cq-tab-import"
        >
          <FileUp size={18} /> Import từ file
        </button>
        <button
          className={`tab ${activeTab === "ai-resource" ? "active" : ""}`}
          onClick={() => setActiveTab("ai-resource")}
          data-tour="cq-tab-ai-resource"
        >
          <Sparkles size={18} /> AI từ tài nguyên
        </button>
        <button
          className={`tab ${activeTab === "ai-variation" ? "active" : ""}`}
          onClick={() => setActiveTab("ai-variation")}
          data-tour="cq-tab-ai-variation"
        >
          <Copy size={18} /> AI biến thể
        </button>
      </div>

      {/* Common: Knowledge structure picker */}
      <div className="knowledge-picker glass" data-tour="cq-knowledge-picker">
        <h3>
          <BookOpen size={18} /> Chọn môn học, khối, chương, bài học
        </h3>
        <div className={`compact-selector-row ${lessonConfirmed ? "is-complete" : ""}`}>
          {!gradeConfirmed ? (
            <div className="compact-chip-block">
              <div className="selector-title">Khối</div>
              <div className="chip-list">
                {GRADE_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className="choice-chip"
                    onClick={() => handleSelectGrade(g)}
                  >
                    Khối {g}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="compact-selector-block">
                <div className="selector-title">Khối</div>
                <select
                  className="chip-dropdown"
                  value={gradeLevel}
                  onChange={(e) => handleSelectGrade(e.target.value)}
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>Khối {g}</option>
                  ))}
                </select>
              </div>

              {!subjectConfirmed ? (
                <div className="compact-chip-block">
                  <div className="selector-title">Môn học</div>
                  <div className="chip-list">
                    {filteredSubjects.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="choice-chip"
                        onClick={() => handleSelectSubject(s.id)}
                        disabled={loadingSubjects}
                      >
                        {s.subjectName || s.name || ""}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="compact-selector-block">
                    <div className="selector-title">Môn học</div>
                    <select
                      className="chip-dropdown"
                      value={subjectId}
                      onChange={(e) => handleSelectSubject(e.target.value)}
                      disabled={loadingSubjects}
                    >
                      {filteredSubjects.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.subjectName || s.name || ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!chapterConfirmed ? (
                    <div className="compact-chip-block">
                      <div className="selector-title">Chương</div>
                      <div className="chip-list">
                        {chapters.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="choice-chip"
                            onClick={() => handleSelectChapter(c.id)}
                            disabled={loadingChapters}
                          >
                            Chương {c.chapterNumber}: {c.chapterName}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="compact-selector-block">
                        <div className="selector-title">Chương</div>
                        <select
                          className="chip-dropdown"
                          value={chapterId}
                          onChange={(e) => handleSelectChapter(e.target.value)}
                          disabled={loadingChapters || !chapters.length}
                        >
                          {chapters.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                              Chương {c.chapterNumber}: {c.chapterName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {!lessonConfirmed ? (
                        <div className="compact-chip-block">
                          <div className="selector-title">Bài học</div>
                          <div className="chip-list">
                            {lessons.map((l) => (
                              <button
                                key={l.id}
                                type="button"
                                className="choice-chip"
                                onClick={() => handleSelectLesson(l.id)}
                                disabled={loadingLessons}
                              >
                                Bài {l.lessonNumber}: {l.lessonName}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="compact-selector-block">
                          <div className="selector-title">Bài học</div>
                          <select
                            className="chip-dropdown"
                            value={lessonId}
                            onChange={(e) => handleSelectLesson(e.target.value)}
                            disabled={loadingLessons || !lessons.length}
                          >
                            {lessons.map((l) => (
                              <option key={l.id} value={String(l.id)}>
                                Bài {l.lessonNumber}: {l.lessonName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
          {!filteredSubjects.length && gradeConfirmed && (
            <p className="muted" style={{ marginTop: "0.5rem" }}>
              Không có môn phù hợp cho khối này.
            </p>
          )}
        </div>
      </div>

      {/* Tab 1: Manual */}
      {activeTab === "manual" && (
        <div className="tab-content glass">
          {!showManualPreview ? (
            // Form nhập liệu
            <>
              <h3>
                <FileText size={18} /> Nhập câu hỏi bằng tay
              </h3>
              <div className="field">
                <label>Nội dung câu hỏi</label>
                <RichTextEditor
                  value={questionText}
                  onChange={setQuestionText}
                  placeholder="Nhập nội dung câu hỏi..."
                />
                <small className="muted">
                  Gợi ý: có thể dùng LaTeX dạng $...$ để render công thức toán,
                  hoặc click vào biểu tượng fx để chèn công thức.
                </small>
              </div>
              <div className="field">
                <label>Đáp án đúng</label>
                <RichTextEditor
                  value={correctAnswer}
                  onChange={setCorrectAnswer}
                  placeholder="Nhập đáp án đúng..."
                />
              </div>
              {/* Wrong answers: only for MULTIPLE_CHOICE */}
              {questionType === "MULTIPLE_CHOICE" && (
                <div className="field">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Đáp án sai
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 400,
                      color: '#6b7280', background: '#f3f4f6',
                      padding: '0.1rem 0.4rem', borderRadius: '4px',
                    }}>tùy chọn, nhưng nên điền đủ 3</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { val: wrongAnswer1, set: setWrongAnswer1 },
                      { val: wrongAnswer2, set: setWrongAnswer2 },
                      { val: wrongAnswer3, set: setWrongAnswer3 },
                    ].map(({ val, set }, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{
                          fontWeight: 700, color: '#9ca3af',
                          minWidth: '1.5rem', fontSize: '0.85rem',
                          paddingTop: '0.65rem',
                        }}>{String.fromCharCode(65 + idx)}.</span>
                        <div style={{ flex: 1 }}>
                          <RichTextEditor
                            value={val}
                            onChange={set}
                            placeholder={`Đáp án sai ${idx + 1}...`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="field">
                <label>Explanation (Giải thích)</label>
                <RichTextEditor
                  value={explanation}
                  onChange={setExplanation}
                  placeholder="Nhập giải thích cho câu hỏi (tùy chọn)..."
                />
              </div>
              <div className="row">
                <div className="field">
                  <label>Loại câu</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Mức độ nhận thức</label>
                  <select
                    value={cognitiveLevelId || ""}
                    onChange={(e) =>
                      setCognitiveLevelId(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    disabled={loadingCognitiveLevels}
                  >
                    <option value="">Chọn mức độ...</option>
                    {cognitiveLevels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="actions">
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmManual}
                  disabled={
                    !lessonId ||
                    !questionText.trim() ||
                    !correctAnswer.trim() ||
                    !cognitiveLevelId
                  }
                >
                  <Check size={16} /> Xác nhận
                </button>
              </div>
            </>
          ) : (
            // Preview trước khi lưu
            <>
              <h3>
                <Eye size={18} /> Xác nhận câu hỏi trước khi lưu
              </h3>
              <div className="preview-card">
                <div className="preview-section">
                  <label>Môn học - Bài học:</label>
                  <p>
                    {subjects.find((s) => String(s.id) === subjectId)
                      ?.description || "—"}{" "}
                    / Khối {gradeLevel} /
                    {chapters.find((c) => String(c.id) === chapterId)
                      ?.chapterName || "—"}{" "}
                    /
                    {lessons.find((l) => String(l.id) === lessonId)
                      ?.lessonName || "—"}
                  </p>
                </div>
                <div className="preview-section">
                  <label>Loại câu hỏi:</label>
                  <span className="question-type-badge">
                    {QUESTION_TYPES.find((t) => t.value === questionType)
                      ?.label || questionType}
                  </span>
                  <span
                    className="cognitive-badge"
                    style={{ marginLeft: "8px" }}
                  >
                    {cognitiveLevels.find((l) => l.id === cognitiveLevelId)
                      ?.level || "—"}
                  </span>
                </div>
                <div className="preview-section">
                  <label>Nội dung câu hỏi:</label>
                  <div className="preview-content">
                    <MathRenderer content={questionText} />
                  </div>
                </div>
                <div className="preview-section">
                  <label>Đáp án đúng:</label>
                  <div className="preview-content answer-highlight">
                    <MathRenderer content={correctAnswer} />
                  </div>
                </div>
                {explanation && (
                  <div className="preview-section">
                    <label>Giải thích:</label>
                    <div className="preview-content explanation-style">
                      <MathRenderer content={explanation} />
                    </div>
                  </div>
                )}
              </div>
              <div className="actions preview-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelManualPreview}
                >
                  <Edit2 size={16} /> Chỉnh sửa lại
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveManual}
                  disabled={savingManual}
                >
                  {savingManual ? (
                    "Đang lưu..."
                  ) : (
                    <>
                      <Save size={16} /> Lưu câu hỏi
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Import từ file Word (.docx) */}
      {activeTab === "import" && (
        <div className="tab-content glass">
          <h3>
            <FileUp size={18} /> Import từ file Word
          </h3>
          <div className="info-box">
            <p>
              <strong>Định dạng file Word (.docx):</strong>
            </p>
            <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '0.9rem' }}>
              <li>Mỗi câu bắt đầu bằng <code>Câu N:</code> (N là số thứ tự)</li>
              <li>Đáp án: <code>A.</code> <code>B.</code> <code>C.</code> <code>D.</code></li>
              <li>Đáp án đúng: <code>Đáp án: A</code> (hoặc B/C/D)</li>
              <li>Lời giải: <code>Lời giải: [nội dung]</code> (tùy chọn)</li>
              <li>Hỗ trợ hình ảnh và công thức toán (Equation Editor)</li>
            </ul>
            <button className="btn-link" onClick={handleDownloadTemplate}>
              <FileUp size={16} /> Tải hướng dẫn mẫu
            </button>
          </div>
          <div className="field">
            <label>Upload file Word (.docx)</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="import-file"
                accept=".docx"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="import-file" className="file-label">
                {importFile ? importFile.name : "Chọn file .docx"}
              </label>
            </div>
            {importFile && (
              <div className="file-info">
                <span>✓ Đã chọn: {importFile.name}</span>
                <span className="file-size">
                  ({(importFile.size / 1024).toFixed(2)} KB)
                </span>
                <button
                  type="button"
                  className="btn-remove-file"
                  onClick={() => {
                    setImportFile(null);
                    const fileInput = document.getElementById("import-file");
                    if (fileInput) fileInput.value = "";
                  }}
                  title="Xóa file"
                >
                  ×
                </button>
              </div>
            )}
            <small className="muted">
              Chỉ hỗ trợ file Word (.docx). Hình ảnh trong file sẽ được tự động upload.
            </small>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleImportFile}
            disabled={!lessonId || !importFile || importing}
          >
            {importing ? (
              "Đang import và phân tích..."
            ) : (
              <>
                <Upload size={16} /> Import từ Word
              </>
            )}
          </button>

           {importedQuestions.length > 0 && (
            <div className="imported-questions">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✅ Đã lưu {importedQuestions.length} câu hỏi vào ngân hàng
                <span style={{ fontSize: '0.8rem', color: 'var(--ds-muted)', fontWeight: 400 }}>
                  (Nhấn "Sửa" để chỉnh sửa từng câu)
                </span>
              </h4>
                  {importedQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className={`question-card ${editingQuestionIndex === idx ? "editing" : ""}`}
                    >
                      {editingQuestionIndex === idx ? (
                        <div className="edit-mode">
                          <div className="edit-header">
                            <h4>✏️ Đang chỉnh sửa câu hỏi số {idx + 1}</h4>
                          </div>
                          <div className="field">
                            <label>
                              Câu hỏi (hỗ trợ LaTeX: $...$ hoặc $$...$$)
                            </label>
                            <textarea
                              rows={6}
                              style={{
                                minHeight: "150px",
                                fontSize: "0.95rem",
                              }}
                              value={q.questionText || ""}
                              onChange={(e) => {
                                const updated = [...importedQuestions];
                                updated[idx].questionText = e.target.value;
                                setImportedQuestions(updated);
                              }}
                              placeholder="Nhập câu hỏi..."
                            />
                            {q.questionText && (
                              <div
                                style={{
                                  marginTop: "0.5rem",
                                  padding: "0.75rem",
                                  background: "rgba(96, 78, 255, 0.05)",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(96, 78, 255, 0.2)",
                                }}
                              >
                                <small
                                  style={{
                                    color: "var(--color-accent-1)",
                                    fontWeight: "600",
                                  }}
                                >
                                  Preview:
                                </small>
                                <div
                                  style={{
                                    marginTop: "0.25rem",
                                    whiteSpace: "pre-wrap",
                                    wordWrap: "break-word",
                                    overflowWrap: "break-word",
                                  }}
                                >
                                  <MathRenderer content={q.questionText} />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="field">
                            <label>Đáp án đúng (hỗ trợ LaTeX)</label>
                            <textarea
                              rows={5}
                              style={{
                                minHeight: "120px",
                                fontSize: "0.95rem",
                              }}
                              value={q.correctAnswer || ""}
                              onChange={(e) => {
                                const updated = [...importedQuestions];
                                updated[idx].correctAnswer = e.target.value;
                                setImportedQuestions(updated);
                              }}
                              placeholder="Nhập đáp án..."
                            />
                            {q.correctAnswer && (
                              <div
                                style={{
                                  marginTop: "0.5rem",
                                  padding: "0.75rem",
                                  background: "rgba(16, 185, 129, 0.05)",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(16, 185, 129, 0.2)",
                                }}
                              >
                                <small
                                  style={{
                                    color: "var(--ds-success)",
                                    fontWeight: "600",
                                  }}
                                >
                                  Preview:
                                </small>
                                <div
                                  style={{
                                    marginTop: "0.25rem",
                                    whiteSpace: "pre-wrap",
                                    wordWrap: "break-word",
                                    overflowWrap: "break-word",
                                  }}
                                >
                                  <MathRenderer content={q.correctAnswer} />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="field">
                            <label>
                              Explanation - Giải thích (hỗ trợ LaTeX)
                            </label>
                            <textarea
                              rows={5}
                              style={{
                                minHeight: "120px",
                                fontSize: "0.95rem",
                              }}
                              value={q.explanation || ""}
                              onChange={(e) => {
                                const updated = [...importedQuestions];
                                updated[idx].explanation = e.target.value;
                                setImportedQuestions(updated);
                              }}
                              placeholder="Giải thích cho câu hỏi..."
                            />
                            {q.explanation && (
                              <div
                                style={{
                                  marginTop: "0.5rem",
                                  padding: "0.75rem",
                                  background: "rgba(96, 78, 255, 0.05)",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(96, 78, 255, 0.2)",
                                }}
                              >
                                <small
                                  style={{
                                    color: "var(--color-accent-1)",
                                    fontWeight: "600",
                                  }}
                                >
                                  Preview:
                                </small>
                                <div
                                  style={{
                                    marginTop: "0.25rem",
                                    whiteSpace: "pre-wrap",
                                    wordWrap: "break-word",
                                    overflowWrap: "break-word",
                                  }}
                                >
                                  <MathRenderer content={q.explanation} />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="row">
                            <div className="field">
                              <label>Dạng câu hỏi</label>
                              <select
                                value={q.questionType || "MULTIPLE_CHOICE"}
                                onChange={(e) => {
                                  const updated = [...importedQuestions];
                                  updated[idx].questionType = e.target.value;
                                  setImportedQuestions(updated);
                                }}
                              >
                                {QUESTION_TYPES.map((t) => (
                                  <option key={t.value} value={t.value}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="field">
                              <label>Mức độ nhận thức</label>
                              <select
                                value={q.cognitiveLevelId || ""}
                                onChange={(e) => {
                                  const updated = [...importedQuestions];
                                  updated[idx].cognitiveLevelId = e.target.value
                                    ? Number(e.target.value)
                                    : null;
                                  setImportedQuestions(updated);
                                }}
                                disabled={loadingCognitiveLevels}
                              >
                                <option value="">Chọn mức độ...</option>
                                {cognitiveLevels.map((l) => (
                                  <option key={l.id} value={l.id}>
                                    {l.level}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="actions">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSaveImportedQuestion(idx, q)}
                            >
                              Lưu
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => setEditingQuestionIndex(null)}
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="question-header">
                            <span className="question-number">
                              Câu {idx + 1}
                            </span>
                            <span className="question-type-badge">
                              {QUESTION_TYPES.find(
                                (t) => t.value === q.questionType,
                              )?.label || q.questionType}
                            </span>
                            {q.cognitiveLevelId ? (
                              <span className="cognitive-badge">
                                {cognitiveLevels.find(
                                  (l) => l.id === q.cognitiveLevelId,
                                )?.level || ""}
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--ds-warning)",
                                  padding: "2px 8px",
                                  background: "rgba(245,158,11,0.1)",
                                  borderRadius: "4px",
                                  border: "1px solid rgba(245,158,11,0.3)",
                                }}
                              >
                                ⚠️ Chưa chọn mức độ
                              </span>
                            )}
                          </div>
                          <div className="question-text">
                            <MathRenderer content={q.questionText || "—"} />
                          </div>
                          <div className="answer-text">
                            <strong>Đáp án:</strong>{" "}
                            <MathRenderer content={q.correctAnswer || "—"} />
                          </div>
                          {q.explanation && (
                            <div className="explanation-text">
                              <strong>Giải thích:</strong>{" "}
                              <MathRenderer content={q.explanation} />
                            </div>
                          )}
                          <div className="question-actions">
                            <button
                              className="icon-btn"
                              onClick={() => handleEditImportedQuestion(idx)}
                              title="Sửa"
                            >
                              <Edit2 size={16} /> Sửa
                            </button>
                            <button
                              className="icon-btn danger"
                              onClick={() => handleDeleteImportedQuestion(idx)}
                              title="Xóa"
                            >
                              <Trash2 size={16} /> Xóa
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
        </div>
      )}

      {/* Tab 3: AI from resource */}
      {activeTab === "ai-resource" && (
        <div className="tab-content glass">
          <h3>
            <Sparkles size={18} /> AI tự sinh từ tài nguyên
          </h3>
          {loadingResources ? (
            <p className="muted">Đang tải tài nguyên...</p>
          ) : resources.length === 0 ? (
            <p className="muted">
              Chưa có tài nguyên trong bài học này. Vui lòng upload tài nguyên
              (DOCX) trước.
            </p>
          ) : (
            <>
              <div className="row">
                <div className="field">
                  <label>Chọn tài nguyên</label>
                  <select
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(e.target.value)}
                  >
                    <option value="">-- Chọn tài nguyên --</option>
                    {resources
                      .filter((r) => r.hasExtractedContent)
                      .map((r) => (
                        <option key={r.id} value={String(r.id)}>
                          {r.resourceName || "—"} ({r.resourceType})
                        </option>
                      ))}
                  </select>
                  <small className="muted">
                    Chỉ hiển thị tài nguyên đã được trích xuất nội dung
                    (DOCX)
                  </small>
                </div>
                <div className="field">
                  <label>Số câu hỏi muốn tạo</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={aiNumberOfQuestions}
                    onChange={(e) =>
                      setAiNumberOfQuestions(
                        Math.min(
                          20,
                          Math.max(1, parseInt(e.target.value) || 1),
                        ),
                      )
                    }
                  />
                  <small className="muted">Tối đa 20 câu/lần</small>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleGenerateFromResource}
                disabled={!selectedResourceId || !lessonId || aiGenerating}
              >
                {aiGenerating ? (
                  "AI đang xử lý (có thể mất 30-60 giây)..."
                ) : (
                  <>
                    <Sparkles size={16} /> AI tạo {aiNumberOfQuestions} câu hỏi
                    từ tài nguyên
                  </>
                )}
              </button>

              {aiGeneratedQuestions.length > 0 && (
                <>
                  {!showAiResourcePreview ? (
                    <div className="ai-questions">
                      <h4>Kết quả AI ({aiGeneratedQuestions.length} câu)</h4>
                      {aiGeneratedQuestions.map((q, idx) => (
                        <div key={idx} className="question-card">
                          {editingAiQuestionIndex === idx ? (
                            <div className="edit-mode">
                              <div className="field">
                                <label>Câu hỏi</label>
                                <RichTextEditor
                                  value={q.questionText || ""}
                                  onChange={(value) => {
                                    const updated = [...aiGeneratedQuestions];
                                    updated[idx].questionText = value;
                                    setAiGeneratedQuestions(updated);
                                  }}
                                />
                              </div>
                              <div className="field">
                                <label>Đáp án đúng</label>
                                <RichTextEditor
                                  value={q.correctAnswer || ""}
                                  onChange={(value) => {
                                    const updated = [...aiGeneratedQuestions];
                                    updated[idx].correctAnswer = value;
                                    setAiGeneratedQuestions(updated);
                                  }}
                                />
                              </div>
                              <div className="field">
                                <label>Giải thích</label>
                                <RichTextEditor
                                  value={q.explanation || ""}
                                  onChange={(value) => {
                                    const updated = [...aiGeneratedQuestions];
                                    updated[idx].explanation = value;
                                    setAiGeneratedQuestions(updated);
                                  }}
                                  placeholder="Giải thích cho câu hỏi..."
                                />
                              </div>
                              <div className="row">
                                <div className="field">
                                  <label>Dạng câu hỏi</label>
                                  <select
                                    value={q.questionType || "MULTIPLE_CHOICE"}
                                    onChange={(e) => {
                                      const updated = [...aiGeneratedQuestions];
                                      updated[idx].questionType =
                                        e.target.value;
                                      setAiGeneratedQuestions(updated);
                                    }}
                                  >
                                    {QUESTION_TYPES.map((t) => (
                                      <option key={t.value} value={t.value}>
                                        {t.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="field">
                                  <label>Mức độ nhận thức</label>
                                  <select
                                    value={q.cognitiveLevelId || ""}
                                    onChange={(e) => {
                                      const updated = [...aiGeneratedQuestions];
                                      updated[idx].cognitiveLevelId = e.target
                                        .value
                                        ? Number(e.target.value)
                                        : null;
                                      setAiGeneratedQuestions(updated);
                                    }}
                                    disabled={loadingCognitiveLevels}
                                  >
                                    <option value="">Chọn mức độ...</option>
                                    {cognitiveLevels.map((l) => (
                                      <option key={l.id} value={l.id}>
                                        {l.level}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="actions">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleSaveAiQuestion(idx, q)}
                                >
                                  Lưu
                                </button>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() =>
                                    setEditingAiQuestionIndex(null)
                                  }
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="question-header">
                                <span className="question-number">
                                  Câu {idx + 1}
                                </span>
                                <span className="question-type-badge">
                                  {QUESTION_TYPES.find(
                                    (t) => t.value === q.questionType,
                                  )?.label || q.questionType}
                                </span>
                              </div>
                              <div className="question-text">
                                <MathRenderer content={q.questionText || "—"} />
                              </div>
                              <div className="answer-text">
                                <strong>Đáp án:</strong>{" "}
                                <MathRenderer
                                  content={q.correctAnswer || "—"}
                                />
                              </div>
                              {q.explanation && (
                                <div className="explanation-text">
                                  <strong>Giải thích:</strong>{" "}
                                  <MathRenderer content={q.explanation} />
                                </div>
                              )}
                              <div className="question-actions">
                                <button
                                  className="icon-btn"
                                  onClick={() => handleEditAiQuestion(idx)}
                                  title="Sửa"
                                >
                                  <Edit2 size={16} /> Sửa
                                </button>
                                <button
                                  className="icon-btn danger"
                                  onClick={() => handleDeleteAiQuestion(idx)}
                                  title="Xóa"
                                >
                                  <Trash2 size={16} /> Xóa
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      <div className="actions">
                        <button
                          className="btn btn-primary"
                          onClick={handleShowAiResourcePreview}
                          disabled={
                            !lessonId || aiGeneratedQuestions.length === 0
                          }
                        >
                          <Eye size={16} /> Xác nhận
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="preview-container">
                      <h4>
                        <Eye size={18} /> Xem trước trước khi lưu (
                        {aiGeneratedQuestions.length} câu hỏi)
                      </h4>
                      <p className="muted" style={{ marginBottom: "1rem" }}>
                        Kiểm tra lại các câu hỏi từ AI trước khi lưu vào ngân
                        hàng câu hỏi.
                      </p>
                      <div className="preview-questions-list">
                        {aiGeneratedQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            className="preview-card"
                            style={{ marginBottom: "1rem" }}
                          >
                            <div className="question-header">
                              <span className="question-number">
                                Câu {idx + 1}
                              </span>
                              <span className="question-type-badge">
                                {QUESTION_TYPES.find(
                                  (t) => t.value === q.questionType,
                                )?.label || q.questionType}
                              </span>
                              {q.cognitiveLevelId && (
                                <span className="cognitive-badge">
                                  {cognitiveLevels.find(
                                    (l) => l.id === q.cognitiveLevelId,
                                  )?.level || ""}
                                </span>
                              )}
                            </div>
                            <div className="preview-section">
                              <label>Câu hỏi</label>
                              <div className="preview-content">
                                <MathRenderer content={q.questionText || "—"} />
                              </div>
                            </div>
                            <div className="preview-section">
                              <label>Đáp án đúng</label>
                              <div className="preview-content answer-highlight">
                                <MathRenderer
                                  content={q.correctAnswer || "—"}
                                />
                              </div>
                            </div>
                            {q.explanation && (
                              <div className="preview-section">
                                <label>Giải thích</label>
                                <div className="preview-content explanation-style">
                                  <MathRenderer content={q.explanation} />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="actions preview-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowAiResourcePreview(false)}
                        >
                          <Edit2 size={16} /> Quay lại chỉnh sửa
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handleSaveAiResourceQuestions}
                          disabled={savingAiResource}
                        >
                          {savingAiResource ? (
                            "Đang lưu..."
                          ) : (
                            <>
                              <Save size={16} /> Lưu tất cả (
                              {aiGeneratedQuestions.length} câu)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 4: AI variation */}
      {activeTab === "ai-variation" && (
        <div className="tab-content glass">
          <h3>
            <Copy size={18} /> AI sinh biến thể từ câu hỏi có sẵn
          </h3>

          {!lessonId ? (
            <p className="muted">
              Vui lòng chọn bài học trước để xem các câu hỏi có sẵn.
            </p>
          ) : loadingExistingQuestions ? (
            <p className="muted">Đang tải câu hỏi...</p>
          ) : existingQuestions.length === 0 ? (
            <p className="muted">
              Chưa có câu hỏi nào trong bài học này. Hãy tạo câu hỏi trước.
            </p>
          ) : (
            <>
              <div className="existing-questions-selector">
                <div className="selection-header">
                  <label>
                    Chọn câu hỏi gốc để tạo biến thể (
                    {selectedQuestionIds.length}/{existingQuestions.length} đã
                    chọn)
                  </label>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={handleSelectAllQuestions}
                  >
                    {selectedQuestionIds.length === existingQuestions.length
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </button>
                </div>
                <div className="questions-checkbox-list">
                  {existingQuestions.map((q, index) => (
                    <div
                      key={q.id}
                      className={`question-checkbox-item ${selectedQuestionIds.includes(q.id) ? "selected" : ""}`}
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedQuestionIds.includes(q.id)}
                          onChange={() => handleToggleQuestionSelection(q.id)}
                        />
                        <div className="question-preview-content">
                          <div className="question-preview-header">
                            <span className="question-number-badge">
                              Câu {index + 1}
                            </span>
                            <span className="question-id-badge">
                              ID: {q.id}
                            </span>
                            {q.questionType && (
                              <span className="type-badge">
                                {QUESTION_TYPES.find(
                                  (t) => t.value === q.questionType,
                                )?.label || q.questionType}
                              </span>
                            )}
                            {q.sourceType && (
                              <span
                                className={`source-badge ${q.sourceType.toLowerCase()}`}
                              >
                                {q.sourceType === "MANUAL"
                                  ? "✍️ Nhập tay"
                                  : q.sourceType === "IMPORTED"
                                    ? "📁 Import"
                                    : q.sourceType === "AI_GENERATED"
                                      ? "🤖 AI"
                                      : q.sourceType}
                              </span>
                            )}
                          </div>
                          <div className="question-preview-text">
                            <MathRenderer
                              content={
                                (q.questionText || "").substring(0, 150) +
                                (q.questionText?.length > 150 ? "..." : "")
                              }
                            />
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="row" style={{ marginTop: "1rem" }}>
                <div className="field">
                  <label>Số biến thể mỗi câu</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={numberOfVariations}
                    onChange={(e) =>
                      setNumberOfVariations(
                        Math.min(
                          10,
                          Math.max(1, parseInt(e.target.value) || 1),
                        ),
                      )
                    }
                  />
                  <small className="muted">Tối đa 10 biến thể/câu</small>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleGenerateVariation}
                disabled={
                  selectedQuestionIds.length === 0 || variationGenerating
                }
              >
                {variationGenerating ? (
                  "AI đang tạo biến thể (có thể mất 30-60 giây)..."
                ) : (
                  <>
                    <Sparkles size={16} /> Tạo {numberOfVariations} biến thể cho{" "}
                    {selectedQuestionIds.length} câu hỏi
                  </>
                )}
              </button>

              {variationGroups.length > 0 && (
                <>
                  {!showVariationPreview ? (
                    <div className="variation-groups">
                      <h4>
                        Kết quả AI (
                        {variationGroups.reduce(
                          (sum, g) => sum + g.variations.length,
                          0,
                        )}{" "}
                        biến thể)
                      </h4>
                      {variationGroups.map((group, gIdx) => (
                        <div key={gIdx} className="variation-group">
                          <div className="group-header">
                            <strong>Câu gốc #{group.baseQuestionId}:</strong>{" "}
                            <MathRenderer
                              content={
                                group.baseQuestionText.substring(0, 120) +
                                (group.baseQuestionText.length > 120
                                  ? "..."
                                  : "")
                              }
                            />
                          </div>
                          <div className="group-variations">
                            {group.variations.map((v, vIdx) => (
                              <div key={vIdx} className="question-card">
                                {editingGroupIndex === gIdx &&
                                editingVariationIndex === vIdx ? (
                                  <div className="edit-mode">
                                    <div className="field">
                                      <label>
                                        Câu hỏi biến thể (hỗ trợ LaTeX)
                                      </label>
                                      <textarea
                                        rows={6}
                                        style={{
                                          minHeight: "150px",
                                          fontSize: "0.95rem",
                                        }}
                                        value={v.questionText || ""}
                                        onChange={(e) => {
                                          const newGroups = [
                                            ...variationGroups,
                                          ];
                                          newGroups[gIdx].variations[
                                            vIdx
                                          ].questionText = e.target.value;
                                          setVariationGroups(newGroups);
                                        }}
                                      />
                                      {v.questionText && (
                                        <div
                                          style={{
                                            marginTop: "0.5rem",
                                            padding: "0.75rem",
                                            background:
                                              "rgba(96, 78, 255, 0.05)",
                                            borderRadius: "8px",
                                            border:
                                              "1px solid rgba(96, 78, 255, 0.2)",
                                          }}
                                        >
                                          <small
                                            style={{
                                              color: "var(--color-accent-1)",
                                              fontWeight: "600",
                                            }}
                                          >
                                            Preview:
                                          </small>
                                          <div
                                            style={{
                                              marginTop: "0.25rem",
                                              whiteSpace: "pre-wrap",
                                              wordWrap: "break-word",
                                              overflowWrap: "break-word",
                                            }}
                                          >
                                            <MathRenderer
                                              content={v.questionText}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="field">
                                      <label>Đáp án đúng (hỗ trợ LaTeX)</label>
                                      <textarea
                                        rows={5}
                                        style={{
                                          minHeight: "120px",
                                          fontSize: "0.95rem",
                                        }}
                                        value={v.correctAnswer || ""}
                                        onChange={(e) => {
                                          const newGroups = [
                                            ...variationGroups,
                                          ];
                                          newGroups[gIdx].variations[
                                            vIdx
                                          ].correctAnswer = e.target.value;
                                          setVariationGroups(newGroups);
                                        }}
                                      />
                                      {v.correctAnswer && (
                                        <div
                                          style={{
                                            marginTop: "0.5rem",
                                            padding: "0.75rem",
                                            background:
                                              "rgba(16, 185, 129, 0.05)",
                                            borderRadius: "8px",
                                            border:
                                              "1px solid rgba(16, 185, 129, 0.2)",
                                          }}
                                        >
                                          <small
                                            style={{
                                              color: "var(--ds-success)",
                                              fontWeight: "600",
                                            }}
                                          >
                                            Preview:
                                          </small>
                                          <div
                                            style={{
                                              marginTop: "0.25rem",
                                              whiteSpace: "pre-wrap",
                                              wordWrap: "break-word",
                                              overflowWrap: "break-word",
                                            }}
                                          >
                                            <MathRenderer
                                              content={v.correctAnswer}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="field">
                                      <label>Giải thích (hỗ trợ LaTeX)</label>
                                      <textarea
                                        rows={5}
                                        style={{
                                          minHeight: "120px",
                                          fontSize: "0.95rem",
                                        }}
                                        value={v.explanation || ""}
                                        onChange={(e) => {
                                          const newGroups = [
                                            ...variationGroups,
                                          ];
                                          newGroups[gIdx].variations[
                                            vIdx
                                          ].explanation = e.target.value;
                                          setVariationGroups(newGroups);
                                        }}
                                      />
                                      {v.explanation && (
                                        <div
                                          style={{
                                            marginTop: "0.5rem",
                                            padding: "0.75rem",
                                            background:
                                              "rgba(96, 78, 255, 0.05)",
                                            borderRadius: "8px",
                                            border:
                                              "1px solid rgba(96, 78, 255, 0.2)",
                                          }}
                                        >
                                          <small
                                            style={{
                                              color: "var(--color-accent-1)",
                                              fontWeight: "600",
                                            }}
                                          >
                                            Preview:
                                          </small>
                                          <div
                                            style={{
                                              marginTop: "0.25rem",
                                              whiteSpace: "pre-wrap",
                                              wordWrap: "break-word",
                                              overflowWrap: "break-word",
                                            }}
                                          >
                                            <MathRenderer
                                              content={v.explanation}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="row">
                                      <div className="field">
                                        <label>Mức độ nhận thức</label>
                                        <select
                                          value={v.cognitiveLevelId || ""}
                                          onChange={(e) => {
                                            const newGroups = [
                                              ...variationGroups,
                                            ];
                                            newGroups[gIdx].variations[
                                              vIdx
                                            ].cognitiveLevelId = e.target.value
                                              ? Number(e.target.value)
                                              : null;
                                            setVariationGroups(newGroups);
                                          }}
                                        >
                                          <option value="">
                                            Chọn mức độ...
                                          </option>
                                          {cognitiveLevels.map((l) => (
                                            <option key={l.id} value={l.id}>
                                              {l.level}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                    <div className="actions">
                                      <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() =>
                                          handleSaveVariationInGroup(
                                            gIdx,
                                            vIdx,
                                            v,
                                          )
                                        }
                                      >
                                        Lưu
                                      </button>
                                      <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => {
                                          setEditingGroupIndex(null);
                                          setEditingVariationIndex(null);
                                        }}
                                      >
                                        Hủy
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="question-header">
                                      <span className="question-number">
                                        Biến thể {vIdx + 1}
                                      </span>
                                    </div>
                                    <div className="question-text">
                                      <MathRenderer
                                        content={v.questionText || "—"}
                                      />
                                    </div>
                                    <div className="answer-text">
                                      <strong>Đáp án:</strong>{" "}
                                      <MathRenderer
                                        content={v.correctAnswer || "—"}
                                      />
                                    </div>
                                    {v.explanation && (
                                      <div className="explanation-text">
                                        <strong>Giải thích:</strong>{" "}
                                        <MathRenderer content={v.explanation} />
                                      </div>
                                    )}
                                    <div className="question-actions">
                                      <button
                                        className="icon-btn"
                                        onClick={() =>
                                          handleEditVariationInGroup(gIdx, vIdx)
                                        }
                                        title="Sửa"
                                      >
                                        <Edit2 size={16} /> Sửa
                                      </button>
                                      <button
                                        className="icon-btn danger"
                                        onClick={() =>
                                          handleDeleteVariationInGroup(
                                            gIdx,
                                            vIdx,
                                          )
                                        }
                                        title="Xóa"
                                      >
                                        <Trash2 size={16} /> Xóa
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="actions">
                        <button
                          className="btn btn-primary"
                          onClick={handleShowVariationPreview}
                          disabled={!lessonId}
                        >
                          <Eye size={16} /> Xác nhận
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="preview-container">
                      <h4>
                        <Eye size={18} /> Xem trước (
                        {variationGroups.reduce(
                          (sum, g) => sum + g.variations.length,
                          0,
                        )}{" "}
                        biến thể)
                      </h4>
                      <p className="muted" style={{ marginBottom: "1rem" }}>
                        Kiểm tra lại các biến thể từ AI trước khi lưu vào ngân
                        hàng câu hỏi.
                      </p>
                      <div className="preview-questions-list">
                        {variationGroups.flatMap((g, gIdx) =>
                          g.variations.map((v, vIdx) => (
                            <div
                              key={`${gIdx}-${vIdx}`}
                              className="preview-card"
                              style={{ marginBottom: "1rem" }}
                            >
                              <div className="question-header">
                                <span className="question-number">
                                  Biến thể từ #{g.baseQuestionId}
                                </span>
                                {v.cognitiveLevelId && (
                                  <span className="cognitive-badge">
                                    {cognitiveLevels.find(
                                      (l) => l.id === v.cognitiveLevelId,
                                    )?.level || ""}
                                  </span>
                                )}
                              </div>
                              <div className="preview-section">
                                <label>Câu hỏi</label>
                                <div className="preview-content">
                                  <MathRenderer
                                    content={v.questionText || "—"}
                                  />
                                </div>
                              </div>
                              <div className="preview-section">
                                <label>Đáp án đúng</label>
                                <div className="preview-content answer-highlight">
                                  <MathRenderer
                                    content={v.correctAnswer || "—"}
                                  />
                                </div>
                              </div>
                            </div>
                          )),
                        )}
                      </div>
                      <div className="actions preview-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowVariationPreview(false)}
                        >
                          <Edit2 size={16} /> Quay lại chỉnh sửa
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handleSaveVariationQuestions}
                          disabled={savingVariation}
                        >
                          {savingVariation ? (
                            "Đang lưu..."
                          ) : (
                            <>
                              <Save size={16} /> Lưu tất cả (
                              {variationGroups.reduce(
                                (sum, g) => sum + g.variations.length,
                                0,
                              )}{" "}
                              biến thể)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
                .create-question-page { max-width: 1000px; margin: 0 auto; }
                .page-header { margin-bottom: 1.5rem; }
                .page-header h2 { display: flex; gap: 10px; align-items: center; margin: 0 0 6px; font-size: 1.75rem; }
                .page-header p { margin: 0; color: var(--color-text-secondary); }

                .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; padding: 0.5rem; border-radius: 12px; }
                .tab {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: none;
                    background: transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    transition: all 0.2s;
                }
                .tab:hover { background: rgba(96, 78, 255, 0.05); }
                .tab.active {
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                    font-weight: 600;
                }

                .knowledge-picker { padding: 1.5rem; border-radius: 16px; margin-bottom: 1.5rem; }
                .knowledge-picker h3 { margin: 0 0 1rem; display: flex; align-items: center; gap: 8px; }
                .compact-selector-row {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 0.75rem;
                  margin-bottom: 0.85rem;
                }
                .compact-selector-row.is-complete {
                  display: grid;
                  grid-template-columns: repeat(4, minmax(0, 1fr));
                  align-items: end;
                }
                .compact-selector-block {
                  flex: 0 0 auto;
                  min-width: 0;
                }
                .compact-selector-row.is-complete .compact-selector-block {
                  width: 100%;
                }
                .compact-selector-block,
                .compact-chip-block {
                  display: flex;
                  flex-direction: column;
                  gap: 0.35rem;
                }
                .compact-chip-block {
                  flex: 4 1 520px;
                  min-width: 260px;
                }
                .selector-title {
                  font-weight: 700;
                  margin-bottom: 0.5rem;
                  font-size: 0.98rem;
                  color: #1f2937;
                }
                .chip-dropdown {
                  width: auto;
                  min-width: 128px;
                  max-width: 220px;
                  height: 40px;
                  border-radius: 10px;
                  border: 1px solid #d5def0;
                  background: #fff;
                  color: #1f2937;
                  font-weight: 600;
                  padding: 0 2rem 0 0.75rem;
                  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
                }
                .chip-dropdown:hover {
                  border-color: #b8c5ec;
                  background: #ffffff;
                }
                .chip-dropdown:focus {
                  outline: none;
                  border-color: rgba(99, 102, 241, 0.55);
                  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
                }
                .chip-dropdown option {
                  background: #ffffff;
                  color: #1f2937;
                }
                .compact-selector-row.is-complete .chip-dropdown {
                  width: 100%;
                  max-width: 100%;
                }
                .chip-list {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 0.5rem;
                }
                .choice-chip {
                  border: 1px solid #b8c7d9;
                  background: #f8fbff;
                  color: #0f2f57;
                  border-radius: 10px;
                  height: 44px;
                  padding: 0 0.9rem;
                  font-size: 0.98rem;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.18s ease;
                }
                .choice-chip:hover {
                  border-color: rgba(99,102,241,0.35);
                  background: rgba(99,102,241,0.08);
                  color: #4338ca;
                }
                .choice-chip:disabled,
                .chip-dropdown:disabled {
                  opacity: 0.7;
                  cursor: not-allowed;
                }

                @media (max-width: 768px) {
                  .compact-selector-block {
                    flex: 1 1 100%;
                  }
                  .compact-selector-row.is-complete {
                    grid-template-columns: 1fr;
                  }
                  .chip-dropdown {
                    width: 100%;
                    max-width: 100%;
                  }
                  .compact-chip-block {
                    flex: 1 1 100%;
                  }
                  .chip-list {
                    min-width: 100%;
                  }
                  .choice-chip {
                    height: 40px;
                    font-size: 0.9rem;
                  }
                }

                .tab-content { padding: 1.5rem; border-radius: 16px; }
                .tab-content h3 { margin: 0 0 1rem; display: flex; align-items: center; gap: 8px; }

                .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                @media (max-width: 768px) { .row { grid-template-columns: 1fr; } }

                .field { margin-bottom: 1rem; }
                label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.9rem; }
                input, select, textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: 1px solid rgba(0,0,0,0.1);
                    background: rgba(255,255,255,0.8);
                    font-family: inherit;
                }
                textarea { resize: vertical; }
                .muted { color: var(--color-text-secondary); font-size: 0.85rem; }

                .file-input-wrapper { position: relative; }
                .file-input-wrapper input[type="file"] { position: absolute; opacity: 0; width: 0; height: 0; }
                .file-label {
                    display: inline-block;
                    padding: 0.75rem 1.5rem;
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .file-info {
                    margin-top: 0.75rem;
                    padding: 0.75rem;
                    background: rgba(16, 185, 129, 0.05);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.5rem;
                }
                .file-info span:first-child {
                    color: var(--ds-success);
                    font-weight: 500;
                }
                .file-size {
                    color: var(--color-text-secondary);
                    font-size: 0.85rem;
                }
                .btn-remove-file {
                    background: rgba(255, 71, 87, 0.1);
                    color: #ff4757;
                    border: none;
                    border-radius: 6px;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 1.5rem;
                    font-weight: bold;
                    line-height: 1;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .btn-remove-file:hover {
                    background: rgba(255, 71, 87, 0.2);
                    transform: scale(1.1);
                }

                .info-box {
                    padding: 1rem;
                    background: rgba(96, 78, 255, 0.05);
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .info-box p { margin: 0; font-size: 0.9rem; }
                .btn-link {
                    background: none;
                    border: none;
                    color: var(--color-accent-1);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 500;
                    padding: 0.5rem;
                }
                .btn-link:hover { text-decoration: underline; }

                .imported-questions, .ai-questions, .variation-questions { margin-top: 2rem; }
                .imported-questions h4, .ai-questions h4, .variation-questions h4 { margin-bottom: 1rem; }

                .question-card {
                    padding: 1.25rem;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.5);
                    border: 1px solid rgba(0,0,0,0.06);
                    margin-bottom: 1rem;
                    transition: all 0.3s ease;
                }
                .question-card.editing {
                    background: linear-gradient(135deg, rgba(96, 78, 255, 0.08) 0%, rgba(134, 121, 255, 0.05) 100%);
                    border: 2px solid var(--color-accent-1);
                    box-shadow: 0 8px 24px rgba(96, 78, 255, 0.2), 0 0 0 4px rgba(96, 78, 255, 0.1);
                    transform: scale(1.01);
                }
                .question-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }
                .question-number {
                    font-weight: 700;
                    color: var(--color-accent-1);
                }
                .question-type-badge {
                    padding: 4px 10px;
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .question-text {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    line-height: 1.5;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    word-break: break-word;
                }
                .answer-text {
                    color: var(--color-text-primary);
                    font-size: 0.95rem;
                    margin-bottom: 0.5rem;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    word-break: break-word;
                }
                .explanation-text {
                    color: var(--color-text-secondary);
                    font-size: 0.9rem;
                    font-style: italic;
                    margin-bottom: 0.5rem;
                    padding-left: 1rem;
                    border-left: 2px solid rgba(96, 78, 255, 0.2);
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    word-break: break-word;
                }
                .question-actions {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.75rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid rgba(0,0,0,0.05);
                }
                .icon-btn {
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 6px;
                    display: inline-flex;
                    align-items: center;
                }
                .icon-btn:hover { background: rgba(0,0,0,0.05); }
                .icon-btn.danger:hover { background: rgba(255,71,87,0.1); color: #ff4757; }

                .edit-mode { margin-top: 0.5rem; }
                .edit-mode .field { margin-bottom: 0.75rem; }
                .edit-header {
                    background: linear-gradient(135deg, var(--color-accent-1), rgba(134, 121, 255, 1));
                    color: white;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    margin: -1.25rem -1.25rem 1rem -1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .edit-header h4 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .actions { display: flex; justify-content: flex-end; margin-top: 1rem; gap: 0.75rem; }
                .preview-actions { justify-content: space-between; }
                .btn-sm { padding: 0.5rem 1rem; font-size: 0.875rem; }
                .btn-secondary { background: rgba(0,0,0,0.05); color: var(--color-text-primary); }
                .btn-secondary:hover { background: rgba(0,0,0,0.1); }

                /* Preview styles */
                .preview-container {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 2px solid rgba(96, 78, 255, 0.1);
                }
                .preview-container h4 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 0.5rem;
                    color: var(--color-accent-1);
                }
                .preview-questions-list {
                    max-height: 60vh;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                }
                .preview-card {
                    background: rgba(255,255,255,0.7);
                    border-radius: 16px;
                    padding: 1.5rem;
                    border: 2px solid rgba(96, 78, 255, 0.2);
                }
                .preview-section {
                    margin-bottom: 1.25rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                .preview-section:last-child {
                    margin-bottom: 0;
                    padding-bottom: 0;
                    border-bottom: none;
                }
                .preview-section label {
                    display: block;
                    font-weight: 600;
                    color: var(--color-text-secondary);
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .preview-section p {
                    margin: 0;
                    font-size: 0.95rem;
                }
                .preview-content {
                    background: rgba(255,255,255,0.8);
                    padding: 1rem;
                    border-radius: 8px;
                    border: 1px solid rgba(0,0,0,0.05);
                    font-size: 1rem;
                    line-height: 1.6;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    word-break: break-word;
                }
                .answer-highlight {
                    background: rgba(16, 185, 129, 0.1);
                    border-color: rgba(16, 185, 129, 0.3);
                }
                .explanation-style {
                    background: rgba(96, 78, 255, 0.05);
                    border-left: 3px solid var(--color-accent-1);
                    font-style: italic;
                }
                .cognitive-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--ds-success);
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                /* Tab 4: Existing questions selector */
                .existing-questions-selector {
                    background: rgba(255,255,255,0.5);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 1rem;
                }
                .selection-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }
                .selection-header label {
                    font-weight: 600;
                    color: var(--color-text-secondary);
                }
                .questions-checkbox-list {
                    max-height: 300px;
                    overflow-y: auto;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 8px;
                    background: white;
                }
                .question-checkbox-item {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    transition: background 0.2s;
                }
                .question-checkbox-item:last-child {
                    border-bottom: none;
                }
                .question-checkbox-item:hover {
                    background: rgba(96, 78, 255, 0.05);
                }
                .question-checkbox-item.selected {
                    background: rgba(96, 78, 255, 0.1);
                }
                .question-checkbox-item label {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    cursor: pointer;
                    width: 100%;
                }
                .question-checkbox-item input[type="checkbox"] {
                    margin-top: 3px;
                    width: 18px;
                    height: 18px;
                    flex-shrink: 0;
                }
                .question-preview-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .question-preview-header {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 0.5rem;
                }
                .question-number-badge {
                    display: inline-block;
                    padding: 3px 10px;
                    background: linear-gradient(135deg, var(--color-accent-1), rgba(134, 121, 255, 1));
                    color: white;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 700;
                }
                .question-id-badge {
                    padding: 3px 8px;
                    background: rgba(0, 0, 0, 0.05);
                    color: var(--color-text-secondary);
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .type-badge {
                    padding: 3px 8px;
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .source-badge {
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .source-badge.manual {
                    background: rgba(59, 130, 246, 0.1);
                    color: var(--ds-info);
                }
                .source-badge.imported {
                    background: rgba(245, 158, 11, 0.1);
                    color: var(--ds-warning);
                }
                .source-badge.ai_generated {
                    background: rgba(168, 85, 247, 0.1);
                    color: #a855f7;
                }
                .question-preview-text {
                    font-size: 0.9rem;
                    line-height: 1.5;
                    color: var(--color-text-primary);
                }
                .question-preview {
                    font-size: 0.9rem;
                    line-height: 1.4;
                }
                .question-preview strong {
                    color: var(--color-accent-1);
                }
                
                /* Variation groups */
                .variation-groups {
                    margin-top: 1.5rem;
                }
                .variation-group {
                    background: rgba(255,255,255,0.5);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    border-left: 4px solid var(--color-accent-1);
                }
                .group-header {
                    padding: 0.75rem;
                    background: rgba(96, 78, 255, 0.05);
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                }
                .group-variations {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
            `}</style>
    </div>
  );
};

export default CreateQuestion;
