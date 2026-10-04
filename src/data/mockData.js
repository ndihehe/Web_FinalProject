// Mock Data harmonized with Cinema PostgreSQL Reference & cinemaService.js
// Tuân thủ quy chuẩn mã ID: mov-01..10, cin-01..05, st-101..104, prod-01..03, usr-001

export const HERO_MOVIES = [
  {
    id: "mov-01",
    numericId: 1,
    title: "The Witcher Season 2",
    genre: "Action Movie",
    director: "Aleesha Rose",
    country: "Ireland",
    year: "2024",
    inTheaterMonth: "March 2024",
    rating: "8.9",
    duration: "148 phút",
    ageRating: "T18",
    description: "Geralt xứ Rivia, một thợ săn quái vật bị đột biến, tiếp tục hành trình định mệnh qua một thế giới hỗn loạn nơi con người thường độc ác hơn cả dã thú.",
    backdropUrl: "/images/aovis/witcher_banner.jpg",
    posterUrl: "/images/aovis/movie1.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=TJFVV2L8GKs",
    basePrice: 110000
  },
  {
    id: "mov-02",
    numericId: 2,
    title: "Love Nightmare",
    genre: "Adventure Movie",
    director: "Aleesha Rose",
    country: "Ireland",
    year: "2024",
    inTheaterMonth: "March 2024",
    rating: "8.5",
    duration: "115 phút",
    ageRating: "T16",
    description: "Một câu chuyện phiêu lưu kỳ bí đưa người xem lạc vào miền ký ức và những ảo ảnh tình yêu sâu thẳm giữa ranh giới thực tại và giấc mơ.",
    backdropUrl: "/images/aovis/love_nightmare_banner.jpg",
    posterUrl: "/images/aovis/movie2.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=TJFVV2L8GKs",
    basePrice: 100000
  },
  {
    id: "mov-03",
    numericId: 3,
    title: "Behind The Mask",
    genre: "Thriller Movie",
    director: "Kenvin Lord",
    country: "German",
    year: "2024",
    inTheaterMonth: "June 2024",
    rating: "8.7",
    duration: "105 phút",
    ageRating: "T18",
    description: "Sau lớp mặt nạ rùng rợn là những bí ẩn đen tối về một kế hoạch trả thù kinh hoàng làm rung chuyển toàn bộ thành phố khi màn đêm buông xuống.",
    backdropUrl: "/images/aovis/behind_mask_banner.jpg",
    posterUrl: "/images/aovis/movie3.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=TJFVV2L8GKs",
    basePrice: 105000
  }
];

export const ALL_MOVIES = [
  ...HERO_MOVIES,
  {
    id: "mov-04",
    numericId: 4,
    title: "Chuyến Đi Mùa Hè",
    genre: "Comedy & Drama",
    director: "Nguyễn Quang Dũng",
    country: "Việt Nam",
    year: "2024",
    inTheaterMonth: "April 2024",
    rating: "8.2",
    duration: "120 phút",
    ageRating: "T13",
    description: "Hành trình tìm lại cảm xúc tuổi trẻ của nhóm bạn thân trên chiếc xe cũ băng qua những cung đường bờ biển tuyệt đẹp miền Trung.",
    backdropUrl: "/images/aovis/witcher_banner.jpg",
    posterUrl: "/images/aovis/movie4.jpg",
    basePrice: 95000,
    status: "NOW_SHOWING"
  },
  {
    id: "mov-05",
    numericId: 5,
    title: "Dune: Hành Tinh Cát 2",
    genre: "Sci-Fi & Epic",
    director: "Denis Villeneuve",
    country: "USA",
    year: "2024",
    inTheaterMonth: "May 2024",
    rating: "9.1",
    duration: "166 phút",
    ageRating: "T16",
    description: "Paul Atreides hợp lực cùng Chani và tộc người Fremen để trả thù những kẻ đã hủy hoại gia tộc của anh.",
    backdropUrl: "/images/aovis/love_nightmare_banner.jpg",
    posterUrl: "/images/aovis/movie1.jpg",
    basePrice: 120000,
    status: "NOW_SHOWING"
  },
  {
    id: "mov-06",
    numericId: 6,
    title: "Kẻ Trộm Mặt Trăng 4",
    genre: "Animation & Family",
    director: "Chris Renaud",
    country: "USA",
    year: "2024",
    inTheaterMonth: "July 2024",
    rating: "8.0",
    duration: "95 phút",
    ageRating: "P",
    description: "Gru và đại gia đình Minions siêu quậy đối mặt với kẻ thù mới cùng những tình huống dở khóc dở cười.",
    backdropUrl: "/images/aovis/behind_mask_banner.jpg",
    posterUrl: "/images/aovis/movie2.jpg",
    basePrice: 90000,
    status: "COMING_SOON"
  }
];

export const CINEMAS = [
  { id: "cin-01", numericId: 1, name: "Beta Cinema Quang Trung", address: "645 Quang Trung, Phường 11, Quận Gò Vấp, TP.HCM" },
  { id: "cin-02", numericId: 2, name: "Beta Cinema Landmark IMAX", address: "Tầng B1, Vincom Center Landmark 81, Quận Bình Thạnh, TP.HCM" },
  { id: "cin-03", numericId: 3, name: "Beta Cinema Thái Thịnh", address: "Số 35 Thái Thịnh, Phường Ngã Tư Sở, Quận Đống Đa, Hà Nội" },
  { id: "cin-04", numericId: 4, name: "Beta Cinema Nguyễn Tất Thành", address: "Số 456 Nguyễn Tất Thành, Quận Thanh Khê, TP. Đà Nẵng" },
  { id: "cin-05", numericId: 5, name: "Beta Cinema Giải Phóng", address: "Tầng 3, Imperial Plaza, 360 Giải Phóng, Quận Hoàng Mai, Hà Nội" }
];

export const SHOWTIME_SLOTS = [
  { id: "st-101", numericId: 101, time: "10:30", room: "Phòng 1 (Standard)", format: "2D Phụ Đề" },
  { id: "st-102", numericId: 102, time: "14:15", room: "Phòng 2 (IMAX)", format: "3D IMAX" },
  { id: "st-103", numericId: 103, time: "18:00", room: "Phòng 1 (Standard)", format: "2D Phụ Đề" },
  { id: "st-104", numericId: 104, time: "20:45", room: "Phòng VIP Gold", format: "2D Thuyết Minh" }
];

export const FNB_COMBOS = [
  { id: "prod-01", numericId: 1, name: "Beta Solo Combo", desc: "1 Bắp ngọt lớn + 1 Nước ngọt có gas 32oz", price: 69000 },
  { id: "prod-02", numericId: 2, name: "Beta Couple Sweet", desc: "1 Bắp phô mai đặc biệt + 2 Nước ngọt có gas 32oz", price: 109000 },
  { id: "prod-03", numericId: 3, name: "Beta Family VIP", desc: "2 Bắp caramel + 3 Nước ngọt + 1 Khoai tây lắc", price: 159000 }
];

export const VOUCHERS = [
  { id: "vch-01", code: "BETA20", discount: 20000, label: "Giảm 20.000đ cho đơn từ 100.000đ" },
  { id: "vch-02", code: "VIP10", discount: 20000, label: "Giảm 10% tối đa 40.000đ cho đơn từ 150.000đ" },
  { id: "vch-03", code: "FNB15K", discount: 15000, label: "Giảm 15.000đ Combo bắp nước" }
];

export const MOCK_USER = {
  id: "usr-001",
  numericId: 1,
  name: "Nguyễn Minh Beta",
  email: "minh.beta@example.com",
  phone: "0901234567",
  walletBalance: 550000,
  membershipTier: "DIAMOND",
  points: 2450,
  bookings: [
    {
      id: "bk-20240925-001",
      movieTitle: "The Witcher Season 2",
      cinema: "Beta Cinema Quang Trung",
      time: "20:45 - Hôm nay",
      seats: ["C05", "C06"],
      total: 239000,
      status: "PAID"
    }
  ]
};
