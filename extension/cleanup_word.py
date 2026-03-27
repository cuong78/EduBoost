"""
Cleanup Word files: giữ lại 1 file .docx lớn nhất trong mỗi folder bài.
Cấu trúc: word/Lớp X/Môn/Chương N/Bài M/[nhiều file .docx] → giữ 1 file lớn nhất

Usage:
    python cleanup_word.py              # Dry run (chỉ in ra, không xóa)
    python cleanup_word.py --delete     # Thực sự xóa file
"""

import os
import sys

# Đường dẫn tới folder word
WORD_DIR = r"D:\EXE201\word"

# Fix Windows long path issue (>260 chars)
def long_path(p):
    if sys.platform == 'win32' and not p.startswith('\\\\?\\'):
        return '\\\\?\\' + os.path.abspath(p)
    return p

dry_run = "--delete" not in sys.argv

if dry_run:
    print("🔍 CHẾ ĐỘ XEM TRƯỚC (dry run) — thêm --delete để xóa thật\n")
else:
    print("⚠️  CHẾ ĐỘ XÓA THẬT\n")

total_deleted = 0
total_kept = 0

for root, dirs, files in os.walk(WORD_DIR):
    # Lọc chỉ các file .docx/.doc (bỏ file tạm ~$)
    docx_files = [f for f in files if (f.lower().endswith('.docx') or f.lower().endswith('.doc')) and not f.startswith('~$')]

    if len(docx_files) <= 1:
        continue

    # Sắp xếp theo kích thước giảm dần → giữ file lớn nhất
    docx_with_size = []
    for f in docx_files:
        full_path = os.path.join(root, f)
        try:
            size = os.path.getsize(long_path(full_path))
            docx_with_size.append((f, size, full_path))
        except OSError as e:
            print(f"   ⚠️ Không đọc được: {f} ({e})")

    if len(docx_with_size) <= 1:
        continue

    docx_with_size.sort(key=lambda x: x[1], reverse=True)

    # Giữ file đầu tiên (lớn nhất), xóa còn lại
    keep = docx_with_size[0]
    to_delete = docx_with_size[1:]

    rel_path = os.path.relpath(root, WORD_DIR)
    print(f"📁 {rel_path}")
    print(f"   ✅ Giữ: {keep[0]} ({keep[1] // 1024} KB)")

    for f_name, f_size, f_path in to_delete:
        print(f"   ❌ Xóa: {f_name} ({f_size // 1024} KB)")
        if not dry_run:
            try:
                os.remove(long_path(f_path))
            except OSError as e:
                print(f"      ⚠️ Lỗi xóa: {e}")
        total_deleted += 1

    total_kept += 1
    print()

print(f"{'=' * 50}")
print(f"📊 Tổng kết: Giữ {total_kept} file, {'sẽ xóa' if dry_run else 'đã xóa'} {total_deleted} file")
if dry_run and total_deleted > 0:
    print(f"\n💡 Chạy lại với: python cleanup_word.py --delete")
