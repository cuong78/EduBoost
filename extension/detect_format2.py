"""
detect_format2.py — Tìm file .docx chứa câu hỏi KHÔNG đúng Format 1 chuẩn.

FORMAT CHUẨN (Format 1):
    Câu N: [Nội dung câu hỏi]
    A. [Đáp án A]
    B. [Đáp án B]
    C. [Đáp án C]
    D. [Đáp án D]
    Đáp án: [A/B/C/D]
    Lời giải: [Giải thích]

FORMAT KHÔNG CHUẨN (Format 2 — cần xử lý):
    Câu N:
    [Nội dung câu hỏi]
    • A.text  (bullet, không dấu cách)
    • B.text
    Lời giải:
    Trả lời:
    ...
    Đáp án cần chọn là: X

USAGE:
    python detect_format2.py                        # Dry run — quét D:\\EXE201\\resource\\word
    python detect_format2.py <thư_mục>              # Quét thư mục tùy chỉnh
    python detect_format2.py --output result.txt    # Ghi kết quả ra file txt
    python detect_format2.py --detail               # Hiển thị câu hỏi lỗi chi tiết

OUTPUT:
    - Danh sách file có câu hỏi không chuẩn (kèm đường dẫn đầy đủ)
    - Số câu đúng / sai / tổng trong mỗi file
    - Tên Lớp / Môn / Chương / Bài (từ cấu trúc folder)
    - File result.txt để dùng làm tài liệu tham khảo xóa DB
"""

import os
import re
import sys
from pathlib import Path

try:
    import docx
except ImportError:
    print("❌ Thiếu thư viện: pip install python-docx")
    sys.exit(1)

# ─── Cấu hình ─────────────────────────────────────────────────────────────────
DEFAULT_WORD_DIR = r"D:\EXE201\resource\word"

# Regex nhận ra dòng A./B./C./D. đúng format (có dấu cách sau dấu chấm)
# VD: "A. Tổng các chữ số" — OK
OPTION_OK_PATTERN = re.compile(
    r"^\s*[A-D]\.\s+\S",  # "A. text"
    re.MULTILINE
)

# Regex nhận ra dòng đáp án đúng format  "Đáp án: X" hoặc "Đáp án đúng: X"
ANSWER_OK_PATTERN = re.compile(
    r"Đ[áa]p\s+[áa]n(?:\s+đ[úu]ng)?(?:\s+l[àa])?[:\s]+[A-D]\b",
    re.IGNORECASE
)

# Regex phát hiện Format 2 — bullet options
BULLET_OPTION_PATTERN = re.compile(
    r"(?:^|\n)\s*[•\-]\s*[A-D]\.",  # "• A." hoặc "- A."
    re.MULTILINE
)

# Regex phát hiện Format 2 — "Đáp án cần chọn là: X"
F2_ANSWER_PATTERN = re.compile(
    r"[Đđ][áa]p\s+[áa]n\s+c[ầa]n\s+ch[ọo]n\s+l[àa]\s*:\s*[A-D]\b",
    re.IGNORECASE
)

# Regex phát hiện Format 2 — "Trả lời:" trước explanation
F2_TRA_LOI_PATTERN = re.compile(
    r"^Tr[ảa]\s+l[ờo]i\s*:",
    re.MULTILINE
)

# Regex phát hiện options không chuẩn: "A.text" không có space
NOSPACE_OPTION_PATTERN = re.compile(
    r"(?:^|\n)\s*[A-D]\.[A-Za-zÀ-ỹ0-9]",  # "A.Tổng" — thiếu dấu cách
    re.MULTILINE
)

# ─── Helpers ──────────────────────────────────────────────────────────────────

def long_path(p: str) -> str:
    if sys.platform == "win32" and not p.startswith("\\\\?\\"):
        return "\\\\?\\" + os.path.abspath(p)
    return p


def parse_folder_context(file_path: str, root_dir: str) -> dict:
    """Trích xuất Lớp/Môn/Chương/Bài từ cấu trúc folder."""
    rel = os.path.relpath(file_path, root_dir)
    parts = Path(rel).parts  # e.g. ('Lop 6', 'Toan', 'Chuong 1', 'Bai 1.docx')

    ctx = {"lop": "?", "mon": "?", "chuong": "?", "bai": "?", "rel_path": rel}

    grade_idx = -1
    for i, p in enumerate(parts):
        norm = p.lower().replace("ớ", "o").replace("ô", "o")
        if re.match(r"lop?\s*\d+|l[oô]p?\s*\d+", norm):
            grade_idx = i
            m = re.search(r"\d+", p)
            ctx["lop"] = m.group() if m else p
            break

    if grade_idx == -1:
        # Thử đọc số lớp từ tên ZIP hoặc folder cha
        m = re.search(r"\d+", os.path.basename(root_dir))
        ctx["lop"] = m.group() if m else "?"
        grade_idx = -1

    base = grade_idx + 1 if grade_idx >= 0 else 0

    if base < len(parts):
        ctx["mon"] = parts[base]
    if base + 1 < len(parts):
        ctx["chuong"] = parts[base + 1]
    if base + 2 < len(parts):
        ctx["bai"] = parts[base + 2]
    else:
        # Bài nằm trong tên file
        ctx["bai"] = Path(file_path).stem

    return ctx


def extract_text_from_docx(file_path: str) -> str:
    """Đọc toàn bộ text từ file .docx."""
    doc = docx.Document(long_path(file_path))
    lines = []
    for para in doc.paragraphs:
        lines.append(para.text)
    return "\n".join(lines)


def split_into_questions(full_text: str) -> list[tuple[int, str]]:
    """Chia text thành danh sách (số_câu, nội_dung_câu)."""
    chunks = re.split(r"(?=Câu\s+\d+\s*[:.]\s)", full_text)
    questions = []
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        m = re.match(r"Câu\s+(\d+)\s*[:.]\s*", chunk)
        if m:
            num = int(m.group(1))
            questions.append((num, chunk))
    return questions


# ─── Phân loại câu hỏi ────────────────────────────────────────────────────────

def classify_question(q_text: str) -> str:
    """
    Trả về:
      'ok'      — Format 1 chuẩn
      'f2'      — Format 2 (bullet / "Đáp án cần chọn là")
      'no_ans'  — Không tìm thấy đáp án
      'no_opt'  — Không tìm thấy đáp án A/B/C/D
    """
    # Kiểm tra Format 2 trước
    if F2_ANSWER_PATTERN.search(q_text):
        return "f2"
    if BULLET_OPTION_PATTERN.search(q_text):
        return "f2"
    if F2_TRA_LOI_PATTERN.search(q_text):
        return "f2"
    if NOSPACE_OPTION_PATTERN.search(q_text):
        # "A.text" không có space — Format 2
        return "f2"

    # Kiểm tra Format 1
    has_options = OPTION_OK_PATTERN.search(q_text)
    has_answer = ANSWER_OK_PATTERN.search(q_text)

    if has_options and has_answer:
        return "ok"
    if has_options and not has_answer:
        return "no_ans"
    return "no_opt"


def analyze_file(file_path: str) -> dict:
    """
    Phân tích 1 file .docx.
    Trả về dict với các key:
      total, ok, f2, no_ans, no_opt, bad_questions
    """
    try:
        text = extract_text_from_docx(file_path)
    except Exception as e:
        return {"error": str(e)}

    questions = split_into_questions(text)
    if not questions:
        return {"total": 0, "ok": 0, "f2": 0, "no_ans": 0, "no_opt": 0, "bad_questions": [],
                "note": "Không tìm thấy câu nào (có thể file mã hóa / table-only)"}

    result = {"total": len(questions), "ok": 0, "f2": 0, "no_ans": 0, "no_opt": 0,
              "bad_questions": []}

    for num, q_text in questions:
        cls = classify_question(q_text)
        result[cls] = result.get(cls, 0) + 1
        if cls != "ok":
            # Lưu preview (50 ký tự đầu)
            preview = q_text[:120].replace("\n", " ").strip()
            result["bad_questions"].append((num, cls, preview))

    return result


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    word_dir = DEFAULT_WORD_DIR
    output_file = None
    show_detail = "--detail" in args

    # Parse arguments
    filtered = []
    i = 0
    while i < len(args):
        if args[i] == "--output" and i + 1 < len(args):
            output_file = args[i + 1]
            i += 2
        elif args[i] in ("--detail",):
            i += 1
        elif not args[i].startswith("--"):
            word_dir = args[i]
            i += 1
        else:
            i += 1

    if not os.path.isdir(word_dir):
        print(f"❌ Thư mục không tồn tại: {word_dir}")
        sys.exit(1)

    print(f"🔍 Quét thư mục: {word_dir}\n{'=' * 70}")

    problem_files = []   # files có câu hỏi không chuẩn
    total_files   = 0
    total_bad_q   = 0
    total_ok_q    = 0

    for root, dirs, files in os.walk(word_dir):
        # Bỏ qua hidden folders
        dirs[:] = [d for d in dirs if not d.startswith(".") and not d.startswith("~")]

        docx_files = [f for f in files
                      if f.lower().endswith(".docx") and not f.startswith("~$")]

        for fname in sorted(docx_files):
            fpath = os.path.join(root, fname)
            total_files += 1
            ctx = parse_folder_context(fpath, word_dir)
            result = analyze_file(fpath)

            if "error" in result:
                print(f"⚠️  ĐỌC LỖI  | {ctx['rel_path']} — {result['error']}")
                continue

            total_ok_q  += result["ok"]
            bad_count    = result["f2"] + result.get("no_ans", 0) + result.get("no_opt", 0)
            total_bad_q += bad_count

            if bad_count > 0:
                problem_files.append((fpath, ctx, result))
                label = []
                if result["f2"]     > 0: label.append(f"Format2={result['f2']}")
                if result["no_ans"] > 0: label.append(f"NoAns={result['no_ans']}")
                if result["no_opt"] > 0: label.append(f"NoOption={result['no_opt']}")

                print(f"❌  Lớp {ctx['lop']:>3} | {ctx['mon'][:15]:<15} | "
                      f"{ctx['chuong'][:20]:<20} | {ctx['bai'][:25]:<25} | "
                      f"OK={result['ok']:>3} BAD={bad_count:>3}  [{', '.join(label)}]")
                print(f"      📂 {fpath}")

                if show_detail:
                    for num, cls, preview in result["bad_questions"]:
                        tag = {"f2": "FORMAT2", "no_ans": "NO_ANS", "no_opt": "NO_OPT"}.get(cls, cls)
                        print(f"         Câu {num:>3} [{tag}]: {preview[:80]} ...")
                print()

    # ─── Tổng kết ───────────────────────────────────────────────────────────
    print("=" * 70)
    print(f"📊 TỔNG KẾT")
    print(f"   Files quét  : {total_files}")
    print(f"   Files lỗi   : {len(problem_files)}")
    print(f"   Câu chuẩn   : {total_ok_q}")
    print(f"   Câu KHÔNG chuẩn: {total_bad_q}")
    print()

    if not problem_files:
        print("✅ Tất cả câu hỏi đều đúng format!")
        return

    # ─── Ghi output ─────────────────────────────────────────────────────────
    lines = []
    lines.append("=" * 70)
    lines.append("DANH SÁCH FILE CÓ CÂU HỎI KHÔNG ĐÚNG FORMAT")
    lines.append(f"Tổng: {len(problem_files)} file | {total_bad_q} câu không chuẩn")
    lines.append("=" * 70)
    lines.append("")

    for fpath, ctx, result in problem_files:
        bad_count = result["f2"] + result.get("no_ans", 0) + result.get("no_opt", 0)
        lines.append(f"FILE: {fpath}")
        lines.append(f"  Lớp: {ctx['lop']}  |  Môn: {ctx['mon']}  |  Chương: {ctx['chuong']}  |  Bài: {ctx['bai']}")
        lines.append(f"  Tổng câu: {result['total']}  |  OK: {result['ok']}  |  BAD: {bad_count}")
        lines.append(f"  Chi tiết lỗi: Format2={result['f2']}  NoAns={result.get('no_ans',0)}  NoOpt={result.get('no_opt',0)}")
        if result["bad_questions"]:
            lines.append("  Câu không chuẩn:")
            for num, cls, preview in result["bad_questions"]:
                tag = {"f2": "FORMAT2", "no_ans": "NO_ANS", "no_opt": "NO_OPT"}.get(cls, cls)
                lines.append(f"    Câu {num:>3} [{tag}]: {preview[:100]}")
        lines.append("")

    # ─── SQL gợi ý xóa DB (bước 2) ──────────────────────────────────────────
    lines.append("=" * 70)
    lines.append("-- SQL GỢI Ý: Xóa các file đã phát hiện (chạy trên server DB)")
    lines.append("-- *** THAY <lesson_id> bằng ID bài học thực tế trên DB ***")
    lines.append("-- *** Chạy theo thứ tự để tránh FK violation ***")
    lines.append("=" * 70)
    lines.append("")

    for _, ctx, _ in problem_files:
        lines.append(f"-- Lớp {ctx['lop']} | {ctx['mon']} | {ctx['chuong']} | {ctx['bai']}")
        lines.append("-- Bước A: Xóa kết quả thi của học sinh liên quan đến đề có câu hỏi này")
        lines.append("""-- SELECT ser.id FROM student_exam_result ser
--   JOIN exam_assignment ea ON ser.exam_assignment_id = ea.id
--   JOIN exam e ON ea.exam_id = e.id
--   JOIN exam_question eq ON eq.exam_id = e.id
--   JOIN question_bank qb ON eq.question_bank_id = qb.id
--   WHERE qb.lesson_id = <lesson_id>;""")
        lines.append("")
        lines.append("-- Bước B: Xóa exam assignments liên quan")
        lines.append("""-- DELETE FROM exam_assignment ea WHERE ea.exam_id IN (
--   SELECT DISTINCT e.id FROM exam e
--   JOIN exam_question eq ON eq.exam_id = e.id
--   JOIN question_bank qb ON eq.question_bank_id = qb.id
--   WHERE qb.lesson_id = <lesson_id>
-- );""")
        lines.append("")
        lines.append("-- Bước C: Xóa exam_question records")
        lines.append("""-- DELETE FROM exam_question WHERE question_bank_id IN (
--   SELECT id FROM question_bank WHERE lesson_id = <lesson_id>
-- );""")
        lines.append("")
        lines.append("-- Bước D: Xóa question_bank records")
        lines.append("-- DELETE FROM question_bank WHERE lesson_id = <lesson_id>;")
        lines.append("")

    output_text = "\n".join(lines)

    # In ra console
    print("\n" + output_text)

    # Ghi file nếu yêu cầu
    if output_file:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(output_text)
        print(f"\n💾 Đã ghi kết quả vào: {output_file}")
    else:
        result_path = os.path.join(os.path.dirname(__file__), "format_check_result.txt")
        with open(result_path, "w", encoding="utf-8") as f:
            f.write(output_text)
        print(f"\n💾 Đã ghi kết quả vào: {result_path}")
        print(f"💡 Xem chi tiết: python detect_format2.py --detail")
        print(f"💡 Xuất file khác: python detect_format2.py --output my_report.txt")


if __name__ == "__main__":
    main()
