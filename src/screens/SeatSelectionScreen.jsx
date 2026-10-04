import React, { useState, useEffect } from 'react';
import { cinemaService } from '../services/cinemaService';
import { useRouter } from '../router';
import FeatherIcon from '../components/FeatherIcon';

export default function SeatSelectionScreen() {
  const { params, navigate } = useRouter();
  const showtimeId = params.id;

  const [seatMapData, setSeatMapData] = useState(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!showtimeId) return;
    loadSeatMap();
  }, [showtimeId]);

  const loadSeatMap = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await cinemaService.getSeatMap(showtimeId);
      setSeatMapData(res.data);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || 'Lỗi khi tải sơ đồ ghế');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSeat = (seat) => {
    if (seat.status !== 'AVAILABLE') return;

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.id));
      setErrorMsg('');
    } else {
      if (selectedSeatIds.length >= 8) {
        setErrorMsg('Theo quy định, bạn chỉ được chọn tối đa 8 ghế trong một lần đặt.');
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
      setErrorMsg('');
    }
  };

  const handleProceedBooking = async () => {
    if (selectedSeatIds.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 ghế để tiếp tục.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await cinemaService.createBooking({
        showtimeId,
        seatIds: selectedSeatIds
      });
      // Điều hướng ngay sang màn hình đơn hàng /booking/:id
      const targetBookingId = res.data?.id || res.data?.bookingId;
      navigate(`/booking/${targetBookingId}`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Không thể giữ ghế. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container loading-container">
        <div className="spinner"></div>
        <p>Đang tải sơ đồ phòng chiếu...</p>
      </div>
    );
  }

  if (!seatMapData) {
    return (
      <div className="page-container empty-container">
        <h2>Không tìm thấy dữ liệu suất chiếu</h2>
        <button className="btn-movie-book" onClick={() => navigate('/movie')}>Quay lại danh sách phim</button>
      </div>
    );
  }

  const { showtime, seats } = seatMapData;

  // Tính tổng tiền các ghế đã chọn
  const selectedSeatsList = seats.filter((s) => selectedSeatIds.includes(s.id));
  const totalAmount = selectedSeatsList.reduce((sum, s) => sum + s.price, 0);

  // Nhóm ghế theo từng hàng (A -> H)
  const rowsMap = {};
  seats.forEach((seat) => {
    if (!rowsMap[seat.row]) rowsMap[seat.row] = [];
    rowsMap[seat.row].push(seat);
  });
  const rowLetters = Object.keys(rowsMap).sort();

  return (
    <div className="seat-selection-screen">
      {/* 1. THANH HEADER THÔNG TIN SUẤT CHIẾU */}
      <div className="seat-header-bar">
        <div className="container header-bar-content">
          <button className="btn-back-link" onClick={() => navigate(`/movie/${showtime.movieId}`)}>
            <FeatherIcon name="arrow-left" size={18} /> Quay lại phim
          </button>

          <div className="showtime-summary-center">
            <h2 className="summary-movie-title spotlight-text">{showtime.movieTitle}</h2>
            <div className="summary-meta-row">
              <span className="summary-meta-item"><FeatherIcon name="map-pin" size={14} /> {showtime.cinemaName}</span>
              <span className="summary-meta-divider">•</span>
              <span className="summary-meta-item"><FeatherIcon name="monitor" size={14} /> {showtime.roomName}</span>
              <span className="summary-meta-divider">•</span>
              <span className="summary-meta-item"><FeatherIcon name="clock" size={14} /> {new Date(showtime.startsAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ({showtime.format})</span>
            </div>
          </div>

          <div className="seat-hold-policy-tag">
            <FeatherIcon name="shield" size={14} /> Giữ ghế 10 phút sau khi chọn
          </div>
        </div>
      </div>

      <div className="container seat-screen-body">
        {/* THÔNG BÁO LỖI NẾU CÓ */}
        {errorMsg && (
          <div className="seat-error-banner">
            <FeatherIcon name="alert-circle" size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2. MÀN CHIẾU BETA VỚI ÁNH SÁNG CHIẾU */}
        <div className="cinema-screen-container">
          <div className="cinema-screen-curve"></div>
          <span className="screen-label">MÀN HÌNH CHIẾU / SCREEN</span>
        </div>

        {/* 3. MA TRẬN GHẾ PHÒNG CHIẾU */}
        <div className="seat-grid-container">
          <div className="seat-matrix">
            {rowLetters.map((rowLetter) => (
              <div key={rowLetter} className="seat-row">
                <span className="row-indicator">{rowLetter}</span>
                <div className="row-seats">
                  {rowsMap[rowLetter].map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isBooked = seat.status === 'BOOKED' || seat.status === 'HELD';
                    const isVip = seat.type === 'VIP';

                    let seatClass = 'seat-cell';
                    if (isBooked) seatClass += ' booked';
                    else if (isSelected) seatClass += ' selected';
                    else if (isVip) seatClass += ' vip';
                    else seatClass += ' standard';

                    return (
                      <button
                        key={seat.id}
                        className={seatClass}
                        disabled={isBooked}
                        onClick={() => handleToggleSeat(seat)}
                        title={`${seat.row}${seat.number < 10 ? '0' + seat.number : seat.number} - ${seat.type} (${seat.price.toLocaleString('vi-VN')}đ)`}
                      >
                        {seat.number}
                      </button>
                    );
                  })}
                </div>
                <span className="row-indicator">{rowLetter}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. CHÚ THÍCH CÁC LOẠI GHẾ */}
        <div className="seat-legend-row">
          <div className="legend-item">
            <span className="legend-sample standard"></span>
            <span>Ghế Thường ({showtime.minTicketPrice.toLocaleString('vi-VN')}đ)</span>
          </div>
          <div className="legend-item">
            <span className="legend-sample vip"></span>
            <span>Ghế VIP ({(showtime.minTicketPrice + 20000).toLocaleString('vi-VN')}đ)</span>
          </div>
          <div className="legend-item">
            <span className="legend-sample selected"></span>
            <span>Ghế Đang Chọn</span>
          </div>
          <div className="legend-item">
            <span className="legend-sample booked"></span>
            <span>Ghế Đã Có Người Đặt</span>
          </div>
        </div>
      </div>

      {/* 5. THANH BOTTOM BAR CỐ ĐỊNH CHỐT GHẾ */}
      <div className="seat-bottom-bar">
        <div className="container bottom-bar-flex">
          <div className="selected-seats-info">
            <span className="info-title">Ghế đã chọn ({selectedSeatIds.length}/8):</span>
            <div className="selected-labels-row">
              {selectedSeatsList.length === 0 ? (
                <span className="no-seats-hint">Chưa chọn ghế nào. Vui lòng bấm vào sơ đồ để chọn ghế.</span>
              ) : (
                selectedSeatsList.map((s) => (
                  <span key={s.id} className="selected-badge">
                    {s.row}{s.number < 10 ? '0' + s.number : s.number} ({s.type})
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="total-and-action">
            <div className="total-price-box">
              <span className="total-label">Tổng tiền vé:</span>
              <span className="total-amount spotlight-text">{totalAmount.toLocaleString('vi-VN')} đ</span>
            </div>

            <button
              className="btn-confirm-seats"
              disabled={selectedSeatIds.length === 0 || submitting}
              onClick={handleProceedBooking}
            >
              {submitting ? 'Đang giữ ghế...' : 'TIẾP TỤC (ĐẶT VÉ)'} <FeatherIcon name="chevron-right" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
