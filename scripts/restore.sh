#!/bin/bash
# ============================================================
# EduBoost Restore Script
# Restore PostgreSQL + MinIO data on a new VPS
# ============================================================
# Usage:
#   chmod +x restore.sh
#   ./restore.sh backup_20260329_120000.tar.gz
# ============================================================

set -e

if [ -z "$1" ]; then
    echo "❌ Usage: ./restore.sh <backup_file.tar.gz>"
    echo "   Example: ./restore.sh backup_20260329_120000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"
RESTORE_DIR="/tmp/eduboost_restore"

echo "🔄 EduBoost Restore"
echo "📁 Backup file: $BACKUP_FILE"
echo ""

# ────────────────────────────────────────────────────────────
# 0. Extract backup
# ────────────────────────────────────────────────────────────
echo "📦 [0/4] Extracting backup..."
mkdir -p "$RESTORE_DIR"
tar xzf "$BACKUP_FILE" -C "$RESTORE_DIR" --strip-components=1
echo "   ✅ Extracted"

# ────────────────────────────────────────────────────────────
# 1. Restore .env and SSL (do this FIRST before docker-compose up)
# ────────────────────────────────────────────────────────────
echo "⚙️  [1/4] Restoring config..."
if [ -f "$RESTORE_DIR/env.backup" ]; then
    cp "$RESTORE_DIR/env.backup" /opt/EduBoost/.env
    echo "   ✅ .env restored"
    echo "   ⚠️  Review .env and update IP/domain if changed!"
fi

if [ -d "$RESTORE_DIR/ssl_certs" ]; then
    mkdir -p /opt/EduBoost/nginx/ssl
    cp -r "$RESTORE_DIR/ssl_certs/"* /opt/EduBoost/nginx/ssl/
    echo "   ✅ SSL certs restored"
fi

# ────────────────────────────────────────────────────────────
# 2. Start containers (need postgres + minio running first)
# ────────────────────────────────────────────────────────────
echo "🐳 [2/4] Starting database containers..."
cd /opt/EduBoost
docker-compose -f docker-compose.prod.yml up -d postgres minio
echo "   ⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Wait until pg_isready
for i in $(seq 1 30); do
    if docker exec eduboost-db-prod pg_isready -U postgres >/dev/null 2>&1; then
        echo "   ✅ PostgreSQL is ready"
        break
    fi
    sleep 2
done

# ────────────────────────────────────────────────────────────
# 3. Restore PostgreSQL
# ────────────────────────────────────────────────────────────
echo "🐘 [3/4] Restoring PostgreSQL..."

# Drop existing database and recreate
docker exec eduboost-db-prod psql -U postgres -c "
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = 'eduboost' AND pid <> pg_backend_pid();
" 2>/dev/null || true

docker exec eduboost-db-prod psql -U postgres -c "DROP DATABASE IF EXISTS eduboost;"
docker exec eduboost-db-prod psql -U postgres -c "CREATE DATABASE eduboost;"

# Restore from custom format dump
docker cp "$RESTORE_DIR/database.dump" eduboost-db-prod:/tmp/database.dump
docker exec eduboost-db-prod pg_restore -U postgres -d eduboost \
    --no-owner --no-privileges \
    /tmp/database.dump
docker exec eduboost-db-prod rm /tmp/database.dump

echo "   ✅ Database restored"

# ────────────────────────────────────────────────────────────
# 4. Restore MinIO
# ────────────────────────────────────────────────────────────
echo "📂 [4/4] Restoring MinIO data..."

# Get the volume name (usually prefixed with project name)
MINIO_VOLUME=$(docker volume ls --format '{{.Name}}' | grep minio_data | head -1)
if [ -z "$MINIO_VOLUME" ]; then
    MINIO_VOLUME="eduboost_minio_data"
fi

docker-compose -f docker-compose.prod.yml stop minio
docker run --rm \
    -v "$MINIO_VOLUME":/target \
    -v "$RESTORE_DIR":/backup \
    alpine sh -c "rm -rf /target/* && tar xzf /backup/minio_data.tar.gz -C /target"
docker-compose -f docker-compose.prod.yml start minio

echo "   ✅ MinIO data restored"

# ────────────────────────────────────────────────────────────
# 5. Start all services
# ────────────────────────────────────────────────────────────
echo ""
echo "🚀 Starting all services..."
cd /opt/EduBoost
docker-compose -f docker-compose.prod.yml up -d

# Cleanup
rm -rf "$RESTORE_DIR"

echo ""
echo "============================================================"
echo "🎉 Restore hoàn tất!"
echo ""
echo "⚠️  Checklist sau khi restore:"
echo "  1. Kiểm tra .env → cập nhật IP/domain mới nếu cần"
echo "  2. Kiểm tra SSL cert → nếu đổi domain thì cần cert mới"
echo "  3. Cập nhật DNS record → trỏ domain sang IP VPS mới"
echo "  4. Test: curl https://your-domain/api/health"
echo "============================================================"
