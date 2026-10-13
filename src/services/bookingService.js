import {
  IS_REAL_API_MODE,
  apiFetch,
  delay,
  getState,
  saveState,
  successResponse,
  errorResponse,
  normalizeBookingData,
  normalizeTicket
} from './apiClient.js';

export const bookingService = {
  async createBooking({ showtimeId, seatIds, productItems }, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      const numericShowtimeId = typeof showtimeId === 'string' ? (parseInt(showtimeId.replace(/\D/g, ''), 10) || showtimeId) : showtimeId;
      const numericSeatIds = (seatIds || []).map((s) => (typeof s === 'string' ? (parseInt(s.replace(/\D/g, ''), 10) || s) : s));
      const res = await apiFetch('/bookings', {
        method: 'POST',
        body: {
          showTimeId: numericShowtimeId,
          seatIds: numericSeatIds,
          productItems: productItems || []
        },
        headers
      });
      if (res && res.data) {
        res.data = normalizeBookingData(res.data);
      }
      return res;
    }
    await delay();
    if (!seatIds || seatIds.length === 0) {
      throw errorResponse('INVALID_SEAT_SELECTION', 'Vui lòng chọn ít nhất 1 ghế');
    }
    if (seatIds.length > 8) {
      throw errorResponse('INVALID_SEAT_SELECTION', 'Chỉ được đặt tối đa 8 ghế cho mỗi đơn');
    }

    const state = getState();
    const showtime = findOrGenerateShowtime(state, showtimeId);

    const seats = seatIds.map((id) => {
      const label = id.replace('s-', '');
      const isVip = ['D', 'E', 'F'].includes(label[0]);
      return {
        seatId: id,
        label,
        type: isVip ? 'VIP' : 'STANDARD',
        unitPrice: isVip ? showtime.minTicketPrice + 20000 : showtime.minTicketPrice
      };
    });

    const ticketSubtotal = seats.reduce((sum, s) => sum + s.unitPrice, 0);
    const bookingId = 'bk-' + Date.now().toString().slice(-8);
    const now = new Date();
    const expiresAt = new Date(Math.min(now.getTime() + 10 * 60 * 1000, new Date(showtime.startsAt).getTime())).toISOString();

    const newBooking = {
      id: bookingId,
      userId: state.currentUser?.id,
      userEmail: state.currentUser?.email,
      status: 'PENDING_PAYMENT',
      version: 0,
      showtime,
      seats,
      fnbItems: [],
      voucher: null,
      ticketSubtotal,
      fnbSubtotal: 0,
      subtotal: ticketSubtotal,
      discountAmount: 0,
      totalAmount: ticketSubtotal,
      currency: 'VND',
      createdAt: now.toISOString(),
      expiresAt,
      paidAt: null,
      cancelledAt: null,
      cancellationReason: null,
      serverTime: now.toISOString(),
      ticketIds: [],
      latestPaymentId: null,
      refundId: null,
      eligibility: {
        canCancel: true,
        cancelReasonCode: null,
        canRefund: false,
        refundReasonCode: 'NOT_PAID',
        canReview: false,
        reviewReasonCode: 'SHOWTIME_NOT_ENDED'
      }
    };

    state.bookings.unshift(newBooking);
    saveState(state);
    return successResponse(newBooking);
  },

  async getBookingDetail(id) {
    if (IS_REAL_API_MODE) {
      const numericId = typeof id === 'string' ? (parseInt(id.replace(/\D/g, ''), 10) || id) : id;
      const res = await apiFetch('/bookings/' + numericId);
      if (res && res.data) {
        res.data = normalizeBookingData(res.data);
      }
      return res;
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', `Không tìm thấy đơn hàng với mã ${id}`);

    if (booking.status === 'PENDING_PAYMENT' && new Date(booking.expiresAt) < new Date()) {
      booking.status = 'EXPIRED';
      booking.eligibility.canCancel = false;
      saveState(state);
    }

    return successResponse(booking);
  },

  async updateBookingFnb(id, { items = [], expectedVersion }) {
    if (IS_REAL_API_MODE) {
      const numericId = typeof id === 'string' ? (parseInt(id.replace(/\D/g, ''), 10) || id) : id;
      const formattedItems = (items || []).map((it) => ({
        productId: typeof it.productId === 'string' ? (parseInt(it.productId.replace(/\D/g, ''), 10) || it.productId) : it.productId,
        quantity: it.quantity
      }));
      const res = await apiFetch('/bookings/' + numericId + '/items', {
        method: 'PUT',
        body: { items: formattedItems }
      });
      if (res && res.data) {
        res.data = normalizeBookingData(res.data);
      }
      return res;
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy đơn');

    if (booking.status === 'EXPIRED') throw errorResponse('BOOKING_EXPIRED', 'Đơn hàng đã hết hạn giữ chỗ');
    if (booking.status !== 'PENDING_PAYMENT') throw errorResponse('BOOKING_STATE_CONFLICT', 'Chỉ được sửa F&B khi đơn chưa thanh toán');
    if (expectedVersion !== undefined && booking.version !== expectedVersion) {
      throw errorResponse('VERSION_CONFLICT', 'Đơn hàng đã được cập nhật ở nơi khác', [], { currentVersion: booking.version });
    }

    let fnbSubtotal = 0;
    const fnbItems = [];
    for (const item of items) {
      const prod = state.products.find((p) => p.id === item.productId);
      if (prod && item.quantity > 0) {
        const lineTotal = prod.unitPrice * item.quantity;
        fnbSubtotal += lineTotal;
        fnbItems.push({
          productId: prod.id,
          name: prod.name,
          quantity: item.quantity,
          unitPrice: prod.unitPrice,
          lineTotal
        });
      }
    }

    booking.fnbItems = fnbItems;
    booking.fnbSubtotal = fnbSubtotal;
    booking.subtotal = booking.ticketSubtotal + fnbSubtotal;

    if (booking.voucher) {
      const v = state.vouchers.find((voc) => voc.code === booking.voucher.code);
      if (v) {
        let disc = v.discountType === 'FIXED' ? v.discountValue : Math.floor((booking.subtotal * v.discountValue) / 100);
        if (v.maxDiscountAmount && disc > v.maxDiscountAmount) disc = v.maxDiscountAmount;
        booking.discountAmount = Math.min(disc, booking.subtotal);
        booking.voucher.discountAmount = booking.discountAmount;
      }
    }

    booking.totalAmount = Math.max(0, booking.subtotal - booking.discountAmount);
    booking.version += 1;
    saveState(state);
    return successResponse(booking);
  },

  async updateBookingVoucher(id, { code = null, expectedVersion }) {
    if (IS_REAL_API_MODE) {
      const numericId = typeof id === 'string' ? (parseInt(id.replace(/\D/g, ''), 10) || id) : id;
      let res;
      if (code) {
        res = await apiFetch('/bookings/' + numericId + '/voucher', {
          method: 'PUT',
          body: { code }
        });
      } else {
        res = await apiFetch('/bookings/' + numericId + '/voucher', {
          method: 'PUT',
          body: { code: '' }
        });
      }
      if (res && res.data) {
        res.data = normalizeBookingData(res.data);
      }
      return res;
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy đơn');

    if (booking.status === 'EXPIRED') throw errorResponse('BOOKING_EXPIRED', 'Đơn hàng đã hết hạn giữ chỗ');
    if (booking.status !== 'PENDING_PAYMENT') throw errorResponse('BOOKING_STATE_CONFLICT', 'Chỉ áp dụng voucher khi đơn chưa thanh toán');
    if (expectedVersion !== undefined && booking.version !== expectedVersion) {
      throw errorResponse('VERSION_CONFLICT', 'Đơn hàng đã được cập nhật ở nơi khác', [], { currentVersion: booking.version });
    }

    if (!code) {
      booking.voucher = null;
      booking.discountAmount = 0;
      booking.totalAmount = booking.subtotal;
    } else {
      const v = state.vouchers.find((voc) => voc.code.toUpperCase() === code.trim().toUpperCase());
      if (!v) throw errorResponse('VOUCHER_NOT_APPLICABLE', 'Mã voucher không tồn tại hoặc đã hết hạn');
      if (booking.subtotal < v.minOrderAmount) {
        throw errorResponse('VOUCHER_NOT_APPLICABLE', `Đơn hàng tối thiểu phải từ ${v.minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng voucher này`);
      }

      let disc = v.discountType === 'FIXED' ? v.discountValue : Math.floor((booking.subtotal * v.discountValue) / 100);
      if (v.maxDiscountAmount && disc > v.maxDiscountAmount) disc = v.maxDiscountAmount;
      disc = Math.min(disc, booking.subtotal);

      booking.voucher = { code: v.code, discountAmount: disc };
      booking.discountAmount = disc;
      booking.totalAmount = Math.max(0, booking.subtotal - disc);
    }

    booking.version += 1;
    saveState(state);
    return successResponse(booking);
  },

  async cancelBooking(id, { reason = 'Khách hủy đơn', expectedVersion } = {}, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      const numericId = typeof id === 'string' ? (parseInt(id.replace(/\D/g, ''), 10) || id) : id;
      const res = await apiFetch('/bookings/' + numericId + '/cancel', {
        method: 'POST',
        body: { reason },
        headers
      });
      if (res && res.data) {
        res.data = normalizeBookingData(res.data);
      }
      return res;
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy đơn');

    if (booking.status === 'PAID') throw errorResponse('BOOKING_STATE_CONFLICT', 'Đơn đã thanh toán, không thể hủy trực tiếp. Vui lòng gửi yêu cầu hoàn tiền');
    if (booking.status === 'CANCELLED') return successResponse(booking);

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();
    booking.cancellationReason = reason;
    booking.eligibility.canCancel = false;
    booking.version += 1;

    saveState(state);
    return successResponse(booking);
  },

  async createPayment(id, { method = 'WALLET', expectedVersion } = {}, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      const numericId = typeof id === 'string' ? (parseInt(id.replace(/\D/g, ''), 10) || id) : id;
      const apiMethod = method === 'GATEWAY' ? 'VNPAY' : method;
      return apiFetch('/bookings/' + numericId + '/payment', { method: 'POST', body: { method: apiMethod }, headers });
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy đơn');

    if (booking.status === 'EXPIRED') throw errorResponse('BOOKING_EXPIRED', 'Đơn hàng đã hết hạn giữ chỗ');
    if (booking.status === 'PAID') throw errorResponse('BOOKING_STATE_CONFLICT', 'Đơn hàng đã được thanh toán');

    const amount = booking.totalAmount;

    if (method === 'WALLET') {
      if (state.wallet.balance < amount) {
        throw errorResponse('INSUFFICIENT_BALANCE', `Số dư ví không đủ (${state.wallet.balance.toLocaleString('vi-VN')}đ < ${amount.toLocaleString('vi-VN')}đ). Vui lòng nạp thêm tiền vào ví.`);
      }

      state.wallet.balance -= amount;
      state.wallet.updatedAt = new Date().toISOString();

      const newTx = {
        id: 'tx-' + Date.now().toString().slice(-8),
        type: 'PAYMENT',
        direction: 'DEBIT',
        amount,
        balanceAfter: state.wallet.balance,
        currency: 'VND',
        referenceType: 'PAYMENT',
        referenceId: booking.id,
        description: `Thanh toán vé xem phim ${booking.showtime.movieTitle} (${booking.seats.map((s) => s.label).join(', ')})`,
        createdAt: new Date().toISOString()
      };
      state.walletTransactions.unshift(newTx);
    }

    booking.status = 'PAID';
    booking.paidAt = new Date().toISOString();
    booking.version += 1;
    booking.eligibility.canCancel = false;

    const minutesBeforeShow = (new Date(booking.showtime.startsAt).getTime() - Date.now()) / (60 * 1000);
    booking.eligibility.canRefund = minutesBeforeShow >= 120;
    booking.eligibility.canReview = new Date(booking.showtime.endsAt) < new Date();

    const newTicketIds = [];
    booking.seats.forEach((seat, idx) => {
      const ticketId = `tk-${Date.now().toString().slice(-6)}-${idx + 1}`;
      const ticket = {
        id: ticketId,
        bookingId: booking.id,
        movieTitle: booking.showtime.movieTitle,
        cinemaName: booking.showtime.cinemaName,
        roomName: booking.showtime.roomName,
        startsAt: booking.showtime.startsAt,
        seatLabel: `${seat.label} (${seat.type})`,
        status: 'VALID',
        qrPayload: `BETA|${ticketId}|${booking.id}|${seat.label}|PAID`,
        issuedAt: new Date().toISOString()
      };
      state.tickets.unshift(ticket);
      newTicketIds.push(ticketId);
    });
    booking.ticketIds = newTicketIds;

    const invoiceId = `inv-${Date.now().toString().slice(-6)}`;
    const invoiceLines = [
      ...booking.seats.map((s) => ({
        type: 'TICKET',
        description: `Vé ${s.type}: ${booking.showtime.movieTitle} - Ghế ${s.label}`,
        quantity: 1,
        unitPrice: s.unitPrice,
        lineTotal: s.unitPrice
      })),
      ...booking.fnbItems.map((f) => ({
        type: 'FNB',
        description: f.name,
        quantity: f.quantity,
        unitPrice: f.unitPrice,
        lineTotal: f.lineTotal
      }))
    ];

    const newInvoice = {
      id: invoiceId,
      number: `INV-${Date.now().toString().slice(-8)}`,
      bookingId: booking.id,
      issuedAt: new Date().toISOString(),
      status: 'ISSUED',
      customerName: state.currentUser.fullName,
      lines: invoiceLines,
      subtotal: booking.subtotal,
      discountAmount: booking.discountAmount,
      totalAmount: booking.totalAmount,
      refundedAmount: 0,
      currency: 'VND'
    };
    state.invoices.unshift(newInvoice);

    saveState(state);
    return successResponse({
      id: 'pay-' + Date.now().toString().slice(-6),
      bookingId: booking.id,
      method,
      status: 'SUCCEEDED',
      amount,
      currency: 'VND',
      checkoutUrl: null,
      expiresAt: new Date().toISOString(),
      failureCode: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    });
  },

  async getTicketDetail(id) {
    if (IS_REAL_API_MODE) {
      const numericId = typeof id === 'string' ? (parseInt(id.replace(/\D/g, ''), 10) || id) : id;
      const res = await apiFetch('/tickets/' + numericId);
      if (res && res.data) {
        res.data = normalizeTicket(res.data);
      }
      return res;
    }
    await delay();
    const state = getState();
    const ticket = state.tickets.find((t) => t.id === id);
    if (!ticket) throw errorResponse('RESOURCE_NOT_FOUND', `Không tìm thấy vé với mã ${id}`);
    return successResponse(normalizeTicket(ticket));
  },

  async getBookingTickets(bookingId) {
    if (IS_REAL_API_MODE) {
      const numericId = typeof bookingId === 'string' ? (parseInt(bookingId.replace(/\D/g, ''), 10) || bookingId) : bookingId;
      const res = await apiFetch('/bookings/' + numericId + '/tickets');
      if (res && res.data) {
        const items = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.items) ? res.data.items : []);
        res.data = items.map(normalizeTicket);
      }
      return res;
    }
    await delay();
    const state = getState();
    const tickets = state.tickets.filter((t) => t.bookingId === bookingId);
    return successResponse(tickets.map(normalizeTicket));
  },

  async getBookingInvoice(id) {
    if (IS_REAL_API_MODE) {
      try {
        const detailRes = await this.getBookingDetail(id);
        const b = detailRes?.data || {};
        return {
          code: 'SUCCESS',
          data: {
            id: `inv-${b.id || id}`,
            number: `INV-${String(b.id || id).padStart(6, '0')}`,
            issuedAt: b.createdAt || new Date().toISOString(),
            customerName: b.customerName || 'Khách hàng',
            status: 'ISSUED',
            lines: (b.seats || []).map(s => ({
              description: `Vé xem phim (${b.movieTitle || 'Phim'}) - Ghế ${s.label || s.seatId}`,
              quantity: 1,
              unitPrice: s.price || 0,
              lineTotal: s.price || 0
            })).concat((b.products || []).map(p => ({
              description: p.productName || 'Bắp nước & Combo',
              quantity: p.quantity || 1,
              unitPrice: p.price || 0,
              lineTotal: (p.price || 0) * (p.quantity || 1)
            }))),
            subtotal: b.totalAmount || 0,
            discountAmount: 0,
            totalAmount: b.totalAmount || 0
          }
        };
      } catch (_) {
        throw errorResponse('INVOICE_NOT_AVAILABLE', 'Hóa đơn chưa sẵn sàng hoặc đơn chưa thanh toán');
      }
    }
    await delay();
    const state = getState();
    const invoice = state.invoices.find((inv) => inv.bookingId === id);
    if (!invoice) throw errorResponse('INVOICE_NOT_AVAILABLE', 'Hóa đơn chưa sẵn sàng hoặc đơn chưa thanh toán');
    return successResponse(invoice);
  },

  async requestRefund(id, { reason = 'Khách có việc đột xuất', expectedVersion } = {}, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      const numericId = typeof id === 'string' ? (parseInt(id.replace(/\D/g, ''), 10) || id) : id;
      return apiFetch('/bookings/' + numericId + '/refund', { method: 'POST', body: { reason }, headers });
    }
    await delay();
    const state = getState();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy đơn');

    if (booking.status !== 'PAID') throw errorResponse('REFUND_NOT_ELIGIBLE', 'Chỉ được hoàn tiền cho đơn đã thanh toán');

    const minutesBeforeShow = (new Date(booking.showtime.startsAt).getTime() - Date.now()) / (60 * 1000);
    if (minutesBeforeShow < 120) {
      throw errorResponse('REFUND_NOT_ELIGIBLE', 'Chỉ được hoàn tiền trước giờ chiếu phim ít nhất 120 phút');
    }

    const refundAmount = booking.totalAmount;
    state.wallet.balance += refundAmount;
    state.wallet.updatedAt = new Date().toISOString();

    const txId = 'tx-' + Date.now().toString().slice(-8);
    const refundTx = {
      id: txId,
      type: 'REFUND',
      direction: 'CREDIT',
      amount: refundAmount,
      balanceAfter: state.wallet.balance,
      currency: 'VND',
      referenceType: 'REFUND',
      referenceId: booking.id,
      description: `Hoàn tiền 100% vé xem phim ${booking.showtime.movieTitle} vào ví Beta`,
      createdAt: new Date().toISOString()
    };
    state.walletTransactions.unshift(refundTx);

    state.tickets
      .filter((t) => t.bookingId === booking.id)
      .forEach((t) => {
        t.status = 'VOID';
      });

    booking.status = 'REFUNDED';
    booking.eligibility.canRefund = false;
    booking.version += 1;

    const refundObj = {
      id: 'ref-' + Date.now().toString().slice(-6),
      bookingId: booking.id,
      reason,
      amount: refundAmount,
      destination: 'WALLET',
      status: 'SUCCEEDED',
      requestedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      walletTransactionId: txId
    };
    state.refunds.unshift(refundObj);

    saveState(state);
    return successResponse(refundObj);
  },

  async getRefundDetail(bookingId) {
    if (IS_REAL_API_MODE) {
      const numericId = typeof bookingId === 'string' ? (parseInt(bookingId.replace(/\D/g, ''), 10) || bookingId) : bookingId;
      return apiFetch('/bookings/' + numericId + '/refund');
    }
    await delay();
    const state = getState();
    const refund = state.refunds.find((r) => r.bookingId === bookingId);
    if (!refund) throw errorResponse('RESOURCE_NOT_FOUND', 'Không tìm thấy thông tin hoàn tiền');
    return successResponse(refund);
  },

  async getWallet() {
    if (IS_REAL_API_MODE) {
      const res = await apiFetch('/wallet')
        .catch(() => apiFetch('/user/wallet'))
        .catch(() => ({ success: true, data: { balance: 0, status: 'ACTIVE', currency: 'VND' } }));
      if (res && res.data) {
        res.data.balance = Number(res.data.balance !== undefined ? res.data.balance : 0);
      }
      return res;
    }
    await delay();
    const state = getState();
    return successResponse(state.wallet);
  },

  async topUpWallet({ amount = 100000, method = 'GATEWAY' } = {}, idempotencyKey = null) {
    if (IS_REAL_API_MODE) {
      const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
      const apiMethod = method === 'GATEWAY' ? 'VNPAY' : method;
      return apiFetch('/wallet/top-up', { method: 'POST', body: { amount, method: apiMethod }, headers });
    }
    await delay();
    if (amount < 10000 || amount > 10000000) {
      throw errorResponse('TOP_UP_AMOUNT_INVALID', 'Số tiền nạp mỗi lần từ 10.000đ đến 10.000.000đ');
    }

    const state = getState();
    state.wallet.balance += amount;
    state.wallet.updatedAt = new Date().toISOString();

    const topUpTx = {
      id: 'tx-' + Date.now().toString().slice(-8),
      type: 'TOP_UP',
      direction: 'CREDIT',
      amount,
      balanceAfter: state.wallet.balance,
      currency: 'VND',
      referenceType: 'TOP_UP',
      referenceId: 'topup-' + Date.now().toString().slice(-6),
      description: 'Nạp tiền vào ví qua Cổng thanh toán',
      createdAt: new Date().toISOString()
    };
    state.walletTransactions.unshift(topUpTx);
    saveState(state);

    return successResponse({
      id: topUpTx.referenceId,
      amount,
      currency: 'VND',
      method: 'GATEWAY',
      status: 'SUCCEEDED',
      checkoutUrl: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    });
  },

  async getWalletTransactions({ page = 0, size = 20, type = null } = {}) {
    if (IS_REAL_API_MODE) {
      const res = await apiFetch('/wallet/transactions', { params: { page, size, type } })
        .catch(() => ({ success: true, data: { items: [], meta: { totalElements: 0 } } }));
      if (res && res.data) {
        const normalizeTx = (tx) => {
          if (!tx || typeof tx !== 'object') return tx;
          const item = { ...tx };
          if (item.transactionId !== undefined && item.id === undefined) item.id = item.transactionId;
          if (item.id !== undefined && item.transactionId === undefined) item.transactionId = item.id;
          const tType = item.transactionType || item.type || 'PAYMENT';
          item.type = tType;
          item.transactionType = tType;
          if (!item.direction) {
            item.direction = (tType === 'ADD_MONEY' || tType === 'TOP_UP' || tType === 'REFUND') ? 'CREDIT' : 'DEBIT';
          }
          if (item.amount !== undefined) item.amount = Number(item.amount);
          if (item.balanceAfter === undefined || item.balanceAfter === null) {
            item.balanceAfter = item.amount || 0;
          } else {
            item.balanceAfter = Number(item.balanceAfter);
          }
          return item;
        };
        if (Array.isArray(res.data)) {
          res.data = res.data.map(normalizeTx);
        } else if (Array.isArray(res.data.items)) {
          res.data.items = res.data.items.map(normalizeTx);
        }
      }
      return res;
    }
    await delay();
    const state = getState();
    const txs = state.walletTransactions;
    return successResponse(txs, { page, size, totalElements: txs.length, totalPages: 1 });
  },

  async getUserBookings({ status = '', page = 0, size = 20, sort = 'createdAt,desc', from = null, to = null } = {}) {
    if (IS_REAL_API_MODE) {
      let apiStatus = status;
      if (status === 'PAID') {
        apiStatus = 'CONFIRMED';
      } else if (status === 'PENDING_PAYMENT') {
        apiStatus = 'PENDING';
      }
      const res = await apiFetch('/user/bookings', { params: { status: apiStatus || undefined, page, size, sort, from, to } });
      if (res && res.data) {
        const rawList = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.items) ? res.data.items : []);
        const enriched = await Promise.all(
          rawList.map(async (rawItem) => {
            const base = normalizeBookingData(rawItem);
            const bId = base.id || base.bookingId;
            if (bId) {
              try {
                const detailRes = await this.getBookingDetail(bId);
                if (detailRes && detailRes.data) {
                  return { ...base, ...detailRes.data };
                }
              } catch (_) {
              }
            }
            return base;
          })
        );
        if (Array.isArray(res.data)) {
          res.data = enriched;
        } else if (Array.isArray(res.data.items)) {
          res.data.items = enriched;
        }
      }
      return res;
    }
    await delay();
    const state = getState();
    let list = [...state.bookings];
    if (state.currentUser?.email || state.currentUser?.id) {
      list = list.filter((b) => (!b.userEmail && !b.userId) || b.userEmail === state.currentUser.email || b.userId === state.currentUser.id);
    }
    if (status) {
      list = list.filter((b) => b.status === status);
    }
    return successResponse(list, { page, size, totalElements: list.length, totalPages: 1 });
  },

  async getUserVouchers({ status = '', page = 0, size = 20 } = {}) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/user/vouchers', { params: { status, page, size } })
        .catch(() => apiFetch('/user/voucher', { params: { status, page, size } }));
    }
    await delay();
    const state = getState();
    return successResponse(state.vouchers, { page: 0, size: state.vouchers.length, totalElements: state.vouchers.length, totalPages: 1 });
  },


  payBooking(id, options, idempotencyKey) {
    return this.createPayment(id, options, idempotencyKey);
  },
  refundBooking(id, options, idempotencyKey) {
    return this.requestRefund(id, options, idempotencyKey);
  },
  applyVoucher(id, { voucherCode, expectedVersion }) {
    return this.updateBookingVoucher(id, { code: voucherCode, expectedVersion });
  },
  removeVoucher(id, { expectedVersion } = {}) {
    return this.updateBookingVoucher(id, { code: null, expectedVersion });
  }
};

export default bookingService;
