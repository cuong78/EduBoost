import { useState, useEffect } from "react";
import {
  BookOpen, HelpCircle, AlertTriangle, CheckCircle,
  RefreshCw, Search, ChevronDown, ChevronRight, Loader2,
} from "lucide-react";
import { adminResourceService } from "../../services/adminResourceService";

const LessonCoverage = () => {
  const [tab, setTab] = useState("resources"); // "resources" | "questions"
  const [data, setData] = useState({ resources: [], questions: [] });
  const [loading, setLoading] = useState({ resources: false, questions: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsed, setCollapsed] = useState({});

  const load = async (type) => {
    setLoading((l) => ({ ...l, [type]: true }));
    try {
      const result =
        type === "resources"
          ? await adminResourceService.getLessonsWithoutResources()
          : await adminResourceService.getLessonsWithoutQuestions();
      setData((d) => ({ ...d, [type]: Array.isArray(result) ? result : [] }));
    } catch (e) {
      console.error("Coverage load error", e);
    } finally {
      setLoading((l) => ({ ...l, [type]: false }));
    }
  };

  useEffect(() => {
    load("resources");
    load("questions");
  }, []);

  const current = data[tab];
  const filtered = current.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      item.lessonName?.toLowerCase().includes(q) ||
      item.chapterName?.toLowerCase().includes(q) ||
      item.subjectName?.toLowerCase().includes(q) ||
      String(item.gradeLevel).includes(q)
    );
  });

  // Group: gradeLevel → subjectName → chapterName → lessons[]
  const grouped = filtered.reduce((acc, item) => {
    const g = `Lớp ${item.gradeLevel}`;
    const s = item.subjectName;
    const c = `Chương ${item.chapterNumber}: ${item.chapterName}`;
    if (!acc[g]) acc[g] = {};
    if (!acc[g][s]) acc[g][s] = {};
    if (!acc[g][s][c]) acc[g][s][c] = [];
    acc[g][s][c].push(item);
    return acc;
  }, {});

  const toggle = (key) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const isLoading = loading[tab];

  return (
    <div className="lesson-coverage-page">
      <div className="page-header">
        <div>
          <h2><AlertTriangle size={22} style={{ color: "#f59e0b" }} /> Kiểm tra độ phủ nội dung</h2>
          <p>Xem bài học nào chưa có tài nguyên / câu hỏi để import bổ sung</p>
        </div>
        <button
          className="btn btn-glass"
          onClick={() => { load("resources"); load("questions"); }}
        >
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Summary cards */}
      <div className="coverage-summary">
        <div
          className={`coverage-card glass ${tab === "resources" ? "active" : ""}`}
          onClick={() => setTab("resources")}
        >
          <BookOpen size={28} style={{ color: "#6366f1" }} />
          <div>
            <p className="card-count" style={{ color: data.resources.length > 0 ? "#ef4444" : "#22c55e" }}>
              {loading.resources ? "..." : data.resources.length}
            </p>
            <p className="card-label">Bài chưa có Tài nguyên</p>
          </div>
          {data.resources.length === 0 && !loading.resources && (
            <CheckCircle size={20} style={{ color: "#22c55e", marginLeft: "auto" }} />
          )}
        </div>
        <div
          className={`coverage-card glass ${tab === "questions" ? "active" : ""}`}
          onClick={() => setTab("questions")}
        >
          <HelpCircle size={28} style={{ color: "#8b5cf6" }} />
          <div>
            <p className="card-count" style={{ color: data.questions.length > 0 ? "#ef4444" : "#22c55e" }}>
              {loading.questions ? "..." : data.questions.length}
            </p>
            <p className="card-label">Bài chưa có Câu hỏi</p>
          </div>
          {data.questions.length === 0 && !loading.questions && (
            <CheckCircle size={20} style={{ color: "#22c55e", marginLeft: "auto" }} />
          )}
        </div>
      </div>

      {/* Search */}
      <div className="coverage-search glass">
        <Search size={18} />
        <input
          placeholder="Tìm theo tên bài, chương, môn, lớp..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {filtered.length > 0 && (
          <span className="search-count">{filtered.length} bài</span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="coverage-empty glass">
          <Loader2 size={36} style={{ animation: "spin 1s linear infinite" }} />
          <p>Đang kiểm tra...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="coverage-empty glass">
          <CheckCircle size={48} style={{ color: "#22c55e" }} />
          <p style={{ color: "#22c55e", fontWeight: 600 }}>
            {current.length === 0
              ? `Tất cả bài học đều đã có ${tab === "resources" ? "tài nguyên" : "câu hỏi"} ✓`
              : "Không tìm thấy kết quả"}
          </p>
        </div>
      ) : (
        <div className="coverage-tree glass">
          {Object.entries(grouped).map(([grade, subjects]) => {
            const gradeKey = `g-${grade}`;
            const gradeOpen = !collapsed[gradeKey];
            const gradeCount = Object.values(subjects)
              .flatMap((s) => Object.values(s))
              .flat().length;

            return (
              <div key={grade} className="tree-grade">
                <button className="tree-toggle grade-toggle" onClick={() => toggle(gradeKey)}>
                  {gradeOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span className="grade-badge">📚 {grade}</span>
                  <span className="count-badge">{gradeCount} bài</span>
                </button>

                {gradeOpen && Object.entries(subjects).map(([subject, chapters]) => {
                  const subjectKey = `s-${grade}-${subject}`;
                  const subjectOpen = !collapsed[subjectKey];
                  const subjectCount = Object.values(chapters).flat().length;

                  return (
                    <div key={subject} className="tree-subject">
                      <button className="tree-toggle subject-toggle" onClick={() => toggle(subjectKey)}>
                        {subjectOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span className="subject-name">📖 {subject}</span>
                        <span className="count-badge muted">{subjectCount} bài</span>
                      </button>

                      {subjectOpen && Object.entries(chapters).map(([chapter, lessons]) => {
                        const chapterKey = `c-${grade}-${subject}-${chapter}`;
                        const chapterOpen = !collapsed[chapterKey];

                        return (
                          <div key={chapter} className="tree-chapter">
                            <button className="tree-toggle chapter-toggle" onClick={() => toggle(chapterKey)}>
                              {chapterOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                              <span className="chapter-name">📂 {chapter}</span>
                              <span className="count-badge danger">{lessons.length} bài thiếu</span>
                            </button>

                            {chapterOpen && (
                              <div className="tree-lessons">
                                {lessons.map((lesson) => (
                                  <div key={lesson.lessonId} className="lesson-row">
                                    <AlertTriangle size={14} style={{ color: "#f59e0b", flexShrink: 0 }} />
                                    <span className="lesson-name">
                                      Bài {lesson.lessonNumber}: {lesson.lessonName}
                                    </span>
                                    <span className="lesson-id">ID: {lesson.lessonId}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .lesson-coverage-page { max-width: 1100px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
        .page-header h2 { display: flex; align-items: center; gap: 10px; margin: 0 0 4px; font-size: 1.6rem; }
        .page-header p { margin: 0; color: var(--color-text-secondary); font-size: 0.9rem; }

        .coverage-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
        .coverage-card {
          display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem;
          border-radius: 14px; cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.25s;
        }
        .coverage-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        .coverage-card.active { border-color: var(--color-accent-1); }
        .card-count { font-size: 2rem; font-weight: 800; line-height: 1; margin: 0 0 4px; }
        .card-label { font-size: 0.85rem; color: var(--color-text-secondary); margin: 0; font-weight: 500; }

        .coverage-search {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 1rem; border-radius: 12px; margin-bottom: 1rem;
        }
        .coverage-search input { flex: 1; border: none; background: none; outline: none; font-size: 0.95rem; font-family: var(--font-main); }
        .search-count { font-size: 0.8rem; color: var(--color-text-secondary); white-space: nowrap; }

        .coverage-empty { padding: 3rem; text-align: center; border-radius: 14px; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .coverage-tree { border-radius: 14px; overflow: hidden; }

        .tree-toggle {
          width: 100%; display: flex; align-items: center; gap: 0.6rem;
          background: none; border: none; cursor: pointer; text-align: left;
          font-family: var(--font-main); transition: background 0.15s;
        }
        .tree-toggle:hover { background: rgba(99,102,241,0.06); }

        .grade-toggle { padding: 1rem 1.25rem; font-size: 1rem; font-weight: 700; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .subject-toggle { padding: 0.7rem 2.5rem; font-size: 0.95rem; font-weight: 600; }
        .chapter-toggle { padding: 0.6rem 4rem; font-size: 0.88rem; color: #4b5563; }

        .grade-badge { color: var(--color-accent-1); }
        .subject-name { color: var(--color-text-primary); }
        .chapter-name { color: #6b7280; }

        .count-badge {
          margin-left: auto; font-size: 0.75rem; font-weight: 600;
          padding: 2px 8px; border-radius: 20px;
          background: rgba(99,102,241,0.1); color: var(--color-accent-1);
        }
        .count-badge.muted { background: rgba(0,0,0,0.06); color: #6b7280; }
        .count-badge.danger { background: rgba(239,68,68,0.1); color: #dc2626; }

        .tree-lessons { padding: 0.5rem 5.5rem 0.5rem; display: flex; flex-direction: column; gap: 0.35rem; }
        .lesson-row {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.5rem 0.75rem; border-radius: 8px;
          background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.15);
        }
        .lesson-name { flex: 1; font-size: 0.88rem; font-weight: 500; }
        .lesson-id { font-size: 0.75rem; color: #9ca3af; font-family: monospace; }

        .tree-grade { border-bottom: 1px solid rgba(0,0,0,0.04); }
        .tree-grade:last-child { border-bottom: none; }
      `}</style>
    </div>
  );
};

export default LessonCoverage;
