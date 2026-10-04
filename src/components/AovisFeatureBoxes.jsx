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
        // Lấy danh sách phim mới nhất theo thời gian thực từ API CSDL
        const res = await cinemaService.getMovies({ sort: 'releaseDate,desc', size: 10 });
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
        const validMovies = list.filter(
          (m) => m.title && !m.title.includes('[TEST]') && !m.title.includes('[PAYMENT_TEST]')
        );

        if (validMovies.length > 0) {
          const mapped = validMovies.slice(0, 3).map((m, idx) => ({
            id: m.id || m.movieId,
            tagLabel: idx === 0 ? 'MỚI CÔNG CHIẾU' : 'PHIM MỚI RA RẠP',
            title: m.title,
            durationMinutes: m.durationMinutes,
            ageRating: m.ageRating || 'P',
            releaseDate: m.releaseDate ? new Date(m.releaseDate).toLocaleDateString('vi-VN') : '',
            backdropUrl: m.backdropUrl || m.posterUrl || '/images/aovis/witcher_banner.jpg'
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
