import {
  IS_REAL_API_MODE,
  apiFetch,
  delay,
  getState,
  saveState,
  successResponse,
  errorResponse
} from './apiClient.js';

export const authService = {
  async getCsrf() {
    if (IS_REAL_API_MODE) {
      return apiFetch('/csrf');
    }
    await delay();
    const state = getState();
    return successResponse({
      headerName: 'X-CSRF-TOKEN',
      token: state.csrfToken
    });
  },

  async getUserProfile() {
    if (IS_REAL_API_MODE) {
      return apiFetch('/user');
    }
    await delay();
    const state = getState();
    if (!state.currentUser) {
      throw errorResponse('UNAUTHORIZED', 'Chưa đăng nhập');
    }
    return successResponse(state.currentUser);
  },

  async updateUserProfile({ fullName, phone, dateOfBirth }) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/user', { method: 'PATCH', body: { fullName, phone, dateOfBirth } });
    }
    await delay();
    const state = getState();
    if (!state.currentUser) throw errorResponse('UNAUTHORIZED', 'Chưa đăng nhập');
    if (fullName) state.currentUser.fullName = fullName.trim();
    if (phone) state.currentUser.phone = phone.trim();
    if (dateOfBirth) state.currentUser.dateOfBirth = dateOfBirth;
    saveState(state);
    return successResponse(state.currentUser);
  },

  async changePassword({ currentPassword, newPassword, confirmPassword }) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/user/change-password', { method: 'POST', body: { currentPassword, newPassword, confirmPassword } });
    }
    await delay();
    if (!newPassword || newPassword.length < 8) {
      throw errorResponse('VALIDATION_ERROR', 'Mật khẩu mới phải từ 8 ký tự trở lên');
    }
    if (newPassword !== confirmPassword) {
      throw errorResponse('VALIDATION_ERROR', 'Xác nhận mật khẩu mới không trùng khớp');
    }
    return successResponse({ message: 'Đổi mật khẩu thành công' });
  },

  async login({ email, password }) {
    if (IS_REAL_API_MODE) {
      const res = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
      if (res.data?.accessToken) {
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('cinema_auth_token', res.data.accessToken);
      }
      if (res.data?.refreshToken) {
        localStorage.setItem('refresh_token', res.data.refreshToken);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { action: 'login', user: res?.data } }));
      }
      return res;
    }
    await delay();
    if (!email || !password) throw errorResponse('INVALID_CREDENTIALS', 'Email và mật khẩu không được để trống');
    const state = getState();
    const userHash = Math.abs(email.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)).toString(36);
    state.currentUser = {
      id: 'usr-' + userHash,
      fullName: email.split('@')[0],
      email: email,
      phone: '0901234567',
      role: 'USER',
      membershipTier: 'DIAMOND',
      points: 2450
    };
    state.csrfToken = 'csrf-' + Math.random().toString(36).substring(2, 12);
    saveState(state);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { action: 'login', user: state.currentUser } }));
    }
    return successResponse(state.currentUser);
  },

  async register({ fullName, email, password, confirmPassword, phone, dateOfBirth }) {
    if (IS_REAL_API_MODE) {
      const res = await apiFetch('/auth/register', { method: 'POST', body: { fullName, email, password, phone, dateOfBirth } });
      if (res.data?.accessToken) {
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('cinema_auth_token', res.data.accessToken);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-changed', { detail: { action: 'register', user: res?.data } }));
        }
      }
      return res;
    }
    await delay();
    if (password !== confirmPassword) {
      throw errorResponse('VALIDATION_ERROR', 'Mật khẩu xác nhận không khớp');
    }
    const state = getState();
    state.currentUser = {
      id: 'usr-' + Date.now().toString().slice(-6),
      fullName,
      email,
      phone: phone || null,
      dateOfBirth: null,
      role: 'USER',
      createdAt: new Date().toISOString()
    };
    saveState(state);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { action: 'register', user: state.currentUser } }));
    }
    return successResponse(state.currentUser);
  },

  async logout() {
    if (IS_REAL_API_MODE) {
      const refreshToken = localStorage.getItem('refresh_token');
      try {
        if (refreshToken) {
          await apiFetch('/auth/logout', { method: 'POST', body: { refreshToken } });
        }
      } catch (e) {
        console.warn('Lỗi khi gọi logout API:', e);
      } finally {
        localStorage.removeItem('access_token');
        localStorage.removeItem('cinema_auth_token');
        localStorage.removeItem('refresh_token');
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { action: 'logout' } }));
      }
      return successResponse(null, null, 'Đăng xuất thành công');
    }
    await delay();
    const state = getState();
    state.currentUser = null;
    state.csrfToken = 'csrf-' + Math.random().toString(36).substring(2, 12);
    saveState(state);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { action: 'logout' } }));
    }
    return successResponse({ message: 'Đăng xuất thành công' });
  },

  async forgotPassword({ email }) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });
    }
    await delay();
    return successResponse({ message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi' });
  },

  async resetPassword({ token, newPassword, confirmPassword }) {
    if (IS_REAL_API_MODE) {
      return apiFetch('/auth/reset-password', { method: 'POST', body: { token, newPassword, confirmPassword } });
    }
    await delay();
    return successResponse({ message: 'Đặt lại mật khẩu thành công' });
  },

};

export default authService;
