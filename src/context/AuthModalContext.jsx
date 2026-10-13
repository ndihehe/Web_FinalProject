import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [onSuccessCallback, setOnSuccessCallback] = useState(null);

  // Clapperboard Login Required Modal State
  const [isClapperOpen, setIsClapperOpen] = useState(false);
  const [clapperMessage, setClapperMessage] = useState('');

  const openAuthModal = (initialMode = 'login', callback = null) => {
    setMode(initialMode);
    setOnSuccessCallback(() => callback);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
    setOnSuccessCallback(null);
  };

  const setAuthMode = (newMode) => {
    setMode(newMode);
  };

  const openClapperModal = (message = '') => {
    setClapperMessage(message || '');
    setIsClapperOpen(true);
  };

  const closeClapperModal = () => {
    setIsClapperOpen(false);
  };

  // Lắng nghe sự kiện toàn cục 'require-auth' từ apiClient hoặc bất cứ màn hình nào
  useEffect(() => {
    const handleRequireAuth = (event) => {
      const msg = event?.detail?.message;
      openClapperModal(msg);
    };
    window.addEventListener('require-auth', handleRequireAuth);
    return () => window.removeEventListener('require-auth', handleRequireAuth);
  }, []);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isOpen) closeAuthModal();
        if (isClapperOpen) closeClapperModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClapperOpen]);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        mode,
        openAuthModal,
        closeAuthModal,
        setAuthMode,
        onSuccessCallback,
        isClapperOpen,
        clapperMessage,
        openClapperModal,
        closeClapperModal
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
