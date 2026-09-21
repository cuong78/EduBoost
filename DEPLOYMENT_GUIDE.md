# 🚀 Hướng dẫn Deploy EduBoost lên Server (Cập nhật chuẩn)

Hướng dẫn chi tiết từng bước để triển khai hệ thống **EduBoost** lên Server / VPS sử dụng Docker và Docker Compose.

---

## 🖥️ 1. Yêu cầu hệ thống

### Cấu hình Server khuyến nghị:
- **OS**: Ubuntu 20.04 LTS / 22.04 LTS / 24.04 LTS
- **RAM**: Tối thiểu 2GB (Khuyến nghị **4GB+**)
- **CPU**: 2 Cores trở lên
- **Disk**: 20GB SSD trống trở lên
- **Static IP Address** hoặc **Domain Name** (ví dụ: `eduboost.school`)

---

## 🔧 2. Chuẩn bị Server & Cài đặt Môi trường

### Bước 2.1: Cập nhật hệ thống
```bash
sudo apt update && sudo apt upgrade -y
```

### Bước 2.2: Cấu hình Firewall (UFW)
Mở từng cổng kết nối bắt buộc:
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Kiểm tra trạng thái
sudo ufw status
```

### Bước 2.3: Cài đặt Docker & Docker Compose
Cài đặt trực tiếp Docker Engine & Docker Compose từ kho chuẩn của Ubuntu:
```bash
# Cài đặt Docker và Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose git

# Khởi chạy và cho phép Docker tự khởi động cùng hệ thống
sudo systemctl enable --now docker

# Cấp quyền sử dụng Docker cho user hiện tại
sudo usermod -aG docker $USER

# Kiểm tra cài đặt
docker --version
docker-compose --version
```

---

## 📁 3. Cấu hình Môi trường `.env`

Di chuyển vào thư mục dự án `/root/EduBoost` (hoặc thư mục chứa mã nguồn của bạn):

```bash
cd /root/EduBoost
```

Tạo file `.env` chuẩn cấu hình cho môi trường Production:

```bash
nano .env
```

### Nội dung file `.env` mẫu:

```env
# ==========================================
# 1. DATABASE CONFIGURATION (PostgreSQL)
# ==========================================
DB_NAME=eduboost
DB_USER=postgres
DB_PASSWORD=!
DB_PORT=5432
JPA_DDL_AUTO=update

# ==========================================
# 2. BACKEND CONFIGURATION (Spring Boot)
# ==========================================
BACKEND_URL_BASE=https://eduboost.school
BACKEND_PORT=8080

# JWT Authentication (Bắt buộc tối thiểu 32+ ký tự)
JWT_SECRET=
JWT_EXPIRATION_MS=3600000
JWT_REFRESH_EXPIRATION_MS=86400000

# Email Service (SMTP Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
SPRING_MAIL_USERNAME=eduboostaiplatform@gmail.com
SPRING_MAIL_PASSWORD=wcjw zjbx ciya fbqw

# ==========================================
# 3. STORAGE CONFIGURATION (MinIO S3)
# ==========================================
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=Minio123!
MINIO_BUCKET_NAME=eduboost

# ==========================================
# 4. AI INTEGRATION (DeepSeek AI)
# ==========================================
AI_DEEPSEEK_API_KEY=
AI_DEEPSEEK_MODEL=deepseek-chat

# ==========================================
# 5. PAYMENT INTEGRATION (VietQR Auto Payment)
# ==========================================
VIETQR_CB_USERNAME=anhcuong
VIETQR_CB_PASSWORD=123Cuong
VIETQR_CB_SECRET=
VIETQR_API_USERNAME=
VIETQR_API_PASSWORD
VIETQR_API_BASE_URL=https://api.vietqr.org
VIETQR_BANK_CODE=TPB
VIETQR_ACCOUNT_NO=78174803882
VIETQR_ACCOUNT_NAME=CAO LE ANH CUONG
# ==========================================
# 6. GOOGLE OAUTH2 CONFIGURATION
# ==========================================
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_SCOPE=


# ==========================================
# 7. FRONTEND CONFIGURATION (React + Vite)
# ==========================================
FRONTEND_PORT=80
FRONTEND_URL_BASE=https://eduboost.school
VITE_API_URL=https://eduboost.school/api
VITE_GOOGLE_CLIENT_ID=

FRONTEND_URL_PAYMENT_RETURN=https://eduboost.school/payment/return
FRONTEND_URL_EMAIL_VERIFICATION=https://eduboost.school/verify-email
FRONTEND_URL_STUDENT_LOGIN=https://eduboost.school/login
FRONTEND_URL_PARENT_LOGIN=https://eduboost.school/parent/login

# ==========================================
# 8. NGINX & DOCKER BUILD CONFIGURATION
# ==========================================
NGINX_PORT=443
NGINX_HTTP_PORT=80
DOCKER_USERNAME=eduboost
```

> **⚠️ Lưu ý bảo mật:**
> - Thay thế toàn bộ các thông tin mẫu bằng thông tin thực tế của hệ thống.
> - Đảm bảo `JWT_SECRET` đủ độ dài (32+ ký tự).
> - Không commit file `.env` lên Git repository public.

---

## 🌐 4. Cấu hình DNS và SSL Certificate (HTTPS)

### Bước 4.1: Cấu hình DNS
1. Đăng nhập vào trang quản lý Domain (Cloudflare, Namecheap, GoDaddy, v.v.).
2. Thêm bản ghi **A Record**:
   - **Name**: `@` (hoặc tên miền phụ nếu có)
   - **IPv4 address**: `<IP-Server-Của-Bạn>`
   - **Proxy status**: Proxied (nếu dùng Cloudflare) hoặc DNS only.
3. Thêm bản ghi **CNAME** cho `www` (Tùy chọn):
   - **Name**: `www`
   - **Target**: `eduboost.school`

### Bước 4.2: Cấp chứng chỉ SSL bằng Certbot
Tạo các thư mục cần thiết trước khi cấp SSL:
```bash
cd /root/EduBoost
mkdir -p logs nginx/ssl
```

Cài đặt Certbot và xin cấp chứng chỉ Let's Encrypt:
```bash
# Cài đặt Certbot
sudo apt install certbot -y

# Cấp chứng chỉ SSL cho domain
sudo certbot certonly --standalone -d eduboost.school -d www.eduboost.school
```

Copy chứng chỉ SSL vào thư mục `nginx/ssl` của dự án:
```bash
sudo cp /etc/letsencrypt/live/eduboost.school/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/eduboost.school/privkey.pem nginx/ssl/key.pem

# Cấp quyền truy cập chứng chỉ
sudo chmod 644 nginx/ssl/cert.pem
sudo chmod 600 nginx/ssl/key.pem
```

---

## 🚀 5. Khởi chạy Hệ thống với Docker Compose

### Bước 5.1: Build và khởi động Containers (Production)

Chạy lệnh build và khởi chạy tất cả các dịch vụ trong background:

```bash
cd /root/EduBoost

# Tắt và dọn dẹp container cũ (nếu có)
docker-compose -f docker-compose.prod.yml down

# Build và khởi chạy môi trường Production
docker-compose -f docker-compose.prod.yml up -d --build
```

### Bước 5.2: Kiểm tra trạng thái chạy

Kiểm tra danh sách các container đang hoạt động:
```bash
docker-compose -f docker-compose.prod.yml ps
```

Các dịch vụ bắt buộc phải ở trạng thái `Up` (hoặc `healthy`):
- `eduboost-db-prod` (PostgreSQL)
- `eduboost-minio-prod` (MinIO Storage)
- `eduboost-backend-prod` (Spring Boot API)
- `eduboost-frontend-prod` (React Frontend)
---

### Bước 5.3: Tự động Import Dữ liệu ban đầu (Resources & AI Question Bank)

Khi triển khai môi trường mới hoặc sau khi xóa volume/database, chạy duy nhất 1 câu lệnh sau để tự động import toàn bộ tài liệu bài học và ngân hàng câu hỏi (có AI đánh giá):

```bash
python3 /root/EduBoost/scripts/auto_import.py
```

- **Vị trí dữ liệu quét**: 
  - Tài liệu bài học: `/root/EduBoost/resource_zips`
  - Ngân hàng câu hỏi (AI đánh giá): `/root/EduBoost/questions_zips`

---

## 🔍 6. Kiểm tra & Kiểm thử (Verification & Health Check)

### Kiểm tra bằng lệnh Terminal:
```bash
# 1. Kiểm tra Health Backend
curl http://localhost:8080/actuator/health

# 2. Kiểm tra Nginx Proxy API
curl https://eduboost.school/api/actuator/health

# 3. Kiểm tra PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres
```

### Kiểm tra trên Trình duyệt:
1. **Trang chủ Web**: `https://eduboost.school`
2. **Swagger API Docs**: `https://eduboost.school/swagger-ui/index.html` (hoặc `http://<IP-Server>:8080/swagger-ui/index.html`)

---

## 🛠️ 7. Quản lý & Bảo trì Hệ thống

### 查看 Logs (Theo dõi Nhật ký)
```bash
# Xem log tất cả các dịch vụ
docker-compose -f docker-compose.prod.yml logs -f

# Xem log riêng Backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Xem log riêng Nginx / Frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Khởi động lại (Restart Services)
```bash
# Restart tất cả
docker-compose -f docker-compose.prod.yml restart

# Restart chỉ riêng Backend khi update code
docker-compose -f docker-compose.prod.yml restart backend
```

### Backup Cơ sở dữ liệu (PostgreSQL Backup)
```bash
# Export file backup SQL
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres eduboost > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore cơ sở dữ liệu từ file backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres eduboost < backup_file.sql
```

### Cập nhật mã nguồn mới (Update App)
```bash
cd /root/EduBoost
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```
