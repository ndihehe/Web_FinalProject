
import { authService } from './authService.js';
import { movieService } from './movieService.js';
import { bookingService } from './bookingService.js';

export { GENRES, CITIES, STORAGE_KEY, INITIAL_DATA } from './mockData.js';
export {
  IS_REAL_API_MODE,
  apiFetch,
  getState,
  saveState,
  findOrGenerateShowtime,
  delay,
  successResponse,
  errorResponse,
  normalizeProduct,
  normalizeBookingData,
  normalizeTicket
} from './apiClient.js';

export { authService } from './authService.js';
export { movieService } from './movieService.js';
export { bookingService } from './bookingService.js';

export const cinemaService = {
  ...authService,
  ...movieService,
  ...bookingService,

  payBooking(id, options, idempotencyKey) {
    return this.createPayment(id, options, idempotencyKey);
  },
  refundBooking(id, options, idempotencyKey) {
    return this.requestRefund(id, options, idempotencyKey);
  },
  createBookingReview(id, options, idempotencyKey) {
    return this.upsertReview(id, options, idempotencyKey);
  },
  applyVoucher(id, { voucherCode, expectedVersion }) {
    return this.updateBookingVoucher(id, { code: voucherCode, expectedVersion });
  },
  removeVoucher(id, { expectedVersion } = {}) {
    return this.updateBookingVoucher(id, { code: null, expectedVersion });
  },
  getCinemaProducts(cinemaId, options) {
    return this.getProducts(cinemaId, options);
  }
};

export default cinemaService;
