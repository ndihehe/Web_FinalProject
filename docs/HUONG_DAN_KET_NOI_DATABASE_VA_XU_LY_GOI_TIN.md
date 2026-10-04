# HƯỚNG DẪN CẤU HÌNH KẾT NỐI DATABASE THẬT & CƠ CHẾ XỬ LÝ GÓI TIN (NETWORK PACKET FLOW)

> **Dành cho:** Developer, Tester, Giảng viên chấm đồ án, Quản trị hệ thống  
> **Dự án:** Beta Cinema Single Page Application (Frontend React 19 + Java Servlet Backend + PostgreSQL Neon Cloud)  
> **Tài liệu tham chiếu:** `swagger_cinema.yaml` (OpenAPI 3.0.3), `Cinema_PostgreSQL_Reference` (31 bảng CSDL)

---

## MỤC LỤC
1. [Phần 1: Hướng Dẫn Đổi Cấu Hình Kết Nối Database Thật](#phần-1-hướng-dẫn-đổi-cấu-hình-kết-nối-database-thật)
   - [1.1. Thông số Cơ sở dữ liệu thật (PostgreSQL Neon Cloud)](#11-thông-số-cơ-sở-dữ-liệu-thật-postgresql-neon-cloud)
   - [1.2. Cấu hình phía Backend (Java Servlet MVC)](#12-cấu-hình-phía-backend-java-servlet-mvc)
   - [1.3. Cấu hình phía Frontend (React SPA)](#13-cấu-hình-phía-frontend-react-spa)
   - [1.4. Quy trình khởi chạy kết nối dữ liệu thật từ A-Z](#14-quy-trình-khởi-chạy-kết-nối-dữ-liệu-thật-từ-a-z)
2. [Phần 2: Cơ Chế Bắt & Tạo Gói Tin HTTP Request (Request Construction)](#phần-2-cơ-chế-bắt--tạo-gói-tin-http-request-request-construction)
   - [2.1. Cấu trúc một gói tin Request chuẩn](#21-cấu-trúc-một-gói-tin-request-chuẩn)
   - [2.2. Bộ lọc Adapter `apiFetch` tự động đóng gói](#22-bộ-lọc-adapter-apifetch-tự-động-đóng-gói)
   - [2.3. Cơ chế tự động đính kèm JWT Bearer Token & Idempotency-Key](#23-cơ-chế-tự-động-đính-kèm-jwt-bearer-token--idempotency-key)
3. [Phần 3: Cơ Chế Phân Tích Gói Tin Phản Hồi & Trả Lên Màn Hình (Response Parsing & Rendering)](#phần-3-cơ-chế-phân-tích-gói-tin-phản-hồi--trả-lên-màn-hình-response-parsing--rendering)
   - [3.1. Cấu trúc gói tin Response từ Backend](#31-cấu-trúc-gói-tin-response-từ-backend)
   - [3.2. Cơ chế "Safe Unwrapping" chống văng lỗi màn hình (.map is not a function)](#32-cơ-chế-safe-unwrapping-chống-văng-lỗi-màn-hình-map-is-not-a-function)
   - [3.3. Chuẩn hóa hiển thị dữ liệu thật (Tiền VND, Múi giờ, Badge)](#33-chuẩn-hóa-hiển-thị-dữ-liệu-thật-tiền-vnd-múi-giờ-badge)
   - [3.4. Sơ đồ tuần tự trọn vẹn của một luồng gói tin (Sequence Diagram)](#34-sơ-đồ-tuần-tự-trọn-vẹn-của-một-luồng-gói-tin-sequence-diagram)
4. [Phần 4: Hướng Dẫn Từng Bước Tự Tạo Một Gói Tin Mới (Developer Practical Guide)](#phần-4-hướng-dẫn-từng-bước-tự-tạo-một-gói-tin-mới-developer-practical-guide)
   - [4.1. Ví dụ 1: Tạo gói tin GET có bộ lọc và phân trang](#41-ví-dụ-1-tạo-gói-tin-get-có-bộ-lọc-và-phân-trang)
   - [4.2. Ví dụ 2: Tạo gói tin POST gửi dữ liệu JSON (Đặt vé, Thanh toán)](#42-ví-dụ-2-tạo-gói-tin-post-gửi-dữ-liệu-json-đặt-vé-thanh-toán)
   - [4.3. Ví dụ 3: Xử lý các gói tin lỗi nghiệp vụ (400, 401, 409, 422)](#43-ví-dụ-3-xử-lý-các-gói-tin-lỗi-nghiệp-vụ-400-401-409-422)

---

## PHẦN 1: HƯỚNG DẪN ĐỔI CẤU HÌNH KẾT NỐI DATABASE THẬT

Hệ thống được thiết kế theo kiến trúc **Dual-Mode Adapter Layer**, cho phép chuyển đổi tức thì giữa chế độ chạy Mock dữ liệu giả lập (phục vụ test UI offline) và chế độ **Real API kết nối 100% Cơ sở dữ liệu thật**.

### 1.1. Thông số Cơ sở dữ liệu thật (PostgreSQL Neon Cloud)
Dự án sử dụng cơ sở dữ liệu PostgreSQL Serverless lưu trữ trên nền tảng AWS Cloud (Singapore `ap-southeast-1`):

```properties
# URL kết nối JDBC PostgreSQL
DB_URL=jdbc:postgresql://ep-solitary-sky-b34q0u44-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?user=neondb_owner&password=npg_Lf1dXoHc8tyM&sslmode=require&channelBinding=require

# Tài khoản quản trị CSDL
DB_USERNAME=neondb_owner

# Mật khẩu kết nối CSDL
DB_PASSWORD=npg_Lf1dXoHc8tyM

# Chuỗi bí mật ký xác thực JWT Access Token (tối thiểu 256-bit HMAC-SHA256)
JWT_SECRET=cinema-super-secret-key-for-jwt-signing-must-be-at-least-256-bits-long-2024
```

---

### 1.2. Cấu hình phía Backend (Java Servlet MVC)
Thư mục Backend nằm tại: `d:\Projects\web_final\Cinema_api`.

1. **Kiểm tra file cấu hình môi trường Backend:**
   Mở file `Cinema_api/.env` (hoặc cấu hình trong file `db.properties` / `HikariCP` DataSource):
   ```env
   DB_URL=jdbc:postgresql://ep-solitary-sky-b34q0u44-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?user=neondb_owner&password=npg_Lf1dXoHc8tyM&sslmode=require&channelBinding=require
   DB_USERNAME=neondb_owner
   DB_PASSWORD=npg_Lf1dXoHc8tyM
   JWT_SECRET=cinema-super-secret-key-for-jwt-signing-must-be-at-least-256-bits-long-2024
   ```
2. **Biên dịch và triển khai Backend:**
   Chạy lệnh Maven trong thư mục `Cinema_api`:
   ```bash
   cd Cinema_api
   mvn clean package
   ```
   Deploy file `.war` lên Apache Tomcat (phiên bản Tomcat 10+ hỗ trợ Jakarta EE). Ứng dụng Backend sẽ chạy tại URL:  
   `http://localhost:8080/Cinema_war_exploded` hoặc `http://localhost:8080/api/v1`.

---

### 1.3. Cấu hình phía Frontend (React SPA)
Thư mục Frontend nằm tại: `d:\Projects\web_final`.

Để ngắt hoàn toàn dữ liệu test mock và **chuyển sang ăn dữ liệu thật từ Backend & Database**, bạn chỉ cần chỉnh sửa file **`.env`** tại thư mục gốc của Frontend:

```env
# 1. ĐỊA CHỈ GỐC CỦA MÁY CHỦ API BACKEND (Java Servlet)
VITE_API_BASE_URL=http://localhost:8080/Cinema_war_exploded/api/v1

# 2. CỜ BẬT / TẮT MOCK DATA (BẮT BUỘC ĐỔI THÀNH false ĐỂ DÙNG DỮ LIỆU THẬT)
VITE_USE_MOCK=false
```

> [!IMPORTANT]
> **Giải thích cơ chế kích hoạt tự động:**
> Trong file `src/services/cinemaService.js`, biến `IS_REAL_API_MODE` được tính toán:
> ```javascript
> export const IS_REAL_API_MODE = import.meta.env.VITE_USE_MOCK === 'false' && Boolean(import.meta.env.VITE_API_BASE_URL);
> ```
> Khi `VITE_USE_MOCK=false`, toàn bộ 34+ phương thức của `cinemaService` **lập tức chuyển sang gọi HTTP `fetch()` thật**, không chạm vào bất kỳ mảng dữ liệu test hay localStorage mock nào!

---

### 1.4. Quy trình khởi chạy kết nối dữ liệu thật từ A-Z

```mermaid
flowchart LR
    A["PostgreSQL Neon Cloud\n(ep-solitary-sky-b34q0u44)"] -->|JDBC SSL| B["Java Servlet API\n(Port 8080)"]
    B -->|HTTP JSON RESTful| C["Frontend React 19\n(Vite Dev Port 5173)"]
    C -->|Browser User| D["Giao diện Người Dùng\n(Hiển thị 100% dữ liệu thật)"]
```

1. **Bước 1:** Khởi động máy chủ Tomcat chứa dự án `Cinema_api`. Đảm bảo endpoint `http://localhost:8080/Cinema_war_exploded/api/v1/movie` trả về danh sách phim từ database thật.
2. **Bước 2:** Mở file `d:\Projects\web_final\.env` và đặt:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/Cinema_war_exploded/api/v1
   VITE_USE_MOCK=false
   ```
3. **Bước 3:** Chạy lệnh build kiểm tra:
   ```bash
   npm run build
   ```
4. **Bước 4:** Khởi chạy server phát triển Frontend:
   ```bash
   npm run dev
   ```
5. **Bước 5:** Mở trình duyệt tại `http://localhost:5173`. Giao diện lúc này nạp 100% dữ liệu thực từ PostgreSQL, hoàn toàn sạch bóng datatest giả lập!

---

## PHẦN 2: CƠ CHẾ BẮT & TẠO GÓI TIN HTTP REQUEST (REQUEST CONSTRUCTION)

### 2.1. Cấu trúc một gói tin Request chuẩn
Một gói tin HTTP Request gửi từ Frontend lên Backend gồm 3 phần chính:

```http
POST /Cinema_war_exploded/api/v1/booking HTTP/1.1
Host: localhost:8080
Accept: application/json
Content-Type: application/json;charset=UTF-8
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Idempotency-Key: req-booking-1728032000-a1b2c3d4

{
  "showtimeId": "st-101",
  "seatIds": ["s-E05", "s-E06"]
}
```

1. **Request Line:** Phương thức (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) + Endpoint URL + Giao thức (`HTTP/1.1`).
2. **Request Headers:**
   - `Accept: application/json`: Báo cho server biết client mong muốn nhận dữ liệu định dạng JSON.
   - `Content-Type: application/json;charset=UTF-8`: Báo cho server biết body gửi lên là chuỗi JSON mã hóa ký tự Tiếng Việt UTF-8.
   - `Authorization: Bearer <token>`: Chứng chỉ bảo mật JWT đã được cấp khi đăng nhập.
   - `Idempotency-Key`: Khóa chống trùng lặp giao dịch (rất quan trọng với thanh toán, hoàn tiền, giữ vé).
3. **Request Body:** Chuỗi JSON chứa dữ liệu gửi lên.

---

### 2.2. Bộ lọc Adapter `apiFetch` tự động đóng gói
Tại file [**`src/services/cinemaService.js`**](file:///d:/Projects/web_final/src/services/cinemaService.js), hàm `apiFetch` là trái tim trung tâm nhận nhiệm vụ "bắt các tham số nghiệp vụ và đóng gói thành gói tin HTTP Request":

```javascript
async function apiFetch(endpoint, { method = 'GET', body = null, params = null, headers = {} } = {}) {
  // 1. GHÉP NỐI URL VỚI BASE URL
  let url = API_BASE_URL + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);

  // 2. TỰ ĐỘNG CHUYỂN ĐỔI QUERY PARAMS VÀO URL (DÀNH CHO GET)
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

  // 3. THIẾT LẬP CÁC HEADER MẶC ĐỊNH
  const reqHeaders = {
    'Accept': 'application/json',
    ...headers
  };

  // 4. GẮN CONTENT-TYPE NẾU CÓ BODY
  if (body && !(body instanceof FormData)) {
    reqHeaders['Content-Type'] = 'application/json;charset=UTF-8';
  }

  // 5. TỰ ĐỘNG BẮT TOKEN TỪ LOCALSTORAGE VÀ ĐÍNH KÈM VÀO HEADER AUTHORIZATION
  const token = localStorage.getItem('access_token') || localStorage.getItem('cinema_auth_token');
  if (token) {
    reqHeaders['Authorization'] = 'Bearer ' + token;
  }

  // 6. THỰC HIỆN BẮN GÓI TIN ĐI QUA TRÌNH DUYỆT (NATIVE FETCH)
  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined
  });

  // ... (xử lý response ở phần 3)
}
```

---

### 2.3. Cơ chế tự động đính kèm JWT Bearer Token & Idempotency-Key
- **JWT Token Flow:**
  1. Khi người dùng đăng nhập (`POST /auth/login`), server trả về gói tin chứa `accessToken` và `refreshToken`.
  2. `cinemaService.login()` tự động lưu:
     ```javascript
     localStorage.setItem('access_token', res.data.accessToken);
     localStorage.setItem('refresh_token', res.data.refreshToken);
     ```
  3. Mọi gói tin sau đó (đặt vé, xem ví, đổi mật khẩu) được `apiFetch` tự động chèn header:  
     `Authorization: Bearer <accessToken>`.
  4. Khi đăng xuất (`POST /auth/logout`), token bị xóa sạch khỏi `localStorage`.

- **Idempotency-Key Flow (Chống đặt vé 2 lần khi lag mạng):**
  Trong các hành động thanh toán, giữ ghế hoặc hoàn tiền, Frontend tự sinh khóa:
  ```javascript
  const idempotencyKey = 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  await cinemaService.createBooking({ showtimeId, seatIds }, idempotencyKey);
  ```
  Header gửi đi: `Idempotency-Key: req-1728032000-xyz123`. Nếu người dùng ấn nút 2 lần liên tiếp do mạng lag, server nhận biết cùng 1 Key và chỉ trừ tiền/tạo đơn đúng 1 lần duy nhất!

---

## PHẦN 3: CƠ CHẾ PHÂN TÍCH GÓI TIN PHẢN HỒI & TRẢ LÊN MÀN HÌNH (RESPONSE PARSING & RENDERING)

### 3.1. Cấu trúc gói tin Response từ Backend
Theo chuẩn đặc tả **`swagger_cinema.yaml`**, Backend Servlet trả về gói tin định dạng Envelope:

#### Gói tin Thành công (Success 200/201):
```json
{
  "success": true,
  "message": "Tạo đơn giữ chỗ thành công",
  "data": {
    "id": "bk-20241004-890123",
    "status": "PENDING_PAYMENT",
    "totalAmount": 220000,
    "expiresAt": "2024-10-04T15:55:00Z",
    "seats": [
      { "seatId": "s-E05", "label": "E05", "type": "VIP", "unitPrice": 110000 }
    ]
  },
  "traceId": "req-9x8a7b"
}
```

#### Gói tin Phân trang (Paged List 200):
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "mov-01", "title": "The Witcher", "durationMinutes": 148 }
    ],
    "meta": {
      "page": 0,
      "size": 20,
      "totalElements": 1,
      "totalPages": 1
    }
  }
}
```

#### Gói tin Thất bại (Error 400/401/409/422):
```json
{
  "success": false,
  "status": 409,
  "error": "Một hoặc nhiều ghế đã bị khách hàng khác giữ chỗ",
  "code": "SEATS_ALREADY_RESERVED",
  "fieldErrors": []
}
```

---

### 3.2. Cơ chế "Safe Unwrapping" chống văng lỗi màn hình (`.map is not a function`)

Một lỗi cực kỳ phổ biến khi nối API thật:
> Backend trả về `{ success: true, data: { items: [...], meta: {...} } }`.  
> Nếu màn hình React viết `const list = res.data; list.map(...)` thì sẽ bị crash ngay lập tức vì `res.data` là một Object (không phải Array) $\rightarrow$ **`TypeError: list.map is not a function`**!

Để bảo vệ web tuyệt đối không bị fail, hệ thống trang bị **2 lớp phòng vệ**:

#### Lớp phòng vệ 1: Trực tiếp trong `apiFetch` (Proxy Wrapper)
```javascript
// Nếu data là phân trang { items: [...], meta: {...} }
if (json && json.success !== undefined) {
  if (json.data && Array.isArray(json.data.items)) {
    // Biến data thành một mảng nhưng vẫn giữ nguyên thuộc tính .items và .meta
    const arrProxy = [...json.data.items];
    arrProxy.items = json.data.items;
    arrProxy.meta = json.data.meta;
    return {
      ...json,
      data: arrProxy
    };
  }
  return json;
}
```

#### Lớp phòng vệ 2: Tại tất cả các Screen Component
Mọi Screen (như `MoviesScreen.jsx`, `CinemasScreen.jsx`, `UserBookingsScreen.jsx`, `CinemaDetailScreen.jsx`) đều áp dụng toán tử bọc an toàn:
```javascript
// Cho dù backend trả về mảng trực tiếp [...] hay bọc trong { items: [...] } thì list luôn là Array!
const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
setMovies(list);
```
Nhờ cơ chế này, `list.map()`, `list.filter()`, `list.reduce()` **chạy an toàn 100% không bao giờ crash màn hình**.

---

### 3.3. Chuẩn hóa hiển thị dữ liệu thật (Tiền VND, Múi giờ, Badge)

| Kiểu dữ liệu từ Database PostgreSQL | Giá trị thô trong Gói tin | Cách Frontend phân tích & hiển thị lên màn hình |
| :--- | :--- | :--- |
| **Tiền tệ (BIGINT)** | `totalAmount: 220000` | `(amount || 0).toLocaleString('vi-VN') + ' đ'` $\rightarrow$ **`220.000 đ`** |
| **Thời gian (TIMESTAMP)** | `startsAt: "2024-10-04T10:30:00Z"` | `new Date(st.startsAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })` $\rightarrow$ **`17:30`** |
| **Ngày chiếu (DATE)** | `releaseDate: "2024-05-15"` | `new Date(d).toLocaleDateString('vi-VN')` $\rightarrow$ **`15/05/2024`** |
| **Trạng thái đơn (VARCHAR)** | `status: "CANCELLED"` | Ánh xạ Badge màu xám viền đỏ: `<span>ĐÃ HỦY</span>` |
| **Mã định danh ID** | `id: "mov-01"` hoặc `movieId: 1` | `key={movie.id \|\| movie.movieId}` (hỗ trợ cả 2 dạng) |
| **Ảnh áp phích (TEXT)** | `posterUrl: null` | `movie.posterUrl \|\| '/images/aovis/movie1.jpg'` (tránh ảnh vỡ) |

---

### 3.4. Sơ đồ tuần tự trọn vẹn của một luồng gói tin (Sequence Diagram)

Dưới đây là sơ đồ minh họa quy trình từ khi người dùng ấn nút trên màn hình đến khi gói tin được tạo, gửi, truy vấn CSDL và vẽ lại màn hình:

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng (Browser)
    participant UI as React Screen (VD: CinemaDetailScreen)
    participant Service as cinemaService (apiFetch)
    participant Backend as Java Servlet Controller
    participant DB as PostgreSQL Neon Cloud

    User->>UI: Mở trang Chi tiết rạp (/cinema/cin-01)
    UI->>UI: Hiển thị trạng thái Loading (spinner)
    UI->>Service: getCinemaShowtimes('cin-01')
    Service->>Service: Kiểm tra IS_REAL_API_MODE (true)
    Service->>Service: Tạo gói tin HTTP GET /cinema/cin-01/showtime
    Service->>Backend: Gửi Request qua mạng (HTTP Fetch)
    Backend->>Backend: Xác thực Headers & Phân tích tham số cin-01
    Backend->>DB: SQL: SELECT * FROM screenings WHERE cinema_id = ? AND starts_at > NOW()
    DB-->>Backend: Trả về kết quả các dòng bản ghi
    Backend-->>Service: Trả về HTTP 200 OK + Gói tin JSON { success: true, data: { items: [...] } }
    Service->>Service: Unpack Envelope & Tạo Safe Array Proxy
    Service-->>UI: Trả về { success: true, data: [...] }
    UI->>UI: Gom nhóm theo Phim (showtimesByMovie) & tắt Loading
    UI-->>User: Render các khung giờ chiếu thật sắc nét lên giao diện!
```

---

## PHẦN 4: HƯỚNG DẪN TỪNG BƯỚC TỰ TẠO MỘT GÓI TIN MỚI (DEVELOPER PRACTICAL GUIDE)

Khi bạn muốn thêm một tính năng mới (ví dụ: Lấy danh sách thông báo của người dùng), hãy làm theo 3 bước chuẩn hóa sau:

### 4.1. Ví dụ 1: Tạo gói tin GET có bộ lọc và phân trang

#### Bước 1: Khai báo hàm trong [`src/services/cinemaService.js`](file:///d:/Projects/web_final/src/services/cinemaService.js)
```javascript
  // GET /user/notifications
  async getUserNotifications({ unreadOnly = false, page = 0, size = 10 } = {}) {
    // 1. NẾU ĐANG CHẠY REAL API MODE -> GỬI GÓI TIN THẬT
    if (IS_REAL_API_MODE) {
      return apiFetch('/user/notifications', {
        method: 'GET',
        params: { unreadOnly, page, size }
      });
    }

    // 2. NẾU CHẠY MOCK OFFLINE -> DÙNG DỮ LIỆU GIẢ ĐỊNH
    await delay();
    const state = getState();
    const list = state.notifications || [];
    return successResponse(list, { page, size, totalElements: list.length, totalPages: 1 });
  },
```

#### Bước 2: Gọi trong React Component để phân tích và render lên màn hình
```jsx
import React, { useState, useEffect } from 'react';
import { cinemaService } from '../services/cinemaService';

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      setErrorMsg('');
      try {
        // Gửi gói tin
        const res = await cinemaService.getUserNotifications({ unreadOnly: false, page: 0, size: 20 });
        
        // Bắt và unwrap an toàn danh sách
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
        setNotifications(list);
      } catch (err) {
        console.error('Lỗi khi tải thông báo:', err);
        setErrorMsg(err.message || 'Không thể tải thông báo');
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  if (loading) return <div className="spinner">Đang tải thông báo...</div>;
  if (errorMsg) return <div className="alert-error">{errorMsg}</div>;
  if (notifications.length === 0) return <div>Bạn chưa có thông báo nào.</div>;

  return (
    <ul className="notification-list">
      {notifications.map((item) => (
        <li key={item.id} className={item.isRead ? 'read' : 'unread'}>
          <h4>{item.title}</h4>
          <p>{item.content}</p>
          <small>{new Date(item.createdAt).toLocaleString('vi-VN')}</small>
        </li>
      ))}
    </ul>
  );
}
```

---

### 4.2. Ví dụ 2: Tạo gói tin POST gửi dữ liệu JSON (Đặt vé, Thanh toán)

#### Bước 1: Khai báo hàm trong [`src/services/cinemaService.js`](file:///d:/Projects/web_final/src/services/cinemaService.js)
```javascript
  // POST /wallet/transfer (Chuyển tiền ví cho bạn bè)
  async transferWalletBalance({ receiverPhone, amount, note }, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      // Đính kèm Header Idempotency-Key chống trùng lặp nếu có
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      
      return apiFetch('/wallet/transfer', {
        method: 'POST',
        headers,
        body: { receiverPhone, amount, note } // Tự động thành JSON UTF-8
      });
    }

    // Mock fallback...
    await delay();
    return successResponse({ success: true, transferredAmount: amount });
  },
```

#### Bước 2: Bắt sự kiện bấm nút Submit trong Form React
```jsx
const handleTransferSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setErrorMsg('');

  // 1. Sinh Idempotency Key duy nhất cho lần bấm này
  const key = 'transfer-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);

  try {
    // 2. Gửi gói tin POST
    const res = await cinemaService.transferWalletBalance({
      receiverPhone: '0987654321',
      amount: 100000,
      note: 'Tặng vé xem phim cuối tuần'
    }, key);

    // 3. Phân tích kết quả trả về từ server
    alert(`Chuyển thành công ${(res.data.transferredAmount).toLocaleString('vi-VN')} đ!`);
    onCloseModal();
  } catch (err) {
    // 4. Bắt gói tin lỗi (Số dư không đủ, Người nhận không tồn tại...)
    setErrorMsg(err.message || 'Giao dịch chuyển tiền thất bại');
  } finally {
    setSubmitting(false);
  }
};
```

---

### 4.3. Ví dụ 3: Xử lý các gói tin lỗi nghiệp vụ (400, 401, 409, 422)

Khi kết nối với API và Database thật, server sẽ phản hồi các mã lỗi HTTP chuẩn mực:

```javascript
try {
  await cinemaService.createBooking({ showtimeId, seatIds });
} catch (err) {
  // Lấy mã lỗi từ gói tin Error Response của backend
  const apiErr = err.apiError || {};
  const status = apiErr.status;
  const errorCode = apiErr.code;

  switch (status) {
    case 401:
      // Phiên đăng nhập hết hạn -> Mở modal đăng nhập lại
      openAuthModal('login');
      break;

    case 409:
      // Xung đột trạng thái / Ghế đã bị người khác đặt
      if (errorCode === 'SEATS_ALREADY_RESERVED') {
        alert('Ghế bạn vừa chọn đã có người khác giữ. Vui lòng chọn ghế khác!');
      } else {
        alert(err.message || 'Xung đột dữ liệu, vui lòng thử lại');
      }
      // Tải lại sơ đồ ghế mới nhất
      refreshSeatMap();
      break;

    case 410:
      // Đơn hàng đã hết hạn giữ chỗ 10 phút
      alert('Thời gian giữ vé 10 phút đã kết thúc. Vui lòng tiến hành đặt lại!');
      navigate('/movie');
      break;

    case 422:
      // Lỗi nghiệp vụ (Số dư ví không đủ, suất chiếu đã bắt đầu...)
      alert(err.message || 'Yêu cầu không thể thực hiện do vi phạm quy tắc rạp');
      break;

    case 500:
    default:
      alert('Máy chủ đang bận xử lý hoặc kết nối CSDL gián đoạn. Vui lòng thử lại sau ít phút.');
      break;
  }
}
```

---

## TỔNG KẾT
1. **Muốn dùng database thật:** Chỉ cần đặt `VITE_USE_MOCK=false` và `VITE_API_BASE_URL=...` trong file [**`.env`**](file:///d:/Projects/web_final/.env).
2. **Cách bắt và gửi gói tin:** Được tự động hóa 100% qua [**`apiFetch()`**](file:///d:/Projects/web_final/src/services/cinemaService.js), tự động chèn JWT token, Idempotency-Key và JSON UTF-8 headers.
3. **Cách phân tích và trả lên màn hình:** Áp dụng cơ chế **Safe Array Unwrapping** `Array.isArray(res?.data) ? res.data : (res?.data?.items || [])` kết hợp định dạng tiền tệ `toLocaleString('vi-VN') + ' đ'` và múi giờ Việt Nam, đảm bảo giao diện hiển thị mượt mà, chân thực và không bao giờ bị crash.
