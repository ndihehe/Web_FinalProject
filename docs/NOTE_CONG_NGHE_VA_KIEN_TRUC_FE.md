# TÀI LIỆU CÔNG NGHỆ VÀ KIẾN TRÚC FRONTEND BETA CINEMA

> **Phiên bản:** 2.0.0  
> **Dự án:** Beta Cinema Single Page Application (SPA)  
> **Hệ thống Backend đối ứng:** Java Servlet MVC RESTful API (`Cinema_api`, đặc tả `swagger_cinema.yaml`)  
> **Cơ sở dữ liệu đối ứng:** PostgreSQL 16 / Neon Cloud Database (`Cinema_PostgreSQL_Reference`)  
> **Mục tiêu:** Chuẩn hóa toàn bộ Frontend, loại bỏ 100% dữ liệu test rò rỉ khi kết nối API thật, đảm bảo tương thích tuyệt đối với Backend và Cơ sở dữ liệu để web không bao giờ bị lỗi runtime.

---

## PHẦN 1: BẢNG TỔNG HỢP CÔNG NGHỆ & NGÔN NGỮ LẬP TRÌNH (TECH STACK)

| Phân Vùng | Công Nghệ / Thư Viện | Phiên Bản | Mục Đích Sử Dụng & Vai Trò Trong Dự Án |
| :--- | :--- | :--- | :--- |
| **Ngôn ngữ cốt lõi** | **JavaScript (ES2023+)** | ECMAScript Modern | Toàn bộ mã nguồn logic Frontend viết bằng JavaScript hiện đại: `async/await`, Optional Chaining (`?.`), Nullish Coalescing (`??`), Destructuring, Modules (`import/export`). |
| **Môi trường Runtime** | **Node.js** | v24.19.0 LTS | Môi trường máy chủ thực thi các công cụ phát triển, biên dịch, linter và script tự động hóa. |
| **UI Framework** | **React** | ^19.2.8 | Xây dựng giao diện hướng Component (Functional Components). Quản lý trạng thái và vòng đời bằng React Hooks (`useState`, `useEffect`, `useCallback`, `useRef`, `useContext`). |
| **DOM Renderer** | **React DOM** | ^19.2.8 | Kết nối cây Virtual DOM của React vào trình duyệt web thật. |
| **Build Tool & Bundler** | **Vite** | ^8.3.0 | Công cụ build siêu tốc thế hệ mới, khởi động máy chủ dev dưới 200ms, HMR (Hot Module Replacement) dưới 50ms, đóng gói production bundle tối ưu tree-shaking qua Rolldown/ESBuild. |
| **Vite React Plugin** | **@vitejs/plugin-react** | ^6.1.1 | Hỗ trợ Fast Refresh, JSX transform cho React 19 trong môi trường phát triển Vite. |
| **Định kiểu & Giao diện** | **Vanilla CSS Modern Design System** | CSS3 / CSS Grid / Flexbox | Hệ thống design system thuần viết bằng Vanilla CSS: CSS Custom Properties (biến CSS), hệ màu HSL Tailored, hiệu ứng kính mờ (Glassmorphism), Spotlight Mouse-Tracking, Micro-animations. **Không phụ thuộc TailwindCSS hay Bootstrap**, giúp bundle siêu nhẹ (zero bloat) và tốc độ tải trang tức thì. |
| **Hệ thống Biểu tượng** | **Pure SVG Vector Icons** | Custom Feather/Lucide | Tích hợp trong `FeatherIcon.jsx` dưới dạng Pure SVG, không cần tải webfont bên ngoài, hiển thị sắc nét trên màn hình Retina/High-DPI. |
| **Định tuyến (Routing)** | **Custom Hash SPA Router** | RESTful Hash Router | Bộ định tuyến SPA tự xây dựng (`src/router.jsx`), hỗ trợ History API, dynamic URL params (`/movie/:id`, `/cinema/:id`, `/booking/:id`, `/ticket/:id`), query params, chuyển trang không cần reload. |
| **Linter & Code Quality** | **Oxlint** | ^1.81.0 | Công cụ phân tích cú pháp tĩnh siêu tốc viết bằng Rust, kiểm soát tính bất biến (immutability), sự thuần khiết (purity) và các quy chuẩn React 19. |
| **Kiểm thử tự động** | **Playwright** | ^1.63.0 | Bộ công cụ E2E testing, browser automation, kiểm thử tương thích đa màn hình và device emulation (iPhone, Android, Tablet, Desktop). |

---

## PHẦN 2: KIẾN TRÚC DUAL-MODE SERVICE LAYER (LOẠI BỎ TRIỆT ĐỂ DATA TEST)

Nhằm đảm bảo **khi kết nối API dữ liệu thật thì không còn sót bất kỳ dữ liệu test (mock data) nào ở Frontend**, hệ thống triển khai kiến trúc **Dual-Mode Adapter Layer** trực tiếp tại `src/services/cinemaService.js`.

### 1. Cơ Chế Nhận Diện Chế Độ Hoạt Động (Mode Switch)

Hệ thống sử dụng hai biến môi trường trong file `.env`:
- `VITE_API_BASE_URL`: Địa chỉ gốc của backend Java Servlet (Ví dụ: `http://localhost:8080/Cinema_war_exploded/api/v1` hoặc proxy `/api/v1`).
- `VITE_USE_MOCK`: Thiết lập `'false'` khi kết nối API thật, hoặc `'true'` khi chạy chế độ offline demo.

```javascript
// Trích xuất từ src/services/cinemaService.js
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const USE_MOCK_ENV = import.meta.env.VITE_USE_MOCK;

// IS_REAL_API_MODE tự động kích hoạt khi VITE_USE_MOCK === 'false' và có API_BASE_URL
export const IS_REAL_API_MODE = USE_MOCK_ENV === 'false' && Boolean(API_BASE_URL);
```

### 2. Nguyên Lý Hoạt Động Của Universal HTTP Client (`apiFetch`)

Khi `IS_REAL_API_MODE === true`:
1. **100% các hàm nghiệp vụ** trong `cinemaService.js` ngay lập tức ủy quyền cho hàm `apiFetch(...)` gửi HTTP Request thực tế đến máy chủ Java Servlet backend.
2. **Không chạm vào `INITIAL_DATA`** và **không đọc ghi `localStorage` mock state**.
3. **Tự động đính kèm JWT Bearer Token**: Trích xuất token từ `localStorage.getItem('access_token')` và gắn vào header `Authorization: Bearer <token>`.
4. **Chuẩn hóa Headers & Payload**: Tự động đặt `Accept: application/json` và `Content-Type: application/json;charset=UTF-8` đối với các phương thức `POST`, `PUT`, `PATCH`.
5. **Đảm bảo tính chân thực của dữ liệu**: Nếu cơ sở dữ liệu thật chưa có phim hoặc suất chiếu (trả về mảng rỗng `[]`), Frontend sẽ hiển thị giao diện trống (`EmptyState`) sạch sẽ, **tuyệt đối không tự ý hiển thị phim mẫu** (như The Witcher, Love Nightmare).

```javascript
async function apiFetch(endpoint, { method = 'GET', body = null, params = null, headers = {} } = {}) {
  let url = API_BASE_URL + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);

  // Đính kèm Query Parameters
  if (params && typeof params === 'object') {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders = { 'Accept': 'application/json', ...headers };
  if (body && !(body instanceof FormData)) {
    reqHeaders['Content-Type'] = 'application/json;charset=UTF-8';
  }

  // Tự động đính kèm Access Token JWT
  const token = localStorage.getItem('access_token') || localStorage.getItem('cinema_auth_token');
  if (token) {
    reqHeaders['Authorization'] = 'Bearer ' + token;
  }

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined
  });

  let json = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    json = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const errorMsg = json?.error || json?.message || ('HTTP ' + res.status + ': ' + res.statusText);
    const code = json?.code || ('ERR_' + res.status);
    const fieldErrors = json?.fieldErrors || [];
    throw errorResponse(code, errorMsg, res.status, fieldErrors, json?.details);
  }

  if (res.status === 204) {
    return successResponse(null, null, 'Thành công');
  }

  // Chuẩn hóa envelope phân trang { items, meta }
  if (json && json.success !== undefined) {
    if (json.data && Array.isArray(json.data.items)) {
      const arrProxy = [...json.data.items];
      arrProxy.items = json.data.items;
      arrProxy.meta = json.data.meta;
      return { ...json, data: arrProxy };
    }
    return json;
  }

  const data = json !== null ? json : {};
  return successResponse(data);
}
```

---

## PHẦN 3: ĐỐI CHIẾU & CHUẨN HÓA VỚI API CONTRACT (`swagger_cinema.yaml`)

Tất cả 37 API Endpoints được chuẩn hóa 1-1 giữa đặc tả OpenAPI 3.0.3 của Backend và Frontend Service:

| Nhóm Endpoint | Swagger Path & Method | Hàm trong `cinemaService.js` | Dữ liệu trả về (Data Schema) | Ràng buộc bảo mật |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST /auth/register` | `register(payload)` | `{ accessToken, refreshToken, user }` | Public (Không cần Token) |
| **Auth** | `POST /auth/login` | `login(payload)` | `{ accessToken, refreshToken, user }` | Public |
| **Auth** | `POST /auth/logout` | `logout()` | `204 No Content` | Bearer Token |
| **Auth** | `POST /auth/forgot-password`| `forgotPassword(payload)`| `{ message }` | Public |
| **Auth** | `POST /auth/reset-password` | `resetPassword(payload)` | `204 No Content` | Public |
| **Auth** | `GET /auth/me` | `getUserProfile()` | `{ id, fullName, email, phone, role... }` | Bearer Token |
| **User** | `GET /user` | `getUserProfile()` | `User` object chi tiết | Bearer Token |
| **User** | `PATCH /user` | `updateUserProfile(payload)` | `User` object sau cập nhật | Bearer Token |
| **User** | `POST /user/change-password`| `changePassword(payload)` | `204 No Content` | Bearer Token |
| **User** | `GET /user/booking` | `getUserBookings(params)` | `PageOfBookingSummary` | Bearer Token |
| **User** | `GET /user/voucher` | `getUserVouchers(params)` | `PageOfUserVoucher` | Bearer Token |
| **Home** | `GET /` | `getHome()` | `{ banners, nowShowing, comingSoon, featuredCinemas }` | Public |
| **Movie** | `GET /movie` | `getMovies(params)` | `PageOfMovieSummary` (lọc q, genre, status) | Public |
| **Movie** | `GET /movie/{id}` | `getMovieDetail(id)` | `MovieDetail` chi tiết | Public |
| **Movie** | `GET /movie/{id}/showtime` | `getMovieShowtimes(id, params)` | `PageOfShowtime` theo ngày & rạp | Public |
| **Movie** | `GET /movie/{id}/review` | `getMovieReviews(id, params)` | `PageOfReview` | Public |
| **Cinema** | `GET /cinema` | `getCinemas(params)` | `PageOfCinema` (lọc city, q) | Public |
| **Cinema** | `GET /cinema/{id}` | `getCinemaDetail(id)` | `CinemaDetail` | Public |
| **Cinema** | `GET /cinema/{id}/showtime`| `getCinemaShowtimes(id, params)`| `PageOfShowtime` theo phim & ngày | Public |
| **Showtime** | `GET /showtime/{id}/seat` | `getSeatMap(id)` | `SeatMap` (ma trận ghế, trạng thái đã đặt) | Bearer Token |
| **Product** | `GET /product` | `getProducts(cinemaId, params)` | `PageOfProduct` (Bắp nước theo rạp) | Public |
| **Booking** | `POST /booking` | `createBooking(payload, key)` | `Booking` (Giữ chỗ tối đa 8 ghế trong 10p) | Bearer Token + Idempotency-Key |
| **Booking** | `GET /booking/{id}` | `getBookingDetail(id)` | `Booking` chi tiết | Bearer Token |
| **Booking** | `PUT /booking/{id}/fnb` | `updateBookingFnb(id, payload)` | `Booking` sau cập nhật bắp nước | Bearer Token |
| **Booking** | `PUT /booking/{id}/voucher` | `updateBookingVoucher(id, payload)` | `Booking` sau áp dụng voucher | Bearer Token |
| **Booking** | `DELETE /booking/{id}/voucher`| `removeVoucher(id)` | `Booking` sau gỡ voucher | Bearer Token |
| **Booking** | `POST /booking/{id}/cancel` | `cancelBooking(id, payload, key)` | `Booking` trạng thái `CANCELLED` | Bearer Token + Idempotency-Key |
| **Booking** | `POST /booking/{id}/payment`| `createPayment(id, payload, key)` | `Payment` (Trạng thái thanh toán) | Bearer Token + Idempotency-Key |
| **Booking** | `GET /booking/{id}/payment` | `getBookingPayments(id)` | `Payment[]` | Bearer Token |
| **Booking** | `GET /booking/{id}/invoice` | `getBookingInvoice(id)` | `Invoice` (Chỉ có sau khi PAID) | Bearer Token |
| **Booking** | `POST /booking/{id}/refund` | `requestRefund(id, payload, key)`| `Refund` (Hoàn 100% vào Ví Beta) | Bearer Token + Idempotency-Key |
| **Booking** | `POST /booking/{id}/review` | `upsertReview(id, payload, key)` | `Review` (Đánh giá sau khi hết giờ chiếu)| Bearer Token + Idempotency-Key |
| **Ticket** | `GET /ticket/{id}` | `getTicketDetail(id)` | `Ticket` (Thông tin vé điện tử & QR) | Bearer Token |
| **Wallet** | `GET /wallet` | `getWallet()` | `Wallet` (Số dư ví VND) | Bearer Token |
| **Wallet** | `GET /wallet/transaction` | `getWalletTransactions(params)`| `PageOfWalletTransaction` | Bearer Token |
| **Wallet** | `POST /wallet/top-up` | `topUpWallet(payload, key)` | `WalletTransaction` nạp tiền | Bearer Token + Idempotency-Key |

---

## PHẦN 4: ĐỐI CHIẾU & CHUẨN HÓA VỚI CƠ SỞ DỮ LIỆU POSTGRESQL

Cơ sở dữ liệu PostgreSQL của hệ thống gồm **31 bảng quan hệ** (mô tả trong `Cinema_PostgreSQL_Reference`). Frontend đã được lập trình phòng vệ để tương thích chuẩn xác với cấu trúc bảng:

### 1. Quy Chuẩn Tiền Tệ (`BIGINT` VND)
- **Cơ sở dữ liệu:** Lưu trữ số nguyên lớn `BIGINT` đơn vị Đồng (VND) ở các cột `balance`, `amount`, `unit_price`, `subtotal`, `discount_amount`, `total_amount`, `min_order_amount`.
- **Frontend:** Định dạng an toàn qua helper:
  ```javascript
  const formattedVnd = (amount || 0).toLocaleString('vi-VN') + ' đ';
  ```
  Tuyệt đối không sử dụng số thập phân hoặc đơn vị tiền tệ ngoại tệ.

### 2. Quy Chuẩn Thời Gian & Múi Giờ
- **Cơ sở dữ liệu:** Cột `starts_at`, `ends_at`, `created_at`, `paid_at`, `cancelled_at` lưu dạng `TIMESTAMP WITH TIME ZONE` (UTC hoặc RFC 3339).
- **Frontend:** Tự động parse qua `new Date(isoString)` và hiển thị theo giờ Việt Nam (`toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })`).

### 3. Vòng Đời Trạng Thái Đơn Hàng & Vé Đã Hủy
- **Các trạng thái đơn (`status`):**
  - `PENDING_PAYMENT`: Đơn giữ chỗ (có thời hạn 10 phút đếm ngược tại `expires_at`).
  - `PAID`: Đơn đã thanh toán thành công, vé điện tử chuyển sang `VALID`.
  - `CANCELLED`: Đơn chưa thanh toán được khách hàng chủ động hủy hoặc hết hạn. Cơ sở dữ liệu ghi nhận `cancelled_at` và `cancellation_reason`. Tab **"Vé đã hủy"** tại màn hình `UserBookingsScreen` lọc chính xác đơn có `status === 'CANCELLED'`.
  - `REFUNDED`: Đơn đã hoàn tiền thành công, vé chuyển sang trạng thái `VOID`.

### 4. Quy Tắc Hoàn Tiền 120 Phút
- **Ràng buộc nghiệp vụ:** Vé chỉ đủ điều kiện hoàn tiền (`canRefund === true`) khi thời điểm hiện tại cách giờ chiếu phim ít nhất 120 phút (`new Date(showtime.startsAt).getTime() - Date.now() >= 120 * 60 * 1000`).
- Nút "Yêu cầu hoàn tiền" trong `UserBookingsScreen` và `TicketDetailScreen` tự động tính toán điều kiện này, nếu không đủ 120 phút sẽ tự động khóa hoặc thông báo lý do rõ ràng.

### 5. Safe Array Unwrapping (Ngăn Chặn Crash Giao Diện)
Khi Backend trả về định dạng phân trang chuẩn OpenAPI `{ items: [...], meta: {...} }` hoặc mảng thuần `[...]`, mọi màn hình Frontend đều unwrap theo quy tắc:
```javascript
const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
```
Điều này đảm bảo hàm `.map()`, `.forEach()`, `.filter()`, `.reduce()` **không bao giờ gặp lỗi `TypeError: .map is not a function`**.

---

## PHẦN 5: DANH MỤC FILE ĐÃ CLEAN UP VÀ CHUẨN HÓA

### 1. Xóa Bỏ Các Component Thừa Chứa Data Test Cũ (Dead Code)
Các component đời đầu chứa mảng mock dữ liệu cứng đã được loại bỏ hoàn toàn khỏi mã nguồn:
1. `src/components/MovieList.jsx` (Đã thay thế hoàn toàn bằng màn hình `MoviesScreen.jsx`).
2. `src/components/SeatBookingModal.jsx` (Đã thay thế bằng `SeatSelectionScreen.jsx` và `BookingCheckoutScreen.jsx`).
3. `src/components/FnbSection.jsx` (Đã tích hợp trực tiếp vào quy trình thanh toán `BookingCheckoutScreen.jsx`).
4. `src/components/CinemaShowtimes.jsx` (Đã chuyển đổi thành `CinemasScreen.jsx` và `CinemaDetailScreen.jsx`).
5. `src/components/MovieDetailsModal.jsx` (Đã thay thế bằng màn hình chi tiết `MovieDetailScreen.jsx`).
6. Thư mục rác `${documentDir}` phát sinh do lỗi macro của trình soạn thảo.

### 2. Chuẩn Hóa Các Component Còn Lại
- `src/components/HeroSlider.jsx`: Chuyển đổi sang hiển thị động danh sách phim từ prop `movies`. Khi bật chế độ `IS_REAL_API_MODE`, nếu chưa có phim trong database sẽ ẩn slider hoặc hiển thị banner tối giản, không bao giờ lấy phim giả trong `HERO_MOVIES`.
- `src/components/AovisFeatureBoxes.jsx`: Khởi tạo state rỗng `[]`, nạp động danh sách top phim từ `cinemaService.getHome()`. Nếu không có phim, tự động ẩn giao diện thay vì hiển thị dữ liệu test.
- `src/components/Header.jsx`: Xóa bỏ số dư ví giả định `550.000đ` và số lượng đơn giả `2` / voucher `3`. Khởi tạo `0` và nạp số liệu thực từ API.
- `src/components/AuthModal.jsx` & `src/screens/AuthScreens.jsx`: Xóa tài khoản test cứng `minh.nguyen@betacinema.vn` và mật khẩu `password123`, để trống cho người dùng nhập tài khoản thật từ database.
- `src/App.jsx`: Điều hướng chuẩn xác `/cinema` vào `CinemasScreen` (Danh sách rạp toàn quốc) và `/cinema/:id` vào `CinemaDetailScreen` (Chi tiết lịch chiếu từng rạp).

---

## PHẦN 6: HƯỚNG DẪN CẤU HÌNH & CHUYỂN ĐỔI MÔI TRƯỜNG

### 1. Chạy Chế Độ Offline Mock (Demo / Phát Triển Frontend Nhanh)
Không cần cài đặt hay khởi động Tomcat Servlet hay Database. Trong file `.env`:
```env
VITE_USE_MOCK=true
```
Chạy lệnh:
```bash
npm run dev
```

### 2. Chạy Chế Độ Kết Nối Backend Thật (Java Servlet + Neon PostgreSQL)
1. Khởi động Backend Java Servlet (`Cinema_api`) trên Tomcat hoặc máy chủ Java (Port 8080).
2. Cấu hình file `.env` tại Frontend (`d:\Projects\web_final\.env`):
```env
# Địa chỉ context path của backend Java Servlet
VITE_API_BASE_URL=http://localhost:8080/Cinema_war_exploded/api/v1

# Tắt mock engine để 100% dữ liệu đi qua HTTP Fetch tới Servlet và PostgreSQL
VITE_USE_MOCK=false
```
3. Kiểm tra đóng gói bundle:
```bash
npm run build
```
4. Khởi chạy ứng dụng:
```bash
npm run dev
```

### 3. Đảm Bảo An Toàn Bảo Mật Khi Push Git
File `.gitignore` đã được cấu hình chặt chẽ để bảo vệ secrets:
- Bỏ qua `.env`, `.env.local`, `.env.*.local`.
- Bỏ qua các file tạm của Microsoft Office (`~$*`, `*.tmp`).
- Duy trì bản mẫu `.env.example` an toàn để đồng đội clone về sử dụng.
