import React, { useState } from 'react';

export default function BookingsTab({ reservations = [], onUpdateStatus }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredReservations = reservations.filter(res => {
    const matchesSearch =
      (res.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.phone || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAction = (id, status) => {
    if ((status === 'cancelled' || status === 'rejected') &&
        !window.confirm(`Are you sure you want to mark this booking as ${status.toUpperCase()}?`)) {
      return;
    }
    onUpdateStatus(id, status);
  };

  return (
    <div className="admin-tab-content active" id="adminTabReservations">
      {/* Filters Area */}
      <div className="admin-controls" style={{ display: 'flex', gap: '12px', marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem' }}
        />
        <select
          className="form-input form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '160px', borderRadius: '8px', padding: '10px 12px', fontSize: '0.85rem' }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table grid wrapper */}
      <div className="admin-table-wrapper" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px' }}>Customer</th>
              <th style={{ padding: '12px' }}>Contact</th>
              <th style={{ padding: '12px' }}>Date &amp; Time</th>
              <th style={{ padding: '12px' }}>Guests</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Requests</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colspan="7" className="text-center" style={{ padding: '2.5rem', fontStyle: 'italic', color: 'var(--text-3)', textAlign: 'center' }}>
                  No reservations found matching the filters.
                </td>
              </tr>
            ) : (
              filteredReservations.map(res => {
                const dateStr = new Date(res.date).toLocaleDateString('en-IN', {
                  month: 'short', day: 'numeric', year: 'numeric',
                });

                const isPending = res.status === 'pending';
                const rowStyle = isPending
                  ? {
                      backgroundColor: 'rgba(217, 119, 6, 0.05)',
                      borderLeft: '4px solid #d97706',
                    }
                  : { borderBottom: '1px solid var(--border)' };

                return (
                  <tr key={res._id} style={rowStyle}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{res.name}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 500 }}>{res.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{res.email}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>{dateStr}</div>
                      <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{res.time}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{res.guestCount}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge--${res.status}`}>
                        {res.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {res.specialRequests ? (
                        <span className="req-note" title={res.specialRequests} style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-2)' }}>
                          "{res.specialRequests}"
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontStyle: 'italic', color: 'var(--text-3)' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {res.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn--primary btn--sm"
                            style={{ background: '#10b981', borderColor: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'white' }}
                            onClick={() => handleAction(res._id, 'confirmed')}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn btn--outline btn--sm"
                            style={{ background: '#ef4444', borderColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}
                            onClick={() => handleAction(res._id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {res.status === 'confirmed' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn--primary btn--sm"
                            style={{ background: 'var(--primary)', borderColor: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'white' }}
                            onClick={() => handleAction(res._id, 'completed')}
                          >
                            Complete
                          </button>
                          <button
                            className="btn btn--outline btn--sm"
                            style={{ background: '#6b7280', borderColor: '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}
                            onClick={() => handleAction(res._id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {!['pending', 'confirmed'].includes(res.status) && (
                        <span style={{ fontStyle: 'italic', color: 'var(--text-3)' }}>Done</span>
                      )}
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
