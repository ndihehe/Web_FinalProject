# 🎬 TDTDT Cinema - Nền Tảng Đặt Vé Xem Phim Trực Tuyến

> Dự án Frontend ứng dụng web đặt vé xem phim trực tuyến hiện đại, thiết kế theo phong cách cinematic retro cao cấp (lấy cảm hứng từ Aovis Cinema) kết hợp cùng hệ thống rạp Beta Cinema.

---

## Demo Videos

https://github.com/user-attachments/assets/242dab76-4ed5-4625-a505-8ee861bc4bc7

> 💡 *Video tự động demo toàn bộ các luồng chức năng: Trang chủ Spotlight, Danh sách & Bộ lọc phim, Xem Trailer YouTube, Chọn ghế phòng chiếu, Đặt bắp nước F&B, Áp mã giảm giá, Xác nhận thanh toán, Xuất vé điện tử QR Code, Chi tiết cụm rạp và Quản lý ví tiền.*

---

## 🚀 Công Nghệ Sử Dụng

| Phân Vùng | Công Nghệ / Thư Viện | Phiên Bản | Mục Đích Sử Dụng |
| :--- | :--- | :--- | :--- |
| **Ngôn ngữ** | **JavaScript (ES2023+)** | Modern ES | Toàn bộ logic ứng dụng: `async/await`, Destructuring, Modules |
| **UI Framework** | **React** | ^19.2.8 | Xây dựng giao diện hướng Component và Hooks (`useState`, `useEffect`, `useContext`) |
| **Build Tool & Bundler** | **Vite** | ^8.3.0 | Khởi động máy chủ dev siêu tốc (<200ms), HMR dưới 50ms, đóng gói production bundle |
| **Plugin** | **@vitejs/plugin-react** | ^6.1.1 | Hỗ trợ Fast Refresh và biên dịch JSX cho React 19 |
| **Styling** | **Vanilla CSS Design System** | CSS3 / Grid / Flexbox | CSS Tokens, hệ màu HSL, kính mờ Glassmorphism, Spotlight chuột, Micro-animations |
| **Icons** | **Pure SVG Vector Icons** | Feather / Lucide | 280+ icons tích hợp dạng SVG vector, hiển thị sắc nét trên mọi độ phân giải |
| **Routing** | **Custom Hash SPA Router** | RESTful Router | Điều hướng SPA mượt mà, hỗ trợ tham số động (`/movie/:id`, `/cinema/:id`, `/booking/:id`, `/ticket/:id`) |
| **Typography** | **Web Fonts** | Display & Sans | `Chinese Rocks` (tiêu đề retro), `Covered By Your Grace` (thể loại chữ ký viết tay), `Outfit`, `Plus Jakarta Sans` |

---

## 🛠️ Hướng Dẫn Cài Đặt & Cách Dùng

### 1. Yêu cầu môi trường
- **Node.js:** Phiên bản 18.x trở lên (khuyên dùng Node.js LTS).
- **Trình duyệt:** Chrome, Edge, Firefox, Safari phiên bản mới.

### 2. Cài đặt các thư viện phụ thuộc
Mở terminal tại thư mục dự án và chạy:
```bash
npm install
```

### 3. Cấu hình môi trường (.env)
Tạo file `.env` tại thư mục gốc (hoặc sao chép từ `.env.example`):
```env
# Địa chỉ máy chủ Backend (Java Servlet) nếu kết nối API thật
VITE_API_BASE_URL=http://localhost:8080/Cinema_war_exploded/api/v1

# Chế độ dữ liệu: true để chạy Offline Demo (Mock Data), false để kết nối Backend thật
VITE_USE_MOCK=true
```

### 4. Khởi chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Truy cập ứng dụng tại: **`http://localhost:5173`**

### 5. Đóng gói bản phát hành (Production Build)
```bash
npm run build
```
Mã nguồn đã tối ưu và nén gzip sẽ được xuất ra thư mục `dist/`.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
web_final/
├── public/                 # Tài nguyên tĩnh
│   ├── demo.webm           # Video demo trải nghiệm hệ thống
│   ├── chinese-rocks.woff  # Webfont tiêu đề số retro
│   ├── icons/              # 280+ Feather Icons chuẩn SVG vector
│   └── images/             # Logo nhận diện thương hiệu TDTDT, banner, poster
├── src/
│   ├── assets/             # Hình ảnh bổ trợ giao diện
│   ├── components/         # Header, Footer, HeroSlider, AuthModal, FeatherIcon...
│   ├── context/            # Quản lý trạng thái Modal xác thực
│   ├── data/               # Mock data chuẩn định dạng API
│   ├── router/             # Bộ điều hướng SPA Hash Router
│   ├── screens/            # Các màn hình chính (Home, Movies, Cinema, Seats, Checkout, Ticket...)
│   ├── services/           # cinemaService kết nối API và xử lý dữ liệu
│   ├── App.jsx             # Phân phối layout và routing
│   ├── index.css           # Toàn bộ Design System CSS (~8000 dòng)
│   └── main.jsx            # Entry point ứng dụng
├── docs/                   # Tài liệu kiến trúc, hướng dẫn database, gói tin (Lưu cục bộ)
├── index.html              # HTML shell & Google Fonts
├── package.json
└── vite.config.js
```

---

## 🌟 Các Tính Năng & Luồng Giao Diện

1. **Trang Chủ (`/`):**
   - Hero Slider Cinematic với hiệu ứng rọi đèn spotlight qua tiêu đề phim, vuốt kéo slider chuyển slide.
   - Thể loại phim viết tay retro (`Covered By Your Grace`) chuẩn hóa không dấu đồng nhất.
   - Top 3 Phim Spotlight & Danh sách Cụm rạp nổi bật với nút xem lịch chiếu trực tiếp.
2. **Danh Mục & Chi Tiết Phim (`/movie`, `/movie/:id`):**
   - Bộ lọc phim Đang Chiếu / Sắp Chiếu và lọc nhanh theo thể loại.
   - Modal xem Trailer YouTube full-screen, chọn ngày và suất chiếu nhanh.
3. **Chi Tiết Rạp Cố Định (`/cinema`):**
   - Toàn cảnh rạp với logo TDTDT cổ điển, địa chỉ, hotline và chỉ đường Google Maps.
   - Lịch chiếu 7 ngày liên tiếp phân theo phim và phòng chiếu.
4. **Sơ Đồ Chọn Ghế (`/showtime/:id/seat`):**
   - Ma trận ghế tương tác với 3 phân hạng: Ghế Thường (Standard), Ghế VIP, Ghế Đôi (Couple).
   - Tự động hiển thị tổng tiền vé thời gian thực.
5. **Thanh Toán & Đặt Vé (`/booking/:id`):**
   - Đếm ngược giữ ghế 10:00 chuẩn quy tắc rạp.
   - Chọn combo Bắp Nước (F&B) kèm hình ảnh và tăng giảm số lượng.
   - Áp dụng mã giảm giá / Voucher khuyến mãi 1 chạm.
   - Phương thức thanh toán qua Ví TDTDT Cinema hoặc Cổng trực tuyến.
6. **Vé Điện Tử QR Code (`/ticket/:id`):**
   - Cuống vé điện tử với mã QR độc bản dùng để soát vé tại rạp.
   - Tự động kiểm tra điều kiện hoàn tiền cách giờ chiếu 120 phút.
7. **Quản Lý Cá Nhân & Ví:**
   - Quản lý số dư ví tiền, nạp tiền vào ví, lịch sử giao dịch.
   - Xem lịch sử đơn đặt vé phân chia 3 tab (Vé đã mua, Chờ thanh toán, Đã hủy).
   - Đăng nhập / Đăng ký qua Modal kính mờ (Glassmorphism) tiện lợi.