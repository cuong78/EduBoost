import { useState } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Video, Save, ArrowLeft, UploadCloud, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const ToolbarButton = ({ icon: Icon, active, onClick }) => (
    <button
        className={`toolbar-btn ${active ? 'active' : ''}`}
        onClick={onClick}
    >
        <Icon size={18} />
    </button>
);

const LectureEditorDoc = () => {
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [content, setContent] = useState('');
    const [attachments, setAttachments] = useState([]);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachments([...attachments, { name: file.name, type: file.type, size: (file.size / 1024).toFixed(1) + ' KB' }]);
        }
    };

    const removeAttachment = (index) => {
        const newAtt = [...attachments];
        newAtt.splice(index, 1);
        setAttachments(newAtt);
    };

    return (
        <div className="editor-container">
            {/* Top Bar */}
            <div className="top-bar glass">
                <div className="flex items-center gap-4">
                    <Link to="/teacher/lectures" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <input
                        type="text"
                        placeholder="Nhập tiêu đề bài giảng..."
                        className="title-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="save-status">{isSaving ? 'Đang lưu...' : 'Đã lưu bản nháp'}</span>
                    <button className="btn btn-primary save-btn" onClick={handleSave}>
                        <Save size={18} /> Xuất bản
                    </button>
                </div>
            </div>

            <div className="editor-layout">
                {/* Main Editor */}
                <div className="main-editor glass">
                    <div className="toolbar">
                        <div className="tool-group">
                            <ToolbarButton icon={Bold} />
                            <ToolbarButton icon={Italic} />
                            <ToolbarButton icon={Underline} />
                        </div>
                        <div className="divider"></div>
                        <div className="tool-group">
                            <ToolbarButton icon={AlignLeft} active />
                            <ToolbarButton icon={AlignCenter} />
                            <ToolbarButton icon={AlignRight} />
                        </div>
                        <div className="divider"></div>
                        <div className="tool-group">
                            <ToolbarButton icon={ImageIcon} />
                            <ToolbarButton icon={Video} />
                        </div>
                    </div>

                    <div
                        className="editor-content"
                        contentEditable
                        suppressContentEditableWarning
                        data-placeholder="Bắt đầu soạn thảo nội dung bài giảng tại đây..."
                    >
                        <h2>1. Giới thiệu</h2>
                        <p>Nhập nội dung bài học của bạn...</p>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="editor-sidebar glass">
                    <h3 className="sidebar-title">Tài liệu đính kèm</h3>

                    <div className="upload-box" onClick={() => document.getElementById('file-upload').click()}>
                        <UploadCloud size={32} />
                        <p>Kéo thả hoặc nhấn để tải file</p>
                        <input id="file-upload" type="file" hidden onChange={handleFileUpload} />
                    </div>

                    <div className="attachments-list">
                        {attachments.map((file, idx) => (
                            <div key={idx} className="attachment-item">
                                <div className="file-icon">DOC</div>
                                <div className="file-info">
                                    <div className="file-name">{file.name}</div>
                                    <div className="file-size">{file.size}</div>
                                </div>
                                <button className="remove-btn" onClick={() => removeAttachment(idx)}>
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .editor-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1.5rem;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .top-bar {
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .back-btn {
                    padding: 8px;
                    border-radius: 8px;
                    color: var(--color-text-secondary);
                    transition: background 0.2s;
                }
                .back-btn:hover { background: #f1f5f9; color: var(--color-text-primary); }

                .title-input {
                    font-size: 1.25rem;
                    font-weight: 700;
                    border: none;
                    background: transparent;
                    width: 400px;
                    outline: none;
                    color: var(--color-text-primary);
                }
                .title-input::placeholder { color: #cbd5e1; }

                .save-status {
                    font-size: 0.85rem;
                    color: #94a3b8;
                    margin-right: 1rem;
                }

                .save-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .editor-layout {
                    flex: 1;
                    display: flex;
                    gap: 1.5rem;
                    overflow: hidden;
                }

                .main-editor {
                    flex: 1;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    background: white;
                }

                .toolbar {
                    padding: 0.75rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: #f8fafc;
                }

                .tool-group {
                    display: flex;
                    gap: 4px;
                }

                .toolbar-btn {
                    padding: 6px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .toolbar-btn:hover { background: #e2e8f0; color: #334155; }
                .toolbar-btn.active { background: #e0e7ff; color: var(--ds-primary-hover); }

                .divider {
                    width: 1px;
                    height: 24px;
                    background: #cbd5e1;
                }

                .editor-content {
                    flex: 1;
                    padding: 3rem;
                    outline: none;
                    overflow-y: auto;
                    font-size: 1.05rem;
                    line-height: 1.8;
                    color: #334155;
                }
                .editor-content:empty::before {
                    content: attr(data-placeholder);
                    color: #cbd5e1;
                }
                .editor-content h2 { color: #1e293b; margin-bottom: 1rem; }

                .editor-sidebar {
                    width: 300px;
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                }

                .sidebar-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #334155;
                    margin-bottom: 1rem;
                }

                .upload-box {
                    border: 2px dashed #e2e8f0;
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 1.5rem;
                }
                .upload-box:hover {
                    border-color: var(--ds-primary);
                    color: var(--ds-primary);
                    background: var(--ds-primary-bg);
                }
                .upload-box p { font-size: 0.85rem; margin-top: 0.5rem; }

                .attachments-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .attachment-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0.75rem;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #f1f5f9;
                }

                .file-icon {
                    width: 36px;
                    height: 36px;
                    background: var(--ds-info);
                    color: white;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .file-info { flex: 1; overflow: hidden; }
                .file-name { font-size: 0.85rem; font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .file-size { font-size: 0.75rem; color: #94a3b8; }

                .remove-btn {
                    padding: 4px;
                    border: none;
                    background: transparent;
                    color: #cbd5e1;
                    cursor: pointer;
                }
                .remove-btn:hover { color: var(--ds-error); }
            `}</style>
        </div>
    );
};

export default LectureEditorDoc;
