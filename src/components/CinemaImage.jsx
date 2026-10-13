import React, { useState, useEffect } from 'react';
import FeatherIcon from './FeatherIcon';
import { fetchCinemaImage } from '../services/cinemaImageService';

export default function CinemaImage({ cinema, alt = '', className = '', style = {}, isBackground = false, children }) {
  const [imageUrl, setImageUrl] = useState(cinema?.imageUrl || null);
  const [loading, setLoading] = useState(!cinema?.imageUrl);

  useEffect(() => {
    let isMounted = true;
    if (cinema?.imageUrl && !cinema.imageUrl.includes('cinema1.jpg')) {
      setImageUrl(cinema.imageUrl);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchCinemaImage(cinema).then((url) => {
      if (isMounted) {
        setImageUrl(url);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [cinema?.id, cinema?.name]);

  // Nếu dùng dạng Background Hero
  if (isBackground) {
    const bgStyle = imageUrl
      ? { backgroundImage: `url(${imageUrl})`, ...style }
      : { background: 'linear-gradient(135deg, #1e293b, #0f172a)', ...style };

    return (
      <div className={className} style={bgStyle}>
        {children}
      </div>
    );
  }

  // Dạng thẻ <img> thông thường
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt || cinema?.name || 'Rạp chiếu'}
        className={className}
        style={style}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // Trạng thái đang tải ảnh hoặc không có ảnh: hiển thị khung placeholder hiện đại (KHÔNG dùng link ảnh cứng)
  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        ...style
      }}
    >
      <FeatherIcon name="film" size={24} />
      <span style={{ fontSize: '12px', marginTop: '6px', fontWeight: 500, padding: '0 8px', textAlign: 'center' }}>
        {cinema?.name || 'Rạp chiếu phim'}
      </span>
    </div>
  );
}
