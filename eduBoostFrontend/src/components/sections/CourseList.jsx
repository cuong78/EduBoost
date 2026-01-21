import { Star, Clock } from 'lucide-react';

const courses = [
  {
    title: "Nhập môn AI cho Giáo viên",
    lessons: 12,
    rating: 4.8,
    image: "https://placehold.co/400x250/3a2e99/ffffff?text=AI+Intro"
  },
  {
    title: "Thiết kế bài giảng với ChatGPT",
    lessons: 8,
    rating: 4.9,
    image: "https://placehold.co/400x250/604eff/ffffff?text=ChatGPT+Class"
  },
  {
    title: "Tự động hóa đánh giá học sinh",
    lessons: 15,
    rating: 4.7,
    image: "https://placehold.co/400x250/8679ff/ffffff?text=Automation"
  }
];

import useScrollReveal from '../../hooks/useScrollReveal';

const CourseList = () => {
  const headerRef = useScrollReveal();
  const gridRef = useScrollReveal();

  return (
    <section className="course-list section-padding">
      <div className="container">
        <div className="section-header center-text reveal" ref={headerRef}>
          <span className="tag">Khóa học tiêu biểu</span>
          <h2>Chinh phục tri thức <br /> <span className="highlight-text">bứt phá điểm số</span></h2>
        </div>

        <div className="course-grid reveal reveal-delay-200" ref={gridRef}>
          {courses.map((course, index) => (
            <div key={index} className="course-card glass">
              <div className="card-image">
                <img src={course.image} alt={course.title} />
              </div>
              <div className="card-content">
                <h3>{course.title}</h3>
                <div className="card-meta">
                  <span><Clock size={16} /> {course.lessons} bài học</span>
                  <span><Star size={16} fill="#FFD700" color="#FFD700" /> {course.rating}</span>
                </div>
                <button className="btn btn-glass" style={{ width: '100%', marginTop: '1rem' }}>Xem chi tiết</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .courses {
          padding: 4rem 0;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .course-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .course-card {
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s;
        }

        .course-card:hover {
          transform: translateY(-5px);
        }

        .card-image img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .card-content {
          padding: 1.5rem;
        }

        .card-content h3 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }
        
        .card-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>
    </section>
  );
};

export default CourseList;
