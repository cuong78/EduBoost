#!/bin/bash
# ============================================================
# EduBoost Backup Script
# Backup PostgreSQL + MinIO data
# ============================================================
# Usage:
#   chmod +x backup.sh
#   ./backup.sh                  # Backup vào thư mục mặc định
#   ./backup.sh /path/to/backup  # Backup vào thư mục chỉ định
# ============================================================

set -e

BACKUP_DIR="${1:-/opt/EduBoost/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

echo "📦 EduBoost Backup - $TIMESTAMP"
echo "📁 Backup path: $BACKUP_PATH"
echo ""

mkdir -p "$BACKUP_PATH"

# ────────────────────────────────────────────────────────────
# 1. Backup PostgreSQL
# ────────────────────────────────────────────────────────────
echo "🐘 [1/3] Backing up PostgreSQL..."
docker exec eduboost-db-prod pg_dump -U postgres -d eduboost \
    --format=custom --compress=9 \
    -f /tmp/eduboost_backup.dump

docker cp eduboost-db-prod:/tmp/eduboost_backup.dump "$BACKUP_PATH/database.dump"
docker exec eduboost-db-prod rm /tmp/eduboost_backup.dump

# Also create a plain SQL backup for readability
docker exec eduboost-db-prod pg_dump -U postgres -d eduboost \
    > "$BACKUP_PATH/database.sql"

echo "   ✅ Database backup: $(du -h "$BACKUP_PATH/database.dump" | cut -f1)"

# ────────────────────────────────────────────────────────────
# 2. Backup MinIO (files/images/resources)
# ────────────────────────────────────────────────────────────
echo "📂 [2/3] Backing up MinIO data..."

# Method 1: Copy from Docker volume
docker run --rm \
    -v eduboost_minio_data:/source:ro \
    -v "$BACKUP_PATH":/backup \
    alpine tar czf /backup/minio_data.tar.gz -C /source .

echo "   ✅ MinIO backup: $(du -h "$BACKUP_PATH/minio_data.tar.gz" | cut -f1)"

# ────────────────────────────────────────────────────────────
# 3. Backup .env config
# ────────────────────────────────────────────────────────────
echo "⚙️  [3/3] Backing up config..."
if [ -f /opt/EduBoost/.env ]; then
    cp /opt/EduBoost/.env "$BACKUP_PATH/env.backup"
    echo "   ✅ .env saved"
fi

if [ -d /opt/EduBoost/nginx/ssl ]; then
    cp -r /opt/EduBoost/nginx/ssl "$BACKUP_PATH/ssl_certs"
    echo "   ✅ SSL certs saved"
fi

# ────────────────────────────────────────────────────────────
# Create archive
# ────────────────────────────────────────────────────────────
echo ""
echo "📦 Creating final archive..."
cd "$BACKUP_DIR"
tar czf "backup_$TIMESTAMP.tar.gz" "backup_$TIMESTAMP/"
rm -rf "$BACKUP_PATH"

FINAL_SIZE=$(du -h "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" | cut -f1)
echo ""
echo "============================================================"
echo "🎉 Backup hoàn tất!"
echo "📁 File: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
echo "📊 Size: $FINAL_SIZE"
echo ""
echo "💡 Để download về máy local:"
echo "   scp root@YOUR_VPS:$BACKUP_DIR/backup_$TIMESTAMP.tar.gz ."
echo "============================================================"
