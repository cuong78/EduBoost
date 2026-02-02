# 🚀 Hướng dẫn Deploy EduBoost lên Server

Hướng dẫn chi tiết từng bước để deploy ứng dụng EduBoost lên server sử dụng Docker và Docker Compose.

## 📋 Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Chuẩn bị Server](#chuẩn-bị-server)
3. [Cấu hình môi trường](#cấu-hình-môi-trường)
4. [Deploy ứng dụng](#deploy-ứng-dụng)
5. [Cấu hình CI/CD](#cấu-hình-cicd)
6. [Quản lý và bảo trì](#quản-lý-và-bảo-trì)
7. [Troubleshooting](#troubleshooting)

---

## 🖥️ Yêu cầu hệ thống

### Server Requirements:
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **CPU**: 2 cores trở lên
- **Disk**: 20GB trống
- **Network**: Có thể truy cập internet

### Software cần cài đặt:
- Docker 20.10+
- Docker Compose 2.0+
- Git

---

## 🔧 Chuẩn bị Server

### Bước 1: Cập nhật hệ thống

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### Bước 2: Cài đặt Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Khởi động lại session hoặc chạy:
newgrp docker

# Kiểm tra cài đặt
docker --version
```

### Bước 3: Cài đặt Docker Compose

```bash
# Tải Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Cấp quyền thực thi
sudo chmod +x /usr/local/bin/docker-compose

# Kiểm tra
docker-compose --version
```

### Bước 4: Cài đặt Git (nếu chưa có)

```bash
# Ubuntu/Debian
sudo apt install git -y

# CentOS/RHEL
sudo yum install git -y
```

---

## 📁 Cấu hình môi trường

### Bước 1: Tạo thư mục project

```bash
# Tạo thư mục
sudo mkdir -p /opt/eduboost
sudo chown $USER:$USER /opt/eduboost
cd /opt/eduboost
```

### Bước 2: Clone repository

```bash
# Clone code từ GitHub/GitLab
git clone https://github.com/your-username/EduBoost.git .

# Hoặc nếu đã có code, copy vào thư mục này
```

### Bước 3: Tạo file `.env` cho Docker Compose

Tạo file `.env` trong thư mục `/opt/eduboost`:

```bash
nano .env
```

Nội dung file `.env`:

```env
# Database Configuration
DB_NAME=eduboost
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_PORT=5432

# Backend Configuration
BACKEND_PORT=8080
JWT_SECRET=your_jwt_secret_key_min_32_characters
JWT_EXPIRATION_MS=3600000
JWT_REFRESH_EXPIRATION_MS=86400000

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Frontend Configuration
FRONTEND_PORT=80
VITE_API_URL=https://yourdomain.com/api

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Frontend URLs
FRONTEND_URL_BASE=https://yourdomain.com

# Nginx Configuration
NGINX_PORT=443
NGINX_HTTP_PORT=80

# JPA Configuration
JPA_DDL_AUTO=update
```

**⚠️ QUAN TRỌNG**: Thay đổi tất cả các giá trị placeholder bằng thông tin thực tế của bạn!

### Bước 4: Tạo thư mục cho logs và SSL

```bash
mkdir -p logs nginx/ssl
```

### Bước 4.5: Cấu hình DNS (Nếu có domain)

**Xem hướng dẫn chi tiết**: [DNS_SETUP_GUIDE.md](./DNS_SETUP_GUIDE.md)

**Tóm tắt**:
1. Lấy IP server: `curl ifconfig.me`
2. Vào Cloudflare → DNS → Records
3. Thêm A record trỏ `@` về IP server
4. Thêm CNAME `www` trỏ về `eduboost.school`

### Bước 5: Cấu hình DNS (Nếu có domain)

**⚠️ QUAN TRỌNG**: Trước khi cấu hình SSL, bạn cần cấu hình DNS để trỏ domain về IP server.

Xem hướng dẫn chi tiết tại: [DNS_SETUP_GUIDE.md](./DNS_SETUP_GUIDE.md)

**Tóm tắt nhanh:**
1. Vào Cloudflare Dashboard → DNS → Records
2. Thêm A record:
   - Type: `A`
   - Name: `@` (hoặc để trống)
   - Content: IP server của bạn (ví dụ: `123.45.67.89`)
   - Proxy: `Proxied` (khuyến nghị) hoặc `DNS only`
3. Thêm CNAME cho www (tùy chọn):
   - Type: `CNAME`
   - Name: `www`
   - Target: `eduboost.school`

### Bước 6: Cấu hình SSL (Nếu có domain)

Nếu bạn có domain và muốn sử dụng HTTPS:

```bash
# Option 1: Sử dụng Let's Encrypt (Miễn phí)
sudo apt install certbot -y
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
sudo chown $USER:$USER nginx/ssl/*.pem

# Option 2: Sử dụng self-signed certificate (Chỉ cho testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=VN/ST=State/L=City/O=Organization/CN=yourdomain.com"
```

---

## 🚀 Deploy ứng dụng

### Bước 1: Build và khởi động containers

```bash
cd /opt/eduboost

# Build và start tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f
```

### Bước 2: Kiểm tra trạng thái

```bash
# Kiểm tra containers đang chạy
docker-compose ps

# Kiểm tra logs của từng service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Bước 3: Kiểm tra health

```bash
# Backend health check
curl http://localhost:8080/actuator/health

# Frontend
curl http://localhost:80

# Database connection
docker-compose exec postgres pg_isready -U postgres
```

---

## 🔄 Cấu hình CI/CD

### Bước 1: Tạo Docker Hub account

1. Đăng ký tại https://hub.docker.com
2. Tạo repository: `eduboost-backend` và `eduboost-frontend`

### Bước 2: Cấu hình GitHub Secrets

Vào GitHub repository → Settings → Secrets and variables → Actions, thêm:

- `DOCKER_USERNAME`: Tên đăng nhập Docker Hub
- `DOCKER_PASSWORD`: Mật khẩu Docker Hub
- `VITE_API_URL`: URL API (ví dụ: `https://yourdomain.com/api`)
- `SERVER_HOST`: IP hoặc domain của server
- `SERVER_USER`: Username SSH (thường là `root` hoặc `ubuntu`)
- `SERVER_SSH_KEY`: Private SSH key để kết nối server

### Bước 3: Tạo SSH Key cho CI/CD

Trên server:

```bash
# Tạo SSH key pair
ssh-keygen -t rsa -b 4096 -C "ci-cd@eduboost" -f ~/.ssh/ci_cd_key

# Copy public key vào authorized_keys
cat ~/.ssh/ci_cd_key.pub >> ~/.ssh/authorized_keys

# Hiển thị private key (copy toàn bộ output)
cat ~/.ssh/ci_cd_key
```

Copy private key vào GitHub Secret `SERVER_SSH_KEY`.

### Bước 4: Cấu hình server để nhận deploy

Trên server, tạo script deploy:

```bash
nano /opt/eduboost/deploy.sh
```

Nội dung:

```bash
#!/bin/bash
cd /opt/eduboost
git pull origin main
docker-compose pull
docker-compose up -d --build
docker system prune -f
```

Cấp quyền:

```bash
chmod +x /opt/eduboost/deploy.sh
```

---

## 🛠️ Quản lý và bảo trì

### Xem logs

```bash
# Tất cả services
docker-compose logs -f

# Từng service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart services

```bash
# Restart tất cả
docker-compose restart

# Restart từng service
docker-compose restart backend
docker-compose restart frontend
```

### Stop/Start services

```bash
# Stop
docker-compose stop

# Start
docker-compose start

# Stop và xóa containers
docker-compose down

# Stop, xóa containers và volumes (⚠️ Xóa dữ liệu)
docker-compose down -v
```

### Backup database

```bash
# Tạo backup
docker-compose exec postgres pg_dump -U postgres eduboost > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore từ backup
docker-compose exec -T postgres psql -U postgres eduboost < backup_file.sql
```

### Update ứng dụng

```bash
cd /opt/eduboost

# Pull code mới nhất
git pull origin main

# Rebuild và restart
docker-compose up -d --build

# Hoặc nếu dùng CI/CD, chỉ cần:
docker-compose pull
docker-compose up -d
```

### Xem tài nguyên sử dụng

```bash
# Disk usage
docker system df

# Container stats
docker stats

# Clean up unused resources
docker system prune -a
```

---

## 🔍 Troubleshooting

### Container không start

```bash
# Xem logs chi tiết
docker-compose logs [service_name]

# Kiểm tra cấu hình
docker-compose config

# Restart service
docker-compose restart [service_name]
```

### Database connection error

```bash
# Kiểm tra database đang chạy
docker-compose ps postgres

# Kiểm tra logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -d eduboost
```

### Port đã được sử dụng

```bash
# Tìm process đang dùng port
sudo lsof -i :8080
sudo lsof -i :80

# Kill process hoặc đổi port trong .env
```

### Out of memory

```bash
# Xem memory usage
free -h
docker stats

# Tăng swap (nếu cần)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### SSL certificate expired

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Copy lại certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem

# Restart nginx
docker-compose restart nginx
```

---

## 📝 Checklist trước khi deploy

- [ ] Server đã cài Docker và Docker Compose
- [ ] File `.env` đã được cấu hình đầy đủ
- [ ] Database password đã được đổi
- [ ] JWT secret đã được tạo (tối thiểu 32 ký tự)
- [ ] Email configuration đã đúng
- [ ] SSL certificates đã được cấu hình (nếu dùng HTTPS)
- [ ] Firewall đã mở các port cần thiết (80, 443, 8080)
- [ ] Domain đã trỏ về IP server (nếu có)
- [ ] GitHub Secrets đã được cấu hình (nếu dùng CI/CD)

---

## 🎯 Quick Commands Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose stop

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Update
docker-compose pull && docker-compose up -d

# Clean up
docker system prune -a
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Logs: `docker-compose logs -f`
2. Container status: `docker-compose ps`
3. Network: `docker network ls`
4. Volumes: `docker volume ls`

---

**Chúc bạn deploy thành công! 🎉**
