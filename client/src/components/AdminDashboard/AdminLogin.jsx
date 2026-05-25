import React, { useState } from 'react';

const API = '/api';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Login failed.');

      if (result.data?.role !== 'admin') {
        // Logout non-admin accounts instantly
        await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
        throw new Error('Access denied. This account does not have admin privileges.');
      }

      onLoginSuccess(result.data);
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="admin-login" id="adminLoginView" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <p className="admin-login__desc" style={{ fontSize: '0.875rem', color: 'var(--text-3)', marginBottom: '1.25rem', textAlign: 'center' }}>
        Sign in with your administrator account to access the dashboard.
      </p>

      {error && (
        <div className="admin-login__error" style={{ display: 'block', marginBottom: '1rem' }} role="alert">
          {error}
        </div>
      )}

      <form className="admin-login__form" id="adminLoginForm" noValidate onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label" htmlFor="adminEmail">Admin Email</label>
          <input
            type="email"
            id="adminEmail"
            className="form-input"
            placeholder=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
            style={{ letterSpacing: 'normal', fontSize: '0.95rem' }} // standard typography fixed!
          />
        </div>
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" htmlFor="adminPassword">Password</label>
          <input
            type="password"
            id="adminPassword"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={submitting}
            style={{ letterSpacing: 'normal', fontSize: '0.95rem' }} // standard typography fixed!
          />
        </div>
        
        <button
          type="submit"
          className="btn btn--primary"
          style={{ width: '100%', borderRadius: '8px', padding: '12px', justifyContent: 'center' }}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner" style={{ borderLeftColor: 'white' }}></span>
              Verifying...
            </>
          ) : (
            'Sign In to Dashboard'
          )}
        </button>
      </form>

    </div>
  );
}
