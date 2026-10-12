import React from 'react';
import { useRouter } from '../router';

export default function Footer() {
  const { navigate } = useRouter();

  return (
    <footer
      style={{
        background: 'var(--bg-secondary, #0b0d14)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '46px 20px 34px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '12px'
      }}
    >
      {/* Logo web to nằm chính giữa thanh */}
      <div
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '14px',
          transition: 'transform 0.25s ease'
        }}
        title="Về trang chủ TDTDT Cinema"
      >
        <img
          src="/images/logo_tdtdt_transparent.png"
          alt="TDTDT Cinema Logo"
          style={{
            height: '64px',
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.7))'
          }}
        />
        <span
          className="brand-name font-sf-rounded"
          style={{
            fontSize: '24px',
            fontWeight: 900,
            letterSpacing: '3px',
            color: '#f5e6cc',
            textTransform: 'uppercase'
          }}
        >
          CINEMA
        </span>
      </div>

      {/* Dòng bản quyền tinh tế bên dưới */}
      <div
        style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.45)',
          letterSpacing: '0.4px',
          marginTop: '4px'
        }}
      >
        © {new Date().getFullYear()} TDTDT Cinema. Toàn quyền sở hữu. Hệ thống rạp chiếu phim hàng đầu.
      </div>
    </footer>
  );
}
