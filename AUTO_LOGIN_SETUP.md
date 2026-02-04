# AUTO-LOGIN FEATURE - SETUP GUIDE

## Tính năng mới: Tự động đăng nhập qua email

### 📝 Mô tả

- Khi tạo tài khoản học sinh/phụ huynh mới, email sẽ chứa **nút "Đăng nhập ngay (Tự động)"**
- Người dùng chỉ cần click vào nút, hệ thống sẽ tự động đăng nhập mà không cần nhập mật khẩu
- Token có hiệu lực **24 giờ** và chỉ sử dụng được **1 lần duy nhất**

### 🔧 Các files đã tạo/sửa

#### 1. Entity mới

- `OneTimeLoginToken.java` - Lưu trữ token tự động đăng nhập

#### 2. Repository mới

- `OneTimeLoginTokenRepository.java` - Quản lý token database

#### 3. Service mới

- `OneTimeLoginTokenService.java` (interface)
- `OneTimeLoginTokenServiceImpl.java` (implementation)

#### 4. Controller đã cập nhật

- `AuthenticationController.java`
  - Endpoint mới: `POST /api/auth/auto-login?token={token}`
  - Validate token và tự động đăng nhập user

#### 5. Service đã cập nhật

- `TeacherServiceImpl.java`
  - Generate token khi tạo tài khoản mới
  - Thêm link auto-login vào email

### 🗄️ Database Migration

**Cần chạy SQL này để tạo table mới:**

```sql
CREATE TABLE one_time_login_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_one_time_token_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_one_time_token ON one_time_login_tokens(token);
CREATE INDEX idx_one_time_token_user ON one_time_login_tokens(user_id);
CREATE INDEX idx_one_time_token_expires ON one_time_login_tokens(expires_at);
```

### ⚙️ Frontend Configuration (.env)

**File .env hiện tại không cần thay đổi** - Code đã tự động xử lý:

- Student login: `https://eduboost.school/login`
- Parent login: `https://eduboost.school/parent/login`
- Auto-login endpoint: `https://eduboost.school/api/auth/auto-login?token=xxx`

### 🚀 Cách sử dụng

1. **Backend tự động:**
   - Khi teacher tạo student mới → tạo token → gửi email
   - Khi teacher tạo parent mới → tạo token → gửi email

2. **Frontend xử lý:**
   - User click vào nút "Đăng nhập ngay (Tự động)" trong email
   - Frontend gọi: `POST https://eduboost.school/api/auth/auto-login?token=xxx`
   - Nhận response có JWT token + refreshToken
   - Lưu token vào localStorage và redirect đến trang home

### 📧 Email Template

**Học sinh:**

```
🚀 Đăng nhập ngay (Tự động) [Nút lớn]
⚠️ Link chỉ có hiệu lực trong 24 giờ

--- Hoặc ---

👉 Trang đăng nhập thông thường [Link nhỏ]
```

**Phụ huynh (nếu account mới tạo):**

```
🚀 Đăng nhập ngay (Tự động) [Nút lớn]
⚠️ Link chỉ có hiệu lực trong 24 giờ

--- Hoặc ---

👉 Trang đăng nhập phụ huynh [Link nhỏ]
```

### 🔒 Bảo mật

- Token random 256-bit (32 bytes)
- Chỉ sử dụng được 1 lần duy nhất
- Hết hạn sau 24 giờ
- Lưu trong database với index để tìm nhanh
- Cascade delete khi user bị xóa

### 🧪 Test

**Manual test:**

1. Tạo student mới qua API teacher
2. Kiểm tra email đã nhận
3. Copy link "Đăng nhập ngay (Tự động)"
4. Mở link trong browser
5. Verify: Tự động đăng nhập thành công

**Postman test:**

```
POST https://eduboost.school/api/auth/auto-login?token=YOUR_TOKEN_HERE

Response:
{
  "status": 200,
  "message": "Auto-login successful",
  "data": {
    "userId": 123,
    "username": "student@example.com",
    "token": "eyJhbGciOiJIUzI1...",
    "refreshToken": "abc123..."
  }
}
```

### ❗ Lưu ý

1. **Cần rebuild backend** để áp dụng thay đổi:

   ```bash
   mvn clean package
   ```

2. **Cần chạy SQL migration** để tạo bảng `one_time_login_tokens`

3. **Frontend cần implement**:
   - Xử lý endpoint `/api/auth/auto-login`
   - Lưu JWT token từ response
   - Redirect đến trang home sau khi login thành công

### 🎯 Benefits

✅ UX tốt hơn - User không cần nhập mật khẩu lần đầu
✅ Giảm friction onboarding
✅ An toàn - Token one-time, có thời hạn
✅ Không conflict với login thông thường
