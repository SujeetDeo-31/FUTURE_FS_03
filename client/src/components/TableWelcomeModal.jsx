import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

export default function TableWelcomeModal() {
  const { showTableModal, tableNumber, confirmDineInName } = useCart();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name so we can serve you better.');
      return;
    }
    confirmDineInName(name.trim());
  };

  return (
    <AnimatePresence>
      {showTableModal && (
        <>
          {/* Backdrop */}
          <motion.div
            key="table-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2000,
              backgroundColor: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* Modal */}
          <motion.div
            key="table-modal"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label="Welcome - Enter your name"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '2.5rem 2rem',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 32px 64px rgba(0,0,0,0.25)',
                textAlign: 'center',
              }}
            >
              {/* Icon */}
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🍽️</div>

              {/* Table badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--primary)',
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '4px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  marginBottom: '1rem',
                }}
              >
                🪑 TABLE {tableNumber}
              </div>

              <h2
                style={{
                  fontFamily: 'var(--ff-head)',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-h)',
                  marginBottom: '0.5rem',
                  lineHeight: 1.3,
                }}
              >
                Welcome to One-Bite!
              </h2>
              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-2)',
                  marginBottom: '1.75rem',
                  lineHeight: 1.6,
                }}
              >
                What&apos;s your name? We&apos;ll use it to bring your order to your table.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  className="form-input"
                  type="text"
                  id="dineInNameInput"
                  placeholder="e.g. Ananya, Raj, Team Verma…"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  autoFocus
                  maxLength={40}
                  style={{ fontSize: '1rem', padding: '12px 16px', textAlign: 'center', borderRadius: '10px' }}
                />

                {error && (
                  <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, margin: 0 }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn--primary"
                  id="tableWelcomeSubmitBtn"
                  style={{
                    padding: '13px',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    justifyContent: 'center',
                    boxShadow: '0 4px 18px rgba(230, 57, 70, 0.3)',
                  }}
                >
                  Let&apos;s Order →
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
