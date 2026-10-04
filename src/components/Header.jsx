import React, { useState, useEffect, useRef } from 'react';
import FeatherIcon from './FeatherIcon';
import { useRouter } from '../router';
import { cinemaService } from '../services/cinemaService';
import { useAuthModal } from '../context/AuthModalContext';

export default function Header() {
  const { path, navigate } = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCinemaDropdownOpen, setIsCinemaDropdownOpen] = useState(false);
  const [userStats, setUserStats] = useState({
    walletBalance: 0,
    bookingsCount: 0,
    vouchersCount: 0
  });
  const dropdownRef = useRef(null);
  const cinemaDropdownRef = useRef(null);
  const cinemaTimerRef = useRef(null);

  const handleCinemaMouseEnter = () => {
    if (cinemaTimerRef.current) clearTimeout(cinemaTimerRef.current);
    setIsCinemaDropdownOpen(true);
  };

  const handleCinemaMouseLeave = () => {
    cinemaTimerRef.current = setTimeout(() => {
      setIsCinemaDropdownOpen(false);
    }, 280);
  };

  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    const fetchUser = () => {
      cinemaService.getUserProfile().then((res) => {
        setCurrentUser(res.data);
      }).catch(() => setCurrentUser(null));
    };

    fetchUser();
    window.addEventListener('auth-changed', fetchUser);
    return () => window.removeEventListener('auth-changed', fetchUser);
  }, [path]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (cinemaDropdownRef.current && !cinemaDropdownRef.current.contains(e.target)) {
        setIsCinemaDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tải thông số ví, đơn vé, voucher để hiển thị badge chính xác
  useEffect(() => {
    if (!currentUser) {
      setUserStats({ walletBalance: 0, bookingsCount: 0, vouchersCount: 0 });
      return;
    }
    Promise.all([
      cinemaService.getWallet().catch(() => ({ data: { balance: 0 } })),
      cinemaService.getUserBookings().catch(() => ({ data: [] })),
      cinemaService.getUserVouchers().catch(() => ({ data: [] }))
    ]).then(([wRes, bRes, vRes]) => {
      const bList = Array.isArray(bRes?.data) ? bRes.data : (bRes?.data?.items || []);
      const vList = Array.isArray(vRes?.data) ? vRes.data : (vRes?.data?.items || []);
      setUserStats({
        walletBalance: wRes?.data?.balance ?? 0,
        bookingsCount: bList.length,
        vouchersCount: vList.length
      });
    }).catch(() => {});
  }, [currentUser, path]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrolled = currentScrollY > 40;
          setIsScrolled(scrolled);

          // Scroll down past 120px -> hide header smoothly
          if (currentScrollY > 120 && currentScrollY > lastScrollY + 8) {
            setIsHidden(true);
          } else if (currentScrollY < lastScrollY - 6 || currentScrollY <= 40) {
            // Scroll up or near top -> reveal header smoothly
            setIsHidden(false);
          }

          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseMove = (e) => {
      if (e.clientY <= 30) {
        setIsHidden(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleLogout = async () => {
    await cinemaService.logout();
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth-changed'));
  };

  return (
    <header className={`aovis-header ${isScrolled ? 'scrolled' : ''} ${isHidden ? 'header-hidden' : 'header-visible'}`}>
      <div className="header-container">
        {/* Brand Logo: TDTDT */}
        <div onClick={() => navigate('/')} className="brand-logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/images/logo_tdtdt_transparent.png" 
            alt="TDTDT Cinema Logo" 
            style={{ height: '36px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }} 
          />
          <span className="brand-name" style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '2px', color: '#f5e6cc', textTransform: 'uppercase' }}>
            CINEMA
          </span>
        </div>

        {/* Navigation Menu - 3 Core Public Links */}
        <nav className="header-nav">
          <button
            onClick={() => navigate('/')}
            className={`nav-link nav-link-btn ${path === '/' ? 'active' : ''}`}
          >
            Trang chủ
          </button>
          <button
            onClick={() => navigate('/movie')}
            className={`nav-link nav-link-btn ${path.startsWith('/movie') ? 'active' : ''}`}
          >
            Danh sách Phim
          </button>
          <div
            className="cinema-nav-dropdown-wrapper"
            ref={cinemaDropdownRef}
            onMouseEnter={handleCinemaMouseEnter}
            onMouseLeave={handleCinemaMouseLeave}
          >
            <button
              type="button"
              onClick={() => setIsCinemaDropdownOpen((prev) => !prev)}
              className={`nav-link nav-link-btn cinema-dropdown-trigger font-sf-rounded ${path.startsWith('/cinema') ? 'active' : ''}`}
            >
              <span>Rạp chiếu</span>
              <FeatherIcon
                name="chevron-down"
                size={18}
                className={`cinema-nav-chevron ${isCinemaDropdownOpen ? 'open' : ''}`}
              />
            </button>

            {isCinemaDropdownOpen && (
              <div className="cinema-header-dropdown-menu glass-card">
                <div className="cinema-dropdown-col">
                  {[
                    { id: 'cin-01', name: 'Rạp chiếu phim gần đây' },
                    { id: 'cin-02', name: 'Lotte Cinema' },
                    { id: 'cin-03', name: 'Galaxy Cinema' },
                    { id: 'cin-01', name: 'Cinestar' },
                    { id: 'cin-02', name: 'Mega GS' },
                    { id: 'cin-03', name: 'Starlight' },
                    { id: 'cin-01', name: 'NCC' },
                    { id: 'cin-02', name: 'Touch Cinema' }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="cinema-dropdown-item font-sf-rounded"
                      onClick={() => {
                        setIsCinemaDropdownOpen(false);
                        navigate(`/cinema/${item.id}`);
                      }}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
                <div className="cinema-dropdown-col">
                  {[
                    { id: 'cin-02', name: 'CGV' },
                    { id: 'cin-03', name: 'BHD Star' },
                    { id: 'cin-01', name: 'Beta Cinemas' },
                    { id: 'cin-01', name: 'DCINE' },
                    { id: 'cin-02', name: 'Cinemax' },
                    { id: 'cin-03', name: 'Rio' },
                    { id: 'cin-01', name: 'Metiz Cinema' }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="cinema-dropdown-item font-sf-rounded"
                      onClick={() => {
                        setIsCinemaDropdownOpen(false);
                        navigate(`/cinema/${item.id}`);
                      }}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          {currentUser ? (
            <div className="user-logged-box" ref={dropdownRef}>
              <button
                type="button"
                className={`user-badge-trigger ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                title="Tài khoản của tôi"
              >
                <div className="user-avatar-mini initial-avatar">
                  <span>{(currentUser.fullName || 'B').trim().charAt(0).toUpperCase()}</span>
                </div>
                <span className="user-badge-name">{currentUser.fullName}</span>
                <FeatherIcon
                  name="chevron-down"
                  size={14}
                  className={`user-chevron-icon ${isDropdownOpen ? 'open' : ''}`}
                />
              </button>

              {/* THẺ XEM NHANH TÀI KHOẢN GLASSMORPHISM */}
              {isDropdownOpen && (
                <div className="account-dropdown-glass glass-card">
                  {/* Khối Header Profile rút gọn với Avatar chữ cái đầu, Tên & Badge PRO */}
                  <div
                    className="glass-user-header"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/user');
                    }}
                    title="Xem trang cá nhân của bạn"
                  >
                    <div className="glass-user-avatar initial-avatar">
                      <span>{(currentUser.fullName || 'B').trim().charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="glass-user-meta">
                      <span className="glass-user-name" title={currentUser.fullName}>
                        {currentUser.fullName}
                      </span>
                      <div className="glass-user-badge">PRO</div>
                    </div>
                  </div>

                  {/* Danh sách các Option xem nhanh */}
                  <div className="glass-menu-list">
                    <button
                      type="button"
                      className="glass-menu-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/user/booking');
                      }}
                    >
                      <FeatherIcon name="bookmark" size={16} className="menu-icon" />
                      <span className="menu-text">Vé & Đơn Đã Đặt</span>
                    </button>

                    <button
                      type="button"
                      className="glass-menu-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/wallet');
                      }}
                    >
                      <FeatherIcon name="credit-card" size={16} className="menu-icon" />
                      <span className="menu-text">Ví Beta Cinema</span>
                    </button>

                    <button
                      type="button"
                      className="glass-menu-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/user/voucher');
                      }}
                    >
                      <FeatherIcon name="tag" size={16} className="menu-icon" />
                      <span className="menu-text">Kho Voucher</span>
                    </button>

                    <div className="glass-divider" />

                    <button
                      type="button"
                      className="glass-menu-item logout-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                    >
                      <FeatherIcon name="log-out" size={16} className="menu-icon" />
                      <span className="menu-text">Đăng Xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns-row">
              <button
                type="button"
                className="btn-login-header"
                onClick={() => openAuthModal('login')}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className="btn-register-header"
                onClick={() => openAuthModal('register')}
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
