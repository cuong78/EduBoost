# Chạy backup
cd /opt/EduBoost
chmod +x scripts/backup.sh
./scripts/backup.sh

# Download file backup về máy local
scp root@187.77.138.51:/opt/EduBoost/backups/backup_*.tar.gz .
Script backup 3 thứ:

Dữ liệu	Bao gồm
PostgreSQL	Tất cả users, questions, resources, chapters, lessons...
MinIO	Tất cả file .docx đã upload
Config	.env + SSL certs


🔄 Restore (trên VPS mới)
bash
# SSH vào VPS mới
ssh root@NEW_VPS_IP
# Clone code
git clone ... /opt/EduBoost
cd /opt/EduBoost

# Upload file backup lên VPS mới
scp backup_20260329_120000.tar.gz root@NEW_VPS_IP:/opt/EduBoost/
# Chạy restore
chmod +x scripts/restore.sh
./scripts/restore.sh backup_20260329_120000.tar.gz


💡 Tip: Nên setup cron job để tự động backup hàng ngày:

bash
# Thêm vào crontab -e
0 3 * * * /opt/EduBoost/scripts/backup.sh >> /var/log/eduboost-backup.log 2>&1