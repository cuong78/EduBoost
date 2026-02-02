# 🖥️ Server Setup Checklist

Checklist chi tiết để chuẩn bị server cho production.

## ✅ Pre-Deployment Checklist

### 1. Server Requirements
- [ ] Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- [ ] Minimum 2GB RAM (4GB+ recommended)
- [ ] 2 CPU cores minimum
- [ ] 20GB+ free disk space
- [ ] Static IP address hoặc domain name

### 2. System Updates
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
```

### 4. Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 5. Firewall Configuration
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable


```

### 6. Domain Configuration (Nếu có)
- [ ] DNS A record trỏ về IP server
- [ ] DNS CNAME cho www (nếu cần)
- [ ] SSL certificate (Let's Encrypt hoặc custom)

### 7. SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot -y

# Get certificate
sudo certbot certonly --standalone -d eduboost.school -d www.eduboost.school

# Auto-renewal
sudo certbot renew --dry-run
```

### 8. Create Project Directory
```bash
sudo mkdir -p /opt/eduboost
sudo chown $USER:$USER /opt/eduboost
cd /opt/eduboost
```

### 9. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Update all environment variables
- [ ] Set strong passwords
- [ ] Configure JWT secret (min 32 chars)
- [ ] Configure email settings
- [ ] Set correct API URLs

### 10. Security Hardening
```bash
# Disable root login (recommended)
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Setup fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🚀 Deployment Steps

1. **Clone Repository**
```bash
cd /opt/eduboost
git clone https://github.com/your-username/EduBoost.git .
```

2. **Configure Environment**
```bash
cp .env.example .env
nano .env  # Edit with your values
```

3. **Setup SSL** (if using domain)
```bash
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
sudo chown $USER:$USER nginx/ssl/*.pem
```

4. **Deploy**
```bash
./deploy.sh prod
# hoặc
docker-compose -f docker-compose.prod.yml up -d --build
```

5. **Verify**
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

## 📊 Monitoring Setup

### Install Monitoring Tools (Optional)
```bash
# Install htop for monitoring
sudo apt install htop -y

# Monitor Docker
docker stats
```

### Setup Log Rotation
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/eduboost
```

Content:
```
/opt/eduboost/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

## 🔒 Security Best Practices

1. **Change Default Passwords**
   - [ ] Database password
   - [ ] JWT secret
   - [ ] All API keys

2. **Regular Updates**
   ```bash
   # Update system weekly
   sudo apt update && sudo apt upgrade -y
   
   # Update Docker images
   docker-compose pull
   docker-compose up -d
   ```

3. **Backup Strategy**
   - [ ] Setup automated database backups
   - [ ] Store backups off-server
   - [ ] Test restore procedure

4. **Monitoring**
   - [ ] Setup uptime monitoring
   - [ ] Configure alerts
   - [ ] Monitor disk space

## 📝 Post-Deployment

- [ ] Test all endpoints
- [ ] Verify SSL certificate
- [ ] Test email functionality
- [ ] Test OAuth login
- [ ] Setup monitoring alerts
- [ ] Document server access
- [ ] Create backup schedule

---

**Xem thêm:**
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Hướng dẫn chi tiết
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
