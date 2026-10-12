import React, { useState, useEffect } from 'react';
import { useRouter } from '../router';
import cinemaService from '../services/cinemaService';

// Clock / Duration Icon
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Reel icon above "New Movies"
const AovisReelIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#d96c2c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3.2" />
    <circle cx="12" cy="5.8" r="1.5" fill="#d96c2c" />
    <circle cx="12" cy="18.2" r="1.5" fill="#d96c2c" />
    <circle cx="5.8" cy="12" r="1.5" fill="#d96c2c" />
    <circle cx="18.2" cy="12" r="1.5" fill="#d96c2c" />
  </svg>
);

export default function AovisFeatureBoxes() {
  const { navigate } = useRouter();
  const [newMovies, setNewMovies] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        // Lấy danh sách phim đầy đủ từ API CSDL theo thời gian thực
        const res = await cinemaService.getMovies({ size: 50 });
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);

        // 1. Tự động lọc các phim hợp lệ trong CSDL:
        // - Loại bỏ các bản ghi test
        // - Bắt buộc phải có ngày phát hành (releaseDate) trong CSDL
        // - Bắt buộc phải có ảnh thực tế (backdropUrl hoặc posterUrl) lưu trong CSDL
        const validMovies = list.filter((m) => {
          if (!m.title) return false;
          const isTest = /test|payment_test/i.test(m.title);
          const hasImage = Boolean(m.backdropUrl || m.posterUrl);
          const hasReleaseDate = Boolean(m.releaseDate);
          return !isTest && hasImage && hasReleaseDate;
        });

        // 2. Tự động sắp xếp theo ngày phát hành mới nhất giảm dần
        // Bất kỳ khi nào có phim mới ra mắt được thêm vào CSDL, phim đó sẽ tự động nhảy lên đầu
        const sortedByNewest = validMovies.sort(
          (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );

        // 3. Lấy đúng 3 phim mới nhất ra rạp và tham chiếu ảnh 100% từ CSDL
        if (sortedByNewest.length > 0) {
          const mapped = sortedByNewest.slice(0, 3).map((m, idx) => ({
            id: m.id || m.movieId,
            tagLabel: idx === 0 ? 'MỚI CÔNG CHIẾU' : 'PHIM MỚI RA RẠP',
            title: m.title,
            durationMinutes: m.durationMinutes,
            ageRating: m.ageRating || 'P',
            releaseDate: m.releaseDate ? new Date(m.releaseDate).toLocaleDateString('vi-VN') : '',
            // Tham chiếu trực tiếp URL ảnh từ CSDL của phim, không gán cứng link
            backdropUrl: m.backdropUrl || m.posterUrl
          }));
          setNewMovies(mapped);
        } else {
          setNewMovies([]);
        }
      } catch (err) {
        console.error('Failed to load new movies for spotlight boxes:', err);
      }
    }
    loadData();
  }, []);

  if (newMovies.length === 0) {
    return null;
  }

  return (
    <div className="aovis-features-section" id="aovis-features">
      {/* 1. Perforated Film Strip Divider Bar (Top) */}
      <div className="filmstrip-perforated-border" />

      {/* Decorative Wavy Filmstrip Watermark Overlay */}
      <div className="wavy-film-decor-left" />
      <div className="wavy-film-decor-right" />

      {/* 2. Top 3 New Movies Rectangular Horizontal Cards */}
      <div className="feature-cards-container">
        <div className="feature-cards-grid">
          {newMovies.map((item) => (
            <div
              key={item.id}
              className="aovis-feature-card"
              onClick={() => navigate(`/movie/${item.id}`)}
              title={`${item.tagLabel}: ${item.title}`}
            >
              {/* Dark Film Strip Frame Background with Movie Backdrop */}
              <div
                className="card-film-bg"
                style={{
                  backgroundImage: `url(${item.backdropUrl})`
                }}
              />
              <div className="card-film-overlay" />

              {/* Content: Clean, Focused on Title + Duration / Age Rating */}
              <div className="card-content">
                <span className="card-subtitle">{item.tagLabel}</span>
                <h3 className="card-title">
                  {item.title}
                </h3>
                <div className="card-views-badge">
                  <ClockIcon />
                  <span>
                    {item.durationMinutes ? `${item.durationMinutes} phút` : 'Đang chiếu'}
                    {item.ageRating ? ` • ${item.ageRating}` : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Section Transition Header to Movies */}
        <div className="movies-section-intro">
          <div className="intro-reel-icon">
            <AovisReelIcon />
          </div>
          <p className="intro-subtitle">New Movies</p>
        </div>
      </div>
    </div>
  );
}
