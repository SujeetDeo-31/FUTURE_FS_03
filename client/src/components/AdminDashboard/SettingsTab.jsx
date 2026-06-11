import React, { useState, useRef, useEffect } from 'react';

// ── Inline QR code generator using qrcode.js CDN ──────────────
// Dynamically loads the script once on mount
function useQRScript() {
  const [ready, setReady] = useState(!!window.QRCode);
  useEffect(() => {
    if (window.QRCode) { setReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);
  return ready;
}

function QRGenerator() {
  const qrReady = useQRScript();
  const [tableNum, setTableNum] = useState('');
  const [generated, setGenerated] = useState(false);
  const qrRef = useRef(null);
  const qrInstance = useRef(null);

  const siteUrl = window.location.origin;

  const generateQR = () => {
    if (!tableNum.trim() || !qrReady) return;

    const url = `${siteUrl}/?table=${encodeURIComponent(tableNum.trim())}`;

    // Clear previous QR
    if (qrRef.current) qrRef.current.innerHTML = '';
    qrInstance.current = null;

    qrInstance.current = new window.QRCode(qrRef.current, {
      text: url,
      width: 220,
      height: 220,
      colorDark: '#1a1a2e',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.H,
    });

    setGenerated(true);
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Build a styled canvas with label
    const pad = 24;
    const labelH = 48;
    const out = document.createElement('canvas');
    out.width  = canvas.width  + pad * 2;
    out.height = canvas.height + pad * 2 + labelH;
    const ctx = out.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);

    ctx.drawImage(canvas, pad, pad);

    ctx.fillStyle = '#e63946';
    ctx.fillRect(0, out.height - labelH, out.width, labelH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🍔 One-Bite — Table ${tableNum.trim()}`, out.width / 2, out.height - labelH / 2 + 6);

    const link = document.createElement('a');
    link.download = `one-bite-table-${tableNum.trim()}-qr.png`;
    link.href = out.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      style={{
        padding: '2rem',
        borderRadius: '16px',
        background: 'var(--bg-alt)',
        border: '1px solid var(--border)',
        marginTop: '1.5rem',
      }}
    >
      <h3
        style={{
          fontSize: '1.1rem',
          fontWeight: 800,
          fontFamily: 'var(--ff-head)',
          color: 'var(--text-h)',
          marginBottom: '0.4rem',
          textAlign: 'center',
        }}
      >
        🪑 Table QR Code Generator
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', textAlign: 'center', marginBottom: '1.5rem' }}>
        Generate a printable QR code for each table. Customers scan it to order directly.
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.25rem' }}>
        <input
          className="form-input"
          type="text"
          id="tableNumberInput"
          placeholder="e.g. T1, T2, Table-5..."
          value={tableNum}
          onChange={(e) => { setTableNum(e.target.value); setGenerated(false); }}
          maxLength={10}
          style={{ flex: 1, padding: '10px 14px', fontSize: '0.9rem', borderRadius: '8px' }}
        />
        <button
          className="btn btn--primary"
          id="generateQrBtn"
          onClick={generateQR}
          disabled={!tableNum.trim() || !qrReady}
          style={{ padding: '10px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}
        >
          {qrReady ? 'Generate' : 'Loading…'}
        </button>
      </div>

      {/* QR Output */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          minHeight: generated ? 'auto' : '0',
        }}
      >
        <div ref={qrRef} style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: generated ? '0 8px 24px rgba(0,0,0,0.12)' : 'none' }} />

        {generated && (
          <>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', textAlign: 'center' }}>
              Scan links to: <code style={{ fontSize: '0.72rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px' }}>{siteUrl}/?table={tableNum.trim()}</code>
            </p>
            <button
              className="btn btn--outline"
              id="downloadQrBtn"
              onClick={downloadQR}
              style={{ padding: '10px 22px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem' }}
            >
              ⬇ Download QR Code
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main SettingsTab ───────────────────────────────────────────
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
      {/* Password Change Card */}
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

      {/* QR Code Generator */}
      <QRGenerator />
    </div>
  );
}
