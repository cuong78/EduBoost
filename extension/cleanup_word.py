"""
Cleanup Word files: Lọc và xóa các file tự luận, sau đó giữ lại 1 file .docx lớn nhất trong mỗi folder bài.
Cấu trúc: word/Lớp X/Môn/Chương N/Bài M/[nhiều file .docx] → giữ 1 file trắc nghiệm lớn nhất

Usage:
    python cleanup_word.py              # Dry run (chỉ in ra, không xóa)
    python cleanup_word.py --delete     # Thực sự xóa file
"""

import os
import sys
import re
try:
    import docx
except ImportError:
    print("Vui lòng cài đặt thư viện python-docx: pip install python-docx")
    sys.exit(1)

# Đường dẫn tới folder word
WORD_DIR = r"D:\EXE201\word"

# Fix Windows long path issue (>260 chars)
def long_path(p):
    if sys.platform == 'win32' and not p.startswith('\\\\?\\'):
        return '\\\\?\\' + os.path.abspath(p)
    return p

def is_multiple_choice(file_path):
    """
    Kiểm tra xem file có chứa câu hỏi trắc nghiệm (A, B, C, D) hoặc Đúng/Sai không.
    Nếu không có, đóng vai trò là câu hỏi tự luận.
    """
    if not file_path.lower().endswith('.docx'):
        # python-docx chỉ đọc được .docx. Bỏ qua kiểm tra nội dung với các file .doc
        return True 
        
    try:
        # Load the document
        doc = docx.Document(long_path(file_path))
        
        # Read all text
        full_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        
        # Kiểm tra sự xuất hiện của A., B., C., D. hoặc A), B), C), D) ở đầu dòng
        has_a = re.search(r'^\s*A\s*[.)]', full_text, re.MULTILINE | re.IGNORECASE)
        has_b = re.search(r'^\s*B\s*[.)]', full_text, re.MULTILINE | re.IGNORECASE)
        
        # Kiểm tra sự xuất hiện của câu hỏi Đúng/Sai
        has_tf = re.search(r'\b(Đúng|Sai)\b', full_text, re.IGNORECASE)
        
        # Phải có ít nhất A và B, hoặc có đúng/sai
        if (has_a and has_b) or has_tf:
            return True
            
        return False
    except Exception as e:
        print(f"   ⚠️ Không đọc được nội dung: {os.path.basename(file_path)} ({e})")
        return True # Giữ lại để an toàn

dry_run = "--delete" not in sys.argv

if dry_run:
    print("🔍 CHẾ ĐỘ XEM TRƯỚC (dry run) — thêm --delete để xóa thật\n")
else:
    print("⚠️  CHẾ ĐỘ XÓA THẬT\n")

total_deleted = 0
total_essay_deleted = 0
total_kept = 0

for root, dirs, files in os.walk(WORD_DIR):
    # Lọc chỉ các file .docx/.doc (bỏ file tạm ~$)
    word_files = [f for f in files if (f.lower().endswith('.docx') or f.lower().endswith('.doc')) and not f.startswith('~$')]

    if not word_files:
        continue

    valid_files = []
    essay_files = []

    # Phân loại file trắc nghiệm vs file tự luận
    for f in word_files:
        full_path = os.path.join(root, f)
        if is_multiple_choice(full_path):
            valid_files.append((f, full_path))
        else:
            essay_files.append((f, full_path))

    rel_path = os.path.relpath(root, WORD_DIR)
    print(f"📁 {rel_path}")

    # Xóa file tự luận
    for f_name, f_path in essay_files:
        print(f"   ❌ Xóa (Tự luận): {f_name}")
        if not dry_run:
            try:
                os.remove(long_path(f_path))
            except OSError as e:
                print(f"      ⚠️ Lỗi xóa: {e}")
        total_essay_deleted += 1
        total_deleted += 1

    # Nếu không còn file hợp lệ nào, chuyển qua folder tiếp theo
    if not valid_files:
        print()
        continue

    # Tính kích thước và giữ lại 1 file hợp lệ lớn nhất
    valid_with_size = []
    for f_name, full_path in valid_files:
        try:
            size = os.path.getsize(long_path(full_path))
            valid_with_size.append((f_name, size, full_path))
        except OSError as e:
            print(f"   ⚠️ Không đọc được size: {f_name} ({e})")
            
    if not valid_with_size:
        print()
        continue

    valid_with_size.sort(key=lambda x: x[1], reverse=True)

    keep = valid_with_size[0]
    to_delete = valid_with_size[1:]

    print(f"   ✅ Giữ: {keep[0]} ({keep[1] // 1024} KB)")
    total_kept += 1

    for f_name, f_size, f_path in to_delete:
        print(f"   ❌ Xóa (Trùng lắp/Nhỏ hơn): {f_name} ({f_size // 1024} KB)")
        if not dry_run:
            try:
                os.remove(long_path(f_path))
            except OSError as e:
                print(f"      ⚠️ Lỗi xóa: {e}")
        total_deleted += 1

    print()

print(f"{'=' * 50}")
print(f"📊 Tổng kết: Giữ {total_kept} file, {'sẽ xóa' if dry_run else 'đã xóa'} {total_deleted} file ({total_essay_deleted} file tự luận)")
if dry_run and total_deleted > 0:
    print(f"\n💡 Chạy lại với: python cleanup_word.py --delete")

