"""
Xóa các câu hỏi tự luận/điền khuyết/đúng sai trực tiếp khỏi nội dung file Word (.docx).
CHỈ GIỮ LẠI các câu hỏi trắc nghiệm A, B, C, D HOẶC câu có highlight vàng.
- Nếu file không còn câu nào phù hợp → xóa file.
- Nếu folder không còn file nào → xóa folder.

Usage:
    python clean_essay_questions.py <đường_dẫn_file_hoặc_thư_mục> [--delete]
"""

import os
import sys
import re
try:
    import docx
    from docx.oxml.table import CT_Tbl
    from docx.oxml.text.paragraph import CT_P
    from docx.table import Table
    from docx.text.paragraph import Paragraph
    from docx.oxml.ns import qn
except ImportError:
    print("Vui lòng cài đặt python-docx: pip install python-docx")
    sys.exit(1)

def long_path(p):
    if sys.platform == 'win32' and not p.startswith('\\\\?\\'):
        return '\\\\?\\' + os.path.abspath(p)
    return p

def iter_block_items(parent):
    """Duyệt tuần tự qua các Paragraph và Table trong Document."""
    for child in parent.element.body:
        if isinstance(child, CT_P):
            yield Paragraph(child, parent)
        elif isinstance(child, CT_Tbl):
            yield Table(child, parent)

def delete_item(item):
    """Xóa 1 paragraph hoặc 1 table khỏi document"""
    elem = item._element
    try:
        elem.getparent().remove(elem)
        item._element = None
    except Exception:
        pass


# ── Highlight detection ──────────────────────────────────────────────────────

YELLOW_COLORS = {"yellow", "darkYellow"}

def has_yellow_highlight_paragraph(paragraph):
    """Check if any run in a paragraph has yellow highlight."""
    for run in paragraph.runs:
        rPr = run._element.find(qn('w:rPr'))
        if rPr is not None:
            hl = rPr.find(qn('w:highlight'))
            if hl is not None:
                val = hl.get(qn('w:val'))
                if val and val.lower() in YELLOW_COLORS:
                    return True
            # Also check shading (some editors use shading instead of highlight)
            shd = rPr.find(qn('w:shd'))
            if shd is not None:
                fill = shd.get(qn('w:fill'))
                if fill and fill.upper() in ("FFFF00", "FFD700", "FFC000", "FFEB3B", "FFF176"):
                    return True
    return False

def block_has_yellow_highlight(block):
    """Check if any element in a block has yellow highlighting."""
    for item in block:
        if isinstance(item, Paragraph):
            if has_yellow_highlight_paragraph(item):
                return True
        elif isinstance(item, Table):
            for row in item.rows:
                for cell in row.cells:
                    for p in cell.paragraphs:
                        if has_yellow_highlight_paragraph(p):
                            return True
    return False


# ── Core logic ───────────────────────────────────────────────────────────────

def clean_file(file_path, dry_run=True):
    """
    Returns True if the file should be deleted (no valid questions remain).
    """
    doc = docx.Document(long_path(file_path))

    blocks = []
    current_block = []

    for item in iter_block_items(doc):
        if isinstance(item, Paragraph):
            text = item.text.strip()
            if re.match(r'^(Câu|Bài)\s+\d+\s*[:.)]', text, re.IGNORECASE):
                if current_block:
                    blocks.append(current_block)
                current_block = [item]
            else:
                if current_block:
                    current_block.append(item)
                else:
                    current_block = [item]
        elif isinstance(item, Table):
            if current_block:
                current_block.append(item)
            else:
                current_block = [item]

    if current_block:
        blocks.append(current_block)

    questions_removed = 0
    questions_kept = 0

    for block in blocks:
        if not block:
            continue

        first_item = block[0]
        if not isinstance(first_item, Paragraph):
            continue

        first_line = first_item.text.strip()
        if not re.match(r'^(Câu|Bài)\s+\d+\s*[:.)]', first_line, re.IGNORECASE):
            continue

        # Gather full text
        full_text_parts = []
        for item in block:
            if isinstance(item, Paragraph):
                full_text_parts.append(item.text)
            elif isinstance(item, Table):
                for row in item.rows:
                    for cell in row.cells:
                        full_text_parts.append(cell.text)
        full_text = "\n".join(full_text_parts)

        # Check multiple choice A, B, C, D
        has_a = re.search(r'^\s*A\s*[.)]', full_text, re.MULTILINE | re.IGNORECASE)
        has_b = re.search(r'^\s*B\s*[.)]', full_text, re.MULTILINE | re.IGNORECASE)

        # Check True/False format
        is_tf_format = re.search(r'^\s*(Đúng|Sai)\s*$', full_text, re.MULTILINE | re.IGNORECASE)
        is_tf_solution = re.search(r'^[a-d]\s*[-.:]\s*(Đúng|Sai)', full_text, re.MULTILINE | re.IGNORECASE)

        is_multiple_choice = bool(has_a and has_b) and not (is_tf_format or is_tf_solution)

        # Check yellow highlight
        is_highlighted = block_has_yellow_highlight(block)

        # KEEP if: has ABCD options OR has yellow highlight
        should_keep = is_multiple_choice or is_highlighted

        if not should_keep:
            questions_removed += 1
            if not dry_run:
                for item in block:
                    delete_item(item)
        else:
            questions_kept += 1

    file_name = os.path.basename(file_path)

    if questions_removed > 0:
        if dry_run:
            print(f"🔍 [DRY RUN] SẼ XÓA {questions_removed} câu, GIỮ {questions_kept} câu trong: {file_name}")
        else:
            if questions_kept == 0:
                # No valid questions left → delete the entire file
                try:
                    os.remove(long_path(file_path))
                    print(f"🗑️  [XÓA FILE] Không còn câu phù hợp → đã xóa: {file_name}")
                except Exception as e:
                    print(f"⚠️  Không thể xóa file {file_name}: {e}")
                return True  # signal: file deleted
            else:
                doc.save(long_path(file_path))
                print(f"✅ [ĐÃ LƯU] Xóa {questions_removed} câu, giữ {questions_kept} câu trong: {file_name}")
    else:
        if questions_kept > 0:
            pass  # all good
        else:
            # File has no question blocks at all
            if not dry_run:
                try:
                    os.remove(long_path(file_path))
                    print(f"🗑️  [XÓA FILE] Không tìm thấy câu hỏi nào → đã xóa: {file_name}")
                except Exception as e:
                    print(f"⚠️  Không thể xóa file {file_name}: {e}")
                return True
            else:
                print(f"🔍 [DRY RUN] SẼ XÓA FILE (không có câu hỏi nào): {file_name}")

    return False


def process_directory(directory, dry_run=True):
    """Process all .docx files, then clean up empty folders bottom-up."""
    for root, dirs, files in os.walk(directory, topdown=False):
        for f in files:
            if f.lower().endswith('.docx') and not f.startswith('~$'):
                full_path = os.path.join(root, f)
                try:
                    clean_file(full_path, dry_run)
                except Exception as e:
                    print(f"⚠️ Lỗi {f}: {e}")

        # After processing files, check if folder is now empty
        remaining = os.listdir(root)
        if not remaining and root != os.path.abspath(directory):
            if dry_run:
                print(f"🔍 [DRY RUN] SẼ XÓA FOLDER RỖNG: {root}")
            else:
                try:
                    os.rmdir(root)
                    print(f"🗑️  [XÓA FOLDER] Folder rỗng → đã xóa: {root}")
                except Exception as e:
                    print(f"⚠️  Không thể xóa folder {root}: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Sử dụng: python clean_essay_questions.py <thư_mục_hoặc_file> [--delete]")
        sys.exit(1)

    target = sys.argv[1]
    dry_run = "--delete" not in sys.argv

    if dry_run:
        print("🔍 Ở CHẾ ĐỘ XEM TRƯỚC (dry run). Thêm --delete để thực hiện thay đổi.\n")
    else:
        print("⚠️  Ở CHẾ ĐỘ THỰC TẾ. File/folder sẽ bị xóa nếu không phù hợp.\n")

    if os.path.isfile(target):
        clean_file(target, dry_run)
    elif os.path.isdir(target):
        process_directory(target, dry_run)
    else:
        print("Đường dẫn không tồn tại!")
