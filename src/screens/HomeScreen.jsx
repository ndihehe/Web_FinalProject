import React, { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import AovisFeatureBoxes from '../components/AovisFeatureBoxes';
import FeatherIcon from '../components/FeatherIcon';
import { useRouter } from '../router';
import { cinemaService } from '../services/cinemaService';

export default function HomeScreen() {
  const { navigate } = useRouter();
  const [nowShowing, setNowShowing] = useState([]);
  const [featuredCinemas, setFeaturedCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHome() {
      try {
        const res = await cinemaService.getHome();
        if (res && res.data) {
          let moviesList = res.data.nowShowing || [];
          if (moviesList.length === 0) {
            const allMovies = await cinemaService.getMovies({ size: 10 }).catch(() => null);
            moviesList = Array.isArray(allMovies?.data) ? allMovies.data : (allMovies?.data?.items || []);
          }
          setNowShowing(moviesList);

          let cinemasList = res.data.featuredCinemas || [];
          if (cinemasList.length === 0) {
            const allCinemas = await cinemaService.getCinemas({ size: 10 }).catch(() => null);
            cinemasList = Array.isArray(allCinemas?.data) ? allCinemas.data : (allCinemas?.data?.items || []);
          }
          setFeaturedCinemas(cinemasList);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu trang chủ:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHome();
  }, []);

  const handleSelectMovie = (movie) => {
    navigate(`/movie/${movie.id}`);
  };

  const handleBookTicket = (movie) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="home-screen">
      {/* 1. HERO BANNER SLIDER CHUẨN ĐIỆN ẢNH */}
      <HeroSlider
        movies={nowShowing}
        onSelectMovie={handleSelectMovie}
        onBookTicket={handleBookTicket}
      />

      {/* 2. TOP 3 PHIM LƯỢT XEM SPOTLIGHT (FORM CHỮ NHẬT NGANG TỐI GIẢN) */}
      <AovisFeatureBoxes />

      {/* 3. SHOWCASE PHIM ĐANG CHIẾU TIÊU ĐIỂM (TỐI GIẢN, TINH GỌN, KHÔNG TRÙNG LẶP) */}
      <section className="section-wrapper home-featured-section" id="featured-movies">
        <div className="section-header-split">
          <div>
            <div className="section-subtitle">SPOTLIGHT CINEMA</div>
            <h2 className="section-title spotlight-text font-sf-rounded">Phim Nổi Bật</h2>
          </div>
          <button
            className="btn-view-all-link"
            onClick={() => navigate('/movie')}
            title="Xem danh sách đầy đủ tất cả các phim"
          >
            <span>Xem tất cả phim</span>
            <FeatherIcon name="arrow-right" size={16} />
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải danh sách phim nổi bật...</p>
          </div>
        ) : (
          <div className="home-movies-showcase-grid">
            {nowShowing.slice(0, 4).map((movie) => (
              <div
                key={movie.id}
                className="showcase-movie-card"
                onClick={() => handleSelectMovie(movie)}
              >
                <div className="showcase-poster-box">
                  <img
                    src={movie.posterUrl || '/images/aovis/movie1.jpg'}
                    alt={movie.title}
                    className="showcase-poster-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/aovis/movie1.jpg';
                    }}
                  />
                  <span className="movie-age-badge">{movie.ageRating}</span>
                  <div className="showcase-poster-overlay">
                    <button
                      className="btn-quick-detail"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/movie/${movie.id}`);
                      }}
                    >
                      <FeatherIcon name="info" size={16} /> Chi tiết
                    </button>
                  </div>
                </div>

                <div className="showcase-movie-info">
                  <div className="showcase-meta-row">
                    <span className="showcase-rating">⭐ {movie.averageRating}</span>
                    <span className="showcase-duration">{movie.durationMinutes} phút</span>
                  </div>
                  <h3 className="showcase-movie-title">{movie.title}</h3>
                  <p className="showcase-genre-text">{movie.genres?.join(', ')}</p>

                  <button
                    className="btn-book-showcase"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/movie/${movie.id}`);
                    }}
                  >
                    <FeatherIcon name="ticket" size={15} /> Đặt Vé
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. SHOWCASE CỤM RẠP BETA TIÊU ĐIỂM (TỐI GIẢN, HƯỚNG VÀO /cinema) */}
      <section className="section-wrapper home-featured-section" id="featured-cinemas">
        <div className="section-header">
          <div>
            <div className="section-subtitle">NATIONWIDE CINEMAS</div>
            <h2 className="section-title spotlight-text font-sf-rounded">Cụm Rạp Nổi Bật</h2>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải danh sách cụm rạp nổi bật...</p>
          </div>
        ) : (
          <div className="home-cinemas-showcase-grid">
            {featuredCinemas.slice(0, 3).map((cinema) => (
              <div
                key={cinema.id}
                className="showcase-cinema-card"
                onClick={() => navigate(`/cinema/${cinema.id}`)}
              >
                <div className="showcase-cinema-img-box">
                  <img
                    src={cinema.imageUrl || '/images/aovis/cinema1.jpg'}
                    alt={cinema.name}
                    className="showcase-cinema-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/aovis/cinema1.jpg';
                    }}
                  />
                  <span className="showcase-city-badge">{cinema.cityName}</span>
                </div>

                <div className="showcase-cinema-info">
                  <h3 className="showcase-cinema-name spotlight-text">{cinema.name}</h3>
                  <p className="showcase-cinema-address">
                    <FeatherIcon name="map-pin" size={14} />
                    <span>{cinema.address}</span>
                  </p>
                  <p className="showcase-cinema-hotline">
                    <FeatherIcon name="phone" size={14} />
                    <span>{cinema.phone}</span>
                  </p>

                  <button
                    className="btn-cinema-showtimes-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/cinema/${cinema.id}`);
                    }}
                  >
                    <span>Xem Lịch Chiếu</span>
                    <FeatherIcon name="chevron-right" size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
