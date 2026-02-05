import { useEffect, useState } from 'react';
import { FileText, BookOpen, Layers, Save, Upload, Sparkles, FileUp, Copy, Edit2, Trash2, Check, X, Eye } from 'lucide-react';
import { knowledgeService } from '../../services/knowledgeService';
import { questionBankService } from '../../services/questionBankService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import RichTextEditor from '../../components/common/RichTextEditor';
import MathRenderer from '../../components/common/MathRenderer';

const GRADE_OPTIONS = [10, 11, 12];

const QUESTION_TYPES = [
    { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm' },
    { value: 'TRUE_FALSE', label: 'Đúng/Sai' },
    { value: 'FILL_BLANK', label: 'Điền khuyết' },
];

// Cognitive levels will be loaded from API

const CreateQuestion = () => {
    const [activeTab, setActiveTab] = useState('manual'); // manual, import, ai-resource, ai-variation

    // Common: Knowledge structure picker
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [subjectId, setSubjectId] = useState('');
    const [gradeLevel, setGradeLevel] = useState(10);

    const [loadingChapters, setLoadingChapters] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [chapterId, setChapterId] = useState('');

    const [loadingLessons, setLoadingLessons] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [lessonId, setLessonId] = useState('');

    // Tab 1: Manual
    const [questionText, setQuestionText] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [explanation, setExplanation] = useState('');
    const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
    const [cognitiveLevelId, setCognitiveLevelId] = useState(null);
    const [cognitiveLevels, setCognitiveLevels] = useState([]);
    const [loadingCognitiveLevels, setLoadingCognitiveLevels] = useState(false);

    // Tab 2: Import from template file (Excel/PDF)
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
    const [selectedResourceId, setSelectedResourceId] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([]);
    const [showAiResourcePreview, setShowAiResourcePreview] = useState(false);
    const [savingAiResource, setSavingAiResource] = useState(false);
    const [editingAiQuestionIndex, setEditingAiQuestionIndex] = useState(null);

    // Tab 4: AI variation from existing questions
    const [existingQuestions, setExistingQuestions] = useState([]);
    const [loadingExistingQuestions, setLoadingExistingQuestions] = useState(false);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [numberOfVariations, setNumberOfVariations] = useState(3);
    const [variationGenerating, setVariationGenerating] = useState(false);
    const [variationGroups, setVariationGroups] = useState([]);
    const [showVariationPreview, setShowVariationPreview] = useState(false);
    const [savingVariation, setSavingVariation] = useState(false);
    const [editingVariationIndex, setEditingVariationIndex] = useState(null);
    const [editingGroupIndex, setEditingGroupIndex] = useState(null);

    // Tab 5: AI from URL
    const [urlInput, setUrlInput] = useState('');
    const [urlNumberOfQuestions, setUrlNumberOfQuestions] = useState(5);
    const [urlGenerating, setUrlGenerating] = useState(false);
    const [urlGeneratedQuestions, setUrlGeneratedQuestions] = useState([]);
    const [showUrlPreview, setShowUrlPreview] = useState(false);
    const [savingUrlQuestions, setSavingUrlQuestions] = useState(false);
    const [editingUrlQuestionIndex, setEditingUrlQuestionIndex] = useState(null);

    const loadSubjects = async () => {
        setLoadingSubjects(true);
        try {
            const data = await knowledgeService.getSubjects();
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setSubjects(list);
            if (!subjectId && list.length > 0) setSubjectId(String(list[0].id));
        } catch (e) {
            setSubjects([]);
            showErrorToast('Không tải được danh sách môn học');
        } finally {
            setLoadingSubjects(false);
        }
    };

    const loadChapters = async (sid, grade) => {
        if (!sid) return;
        setLoadingChapters(true);
        try {
            const data = await knowledgeService.getChaptersBySubject(sid, grade);
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setChapters(list);
            setChapterId(list.length ? String(list[0].id) : '');
        } catch (e) {
            setChapters([]);
            setChapterId('');
        } finally {
            setLoadingChapters(false);
        }
    };

    const loadLessons = async (cid) => {
        if (!cid) return;
        setLoadingLessons(true);
        try {
            const data = await knowledgeService.getLessonsByChapter(cid);
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setLessons(list);
            setLessonId(list.length ? String(list[0].id) : '');
        } catch (e) {
            setLessons([]);
            setLessonId('');
        } finally {
            setLoadingLessons(false);
        }
    };

    const loadResources = async (lid) => {
        if (!lid) return;
        setLoadingResources(true);
        try {
            const data = await knowledgeService.getResourcesByLesson(lid);
            const list = Array.isArray(data) ? data : data?.data ?? [];
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
        if (subjectId) loadChapters(subjectId, gradeLevel);
    }, [subjectId, gradeLevel]);

    useEffect(() => {
        if (chapterId) loadLessons(chapterId);
    }, [chapterId]);

    useEffect(() => {
        if (lessonId && activeTab === 'ai-resource') {
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
            showErrorToast('Không tải được danh sách mức độ nhận thức');
        } finally {
            setLoadingCognitiveLevels(false);
        }
    };

    // Tab 1: Manual - Xác nhận trước khi lưu
    const handleConfirmManual = () => {
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        if (!questionText.trim() || !correctAnswer.trim()) return showErrorToast('Vui lòng nhập câu hỏi và đáp án đúng');
        if (!cognitiveLevelId) return showErrorToast('Vui lòng chọn mức độ nhận thức');
        
        // Hiển thị preview để xác nhận
        setShowManualPreview(true);
    };

    // Tab 1: Manual - Hủy xác nhận, quay lại chỉnh sửa
    const handleCancelManualPreview = () => {
        setShowManualPreview(false);
    };

    // Tab 1: Manual save - Lưu vào database sau khi đã xác nhận
    const handleSaveManual = async () => {
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        if (!questionText.trim() || !correctAnswer.trim()) return showErrorToast('Vui lòng nhập câu hỏi và đáp án đúng');
        if (!cognitiveLevelId) return showErrorToast('Vui lòng chọn mức độ nhận thức');
        
        setSavingManual(true);
        try {
            const data = {
                lessonId: Number(lessonId),
                questionText: questionText.trim(),
                correctAnswer: correctAnswer.trim(),
                explanation: explanation.trim() || null,
                questionType: questionType,
                cognitiveLevelId: cognitiveLevelId,
                sourceType: 'MANUAL'
            };
            await questionBankService.createQuestion(data);
            showSuccessToast('Đã lưu câu hỏi thành công');
            // Reset form
            setQuestionText('');
            setCorrectAnswer('');
            setExplanation('');
            setShowManualPreview(false);
        } catch (e) {
            showErrorToast('Lỗi lưu câu hỏi: ' + (e?.response?.data?.message || e?.message || 'Không xác định'));
        } finally {
            setSavingManual(false);
        }
    };

    // Tab 2: Import from template file (Excel/PDF) - Backend parse, no AI
    const handleImportFile = async () => {
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        if (!importFile) return showErrorToast('Vui lòng chọn file');
        setImporting(true);
        try {
            const response = await questionBankService.importFromExcel(importFile, Number(lessonId));
            const questions = response.questions || [];
            // Map to include cognitiveLevelId (default to first if available)
            const mappedQuestions = questions.map(q => ({
                ...q,
                cognitiveLevelId: q.cognitiveLevelId || (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null)
            }));
            setImportedQuestions(mappedQuestions);
            if (response.errors && response.errors.length > 0) {
                showErrorToast(`Import thành công ${response.validRows} câu, có ${response.errors.length} lỗi`);
            } else {
                showSuccessToast(`Đã import được ${response.validRows} câu hỏi từ template`);
            }
        } catch (e) {
            showErrorToast('Import thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi không xác định'));
        } finally {
            setImporting(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            await questionBankService.downloadTemplate();
            showSuccessToast('Đã tải template thành công');
        } catch (e) {
            showErrorToast('Tải template thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi không xác định'));
        }
    };

    const handleEditImportedQuestion = (index) => {
        setEditingQuestionIndex(index);
    };

    const handleSaveImportedQuestion = (index, updated) => {
        const newList = [...importedQuestions];
        newList[index] = { ...newList[index], ...updated };
        setImportedQuestions(newList);
        setEditingQuestionIndex(null);
        showSuccessToast('Đã cập nhật câu hỏi');
    };

    // Show import preview
    const handleShowImportPreview = () => {
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        if (importedQuestions.length === 0) return showErrorToast('Chưa có câu hỏi để xem trước');
        setShowImportPreview(true);
    };

    const handleSaveAllImported = async () => {
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        if (importedQuestions.length === 0) return showErrorToast('Chưa có câu hỏi để lưu');
        setSavingImported(true);
        try {
            const questions = importedQuestions.map(q => ({
                lessonId: Number(lessonId),
                questionText: q.questionText || '',
                correctAnswer: q.correctAnswer || '',
                explanation: q.explanation || null,
                questionType: q.questionType || 'MULTIPLE_CHOICE',
                cognitiveLevelId: q.cognitiveLevelId || (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null),
                sourceType: 'IMPORTED'
            }));
            await questionBankService.createQuestionsBatch(questions);
            showSuccessToast('Đã lưu ' + importedQuestions.length + ' câu hỏi vào ngân hàng');
            setImportedQuestions([]);
            setShowImportPreview(false);
        } catch (e) {
            showErrorToast('Lưu thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi không xác định'));
        } finally {
            setSavingImported(false);
        }
    };

    const handleDeleteImportedQuestion = (index) => {
        setImportedQuestions(importedQuestions.filter((_, i) => i !== index));
        showSuccessToast('Đã xóa câu hỏi');
    };

    // Tab 3: AI from resource
    const [aiNumberOfQuestions, setAiNumberOfQuestions] = useState(5);
    
    const handleGenerateFromResource = async () => {
        if (!selectedResourceId) return showErrorToast('Vui lòng chọn tài nguyên');
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        
        setAiGenerating(true);
        try {
            const response = await questionBankService.generateFromResource({
                resourceId: Number(selectedResourceId),
                lessonId: Number(lessonId),
                numberOfQuestions: aiNumberOfQuestions,
                questionType: 'MULTIPLE_CHOICE',
                aiProvider: 'DEEPSEEK'
            });
            
            // Map AI response to local format
            const mappedQuestions = response.generatedQuestions.map(q => {
                // Find cognitive level ID from name
                const cogLevel = cognitiveLevels.find(l => 
                    l.level.toLowerCase().includes(q.cognitiveLevel?.toLowerCase() || '')
                );
                
                return {
                    questionText: q.questionText || '',
                    correctAnswer: q.correctAnswer || '',
                    explanation: q.explanation || '',
                    wrongAnswers: q.wrongAnswers || [],
                    questionType: q.questionType || 'MULTIPLE_CHOICE',
                    cognitiveLevelId: cogLevel?.id || (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null)
                };
            });
            
            setAiGeneratedQuestions(mappedQuestions);
            showSuccessToast(`Đã tạo ${mappedQuestions.length} câu hỏi từ AI (${response.tokensUsed} tokens, ${response.generationTimeMs}ms)`);
        } catch (e) {
            console.error('AI generate error:', e);
            showErrorToast('AI generate thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi không xác định'));
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
        showSuccessToast('Đã cập nhật câu hỏi');
    };

    const handleDeleteAiQuestion = (index) => {
        setAiGeneratedQuestions(aiGeneratedQuestions.filter((_, i) => i !== index));
        showSuccessToast('Đã xóa câu hỏi');
    };

    const handleShowAiResourcePreview = () => {
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        if (aiGeneratedQuestions.length === 0) return showErrorToast('Chưa có câu hỏi để xem trước');
        setShowAiResourcePreview(true);
    };

    const handleSaveAiResourceQuestions = async () => {
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        if (aiGeneratedQuestions.length === 0) return showErrorToast('Chưa có câu hỏi để lưu');
        setSavingAiResource(true);
        try {
            const questions = aiGeneratedQuestions.map(q => ({
                lessonId: Number(lessonId),
                questionText: q.questionText || '',
                correctAnswer: q.correctAnswer || '',
                explanation: q.explanation || null,
                questionType: q.questionType || 'MULTIPLE_CHOICE',
                cognitiveLevelId: q.cognitiveLevelId || (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null),
                sourceType: 'AI_GENERATED'
            }));
            await questionBankService.createQuestionsBatch(questions);
            showSuccessToast('Đã lưu ' + aiGeneratedQuestions.length + ' câu hỏi vào ngân hàng');
            setAiGeneratedQuestions([]);
            setShowAiResourcePreview(false);
        } catch (e) {
            showErrorToast('Lưu thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi không xác định'));
        } finally {
            setSavingAiResource(false);
        }
    };

    // Tab 4: AI variation
    const handleGenerateVariation = async () => {
        if (selectedQuestionIds.length === 0) {
            return showErrorToast('Vui lòng chọn ít nhất 1 câu hỏi để tạo biến thể');
        }
        setVariationGenerating(true);
        try {
            const response = await questionBankService.generateVariations({
                baseQuestionIds: selectedQuestionIds,
                numberOfVariations: numberOfVariations,
                aiProvider: 'DEEPSEEK'
            });
            
            // Map response to local format with cognitive level IDs
            const mappedGroups = response.variationGroups.map(group => {
                const mappedVariations = group.variations.map(v => {
                    const cogLevel = cognitiveLevels.find(l => 
                        l.level.toLowerCase().includes(v.cognitiveLevel?.toLowerCase() || '')
                    );
                    return {
                        questionText: v.questionText || '',
                        correctAnswer: v.correctAnswer || '',
                        explanation: v.explanation || '',
                        wrongAnswers: v.wrongAnswers || [],
                        questionType: v.questionType || 'MULTIPLE_CHOICE',
                        cognitiveLevelId: cogLevel?.id || (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null)
                    };
                });
                return {
                    baseQuestionId: group.baseQuestionId,
                    baseQuestionText: group.baseQuestionText,
                    variations: mappedVariations
                };
            });
            
            setVariationGroups(mappedGroups);
            const totalVariations = mappedGroups.reduce((sum, g) => sum + g.variations.length, 0);
            showSuccessToast(`Đã tạo ${totalVariations} biến thể từ AI (${response.tokensUsed} tokens, ${response.generationTimeMs}ms)`);
        } catch (e) {
            console.error('AI variation error:', e);
            showErrorToast('AI generate thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi không xác định'));
        } finally {
            setVariationGenerating(false);
        }
    };

    const loadExistingQuestions = async () => {
        if (!lessonId) return;
        setLoadingExistingQuestions(true);
        try {
            const data = await questionBankService.getQuestions({ lessonId: Number(lessonId) });
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setExistingQuestions(list);
        } catch (e) {
            setExistingQuestions([]);
            showErrorToast('Không tải được danh sách câu hỏi');
        } finally {
            setLoadingExistingQuestions(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'ai-variation' && lessonId) {
            loadExistingQuestions();
        }
    }, [activeTab, lessonId]);

    const handleToggleQuestionSelection = (questionId) => {
        setSelectedQuestionIds(prev => 
            prev.includes(questionId) 
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const handleSelectAllQuestions = () => {
        if (selectedQuestionIds.length === existingQuestions.length) {
            setSelectedQuestionIds([]);
        } else {
            setSelectedQuestionIds(existingQuestions.map(q => q.id));
        }
    };

    const handleEditVariationInGroup = (groupIdx, varIdx) => {
        setEditingGroupIndex(groupIdx);
        setEditingVariationIndex(varIdx);
    };

    const handleSaveVariationInGroup = (groupIdx, varIdx, updated) => {
        const newGroups = [...variationGroups];
        newGroups[groupIdx].variations[varIdx] = { ...newGroups[groupIdx].variations[varIdx], ...updated };
        setVariationGroups(newGroups);
        setEditingGroupIndex(null);
        setEditingVariationIndex(null);
        showSuccessToast('Đã cập nhật biến thể');
    };

    const handleDeleteVariationInGroup = (groupIdx, varIdx) => {
        const newGroups = [...variationGroups];
        newGroups[groupIdx].variations = newGroups[groupIdx].variations.filter((_, i) => i !== varIdx);
        // Remove group if no variations left
        if (newGroups[groupIdx].variations.length === 0) {
            newGroups.splice(groupIdx, 1);
        }
        setVariationGroups(newGroups);
        showSuccessToast('Đã xóa biến thể');
    };

    const handleShowVariationPreview = () => {
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        const totalVariations = variationGroups.reduce((sum, g) => sum + g.variations.length, 0);
        if (totalVariations === 0) return showErrorToast('Chưa có biến thể để xem trước');
        setShowVariationPreview(true);
    };

    const handleSaveVariationQuestions = async () => {
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        const allVariations = variationGroups.flatMap(g => g.variations);
        if (allVariations.length === 0) return showErrorToast('Chưa có biến thể để lưu');
        setSavingVariation(true);
        try {
            const questions = allVariations.map(q => ({
                lessonId: Number(lessonId),
                questionText: q.questionText || '',
                correctAnswer: q.correctAnswer || '',
                explanation: q.explanation || null,
                questionType: q.questionType || 'MULTIPLE_CHOICE',
                cognitiveLevelId: q.cognitiveLevelId || (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null),
                sourceType: 'AI_GENERATED'
            }));
            await questionBankService.createQuestionsBatch(questions);
            showSuccessToast('Đã lưu ' + allVariations.length + ' biến thể vào ngân hàng');
            setVariationGroups([]);
            setShowVariationPreview(false);
            setSelectedQuestionIds([]);
            loadExistingQuestions(); // Refresh the list
        } catch (e) {
            showErrorToast('Lưu thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi không xác định'));
        } finally {
            setSavingVariation(false);
        }
    };

    // Tab 5: AI from URL
    const handleGenerateFromUrl = async () => {
        if (!urlInput.trim()) return showErrorToast('Vui lòng nhập URL');
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        
        // Basic URL validation
        try {
            new URL(urlInput);
        } catch {
            return showErrorToast('URL không hợp lệ');
        }
        
        setUrlGenerating(true);
        try {
            const response = await questionBankService.generateFromUrl({
                url: urlInput.trim(),
                lessonId: Number(lessonId),
                numberOfQuestions: urlNumberOfQuestions,
                aiProvider: 'DEEPSEEK'
            });
            
            // Map AI response to local format
            const mappedQuestions = response.generatedQuestions.map(q => {
                const cogLevel = cognitiveLevels.find(l => 
                    l.level.toLowerCase().includes(q.cognitiveLevel?.toLowerCase() || '')
                );
                return {
                    questionText: q.questionText || '',
                    correctAnswer: q.correctAnswer || '',
                    explanation: q.explanation || '',
                    wrongAnswers: q.wrongAnswers || [],
                    questionType: q.questionType || 'MULTIPLE_CHOICE',
                    cognitiveLevelId: cogLevel?.id || (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null)
                };
            });
            
            setUrlGeneratedQuestions(mappedQuestions);
            showSuccessToast(`Đã tạo ${mappedQuestions.length} câu hỏi từ URL (${response.tokensUsed} tokens, ${response.generationTimeMs}ms)`);
        } catch (e) {
            console.error('AI URL generate error:', e);
            showErrorToast('AI generate thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi không xác định'));
        } finally {
            setUrlGenerating(false);
        }
    };

    const handleEditUrlQuestion = (index) => {
        setEditingUrlQuestionIndex(index);
    };

    const handleSaveUrlQuestion = (index, updated) => {
        const newList = [...urlGeneratedQuestions];
        newList[index] = { ...newList[index], ...updated };
        setUrlGeneratedQuestions(newList);
        setEditingUrlQuestionIndex(null);
        showSuccessToast('Đã cập nhật câu hỏi');
    };

    const handleDeleteUrlQuestion = (index) => {
        setUrlGeneratedQuestions(urlGeneratedQuestions.filter((_, i) => i !== index));
        showSuccessToast('Đã xóa câu hỏi');
    };

    const handleShowUrlPreview = () => {
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        if (urlGeneratedQuestions.length === 0) return showErrorToast('Chưa có câu hỏi để xem trước');
        setShowUrlPreview(true);
    };

    const handleSaveUrlQuestions = async () => {
        if (!lessonId) return showErrorToast('Vui lòng chọn bài học');
        if (urlGeneratedQuestions.length === 0) return showErrorToast('Chưa có câu hỏi để lưu');
        setSavingUrlQuestions(true);
        try {
            const questions = urlGeneratedQuestions.map(q => ({
                lessonId: Number(lessonId),
                questionText: q.questionText || '',
                correctAnswer: q.correctAnswer || '',
                explanation: q.explanation || null,
                questionType: q.questionType || 'MULTIPLE_CHOICE',
                cognitiveLevelId: q.cognitiveLevelId || (cognitiveLevels.length > 0 ? cognitiveLevels[0].id : null),
                sourceType: 'AI_GENERATED'
            }));
            await questionBankService.createQuestionsBatch(questions);
            showSuccessToast('Đã lưu ' + urlGeneratedQuestions.length + ' câu hỏi vào ngân hàng');
            setUrlGeneratedQuestions([]);
            setShowUrlPreview(false);
            setUrlInput('');
        } catch (e) {
            showErrorToast('Lưu thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi không xác định'));
        } finally {
            setSavingUrlQuestions(false);
        }
    };

    return (
        <div className="create-question-page">
            <div className="page-header">
                <div>
                    <h2><FileText size={22} /> Tạo question</h2>
                    <p>Chọn phương thức tạo câu hỏi phù hợp với nhu cầu của bạn.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs glass">
                <button
                    className={`tab ${activeTab === 'manual' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manual')}
                >
                    <FileText size={18} /> Nhập tay
                </button>
                <button
                    className={`tab ${activeTab === 'import' ? 'active' : ''}`}
                    onClick={() => setActiveTab('import')}
                >
                    <FileUp size={18} /> Import từ file
                </button>
                <button
                    className={`tab ${activeTab === 'ai-resource' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ai-resource')}
                >
                    <Sparkles size={18} /> AI từ tài nguyên
                </button>
                <button
                    className={`tab ${activeTab === 'ai-variation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ai-variation')}
                >
                    <Copy size={18} /> AI biến thể
                </button>
                <button
                    className={`tab ${activeTab === 'ai-url' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ai-url')}
                >
                    <Sparkles size={18} /> AI từ URL
                </button>
            </div>

            {/* Common: Knowledge structure picker */}
            <div className="knowledge-picker glass">
                <h3><BookOpen size={18} /> Chọn môn học, khối, chương, bài học</h3>
                <div className="row">
                    <div className="field">
                        <label>Môn học</label>
                        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={loadingSubjects}>
                            {subjects.map((s) => (
                                <option key={s.id} value={String(s.id)}>
                                    {s.subjectCode} {s.description ? `- ${s.description}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Khối</label>
                        <select value={gradeLevel} onChange={(e) => setGradeLevel(Number(e.target.value))}>
                            {GRADE_OPTIONS.map((g) => (
                                <option key={g} value={g}>Khối {g}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="field">
                        <label>Chương</label>
                        <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} disabled={loadingChapters || !chapters.length}>
                            {chapters.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                    Chương {c.chapterNumber}: {c.chapterName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Bài học</label>
                        <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} disabled={loadingLessons || !lessons.length}>
                            {lessons.map((l) => (
                                <option key={l.id} value={String(l.id)}>
                                    Bài {l.lessonNumber}: {l.lessonName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tab 1: Manual */}
            {activeTab === 'manual' && (
                <div className="tab-content glass">
                    {!showManualPreview ? (
                        // Form nhập liệu
                        <>
                            <h3><FileText size={18} /> Nhập câu hỏi bằng tay</h3>
                            <div className="field">
                                <label>Nội dung câu hỏi</label>
                                <RichTextEditor
                                    value={questionText}
                                    onChange={setQuestionText}
                                    placeholder="Nhập nội dung câu hỏi..."
                                />
                                <small className="muted">Gợi ý: có thể dùng LaTeX dạng $...$ để render công thức toán, hoặc click vào biểu tượng fx để chèn công thức.</small>
                            </div>
                            <div className="field">
                                <label>Đáp án đúng</label>
                                <RichTextEditor
                                    value={correctAnswer}
                                    onChange={setCorrectAnswer}
                                    placeholder="Nhập đáp án đúng..."
                                />
                            </div>
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
                                    <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                                        {QUESTION_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Mức độ nhận thức</label>
                                    <select 
                                        value={cognitiveLevelId || ''} 
                                        onChange={(e) => setCognitiveLevelId(e.target.value ? Number(e.target.value) : null)}
                                        disabled={loadingCognitiveLevels}
                                    >
                                        <option value="">Chọn mức độ...</option>
                                        {cognitiveLevels.map((l) => (
                                            <option key={l.id} value={l.id}>{l.level}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="actions">
                                <button className="btn btn-primary" onClick={handleConfirmManual} disabled={!lessonId || !questionText.trim() || !correctAnswer.trim() || !cognitiveLevelId}>
                                    <Check size={16} /> Xác nhận
                                </button>
                            </div>
                        </>
                    ) : (
                        // Preview trước khi lưu
                        <>
                            <h3><Eye size={18} /> Xác nhận câu hỏi trước khi lưu</h3>
                            <div className="preview-card">
                                <div className="preview-section">
                                    <label>Môn học - Bài học:</label>
                                    <p>
                                        {subjects.find(s => String(s.id) === subjectId)?.description || '—'} / 
                                        Khối {gradeLevel} / 
                                        {chapters.find(c => String(c.id) === chapterId)?.chapterName || '—'} / 
                                        {lessons.find(l => String(l.id) === lessonId)?.lessonName || '—'}
                                    </p>
                                </div>
                                <div className="preview-section">
                                    <label>Loại câu hỏi:</label>
                                    <span className="question-type-badge">
                                        {QUESTION_TYPES.find(t => t.value === questionType)?.label || questionType}
                                    </span>
                                    <span className="cognitive-badge" style={{ marginLeft: '8px' }}>
                                        {cognitiveLevels.find(l => l.id === cognitiveLevelId)?.level || '—'}
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
                                <button className="btn btn-secondary" onClick={handleCancelManualPreview}>
                                    <Edit2 size={16} /> Chỉnh sửa lại
                                </button>
                                <button className="btn btn-primary" onClick={handleSaveManual} disabled={savingManual}>
                                    {savingManual ? 'Đang lưu...' : <><Save size={16} /> Lưu câu hỏi</>}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Tab 2: Import from template file (Excel/PDF) */}
            {activeTab === 'import' && (
                <div className="tab-content glass">
                    <h3><FileUp size={18} /> Import từ template Excel/PDF</h3>
                    <div className="info-box">
                        <p><strong>Format template:</strong> Câu hỏi | Câu trả lời | Explanation | Dạng câu hỏi</p>
                        <button className="btn-link" onClick={handleDownloadTemplate}>
                            <FileUp size={16} /> Tải template mẫu
                        </button>
                    </div>
                    <div className="field">
                        <label>Upload file template</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                id="import-file"
                                accept=".xlsx,.xls,.pdf"
                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="import-file" className="file-label">
                                {importFile ? importFile.name : 'Choose File'}
                            </label>
                        </div>
                        <small className="muted">Hỗ trợ file Excel (.xlsx, .xls) hoặc PDF. Backend sẽ parse file và trả về danh sách câu hỏi.</small>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleImportFile}
                        disabled={!lessonId || !importFile || importing}
                    >
                        {importing ? 'Đang parse file...' : <><Upload size={16} /> Import và parse file</>}
                    </button>

                    {importedQuestions.length > 0 && (
                        <>
                            {!showImportPreview ? (
                                <div className="imported-questions">
                                    <h4>Danh sách câu hỏi đã import ({importedQuestions.length})</h4>
                                    {importedQuestions.map((q, idx) => (
                                        <div key={idx} className="question-card">
                                            {editingQuestionIndex === idx ? (
                                                <div className="edit-mode">
                                                    <div className="field">
                                                        <label>Câu hỏi</label>
                                                        <RichTextEditor
                                                            value={q.questionText || ''}
                                                            onChange={(value) => {
                                                                const updated = [...importedQuestions];
                                                                updated[idx].questionText = value;
                                                                setImportedQuestions(updated);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="field">
                                                        <label>Đáp án đúng</label>
                                                        <RichTextEditor
                                                            value={q.correctAnswer || ''}
                                                            onChange={(value) => {
                                                                const updated = [...importedQuestions];
                                                                updated[idx].correctAnswer = value;
                                                                setImportedQuestions(updated);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="field">
                                                        <label>Explanation (Giải thích)</label>
                                                        <RichTextEditor
                                                            value={q.explanation || ''}
                                                            onChange={(value) => {
                                                                const updated = [...importedQuestions];
                                                                updated[idx].explanation = value;
                                                                setImportedQuestions(updated);
                                                            }}
                                                            placeholder="Giải thích cho câu hỏi..."
                                                        />
                                                    </div>
                                                    <div className="row">
                                                        <div className="field">
                                                            <label>Dạng câu hỏi</label>
                                                            <select
                                                                value={q.questionType || 'MULTIPLE_CHOICE'}
                                                                onChange={(e) => {
                                                                    const updated = [...importedQuestions];
                                                                    updated[idx].questionType = e.target.value;
                                                                    setImportedQuestions(updated);
                                                                }}
                                                            >
                                                                {QUESTION_TYPES.map((t) => (
                                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="field">
                                                            <label>Mức độ nhận thức</label>
                                                            <select
                                                                value={q.cognitiveLevelId || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...importedQuestions];
                                                                    updated[idx].cognitiveLevelId = e.target.value ? Number(e.target.value) : null;
                                                                    setImportedQuestions(updated);
                                                                }}
                                                                disabled={loadingCognitiveLevels}
                                                            >
                                                                <option value="">Chọn mức độ...</option>
                                                                {cognitiveLevels.map((l) => (
                                                                    <option key={l.id} value={l.id}>{l.level}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="actions">
                                                        <button className="btn btn-sm btn-primary" onClick={() => handleSaveImportedQuestion(idx, q)}>
                                                            Lưu
                                                        </button>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => setEditingQuestionIndex(null)}>
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="question-header">
                                                        <span className="question-number">Câu {idx + 1}</span>
                                                        <span className="question-type-badge">{QUESTION_TYPES.find(t => t.value === q.questionType)?.label || q.questionType}</span>
                                                    </div>
                                                    <div className="question-text">
                                                        <MathRenderer content={q.questionText || '—'} />
                                                    </div>
                                                    <div className="answer-text">
                                                        <strong>Đáp án:</strong> <MathRenderer content={q.correctAnswer || '—'} />
                                                    </div>
                                                    {q.explanation && (
                                                        <div className="explanation-text">
                                                            <strong>Giải thích:</strong> <MathRenderer content={q.explanation} />
                                                        </div>
                                                    )}
                                                    <div className="question-actions">
                                                        <button className="icon-btn" onClick={() => handleEditImportedQuestion(idx)} title="Sửa">
                                                            <Edit2 size={16} /> Sửa
                                                        </button>
                                                        <button className="icon-btn danger" onClick={() => handleDeleteImportedQuestion(idx)} title="Xóa">
                                                            <Trash2 size={16} /> Xóa
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    <div className="actions">
                                        <button className="btn btn-primary" onClick={handleShowImportPreview} disabled={!lessonId || importedQuestions.length === 0}>
                                            <Eye size={16} /> Xác nhận
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="preview-container">
                                    <h4><Eye size={18} /> Xem trước trước khi lưu ({importedQuestions.length} câu hỏi)</h4>
                                    <p className="muted" style={{ marginBottom: '1rem' }}>Kiểm tra lại các câu hỏi trước khi lưu vào ngân hàng câu hỏi.</p>
                                    <div className="preview-questions-list">
                                        {importedQuestions.map((q, idx) => (
                                            <div key={idx} className="preview-card" style={{ marginBottom: '1rem' }}>
                                                <div className="question-header">
                                                    <span className="question-number">Câu {idx + 1}</span>
                                                    <span className="question-type-badge">{QUESTION_TYPES.find(t => t.value === q.questionType)?.label || q.questionType}</span>
                                                    {q.cognitiveLevelId && (
                                                        <span className="cognitive-badge">{cognitiveLevels.find(l => l.id === q.cognitiveLevelId)?.level || ''}</span>
                                                    )}
                                                </div>
                                                <div className="preview-section">
                                                    <label>Câu hỏi</label>
                                                    <div className="preview-content"><MathRenderer content={q.questionText || '—'} /></div>
                                                </div>
                                                <div className="preview-section">
                                                    <label>Đáp án đúng</label>
                                                    <div className="preview-content answer-highlight"><MathRenderer content={q.correctAnswer || '—'} /></div>
                                                </div>
                                                {q.explanation && (
                                                    <div className="preview-section">
                                                        <label>Giải thích</label>
                                                        <div className="preview-content explanation-style"><MathRenderer content={q.explanation} /></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="actions preview-actions">
                                        <button className="btn btn-secondary" onClick={() => setShowImportPreview(false)}>
                                            <Edit2 size={16} /> Quay lại chỉnh sửa
                                        </button>
                                        <button className="btn btn-primary" onClick={handleSaveAllImported} disabled={savingImported}>
                                            {savingImported ? 'Đang lưu...' : <><Save size={16} /> Lưu tất cả ({importedQuestions.length} câu)</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Tab 3: AI from resource */}
            {activeTab === 'ai-resource' && (
                <div className="tab-content glass">
                    <h3><Sparkles size={18} /> AI tự sinh từ tài nguyên</h3>
                    {loadingResources ? (
                        <p className="muted">Đang tải tài nguyên...</p>
                    ) : resources.length === 0 ? (
                        <p className="muted">Chưa có tài nguyên trong bài học này. Vui lòng upload tài nguyên (PDF/DOCX) trước.</p>
                    ) : (
                        <>
                            <div className="row">
                                <div className="field">
                                    <label>Chọn tài nguyên</label>
                                    <select value={selectedResourceId} onChange={(e) => setSelectedResourceId(e.target.value)}>
                                        <option value="">-- Chọn tài nguyên --</option>
                                        {resources.filter(r => r.hasExtractedContent).map((r) => (
                                            <option key={r.id} value={String(r.id)}>
                                                {r.resourceName || '—'} ({r.resourceType})
                                            </option>
                                        ))}
                                    </select>
                                    <small className="muted">Chỉ hiển thị tài nguyên đã được trích xuất nội dung (PDF/DOCX)</small>
                                </div>
                                <div className="field">
                                    <label>Số câu hỏi muốn tạo</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="20" 
                                        value={aiNumberOfQuestions}
                                        onChange={(e) => setAiNumberOfQuestions(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                                    />
                                    <small className="muted">Tối đa 20 câu/lần</small>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={handleGenerateFromResource}
                                disabled={!selectedResourceId || !lessonId || aiGenerating}
                            >
                                {aiGenerating ? 'AI đang xử lý (có thể mất 30-60 giây)...' : <><Sparkles size={16} /> AI tạo {aiNumberOfQuestions} câu hỏi từ tài nguyên</>}
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
                                                                    value={q.questionText || ''}
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
                                                                    value={q.correctAnswer || ''}
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
                                                                    value={q.explanation || ''}
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
                                                                        value={q.questionType || 'MULTIPLE_CHOICE'}
                                                                        onChange={(e) => {
                                                                            const updated = [...aiGeneratedQuestions];
                                                                            updated[idx].questionType = e.target.value;
                                                                            setAiGeneratedQuestions(updated);
                                                                        }}
                                                                    >
                                                                        {QUESTION_TYPES.map((t) => (
                                                                            <option key={t.value} value={t.value}>{t.label}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="field">
                                                                    <label>Mức độ nhận thức</label>
                                                                    <select
                                                                        value={q.cognitiveLevelId || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...aiGeneratedQuestions];
                                                                            updated[idx].cognitiveLevelId = e.target.value ? Number(e.target.value) : null;
                                                                            setAiGeneratedQuestions(updated);
                                                                        }}
                                                                        disabled={loadingCognitiveLevels}
                                                                    >
                                                                        <option value="">Chọn mức độ...</option>
                                                                        {cognitiveLevels.map((l) => (
                                                                            <option key={l.id} value={l.id}>{l.level}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="actions">
                                                                <button className="btn btn-sm btn-primary" onClick={() => handleSaveAiQuestion(idx, q)}>Lưu</button>
                                                                <button className="btn btn-sm btn-secondary" onClick={() => setEditingAiQuestionIndex(null)}>Hủy</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="question-header">
                                                                <span className="question-number">Câu {idx + 1}</span>
                                                                <span className="question-type-badge">{QUESTION_TYPES.find(t => t.value === q.questionType)?.label || q.questionType}</span>
                                                            </div>
                                                            <div className="question-text"><MathRenderer content={q.questionText || '—'} /></div>
                                                            <div className="answer-text"><strong>Đáp án:</strong> <MathRenderer content={q.correctAnswer || '—'} /></div>
                                                            {q.explanation && <div className="explanation-text"><strong>Giải thích:</strong> <MathRenderer content={q.explanation} /></div>}
                                                            <div className="question-actions">
                                                                <button className="icon-btn" onClick={() => handleEditAiQuestion(idx)} title="Sửa"><Edit2 size={16} /> Sửa</button>
                                                                <button className="icon-btn danger" onClick={() => handleDeleteAiQuestion(idx)} title="Xóa"><Trash2 size={16} /> Xóa</button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="actions">
                                                <button className="btn btn-primary" onClick={handleShowAiResourcePreview} disabled={!lessonId || aiGeneratedQuestions.length === 0}>
                                                    <Eye size={16} /> Xác nhận
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="preview-container">
                                            <h4><Eye size={18} /> Xem trước trước khi lưu ({aiGeneratedQuestions.length} câu hỏi)</h4>
                                            <p className="muted" style={{ marginBottom: '1rem' }}>Kiểm tra lại các câu hỏi từ AI trước khi lưu vào ngân hàng câu hỏi.</p>
                                            <div className="preview-questions-list">
                                                {aiGeneratedQuestions.map((q, idx) => (
                                                    <div key={idx} className="preview-card" style={{ marginBottom: '1rem' }}>
                                                        <div className="question-header">
                                                            <span className="question-number">Câu {idx + 1}</span>
                                                            <span className="question-type-badge">{QUESTION_TYPES.find(t => t.value === q.questionType)?.label || q.questionType}</span>
                                                            {q.cognitiveLevelId && <span className="cognitive-badge">{cognitiveLevels.find(l => l.id === q.cognitiveLevelId)?.level || ''}</span>}
                                                        </div>
                                                        <div className="preview-section">
                                                            <label>Câu hỏi</label>
                                                            <div className="preview-content"><MathRenderer content={q.questionText || '—'} /></div>
                                                        </div>
                                                        <div className="preview-section">
                                                            <label>Đáp án đúng</label>
                                                            <div className="preview-content answer-highlight"><MathRenderer content={q.correctAnswer || '—'} /></div>
                                                        </div>
                                                        {q.explanation && (
                                                            <div className="preview-section">
                                                                <label>Giải thích</label>
                                                                <div className="preview-content explanation-style"><MathRenderer content={q.explanation} /></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="actions preview-actions">
                                                <button className="btn btn-secondary" onClick={() => setShowAiResourcePreview(false)}>
                                                    <Edit2 size={16} /> Quay lại chỉnh sửa
                                                </button>
                                                <button className="btn btn-primary" onClick={handleSaveAiResourceQuestions} disabled={savingAiResource}>
                                                    {savingAiResource ? 'Đang lưu...' : <><Save size={16} /> Lưu tất cả ({aiGeneratedQuestions.length} câu)</>}
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
            {activeTab === 'ai-variation' && (
                <div className="tab-content glass">
                    <h3><Copy size={18} /> AI sinh biến thể từ câu hỏi có sẵn</h3>
                    
                    {!lessonId ? (
                        <p className="muted">Vui lòng chọn bài học trước để xem các câu hỏi có sẵn.</p>
                    ) : loadingExistingQuestions ? (
                        <p className="muted">Đang tải câu hỏi...</p>
                    ) : existingQuestions.length === 0 ? (
                        <p className="muted">Chưa có câu hỏi nào trong bài học này. Hãy tạo câu hỏi trước.</p>
                    ) : (
                        <>
                            <div className="existing-questions-selector">
                                <div className="selection-header">
                                    <label>Chọn câu hỏi gốc để tạo biến thể ({selectedQuestionIds.length}/{existingQuestions.length} đã chọn)</label>
                                    <button className="btn btn-sm btn-secondary" onClick={handleSelectAllQuestions}>
                                        {selectedQuestionIds.length === existingQuestions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                    </button>
                                </div>
                                <div className="questions-checkbox-list">
                                    {existingQuestions.map(q => (
                                        <div key={q.id} className={`question-checkbox-item ${selectedQuestionIds.includes(q.id) ? 'selected' : ''}`}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedQuestionIds.includes(q.id)}
                                                    onChange={() => handleToggleQuestionSelection(q.id)}
                                                />
                                                <span className="question-preview">
                                                    <strong>#{q.id}</strong>: {(q.questionText || '').substring(0, 100)}{q.questionText?.length > 100 ? '...' : ''}
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="row" style={{ marginTop: '1rem' }}>
                                <div className="field">
                                    <label>Số biến thể mỗi câu</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={numberOfVariations}
                                        onChange={(e) => setNumberOfVariations(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                                    />
                                    <small className="muted">Tối đa 10 biến thể/câu</small>
                                </div>
                            </div>
                            
                            <button
                                className="btn btn-primary"
                                onClick={handleGenerateVariation}
                                disabled={selectedQuestionIds.length === 0 || variationGenerating}
                            >
                                {variationGenerating ? 'AI đang tạo biến thể (có thể mất 30-60 giây)...' : <><Sparkles size={16} /> Tạo {numberOfVariations} biến thể cho {selectedQuestionIds.length} câu hỏi</>}
                            </button>

                            {variationGroups.length > 0 && (
                                <>
                                    {!showVariationPreview ? (
                                        <div className="variation-groups">
                                            <h4>Kết quả AI ({variationGroups.reduce((sum, g) => sum + g.variations.length, 0)} biến thể)</h4>
                                            {variationGroups.map((group, gIdx) => (
                                                <div key={gIdx} className="variation-group">
                                                    <div className="group-header">
                                                        <strong>Câu gốc #{group.baseQuestionId}:</strong> {group.baseQuestionText.substring(0, 80)}...
                                                    </div>
                                                    <div className="group-variations">
                                                        {group.variations.map((v, vIdx) => (
                                                            <div key={vIdx} className="question-card">
                                                                {editingGroupIndex === gIdx && editingVariationIndex === vIdx ? (
                                                                    <div className="edit-mode">
                                                                        <div className="field">
                                                                            <label>Câu hỏi biến thể</label>
                                                                            <RichTextEditor
                                                                                value={v.questionText || ''}
                                                                                onChange={(value) => {
                                                                                    const newGroups = [...variationGroups];
                                                                                    newGroups[gIdx].variations[vIdx].questionText = value;
                                                                                    setVariationGroups(newGroups);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="field">
                                                                            <label>Đáp án đúng</label>
                                                                            <RichTextEditor
                                                                                value={v.correctAnswer || ''}
                                                                                onChange={(value) => {
                                                                                    const newGroups = [...variationGroups];
                                                                                    newGroups[gIdx].variations[vIdx].correctAnswer = value;
                                                                                    setVariationGroups(newGroups);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="field">
                                                                            <label>Giải thích</label>
                                                                            <RichTextEditor
                                                                                value={v.explanation || ''}
                                                                                onChange={(value) => {
                                                                                    const newGroups = [...variationGroups];
                                                                                    newGroups[gIdx].variations[vIdx].explanation = value;
                                                                                    setVariationGroups(newGroups);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="row">
                                                                            <div className="field">
                                                                                <label>Mức độ nhận thức</label>
                                                                                <select
                                                                                    value={v.cognitiveLevelId || ''}
                                                                                    onChange={(e) => {
                                                                                        const newGroups = [...variationGroups];
                                                                                        newGroups[gIdx].variations[vIdx].cognitiveLevelId = e.target.value ? Number(e.target.value) : null;
                                                                                        setVariationGroups(newGroups);
                                                                                    }}
                                                                                >
                                                                                    <option value="">Chọn mức độ...</option>
                                                                                    {cognitiveLevels.map((l) => (
                                                                                        <option key={l.id} value={l.id}>{l.level}</option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                        <div className="actions">
                                                                            <button className="btn btn-sm btn-primary" onClick={() => handleSaveVariationInGroup(gIdx, vIdx, v)}>Lưu</button>
                                                                            <button className="btn btn-sm btn-secondary" onClick={() => { setEditingGroupIndex(null); setEditingVariationIndex(null); }}>Hủy</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="question-header">
                                                                            <span className="question-number">Biến thể {vIdx + 1}</span>
                                                                        </div>
                                                                        <div className="question-text"><MathRenderer content={v.questionText || '—'} /></div>
                                                                        <div className="answer-text"><strong>Đáp án:</strong> <MathRenderer content={v.correctAnswer || '—'} /></div>
                                                                        {v.explanation && <div className="explanation-text"><strong>Giải thích:</strong> <MathRenderer content={v.explanation} /></div>}
                                                                        <div className="question-actions">
                                                                            <button className="icon-btn" onClick={() => handleEditVariationInGroup(gIdx, vIdx)} title="Sửa"><Edit2 size={16} /> Sửa</button>
                                                                            <button className="icon-btn danger" onClick={() => handleDeleteVariationInGroup(gIdx, vIdx)} title="Xóa"><Trash2 size={16} /> Xóa</button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="actions">
                                                <button className="btn btn-primary" onClick={handleShowVariationPreview} disabled={!lessonId}>
                                                    <Eye size={16} /> Xác nhận
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="preview-container">
                                            <h4><Eye size={18} /> Xem trước ({variationGroups.reduce((sum, g) => sum + g.variations.length, 0)} biến thể)</h4>
                                            <p className="muted" style={{ marginBottom: '1rem' }}>Kiểm tra lại các biến thể từ AI trước khi lưu vào ngân hàng câu hỏi.</p>
                                            <div className="preview-questions-list">
                                                {variationGroups.flatMap((g, gIdx) => g.variations.map((v, vIdx) => (
                                                    <div key={`${gIdx}-${vIdx}`} className="preview-card" style={{ marginBottom: '1rem' }}>
                                                        <div className="question-header">
                                                            <span className="question-number">Biến thể từ #{g.baseQuestionId}</span>
                                                            {v.cognitiveLevelId && <span className="cognitive-badge">{cognitiveLevels.find(l => l.id === v.cognitiveLevelId)?.level || ''}</span>}
                                                        </div>
                                                        <div className="preview-section">
                                                            <label>Câu hỏi</label>
                                                            <div className="preview-content"><MathRenderer content={v.questionText || '—'} /></div>
                                                        </div>
                                                        <div className="preview-section">
                                                            <label>Đáp án đúng</label>
                                                            <div className="preview-content answer-highlight"><MathRenderer content={v.correctAnswer || '—'} /></div>
                                                        </div>
                                                    </div>
                                                )))}
                                            </div>
                                            <div className="actions preview-actions">
                                                <button className="btn btn-secondary" onClick={() => setShowVariationPreview(false)}>
                                                    <Edit2 size={16} /> Quay lại chỉnh sửa
                                                </button>
                                                <button className="btn btn-primary" onClick={handleSaveVariationQuestions} disabled={savingVariation}>
                                                    {savingVariation ? 'Đang lưu...' : <><Save size={16} /> Lưu tất cả ({variationGroups.reduce((sum, g) => sum + g.variations.length, 0)} biến thể)</>}
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

            {/* Tab 5: AI from URL */}
            {activeTab === 'ai-url' && (
                <div className="tab-content glass">
                    <h3><Sparkles size={18} /> AI tạo câu hỏi từ URL</h3>
                    <div className="row">
                        <div className="field" style={{ flex: 2 }}>
                            <label>Nhập URL bài viết/tài liệu</label>
                            <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://example.com/article"
                            />
                            <small className="muted">Hỗ trợ các trang web có nội dung text (bài viết, Wikipedia, etc.)</small>
                        </div>
                        <div className="field">
                            <label>Số câu hỏi</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={urlNumberOfQuestions}
                                onChange={(e) => setUrlNumberOfQuestions(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                            />
                        </div>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerateFromUrl}
                        disabled={!urlInput.trim() || !lessonId || urlGenerating}
                    >
                        {urlGenerating ? 'AI đang xử lý (có thể mất 30-60 giây)...' : <><Sparkles size={16} /> AI tạo {urlNumberOfQuestions} câu hỏi từ URL</>}
                    </button>

                    {urlGeneratedQuestions.length > 0 && (
                        <>
                            {!showUrlPreview ? (
                                <div className="ai-questions">
                                    <h4>Kết quả AI ({urlGeneratedQuestions.length} câu)</h4>
                                    {urlGeneratedQuestions.map((q, idx) => (
                                        <div key={idx} className="question-card">
                                            {editingUrlQuestionIndex === idx ? (
                                                <div className="edit-mode">
                                                    <div className="field">
                                                        <label>Câu hỏi</label>
                                                        <RichTextEditor
                                                            value={q.questionText || ''}
                                                            onChange={(value) => {
                                                                const updated = [...urlGeneratedQuestions];
                                                                updated[idx].questionText = value;
                                                                setUrlGeneratedQuestions(updated);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="field">
                                                        <label>Đáp án đúng</label>
                                                        <RichTextEditor
                                                            value={q.correctAnswer || ''}
                                                            onChange={(value) => {
                                                                const updated = [...urlGeneratedQuestions];
                                                                updated[idx].correctAnswer = value;
                                                                setUrlGeneratedQuestions(updated);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="field">
                                                        <label>Giải thích</label>
                                                        <RichTextEditor
                                                            value={q.explanation || ''}
                                                            onChange={(value) => {
                                                                const updated = [...urlGeneratedQuestions];
                                                                updated[idx].explanation = value;
                                                                setUrlGeneratedQuestions(updated);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="row">
                                                        <div className="field">
                                                            <label>Dạng câu hỏi</label>
                                                            <select
                                                                value={q.questionType || 'MULTIPLE_CHOICE'}
                                                                onChange={(e) => {
                                                                    const updated = [...urlGeneratedQuestions];
                                                                    updated[idx].questionType = e.target.value;
                                                                    setUrlGeneratedQuestions(updated);
                                                                }}
                                                            >
                                                                {QUESTION_TYPES.map((t) => (
                                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="field">
                                                            <label>Mức độ nhận thức</label>
                                                            <select
                                                                value={q.cognitiveLevelId || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...urlGeneratedQuestions];
                                                                    updated[idx].cognitiveLevelId = e.target.value ? Number(e.target.value) : null;
                                                                    setUrlGeneratedQuestions(updated);
                                                                }}
                                                            >
                                                                <option value="">Chọn mức độ...</option>
                                                                {cognitiveLevels.map((l) => (
                                                                    <option key={l.id} value={l.id}>{l.level}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="actions">
                                                        <button className="btn btn-sm btn-primary" onClick={() => handleSaveUrlQuestion(idx, q)}>Lưu</button>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => setEditingUrlQuestionIndex(null)}>Hủy</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="question-header">
                                                        <span className="question-number">Câu {idx + 1}</span>
                                                        <span className="question-type-badge">{QUESTION_TYPES.find(t => t.value === q.questionType)?.label || q.questionType}</span>
                                                    </div>
                                                    <div className="question-text"><MathRenderer content={q.questionText || '—'} /></div>
                                                    <div className="answer-text"><strong>Đáp án:</strong> <MathRenderer content={q.correctAnswer || '—'} /></div>
                                                    {q.explanation && <div className="explanation-text"><strong>Giải thích:</strong> <MathRenderer content={q.explanation} /></div>}
                                                    <div className="question-actions">
                                                        <button className="icon-btn" onClick={() => handleEditUrlQuestion(idx)} title="Sửa"><Edit2 size={16} /> Sửa</button>
                                                        <button className="icon-btn danger" onClick={() => handleDeleteUrlQuestion(idx)} title="Xóa"><Trash2 size={16} /> Xóa</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    <div className="actions">
                                        <button className="btn btn-primary" onClick={handleShowUrlPreview} disabled={!lessonId || urlGeneratedQuestions.length === 0}>
                                            <Eye size={16} /> Xác nhận
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="preview-container">
                                    <h4><Eye size={18} /> Xem trước ({urlGeneratedQuestions.length} câu hỏi)</h4>
                                    <p className="muted" style={{ marginBottom: '1rem' }}>Kiểm tra lại các câu hỏi từ AI trước khi lưu vào ngân hàng câu hỏi.</p>
                                    <div className="preview-questions-list">
                                        {urlGeneratedQuestions.map((q, idx) => (
                                            <div key={idx} className="preview-card" style={{ marginBottom: '1rem' }}>
                                                <div className="question-header">
                                                    <span className="question-number">Câu {idx + 1}</span>
                                                    <span className="question-type-badge">{QUESTION_TYPES.find(t => t.value === q.questionType)?.label || q.questionType}</span>
                                                    {q.cognitiveLevelId && <span className="cognitive-badge">{cognitiveLevels.find(l => l.id === q.cognitiveLevelId)?.level || ''}</span>}
                                                </div>
                                                <div className="preview-section">
                                                    <label>Câu hỏi</label>
                                                    <div className="preview-content"><MathRenderer content={q.questionText || '—'} /></div>
                                                </div>
                                                <div className="preview-section">
                                                    <label>Đáp án đúng</label>
                                                    <div className="preview-content answer-highlight"><MathRenderer content={q.correctAnswer || '—'} /></div>
                                                </div>
                                                {q.explanation && (
                                                    <div className="preview-section">
                                                        <label>Giải thích</label>
                                                        <div className="preview-content explanation-style"><MathRenderer content={q.explanation} /></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="actions preview-actions">
                                        <button className="btn btn-secondary" onClick={() => setShowUrlPreview(false)}>
                                            <Edit2 size={16} /> Quay lại chỉnh sửa
                                        </button>
                                        <button className="btn btn-primary" onClick={handleSaveUrlQuestions} disabled={savingUrlQuestions}>
                                            {savingUrlQuestions ? 'Đang lưu...' : <><Save size={16} /> Lưu tất cả ({urlGeneratedQuestions.length} câu)</>}
                                        </button>
                                    </div>
                                </div>
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
                }
                .answer-text {
                    color: var(--color-text-primary);
                    font-size: 0.95rem;
                    margin-bottom: 0.5rem;
                }
                .explanation-text {
                    color: var(--color-text-secondary);
                    font-size: 0.9rem;
                    font-style: italic;
                    margin-bottom: 0.5rem;
                    padding-left: 1rem;
                    border-left: 2px solid rgba(96, 78, 255, 0.2);
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
                    color: #10b981;
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
                }
                .question-checkbox-item input[type="checkbox"] {
                    margin-top: 3px;
                    width: 18px;
                    height: 18px;
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
