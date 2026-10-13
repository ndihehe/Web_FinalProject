import {
  IS_REAL_API_MODE,
  apiFetch,
  delay,
  getState,
  saveState,
  findOrGenerateShowtime,
  successResponse,
  errorResponse,
  normalizeProduct
} from './apiClient.js';
import { GENRES, CITIES } from './mockData.js';

export const movieService = {
  async getHome() {
    if (IS_REAL_API_MODE) {
      const res = await apiFetch('/home').catch(() => apiFetch('/'));
      if (res && res.data) {
        if (Array.isArray(res.data.nowShowing)) {
          res.data.nowShowing = res.data.nowShowing.filter((m) => !m.title?.includes('[TEST]') && !m.title?.includes('[PAYMENT_TEST]'));
        }
        if (Array.isArray(res.data.featuredCinemas)) {
          res.data.featuredCinemas = res.data.featuredCinemas.filter((c) => !c.name?.includes('[TEST]') && !c.name?.includes('[PAYMENT_TEST]'));
        }
        if (Array.isArray(res.data.cities)) {
          res.data.cities = res.data.cities.filter((c) => !c.name?.includes('Test') && !c.code?.includes('Test'));
        }

        if (!res.data.nowShowing || res.data.nowShowing.length === 0) {
          const moviesRes = await this.getMovies({ size: 10 }).catch(() => null);
          const list = Array.isArray(moviesRes?.data) ? moviesRes.data : (moviesRes?.data?.items || []);
          res.data.nowShowing = list;
        }

        if (!res.data.featuredCinemas || res.data.featuredCinemas.length === 0) {
          const cinemasRes = await this.getCinemas({ size: 10 }).catch(() => null);
          const cinList = Array.isArray(cinemasRes?.data) ? cinemasRes.data : (cinemasRes?.data?.items || []);
          res.data.featuredCinemas = cinList;
        }
      }
      return res;
    }
    await delay();
    const state = getState();
    const nowShowing = state.movies.filter((m) => m.status === 'NOW_SHOWING');
    const comingSoon = state.movies.filter((m) => m.status === 'COMING_SOON');
    return successResponse({
      nowShowing,
      comingSoon,
      featuredCinemas: state.cinemas,
      genres: GENRES,
      cities: CITIES
    });
  },

  async getMovies({ q = '', genre = '', status = '', page = 0, size = 20, sort = 'releaseDate,desc' } = {}) {
    if (IS_REAL_API_MODE) {
      let apiStatus = status;
      if (apiStatus === 'NOW_SHOWING') {
        apiStatus = 'ACTIVE';
      }
      const res = await apiFetch('/movies', { params: { q, genre, status: apiStatus || undefined, page, size, sort } })
        .catch(() => apiFetch('/movie', { params: { q, genre, status: apiStatus || undefined, page, size, sort } }));
      if (res && res.data && Array.isArray(res.data.items)) {
        res.data.items = res.data.items.filter((m) => !m.title?.includes('[TEST]') && !m.title?.includes('[PAYMENT_TEST]'));
      }
      return res;
    }
    await delay();
    const state = getState();
    let result = [...state.movies];

    if (q) {
      const keyword = q.toLowerCase().trim();
      result = result.filter((m) => m.title.toLowerCase().includes(keyword) || m.director.toLowerCase().includes(keyword));
    }
    if (genre) {
      result = result.filter((m) => m.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
    }
    if (status) {
      result = result.filter((m) => m.status === status);
    }

    const totalElements = result.length;
    const totalPages = Math.ceil(totalElements / size) || 1;
    const pagedData = result.slice(page * size, (page + 1) * size);

    return successResponse(pagedData, { page, size, totalElements, totalPages });
  },

  async getMovieDetail(id) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/movies/' + id).catch(() => apiFetch('/movie/' + id));
    }
    await delay();
    const state = getState();
    const strId = String(id || '');
    let movie = state.movies.find((m) => m.id === strId);
    if (!movie && strId) {
      const numMatch = strId.match(/\d+/);
      if (numMatch) {
        const numVal = parseInt(numMatch[0], 10);
        movie = state.movies.find((m) => {
          const mMatch = m.id.match(/\d+/);
          return mMatch && parseInt(mMatch[0], 10) === numVal;
        });
      }
    }
    if (!movie) throw errorResponse('MOVIE_NOT_FOUND', `Không tìm thấy phim với mã ${id}`);
    return successResponse(movie);
  },

  async getMovieShowtimes(movieId, { cinemaId = null, date = null, page = 0, size = 50 } = {}) {
    if (IS_REAL_API_MODE) {
      const effectiveDate = date || new Date().toISOString().split('T')[0];
      return apiFetch('/movies/' + movieId + '/showtimes', { params: { cinemaId, date: effectiveDate, page, size } })
        .catch(() => apiFetch('/movie/' + movieId + '/showtime', { params: { cinemaId, date: effectiveDate, page, size } }));
    }
    await delay();
    const state = getState();
    const strMovieId = String(movieId || '');
    let effectiveMovie = state.movies.find((m) => m.id === strMovieId);
    if (!effectiveMovie && strMovieId) {
      const numMatch = strMovieId.match(/\d+/);
      if (numMatch) {
        const numVal = parseInt(numMatch[0], 10);
        effectiveMovie = state.movies.find((m) => {
          const mMatch = m.id.match(/\d+/);
          return mMatch && parseInt(mMatch[0], 10) === numVal;
        });
      }
    }
    const effectiveId = effectiveMovie ? effectiveMovie.id : strMovieId;

    let result = state.showtimes.filter((st) => st.movieId === effectiveId || String(st.movieId).replace(/-0+/, '-') === String(effectiveId).replace(/-0+/, '-'));
    if (cinemaId) {
      const strCinId = String(cinemaId);
      result = result.filter((st) => st.cinemaId === strCinId || String(st.cinemaId).replace(/-0+/, '-') === strCinId.replace(/-0+/, '-'));
    }

    const now = new Date();
    let activeShowtimes = result.filter((st) => new Date(st.startsAt) > now);

    if (activeShowtimes.length < 15) {
      const sampleTimes = [
        { hour: 9, min: 0, dur: 135 },
        { hour: 11, min: 30, dur: 135 },
        { hour: 14, min: 15, dur: 135 },
        { hour: 17, min: 0, dur: 135 },
        { hour: 19, min: 45, dur: 135 },
        { hour: 22, min: 15, dur: 135 }
      ];

      const targetCinemas = cinemaId ? state.cinemas.filter(c => c.id === cinemaId) : state.cinemas;
      const genShowtimes = [];

      targetCinemas.forEach((cin) => {
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          sampleTimes.forEach((st, sIdx) => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + dayOffset);
            startDate.setHours(st.hour, st.min, 0, 0);
            if (dayOffset === 0 && startDate < now) {
              return;
            }
            const endDate = new Date(startDate.getTime() + st.dur * 60 * 1000);

            genShowtimes.push({
              id: `st-gen-${cin.id}-${effectiveId}-d${dayOffset}-${sIdx}`,
              movieId: effectiveId,
              movieTitle: state.movies.find(m => m.id === effectiveId)?.title || 'Phim Beta',
              cinemaId: cin.id,
              cinemaName: cin.name,
              roomId: `room-0${(sIdx % 3) + 1}`,
              roomName: `Phòng Chiếu ${(sIdx % 3) + 1} (${sIdx % 2 === 0 ? '2D Digital' : '3D Laser'})`,
              startsAt: startDate.toISOString(),
              endsAt: endDate.toISOString(),
              format: sIdx % 2 === 0 ? '2D Phụ Đề' : '3D IMAX Laser',
              language: 'Tiếng Anh - Phụ đề Tiếng Việt',
              minTicketPrice: 95000 + (sIdx % 3) * 15000,
              currency: 'VND',
              availableSeatCount: 45
            });
          });
        }
      });

      genShowtimes.forEach(gst => {
        if (!state.showtimes.some(st => st.id === gst.id)) {
          state.showtimes.push(gst);
        }
      });
      saveState(state);
      activeShowtimes = [...activeShowtimes, ...genShowtimes];
    }

    activeShowtimes.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    return successResponse(activeShowtimes, { page: 0, size: activeShowtimes.length, totalElements: activeShowtimes.length, totalPages: 1 });
  },

  async getMovieReviews(movieId, { page = 0, size = 20, sort = 'createdAt,desc' } = {}) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/movies/' + movieId + '/reviews', { params: { page, size, sort } })
        .catch(() => apiFetch('/movie/' + movieId + '/review', { params: { page, size, sort } }));
    }
    await delay();
    const state = getState();
    const result = state.reviews.filter((r) => r.movieId === movieId);
    return successResponse(result, { page: 0, size: result.length, totalElements: result.length, totalPages: 1 });
  },

  async getCinemas({ city = '', q = '', page = 0, size = 50 } = {}) {
    if (IS_REAL_API_MODE) {
      const res = await apiFetch('/cinemas', { params: { city, q, page, size } })
        .catch(() => apiFetch('/cinema', { params: { city, q, page, size } }));
      if (res && res.data && Array.isArray(res.data.items)) {
        res.data.items = res.data.items.filter((c) => !c.name?.includes('[TEST]') && !c.name?.includes('[PAYMENT_TEST]'));
      }
      return res;
    }
    await delay();
    const state = getState();
    let result = [...state.cinemas];
    if (city) {
      result = result.filter((c) => c.cityCode.toUpperCase() === city.toUpperCase());
    }
    if (q) {
      const keyword = q.toLowerCase().trim();
      result = result.filter((c) => c.name.toLowerCase().includes(keyword) || c.address.toLowerCase().includes(keyword));
    }
    return successResponse(result, { page: 0, size: result.length, totalElements: result.length, totalPages: 1 });
  },

  async getCinemaDetail(id) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/cinemas/' + id).catch(() => apiFetch('/cinema/' + id));
    }
    await delay();
    const state = getState();
    const strId = String(id || '');
    let cinema = state.cinemas.find((c) => c.id === strId);
    if (!cinema && strId) {
      const numMatch = strId.match(/\d+/);
      if (numMatch) {
        const numVal = parseInt(numMatch[0], 10);
        cinema = state.cinemas.find((c) => {
          const cMatch = c.id.match(/\d+/);
          return cMatch && parseInt(cMatch[0], 10) === numVal;
        });
      }
    }
    if (!cinema) throw errorResponse('CINEMA_NOT_FOUND', `Không tìm thấy rạp với mã ${id}`);
    return successResponse(cinema);
  },

  async getCinemaShowtimes(cinemaId, { date = null, movieId = null, page = 0, size = 50 } = {}) {
    if (IS_REAL_API_MODE) {
      const effectiveDate = date || new Date().toISOString().split('T')[0];
      return apiFetch('/cinemas/' + cinemaId + '/showtimes', { params: { date: effectiveDate, movieId, page, size } })
        .catch(() => apiFetch('/cinema/' + cinemaId + '/showtime', { params: { date: effectiveDate, movieId, page, size } }));
    }
    await delay();
    const state = getState();
    const strCinemaId = String(cinemaId || '');
    let effectiveCin = state.cinemas.find((c) => c.id === strCinemaId);
    if (!effectiveCin && strCinemaId) {
      const numMatch = strCinemaId.match(/\d+/);
      if (numMatch) {
        const numVal = parseInt(numMatch[0], 10);
        effectiveCin = state.cinemas.find((c) => {
          const cMatch = c.id.match(/\d+/);
          return cMatch && parseInt(cMatch[0], 10) === numVal;
        });
      }
    }
    const targetCinemaId = effectiveCin ? effectiveCin.id : strCinemaId;

    let result = state.showtimes.filter((st) => st.cinemaId === targetCinemaId || String(st.cinemaId).replace(/-0+/, '-') === String(targetCinemaId).replace(/-0+/, '-'));
    if (movieId) {
      const strMovId = String(movieId);
      result = result.filter((st) => st.movieId === strMovId || String(st.movieId).replace(/-0+/, '-') === strMovId.replace(/-0+/, '-'));
    }
    const now = new Date();
    let activeShowtimes = result.filter((st) => new Date(st.startsAt) > now);

    if (activeShowtimes.length < 15) {
      const cinemaObj = effectiveCin || state.cinemas[0];
      const targetMovies = movieId 
        ? state.movies.filter(m => m.id === movieId || String(m.id).replace(/-0+/, '-') === String(movieId).replace(/-0+/, '-')) 
        : state.movies.filter(m => m.status === 'NOW_SHOWING');

      const sampleHours = [
        { h: 9, m: 15 },
        { h: 11, m: 45 },
        { h: 14, m: 30 },
        { h: 17, m: 15 },
        { h: 20, m: 0 },
        { h: 22, m: 30 }
      ];

      const genShowtimes = [];
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        targetMovies.forEach((m, mIdx) => {
          const movieHours = sampleHours.slice(mIdx % 2, (mIdx % 2) + 4);
          movieHours.forEach((sh, sIdx) => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + dayOffset);
            startDate.setHours(sh.h, sh.m, 0, 0);
            if (dayOffset === 0 && startDate < now) {
              return;
            }
            const dur = m.durationMinutes || 120;
            const endDate = new Date(startDate.getTime() + dur * 60 * 1000);

            genShowtimes.push({
              id: `st-cin-${cinemaId}-${m.id}-d${dayOffset}-${sIdx}`,
              movieId: m.id,
              movieTitle: m.title,
              cinemaId: cinemaId,
              cinemaName: cinemaObj ? cinemaObj.name : 'Beta Cinema',
              roomId: `room-0${(sIdx % 3) + 1}`,
              roomName: `Phòng Chiếu ${(sIdx % 3) + 1} (${sIdx % 2 === 0 ? '2D Digital' : '3D Laser'})`,
              startsAt: startDate.toISOString(),
              endsAt: endDate.toISOString(),
              format: sIdx % 2 === 0 ? '2D Phụ Đề' : '3D IMAX Laser',
              language: 'Tiếng Anh - Phụ đề Tiếng Việt',
              minTicketPrice: 95000 + (sIdx % 2) * 25000,
              currency: 'VND',
              availableSeatCount: 48
            });
          });
        });
      }

      genShowtimes.forEach(gst => {
        if (!state.showtimes.some(st => st.id === gst.id)) {
          state.showtimes.push(gst);
        }
      });
      saveState(state);
      activeShowtimes = [...activeShowtimes, ...genShowtimes];
    }

    activeShowtimes.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    return successResponse(activeShowtimes, { page: 0, size: activeShowtimes.length, totalElements: activeShowtimes.length, totalPages: 1 });
  },

  async getSeatMap(showtimeId) {
    if (IS_REAL_API_MODE) {
      const numericId = typeof showtimeId === 'string' ? (parseInt(showtimeId.replace(/\D/g, ''), 10) || showtimeId) : showtimeId;
      return apiFetch('/showtimes/' + numericId + '/seats');
    }
    await delay();
    const state = getState();
    const showtime = findOrGenerateShowtime(state, showtimeId);

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seats = [];

    const bookedSeatLabels = new Set();
    state.bookings
      .filter((b) => b.showtime.id === showtimeId && (b.status === 'PAID' || b.status === 'PENDING_PAYMENT'))
      .forEach((b) => {
        b.seats.forEach((s) => bookedSeatLabels.add(s.label));
      });

    rows.forEach((rowLetter, rowIndex) => {
      for (let num = 1; num <= 10; num++) {
        const label = `${rowLetter}${num < 10 ? '0' + num : num}`;
        const isVip = ['D', 'E', 'F'].includes(rowLetter) && num >= 3 && num <= 8;
        const seatPrice = isVip ? showtime.minTicketPrice + 20000 : showtime.minTicketPrice;
        const isBooked = bookedSeatLabels.has(label) || (rowLetter === 'H' && (num === 5 || num === 6));

        seats.push({
          id: `s-${label}`,
          row: rowLetter,
          number: num,
          x: num,
          y: rowIndex + 1,
          type: isVip ? 'VIP' : 'STANDARD',
          price: seatPrice,
          status: isBooked ? 'BOOKED' : 'AVAILABLE',
          heldByCurrentUser: false,
          holdExpiresAt: null
        });
      }
    });

    return successResponse({
      showtime,
      serverTime: new Date().toISOString(),
      screenPosition: 'TOP',
      seats
    });
  },

  async getProducts(cinemaId, { type = '', page = 0, size = 50 } = {}) {
    if (IS_REAL_API_MODE) {
      const res = await apiFetch('/products', { params: { category: type || undefined, status: 'AVAILABLE', page, size } })
        .catch(() => apiFetch('/product', { params: { cinemaId, type, page, size } }));
      if (res && res.data) {
        if (Array.isArray(res.data)) {
          res.data = res.data.map(normalizeProduct);
        } else if (Array.isArray(res.data.items)) {
          res.data.items = res.data.items.map(normalizeProduct);
        }
      }
      return res;
    }
    await delay();
    const state = getState();
    const list = state.products.filter((p) => p.cinemaId === cinemaId || !p.cinemaId).map(normalizeProduct);
    return successResponse(list, { page: 0, size: list.length, totalElements: list.length, totalPages: 1 });
  },

  async upsertReview(bookingId, { rating = 5, comment = '', expectedReviewVersion = 0 }, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      return apiFetch('/booking/' + bookingId + '/review', { method: 'POST', body: { rating, comment, expectedReviewVersion }, headers });
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy đơn');

    if (booking.status !== 'PAID') throw errorResponse('REVIEW_NOT_ELIGIBLE', 'Chỉ được đánh giá khi đơn đã thanh toán');
    if (new Date(booking.showtime.endsAt) > new Date()) {
      throw errorResponse('REVIEW_NOT_ELIGIBLE', 'Chỉ được đánh giá sau khi suất chiếu phim kết thúc');
    }

    const newRev = {
      id: 'rev-' + Date.now().toString().slice(-6),
      movieId: booking.showtime.movieId,
      authorDisplayName: state.currentUser.fullName,
      rating,
      comment,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.reviews.unshift(newRev);
    saveState(state);
    return successResponse(newRev);
  },


  createBookingReview(id, options, idempotencyKey) {
    return this.upsertReview(id, options, idempotencyKey);
  },
  getCinemaProducts(cinemaId, options) {
    return this.getProducts(cinemaId, options);
  }
};

export default movieService;
