import React, { useState, useEffect } from 'react';
import { cinemaService } from '../services/cinemaService';

const IconTrending = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const IconStar = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#d96c2c' : 'none'} stroke={filled ? '#d96c2c' : '#555'} strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function MovieReviewsSection({ movieId, movieTitle, initialReviews = [] }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'rating'
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  // Tải user profile hiện tại
  useEffect(() => {
    cinemaService.getUserProfile()
      .then((res) => setCurrentUser(res?.data))
      .catch(() => {});
  }, []);

  // Khởi tạo danh sách bình luận
  useEffect(() => {
    const baseList = (initialReviews && initialReviews.length > 0)
      ? initialReviews.map((r, idx) => ({
          id: r.id || `rev-${idx + 1}`,
          author: r.authorDisplayName || r.userName || 'Khán giả',
          avatarUrl: r.avatarUrl || '',
          avatarBg: ['#e11d48', '#8b5cf6', '#d96c2c', '#0ea5e9'][idx % 4],
          createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Mới đây',
          timestamp: r.createdAt ? new Date(r.createdAt).getTime() : Date.now() - idx * 86400000,
          rating: r.rating || 5,
          comment: r.comment || ''
        }))
      : [];

    setReviewsList(baseList);
  }, [initialReviews]);

  // Xử lý gửi bình luận mới
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    const authorName = currentUser?.fullName || 'Khán giả Beta';

    try {
      const res = await cinemaService.createReview(movieId, {
        rating: newRating,
        comment: newComment.trim()
      });

      const newItem = {
        id: res?.data?.id || `rev-${Date.now()}`,
        author: authorName,
        avatarBg: '#d96c2c',
        createdAt: 'Vừa xong',
        timestamp: Date.now(),
        rating: newRating,
        comment: newComment.trim()
      };

      setReviewsList([newItem, ...reviewsList]);
      setNewComment('');
    } catch (err) {
      alert(err.message || 'Không thể gửi đánh giá phim');
    } finally {
      setSubmitting(false);
    }
  };

  // Sắp xếp danh sách bình luận
  const sortedReviews = [...reviewsList].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return b.timestamp - a.timestamp;
  });

  const totalCommentsCount = reviewsList.length;

  return (
    <div className="movie-comments-frame" id="movie-comments-section">
      {/* 1. Header Frame: Comments Count & Sort Pills */}
      <div className="comments-frame-header">
        <h3 className="comments-main-title">
          Bình luận & Đánh giá <span className="comments-count-badge">({totalCommentsCount >= 1000 ? `${(totalCommentsCount / 1000).toFixed(1)}K` : totalCommentsCount})</span>
        </h3>

        <div className="comments-filter-pills">
          <button
            className={`comment-pill-btn ${sortBy === 'newest' ? 'active' : ''}`}
            onClick={() => setSortBy('newest')}
            type="button"
          >
            <IconCalendar />
            <span>Mới nhất</span>
          </button>
          <button
            className={`comment-pill-btn ${sortBy === 'rating' ? 'active' : ''}`}
            onClick={() => setSortBy('rating')}
            type="button"
          >
            <IconTrending />
            <span>Đánh giá cao</span>
          </button>
        </div>
      </div>

      {/* 2. Write Comment Input Box */}
      <div className="comment-compose-card">
        <div className="compose-user-avatar" style={{ background: '#d96c2c' }}>
          <span>{currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'B'}</span>
        </div>

        <form className="compose-input-container" onSubmit={handleSubmitComment}>
          <textarea
            className="compose-textarea"
            placeholder="Viết cảm nhận của bạn về bộ phim này..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
          />

          <div className="compose-footer-row">
            {/* Star Rating Picker */}
            <div className="compose-rating-picker" title="Chọn điểm đánh giá">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="star-pick-btn"
                  onClick={() => setNewRating(star)}
                >
                  <IconStar filled={star <= newRating} />
                </button>
              ))}
              <span className="rating-label-mini">{newRating}/5 sao</span>
            </div>

            {/* Circular Send Button */}
            <button
              type="submit"
              className="btn-send-comment"
              disabled={submitting || !newComment.trim()}
              title="Gửi bình luận"
            >
              <IconSend />
            </button>
          </div>
        </form>
      </div>

      {/* 3. Comments List */}
      <div className="comments-feed-list">
        {sortedReviews.length === 0 ? (
          <div className="empty-comments-state">
            <p>Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nhận về bộ phim này!</p>
          </div>
        ) : (
          sortedReviews.map((rev) => (
            <div key={rev.id} className="comment-feed-item">
              {/* Left Avatar */}
              <div className="comment-avatar-box" style={{ background: rev.avatarBg }}>
                <span>{rev.author ? rev.author.charAt(0).toUpperCase() : 'U'}</span>
              </div>

              {/* Right Content */}
              <div className="comment-content-box">
                {/* Author Info Bar */}
                <div className="comment-author-header">
                  <div className="author-info-left">
                    <span className="comment-author-name">{rev.author}</span>
                    <span className="comment-timestamp">{rev.createdAt}</span>
                    <div className="comment-stars-row">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <IconStar key={s} filled={s <= rev.rating} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comment Text */}
                <p className="comment-body-text">{rev.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
