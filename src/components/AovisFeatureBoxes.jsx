import React, { useState, useEffect } from 'react';
import { useRouter } from '../router';
import cinemaService from '../services/cinemaService';

// Eye Icon for View Count
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Reel icon above "Watch New Movies"
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
  const [topMovies, setTopMovies] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await cinemaService.getHome();
        const nowShowingList = Array.isArray(res?.data?.nowShowing)
          ? res.data.nowShowing
          : (Array.isArray(res?.data) ? res.data : []);

        if (nowShowingList.length > 0) {
          const sorted = [...nowShowingList]
            .sort((a, b) => (b.viewCount || b.views || 0) - (a.viewCount || a.views || 0))
            .slice(0, 3);

          const mapped = sorted.map((m, idx) => ({
            id: m.id || m.movieId,
            rank: idx + 1,
            rankLabel: `TOP ${idx + 1} THÁNG NÀY`,
            title: m.title,
            viewCount: m.viewCount || m.views || 10000 + (3 - idx) * 5000,
            backdropUrl: m.backdropUrl || m.posterUrl || '/images/aovis/witcher_banner.jpg'
          }));
          setTopMovies(mapped);
        } else {
          setTopMovies([]);
        }
      } catch (err) {
        console.error('Failed to load top movies for spotlight boxes:', err);
      }
    }
    loadData();
  }, []);

  if (topMovies.length === 0) {
    return null;
  }

  return (
    <div className="aovis-features-section" id="aovis-features">
      {/* 1. Perforated Film Strip Divider Bar (Top) */}
      <div className="filmstrip-perforated-border" />

      {/* Decorative Wavy Filmstrip Watermark Overlay */}
      <div className="wavy-film-decor-left" />
      <div className="wavy-film-decor-right" />

      {/* 2. Top 3 Movies Rectangular Horizontal Cards (No bottom icons) */}
      <div className="feature-cards-container">
        <div className="feature-cards-grid">
          {topMovies.map((item) => (
            <div
              key={item.id}
              className="aovis-feature-card"
              onClick={() => navigate(`/movie/${item.id}`)}
              title={`${item.rankLabel}: ${item.title}`}
            >
              {/* Dark Film Strip Frame Background with Movie Backdrop */}
              <div
                className="card-film-bg"
                style={{
                  backgroundImage: `url(${item.backdropUrl})`
                }}
              />
              <div className="card-film-overlay" />

              {/* Content: Clean, Minimal, Focused on Title + View Count */}
              <div className="card-content">
                <span className="card-subtitle">{item.rankLabel}</span>
                <h3 className="card-title">
                  {item.title}
                </h3>
                <div className="card-views-badge">
                  <EyeIcon />
                  <span>{item.viewCount.toLocaleString('vi-VN')} lượt xem</span>
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
          <p className="intro-subtitle">Top Movie</p>
        </div>
      </div>
    </div>
  );
}
