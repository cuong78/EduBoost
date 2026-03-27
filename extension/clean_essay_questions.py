"""
Xóa các câu hỏi tự luận/điền khuyết/đúng sai trực tiếp khỏi nội dung file Word (.docx).
CHỈ GIỮ LẠI các câu hỏi trắc nghiệm A, B, C, D. Xóa toàn bộ phần còn lại (bao gồm cả bảng biểu ở câu đó).

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
except ImportError:
    print("Vui lòng cài đặt python-docx: pip install python-docx")
    sys.exit(1)

def long_path(p):
    if sys.platform == 'win32' and not p.startswith('\\\\?\\'):
        return '\\\\?\\' + os.path.abspath(p)
    return p

def iter_block_items(parent):
    """
    Duyệt tuần tự qua các Paragraph và Table trong Document theo đúng thứ tự xuất hiện.
    """
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

def clean_file(file_path, dry_run=True):
    doc = docx.Document(long_path(file_path))
    
    blocks = []
    current_block = []
    
    # Phân nhóm tuần tự các phần tử (đoạn văn + bảng) theo từng câu hỏi
    for item in iter_block_items(doc):
        if isinstance(item, Paragraph):
            text = item.text.strip()
            # Dấu hiệu bắt đầu 1 câu mới
            if re.match(r'^(Câu|Bài)\s+\d+\s*[:.]', text, re.IGNORECASE):
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

    for block in blocks:
        if not block:
            continue
            
        # Kiểm tra phần tử đầu tiên của block có phải là Paragraph "Câu X:" không
        first_item = block[0]
        if not isinstance(first_item, Paragraph):
            continue
            
        first_line = first_item.text.strip()
        if not re.match(r'^(Câu|Bài)\s+\d+\s*[:.]', first_line, re.IGNORECASE):
            continue
            
        # Lấy toàn bộ text của block (bao gồm text trong bảng nếu có) để kiểm tra
        full_text_parts = []
        for item in block:
            if isinstance(item, Paragraph):
                full_text_parts.append(item.text)
            elif isinstance(item, Table):
                for row in item.rows:
                    for cell in row.cells:
                        full_text_parts.append(cell.text)
        
        full_text = "\n".join(full_text_parts)
        
        # Chỉ giữ lại nếu CÓ đáp án dạng A, B (Trắc nghiệm M-C)
        has_a = re.search(r'^\s*A\s*[.)]', full_text, re.MULTILINE | re.IGNORECASE)
        has_b = re.search(r'^\s*B\s*[.)]', full_text, re.MULTILINE | re.IGNORECASE)
        
        # Dấu hiệu nhận dạng câu Đúng/Sai (Ví dụ: cột Đúng, Sai trong bảng)
        is_tf_format = re.search(r'^\s*(Đúng|Sai)\s*$', full_text, re.MULTILINE | re.IGNORECASE)
        # Hoặc lời giải dạng "a - Đúng", "b - Sai"
        is_tf_solution = re.search(r'^[a-d]\s*[-\.:]\s*(Đúng|Sai)', full_text, re.MULTILINE | re.IGNORECASE)
        
        is_multiple_choice = bool(has_a and has_b) and not (is_tf_format or is_tf_solution)
        
        # Nếu không phải trắc nghiệm 4 đáp án hoặc là câu Đúng/Sai -> xóa sạch toàn bộ block (cả Paragraph và Table)
        if not is_multiple_choice:
            questions_removed += 1
            if not dry_run:
                for item in block:
                    delete_item(item)

    file_name = os.path.basename(file_path)
    if questions_removed > 0:
        if dry_run:
            print(f"🔍 [DRY RUN] SẼ XÓA {questions_removed} câu không phải trắc nghiệm ABCD trong: {file_name}")
        else:
            doc.save(long_path(file_path))
            print(f"✅ [ĐÃ LƯU] Đã xóa {questions_removed} câu trong: {file_name}")
    else:
        pass

def process_directory(directory, dry_run=True):
    for root, dirs, files in os.walk(directory):
        for f in files:
            if f.lower().endswith('.docx') and not f.startswith('~$'):
                full_path = os.path.join(root, f)
                try:
                    clean_file(full_path, dry_run)
                except Exception as e:
                    print(f"⚠️ Lỗi {f}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Sử dụng: python clean_essay_questions.py <thư_mục_hoặc_file> [--delete]")
        sys.exit(1)
        
    target = sys.argv[1]
    dry_run = "--delete" not in sys.argv
    
    if dry_run:
        print("🔍 Ở CHẾ ĐỘ XEM TRƯỚC (dry run). Thêm --delete để lưu các file đã thay đổi.\n")
    else:
        print("⚠️  Ở CHẾ ĐỘ THỰC TẾ. Dữ liệu (file Word) sẽ bị chỉnh sửa.\n")

    if os.path.isfile(target):
        clean_file(target, dry_run)
    elif os.path.isdir(target):
        process_directory(target, dry_run)
    else:
        print("Đường dẫn không tồn tại!")
