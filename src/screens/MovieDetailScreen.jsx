import React, { useState, useEffect } from 'react';
import { cinemaService, CITIES } from '../services/cinemaService';
import { useRouter } from '../router';
import FeatherIcon from '../components/FeatherIcon';
import MovieReviewsSection from '../components/MovieReviewsSection';

export default function MovieDetailScreen() {
  const { params, navigate } = useRouter();
  const movieId = params.id;

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [activeTab, setActiveTab] = useState('showtimes'); // 'showtimes' | 'reviews'
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [expandedCinemas, setExpandedCinemas] = useState({});

  // Sinh 7 ngày liên tiếp chuẩn lịch chiếu (Hôm nay, Ngày mai, Thứ 2, Thứ 3...)
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dateOptions = Array.from({ length: 7 }).map((_, offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      dayOfWeek: offset === 0 ? 'HÔM NAY' : offset === 1 ? 'NGÀY MAI' : dayNames[d.getDay()].toUpperCase(),
      dateNumber: d.getDate(),
      formatted: `${d.getDate() < 10 ? '0' + d.getDate() : d.getDate()}/${d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1}`,
      fullDate: d.toISOString().split('T')[0]
    };
  });

  useEffect(() => {
    if (!movieId) return;
    loadData();
  }, [movieId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [movieRes, showtimeRes, reviewRes, cinemaRes] = await Promise.all([
        cinemaService.getMovieDetail(movieId),
        cinemaService.getMovieShowtimes(movieId),
        cinemaService.getMovieReviews(movieId),
        cinemaService.getCinemas()
      ]);
      setMovie(movieRes?.data);
      setShowtimes(Array.isArray(showtimeRes?.data) ? showtimeRes.data : (showtimeRes?.data?.items || []));
      setReviews(Array.isArray(reviewRes?.data) ? reviewRes.data : (reviewRes?.data?.items || []));
      setCinemas(Array.isArray(cinemaRes?.data) ? cinemaRes.data : (cinemaRes?.data?.items || []));

      // Mặc định mở rộng tất cả rạp
      const expandMap = {};
      const stList = Array.isArray(showtimeRes?.data) ? showtimeRes.data : (showtimeRes?.data?.items || []);
      stList.forEach(st => {
        expandMap[st.cinemaId] = true;
      });
      setExpandedCinemas(expandMap);
    } catch (e) {
      console.error('Lỗi tải chi tiết phim:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleCinemaExpand = (cinemaId) => {
    setExpandedCinemas(prev => ({
      ...prev,
      [cinemaId]: !prev[cinemaId]
    }));
  };

  const scrollToBooking = () => {
    setActiveTab('showtimes');
    const el = document.getElementById('booking-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const selectedDateStr = dateOptions[selectedDateIndex]?.fullDate;
  const filteredShowtimes = showtimes.filter((st) => {
    if (selectedCinemaId && st.cinemaId !== selectedCinemaId) return false;
    if (selectedCity) {
      const cinemaObj = cinemas.find(c => c.id === st.cinemaId);
      if (cinemaObj && cinemaObj.cityCode !== selectedCity) return false;
    }
    if (selectedDateStr) {
      const stDateStr = new Date(st.startsAt).toISOString().split('T')[0];
      if (stDateStr !== selectedDateStr) return false;
    }
    return true;
  });

  // Gom nhóm suất chiếu theo cụm rạp
  const showtimesByCinema = filteredShowtimes.reduce((acc, st) => {
    if (!acc[st.cinemaId]) {
      const cObj = cinemas.find(c => c.id === st.cinemaId);
      acc[st.cinemaId] = {
        cinemaName: st.cinemaName,
        cinemaId: st.cinemaId,
        address: cObj ? cObj.address : 'Chi nhánh Beta Cinemas',
        slots: []
      };
    }
    acc[st.cinemaId].slots.push(st);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="page-container loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin phim...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="page-container empty-container">
        <h2>Không tìm thấy thông tin phim</h2>
        <button className="btn-movie-book" onClick={() => navigate('/movie')}>Quay lại danh sách phim</button>
      </div>
    );
  }

  return (
    <div className="movie-detail-screen">
      {/* 1. PANORAMIC BACKDROP HERO BANNER (CHUẨN STYLE IMG 4 & IMG 5) */}
      <div
        className="movie-panoramic-hero"
        style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}
      >
        <div className="hero-dark-vignette"></div>

        <div className="container hero-content-container">
          {/* Breadcrumb Navigation */}
          <div className="breadcrumb-nav text-white font-sf-rounded">
            <span className="breadcrumb-link" onClick={() => navigate('/')}>Trang chủ</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-link" onClick={() => navigate('/movie')}>Danh sách Phim</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{movie.title}</span>
          </div>

          {/* Left-Bottom Aligned Movie Info */}
          <div className="hero-stream-content">
            <div className="stream-badge-row">
              <span className="stream-age-badge font-sf-rounded">{movie.ageRating}</span>
              <span className="stream-genres-text font-sf-rounded">
                {movie.genres?.join(' • ')}
              </span>
            </div>

            <h1 className="stream-movie-title spotlight-text font-sf-rounded">{movie.title}</h1>

            <p className="stream-movie-synopsis font-sf-rounded">
              {movie.description}
            </p>

            <div className="stream-meta-line font-sf-rounded">
              <span>⭐ <strong>{movie.averageRating}</strong> ({movie.reviewCount} đánh giá)</span>
              <span>• Thời lượng: <strong>{movie.durationMinutes} phút</strong></span>
              <span>• Khởi chiếu: <strong>{movie.releaseDate}</strong></span>
              {movie.director && <span>• Đạo diễn: <strong>{movie.director}</strong></span>}
            </div>

            {/* 2 Action Buttons (Style Image 5) */}
            <div className="stream-actions-row">
              <button
                type="button"
                className="btn-stream-trailer font-sf-rounded"
                onClick={() => setShowTrailerModal(true)}
              >
                <div className="play-icon-circle">
                  <FeatherIcon name="play" size={14} />
                </div>
                <span>Trailer</span>
              </button>

              <button
                type="button"
                className="btn-stream-book font-sf-rounded"
                onClick={scrollToBooking}
              >
                <FeatherIcon name="ticket" size={16} />
                <span>Đặt vé ngay</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB ĐIỀU HƯỚNG TINH GỌN (CHỈ CÒN LỊCH CHIẾU VÀ ĐÁNH GIÁ) */}
      <div className="container movie-content-body" id="booking-section">
        <div className="detail-navigation-tabs font-sf-rounded">
          <button
            className={`detail-tab ${activeTab === 'showtimes' ? 'active' : ''}`}
            onClick={() => setActiveTab('showtimes')}
          >
            LỊCH CHIẾU & ĐẶT VÉ
          </button>
          <button
            className={`detail-tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            ĐÁNH GIÁ KHÁN GIẢ ({reviews.length})
          </button>
        </div>

        {/* TAB 1: LỊCH CHIẾU & SUẤT CHIẾU (CHUẨN STYLE IMG 7 & IMG 8) */}
        {activeTab === 'showtimes' && (
          <div className="showtimes-schedule-container">
            {/* Top Bar: Tiêu đề + Vị trí & Gần bạn (Style Img 6 & 7) */}
            <div className="schedule-header-bar">
              <h2 className="schedule-section-title font-sf-rounded">
                Lịch chiếu {movie.title}
              </h2>

              <div className="schedule-location-controls font-sf-rounded">
                <div className="location-select-box">
                  <FeatherIcon name="map-pin" size={15} className="loc-icon" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="city-select-glass"
                  >
                    <option value="">Toàn quốc</option>
                    {CITIES.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className={`btn-near-you-pill ${selectedCity === 'HCM' ? 'active' : ''}`}
                  onClick={() => setSelectedCity(prev => prev === 'HCM' ? '' : 'HCM')}
                  title="Tìm rạp gần bạn nhất"
                >
                  <FeatherIcon name="crosshair" size={14} />
                  <span>Gần bạn</span>
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Date Picker Pills (Style Img 7 & 8) */}
            <div className="schedule-dates-bar">
              {dateOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`date-pill-btn ${selectedDateIndex === idx ? 'active' : ''}`}
                  onClick={() => setSelectedDateIndex(idx)}
                >
                  <span className="pill-day-label font-sf-rounded">{opt.dayOfWeek}</span>
                  <span className="pill-date-num font-sf-rounded">{opt.dateNumber}</span>
                </button>
              ))}
            </div>

            {/* Filter rạp nhanh */}
            <div className="cinema-chain-tags-row font-sf-rounded">
              <button
                type="button"
                className={`chain-tag-btn ${selectedCinemaId === '' ? 'active' : ''}`}
                onClick={() => setSelectedCinemaId('')}
              >
                Tất cả rạp ({cinemas.length})
              </button>
              {cinemas.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`chain-tag-btn ${selectedCinemaId === c.id ? 'active' : ''}`}
                  onClick={() => setSelectedCinemaId(prev => prev === c.id ? '' : c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Danh sách các cụm rạp và các suất chiếu dạng StartsAt ~ EndsAt (Style Img 7 & 8) */}
            {Object.keys(showtimesByCinema).length === 0 ? (
              <div className="empty-schedule-card font-sf-rounded">
                <FeatherIcon name="calendar" size={42} className="empty-icon" />
                <h3>Chưa có suất chiếu phù hợp cho ngày đã chọn</h3>
                <p>Vui lòng chọn ngày khác hoặc đổi địa điểm để xem lịch chiếu mới nhất.</p>
              </div>
            ) : (
              <div className="cinema-accordions-list">
                {Object.values(showtimesByCinema).map((cin) => {
                  const isExpanded = expandedCinemas[cin.cinemaId] !== false;
                  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cin.cinemaName + ' ' + cin.address)}`;

                  return (
                    <div key={cin.cinemaId} className="cinema-accordion-card">
                      {/* Accordion Header */}
                      <div
                        className="accordion-header"
                        onClick={() => toggleCinemaExpand(cin.cinemaId)}
                      >
                        <div className="cinema-brand-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', background: '#0e1118' }}>
                          <img src="/images/logo_tdtdt_transparent.png" alt="TDTDT Logo" style={{ width: '85%', height: 'auto', objectFit: 'contain' }} />
                        </div>
                        <div className="cinema-info-block">
                          <h3 className="accordion-cinema-name font-sf-rounded">{cin.cinemaName}</h3>
                          <div className="accordion-cinema-address font-sf-rounded">
                            <span>{cin.address}</span>
                            <a
                              href={mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="map-link-text"
                              onClick={(e) => e.stopPropagation()}
                            >
                              [ Bản đồ ]
                            </a>
                          </div>
                        </div>
                        <div className="accordion-arrow">
                          <FeatherIcon
                            name="chevron-down"
                            size={18}
                            className={`chevron-icon ${isExpanded ? 'rotated' : ''}`}
                          />
                        </div>
                      </div>

                      {/* Accordion Body: Showtimes Grid */}
                      {isExpanded && (
                        <div className="accordion-body">
                          <div className="format-label font-sf-rounded">2D Phụ đề</div>
                          <div className="showtime-slots-grid font-sf-rounded">
                            {cin.slots.map((st) => {
                              const startTime = new Date(st.startsAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              });

                              let endTime = '';
                              if (st.endsAt) {
                                endTime = new Date(st.endsAt).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                });
                              } else {
                                const d = new Date(st.startsAt);
                                d.setMinutes(d.getMinutes() + (movie?.durationMinutes || 120));
                                endTime = d.toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                });
                              }

                              return (
                                <button
                                  key={st.id}
                                  type="button"
                                  className="slot-pill-btn font-sf-rounded"
                                  onClick={() => navigate(`/showtime/${st.id}/seat`)}
                                  title={`Đặt vé: ${startTime} ~ ${endTime} (${st.availableSeatCount} ghế trống)`}
                                >
                                  <span className="slot-start-time">{startTime}</span>
                                  <span className="slot-tilde">~</span>
                                  <span className="slot-end-time">{endTime}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ĐÁNH GIÁ KHÁN GIẢ */}
        {activeTab === 'reviews' && (
          <div className="reviews-section-area">
            <MovieReviewsSection
              movieId={movie.id}
              movieTitle={movie.title}
              initialReviews={reviews}
            />
          </div>
        )}
      </div>

      {/* 3. MODAL TRAILER POPUP (KHI BẤM NÚT TRAILER) */}
      {showTrailerModal && (
        <div className="trailer-modal-backdrop trailer-modal-overlay" onClick={() => setShowTrailerModal(false)}>
          <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="trailer-modal-close btn-close-modal"
              onClick={() => setShowTrailerModal(false)}
            >
              ✕
            </button>
            <div className="trailer-iframe-box trailer-video-frame">
              <iframe
                src="https://www.youtube.com/embed/TJFVV2L8GKs?autoplay=1"
                title={`${movie.title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
