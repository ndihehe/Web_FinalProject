import React, { useState, useEffect } from 'react';
import { useRouter } from '../router';
import FeatherIcon from './FeatherIcon';
import { cinemaService } from '../services/cinemaService';

export default function MobileBottomNav() {
  const { path, navigate } = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    const checkAuthAndStats = () => {
      cinemaService.getUserProfile()
        .then((res) => {
          setCurrentUser(res?.data);
          return cinemaService.getUserBookings();
        })
        .then((bRes) => {
          if (Array.isArray(bRes?.data)) {
            setTicketCount(bRes.data.length);
          }
        })
        .catch(() => {
          setCurrentUser(null);
          setTicketCount(0);
        });
    };

    checkAuthAndStats();
    window.addEventListener('auth-changed', checkAuthAndStats);
    return () => window.removeEventListener('auth-changed', checkAuthAndStats);
  }, [path]);

  const navItems = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: 'home',
      route: '/',
      isActive: path === '/'
    },
    {
      id: 'movies',
      label: 'Phim',
      icon: 'film',
      route: '/movie',
      isActive: path.startsWith('/movie')
    },
    {
      id: 'cinemas',
      label: 'Rạp chiếu',
      icon: 'map-pin',
      route: '/cinema',
      isActive: path.startsWith('/cinema')
    },
    {
      id: 'bookings',
      label: 'Vé của tôi',
      icon: 'tag',
      route: '/user/booking',
      isActive: path === '/user/booking' || path.startsWith('/ticket'),
      badge: ticketCount > 0 ? ticketCount : null
    },
    {
      id: 'wallet',
      label: 'Ví TDTDT',
      icon: 'credit-card',
      route: '/wallet',
      isActive: path === '/wallet' || path === '/user/wallet'
    }
  ];

  return (
    <nav className="mobile-bottom-nav font-sf-rounded" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav-item ${item.isActive ? 'active' : ''}`}
            onClick={() => navigate(item.route)}
          >
            <div className="mobile-nav-icon-box">
              <FeatherIcon name={item.icon} size={20} />
              {item.badge && (
                <span className="mobile-nav-badge">{item.badge}</span>
              )}
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
