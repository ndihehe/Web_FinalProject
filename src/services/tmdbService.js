/**
 * TMDB (The Movie Database) Service
 * Tự động tìm kiếm trailer chính thức của phim qua API TMDB hoàn toàn trên Frontend,
 * không hardcode link video và không cần can thiệp Backend.
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const cache = new Map();

/**
 * Lấy TMDB API Key:
 * Ưu tiên biến môi trường VITE_TMDB_API_KEY, fallback sang localStorage nếu người dùng nhập trực tiếp trên UI.
 */
export function getTmdbApiKey() {
  const envKey = import.meta.env.VITE_TMDB_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    const localKey = window.localStorage.getItem('VITE_TMDB_API_KEY');
    if (localKey && localKey.trim()) {
      return localKey.trim();
    }
  }
  return '';
}

/**
 * Lưu nhanh API Key vào localStorage để sử dụng ngay mà không cần restart server
 */
export function setTmdbApiKey(key) {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (key && key.trim()) {
      window.localStorage.setItem('VITE_TMDB_API_KEY', key.trim());
    } else {
      window.localStorage.removeItem('VITE_TMDB_API_KEY');
    }
  }
}

/**
 * Chuẩn hóa và làm sạch tiêu đề phim để tìm kiếm chính xác trên TMDB
 * (Loại bỏ các tag phụ như [2D], [3D], [Lồng tiếng], [TEST], [C18], v.v.)
 */
export function cleanMovieTitle(rawTitle) {
  if (!rawTitle || typeof rawTitle !== 'string') return '';
  return rawTitle
    .replace(/\[.*?\]/g, '') // bỏ [2D], [3D]...
    .replace(/\(.*?\)/g, '') // bỏ (2024), (Lồng tiếng)...
    .replace(/phụ đề/gi, '')
    .replace(/lồng tiếng/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tìm kiếm trailer chính thức của phim qua TMDB
 * @param {string} rawTitle - Tên phim
 * @returns {Promise<{ success: boolean, videoKey?: string, embedUrl?: string, title?: string, reason?: string, message?: string }>}
 */
export async function fetchTrailerFromTmdb(rawTitle) {
  const cleanTitle = cleanMovieTitle(rawTitle);
  if (!cleanTitle) {
    return { success: false, reason: 'EMPTY_TITLE', message: 'Tên phim không hợp lệ' };
  }

  // Kiểm tra cache trước để tiết kiệm request
  const cacheKey = cleanTitle.toLowerCase();
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    return {
      success: false,
      reason: 'NO_API_KEY',
      message: 'Chưa cấu hình VITE_TMDB_API_KEY. Vui lòng thêm vào file .env hoặc nhập API Key.'
    };
  }

  try {
    // 1. Thử tìm kiếm phim trên TMDB (ưu tiên ngôn ngữ tiếng Việt vi-VN)
    let searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&include_adult=false&language=vi-VN`;
    let res = await fetch(searchUrl);
    let data = await res.json();

    // 2. Nếu không ra kết quả tiếng Việt, tìm kiếm quốc tế (mặc định)
    if (!data.results || data.results.length === 0) {
      searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&include_adult=false`;
      res = await fetch(searchUrl);
      data = await res.json();
    }

    // 3. Nếu vẫn không thấy và tên phim có dấu hai chấm ":" hoặc gạch ngang "-", thử tìm theo tên chính
    if ((!data.results || data.results.length === 0) && (cleanTitle.includes(':') || cleanTitle.includes('-'))) {
      const primaryPart = cleanTitle.split(/[:\-]/)[0].trim();
      if (primaryPart.length > 2) {
        searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(primaryPart)}&include_adult=false`;
        res = await fetch(searchUrl);
        data = await res.json();
      }
    }

    if (!data.results || data.results.length === 0) {
      const result = {
        success: false,
        reason: 'NOT_FOUND',
        message: `Không tìm thấy phim "${cleanTitle}" trên cơ sở dữ liệu TMDB.`
      };
      cache.set(cacheKey, result);
      return result;
    }

    const tmdbMovie = data.results[0];

    // 4. Lấy danh sách video (trailer/teaser) của phim từ TMDB
    const videosUrl = `${TMDB_BASE_URL}/movie/${tmdbMovie.id}/videos?api_key=${apiKey}`;
    const vRes = await fetch(videosUrl);
    const vData = await vRes.json();

    const videos = Array.isArray(vData.results) ? vData.results : [];
    const ytVideos = videos.filter((v) => v.site === 'YouTube' && v.key);

    if (ytVideos.length === 0) {
      const result = {
        success: false,
        reason: 'NO_VIDEO',
        message: `Đã tìm thấy phim "${tmdbMovie.title}" nhưng chưa có video trailer trên TMDB.`
      };
      cache.set(cacheKey, result);
      return result;
    }

    // Ưu tiên:
    // 1. Trailer chính thức tiếng Việt
    // 2. Trailer chính thức (official trailer)
    // 3. Trailer bất kỳ
    // 4. Teaser
    const bestTrailer =
      ytVideos.find((v) => v.type === 'Trailer' && v.iso_639_1 === 'vi') ||
      ytVideos.find((v) => v.type === 'Trailer' && v.official) ||
      ytVideos.find((v) => v.type === 'Trailer') ||
      ytVideos.find((v) => v.type === 'Teaser') ||
      ytVideos[0];

    const result = {
      success: true,
      videoKey: bestTrailer.key,
      embedUrl: `https://www.youtube.com/embed/${bestTrailer.key}?autoplay=1`,
      title: bestTrailer.name || `${tmdbMovie.title} Trailer`,
      tmdbTitle: tmdbMovie.title,
      tmdbId: tmdbMovie.id
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Lỗi khi gọi TMDB API:', err);
    return {
      success: false,
      reason: 'NETWORK_ERROR',
      message: 'Không thể kết nối đến TMDB API.'
    };
  }
}
