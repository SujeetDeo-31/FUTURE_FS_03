import React, { useState } from 'react';

export default function ReviewsTab({ reviews = [], onDeleteReview }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReviews = reviews.filter(r =>
    (r.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.message || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-tab-content active" id="adminTabReviews">
      {/* Controls */}
      <div className="admin-controls" style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search reviews by guest name or message content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem' }}
        />
      </div>

      {/* Grid Table */}
      <div className="admin-table-wrapper" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px' }}>Review ID</th>
              <th style={{ padding: '12px' }}>Guest Name</th>
              <th style={{ padding: '12px' }}>Rating</th>
              <th style={{ padding: '12px' }}>Review Message</th>
              <th style={{ padding: '12px' }}>Submitted Date</th>
              <th style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2.5rem', fontStyle: 'italic', color: 'var(--text-3)', textAlign: 'center' }}>
                  No reviews found.
                </td>
              </tr>
            ) : (
              filteredReviews.map(r => {
                const dateStr = new Date(r.createdAt).toLocaleDateString('en-IN', {
                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                return (
                  <tr key={r._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-3)', fontSize: '0.75rem' }}>
                      #{r._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{r.customerName}</td>
                    <td style={{ padding: '12px', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '2px', fontSize: '1.1rem' }}>
                      {'★'.repeat(r.rating)}
                    </td>
                    <td style={{ padding: '12px', maxWidth: '350px', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
                      {r.message}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-3)' }}>{dateStr}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => { if (window.confirm('Are you absolutely sure you want to delete this customer review?')) onDeleteReview(r._id); }}
                        style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
