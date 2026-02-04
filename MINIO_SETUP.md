# 🗄️ MinIO Setup Guide - EduBoost

## 🚀 Cài Đặt MinIO

### Bước 1: Start MinIO với Docker

**File docker-compose.yml đã có sẵn:**

```yaml
minio:
  image: minio/minio:latest
  container_name: eduboost-minio
  ports:
    - "9000:9000" # API port
    - "9001:9001" # Web Console port
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin123
  volumes:
    - minio-data:/data
  command: server /data --console-address ":9001"
```

**Chạy lệnh:**

```bash
# Khởi động MinIO
docker-compose up -d minio

# Kiểm tra container đang chạy
docker ps | grep minio
```

**Output mong đợi:**

```
CONTAINER ID   IMAGE              PORTS                              NAMES
abc123def456   minio/minio:latest 0.0.0.0:9000-9001->9000-9001/tcp  eduboost-minio
```

### Bước 2: Truy Cập MinIO Console

```
URL: http://localhost:9001
Username: minioadmin
Password: minioadmin123
```

**Nếu không vào được:**

```bash
# Kiểm tra logs
docker logs eduboost-minio

# Restart container
docker-compose restart minio
```

---
