# 🚀 Hướng dẫn Deploy EduBoost lên Server

Hướng dẫn chi tiết từng bước để deploy ứng dụng EduBoost lên server sử dụng Docker và Docker Compose.


## 🖥️ Yêu cầu hệ thống

### Server Requirements:
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **CPU**: 2 cores trở lên
- **Disk**: 20GB trống
- **Network**: Có thể truy cập internet
- **Static IP address** hoặc **domain name**

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

### Bước 5: Cấu hình Firewall

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Kiểm tra trạng thái
sudo ufw status
```

### Bước 6: Tạo thư mục project

```bash
# Tạo thư mục
sudo mkdir -p /opt/eduboost
sudo chown $USER:$USER /opt/eduboost
cd /opt/eduboost
```

### Bước 7: Security Hardening (Khuyến nghị)

```bash
# Disable root login (recommended)
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Setup fail2ban để bảo vệ khỏi brute force attacks
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Kiểm tra fail2ban
sudo systemctl status fail2ban
```

---

## 📁 Cấu hình môi trường

### Bước 1: Clone repository

```bash
cd /opt/eduboost

# Clone code từ GitHub/GitLab
git clone https://github.com/your-username/EduBoost.git .

# Hoặc nếu đã có code, copy vào thư mục này
```

### Bước 2: Tạo file `.env` cho Docker Compose

Tạo file `.env` trong thư mục `/opt/eduboost`:

```bash
nano .env
```

Nội dung file `.env` (thay thế các giá trị placeholder):

```env
# Database Configuration
DB_NAME=eduboost
DB_USER=postgres
DB_PASSWORD=YOUR_SECURE_DATABASE_PASSWORD_HERE
DB_PORT=5432

# Backend Configuration
BACKEND_PORT=8080
JWT_SECRET=YOUR_JWT_SECRET_MIN_32_CHARS_HERE
JWT_EXPIRATION_MS=3600000
JWT_REFRESH_EXPIRATION_MS=86400000

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=YOUR_EMAIL_APP_PASSWORD_HERE

# Frontend Configuration
FRONTEND_PORT=80
VITE_API_URL=https://yourdomain.com/api

# Google OAuth Configuration
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_SCOPE=email,profile

# Frontend URLs
FRONTEND_URL_BASE=https://yourdomain.com
FRONTEND_URL_PAYMENT_RETURN=${FRONTEND_URL_BASE}/payment/return
FRONTEND_URL_EMAIL_VERIFICATION=${FRONTEND_URL_BASE}/verify-email
FRONTEND_URL_STUDENT_LOGIN=${FRONTEND_URL_BASE}/login
FRONTEND_URL_PARENT_LOGIN=${FRONTEND_URL_BASE}/parent/login

# Nginx Configuration
NGINX_PORT=443
NGINX_HTTP_PORT=80

# JPA Configuration
JPA_DDL_AUTO=update

# MinIO Configuration
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
MINIO_BUCKET_NAME=eduboost
```

**⚠️ QUAN TRỌNG**: 
- Thay đổi tất cả các giá trị placeholder bằng thông tin thực tế của bạn
- Sử dụng mật khẩu mạnh (tối thiểu 16 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt)
- JWT_SECRET phải có tối thiểu 32 ký tự
- Không commit file `.env` vào Git

### Bước 3: Tạo thư mục cho logs và SSL

```bash
mkdir -p logs nginx/ssl
```

**⚠️ Lưu ý**: MinIO data sẽ được lưu trong Docker volume `minio_data`, không cần tạo thư mục thủ công.

---

## 🌐 Cấu hình DNS và SSL

### Bước 1: Cấu hình DNS

**⚠️ QUAN TRỌNG**: Trước khi cấu hình SSL, bạn cần cấu hình DNS để trỏ domain về IP server.

1. **Lấy IP server:**
   ```bash
   curl ifconfig.me
   ```

2. **Vào Cloudflare Dashboard → DNS → Records**

3. **Thêm A record:**
   - Type: `A`
   - Name: `@` (hoặc để trống cho root domain)
   - Content: IP server của bạn (ví dụ: `123.45.67.89`)
   - Proxy: `Proxied` (khuyến nghị) hoặc `DNS only`
   - TTL: `Auto`

4. **Thêm CNAME cho www (tùy chọn):**
   - Type: `CNAME`
   - Name: `www`
   - Target: `yourdomain.com`
   - Proxy: `Proxied` (khuyến nghị)

5. **Đợi DNS propagate** (thường 5-30 phút)

### Bước 2: Cấu hình SSL Certificate

#### Option 1: Sử dụng Let's Encrypt (Miễn phí - Khuyến nghị)

```bash
# Cài đặt Certbot
sudo apt install certbot -y

# Tạm thời tắt redirect HTTPS trong nginx (nếu đã cấu hình)
# Comment dòng redirect trong nginx/nginx.conf

# Tạo SSL certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Nhập email khi được hỏi
# Chọn Y để đồng ý terms of service
# Chọn Y hoặc N cho việc chia sẻ email với EFF

# Copy certificates vào thư mục nginx
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem

# Cấp quyền
sudo chown $USER:$USER nginx/ssl/*.pem
sudo chmod 644 nginx/ssl/cert.pem
sudo chmod 600 nginx/ssl/key.pem



## 🚀 Deploy ứng dụng

### Bước 1: Build và khởi động containers

**Cho Production (khuyến nghị):**

```bash
cd /opt/eduboost

# Build và start tất cả services với docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d --build

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Cho Development/Testing:**

```bash
cd /opt/eduboost

# Build và start tất cả services với docker-compose.yml
docker-compose up -d --build

# Xem logs
docker-compose logs -f
```

**Lưu ý**: 
- `docker-compose.prod.yml` được tối ưu cho production (không expose ports không cần thiết, restart policy `always`)
- `docker-compose.yml` phù hợp cho development (có expose ports để debug)

### Bước 2: Kiểm tra trạng thái

**Với docker-compose.prod.yml:**

```bash
# Kiểm tra containers đang chạy
docker-compose -f docker-compose.prod.yml ps

# Kiểm tra logs của từng service
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs nginx
docker-compose -f docker-compose.prod.yml logs postgres
docker-compose -f docker-compose.prod.yml logs minio
```

**Với docker-compose.yml (development):**

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

# Frontend (qua nginx)
curl http://localhost

# API endpoint (qua nginx)
curl http://localhost/api/actuator/health

# Database connection
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# MinIO health check
docker-compose -f docker-compose.prod.yml exec minio wget --no-verbose --tries=1 --spider http://localhost:9000/minio/health/live || echo "MinIO health check failed"
```

### Bước 4: Kiểm tra từ trình duyệt

1. Mở trình duyệt và truy cập: `https://yourdomain.com` (hoặc `http://your-server-ip`)
2. Kiểm tra backend API: `https://yourdomain.com/api/actuator/health`
3. Kiểm tra SSL certificate (nếu đã cấu hình)

---

## 🔄 Cấu hình CI/CD

### Bước 1: Tạo Docker Hub account

1. Đăng ký tại https://hub.docker.com
2. Tạo repository: `eduboost-backend` và `eduboost-frontend`

### Bước 2: Cấu hình GitHub Secrets

Vào GitHub repository → Settings → Secrets and variables → Actions, thêm:

- `DOCKER_USERNAME`: Tên đăng nhập Docker Hub
- `DOCKER_PASSWORD`: Mật khẩu Docker Hub (hoặc Access Token)
- `VITE_API_URL`: URL API (ví dụ: `https://yourdomain.com/api`)
- `SERVER_HOST`: IP hoặc domain của server
- `SERVER_USER`: Username SSH (thường là `root` hoặc `ubuntu`)
- `SERVER_SSH_KEY`: Private SSH key để kết nối server

### Bước 3: Tạo SSH Key cho CI/CD

Trên server:

```bash
# Tạo SSH key pair
ssh-keygen -t rsa -b 4096 -C "ci-cd@eduboost" -f ~/.ssh/ci_cd_key -N ""

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
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build
docker system prune -f
```

Cấp quyền:

```bash
chmod +x /opt/eduboost/deploy.sh
```

---

## 🛠️ Quản lý và bảo trì

### Xem logs

**Production:**

```bash
# Tất cả services
docker-compose -f docker-compose.prod.yml logs -f

# Từng service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f minio
```

**Development:**

```bash
# Tất cả services
docker-compose logs -f

# Từng service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart services

**Production:**

```bash
# Restart tất cả
docker-compose -f docker-compose.prod.yml restart

# Restart từng service
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart frontend
docker-compose -f docker-compose.prod.yml restart nginx
docker-compose -f docker-compose.prod.yml restart minio
```

**Development:**

```bash
# Restart tất cả
docker-compose restart

# Restart từng service
docker-compose restart backend
docker-compose restart frontend
```

### Stop/Start services

**Production:**

```bash
# Stop
docker-compose -f docker-compose.prod.yml stop

# Start
docker-compose -f docker-compose.prod.yml start

# Stop và xóa containers
docker-compose -f docker-compose.prod.yml down

# Stop, xóa containers và volumes (⚠️ Xóa dữ liệu)
docker-compose -f docker-compose.prod.yml down -v
```

**Development:**

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

**Production:**

```bash
# Backup PostgreSQL database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U ${DB_USER:-postgres} ${DB_NAME:-eduboost} > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U ${DB_USER:-postgres} ${DB_NAME:-eduboost} < backup_file.sql
```

### Backup MinIO data

**Production:**

```bash
# Backup MinIO data (sử dụng mc - MinIO Client)
# Cài đặt MinIO Client
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/

# Cấu hình MinIO client
mc alias set local http://localhost:9000 ${MINIO_ROOT_USER:-minioadmin} ${MINIO_ROOT_PASSWORD}

# Backup bucket
mc mirror local/${MINIO_BUCKET_NAME:-eduboost} ./minio_backup_$(date +%Y%m%d_%H%M%S)

# Hoặc backup toàn bộ MinIO data volume
docker run --rm -v eduboost_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio_data_backup_$(date +%Y%m%d_%H%M%S).tar.gz /data
```

### Truy cập MinIO Console (Production)

**⚠️ Lưu ý**: Trong production, MinIO console không được expose ra ngoài. Nếu cần truy cập:

1. **Option 1: SSH Tunnel (Khuyến nghị)**
   ```bash
   # Từ máy local, tạo SSH tunnel
   ssh -L 9001:localhost:9001 user@your-server-ip
   
   # Sau đó truy cập: http://localhost:9001
   ```

2. **Option 2: Expose qua Nginx (Nếu cần)**
   - Thêm cấu hình reverse proxy trong nginx.conf
   - Sử dụng authentication để bảo mật

3. **Option 3: Tạm thời expose port (Chỉ cho testing)**
   ```bash
   # Uncomment ports trong docker-compose.prod.yml
   # Sau khi xong, nhớ comment lại
   ```



### Update ứng dụng

**Production:**

```bash
cd /opt/eduboost

# Pull code mới nhất
git pull origin main

# Rebuild và restart
docker-compose -f docker-compose.prod.yml up -d --build

# Hoặc nếu dùng CI/CD, chỉ cần:
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

**Development:**

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

# Container stats (real-time)
docker stats

# Clean up unused resources
docker system prune -a
```


