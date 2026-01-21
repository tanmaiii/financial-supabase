# Google OAuth Redirect Fix - Deployment Checklist

## Vấn đề

Khi deploy lên Vercel, Google OAuth vẫn redirect về `localhost:3000` thay vì domain production.

## Giải pháp

### 1️⃣ Cấu hình Supabase Dashboard

Truy cập [Supabase Dashboard](https://supabase.com/dashboard) → Chọn project của bạn:

#### a. Site URL

- Vào **Authentication** → **URL Configuration**
- Cập nhật **Site URL**: `https://your-app.vercel.app`

#### b. Redirect URLs

- Thêm các URLs sau vào **Redirect URLs**:
  ```
  https://your-app.vercel.app/auth/callback
  https://your-app.vercel.app/*
  http://localhost:3000/* (giữ lại cho development)
  ```

### 2️⃣ Cấu hình Google OAuth Console

Truy cập [Google Cloud Console](https://console.cloud.google.com):

#### a. Credentials

- Vào **APIs & Services** → **Credentials**
- Chọn OAuth 2.0 Client ID của bạn

#### b. Authorized redirect URIs

Thêm:

```
https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback
```

**Lưu ý:** Tìm Project ID của bạn tại Supabase Dashboard → Project Settings → General

#### c. Authorized JavaScript origins

Thêm:

```
https://your-app.vercel.app
http://localhost:3000 (giữ lại cho development)
```

### 3️⃣ Environment Variables trên Vercel

Truy cập Vercel Dashboard → Project → **Settings** → **Environment Variables**

Thêm các biến sau:

| Variable                        | Value                              | Environments                     |
| ------------------------------- | ---------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://[project-id].supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key`                    | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL`           | `https://your-app.vercel.app`      | Production                       |
| `NEXT_PUBLIC_APP_URL`           | `https://your-preview.vercel.app`  | Preview (optional)               |

**Quan trọng:** Sau khi thêm/sửa env variables, cần **Redeploy** project để áp dụng thay đổi.

### 4️⃣ Local Development

Tạo file `.env.local` (không commit vào git):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5️⃣ Kiểm tra

#### Sau khi cấu hình xong:

1. **Redeploy trên Vercel**
   - Vào **Deployments** tab
   - Click **...** trên deployment mới nhất → **Redeploy**
   - Hoặc push commit mới lên git

2. **Test Google Login**
   - Truy cập `https://your-app.vercel.app`
   - Click "Đăng nhập với Google"
   - Kiểm tra URL sau khi login thành công phải là:
     `https://your-app.vercel.app/dashboard` (không phải localhost)

3. **Kiểm tra Console**
   - Mở DevTools → Console
   - Không có lỗi CORS hoặc redirect errors

## Troubleshooting

### Vẫn redirect về localhost?

✅ Kiểm tra env variables trên Vercel đã đúng chưa  
✅ Đã redeploy sau khi thay đổi env variables chưa  
✅ Clear cache trình duyệt và thử lại

### Lỗi "redirect_uri_mismatch"?

✅ Kiểm tra Google OAuth Console đã thêm đúng redirect URI chưa  
✅ URI phải chính xác: `https://[project-id].supabase.co/auth/v1/callback`

### Lỗi CORS?

✅ Kiểm tra Supabase Dashboard → Authentication → URL Configuration  
✅ Đảm bảo domain production đã được thêm vào Redirect URLs

## Tài liệu tham khảo

- [Supabase Auth with OAuth](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 2.0 Setup](https://support.google.com/cloud/answer/6158849)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
