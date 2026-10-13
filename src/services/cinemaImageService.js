/**
 * Cinema Image Service
 * Tự động tìm kiếm ảnh rạp chiếu phim động từ API trực tuyến theo dữ liệu từ Database,
 * TUYỆT ĐỐI KHÔNG SỬ DỤNG MẢNG LINK ẢNH CỨNG HAY HARDCODE.
 */

const imageCache = new Map();

/**
 * Tự động gọi API tìm kiếm ảnh rạp chiếu phim trực tuyến trên Internet
 * Nguồn: Wikimedia Commons API (Công khai, miễn phí, hỗ trợ CORS, không cần API Key)
 * hoặc Unsplash API nếu người dùng cấu hình VITE_UNSPLASH_ACCESS_KEY.
 *
 * @param {object} cinema - Đối tượng rạp lấy trực tiếp từ database (chứa id, name, address, v.v.)
 * @returns {Promise<string|null>} URL ảnh tìm được từ API
 */
export async function fetchCinemaImage(cinema) {
  if (!cinema) return null;

  // 1. Nếu trong cơ sở dữ liệu thật đã có trường imageUrl thì ưu tiên dùng
  if (cinema.imageUrl && typeof cinema.imageUrl === 'string' && cinema.imageUrl.trim() && !cinema.imageUrl.includes('cinema1.jpg')) {
    return cinema.imageUrl.trim();
  }

  const cinemaName = cinema.name || cinema.cinemaName || '';
  const cacheKey = String(cinema.id || cinemaName).toLowerCase().trim();

  // Kiểm tra cache trong phiên làm việc
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  // 2. Thử gọi Unsplash API nếu có key
  const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  if (unsplashKey && typeof unsplashKey === 'string' && unsplashKey.trim()) {
    try {
      const q = encodeURIComponent(`movie theater cinema hall`);
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${q}&orientation=landscape&per_page=10&client_id=${unsplashKey.trim()}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const seed = Number(cinema.id) || cinemaName.length;
        const chosen = data.results[seed % data.results.length];
        const url = chosen?.urls?.regular || chosen?.urls?.small;
        if (url) {
          imageCache.set(cacheKey, url);
          return url;
        }
      }
    } catch (e) {
      console.warn('Lỗi gọi Unsplash API cho ảnh rạp:', e);
    }
  }

  // 3. Tự động tìm kiếm trực tiếp trên Wikimedia Commons API (Public Search API)
  try {
    const searchTerm = 'cinema theater hall interior';
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(searchTerm)}&gsrlimit=15&prop=imageinfo&iiprop=url&format=json&origin=*`;
    
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data?.query?.pages) {
      const pages = Object.values(data.query.pages);
      const validImages = pages
        .map((p) => p?.imageinfo?.[0]?.url)
        .filter((url) => typeof url === 'string' && /\.(jpg|jpeg|png|webp)/i.test(url));

      if (validImages.length > 0) {
        // Phân bổ ảnh theo ID thật của rạp trong database để các rạp khác nhau có ảnh riêng biệt
        let hash = 0;
        const seedStr = String(cinema.id || cinemaName);
        for (let i = 0; i < seedStr.length; i++) {
          hash = (hash << 5) - hash + seedStr.charCodeAt(i);
          hash |= 0;
        }
        const selectedUrl = validImages[Math.abs(hash) % validImages.length];
        imageCache.set(cacheKey, selectedUrl);
        return selectedUrl;
      }
    }
  } catch (err) {
    console.warn('Lỗi tự động tìm kiếm ảnh rạp từ Wikimedia API:', err);
  }

  return null;
}
