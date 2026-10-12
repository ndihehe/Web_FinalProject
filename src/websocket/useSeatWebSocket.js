import { useState, useEffect, useRef, useCallback } from 'react';
import { getWebSocketBaseUrl } from './websocketConfig';

export function useSeatWebSocket(showtimeId, currentUserId) {
  const [holdingSeatIds, setHoldingSeatIds] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState(null);

  const wsRef = useRef(null);
  const pingTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  // Lấy JWT token từ localStorage
  const getAccessToken = () => {
    try {
      const stored = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (stored) return stored;
      const userObj = localStorage.getItem('beta_cinema_user');
      if (userObj) {
        const parsed = JSON.parse(userObj);
        return parsed.token || parsed.accessToken || '';
      }
    } catch (_) {}
    return '';
  };

  // Giải mã userId trực tiếp từ JWT Access Token
  const parseUserIdFromToken = (tok) => {
    if (!tok) return null;
    try {
      const parts = tok.split('.');
      if (parts.length >= 2) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const parsed = JSON.parse(jsonPayload);
        return parsed.sub ? String(parsed.sub) : null;
      }
    } catch (_) {}
    return null;
  };

  const connect = useCallback(() => {
    if (!showtimeId) return;

    try {
      const baseUrl = getWebSocketBaseUrl();
      const token = getAccessToken();
      const myUserId = currentUserId ? String(currentUserId) : parseUserIdFromToken(token);
      const wsUrl = token ? `${baseUrl}/${showtimeId}?token=${encodeURIComponent(token)}` : `${baseUrl}/${showtimeId}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setSocketError(null);

        // Bắt đầu gửi PING giữ kết nối định kỳ mỗi 25 giây (Keep-Alive)
        if (pingTimerRef.current) clearInterval(pingTimerRef.current);
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (!msg || !msg.type) return;

          // 1. Nhận danh sách ghế đang bị giữ khi vừa vào phòng
          if (msg.type === 'INITIAL_STATE' && msg.holdingSeats) {
            const othersHolding = [];
            Object.entries(msg.holdingSeats).forEach(([sId, uId]) => {
              if (String(uId) !== String(myUserId)) {
                othersHolding.push(Number(sId));
              }
            });
            setHoldingSeatIds(othersHolding);
          }

          // 2. Nhận thông báo thời gian thực khi trạng thái ghế thay đổi
          if (msg.type === 'SEAT_STATE_CHANGED') {
            const targetSeatId = Number(msg.seatId);
            const actionUserId = msg.userId;

            if (msg.status === 'HOLDING') {
              // Nếu người giữ là người khác -> Đổi ghế thành màu xám (disabled)
              if (String(actionUserId) !== String(myUserId)) {
                setHoldingSeatIds((prev) => Array.from(new Set([...prev, targetSeatId])));
              }
            } else if (msg.status === 'AVAILABLE') {
              // Ghế được nhả ra -> Cho phép chọn lại
              setHoldingSeatIds((prev) => prev.filter((id) => id !== targetSeatId));
            } else if (msg.status === 'BOOKED') {
              // Ghế đã bán xong -> Loại khỏi danh sách giữ và chuyển hẳn thành đã bán
              setHoldingSeatIds((prev) => prev.filter((id) => id !== targetSeatId));
            }
          }

          // 3. Nhận thông báo lỗi từ Server (ví dụ: ghế đã có người nhanh tay hơn)
          if (msg.type === 'ERROR' && msg.message) {
            setSocketError(msg.message);
          }
        } catch (e) {
          console.warn('Lỗi phân tích gói tin socket:', e);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (pingTimerRef.current) clearInterval(pingTimerRef.current);

        // Tự động kết nối lại sau 4 giây nếu rớt mạng bất ngờ
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, 4000);
      };
    } catch (err) {
      console.warn('Không thể khởi tạo WebSocket:', err);
    }
  }, [showtimeId, currentUserId]);

  useEffect(() => {
    connect();

    return () => {
      // Hủy kết nối an toàn khi rời khỏi màn hình
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Tránh trigger reconnect khi cố ý đóng
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Gửi lệnh giữ ghế
  const sendHoldSeat = useCallback((seatId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'HOLD_SEAT',
        seatId: Number(seatId)
      }));
    }
  }, []);

  // Gửi lệnh nhả ghế
  const sendReleaseSeat = useCallback((seatId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'RELEASE_SEAT',
        seatId: Number(seatId)
      }));
    }
  }, []);

  return {
    holdingSeatIds,
    isConnected,
    socketError,
    sendHoldSeat,
    sendReleaseSeat
  };
}
