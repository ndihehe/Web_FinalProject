import React, { useState, useEffect } from 'react';
import FeatherIcon from './FeatherIcon';
import { getTrailerEmbedUrl, getYoutubeSearchUrl } from '../utils/trailerUtils';
import { fetchTrailerFromTmdb, getTmdbApiKey, setTmdbApiKey } from '../services/tmdbService';

export default function TrailerModal({ isOpen, onClose, movie }) {
  const [loading, setLoading] = useState(false);
  const [trailerData, setTrailerData] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');

  const movieTitle = movie?.title || '';
  const directTrailerUrl = movie?.trailerUrl ? getTrailerEmbedUrl(movie.trailerUrl) : null;

  useEffect(() => {
    if (!isOpen || !movieTitle) {
      setTrailerData(null);
      setLoading(false);
      setApiKeyError('');
      return;
    }

    // 1. Nếu phim đã có sẵn trailerUrl hợp lệ từ API/dữ liệu thì dùng trực tiếp
    if (directTrailerUrl) {
      setTrailerData({
        success: true,
        embedUrl: directTrailerUrl,
        title: `${movieTitle} Trailer`
      });
      return;
    }

    // 2. Tự động tìm kiếm qua TMDB API
    loadTrailerFromTmdb();
  }, [isOpen, movieTitle, directTrailerUrl]);

  // Hỗ trợ phím Escape để đóng modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadTrailerFromTmdb = async () => {
    setLoading(true);
    setApiKeyError('');
    try {
      const result = await fetchTrailerFromTmdb(movieTitle);
      setTrailerData(result);
    } catch (err) {
      setTrailerData({
        success: false,
        reason: 'ERROR',
        message: 'Đã xảy ra lỗi khi tìm trailer.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      setApiKeyError('Vui lòng nhập API Key hợp lệ');
      return;
    }
    setTmdbApiKey(apiKeyInput.trim());
    setApiKeyInput('');
    loadTrailerFromTmdb();
  };

  if (!isOpen) return null;

  return (
    <div className="trailer-modal-backdrop trailer-modal-overlay" onClick={onClose}>
      <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="trailer-modal-close btn-close-modal"
          onClick={onClose}
          title="Đóng trailer"
        >
          <FeatherIcon name="x" size={20} />
        </button>

        {/* 1. TRẠNG THÁI: ĐANG TÌM KIẾM TRAILER */}
        {loading && (
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '340px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.1)',
                borderTopColor: '#f97316',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }}
            />
            <h4 style={{ color: '#fff', fontSize: '17px', fontWeight: 600, marginBottom: '6px' }}>
              Đang tìm kiếm trailer chính thức...
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>
              Hệ thống đang tự động tìm trailer của "{movieTitle}" qua TMDB API
            </p>
          </div>
        )}

        {/* 2. TRẠNG THÁI: ĐÃ TÌM THẤY TRAILER -> PHÁT VIDEO */}
        {!loading && trailerData?.success && trailerData?.embedUrl && (
          <div className="trailer-iframe-box trailer-video-frame">
            <iframe
              src={trailerData.embedUrl}
              title={trailerData.title || `${movieTitle} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* 3. TRẠNG THÁI: CHƯA CÓ TMDB API KEY */}
        {!loading && !trailerData?.success && trailerData?.reason === 'NO_API_KEY' && (
          <div
            style={{
              padding: '40px 28px',
              textAlign: 'center',
              color: '#e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '560px',
              margin: '0 auto'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(249, 115, 22, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f97316',
                marginBottom: '16px'
              }}
            >
              <FeatherIcon name="key" size={28} />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Cần TMDB API Key để tự động tìm Trailer
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
              Để tìm kiếm trailer tự động cho mọi bộ phim mà <strong>không hardcode</strong>, bạn có thể thiết lập biến môi trường <code>VITE_TMDB_API_KEY</code> trong file <code>.env</code> hoặc nhập nhanh bên dưới:
            </p>

            <div style={{ width: '100%', display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Nhập TMDB API v3 Key..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                style={{
                  background: '#f97316',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Lưu & Tìm
              </button>
            </div>
            {apiKeyError && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>
                {apiKeyError}
              </span>
            )}

            <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '13px' }}>
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#38bdf8', textDecoration: 'none' }}
              >
                Lấy API Key miễn phí tại themoviedb.org ↗
              </a>
              <span style={{ color: '#475569' }}>•</span>
              <a
                href={getYoutubeSearchUrl(movieTitle)}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}
              >
                Xem ngay trên YouTube ↗
              </a>
            </div>
          </div>
        )}

        {/* 4. TRẠNG THÁI: KHÔNG TÌM THẤY TRAILER HOẶC LỖI KHÁC */}
        {!loading && !trailerData?.success && trailerData?.reason !== 'NO_API_KEY' && (
          <div
            style={{
              padding: '50px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px'
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                marginBottom: '16px'
              }}
            >
              <FeatherIcon name="film" size={26} />
            </div>
            <h4 style={{ color: '#fff', fontSize: '17px', fontWeight: 600, marginBottom: '8px' }}>
              Không tìm thấy trailer tự động trên TMDB
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '400px', marginBottom: '20px' }}>
              {trailerData?.message || `Không có video trailer chính thức trên hệ thống cho "${movieTitle}".`}
            </p>
            <a
              href={getYoutubeSearchUrl(movieTitle)}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ef4444',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              <FeatherIcon name="youtube" size={16} />
              <span>Tìm kiếm trailer trên YouTube</span>
              <FeatherIcon name="external-link" size={14} />
            </a>
          </div>
        )}

        {/* FOOTER CỦA MODAL */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            background: 'rgba(0, 0, 0, 0.4)'
          }}
        >
          <span style={{ color: '#cbd5e1', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
            {movieTitle}
          </span>
          <a
            href={getYoutubeSearchUrl(movieTitle)}
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#94a3b8',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <span>Mở trên YouTube</span>
            <FeatherIcon name="external-link" size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
