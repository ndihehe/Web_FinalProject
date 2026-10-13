import { STORAGE_KEY, INITIAL_DATA, GENRES, CITIES } from './mockData.js';

function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.currentUser) {
        parsed.currentUser = INITIAL_DATA.currentUser;
      }
      if (parsed.cinemas && !parsed.cinemas.some((c) => c.id === 'cin-04')) {
        const dnCinema = INITIAL_DATA.cinemas.find((c) => c.id === 'cin-04');
        if (dnCinema) parsed.cinemas.push(dnCinema);
      }
      if (parsed.bookings) {
        ['CANCELLED', 'PENDING_PAYMENT', 'REFUNDED'].forEach((st) => {
          if (!parsed.bookings.some((b) => b.status === st)) {
            const sample = INITIAL_DATA.bookings.find((b) => b.status === st);
            if (sample) parsed.bookings.push(sample);
          }
        });
      }
      if (parsed.walletTransactions && !parsed.walletTransactions.some((tx) => tx.type === 'REFUND')) {
        parsed.walletTransactions = INITIAL_DATA.walletTransactions;
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Lỗi đọc localStorage:', e);
  }
  return INITIAL_DATA;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Lỗi lưu localStorage:', e);
  }
}

function findOrGenerateShowtime(state, showtimeId) {
  let showtime = state.showtimes.find((st) => st.id === showtimeId);
  if (showtime) return showtime;

  let cinemaId = 'cin-01';
  let movieId = state.movies[0]?.id || 'mov-01';

  if (showtimeId) {
    const foundCin = state.cinemas.find(c => showtimeId.includes(c.id));
    if (foundCin) cinemaId = foundCin.id;
    const foundMov = state.movies.find(m => showtimeId.includes(m.id));
    if (foundMov) movieId = foundMov.id;
  }

  const cinema = state.cinemas.find(c => c.id === cinemaId) || state.cinemas[0];
  const movie = state.movies.find(m => m.id === movieId) || state.movies[0];

  const startDate = new Date();
  startDate.setHours(startDate.getHours() + 1, 0, 0, 0);
  const dur = movie?.durationMinutes || 120;
  const endDate = new Date(startDate.getTime() + dur * 60 * 1000);

  showtime = {
    id: showtimeId,
    movieId: movie.id,
    movieTitle: movie.title,
    cinemaId: cinema.id,
    cinemaName: cinema.name,
    roomId: 'room-01',
    roomName: 'Phòng Chiếu 1 (2D Digital)',
    startsAt: startDate.toISOString(),
    endsAt: endDate.toISOString(),
    format: '2D Phụ Đề',
    language: 'Tiếng Anh - Phụ đề Tiếng Việt',
    minTicketPrice: 95000,
    currency: 'VND',
    availableSeatCount: 48
  };

  state.showtimes.push(showtime);
  saveState(state);
  return showtime;
}

const delay = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

function successResponse(data, meta = null, message = null) {
  let responseData = data;
  if (meta && Array.isArray(data)) {
    responseData = [...data];
    responseData.items = data;
    responseData.meta = meta;
  }
  return {
    success: true,
    message: message || null,
    data: responseData,
    meta,
    traceId: 'req-' + Math.random().toString(36).substring(2, 10)
  };
}

function errorResponse(code, message, status = 400, fieldErrors = [], details = null) {
  const err = new Error(message);
  err.apiError = {
    success: false,
    status,
    error: message,
    code,
    fieldErrors,
    details,
    traceId: 'err-' + Math.random().toString(36).substring(2, 10)
  };
  return err;
}


const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const USE_MOCK_ENV = import.meta.env.VITE_USE_MOCK;
export const IS_REAL_API_MODE = USE_MOCK_ENV === 'false' && Boolean(API_BASE_URL);

async function apiFetch(endpoint, { method = 'GET', body = null, params = null, headers = {} } = {}) {
  let url = API_BASE_URL + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);

  if (params && typeof params === 'object') {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders = {
    'Accept': 'application/json',
    ...headers
  };

  if (body && !(body instanceof FormData)) {
    reqHeaders['Content-Type'] = 'application/json;charset=UTF-8';
  }

  const token = localStorage.getItem('access_token') || localStorage.getItem('cinema_auth_token');
  if (token) {
    reqHeaders['Authorization'] = 'Bearer ' + token;
  }

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined
  });

  let json = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    json = await res.json().catch(() => null);
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('cinema_auth_token');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { action: 'unauthorized' } }));
      }
    }
    const errorMsg = json?.error || json?.message || ('HTTP ' + res.status + ': ' + res.statusText);
    const code = json?.code || ('ERR_' + res.status);
    const fieldErrors = json?.fieldErrors || [];
    throw errorResponse(code, errorMsg, res.status, fieldErrors, json?.details);
  }

  if (res.status === 204) {
    return successResponse(null, null, 'Thành công');
  }

  if (json && json.success !== undefined) {
    if (json.data && Array.isArray(json.data.items)) {
      const cleanItems = json.data.items.filter(
        (item) => !(item.title && (item.title.includes('[TEST]') || item.title.includes('[PAYMENT_TEST]'))) &&
                  !(item.name && (item.name.includes('[TEST]') || item.name.includes('[PAYMENT_TEST]')))
      );
      const arrProxy = [...cleanItems];
      arrProxy.items = cleanItems;
      arrProxy.meta = { ...(json.data.meta || {}), totalElements: cleanItems.length };
      return {
        ...json,
        data: arrProxy
      };
    }
    return json;
  }

  const data = json !== null ? json : {};
  return successResponse(data);
}

function normalizeProduct(p) {
  if (!p || typeof p !== 'object') return p;
  const price = Number(p.price !== undefined ? p.price : (p.unitPrice !== undefined ? p.unitPrice : 0));
  const id = p.productId !== undefined ? p.productId : p.id;
  const name = p.productName || p.name || 'Sản phẩm F&B';
  return {
    ...p,
    id,
    productId: id,
    name,
    productName: name,
    price,
    unitPrice: price,
    description: p.description || '',
    category: p.category || 'Combo',
    imageUrl: p.imageUrl || p.image_url || '/images/aovis/popcorn1.jpg',
    status: p.status || 'AVAILABLE'
  };
}

function normalizeBookingData(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const b = { ...raw };

  if (b.bookingId !== undefined && b.id === undefined) {
    b.id = b.bookingId;
  }
  if (b.id !== undefined && b.bookingId === undefined) {
    b.bookingId = b.id;
  }

  if (b.status === 'PENDING') {
    b.status = 'PENDING_PAYMENT';
    b._originalStatus = 'PENDING';
  }

  if (!b.expiresAt && b.holdExpiresAt) {
    b.expiresAt = b.holdExpiresAt;
  }
  if (!b.holdExpiresAt && b.expiresAt) {
    b.holdExpiresAt = b.expiresAt;
  }

  if (!b.showtime && b.showTime) {
    b.showtime = {
      id: b.showTime.showTimeId || b.showTime.id || 0,
      showtimeId: b.showTime.showTimeId || b.showTime.id || 0,
      movieId: b.showTime.movieId || null,
      movieTitle: b.showTime.movieTitle || 'Vé xem phim',
      cinemaName: b.showTime.cinemaName || 'TDTDT Cinema',
      roomName: b.showTime.roomName || 'Phòng Chiếu 1',
      format: b.showTime.format || '2D Phụ Đề',
      startsAt: b.showTime.startTime || b.showTime.startsAt || new Date().toISOString(),
      startTime: b.showTime.startTime || b.showTime.startsAt || new Date().toISOString()
    };
  } else if (!b.showtime) {
    b.showtime = {
      id: b.showTimeId || 0,
      showtimeId: b.showTimeId || 0,
      movieTitle: 'Vé xem phim TDTDT Cinema',
      cinemaName: 'TDTDT Cinema',
      roomName: 'Phòng Chiếu 1',
      format: '2D Phụ Đề',
      startsAt: b.holdExpiresAt || b.expiresAt || b.createdAt || new Date().toISOString(),
      startTime: b.holdExpiresAt || b.expiresAt || b.createdAt || new Date().toISOString()
    };
  }
  if (b.showtime && !b.showTime) {
    b.showTime = b.showtime;
  }
  if (b.showtime) {
    if (!b.showtime.startsAt && b.showtime.startTime) {
      b.showtime.startsAt = b.showtime.startTime;
    }
    if (!b.showtime.startTime && b.showtime.startsAt) {
      b.showtime.startTime = b.showtime.startsAt;
    }
    b.showtime.movieTitle = b.showtime.movieTitle || 'Vé xem phim TDTDT Cinema';
    b.showtime.cinemaName = b.showtime.cinemaName || 'TDTDT Cinema';
    b.showtime.roomName = b.showtime.roomName || 'Phòng Chiếu 1';
    b.showtime.format = b.showtime.format || '2D Phụ Đề';
  }

  if ((!b.fnbItems || b.fnbItems.length === 0) && Array.isArray(b.products)) {
    b.fnbItems = b.products.map((p) => {
      const normalizedP = normalizeProduct(p);
      return {
        productId: normalizedP.id,
        name: normalizedP.name,
        quantity: p.quantity || 1,
        unitPrice: normalizedP.unitPrice,
        lineTotal: normalizedP.unitPrice * (p.quantity || 1)
      };
    });
  } else if (Array.isArray(b.fnbItems)) {
    b.fnbItems = b.fnbItems.map((item) => {
      const unitPrice = Number(item.unitPrice !== undefined ? item.unitPrice : (item.price !== undefined ? item.price : 0));
      const qty = item.quantity || 1;
      return {
        ...item,
        productId: item.productId !== undefined ? item.productId : item.id,
        name: item.name || item.productName || 'F&B Item',
        quantity: qty,
        unitPrice,
        lineTotal: Number(item.lineTotal !== undefined ? item.lineTotal : unitPrice * qty)
      };
    });
  } else {
    b.fnbItems = [];
  }

  if (Array.isArray(b.seats) && b.seats.length > 0 && typeof b.seats[0] === 'string') {
    b.seatLabels = [...b.seats];
    b.seats = b.seats.map((label) => ({
      seatId: label,
      label,
      type: 'STANDARD',
      unitPrice: 0
    }));
  } else if ((!b.seats || b.seats.length === 0) && Array.isArray(b.seatIds)) {
    b.seats = b.seatIds.map((sId) => ({
      seatId: sId,
      label: `Ghế #${sId}`,
      type: 'STANDARD',
      unitPrice: 0
    }));
    b.seatLabels = b.seats.map((s) => s.label);
  } else if (Array.isArray(b.seats)) {
    b.seats = b.seats.map((s) => ({
      ...s,
      seatId: s.seatId !== undefined ? s.seatId : (s.id || s.label),
      label: s.label || `Ghế #${s.seatId || s.id || ''}`,
      type: s.type || 'STANDARD',
      unitPrice: Number(s.unitPrice || s.price || 0)
    }));
    b.seatLabels = b.seats.map((s) => s.label);
  } else {
    b.seats = [];
    b.seatLabels = [];
  }

  if (b.voucherApplied && !b.voucher) {
    b.voucher = {
      code: b.voucherApplied,
      discountAmount: Number(b.discountAmount || 0)
    };
  }
  b.totalAmount = Number(b.totalAmount !== undefined ? b.totalAmount : (b.finalAmount !== undefined ? b.finalAmount : 0));
  b.discountAmount = Number(b.discountAmount || 0);

  if (b.fnbSubtotal === undefined) {
    b.fnbSubtotal = (b.fnbItems || []).reduce((sum, item) => sum + Number(item.lineTotal || (item.unitPrice * item.quantity) || 0), 0);
  }
  b.fnbSubtotal = Number(b.fnbSubtotal || 0);

  if (b.ticketSubtotal === undefined) {
    b.ticketSubtotal = Math.max(0, b.totalAmount - b.fnbSubtotal + b.discountAmount);
  }
  b.ticketSubtotal = Number(b.ticketSubtotal || 0);

  if (b.subtotal === undefined) {
    b.subtotal = b.ticketSubtotal + b.fnbSubtotal;
  }
  b.subtotal = Number(b.subtotal || 0);

  if (b.version === undefined) {
    b.version = 0;
  }

  if (!b.eligibility) {
    const isPending = b.status === 'PENDING' || b.status === 'PENDING_PAYMENT';
    const isPaid = b.status === 'CONFIRMED' || b.status === 'PAID';
    b.eligibility = {
      canCancel: isPending,
      cancelReasonCode: null,
      canRefund: isPaid,
      refundReasonCode: null,
      canReview: isPaid,
      reviewReasonCode: null
    };
  }

  return b;
}

export function normalizeTicket(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const t = { ...raw };
  if (t.ticketId !== undefined && t.id === undefined) t.id = t.ticketId;
  if (t.id !== undefined && t.ticketId === undefined) t.ticketId = t.id;
  if (!t.movieTitle && t.movieName) t.movieTitle = t.movieName;
  if (!t.movieName && t.movieTitle) t.movieName = t.movieTitle;
  if (!t.startsAt && t.showTimeStartTime) t.startsAt = t.showTimeStartTime;
  if (!t.showTimeStartTime && t.startsAt) t.showTimeStartTime = t.startsAt;
  if (!t.seatLabel && t.seatName) t.seatLabel = t.seatName;
  if (!t.seatName && t.seatLabel) t.seatName = t.seatLabel;
  if (!t.cinemaName) t.cinemaName = 'TDTDT Cinema';
  if (!t.roomName) t.roomName = 'Phòng Chiếu';
  if (!t.status) t.status = 'VALID';
  return t;
}


export {
  getState,
  saveState,
  findOrGenerateShowtime,
  delay,
  successResponse,
  errorResponse,
  API_BASE_URL,
  USE_MOCK_ENV,
  apiFetch,
  normalizeProduct,
  normalizeBookingData
};
