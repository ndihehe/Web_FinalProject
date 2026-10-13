import React, { useState, useEffect } from 'react';
import { RouterProvider, useRouter } from './router';
import Header from './components/Header';
import Footer from './components/Footer';

// Nhập khẩu các màn hình chuyên biệt
import HomeScreen from './screens/HomeScreen';
import MoviesScreen from './screens/MoviesScreen';
import MovieDetailScreen from './screens/MovieDetailScreen';
import CinemaDetailScreen from './screens/CinemaDetailScreen';
import SeatSelectionScreen from './screens/SeatSelectionScreen';
import BookingCheckoutScreen from './screens/BookingCheckoutScreen';
import TicketDetailScreen from './screens/TicketDetailScreen';
import WalletScreen from './screens/WalletScreen';
import UserBookingsScreen from './screens/UserBookingsScreen';
import UserVouchersScreen from './screens/UserVouchersScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import { AuthModalProvider, useAuthModal } from './context/AuthModalContext';
import AuthModal from './components/AuthModal';
import ClapperAuthModal from './components/ClapperAuthModal';
import MobileBottomNav from './components/MobileBottomNav';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { path, segments } = useRouter();
  const { openAuthModal } = useAuthModal();
  const [authKey, setAuthKey] = useState(0);

  // Lắng nghe sự kiện auth-changed để tự động unmount và mount lại màn hình khi đăng nhập/đăng xuất/đổi tài khoản
  useEffect(() => {
    const handleAuthChange = () => {
      setAuthKey((prev) => prev + 1);
    };
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  // If directly accessing /login, /register, /forgot-password in URL, pop up the modal over the current screen
  useEffect(() => {
    if (path === '/login') {
      openAuthModal('login');
    } else if (path === '/register') {
      openAuthModal('register');
    } else if (path === '/forgot-password') {
      openAuthModal('login');
    }
  }, [path]);

  // Global Interactive Mouse-Tracking Spotlight cho toàn bộ chữ trắng trên web
  useEffect(() => {
    let rafId;
    const selector = `
      .brand-name,
      .nav-link:not(.active),
      .nav-link-btn:not(.active),
      .in-theater-date,
      .cinema-tab-name,
      .spotlight-white,
      .user-badge span
    `;

    const isInsideOrangeOrLightSurface = (elem) => {
      let curr = elem;
      while (curr && curr !== document.body) {
        // 1. Tuyệt đối không áp dụng spotlight trong khối lịch chiếu rạp
        if (
          curr.classList.contains('cinema-schedule-box-card') ||
          curr.classList.contains('cinema-schedule-section-wrap') ||
          curr.classList.contains('cinema-schedule-scroll-list') ||
          curr.classList.contains('schedule-box-info') ||
          curr.classList.contains('movie-row-details')
        ) {
          return true;
        }
        
        // 1.5. Trong form auth (đăng nhập / đăng ký / quên mật khẩu):
        // CHỈ DUY NHẤT cụm "BETA CINEMA" (.auth-brand-centered) là có hiệu ứng di chuột / spotlight
        if (
          curr.classList.contains('auth-glass-card') ||
          curr.classList.contains('auth-card-orthogonal') ||
          curr.classList.contains('auth-page-screen')
        ) {
          if (!elem.classList.contains('auth-brand-centered')) {
            return true;
          }
        }

        // 2. Các nút hoặc bề mặt cam đã có sẵn
        if (
          curr.classList.contains('btn-auth-submit') ||
          curr.classList.contains('btn-orange') ||
          curr.classList.contains('btn-view-all-link') ||
          curr.classList.contains('btn-wallet-topup') ||
          curr.classList.contains('btn-hero-primary') ||
          curr.classList.contains('btn-confirm-seats') ||
          curr.classList.contains('btn-save-profile') ||
          (curr.classList.contains('active') && (
            curr.classList.contains('cinema-tab-btn') ||
            curr.classList.contains('date-card-item') ||
            curr.classList.contains('date-tab') ||
            curr.classList.contains('time-slot') ||
            curr.classList.contains('nav-link') ||
            curr.classList.contains('nav-link-btn')
          ))
        ) {
          return true;
        }
        const inlineBg = curr.style.background || curr.style.backgroundColor || '';
        if (
          inlineBg.includes('var(--orange-primary)') ||
          inlineBg.includes('rgb(217, 108, 44)') ||
          inlineBg.includes('#d96c2c') ||
          inlineBg.includes('#ff5b14') ||
          inlineBg.includes('#ffffff') ||
          inlineBg.includes('rgb(255, 255, 255)')
        ) {
          return true;
        }
        const compBg = window.getComputedStyle(curr).backgroundColor;
        if (compBg && compBg.startsWith('rgb')) {
          const match = compBg.match(/\d+/g);
          if (match && match.length >= 3) {
            const [r, g, b, a] = match.map(Number);
            if (a === undefined || a > 0.3) {
              // Nền cam
              if (r >= 200 && g >= 50 && g <= 145 && b <= 70) {
                return true;
              }
              // Nền trắng hoặc xám sáng
              const luma = 0.299 * r + 0.587 * g + 0.114 * b;
              if (luma > 190) {
                return true;
              }
            }
          }
        }
        curr = curr.parentElement;
      }
      return false;
    };

    const handlePointerMove = (e) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const clientX = e.clientX;
        const clientY = e.clientY;
        const margin = 200;

        const elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (isInsideOrangeOrLightSurface(el)) {
            if (el.classList.contains('has-spotlight')) {
              el.classList.remove('has-spotlight');
              el.style.removeProperty('--mouse-x');
              el.style.removeProperty('--mouse-y');
            }
            continue;
          }

          const rect = el.getBoundingClientRect();
          if (
            clientX >= rect.left - margin &&
            clientX <= rect.right + margin &&
            clientY >= rect.top - margin &&
            clientY <= rect.bottom + margin
          ) {
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            el.style.setProperty('--mouse-x', `${x}px`);
            el.style.setProperty('--mouse-y', `${y}px`);
            if (!el.classList.contains('has-spotlight')) {
              el.classList.add('has-spotlight');
            }
          } else if (el.classList.contains('has-spotlight')) {
            el.classList.remove('has-spotlight');
            el.style.removeProperty('--mouse-x');
            el.style.removeProperty('--mouse-y');
          }
        }
      });
    };

    const handlePointerLeave = () => {
      cancelAnimationFrame(rafId);
      const activeElements = document.querySelectorAll('.has-spotlight');
      for (let i = 0; i < activeElements.length; i++) {
        activeElements[i].classList.remove('has-spotlight');
        activeElements[i].style.removeProperty('--mouse-x');
        activeElements[i].style.removeProperty('--mouse-y');
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, [path]);

  const renderScreen = () => {
    if (path === '/' || path === '') {
      return <HomeScreen />;
    }
    if (path === '/movie') {
      return <MoviesScreen />;
    }
    if (segments[0] === 'movie' && segments[1]) {
      return <MovieDetailScreen />;
    }
    if (path === '/cinema' || (segments[0] === 'cinema' && segments[1])) {
      return <CinemaDetailScreen />;
    }
    if (segments[0] === 'showtime' && segments[1] && segments[2] === 'seat') {
      return <SeatSelectionScreen />;
    }
    if (segments[0] === 'booking' && segments[1]) {
      return <BookingCheckoutScreen />;
    }
    if (segments[0] === 'ticket' && segments[1]) {
      return <TicketDetailScreen />;
    }
    if (path === '/wallet' || path === '/user/wallet') {
      return <WalletScreen />;
    }
    if (path === '/user/booking') {
      return <UserBookingsScreen />;
    }
    if (path === '/user/voucher') {
      return <UserVouchersScreen />;
    }
    if (path === '/user') {
      return <UserProfileScreen />;
    }
    if (path === '/login' || path === '/register' || path === '/forgot-password') {
      return <HomeScreen />;
    }
    return <HomeScreen />;
  };

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content-wrapper">
        <ErrorBoundary key={`${path}-${authKey}`}>
          {renderScreen()}
        </ErrorBoundary>
      </main>
      <Footer />
      {/* Global Auth Modal Popup (Thẻ đăng nhập nổi trên màn hình) */}
      <AuthModal />
      {/* Clapperboard Login Required Modal (Popup điện ảnh báo yêu cầu đăng nhập) */}
      <ClapperAuthModal />
      {/* Mobile Bottom Navigation Bar (Chỉ hiển thị trên Mobile <= 768px) */}
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthModalProvider>
        <AppContent />
      </AuthModalProvider>
    </RouterProvider>
  );
}
