"""
Script nén tài liệu theo từng môn học.

Cấu trúc input:  D:\EXE201\word\Lớp X\Môn\Chương\Bài\file.docx
Output:           D:\EXE201\word_zips\Lớp X_Môn.zip
                  Bên trong ZIP: Môn/Chương/Bài/file.docx

Usage: python zip_by_subject.py
       python zip_by_subject.py "D:\path\to\word" "D:\path\to\output"
"""

import os
import sys
import zipfile
from pathlib import Path


def zip_by_subject(source_dir: str, output_dir: str):
    source = Path(source_dir)
    output = Path(output_dir)

    if not source.exists():
        print(f"❌ Thư mục nguồn không tồn tại: {source}")
        return

    # Xóa output cũ để tránh trùng lặp
    if output.exists():
        import shutil
        shutil.rmtree(output)
        print(f"🗑️  Đã xóa output cũ: {output}")
    output.mkdir(parents=True, exist_ok=True)

    # Tìm tất cả thư mục Lớp
    grade_folders = sorted(
        [f for f in source.iterdir() if f.is_dir() and "lớp" in f.name.lower()],
        key=lambda f: f.name,
    )

    if not grade_folders:
        print(f"❌ Không tìm thấy thư mục 'Lớp ...' trong {source}")
        return

    print(f"📂 Thư mục nguồn: {source}")
    print(f"📦 Thư mục output: {output}")
    print(f"🔍 Tìm thấy {len(grade_folders)} khối lớp\n")

    total_zips = 0
    total_files = 0

    for grade_folder in grade_folders:
        grade_name = grade_folder.name  # e.g. "Lớp 6"

        # Tìm tất cả thư mục môn học bên trong
        subject_folders = sorted(
            [f for f in grade_folder.iterdir() if f.is_dir()],
            key=lambda f: f.name,
        )

        if not subject_folders:
            print(f"  ⚠️  {grade_name}: Không có thư mục môn nào")
            continue

        for subject_folder in subject_folders:
            subject_name = subject_folder.name  # e.g. "Toán", "KHTN"

            # Tạo thư mục theo môn: output/Toán/
            subject_output_dir = output / subject_name
            subject_output_dir.mkdir(parents=True, exist_ok=True)

            # Tên file ZIP: "Lớp 6.zip" (trong thư mục môn)
            zip_name = f"{grade_name}.zip"
            zip_path = subject_output_dir / zip_name

            # Thu thập tất cả file trong thư mục môn (đệ quy)
            # Bỏ qua file .zip để tránh include output cũ
            SKIP_EXT = {".zip", ".rar", ".7z"}
            files_to_zip = []
            for root, dirs, files in os.walk(str(subject_folder)):
                for file in files:
                    if Path(file).suffix.lower() in SKIP_EXT:
                        continue
                    file_path = Path(root) / file
                    # Windows long path support (> 260 chars)
                    long_path = str(file_path)
                    if os.name == "nt" and not long_path.startswith("\\\\?\\"):
                        long_path = "\\\\?\\" + str(file_path.resolve())
                    # Đường dẫn relative từ thư mục LỚP
                    # Để trong ZIP có: Môn/Chương/Bài/file.docx
                    rel_path = file_path.relative_to(grade_folder)
                    files_to_zip.append((long_path, str(rel_path)))

            if not files_to_zip:
                print(f"  ⚠️  {grade_name}/{subject_name}: Không có file nào")
                continue

            # Tạo file ZIP
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for file_path, arc_name in files_to_zip:
                    zf.write(file_path, arc_name)

            zip_size_mb = zip_path.stat().st_size / (1024 * 1024)
            print(
                f"  ✅ {subject_name}/{zip_name:25s} — {len(files_to_zip):3d} files — {zip_size_mb:.1f} MB"
            )
            total_zips += 1
            total_files += len(files_to_zip)

    print(f"\n{'='*60}")
    print(f"🎉 Hoàn tất! Tạo {total_zips} file ZIP, tổng {total_files} files")
    print(f"📁 Output: {output}")


if __name__ == "__main__":
    # Default paths
    default_source = r"D:\EXE201\resource\word"
    default_output = r"D:\EXE201\resource\questions_zips"

    source = sys.argv[1] if len(sys.argv) > 1 else default_source
    output = sys.argv[2] if len(sys.argv) > 2 else default_output

    zip_by_subject(source, output)
