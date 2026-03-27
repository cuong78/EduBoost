"""
Rename Word files: rút ngắn tên file quá dài để tránh lỗi path Windows.
Giữ lại phần quan trọng (số câu + loại bài), bỏ phần dư thừa.

Usage:
    python rename_word.py              # Dry run (chỉ in ra, không rename)
    python rename_word.py --rename     # Thực sự rename
"""

import os
import sys
import re

WORD_DIR = r"D:\EXE201\word"
MAX_FILENAME_LEN = 80  # Giới hạn tên file (không tính extension)

def long_path(p):
    if sys.platform == 'win32' and not p.startswith('\\\\?\\'):
        return '\\\\?\\' + os.path.abspath(p)
    return p

def shorten_name(filename):
    """Rút ngắn tên file Word, giữ phần quan trọng."""
    name, ext = os.path.splitext(filename)
    
    # Nếu đã đủ ngắn thì bỏ qua
    if len(name) <= MAX_FILENAME_LEN:
        return filename
    
    # Bỏ hậu tố ngày tháng: _2026_03_21, _2026_03_20
    name = re.sub(r'_\d{4}_\d{2}_\d{2}', '', name)
    
    # Bỏ hậu tố duplicate: (1), (2)
    name = re.sub(r'\s*\(\d+\)$', '', name)
    
    # Bỏ "co-dap-an", "co-loi-giai" (không cần trong tên file)
    name = re.sub(r'-co-dap-an', '', name)
    name = re.sub(r'-co-loi-giai', '', name)
    
    # Bỏ "ket-noi-tri-thuc" (quá dài, không cần)
    name = re.sub(r'-ket-noi-tri-thuc', '', name)
    
    # Rút gọn prefix: "cau-trac-nghiem" → "tn", "bai-tap" → "bt"
    name = re.sub(r'^(\d+)-cau-trac-nghiem', r'\1-tn', name)
    name = re.sub(r'^(\d+)-bai-tap', r'\1-bt', name)
    
    # Rút gọn tên môn: hoa-10 → h10, toan-10 → t10, vat-li-10 → l10
    name = re.sub(r'-hoa-(\d+)', r'-h\1', name)
    name = re.sub(r'-toan-(\d+)', r'-t\1', name)
    name = re.sub(r'-vat-li-(\d+)', r'-l\1', name)
    name = re.sub(r'-vat-li', '-ly', name)
    
    # Bỏ "phan-1", "phan-2" nếu còn quá dài
    if len(name) > MAX_FILENAME_LEN:
        name = re.sub(r'-phan-\d+$', '', name)
    
    # Nếu vẫn còn dài, cắt bớt và thêm hash ngắn để tránh trùng
    if len(name) > MAX_FILENAME_LEN:
        short = name[:MAX_FILENAME_LEN - 5]
        # Cắt tại dấu gạch ngang cuối để không cắt giữa từ
        last_dash = short.rfind('-')
        if last_dash > MAX_FILENAME_LEN // 2:
            short = short[:last_dash]
        # Thêm hash 4 ký tự từ tên gốc
        h = format(hash(name) % 0xFFFF, '04x')
        name = f"{short}-{h}"
    
    return name + ext

dry_run = "--rename" not in sys.argv

if dry_run:
    print("🔍 CHẾ ĐỘ XEM TRƯỚC (dry run) — thêm --rename để rename thật\n")
else:
    print("⚠️  CHẾ ĐỘ RENAME THẬT\n")

total_renamed = 0
total_skipped = 0

for root, dirs, files in os.walk(WORD_DIR):
    doc_files = [f for f in files if (f.lower().endswith('.docx') or f.lower().endswith('.doc')) and not f.startswith('~$')]
    
    for f in doc_files:
        new_name = shorten_name(f)
        if new_name == f:
            total_skipped += 1
            continue
        
        old_path = os.path.join(root, f)
        new_path = os.path.join(root, new_name)
        
        # Tránh trùng tên
        if os.path.exists(long_path(new_path)):
            name, ext = os.path.splitext(new_name)
            h = format(hash(f) % 0xFFFF, '04x')
            new_name = f"{name}-{h}{ext}"
            new_path = os.path.join(root, new_name)
        
        rel = os.path.relpath(root, WORD_DIR)
        print(f"📁 {rel}")
        print(f"   📄 {f}")
        print(f"   ➡️  {new_name}")
        print(f"   📏 {len(f)} → {len(new_name)} chars\n")
        
        if not dry_run:
            try:
                os.rename(long_path(old_path), long_path(new_path))
            except OSError as e:
                print(f"   ⚠️ Lỗi rename: {e}\n")
        
        total_renamed += 1

print(f"{'=' * 50}")
print(f"📊 {'Sẽ rename' if dry_run else 'Đã rename'}: {total_renamed} file, Bỏ qua (đã ngắn): {total_skipped} file")
if dry_run and total_renamed > 0:
    print(f"\n💡 Chạy lại với: python rename_word.py --rename")
