/**
 * Lấy URL YouTube Embed phát trailer phim.
 * - Chỉ sử dụng khi có trailerUrl hợp lệ từ dữ liệu phim.
 * - Không hardcode link video của bất kỳ phim nào.
 */
export function getTrailerEmbedUrl(trailerUrl) {
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

  return null;
}

export function getYoutubeSearchUrl(movieTitle) {
  const cleanTitle = (movieTitle || '').replace(/\[.*?\]/g, '').trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTitle + ' official trailer')}`;
}
