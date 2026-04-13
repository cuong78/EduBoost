import { useMemo, useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { questionBankService } from '../../services/questionBankService';
import { API } from '../../constants/api';
import { showErrorToast } from '../../utils/show-toast';
import MathRenderer from './MathRenderer';

/* ═══════════════════════════════════════════════════════════════════════════════
   VISUAL MATH PANEL — Popup chèn công thức trực quan
   ═══════════════════════════════════════════════════════════════════════════════ */

const MATH_CATEGORIES = [
  {
    label: "Cơ bản",
    items: [
      { display: "a/b",    latex: "\\frac{a}{b}",     tip: "Phân số" },
      { display: "√x",     latex: "\\sqrt{x}",        tip: "Căn bậc 2" },
      { display: "ⁿ√x",   latex: "\\sqrt[n]{x}",     tip: "Căn bậc n" },
      { display: "x²",     latex: "x^{2}",            tip: "Lũy thừa" },
      { display: "xₙ",     latex: "x_{n}",            tip: "Chỉ số dưới" },
      { display: "xⁿₘ",   latex: "x_{m}^{n}",        tip: "Chỉ số trên & dưới" },
      { display: "( )",    latex: "\\left( \\right)",  tip: "Ngoặc tròn co giãn" },
      { display: "| |",    latex: "\\left| \\right|",  tip: "Giá trị tuyệt đối" },
    ],
  },
  {
    label: "Toán học",
    items: [
      { display: "±",  latex: "\\pm",          tip: "Cộng trừ" },
      { display: "×",  latex: "\\times",       tip: "Nhân" },
      { display: "÷",  latex: "\\div",         tip: "Chia" },
      { display: "≠",  latex: "\\neq",         tip: "Không bằng" },
      { display: "≤",  latex: "\\leq",         tip: "Nhỏ hơn hoặc bằng" },
      { display: "≥",  latex: "\\geq",         tip: "Lớn hơn hoặc bằng" },
      { display: "≈",  latex: "\\approx",      tip: "Xấp xỉ" },
      { display: "∞",  latex: "\\infty",       tip: "Vô cực" },
      { display: "Σ",  latex: "\\sum_{i=1}^{n}",  tip: "Tổng" },
      { display: "∫",  latex: "\\int_{a}^{b}", tip: "Tích phân" },
      { display: "lim", latex: "\\lim_{x \\to a}", tip: "Giới hạn" },
      { display: "Δ",  latex: "\\Delta",       tip: "Delta" },
      { display: "π",  latex: "\\pi",          tip: "Pi" },
      { display: "∝",  latex: "\\propto",      tip: "Tỉ lệ" },
      { display: "∈",  latex: "\\in",          tip: "Thuộc" },
      { display: "∀",  latex: "\\forall",      tip: "Với mọi" },
    ],
  },
  {
    label: "Hóa học",
    items: [
      { display: "→",      latex: "\\rightarrow",      tip: "Phản ứng 1 chiều" },
      { display: "⇌",      latex: "\\rightleftharpoons", tip: "Phản ứng thuận nghịch" },
      { display: "↑",      latex: "\\uparrow",         tip: "Khí thoát ra" },
      { display: "↓",      latex: "\\downarrow",       tip: "Kết tủa" },
      { display: "H₂O",    latex: "H_{2}O",            tip: "Nước" },
      { display: "CO₂",    latex: "CO_{2}",            tip: "Carbon dioxide" },
      { display: "H₂SO₄",  latex: "H_{2}SO_{4}",      tip: "Axit sunfuric" },
      { display: "NaOH",   latex: "NaOH",              tip: "Natri hydroxit" },
      { display: "Fe²⁺",   latex: "Fe^{2+}",           tip: "Ion sắt II" },
      { display: "SO₄²⁻",  latex: "SO_{4}^{2-}",      tip: "Ion sunfat" },
      { display: "°C",     latex: "^{\\circ}C",        tip: "Độ C" },
    ],
  },
  {
    label: "Vật lý",
    items: [
      { display: "F⃗",     latex: "\\vec{F}",          tip: "Vectơ lực" },
      { display: "v⃗",     latex: "\\vec{v}",          tip: "Vectơ vận tốc" },
      { display: "Ω",      latex: "\\Omega",           tip: "Ohm" },
      { display: "μ",      latex: "\\mu",              tip: "Micro" },
      { display: "λ",      latex: "\\lambda",          tip: "Lambda" },
      { display: "α",      latex: "\\alpha",           tip: "Alpha" },
      { display: "β",      latex: "\\beta",            tip: "Beta" },
      { display: "θ",      latex: "\\theta",           tip: "Theta" },
      { display: "ω",      latex: "\\omega",           tip: "Omega" },
      { display: "ε",      latex: "\\varepsilon",      tip: "Epsilon" },
      { display: "φ",      latex: "\\varphi",          tip: "Phi" },
      { display: "°",      latex: "^{\\circ}",         tip: "Độ" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   KETCHER PANEL — Popup vẽ công thức hóa học (cấu trúc)
   ═══════════════════════════════════════════════════════════════════════════════ */

const KETCHER_URL = 'https://lifescience.opensource.epam.com/ketcher/demo.html';

const KetcherPanel = ({ onInsert, onClose }) => {
  const iframeRef = useRef(null);
  const panelRef  = useRef(null);
  const [ready, setReady]     = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Close on click-outside
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Listen for postMessage from Ketcher iframe
  useEffect(() => {
    const onMessage = (e) => {
      if (!e.data) return;
      // Ketcher fires 'ketcherReady' when loaded
      if (e.data.eventType === 'init') {
        setReady(true);
        setLoading(false);
      }
      // SVG response
      if (e.data.eventType === 'GET_SMILES' && e.data.data) {
        // We asked for smiles, actually get SVG below
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const handleIframeLoad = () => {
    setLoading(false);
    // Give Ketcher a moment to initialize fully
    setTimeout(() => setReady(true), 1000);
  };

  const handleInsert = async () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      // Request SVG from Ketcher via postMessage
      // Ketcher's standalone supports window.ketcher API when same-origin;
      // For cross-origin CDN we use a helper approach: open in popup or use
      // indirect embed approach. Since CDN is cross-origin, use ketcher demo
      // which exposes getSVG via contentWindow when allowed.
      //
      // Fallback: ask user to copy SMILES and we encode it.
      // Better approach: use blob: URL for self-hosted ketcher-react
      // For now: try contentWindow.ketcher API (works on some browsers without strict CORS)
      const ketcherApi = iframe.contentWindow?.ketcher;
      if (ketcherApi) {
        const svg = await ketcherApi.getSVG?.();
        if (svg) {
          const b64 = btoa(unescape(encodeURIComponent(svg)));
          const dataUrl = `data:image/svg+xml;base64,${b64}`;
          onInsert(dataUrl);
          onClose();
          return;
        }
        // Fallback: getMolfile → not useful for display, try SMILES
        const smiles = await ketcherApi.getSmiles?.();
        if (smiles && smiles.trim() && smiles.trim() !== '') {
          // For SMILES we can't directly render — open note
          setError(`Không thể lấy SVG do giới hạn CORS. SMILES: ${smiles}`);
          return;
        }
      }
      setError('Không thể truy cập Ketcher API do giới hạn Cross-Origin. Hãy dùng nút "Tải ảnh" ở toolbar để chèn ảnh đã chụp màn hình từ ChemDraw/Ketcher.');
    } catch (err) {
      setError('Lỗi khi lấy dữ liệu từ Ketcher: ' + err.message);
    }
  };

  return (
    <div className="ketcher-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ketcher-modal" ref={panelRef}>
        <div className="km-header">
          <div className="km-title">
            <span className="km-icon">🧪</span>
            <h3>Vẽ công thức hóa học</h3>
          </div>
          <div className="km-header-actions">
            <a
              href={KETCHER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="km-open-btn"
              title="Mở Ketcher trong tab mới"
            >
              Mở rộng ↗
            </a>
            <button className="km-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="km-notice">
          <span className="km-notice-icon">💡</span>
          <span>
            Vẽ công thức → nhấn <b>"Chụp & Chèn"</b> để chụp ảnh vùng vẽ và chèn vào câu hỏi.
            Hoặc mở Ketcher trong tab mới, lưu ảnh, rồi dùng nút 📷 trong toolbar để upload.
          </span>
        </div>

        <div className="km-iframe-wrap">
          {loading && (
            <div className="km-loading">
              <div className="km-spinner" />
              <span>Đang tải Ketcher...</span>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={KETCHER_URL}
            className="km-iframe"
            title="Ketcher Chemical Structure Editor"
            onLoad={handleIframeLoad}
            allow="clipboard-read; clipboard-write"
          />
        </div>

        {error && (
          <div className="km-error">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="km-footer">
          <p className="km-cors-note">
            📌 Dùng Ketcher để vẽ → chụp màn hình → upload qua nút <b>📷</b> trong thanh công cụ soạn thảo bên dưới.
          </p>
          <div className="km-actions">
            <button className="km-btn-cancel" onClick={onClose}>Đóng</button>
            <button
              className="km-btn-insert"
              onClick={handleInsert}
              disabled={!ready}
            >
              {ready ? 'Thử lấy SVG tự động' : 'Đang tải...'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const MathPanel = ({ onInsert, onClose }) => {
  const [latex, setLatex] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const insertSymbol = (sym) => {
    // Insert at cursor position within the input
    const inp = inputRef.current;
    if (inp) {
      const start = inp.selectionStart;
      const end = inp.selectionEnd;
      const newVal = latex.slice(0, start) + sym + latex.slice(end);
      setLatex(newVal);
      // Move cursor after inserted symbol
      setTimeout(() => {
        inp.selectionStart = inp.selectionEnd = start + sym.length;
        inp.focus();
      }, 0);
    } else {
      setLatex((prev) => prev + sym);
    }
  };

  const handleConfirm = () => {
    if (latex.trim()) {
      onInsert(latex.trim());
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="math-panel-overlay">
      <div className="math-panel" ref={panelRef}>
        {/* Header */}
        <div className="mp-header">
          <h3>✏️ Chèn công thức</h3>
          <button className="mp-close" onClick={onClose}>✕</button>
        </div>

        {/* Category tabs */}
        <div className="mp-categories">
          {MATH_CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              className={`mp-cat-btn ${activeCategory === i ? "active" : ""}`}
              onClick={() => setActiveCategory(i)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Symbol grid */}
        <div className="mp-symbols">
          {MATH_CATEGORIES[activeCategory].items.map((item, i) => (
            <button
              key={i}
              className="mp-sym-btn"
              title={item.tip}
              onClick={() => insertSymbol(item.latex)}
            >
              {item.display}
            </button>
          ))}
        </div>

        {/* LaTeX input */}
        <div className="mp-input-area">
          <label>Công thức LaTeX:</label>
          <input
            ref={inputRef}
            type="text"
            className="mp-input"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhấn ký hiệu ở trên hoặc gõ trực tiếp..."
          />
        </div>

        {/* Live preview */}
        {latex.trim() && (
          <div className="mp-preview">
            <label>Xem trước:</label>
            <div className="mp-preview-box">
              <MathRenderer content={`$${latex}$`} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mp-actions">
          <button className="mp-btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className="mp-btn-insert"
            onClick={handleConfirm}
            disabled={!latex.trim()}
          >
            Chèn công thức
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════════
   RICH TEXT EDITOR — Main component
   ═══════════════════════════════════════════════════════════════════════════════ */

const RichTextEditor = ({ value, onChange, placeholder = 'Nhập nội dung...' }) => {
    const quillRef = useRef(null);
    const [showMathPanel, setShowMathPanel]       = useState(false);
    const [showKetcherPanel, setShowKetcherPanel] = useState(false);
    const selectionRef = useRef(null);

    // When opening math panel, save current cursor position
    const openMathPanel = useCallback(() => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            selectionRef.current = quill.getSelection(true);
        }
        setShowMathPanel(true);
    }, []);

    // Insert LaTeX at saved cursor position
    const handleMathInsert = useCallback((latex) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const range = selectionRef.current || quill.getSelection(true) || { index: quill.getLength() - 1, length: 0 };

        if (range.length > 0) {
            quill.deleteText(range.index, range.length);
        }
        const insertText = `$${latex}$`;
        quill.insertText(range.index, insertText);
        quill.setSelection(range.index + insertText.length);
    }, []);

    function imageHandler() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                const response = await questionBankService.uploadImage(file);
                const objectKey = response.imageUrl || response.url;
                const imageUrl = `${API.BASE}/files/${objectKey}`;

                const quill = quillRef.current?.getEditor();
                if (quill) {
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', imageUrl);
                    quill.setSelection(range.index + 1);
                }
            } catch (error) {
                showErrorToast('Lỗi upload ảnh: ' + (error?.message || 'Không xác định'));
            }
        };
    }

    // Insert image URL into Quill at saved/current cursor
    const insertImageUrl = useCallback((url) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        const range = selectionRef.current || quill.getSelection(true) || { index: quill.getLength() - 1, length: 0 };
        quill.insertEmbed(range.index, 'image', url);
        quill.setSelection(range.index + 1);
    }, []);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'align': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['image'],
                ['formula-btn'],
                ['chem-btn'],
            ],
            handlers: {
                image: imageHandler,
                'formula-btn': function() {
                    // This is a placeholder; actual handler is set up via useEffect
                },
                'chem-btn': function() {
                    // Placeholder; actual handler set up via useEffect
                },
            }
        },
        clipboard: {
            matchVisual: false
        }
    }), []);

    // Set up toolbar button handlers after mount
    useEffect(() => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;
        const toolbar = editor.getModule('toolbar');
        if (toolbar) {
            toolbar.addHandler('formula-btn', openMathPanel);
            toolbar.addHandler('chem-btn', () => {
                // Save cursor before opening Ketcher
                selectionRef.current = editor.getSelection(true);
                setShowKetcherPanel(true);
            });
        }
    }, [openMathPanel]);

    // Detect if content has any LaTeX formulas
    const hasLatex = (value || '').includes('$');
    const [showPreview, setShowPreview] = useState(true);

    // Extract plain text with HTML + LaTeX for preview
    const previewContent = value || '';

    return (
        <div className="rich-text-editor">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
            />

            {/* Live Preview — always visible when content has $ formulas */}
            {hasLatex && (
                <div className="rte-preview-section">
                    <button
                        className="rte-preview-toggle"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        <span className="rte-preview-dot" />
                        Xem trước công thức
                        <span className="rte-preview-arrow">{showPreview ? '▲' : '▼'}</span>
                    </button>
                    {showPreview && (
                        <div className="rte-preview-box">
                            <MathRenderer content={previewContent} />
                        </div>
                    )}
                </div>
            )}

            {showMathPanel && (
                <MathPanel
                    onInsert={handleMathInsert}
                    onClose={() => setShowMathPanel(false)}
                />
            )}

            {showKetcherPanel && (
                <KetcherPanel
                    onInsert={(dataUrl) => insertImageUrl(dataUrl)}
                    onClose={() => setShowKetcherPanel(false)}
                />
            )}

            <style>{`
                .rich-text-editor .ql-editor {
                    min-height: 200px;
                }
                .rich-text-editor .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: #999;
                }

                /* ── Custom formula button ── */
                .ql-formula-btn::after {
                    content: 'ƒx';
                    font-weight: 800;
                    font-size: 14px;
                    font-style: italic;
                    color: #6366f1;
                }
                .ql-formula-btn:hover {
                    background: rgba(99, 102, 241, 0.08) !important;
                    border-radius: 4px;
                }

                /* ── Custom chem button ── */
                .ql-chem-btn::after {
                    content: '🧪';
                    font-size: 15px;
                }
                .ql-chem-btn:hover {
                    background: rgba(16, 185, 129, 0.08) !important;
                    border-radius: 4px;
                }

                /* ═══════════════════════════════════════════════════
                   KETCHER PANEL STYLES
                ═══════════════════════════════════════════════════ */
                .ketcher-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10001;
                    background: rgba(2, 6, 23, 0.55);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: kFadeIn 0.2s ease;
                    padding: 1rem;
                }
                @keyframes kFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                .ketcher-modal {
                    background: #fff;
                    border-radius: 20px;
                    width: min(96vw, 960px);
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 32px 80px rgba(0,0,0,0.25);
                    animation: kSlideUp 0.3s cubic-bezier(0.16,1,0.3,1);
                    overflow: hidden;
                }
                @keyframes kSlideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                .km-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
                }
                .km-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .km-icon { font-size: 1.4rem; }
                .km-title h3 {
                    margin: 0;
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #064e3b;
                }
                .km-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .km-open-btn {
                    padding: 5px 12px;
                    background: #d1fae5;
                    color: #065f46;
                    border: 1px solid #a7f3d0;
                    border-radius: 8px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .km-open-btn:hover { background: #a7f3d0; }
                .km-close {
                    background: #f1f5f9;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }
                .km-close:hover { background: #e2e8f0; color: #334155; }

                .km-notice {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 8px 18px;
                    background: #fffbeb;
                    border-bottom: 1px solid #fde68a;
                    font-size: 0.82rem;
                    color: #92400e;
                    line-height: 1.45;
                }
                .km-notice-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }

                .km-iframe-wrap {
                    position: relative;
                    flex: 1;
                    min-height: 500px;
                }
                .km-loading {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    background: #f8fafc;
                    z-index: 2;
                    font-size: 0.9rem;
                    color: #64748b;
                }
                .km-spinner {
                    width: 36px;
                    height: 36px;
                    border: 3px solid #e2e8f0;
                    border-top-color: #10b981;
                    border-radius: 50%;
                    animation: kSpin 0.7s linear infinite;
                }
                @keyframes kSpin {
                    to { transform: rotate(360deg); }
                }
                .km-iframe {
                    width: 100%;
                    height: 100%;
                    min-height: 500px;
                    border: none;
                    display: block;
                }

                .km-error {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 8px;
                    padding: 8px 16px;
                    background: #fef2f2;
                    border-top: 1px solid #fecaca;
                    font-size: 0.82rem;
                    color: #991b1b;
                }
                .km-error button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #991b1b;
                    font-size: 1rem;
                    flex-shrink: 0;
                }

                .km-footer {
                    padding: 10px 18px 14px;
                    border-top: 1px solid #f1f5f9;
                    background: #fafafa;
                }
                .km-cors-note {
                    margin: 0 0 8px;
                    font-size: 0.8rem;
                    color: #64748b;
                    line-height: 1.5;
                }
                .km-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                }
                .km-btn-cancel {
                    padding: 8px 18px;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 9px;
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.15s;
                    font-family: inherit;
                }
                .km-btn-cancel:hover { background: #e2e8f0; }
                .km-btn-insert {
                    padding: 8px 22px;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: #fff;
                    border: none;
                    border-radius: 9px;
                    font-size: 0.88rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                    box-shadow: 0 3px 10px rgba(16,185,129,0.25);
                    font-family: inherit;
                }
                .km-btn-insert:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 5px 15px rgba(16,185,129,0.35);
                }
                .km-btn-insert:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* ── Math Panel Overlay ── */
                .math-panel-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10000;
                    background: rgba(15, 23, 42, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: mpFadeIn 0.2s ease;
                    padding: 1rem;
                }
                @keyframes mpFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .math-panel {
                    background: #fff;
                    border-radius: 18px;
                    width: 100%;
                    max-width: 520px;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.2);
                    animation: mpSlideUp 0.3s cubic-bezier(0.16,1,0.3,1);
                    overflow: hidden;
                }
                @keyframes mpSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* Header */
                .mp-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .mp-header h3 {
                    margin: 0;
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #1e293b;
                }
                .mp-close {
                    background: #f1f5f9;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }
                .mp-close:hover {
                    background: #e2e8f0;
                    color: #334155;
                }

                /* Category tabs */
                .mp-categories {
                    display: flex;
                    gap: 0;
                    padding: 0 16px;
                    border-bottom: 1px solid #f1f5f9;
                    overflow-x: auto;
                }
                .mp-cat-btn {
                    padding: 10px 14px;
                    background: none;
                    border: none;
                    border-bottom: 2px solid transparent;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #94a3b8;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.15s;
                    font-family: inherit;
                }
                .mp-cat-btn:hover {
                    color: #475569;
                }
                .mp-cat-btn.active {
                    color: #6366f1;
                    border-bottom-color: #6366f1;
                }

                /* Symbol grid */
                .mp-symbols {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
                    gap: 6px;
                    padding: 12px 16px;
                    max-height: 160px;
                    overflow-y: auto;
                }
                .mp-sym-btn {
                    height: 42px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #334155;
                    cursor: pointer;
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Cambria Math', 'Times New Roman', serif;
                }
                .mp-sym-btn:hover {
                    background: #eef2ff;
                    border-color: #a5b4fc;
                    color: #4338ca;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 6px rgba(99,102,241,0.15);
                }

                /* Input */
                .mp-input-area {
                    padding: 8px 16px;
                }
                .mp-input-area label {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #64748b;
                    display: block;
                    margin-bottom: 4px;
                }
                .mp-input {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    font-family: 'Fira Code', 'Consolas', monospace;
                    color: #1e293b;
                    outline: none;
                    transition: border-color 0.15s;
                    box-sizing: border-box;
                }
                .mp-input:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
                }

                /* Preview */
                .mp-preview {
                    padding: 8px 16px;
                }
                .mp-preview label {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #64748b;
                    display: block;
                    margin-bottom: 4px;
                }
                .mp-preview-box {
                    padding: 12px 16px;
                    background: #f8fafc;
                    border-radius: 10px;
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    border: 1px solid #e2e8f0;
                    font-size: 1.15rem;
                }

                /* Actions */
                .mp-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    padding: 12px 16px 16px;
                }
                .mp-btn-cancel {
                    padding: 8px 18px;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 9px;
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.15s;
                    font-family: inherit;
                }
                .mp-btn-cancel:hover {
                    background: #e2e8f0;
                }
                .mp-btn-insert {
                    padding: 8px 22px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                    border: none;
                    border-radius: 9px;
                    font-size: 0.88rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                    box-shadow: 0 3px 10px rgba(99,102,241,0.25);
                    font-family: inherit;
                }
                .mp-btn-insert:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 5px 15px rgba(99,102,241,0.35);
                }
                .mp-btn-insert:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* ── Live Preview Panel ── */
                .rte-preview-section {
                    border: 1px solid #e2e8f0;
                    border-top: none;
                    border-radius: 0 0 8px 8px;
                    overflow: hidden;
                    background: #fefefe;
                }
                .rte-preview-toggle {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 14px;
                    background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.04));
                    border: none;
                    border-top: 1px dashed #c7d2fe;
                    cursor: pointer;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #6366f1;
                    font-family: inherit;
                    transition: background 0.15s;
                }
                .rte-preview-toggle:hover {
                    background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08));
                }
                .rte-preview-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #22c55e;
                    animation: previewPulse 2s infinite;
                }
                @keyframes previewPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                .rte-preview-arrow {
                    margin-left: auto;
                    font-size: 0.7rem;
                    color: #94a3b8;
                }
                .rte-preview-box {
                    padding: 14px 18px;
                    font-size: 1rem;
                    line-height: 1.7;
                    color: #1e293b;
                    background: #fff;
                    max-height: 300px;
                    overflow-y: auto;
                    border-top: 1px solid #f1f5f9;
                }
                .rte-preview-box p {
                    margin: 0 0 0.4em;
                }
                .rte-preview-box img {
                    max-width: 100%;
                    border-radius: 6px;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
