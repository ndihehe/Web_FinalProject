/**
 * Cấu hình kết nối WebSocket cho toàn bộ ứng dụng Frontend
 */

export function getWebSocketBaseUrl() {
  // Nếu có cấu hình trong file môi trường .env
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL;
  }

  // Nếu đang chạy trên môi trường Production (HTTPS)
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return 'wss://be-cinema.onrender.com/ws/seats';
  }

  // Mặc định chạy máy Localhost (HTTP)
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  const contextPrefix = apiBase.startsWith('/cinema') ? '/cinema' : '';
  return `ws://localhost:8080${contextPrefix}/ws/seats`;
}
