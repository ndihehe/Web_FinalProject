import React, { useState, useEffect, useRef } from 'react';
import { cinemaService } from '../services/cinemaService';
import { useRouter } from '../router';
import FeatherIcon from '../components/FeatherIcon';
import { getTrailerEmbedUrl, getYoutubeSearchUrl } from '../utils/trailerUtils';

export default function CinemaDetailScreen() {
  const { params, navigate } = useRouter();
  const [cinemasList, setCinemasList] = useState([]);
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

  const selectedDateStr = dateOptions[selectedDateIndex]?.fullDate;

  useEffect(() => {
    loadData();
  }, [params.id]);

  useEffect(() => {
    const targetId = cinema?.id || params.id;
    if (!targetId || !selectedDateStr) return;
    cinemaService.getCinemaShowtimes(targetId, { date: selectedDateStr })
      .then((res) => {
        setShowtimes(Array.isArray(res?.data) ? res.data : (res?.data?.items || []));
      })
      .catch(() => setShowtimes([]));
  }, [cinema?.id, selectedDateIndex, selectedDateStr]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allCinemas = await cinemaService.getCinemas().catch(() => null);
      const list = Array.isArray(allCinemas?.data) ? allCinemas.data : (allCinemas?.data?.items || []);
      setCinemasList(list);

      let resolvedId = params.id;
      let cinData = null;
      if (!resolvedId) {
        if (list.length > 0) {
          resolvedId = list[0].id;
          cinData = list[0];
        } else {
          resolvedId = '1';
        }
      } else {
        cinData = list.find((c) => String(c.id) === String(resolvedId)) || null;
      }

      const effectiveDate = dateOptions[0]?.fullDate;
      const weeklyShowtimePromises = dateOptions.map((d) =>
        cinemaService.getCinemaShowtimes(resolvedId, { date: d.fullDate }).catch(() => ({ data: [] }))
      );

      const [cinRes, movieRes, ...weeklyShowResults] = await Promise.all([
        cinData ? Promise.resolve({ data: cinData }) : cinemaService.getCinemaDetail(resolvedId).catch(() => null),
        cinemaService.getMovies({ size: 20 }).catch(() => ({ data: [] })),
        ...weeklyShowtimePromises
      ]);

      const allMovies = Array.isArray(movieRes?.data) ? movieRes.data : (movieRes?.data?.items || []);
      const todayShowtimes = Array.isArray(weeklyShowResults[0]?.data) ? weeklyShowResults[0].data : (weeklyShowResults[0]?.data?.items || []);

      // Thu thập toàn bộ các suất chiếu trong tuần của rạp để tìm ra các phim thực sự chiếu tại rạp này
      const allWeeklyShowtimes = weeklyShowResults.flatMap((res) =>
        Array.isArray(res?.data) ? res.data : (res?.data?.items || [])
      );

      const cinemaMovieIds = new Set(allWeeklyShowtimes.map((st) => String(st.movieId || st.id)));

      // Lọc: CHỈ giữ lại các phim thực sự có suất chiếu tại rạp này
      const filteredMovies = allMovies.filter((m) => cinemaMovieIds.has(String(m.id)));

      setCinema(cinRes?.data || null);
      setShowtimes(todayShowtimes);
      setNowShowingMovies(filteredMovies);
    } catch (e) {
      console.error('Lỗi tải dữ liệu rạp:', e);
    } finally {
      setLoading(false);
    }
  };

  // Lọc suất chiếu theo ngày được chọn
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
                <span className="rating-address">
                  {cinema.address}
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
        {/* Thanh chọn cụm rạp trong hệ thống (Dynamic từ API) */}
        {cinemasList.length > 1 && (
          <div className="cinema-switcher-pills font-sf-rounded">
            {cinemasList.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`cinema-switcher-btn ${String(cinema?.id) === String(c.id) ? 'active' : ''}`}
                onClick={() => navigate(`/cinema/${c.id}`)}
              >
                <FeatherIcon name="map-pin" size={14} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        )}

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
            Phim đang chiếu tại rạp
          </h2>

          {nowShowingMovies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.6)' }} className="font-sf-rounded">
              <p>Hiện tại rạp đang cập nhật lịch chiếu cho các phim mới trong tuần.</p>
            </div>
          ) : (
            <div className="hall-carousel-wrapper">
              {/* Nút lướt trái */}
              <button
                type="button"
                className="carousel-nav-btn prev-btn font-sf-rounded"
                onClick={() => scrollCarousel('left')}
                disabled={nowShowingMovies.length <= 5}
                title={nowShowingMovies.length <= 5 ? "Đã hiển thị tất cả phim đang chiếu" : "Xem các phim trước"}
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
                        src={m.posterUrl || '/images/aovis/movie1.jpg'}
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
                disabled={nowShowingMovies.length <= 5}
                title={nowShowingMovies.length <= 5 ? "Đã hiển thị tất cả phim đang chiếu" : "Xem các phim tiếp theo"}
              >
                <FeatherIcon name="chevron-right" size={20} />
              </button>
            </div>
          )}
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
                src={getTrailerEmbedUrl(activeTrailerMovie?.trailerUrl, activeTrailerMovie?.title)}
                title={`${activeTrailerMovie?.title || 'Phim'} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <a
                href={getYoutubeSearchUrl(activeTrailerMovie?.title)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#94a3b8',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <span>Mở tìm kiếm trực tiếp trên YouTube ↗</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
