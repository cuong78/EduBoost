"""
remove_no_answer.py — Xóa các câu hỏi KHÔNG CÓ ĐÁP ÁN khỏi file .docx.

Câu hỏi bị xóa khi:
  1. Format 1 (A. B. C. D. chuẩn) NHƯNG không có dòng "Đáp án: X"
  2. Format 2 (bullet / "Đáp án cần chọn là") NHƯNG không có "Đáp án cần chọn là: X"

Câu hỏi được giữ lại:
  - Format 1 + "Đáp án: X"         → OK
  - Format 2 + "Đáp án cần chọn là: X" → OK (backend đã map được)

USAGE:
    python remove_no_answer.py                      # Dry run — chỉ in ra
    python remove_no_answer.py --delete             # Xóa thật, lưu file
    python remove_no_answer.py <thư_mục> --delete   # Chỉ định thư mục
    python remove_no_answer.py --detail             # In preview từng câu bị xóa
"""

import os
import re
import sys
from pathlib import Path

try:
    import docx
    from docx.oxml.table import CT_Tbl
    from docx.oxml.text.paragraph import CT_P
    from docx.table import Table
    from docx.text.paragraph import Paragraph
except ImportError:
    print("❌ Thiếu thư viện: pip install python-docx")
    sys.exit(1)

# ─── Cấu hình ─────────────────────────────────────────────────────────────────
DEFAULT_WORD_DIR = r"D:\EXE201\resource\word"

# Nhận ra đáp án A./B. đúng format (có space sau chấm)
OPTION_OK = re.compile(r"^\s*[A-D]\.\s+\S", re.MULTILINE)

# Nhận ra dòng đáp án chuẩn
ANSWER_OK = re.compile(
    r"Đ[áa]p\s+[áa]n(?:\s+đ[úu]ng)?(?:\s+l[àa])?[:\s]+[A-D]\b",
    re.IGNORECASE
)

# Nhận ra Format 2 — KHÔNG xóa, chỉ bỏ qua
BULLET_OPT = re.compile(r"(?:^|\n)\s*[•\-]\s*[A-D]\.", re.MULTILINE)
F2_ANSWER  = re.compile(
    r"[Đđ][áa]p\s+[áa]n\s+c[ầa]n\s+ch[ọo]n\s+l[àa]\s*:\s*[A-D]\b",
    re.IGNORECASE
)
NOSPACE_OPT = re.compile(r"(?:^|\n)\s*[A-D]\.[A-Za-zÀ-ỹ0-9]", re.MULTILINE)

# Nhận ra đầu câu hỏi
Q_START = re.compile(r"^Câu\s+\d+\s*[:.]\s*", re.IGNORECASE)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def long_path(p: str) -> str:
    if sys.platform == "win32" and not p.startswith("\\\\?\\"):
        return "\\\\?\\" + os.path.abspath(p)
    return p


def iter_blocks(doc):
    """Yield từng Paragraph hoặc Table theo thứ tự trong body."""
    for child in doc.element.body:
        if isinstance(child, CT_P):
            yield Paragraph(child, doc)
        elif isinstance(child, CT_Tbl):
            yield Table(child, doc)


def block_text(block: list) -> str:
    parts = []
    for item in block:
        if isinstance(item, Paragraph):
            parts.append(item.text)
        elif isinstance(item, Table):
            for row in item.rows:
                for cell in row.cells:
                    parts.append(cell.text)
    return "\n".join(parts)


def remove_element(item):
    try:
        item._element.getparent().remove(item._element)
    except Exception:
        pass


def is_format2(text: str) -> bool:
    """Câu có dấu hiệu Format 2 (bullet hoặc no-space options)."""
    return bool(BULLET_OPT.search(text) or NOSPACE_OPT.search(text))


def has_f2_answer(text: str) -> bool:
    """Format 2 có đáp án 'Đáp án cần chọn là: X'."""
    return bool(F2_ANSWER.search(text))


def has_f1_answer(text: str) -> bool:
    """Format 1 có đáp án 'Đáp án: X'."""
    return bool(ANSWER_OK.search(text))


def classify(text: str) -> str:
    """
    Phân loại câu hỏi:
      'ok'        — có đáp án rõ ràng (giữ lại)
      'no_ans_f1' — Format 1, không có đáp án (xóa)
      'no_ans_f2' — Format 2, không có đáp án (xóa)
    """
    f2 = is_format2(text)
    if f2:
        return 'ok' if has_f2_answer(text) else 'no_ans_f2'

    # Format 1
    has_opt = bool(OPTION_OK.search(text))
    if not has_opt:
        return 'ok'  # Không rõ format, giữ an toàn
    return 'ok' if has_f1_answer(text) else 'no_ans_f1'


def should_delete(text: str) -> bool:
    return classify(text) in ('no_ans_f1', 'no_ans_f2')


# ─── Xử lý 1 file ─────────────────────────────────────────────────────────────

def process_file(file_path: str, dry_run: bool = True, show_detail: bool = False) -> dict:
    """
    Trả về dict: {removed, kept, f2_skipped, error}
    """
    try:
        doc = docx.Document(long_path(file_path))
    except Exception as e:
        return {"error": str(e)}

    # Chia thành các block câu hỏi
    blocks = []
    current = []
    for item in iter_blocks(doc):
        if isinstance(item, Paragraph) and Q_START.match(item.text.strip()):
            if current:
                blocks.append(current)
            current = [item]
        else:
            current.append(item)
    if current:
        blocks.append(current)

    removed_blocks = []
    kept = 0
    f2_skipped = 0

    for block in blocks:
        # Bỏ qua block không có đầu "Câu N:"
        first = block[0]
        if not isinstance(first, Paragraph) or not Q_START.match(first.text.strip()):
            kept += 1
            continue

        text = block_text(block)

        # Lấy số câu để log
        m = re.match(r"Câu\s+(\d+)", first.text.strip(), re.IGNORECASE)
        q_num = m.group(1) if m else "?"

        cls = classify(text)
        if cls == 'ok':
            kept += 1
        else:
            tag = "F1_NO_ANS" if cls == 'no_ans_f1' else "F2_NO_ANS"
            removed_blocks.append((q_num, tag, block, text[:100].replace("\n", " ")))

    if not removed_blocks:
        return {"removed": 0, "kept": kept, "f2_skipped": f2_skipped}

    fname = os.path.basename(file_path)
    print(f"\n{'🔍' if dry_run else '✂️ '} {fname}")
    print(f"   Xóa {len(removed_blocks)} câu, Giữ {kept} câu")

    for q_num, tag, block, preview in removed_blocks:
        action = "SẼ XÓA" if dry_run else "XÓA"
        print(f"   [{action}][{tag}] Câu {q_num}: {preview[:90]}...")
        if show_detail:
            print(f"           Full: {block_text(block)[:200]}")

    if not dry_run:
        # Xóa các element khỏi XML
        for _, _, block, _ in removed_blocks:
            for item in block:
                remove_element(item)

        remaining = kept  # sau xóa
        if remaining == 0:
            # File rỗng hoàn toàn — xóa file
            try:
                os.remove(long_path(file_path))
                print(f"   🗑️  Xóa luôn file (không còn câu nào): {fname}")
            except Exception as e:
                print(f"   ⚠️  Không xóa được file: {e}")
        else:
            doc.save(long_path(file_path))
            print(f"   ✅ Đã lưu: {fname}")

    return {
        "removed": len(removed_blocks),
        "kept": kept,
        "f2_skipped": 0,  # không còn skip F2
    }


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    word_dir   = DEFAULT_WORD_DIR
    dry_run    = "--delete" not in args
    show_detail = "--detail" in args

    for arg in args:
        if not arg.startswith("--") and os.path.isdir(arg):
            word_dir = arg

    if not os.path.isdir(word_dir):
        print(f"❌ Thư mục không tồn tại: {word_dir}")
        sys.exit(1)

    mode = "🔍 DRY RUN (chỉ xem, không xóa)" if dry_run else "⚠️  XÓA THẬT — lưu file"
    print(f"{mode}")
    print(f"📂 Thư mục: {word_dir}")
    print(f"📌 Xóa: F1 không có 'Đáp án: X'  +  F2 không có 'Đáp án cần chọn là: X'")
    print("=" * 70)

    total_files  = 0
    total_removed = 0
    total_kept    = 0
    affected_files = 0
    errors = []

    for root, dirs, files in os.walk(word_dir):
        dirs[:] = [d for d in dirs if not d.startswith(".") and not d.startswith("~")]
        docx_files = [f for f in sorted(files)
                      if f.lower().endswith(".docx") and not f.startswith("~$")]

        for fname in docx_files:
            fpath = os.path.join(root, fname)
            total_files += 1
            result = process_file(fpath, dry_run=dry_run, show_detail=show_detail)

            if "error" in result:
                errors.append((fpath, result["error"]))
                continue

            total_removed += result["removed"]
            total_kept    += result["kept"]
            if result["removed"] > 0:
                affected_files += 1

    # ─── Tổng kết ───────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    print("📊 TỔNG KẾT")
    print(f"   Files quét       : {total_files}")
    print(f"   Files bị ảnh hưởng: {affected_files}")
    print(f"   Câu đã {'sẽ ' if dry_run else ''}xóa : {total_removed}")
    print(f"   Câu giữ lại      : {total_kept}")
    if errors:
        print(f"\n⚠️  Lỗi đọc file ({len(errors)}):")
        for p, e in errors:
            print(f"   {os.path.basename(p)}: {e}")

    if dry_run and total_removed > 0:
        print(f"\n💡 Chạy lại với --delete để xóa thật:")
        prog = os.path.basename(__file__)
        extra = f'"{word_dir}"' if word_dir != DEFAULT_WORD_DIR else ""
        print(f"   python {prog} {extra} --delete")


if __name__ == "__main__":
    main()
