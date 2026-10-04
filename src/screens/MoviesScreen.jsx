import React, { useState, useEffect } from 'react';
import { cinemaService, GENRES } from '../services/cinemaService';
import { useRouter } from '../router';
import FeatherIcon from '../components/FeatherIcon';

export default function MoviesScreen() {
  const { navigate, queryParams } = useRouter();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(queryParams.q || '');
  const [selectedGenre, setSelectedGenre] = useState(queryParams.genre || '');
  const [selectedStatus, setSelectedStatus] = useState(queryParams.status || '');

  useEffect(() => {
    fetchMovies();
  }, [searchQuery, selectedGenre, selectedStatus]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await cinemaService.getMovies({
        q: searchQuery,
        genre: selectedGenre,
        status: selectedStatus
      });
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      setMovies(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container movies-screen">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <span className="breadcrumb-link" onClick={() => navigate('/')}>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Danh mục Phim</span>
        </div>

        {/* Tiêu đề trang */}
        <div className="page-header">
          <span className="section-label spotlight-text font-sf-rounded">DANH MỤC ĐIỆN ẢNH</span>
          <h1 className="page-title spotlight-text font-sf-rounded">TẤT CẢ PHIM TẠI BETA CINEMA</h1>
        </div>

        {/* Thanh công cụ tìm kiếm và lọc Glassmorphism */}
        <div className="movies-filter-bar glass-filter-bar">
          {/* Ô tìm kiếm */}
          <div className="search-input-wrapper">
            <FeatherIcon name="search" size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Tìm theo tên phim, đạo diễn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <FeatherIcon name="x" size={16} />
              </button>
            )}
          </div>

          {/* Lọc Trạng Thái */}
          <div className="status-tabs">
            <button
              className={`status-tab ${selectedStatus === '' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('')}
            >
              TẤT CẢ ({movies.length})
            </button>
            <button
              className={`status-tab ${selectedStatus === 'NOW_SHOWING' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('NOW_SHOWING')}
            >
              ĐANG CHIẾU
            </button>
            <button
              className={`status-tab ${selectedStatus === 'COMING_SOON' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('COMING_SOON')}
            >
              SẮP CHIẾU
            </button>
          </div>

          {/* Lọc Thể loại */}
          <div className="genre-dropdown-wrapper">
            <select
              className="genre-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">Tất cả thể loại</option>
              {GENRES.map((g) => (
                <option key={g.code} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lưới danh sách phim tinh gọn theo mẫu */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải danh sách phim...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="empty-state">
            <FeatherIcon name="film" size={48} className="empty-icon" />
            <h3>Không tìm thấy phim phù hợp</h3>
            <p>Vui lòng thử tìm kiếm với từ khóa khác hoặc bỏ các bộ lọc đang chọn.</p>
            <button className="btn-reset-filter" onClick={() => { setSearchQuery(''); setSelectedGenre(''); setSelectedStatus(''); }}>
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
              <div key={movie.id} className="movie-card-clean">
                <div className="movie-poster-box" onClick={() => navigate(`/movie/${movie.id}`)}>
                  <img src={movie.posterUrl} alt={movie.title} className="movie-poster-img" loading="lazy" />
                </div>

                <div className="movie-card-info">
                  <h3
                    className="movie-card-title spotlight-text font-sf-rounded"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                    title={movie.title}
                  >
                    {movie.title}
                  </h3>

                  <div className="movie-card-actions">
                    <button
                      className="btn-movie-detail font-sf-rounded"
                      onClick={() => navigate(`/movie/${movie.id}`)}
                    >
                      Chi tiết
                    </button>
                    {movie.status === 'NOW_SHOWING' ? (
                      <button
                        className="btn-movie-book font-sf-rounded"
                        onClick={() => navigate(`/movie/${movie.id}`)}
                      >
                        Đặt vé ngay
                      </button>
                    ) : (
                      <button className="btn-movie-coming font-sf-rounded" disabled>
                        Sắp chiếu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
