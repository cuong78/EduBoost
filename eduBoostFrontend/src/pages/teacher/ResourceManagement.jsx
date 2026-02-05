import { useEffect, useState } from 'react';
import { BookOpen, FileText, Upload, Edit2, Trash2, Eye, Download, Filter, RefreshCw, File, Link, Video, Image as ImageIcon } from 'lucide-react';
import { knowledgeService } from '../../services/knowledgeService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import { API } from '../../constants/api';

const GRADE_OPTIONS = [10, 11, 12];

const RESOURCE_TYPES = [
    { value: 'PDF', label: 'PDF', icon: FileText },
    { value: 'DOCX', label: 'Word', icon: File },
    { value: 'VIDEO', label: 'Video', icon: Video },
    { value: 'IMAGE', label: 'Hình ảnh', icon: ImageIcon },
    { value: 'URL', label: 'URL', icon: Link },
    { value: 'TEXT', label: 'Văn bản', icon: FileText },
];

const ResourceManagement = () => {
    // Filters
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
    
    // Resources
    const [loadingResources, setLoadingResources] = useState(false);
    const [resources, setResources] = useState([]);
    
    // Upload modal
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState('PDF');
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadUrl, setUploadUrl] = useState('');
    const [uploadText, setUploadText] = useState('');
    const [uploadName, setUploadName] = useState('');
    const [uploading, setUploading] = useState(false);
    
    // View modal
    const [viewingResource, setViewingResource] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    
    // Delete confirm
    const [deletingResourceId, setDeletingResourceId] = useState(null);

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
            setChapterId('');
        } catch (e) {
            setChapters([]);
            setChapterId('');
        } finally {
            setLoadingChapters(false);
        }
    };

    const loadLessons = async (cid) => {
        if (!cid) {
            setLessons([]);
            setLessonId('');
            return;
        }
        setLoadingLessons(true);
        try {
            const data = await knowledgeService.getLessonsByChapter(cid);
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setLessons(list);
            setLessonId('');
        } catch (e) {
            setLessons([]);
            setLessonId('');
        } finally {
            setLoadingLessons(false);
        }
    };

    const loadResources = async () => {
        if (!lessonId) {
            setResources([]);
            return;
        }
        setLoadingResources(true);
        try {
            const data = await knowledgeService.getResourcesByLesson(lessonId);
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setResources(list);
        } catch (e) {
            setResources([]);
            showErrorToast('Không tải được danh sách tài nguyên');
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
        if (chapterId) {
            loadLessons(chapterId);
        } else {
            setLessons([]);
            setLessonId('');
        }
    }, [chapterId]);

    useEffect(() => {
        loadResources();
    }, [lessonId]);

    const handleUpload = async () => {
        if (!lessonId) {
            showErrorToast('Vui lòng chọn bài học');
            return;
        }

        setUploading(true);
        try {
            if (uploadType === 'URL') {
                if (!uploadUrl.trim()) {
                    showErrorToast('Vui lòng nhập URL');
                    setUploading(false);
                    return;
                }
                await knowledgeService.createResource({
                    lessonId: Number(lessonId),
                    resourceType: 'URL',
                    fileUrl: uploadUrl.trim(),
                    resourceName: uploadName || 'URL Resource',
                });
            } else if (uploadType === 'TEXT') {
                if (!uploadText.trim()) {
                    showErrorToast('Vui lòng nhập nội dung văn bản');
                    setUploading(false);
                    return;
                }
                await knowledgeService.createResource({
                    lessonId: Number(lessonId),
                    resourceType: 'TEXT',
                    extractedContent: uploadText.trim(),
                    resourceName: uploadName || 'Text Content',
                });
            } else {
                if (!uploadFile) {
                    showErrorToast('Vui lòng chọn file');
                    setUploading(false);
                    return;
                }
                await knowledgeService.uploadResourceFile({
                    lessonId: Number(lessonId),
                    resourceType: uploadType,
                    resourceName: uploadName || uploadFile.name,
                    file: uploadFile,
                });
            }
            
            showSuccessToast('Upload tài nguyên thành công');
            setShowUploadModal(false);
            resetUploadForm();
            loadResources();
        } catch (e) {
            showErrorToast('Upload thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi'));
        } finally {
            setUploading(false);
        }
    };

    const resetUploadForm = () => {
        setUploadType('PDF');
        setUploadFile(null);
        setUploadUrl('');
        setUploadText('');
        setUploadName('');
    };

    const handleViewResource = (resource) => {
        setViewingResource(resource);
        setShowViewModal(true);
    };

    const handleDownloadResource = async (resource) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API.RESOURCE_DOWNLOAD(resource.id), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Download failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', resource.resourceName || 'resource');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            showErrorToast('Tải xuống thất bại');
        }
    };

    const handleDeleteResource = async (id) => {
        try {
            await knowledgeService.deleteResource(id);
            showSuccessToast('Đã xóa tài nguyên');
            setDeletingResourceId(null);
            loadResources();
        } catch (e) {
            showErrorToast('Xóa thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi'));
        }
    };

    const getResourceIcon = (type) => {
        const found = RESOURCE_TYPES.find(t => t.value === type);
        return found ? found.icon : FileText;
    };

    return (
        <div className="resource-management-page">
            <div className="page-header">
                <h2><FileText size={24} /> Quản lý tài nguyên</h2>
                <p>Upload và quản lý tài nguyên học tập theo bài học</p>
            </div>

            {/* Filters */}
            <div className="filters-section glass">
                <h3><Filter size={18} /> Chọn bài học</h3>
                <div className="filters-grid">
                    <div className="field">
                        <label>Môn học</label>
                        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={loadingSubjects}>
                            <option value="">Chọn môn...</option>
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
                                <option key={g} value={g}>Lớp {g}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Chương</label>
                        <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} disabled={loadingChapters || chapters.length === 0}>
                            <option value="">Chọn chương...</option>
                            {chapters.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                    Chương {c.chapterNumber}: {c.chapterName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Bài học</label>
                        <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} disabled={loadingLessons || lessons.length === 0}>
                            <option value="">Chọn bài...</option>
                            {lessons.map((l) => (
                                <option key={l.id} value={String(l.id)}>
                                    Bài {l.lessonNumber}: {l.lessonName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="filter-actions">
                    <button className="btn btn-secondary" onClick={loadResources} disabled={!lessonId}>
                        <RefreshCw size={16} /> Làm mới
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowUploadModal(true)} disabled={!lessonId}>
                        <Upload size={16} /> Upload tài nguyên mới
                    </button>
                </div>
            </div>

            {/* Resources list */}
            <div className="resources-section glass">
                <h3><BookOpen size={18} /> Danh sách tài nguyên {lessonId && `(${resources.length})`}</h3>
                
                {!lessonId ? (
                    <p className="muted">Vui lòng chọn bài học để xem tài nguyên.</p>
                ) : loadingResources ? (
                    <p className="muted">Đang tải...</p>
                ) : resources.length === 0 ? (
                    <p className="muted">Chưa có tài nguyên nào. Hãy upload tài nguyên mới.</p>
                ) : (
                    <div className="resources-grid">
                        {resources.map((r) => {
                            const IconComponent = getResourceIcon(r.resourceType);
                            return (
                                <div key={r.id} className="resource-card">
                                    <div className="resource-icon">
                                        <IconComponent size={32} />
                                    </div>
                                    <div className="resource-info">
                                        <h4>{r.resourceName || 'Unnamed'}</h4>
                                        <span className="resource-type">{r.resourceType}</span>
                                        {r.hasExtractedContent && (
                                            <span className="extracted-badge">Đã trích xuất</span>
                                        )}
                                        <span className="resource-date">
                                            {new Date(r.createdAt || r.uploadedAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="resource-actions">
                                        <button className="icon-btn" onClick={() => handleViewResource(r)} title="Xem chi tiết">
                                            <Eye size={16} />
                                        </button>
                                        {r.downloadUrl && (
                                            <button className="icon-btn" onClick={() => handleDownloadResource(r)} title="Tải xuống">
                                                <Download size={16} />
                                            </button>
                                        )}
                                        <button className="icon-btn danger" onClick={() => setDeletingResourceId(r.id)} title="Xóa">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Upload tài nguyên mới</h3>
                        <div className="field">
                            <label>Loại tài nguyên</label>
                            <select value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
                                {RESOURCE_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label>Tên tài nguyên (tùy chọn)</label>
                            <input
                                type="text"
                                value={uploadName}
                                onChange={(e) => setUploadName(e.target.value)}
                                placeholder="Nhập tên hiển thị..."
                            />
                        </div>
                        
                        {uploadType === 'URL' ? (
                            <div className="field">
                                <label>URL</label>
                                <input
                                    type="url"
                                    value={uploadUrl}
                                    onChange={(e) => setUploadUrl(e.target.value)}
                                    placeholder="https://example.com/..."
                                />
                            </div>
                        ) : uploadType === 'TEXT' ? (
                            <div className="field">
                                <label>Nội dung văn bản</label>
                                <textarea
                                    rows={8}
                                    value={uploadText}
                                    onChange={(e) => setUploadText(e.target.value)}
                                    placeholder="Nhập nội dung văn bản..."
                                />
                            </div>
                        ) : (
                            <div className="field">
                                <label>Chọn file</label>
                                <input
                                    type="file"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                    accept={uploadType === 'PDF' ? '.pdf' : 
                                            uploadType === 'DOCX' ? '.docx,.doc' :
                                            uploadType === 'VIDEO' ? 'video/*' :
                                            uploadType === 'IMAGE' ? 'image/*' : '*'}
                                />
                                {uploadFile && <small className="muted">Đã chọn: {uploadFile.name}</small>}
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => { setShowUploadModal(false); resetUploadForm(); }} disabled={uploading}>
                                Hủy
                            </button>
                            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
                                {uploading ? 'Đang upload...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && viewingResource && (
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <h3>Chi tiết tài nguyên</h3>
                        <div className="view-grid">
                            <div className="view-item">
                                <label>Tên</label>
                                <p>{viewingResource.resourceName || 'N/A'}</p>
                            </div>
                            <div className="view-item">
                                <label>Loại</label>
                                <p>{viewingResource.resourceType}</p>
                            </div>
                            <div className="view-item">
                                <label>Ngày tạo</label>
                                <p>{new Date(viewingResource.createdAt || viewingResource.uploadedAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <div className="view-item">
                                <label>Người upload</label>
                                <p>{viewingResource.uploadedByName || 'N/A'}</p>
                            </div>
                        </div>
                        {viewingResource.fileUrl && (
                            <div className="view-item full">
                                <label>URL</label>
                                <a href={viewingResource.fileUrl} target="_blank" rel="noopener noreferrer">
                                    {viewingResource.fileUrl}
                                </a>
                            </div>
                        )}
                        {viewingResource.hasExtractedContent && viewingResource.extractedContent && (
                            <div className="view-item full">
                                <label>Nội dung đã trích xuất</label>
                                <div className="extracted-content">
                                    {viewingResource.extractedContent.substring(0, 2000)}
                                    {viewingResource.extractedContent.length > 2000 && '...'}
                                </div>
                            </div>
                        )}
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Đóng</button>
                            {viewingResource.downloadUrl && (
                                <button className="btn btn-primary" onClick={() => handleDownloadResource(viewingResource)}>
                                    <Download size={16} /> Tải xuống
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deletingResourceId && (
                <div className="modal-overlay" onClick={() => setDeletingResourceId(null)}>
                    <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
                        <h3>Xác nhận xóa</h3>
                        <p>Bạn có chắc chắn muốn xóa tài nguyên này? Hành động này không thể hoàn tác.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setDeletingResourceId(null)}>Hủy</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteResource(deletingResourceId)}>Xóa</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .resource-management-page { max-width: 1200px; margin: 0 auto; }
                .page-header { margin-bottom: 1.5rem; }
                .page-header h2 { display: flex; gap: 10px; align-items: center; margin: 0 0 6px; font-size: 1.75rem; }
                .page-header p { margin: 0; color: var(--color-text-secondary); }

                .filters-section, .resources-section {
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .filters-section h3, .resources-section h3 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 0 1rem;
                    font-size: 1.1rem;
                }
                .filters-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .filter-actions {
                    display: flex;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }

                .resources-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1rem;
                }
                .resource-card {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                    padding: 1.25rem;
                    background: rgba(255,255,255,0.7);
                    border-radius: 12px;
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .resource-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }
                .resource-icon {
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(96, 78, 255, 0.1);
                    border-radius: 12px;
                    color: var(--color-accent-1);
                    flex-shrink: 0;
                }
                .resource-info {
                    flex: 1;
                    min-width: 0;
                }
                .resource-info h4 {
                    margin: 0 0 0.25rem;
                    font-size: 0.95rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .resource-type {
                    font-size: 0.75rem;
                    padding: 2px 8px;
                    background: rgba(0,0,0,0.05);
                    border-radius: 4px;
                    margin-right: 0.5rem;
                }
                .extracted-badge {
                    font-size: 0.7rem;
                    padding: 2px 6px;
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                    border-radius: 4px;
                }
                .resource-date {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--color-text-secondary);
                    margin-top: 0.5rem;
                }
                .resource-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .icon-btn {
                    padding: 6px;
                    border: none;
                    background: rgba(0,0,0,0.05);
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .icon-btn:hover {
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                }
                .icon-btn.danger:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 2rem;
                }
                .modal-content {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                }
                .modal-content.small {
                    width: 400px;
                }
                .modal-content.large {
                    width: 700px;
                }
                .modal-content h3 {
                    margin: 0 0 1.5rem;
                    font-size: 1.25rem;
                }
                .modal-actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                    margin-top: 1.5rem;
                }

                .view-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .view-item {
                    background: rgba(0,0,0,0.02);
                    padding: 0.75rem;
                    border-radius: 8px;
                }
                .view-item.full {
                    grid-column: 1 / -1;
                }
                .view-item label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.25rem;
                    text-transform: uppercase;
                }
                .view-item p {
                    margin: 0;
                    font-size: 0.95rem;
                }
                .view-item a {
                    color: var(--color-accent-1);
                    word-break: break-all;
                }
                .extracted-content {
                    max-height: 300px;
                    overflow-y: auto;
                    background: rgba(255,255,255,0.5);
                    padding: 1rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    line-height: 1.6;
                    white-space: pre-wrap;
                }

                .field { margin-bottom: 1rem; }
                .field label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; }
                .field select, .field input, .field textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    background: white;
                }
                .muted { color: var(--color-text-secondary); }

                .btn {
                    padding: 0.75rem 1.25rem;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                }
                .btn-primary {
                    background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                    color: white;
                }
                .btn-secondary {
                    background: rgba(0,0,0,0.05);
                    color: var(--color-text-secondary);
                }
                .btn-danger {
                    background: #ef4444;
                    color: white;
                }
                .btn:hover { transform: translateY(-1px); }
                .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            `}</style>
        </div>
    );
};

export default ResourceManagement;
