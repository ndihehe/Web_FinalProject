import React, { useState, useEffect, useRef } from 'react';
import FeatherIcon from './FeatherIcon';
import { HERO_MOVIES } from '../data/mockData';

// Interactive Title powered by Universal Mouse-Tracking Spotlight
function HeroInteractiveTitle({ title, onClick, dragDelta }) {
  return (
    <div
      className="hero-title-wrapper"
      onClick={(e) => {
        if (Math.abs(dragDelta || 0) > 5) return;
        if (onClick) onClick(e);
      }}
      title={title}
    >
      <h1 className="hero-title">{title}</h1>
    </div>
  );
}

// Chuẩn hóa tên thể loại sang dạng không dấu để hiển thị mượt mà với font retro Covered By Your Grace
function stripVietnameseDiacritics(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export default function HeroSlider({ movies = [], onSelectMovie, onBookTicket }) {
  const isRealApi = import.meta.env.VITE_USE_MOCK === 'false' && Boolean(import.meta.env.VITE_API_BASE_URL);
  const movieSlides = (Array.isArray(movies) && movies.length > 0)
    ? movies.slice(0, 5)
    : (!isRealApi ? HERO_MOVIES : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const dragThreshold = 60; // Pixels required to trigger slide change

  // Auto rotate slides every 6 seconds (paused when dragging)
  useEffect(() => {
    if (isDragging || movieSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movieSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isDragging, currentIndex, movieSlides.length]);

  if (movieSlides.length === 0) {
    return null;
  }

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setDragDelta(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    setDragDelta(delta);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDelta < -dragThreshold) {
      // Swiped Left -> Next Slide
      setCurrentIndex((prev) => (prev + 1) % movieSlides.length);
    } else if (dragDelta > dragThreshold) {
      // Swiped Right -> Previous Slide
      setCurrentIndex((prev) => (prev - 1 + movieSlides.length) % movieSlides.length);
    }
    setDragDelta(0);
  };

  // Touch Swipe Handlers (for mobile/tablet support)
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragDelta(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - startX;
    setDragDelta(delta);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  return (
    <section
      className={`hero-section ${isDragging ? 'is-dragging' : ''}`}
      id="home"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Horizontal Smooth Continuous Slider Track */}
      <div
        className="hero-slider-track"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragDelta}px))`,
          transition: isDragging ? 'none' : 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {movieSlides.map((movie) => {
          const rawGenre = Array.isArray(movie.genres) ? movie.genres.join(' • ') : (movie.genre || 'Action Movie');
          const displayGenre = stripVietnameseDiacritics(rawGenre);
          const displayDirector = movie.director || 'Aleesha Rose';
          const displayCountry = movie.country || 'Việt Nam';
          const displayYear = movie.year || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '2024');
          const displayBackdrop = movie.backdropUrl || movie.posterUrl || '/images/aovis/witcher_banner.jpg';
          const displayInTheater = movie.inTheaterMonth || (movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) : 'Đang Chiếu');

          return (
            <div key={movie.id} className="hero-slide-item">
              {/* Background Image (Full-bleed canvas under the transparent header) */}
              <div
                className="hero-backdrop"
                style={{
                  backgroundImage: `url(${displayBackdrop})`
                }}
              />

              {/* Cinematic Dark Gradient Overlays */}
              <div className="hero-overlay" />
              <div className="hero-bottom-gradient" />

              {/* Hero Central Content */}
              <div className="hero-content">
                <div className="hero-main-info">
                  {/* Genre Tag in signature Aovis Covered By Your Grace font */}
                  <div className="hero-genre-tag">{displayGenre}</div>

                  {/* Bold Interactive Headline with Mouse Spotlight & Smooth Color Transition */}
                  <HeroInteractiveTitle
                    title={movie.title}
                    onClick={() => onSelectMovie(movie)}
                    dragDelta={dragDelta}
                  />

                  {/* Director & Year Metadata */}
                  <p className="hero-metadata">
                    Written and Directed by {displayDirector} / {displayCountry} {displayYear}
                  </p>

                {/* Dual Action Buttons */}
                <div className="hero-cta-group">
                  <button
                    className="btn-white"
                    onClick={(e) => {
                      if (Math.abs(dragDelta) > 5) return;
                      onSelectMovie(movie);
                    }}
                    title="Xem thông tin chi tiết phim"
                  >
                    More Info
                  </button>
                  <button
                    className="btn-orange"
                    onClick={(e) => {
                      if (Math.abs(dragDelta) > 5) return;
                      onBookTicket(movie);
                    }}
                    title="Đặt vé xem phim ngay"
                  >
                    Get Ticket
                  </button>
                </div>
              </div>

              {/* Right Badge: In Theater */}
              <div className="hero-badge-box">
                <div className="in-theater-label">In theater</div>
                <div className="in-theater-date">
                  <span>{displayInTheater}</span>
                  <svg
                    className="brush-underline-svg"
                    viewBox="0 0 170 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ display: 'block', width: '100%', height: '10px', marginTop: '2px' }}
                  >
                    <path
                      d="M2.5 8.2C35 4.5 95 3.2 167 6.8C142 9.8 65 11.5 2.5 8.2Z"
                      fill="var(--orange-primary)"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* 2. Pinned Glassmorphism Pagination Dots (3 Dots, Color Changes per Slide) */}
      <div className="hero-glass-indicators">
        {movieSlides.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`hero-dot-glass ${idx === currentIndex ? 'active' : ''}`}
            title={`Chuyển tới phim: ${item.title}`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
