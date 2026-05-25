import React, { useState } from 'react';

export default function SettingsTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setStatus({ type: 'error', msg: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', msg: '' });

    try {
      const res = await fetch('/api/auth/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', msg: '✅ ' + (result.message || 'Password changed successfully!') });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatus({ type: 'error', msg: '❌ ' + (result.message || 'Failed to change password.') });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Error connecting to server.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-tab-content active" id="adminTabSettings" style={{ maxWidth: '500px', margin: '1rem auto' }}>
      <div 
        className="admin-login-card" 
        style={{ 
          padding: '2.5rem', 
          borderRadius: '16px',
          background: 'var(--bg-alt)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--ff-head)', color: 'var(--text-h)', textAlign: 'center' }}>
          Update Security Password
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '1.75rem', textAlign: 'center' }}>
          Change your administrator login password securely by verifying your current key.
        </p>

        {status.msg && (
          <div 
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="currentPass" style={{ fontWeight: 600 }}>Current Password</label>
            <input
              type="password"
              id="currentPass"
              className="form-input"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={submitting}
              style={{ fontSize: '0.95rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="newPass" style={{ fontWeight: 600 }}>New Password (min 6 chars)</label>
            <input
              type="password"
              id="newPass"
              className="form-input"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={submitting}
              style={{ fontSize: '0.95rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="confirmPass" style={{ fontWeight: 600 }}>Confirm New Password</label>
            <input
              type="password"
              id="confirmPass"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={submitting}
              style={{ fontSize: '0.95rem' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: '100%', borderRadius: '8px', padding: '12px', justifyContent: 'center', fontWeight: 700, marginTop: '0.5rem' }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ borderLeftColor: 'white', marginRight: '8px' }}></span>
                Updating Password...
              </>
            ) : (
              'Save New Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
