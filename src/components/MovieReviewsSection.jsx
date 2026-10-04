import React, { useState, useEffect } from 'react';
import { cinemaService } from '../services/cinemaService';

// SVG Icons matching Image 4
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

const IconThumbsUp = ({ active }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const IconThumbsDown = ({ active }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
  </svg>
);

const IconReply = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconMore = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
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
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'newest'
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Tải user profile hiện tại
  useEffect(() => {
    cinemaService.getUserProfile()
      .then((res) => setCurrentUser(res?.data))
      .catch(() => {});
  }, []);

  // Khởi tạo danh sách bình luận phong phú theo chuẩn Image 4
  useEffect(() => {
    const baseList = (initialReviews && initialReviews.length > 0)
      ? initialReviews.map((r, idx) => ({
          id: r.id || `rev-${idx + 1}`,
          author: r.authorDisplayName || 'Khán giả Beta',
          avatarUrl: idx % 3 === 0 ? '/images/avatars/user1.png' : idx % 3 === 1 ? '/images/avatars/user2.png' : '',
          avatarBg: ['#e11d48', '#8b5cf6', '#d96c2c', '#0ea5e9'][idx % 4],
          createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '18/09/2024',
          timestamp: r.createdAt ? new Date(r.createdAt).getTime() : Date.now() - idx * 86400000,
          rating: r.rating || 5,
          comment: r.comment || 'Phim rất hay, hình ảnh sống động và rạp phục vụ chu đáo!',
          likes: 111 - idx * 45,
          dislikes: 5 + idx * 3,
          userLiked: false,
          userDisliked: false,
          replies: [
            {
              id: `rep-${idx}-1`,
              author: 'Beta Cinemas CSKH',
              avatarBg: '#d96c2c',
              createdAt: '19/09/2024',
              comment: 'Cảm ơn bạn đã chọn trải nghiệm tại cụm rạp Beta! Hẹn gặp lại bạn ở các suất chiếu tiếp theo ❤️'
            }
          ]
        }))
      : [
          {
            id: 'rev-01',
            author: 'Trần Văn Anh',
            avatarBg: '#e11d48',
            createdAt: '18/09/2024',
            timestamp: Date.now() - 3600000 * 24,
            rating: 5,
            comment: 'Kỹ xảo và âm thanh đỉnh cao! Xem tại rạp Beta phòng chiếu to rất đã mắt, góc nhìn trực diện không bị mỏi.',
            likes: 111,
            dislikes: 5,
            userLiked: false,
            userDisliked: false,
            replies: [
              {
                id: 'rep-01',
                author: 'Beta Cinemas CSKH',
                avatarBg: '#d96c2c',
                createdAt: '19/09/2024',
                comment: 'Cảm ơn đánh giá chân thực của bạn. Chúc bạn luôn có những giờ phút xem phim bùng nổ cùng Beta!'
              }
            ]
          },
          {
            id: 'rev-02',
            author: 'Lê Hoàng Yến',
            avatarBg: '#8b5cf6',
            createdAt: '20/09/2024',
            timestamp: Date.now() - 3600000 * 12,
            rating: 5,
            comment: 'Cốt truyện hấp dẫn, Henry Cavill diễn xuất quá tuyệt vời. Rạp sạch sẽ, bắp phô mai nóng giòn ngon tuyệt! 🍿✨',
            likes: 50,
            dislikes: 2,
            userLiked: false,
            userDisliked: false,
            replies: []
          },
          {
            id: 'rev-03',
            author: 'Oarack Babama',
            avatarBg: '#0ea5e9',
            createdAt: '22/09/2024',
            timestamp: Date.now() - 3600000 * 48,
            rating: 4,
            comment: 'Phim rất đáng tiền vé, âm thanh surround tạo hiệu ứng rung ghế sống động. Suất chiếu đúng giờ không có quảng cáo thừa.',
            likes: 34,
            dislikes: 1,
            userLiked: false,
            userDisliked: false,
            replies: []
          }
        ];

    setReviewsList(baseList);
  }, [initialReviews]);

  // Xử lý gửi bình luận mới
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    const authorName = currentUser?.fullName || 'Khán giả Beta';

    const newItem = {
      id: `rev-${Date.now()}`,
      author: authorName,
      avatarBg: '#d96c2c',
      createdAt: 'Vừa xong',
      timestamp: Date.now(),
      rating: newRating,
      comment: newComment.trim(),
      likes: 0,
      dislikes: 0,
      userLiked: false,
      userDisliked: false,
      replies: []
    };

    setTimeout(() => {
      setReviewsList([newItem, ...reviewsList]);
      setNewComment('');
      setSubmitting(false);
    }, 200);
  };

  // Xử lý Thích / Không thích
  const handleToggleLike = (id) => {
    setReviewsList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const wasLiked = item.userLiked;
        return {
          ...item,
          userLiked: !wasLiked,
          likes: wasLiked ? item.likes - 1 : item.likes + 1,
          userDisliked: wasLiked ? item.userDisliked : false,
          dislikes: !wasLiked && item.userDisliked ? item.dislikes - 1 : item.dislikes
        };
      })
    );
  };

  const handleToggleDislike = (id) => {
    setReviewsList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const wasDisliked = item.userDisliked;
        return {
          ...item,
          userDisliked: !wasDisliked,
          dislikes: wasDisliked ? item.dislikes - 1 : item.dislikes + 1,
          userLiked: wasDisliked ? item.userLiked : false,
          likes: !wasDisliked && item.userLiked ? item.likes - 1 : item.likes
        };
      })
    );
  };

  // Toggle mở danh sách câu trả lời
  const toggleReplies = (id) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Gửi câu trả lời phản hồi
  const handleSendReply = (revId) => {
    if (!replyText.trim()) return;
    const authorName = currentUser?.fullName || 'Khán giả Beta';

    setReviewsList((prev) =>
      prev.map((r) => {
        if (r.id !== revId) return r;
        return {
          ...r,
          replies: [
            ...r.replies,
            {
              id: `rep-${Date.now()}`,
              author: authorName,
              avatarBg: '#d96c2c',
              createdAt: 'Vừa xong',
              comment: replyText.trim()
            }
          ]
        };
      })
    );

    setReplyText('');
    setActiveReplyId(null);
    setExpandedReplies((prev) => ({ ...prev, [revId]: true }));
  };

  // Sắp xếp danh sách
  const sortedReviews = [...reviewsList].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.likes - b.dislikes) - (a.likes - a.dislikes);
    }
    return b.timestamp - a.timestamp;
  });

  const totalCommentsCount = reviewsList.reduce(
    (sum, item) => sum + 1 + (item.replies ? item.replies.length : 0),
    0
  );

  return (
    <div className="movie-comments-frame" id="movie-comments-section">
      {/* 1. Header Frame: Comments Count & Sort Pills (Image 4) */}
      <div className="comments-frame-header">
        <h3 className="comments-main-title">
          Comments <span className="comments-count-badge">({totalCommentsCount >= 1000 ? `${(totalCommentsCount / 1000).toFixed(1)}K` : totalCommentsCount})</span>
        </h3>

        <div className="comments-filter-pills">
          <button
            className={`comment-pill-btn ${sortBy === 'popular' ? 'active' : ''}`}
            onClick={() => setSortBy('popular')}
            type="button"
          >
            <IconTrending />
            <span>Popular</span>
          </button>
          <button
            className={`comment-pill-btn ${sortBy === 'newest' ? 'active' : ''}`}
            onClick={() => setSortBy('newest')}
            type="button"
          >
            <IconCalendar />
            <span>Newest</span>
          </button>
        </div>
      </div>

      {/* 2. Write Comment Input Box (Image 4) */}
      <div className="comment-compose-card">
        <div className="compose-user-avatar" style={{ background: '#d96c2c' }}>
          <span>{currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'B'}</span>
        </div>

        <form className="compose-input-container" onSubmit={handleSubmitComment}>
          <textarea
            className="compose-textarea"
            placeholder="Write your comments here..."
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

            {/* Circular Send Button (Image 4) */}
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

      {/* 3. Comments List (Image 4) */}
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

                  <button className="btn-more-options" title="Tùy chọn">
                    <IconMore />
                  </button>
                </div>

                {/* Comment Text */}
                <p className="comment-body-text">{rev.comment}</p>

                {/* Translate Subtle Action (Image 4) */}
                <button className="btn-translate-action" type="button">
                  Translate
                </button>

                {/* Action Footer: Like, Dislike, Reply */}
                <div className="comment-actions-bar">
                  <button
                    className={`btn-action-metric ${rev.userLiked ? 'active-like' : ''}`}
                    onClick={() => handleToggleLike(rev.id)}
                    type="button"
                    title="Hài lòng"
                  >
                    <IconThumbsUp active={rev.userLiked} />
                    <span>{rev.likes}</span>
                  </button>

                  <button
                    className={`btn-action-metric ${rev.userDisliked ? 'active-dislike' : ''}`}
                    onClick={() => handleToggleDislike(rev.id)}
                    type="button"
                    title="Chưa hài lòng"
                  >
                    <IconThumbsDown active={rev.userDisliked} />
                    <span>{rev.dislikes}</span>
                  </button>

                  <button
                    className="btn-action-reply"
                    onClick={() => setActiveReplyId(activeReplyId === rev.id ? null : rev.id)}
                    type="button"
                  >
                    <IconReply />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Inline Reply Input */}
                {activeReplyId === rev.id && (
                  <div className="inline-reply-box">
                    <input
                      type="text"
                      className="inline-reply-input"
                      placeholder={`Trả lời ${rev.author}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendReply(rev.id);
                      }}
                      autoFocus
                    />
                    <button
                      className="btn-submit-inline-reply"
                      onClick={() => handleSendReply(rev.id)}
                      type="button"
                    >
                      Gửi
                    </button>
                  </div>
                )}

                {/* See Replies Collapsible (Image 4) */}
                {rev.replies && rev.replies.length > 0 && (
                  <div className="comment-replies-wrapper">
                    <button
                      className="btn-see-replies"
                      onClick={() => toggleReplies(rev.id)}
                      type="button"
                    >
                      <span>{expandedReplies[rev.id] ? '▲ Hide' : '▼ See'} {rev.replies.length} {rev.replies.length > 1 ? 'Replies' : 'Reply'}</span>
                    </button>

                    {expandedReplies[rev.id] && (
                      <div className="nested-replies-list">
                        {rev.replies.map((reply) => (
                          <div key={reply.id} className="nested-reply-item">
                            <div className="reply-avatar-mini" style={{ background: reply.avatarBg }}>
                              <span>{reply.author.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="reply-content-mini">
                              <div className="reply-header-mini">
                                <span className="reply-author-name">{reply.author}</span>
                                <span className="reply-date">{reply.createdAt}</span>
                              </div>
                              <p className="reply-text">{reply.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
