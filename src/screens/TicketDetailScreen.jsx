import React, { useState, useEffect } from 'react';
import { cinemaService } from '../services/cinemaService';
import { useRouter } from '../router';
import FeatherIcon from '../components/FeatherIcon';

const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const IconStar = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? '#d96c2c' : 'none'} stroke={filled ? '#d96c2c' : '#64748b'} strokeWidth="1.8">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function TicketDetailScreen() {
  const { params, navigate } = useRouter();
  const ticketId = params.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [booking, setBooking] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('Bận việc đột xuất không thể tham gia');
  const [reviewRating, setReviewRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [moviesMap, setMoviesMap] = useState({});

  useEffect(() => {
    cinemaService.getUserProfile().then((res) => setCurrentUser(res?.data)).catch(() => {});
  }, []);

  useEffect(() => {
    cinemaService.getMovies().then((res) => {
      if (res && res.data) {
        const map = {};
        res.data.forEach((m) => {
          map[m.id] = m;
          map[m.title] = m;
        });
        setMoviesMap(map);
      }
    }).catch(() => {});
  }, []);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const tRes = await cinemaService.getTicketDetail(ticketId);
      setTicket(tRes.data);

      // Tải kèm booking để lấy eligibility (hoàn tiền, đánh giá)
      if (tRes.data.bookingId) {
        const bRes = await cinemaService.getBookingDetail(tRes.data.bookingId);
        setBooking(bRes.data);
      }
    } catch (e) {
      console.error(e);
      setAlertMsg(e.message || 'Lỗi khi tải thông tin vé điện tử');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ticketId) return;
    loadTicket();
  }, [ticketId]);

  const handleOpenInvoice = async () => {
    if (!ticket || !ticket.bookingId) return;
    try {
      const invRes = await cinemaService.getBookingInvoice(ticket.bookingId);
      setInvoice(invRes.data);
      setIsInvoiceOpen(true);
    } catch (e) {
      alert(e.message || 'Không thể xem hóa đơn lúc này');
    }
  };

  // Xử lý hoàn tiền vé (POST /booking/{id}/refund)
  const handleConfirmRefund = async () => {
    if (!booking) return;
    setSubmitting(true);
    try {
      await cinemaService.requestRefund(booking.id, {
        reason: refundReason,
        expectedVersion: booking.version
      });
      setIsRefundModalOpen(false);
      setAlertMsg('Yêu cầu hoàn tiền đã được xử lý thành công! 100% số tiền đã được cộng vào Ví Beta của bạn.');
      // Tải lại vé để cập nhật trạng thái VOID
      await loadTicket();
    } catch (e) {
      alert(e.message || 'Không đủ điều kiện hoàn tiền');
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý viết đánh giá phim (PUT /booking/{id}/review)
  const handleConfirmReview = async () => {
    if (!booking) return;
    if (!reviewComment.trim()) return;
    setSubmitting(true);
    try {
      await cinemaService.upsertReview(booking.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        expectedReviewVersion: 0
      });
      setIsReviewModalOpen(false);
      setReviewComment('');
      setAlertMsg('Cảm ơn bạn đã gửi đánh giá cho bộ phim này!');
      await loadTicket();
    } catch (e) {
      alert(e.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container loading-container">
        <div className="spinner"></div>
        <p>Đang tải vé điện tử...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page-container empty-container">
        <h2>Không tìm thấy vé điện tử</h2>
        <button className="btn-movie-book" onClick={() => navigate('/user/booking')}>Xem danh sách vé của tôi</button>
      </div>
    );
  }

  const isVoid = ticket.status === 'VOID';
  const isUsed = ticket.status === 'USED';
  const canRefund = booking && booking.eligibility && booking.eligibility.canRefund && !isVoid && !isUsed;
  const canReview = booking && booking.eligibility && booking.eligibility.canReview && !isVoid;

  return (
    <div className="page-container ticket-screen">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <span className="breadcrumb-link" onClick={() => navigate('/')}>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link" onClick={() => navigate('/user/booking')}>Vé của tôi</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Vé #{ticket.id}</span>
        </div>

        {alertMsg && (
          <div className="alert-banner success">
            <FeatherIcon name="check-circle" size={18} />
            <span>{alertMsg}</span>
          </div>
        )}

        <div className="ticket-center-wrapper">
          {/* THẺ VÉ ĐIỆN TỬ RĂNG CƯA ĐẲNG CẤP */}
          <div className={`cinema-e-ticket ${isVoid ? 'ticket-void' : ''}`}>
            {/* PHẦN TRÁI VÉ: THÔNG TIN PHIM & SUẤT CHIẾU */}
            <div className="ticket-body">
              <div className="ticket-brand-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/images/logo_tdtdt_transparent.png" alt="TDTDT Logo" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
                  <span className="ticket-cinema-badge">TDTDT CINEMA E-TICKET</span>
                </div>
                <span className={`ticket-status-pill ${ticket.status.toLowerCase()}`}>
                  {ticket.status === 'VALID' ? 'HỢP LỆ' : ticket.status === 'USED' ? 'ĐÃ SỬ DỤNG' : 'ĐÃ HOÀN TIỀN (VOID)'}
                </span>
              </div>

              <h2 className="ticket-movie-title spotlight-text">{ticket.movieTitle}</h2>

              <div className="ticket-grid-details">
                <div className="t-detail-item">
                  <span className="t-label">CỤM RẠP</span>
                  <span className="t-value spotlight-text">{ticket.cinemaName}</span>
                </div>
                <div className="t-detail-item">
                  <span className="t-label">PHÒNG CHIẾU</span>
                  <span className="t-value spotlight-text">{ticket.roomName}</span>
                </div>
                <div className="t-detail-item">
                  <span className="t-label">GIỜ BẮT ĐẦU</span>
                  <span className="t-value spotlight-text">
                    {new Date(ticket.startsAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="t-detail-item">
                  <span className="t-label">NGÀY CHIẾU</span>
                  <span className="t-value spotlight-text">
                    {new Date(ticket.startsAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <div className="ticket-seat-highlight-box">
                <span className="seat-box-label">VỊ TRÍ GHẾ NGỒI</span>
                <span className="seat-box-value spotlight-text">{ticket.seatLabel}</span>
              </div>

              <div className="ticket-notice">
                <FeatherIcon name="info" size={14} /> Vui lòng xuất trình mã QR này tại quầy soát vé trước giờ chiếu 15 phút.
              </div>
            </div>

            {/* ĐƯỜNG RĂNG CƯA CẮT VÉ VINTAGE */}
            <div className="ticket-perforation">
              <div className="perforation-notch top"></div>
              <div className="perforation-line"></div>
              <div className="perforation-notch bottom"></div>
            </div>

            {/* PHẦN PHẢI VÉ: MÃ QR CODE SCAN */}
            <div className="ticket-stub">
              <div className="stub-header">
                <span className="stub-label">MÃ VÉ</span>
                <strong className="stub-code">{ticket.id}</strong>
              </div>

              <div className="qr-code-box">
                {/* SVG QR Code minh họa chất lượng cao */}
                <svg viewBox="0 0 100 100" className="qr-svg">
                  <rect width="100" height="100" fill="#ffffff" />
                  <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" fill="#000" />
                  <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" fill="#000" />
                  <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" fill="#000" />
                  <rect x="45" y="15" width="8" height="8" fill="#000" />
                  <rect x="45" y="30" width="8" height="8" fill="#000" />
                  <rect x="45" y="45" width="8" height="8" fill="#000" />
                  <rect x="15" y="45" width="8" height="8" fill="#000" />
                  <rect x="30" y="45" width="8" height="8" fill="#000" />
                  <rect x="60" y="45" width="8" height="8" fill="#000" />
                  <rect x="75" y="45" width="8" height="8" fill="#000" />
                  <rect x="60" y="60" width="8" height="8" fill="#000" />
                  <rect x="70" y="70" width="12" height="12" fill="#000" />
                  <rect x="85" y="85" width="8" height="8" fill="#000" />
                  <rect x="50" y="75" width="8" height="8" fill="#000" />
                </svg>
              </div>

              <span className="qr-caption">QUÉT VÀO RẠP</span>
            </div>
          </div>

          {/* CÁC THAO TÁC NGHIỆP VỤ BỔ TRỢ */}
          <div className="ticket-actions-bar">
            {/* 1. XEM HÓA ĐƠN ĐIỆN TỬ */}
            <button className="btn-ticket-action" onClick={handleOpenInvoice}>
              <FeatherIcon name="file-text" size={16} /> Xem Hóa Đơn Điện Tử
            </button>

            {/* 2. YÊU CẦU HOÀN TIỀN VÉ VÀO VÍ (trước 120 phút) */}
            {canRefund && (
              <button className="btn-ticket-action refund" onClick={() => setIsRefundModalOpen(true)}>
                <FeatherIcon name="rotate-ccw" size={16} /> Yêu Cầu Hoàn Tiền Vé (Vào Ví)
              </button>
            )}

            {/* 3. VIẾT ĐÁNH GIÁ (sau giờ chiếu) */}
            {canReview && (
              <button className="btn-ticket-action review" onClick={() => setIsReviewModalOpen(true)}>
                <FeatherIcon name="star" size={16} /> Đánh Giá Phim Này
              </button>
            )}

            <button className="btn-ticket-action secondary" onClick={() => navigate('/user/booking')}>
              <FeatherIcon name="list" size={16} /> Tất Cả Vé Của Tôi
            </button>
          </div>
        </div>
      </div>

      {/* MODAL XEM HÓA ĐƠN ĐIỆN TỬ (GET /booking/{id}/invoice) */}
      {isInvoiceOpen && invoice && (
        <div className="modal-backdrop">
          <div className="modal-box-orthogonal invoice-modal">
            <div className="invoice-header">
              <h3 className="spotlight-text">CHỨNG TỪ THANH TOÁN (HÓA ĐƠN)</h3>
              <button className="btn-close-modal" onClick={() => setIsInvoiceOpen(false)}>
                <FeatherIcon name="x" size={20} />
              </button>
            </div>

            <div className="invoice-info-meta">
              <div>Số hóa đơn: <strong>{invoice.number}</strong></div>
              <div>Ngày phát hành: <strong>{new Date(invoice.issuedAt).toLocaleString('vi-VN')}</strong></div>
              <div>Khách hàng: <strong>{invoice.customerName}</strong></div>
              <div>Trạng thái: <span className="status-badge-issued">{invoice.status}</span></div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Nội dung</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((l, idx) => (
                  <tr key={idx}>
                    <td>{l.description}</td>
                    <td>{l.quantity}</td>
                    <td>{l.unitPrice.toLocaleString('vi-VN')} đ</td>
                    <td>{l.lineTotal.toLocaleString('vi-VN')} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-summary-rows">
              <div className="inv-row"><span>Tạm tính:</span><span>{invoice.subtotal.toLocaleString('vi-VN')} đ</span></div>
              {invoice.discountAmount > 0 && (
                <div className="inv-row discount"><span>Giảm giá:</span><span>-{invoice.discountAmount.toLocaleString('vi-VN')} đ</span></div>
              )}
              <div className="inv-row total"><span>Tổng thanh toán:</span><span className="spotlight-text">{invoice.totalAmount.toLocaleString('vi-VN')} đ</span></div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL YÊU CẦU HOÀN TIỀN VÉ VÀO VÍ (POST /booking/{id}/refund) */}
      {isRefundModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box-orthogonal">
            <h3 className="modal-title spotlight-text">Yêu Cầu Hoàn Tiền Vé Vào Ví</h3>
            <p className="modal-desc">
              Theo chính sách của Beta Cinema: Vé chưa sử dụng và còn ít nhất 120 phút trước suất chiếu sẽ được hoàn <strong>100% số tiền đã trả</strong> trực tiếp vào Ví Beta của bạn.
            </p>
            <div className="form-group">
              <label>Lý do hoàn tiền:</label>
              <textarea
                className="input-orthogonal textarea"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Nhập lý do hoàn tiền..."
              />
            </div>
            <div className="modal-actions-row">
              <button className="btn-modal-cancel" onClick={() => setIsRefundModalOpen(false)}>Đóng</button>
              <button className="btn-modal-danger" disabled={submitting} onClick={handleConfirmRefund}>
                {submitting ? 'Đang xử lý...' : 'Xác nhận hoàn tiền 100%'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THẺ ĐÁNH GIÁ PHIM VỚI BANNER PHIM TƯƠNG ỨNG VÉ ĐÃ ĐẶT & FORM BÌNH LUẬN */}
      {isReviewModalOpen && (() => {
        const movieObj = moviesMap[ticket?.movieId] || moviesMap[ticket?.movieTitle];
        const bannerUrl = movieObj?.backdropUrl || movieObj?.posterUrl || '/images/aovis/witcher_banner.jpg';
        const currentActiveRating = hoverRating || reviewRating;
        const userInitial = currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'N';

        return (
          <div className="modal-backdrop" onClick={() => setIsReviewModalOpen(false)}>
            <div
              className="review-ticket-card font-sf-rounded"
              onClick={(e) => e.stopPropagation()}
            >
              {/* BANNER PHIM TƯƠNG ỨNG VỚI VÉ ĐÃ ĐẶT */}
              <div
                className="review-ticket-banner-header"
                style={{
                  backgroundImage: `url(${bannerUrl})`
                }}
              >
                <div className="review-ticket-banner-overlay">
                  <div className="review-ticket-banner-top">
                    <div className="review-ticket-tag">
                      <span>VÉ ĐÃ THANH TOÁN</span>
                      <span className="dot">•</span>
                      <span>#{ticket?.id}</span>
                    </div>
                    <button
                      type="button"
                      className="auth-modal-close-btn"
                      onClick={() => setIsReviewModalOpen(false)}
                      title="Đóng"
                    >
                      x
                    </button>
                  </div>

                  <div className="review-ticket-banner-info">
                    <h3 className="review-ticket-movie-title spotlight-text">
                      {ticket?.movieTitle}
                    </h3>
                    <div className="review-ticket-movie-meta">
                      <span><FeatherIcon name="map-pin" size={13} /> {ticket?.cinemaName}</span>
                      <span>•</span>
                      <span><FeatherIcon name="monitor" size={13} /> {ticket?.roomName || 'Phòng chiếu'}</span>
                      <span>•</span>
                      <span><FeatherIcon name="calendar" size={13} /> {ticket?.showtimeStartsAt ? new Date(ticket.showtimeStartsAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Đã chiếu'}</span>
                      {ticket?.seatLabel && (
                        <>
                          <span>•</span>
                          <span>Ghế: {ticket.seatLabel}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* THÂN THẺ CHỨA FORM THEO ĐÚNG ẢNH MẪU ĐÍNH KÈM */}
              <div className="review-ticket-body">
                <div className="review-ticket-form-row">
                  {/* Avatar chữ N / Initial người dùng */}
                  <div className="review-user-avatar">
                    <span>{userInitial}</span>
                  </div>

                  {/* Khung form chuẩn ảnh mẫu */}
                  <form
                    className="review-compose-box"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleConfirmReview();
                    }}
                  >
                    <textarea
                      className="review-compose-textarea"
                      placeholder="Write your comments here..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={2}
                      autoFocus
                    />

                    <div className="review-compose-footer">
                      {/* 5 ngôi sao tương tác xếp hàng ngang + điểm số sao */}
                      <div
                        className="review-stars-group"
                        onMouseLeave={() => setHoverRating(0)}
                        title="Chọn điểm đánh giá"
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            className="review-star-btn"
                            onMouseEnter={() => setHoverRating(star)}
                            onClick={() => setReviewRating(star)}
                          >
                            <IconStar filled={star <= currentActiveRating} />
                          </button>
                        ))}
                        <span className="review-stars-score">
                          {currentActiveRating}/5 sao
                        </span>
                      </div>

                      {/* Nút gửi icon máy bay giấy góc phải */}
                      <button
                        type="submit"
                        className="review-submit-send-btn"
                        disabled={submitting || !reviewComment.trim()}
                        title="Gửi đánh giá"
                      >
                        <IconSend />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
