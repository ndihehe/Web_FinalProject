import React, { useEffect } from 'react';
import FeatherIcon from './FeatherIcon';
import { useAuthModal } from '../context/AuthModalContext';

export default function ClapperAuthModal() {
  const { isClapperOpen, closeClapperModal, clapperMessage, openAuthModal } = useAuthModal();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isClapperOpen) {
        closeClapperModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClapperOpen, closeClapperModal]);

  if (!isClapperOpen) return null;

  const handleLoginClick = () => {
    closeClapperModal();
    openAuthModal('login');
  };

  const handleRegisterClick = () => {
    closeClapperModal();
    openAuthModal('register');
  };

  return (
    <div className="clapper-overlay" onClick={closeClapperModal}>
      <div className="clapper-modal-card font-sf-rounded" onClick={(e) => e.stopPropagation()}>
        {/* Nút đóng góc phải */}
        <button
          type="button"
          className="clapper-close-btn"
          onClick={closeClapperModal}
          title="Đóng thông báo"
        >
          <FeatherIcon name="x" size={18} />
        </button>

        {/* 1. THANH GÕ CLAPPERBOARD PHÍA TRÊN (ANIMATED SNAP MOTION) */}
        <div className="clapper-top-stick">
          <div className="clapper-pivot-screw" title="Clapper Pivot" />
          <div className="clapper-stripes" />
        </div>

        {/* 2. THANH CỐ ĐỊNH NỐI BẢNG */}
        <div className="clapper-sub-stick">
          <div className="clapper-stripes" />
        </div>

        {/* 3. THÂN BẢNG SLATE CHÍNH */}
        <div className="clapper-slate-body">
          {/* Hàng thông tin điện ảnh (Movie Slate Metadata) */}
          <div className="clapper-slate-grid">
            <div className="clapper-grid-cell">
              <span className="clapper-cell-label">PRODUCTION</span>
              <span className="clapper-cell-val font-chinese">TDTDT CINEMA</span>
            </div>
            <div className="clapper-grid-cell">
              <span className="clapper-cell-label">SCENE</span>
              <span className="clapper-cell-val">AUTH REQ</span>
            </div>
            <div className="clapper-grid-cell">
              <span className="clapper-cell-label">TAKE</span>
              <span className="clapper-cell-val">01</span>
            </div>
          </div>

          {/* Vùng nội dung thông báo chính */}
          <div className="clapper-main-notice">
            <div className="clapper-icon-badge">
              <FeatherIcon name="lock" size={28} />
            </div>

            <h3 className="clapper-title spotlight-text">YÊU CẦU ĐĂNG NHẬP</h3>

            <p className="clapper-desc">
              {clapperMessage || 'Bạn cần đăng nhập tài khoản để tiếp tục giữ ghế, đặt vé và nhận ưu đãi thành viên!'}
            </p>
          </div>

          {/* Hàng nút hành động */}
          <div className="clapper-actions-row">
            <button
              type="button"
              className="btn-clapper-primary"
              onClick={handleLoginClick}
            >
              <FeatherIcon name="log-in" size={17} />
              <span>Đăng Nhập Ngay</span>
            </button>

            <button
              type="button"
              className="btn-clapper-secondary"
              onClick={handleRegisterClick}
            >
              <FeatherIcon name="user-plus" size={17} />
              <span>Tạo Tài Khoản Mới</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-clapper-dismiss"
            onClick={closeClapperModal}
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}
