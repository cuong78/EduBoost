# 🐳 Docker Setup cho EduBoost

## 📁 Cấu trúc Files

```
EduBoost/
├── docker-compose.yml          # Development/Staging
├── docker-compose.prod.yml      # Production
├── deploy.sh                    # Deployment script
├── nginx/
│   └── nginx.conf              # Nginx reverse proxy config
├── eduBoostBackend/
│   ├── Dockerfile              # Backend Dockerfile
│   └── .dockerignore           # Files to exclude
└── eduBoostFrontend/
    ├── Dockerfile              # Frontend Dockerfile
    ├── nginx.conf              # Frontend nginx config
    └── .dockerignore           # Files to exclude
```

## 🚀 Quick Commands

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production

```bash
# Deploy using script
./deploy.sh prod

# Or manually
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📝 Environment Variables

Tạo file `.env` trong root directory với các biến sau:

```env
# Database
DB_NAME=eduboost
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Backend
JWT_SECRET=your_jwt_secret_min_32_characters
JWT_EXPIRATION_MS=3600000

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Frontend
VITE_API_URL=https://yourdomain.com/api

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# URLs
FRONTEND_URL_BASE=https://yourdomain.com
```

## 🔍 Troubleshooting

### Port conflicts
```bash
# Check what's using the port
sudo lsof -i :8080
sudo lsof -i :80

# Change ports in .env file
```

### Container won't start
```bash
# Check logs
docker-compose logs [service_name]

# Rebuild
docker-compose up -d --build --force-recreate
```

### Database connection issues
```bash
# Check database is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U postgres -d eduboost
```

## 📚 Xem thêm

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Hướng dẫn chi tiết
- [QUICK_START.md](./QUICK_START.md) - Hướng dẫn nhanh
