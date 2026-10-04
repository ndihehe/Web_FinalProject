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

export default function UserBookingsScreen() {
  const { navigate } = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [refundBooking, setRefundBooking] = useState(null);
  const [refundReason, setRefundReason] = useState('Bận việc cá nhân');
  const [reviewBooking, setReviewBooking] = useState(null);
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
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      if (list.length > 0) {
        const map = {};
        list.forEach((m) => {
          if (m.id) map[m.id] = m;
          if (m.movieId) map[m.movieId] = m;
          if (m.title) map[m.title] = m;
        });
        setMoviesMap(map);
      }
    }).catch(() => {});
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await cinemaService.getUserBookings({ status: selectedStatus });
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      setBookings(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [selectedStatus]);

  const handleOpenInvoice = async (bookingId) => {
    try {
      const invRes = await cinemaService.getBookingInvoice(bookingId);
      setSelectedInvoice(invRes.data);
      setIsInvoiceOpen(true);
    } catch (e) {
      alert(e.message || 'Hóa đơn chưa sẵn sàng');
    }
  };

  const handleConfirmRefund = async () => {
    if (!refundBooking) return;
    setSubmitting(true);
    try {
      await cinemaService.requestRefund(refundBooking.id, {
        reason: refundReason,
        expectedVersion: refundBooking.version
      });
      setRefundBooking(null);
      setAlertMsg('Đã hoàn tiền 100% thành công vào ví Beta của bạn!');
      await loadBookings();
    } catch (e) {
      alert(e.message || 'Lỗi khi hoàn tiền');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReview = async () => {
    if (!reviewBooking) return;
    if (!reviewComment.trim()) return;
    setSubmitting(true);
    try {
      await cinemaService.upsertReview(reviewBooking.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        expectedReviewVersion: 0
      });
      setReviewBooking(null);
      setReviewComment('');
      setAlertMsg('Đã đăng đánh giá thành công!');
      await loadBookings();
    } catch (e) {
      alert(e.message || 'Lỗi khi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container user-bookings-screen">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <span className="breadcrumb-link" onClick={() => navigate('/')}>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Lịch sử Đơn vé</span>
        </div>

        {alertMsg && (
          <div className="alert-banner success">
            <FeatherIcon name="check-circle" size={18} />
            <span>{alertMsg}</span>
          </div>
        )}

        <div className="page-header">
          <span className="section-label spotlight-text">LỊCH SỬ ĐẶT VÉ</span>
          <h1 className="page-title spotlight-text">VÉ XEM PHIM & ĐƠN HÀNG</h1>
          <p className="page-subtitle">Theo dõi trạng thái vé, xem mã QR vào rạp, lấy hóa đơn điện tử hoặc yêu cầu hoàn tiền.</p>
        </div>

        {/* BỘ LỌC TRẠNG THÁI ĐƠN */}
        <div className="status-tabs-row">
          <button
            className={`status-tab-btn ${selectedStatus === '' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('')}
          >
            TẤT CẢ
          </button>
          <button
            className={`status-tab-btn ${selectedStatus === 'PAID' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('PAID')}
          >
            ĐÃ THANH TOÁN
          </button>
          <button
            className={`status-tab-btn ${selectedStatus === 'PENDING_PAYMENT' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('PENDING_PAYMENT')}
          >
            CHỜ THANH TOÁN
          </button>
          <button
            className={`status-tab-btn ${selectedStatus === 'REFUNDED' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('REFUNDED')}
          >
            ĐÃ HOÀN TIỀN
          </button>
          <button
            className={`status-tab-btn ${selectedStatus === 'CANCELLED' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('CANCELLED')}
          >
            ĐÃ HỦY
          </button>
        </div>

        {/* DANH SÁCH ĐƠN HÀNG */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải đơn đặt vé...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <FeatherIcon name="film" size={48} />
            <h3>Chưa có đơn hàng nào trong mục này</h3>
            <p>Hãy chọn một bộ phim yêu thích và đặt vé ngay hôm nay!</p>
            <button className="btn-movie-book" onClick={() => navigate('/movie')}>Xem lịch chiếu</button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((b) => (
              <div key={b.id} className="booking-card-orthogonal">
                <div className="booking-card-header">
                  <div className="booking-id-tag">
                    <span>MÃ ĐƠN:</span> <strong>#{b.id}</strong>
                  </div>
                  <span className={`booking-status-badge ${b.status.toLowerCase()}`}>
                    {b.status === 'PAID' ? 'ĐÃ THANH TOÁN' : b.status === 'PENDING_PAYMENT' ? 'CHỜ THANH TOÁN' : b.status === 'REFUNDED' ? 'ĐÃ HOÀN TIỀN' : 'ĐÃ HỦY'}
                  </span>
                </div>

                <div className="booking-card-body">
                  <div className="b-movie-info">
                    <h3 className="b-movie-title spotlight-text">{b.showtime.movieTitle}</h3>
                    <div className="b-meta-row">
                      <span><FeatherIcon name="map-pin" size={14} /> {b.showtime.cinemaName}</span>
                      <span>•</span>
                      <span><FeatherIcon name="monitor" size={14} /> {b.showtime.roomName}</span>
                      <span>•</span>
                      <span><FeatherIcon name="calendar" size={14} /> {new Date(b.showtime.startsAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                    </div>

                    <div className="b-seats-row">
                      <span>Ghế đã chọn: </span>
                      {b.seats.map((s) => (
                        <span key={s.seatId} className="b-seat-chip">{s.label} ({s.type})</span>
                      ))}
                    </div>
                  </div>

                  <div className="b-total-box">
                    <span className="b-total-label">Tổng thanh toán:</span>
                    <span className="b-total-val spotlight-text">{b.totalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                <div className="booking-card-actions">
                  {b.status === 'PAID' && (
                    <>
                      {b.ticketIds && b.ticketIds.length > 0 && (
                        <button
                          className="btn-action-primary"
                          onClick={() => navigate(`/ticket/${b.ticketIds[0]}`)}
                        >
                          <FeatherIcon name="tag" size={16} /> Xem Vé & Mã QR
                        </button>
                      )}
                      <button
                        className="btn-action-secondary"
                        onClick={() => handleOpenInvoice(b.id)}
                      >
                        <FeatherIcon name="file-text" size={16} /> Hóa Đơn Điện Tử
                      </button>
                      {b.eligibility && b.eligibility.canRefund && (
                        <button
                          className="btn-action-danger"
                          onClick={() => setRefundBooking(b)}
                        >
                          <FeatherIcon name="rotate-ccw" size={16} /> Hoàn Tiền Vé
                        </button>
                      )}
                      {b.eligibility && b.eligibility.canReview && (
                        <button
                          className="btn-action-accent"
                          onClick={() => setReviewBooking(b)}
                        >
                          <FeatherIcon name="star" size={16} /> Đánh Giá Phim
                        </button>
                      )}
                    </>
                  )}

                  {b.status === 'PENDING_PAYMENT' && (
                    <button
                      className="btn-action-primary"
                      onClick={() => navigate(`/booking/${b.id}`)}
                    >
                      <FeatherIcon name="credit-card" size={16} /> Tiếp Tục Thanh Toán
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL XEM HÓA ĐƠN ĐIỆN TỬ */}
      {isInvoiceOpen && selectedInvoice && (
        <div className="modal-backdrop">
          <div className="modal-box-orthogonal invoice-modal">
            <div className="invoice-header">
              <h3 className="spotlight-text">CHỨNG TỪ THANH TOÁN (HÓA ĐƠN)</h3>
              <button className="btn-close-modal" onClick={() => setIsInvoiceOpen(false)}>
                <FeatherIcon name="x" size={20} />
              </button>
            </div>

            <div className="invoice-info-meta">
              <div>Số hóa đơn: <strong>{selectedInvoice.number}</strong></div>
              <div>Ngày xuất: <strong>{new Date(selectedInvoice.issuedAt).toLocaleString('vi-VN')}</strong></div>
              <div>Khách hàng: <strong>{selectedInvoice.customerName}</strong></div>
              <div>Trạng thái: <span className="status-badge-issued">{selectedInvoice.status}</span></div>
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
                {selectedInvoice.lines.map((l, idx) => (
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
              <div className="inv-row"><span>Tạm tính:</span><span>{selectedInvoice.subtotal.toLocaleString('vi-VN')} đ</span></div>
              {selectedInvoice.discountAmount > 0 && (
                <div className="inv-row discount"><span>Giảm giá:</span><span>-{selectedInvoice.discountAmount.toLocaleString('vi-VN')} đ</span></div>
              )}
              <div className="inv-row total"><span>Tổng thanh toán:</span><span className="spotlight-text">{selectedInvoice.totalAmount.toLocaleString('vi-VN')} đ</span></div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HOÀN TIỀN */}
      {refundBooking && (
        <div className="modal-backdrop">
          <div className="modal-box-orthogonal">
            <h3 className="modal-title spotlight-text">Yêu Cầu Hoàn Tiền Vé</h3>
            <p className="modal-desc">
              Vé còn trên 120 phút trước suất chiếu đủ điều kiện hoàn <strong>100%</strong> vào Ví Beta ({refundBooking.totalAmount.toLocaleString('vi-VN')} đ).
            </p>
            <div className="form-group">
              <label>Lý do hoàn vé:</label>
              <textarea
                className="input-orthogonal textarea"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
            <div className="modal-actions-row">
              <button className="btn-modal-cancel" onClick={() => setRefundBooking(null)}>Hủy</button>
              <button className="btn-modal-danger" disabled={submitting} onClick={handleConfirmRefund}>
                {submitting ? 'Đang xử lý...' : 'Xác nhận hoàn tiền 100%'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THẺ ĐÁNH GIÁ PHIM VỚI BANNER PHIM TƯƠNG ỨNG VÉ ĐÃ ĐẶT & FORM BÌNH LUẬN */}
      {reviewBooking && (() => {
        const movieObj = moviesMap[reviewBooking.showtime?.movieId] || moviesMap[reviewBooking.showtime?.movieTitle];
        const bannerUrl = movieObj?.backdropUrl || movieObj?.posterUrl || '/images/aovis/witcher_banner.jpg';
        const currentActiveRating = hoverRating || reviewRating;
        const userInitial = currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'N';

        return (
          <div className="modal-backdrop" onClick={() => setReviewBooking(null)}>
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
                      <span>#{reviewBooking.id}</span>
                    </div>
                    <button
                      type="button"
                      className="auth-modal-close-btn"
                      onClick={() => setReviewBooking(null)}
                      title="Đóng"
                    >
                      x
                    </button>
                  </div>

                  <div className="review-ticket-banner-info">
                    <h3 className="review-ticket-movie-title spotlight-text">
                      {reviewBooking.showtime?.movieTitle}
                    </h3>
                    <div className="review-ticket-movie-meta">
                      <span><FeatherIcon name="map-pin" size={13} /> {reviewBooking.showtime?.cinemaName}</span>
                      <span>•</span>
                      <span><FeatherIcon name="monitor" size={13} /> {reviewBooking.showtime?.roomName}</span>
                      <span>•</span>
                      <span><FeatherIcon name="calendar" size={13} /> {new Date(reviewBooking.showtime?.startsAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                      {reviewBooking.seats?.length > 0 && (
                        <>
                          <span>•</span>
                          <span>Ghế: {reviewBooking.seats.map((s) => s.label).join(', ')}</span>
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
