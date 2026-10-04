import React, { useState, useEffect, useRef } from 'react';
import { cinemaService } from '../services/cinemaService';
import { useRouter } from '../router';
import FeatherIcon from '../components/FeatherIcon';

export default function CinemaDetailScreen() {
  const { params, navigate } = useRouter();
  const cinemaId = params.id || 'cin-01';

  const [cinema, setCinema] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [activeTrailerMovie, setActiveTrailerMovie] = useState(null);

  const carouselRef = useRef(null);

  // Sinh 7 ngày liên tiếp chuẩn lịch chiếu (Hôm nay, Chủ nhật, Thứ 2, Thứ 3...)
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dateOptions = Array.from({ length: 7 }).map((_, offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      dayOfWeek: offset === 0 ? 'Hôm nay' : dayNames[d.getDay()],
      dateNumber: d.getDate(),
      fullDate: d.toISOString().split('T')[0]
    };
  });

  useEffect(() => {
    loadData();
  }, [cinemaId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cinRes, showRes, movieRes] = await Promise.all([
        cinemaService.getCinemaDetail(cinemaId).catch(() => cinemaService.getCinemas().then(res => {
          const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
          return { data: list[0] || null };
        })),
        cinemaService.getCinemaShowtimes(cinemaId),
        cinemaService.getMovies({ status: 'NOW_SHOWING', size: 10 })
      ]);
      setCinema(cinRes?.data || null);
      setShowtimes(Array.isArray(showRes?.data) ? showRes.data : (showRes?.data?.items || []));
      setNowShowingMovies(Array.isArray(movieRes?.data) ? movieRes.data : (movieRes?.data?.items || []));
    } catch (e) {
      console.error('Lỗi tải dữ liệu rạp:', e);
    } finally {
      setLoading(false);
    }
  };

  // Lọc suất chiếu theo ngày được chọn
  const selectedDateStr = dateOptions[selectedDateIndex]?.fullDate;
  const dateFilteredShowtimes = (Array.isArray(showtimes) ? showtimes : []).filter((st) => {
    if (!selectedDateStr) return true;
    const stDateStr = new Date(st.startsAt).toISOString().split('T')[0];
    return stDateStr === selectedDateStr;
  });

  // Gom nhóm suất chiếu theo Phim cho rạp hiện tại
  const showtimesByMovie = dateFilteredShowtimes.reduce((acc, st) => {
    const movId = st.movieId || st.id;
    if (!acc[movId]) {
      acc[movId] = {
        movieTitle: st.movieTitle,
        movieId: movId,
        format: st.format || '2D Phụ đề',
        slots: []
      };
    }
    acc[movId].slots.push(st);
    return acc;
  }, {});

  // Scroll carousel ngang (5 phim mỗi lần bấm)
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -1030 : 1030;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="page-container loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin rạp chiếu và lịch phim...</p>
      </div>
    );
  }

  if (!cinema) {
    return (
      <div className="page-container empty-container">
        <h2>Không tìm thấy rạp chiếu</h2>
        <button className="btn-movie-book font-sf-rounded" onClick={() => navigate('/')}>
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cinema.name + ' ' + cinema.address)}`;

  return (
    <div className="cinema-detail-screen">
      {/* =========================================================================
          PHẦN 1: THÔNG TIN RẠP TRÊN ĐẦU TRANG (CHUẨN STYLE new_cinema_1.png)
          ========================================================================= */}
      <div
        className="cinema-panoramic-hero"
        style={{ backgroundImage: `url(${cinema.imageUrl || '/images/aovis/cinema1.jpg'})` }}
      >
        <div className="cinema-hero-dark-overlay" />

        <div className="container cinema-hero-container">
          {/* Breadcrumb */}
          <div className="breadcrumb-nav font-sf-rounded">
            <span className="breadcrumb-link" onClick={() => navigate('/')}>Trang chủ</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{cinema.name}</span>
          </div>

          <div className="cinema-brand-hero-content">
            {/* Square Logo Card */}
            <div className="cinema-square-logo-box" style={{ background: '#0e1118', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img 
                src="/images/logo_tdtdt_transparent.png" 
                alt="TDTDT Logo" 
                style={{ width: '90%', height: 'auto', objectFit: 'contain' }} 
              />
            </div>

            {/* Info Column */}
            <div className="cinema-hero-meta-col">
              <h1 className="cinema-brand-title font-sf-rounded spotlight-text">
                {cinema.name}
              </h1>
              <p className="cinema-brand-subtitle font-sf-rounded">
                Hệ thống rạp chiếu phim tiêu chuẩn quốc tế hàng đầu Việt Nam
              </p>

              <div className="cinema-brand-rating-row font-sf-rounded">
                <div className="star-rating-box">
                  <span className="stars-icons">⭐⭐⭐⭐⭐</span>
                  <span className="rating-score">5.0</span>
                </div>
                <span className="rating-divider">•</span>
                <span className="rating-count">👤 10.569 đánh giá</span>
                <span className="rating-divider">•</span>
                <span className="rating-address">
                  📍 {cinema.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PHẦN 2: LỊCH CHIẾU PHIM CUỘN XUỐNG (CHUẨN STYLE new_cinema_2.png & user_upload_1.png)
          ========================================================================= */}
      <div className="container cinema-schedule-section-wrap">
        <div className="cinema-schedule-box-card">
          {/* Subheader: Logo nhỏ + Tên rạp + Địa chỉ + Bản đồ */}
          <div className="schedule-box-header">
            <div className="schedule-box-logo-mini" style={{ background: '#0e1118', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img 
                src="/images/logo_tdtdt_transparent.png" 
                alt="TDTDT Logo" 
                style={{ width: '92%', height: 'auto', objectFit: 'contain' }} 
              />
            </div>
            <div className="schedule-box-info">
              <h2 className="schedule-box-title font-sf-rounded">
                Lịch chiếu phim {cinema.name}
              </h2>
              <div className="schedule-box-address font-sf-rounded">
                <span>{cinema.address}</span>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="schedule-map-link"
                >
                  [ Bản đồ ]
                </a>
              </div>
            </div>
          </div>

          {/* Date Selector Pills (7 ngày liên tiếp) */}
          <div className="schedule-date-pills-bar">
            {dateOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                className={`schedule-date-btn font-sf-rounded ${selectedDateIndex === idx ? 'active' : ''}`}
                onClick={() => setSelectedDateIndex(idx)}
              >
                <span className="date-number">{opt.dateNumber}</span>
                <span className="date-day-label">{opt.dayOfWeek}</span>
              </button>
            ))}
          </div>

          {/* Discount / Policy Banner (Style new_cinema_2.png) */}
          <div className="schedule-discount-banner font-sf-rounded">
            <FeatherIcon name="tag" size={15} className="discount-icon" />
            <span>
              Ưu đãi 55K/vé 2D thứ 3 hàng tuần; 89K/vé 2D cả tuần không giới hạn cho thành viên Beta Rewards
            </span>
          </div>

          {/* Danh sách các phim có chiếu ở rạp - CUỘN DỌC CÓ THANH TRƯỢT (Scrollable List) */}
          <div className="cinema-schedule-scroll-list">
            {Object.keys(showtimesByMovie).length === 0 ? (
              <div className="empty-schedule-state font-sf-rounded">
                <FeatherIcon name="calendar" size={42} />
                <h3>Chưa có suất chiếu cho ngày đã chọn</h3>
                <p>Vui lòng chuyển sang ngày khác để xem lịch chiếu tại {cinema.name}.</p>
              </div>
            ) : (
              Object.values(showtimesByMovie).map((item, idx) => {
                const matchedMovie = nowShowingMovies.find(m => m.id === item.movieId);
                const posterUrl = matchedMovie?.posterUrl || '/images/aovis/movie1.jpg';
                const ageRating = matchedMovie?.ageRating || '18+';
                const genresText = matchedMovie?.genres?.join(', ') || 'Hành Động, Gay Cấn';

                // Phân nhóm suất chiếu thành 2D Phụ đề và Superplex / IMAX nếu có
                const primarySlots = item.slots.slice(0, 8);
                const superplexSlots = item.slots.slice(8);

                return (
                  <div key={item.movieId} className="cinema-schedule-movie-row">
                    {/* Poster phim bên trái */}
                    <div className="movie-row-poster-box">
                      <img
                        src={posterUrl}
                        alt={item.movieTitle}
                        className="movie-row-poster-img"
                        onError={(e) => { e.target.src = '/images/aovis/movie1.jpg'; }}
                      />
                    </div>

                    {/* Thông tin phim và các khung giờ chiếu bên phải */}
                    <div className="movie-row-details">
                      <div className="movie-row-title-area">
                        <span className="movie-age-badge font-sf-rounded">{ageRating}</span>
                        <h3 className="movie-row-title font-sf-rounded">{item.movieTitle}</h3>
                      </div>

                      <div className="movie-row-genre font-sf-rounded">
                        {genresText}
                      </div>

                      {/* Format 1: 2D Phụ đề */}
                      <div className="movie-format-group">
                        <h4 className="format-heading font-sf-rounded">2D Phụ đề</h4>
                        <div className="showtime-pills-row font-sf-rounded">
                          {primarySlots.map((st) => {
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
                            }

                            return (
                              <button
                                key={st.id}
                                type="button"
                                className="cinema-slot-pill font-sf-rounded"
                                onClick={() => navigate(`/showtime/${st.id}/seat`)}
                                title={`Đặt vé suất ${startTime}`}
                              >
                                <span className="slot-start">{startTime}</span>
                                {endTime && (
                                  <>
                                    <span className="slot-sep">~</span>
                                    <span className="slot-end">{endTime}</span>
                                  </>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Format 2: 2D Phụ đề | SUPERPLEX (nếu có suất chiếu mở rộng) */}
                      {superplexSlots.length > 0 && (
                        <div className="movie-format-group">
                          <h4 className="format-heading font-sf-rounded">2D Phụ đề | SUPERPLEX</h4>
                          <div className="showtime-pills-row font-sf-rounded">
                            {superplexSlots.map((st) => {
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
                              }

                              return (
                                <button
                                  key={st.id}
                                  type="button"
                                  className="cinema-slot-pill font-sf-rounded"
                                  onClick={() => navigate(`/showtime/${st.id}/seat`)}
                                  title={`Đặt vé suất ${startTime}`}
                                >
                                  <span className="slot-start">{startTime}</span>
                                  {endTime && (
                                    <>
                                      <span className="slot-sep">~</span>
                                      <span className="slot-end">{endTime}</span>
                                    </>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          PHẦN 3: PHIM ĐANG CHIẾU TẠI RẠP (BACKGROUND HÀNG GHẾ ĐỎ - CHUẨN STYLE user_upload_2.png & 3.png)
          ========================================================================= */}
      <section className="now-showing-hall-section">
        {/* Background Hàng ghế rạp đỏ */}
        <div className="hall-background-image" />
        <div className="hall-dark-gradient" />

        <div className="container hall-content-container">
          <h2 className="hall-section-title font-sf-rounded spotlight-text">
            Phim đang chiếu
          </h2>

          <div className="hall-carousel-wrapper">
            {/* Nút lướt trái */}
            <button
              type="button"
              className="carousel-nav-btn prev-btn font-sf-rounded"
              onClick={() => scrollCarousel('left')}
              title="Xem các phim trước"
            >
              <FeatherIcon name="chevron-left" size={20} />
            </button>

            {/* Danh sách phim trượt ngang */}
            <div className="hall-movies-track" ref={carouselRef}>
              {nowShowingMovies.map((m, idx) => (
                <div
                  key={m.id}
                  className="hall-movie-card"
                  onClick={() => setActiveTrailerMovie(m)}
                  title={`Xem Trailer: ${m.title}`}
                >
                  <div className="hall-poster-box">
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="hall-poster-img"
                      onError={(e) => { e.target.src = '/images/aovis/movie1.jpg'; }}
                    />

                    {/* Số thứ tự xếp hạng cỡ lớn góc dưới (1, 2, 3, 4, 5...) */}
                    <span className="ranking-number-watermark font-sf-rounded">
                      {idx + 1}
                    </span>

                    {/* Nút Play tròn xem Trailer */}
                    <div className="hall-play-button-overlay">
                      <div className="hall-play-circle">
                        <FeatherIcon name="play" size={16} />
                      </div>
                    </div>

                    {/* Badges góc trên */}
                    <div className="hall-top-badges">
                      <span className="hall-age-tag font-sf-rounded">{m.ageRating}</span>
                      {idx === 2 && <span className="hall-sneak-tag font-sf-rounded">SNEAKSHOW</span>}
                      {idx === 0 && <span className="hall-presale-tag font-sf-rounded">ĐẶT TRƯỚC</span>}
                    </div>
                  </div>

                  <div className="hall-movie-info">
                    <h4 className="hall-movie-title font-sf-rounded">{m.title}</h4>
                    <p className="hall-movie-genre font-sf-rounded">{m.genres?.join(', ')}</p>
                    <div className="hall-movie-rating font-sf-rounded">
                      <span>⭐ {m.averageRating || '9.6'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nút lướt phải */}
            <button
              type="button"
              className="carousel-nav-btn next-btn font-sf-rounded"
              onClick={() => scrollCarousel('right')}
              title="Xem các phim tiếp theo"
            >
              <FeatherIcon name="chevron-right" size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODAL TRAILER POPUP (KHI CLICK VÀO PHIM TRONG MỤC PHIM ĐANG CHIẾU)
          ========================================================================= */}
      {activeTrailerMovie && (
        <div className="trailer-modal-backdrop trailer-modal-overlay" onClick={() => setActiveTrailerMovie(null)}>
          <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="trailer-modal-close btn-close-modal"
              onClick={() => setActiveTrailerMovie(null)}
              title="Đóng trailer"
            >
              ✕
            </button>
            <div className="trailer-iframe-box">
              <iframe
                src={`${activeTrailerMovie.trailerUrl || 'https://www.youtube.com/embed/TJFVV2L8GKs'}?autoplay=1`}
                title={`${activeTrailerMovie.title} Trailer`}
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
