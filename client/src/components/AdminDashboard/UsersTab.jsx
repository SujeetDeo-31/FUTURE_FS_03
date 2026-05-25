import React, { useState } from 'react';

export default function UsersTab({ users = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-tab-content active" id="adminTabUsers">
      {/* Controls */}
      <div className="admin-controls" style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search registered users by name or email..."
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
              <th style={{ padding: '12px' }}>Customer Name</th>
              <th style={{ padding: '12px' }}>Email Address</th>
              <th style={{ padding: '12px' }}>Access Role</th>
              <th style={{ padding: '12px' }}>Registered On</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colspan="4" className="text-center" style={{ padding: '2.5rem', fontStyle: 'italic', color: 'var(--text-3)', textAlign: 'center' }}>
                  No registered users found matching the filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const dateStr = new Date(user.createdAt || user.signUpDate || Date.now()).toLocaleDateString('en-IN', {
                  month: 'long', day: 'numeric', year: 'numeric',
                });

                return (
                  <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{user.name}</td>
                    <td style={{ padding: '12px' }}>{user.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${user.role === 'admin' ? 'badge--completed' : 'badge--pending'}`} style={{ fontSize: '0.75rem' }}>
                        {user.role ? user.role.toUpperCase() : 'USER'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-3)' }}>{dateStr}</td>
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
