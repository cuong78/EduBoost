import { ArrowRight, Sparkles } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

const Hero = () => {
  const heroRef = useScrollReveal();

  return (
    <section className="hero" ref={heroRef}>
      <div className="container hero-content reveal is-visible"> {/* Force visible on load for Hero */}
        <div className="hero-text">
          <div className="badge">
            <Sparkles size={16} />
            <span>Cách mạng giáo dục 4.0</span>
          </div>
          <h1>
            Giáo viên thời đại <br />
            <span className="gradient-text">AI mới</span> với EduBoost
          </h1>
          <p className="subtitle">
            Tự động hóa giáo án, cá nhân hóa lộ trình học, và đồng hành cùng học sinh 24/7.
            Nền tảng AI toàn diện dành cho giáo dục Việt Nam.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary">
              Trải nghiệm ngay <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </button>
            <button className="btn btn-glass">Xem Demo</button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-circle"></div>
          <div className="visual-card-1 glass">
            <span>🤖 AI Tutor</span>
            <div className="loading-bar"></div>
          </div>
          <div className="visual-card-2 glass">
            <span>✨ 100+ Bài giảng</span>
          </div>
        </div>
      </div>

      <style>{`
        .hero {
          padding: 8rem 0 6rem; /* Increased top padding since navbar is floating */
          position: relative;
          overflow: visible;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.5rem 1.25rem;
          background: white;
          border-radius: 99px;
          color: var(--color-accent-dark);
          font-weight: 700;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          font-size: 0.9rem;
        }

        h1 {
          font-size: 4rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -1.5px;
          color: var(--color-text-primary);
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          font-size: 1.25rem;
          line-height: 1.7;
          color: var(--color-text-secondary);
          margin-bottom: 3rem;
          max-width: 540px;
        }

        .hero-actions {
          display: flex;
          gap: 1.5rem;
        }

        .hero-visual {
          position: relative;
          height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Ambient Glow behind visual */
        .visual-circle {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 60%, transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
          position: absolute;
          /* animation: pulse 8s ease-in-out infinite; */
        }

        .visual-card-1 {
          position: absolute;
          top: 15%;
          left: 0%;
          padding: 1.5rem;
          border-radius: 20px;
          width: 220px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          animation: float 6s ease-in-out infinite;
          z-index: 2;
        }

        .visual-card-2 {
          position: absolute;
          bottom: 25%;
          right: 5%;
          padding: 1.25rem;
          border-radius: 20px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          animation: float 8s ease-in-out infinite 0.5s;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 2;
          font-weight: 600;
        }

        .loading-bar {
          height: 8px;
          background: #EEF2FF;
          border-radius: 4px;
          margin-top: 12px;
          width: 100%;
          overflow: hidden;
        }
        
        .loading-bar::after {
            content: "";
            display: block;
            width: 60%;
            height: 100%;
            background: var(--color-accent-1);
            border-radius: 4px;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }

        @media (max-width: 968px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
          
          .hero-actions {
            justify-content: center;
          }
          
          .badge {
            margin: 0 auto 2rem;
          }

          .hero-visual {
            height: 400px;
            margin-top: 2rem;
          }
          
          h1 {
            font-size: 3rem;
          }
          
          .subtitle {
            margin: 0 auto 2.5rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
