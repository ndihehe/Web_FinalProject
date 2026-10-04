import React, { useState } from 'react';
import { useAuthModal } from '../context/AuthModalContext';
import { cinemaService } from '../services/cinemaService';
import FeatherIcon from './FeatherIcon';

export default function AuthModal() {
  const { isOpen, mode, closeAuthModal, setAuthMode, onSuccessCallback } = useAuthModal();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await cinemaService.login({ email: loginEmail, password: loginPassword });
      window.dispatchEvent(new Event('auth-changed'));
      closeAuthModal();
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await cinemaService.register({
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        confirmPassword: regConfirmPassword
      });
      window.dispatchEvent(new Event('auth-changed'));
      alert('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
      setAuthMode('login');
      setLoginEmail(regEmail);
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi đăng ký tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setForgotSent(true);
      setSubmitting(false);
    }, 400);
  };

  const switchMode = (newMode) => {
    setErrorMsg('');
    setForgotSent(false);
    setAuthMode(newMode);
  };

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal}>
      <div
        className="auth-glass-card auth-modal-card font-sf-rounded"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng modal dạng chữ x thường in đậm Source Sans Pro, không khung, xoay 90 độ khi hover */}
        <button
          type="button"
          className="auth-modal-close-btn"
          onClick={closeAuthModal}
          title="Đóng"
        >
          x
        </button>

        {/* 1. Tên Rạp Căn Giữa TDTDT CINEMA (Kèm Logo) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
          <img 
            src="/images/logo_tdtdt_transparent.png" 
            alt="TDTDT Logo" 
            style={{ height: '42px', width: 'auto', objectFit: 'contain', marginBottom: '4px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }} 
          />
          <div className="auth-brand-centered font-chinese spotlight-text" title="TDTDT Cinema" style={{ margin: 0 }}>
            TDTDT CINEMA
          </div>
        </div>

        {/* ===============================================================
            MODE 1: LOGIN (Tối giản: Chỉ Email + Mật Khẩu theo yêu cầu)
            =============================================================== */}
        {mode === 'login' && (
          <>
            <h2 className="auth-title">Login</h2>

            {errorMsg && (
              <div className="alert-banner error">
                <FeatherIcon name="alert-circle" size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  className="auth-input-white"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="username@gmail.com"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="auth-label">Password</label>
                <div className="auth-password-wrapper">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    className="auth-input-white"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    className="btn-toggle-eye"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <FeatherIcon name={showLoginPassword ? 'eye-off' : 'eye'} size={18} />
                  </button>
                </div>

                <div className="forgot-password-row">
                  <span
                    className="forgot-link"
                    onClick={() => switchMode('forgot')}
                  >
                    Forgot Password?
                  </span>
                </div>
              </div>

              <button type="submit" className="btn-sign-in" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="auth-switch-footer">
              <span>Don't have an account yet? </span>
              <strong className="switch-link" onClick={() => switchMode('register')}>
                Register for free
              </strong>
            </div>
          </>
        )}

        {/* ===============================================================
            MODE 2: REGISTER
            =============================================================== */}
        {mode === 'register' && (
          <>
            <h2 className="auth-title">Register</h2>

            {errorMsg && (
              <div className="alert-banner error">
                <FeatherIcon name="alert-circle" size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-group">
                <label className="auth-label">Full Name</label>
                <input
                  type="text"
                  className="auth-input-white"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div className="form-group">
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  className="auth-input-white"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="username@gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="auth-label">Phone Number</label>
                <input
                  type="tel"
                  className="auth-input-white"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+84..."
                />
              </div>

              <div className="form-group">
                <label className="auth-label">Password</label>
                <div className="auth-password-wrapper">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    className="auth-input-white"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="btn-toggle-eye"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                  >
                    <FeatherIcon name={showRegPassword ? 'eye-off' : 'eye'} size={18} />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="auth-label">Confirm Password</label>
                <input
                  type="password"
                  className="auth-input-white"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn-sign-in" disabled={submitting}>
                {submitting ? 'Creating account...' : 'Sign up'}
              </button>
            </form>

            <div className="auth-switch-footer">
              <span>Already have an account? </span>
              <strong className="switch-link" onClick={() => switchMode('login')}>
                Sign in
              </strong>
            </div>
          </>
        )}

        {/* ===============================================================
            MODE 3: FORGOT PASSWORD
            =============================================================== */}
        {mode === 'forgot' && (
          <>
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">
              {forgotSent
                ? 'If your email is in our system, recovery instructions have been sent.'
                : 'Enter your registered email address to receive password reset instructions.'}
            </p>

            {!forgotSent ? (
              <form onSubmit={handleForgotSubmit} className="auth-form">
                <div className="form-group">
                  <label className="auth-label">Email</label>
                  <input
                    type="email"
                    className="auth-input-white"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="username@gmail.com"
                    required
                  />
                </div>

                <button type="submit" className="btn-sign-in" disabled={submitting}>
                  {submitting ? 'Sending link...' : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="auth-actions-done">
                <button className="btn-sign-in" onClick={() => switchMode('login')}>
                  Back to Sign in
                </button>
              </div>
            )}

            <div className="auth-switch-footer">
              <span className="switch-link" onClick={() => switchMode('login')}>
                <FeatherIcon name="arrow-left" size={14} /> Back to Login
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
