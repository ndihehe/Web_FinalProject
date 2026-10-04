import React, { useState, useEffect } from 'react';
import { cinemaService } from '../services/cinemaService';
import { useRouter } from '../router';
import FeatherIcon from '../components/FeatherIcon';

export default function UserVouchersScreen() {
  const { navigate } = useRouter();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cinemaService.getUserVouchers().then((res) => {
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      setVouchers(list);
      setLoading(false);
    }).catch((e) => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page-container user-vouchers-screen">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <span className="breadcrumb-link" onClick={() => navigate('/')}>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Kho Voucher của tôi</span>
        </div>

        <div className="page-header">
          <span className="section-label spotlight-text">ƯU ĐÃI THÀNH VIÊN</span>
          <h1 className="page-title spotlight-text">KHO VOUCHER & MÃ GIẢM GIÁ</h1>
          <p className="page-subtitle">Các mã ưu đãi độc quyền dành riêng cho tài khoản Beta Cinema của bạn.</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải danh sách voucher...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="empty-state">
            <FeatherIcon name="tag" size={48} />
            <p>Hiện bạn chưa có mã voucher nào.</p>
          </div>
        ) : (
          <div className="vouchers-grid">
            {vouchers.map((v) => (
              <div key={v.id} className="voucher-card-orthogonal">
                <div className="voucher-tag-ribbon">
                  <FeatherIcon name="gift" size={16} />
                  <span>{v.discountType === 'FIXED' ? `-${v.discountValue.toLocaleString('vi-VN')}đ` : `-${v.discountValue}%`}</span>
                </div>

                <div className="voucher-card-body">
                  <div className="voucher-code-highlight">
                    <span className="code-label">MÃ GIẢM:</span>
                    <strong className="code-text spotlight-text">{v.code}</strong>
                  </div>

                  <p className="voucher-desc">{v.description}</p>

                  <div className="voucher-conditions">
                    <div><FeatherIcon name="check" size={14} /> Đơn tối thiểu: {v.minOrderAmount.toLocaleString('vi-VN')} đ</div>
                    <div><FeatherIcon name="clock" size={14} /> Hạn sử dụng: {new Date(v.expiresAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>

                <div className="voucher-card-footer">
                  <span className="voucher-status-badge">
                    <FeatherIcon name="shield" size={14} /> Khả dụng khi thanh toán đặt vé
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
