import { useState } from 'react';
import { ArrowLeft, Upload, Play, MoreHorizontal, Grid, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const LectureEditorSlide = () => {
    const [title, setTitle] = useState('');
    const [activeSlide, setActiveSlide] = useState(0);

    const [slides, setSlides] = useState([
        { id: 1, content: "Slide 1: Giới thiệu" },
        { id: 2, content: "Slide 2: Nội dung chính" },
        { id: 3, content: "Slide 3: Kết luận" },
    ]);

    const handleAddSlide = () => {
        const newId = slides.length + 1;
        setSlides([...slides, { id: newId, content: `Slide ${newId}: Trang mới` }]);
    };

    return (
        <div className="slide-editor-container">
            {/* Header */}
            <div className="editor-header glass">
                <div className="flex items-center gap-4">
                    <Link to="/teacher/lectures" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            placeholder="Tiêu đề bài giảng..."
                            className="slide-title-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <span className="slide-count">{slides.length} trang</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn-primary flex items-center gap-2">
                        <Upload size={18} /> Tải lên PPT/PDF
                    </button>
                    <button className="btn btn-outline flex items-center gap-2">
                        <Play size={18} /> Trình chiếu
                    </button>
                </div>
            </div>

            <div className="slide-workspace">
                {/* Sidebar Thumbnails */}
                <div className="slide-sidebar glass">
                    <div className="sidebar-actions">
                        <button className="add-slide-btn" onClick={handleAddSlide}>
                            <Plus size={20} /> Thêm trang
                        </button>
                        <button className="view-mode-btn"><Grid size={18} /></button>
                    </div>

                    <div className="thumbnails-scroll">
                        {slides.map((slide, idx) => (
                            <div
                                key={slide.id}
                                className={`thumbnail-card ${activeSlide === idx ? 'active' : ''}`}
                                onClick={() => setActiveSlide(idx)}
                            >
                                <div className="slide-number">{idx + 1}</div>
                                <div className="slide-mini-preview">
                                    <div className="mini-content"></div>
                                    <div className="mini-line"></div>
                                    <div className="mini-line short"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Preview */}
                <div className="main-preview-area glass">
                    <div className="current-slide">
                        <div className="slide-content-mock">
                            <h1>{slides[activeSlide].content}</h1>
                            <p>Nội dung trình bày sẽ hiển thị ở đây. Bạn có thể chỉnh sửa hoặc thay thế bằng hình ảnh từ file upload.</p>
                            <div className="mock-chart">
                                <div className="bar" style={{ height: '60%' }}></div>
                                <div className="bar" style={{ height: '80%' }}></div>
                                <div className="bar" style={{ height: '40%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="slide-controls">
                        <button disabled={activeSlide === 0} onClick={() => setActiveSlide(a => a - 1)}>Trước</button>
                        <span>Trang {activeSlide + 1} / {slides.length}</span>
                        <button disabled={activeSlide === slides.length - 1} onClick={() => setActiveSlide(a => a + 1)}>Sau</button>
                    </div>
                </div>
            </div>

            <style>{`
                .slide-editor-container {
                    max-width: 100vw;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: #f1f5f9;
                    overflow: hidden;
                }

                .editor-header {
                    padding: 1rem 2rem;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .back-btn {
                    padding: 8px;
                    border-radius: 50%;
                    color: #64748b;
                    background: #f8fafc;
                    transition: all 0.2s;
                    display: flex;
                }
                .back-btn:hover { background: #e2e8f0; color: #1e293b; }

                .slide-title-input {
                    font-size: 1.1rem;
                    font-weight: 700;
                    border: none;
                    outline: none;
                    background: transparent;
                    color: #1e293b;
                }
                .slide-count { font-size: 0.8rem; color: #94a3b8; }

                .btn-outline {
                    border: 1px solid #cbd5e1;
                    background: white;
                    color: #475569;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .slide-workspace {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                /* Sidebar */
                .slide-sidebar {
                    width: 250px;
                    background: white;
                    border-right: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                }

                .sidebar-actions {
                    padding: 1rem;
                    display: flex;
                    gap: 0.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .add-slide-btn {
                    flex: 1;
                    background: #e0e7ff;
                    color: var(--ds-primary-hover);
                    border: none;
                    padding: 0.5rem;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 0.9rem;
                }
                .view-mode-btn {
                    width: 36px;
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    color: #64748b;
                    cursor: pointer;
                }

                .thumbnails-scroll {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .thumbnail-card {
                    display: flex;
                    gap: 8px;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: all 0.2s;
                }
                .thumbnail-card:hover { opacity: 1; }
                .thumbnail-card.active { opacity: 1; }
                .thumbnail-card.active .slide-mini-preview {
                    border-color: var(--ds-primary);
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
                }

                .slide-number {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #94a3b8;
                    width: 20px;
                }

                .slide-mini-preview {
                    flex: 1;
                    aspect-ratio: 16/9;
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .mini-content { width: 60%; height: 8px; background: #cbd5e1; border-radius: 2px; }
                .mini-line { width: 90%; height: 4px; background: #f1f5f9; border-radius: 2px; }
                .mini-line.short { width: 40%; }


                /* Main Area */
                .main-preview-area {
                    flex: 1;
                    background: #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    position: relative;
                }

                .current-slide {
                    width: 100%;
                    max-width: 900px;
                    aspect-ratio: 16/9;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;
                }

                .slide-content-mock {
                    text-align: center;
                    width: 100%;
                }
                .slide-content-mock h1 { font-size: 2.5rem; margin-bottom: 1.5rem; color: #1e293b; }
                .slide-content-mock p { color: #64748b; font-size: 1.2rem; max-width: 600px; margin: 0 auto 3rem; }

                .mock-chart {
                    height: 200px;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    gap: 20px;
                }
                .bar { width: 40px; background: var(--ds-primary); border-radius: 4px 4px 0 0; opacity: 0.8; }
                .bar:nth-child(2) { background: #a855f7; }
                .bar:nth-child(3) { background: var(--ds-warning); }

                .slide-controls {
                    position: absolute;
                    bottom: 2rem;
                    background: white;
                    padding: 0.5rem 1rem;
                    border-radius: 99px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .slide-controls button {
                    background: none;
                    border: none;
                    font-weight: 600;
                    color: var(--ds-primary);
                    cursor: pointer;
                }
                .slide-controls button:disabled { color: #cbd5e1; cursor: not-allowed; }
                .slide-controls span { font-size: 0.9rem; color: #64748b; }
            `}</style>
        </div>
    );
};

export default LectureEditorSlide;
