import React from 'react';
import FeatherIcon from './FeatherIcon';

export default function Footer({ onNavigate }) {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', padding: '60px 40px 30px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        {/* Brand */}
        <div>
          <div className="brand-logo" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="/images/logo_tdtdt_transparent.png" 
              alt="TDTDT Cinema Logo" 
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
            />
            <span className="brand-name" style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '2px', color: '#f5e6cc', textTransform: 'uppercase' }}>
              CINEMA
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            Hệ thống rạp chiếu phim TDTDT Cinema hiện đại mang lại trải nghiệm điện ảnh đỉnh cao với chất lượng âm thanh Dolby Atmos và màn hình sắc nét.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Điều Hướng Nhanh</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <li><a href="#home" onClick={() => onNavigate('home')} style={{ transition: 'color 0.2s' }}>Trang chủ</a></li>
            <li><a href="#movies" onClick={() => onNavigate('movies')}>Phim đang chiếu</a></li>
            <li><a href="#cinemas" onClick={() => onNavigate('cinemas')}>Cụm rạp & Giá vé</a></li>
            <li><a href="#fnb" onClick={() => onNavigate('fnb')}>Combo Bắp nước</a></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Chính Sách & Quy Định</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <li>Quy định độ tuổi khán giả</li>
            <li>Chính sách bảo mật thông tin</li>
            <li>Điều khoản thanh toán & hoàn tiền</li>
            <li>Chính sách thành viên TDTDT VIP</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Liên Hệ Với Chúng Tôi</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FeatherIcon name="phone" size={16} color="var(--orange-primary)" /> Hotline: 1900 8899
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FeatherIcon name="mail" size={16} color="var(--orange-primary)" /> Email: support@tdtdtcinemas.vn
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FeatherIcon name="map-pin" size={16} color="var(--orange-primary)" /> Lê Lợi, Bến Nghé, Quận 1, TP.HCM
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-dim)' }}>
        © {new Date().getFullYear()} TDTDT Cinema. Toàn quyền sở hữu. Hệ thống rạp chiếu phim hàng đầu.
      </div>
    </footer>
  );
}
