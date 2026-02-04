import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft, Plus, Folder, FileText, MoreVertical,
    ChevronDown, ChevronRight, Upload, Link as LinkIcon
} from 'lucide-react';
import { subjectService } from '../../services/subjectService';

const SubjectDetail = () => {
    const { subjectId } = useParams();
    const [subject, setSubject] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedChapters, setExpandedChapters] = useState({});

    // Modal states
    const [showChapterModal, setShowChapterModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [selectedChapterId, setSelectedChapterId] = useState(null);

    // Form states
    const [chapterName, setChapterName] = useState('');
    const [lessonName, setLessonName] = useState('');

    useEffect(() => {
        loadData();
    }, [subjectId]);

    const loadData = async () => {
        try {
            const [subData, chapData] = await Promise.all([
                subjectService.getSubjectById(subjectId),
                subjectService.getChapters(subjectId)
            ]);
            setSubject(subData);

            // Fetch lessons for each chapter
            const chaptersWithLessons = await Promise.all(chapData.map(async (chap) => {
                const lessons = await subjectService.getLessons(chap.id);
                return { ...chap, lessons };
            }));

            setChapters(chaptersWithLessons);

            // Auto expand all
            const expanded = {};
            chaptersWithLessons.forEach(c => expanded[c.id] = true);
            setExpandedChapters(expanded);

        } catch (error) {
            console.error("Failed to load subject details", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleChapter = (chapId) => {
        setExpandedChapters(prev => ({ ...prev, [chapId]: !prev[chapId] }));
    };

    const handleCreateChapter = async (e) => {
        e.preventDefault();
        try {
            await subjectService.createChapter(subjectId, { name: chapterName });
            setChapterName('');
            setShowChapterModal(false);
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        try {
            await subjectService.createLesson(selectedChapterId, { name: lessonName });
            setLessonName('');
            setShowLessonModal(false);
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;
    if (!subject) return <div className="p-8 text-center">Không tìm thấy môn học</div>;

    return (
        <div className="page-container subject-detail">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <Link to="/teacher/subjects" className="back-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="page-title">{subject.name}</h1>
                        <p className="page-subtitle">Lớp {subject.grade} • {chapters.length} Chương</p>
                    </div>
                </div>
                <button onClick={() => setShowChapterModal(true)} className="btn btn-primary">
                    <Plus size={20} /> Thêm chương mới
                </button>
            </div>

            {/* Content Tree */}
            <div className="content-tree">
                {chapters.map(chapter => (
                    <div key={chapter.id} className="chapter-item glass">
                        <div className="chapter-header" onClick={() => toggleChapter(chapter.id)}>
                            <div className="left">
                                {expandedChapters[chapter.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                <Folder size={20} className="chapter-icon" />
                                <h3>{chapter.name}</h3>
                            </div>
                            <div className="actions" onClick={e => e.stopPropagation()}>
                                <button
                                    className="btn-sm btn-outline"
                                    onClick={() => {
                                        setSelectedChapterId(chapter.id);
                                        setShowLessonModal(true);
                                    }}
                                >
                                    <Plus size={16} /> Thêm bài học
                                </button>
                                <button className="icon-btn"><MoreVertical size={18} /></button>
                            </div>
                        </div>

                        {expandedChapters[chapter.id] && (
                            <div className="chapter-lessons">
                                {chapter.lessons && chapter.lessons.length > 0 ? (
                                    chapter.lessons.map(lesson => (
                                        <div key={lesson.id} className="lesson-item">
                                            <div className="lesson-info">
                                                <FileText size={18} className="text-secondary" />
                                                <span>{lesson.name}</span>
                                            </div>
                                            <div className="lesson-actions">
                                                <button title="Upload tài liệu" className="action-btn">
                                                    <Upload size={16} />
                                                </button>
                                                <button title="Quản lý câu hỏi" className="action-btn">
                                                    <LinkIcon size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-chapter">Chưa có bài học nào</div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {chapters.length === 0 && (
                    <div className="empty-state">
                        <p>Chưa có nội dung nào. Hãy tạo chương đầu tiên!</p>
                    </div>
                )}
            </div>

            {/* Modal: Create Chapter */}
            {showChapterModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2>Thêm chương mới</h2>
                        <form onSubmit={handleCreateChapter}>
                            <div className="form-group">
                                <label>Tên chương</label>
                                <input
                                    type="text" autoFocus required
                                    value={chapterName}
                                    onChange={e => setChapterName(e.target.value)}
                                    placeholder="Ví dụ: Chương 1: Hàm số"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowChapterModal(false)} className="btn btn-secondary">Hủy</button>
                                <button type="submit" className="btn btn-primary">Tạo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Create Lesson */}
            {showLessonModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2>Thêm bài học mới</h2>
                        <form onSubmit={handleCreateLesson}>
                            <div className="form-group">
                                <label>Tên bài học</label>
                                <input
                                    type="text" autoFocus required
                                    value={lessonName}
                                    onChange={e => setLessonName(e.target.value)}
                                    placeholder="Ví dụ: Bài 1: Khái niệm hàm số"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowLessonModal(false)} className="btn btn-secondary">Hủy</button>
                                <button type="submit" className="btn btn-primary">Tạo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .subject-detail { max-width: 1000px; margin: 0 auto; }
                
                .page-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 2rem;
                }
                .header-left { display: flex; align-items: center; gap: 1rem; }
                .back-btn { 
                    padding: 8px; border-radius: 50%; background: white; 
                    color: var(--color-text-secondary); display: flex;
                    transition: all 0.2s;
                }
                .back-btn:hover { background: #f3f4f6; color: var(--color-text-primary); }
                
                .page-title { margin: 0; font-size: 1.5rem; }
                
                .chapter-item {
                    margin-bottom: 1rem; border-radius: 12px;
                    border: 1px solid rgba(0,0,0,0.05); overflow: hidden;
                }
                
                .chapter-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 1rem 1.5rem; cursor: pointer;
                    background: rgba(255,255,255,0.8);
                    transition: background 0.2s;
                }
                .chapter-header:hover { background: white; }
                
                .chapter-header .left { display: flex; align-items: center; gap: 12px; font-weight: 600; color: var(--color-text-primary); }
                .chapter-icon { color: #f59e0b; }
                
                .chapter-header .actions { display: flex; align-items: center; gap: 8px; }
                
                .chapter-lessons {
                    padding: 0.5rem 1.5rem 1.5rem 3.5rem;
                    border-top: 1px solid rgba(0,0,0,0.05);
                    background: rgba(255,255,255,0.4);
                }
                
                .lesson-item {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    margin-bottom: 4px;
                    transition: all 0.2s;
                }
                .lesson-item:hover { background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                
                .lesson-info { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; }
                
                .lesson-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
                .lesson-item:hover .lesson-actions { opacity: 1; }
                
                .action-btn {
                    padding: 6px; border-radius: 6px; border: none; background: transparent;
                    color: #94a3b8; cursor: pointer;
                }
                .action-btn:hover { background: #f1f5f9; color: var(--color-accent-1); }
                
                .btn-outline {
                    border: 1px solid #e5e7eb; background: transparent;
                    padding: 6px 12px; border-radius: 6px; font-size: 0.85rem;
                    display: flex; align-items: center; gap: 4px; cursor: pointer;
                }
                .btn-outline:hover { border-color: var(--color-accent-1); color: var(--color-accent-1); }
                
                .empty-chapter { padding: 1rem; color: #94a3b8; font-size: 0.9rem; font-style: italic; }
                
                /* Modal Styles (Reuse) */
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 100; backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white; padding: 2rem; border-radius: 16px;
                    width: 100%; max-width: 500px;
                }
                .form-group { margin-bottom: 1.5rem; }
                .form-group input { width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; }
                .form-actions { display: flex; justify-content: flex-end; gap: 1rem; }
            `}</style>
        </div>
    );
};

export default SubjectDetail;
