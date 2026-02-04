import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Book, MoreVertical, Search, ArrowRight } from 'lucide-react';
import { subjectService } from '../../services/subjectService';

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({ name: '', grade: '', description: '' });

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const data = await subjectService.getSubjects();
            setSubjects(data);
        } catch (error) {
            console.error("Failed to load subjects", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await subjectService.createSubject(formData);
            setShowModal(false);
            setFormData({ name: '', grade: '', description: '' });
            loadSubjects();
        } catch (error) {
            console.error("Failed to create", error);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản lý Môn học</h1>
                    <p className="page-subtitle">Thiết lập chương trình học, khối lớp và nội dung</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <Plus size={20} /> Thêm môn học
                </button>
            </div>

            <div className="subjects-grid">
                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : subjects.map(subject => (
                    <Link to={`/teacher/subjects/${subject.id}`} key={subject.id} className="subject-card glass">
                        <div className="card-icon">
                            <Book size={32} />
                        </div>
                        <div className="card-content">
                            <div className="card-header">
                                <span className="grade-badge">Lớp {subject.grade}</span>
                                <button className="more-btn" onClick={(e) => {
                                    e.preventDefault();
                                    // Handle menu
                                }}><MoreVertical size={16} /></button>
                            </div>
                            <h3>{subject.name}</h3>
                            <p>{subject.description || 'Chưa có mô tả'}</p>

                            <div className="card-footer">
                                <span>Quản lý chương & bài học</span>
                                <ArrowRight size={16} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2>Tạo môn học mới</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Tên môn học</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ví dụ: Toán Cao Cấp"
                                />
                            </div>
                            <div className="form-group">
                                <label>Khối lớp / Trình độ</label>
                                <input
                                    type="text" required
                                    value={formData.grade}
                                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                                    placeholder="10, 11, 12..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả ngắn</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Mô tả về môn học này..."
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Hủy</button>
                                <button type="submit" className="btn btn-primary">Tạo mới</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .page-title { font-size: 1.75rem; font-weight: 800; color: var(--color-text-primary); margin: 0; }
                .page-subtitle { color: var(--color-text-secondary); }

                .subjects-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .subject-card {
                    display: flex;
                    flex-direction: column;
                    padding: 1.5rem;
                    border-radius: 16px;
                    background: white;
                    transition: all 0.3s;
                    text-decoration: none;
                    color: inherit;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .subject-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    border-color: var(--color-accent-1);
                }

                .card-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--color-accent-1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.5rem;
                }

                .grade-badge {
                    background: #f3f4f6;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--color-text-secondary);
                }

                .subject-card h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: var(--color-text-primary);
                }

                .subject-card p {
                    font-size: 0.9rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .card-footer {
                    margin-top: auto;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--color-accent-1);
                }

                .more-btn {
                    background: transparent;
                    border: none;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                }
                .more-btn:hover { background: rgba(0,0,0,0.05); }

                /* Modal */
                .modal-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 100;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white; padding: 2rem; border-radius: 16px;
                    width: 100%; max-width: 500px;
                }
                .modal-content h2 { margin-bottom: 1.5rem; font-size: 1.5rem; }
                
                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem;}
                .form-group input, .form-group textarea {
                    width: 100%; padding: 0.75rem;
                    border: 1px solid #e5e7eb; border-radius: 8px;
                    font-family: inherit;
                }
                .form-group textarea { height: 100px; resize: vertical; }
                
                .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
            `}</style>
        </div>
    );
};

export default SubjectManagement;
