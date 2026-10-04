import React, { useState, useEffect } from 'react';
import { cinemaService } from '../services/cinemaService';
import { useRouter } from '../router';
import FeatherIcon from '../components/FeatherIcon';
import { useAuthModal } from '../context/AuthModalContext';

export default function BookingCheckoutScreen() {
  const { params, navigate } = useRouter();
  const { openAuthModal } = useAuthModal();
  const bookingId = params.id;

  const [booking, setBooking] = useState(null);
  const [movie, setMovie] = useState(null);
  const [products, setProducts] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('WALLET'); // 'WALLET' | 'GATEWAY'
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 phút đếm ngược
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  const loadBookingData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await cinemaService.getBookingDetail(bookingId);
      const bData = res.data;
      setBooking(bData);

      // Tải song song: bắp nước, ví, chi tiết phim và kho voucher
      const [prodRes, walletRes, movieRes, vouchersRes] = await Promise.all([
        cinemaService.getProducts(bData.showtime.cinemaId),
        cinemaService.getWallet(),
        cinemaService.getMovieDetail(bData.showtime.movieId).catch(() => ({ data: null })),
        cinemaService.getUserVouchers().catch(() => ({ data: [] }))
      ]);

      setProducts(Array.isArray(prodRes?.data) ? prodRes.data : (prodRes?.data?.items || []));
      setWallet(walletRes?.data || {});
      setMovie(movieRes?.data || null);
      setAvailableVouchers(Array.isArray(vouchersRes?.data) ? vouchersRes.data : (vouchersRes?.data?.items || []));
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bookingId) return;
    loadBookingData();
  }, [bookingId]);

  // Đồng hồ đếm lùi giữ vé 10 phút
  useEffect(() => {
    if (!booking || booking.status !== 'PENDING_PAYMENT') return;

    const expiresTime = new Date(booking.expiresAt).getTime();
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresTime - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setBooking((prev) => (prev ? { ...prev, status: 'EXPIRED' } : null));
        setErrorMsg('Đơn hàng đã hết hạn giữ chỗ (10 phút). Ghế đã được giải phóng. Vui lòng chọn lại ghế.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  // Cập nhật số lượng F&B
  const handleUpdateFnbQuantity = async (productId, delta) => {
    if (!booking || booking.status !== 'PENDING_PAYMENT') return;

    setErrorMsg('');
    const currentItems = [...booking.fnbItems];
    const existing = currentItems.find((i) => i.productId === productId);
    let newQty = (existing ? existing.quantity : 0) + delta;
    if (newQty < 0) newQty = 0;

    const updatedItems = currentItems
      .filter((i) => i.productId !== productId)
      .map((i) => ({ productId: i.productId, quantity: i.quantity }));

    if (newQty > 0) {
      updatedItems.push({ productId, quantity: newQty });
    }

    try {
      const res = await cinemaService.updateBookingFnb(booking.id, {
        items: updatedItems,
        expectedVersion: booking.version
      });
      setBooking(res.data);
    } catch (e) {
      setErrorMsg(e.message || 'Lỗi khi cập nhật bắp nước');
    }
  };

  // Áp dụng hoặc gỡ Voucher
  const handleApplyVoucher = async (codeToApply = null) => {
    if (!booking || booking.status !== 'PENDING_PAYMENT') return;

    setErrorMsg('');
    setSuccessMsg('');
    const code = codeToApply !== null ? codeToApply : voucherCodeInput.trim();

    try {
      const res = await cinemaService.updateBookingVoucher(booking.id, {
        code: code || null,
        expectedVersion: booking.version
      });
      setBooking(res.data);
      if (code) {
        setSuccessMsg(`Đã áp dụng mã ưu đãi ${code} thành công!`);
        setVoucherCodeInput(code);
      } else {
        setSuccessMsg('Đã gỡ mã voucher.');
        setVoucherCodeInput('');
      }
    } catch (e) {
      setErrorMsg(e.message || 'Không thể áp dụng mã voucher này');
    }
  };

  // Hủy đơn hàng và quay lại chọn ghế (POST /booking/{id}/cancel)
  const handleCancelBooking = async () => {
    if (!booking) return;
    setSubmitting(true);
    try {
      await cinemaService.cancelBooking(booking.id, {
        reason: 'Khách hàng hủy đơn để chọn lại ghế',
        expectedVersion: booking.version
      });
      setIsCancelModalOpen(false);
      // Giải phóng ghế thành công, chuyển hướng ngay về sơ đồ chọn ghế
      navigate(`/showtime/${booking.showtime.id}/seat`);
    } catch (e) {
      setErrorMsg(e.message || 'Lỗi khi hủy đơn để đổi ghế');
      setSubmitting(false);
    }
  };

  // Xác nhận thanh toán (POST /booking/{id}/payment)
  const handleConfirmPayment = async () => {
    if (!booking || booking.status !== 'PENDING_PAYMENT') return;

    setErrorMsg('');
    setSubmitting(true);
    try {
      const userRes = await cinemaService.getUserProfile().catch(() => null);
      if (!userRes || !userRes.data) {
        setSubmitting(false);
        openAuthModal('login', () => {
          handleConfirmPayment();
        });
        return;
      }

      await cinemaService.createPayment(booking.id, {
        method: selectedPaymentMethod,
        expectedVersion: booking.version
      });

      const updatedBooking = await cinemaService.getBookingDetail(booking.id);
      const firstTicketId = updatedBooking.data.ticketIds[0];

      if (firstTicketId) {
        navigate(`/ticket/${firstTicketId}`);
      } else {
        navigate('/user/booking');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || 'Thanh toán thất bại. Vui lòng kiểm tra lại số dư hoặc thử cổng khác.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container loading-container">
        <div className="spinner"></div>
        <p>Đang chuẩn bị vé điện ảnh của bạn...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="page-container empty-container">
        <h2>Không tìm thấy đơn hàng</h2>
        <button className="btn-movie-book" onClick={() => navigate('/movie')}>Quay lại danh sách phim</button>
      </div>
    );
  }

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const isExpired = booking.status === 'EXPIRED';
  const isCancelled = booking.status === 'CANCELLED';
  const isPaid = booking.status === 'PAID';

  const showtimeDateObj = new Date(booking.showtime.startsAt);
  const showtimeTimeString = showtimeDateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const releaseYear = movie?.releaseDate ? new Date(movie.releaseDate).getFullYear() : '2024';

  const trailerEmbedUrl = movie?.trailerUrl ? movie.trailerUrl.replace('watch?v=', 'embed/') : null;

  return (
    <div className="page-container checkout-screen">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <span className="breadcrumb-link" onClick={() => navigate('/')}>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link" onClick={() => navigate(`/movie/${booking.showtime.movieId}`)}>{booking.showtime.movieTitle}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Thanh toán vé #{booking.id}</span>
          {booking.status === 'PENDING_PAYMENT' && (
            <button
              type="button"
              className="btn-breadcrumb-change-seats"
              onClick={() => setIsCancelModalOpen(true)}
            >
              <FeatherIcon name="rotate-ccw" size={13} />
              <span>Đổi lại ghế</span>
            </button>
          )}
        </div>

        {/* CẢNH BÁO ĐẾM NGƯỢC THỜI HẠN GIỮ GHẾ 10 PHÚT */}
        {booking.status === 'PENDING_PAYMENT' && (
          <div className="countdown-alert-box">
            <div className="countdown-content">
              <FeatherIcon name="clock" size={22} className="clock-icon" />
              <div>
                <span className="countdown-title spotlight-text">THỜI GIAN GIỮ GHẾ CÒN LẠI</span>
                <p className="countdown-desc">Vui lòng hoàn tất thanh toán trước khi hết giờ để không bị giải phóng ghế.</p>
              </div>
            </div>
            <div className={`countdown-clock ${secondsRemaining < 120 ? 'urgent' : ''}`}>
              {formatCountdown(secondsRemaining)}
            </div>
          </div>
        )}

        {isExpired && (
          <div className="alert-banner expired">
            <FeatherIcon name="alert-triangle" size={20} />
            <span>Đơn hàng đã hết hạn giữ chỗ (10 phút). Ghế đã được giải phóng.</span>
            <button className="btn-rebook" onClick={() => navigate(`/showtime/${booking.showtime.id}/seat`)}>
              CHỌN LẠI GHẾ
            </button>
          </div>
        )}

        {isCancelled && (
          <div className="alert-banner cancelled">
            <FeatherIcon name="x-circle" size={20} />
            <span>Đơn hàng này đã được hủy lúc {new Date(booking.cancelledAt).toLocaleTimeString('vi-VN')}. Ghế đã được mở lại.</span>
            <button className="btn-rebook" onClick={() => navigate(`/showtime/${booking.showtime.id}/seat`)}>
              ĐẶT LẠI VÉ SUẤT CHIẾU NÀY
            </button>
          </div>
        )}

        {isPaid && (
          <div className="alert-banner paid">
            <FeatherIcon name="check-circle" size={20} />
            <span>Đơn hàng đã thanh toán thành công.</span>
            <button className="btn-rebook" onClick={() => navigate(`/ticket/${booking.ticketIds[0]}`)}>
              XEM VÉ ĐIỆN TỬ
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="alert-banner error">
            <FeatherIcon name="alert-circle" size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-banner success">
            <FeatherIcon name="check" size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. CINEMATIC HERO TICKET (PHONG CÁCH DEADPOOL VỚI FONT CHINESE ROCKS) */}
        <div className="deadpool-ticket-card">
          <div className="ticket-card-hero">
            {/* Visual bên trái với backdrop poster và nút xem Trailer */}
            <div
              className="ticket-visual-col"
              style={{
                backgroundImage: `url(${movie?.backdropUrl || movie?.posterUrl || '/images/aovis/witcher_banner.jpg'})`
              }}
            >
              <div className="ticket-visual-fade"></div>
              {movie?.trailerUrl && (
                <button
                  type="button"
                  className="btn-ticket-trailer font-chinese"
                  onClick={() => setIsTrailerModalOpen(true)}
                >
                  <FeatherIcon name="play-circle" size={18} />
                  <span>WATCH TRAILER</span>
                </button>
              )}
            </div>

            {/* Thông tin vé bên phải: Năm, Tiêu đề phim, Metadata, Kịch bản & Bộ chọn */}
            <div className="ticket-info-col">
              <div className="ticket-year font-chinese">{releaseYear}</div>
              <h1 className="ticket-movie-title">
                {booking.showtime.movieTitle.includes(':') ? (
                  <>
                    <span className="main-title font-chinese">{booking.showtime.movieTitle.split(':')[0].trim().toUpperCase()}</span>
                    <span className="sub-title">{booking.showtime.movieTitle.split(':')[1].trim()}</span>
                  </>
                ) : (
                  <span className="main-title font-chinese">{booking.showtime.movieTitle.toUpperCase()}</span>
                )}
              </h1>

              <div className="ticket-meta-strip font-chinese">
                <span className="ticket-meta-badge">{movie?.ageRating || 'T18'}</span>
                <span className="ticket-meta-duration">{movie?.durationMinutes || 120} MIN</span>
                <span className="ticket-meta-divider">|</span>
                <span className="ticket-meta-genres">
                  {movie?.genres?.length ? movie.genres.join(', ') : 'ACTION, ADVENTURE, SCI-FI'}
                </span>
              </div>

              <p className="ticket-synopsis">
                {movie?.description || 'Một trải nghiệm điện ảnh chân thực với âm thanh đa chiều và không gian thưởng thức nghệ thuật đẳng cấp tại Beta Cinema.'}
              </p>

              {/* Dải thông số suất chiếu đã chọn phong cách Deadpool card (Phương án 1) */}
              <div className="ticket-selectors-row">
                <div className="picker-seats-count font-chinese">
                  <span className="picker-label font-chinese">SO LUONG VE</span>
                  <span className="picker-value font-chinese">{booking.seats.length} GHE</span>
                </div>

                <div className="picker-seats-count font-chinese">
                  <span className="picker-label font-chinese">NGAY CHIEU</span>
                  <span className="picker-value font-chinese">
                    {showtimeDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  </span>
                </div>

                <div className="picker-seats-count font-chinese">
                  <span className="picker-label font-chinese">SUAT CHIEU</span>
                  <span className="picker-value font-chinese">{showtimeTimeString}</span>
                </div>

                <div className="picker-seats-count font-chinese">
                  <span className="picker-label font-chinese">DINH DANG</span>
                  <span className="picker-value font-chinese">
                    {booking.showtime.format?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Khối Grid thông tin vé (Điều chỉnh các trường CVC/Card sang Tên Rạp, Suất Chiếu theo yêu cầu) */}
          <div className="ticket-info-grid">
            <div className="grid-cell">
              <span className="grid-cell-label font-chinese">TEN CUM RAP / CINEMA</span>
              <div className="grid-cell-val font-chinese spotlight-text">
                <FeatherIcon name="map-pin" size={16} className="cell-icon" />
                <span className="font-chinese">
                  {booking.showtime.cinemaName?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid-cell">
              <span className="grid-cell-label font-chinese">SUAT CHIEU / SHOWTIME</span>
              <div className="grid-cell-val font-chinese spotlight-text">
                <FeatherIcon name="clock" size={16} className="cell-icon" />
                <span className="font-chinese">
                  {showtimeTimeString} • {showtimeDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid-cell">
              <span className="grid-cell-label font-chinese">PHONG CHIEU / AUDITORIUM</span>
              <div className="grid-cell-val font-chinese spotlight-text">
                <FeatherIcon name="monitor" size={16} className="cell-icon" />
                <span className="font-chinese">
                  {(() => {
                    const cleanRoom = booking.showtime.roomName?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase() || '';
                    const cleanFormat = booking.showtime.format?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase() || '';
                    return cleanRoom.includes('(') ? cleanRoom : `${cleanRoom} (${cleanFormat})`;
                  })()}
                </span>
              </div>
            </div>

            <div className="grid-cell">
              <span className="grid-cell-label font-chinese">VI TRI GHE / SEATS</span>
              <div className="grid-cell-val highlight-seats font-chinese">
                {booking.seats.map((s) => (
                  <span key={s.seatId} className="seat-badge-pill font-chinese">
                    {s.label} ({s.type?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase()})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. CÁC KHÂU TIẾP THEO KHI KÉO XUỐNG: BẮP NƯỚC, VOUCHER & THANH TOÁN */}
        <div className="checkout-main-flow">
          {/* KHÂU A: CHỌN PRODUCT (COMBO BẮP NƯỚC F&B) */}
          <div className="flow-card">
            <div className="flow-card-header">
              <h3 className="flow-card-title font-chinese">
                <FeatherIcon name="coffee" size={20} /> COMBO BẮP NƯỚC TẠI RẠP (F&B)
              </h3>
              <p className="flow-card-sub">Thêm bắp nước giòn ngon để trải nghiệm trọn vẹn suất chiếu cùng bạn bè.</p>
            </div>

            <div className="fnb-menu-list">
              {products.map((prod) => {
                const existingItem = booking.fnbItems.find((i) => i.productId === prod.id);
                const qty = existingItem ? existingItem.quantity : 0;

                return (
                  <div key={prod.id} className="fnb-menu-item">
                    <div className="fnb-menu-info">
                      <span className="fnb-item-name spotlight-text">{prod.name}</span>
                      <span className="fnb-item-desc">{prod.description}</span>
                      <span className="fnb-item-price font-chinese">{prod.unitPrice.toLocaleString('vi-VN')} đ</span>
                    </div>

                    <div className="fnb-qty-counter">
                      <button
                        className="counter-btn"
                        disabled={qty <= 0 || isExpired || isCancelled || isPaid}
                        onClick={() => handleUpdateFnbQuantity(prod.id, -1)}
                      >
                        -
                      </button>
                      <span className="counter-val font-chinese">{qty}</span>
                      <button
                        className="counter-btn"
                        disabled={qty >= 10 || isExpired || isCancelled || isPaid}
                        onClick={() => handleUpdateFnbQuantity(prod.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KHÂU B: ÁP MÃ VOUCHER KHUYẾN MÃI (CHỌN 1 CHẠM HOẶC NHẬP TAY) */}
          <div className="flow-card">
            <div className="flow-card-header">
              <h3 className="flow-card-title font-chinese">
                <FeatherIcon name="tag" size={20} /> VOUCHER KHUYẾN MÃI (CHỌN 1 CHẠM ĐỂ ÁP DỤNG)
              </h3>
              <p className="flow-card-sub">Chọn ngay mã giảm giá khả dụng trong tài khoản của bạn để áp dụng vào đơn hàng.</p>
            </div>

            {/* Danh sách Voucher khả dụng để Click 1 chạm */}
            {availableVouchers.length > 0 ? (
              <div className="voucher-stubs-wrapper">
                <span className="section-mini-label font-chinese">KHO VOUCHER KHẢ DỤNG CỦA BẠN:</span>
                <div className="voucher-stubs-grid">
                  {availableVouchers.map((v) => {
                    const isApplied = booking.voucher && booking.voucher.code.toUpperCase() === v.code.toUpperCase();
                    const isEligible = booking.subtotal >= v.minOrderAmount;

                    return (
                      <div
                        key={v.id}
                        className={`voucher-stub-item ${isApplied ? 'applied' : ''} ${!isEligible ? 'ineligible' : ''}`}
                      >
                        <div className="stub-ribbon font-chinese">
                          {v.discountType === 'FIXED' ? `-${v.discountValue / 1000}K` : `-${v.discountValue}%`}
                        </div>
                        <div className="stub-body">
                          <strong className="stub-code font-chinese">{v.code}</strong>
                          <p className="stub-desc">{v.description}</p>
                          <div className="stub-condition">
                            Đơn tối thiểu: {v.minOrderAmount.toLocaleString('vi-VN')} đ
                          </div>
                        </div>

                        <div className="stub-action">
                          {isApplied ? (
                            <button
                              type="button"
                              className="btn-stub-applied"
                              onClick={() => handleApplyVoucher('')}
                              disabled={isExpired || isCancelled || isPaid}
                            >
                              ĐANG DÙNG (GỠ)
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-stub-apply font-chinese"
                              disabled={!isEligible || isExpired || isCancelled || isPaid}
                              onClick={() => handleApplyVoucher(v.code)}
                            >
                              {isEligible ? 'ÁP DỤNG' : 'CHƯA ĐỦ ĐIỀU KIỆN'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ color: '#ffffff', opacity: 0.7, padding: '12px 0', fontSize: '14px' }}>
                Hiện không có mã ưu đãi khả dụng cho đơn hàng này.
              </div>
            )}
          </div>

          {/* KHÂU C: PHƯƠNG THỨC THANH TOÁN & BẢNG TỔNG TIỀN */}
          <div className="flow-card">
            <div className="flow-card-header">
              <h3 className="flow-card-title font-chinese">
                <FeatherIcon name="credit-card" size={20} /> PHƯƠNG THỨC THANH TOÁN
              </h3>
            </div>

            <div className="payment-options-grid">
              {/* VÍ BETA BALANCE */}
              <div
                className={`payment-option-card ${selectedPaymentMethod === 'WALLET' ? 'active' : ''}`}
                onClick={() => setSelectedPaymentMethod('WALLET')}
              >
                <div className="option-header">
                  <div className="option-radio">
                    {selectedPaymentMethod === 'WALLET' && <div className="radio-dot checked" />}
                  </div>
                  <span className="option-name">Ví Tiền Beta Cinema</span>
                </div>

                <div className="wallet-balance-row">
                  <span>Số dư hiện tại:</span>
                  <strong className="balance-highlight font-chinese">{wallet ? wallet.balance.toLocaleString('vi-VN') : 0} đ</strong>
                </div>

                {wallet && wallet.balance < booking.totalAmount && (
                  <div className="wallet-shortage-alert">
                    <FeatherIcon name="alert-circle" size={14} />
                    <span>Số dư không đủ. Vui lòng nạp thêm hoặc chọn Cổng thanh toán.</span>
                  </div>
                )}
              </div>

              {/* CỔNG THANH TOÁN ONLINE */}
              <div
                className={`payment-option-card ${selectedPaymentMethod === 'GATEWAY' ? 'active' : ''}`}
                onClick={() => setSelectedPaymentMethod('GATEWAY')}
              >
                <div className="option-header">
                  <div className="option-radio">
                    {selectedPaymentMethod === 'GATEWAY' && <div className="radio-dot checked" />}
                  </div>
                  <span className="option-name">Cổng Thanh Toán Trực Tuyến (VNPay, MoMo, Thẻ ATM/Visa)</span>
                </div>
                <p className="gateway-desc">
                  Thanh toán qua cổng quốc tế hoặc ngân hàng nội địa an toàn, bảo mật tiêu chuẩn PCI-DSS.
                </p>
              </div>
            </div>

            {/* BẢNG TỔNG TIỀN THANH TOÁN SANG TRỌNG */}
            <div className="checkout-summary-receipt">
              <div className="receipt-line">
                <span>Tiền vé ({booking.seats.length} ghế):</span>
                <span className="receipt-val font-chinese">{booking.ticketSubtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="receipt-line">
                <span>Combo bắp nước F&B:</span>
                <span className="receipt-val font-chinese">{booking.fnbSubtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="receipt-line discount">
                  <span>Khuyến mãi Voucher:</span>
                  <span className="receipt-val font-chinese">-{booking.discountAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="receipt-divider"></div>
              <div className="receipt-line total">
                <span className="total-title font-chinese">TỔNG THANH TOÁN:</span>
                <span className="total-amount-val font-chinese">{booking.totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {/* NÚT XÁC NHẬN THANH TOÁN CHÍNH */}
            <div className="checkout-actions-block">
              {isCancelled ? (
                <button
                  type="button"
                  className="btn-deadpool-pay btn-action-rebook font-chinese"
                  onClick={() => navigate(`/showtime/${booking.showtime.id}/seat`)}
                >
                  <FeatherIcon name="rotate-ccw" size={18} />
                  <span>ĐƠN ĐÃ HỦY — BẤM ĐỂ QUAY LẠI CHỌN GHẾ</span>
                </button>
              ) : isExpired ? (
                <button
                  type="button"
                  className="btn-deadpool-pay btn-action-rebook font-chinese"
                  onClick={() => navigate(`/showtime/${booking.showtime.id}/seat`)}
                >
                  <FeatherIcon name="rotate-ccw" size={18} />
                  <span>ĐƠN HẾT HẠN — BẤM ĐỂ CHỌN LẠI GHẾ</span>
                </button>
              ) : isPaid ? (
                <button
                  type="button"
                  className="btn-deadpool-pay font-chinese"
                  onClick={() => navigate(`/ticket/${booking.ticketIds[0]}`)}
                >
                  <FeatherIcon name="check-circle" size={18} />
                  <span>ĐÃ THANH TOÁN — XEM VÉ ĐIỆN TỬ</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-deadpool-pay font-chinese"
                  disabled={submitting}
                  onClick={handleConfirmPayment}
                >
                  {submitting ? 'ĐANG XỬ LÝ THANH TOÁN...' : 'XÁC NHẬN THANH TOÁN (CONFIRM PAYMENT)'}
                </button>
              )}

              {booking.eligibility?.canCancel && !isPaid && !isCancelled && (
                <button
                  type="button"
                  className="btn-cancel-checkout"
                  disabled={submitting}
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  <FeatherIcon name="trash-2" size={15} />
                  <span>Hủy đơn đặt vé & Đổi ghế khác</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL XÁC NHẬN HỦY ĐƠN */}
      {isCancelModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box-orthogonal">
            <h3 className="modal-title spotlight-text">Quay lại sơ đồ chọn ghế</h3>
            <p className="modal-desc">
              Bạn có muốn hủy đơn vé hiện tại để quay lại chọn ghế khác không? Các ghế đang giữ ({booking.seats.map((s) => s.label).join(', ')}) sẽ lập tức được giải phóng về hệ thống để bạn chọn lại.
            </p>
            <div className="modal-actions-row">
              <button className="btn-modal-cancel" onClick={() => setIsCancelModalOpen(false)}>
                Giữ đơn hiện tại
              </button>
              <button className="btn-modal-danger" onClick={handleCancelBooking}>
                Đồng ý & Chọn lại ghế
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM TRAILER CHUẨN ĐIỆN ẢNH */}
      {isTrailerModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTrailerModalOpen(false)}>
          <div className="modal-trailer-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="trailer-header">
              <span className="trailer-title font-chinese">{booking.showtime.movieTitle} — OFFICIAL TRAILER</span>
              <button className="btn-close-trailer" onClick={() => setIsTrailerModalOpen(false)}>
                <FeatherIcon name="x" size={20} />
              </button>
            </div>
            <div className="trailer-video-box">
              <iframe
                src={`${trailerEmbedUrl}?autoplay=1`}
                title="Trailer"
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
