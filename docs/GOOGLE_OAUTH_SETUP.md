# Cấu hình đăng nhập Google (Kotonote)

Hướng dẫn lấy **Client ID** / **Client Secret** trên Google Cloud Console và gán vào file `.env` của backend và frontend.

---

## Luồng trong app

1. User bấm **Đăng nhập với Google** trên trang `/login`.
2. Google Identity Services (GIS) trả về **ID token** (JWT).
3. Frontend gọi `POST /api/auth/google` với body `{ "token": "<id_token>" }`.
4. Backend verify token bằng `GOOGLE_CLIENT_ID` → tạo/link user → trả JWT app.

---

## Bước 1 — Tạo project trên Google Cloud

1. Mở [Google Cloud Console](https://console.cloud.google.com/).
2. Chọn hoặc tạo **Project** (ví dụ `kotonote-dev`).
3. Vào **APIs & Services** → **OAuth consent screen**:
   - User type: **External** (hoặc Internal nếu chỉ dùng Google Workspace nội bộ).
   - Điền **App name**, **User support email**, **Developer contact email**.
   - Scopes: mặc định `email`, `profile`, `openid` là đủ (GIS Sign-In).
   - **Test users**: thêm email Gmail dùng để test khi app còn trạng thái **Testing**.

---

## Bước 2 — Tạo OAuth Client ID

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
2. Application type: **Web application**.
3. **Name**: ví dụ `Kotonote Web (local)`.

### Authorized JavaScript origins

Thêm **mọi origin** mà user mở app (không có path, không dấu `/` cuối):

| Môi trường | Ví dụ |
|------------|--------|
| Vite dev | `http://localhost:5173` |
| Vite preview | `http://localhost:4173` |
| Production | `https://your-domain.com` |

### Authorized redirect URIs

Luồng hiện tại dùng **Google Identity Services (nút Sign in)** — chỉ cần **JavaScript origins** ở trên.

Nếu sau này dùng redirect OAuth server-side, thêm URI dạng:

- `http://localhost:5173`
- `https://your-domain.com`

*(Có thể để trống redirect URI cho GIS button flow.)*

4. Bấm **Create** → copy:
   - **Client ID** → dạng `xxxxx.apps.googleusercontent.com`
   - **Client secret** → chuỗi bí mật (lưu an toàn)

---

## Bước 3 — Gán vào `.env`

### Backend — `backend/.env`

```env
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
```

| Biến | Bắt buộc | Mô tả |
|------|----------|--------|
| `GOOGLE_CLIENT_ID` | **Có** | Verify ID token (`google-auth-library`) |
| `GOOGLE_CLIENT_SECRET` | Không (luồng hiện tại) | Dự phòng nếu sau này dùng OAuth code flow server-side |

`CLIENT_URL` trong backend nên khớp origin frontend (CORS), ví dụ:

```env
CLIENT_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

```env
VITE_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

| Biến | Bắt buộc | Mô tả |
|------|----------|--------|
| `VITE_GOOGLE_CLIENT_ID` | **Có** | Khởi tạo nút Google GIS — **phải cùng Client ID** với backend |

> **Quan trọng:** `VITE_GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_ID` phải là **cùng một OAuth Client ID** (cùng bản ghi Web application trên Console).

Sau khi sửa `.env` frontend, **khởi động lại** `npm run dev` (Vite chỉ đọc env lúc start).

---

## Bước 4 — Kiểm tra

1. Backend chạy (ví dụ port `8000`), frontend `npm run dev` (`5173`).
2. Mở `/login` → bấm **Đăng nhập với Google**.
3. Chọn tài khoản Google (phải nằm trong **Test users** nếu consent screen đang Testing).
4. Vào app → Profile / API `GET /api/users/me` có user với `authProvider: "google"`.

### Lỗi thường gặp

| Triệu chứng | Nguyên nhân / cách xử lý |
|-------------|---------------------------|
| Nút Google disabled, tooltip “Chưa cấu hình…” | Thiếu `VITE_GOOGLE_CLIENT_ID` hoặc chưa restart Vite |
| `MSG_110` / Google auth failed | `GOOGLE_CLIENT_ID` backend sai hoặc khác frontend; token hết hạn |
| `redirect_uri_mismatch` | Thêm đúng origin vào **Authorized JavaScript origins** |
| `access_denied` / không chọn được account | Thêm email vào **Test users** (app ở chế độ Testing) |
| CORS | `CLIENT_URL` backend = đúng URL frontend |

---

## Production checklist

- [ ] OAuth consent screen **Publish** (hoặc giữ Testing + test users).
- [ ] Thêm domain production vào **Authorized JavaScript origins**.
- [ ] `GOOGLE_CLIENT_ID` + `VITE_GOOGLE_CLIENT_ID` trên server/build CI.
- [ ] Không commit file `.env` thật lên git.
- [ ] `CLIENT_URL` production trỏ đúng URL user truy cập.

---

## API tham chiếu

```http
POST /api/auth/google
Content-Type: application/json

{
  "token": "<Google ID token từ GIS callback>"
}
```

Response (thành công): giống login email — `{ user, token }`.

---

## File code liên quan

| File | Vai trò |
|------|---------|
| `backend/src/utils/googleAuth.js` | Verify ID token |
| `backend/src/services/authService.js` | `googleLogin` |
| `backend/src/routes/authRoutes.js` | `POST /google` |
| `frontend/src/hooks/useGoogleSignIn.js` | Load GIS + nút |
| `frontend/src/components/auth/GoogleSignInButton.jsx` | UI login |
| `frontend/src/services/authService.js` | `googleLogin()` |
