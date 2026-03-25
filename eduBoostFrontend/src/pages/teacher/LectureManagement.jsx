import { useState } from 'react';
import { Search, Plus, MoreVertical, FileText, Video, Clock, X, FileType, Presentation } from 'lucide-react';
import { Link } from 'react-router-dom';

const LectureManagement = () => {
    const [showModal, setShowModal] = useState(false);

    const lectures = [
        { id: 1, title: 'Giới thiệu về Giải tích', course: 'Toán Cao Cấp', status: 'Published', date: '20 Th1, 2024', type: 'Video' },
        { id: 2, title: 'Các định luật Newton', course: 'Vật lý 101', status: 'Draft', date: '22 Th1, 2024', type: 'Article' },
        { id: 3, title: 'Hóa học hữu cơ cơ bản', course: 'Hóa học', status: 'Published', date: '25 Th1, 2024', type: 'Video' },
    ];

    return (
        <div className="page-container relative">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản Lý Bài Giảng</h1>
                    <p className="page-subtitle">Quản lý nội dung khóa học và tài liệu của bạn</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary add-lecture-btn">
                    <Plus size={20} /> Thêm bài giảng mới
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar glass">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài giảng..."
                        className="search-input"
                    />
                </div>
                <select className="filter-select">
                    <option>Tất cả khóa học</option>
                    <option>Toán học</option>
                    <option>Vật lý</option>
                </select>
                <select className="filter-select">
                    <option>Tất cả trạng thái</option>
                    <option>Đã xuất bản</option>
                    <option>Bản nháp</option>
                </select>
            </div>

            {/* List */}
            <div className="table-container glass">
                <table className="lectures-table">
                    <thead>
                        <tr>
                            <th>Tên bài giảng</th>
                            <th>Khóa học</th>
                            <th>Loại</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lectures.map(lecture => (
                            <tr key={lecture.id}>
                                <td>
                                    <div className="lecture-title">{lecture.title}</div>
                                </td>
                                <td className="text-secondary">{lecture.course}</td>
                                <td>
                                    <span className="type-badge">
                                        {lecture.type === 'Video' ? <Video size={16} /> : <FileText size={16} />}
                                        {lecture.type}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${lecture.status.toLowerCase()}`}>
                                        {lecture.status === 'Published' ? 'Đã đăng' : 'Bản nháp'}
                                    </span>
                                </td>
                                <td className="text-secondary">{lecture.date}</td>
                                <td>
                                    <button className="icon-btn">
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <button onClick={() => setShowModal(false)} className="close-btn">
                            <X size={24} />
                        </button>
                        <h2 className="modal-title">Chọn loại bài giảng</h2>
                        <p className="modal-subtitle">Bạn muốn tạo nội dung bài giảng theo định dạng nào?</p>

                        <div className="options-grid">
                            <Link to="/teacher/lectures/doc" className="option-card">
                                <div className="icon-box blue">
                                    <FileType size={32} />
                                </div>
                                <h3>Soạn thảo tài liệu</h3>
                                <p>Soạn thảo bài giảng dạng văn bản, chèn ảnh, video tương tự như Microsoft Word.</p>
                            </Link>

                            <Link to="/teacher/lectures/slide" className="option-card">
                                <div className="icon-box orange">
                                    <Presentation size={32} />
                                </div>
                                <h3>Tải lên Slide</h3>
                                <p>Tải lên file PowerPoint hoặc PDF để trình chiếu cho học sinh.</p>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .page-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .page-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--color-text-primary);
                    margin: 0;
                }
                .page-subtitle { color: var(--color-text-secondary); }

                .add-lecture-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .filter-bar {
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    display: flex;
                    gap: 1rem;
                }

                .search-wrapper {
                    position: relative;
                    flex: 1;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .search-input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.5rem;
                    border-radius: 8px;
                    border: 1px solid rgba(0,0,0,0.1);
                    background: rgba(255,255,255,0.8);
                    font-family: inherit;
                    font-size: 0.95rem;
                }
                .search-input:focus {
                    outline: none;
                    border-color: var(--color-accent-1);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .filter-select {
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    border: 1px solid rgba(0,0,0,0.1);
                    background: rgba(255,255,255,0.8);
                    color: var(--color-text-secondary);
                    font-family: inherit;
                    cursor: pointer;
                }
                .filter-select:focus {
                    outline: none;
                    border-color: var(--color-accent-1);
                }

                .table-container {
                    border-radius: 12px;
                    overflow: hidden;
                    background: white;
                }

                .lectures-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .lectures-table th {
                    text-align: left;
                    padding: 1rem 1.5rem;
                    background: rgba(243, 244, 246, 0.5);
                    border-bottom: 1px solid var(--ds-border);
                    color: var(--color-text-secondary);
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .lectures-table td {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid var(--ds-border-light);
                    vertical-align: middle;
                }

                .lectures-table tr:hover {
                    background-color: rgba(249, 250, 251, 0.8);
                }

                .lecture-title {
                    font-weight: 600;
                    color: var(--color-text-primary);
                }

                .text-secondary {
                    color: var(--color-text-secondary);
                    font-size: 0.9rem;
                }

                .type-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.9rem;
                    color: var(--color-text-secondary);
                }

                .status-badge {
                    padding: 4px 12px;
                    border-radius: 99px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: capitalize;
                }

                .status-badge.published {
                    background: var(--ds-success-bg);
                    color: #047857;
                }
                
                .status-badge.draft {
                    background: var(--ds-warning-bg);
                    color: #b45309;
                }

                .icon-btn {
                    padding: 8px;
                    border-radius: 50%;
                    border: none;
                    background: transparent;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }
                .icon-btn:hover {
                    background: var(--ds-border-light);
                    color: var(--color-text-primary);
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                    animation: fadeIn 0.2s ease-out;
                }

                .modal-content {
                    width: 100%;
                    max-width: 600px;
                    padding: 2.5rem;
                    border-radius: 24px;
                    position: relative;
                    background: white;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
                    animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .close-btn {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 50%;
                    transition: all 0.2s;
                }
                .close-btn:hover { background: #f1f5f9; color: var(--ds-error); }

                .modal-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--color-text-primary);
                    margin-bottom: 0.5rem;
                    text-align: center;
                }

                .modal-subtitle {
                    text-align: center;
                    color: var(--color-text-secondary);
                    margin-bottom: 2rem;
                }

                .options-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .option-card {
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-decoration: none;
                    color: inherit;
                }
                .option-card:hover {
                    border-color: var(--color-accent-1);
                    background: white;
                    box-shadow: 0 10px 30px rgba(99, 102, 241, 0.1);
                    transform: translateY(-4px);
                }

                .icon-box {
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
                .icon-box.blue { background: #e0e7ff; color: var(--ds-primary); }
                .icon-box.orange { background: #ffedd5; color: #f97316; }

                .option-card h3 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--color-text-primary);
                    margin-bottom: 0.5rem;
                }

                .option-card p {
                    font-size: 0.9rem;
                    color: var(--color-text-secondary);
                    line-height: 1.5;
                }

                @keyframes scaleUp {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default LectureManagement;
