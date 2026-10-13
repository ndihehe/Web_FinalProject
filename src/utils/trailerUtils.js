const KNOWN_TRAILERS = {
  'exhuma': 'https://www.youtube.com/embed/Z05g6Bw4iJ8',
  'quật mộ': 'https://www.youtube.com/embed/Z05g6Bw4iJ8',
  'mai': 'https://www.youtube.com/embed/fD-pD0zYm0Q',
  'dune': 'https://www.youtube.com/embed/Way9Dexny3w',
  'oppenheimer': 'https://www.youtube.com/embed/uYPbbksJxIg',
  'godzilla': 'https://www.youtube.com/embed/lV1OOlGwExM',
  'kung fu panda': 'https://www.youtube.com/embed/_inKs4eeHiI',
  'lật mặt': 'https://www.youtube.com/embed/kK7eRz2G0hE',
  'witcher': 'https://www.youtube.com/embed/TJFVV2L8GKs',
};

/**
 * Lấy URL YouTube Embed phát trailer phim tương ứng.
 * 1. Nếu phim đã có trailerUrl hợp lệ -> dùng trailerUrl
 * 2. Nếu tên phim khớp với các phim phổ biến -> dùng video trailer chính thức chuẩn HD
 * 3. Ngược lại -> dùng YouTube Embed Search tự động tìm kiếm trailer theo tên phim
 */
export function getTrailerEmbedUrl(trailerUrl, movieTitle) {
  if (trailerUrl && typeof trailerUrl === 'string' && trailerUrl.trim()) {
    const trimmed = trailerUrl.trim();
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    if (trimmed.includes('embed/')) {
      return trimmed.includes('autoplay=1') ? trimmed : `${trimmed}${trimmed.includes('?') ? '&' : '?'}autoplay=1`;
    }
  }

  if (movieTitle && typeof movieTitle === 'string') {
    const lower = movieTitle.toLowerCase();
    for (const [key, embedUrl] of Object.entries(KNOWN_TRAILERS)) {
      if (lower.includes(key)) {
        return `${embedUrl}?autoplay=1`;
      }
    }
    const cleanTitle = movieTitle.replace(/\[.*?\]/g, '').trim();
    return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(cleanTitle + ' official trailer')}&autoplay=1`;
  }

  return 'https://www.youtube.com/embed/Z05g6Bw4iJ8?autoplay=1';
}

export function getYoutubeSearchUrl(movieTitle) {
  const cleanTitle = (movieTitle || '').replace(/\[.*?\]/g, '').trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTitle + ' official trailer')}`;
}
