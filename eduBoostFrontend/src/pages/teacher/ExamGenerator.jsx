import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Layers,
  FileText,
  Eye,
  Sparkles,
  Download,
  Pencil,
  RefreshCw,
  Trash2,
  GripVertical,
  LayoutGrid,
  ExternalLink,
  Check,
  RefreshCcw,
  Library,
  Save,
} from "lucide-react";
import { knowledgeService } from "../../services/knowledgeService";
import { examService } from "../../services/examService";
import { questionBankService } from "../../services/questionBankService";
import { showErrorToast, showSuccessToast } from "../../utils/show-toast";
import RichTextEditor from "../../components/common/RichTextEditor";
import { exportHtmlToPdf } from "../../utils/pdfExport";
import MathRenderer from "../../components/common/MathRenderer";
import { jsPDF } from "jspdf";

const GRADE_OPTIONS = [6, 7, 8, 9, 10, 11, 12];

const SUBJECT_KEYWORDS_BY_GRADE = {
  middle: ["toán", "khoa học tự nhiên", "vật lý", "hóa học"],
  high: ["toán", "vật lý", "hóa học"],
};

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

const DEFAULT_EXAM_TYPES = [
  { value: "15MIN", label: "Kiểm tra 15 phút" },
  { value: "45MIN", label: "Kiểm tra 1 tiết" },
  { value: "MIDTERM", label: "Kiểm tra giữa kỳ" },
  { value: "FINAL", label: "Kiểm tra cuối kỳ" },
];

const COGNITIVE_LEVELS = [
  { id: "nb", name: "Nhận biết" },
  { id: "th", name: "Thông hiểu" },
  { id: "vd", name: "Vận dụng" },
  { id: "vdc", name: "Vận dụng cao" },
];

const durationMinutesByTypeCode = (typeCode) => {
  if (typeCode === "15MIN") return 15;
  if (typeCode === "45MIN") return 45;
  if (typeCode === "MIDTERM") return 60;
  if (typeCode === "FINAL") return 90;
  return 45;
};

// Deterministic shuffle for answers based on seed
const shuffleAnswers = (correct, wrong1, wrong2, wrong3, seed) => {
  const answers = [correct, wrong1, wrong2, wrong3].filter(Boolean);
  // Simple deterministic shuffle based on seed
  const shuffled = [...answers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) * 7) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const ExamGenerator = () => {
  const [step, setStep] = useState(1);

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [gradeLevel, setGradeLevel] = useState(6);
  const [examType, setExamType] = useState("15MIN");
  const [examTypes, setExamTypes] = useState([]);
  const [examTitle, setExamTitle] = useState("");

  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState("");
  const [lessons, setLessons] = useState([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);

  // Matrix template selection (for 45MIN / MIDTERM / FINAL)
  const [matrixTemplates, setMatrixTemplates] = useState([]);
  const [matrixTemplateId, setMatrixTemplateId] = useState("");
  const [loadingMatrices, setLoadingMatrices] = useState(false);
  const [selectedMatrix, setSelectedMatrix] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [publishingExam, setPublishingExam] = useState(false);

  // Config
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(1);
  const [lessonDistribution, setLessonDistribution] = useState({}); // { [lessonId]: count }
  const [levelDistribution, setLevelDistribution] = useState({
    nb: 4,
    th: 4,
    vd: 2,
    vdc: 0,
  });

  // Preview
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true); // Toggle hiển thị đáp án đúng
  const [editForm, setEditForm] = useState({
    modifiedQuestionText: "",
    modifiedCorrectAnswer: "",
    modifiedExplanation: "",
    wrongAnswer1: "",
    wrongAnswer2: "",
    wrongAnswer3: "",
  });

  // Action states
  const [generatingAiId, setGeneratingAiId] = useState(null);
  const [savingBankId, setSavingBankId] = useState(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [qToReplace, setQToReplace] = useState(null);

  // Drag and Drop State
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const autoScrollY = useRef(null);
  const autoScrollFrame = useRef(null);
  const pdfContainerRef = useRef(null);

  const stats = useMemo(() => {
    const byLesson = selectedLessonIds.reduce((acc, lid) => {
      acc[lid] = Number(lessonDistribution[lid] || 0);
      return acc;
    }, {});
    const sumLesson = Object.values(byLesson).reduce(
      (s, n) => s + Number(n),
      0,
    );

    const sumLevel = Object.values(levelDistribution).reduce(
      (s, n) => s + Number(n),
      0,
    );

    return { byLesson, sumLesson, sumLevel };
  }, [selectedLessonIds, lessonDistribution, levelDistribution]);

  const loadSubjects = async () => {
    const data = await knowledgeService.getSubjects();
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    setSubjects(list);
    const filtered = filterSubjectsByGrade(list, gradeLevel);
    if (!subjectId && filtered.length) setSubjectId(String(filtered[0].id));
  };

  const filteredSubjects = filterSubjectsByGrade(subjects, gradeLevel);

  const loadExamTypes = async () => {
    try {
      const data = await examService.getExamTypes();
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setExamTypes(list);
    } catch {
      setExamTypes([]);
    }
  };

  // Detect if current exam type requires matrix (memoized to avoid race condition)
  const isMatrixType = useMemo(() => {
    const found = examTypes.find((t) => String(t.typeCode) === String(examType));
    // If examTypes not loaded yet, use typeCode fallback
    return found ? !!found.requiresMatrix : (examType !== "15MIN" && examType !== "");
  }, [examType, examTypes]);

  const getSelectedExamTypeId = () => {
    const found = examTypes.find(
      (t) => String(t.typeCode) === String(examType),
    );
    return found?.id ?? null;
  };

  const refreshExam = async (examId) => {
    const exam = await examService.getExamById(examId);
    setCurrentExam(exam);
    const qs = Array.isArray(exam?.questions) ? [...exam.questions] : [];
    qs.sort((a, b) => Number(a.orderNumber || 0) - Number(b.orderNumber || 0));
    setPreviewQuestions(qs);
  };

  const loadChapters = async () => {
    if (!subjectId) return;
    const data = await knowledgeService.getChaptersBySubject(
      subjectId,
      gradeLevel,
    );
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    setChapters(list);
    setChapterId(list.length ? String(list[0].id) : "");
  };

  const loadLessons = async () => {
    if (!chapterId) return;
    const data = await knowledgeService.getLessonsByChapter(chapterId);
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    setLessons(list);
    const firstIds = list.slice(0, 2).map((l) => String(l.id));
    setSelectedLessonIds(firstIds);
    const dist = {};
    firstIds.forEach(
      (id) =>
        (dist[id] = Math.max(
          1,
          Math.floor(totalQuestions / Math.max(1, firstIds.length)),
        )),
    );
    setLessonDistribution(dist);
  };

  useEffect(() => {
    loadSubjects().catch(() => setSubjects([]));
    loadExamTypes().catch(() => setExamTypes([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load existing exam when ?examId=XX is in the URL (edit mode)
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const editExamId = searchParams.get("examId");
    if (editExamId) {
      setLoadingPreview(true);
      examService.getExamById(editExamId)
        .then((exam) => {
          setCurrentExam(exam);
          setExamTitle(exam.examTitle || "");
          if (exam.subjectId) setSubjectId(String(exam.subjectId));
          if (exam.gradeLevel) setGradeLevel(Number(exam.gradeLevel));
          if (exam.examTypeCode) setExamType(exam.examTypeCode);
          const qs = Array.isArray(exam.questions) ? [...exam.questions] : [];
          qs.sort((a, b) => Number(a.orderNumber || 0) - Number(b.orderNumber || 0));
          setPreviewQuestions(qs);
          setStep(3);
        })
        .catch((e) => {
          console.error(e);
          showErrorToast("Không thể tải đề thi để chỉnh sửa");
        })
        .finally(() => setLoadingPreview(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filtered = filterSubjectsByGrade(subjects, gradeLevel);
    if (filtered.length > 0) {
      setSubjectId(String(filtered[0].id));
    } else {
      setSubjectId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeLevel]);

  useEffect(() => {
    loadChapters().catch(() => setChapters([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, gradeLevel]);

  // Load matrix templates when exam type OR subject changes
  useEffect(() => {
    if (!isMatrixType) {
      setMatrixTemplates([]);
      setMatrixTemplateId("");
      setSelectedMatrix(null);
      return;
    }
    if (!subjectId) return;
    setLoadingMatrices(true);
    const examTypeId = getSelectedExamTypeId();
    // NOTE: we intentionally do NOT filter by gradeLevel here so teachers can
    // select matrices created for any grade of the same subject+examType.
    examService
      .getMatrixTemplates({ examTypeId, subjectId: Number(subjectId) })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setMatrixTemplates(list);
        if (list.length) {
          setMatrixTemplateId(String(list[0].id));
          setSelectedMatrix(list[0]);
        } else {
          setMatrixTemplateId("");
          setSelectedMatrix(null);
        }
      })
      .catch(() => setMatrixTemplates([]))
      .finally(() => setLoadingMatrices(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMatrixType, subjectId]);

  useEffect(() => {
    loadLessons().catch(() => setLessons([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  // Support manual wheel scrolling while native dragging
  useEffect(() => {
    const handleWheel = (e) => {
      if (draggedIdx !== null) {
        // Force scroll when the browser blocks wheel during native drag
        e.preventDefault();
        window.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [draggedIdx]);

  // Smooth continuous auto-scroll during drag
  useEffect(() => {
    if (draggedIdx === null) {
      if (autoScrollFrame.current) {
        cancelAnimationFrame(autoScrollFrame.current);
        autoScrollFrame.current = null;
      }
      return;
    }

    const scrollLoop = () => {
      if (autoScrollY.current !== null) {
        const threshold = 120; // pixels from edge to start scrolling
        const y = autoScrollY.current;
        const vh = window.innerHeight;
        
        let speed = 0;
        if (y < threshold) {
          speed = -((threshold - y) / threshold) * 15; // scroll up
        } else if (vh - y < threshold) {
          speed = ((threshold - (vh - y)) / threshold) * 15; // scroll down
        }
        
        if (speed !== 0) {
          window.scrollBy(0, speed);
        }
      }
      autoScrollFrame.current = requestAnimationFrame(scrollLoop);
    };
    
    autoScrollFrame.current = requestAnimationFrame(scrollLoop);
    return () => {
      if (autoScrollFrame.current) cancelAnimationFrame(autoScrollFrame.current);
    };
  }, [draggedIdx]);

  const updateAutoScroll = (e) => {
    if (e.clientY && e.clientY !== 0) {
      autoScrollY.current = e.clientY;
    }
  };

  const toggleLesson = (lessonId) => {
    setSelectedLessonIds((prev) => {
      const id = String(lessonId);
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      // sync distribution keys
      setLessonDistribution((d) => {
        const copy = { ...d };
        Object.keys(copy).forEach((k) => {
          if (!next.includes(k)) delete copy[k];
        });
        next.forEach((k) => {
          if (copy[k] == null) copy[k] = 0;
        });
        return copy;
      });
      return next;
    });
  };

  const goStep2 = () => {
    if (!examTitle.trim()) return showErrorToast("Vui lòng nhập tên đề thi");
    if (!subjectId) return showErrorToast("Vui lòng chọn môn học");
    // For matrix-based types, require a matrix template selection
    if (isMatrixType) {
      if (!matrixTemplateId)
        return showErrorToast(
          "Vui lòng chọn ma trận đề thi, hoặc vào trang Quản lý ma trận để tạo mới"
        );
    } else {
      // 15MIN: require chapter and lesson
      if (!chapterId) return showErrorToast("Vui lòng chọn chương");
      if (selectedLessonIds.length === 0)
        return showErrorToast("Vui lòng chọn ít nhất 1 bài học");
    }
    setStep(2);
  };

  const generatePreview = async () => {
    if (isMatrixType) {
      // Matrix-based: create exam with matrixTemplateId, then auto-select
      const examTypeId = getSelectedExamTypeId();
      if (!examTypeId) return showErrorToast("Không tìm thấy loại đề thi");
      if (!matrixTemplateId) return showErrorToast("Vui lòng chọn ma trận đề thi");

      const payload = {
        examTitle: examTitle.trim(),
        examTypeId,
        subjectId: Number(subjectId),
        gradeLevel: Number(gradeLevel),
        durationMinutes: durationMinutesByTypeCode(examType),
        matrixTemplateId: Number(matrixTemplateId),
        semester: 1,
        schoolYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
      };

      setLoadingPreview(true);
      setLoadingMsg("Đang tạo đề thi...");
      try {
        const created = await examService.createExam(payload);
        setCurrentExam(created);

        // Show animated messages during AI generation (can take 30-120s)
        setLoadingMsg("Đang chọn câu hỏi từ ngân hàng...");
        const msgTimer = setInterval(() => {
          setLoadingMsg((prev) => {
            const msgs = [
              "Đang chọn câu hỏi từ ngân hàng...",
              "AI đang sinh câu hỏi mới... (có thể mất 30-60 giây)",
              "Đang xử lý phân bố theo mưức độ nhận thức...",
              "AI đang tạo câu hỏi chất lượng cao... Vui lòng đợi",
            ];
            const idx = msgs.indexOf(prev);
            return msgs[(idx + 1) % msgs.length];
          });
        }, 4000);

        try {
          await examService.autoSelectQuestions(created.id);
        } finally {
          clearInterval(msgTimer);
        }

        setLoadingMsg("Đang tải preview...");
        await refreshExam(created.id);
        setStep(3);
      } catch (e) {
        console.error(e);
        // Check if timeout
        const isTimeout = e.code === "ECONNABORTED" || e.message?.includes("timeout");
        if (isTimeout) {
          showErrorToast(
            "Đặt thời gian chờ quá. AI có thể đang sinh câu trong nền — hãy vào Quản lý đề thi kiểm tra sau."
          );
          // Navigate to exam management after timeout since exam was created
          if (currentExam?.id) await refreshExam(currentExam.id);
        } else {
          showErrorToast(
            e?.response?.data?.message || "Không thể tạo đề thi từ ma trận. Kiểm tra lại API."
          );
        }
      } finally {
        setLoadingPreview(false);
        setLoadingMsg("");
      }
      return;
    }

    // 15MIN: original config-based flow
    if (stats.sumLesson <= 0)
      return showErrorToast("Vui lòng phân bổ ít nhất 1 câu cho các bài học");

    const examTypeId = getSelectedExamTypeId();
    if (!examTypeId) {
      return showErrorToast(
        "Không tìm thấy Exam Type tương ứng. Vui lòng kiểm tra dữ liệu /api/exam-types",
      );
    }

    const lessonDistList = selectedLessonIds
      .map((lid) => ({
        lessonId: Number(lid),
        numberOfQuestions: Number(lessonDistribution[lid] || 0),
      }))
      .filter((x) => x.numberOfQuestions > 0);

    const payload = {
      examTitle: examTitle.trim(),
      examTypeId,
      subjectId: Number(subjectId),
      gradeLevel: Number(gradeLevel),
      chapterId: chapterId ? Number(chapterId) : null,
      durationMinutes: durationMinutesByTypeCode(examType),
      lessonIds: selectedLessonIds.map((x) => Number(x)),
      config: {
        totalQuestions: stats.sumLesson,
        pointsPerQuestion: stats.sumLesson > 0
          ? parseFloat((10 / stats.sumLesson).toFixed(3))
          : 1,
        lessonDistribution: lessonDistList,
      },
    };

    setLoadingPreview(true);
    try {
      const created = await examService.createExam(payload);
      setCurrentExam(created);

      // Build cognitive level distribution by code
      // levelDistribution has format: { nb: 4, th: 4, vd: 2, vdc: 0 }
      // Backend will resolve codes to cognitive level IDs

      const autoSelectConfig = {
        lessonDistribution: lessonDistList,
        cognitiveLevelDistributionByCode: levelDistribution, // { nb: 4, th: 4, vd: 2, vdc: 0 }
        useAiGeneration: true,
      };

      await examService.autoSelectQuestionsWithConfig(
        created.id,
        autoSelectConfig,
      );
      await refreshExam(created.id);
      setStep(3);
    } catch (e) {
      console.error(e);
      showErrorToast(
        "Không thể tạo/preview đề thi. Vui lòng kiểm tra backend API.",
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  // Publish exam: set status PUBLISHED
  const handlePublish = async () => {
    if (!currentExam?.id) return showErrorToast("Chưa có đề thi");
    setPublishingExam(true);
    try {
      await examService.changeExamStatus(currentExam.id, { newStatus: "PUBLISHED" });
      showSuccessToast("Đã công bố đề thi thành công! Giờ đây mọi người có thể xem được đề này.");
      // Refresh exam to get updated status
      await refreshExam(currentExam.id);
    } catch (e) {
      showErrorToast(e?.response?.data?.message || "Không thể công bố đề thi");
    } finally {
      setPublishingExam(false);
    }
  };

  // Download blob from backend export endpoint
  const downloadBlob = (data, filename) => {
    const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // Export PDF without answers (đề thi thường)
  const handleExportPdf = async () => {
    if (!currentExam?.id || !pdfContainerRef.current) return showErrorToast("Chưa có đề thi");
    
    // Disable answers before export
    const previousShowCorrectAnswers = showCorrectAnswers;
    setShowCorrectAnswers(false);
    
    // Let React render without answers
    setTimeout(async () => {
      setExportingPdf(true);
      try {
        await exportHtmlToPdf(pdfContainerRef.current, `${currentExam.examCode || "de-thi"}.pdf`);
        showSuccessToast("Đã xuất PDF đề thi thành công! Trạng thái đề thi đã được cập nhật USED.");
        // Notify backend to mark as USED
        await examService.changeExamStatus(currentExam.id, { newStatus: "USED" });
        await refreshExam(currentExam.id);
      } catch (e) {
        showErrorToast("Xuất PDF thất bại");
      } finally {
        setExportingPdf(false);
        // Restore previous state if needed
        setShowCorrectAnswers(previousShowCorrectAnswers);
      }
    }, 100);
  };

  // Export PDF with answers (đáp án)
  const handleExportAnswerKey = async () => {
    if (!currentExam?.id || !pdfContainerRef.current) return showErrorToast("Chưa có đề thi");
    
    // Enable answers before export
    setShowCorrectAnswers(true);

    // Let React render answers
    setTimeout(async () => {
      setExportingPdf(true);
      try {
        await exportHtmlToPdf(pdfContainerRef.current, `${currentExam.examCode || "de-thi"}-dap-an.pdf`);
        showSuccessToast("Đã xuất đáp án PDF thành công! Trạng thái đề thi đã được cập nhật USED.");
        // Notify backend to mark as USED
        await examService.changeExamStatus(currentExam.id, { newStatus: "USED" });
        await refreshExam(currentExam.id);
      } catch (e) {
        showErrorToast("Xuất đáp án thất bại");
      } finally {
        setExportingPdf(false);
      }
    }, 100);
  };



  const startEdit = (q) => {
    setEditingId(q.id);
    setEditForm({
      modifiedQuestionText: q.questionText || "",
      modifiedCorrectAnswer: q.correctAnswer || "",
      modifiedExplanation: q.explanation || "",
      wrongAnswer1: q.wrongAnswer1 || "",
      wrongAnswer2: q.wrongAnswer2 || "",
      wrongAnswer3: q.wrongAnswer3 || "",
    });
  };

  const saveEdit = async () => {
    if (!currentExam?.id || !editingId) return;
    try {
      await examService.editExamQuestion(currentExam.id, editingId, editForm);
      setEditingId(null);
      await refreshExam(currentExam.id);
      showSuccessToast("Đã cập nhật câu hỏi");
    } catch (e) {
      console.error(e);
      showErrorToast("Không thể cập nhật câu hỏi");
    }
  };

  const handleDeleteQuestion = async (qid) => {
    if (!currentExam?.id) return;
    try {
      await examService.deleteExamQuestion(currentExam.id, qid);
      await refreshExam(currentExam.id);
      showSuccessToast("Đã xóa câu hỏi khỏi đề");
    } catch (e) {
      console.error(e);
      showErrorToast("Không thể xóa câu hỏi");
    }
  };

  // ── AI Regenerate: delete current question, generate 1 new one via AI ──
  const handleAiRegenerate = async (q) => {
    if (!currentExam?.id) return;
    // Resolve IDs — API may return nested objects or flat IDs
    const lessonId = q.lessonId || q.lesson?.id;
    const cognitiveLevelId = q.cognitiveLevelId || q.cognitiveLevel?.id;
    console.log("AI Regenerate:", { questionId: q.id, lessonId, cognitiveLevelId, points: q.points });
    if (!lessonId) {
      showErrorToast("Không xác định được bài học của câu hỏi này");
      return;
    }
    setGeneratingAiId(q.id);
    try {
      // Generate 1 replacement via AI FIRST (before deleting old one)
      const genPayload = {
        lessonId,
        numberOfQuestions: 1,
        pointsPerQuestion: q.points || q.pointsPerQuestion || 1,
      };
      if (cognitiveLevelId) genPayload.cognitiveLevelId = cognitiveLevelId;

      const result = await examService.aiGenerateQuestionsForExam(currentExam.id, genPayload);
      const generated = Array.isArray(result) ? result : (result?.questions ?? []);
      console.log("AI Regenerate result:", generated);

      if (generated.length > 0) {
        // AI succeeded → now safe to delete the old question
        await examService.deleteExamQuestion(currentExam.id, q.id);
        await refreshExam(currentExam.id);
        showSuccessToast("AI đã tạo lại câu hỏi mới thành công!");
      } else {
        // AI returned empty → don't delete old question, keep it
        showErrorToast("AI không tạo được câu hỏi mới. Câu hỏi cũ vẫn giữ nguyên.");
        await refreshExam(currentExam.id);
      }
    } catch (e) {
      console.error("AI Regenerate error:", e);
      const isTimeout = e.code === "ECONNABORTED" || e.message?.includes("timeout");
      if (isTimeout) {
        showErrorToast("AI tạo câu hỏi quá lâu (timeout). Câu hỏi cũ vẫn giữ nguyên. Thử lại sau.");
      } else {
        showErrorToast(e?.response?.data?.message || "Không thể tạo lại câu hỏi bằng AI");
      }
      // Refresh to show current state
      try { await refreshExam(currentExam.id); } catch {}
    } finally {
      setGeneratingAiId(null);
    }
  };


  // ── Open Bank Modal: load questions from bank with same filters ──
  const handleOpenBankModal = async (q) => {
    setQToReplace(q);
    setBankModalOpen(true);
    setLoadingBank(true);
    setBankQuestions([]);
    try {
      const filters = {
        lessonId: q.lessonId,
        cognitiveLevelId: q.cognitiveLevelId,
        size: 50,
        page: 0,
      };
      const data = await questionBankService.getQuestions(filters);
      const list = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);
      // Filter out questions already in the current exam
      const existingQIds = new Set(previewQuestions.map((pq) => pq.questionId).filter(Boolean));
      const filtered = list.filter((bq) => !existingQIds.has(bq.id));
      setBankQuestions(filtered);
    } catch (e) {
      console.error(e);
      showErrorToast("Không thể tải câu hỏi từ ngân hàng");
    } finally {
      setLoadingBank(false);
    }
  };

  // ── Select from Bank: replace old question with one from bank ──
  const handleSelectFromBank = async (bankQuestion) => {
    if (!currentExam?.id || !qToReplace) return;
    try {
      // Delete old question
      await examService.deleteExamQuestion(currentExam.id, qToReplace.id);
      // Add new question from bank
      await examService.addQuestionToExam(currentExam.id, {
        questionId: bankQuestion.id,
        orderNumber: qToReplace.orderNumber,
        points: qToReplace.points,
      });
      setBankModalOpen(false);
      setQToReplace(null);
      await refreshExam(currentExam.id);
      showSuccessToast("Đã thay thế câu hỏi từ ngân hàng!");
    } catch (e) {
      console.error(e);
      showErrorToast(e?.response?.data?.message || "Không thể thay thế câu hỏi");
    }
  };

  // ── Save to Bank: save AI/edited question to QuestionBank ──
  const handleSaveToBank = async (q) => {
    if (!currentExam?.id) return;
    setSavingBankId(q.id);
    try {
      await questionBankService.createQuestion({
        lessonId: q.lessonId,
        questionText: q.questionText,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
        questionType: "MULTIPLE_CHOICE",
        cognitiveLevelId: q.cognitiveLevelId,
        sourceType: q.sourceFlag === "AI_GENERATED" ? "AI_GENERATED" : "TEACHER_CREATED",
      });
      showSuccessToast("Đã lưu câu hỏi vào ngân hàng thành công!");
    } catch (e) {
      console.error(e);
      showErrorToast(e?.response?.data?.message || "Không thể lưu vào ngân hàng");
    } finally {
      setSavingBankId(null);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
    
    // Create an empty drag image to hide the massive ghost image
    const dragImg = new Image();
    dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(dragImg, 0, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    updateAutoScroll(e);
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = async (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    await applyDragAndDrop(index);
  };

  const handleListDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    updateAutoScroll(e);
  };

  const handleListDrop = async (e) => {
    e.preventDefault();
    if (draggedIdx !== null && previewQuestions.length > 0) {
      // If dropped on the empty bottom list area, move to the very end
      await applyDragAndDrop(previewQuestions.length - 1);
    }
  };

  const applyDragAndDrop = async (targetIndex) => {
    if (draggedIdx !== null && targetIndex !== null && draggedIdx !== targetIndex && currentExam?.id) {
      const next = [...previewQuestions];
      const draggedItem = next[draggedIdx];
      next.splice(draggedIdx, 1);
      next.splice(targetIndex, 0, draggedItem);
      
      const reOrdered = next.map((q, idx) => ({ ...q, orderNumber: idx + 1 }));
      setPreviewQuestions(reOrdered);
      
      try {
        await examService.reorderQuestions(currentExam.id, {
          questionOrders: reOrdered.map((q, idx) => ({
            examQuestionId: q.id,
            newOrderNumber: idx + 1,
          })),
        });
      } catch (err) {
        console.error(err);
        showErrorToast("Không thể sắp xếp lại thứ tự");
      }
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div className="create-exam-page">
      <div className="steps glass">
        <div className={`s ${step >= 1 ? "active" : ""}`}>
          <div className="n">1</div>
          <span>Phạm vi</span>
        </div>
        <div className="line" />
        <div className={`s ${step >= 2 ? "active" : ""}`}>
          <div className="n">2</div>
          <span>Cấu hình</span>
        </div>
        <div className="line" />
        <div className={`s ${step >= 3 ? "active" : ""}`}>
          <div className="n">3</div>
          <span>Preview</span>
        </div>
      </div>

      {step === 1 && (
        <div className="panel glass">
          <h2>
            <Layers size={20} /> Tạo đề thi
          </h2>

          <div className="row3">
            <div className="field">
              <label>Khối</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    Khối {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Loại đề</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
              >
                {(examTypes.length
                  ? examTypes.map((t) => ({
                      value: t.typeCode,
                      label: t.typeName,
                    }))
                  : DEFAULT_EXAM_TYPES
                ).map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Tên đề thi</label>
              <input
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="Ví dụ: Kiểm tra 15 phút - Chương 1"
              />
            </div>
            <div className="field">
              <label>Môn học</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.subjectName || s.name || ""}
                    </option>
                  ))
                ) : (
                  <option value="">-- Không có môn phù hợp --</option>
                )}
              </select>
            </div>
          </div>

          {/* ── Matrix-based exam type ── */}
          {isMatrixType ? (
            <div style={{ marginTop: "1.25rem" }}>
              <div className="divider" />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <h3 style={{ margin: 0 }}><LayoutGrid size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />Chọn ma trận đề thi</h3>
                <a
                  href="/teacher/matrix-templates"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: "0.85rem", color: "var(--color-accent-1)", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <ExternalLink size={14} /> Quản lý ma trận
                </a>
              </div>

              {loadingMatrices ? (
                <p className="muted"><RefreshCw size={14} className="spin" /> Đang tải ma trận...</p>
              ) : matrixTemplates.length === 0 ? (
                <div className="matrix-empty-notice">
                  <LayoutGrid size={36} style={{ opacity: 0.35 }} />
                  <p>Chưa có ma trận nào phù hợp với môn học và khối này.</p>
                  <a href="/teacher/matrix-templates" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <LayoutGrid size={15} /> Tạo ma trận mới
                  </a>
                </div>
              ) : (
                <div className="matrix-select-grid">
                  {matrixTemplates.map((t) => (
                    <div
                      key={t.id}
                      className={`matrix-card ${String(matrixTemplateId) === String(t.id) ? "selected" : ""}`}
                      onClick={() => { setMatrixTemplateId(String(t.id)); setSelectedMatrix(t); }}
                    >
                      <div className="mc-check">{String(matrixTemplateId) === String(t.id) && <Check size={14} />}</div>
                      <div className="mc-name">{t.templateName}</div>
                      <div className="mc-meta">
                        Khối {t.gradeLevel} • {t.totalQuestions} câu • {t.totalPoints} điểm
                        {t.isDefault && <span className="badge-default">Mặc định</span>}
                      </div>
                      {t.details?.length > 0 && (
                        <div className="mc-levels">
                          {t.details.map((d) => (
                            <span key={d.id} className="mc-level-tag">
                              {d.cognitiveLevelName}: {d.numberOfQuestions}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {matrixTemplates.length > 0 && !matrixTemplateId && (
                <p style={{ color: "var(--ds-error)", fontSize: "0.85rem", marginTop: "0.5rem" }}>⚠️ Vui lòng chọn một ma trận để tiếp tục</p>
              )}
            </div>
          ) : (
            // ── 15-MIN: chapter + lesson selection ──
            <>
              {chapters.length > 0 && (
                <div className="row2">
                  <div className="field">
                    <label>Chương</label>
                    <select
                      value={chapterId}
                      onChange={(e) => setChapterId(e.target.value)}
                    >
                      {chapters.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          Chương {c.chapterNumber}: {c.chapterName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="divider" />
              <h3>Chọn bài học</h3>
              {!lessons.length ? (
                <p className="muted">Chưa có bài học</p>
              ) : (
                <div className="lesson-grid">
                  {lessons.map((l) => {
                    const id = String(l.id);
                    const checked = selectedLessonIds.includes(id);
                    return (
                      <label
                        key={id}
                        className={`lesson-pill ${checked ? "on" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLesson(id)}
                        />
                        <span>
                          Bài {l.lessonNumber}: {l.lessonName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div className="actions">
            <button className="btn btn-primary" onClick={goStep2}>
              Tiếp tục <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && isMatrixType && (
        <div className="panel glass">
          <h2><FileText size={20} /> Xác nhận & Tạo đề thi từ ma trận</h2>

          <div className="matrix-summary-box">
            <div className="summary-row"><span>Tên đề thi:</span><strong>{examTitle}</strong></div>
            <div className="summary-row"><span>Loại đề:</span><strong>{examType}</strong></div>
            <div className="summary-row"><span>Môn / Khối:</span><strong>{filteredSubjects.find(s => String(s.id) === String(subjectId))?.subjectName || subjectId} / Khối {gradeLevel}</strong></div>
            {selectedMatrix && (
              <>
                <div className="summary-row"><span>Ma trận:</span><strong>{selectedMatrix.templateName}</strong></div>
                <div className="summary-row"><span>Tổng số câu:</span><strong>{selectedMatrix.totalQuestions} câu</strong></div>
                <div className="summary-row"><span>Tổng điểm:</span><strong>{selectedMatrix.totalPoints} điểm</strong></div>
              </>
            )}
          </div>

          {selectedMatrix?.details?.length > 0 && (
            <>
              <h3 style={{ marginTop: "1.25rem" }}>Phân bố theo mức độ nhận thức</h3>
              <table className="summary-table">
                <thead><tr><th>Mức độ</th><th>Số câu</th><th>Điểm/câu</th><th>Tổng điểm</th></tr></thead>
                <tbody>
                  {selectedMatrix.details.map((d, i) => (
                    <tr key={i}>
                      <td>{d.cognitiveLevelName}</td>
                      <td style={{ textAlign: "center" }}>{d.numberOfQuestions}</td>
                      <td style={{ textAlign: "center" }}>{d.pointsPerQuestion}</td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>{Number(d.totalPoints || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <p className="muted" style={{ marginTop: "1rem" }}>
            Hệ thống sẽ tự động chọn câu hỏi từ ngân hàng theo phân bố của ma trận.
            Nếu ngân hàng chưa đủ, AI sẽ sinh câu mới.
          </p>

          <div className="actions space">
            <button className="btn btn-secondary" onClick={() => setStep(1)} disabled={loadingPreview}>Quay lại</button>
            <button className="btn btn-primary" onClick={generatePreview} disabled={loadingPreview}>
              {loadingPreview
                ? <><RefreshCw size={16} className="spin" /> {loadingMsg || "Đang tạo đề..."}</>
                : <><Eye size={16} /> Tạo & Xem preview</>}
            </button>
          </div>
        </div>
      )}

      {step === 2 && !isMatrixType && (
        <div className="panel glass">
          <h2>
            <FileText size={20} /> Cấu hình đề
          </h2>

          {/* Tổng điểm cố định 10 - điểm/câu tự tính */}
          {(() => {
            const pPerQ = stats.sumLesson > 0
              ? parseFloat((10 / stats.sumLesson).toFixed(3))
              : 0;
            return (
              <div className="row3">
                <div className="field">
                  <label>Tổng số câu</label>
                  <input
                    value={stats.sumLesson}
                    disabled
                    style={{
                      background: "rgba(96,78,255,0.08)",
                      fontWeight: 700,
                      color: "var(--color-accent-1)",
                      cursor: "not-allowed",
                    }}
                  />
                  <small className="muted">Tự động tính từ phân bổ bài học bên dưới</small>
                </div>
                <div className="field">
                  <label>Điểm / câu</label>
                  <input
                    value={pPerQ}
                    disabled
                    style={{ cursor: "not-allowed" }}
                  />
                  <small className="muted">= 10 ÷ tổng số câu</small>
                </div>
                <div className="field">
                  <label>Tổng điểm</label>
                  <input
                    value="10"
                    disabled
                    style={{
                      background: "rgba(16,185,129,0.08)",
                      fontWeight: 700,
                      color: "var(--ds-success)",
                      cursor: "not-allowed",
                    }}
                  />
                </div>
              </div>
            );
          })()}

          <div className="row2">
            <div className="box">
              <h3>Phân bổ theo bài học</h3>
              {selectedLessonIds.map((lid) => {
                const l = lessons.find((x) => String(x.id) === String(lid));
                const name = l
                  ? `Bài ${l.lessonNumber}: ${l.lessonName}`
                  : `Lesson ${lid}`;
                return (
                  <div key={lid} className="dist-row">
                    <span className="dist-name">{name}</span>
                    <input
                      type="number"
                      min="0"
                      value={lessonDistribution[lid] ?? 0}
                      onChange={(e) =>
                        setLessonDistribution((d) => ({
                          ...d,
                          [lid]: Number(e.target.value),
                        }))
                      }
                      className="dist-input"
                    />
                  </div>
                );
              })}
              <div className="dist-footer muted">
                Tổng: <strong>{stats.sumLesson}</strong> câu
              </div>
            </div>

            <div className="box">
              <h3>Phân bổ theo mức độ</h3>
              {COGNITIVE_LEVELS.map((lv) => (
                <div key={lv.id} className="dist-row">
                  <span className="dist-name">{lv.name}</span>
                  <input
                    type="number"
                    min="0"
                    value={levelDistribution[lv.id] ?? 0}
                    onChange={(e) =>
                      setLevelDistribution((d) => ({
                        ...d,
                        [lv.id]: Number(e.target.value),
                      }))
                    }
                    className="dist-input"
                  />
                </div>
              ))}
              <div className="dist-footer muted">
                Tổng: {stats.sumLevel} / {stats.sumLesson} câu
                {stats.sumLevel !== stats.sumLesson && stats.sumLesson > 0 && (
                  <span style={{ color: "var(--ds-error)", marginLeft: "0.5rem" }}>
                    (phải bằng tổng số câu)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="actions space">
            <button
              className="btn btn-secondary"
              onClick={() => setStep(1)}
              disabled={loadingPreview}
            >
              Quay lại
            </button>
            <button
              className="btn btn-primary"
              onClick={generatePreview}
              disabled={
                loadingPreview ||
                stats.sumLesson === 0 ||
                stats.sumLevel !== stats.sumLesson
              }
              title={
                stats.sumLesson === 0
                  ? "Vui lòng phân bổ số câu cho bài học"
                  : stats.sumLevel !== stats.sumLesson
                    ? `Phân bổ mức độ (${stats.sumLevel}) chưa khớp tổng số câu (${stats.sumLesson})`
                    : ""
              }
            >
              {loadingPreview ? (
                <>
                  <RefreshCw size={16} className="spin" /> Đang tạo đề thi...
                </>
              ) : (
                <>
                  <Eye size={16} /> Xem preview
                </>
              )}
            </button>
            {!loadingPreview && stats.sumLesson > 0 && stats.sumLevel !== stats.sumLesson && (
              <p style={{ color: "var(--ds-error)", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>
                ⚠️ Phân bổ theo mức độ ({stats.sumLevel} câu) phải bằng tổng số câu ({stats.sumLesson} câu) để tạo đề.
              </p>
            )}
          </div>

          <div className="divider" />
          <p className="muted">
            Hệ thống sẽ tự ưu tiên chọn câu từ ngân hàng đã có, nếu thiếu sẽ gọi AI tạo mới theo cấu hình.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="panel glass">
          <div className="header">
            <div>
              <h2>Preview đề thi</h2>
              <p className="muted">
                {previewQuestions.length} câu • Loại: {examType}
                {currentExam?.examCode ? ` • Mã: ${currentExam.examCode}` : ""}
                {currentExam?.status && (
                  <span style={{
                    marginLeft: 10,
                    padding: "2px 10px",
                    borderRadius: 999,
                    background: currentExam.status === "PUBLISHED" ? "rgba(59,130,246,0.12)" : "rgba(107,114,128,0.12)",
                    color: currentExam.status === "PUBLISHED" ? "var(--ds-info)" : "var(--ds-text-secondary)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}>{currentExam.status}</span>
                )}
              </p>
            </div>
            <div className="actions" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showCorrectAnswers}
                  onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                />
                Hiển thị đáp án
              </label>
              <button className="btn btn-secondary" onClick={() => setStep(isMatrixType ? 2 : 2)}>
                Chỉnh cấu hình
              </button>

              {/* Publish button */}
              {currentExam?.status !== "PUBLISHED" ? (
                <button
                  className="btn btn-primary"
                  onClick={handlePublish}
                  disabled={publishingExam || !currentExam?.id}
                >
                  {publishingExam
                    ? <><RefreshCw size={16} className="spin" /> Đang công bố...</>
                    : <><Sparkles size={16} /> Công bố</>}
                </button>
              ) : (
                <span style={{ padding: "0.5rem 1rem", background: "rgba(59,130,246,0.1)", color: "var(--ds-info)", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem" }}>
                  ✓ Đã công bố
                </span>
              )}

              {/* Export button */}
              <button
                className="btn btn-outline"
                onClick={() => showCorrectAnswers ? handleExportAnswerKey() : handleExportPdf()}
                disabled={exportingPdf || !currentExam?.id}
              >
                {exportingPdf
                  ? <><RefreshCw size={16} className="spin" /> Đang xuất...</>
                  : <><Download size={16} /> Export</>}
              </button>
            </div>
          </div>

          <div 
            className="q-list"
            onDragOver={handleListDragOver}
            onDrop={handleListDrop}
            ref={pdfContainerRef}
            style={{ backgroundColor: 'white' }}
          >
            {/* Header only for PDF Export */}
            <div className="pdf-only-header">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", color: "black" }}>
                <div style={{ textAlign: "center", fontWeight: "normal", fontSize: "16px" }}>
                  TRƯỜNG: ...........................................<br/>
                  HỌ TÊN: ...........................................<br/>
                  LỚP: ...........................................
                </div>
                <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px" }}>
                  MÃ ĐỀ: {currentExam?.examCode || "........."}
                </div>
              </div>
              <h2 style={{ textAlign: "center", marginBottom: "8px", color: "black", width: "100%", justifyContent: "center", textTransform: "uppercase" }}>
                {currentExam?.examTitle || "ĐỀ KIỂM TRA"}
              </h2>
              <div style={{ textAlign: "center", fontSize: "18px", marginBottom: "5px", color: "black", fontWeight: "bold" }}>
                MÔN: {currentExam?.subjectName?.toUpperCase()}
              </div>
              <div style={{ textAlign: "center", fontSize: "16px", marginBottom: "20px", color: "black", fontStyle: "italic" }}>
                Thời gian làm bài: {currentExam?.examTypeCode === "15MIN" ? "15" : currentExam?.examTypeCode === "45MIN" ? "45" : currentExam?.examTypeCode === "MIDTERM" ? "60" : currentExam?.examTypeCode === "FINAL" ? "90" : "..."} phút (không kể thời gian phát đề)
              </div>
              <hr style={{ borderTop: "2px solid #000", marginBottom: "20px" }} />
            </div>

            {loadingPreview ? (
              <div className="muted" style={{ padding: "1rem" }}>
                <RefreshCw className="spin" size={16} /> Đang tạo preview...
              </div>
            ) : (
              previewQuestions.map((q, idx) => {
                const isDraggingMe = draggedIdx === idx;
                const isDragOverMe = dragOverIdx === idx && !isDraggingMe;
                const dropDirection = dragOverIdx !== null && draggedIdx !== null && draggedIdx < dragOverIdx ? 'bottom' : 'top';
                
                return (
                <div 
                  key={q.id} 
                  className={`q-item ${isDragOverMe ? `drag-over-${dropDirection}` : ""} ${isDraggingMe ? "is-dragging" : ""}`}
                  draggable={currentExam?.status === "DRAFT"}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDrag={(e) => updateAutoScroll(e)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); autoScrollY.current = null; }}
                  style={{ cursor: currentExam?.status === "DRAFT" ? (isDraggingMe ? "grabbing" : "grab") : "default" }}
                >
                  <div className="q-top">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      {currentExam?.status === "DRAFT" && <GripVertical size={18} style={{ color: "var(--ds-text-muted)" }} />}
                      <span className="q-num">Câu {q.orderNumber || idx + 1}</span>
                    </div>
                    {q.cognitiveLevelName && (
                      <span className="badge bank">{q.cognitiveLevelName}</span>
                    )}
                    <span
                      className={`badge ${q.sourceFlag === "AI_GENERATED" ? "ai" : "bank"}`}
                    >
                      {q.sourceFlag === "AI_GENERATED"
                        ? "AI"
                        : q.sourceFlag === "TEACHER_EDITED"
                          ? "EDITED"
                          : "BANK"}
                    </span>

                    <div className="q-actions">
                      <button
                        className="btn-action btn-action-edit"
                        onClick={() => startEdit(q)}
                        title="Sửa câu hỏi"
                        disabled={generatingAiId === q.id || savingBankId === q.id}
                      >
                        <Pencil size={15} />
                        <span className="btn-action-label">Sửa</span>
                      </button>
                      <button
                        className="btn-action btn-action-ai"
                        onClick={() => handleAiRegenerate(q)}
                        title="AI tạo lại câu hỏi mới"
                        disabled={generatingAiId === q.id || savingBankId === q.id}
                      >
                        {generatingAiId === q.id ? <RefreshCw className="spin" size={15} /> : <RefreshCcw size={15} />}
                        <span className="btn-action-label">{generatingAiId === q.id ? "Đang tạo..." : "AI tạo lại"}</span>
                      </button>
                      <button
                        className="btn-action btn-action-bank"
                        onClick={() => handleOpenBankModal(q)}
                        title="Đổi câu từ ngân hàng"
                        disabled={generatingAiId === q.id || savingBankId === q.id}
                      >
                        <Library size={15} />
                        <span className="btn-action-label">Đổi câu</span>
                      </button>
                      {(q.sourceFlag === "AI_GENERATED" || q.sourceFlag === "TEACHER_EDITED") && (
                        <button
                          className="btn-action btn-action-save"
                          onClick={() => handleSaveToBank(q)}
                          title="Lưu câu hỏi vào ngân hàng đề"
                          disabled={generatingAiId === q.id || savingBankId === q.id}
                        >
                          {savingBankId === q.id ? <RefreshCw className="spin" size={15} /> : <Save size={15} />}
                          <span className="btn-action-label">{savingBankId === q.id ? "Đang lưu..." : "Lưu vào NH"}</span>
                        </button>
                      )}
                      <button
                        className="btn-action btn-action-delete"
                        onClick={() => handleDeleteQuestion(q.id)}
                        title="Xóa câu hỏi"
                        disabled={generatingAiId === q.id || savingBankId === q.id}
                      >
                        <Trash2 size={15} />
                        <span className="btn-action-label">Xóa</span>
                      </button>
                    </div>
                  </div>

                  {q.lessonName && (
                    <div className="q-meta muted">{q.lessonName}</div>
                  )}

                  {editingId === q.id ? (
                    <div className="edit-box">
                      <label>Nội dung câu hỏi</label>
                      <RichTextEditor
                        value={editForm.modifiedQuestionText}
                        onChange={(val) =>
                          setEditForm((f) => ({
                            ...f,
                            modifiedQuestionText: val,
                          }))
                        }
                        placeholder="Nhập nội dung câu hỏi..."
                      />
                      <label>Đáp án đúng</label>
                      <RichTextEditor
                        value={editForm.modifiedCorrectAnswer}
                        onChange={(val) =>
                          setEditForm((f) => ({
                            ...f,
                            modifiedCorrectAnswer: val,
                          }))
                        }
                        placeholder="Nhập đáp án đúng..."
                      />
                      <label>Giải thích</label>
                      <RichTextEditor
                        value={editForm.modifiedExplanation}
                        onChange={(val) =>
                          setEditForm((f) => ({
                            ...f,
                            modifiedExplanation: val,
                          }))
                        }
                        placeholder="Nhập giải thích..."
                      />
                      <div className="wrong-answers-grid">
                        <div className="field">
                          <label>Đáp án sai 1</label>
                          <RichTextEditor
                            value={editForm.wrongAnswer1}
                            onChange={(val) =>
                              setEditForm((f) => ({ ...f, wrongAnswer1: val }))
                            }
                            placeholder="Nhập đáp án sai 1..."
                          />
                        </div>
                        <div className="field">
                          <label>Đáp án sai 2</label>
                          <RichTextEditor
                            value={editForm.wrongAnswer2}
                            onChange={(val) =>
                              setEditForm((f) => ({ ...f, wrongAnswer2: val }))
                            }
                            placeholder="Nhập đáp án sai 2..."
                          />
                        </div>
                        <div className="field">
                          <label>Đáp án sai 3</label>
                          <RichTextEditor
                            value={editForm.wrongAnswer3}
                            onChange={(val) =>
                              setEditForm((f) => ({ ...f, wrongAnswer3: val }))
                            }
                            placeholder="Nhập đáp án sai 3..."
                          />
                        </div>
                      </div>

                      <div className="actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setEditingId(null)}
                        >
                          Hủy
                        </button>
                        <button className="btn btn-primary" onClick={saveEdit}>
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="q-text">
                        <MathRenderer content={q.questionText} />
                      </div>
                      <div className="exam-answers">
                        {(() => {
                          // Tạo mảng 4 đáp án và shuffle
                          const allAnswers = [
                            { content: q.correctAnswer, isCorrect: true },
                            { content: q.wrongAnswer1, isCorrect: false },
                            { content: q.wrongAnswer2, isCorrect: false },
                            { content: q.wrongAnswer3, isCorrect: false },
                          ].filter((a) => a.content); // Lọc bỏ đáp án rỗng

                          // Shuffle dựa trên question id để giữ thứ tự cố định
                          const shuffled = [...allAnswers].sort((a, b) => {
                            const hashA = (q.id + a.content)
                              .split("")
                              .reduce((acc, c) => acc + c.charCodeAt(0), 0);
                            const hashB = (q.id + b.content)
                              .split("")
                              .reduce((acc, c) => acc + c.charCodeAt(0), 0);
                            return hashA - hashB;
                          });

                          const labels = ["A", "B", "C", "D"];
                          return shuffled.map((ans, idx) => (
                            <div
                              key={idx}
                              className={`exam-option ${showCorrectAnswers && ans.isCorrect ? "correct-marked" : ""}`}
                            >
                              <span className="option-label">
                                {labels[idx]}.
                              </span>
                              <span className="option-content">
                                <MathRenderer content={ans.content} />
                              </span>
                              {showCorrectAnswers && ans.isCorrect && (
                                <span className="correct-icon">✓</span>
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    </>
                  )}
                </div>
              );
              })
            )}
          </div>
        </div>
      )}

      {bankModalOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#fff", padding: "24px", borderRadius: "16px", width: "700px", maxWidth: "90%", maxHeight: "85vh",
            display: "flex", flexDirection: "column", boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Chọn câu hỏi thay thế</h3>
              <button className="btn btn-secondary btn-xs" onClick={() => { setBankModalOpen(false); setQToReplace(null); }}>Đóng</button>
            </div>
            
            <p className="muted" style={{ marginBottom: "16px" }}>
              Đang lọc theo: <strong>{qToReplace?.lessonName || "Bài học"}</strong> • <strong>{qToReplace?.cognitiveLevelName || "Mức độ"}</strong>
            </p>

            <div style={{ overflowY: "auto", flex: 1, paddingRight: "8px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {loadingBank ? (
                <div style={{ textAlign: "center", padding: "3rem" }} className="muted">
                  <RefreshCw className="spin" size={24} style={{ marginBottom: "10px" }} />
                  <br />Đang tải dữ liệu...
                </div>
              ) : bankQuestions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", background: "rgba(0,0,0,0.03)", borderRadius: "12px" }} className="muted">
                  Ngân hàng không còn câu hỏi nào phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                bankQuestions.map((bq, i) => (
                  <div key={bq.id} style={{ padding: "12px", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", background: "rgba(255,255,255,0.8)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontWeight: 600, marginBottom: "8px", fontSize: "0.95rem" }}>
                          <MathRenderer content={bq.questionText} />
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--ds-success-text)", marginBottom: "4px" }}>
                          ✓ <MathRenderer content={bq.correctAnswer} />
                        </div>
                      </div>
                      <button className="btn btn-primary" onClick={() => handleSelectFromBank(bq)}>
                        Chọn
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .create-exam-page { max-width: 1200px; margin: 0 auto; }

        .steps { display: flex; justify-content: center; align-items: center; gap: 12px; padding: 1.25rem; border-radius: 16px; margin-bottom: 1.5rem; }
        .s { display: flex; align-items: center; gap: 10px; opacity: 0.55; font-weight: 700; }
        .s.active { opacity: 1; color: var(--color-accent-1); }
        .n { width: 32px; height: 32px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; }
        .s.active .n { background: var(--color-accent-1); color: white; }
        .line { width: 46px; height: 2px; background: rgba(0,0,0,0.08); }

        .panel { padding: 1.5rem; border-radius: 16px; }
        h2 { margin: 0 0 1rem; display: flex; align-items: center; gap: 8px; }
        h3 { margin: 0 0 0.75rem; }
        .muted { color: var(--color-text-secondary); }
        .divider { height: 1px; background: rgba(0,0,0,0.06); margin: 1.25rem 0; }

        .row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 980px) { .row3, .row2 { grid-template-columns: 1fr; } }

        /* Matrix selection */
        .matrix-select-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.75rem; margin-bottom: 0.5rem; }
        .matrix-card { padding: 1rem; border-radius: 14px; background: rgba(255,255,255,0.6); border: 2px solid rgba(0,0,0,0.07); cursor: pointer; transition: all 0.18s; position: relative; }
        .matrix-card:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.04); }
        .matrix-card.selected { border-color: var(--ds-primary); background: rgba(99,102,241,0.08); }
        .mc-check { position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; border-radius: 50%; background: var(--ds-primary); color: white; display: flex; align-items: center; justify-content: center; }
        .mc-name { font-weight: 700; margin-bottom: 4px; font-size: 0.95rem; }
        .mc-meta { font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .mc-levels { display: flex; flex-wrap: wrap; gap: 4px; }
        .mc-level-tag { padding: 2px 8px; border-radius: 999px; background: rgba(99,102,241,0.1); color: #4338ca; font-size: 0.75rem; font-weight: 600; }
        .badge-default { padding: 2px 8px; border-radius: 999px; background: rgba(16,185,129,0.1); color: var(--ds-success-text); font-size: 0.72rem; font-weight: 700; }
        .matrix-empty-notice { padding: 2rem; border-radius: 14px; background: rgba(255,255,255,0.45); border: 1px dashed rgba(0,0,0,0.12); text-align: center; color: var(--color-text-secondary); }
        .matrix-empty-notice p { margin: 0.75rem 0 1rem; }

        /* Matrix summary */
        .matrix-summary-box { background: rgba(99,102,241,0.04); border: 1px solid rgba(99,102,241,0.15); border-radius: 14px; padding: 1rem 1.25rem; margin-bottom: 0.5rem; }
        .summary-row { display: flex; gap: 1rem; padding: 0.35rem 0; border-bottom: 1px solid rgba(0,0,0,0.04); font-size: 0.9rem; }
        .summary-row:last-child { border: none; }
        .summary-row span { color: var(--color-text-secondary); min-width: 150px; }
        .summary-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .summary-table th { background: rgba(99,102,241,0.06); padding: 0.5rem 0.75rem; text-align: left; font-size: 0.8rem; color: var(--color-text-secondary); }
        .summary-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(0,0,0,0.04); }

        .field { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 6px; font-weight: 700; font-size: 0.9rem; }
        input, select { width: 100%; padding: 0.75rem; border-radius: 10px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.8); }

        .lesson-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; }
        .lesson-pill { display: flex; gap: 10px; align-items: center; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.5); border: 1px solid rgba(0,0,0,0.06); cursor: pointer; }
        .lesson-pill.on { border-color: rgba(99,102,241,0.35); background: rgba(99,102,241,0.06); }
        .lesson-pill input { width: auto; }

        .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1rem; flex-wrap: wrap; }
        .actions.space { justify-content: space-between; }

        .box { padding: 1rem; border-radius: 14px; background: rgba(255,255,255,0.45); border: 1px solid rgba(0,0,0,0.06); }
        .dist-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; }
        .dist-name { font-weight: 600; }
        .dist-input { width: 110px; }
        .dist-footer { margin-top: 10px; font-weight: 700; }

        .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 1rem; }

        .q-list { display: flex; flex-direction: column; gap: 12px; min-height: 200px; padding-bottom: 60px; }
        .q-item { padding: 1rem; border-radius: 14px; background: rgba(255,255,255,0.5); border: 2px solid rgba(0,0,0,0.06); transition: border-color 0.15s, opacity 0.15s; }
        .q-item[draggable="true"] { user-select: none; -webkit-user-select: none; }
        .q-item[draggable="true"] * { user-select: none; -webkit-user-select: none; }
        .q-item[draggable="true"] img { pointer-events: none; }
        .q-item[draggable="true"]:hover { border-color: rgba(0,0,0,0.12); }
        .q-item.is-dragging { opacity: 0.35; border: 2px dashed rgba(0,0,0,0.2); }
        .q-item.drag-over-top { border-top: 3px solid var(--color-accent-1); }
        .q-item.drag-over-bottom { border-bottom: 3px solid var(--color-accent-1); }
        .q-top { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 6px; justify-content: space-between; }
        .q-num { font-weight: 800; }
        .q-meta { font-size: 0.9rem; margin-bottom: 8px; }
        .q-text { font-size: 0.98rem; }
        .q-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .btn-xs { padding: 6px 8px; border-radius: 10px; }
        .danger { border-color: rgba(239,68,68,0.35); color: var(--ds-error); }

        /* ── Professional Action Buttons ── */
        .btn-action {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px; border: 1.5px solid;
          font-size: 0.82rem; font-weight: 600; cursor: pointer;
          background: transparent; transition: all 0.2s ease;
          white-space: nowrap;
        }
        .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-action:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.08); }

        .btn-action-edit { color: #475569; border-color: rgba(71,85,105,0.25); background: rgba(71,85,105,0.04); }
        .btn-action-edit:hover:not(:disabled) { background: rgba(71,85,105,0.1); border-color: rgba(71,85,105,0.4); }

        .btn-action-ai { color: #6366f1; border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.05); }
        .btn-action-ai:hover:not(:disabled) { background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.5); }

        .btn-action-bank { color: #0ea5e9; border-color: rgba(14,165,233,0.3); background: rgba(14,165,233,0.05); }
        .btn-action-bank:hover:not(:disabled) { background: rgba(14,165,233,0.12); border-color: rgba(14,165,233,0.5); }

        .btn-action-save { color: #10b981; border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.05); }
        .btn-action-save:hover:not(:disabled) { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.5); }

        .btn-action-delete { color: #ef4444; border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.04); }
        .btn-action-delete:hover:not(:disabled) { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.45); }

        @media (max-width: 768px) {
          .btn-action { padding: 6px 10px; font-size: 0.78rem; }
          .btn-action-label { display: none; }
        }

        .badge { padding: 4px 8px; border-radius: 999px; font-size: 0.75rem; font-weight: 800; }
        .badge.ai { background: rgba(99,102,241,0.12); color: var(--color-accent-1); }
        .badge.bank { background: rgba(17,24,39,0.1); color: #111827; }

        /* Hide specific elements during PDF Export */
        .pdf-only-header { display: none; }
        
        .pdf-exporting .q-actions, 
        .pdf-exporting .badge,
        .pdf-exporting .GripVertical,
        .pdf-exporting .q-meta { display: none !important; }
        .pdf-exporting.q-list { gap: 12px !important; padding: 20px !important; color: black !important; }
        .pdf-exporting .pdf-only-header { display: block !important; }
        
        .pdf-exporting .q-item { 
          border: none !important; 
          box-shadow: none !important; 
          background: white !important; 
          padding: 0 !important; 
          margin-bottom: 15px !important; 
          page-break-inside: avoid; 
        }
        
        /* Exam content styling for PDF */
        .pdf-exporting .q-top { margin-bottom: 2px !important; }
        .pdf-exporting .q-num { font-weight: bold !important; font-size: 16px !important; color: black !important; }
        .pdf-exporting .q-text { font-size: 16px !important; color: black !important; margin-bottom: 8px !important; }
        .pdf-exporting .exam-answers { margin-top: 0 !important; gap: 4px !important; }
        .pdf-exporting .exam-option { background: none !important; border: none !important; padding: 2px 0 !important; font-size: 15px !important; color: black !important; }
        .pdf-exporting .option-label { color: black !important; font-weight: bold !important; }
        .pdf-exporting .correct-icon { display: none !important; }
        .pdf-exporting .exam-option.correct-marked { font-weight: bold !important; }
        .pdf-exporting .exam-option.correct-marked .option-label,
        .pdf-exporting .exam-option.correct-marked .option-content * { 
          color: var(--ds-warning-text) !important; 
          font-weight: bold !important; 
          text-decoration: underline !important; 
        }
        .pdf-exporting .option-content {
          min-width: 0 !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }

        .answers { margin-top: 10px; display: grid; gap: 6px; }
        .a { padding: 8px 10px; border-radius: 12px; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.06); }
        .a.correct { border-color: rgba(16,185,129,0.35); }
        .a.wrong { border-color: rgba(239,68,68,0.2); }
        .explain { margin-top: 10px; }

        /* Exam-style answers A B C D */
        .exam-answers { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
        @media (max-width: 768px) { .exam-answers { grid-template-columns: minmax(0, 1fr); } }
        .exam-option { display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.08); transition: all 0.2s; min-width: 0; }
        .exam-option.correct-marked { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.4); }
        .option-label { font-weight: 700; color: var(--color-accent-1); min-width: 20px; flex-shrink: 0; }
        .option-content { flex: 1; min-width: 0; word-break: break-word; overflow-wrap: break-word; }
        .correct-icon { color: var(--ds-success); font-weight: 700; margin-left: auto; }
        .toggle-label { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; cursor: pointer; }
        .toggle-label input { width: auto; cursor: pointer; }

        .edit-box textarea { width: 100%; min-height: 90px; padding: 0.75rem; border-radius: 10px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.8); }
        .edit-box .rich-text-editor .ql-editor { min-height: 80px; }
        .edit-box label { margin-top: 1rem; }
        .edit-box label:first-child { margin-top: 0; }
        .wrong-answers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
        .wrong-answers-grid .rich-text-editor .ql-editor { min-height: 60px; }
        @media (max-width: 980px) { .wrong-answers-grid { grid-template-columns: 1fr; } }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
    </div>
  );
};

export default ExamGenerator;
