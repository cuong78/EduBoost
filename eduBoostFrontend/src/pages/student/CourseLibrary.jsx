import { useState } from 'react';
import { Search, Filter, PlayCircle, Clock } from 'lucide-react';

const SAMPLE_COURSES = [
    { id: 1, title: "Đạo hàm và ứng dụng", subject: "Toán", grade: "12", duration: "45m", teacher: "Thầy Hùng" },
    { id: 2, title: "Sóng cơ học", subject: "Vật Lý", grade: "12", duration: "60m", teacher: "Cô Lan" },
    { id: 3, title: "Este - Lipit", subject: "Hóa Học", grade: "12", duration: "50m", teacher: "Thầy Minh" },
    { id: 4, title: "Phương trình lượng giác", subject: "Toán", grade: "11", duration: "40m", teacher: "Thầy Hùng" },
    { id: 5, title: "Lịch sử thế giới hiện đại", subject: "Lịch Sử", grade: "12", duration: "35m", teacher: "Cô Thảo" },
    { id: 6, title: "Di truyền học", subject: "Sinh Học", grade: "12", duration: "55m", teacher: "Thầy Tuấn" },
];

const CourseLibrary = () => {
    const [selectedGrade, setSelectedGrade] = useState("All");
    const [selectedSubject, setSelectedSubject] = useState("All");

    const filteredCourses = SAMPLE_COURSES.filter(course => {
        const matchGrade = selectedGrade === "All" || course.grade === selectedGrade;
        const matchSubject = selectedSubject === "All" || course.subject === selectedSubject;
        return matchGrade && matchSubject;
    });

    return (
        <div className="course-library">
            <div className="library-header">
                <div>
                    <h1>Thư viện bài giảng</h1>
                    <p>Khám phá kho tri thức đa dạng cho mọi môn học</p>
                </div>

                <div className="filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input type="text" placeholder="Tìm kiếm bài giảng..." />
                    </div>

                    <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="filter-select">
                        <option value="All">Tất cả khối</option>
                        <option value="12">Khối 12</option>
                        <option value="11">Khối 11</option>
                        <option value="10">Khối 10</option>
                    </select>

                    <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="filter-select">
                        <option value="All">Tất cả môn</option>
                        <option value="Toán">Toán</option>
                        <option value="Vật Lý">Vật Lý</option>
                        <option value="Hóa Học">Hóa Học</option>
                        <option value="Sinh Học">Sinh Học</option>
                        <option value="Lịch Sử">Lịch Sử</option>
                    </select>
                </div>
            </div>

            <div className="course-grid">
                {filteredCourses.map(course => (
                    <div key={course.id} className="lecture-card glass">
                        <div className="video-thumbnail">
                            <div className="play-overlay">
                                <PlayCircle size={48} color="white" />
                            </div>
                            <span className="badge-grade">Lớp {course.grade}</span>
                        </div>
                        <div className="lecture-info">
                            <span className="subject-tag">{course.subject}</span>
                            <h3>{course.title}</h3>
                            <div className="lecture-meta">
                                <span><Clock size={14} /> {course.duration}</span>
                                <span>{course.teacher}</span>
                            </div>
                            <button className="btn btn-primary btn-sm">Học ngay</button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .library-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .filters {
                    display: flex;
                    gap: 1rem;
                }

                .search-box {
                    position: relative;
                    background: white;
                    border-radius: 99px;
                    padding: 0.5rem 1rem 0.5rem 2.5rem;
                    border: 1px solid #e0e0e0;
                    display: flex;
                    align-items: center;
                }
                
                .search-box svg {
                    position: absolute;
                    left: 10px;
                    color: var(--color-text-secondary);
                }

                .search-box input {
                    border: none;
                    background: transparent;
                    outline: none;
                    width: 200px;
                    padding: 0; 
                }

                .filter-select {
                    padding: 0.5rem 1.5rem;
                    border-radius: 99px;
                    border: 1px solid #e0e0e0;
                    background: white;
                    font-family: inherit;
                    cursor: pointer;
                }

                .course-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 2rem;
                }

                .lecture-card {
                    border-radius: 16px;
                    overflow: hidden;
                    transition: transform 0.2s;
                    background: white;
                }
                
                .lecture-card:hover {
                    transform: translateY(-5px);
                }

                .video-thumbnail {
                    height: 160px;
                    background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .play-overlay {
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                
                .video-thumbnail:hover .play-overlay {
                    opacity: 1;
                    transform: scale(1.1);
                }

                .badge-grade {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .lecture-info {
                    padding: 1.5rem;
                }

                .subject-tag {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--color-accent-1);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .lecture-info h3 {
                    font-size: 1.1rem;
                    margin: 0.5rem 0;
                    line-height: 1.4;
                }

                .lecture-meta {
                    display: flex;
                    gap: 1rem;
                    color: var(--color-text-secondary);
                    font-size: 0.85rem;
                    margin-bottom: 1rem;
                }
                
                .lecture-meta span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .btn-sm {
                    padding: 0.5rem 1rem;
                    font-size: 0.9rem;
                    width: 100%;
                }
            `}</style>
        </div>
    );
};

export default CourseLibrary;
