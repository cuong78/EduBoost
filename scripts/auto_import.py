#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
EduBoost Auto Bulk Import Script
Tự động import hàng loạt Resources và Question Bank (tích hợp AI đánh giá) 
từ các thư mục zip dữ liệu mà không cần thông qua Swagger.
"""

import os
import sys
import time
from pathlib import Path
import requests

# ── Cấu hình mặc định ───────────────────────────────────────────────
BASE_URL = os.getenv("BACKEND_INTERNAL_URL", "http://localhost:8080/api")
ADMIN_USER = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASS = os.getenv("ADMIN_PASSWORD", "admin123")

RESOURCE_ZIPS_DIR = Path("/root/EduBoost/resource_zips")
QUESTIONS_ZIPS_DIR = Path("/root/EduBoost/questions_zips")

# ANSI Color Code cho terminal
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
CYAN = "\033[96m"
RESET = "\033[0m"
BOLD = "\033[1m"

def print_header(text):
    print(f"\n{BOLD}{CYAN}{'='*60}{RESET}")
    print(f"{BOLD}{CYAN}🚀 {text}{RESET}")
    print(f"{BOLD}{CYAN}{'='*60}{RESET}")

def get_auth_token():
    """ Đăng nhập lấy Bearer token từ Admin account """
    login_url = f"{BASE_URL}/auth/login"
    print(f"🔑 Đang đăng nhập tài khoản Admin ({ADMIN_USER}) tại {login_url}...")
    try:
        res = requests.post(login_url, json={"username": ADMIN_USER, "password": ADMIN_PASS}, timeout=15)
        if res.status_code == 200:
            data = res.json()
            token = data.get("data", {}).get("token")
            if token:
                print(f"{GREEN}✓ Đăng nhập thành công! Token đã sẵn sàng.{RESET}")
                return token
        print(f"{RED}✗ Đăng nhập thất bại: HTTP {res.status_code} - {res.text}{RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"{RED}✗ Lỗi kết nối đăng nhập: {e}{RESET}")
        sys.exit(1)

def import_resources(headers):
    """ Quét và import tất cả file ZIP bài học/tài liệu trong resource_zips """
    print_header("BẮT ĐẦU IMPORT TÀI NGUYÊN (RESOURCES)")
    if not RESOURCE_ZIPS_DIR.exists():
        print(f"{YELLOW}⚠️ Thư mục {RESOURCE_ZIPS_DIR} không tồn tại. Bỏ qua.{RESET}")
        return

    zip_files = sorted(list(RESOURCE_ZIPS_DIR.rglob("*.zip")))
    if not zip_files:
        print(f"{YELLOW}⚠️ Không tìm thấy file .zip nào trong {RESOURCE_ZIPS_DIR}{RESET}")
        return

    print(f"📦 Tìm thấy {len(zip_files)} file .zip bài học/tài liệu.")
    import_url = f"{BASE_URL}/resources/bulk-import"

    success_count = 0
    fail_count = 0

    for idx, zip_path in enumerate(zip_files, 1):
        rel_path = zip_path.relative_to(RESOURCE_ZIPS_DIR)
        print(f"\n[{idx}/{len(zip_files)}] {BLUE}Đang đẩy tài liệu:{RESET} {rel_path} ({zip_path.stat().st_size / 1024 / 1024:.2f} MB)")
        start_time = time.time()

        try:
            with open(zip_path, "rb") as f:
                files = {"file": (zip_path.name, f, "application/zip")}
                res = requests.post(import_url, headers=headers, files=files, timeout=600)
                elapsed = time.time() - start_time

            if res.status_code == 200:
                result = res.json()
                total_imported = result.get("totalImported", result.get("importedCount", 0))
                print(f"   {GREEN}✓ Thành công ({elapsed:.1f}s)! Import thành công {total_imported} tài liệu.{RESET}")
                success_count += 1
            else:
                print(f"   {RED}✗ Thất bại ({elapsed:.1f}s)! HTTP {res.status_code}: {res.text[:200]}{RESET}")
                fail_count += 1
        except Exception as e:
            print(f"   {RED}✗ Lỗi khi tải file {zip_path.name}: {e}{RESET}")
            fail_count += 1

    print(f"\n{BOLD}📊 Kết quả Resources: {GREEN}{success_count} thành công{RESET}, {RED}{fail_count} thất bại{RESET}")

def import_questions(headers):
    """ Quét và import tất cả file ZIP ngân hàng câu hỏi (Tích hợp AI đánh giá) """
    print_header("BẮT ĐẦU IMPORT NGÂN HÀNG CÂU HỎI (CÓ AI ĐÁNH GIÁ)")
    if not QUESTIONS_ZIPS_DIR.exists():
        print(f"{YELLOW}⚠️ Thư mục {QUESTIONS_ZIPS_DIR} không tồn tại. Bỏ qua.{RESET}")
        return

    zip_files = sorted(list(QUESTIONS_ZIPS_DIR.rglob("*.zip")))
    if not zip_files:
        print(f"{YELLOW}⚠️ Không tìm thấy file .zip nào trong {QUESTIONS_ZIPS_DIR}{RESET}")
        return

    print(f"📦 Tìm thấy {len(zip_files)} file .zip câu hỏi.")
    import_url = f"{BASE_URL}/question-bank/bulk-import?useAiClassification=true"

    success_count = 0
    fail_count = 0
    total_questions = 0

    for idx, zip_path in enumerate(zip_files, 1):
        rel_path = zip_path.relative_to(QUESTIONS_ZIPS_DIR)
        print(f"\n[{idx}/{len(zip_files)}] {BLUE}Đang import & AI đánh giá câu hỏi:{RESET} {rel_path} ({zip_path.stat().st_size / 1024 / 1024:.2f} MB)")
        start_time = time.time()

        try:
            with open(zip_path, "rb") as f:
                files = {"file": (zip_path.name, f, "application/zip")}
                res = requests.post(import_url, headers=headers, files=files, timeout=1200)
                elapsed = time.time() - start_time

            if res.status_code == 200:
                result = res.json()
                created = result.get("totalCreated", result.get("successCount", 0))
                total_questions += created
                print(f"   {GREEN}✓ Thành công ({elapsed:.1f}s)! Tạo {created} câu hỏi đã qua AI đánh giá.{RESET}")
                success_count += 1
            else:
                print(f"   {RED}✗ Thất bại ({elapsed:.1f}s)! HTTP {res.status_code}: {res.text[:300]}{RESET}")
                fail_count += 1
        except Exception as e:
            print(f"   {RED}✗ Lỗi khi tải file {zip_path.name}: {e}{RESET}")
            fail_count += 1

    print(f"\n{BOLD}📊 Kết quả Question Bank: {GREEN}{success_count} thành công ({total_questions} câu hỏi){RESET}, {RED}{fail_count} thất bại{RESET}")

def main():
    print_header("HỆ THỐNG TỰ ĐỘNG IMPORT DỮ LIỆU EDUBOOST")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Import Resources trước
    import_resources(headers)

    # 2. Import Questions (AI đánh giá) sau
    import_questions(headers)

    print_header("HOÀN TẤT TOÀN BỘ QUÁ TRÌNH IMPORT DỮ LIỆU!")

if __name__ == "__main__":
    main()
