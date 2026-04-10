import { Globe2 } from "lucide-react";
import { useLanguage } from "../../contexts/language-context";

const LanguageSwitch = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <>
      <div className={`language-pill ${compact ? "language-pill--compact" : ""}`}>
        <Globe2 size={compact ? 14 : 16} />
        <button
          type="button"
          className={`language-pill__option ${
            language === "vi" ? "language-pill__option--active" : ""
          }`}
          onClick={() => setLanguage("vi")}
        >
          VI
        </button>
        <button
          type="button"
          className={`language-pill__option ${
            language === "en" ? "language-pill__option--active" : ""
          }`}
          onClick={() => setLanguage("en")}
        >
          EN
        </button>
      </div>

      <style>{`
        .language-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(148, 163, 184, 0.18);
          color: #37536b;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
        }

        .language-pill--compact {
          background: rgba(255, 255, 255, 0.86);
        }

        .language-pill__option {
          min-width: 38px;
          padding: 0.42rem 0.65rem;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: #5e768d;
          font-size: 0.82rem;
          font-weight: 800;
        }

        .language-pill__option--active {
          background: rgba(15, 124, 240, 0.12);
          color: #0f7cf0;
        }
      `}</style>
    </>
  );
};

export default LanguageSwitch;
