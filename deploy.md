# 🚀 Hướng dẫn Deploy lên Vercel

Hướng dẫn deploy ứng dụng **Bông Toán Lớp 1** lên Vercel.

---

## 📋 Chuẩn bị

- Tài khoản GitHub: [github.com](https://github.com)
- Tài khoản Vercel: [vercel.com](https://vercel.com)

---

## Cách 1: Deploy qua GitHub (Khuyên dùng)

### Bước 1: Chuẩn bị repository GitHub

Tạo repository mới trên GitHub với tên `bong-toan-lop-1`.

### Bước 2: Push code lên GitHub

```bash
cd /Users/bee/Documents/Bông/bong-toan-lop-1
git init
git add .
git commit -m "Initial commit: Bông Toán Lớp 1"
git branch -M main
git remote add origin https://github.com/USERNAME/bong-toan-lop-1.git
git push -u origin main
```

> Thay `USERNAME` bằng tên GitHub của bạn.

### Bước 3: Kết nối GitHub với Vercel

1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập bằng GitHub
3. Click **"Add New..."** → **"Project"**

### Bước 4: Import Project

1. Chọn repository `bong-toan-lop-1` từ danh sách
2. Cấu hình project:

   | Cài đặt | Giá trị |
   |---------|---------|
   | Project Name | `bong-toan-lop-1` |
   | Framework Preset | `Other` |
   | Root Directory | `./` |
   | Build Command | *(để trống)* |
   | Output Directory | *(để trống)* |
   | Install Command | `npm install` |

3. Click **"Deploy"**

### Bước 5: Chờ deploy hoàn tất

- Vercel sẽ tự động build và deploy
- Thường mất 1-2 phút
- Sau khi hoàn tất, bạn sẽ nhận được URL: `https://bong-toan-lop-1.vercel.app`

---

## Cách 2: Deploy qua Vercel CLI

### Bước 1: Cài đặt Vercel CLI

```bash
npm install -g vercel
```

### Bước 2: Đăng nhập

```bash
vercel login
```

### Bước 3: Deploy

```bash
cd /Users/bee/Documents/Bông/bong-toan-lop-1
vercel
```

### Bước 4: Trả lời câu hỏi

```
? Set up and deploy "~/bong-toan-lop-1"? [Y/n] Y
? Which scope? Select your account
? Link to existing project? [y/N] N
? What's your project's name? bong-toan-lop-1
? In which directory is your code located? ./
```

### Bước 5: Deploy Production

```bash
vercel --prod
```

---

## 🔄 Cập nhật code

### Sau khi có thay đổi:

```bash
git add .
git commit -m "Mô tả thay đổi"
git push
```

Vercel sẽ tự động redeploy khi có code mới push lên GitHub.

---

## 📁 Cấu hình Vercel

File `vercel.json` đã được cấu hình sẵn:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

---

## 🌐 Tùy chỉnh Domain

### Domain mặc định

```
https://bong-toan-lop-1.vercel.app
```

### Thêm custom domain (tùy chọn)

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project `bong-toan-lop-1`
3. Click **"Settings"** → **"Domains"**
4. Nhập domain của bạn và làm theo hướng dẫn

---

## ⚠️ Lưu ý quan trọng

| Vấn đề | Giải pháp |
|--------|-----------|
| Timeout khi deploy | Kiểm tra file `vercel.json` đã tồn tại |
| Lỗi 404 | Đảm bảo `server.js` ở thư mục gốc |
| Không load được static | Kiểm tra path `public/` trong server.js |

---

## 📞 Hỗ trợ

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- GitHub Issues: [github.com/vercel/vercel/issues](https://github.com/vercel/vercel/issues)

---

Được tạo ngày: 29/03/2026
