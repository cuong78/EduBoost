import re
from docx import Document
import openpyxl

Q_RE = re.compile(r'^Câu\s+(\d+)\s*:\s*$', re.IGNORECASE)
OPT_RE = re.compile(r'^([ABCD])\.\s*(.*)$')
ANS_RE = re.compile(r'Đáp án đúng là\s*:\s*([ABCD])', re.IGNORECASE)

def clean_option_text(s: str) -> str:
    """Bỏ dấu ; . ở cuối, trim khoảng trắng."""
    s = (s or "").strip()
    s = re.sub(r'[;\.]+$', '', s).strip()
    return s

def guess_question_type(stem_text: str, options: dict) -> str:
    """
    - Có option A-D => MULTIPLE_CHOICE
    - Nếu option chỉ là Đúng/Sai => TRUE_FALSE
    - Không có option và có dấu hiệu chỗ trống => FILL_BLANK
    """
    if options:
        if len(options) == 2:
            opt_texts = " ".join(options.values()).lower()
            if ("đúng" in opt_texts and "sai" in opt_texts) or ("true" in opt_texts and "false" in opt_texts):
                return "TRUE_FALSE"
        return "MULTIPLE_CHOICE"

    # Không có options => thử đoán FILL_BLANK
    s = (stem_text or "").lower()
    # dấu hiệu chỗ trống: _____, [...], ( ... ), ..., …
    if re.search(r'_{3,}|\[\s*\]|\(\s*\)|\.\.\.|…', stem_text):
        return "FILL_BLANK"
    # keyword thường gặp
    if any(k in s for k in ["điền", "điền vào", "chỗ trống", "fill blank", "điền khuyết"]):
        return "FILL_BLANK"

    # fallback (nếu bạn muốn khác thì đổi ở đây)
    return "FILL_BLANK"

def parse_questions_from_docx(docx_path: str):
    doc = Document(docx_path)
    lines = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]

    questions = []
    current = None
    mode = None  # "stem" | "explain"
    last_opt = None

    def finalize(cur):
        if not cur:
            return

        # stem = chỉ phần đề (không options)
        stem_text = "\n".join(cur["stem"]).strip()

        # answer text = nội dung option đúng (không lấy A/B/C/D)
        ans_letter = cur.get("answer_letter")
        answer_text = ""
        if ans_letter and ans_letter in cur["options"]:
            answer_text = clean_option_text(cur["options"][ans_letter])
        elif ans_letter:
            answer_text = ans_letter  # fallback nếu không tìm thấy option

        explanation = "\n".join(cur["explanation_lines"]).strip()

        q_type = guess_question_type(stem_text, cur["options"])

        questions.append({
            "number": cur["number"],
            "question_text": stem_text,
            "answer_text": answer_text,
            "explanation": explanation,
            "question_type": q_type,
        })

    for line in lines:
        m_q = Q_RE.match(line)
        if m_q:
            finalize(current)
            current = {
                "number": int(m_q.group(1)),
                "stem": [],
                "options": {},
                "answer_letter": None,
                "explanation_lines": [],
            }
            mode = "stem"
            last_opt = None
            continue

        if current is None:
            continue  # bỏ qua tiêu đề đầu file

        if line.lower() == "lời giải:":
            mode = "explain"
            last_opt = None
            continue

        if mode == "stem":
            m_opt = OPT_RE.match(line)
            if m_opt:
                key, text = m_opt.group(1), m_opt.group(2)
                current["options"][key] = text.strip()
                last_opt = key
            else:
                # Nếu options bị xuống dòng, coi là phần tiếp của option gần nhất
                if last_opt and not Q_RE.match(line) and not line.lower().startswith("lời giải"):
                    current["options"][last_opt] = (current["options"][last_opt] + " " + line).strip()
                else:
                    current["stem"].append(line)

        else:  # explain
            m_ans = ANS_RE.search(line)
            if m_ans and current["answer_letter"] is None:
                current["answer_letter"] = m_ans.group(1).upper()
                # nếu bạn KHÔNG muốn lưu dòng "Đáp án đúng là: X" vào giải thích thì bỏ dòng dưới
                # (mình đang bỏ để giải thích sạch hơn)
                continue

            current["explanation_lines"].append(line)

    finalize(current)
    questions.sort(key=lambda x: x["number"])
    return questions

def fill_excel_template(template_xlsx: str, questions: list, output_xlsx: str):
    """
    Template cột:
    1: Câu hỏi
    2: Câu trả lời
    3: Giải thích
    4: Dạng câu hỏi
    """
    wb = openpyxl.load_workbook(template_xlsx)
    ws = wb.active

    start_row = 2
    for i, q in enumerate(questions):
        r = start_row + i
        ws.cell(r, 1).value = q["question_text"]
        ws.cell(r, 2).value = q["answer_text"]
        ws.cell(r, 3).value = q["explanation"]
        ws.cell(r, 4).value = q["question_type"]

    wb.save(output_xlsx)

if __name__ == "__main__":
    docx_path = "input.docx"
    template_xlsx = "question-import-template.xlsx"
    output_xlsx = "question-import-filled.xlsx"

    qs = parse_questions_from_docx(docx_path)
    fill_excel_template(template_xlsx, qs, output_xlsx)
    print(f"Done! Exported: {output_xlsx}")

