import { useState } from 'react';
import { BookOpen, Users, Brain, Target, Zap, Award } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

const Features = () => {
  const [activeTab, setActiveTab] = useState('learner');
  const headerRef = useScrollReveal();
  const contentRef = useScrollReveal();

  const LEARNER_FEATURES = [
    { icon: <Brain size={24} />, title: "Lộ trình cá nhân hóa", desc: "AI phân tích điểm mạnh/yếu để đề xuất bài học phù hợp." },
    { icon: <Zap size={24} />, title: "Học tập tương tác", desc: "Video bài giảng kết hợp câu hỏi trắc nghiệm thời gian thực." },
    { icon: <Award size={24} />, title: "Chứng chỉ uy tín", desc: "Hoàn thành khóa học và nhận chứng nhận năng lực." }
  ];

  const TEACHER_FEATURES = [
    { icon: <Users size={24} />, title: "Quản lý lớp học", desc: "Theo dõi tiến độ học tập của từng học sinh dễ dàng." },
    { icon: <Target size={24} />, title: "Ngân hàng đề thi", desc: "Tạo đề thi tự động từ kho dữ liệu phong phú." },
    { icon: <BookOpen size={24} />, title: "Thư viện bài giảng", desc: "Chia sẻ và kiếm tiền từ tri thức của bạn." }
  ];

  const content = {
    teacher: {
      title: "Dành cho Giáo viên",
      items: TEACHER_FEATURES,
      image: "https://placehold.co/600x400/604eff/ffffff?text=Teacher+Dashboard"
    },
    learner: {
      title: "Dành cho Học viên",
      items: LEARNER_FEATURES,
      image: "https://placehold.co/600x400/8679ff/ffffff?text=Student+Learning"
    }
  };

  return (
    <section className="features">
      <div className="container">
        <div className="tabs reveal" ref={headerRef}>
          <button
            className={`tab-btn ${activeTab === 'teacher' ? 'active' : ''}`}
            onClick={() => setActiveTab('teacher')}
          >
            Dành cho Giáo viên
          </button>
          <button
            className={`tab-btn ${activeTab === 'learner' ? 'active' : ''}`}
            onClick={() => setActiveTab('learner')}
          >
            Dành cho Học viên
          </button>
        </div>

        <div className="feature-content glass reveal reveal-delay-200" ref={contentRef}>
          <div className="feature-text">
            <h2>{content[activeTab].title}</h2>
            <div className="feature-grid">
              {content[activeTab].items.map((item, index) => (
                <div key={index} className="feature-item">
                  <div className="icon-wrapper">
                    {item.icon}
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginTop: '2rem' }}>Tìm hiểu thêm</button>
          </div>
          <div className="feature-image">
            <img src={content[activeTab].image} alt={content[activeTab].title} />
          </div>
        </div>
      </div>

      <style>{`
                .features {
                    padding: 6rem 0;
                }

                .tabs {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 3rem;
                }

                .tab-btn {
                    padding: 0.75rem 2rem;
                    border-radius: 99px;
                    border: none;
                    background: rgba(255, 255, 255, 0.5);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    color: var(--color-text-secondary);
                    font-family: inherit;
                    font-size: 1rem;
                }

                .tab-btn:hover {
                    background: white;
                    color: var(--color-accent-1);
                }

                .tab-btn.active {
                    background: var(--color-accent-1);
                    color: white;
                    box-shadow: 0 4px 12px rgba(96, 78, 255, 0.3);
                }

                .feature-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    padding: 3rem;
                    border-radius: 32px;
                    align-items: center;
                }

                .feature-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    margin-top: 2rem;
                }

                .feature-item {
                    display: flex;
                    gap: 1.5rem;
                    align-items: flex-start;
                }

                .icon-wrapper {
                    color: var(--color-accent-1);
                    min-width: 24px;
                    margin-top: 4px;
                    padding: 8px;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 12px;
                }

                .feature-image img {
                    width: 100%;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    transform: perspective(1000px) rotateY(-5deg);
                    transition: transform 0.3s;
                }
                
                .feature-content:hover .feature-image img {
                    transform: perspective(1000px) rotateY(0deg) scale(1.02);
                }

                h2 {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }

                h3 {
                    font-size: 1.25rem;
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                }
                
                p {
                    color: var(--color-text-secondary);
                }

                @media (max-width: 968px) {
                    .feature-content {
                        grid-template-columns: 1fr;
                        padding: 1.5rem;
                    }
                    .feature-image {
                        order: -1;
                        margin-bottom: 2rem;
                    }
                    .feature-image img {
                         transform: none;
                    }
                }
            `}</style>
    </section>
  );
};

export default Features;
