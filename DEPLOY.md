# Hướng dẫn Deploy Website Lên Vercel

## 📋 Các file đã có sẵn:
- `index.html` - Trang chính
- `style.css` - Giao diện
- `script.js` - Chức năng tương tác

## 🚀 Cách Deploy Lên Vercel (Miễn Phí):

### Cách 1: Deploy qua Vercel Website (Không cần cài đặt gì)

1. **Truy cập Vercel:**
   - Vào https://vercel.com
   - Đăng ký tài khoản (có thể dùng GitHub, GitLab, hoặc email)

2. **Upload project:**
   - Click **"Add New..."** → **"Project"**
   - Chọn **"Import Third-Party Repository"** hoặc **"Upload"**
   - Nếu chọn Upload: Drag & Drop thư mục `bai-tap-day-3` vào

3. **Cấu hình:**
   - Framework Preset: **Other** (hoặc để trống)
   - Root Directory: `./` (mặc định)
   - Build Command: để trống
   - Output Directory: để trống

4. **Deploy:**
   - Click **"Deploy"**
   - Chờ ~30 giây → Website live!

5. **Kết quả:**
   - Bạn sẽ nhận được domain dạng: `your-project.vercel.app`
   - Có thể đổi tên project trong Settings

---

### Cách 2: Deploy qua Vercel CLI (Nâng cao)

```bash
# 1. Cài Vercel CLI
npm install -g vercel

# 2. Di chuyển vào thư mục project
cd "e:/học AI 21 day/bai-tap-day-3"

# 3. Deploy
vercel

# 4. Lần deploy sau (production)
vercel --prod
```

---

## 🌐 Trỏ Domain Thật (Bước 2 của SOP):

### Nếu đã mua domain ở 123host:

1. **Trong Vercel:**
   - Vào project → **Settings** → **Domains**
   - Thêm domain của bạn (vd: `cuahangbanhang.vn`)
   - Vercel sẽ cung cấp 2 giá trị:
     - **Nameserver 1**: `ns1.vercel-dns.com`
     - **Nameserver 2**: `ns2.vercel-dns.com`

2. **Trong 123host:**
   - Đăng nhập vào https://client.123host.vn
   - Vào quản lý Domain → chọn domain
   - Thay đổi Nameserver thành 2 giá trị Vercel cung cấp
   - Lưu lại

3. **Chờ:**
   - Thường mất 5-30 phút để DNS cập nhật
   - Kiểm tra: truy cập domain của bạn

---

## ✅ Checklist Trước Khi Mở Cửa (Bước 5):

- [ ] Website mở được trên điện thoại (test responsive)
- [ ] Tốc độ tải trang OK (dùng PageSpeed Insights)
- [ ] Tất cả button/CTA hoạt động
- [ ] Form liên hệ gửi được
- [ ] Giỏ hàng + thanh toán hoạt động
- [ ] Chính tả, số điện thoại đúng

---

## 📝 Những gì cần thay đổi theo nội dung thật của bạn:

### 1. Thông tin liên hệ (script.js):
```javascript
// Dòng ~380 - function submitContact()
// Thay số điện thoại, email thật vào console.log
```

### 2. Thông tin footer (index.html):
```html
<!-- Dòng 235: Đổi tên shop, năm -->
<p>&copy; 2026 Tên Shop Của Bạn. Tất cả quyền được bảo lưu.</p>
```

### 3. Mạng xã hội (index.html):
```html
<!-- Dòng 200-205: Thay link Facebook, Instagram... -->
<a href="https://facebook.com/ten-shop-cua-ban">
```

### 4. Sản phẩm (script.js):
```javascript
// Dòng 1-80: Sửa thông tin sản phẩm, giá, ảnh thật
```

---

## 🆘 Nếu gặp lỗi:

| Lỗi | Cách fix |
|-----|----------|
| Website trắng | Kiểm tra console (F12) có lỗi JS không |
| CSS không load | Kiểm tra đường dẫn `href="style.css"` |
| Ảnh không hiện | Dùng placeholder hoặc ảnh thật từ URL |

---

## 📞 Liên hệ hỗ trợ:
- Vercel Docs: https://vercel.com/docs
- 123host Support: support@123host.vn

**Chúc bạn deploy thành công! 🚀**
