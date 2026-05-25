import React, { useState, useEffect, useRef } from 'react';
import { TESTIMONIALS } from '../data/testimonials.js';
import { useAuth } from '../context/AuthContext';

export default function Testimonials() {
  const { isLoggedIn, user } = useAuth();
  const [dbReviews, setDbReviews] = useState([]);
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(3);
  const autoplayRef = useRef(null);

  // Review Form & Edit States
  const [editingId, setEditingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const result = await res.json();
        setDbReviews(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setVis(getVisibleCount());
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize(); // set on mount
    fetchReviews();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Merge database reviews (prepended for newest first) with baseline static testimonials
  const allReviews = [
    ...dbReviews.map(r => ({
      _id: r._id,
      userId: r.user,
      name: r.customerName,
      role: 'Verified Regular',
      stars: r.rating,
      text: r.message,
      createdAt: r.createdAt,
    })),
    ...TESTIMONIALS
  ];

  const maxIdx = Math.max(0, allReviews.length - vis);
  const totalDots = Math.max(1, allReviews.length - vis + 1);

  const goTo = (newIdx) => {
    setIdx(Math.max(0, Math.min(newIdx, maxIdx)));
  };

  const next = () => {
    setIdx(prev => (prev >= maxIdx ? 0 : prev + 1));
  };

  const prev = () => {
    setIdx(prev => (prev <= 0 ? maxIdx : prev - 1));
  };

  // Autoplay handler
  useEffect(() => {
    autoplayRef.current = setInterval(next, 5500);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [maxIdx]);

  const handleDotClick = (i) => {
    goTo(i);
    // Reset autoplay
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(next, 5500);
    }
  };

  const handleArrowClick = (direction) => {
    if (direction === 'next') next();
    else prev();
    // Reset autoplay
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(next, 5500);
    }
  };

  const handleStartEdit = (review) => {
    setEditingId(review._id);
    setRating(review.stars);
    setMessage(review.text);
    setStatus({ type: '', msg: '' });

    // Smooth scroll down to the form panel with a slight offset
    const formSection = document.getElementById('reviewFormSection');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setRating(5);
    setMessage('');
    setStatus({ type: '', msg: '' });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setStatus({ type: '', msg: '' });

    const url = editingId ? `/api/reviews/${editingId}` : '/api/reviews';
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, message: message.trim() }),
      });
      const result = await res.json();
      if (res.ok) {
        setStatus({ 
          type: 'success', 
          msg: editingId ? '✅ Your review has been updated successfully.' : '✅ Thank you! Your review has been published.' 
        });
        setMessage('');
        setRating(5);
        setEditingId(null);
        setIdx(0);
        fetchReviews();

        // Smooth scroll back up to testimonials title
        const section = document.getElementById('testimonials');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        setStatus({ type: 'error', msg: `❌ ${result.message || 'Failed to submit review.'}` });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Error connecting to server.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (res.ok) {
        setIdx(0);
        // If they delete the review they were currently editing, reset editing states
        if (editingId === id) {
          handleCancelEdit();
        }
        fetchReviews();
      } else {
        alert(result.message || 'Failed to delete review.');
      }
    } catch (err) {
      alert('Error deleting review.');
    }
  };

  // Inline flex width rules matching original CSS calculations
  const gap = 24;
  const cardWidthPct = 100 / vis;
  const gapOffset = (gap * (vis - 1)) / vis;

  return (
    <section className="section testimonials-section" id="testimonials" aria-label="Customer reviews">
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="eyebrow eyebrow--inv">Reviews</span>
          <h2 className="section-title section-title--inv">What Our Guests Say</h2>
          <p className="section-sub section-sub--inv">Real reviews from real regulars — unedited.</p>
        </div>

        <div className="testimonials" data-reveal>
          <div className="testimonials__wrap" style={{ overflow: 'hidden' }}>
            <div
              className="testimonials__track"
              id="testimonialsTrack"
              role="list"
              style={{
                display: 'flex',
                gap: `${gap}px`,
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: `translateX(calc(-${idx} * (${100 / vis}% + ${gap - gapOffset}px)))`,
              }}
            >
              {allReviews.map((t, index) => {
                const isReviewOwner = isLoggedIn && user && (user._id === t.userId || user.id === t.userId);
                const isAdmin = isLoggedIn && user && user.role === 'admin';
                const showActions = t._id && (isReviewOwner || isAdmin);

                return (
                  <div
                    key={t._id || index}
                    className="testimonial-card"
                    role="listitem"
                    style={{
                      flex: `0 0 calc(${cardWidthPct}% - ${gapOffset}px)`,
                      minWidth: `calc(${cardWidthPct}% - ${gapOffset}px)`,
                      position: 'relative',
                    }}
                  >
                    {/* Unified Premium Actions Row */}
                    {showActions && (
                      <div
                        className="review-card-actions"
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          display: 'flex',
                          gap: '6px',
                          zIndex: 10,
                        }}
                      >
                        {/* Edit Button — Owner only */}
                        {isReviewOwner && (
                          <button
                            onClick={() => handleStartEdit(t)}
                            title="Edit this review"
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              backdropFilter: 'blur(6px)',
                              borderRadius: '50%',
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              color: 'var(--text-2)',
                              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                              padding: 0,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(234, 88, 12, 0.15)';
                              e.currentTarget.style.borderColor = 'rgba(234, 88, 12, 0.35)';
                              e.currentTarget.style.color = 'var(--primary)';
                              e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                              e.currentTarget.style.color = 'var(--text-2)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            ✏️
                          </button>
                        )}

                        {/* Delete Button — Owner or Admin */}
                        <button
                          onClick={() => handleDeleteReview(t._id)}
                          title="Delete this review"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(6px)',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: 'var(--text-2)',
                            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                            padding: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.color = 'var(--text-2)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}

                    <div className="testimonial-card__stars" aria-label={`${t.stars} stars`}>
                      {'★'.repeat(t.stars)}
                    </div>
                    <p className="testimonial-card__text" style={{ paddingRight: showActions ? '22px' : '0' }}>
                      "{t.text}"
                    </p>
                    <div className="testimonial-card__author">
                      <div className="testimonial-card__avatar" aria-hidden="true">
                        {t.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="testimonial-card__name">{t.name}</div>
                        <div className="testimonial-card__role" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {t.role}
                          {t.createdAt && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>
                              · {new Date(t.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="testimonials__controls">
            <button className="testimonials__arrow" id="prevReview" aria-label="Previous review" onClick={() => handleArrowClick('prev')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="testimonials__dots" id="reviewDots" role="tablist" aria-label="Review navigation">
              {Array.from({ length: totalDots }).map((_, i) => (
                <button
                  key={i}
                  className={`testimonial-dot ${i === idx ? 'is-active' : ''}`}
                  onClick={() => handleDotClick(i)}
                  aria-label={`Review set ${i + 1} of ${totalDots}`}
                  role="tab"
                  aria-selected={i === idx}
                ></button>
              ))}
            </div>
            <button className="testimonials__arrow" id="nextReview" aria-label="Next review" onClick={() => handleArrowClick('next')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="testimonials__aggregate" aria-label="Overall rating">
            <span className="testimonials__score">4.9</span>
            <div>
              <div className="testimonials__stars" aria-label="5 stars">★★★★★</div>
              <div className="testimonials__count">2,400+ reviews · Google, Yelp &amp; TripAdvisor</div>
            </div>
          </div>
        </div>

        {/* ── Dynamic Review Submission & Edit Form Section ─────────────────── */}
        {isLoggedIn && user?.role !== 'admin' && (
          <div className="review-form-container" id="reviewFormSection" style={{ marginTop: '4rem', display: 'flex', justifySelf: 'center', width: '100%', justifyContent: 'center' }} data-reveal>
            <div 
              className="admin-login-card" 
              style={{ 
                width: '100%', 
                maxWidth: '600px', 
                padding: '2.5rem', 
                borderRadius: '16px',
                background: 'var(--bg-alt)',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center', fontFamily: 'var(--ff-head)', color: 'var(--text-h)' }}>
                {editingId ? 'Edit Your Culinary Review' : 'Share Your Culinary Review'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '1.75rem', textAlign: 'center' }}>
                {editingId 
                  ? `Update your rating or reviews text below to save changes instantly.`
                  : `Hi ${user.name}, help other food lovers discover Chef Kabir Sen's gourmet creations!`
                }
              </p>

              {status.msg && (
                <div 
                  className={`form-api-status ${status.type === 'success' ? 'success' : 'error'}`} 
                  style={{ 
                    marginBottom: '1.25rem', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    fontSize: '0.85rem', 
                    textAlign: 'center',
                    background: status.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    color: status.type === 'success' ? '#10b981' : '#ef4444',
                    border: status.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                    fontWeight: 600,
                  }}
                >
                  {status.msg}
                </div>
              )}

              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>Your Rating</span>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '2.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          color: star <= (hoverRating || rating) ? 'var(--primary)' : 'var(--border)',
                          transition: 'color 0.15s ease, transform 0.1s ease',
                          filter: star <= (hoverRating || rating) ? 'drop-shadow(0 0 6px var(--primary-glow))' : 'none',
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label className="form-label" htmlFor="reviewText" style={{ fontWeight: 600 }}>Your Message</label>
                  <textarea
                    id="reviewText"
                    className="form-input"
                    placeholder="Describe the flavors, texture, presentation or warm hospitality..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={1000}
                    required
                    disabled={submitting}
                    style={{ minHeight: '110px', resize: 'vertical', borderRadius: '8px', padding: '12px', fontSize: '0.85rem', lineHeight: 1.5 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '6px' }}>
                    <span>Must be under 1000 characters.</span>
                    <span>{message.length} / 1000</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn--outline"
                      onClick={handleCancelEdit}
                      style={{ flex: 1, borderRadius: '8px', padding: '12px', justifyContent: 'center', fontWeight: 700 }}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn--primary"
                    style={{ flex: 2, borderRadius: '8px', padding: '12px', justifyContent: 'center', fontWeight: 700 }}
                    disabled={submitting || !message.trim()}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner" style={{ borderLeftColor: 'white', marginRight: '8px' }}></span>
                        {editingId ? 'Saving Changes...' : 'Publishing...'}
                      </>
                    ) : (
                      editingId ? 'Save Changes' : 'Submit Review'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Guest fallback block */}
        {!isLoggedIn && (
          <div className="review-form-container" style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'center' }} data-reveal>
            <div 
              style={{ 
                textAlign: 'center', 
                padding: '1.5rem 2.5rem', 
                background: 'var(--bg-alt)', 
                border: '1px dashed var(--border)', 
                borderRadius: '12px', 
                maxWidth: '500px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
              }}
            >
              <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '6px', fontWeight: 600 }}>
                Want to share your culinary review?
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                Please sign in to your regular account to publish a review on our testimonials board.
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
