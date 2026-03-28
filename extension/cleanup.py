"""
Dọn dẹp Word files: Xóa tự luận, giữ trắc nghiệm.

Chạy 2 bước:
  BƯỚC 1 (file-level): Xóa file chỉ chứa tự luận, giữ trắc nghiệm lớn nhất mỗi folder
  BƯỚC 2 (nội dung):   Mở từng .docx → xóa câu tự luận bên trong → xóa file/folder rỗng

Usage:
    python cleanup.py <thư_mục>                 # Dry run
    python cleanup.py <thư_mục> --delete        # Xóa thật
    python cleanup.py <thư_mục> --step1         # Chỉ chạy bước 1
    python cleanup.py <thư_mục> --step2         # Chỉ chạy bước 2
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
    print("pip install python-docx")
    sys.exit(1)

YELLOW_COLORS = {"yellow", "darkyellow"}


def long_path(p):
    if sys.platform == "win32" and not p.startswith("\\\\?\\"):
        return "\\\\?\\" + os.path.abspath(p)
    return p


# ═══════════════════════════════════════════════════════════
# BƯỚC 1: Lọc ở mức FILE
# ═══════════════════════════════════════════════════════════

def file_has_mc(file_path):
    """Kiểm tra file có chứa trắc nghiệm A/B/C/D hoặc Đúng/Sai không."""
    if not file_path.lower().endswith(".docx"):
        return True  # .doc không đọc được → giữ lại

    try:
        doc = docx.Document(long_path(file_path))
        text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())

        has_ab = (
            re.search(r"^\s*A\s*[.)]", text, re.MULTILINE) and
            re.search(r"^\s*B\s*[.)]", text, re.MULTILINE)
        )
        has_tf = re.search(r"\b(Đúng|Sai)\b", text, re.IGNORECASE)

        return bool(has_ab or has_tf)
    except Exception as e:
        print(f"   ⚠️ Không đọc được: {os.path.basename(file_path)} ({e})")
        return True


def step1_filter_files(directory, dry_run=True):
    """Xóa file tự luận, giữ 1 file trắc nghiệm lớn nhất mỗi folder."""
    stats = {"deleted": 0, "essay": 0, "kept": 0}

    for root, dirs, files in os.walk(directory):
        word_files = [
            f for f in files
            if (f.lower().endswith(".docx") or f.lower().endswith(".doc"))
            and not f.startswith("~$")
        ]
        if not word_files:
            continue

        valid = []
        essay = []
        for f in word_files:
            fp = os.path.join(root, f)
            if file_has_mc(fp):
                valid.append((f, fp))
            else:
                essay.append((f, fp))

        rel = os.path.relpath(root, directory)

        # Xóa file tự luận
        for name, path in essay:
            print(f"   ❌ Tự luận: {rel}/{name}")
            if not dry_run:
                try:
                    os.remove(long_path(path))
                except OSError as e:
                    print(f"      ⚠️ {e}")
            stats["essay"] += 1
            stats["deleted"] += 1

        if not valid:
            continue

        # Giữ file lớn nhất
        sized = []
        for name, path in valid:
            try:
                sized.append((name, os.path.getsize(long_path(path)), path))
            except OSError:
                pass

        if not sized:
            continue

        sized.sort(key=lambda x: x[1], reverse=True)
        keep = sized[0]
        stats["kept"] += 1

        for name, size, path in sized[1:]:
            print(f"   ❌ Trùng lắp: {rel}/{name} ({size // 1024} KB)")
            if not dry_run:
                try:
                    os.remove(long_path(path))
                except OSError as e:
                    print(f"      ⚠️ {e}")
            stats["deleted"] += 1

    return stats


# ═══════════════════════════════════════════════════════════
# BƯỚC 2: Lọc ở mức CÂU HỎI bên trong file
# ═══════════════════════════════════════════════════════════

def has_yellow_hl(paragraph):
    """Paragraph có highlight vàng không."""
    for run in paragraph.runs:
        rPr = run._element.find(qn("w:rPr"))
        if rPr is None:
            continue
        hl = rPr.find(qn("w:highlight"))
        if hl is not None:
            val = (hl.get(qn("w:val")) or "").lower()
            if val in YELLOW_COLORS:
                return True
        shd = rPr.find(qn("w:shd"))
        if shd is not None:
            fill = (shd.get(qn("w:fill")) or "").upper()
            if fill in ("FFFF00", "FFD700", "FFC000", "FFEB3B", "FFF176"):
                return True
    return False


def block_has_yellow(block):
    for item in block:
        if isinstance(item, Paragraph) and has_yellow_hl(item):
            return True
        if isinstance(item, Table):
            for row in item.rows:
                for cell in row.cells:
                    for p in cell.paragraphs:
                        if has_yellow_hl(p):
                            return True
    return False


def iter_blocks(parent):
    for child in parent.element.body:
        if isinstance(child, CT_P):
            yield Paragraph(child, parent)
        elif isinstance(child, CT_Tbl):
            yield Table(child, parent)


def delete_element(item):
    try:
        item._element.getparent().remove(item._element)
    except Exception:
        pass


def clean_file_content(file_path, dry_run=True):
    """Mở file, xóa câu tự luận, giữ trắc nghiệm + highlight. Trả True nếu xóa file."""
    doc = docx.Document(long_path(file_path))

    # Chia nội dung thành các block (mỗi câu hỏi 1 block)
    blocks, current = [], []
    for item in iter_blocks(doc):
        if isinstance(item, Paragraph):
            text = item.text.strip()
            if re.match(r"^(Câu|Bài)\s+\d+\s*[:.)]", text, re.IGNORECASE):
                if current:
                    blocks.append(current)
                current = [item]
            else:
                current.append(item) if current else current.append(item)
        elif isinstance(item, Table):
            current.append(item)
    if current:
        blocks.append(current)

    removed, kept = 0, 0

    for block in blocks:
        first = block[0]
        if not isinstance(first, Paragraph):
            continue
        if not re.match(r"^(Câu|Bài)\s+\d+\s*[:.)]", first.text.strip(), re.IGNORECASE):
            continue

        # Thu thập text
        parts = []
        for item in block:
            if isinstance(item, Paragraph):
                parts.append(item.text)
            elif isinstance(item, Table):
                for row in item.rows:
                    for cell in row.cells:
                        parts.append(cell.text)
        text = "\n".join(parts)

        # Kiểm tra trắc nghiệm
        has_ab = (
            re.search(r"^\s*A\s*[.)]", text, re.MULTILINE) and
            re.search(r"^\s*B\s*[.)]", text, re.MULTILINE)
        )
        is_tf = (
            re.search(r"^\s*(Đúng|Sai)\s*$", text, re.MULTILINE | re.IGNORECASE) or
            re.search(r"^[a-d]\s*[-.:]\s*(Đúng|Sai)", text, re.MULTILINE | re.IGNORECASE)
        )
        is_mc = bool(has_ab) and not bool(is_tf)

        # Giữ nếu: trắc nghiệm HOẶC có highlight vàng
        if is_mc or block_has_yellow(block):
            kept += 1
        else:
            removed += 1
            if not dry_run:
                for item in block:
                    delete_element(item)

    name = os.path.basename(file_path)

    if removed > 0 and not dry_run:
        if kept == 0:
            try:
                os.remove(long_path(file_path))
                print(f"   🗑️ Xóa file (0 câu còn lại): {name}")
            except Exception as e:
                print(f"   ⚠️ {e}")
            return True
        else:
            doc.save(long_path(file_path))
            print(f"   ✅ Lưu: xóa {removed} câu, giữ {kept} câu: {name}")
    elif removed > 0:
        print(f"   🔍 Sẽ xóa {removed} câu, giữ {kept} câu: {name}")
        if kept == 0:
            print(f"      → Sẽ xóa file")

    return removed > 0 and kept == 0


def step2_clean_content(directory, dry_run=True):
    """Dọn nội dung bên trong file, xóa folder rỗng."""
    stats = {"files_cleaned": 0, "files_deleted": 0, "folders_deleted": 0}

    for root, dirs, files in os.walk(directory, topdown=False):
        for f in files:
            if f.lower().endswith(".docx") and not f.startswith("~$"):
                fp = os.path.join(root, f)
                try:
                    deleted = clean_file_content(fp, dry_run)
                    if deleted:
                        stats["files_deleted"] += 1
                    else:
                        stats["files_cleaned"] += 1
                except Exception as e:
                    print(f"   ⚠️ Lỗi {f}: {e}")

        # Xóa folder rỗng
        try:
            remaining = os.listdir(root)
        except OSError:
            continue
        if not remaining and root != os.path.abspath(directory):
            if dry_run:
                print(f"   🔍 Sẽ xóa folder rỗng: {os.path.relpath(root, directory)}")
            else:
                try:
                    os.rmdir(root)
                    print(f"   🗑️ Xóa folder rỗng: {os.path.relpath(root, directory)}")
                except Exception:
                    pass
            stats["folders_deleted"] += 1

    return stats


# ═══════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Sử dụng: python cleanup.py <thư_mục> [--delete] [--step1] [--step2]")
        sys.exit(1)

    target = sys.argv[1]
    dry_run = "--delete" not in sys.argv
    only_step1 = "--step1" in sys.argv
    only_step2 = "--step2" in sys.argv
    run_both = not only_step1 and not only_step2

    if dry_run:
        print("🔍 XEM TRƯỚC (dry run) — thêm --delete để xóa thật\n")
    else:
        print("⚠️  XÓA THẬT\n")

    if not os.path.isdir(target):
        print(f"Thư mục không tồn tại: {target}")
        sys.exit(1)

    if run_both or only_step1:
        print("=" * 60)
        print("📋 BƯỚC 1: Lọc file tự luận, giữ 1 file lớn nhất mỗi folder")
        print("=" * 60)
        s1 = step1_filter_files(target, dry_run)
        print(f"\n📊 Bước 1: Xóa {s1['deleted']} file ({s1['essay']} tự luận), Giữ {s1['kept']} file\n")

    if run_both or only_step2:
        print("=" * 60)
        print("📋 BƯỚC 2: Dọn câu tự luận bên trong file .docx")
        print("=" * 60)
        s2 = step2_clean_content(target, dry_run)
        print(f"\n📊 Bước 2: Dọn {s2['files_cleaned']} file, Xóa {s2['files_deleted']} file, {s2['folders_deleted']} folder rỗng\n")

    if dry_run:
        print("💡 Chạy lại với: python cleanup.py", target, "--delete")
