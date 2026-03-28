"""
Rename Word files: rút ngắn tên file tối đa.

Usage:
    python rename_word.py              # Dry run (chỉ in ra, không rename)
    python rename_word.py --rename     # Thực sự rename
"""

import os
import sys
import re

WORD_DIR = r"D:\EXE201\resource\word"
MAX_FILENAME_LEN = 50  # Tên file tối đa (không tính .docx)


def long_path(p):
    if sys.platform == "win32" and not p.startswith("\\\\?\\"):
        return "\\\\?\\" + os.path.abspath(p)
    return p


def shorten_name(filename):
    """Rút ngắn tên file Word tối đa."""
    name, ext = os.path.splitext(filename)

    if len(name) <= MAX_FILENAME_LEN:
        return filename

    original = name

    # 1. Bỏ ngày tháng: _2026_03_21
    name = re.sub(r"_\d{4}_\d{2}_\d{2}", "", name)

    # 2. Bỏ duplicate: (1), (2)
    name = re.sub(r"\s*\(\d+\)$", "", name)

    # 3. Bỏ hậu tố thừa
    for noise in [
        "-co-dap-an", "-co-loi-giai", "-ket-noi-tri-thuc",
        "-chan-troi-sang-tao", "-canh-dieu", "-sach-giao-khoa",
        "-sgk", "-sbt", "-de-thi", "-on-tap",
        "-tra-loi-ngan", "-dien-khuyet",
    ]:
        name = name.replace(noise, "")

    # 4. Rút gọn prefix số-loại
    name = re.sub(r"^(\d+)-cau-trac-nghiem", r"\1-tn", name)
    name = re.sub(r"^(\d+)-cau-", r"\1-", name)
    name = re.sub(r"^(\d+)-bai-tap", r"\1-bt", name)
    name = re.sub(r"^trac-nghiem", "tn", name)
    name = re.sub(r"^bai-tap", "bt", name)

    # 5. Rút gọn tên môn
    subs = {
        "hoa-hoc": "hh", "hoa": "hh",
        "toan-hoc": "th", "toan": "th",
        "vat-li": "vl", "vat-ly": "vl",
        "sinh-hoc": "sh", "sinh": "sh",
        "khtn": "khtn",
        "dia-li": "dl", "dia-ly": "dl",
        "lich-su": "ls",
        "ngu-van": "nv",
        "gdcd": "gdcd",
        "tieng-anh": "ta",
        "tin-hoc": "tin",
        "cong-nghe": "cn",
    }
    for full, short in subs.items():
        name = name.replace(f"-{full}-", f"-{short}-")
        name = name.replace(f"-{full}", f"-{short}")
        if name.startswith(f"{full}-"):
            name = f"{short}-" + name[len(full) + 1:]

    # 6. Rút gọn bài/chương
    name = re.sub(r"-bai-(\d+)", r"-b\1", name)
    name = re.sub(r"-chuong-(\d+)", r"-c\1", name)
    name = re.sub(r"^bai-(\d+)", r"b\1", name)

    # 7. Rút gọn "dung-sai" → "ds", "on-tap" → "ot"
    name = name.replace("-dung-sai", "-ds")
    name = name.replace("-phan-loai", "-pl")

    # 8. Bỏ "phan-N" nếu còn dài
    if len(name) > MAX_FILENAME_LEN:
        name = re.sub(r"-phan-\d+$", "", name)

    # 9. Bỏ dấu gạch ngang thừa
    name = re.sub(r"-{2,}", "-", name).strip("-")

    # 10. Nếu vẫn dài → cắt + hash
    if len(name) > MAX_FILENAME_LEN:
        short = name[: MAX_FILENAME_LEN - 5]
        last_dash = short.rfind("-")
        if last_dash > MAX_FILENAME_LEN // 2:
            short = short[:last_dash]
        h = format(hash(original) % 0xFFFF, "04x")
        name = f"{short}-{h}"

    return name + ext


dry_run = "--rename" not in sys.argv

if dry_run:
    print("🔍 XEM TRƯỚC (dry run) — thêm --rename để rename thật\n")
else:
    print("⚠️  RENAME THẬT\n")

total_renamed = 0
total_skipped = 0

for root, dirs, files in os.walk(WORD_DIR):
    doc_files = [
        f for f in files
        if (f.lower().endswith(".docx") or f.lower().endswith(".doc"))
        and not f.startswith("~$")
    ]

    for f in doc_files:
        new_name = shorten_name(f)
        if new_name == f:
            total_skipped += 1
            continue

        old_path = os.path.join(root, f)
        new_path = os.path.join(root, new_name)

        # Tránh trùng tên
        if os.path.exists(long_path(new_path)):
            n, ext = os.path.splitext(new_name)
            h = format(hash(f) % 0xFFFF, "04x")
            new_name = f"{n}-{h}{ext}"
            new_path = os.path.join(root, new_name)

        rel = os.path.relpath(root, WORD_DIR)
        print(f"  {rel}")
        print(f"    {f}")
        print(f"  → {new_name}  ({len(f)}→{len(new_name)})\n")

        if not dry_run:
            try:
                os.rename(long_path(old_path), long_path(new_path))
            except OSError as e:
                print(f"  ⚠️ Lỗi: {e}\n")

        total_renamed += 1

print(f"{'='*50}")
print(f"{'Sẽ' if dry_run else 'Đã'} rename: {total_renamed}, Bỏ qua: {total_skipped}")
if dry_run and total_renamed > 0:
    print(f"\n💡 python rename_word.py --rename")
