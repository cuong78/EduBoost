# VietQR Payment Flow — EduBoost

## Tổng quan

Hệ thống thanh toán dùng **VietQR Callback** để tự động kích hoạt subscription khi teacher chuyển khoản.

https://drive.google.com/file/d/1UPXPz_CPo9SHFSkhu0-PMSJ3BJQcZ4gy/view?usp=sharing
```

---

## Chi tiết từng API

### 🔵 Server → VietQR (ta gọi sang họ)

> **Base URL**: `https://dev.vietqr.org` (DEV) | `https://api.vietqr.org` (PROD)

| Bước | Method | Endpoint                                    | Auth                     | Mục đích                        |
|:----:|--------|---------------------------------------------|--------------------------|----------------------------------|
|  1   | POST   | `/vqr/api/token_generate`                   | 🔑 Basic Auth (API creds) | Lấy `access_token` từ VietQR    |
|  2   | POST   | `/vqr/api/qr/generate-customer`             | 🎫 Bearer token           | Tạo Dynamic QR + đăng ký orderId |
|  3   | POST   | `/vqr/bank/api/test/transaction-callback`   | 🎫 Bearer token           | ⚠️ **Chỉ DEV** — giả lập thanh toán |

---

### 🟢 VietQR → Server (họ gọi vào ta)

> **URL cấu hình trên portal VietQR**: `https://eduboost.school/pricing`

| Bước | Method | Endpoint                       | Auth                    | Mục đích                           |
|:----:|--------|--------------------------------|-------------------------|-------------------------------------|
|  1   | POST   | `/api/token_generate`          | 🔑 Basic Auth (CB creds) | VietQR xin token trước khi callback |
|  2   | POST   | `/bank/api/transaction-sync`   | 🎫 Bearer token          | VietQR gửi thông tin giao dịch      |

---

### 🟡 Frontend → Backend (UI gọi API)

| Method | Endpoint                                     | Auth            | Mục đích                    |
|--------|----------------------------------------------|-----------------|-----------------------------|
| GET    | `/api/subscriptions/plans`                   | ❌ Public        | Hiển thị bảng giá           |
| POST   | `/api/subscriptions/initiate`                | ✅ JWT (Teacher) | Tạo QR thanh toán           |
| GET    | `/api/subscriptions/my`                      | ✅ JWT (Teacher) | Xem subscription hiện tại   |
| GET    | `/api/subscriptions/transactions`            | ✅ JWT (Teacher) | Lịch sử giao dịch          |
| GET    | `/api/subscriptions/transactions/{id}`       | ✅ JWT (Teacher) | Poll trạng thái thanh toán  |
| POST   | `/api/subscriptions/admin/confirm/{id}`      | ✅ JWT + ADMIN   | Admin confirm thủ công      |
| POST   | `/api/subscriptions/admin/cancel/{id}`       | ✅ JWT + ADMIN   | Admin hủy giao dịch         |
| GET    | `/api/subscriptions/admin/pending`           | ✅ JWT + ADMIN   | Xem giao dịch chờ duyệt    |

---

## Credentials (2 bộ riêng biệt)

```
┌──────────────────────────────────────────────────────┐
│  [1] CB Credentials — VietQR gọi VÀO ta             │
│      Username: anhcuong                              │
│      Password: 123Cuong                              │
│      Secret:   36e45a101bed...                       │
│      Dùng cho: /api/token_generate                   │
│                /bank/api/transaction-sync             │
├──────────────────────────────────────────────────────┤
│  [2] API Credentials — Ta gọi VietQR                 │
│      Username: customer-eduboost-user26520            │
│      Password: Y3VzdG9tZXItZWR1Ym9vc3QtdXNlcjI2NTIw │
│      Base URL: dev.vietqr.org (DEV) / api.vietqr.org │
│      Dùng cho: /vqr/api/token_generate               │
│                /vqr/api/qr/generate-customer          │
└──────────────────────────────────────────────────────┘
```

---

## Environment Variables

```env
# VietQR gọi VÀO server mình (callback)
VIETQR_CB_USERNAME=bên mình cấp cho họ
VIETQR_CB_PASSWORD=bên mình cấp cho họ
VIETQR_CB_SECRET=bên mình cấp cho họ

# Server mình gọi VietQR
VIETQR_API_USERNAME=bên họ cấp
VIETQR_API_PASSWORD=bên họ cấp

# DEV: dev.vietqr.org + MBBank | PROD: api.vietqr.org + TPBank
VIETQR_API_BASE_URL=https://dev.vietqr.org
VIETQR_BANK_CODE=MB
VIETQR_ACCOUNT_NO=0369053640
VIETQR_ACCOUNT_NAME=LE THI MAI HUONG
```

---

## File mapping

| File | Vai trò |
|---|---|
| `controller/VietQRCallbackController.java` | 2 endpoints VietQR gọi vào |
| `controller/SubscriptionController.java` | APIs cho Frontend + Admin |
| `service/impl/SubscriptionServiceImpl.java` | Business logic: tạo QR, confirm payment, activate subscription |
| `security/SecurityConstants.java` | Public endpoints (VietQR callback + plans) |
| `application.properties` | Config VietQR credentials + bank info |
| `.env` | Environment variables |
| `nginx/nginx.conf` | Routing `/pricing/api/*` → backend |

---

## Test trên Postman (3 bước)

### Bước 1: Get Token
- `POST https://dev.vietqr.org/vqr/api/token_generate`
- Authorization: Basic Auth → `customer-eduboost-user26520` / `Y3VzdG9tZXItZWR1Ym9vc3QtdXNlcjI2NTIw`
- Body: `{}`
- → Copy `access_token`

### Bước 2: Generate QR
- `POST https://dev.vietqr.org/vqr/api/qr/generate-customer`
- Authorization: Bearer `<token bước 1>`
- Body:
```json
{
    "bankCode": "MB",
    "bankAccount": "0369053640",
    "userBankName": "LE THI MAI HUONG",
    "content": "<orderId>",
    "qrType": 0,
    "amount": 139000,
    "orderId": "<orderId>",
    "transType": "C"
}
```
- → Copy `content` (dạng `VQRxxxxxxxx EDUxxxxxxxxx`)

### Bước 3: Test Callback
- `POST https://dev.vietqr.org/vqr/bank/api/test/transaction-callback`
- Authorization: Bearer `<token bước 1>`
- Body:
```json
{
    "bankAccount": "0369053640",
    "content": "<content từ bước 2>",
    "amount": 139000,
    "transType": "C",
    "bankCode": "MB"
}
```
- → `{"status": "SUCCESS"}` = callback thành công! 🎉
