/**
 * Beta Cinema - Domain & API Mock Service
 * Tuân thủ nghiêm ngặt:
 * 1. API Contract & Schemas trong API_Design_JavaServlet_Grouped.xlsx
 * 2. CSDL PostgreSQL trong Cinema_PostgreSQL_Reference (31 bảng, ràng buộc toàn vẹn)
 * 3. 35 Endpoints & 14 Luồng nghiệp vụ trong Giao_tiep_web.md
 */

const STORAGE_KEY = 'beta_cinema_state_v2';

// Dữ liệu danh mục thể loại
export const GENRES = [
  { code: 'ACTION', name: 'Hành Động' },
  { code: 'ADVENTURE', name: 'Phiêu Lưu' },
  { code: 'THRILLER', name: 'Kinh Dị - Giật Gân' },
  { code: 'SCIFI', name: 'Khoa Học Viễn Tưởng' },
  { code: 'COMEDY', name: 'Hài Hước' },
  { code: 'ANIMATION', name: 'Hoạt Hình' },
  { code: 'DRAMA', name: 'Tâm Lý - Tình Cảm' }
];

// Danh mục thành phố
export const CITIES = [
  { code: 'HCM', name: 'Hồ Chí Minh' },
  { code: 'HN', name: 'Hà Nội' },
  { code: 'DN', name: 'Đà Nẵng' }
];

// Dữ liệu khởi tạo chuẩn CSDL PostgreSQL
const INITIAL_DATA = {
  csrfToken: 'csrf-' + Math.random().toString(36).substring(2, 12),
  currentUser: {
    id: 'usr-001',
    fullName: 'Nguyễn Minh Beta',
    email: 'minh.beta@example.com',
    phone: '0901234567',
    role: 'USER',
    membershipTier: 'DIAMOND',
    points: 2450,
    dateOfBirth: '1998-05-15'
  },
  wallet: {
    id: 'wlt-001',
    balance: 550000,
    currency: 'VND',
    updatedAt: new Date().toISOString()
  },
  walletTransactions: [
    {
      id: 'tx-001',
      type: 'TOP_UP',
      direction: 'CREDIT',
      amount: 500000,
      balanceAfter: 500000,
      currency: 'VND',
      referenceType: 'TOP_UP',
      referenceId: 'topup-001',
      description: 'Nạp tiền vào ví Beta qua Cổng thanh toán MoMo',
      createdAt: '2024-09-20T10:15:00Z'
    },
    {
      id: 'tx-002',
      type: 'PAYMENT',
      direction: 'DEBIT',
      amount: 239000,
      balanceAfter: 261000,
      currency: 'VND',
      referenceType: 'BOOKING',
      referenceId: 'bk-20240925-001',
      description: 'Thanh toán đơn vé #bk-20240925-001 (The Witcher: Ghế C05, C06)',
      createdAt: '2024-09-25T10:05:00Z'
    },
    {
      id: 'tx-003',
      type: 'REFUND',
      direction: 'CREDIT',
      amount: 190000,
      balanceAfter: 451000,
      currency: 'VND',
      referenceType: 'REFUND',
      referenceId: 'bk-20240918-005',
      description: 'Hoàn 100% tiền vé đơn #bk-20240918-005 vào Ví Beta',
      createdAt: '2024-09-26T14:30:00Z'
    },
    {
      id: 'tx-004',
      type: 'TOP_UP',
      direction: 'CREDIT',
      amount: 99000,
      balanceAfter: 550000,
      currency: 'VND',
      referenceType: 'REWARD',
      referenceId: 'topup-002',
      description: 'Thưởng nạp thành viên Beta Diamond Rewards',
      createdAt: '2024-09-27T09:00:00Z'
    }
  ],
  cinemas: [
    {
      id: 'cin-01',
      name: 'Beta Cinema Quang Trung',
      cityCode: 'HCM',
      cityName: 'TP. Hồ Chí Minh',
      address: '645 Quang Trung, Phường 11, Quận Gò Vấp, TP.HCM',
      phone: '1900 636 807',
      imageUrl: '/images/aovis/cinema1.jpg',
      latitude: 10.8354,
      longitude: 106.6578
    },
    {
      id: 'cin-02',
      name: 'Beta Cinema Landmark IMAX',
      cityCode: 'HCM',
      cityName: 'TP. Hồ Chí Minh',
      address: 'Tầng B1, Vincom Center Landmark 81, Quận Bình Thạnh, TP.HCM',
      phone: '1900 636 808',
      imageUrl: '/images/aovis/cinema2.jpg',
      latitude: 10.7951,
      longitude: 106.7218
    },
    {
      id: 'cin-03',
      name: 'Beta Cinema Thái Thịnh',
      cityCode: 'HN',
      cityName: 'Hà Nội',
      address: 'Số 35 Thái Thịnh, Phường Ngã Tư Sở, Quận Đống Đa, Hà Nội',
      phone: '1900 636 809',
      imageUrl: '/images/aovis/cinema3.jpg',
      latitude: 21.0076,
      longitude: 105.8193
    },
    {
      id: 'cin-04',
      name: 'Beta Cinema Nguyễn Tất Thành',
      cityCode: 'DN',
      cityName: 'Đà Nẵng',
      address: 'Số 456 Nguyễn Tất Thành, Quận Thanh Khê, TP. Đà Nẵng',
      phone: '1900 636 810',
      imageUrl: '/images/aovis/cinema1.jpg',
      latitude: 16.0712,
      longitude: 108.2154
    },
    {
      id: 'cin-05',
      name: 'Beta Cinema Giải Phóng',
      cityCode: 'HN',
      cityName: 'Hà Nội',
      address: 'Tầng 3, Imperial Plaza, 360 Giải Phóng, Quận Hoàng Mai, Hà Nội',
      phone: '1900 636 811',
      imageUrl: '/images/aovis/cinema2.jpg',
      latitude: 20.9856,
      longitude: 105.8423
    }
  ],
  movies: [
    {
      id: 'mov-01',
      title: 'The Witcher: Hành Trình Định Mệnh',
      posterUrl: '/images/aovis/movie1.jpg',
      backdropUrl: '/images/aovis/witcher_banner.jpg',
      durationMinutes: 148,
      releaseDate: '2024-09-15',
      genres: ['Hành Động', 'Phiêu Lưu', 'Khoa Học Viễn Tưởng'],
      status: 'NOW_SHOWING',
      ageRating: 'T18',
      averageRating: 8.9,
      reviewCount: 342,
      viewCount: 154200,
      description: 'Geralt xứ Rivia, một thợ săn quái vật bị đột biến, tiếp tục hành trình định mệnh qua một thế giới hỗn loạn nơi con người thường độc ác hơn cả dã thú.',
      director: 'Aleesha Rose',
      cast: ['Henry Cavill', 'Anya Chalotra', 'Freya Allan'],
      language: 'Tiếng Anh - Phụ đề Tiếng Việt',
      trailerUrl: 'https://www.youtube.com/watch?v=TJFVV2L8GKs',
      basePrice: 110000
    },
    {
      id: 'mov-02',
      title: 'Love Nightmare: Ảo Ảnh Tình Yêu',
      posterUrl: '/images/aovis/movie2.jpg',
      backdropUrl: '/images/aovis/love_nightmare_banner.jpg',
      durationMinutes: 115,
      releaseDate: '2024-09-20',
      genres: ['Phiêu Lưu', 'Tâm Lý - Tình Cảm'],
      status: 'NOW_SHOWING',
      ageRating: 'T16',
      averageRating: 8.5,
      reviewCount: 189,
      viewCount: 118500,
      description: 'Một câu chuyện phiêu lưu kỳ bí đưa người xem lạc vào miền ký ức và những ảo ảnh tình yêu sâu thẳm giữa ranh giới thực tại và giấc mơ.',
      director: 'Aleesha Rose',
      cast: ['Emma Stone', 'Ryan Gosling', 'Mark Ruffalo'],
      language: 'Tiếng Anh - Phụ đề Tiếng Việt',
      trailerUrl: 'https://www.youtube.com/watch?v=TJFVV2L8GKs',
      basePrice: 100000
    },
    {
      id: 'mov-03',
      title: 'Behind The Mask: Sau Lớp Mặt Nạ',
      posterUrl: '/images/aovis/movie3.jpg',
      backdropUrl: '/images/aovis/behind_mask_banner.jpg',
      durationMinutes: 105,
      releaseDate: '2024-09-28',
      genres: ['Kinh Dị - Giật Gân', 'Hành Động'],
      status: 'NOW_SHOWING',
      ageRating: 'T18',
      averageRating: 8.7,
      reviewCount: 215,
      viewCount: 96800,
      description: 'Sau lớp mặt nạ rùng rợn là những bí ẩn đen tối về một kế hoạch trả thù kinh hoàng làm rung chuyển toàn bộ thành phố khi màn đêm buông xuống.',
      director: 'Kenvin Lord',
      cast: ['Cillian Murphy', 'Robert Pattinson', 'Zoe Kravitz'],
      language: 'Tiếng Anh - Phụ đề Tiếng Việt',
      trailerUrl: 'https://www.youtube.com/watch?v=TJFVV2L8GKs',
      basePrice: 105000
    },
    {
      id: 'mov-04',
      title: 'Chuyến Đi Mùa Hè Rực Rỡ',
      posterUrl: '/images/aovis/movie4.jpg',
      backdropUrl: '/images/aovis/witcher_banner.jpg',
      durationMinutes: 120,
      releaseDate: '2024-10-01',
      genres: ['Hài Hước', 'Tâm Lý - Tình Cảm'],
      status: 'NOW_SHOWING',
      ageRating: 'T13',
      averageRating: 8.2,
      reviewCount: 94,
      viewCount: 72400,
      description: 'Hành trình tìm lại cảm xúc tuổi trẻ của nhóm bạn thân trên chiếc xe cũ băng qua những cung đường bờ biển tuyệt đẹp miền Trung.',
      director: 'Nguyễn Quang Dũng',
      cast: ['Trần Nghĩa', 'Kaity Nguyễn', 'Kiều Minh Tuấn'],
      language: 'Tiếng Việt',
      trailerUrl: 'https://www.youtube.com/watch?v=TJFVV2L8GKs',
      basePrice: 95000
    },
    {
      id: 'mov-05',
      title: 'Dune: Hành Tinh Cát 2',
      posterUrl: '/images/aovis/movie1.jpg',
      backdropUrl: '/images/aovis/love_nightmare_banner.jpg',
      durationMinutes: 166,
      releaseDate: '2024-10-15',
      genres: ['Khoa Học Viễn Tưởng', 'Hành Động'],
      status: 'NOW_SHOWING',
      ageRating: 'T16',
      averageRating: 9.1,
      reviewCount: 512,
      description: 'Paul Atreides hợp lực cùng Chani và tộc người Fremen để trả thù những kẻ đã hủy hoại gia tộc của anh.',
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
      language: 'Tiếng Anh - Phụ đề Tiếng Việt',
      trailerUrl: 'https://www.youtube.com/watch?v=TJFVV2L8GKs',
      basePrice: 120000
    },
    {
      id: 'mov-06',
      title: 'Kẻ Trộm Mặt Trăng 4 (Minions)',
      posterUrl: '/images/aovis/movie2.jpg',
      backdropUrl: '/images/aovis/behind_mask_banner.jpg',
      durationMinutes: 95,
      releaseDate: '2024-10-25',
      genres: ['Hoạt Hình', 'Hài Hước'],
      status: 'NOW_SHOWING',
      ageRating: 'P',
      averageRating: 8.0,
      reviewCount: 160,
      description: 'Gru và đại gia đình Minions siêu quậy đối mặt với kẻ thù mới cùng những tình huống dở khóc dở cười.',
      director: 'Chris Renaud',
      cast: ['Steve Carell', 'Kristen Wiig', 'Will Ferrell'],
      language: 'Lồng tiếng & Phụ đề Tiếng Việt',
      trailerUrl: 'https://www.youtube.com/watch?v=TJFVV2L8GKs',
      basePrice: 90000
    },
    {
      id: 'mov-07',
      title: 'Trại Buôn Người',
      posterUrl: '/images/aovis/movie3.jpg',
      backdropUrl: '/images/aovis/witcher_banner.jpg',
      durationMinutes: 128,
      releaseDate: '2024-10-02',
      genres: ['Hành Động', 'Gay Cấn'],
      status: 'NOW_SHOWING',
      ageRating: '18+',
      averageRating: 9.6,
      reviewCount: 420,
      description: 'Hành trình sinh tử giải cứu nạn nhân khỏi đường dây bắt cóc xuyên biên giới.',
      director: 'Toni Geed',
      cast: ['David Belle', 'Cyril Raffaelli'],
      language: 'Tiếng Anh - Phụ đề Tiếng Việt',
      trailerUrl: 'https://www.youtube.com/watch?v=TJFVV2L8GKs',
      basePrice: 105000
    },
    {
      id: 'mov-08',
      title: 'Quyết Cua Anh Này',
      posterUrl: '/images/aovis/movie4.jpg',
      backdropUrl: '/images/aovis/love_nightmare_banner.jpg',
      durationMinutes: 110,
      releaseDate: '2024-10-02',
      genres: ['Hài', 'Lãng Mạn'],
      status: 'NOW_SHOWING',
      ageRating: '13+',
      averageRating: 9.3,
      reviewCount: 310,
      description: 'Câu chuyện tình yêu đầy hài hước và bất ngờ giữa chàng kỹ sư lạnh lùng và cô nàng năng động.',
      director: 'Phawat Panangkasiri',
      cast: ['Mario Maurer', 'Baifern Pimchanok'],
      language: 'Lồng tiếng Tiếng Việt',
      trailerUrl: 'https://www.youtube.com/watch?v=TJFVV2L8GKs',
      basePrice: 95000
    },
    {
      id: 'mov-09',
      title: 'Quỷ Ăn Tạng 4: Hổ Tinh',
      posterUrl: '/images/aovis/movie1.jpg',
      backdropUrl: '/images/aovis/behind_mask_banner.jpg',
      durationMinutes: 122,
      releaseDate: '2024-10-07',
      genres: ['Kinh Dị', 'Hành Động'],
      status: 'NOW_SHOWING',
      ageRating: '18+',
      averageRating: 9.8,
      reviewCount: 580,
      description: 'Đối đầu với thế lực tâm linh huyền bí tại vùng rừng sâu hẻo lánh.',
      director: 'Taweewat Wantha',
      cast: ['Nadech Kugimiya', 'Denise Jelilcha'],
      language: 'Phụ đề Tiếng Việt',
      trailerUrl: 'https://www.youtube.com/watch?v=TJFVV2L8GKs',
      basePrice: 115000
    },
    {
      id: 'mov-10',
      title: 'Trái Tim Quái Thú',
      posterUrl: '/images/aovis/movie2.jpg',
      backdropUrl: '/images/aovis/witcher_banner.jpg',
      durationMinutes: 135,
      releaseDate: '2024-09-25',
      genres: ['Phiêu Lưu', 'Hành Động'],
      status: 'NOW_SHOWING',
      ageRating: '13+',
      averageRating: 9.0,
      reviewCount: 290,
      description: 'Một cựu chiến binh và người bạn đồng hành bốn chân đối mặt với hiểm nguy giữa rừng thiêng.',
      director: 'Brad Pitt',
      cast: ['Brad Pitt', 'Logan Lerman'],
      language: 'Tiếng Anh - Phụ đề Tiếng Việt',
      trailerUrl: 'https://www.youtube.com/watch?v=TJFVV2L8GKs',
      basePrice: 110000
    }
  ],
  // Suất chiếu hiện tại
  showtimes: [
    {
      id: 'st-101',
      movieId: 'mov-01',
      movieTitle: 'The Witcher: Hành Trình Định Mệnh',
      cinemaId: 'cin-01',
      cinemaName: 'Beta Cinema Quang Trung',
      roomId: 'room-01',
      roomName: 'Phòng Chiếu 1 (2D Digital)',
      startsAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // 4 tiếng sau
      endsAt: new Date(Date.now() + (4 + 2.5) * 3600 * 1000).toISOString(),
      format: '2D Phụ Đề',
      language: 'Tiếng Anh',
      minTicketPrice: 95000,
      currency: 'VND',
      availableSeatCount: 42
    },
    {
      id: 'st-102',
      movieId: 'mov-01',
      movieTitle: 'The Witcher: Hành Trình Định Mệnh',
      cinemaId: 'cin-01',
      cinemaName: 'Beta Cinema Quang Trung',
      roomId: 'room-02',
      roomName: 'Phòng Chiếu VIP Gold',
      startsAt: new Date(Date.now() + 7 * 3600 * 1000).toISOString(), // 7 tiếng sau
      endsAt: new Date(Date.now() + (7 + 2.5) * 3600 * 1000).toISOString(),
      format: '2D VIP Phụ Đề',
      language: 'Tiếng Anh',
      minTicketPrice: 120000,
      currency: 'VND',
      availableSeatCount: 36
    },
    {
      id: 'st-103',
      movieId: 'mov-02',
      movieTitle: 'Love Nightmare: Ảo Ảnh Tình Yêu',
      cinemaId: 'cin-01',
      cinemaName: 'Beta Cinema Quang Trung',
      roomId: 'room-01',
      roomName: 'Phòng Chiếu 1 (2D Digital)',
      startsAt: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 7 * 3600 * 1000).toISOString(),
      format: '2D Phụ Đề',
      language: 'Tiếng Anh',
      minTicketPrice: 90000,
      currency: 'VND',
      availableSeatCount: 48
    },
    {
      id: 'st-104',
      movieId: 'mov-03',
      movieTitle: 'Behind The Mask: Sau Lớp Mặt Nạ',
      cinemaId: 'cin-02',
      cinemaName: 'Beta Cinema Landmark IMAX',
      roomId: 'room-03',
      roomName: 'Phòng Chiếu IMAX Laser',
      startsAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
      format: '3D IMAX Laser',
      language: 'Tiếng Anh',
      minTicketPrice: 145000,
      currency: 'VND',
      availableSeatCount: 50
    },
    // Suất chiếu đã kết thúc để test luồng review (Luồng 13)
    {
      id: 'st-999',
      movieId: 'mov-01',
      movieTitle: 'The Witcher: Hành Trình Định Mệnh',
      cinemaId: 'cin-01',
      cinemaName: 'Beta Cinema Quang Trung',
      roomId: 'room-01',
      roomName: 'Phòng Chiếu 1',
      startsAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5 tiếng trước
      endsAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(), // Kết thúc 2.5 tiếng trước
      format: '2D Phụ Đề',
      language: 'Tiếng Anh',
      minTicketPrice: 95000,
      currency: 'VND',
      availableSeatCount: 0
    }
  ],
  // Bắp nước theo rạp (bảng products)
  products: [
    {
      id: 'prod-01',
      cinemaId: 'cin-01',
      name: 'Beta Solo Combo',
      description: '1 Bắp ngọt lớn 64oz + 1 Nước có gas 32oz',
      type: 'COMBO',
      imageUrl: '/images/aovis/popcorn1.jpg',
      unitPrice: 69000,
      currency: 'VND',
      available: true
    },
    {
      id: 'prod-02',
      cinemaId: 'cin-01',
      name: 'Beta Couple Sweet Combo',
      description: '1 Bắp Caramel đặc biệt 64oz + 2 Nước ngọt 32oz',
      type: 'COMBO',
      imageUrl: '/images/aovis/popcorn2.jpg',
      unitPrice: 109000,
      currency: 'VND',
      available: true
    },
    {
      id: 'prod-03',
      cinemaId: 'cin-01',
      name: 'Beta Family VIP Combo',
      description: '2 Bắp Caramel + 3 Nước có gas + 1 Snack Khoai tây lắc phô mai',
      type: 'COMBO',
      imageUrl: '/images/aovis/popcorn3.jpg',
      unitPrice: 159000,
      currency: 'VND',
      available: true
    },
    {
      id: 'prod-04',
      cinemaId: 'cin-01',
      name: 'Bắp Rang Bơ Truyền Thống',
      description: 'Bắp rang bơ thơm giòn cỡ lớn 64oz',
      type: 'POPCORN',
      imageUrl: '/images/aovis/popcorn1.jpg',
      unitPrice: 49000,
      currency: 'VND',
      available: true
    },
    {
      id: 'prod-05',
      cinemaId: 'cin-01',
      name: 'Coca-Cola Zero Sugar 32oz',
      description: 'Nước giải khát có gas không đường mát lạnh',
      type: 'DRINK',
      imageUrl: '/images/aovis/popcorn2.jpg',
      unitPrice: 32000,
      currency: 'VND',
      available: true
    }
  ],
  // Kho Voucher cá nhân
  vouchers: [
    {
      id: 'vch-01',
      code: 'BETA20',
      description: 'Giảm ngay 20.000đ cho đơn hàng từ 100.000đ',
      status: 'AVAILABLE',
      discountType: 'FIXED',
      discountValue: 20000,
      maxDiscountAmount: 20000,
      minOrderAmount: 100000,
      appliesTo: 'ORDER',
      eligibleCinemaIds: [],
      eligibleMovieIds: [],
      remainingUses: 1,
      startsAt: '2024-01-01T00:00:00Z',
      expiresAt: '2026-12-31T23:59:59Z',
      currency: 'VND'
    },
    {
      id: 'vch-02',
      code: 'VIP10',
      description: 'Giảm 10% tối đa 40.000đ cho đơn hàng thành viên Beta',
      status: 'AVAILABLE',
      discountType: 'PERCENT',
      discountValue: 10,
      maxDiscountAmount: 40000,
      minOrderAmount: 150000,
      appliesTo: 'ORDER',
      eligibleCinemaIds: [],
      eligibleMovieIds: [],
      remainingUses: 2,
      startsAt: '2024-01-01T00:00:00Z',
      expiresAt: '2026-12-31T23:59:59Z',
      currency: 'VND'
    },
    {
      id: 'vch-03',
      code: 'FNB15K',
      description: 'Giảm 15.000đ cho Combo bắp nước F&B',
      status: 'AVAILABLE',
      discountType: 'FIXED',
      discountValue: 15000,
      maxDiscountAmount: 15000,
      minOrderAmount: 60000,
      appliesTo: 'FNB',
      eligibleCinemaIds: [],
      eligibleMovieIds: [],
      remainingUses: 1,
      startsAt: '2024-01-01T00:00:00Z',
      expiresAt: '2026-12-31T23:59:59Z',
      currency: 'VND'
    }
  ],
  // Danh sách đánh giá công khai
  reviews: [
    {
      id: 'rev-01',
      movieId: 'mov-01',
      authorDisplayName: 'Trần Văn Anh',
      rating: 5,
      comment: 'Kỹ xảo và âm thanh đỉnh cao! Xem tại rạp Beta phòng chiếu to rất đã mắt.',
      version: 1,
      createdAt: '2024-09-18T14:30:00Z',
      updatedAt: '2024-09-18T14:30:00Z'
    },
    {
      id: 'rev-02',
      movieId: 'mov-01',
      authorDisplayName: 'Lê Hoàng Yến',
      rating: 4,
      comment: 'Cốt truyện hấp dẫn, Henry Cavill diễn xuất quá tuyệt vời. Rạp sạch sẽ, bắp phô mai ngon!',
      version: 1,
      createdAt: '2024-09-19T18:10:00Z',
      updatedAt: '2024-09-19T18:10:00Z'
    }
  ],
  // Đơn đặt vé mẫu (để kiểm tra các màn hình lịch sử, hoàn tiền, đánh giá)
  bookings: [
    {
      id: 'bk-20240925-001',
      status: 'PAID',
      version: 2,
      showtime: {
        id: 'st-999',
        movieId: 'mov-01',
        movieTitle: 'The Witcher: Hành Trình Định Mệnh',
        cinemaId: 'cin-01',
        cinemaName: 'Beta Cinema Quang Trung',
        roomId: 'room-01',
        roomName: 'Phòng Chiếu 1',
        startsAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        endsAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
        format: '2D Phụ Đề',
        language: 'Tiếng Anh',
        minTicketPrice: 95000,
        currency: 'VND',
        availableSeatCount: 0
      },
      seats: [
        { seatId: 's-C05', label: 'C05', type: 'STANDARD', unitPrice: 95000 },
        { seatId: 's-C06', label: 'C06', type: 'STANDARD', unitPrice: 95000 }
      ],
      fnbItems: [
        { productId: 'prod-01', name: 'Beta Solo Combo', quantity: 1, unitPrice: 69000, lineTotal: 69000 }
      ],
      voucher: { code: 'BETA20', discountAmount: 20000 },
      ticketSubtotal: 190000,
      fnbSubtotal: 69000,
      subtotal: 259000,
      discountAmount: 20000,
      totalAmount: 239000,
      currency: 'VND',
      createdAt: '2024-09-25T10:00:00Z',
      expiresAt: '2024-09-25T10:10:00Z',
      paidAt: '2024-09-25T10:05:00Z',
      ticketIds: ['tk-001', 'tk-002'],
      latestPaymentId: 'pay-001',
      refundId: null,
      eligibility: {
        canCancel: false,
        cancelReasonCode: 'BOOKING_ALREADY_PAID',
        canRefund: false,
        refundReasonCode: 'SHOWTIME_ALREADY_STARTED',
        canReview: true,
        reviewReasonCode: null
      }
    },
    // Đơn sắp chiếu có thể hoàn tiền (startsAt > now + 120 phút)
    {
      id: 'bk-20241002-002',
      status: 'PAID',
      version: 1,
      showtime: {
        id: 'st-101',
        movieId: 'mov-01',
        movieTitle: 'The Witcher: Hành Trình Định Mệnh',
        cinemaId: 'cin-01',
        cinemaName: 'Beta Cinema Quang Trung',
        roomId: 'room-01',
        roomName: 'Phòng Chiếu 1 (2D Digital)',
        startsAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // 4 tiếng nữa
        endsAt: new Date(Date.now() + 6.5 * 3600 * 1000).toISOString(),
        format: '2D Phụ Đề',
        language: 'Tiếng Anh',
        minTicketPrice: 95000,
        currency: 'VND',
        availableSeatCount: 40
      },
      seats: [
        { seatId: 's-E05', label: 'E05', type: 'VIP', unitPrice: 110000 },
        { seatId: 's-E06', label: 'E06', type: 'VIP', unitPrice: 110000 }
      ],
      fnbItems: [],
      voucher: null,
      ticketSubtotal: 220000,
      fnbSubtotal: 0,
      subtotal: 220000,
      discountAmount: 0,
      totalAmount: 220000,
      currency: 'VND',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      paidAt: new Date().toISOString(),
      ticketIds: ['tk-003', 'tk-004'],
      latestPaymentId: 'pay-002',
      refundId: null,
      eligibility: {
        canCancel: false,
        cancelReasonCode: 'BOOKING_ALREADY_PAID',
        canRefund: true, // Còn 4 tiếng >= 120 phút!
        refundReasonCode: null,
        canReview: false,
        reviewReasonCode: 'SHOWTIME_NOT_ENDED'
      }
    },
    // Đơn vé mẫu đã hủy (CANCELLED) để kiểm tra mục Vé đã hủy
    {
      id: 'bk-20240920-003',
      status: 'CANCELLED',
      version: 2,
      showtime: {
        id: 'st-003',
        movieId: 'mov-02',
        movieTitle: 'Dune: Hành Tinh Cát - Phần Hai',
        cinemaId: 'cin-01',
        cinemaName: 'Beta Cinema Quang Trung',
        roomId: 'room-02',
        roomName: 'Phòng Chiếu 2 (IMAX Laser)',
        startsAt: '2024-09-20T19:30:00Z',
        endsAt: '2024-09-20T22:15:00Z',
        format: '2D Digital Phụ Đề',
        language: 'Tiếng Anh',
        minTicketPrice: 95000,
        currency: 'VND',
        availableSeatCount: 25
      },
      seats: [
        { seatId: 's-D08', label: 'D08', type: 'STANDARD', unitPrice: 95000 },
        { seatId: 's-D09', label: 'D09', type: 'STANDARD', unitPrice: 95000 }
      ],
      fnbItems: [],
      voucher: null,
      ticketSubtotal: 190000,
      fnbSubtotal: 0,
      subtotal: 190000,
      discountAmount: 0,
      totalAmount: 190000,
      currency: 'VND',
      createdAt: '2024-09-20T14:10:00Z',
      expiresAt: '2024-09-20T14:20:00Z',
      cancelledAt: '2024-09-20T14:18:00Z',
      cancellationReason: 'Khách hàng chủ động hủy giữ chỗ',
      ticketIds: [],
      latestPaymentId: null,
      refundId: null,
      eligibility: {
        canCancel: false,
        cancelReasonCode: 'BOOKING_ALREADY_CANCELLED',
        canRefund: false,
        refundReasonCode: 'NOT_PAID',
        canReview: false,
        reviewReasonCode: 'BOOKING_CANCELLED'
      }
    },
    // Đơn chờ thanh toán (PENDING_PAYMENT) để kiểm tra mục Chờ thanh toán
    {
      id: 'bk-20241004-004',
      status: 'PENDING_PAYMENT',
      version: 1,
      showtime: {
        id: 'st-103',
        movieId: 'mov-03',
        movieTitle: 'Behind The Mask: Sau Lớp Mặt Nạ',
        cinemaId: 'cin-02',
        cinemaName: 'Beta Cinema Landmark IMAX',
        roomId: 'room-02',
        roomName: 'Phòng Chiếu 2 (IMAX Laser)',
        startsAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        endsAt: new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
        format: '3D IMAX Phụ Đề',
        language: 'Tiếng Anh',
        minTicketPrice: 120000,
        currency: 'VND',
        availableSeatCount: 30
      },
      seats: [
        { seatId: 's-F10', label: 'F10', type: 'VIP', unitPrice: 130000 },
        { seatId: 's-F11', label: 'F11', type: 'VIP', unitPrice: 130000 }
      ],
      fnbItems: [
        { productId: 'prod-02', name: 'Beta Couple Sweet', quantity: 1, unitPrice: 109000, lineTotal: 109000 }
      ],
      voucher: null,
      ticketSubtotal: 260000,
      fnbSubtotal: 109000,
      subtotal: 369000,
      discountAmount: 0,
      totalAmount: 369000,
      currency: 'VND',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      paidAt: null,
      ticketIds: [],
      latestPaymentId: null,
      refundId: null,
      eligibility: {
        canCancel: true,
        cancelReasonCode: null,
        canRefund: false,
        refundReasonCode: 'NOT_PAID',
        canReview: false,
        reviewReasonCode: 'NOT_PAID'
      }
    },
    // Đơn đã hoàn tiền (REFUNDED) để kiểm tra mục Đã hoàn tiền
    {
      id: 'bk-20240918-005',
      status: 'REFUNDED',
      version: 3,
      showtime: {
        id: 'st-104',
        movieId: 'mov-04',
        movieTitle: 'Chuyến Đi Mùa Hè Rực Rỡ',
        cinemaId: 'cin-03',
        cinemaName: 'Beta Cinema Thái Thịnh',
        roomId: 'room-01',
        roomName: 'Phòng Chiếu 1',
        startsAt: '2024-09-18T18:00:00Z',
        endsAt: '2024-09-18T20:00:00Z',
        format: '2D Digital',
        language: 'Tiếng Việt',
        minTicketPrice: 95000,
        currency: 'VND',
        availableSeatCount: 35
      },
      seats: [
        { seatId: 's-B03', label: 'B03', type: 'STANDARD', unitPrice: 95000 },
        { seatId: 's-B04', label: 'B04', type: 'STANDARD', unitPrice: 95000 }
      ],
      fnbItems: [],
      voucher: null,
      ticketSubtotal: 190000,
      fnbSubtotal: 0,
      subtotal: 190000,
      discountAmount: 0,
      totalAmount: 190000,
      currency: 'VND',
      createdAt: '2024-09-17T10:00:00Z',
      expiresAt: '2024-09-17T10:15:00Z',
      paidAt: '2024-09-17T10:10:00Z',
      ticketIds: ['tk-005', 'tk-006'],
      latestPaymentId: 'pay-005',
      refundId: 'ref-001',
      refundedAmount: 190000,
      refundedAt: '2024-09-17T14:30:00Z',
      refundReason: 'Khách hàng bận đột xuất trước giờ chiếu',
      eligibility: {
        canCancel: false,
        cancelReasonCode: 'BOOKING_ALREADY_REFUNDED',
        canRefund: false,
        refundReasonCode: 'ALREADY_REFUNDED',
        canReview: false,
        reviewReasonCode: 'BOOKING_REFUNDED'
      }
    }
  ],
  tickets: [
    {
      id: 'tk-001',
      bookingId: 'bk-20240925-001',
      movieTitle: 'The Witcher: Hành Trình Định Mệnh',
      cinemaName: 'Beta Cinema Quang Trung',
      roomName: 'Phòng Chiếu 1',
      startsAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      seatLabel: 'C05',
      status: 'USED',
      qrPayload: 'BETA|TK-001|BK-20240925-001|C05|PAID',
      issuedAt: '2024-09-25T10:05:00Z'
    },
    {
      id: 'tk-002',
      bookingId: 'bk-20240925-001',
      movieTitle: 'The Witcher: Hành Trình Định Mệnh',
      cinemaName: 'Beta Cinema Quang Trung',
      roomName: 'Phòng Chiếu 1',
      startsAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      seatLabel: 'C06',
      status: 'USED',
      qrPayload: 'BETA|TK-002|BK-20240925-001|C06|PAID',
      issuedAt: '2024-09-25T10:05:00Z'
    },
    {
      id: 'tk-003',
      bookingId: 'bk-20241002-002',
      movieTitle: 'The Witcher: Hành Trình Định Mệnh',
      cinemaName: 'Beta Cinema Quang Trung',
      roomName: 'Phòng Chiếu 1 (2D Digital)',
      startsAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      seatLabel: 'E05 (VIP)',
      status: 'VALID',
      qrPayload: 'BETA|TK-003|BK-20241002-002|E05|PAID',
      issuedAt: new Date().toISOString()
    },
    {
      id: 'tk-004',
      bookingId: 'bk-20241002-002',
      movieTitle: 'The Witcher: Hành Trình Định Mệnh',
      cinemaName: 'Beta Cinema Quang Trung',
      roomName: 'Phòng Chiếu 1 (2D Digital)',
      startsAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      seatLabel: 'E06 (VIP)',
      status: 'VALID',
      qrPayload: 'BETA|TK-004|BK-20241002-002|E06|PAID',
      issuedAt: new Date().toISOString()
    }
  ],
  invoices: [
    {
      id: 'inv-001',
      number: 'INV-20240925-001',
      bookingId: 'bk-20240925-001',
      issuedAt: '2024-09-25T10:05:00Z',
      status: 'ISSUED',
      customerName: 'Nguyễn Minh Beta',
      lines: [
        { type: 'TICKET', description: 'Vé xem phim: The Witcher - Ghế C05', quantity: 1, unitPrice: 95000, lineTotal: 95000 },
        { type: 'TICKET', description: 'Vé xem phim: The Witcher - Ghế C06', quantity: 1, unitPrice: 95000, lineTotal: 95000 },
        { type: 'FNB', description: 'Beta Solo Combo (1 Bắp + 1 Nước)', quantity: 1, unitPrice: 69000, lineTotal: 69000 }
      ],
      subtotal: 259000,
      discountAmount: 20000,
      totalAmount: 239000,
      refundedAmount: 0,
      currency: 'VND'
    },
    {
      id: 'inv-002',
      number: 'INV-20241002-002',
      bookingId: 'bk-20241002-002',
      issuedAt: new Date().toISOString(),
      status: 'ISSUED',
      customerName: 'Nguyễn Minh Beta',
      lines: [
        { type: 'TICKET', description: 'Vé VIP: The Witcher - Ghế E05', quantity: 1, unitPrice: 110000, lineTotal: 110000 },
        { type: 'TICKET', description: 'Vé VIP: The Witcher - Ghế E06', quantity: 1, unitPrice: 110000, lineTotal: 110000 }
      ],
      subtotal: 220000,
      discountAmount: 0,
      totalAmount: 220000,
      refundedAmount: 0,
      currency: 'VND'
    }
  ],
  refunds: []
};

// Đọc và lưu trữ State bền vững
function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Đảm bảo currentUser có sẵn cho testing
      if (!parsed.currentUser) {
        parsed.currentUser = INITIAL_DATA.currentUser;
      }
      // Đảm bảo đồng bộ danh sách rạp (bao gồm Đà Nẵng)
      if (parsed.cinemas && !parsed.cinemas.some((c) => c.id === 'cin-04')) {
        const dnCinema = INITIAL_DATA.cinemas.find((c) => c.id === 'cin-04');
        if (dnCinema) parsed.cinemas.push(dnCinema);
      }
      // Đảm bảo có đầy đủ 4 trạng thái đơn hàng (PAID, PENDING_PAYMENT, REFUNDED, CANCELLED)
      if (parsed.bookings) {
        ['CANCELLED', 'PENDING_PAYMENT', 'REFUNDED'].forEach((st) => {
          if (!parsed.bookings.some((b) => b.status === st)) {
            const sample = INITIAL_DATA.bookings.find((b) => b.status === st);
            if (sample) parsed.bookings.push(sample);
          }
        });
      }
      // Đảm bảo có đủ 3 loại giao dịch ví (TOP_UP, PAYMENT, REFUND)
      if (parsed.walletTransactions && !parsed.walletTransactions.some((tx) => tx.type === 'REFUND')) {
        parsed.walletTransactions = INITIAL_DATA.walletTransactions;
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Lỗi đọc localStorage:', e);
  }
  return INITIAL_DATA;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Lỗi lưu localStorage:', e);
  }
}

// Helper tự phục hồi/truy tìm suất chiếu đảm bảo không bao giờ bị lỗi SHOWTIME_NOT_FOUND
function findOrGenerateShowtime(state, showtimeId) {
  let showtime = state.showtimes.find((st) => st.id === showtimeId);
  if (showtime) return showtime;

  // Nếu không tìm thấy trong state, giải mã ID hoặc lấy rạp & phim tương ứng để tái tạo
  let cinemaId = 'cin-01';
  let movieId = state.movies[0]?.id || 'mov-01';

  if (showtimeId) {
    const foundCin = state.cinemas.find(c => showtimeId.includes(c.id));
    if (foundCin) cinemaId = foundCin.id;
    const foundMov = state.movies.find(m => showtimeId.includes(m.id));
    if (foundMov) movieId = foundMov.id;
  }

  const cinema = state.cinemas.find(c => c.id === cinemaId) || state.cinemas[0];
  const movie = state.movies.find(m => m.id === movieId) || state.movies[0];

  const startDate = new Date();
  startDate.setHours(startDate.getHours() + 1, 0, 0, 0);
  const dur = movie?.durationMinutes || 120;
  const endDate = new Date(startDate.getTime() + dur * 60 * 1000);

  showtime = {
    id: showtimeId,
    movieId: movie.id,
    movieTitle: movie.title,
    cinemaId: cinema.id,
    cinemaName: cinema.name,
    roomId: 'room-01',
    roomName: 'Phòng Chiếu 1 (2D Digital)',
    startsAt: startDate.toISOString(),
    endsAt: endDate.toISOString(),
    format: '2D Phụ Đề',
    language: 'Tiếng Anh - Phụ đề Tiếng Việt',
    minTicketPrice: 95000,
    currency: 'VND',
    availableSeatCount: 48
  };

  state.showtimes.push(showtime);
  saveState(state);
  return showtime;
}

// Giả lập độ trễ mạng async (40ms)
const delay = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

// Chuẩn hóa Helper tạo Envelope Response theo chuẩn OpenAPI 3.0.3 (swagger_cinema.yaml)
function successResponse(data, meta = null, message = null) {
  let responseData = data;
  if (meta && Array.isArray(data)) {
    responseData = [...data];
    responseData.items = data;
    responseData.meta = meta;
  }
  return {
    success: true,
    message: message || null,
    data: responseData,
    meta,
    traceId: 'req-' + Math.random().toString(36).substring(2, 10)
  };
}

function errorResponse(code, message, status = 400, fieldErrors = [], details = null) {
  const err = new Error(message);
  err.apiError = {
    success: false,
    status,
    error: message,
    code,
    fieldErrors,
    details,
    traceId: 'err-' + Math.random().toString(36).substring(2, 10)
  };
  return err;
}

/**
 * ĐỐI TƯỢNG CINEMA API SERVICE (39 API ENDPOINTS)
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const USE_MOCK_ENV = import.meta.env.VITE_USE_MOCK;
// IS_REAL_API_MODE: bật khi VITE_USE_MOCK === 'false' và có cấu hình API_BASE_URL
export const IS_REAL_API_MODE = USE_MOCK_ENV === 'false' && Boolean(API_BASE_URL);

/**
 * Universal HTTP Client cho Real API Mode (Java Servlet REST / Spring Boot / OpenAPI 3.0.3)
 * Tuân thủ nghiêm ngặt đặc tả swagger_cinema.yaml:
 * 1. Tự động đính kèm Authorization: Bearer <accessToken>
 * 2. Tự động chuẩn hóa Content-Type UTF-8
 * 3. Chuẩn hóa Envelope phản hồi (Success / Error / Paged data)
 * 4. Đảm bảo khi VITE_USE_MOCK=false thì 100% dữ liệu lấy từ API thật, không để sót datatest nào
 */
async function apiFetch(endpoint, { method = 'GET', body = null, params = null, headers = {} } = {}) {
  let url = API_BASE_URL + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);

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

  const reqHeaders = {
    'Accept': 'application/json',
    ...headers
  };

  if (body && !(body instanceof FormData)) {
    reqHeaders['Content-Type'] = 'application/json;charset=UTF-8';
  }

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

  // Chuẩn hóa response theo contract OpenAPI 3.0.3
  if (json && json.success !== undefined) {
    if (json.data && Array.isArray(json.data.items)) {
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

  const data = json !== null ? json : {};
  return successResponse(data);
}

export const cinemaService = {
  // 1. GET /csrf
  async getCsrf() {
    if (IS_REAL_API_MODE) {
      return apiFetch('/csrf');
    }
    await delay();
    const state = getState();
    return successResponse({
      headerName: 'X-CSRF-TOKEN',
      token: state.csrfToken
    });
  },

  // 2. GET / (Trang chủ)
  async getHome() {
    if (IS_REAL_API_MODE) {
      return apiFetch('/');
    }
    await delay();
    const state = getState();
    const nowShowing = state.movies.filter((m) => m.status === 'NOW_SHOWING');
    const comingSoon = state.movies.filter((m) => m.status === 'COMING_SOON');
    return successResponse({
      nowShowing,
      comingSoon,
      featuredCinemas: state.cinemas,
      genres: GENRES,
      cities: CITIES
    });
  },

  // 3. GET /movie (Danh sách phim, tìm kiếm, lọc)
  async getMovies({ q = '', genre = '', status = '', page = 0, size = 20, sort = 'releaseDate,desc' } = {}) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/movie', { params: { q, genre, status, page, size, sort } });
    }
    await delay();
    const state = getState();
    let result = [...state.movies];

    if (q) {
      const keyword = q.toLowerCase().trim();
      result = result.filter((m) => m.title.toLowerCase().includes(keyword) || m.director.toLowerCase().includes(keyword));
    }
    if (genre) {
      result = result.filter((m) => m.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
    }
    if (status) {
      result = result.filter((m) => m.status === status);
    }

    const totalElements = result.length;
    const totalPages = Math.ceil(totalElements / size) || 1;
    const pagedData = result.slice(page * size, (page + 1) * size);

    return successResponse(pagedData, { page, size, totalElements, totalPages });
  },

  // 4. GET /movie/{id}
  async getMovieDetail(id) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/movie/' + id);
    }
    await delay();
    const state = getState();
    const strId = String(id || '');
    let movie = state.movies.find((m) => m.id === strId);
    if (!movie && strId) {
      const numMatch = strId.match(/\d+/);
      if (numMatch) {
        const numVal = parseInt(numMatch[0], 10);
        movie = state.movies.find((m) => {
          const mMatch = m.id.match(/\d+/);
          return mMatch && parseInt(mMatch[0], 10) === numVal;
        });
      }
    }
    if (!movie) throw errorResponse('MOVIE_NOT_FOUND', `Không tìm thấy phim với mã ${id}`);
    return successResponse(movie);
  },

  // 5. GET /movie/{id}/showtime
  async getMovieShowtimes(movieId, { cinemaId = null, date = null, page = 0, size = 50 } = {}) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/movie/' + movieId + '/showtime', { params: { cinemaId, date, page, size } });
    }
    await delay();
    const state = getState();
    const strMovieId = String(movieId || '');
    let effectiveMovie = state.movies.find((m) => m.id === strMovieId);
    if (!effectiveMovie && strMovieId) {
      const numMatch = strMovieId.match(/\d+/);
      if (numMatch) {
        const numVal = parseInt(numMatch[0], 10);
        effectiveMovie = state.movies.find((m) => {
          const mMatch = m.id.match(/\d+/);
          return mMatch && parseInt(mMatch[0], 10) === numVal;
        });
      }
    }
    const effectiveId = effectiveMovie ? effectiveMovie.id : strMovieId;

    let result = state.showtimes.filter((st) => st.movieId === effectiveId || String(st.movieId).replace(/-0+/, '-') === String(effectiveId).replace(/-0+/, '-'));
    if (cinemaId) {
      const strCinId = String(cinemaId);
      result = result.filter((st) => st.cinemaId === strCinId || String(st.cinemaId).replace(/-0+/, '-') === strCinId.replace(/-0+/, '-'));
    }

    // Đảm bảo luôn có các suất chiếu trong tương lai của 7 ngày tới
    const now = new Date();
    let activeShowtimes = result.filter((st) => new Date(st.startsAt) > now);

    if (activeShowtimes.length < 15) {
      // Tự động sinh suất chiếu mẫu cho 7 ngày liên tiếp để phục vụ lịch chiếu
      const sampleTimes = [
        { hour: 9, min: 0, dur: 135 },
        { hour: 11, min: 30, dur: 135 },
        { hour: 14, min: 15, dur: 135 },
        { hour: 17, min: 0, dur: 135 },
        { hour: 19, min: 45, dur: 135 },
        { hour: 22, min: 15, dur: 135 }
      ];

      const targetCinemas = cinemaId ? state.cinemas.filter(c => c.id === cinemaId) : state.cinemas;
      const genShowtimes = [];

      targetCinemas.forEach((cin) => {
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          sampleTimes.forEach((st, sIdx) => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + dayOffset);
            startDate.setHours(st.hour, st.min, 0, 0);
            if (dayOffset === 0 && startDate < now) {
              return;
            }
            const endDate = new Date(startDate.getTime() + st.dur * 60 * 1000);

            genShowtimes.push({
              id: `st-gen-${cin.id}-${effectiveId}-d${dayOffset}-${sIdx}`,
              movieId: effectiveId,
              movieTitle: state.movies.find(m => m.id === effectiveId)?.title || 'Phim Beta',
              cinemaId: cin.id,
              cinemaName: cin.name,
              roomId: `room-0${(sIdx % 3) + 1}`,
              roomName: `Phòng Chiếu ${(sIdx % 3) + 1} (${sIdx % 2 === 0 ? '2D Digital' : '3D Laser'})`,
              startsAt: startDate.toISOString(),
              endsAt: endDate.toISOString(),
              format: sIdx % 2 === 0 ? '2D Phụ Đề' : '3D IMAX Laser',
              language: 'Tiếng Anh - Phụ đề Tiếng Việt',
              minTicketPrice: 95000 + (sIdx % 3) * 15000,
              currency: 'VND',
              availableSeatCount: 45
            });
          });
        }
      });

      genShowtimes.forEach(gst => {
        if (!state.showtimes.some(st => st.id === gst.id)) {
          state.showtimes.push(gst);
        }
      });
      saveState(state);
      activeShowtimes = [...activeShowtimes, ...genShowtimes];
    }

    activeShowtimes.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    return successResponse(activeShowtimes, { page: 0, size: activeShowtimes.length, totalElements: activeShowtimes.length, totalPages: 1 });
  },

  // 6. GET /movie/{id}/review
  async getMovieReviews(movieId, { page = 0, size = 20, sort = 'createdAt,desc' } = {}) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/movie/' + movieId + '/review', { params: { page, size, sort } });
    }
    await delay();
    const state = getState();
    const result = state.reviews.filter((r) => r.movieId === movieId);
    return successResponse(result, { page: 0, size: result.length, totalElements: result.length, totalPages: 1 });
  },

  // 7. GET /cinema
  async getCinemas({ city = '', q = '', page = 0, size = 50 } = {}) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/cinema', { params: { city, q, page, size } });
    }
    await delay();
    const state = getState();
    let result = [...state.cinemas];
    if (city) {
      result = result.filter((c) => c.cityCode.toUpperCase() === city.toUpperCase());
    }
    if (q) {
      const keyword = q.toLowerCase().trim();
      result = result.filter((c) => c.name.toLowerCase().includes(keyword) || c.address.toLowerCase().includes(keyword));
    }
    return successResponse(result, { page: 0, size: result.length, totalElements: result.length, totalPages: 1 });
  },

  // 8. GET /cinema/{id}
  async getCinemaDetail(id) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/cinema/' + id);
    }
    await delay();
    const state = getState();
    const strId = String(id || '');
    let cinema = state.cinemas.find((c) => c.id === strId);
    if (!cinema && strId) {
      const numMatch = strId.match(/\d+/);
      if (numMatch) {
        const numVal = parseInt(numMatch[0], 10);
        cinema = state.cinemas.find((c) => {
          const cMatch = c.id.match(/\d+/);
          return cMatch && parseInt(cMatch[0], 10) === numVal;
        });
      }
    }
    if (!cinema) throw errorResponse('CINEMA_NOT_FOUND', `Không tìm thấy rạp với mã ${id}`);
    return successResponse(cinema);
  },

  // 9. GET /cinema/{id}/showtime
  async getCinemaShowtimes(cinemaId, { date = null, movieId = null, page = 0, size = 50 } = {}) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/cinema/' + cinemaId + '/showtime', { params: { date, movieId, page, size } });
    }
    await delay();
    const state = getState();
    const strCinemaId = String(cinemaId || '');
    let effectiveCin = state.cinemas.find((c) => c.id === strCinemaId);
    if (!effectiveCin && strCinemaId) {
      const numMatch = strCinemaId.match(/\d+/);
      if (numMatch) {
        const numVal = parseInt(numMatch[0], 10);
        effectiveCin = state.cinemas.find((c) => {
          const cMatch = c.id.match(/\d+/);
          return cMatch && parseInt(cMatch[0], 10) === numVal;
        });
      }
    }
    const targetCinemaId = effectiveCin ? effectiveCin.id : strCinemaId;

    let result = state.showtimes.filter((st) => st.cinemaId === targetCinemaId || String(st.cinemaId).replace(/-0+/, '-') === String(targetCinemaId).replace(/-0+/, '-'));
    if (movieId) {
      const strMovId = String(movieId);
      result = result.filter((st) => st.movieId === strMovId || String(st.movieId).replace(/-0+/, '-') === strMovId.replace(/-0+/, '-'));
    }
    const now = new Date();
    let activeShowtimes = result.filter((st) => new Date(st.startsAt) > now);

    if (activeShowtimes.length < 15) {
      const cinemaObj = effectiveCin || state.cinemas[0];
      const targetMovies = movieId 
        ? state.movies.filter(m => m.id === movieId || String(m.id).replace(/-0+/, '-') === String(movieId).replace(/-0+/, '-')) 
        : state.movies.filter(m => m.status === 'NOW_SHOWING');

      const sampleHours = [
        { h: 9, m: 15 },
        { h: 11, m: 45 },
        { h: 14, m: 30 },
        { h: 17, m: 15 },
        { h: 20, m: 0 },
        { h: 22, m: 30 }
      ];

      const genShowtimes = [];
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        targetMovies.forEach((m, mIdx) => {
          const movieHours = sampleHours.slice(mIdx % 2, (mIdx % 2) + 4);
          movieHours.forEach((sh, sIdx) => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + dayOffset);
            startDate.setHours(sh.h, sh.m, 0, 0);
            if (dayOffset === 0 && startDate < now) {
              return;
            }
            const dur = m.durationMinutes || 120;
            const endDate = new Date(startDate.getTime() + dur * 60 * 1000);

            genShowtimes.push({
              id: `st-cin-${cinemaId}-${m.id}-d${dayOffset}-${sIdx}`,
              movieId: m.id,
              movieTitle: m.title,
              cinemaId: cinemaId,
              cinemaName: cinemaObj ? cinemaObj.name : 'Beta Cinema',
              roomId: `room-0${(sIdx % 3) + 1}`,
              roomName: `Phòng Chiếu ${(sIdx % 3) + 1} (${sIdx % 2 === 0 ? '2D Digital' : '3D Laser'})`,
              startsAt: startDate.toISOString(),
              endsAt: endDate.toISOString(),
              format: sIdx % 2 === 0 ? '2D Phụ Đề' : '3D IMAX Laser',
              language: 'Tiếng Anh - Phụ đề Tiếng Việt',
              minTicketPrice: 95000 + (sIdx % 2) * 25000,
              currency: 'VND',
              availableSeatCount: 48
            });
          });
        });
      }

      genShowtimes.forEach(gst => {
        if (!state.showtimes.some(st => st.id === gst.id)) {
          state.showtimes.push(gst);
        }
      });
      saveState(state);
      activeShowtimes = [...activeShowtimes, ...genShowtimes];
    }

    activeShowtimes.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    return successResponse(activeShowtimes, { page: 0, size: activeShowtimes.length, totalElements: activeShowtimes.length, totalPages: 1 });
  },

  // 10. GET /showtime/{id}/seat (Sơ đồ ghế & Tình trạng ghế)
  async getSeatMap(showtimeId) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/showtime/' + showtimeId + '/seat');
    }
    await delay();
    const state = getState();
    const showtime = findOrGenerateShowtime(state, showtimeId);

    // Sinh ma trận ghế 8 hàng x 10 cột (A đến H, 1 đến 10)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seats = [];

    // Danh sách ghế đã bị đặt sẵn (mock từ các booking đã PAID hoặc PENDING)
    const bookedSeatLabels = new Set();
    state.bookings
      .filter((b) => b.showtime.id === showtimeId && (b.status === 'PAID' || b.status === 'PENDING_PAYMENT'))
      .forEach((b) => {
        b.seats.forEach((s) => bookedSeatLabels.add(s.label));
      });

    rows.forEach((rowLetter, rowIndex) => {
      for (let num = 1; num <= 10; num++) {
        const label = `${rowLetter}${num < 10 ? '0' + num : num}`;
        const isVip = ['D', 'E', 'F'].includes(rowLetter) && num >= 3 && num <= 8;
        const seatPrice = isVip ? showtime.minTicketPrice + 20000 : showtime.minTicketPrice;
        const isBooked = bookedSeatLabels.has(label) || (rowLetter === 'H' && (num === 5 || num === 6));

        seats.push({
          id: `s-${label}`,
          row: rowLetter,
          number: num,
          x: num,
          y: rowIndex + 1,
          type: isVip ? 'VIP' : 'STANDARD',
          price: seatPrice,
          status: isBooked ? 'BOOKED' : 'AVAILABLE',
          heldByCurrentUser: false,
          holdExpiresAt: null
        });
      }
    });

    return successResponse({
      showtime,
      serverTime: new Date().toISOString(),
      screenPosition: 'TOP',
      seats
    });
  },

  // 11. GET /product (Danh sách bắp nước theo rạp)
  async getProducts(cinemaId, { type = '', page = 0, size = 50 } = {}) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/product', { params: { cinemaId, type, page, size } });
    }
    await delay();
    const state = getState();
    const list = state.products.filter((p) => p.cinemaId === cinemaId || !p.cinemaId);
    return successResponse(list, { page: 0, size: list.length, totalElements: list.length, totalPages: 1 });
  },

  // 12. POST /booking (Tạo đơn & Giữ ghế 1-8 ghế trong 10 phút)
  async createBooking({ showtimeId, seatIds }, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      return apiFetch('/booking', { method: 'POST', body: { showtimeId, seatIds }, headers });
    }
    await delay();
    if (!seatIds || seatIds.length === 0) {
      throw errorResponse('INVALID_SEAT_SELECTION', 'Vui lòng chọn ít nhất 1 ghế');
    }
    if (seatIds.length > 8) {
      throw errorResponse('INVALID_SEAT_SELECTION', 'Chỉ được đặt tối đa 8 ghế cho mỗi đơn');
    }

    const state = getState();
    const showtime = findOrGenerateShowtime(state, showtimeId);

    // Chuyển đổi seatIds sang đối tượng seat chi tiết
    const seats = seatIds.map((id) => {
      const label = id.replace('s-', '');
      const isVip = ['D', 'E', 'F'].includes(label[0]);
      return {
        seatId: id,
        label,
        type: isVip ? 'VIP' : 'STANDARD',
        unitPrice: isVip ? showtime.minTicketPrice + 20000 : showtime.minTicketPrice
      };
    });

    const ticketSubtotal = seats.reduce((sum, s) => sum + s.unitPrice, 0);
    const bookingId = 'bk-' + Date.now().toString().slice(-8);
    const now = new Date();
    // Giữ ghế tối đa 10 phút hoặc đến giờ chiếu
    const expiresAt = new Date(Math.min(now.getTime() + 10 * 60 * 1000, new Date(showtime.startsAt).getTime())).toISOString();

    const newBooking = {
      id: bookingId,
      status: 'PENDING_PAYMENT',
      version: 0,
      showtime,
      seats,
      fnbItems: [],
      voucher: null,
      ticketSubtotal,
      fnbSubtotal: 0,
      subtotal: ticketSubtotal,
      discountAmount: 0,
      totalAmount: ticketSubtotal,
      currency: 'VND',
      createdAt: now.toISOString(),
      expiresAt,
      paidAt: null,
      cancelledAt: null,
      cancellationReason: null,
      serverTime: now.toISOString(),
      ticketIds: [],
      latestPaymentId: null,
      refundId: null,
      eligibility: {
        canCancel: true,
        cancelReasonCode: null,
        canRefund: false,
        refundReasonCode: 'NOT_PAID',
        canReview: false,
        reviewReasonCode: 'SHOWTIME_NOT_ENDED'
      }
    };

    state.bookings.unshift(newBooking);
    saveState(state);
    return successResponse(newBooking);
  },

  // 13. GET /booking/{id}
  async getBookingDetail(id) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/booking/' + id);
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', `Không tìm thấy đơn hàng với mã ${id}`);

    // Tự động kiểm tra hết hạn 10 phút
    if (booking.status === 'PENDING_PAYMENT' && new Date(booking.expiresAt) < new Date()) {
      booking.status = 'EXPIRED';
      booking.eligibility.canCancel = false;
      saveState(state);
    }

    return successResponse(booking);
  },

  // 14. PUT /booking/{id}/fnb (Cập nhật bắp nước)
  async updateBookingFnb(id, { items = [], expectedVersion }) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/booking/' + id + '/fnb', { method: 'PUT', body: { items, expectedVersion } });
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy đơn');

    if (booking.status === 'EXPIRED') throw errorResponse('BOOKING_EXPIRED', 'Đơn hàng đã hết hạn giữ chỗ');
    if (booking.status !== 'PENDING_PAYMENT') throw errorResponse('BOOKING_STATE_CONFLICT', 'Chỉ được sửa F&B khi đơn chưa thanh toán');
    if (expectedVersion !== undefined && booking.version !== expectedVersion) {
      throw errorResponse('VERSION_CONFLICT', 'Đơn hàng đã được cập nhật ở nơi khác', [], { currentVersion: booking.version });
    }

    // Tính toán fnbItems
    let fnbSubtotal = 0;
    const fnbItems = [];
    for (const item of items) {
      const prod = state.products.find((p) => p.id === item.productId);
      if (prod && item.quantity > 0) {
        const lineTotal = prod.unitPrice * item.quantity;
        fnbSubtotal += lineTotal;
        fnbItems.push({
          productId: prod.id,
          name: prod.name,
          quantity: item.quantity,
          unitPrice: prod.unitPrice,
          lineTotal
        });
      }
    }

    booking.fnbItems = fnbItems;
    booking.fnbSubtotal = fnbSubtotal;
    booking.subtotal = booking.ticketSubtotal + fnbSubtotal;

    // Tính lại voucher nếu có
    if (booking.voucher) {
      const v = state.vouchers.find((voc) => voc.code === booking.voucher.code);
      if (v) {
        let disc = v.discountType === 'FIXED' ? v.discountValue : Math.floor((booking.subtotal * v.discountValue) / 100);
        if (v.maxDiscountAmount && disc > v.maxDiscountAmount) disc = v.maxDiscountAmount;
        booking.discountAmount = Math.min(disc, booking.subtotal);
        booking.voucher.discountAmount = booking.discountAmount;
      }
    }

    booking.totalAmount = Math.max(0, booking.subtotal - booking.discountAmount);
    booking.version += 1;
    saveState(state);
    return successResponse(booking);
  },

  // 15. PUT /booking/{id}/voucher (Áp dụng / Gỡ voucher)
  async updateBookingVoucher(id, { code = null, expectedVersion }) {
    if (IS_REAL_API_MODE) {
      if (code) {
        return apiFetch('/booking/' + id + '/voucher', { method: 'PUT', body: { code, expectedVersion } });
      } else {
        return apiFetch('/booking/' + id + '/voucher', { method: 'DELETE' });
      }
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy đơn');

    if (booking.status === 'EXPIRED') throw errorResponse('BOOKING_EXPIRED', 'Đơn hàng đã hết hạn giữ chỗ');
    if (booking.status !== 'PENDING_PAYMENT') throw errorResponse('BOOKING_STATE_CONFLICT', 'Chỉ áp dụng voucher khi đơn chưa thanh toán');
    if (expectedVersion !== undefined && booking.version !== expectedVersion) {
      throw errorResponse('VERSION_CONFLICT', 'Đơn hàng đã được cập nhật ở nơi khác', [], { currentVersion: booking.version });
    }

    if (!code) {
      // Gỡ voucher
      booking.voucher = null;
      booking.discountAmount = 0;
      booking.totalAmount = booking.subtotal;
    } else {
      const v = state.vouchers.find((voc) => voc.code.toUpperCase() === code.trim().toUpperCase());
      if (!v) throw errorResponse('VOUCHER_NOT_APPLICABLE', 'Mã voucher không tồn tại hoặc đã hết hạn');
      if (booking.subtotal < v.minOrderAmount) {
        throw errorResponse('VOUCHER_NOT_APPLICABLE', `Đơn hàng tối thiểu phải từ ${v.minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng voucher này`);
      }

      let disc = v.discountType === 'FIXED' ? v.discountValue : Math.floor((booking.subtotal * v.discountValue) / 100);
      if (v.maxDiscountAmount && disc > v.maxDiscountAmount) disc = v.maxDiscountAmount;
      disc = Math.min(disc, booking.subtotal);

      booking.voucher = { code: v.code, discountAmount: disc };
      booking.discountAmount = disc;
      booking.totalAmount = Math.max(0, booking.subtotal - disc);
    }

    booking.version += 1;
    saveState(state);
    return successResponse(booking);
  },

  // 16. POST /booking/{id}/cancel (Hủy đơn chưa thanh toán)
  async cancelBooking(id, { reason = 'Khách hủy đơn', expectedVersion } = {}, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      return apiFetch('/booking/' + id + '/cancel', { method: 'POST', body: { reason, expectedVersion }, headers });
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy đơn');

    if (booking.status === 'PAID') throw errorResponse('BOOKING_STATE_CONFLICT', 'Đơn đã thanh toán, không thể hủy trực tiếp. Vui lòng gửi yêu cầu hoàn tiền');
    if (booking.status === 'CANCELLED') return successResponse(booking);

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();
    booking.cancellationReason = reason;
    booking.eligibility.canCancel = false;
    booking.version += 1;

    saveState(state);
    return successResponse(booking);
  },

  // 17. POST /booking/{id}/payment (Thanh toán đơn bằng Ví hoặc Cổng)
  async createPayment(id, { method = 'WALLET', expectedVersion } = {}, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      return apiFetch('/booking/' + id + '/payment', { method: 'POST', body: { method, expectedVersion }, headers });
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy đơn');

    if (booking.status === 'EXPIRED') throw errorResponse('BOOKING_EXPIRED', 'Đơn hàng đã hết hạn giữ chỗ');
    if (booking.status === 'PAID') throw errorResponse('BOOKING_STATE_CONFLICT', 'Đơn hàng đã được thanh toán');

    const amount = booking.totalAmount;

    if (method === 'WALLET') {
      if (state.wallet.balance < amount) {
        throw errorResponse('INSUFFICIENT_BALANCE', `Số dư ví không đủ (${state.wallet.balance.toLocaleString('vi-VN')}đ < ${amount.toLocaleString('vi-VN')}đ). Vui lòng nạp thêm tiền vào ví.`);
      }

      // Trừ ví và ghi sổ cái Ledger
      state.wallet.balance -= amount;
      state.wallet.updatedAt = new Date().toISOString();

      const newTx = {
        id: 'tx-' + Date.now().toString().slice(-8),
        type: 'PAYMENT',
        direction: 'DEBIT',
        amount,
        balanceAfter: state.wallet.balance,
        currency: 'VND',
        referenceType: 'PAYMENT',
        referenceId: booking.id,
        description: `Thanh toán vé xem phim ${booking.showtime.movieTitle} (${booking.seats.map((s) => s.label).join(', ')})`,
        createdAt: new Date().toISOString()
      };
      state.walletTransactions.unshift(newTx);
    }

    // Cập nhật trạng thái đơn sang PAID
    booking.status = 'PAID';
    booking.paidAt = new Date().toISOString();
    booking.version += 1;
    booking.eligibility.canCancel = false;

    // Kiểm tra điều kiện hoàn tiền (còn >= 120 phút trước chiếu)
    const minutesBeforeShow = (new Date(booking.showtime.startsAt).getTime() - Date.now()) / (60 * 1000);
    booking.eligibility.canRefund = minutesBeforeShow >= 120;
    booking.eligibility.canReview = new Date(booking.showtime.endsAt) < new Date();

    // Phát hành Vé điện tử Tickets
    const newTicketIds = [];
    booking.seats.forEach((seat, idx) => {
      const ticketId = `tk-${Date.now().toString().slice(-6)}-${idx + 1}`;
      const ticket = {
        id: ticketId,
        bookingId: booking.id,
        movieTitle: booking.showtime.movieTitle,
        cinemaName: booking.showtime.cinemaName,
        roomName: booking.showtime.roomName,
        startsAt: booking.showtime.startsAt,
        seatLabel: `${seat.label} (${seat.type})`,
        status: 'VALID',
        qrPayload: `BETA|${ticketId}|${booking.id}|${seat.label}|PAID`,
        issuedAt: new Date().toISOString()
      };
      state.tickets.unshift(ticket);
      newTicketIds.push(ticketId);
    });
    booking.ticketIds = newTicketIds;

    // Phát hành Hóa đơn Invoice
    const invoiceId = `inv-${Date.now().toString().slice(-6)}`;
    const invoiceLines = [
      ...booking.seats.map((s) => ({
        type: 'TICKET',
        description: `Vé ${s.type}: ${booking.showtime.movieTitle} - Ghế ${s.label}`,
        quantity: 1,
        unitPrice: s.unitPrice,
        lineTotal: s.unitPrice
      })),
      ...booking.fnbItems.map((f) => ({
        type: 'FNB',
        description: f.name,
        quantity: f.quantity,
        unitPrice: f.unitPrice,
        lineTotal: f.lineTotal
      }))
    ];

    const newInvoice = {
      id: invoiceId,
      number: `INV-${Date.now().toString().slice(-8)}`,
      bookingId: booking.id,
      issuedAt: new Date().toISOString(),
      status: 'ISSUED',
      customerName: state.currentUser.fullName,
      lines: invoiceLines,
      subtotal: booking.subtotal,
      discountAmount: booking.discountAmount,
      totalAmount: booking.totalAmount,
      refundedAmount: 0,
      currency: 'VND'
    };
    state.invoices.unshift(newInvoice);

    saveState(state);
    return successResponse({
      id: 'pay-' + Date.now().toString().slice(-6),
      bookingId: booking.id,
      method,
      status: 'SUCCEEDED',
      amount,
      currency: 'VND',
      checkoutUrl: null,
      expiresAt: new Date().toISOString(),
      failureCode: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    });
  },

  // 18. GET /ticket/{id}
  async getTicketDetail(id) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/ticket/' + id);
    }
    await delay();
    const state = getState();
    const ticket = state.tickets.find((t) => t.id === id);
    if (!ticket) throw errorResponse('RESOURCE_NOT_FOUND', `Không tìm thấy vé với mã ${id}`);
    return successResponse(ticket);
  },

  // 19. GET /booking/{id}/invoice
  async getBookingInvoice(id) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/booking/' + id + '/invoice');
    }
    await delay();
    const state = getState();
    const invoice = state.invoices.find((inv) => inv.bookingId === id);
    if (!invoice) throw errorResponse('INVOICE_NOT_AVAILABLE', 'Hóa đơn chưa sẵn sàng hoặc đơn chưa thanh toán');
    return successResponse(invoice);
  },

  // 20. POST /booking/{id}/refund (Yêu cầu hoàn tiền vé vào ví)
  async requestRefund(id, { reason = 'Khách có việc đột xuất', expectedVersion } = {}, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      return apiFetch('/booking/' + id + '/refund', { method: 'POST', body: { reason, expectedVersion }, headers });
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy đơn');

    if (booking.status !== 'PAID') throw errorResponse('REFUND_NOT_ELIGIBLE', 'Chỉ được hoàn tiền cho đơn đã thanh toán');

    // Kiểm tra quy tắc 120 phút
    const minutesBeforeShow = (new Date(booking.showtime.startsAt).getTime() - Date.now()) / (60 * 1000);
    if (minutesBeforeShow < 120) {
      throw errorResponse('REFUND_NOT_ELIGIBLE', 'Chỉ được hoàn tiền trước giờ chiếu phim ít nhất 120 phút');
    }

    // Hoàn 100% tiền đã trả vào Ví
    const refundAmount = booking.totalAmount;
    state.wallet.balance += refundAmount;
    state.wallet.updatedAt = new Date().toISOString();

    const txId = 'tx-' + Date.now().toString().slice(-8);
    const refundTx = {
      id: txId,
      type: 'REFUND',
      direction: 'CREDIT',
      amount: refundAmount,
      balanceAfter: state.wallet.balance,
      currency: 'VND',
      referenceType: 'REFUND',
      referenceId: booking.id,
      description: `Hoàn tiền 100% vé xem phim ${booking.showtime.movieTitle} vào ví Beta`,
      createdAt: new Date().toISOString()
    };
    state.walletTransactions.unshift(refundTx);

    // Cập nhật trạng thái vé sang VOID
    state.tickets
      .filter((t) => t.bookingId === booking.id)
      .forEach((t) => {
        t.status = 'VOID';
      });

    // Cập nhật trạng thái đơn
    booking.status = 'REFUNDED';
    booking.eligibility.canRefund = false;
    booking.version += 1;

    const refundObj = {
      id: 'ref-' + Date.now().toString().slice(-6),
      bookingId: booking.id,
      reason,
      amount: refundAmount,
      destination: 'WALLET',
      status: 'SUCCEEDED',
      requestedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      walletTransactionId: txId
    };
    state.refunds.unshift(refundObj);

    saveState(state);
    return successResponse(refundObj);
  },

  // 21. PUT /booking/{id}/review (Tạo hoặc cập nhật đánh giá phim sau giờ chiếu)
  async upsertReview(bookingId, { rating = 5, comment = '', expectedReviewVersion = 0 }, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      return apiFetch('/booking/' + bookingId + '/review', { method: 'POST', body: { rating, comment, expectedReviewVersion }, headers });
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy đơn');

    if (booking.status !== 'PAID') throw errorResponse('REVIEW_NOT_ELIGIBLE', 'Chỉ được đánh giá khi đơn đã thanh toán');
    if (new Date(booking.showtime.endsAt) > new Date()) {
      throw errorResponse('REVIEW_NOT_ELIGIBLE', 'Chỉ được đánh giá sau khi suất chiếu phim kết thúc');
    }

    const newRev = {
      id: 'rev-' + Date.now().toString().slice(-6),
      movieId: booking.showtime.movieId,
      authorDisplayName: state.currentUser.fullName,
      rating,
      comment,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.reviews.unshift(newRev);
    saveState(state);
    return successResponse(newRev);
  },

  // 22. GET /wallet (Số dư ví)
  async getWallet() {
    if (IS_REAL_API_MODE) {
      return apiFetch('/wallet');
    }
    await delay();
    const state = getState();
    return successResponse(state.wallet);
  },

  // 23. POST /wallet/top-up (Nạp tiền vào ví qua cổng)
  async topUpWallet({ amount = 100000, method = 'GATEWAY' } = {}, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      return apiFetch('/wallet/top-up', { method: 'POST', body: { amount, method }, headers });
    }
    await delay();
    if (amount < 10000 || amount > 10000000) {
      throw errorResponse('TOP_UP_AMOUNT_INVALID', 'Số tiền nạp mỗi lần từ 10.000đ đến 10.000.000đ');
    }

    const state = getState();
    state.wallet.balance += amount;
    state.wallet.updatedAt = new Date().toISOString();

    const topUpTx = {
      id: 'tx-' + Date.now().toString().slice(-8),
      type: 'TOP_UP',
      direction: 'CREDIT',
      amount,
      balanceAfter: state.wallet.balance,
      currency: 'VND',
      referenceType: 'TOP_UP',
      referenceId: 'topup-' + Date.now().toString().slice(-6),
      description: 'Nạp tiền vào ví qua Cổng thanh toán',
      createdAt: new Date().toISOString()
    };
    state.walletTransactions.unshift(topUpTx);
    saveState(state);

    return successResponse({
      id: topUpTx.referenceId,
      amount,
      currency: 'VND',
      method: 'GATEWAY',
      status: 'SUCCEEDED',
      checkoutUrl: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    });
  },

  // 24. GET /wallet/transaction (Sổ cái biến động số dư)
  async getWalletTransactions({ page = 0, size = 20, type = null } = {}) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/wallet/transaction', { params: { page, size, type } });
    }
    await delay();
    const state = getState();
    const txs = state.walletTransactions;
    return successResponse(txs, { page, size, totalElements: txs.length, totalPages: 1 });
  },

  // 25. GET /user/booking (Lịch sử đơn vé cá nhân)
  async getUserBookings({ status = '', page = 0, size = 20, sort = 'createdAt,desc', from = null, to = null } = {}) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/user/booking', { params: { status, page, size, sort, from, to } });
    }
    await delay();
    const state = getState();
    let list = [...state.bookings];
    if (status) {
      list = list.filter((b) => b.status === status);
    }
    return successResponse(list, { page, size, totalElements: list.length, totalPages: 1 });
  },

  // 26. GET /user/voucher (Kho voucher của tôi)
  async getUserVouchers({ status = '', page = 0, size = 20 } = {}) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/user/voucher', { params: { status, page, size } });
    }
    await delay();
    const state = getState();
    return successResponse(state.vouchers, { page: 0, size: state.vouchers.length, totalElements: state.vouchers.length, totalPages: 1 });
  },

  // 27. GET /user (Thông tin tài khoản)
  async getUserProfile() {
    if (IS_REAL_API_MODE) {
      return apiFetch('/user');
    }
    await delay();
    const state = getState();
    if (!state.currentUser) {
      throw errorResponse('UNAUTHORIZED', 'Chưa đăng nhập');
    }
    return successResponse(state.currentUser);
  },

  // 28. PATCH /user (Cập nhật hồ sơ)
  async updateUserProfile({ fullName, phone, dateOfBirth }) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/user', { method: 'PATCH', body: { fullName, phone, dateOfBirth } });
    }
    await delay();
    const state = getState();
    if (!state.currentUser) throw errorResponse('UNAUTHORIZED', 'Chưa đăng nhập');
    if (fullName) state.currentUser.fullName = fullName.trim();
    if (phone) state.currentUser.phone = phone.trim();
    if (dateOfBirth) state.currentUser.dateOfBirth = dateOfBirth;
    saveState(state);
    return successResponse(state.currentUser);
  },

  // 29. POST /user/change-password
  async changePassword({ currentPassword, newPassword, confirmPassword }) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/user/change-password', { method: 'POST', body: { currentPassword, newPassword, confirmPassword } });
    }
    await delay();
    if (!newPassword || newPassword.length < 8) {
      throw errorResponse('VALIDATION_ERROR', 'Mật khẩu mới phải từ 8 ký tự trở lên');
    }
    if (newPassword !== confirmPassword) {
      throw errorResponse('VALIDATION_ERROR', 'Xác nhận mật khẩu mới không trùng khớp');
    }
    return successResponse({ message: 'Đổi mật khẩu thành công' });
  },

  // 30. POST /login
  async login({ email, password }) {
    if (IS_REAL_API_MODE) {
      const res = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
      if (res.data?.accessToken) {
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('cinema_auth_token', res.data.accessToken);
      }
      if (res.data?.refreshToken) {
        localStorage.setItem('refresh_token', res.data.refreshToken);
      }
      return res;
    }
    await delay();
    if (!email || !password) throw errorResponse('INVALID_CREDENTIALS', 'Email và mật khẩu không được để trống');
    const state = getState();
    state.currentUser = {
      id: 'usr-001',
      fullName: 'Nguyễn Minh Beta',
      email: email,
      phone: '0901234567',
      role: 'USER',
      membershipTier: 'DIAMOND',
      points: 2450
    };
    state.csrfToken = 'csrf-' + Math.random().toString(36).substring(2, 12);
    saveState(state);
    return successResponse(state.currentUser);
  },

  // 31. POST /register
  async register({ fullName, email, password, confirmPassword, phone, dateOfBirth }) {
    if (IS_REAL_API_MODE) {
      const res = await apiFetch('/auth/register', { method: 'POST', body: { fullName, email, password, phone, dateOfBirth } });
      if (res.data?.accessToken) {
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('cinema_auth_token', res.data.accessToken);
      }
      return res;
    }
    await delay();
    if (password !== confirmPassword) {
      throw errorResponse('VALIDATION_ERROR', 'Mật khẩu xác nhận không khớp');
    }
    const state = getState();
    state.currentUser = {
      id: 'usr-' + Date.now().toString().slice(-6),
      fullName,
      email,
      phone: phone || null,
      dateOfBirth: null,
      role: 'USER',
      createdAt: new Date().toISOString()
    };
    saveState(state);
    return successResponse(state.currentUser);
  },

  // 32. POST /logout
  async logout() {
    if (IS_REAL_API_MODE) {
      const refreshToken = localStorage.getItem('refresh_token');
      try {
        if (refreshToken) {
          await apiFetch('/auth/logout', { method: 'POST', body: { refreshToken } });
        }
      } catch (e) {
        console.warn('Lỗi khi gọi logout API:', e);
      } finally {
        localStorage.removeItem('access_token');
        localStorage.removeItem('cinema_auth_token');
        localStorage.removeItem('refresh_token');
      }
      return successResponse(null, null, 'Đăng xuất thành công');
    }
    await delay();
    const state = getState();
    state.currentUser = null;
    state.csrfToken = 'csrf-' + Math.random().toString(36).substring(2, 12);
    saveState(state);
    return successResponse({ message: 'Đăng xuất thành công' });
  },

  // 33. POST /auth/forgot-password
  async forgotPassword({ email }) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });
    }
    await delay();
    return successResponse({ message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi' });
  },

  // 34. POST /auth/reset-password
  async resetPassword({ token, newPassword, confirmPassword }) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/auth/reset-password', { method: 'POST', body: { token, newPassword, confirmPassword } });
    }
    await delay();
    return successResponse({ message: 'Đặt lại mật khẩu thành công' });
  },

  // Method Aliases cho tính linh hoạt và tương thích ngược cao nhất
  payBooking(id, options, idempotencyKey) {
    return this.createPayment(id, options, idempotencyKey);
  },
  refundBooking(id, options, idempotencyKey) {
    return this.requestRefund(id, options, idempotencyKey);
  },
  createBookingReview(id, options, idempotencyKey) {
    return this.upsertReview(id, options, idempotencyKey);
  },
  applyVoucher(id, { voucherCode, expectedVersion }) {
    return this.updateBookingVoucher(id, { code: voucherCode, expectedVersion });
  },
  removeVoucher(id, { expectedVersion } = {}) {
    return this.updateBookingVoucher(id, { code: null, expectedVersion });
  },
  getCinemaProducts(cinemaId, options) {
    return this.getProducts(cinemaId, options);
  }

};

export default cinemaService;

