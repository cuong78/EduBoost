import { useEffect, useState } from 'react';
import { Upload, BookOpen, GraduationCap, FileText, Layers } from 'lucide-react';
import { knowledgeService } from '../../services/knowledgeService';
import { teacherService } from '../../services/teacherService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';

const GRADE_OPTIONS = [10, 11, 12];

const RESOURCE_TYPES = [
    { value: 'PDF', label: 'PDF' },
    { value: 'DOCX', label: 'DOCX' },
    { value: 'VIDEO', label: 'Video' },
    { value: 'IMAGE', label: 'Hình ảnh' },
    { value: 'URL', label: 'URL' },
    { value: 'TEXT', label: 'Văn bản' },
];

const UploadResource = () => {
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState('');

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

    const [uploading, setUploading] = useState(false);
    const [resourceType, setResourceType] = useState('PDF');
    const [resourceName, setResourceName] = useState('');
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState('');
    const [textContent, setTextContent] = useState('');

    const loadClasses = async () => {
        setLoadingClasses(true);
        try {
            const data = await teacherService.getClasses();
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setClasses(list);
            if (!classId && list.length > 0) setClassId(String(list[0].classId));
        } catch (e) {
            setClasses([]);
            showErrorToast('Không tải được danh sách lớp học');
        } finally {
            setLoadingClasses(false);
        }
    };

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

    useEffect(() => {
        loadClasses();
        loadSubjects();
    }, []);

    useEffect(() => {
        if (subjectId) loadChapters(subjectId, gradeLevel);
    }, [subjectId, gradeLevel]);

    useEffect(() => {
        if (chapterId) loadLessons(chapterId);
    }, [chapterId]);

    const handleUpload = async () => {
        if (!lessonId) {
            showErrorToast('Vui lòng chọn bài học');
            return;
        }

        if (resourceType === 'URL') {
            if (!fileUrl.trim()) {
                showErrorToast('Vui lòng nhập URL');
                return;
            }
            setUploading(true);
            try {
                await knowledgeService.createResource({
                    lessonId: Number(lessonId),
                    resourceType: 'URL',
                    fileUrl: fileUrl.trim(),
                    resourceName: resourceName || 'URL Resource',
                });
                showSuccessToast('Upload tài nguyên thành công');
                setFileUrl('');
                setResourceName('');
            } catch (e) {
                showErrorToast('Upload thất bại');
            } finally {
                setUploading(false);
            }
        } else if (resourceType === 'TEXT') {
            if (!textContent.trim()) {
                showErrorToast('Vui lòng nhập nội dung văn bản');
                return;
            }
            setUploading(true);
            try {
                await knowledgeService.createResource({
                    lessonId: Number(lessonId),
                    resourceType: 'TEXT',
                    textContent: textContent.trim(),
                    resourceName: resourceName || 'Text Resource',
                });
                showSuccessToast('Upload tài nguyên thành công');
                setTextContent('');
                setResourceName('');
            } catch (e) {
                showErrorToast('Upload thất bại');
            } finally {
                setUploading(false);
            }
        } else {
            if (!file) {
                showErrorToast('Vui lòng chọn file');
                return;
            }
            setUploading(true);
            try {
                await knowledgeService.uploadResourceFile({
                    lessonId: Number(lessonId),
                    resourceType,
                    resourceName: resourceName || file.name,
                    file,
                });
                showSuccessToast('Upload tài nguyên thành công');
                setFile(null);
                setResourceName('');
            } catch (e) {
                showErrorToast('Upload thất bại');
            } finally {
                setUploading(false);
            }
        }
    };

    const isFileType = ['PDF', 'DOCX', 'VIDEO', 'IMAGE'].includes(resourceType);
    const isUrlType = resourceType === 'URL';
    const isTextType = resourceType === 'TEXT';

    return (
        <div className="upload-resource-page">
            <div className="page-header">
                <div>
                    <h2><Upload size={22} /> Upload tài nguyên</h2>
                    <p>Chọn lớp học → môn → chương → bài học để upload tài nguyên.</p>
                </div>
            </div>

            <div className="upload-flow glass">
                {/* Step 1: Chọn lớp học */}
                <div className="step-section">
                    <div className="step-header">
                        <GraduationCap size={20} className="step-icon" />
                        <h3>1. Chọn lớp học</h3>
                    </div>
                    <div className="field">
                        <label>Lớp học</label>
                        <select value={classId} onChange={(e) => setClassId(e.target.value)} disabled={loadingClasses}>
                            {loadingClasses ? (
                                <option>Đang tải...</option>
                            ) : classes.length === 0 ? (
                                <option>Chưa có lớp học</option>
                            ) : (
                                classes.map((c) => (
                                    <option key={c.classId} value={String(c.classId)}>
                                        {c.className} ({c.classCode})
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                {/* Step 2: Chọn môn học */}
                <div className="step-section">
                    <div className="step-header">
                        <BookOpen size={20} className="step-icon" />
                        <h3>2. Chọn môn học</h3>
                    </div>
                    <div className="row">
                        <div className="field">
                            <label>Môn học</label>
                            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={loadingSubjects}>
                                {loadingSubjects ? (
                                    <option>Đang tải...</option>
                                ) : subjects.length === 0 ? (
                                    <option>Chưa có môn học</option>
                                ) : (
                                    subjects.map((s) => (
                                        <option key={s.id} value={String(s.id)}>
                                            {s.subjectCode} {s.description ? `- ${s.description}` : ''}
                                        </option>
                                    ))
                                )}
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
                </div>

                {/* Step 3: Chọn chương */}
                <div className="step-section">
                    <div className="step-header">
                        <Layers size={20} className="step-icon" />
                        <h3>3. Chọn chương</h3>
                    </div>
                    <div className="field">
                        <label>Chương</label>
                        <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} disabled={loadingChapters || !chapters.length}>
                            {loadingChapters ? (
                                <option>Đang tải...</option>
                            ) : chapters.length === 0 ? (
                                <option>Chưa có chương cho môn/khối này</option>
                            ) : (
                                chapters.map((c) => (
                                    <option key={c.id} value={String(c.id)}>
                                        Chương {c.chapterNumber}: {c.chapterName}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                {/* Step 4: Chọn bài học */}
                <div className="step-section">
                    <div className="step-header">
                        <FileText size={20} className="step-icon" />
                        <h3>4. Chọn bài học</h3>
                    </div>
                    <div className="field">
                        <label>Bài học</label>
                        <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} disabled={loadingLessons || !lessons.length}>
                            {loadingLessons ? (
                                <option>Đang tải...</option>
                            ) : lessons.length === 0 ? (
                                <option>Chưa có bài học trong chương này</option>
                            ) : (
                                lessons.map((l) => (
                                    <option key={l.id} value={String(l.id)}>
                                        Bài {l.lessonNumber}: {l.lessonName}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                {/* Step 5: Upload */}
                <div className="step-section">
                    <div className="step-header">
                        <Upload size={20} className="step-icon" />
                        <h3>5. Upload tài nguyên</h3>
                    </div>

                    <div className="field">
                        <label>Loại</label>
                        <select value={resourceType} onChange={(e) => {
                            setResourceType(e.target.value);
                            setFile(null);
                            setFileUrl('');
                            setTextContent('');
                        }}>
                            {RESOURCE_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label>Tên tài nguyên (tuỳ chọn)</label>
                        <input
                            type="text"
                            placeholder="VD: Chương 1 - Tài liệu"
                            value={resourceName}
                            onChange={(e) => setResourceName(e.target.value)}
                        />
                    </div>

                    {isFileType && (
                        <div className="field">
                            <label>File</label>
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    id="file-upload"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    accept={resourceType === 'PDF' ? '.pdf' : resourceType === 'DOCX' ? '.doc,.docx' : resourceType === 'VIDEO' ? 'video/*' : 'image/*'}
                                />
                                <label htmlFor="file-upload" className="file-label">
                                    {file ? file.name : 'Choose File'}
                                </label>
                                {file && <span className="file-name">{file.name}</span>}
                            </div>
                        </div>
                    )}

                    {isUrlType && (
                        <div className="field">
                            <label>URL</label>
                            <input
                                type="url"
                                placeholder="https://..."
                                value={fileUrl}
                                onChange={(e) => setFileUrl(e.target.value)}
                            />
                        </div>
                    )}

                    {isTextType && (
                        <div className="field">
                            <label>Nội dung văn bản</label>
                            <textarea
                                rows={6}
                                placeholder="Nhập nội dung văn bản..."
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                            />
                        </div>
                    )}

                    <button
                        className="btn btn-primary upload-btn"
                        onClick={handleUpload}
                        disabled={uploading || !lessonId || (isFileType && !file) || (isUrlType && !fileUrl.trim()) || (isTextType && !textContent.trim())}
                    >
                        {uploading ? (
                            <>Đang upload...</>
                        ) : (
                            <><Upload size={18} /> Upload</>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                .upload-resource-page {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 2rem;
                }

                .page-header h2 {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--color-text-primary);
                    margin-bottom: 0.5rem;
                }

                .page-header p {
                    color: var(--color-text-secondary);
                }

                .upload-flow {
                    padding: 2rem;
                    border-radius: 16px;
                }

                .step-section {
                    margin-bottom: 2rem;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }

                .step-section:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }

                .step-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 1rem;
                }

                .step-header h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--color-text-primary);
                    margin: 0;
                }

                .step-icon {
                    color: var(--color-accent-1);
                }

                .field {
                    margin-bottom: 1rem;
                }

                .field label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    font-size: 0.9rem;
                    color: var(--color-text-primary);
                }

                .row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                select, input[type="text"], input[type="url"], textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: 1px solid rgba(0,0,0,0.1);
                    background: rgba(255,255,255,0.8);
                    font-family: inherit;
                    font-size: 0.95rem;
                }

                select:focus, input:focus, textarea:focus {
                    outline: none;
                    border-color: var(--color-accent-1);
                    box-shadow: 0 0 0 3px rgba(96, 78, 255, 0.1);
                }

                select:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .file-input-wrapper {
                    position: relative;
                }

                .file-input-wrapper input[type="file"] {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .file-label {
                    display: inline-block;
                    padding: 0.75rem 1.5rem;
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .file-label:hover {
                    background: rgba(96, 78, 255, 0.15);
                }

                .file-name {
                    margin-left: 1rem;
                    color: var(--color-text-secondary);
                    font-size: 0.9rem;
                }

                .upload-btn {
                    margin-top: 1rem;
                    width: 100%;
                    padding: 0.875rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-weight: 600;
                }

                .upload-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default UploadResource;
