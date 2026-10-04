import React, { useState } from 'react';
import { cinemaService } from '../services/cinemaService';
import { useRouter } from '../router';
import FeatherIcon from '../components/FeatherIcon';

// Official Social Logos (SVG)
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#181717">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export function LoginScreen({ onClose }) {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await cinemaService.login({ email, password });
      if (onClose) {
        onClose();
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialMock = (provider) => {
    alert(`Đăng nhập nhanh bằng ${provider} thành công!`);
    cinemaService.login({ email: `user.${provider.toLowerCase()}@betacinema.vn`, password: 'password123' })
      .then(() => {
        if (onClose) onClose();
        else navigate('/');
      })
      .catch(() => {});
  };

  return (
    <div className="page-container auth-page-screen">
      <div className="auth-glass-card font-sf-rounded">
        {onClose && (
          <button
            type="button"
            className="auth-modal-close-btn"
            onClick={onClose}
            title="Đóng"
          >
            x
          </button>
        )}

        {/* 1. Brand Logo (TDTDT) */}
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

        {/* 2. Login Title */}
        <h2 className="auth-title">Login</h2>

        {errorMsg && (
          <div className="alert-banner error">
            <FeatherIcon name="alert-circle" size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 3. Form Inputs */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@gmail.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Password</label>
            <div className="auth-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <FeatherIcon name={showPassword ? 'eye-off' : 'eye'} size={18} />
              </button>
            </div>

            <div className="forgot-password-row">
              <span
                className="forgot-link"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </span>
            </div>
          </div>

          {/* 4. Sign in Pill Button */}
          <button type="submit" className="btn-sign-in" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer Switch */}
        <div className="auth-switch-footer">
          <span>Don't have an account yet? </span>
          <strong className="switch-link" onClick={() => navigate('/register')}>
            Register for free
          </strong>
        </div>
      </div>
    </div>
  );
}

export function RegisterScreen({ onClose }) {
  const { navigate } = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await cinemaService.register({ fullName, email, phone, password, confirmPassword });
      alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi đăng ký tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container auth-page-screen">
      <div className="auth-glass-card font-sf-rounded">
        {onClose && (
          <button
            type="button"
            className="auth-modal-close-btn"
            onClick={onClose}
            title="Đóng"
          >
            x
          </button>
        )}

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

        <h2 className="auth-title">Register</h2>

        {errorMsg && (
          <div className="alert-banner error">
            <FeatherIcon name="alert-circle" size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="auth-label">Full Name</label>
            <input
              type="text"
              className="auth-input-white"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@gmail.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Phone Number</label>
            <input
              type="tel"
              className="auth-input-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+84..."
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Password</label>
            <div className="auth-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FeatherIcon name={showPassword ? 'eye-off' : 'eye'} size={18} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="auth-label">Confirm Password</label>
            <input
              type="password"
              className="auth-input-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          <strong className="switch-link" onClick={() => navigate('/login')}>
            Sign in
          </strong>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordScreen({ onClose }) {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSent(true);
      setSubmitting(false);
    }, 300);
  };

  return (
    <div className="page-container auth-page-screen">
      <div className="auth-glass-card font-sf-rounded">
        {onClose && (
          <button
            type="button"
            className="auth-modal-close-btn"
            onClick={onClose}
            title="Đóng"
          >
            x
          </button>
        )}

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

        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">
          {sent
            ? 'If your email is in our system, recovery instructions have been sent.'
            : 'Enter your registered email address to receive password reset instructions.'}
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="auth-label">Email</label>
              <input
                type="email"
                className="auth-input-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <button className="btn-sign-in" onClick={() => navigate('/login')}>
              Back to Sign in
            </button>
          </div>
        )}

        <div className="auth-switch-footer">
          <span className="switch-link" onClick={() => navigate('/login')}>
            <FeatherIcon name="arrow-left" size={14} /> Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}
