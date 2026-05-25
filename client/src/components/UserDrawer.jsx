import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function UserDrawer() {
  const {
    user,
    isLoggedIn,
    drawerOpen,
    setDrawerOpen,
    login,
    signup,
    logout,
    deleteAccount,
    refreshSession
  } = useAuth();

  const isUserLoggedIn = isLoggedIn && user?.role !== 'admin';

  const [activeTab, setActiveTab] = useState('login'); // login, signup
  const [historyTab, setHistoryTab] = useState('res'); // res, orders

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');

  // Delete modal confirmation states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePass, setDeletePass] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Submitting / error states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-close on Escape key
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !deleteModalOpen) {
        setDrawerOpen(false);
        document.body.style.overflow = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen, deleteModalOpen, setDrawerOpen]);
  useEffect(() => {
    if (drawerOpen && isUserLoggedIn) {
      refreshSession();
    }
  }, [drawerOpen, isUserLoggedIn, refreshSession]);

  const handleClose = () => {
    setDrawerOpen(false);
    document.body.style.overflow = '';
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(loginEmail.trim(), loginPass);
      setLoginEmail('');
      setLoginPass('');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (signupPass.length < 6) {
      setError('Password must be at least 6 characters.');
      setSubmitting(false);
      return;
    }

    try {
      await signup(signupName.trim(), signupEmail.trim(), signupPass);
      setSignupName('');
      setSignupEmail('');
      setSignupPass('');
    } catch (err) {
      setError(err.message || 'Signup failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    setDeleteSubmitting(true);
    setDeleteError('');

    try {
      const result = await deleteAccount(deletePass);
      setDeleteModalOpen(false);
      setDeletePass('');
      alert(result.message || 'Your account has been deleted successfully.');
    } catch (err) {
      setDeleteError(err.message || 'Password verification failed.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Drawer Backdrop overlay */}
            <motion.div
              key="user-backdrop"
              className="user-panel__backdrop"
              id="userPanelBackdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              style={{ position: 'fixed', inset: 0, zIndex: 1200, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            />

            {/* Sliding drawer panel */}
            <motion.div
              key="user-drawer"
              className="user-panel"
              id="userPanel"
              role="dialog"
              aria-modal="true"
              aria-label="My Account"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                maxWidth: '480px',
                zIndex: 1201,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
                backgroundColor: 'var(--bg)',
                borderLeft: '1px solid var(--border)',
              }}
            >
              <header className="user-panel__header">
                <div className="user-panel__brand">
                  <span className="user-panel__logo" aria-hidden="true">👤</span>
                  <h2 className="user-panel__title" id="userPanelTitle">My Account</h2>
                </div>
                <button className="user-panel__close-btn" id="userPanelClose" aria-label="Close Account Panel" onClick={handleClose}>
                  ×
                </button>
              </header>
              <main className="user-panel__content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '1.25rem' }}>
                {isLoggedIn && user?.role === 'admin' ? (
                  /* Admin Session Active Notice */
                  <div className="admin-drawer-notice" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem', filter: 'drop-shadow(0 0 10px rgba(255, 82, 29, 0.4))' }} aria-hidden="true">🔑</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>Admin Session Active</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                      You are currently signed in to the Admin Portal as <strong>{user.name}</strong>.
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', lineHeight: 1.45 }}>
                      Customer profile dashboard features are isolated during administrator sessions. Please use the Sign Out button inside the Admin Portal to end this session.
                    </p>
                  </div>
                ) : !isUserLoggedIn ? (
                  /* Auth Tab Switches: Login / Signup */
                  <div className="user-auth" id="userAuthView">
                    <div className="user-auth__tabs" style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                      <button
                        className={`user-auth__tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('login'); setError(''); }}
                        style={{ flex: 1, padding: '10px 0', borderBottom: activeTab === 'login' ? '2px solid var(--primary)' : 'none', fontWeight: 600 }}
                      >
                        Log In
                      </button>
                      <button
                        className={`user-auth__tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('signup'); setError(''); }}
                        style={{ flex: 1, padding: '10px 0', borderBottom: activeTab === 'signup' ? '2px solid var(--primary)' : 'none', fontWeight: 600 }}
                      >
                        Sign Up
                      </button>
                    </div>

                    {error && (
                      <div className="form-api-error" style={{ marginBottom: '1rem', display: 'block' }} role="alert">
                        {error}
                      </div>
                    )}

                    {activeTab === 'login' ? (
                      /* Login Form */
                      <form className="user-auth__form" id="userLoginForm" aria-label="Customer Log In" onSubmit={handleLoginSubmit}>
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label className="form-label" htmlFor="loginEmail">Email address</label>
                          <input
                            className="form-input"
                            type="email"
                            id="loginEmail"
                            placeholder="you@example.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            autoComplete="email"
                            disabled={submitting}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label className="form-label" htmlFor="loginPassword">Password</label>
                          <input
                            className="form-input"
                            type="password"
                            id="loginPassword"
                            placeholder="••••••••"
                            value={loginPass}
                            onChange={(e) => setLoginPass(e.target.value)}
                            required
                            autoComplete="current-password"
                            disabled={submitting}
                          />
                        </div>
                        <button type="submit" className="btn btn--primary btn--full" style={{ marginTop: '1rem', borderRadius: '8px', width: '100%', justifyContent: 'center' }} disabled={submitting}>
                          {submitting ? <span className="spinner" style={{ borderLeftColor: 'white' }}></span> : 'Log In'}
                        </button>
                      </form>
                    ) : (
                      /* Signup Form */
                      <form className="user-auth__form" id="userSignupForm" aria-label="Customer Sign Up" onSubmit={handleSignupSubmit}>
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label className="form-label" htmlFor="signupName">Full Name</label>
                          <input
                            className="form-input"
                            type="text"
                            id="signupName"
                            placeholder="Jane Smith"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            required
                            autoComplete="name"
                            disabled={submitting}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label className="form-label" htmlFor="signupEmail">Email address</label>
                          <input
                            className="form-input"
                            type="email"
                            id="signupEmail"
                            placeholder="jane@example.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                            autoComplete="email"
                            disabled={submitting}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label className="form-label" htmlFor="signupPassword">Password (min. 6 chars)</label>
                          <input
                            className="form-input"
                            type="password"
                            id="signupPassword"
                            placeholder="••••••••"
                            value={signupPass}
                            onChange={(e) => setSignupPass(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                            disabled={submitting}
                          />
                        </div>
                        <button type="submit" className="btn btn--primary btn--full" style={{ marginTop: '1rem', borderRadius: '8px', width: '100%', justifyContent: 'center' }} disabled={submitting}>
                          {submitting ? <span className="spinner" style={{ borderLeftColor: 'white' }}></span> : 'Create Account'}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  /* Logged-In User Dashboard */
                  <div className="user-dashboard" id="userDashboardView">
                    <div className="user-profile-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                      <div className="user-avatar" id="userAvatarMark">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="user-info" style={{ flex: 1 }}>
                        <h3 className="user-profile-name" id="userProfileName">{user.name}</h3>
                        <p className="user-profile-email" id="userProfileEmail">{user.email}</p>
                      </div>
                      <button className="btn btn--outline btn--sm user-logout-btn" id="userLogoutBtn" onClick={logout}>
                        Log Out
                      </button>
                    </div>

                    {/* Quick Booking Callout */}
                    <div className="user-quick-book" style={{ marginBottom: '1.5rem', background: 'var(--bg-alt)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px dashed var(--border)' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '8px' }}>Hungry? Reserve your spot in seconds.</p>
                      <a href="#reservation" className="btn btn--primary btn--sm" id="userDrawerBookBtn" onClick={handleClose} style={{ borderRadius: '6px', width: '100%', justifyContent: 'center' }}>
                        Book a Table Now
                      </a>
                    </div>

                    {/* History Timelines Tab switches */}
                    <div className="user-history-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                      <button
                        className={`history-tab-btn ${historyTab === 'res' ? 'active' : ''}`}
                        onClick={() => setHistoryTab('res')}
                        style={{ flex: 1, padding: '8px 0', borderBottom: historyTab === 'res' ? '2px solid var(--primary)' : 'none', fontWeight: 600, fontSize: '0.875rem' }}
                      >
                        My Bookings
                      </button>
                      <button
                        className={`history-tab-btn ${historyTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setHistoryTab('orders')}
                        style={{ flex: 1, padding: '8px 0', borderBottom: historyTab === 'orders' ? '2px solid var(--primary)' : 'none', fontWeight: 600, fontSize: '0.875rem' }}
                      >
                        My Orders
                      </button>
                    </div>

                    {/* Bookings History Tab */}
                    {historyTab === 'res' && (
                      <div className="history-tab-content active" id="userHistoryRes">
                        <div className="history-list" id="userResList">
                          {!user.reservations || user.reservations.length === 0 ? (
                            <p className="history-empty" style={{ fontStyle: 'italic', textAlign: 'center', padding: '1.5rem', color: 'var(--text-3)' }}>
                              No bookings found under your account.
                            </p>
                          ) : (
                            user.reservations.map(res => {
                              const dateStr = new Date(res.date).toLocaleDateString('en-IN', {
                                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                              });
                              const formattedStatus = res.status.charAt(0).toUpperCase() + res.status.slice(1);
                              return (
                                <div key={res._id} className="history-card" style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-alt)', marginBottom: '8px', border: '1px solid var(--border)' }}>
                                  <div className="history-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 className="history-card__title" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                      Table for {res.guestCount} {Number(res.guestCount) === 1 ? 'Person' : 'People'}
                                    </h4>
                                    <span className={`badge badge--${res.status}`}>{formattedStatus}</span>
                                  </div>
                                  <div className="history-card__meta" style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '4px' }}>
                                    📅 {dateStr} &nbsp;•&nbsp; 🕐 {res.time}
                                  </div>
                                  {res.specialRequests && (
                                    <div className="history-card__note" style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-2)', marginTop: '8px', background: 'var(--bg)', padding: '6px', borderRadius: '4px' }}>
                                      "{res.specialRequests}"
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* Orders History Tab */}
                    {historyTab === 'orders' && (
                      <div className="history-tab-content active" id="userHistoryOrders">
                        <div className="history-list" id="userOrdersList">
                          {!user.orders || user.orders.length === 0 ? (
                            <p className="history-empty" style={{ fontStyle: 'italic', textAlign: 'center', padding: '1.5rem', color: 'var(--text-3)' }}>
                              No previous orders found.
                            </p>
                          ) : (
                            user.orders.map(ord => {
                              const dateStr = new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              });
                              // Progressive stepper calculations
                              const stages = ['received', 'preparing', 'out for delivery'];
                              const activeIndex = stages.indexOf(ord.status);
                              const showStepper = activeIndex !== -1;
                              const progressPct = showStepper ? (activeIndex / (stages.length - 1)) * 100 : 0;

                              return (
                                <div key={ord._id} className="history-card" style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-alt)', marginBottom: '8px', border: '1px solid var(--border)' }}>
                                  <div className="history-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>ID: ...{ord._id.slice(-6)}</span>
                                    <span className={`badge badge--${ord.status.replace(/\s+/g, '-')}`}>
                                      {ord.status.toUpperCase()}
                                    </span>
                                  </div>

                                  <div className="history-card__meta" style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '4px', marginBottom: '8px' }}>
                                    📅 {dateStr}
                                  </div>

                                  <div style={{ padding: '6px 0', borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)' }}>
                                    {ord.items.map((item, index) => (
                                      <div key={index} className="history-card__item-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '2px 0' }}>
                                        <span>{item.quantity}× {item.name}</span>
                                        <span>₹{item.price * item.quantity}</span>
                                      </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginTop: '4px', color: 'var(--primary)' }}>
                                      <span>Total Paid</span>
                                      <span>₹{ord.subtotal}</span>
                                    </div>
                                  </div>

                                  {/* Dynamic order tracking stepper */}
                                  {showStepper && (
                                    <div className="order-stepper" style={{ marginTop: '12px', padding: '8px', background: 'var(--bg)', borderRadius: '6px' }}>
                                      <div className="order-stepper__title" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                                        <span>Order Progress</span>
                                        <span style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>{ord.status}</span>
                                      </div>
                                      <div className="order-stepper__track" style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', position: 'relative', margin: '15px 0' }}>
                                        <div className="order-stepper__line-progress" style={{ position: 'absolute', height: '100%', left: 0, width: `${progressPct}%`, background: 'var(--primary)', transition: 'width 0.4s ease' }}></div>
                                        {stages.map((stage, idx) => (
                                          <div
                                            key={stage}
                                            className={`order-stepper__step ${idx === activeIndex ? 'active' : ''} ${idx < activeIndex ? 'completed' : ''}`}
                                            style={{
                                              position: 'absolute',
                                              top: '50%',
                                              left: `${(idx / (stages.length - 1)) * 100}%`,
                                              transform: 'translate(-50%, -50%)',
                                              width: '10px',
                                              height: '10px',
                                              borderRadius: '50%',
                                              background: idx <= activeIndex ? 'var(--primary)' : 'var(--border)',
                                              border: '2px solid var(--bg)',
                                              boxShadow: idx === activeIndex ? '0 0 8px var(--primary)' : 'none',
                                            }}
                                          ></div>
                                        ))}
                                      </div>
                                      <div className="order-stepper__labels" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-3)' }}>
                                        {stages.map((stage, idx) => (
                                          <span
                                            key={stage}
                                            className={idx === activeIndex ? 'active' : idx < activeIndex ? 'completed' : ''}
                                            style={{
                                              fontWeight: idx === activeIndex ? 700 : 500,
                                              color: idx === activeIndex ? 'var(--primary)' : idx < activeIndex ? 'var(--text-2)' : 'inherit',
                                            }}
                                          >
                                            {stage.charAt(0).toUpperCase() + stage.slice(1)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* Danger Zone account deletion box */}
                    <div className="user-danger-zone" style={{ marginTop: '2rem', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <h4 className="user-danger-zone__title" style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 700 }}>Danger Zone</h4>
                      <p className="user-danger-zone__desc" style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: '4px 0 10px 0' }}>
                        Deleting your account is permanent. All your future bookings will be cancelled and your profile data anonymized.
                      </p>
                      <button className="btn btn--danger btn--sm btn--full" id="btnDeleteAccountOpen" onClick={() => setDeleteModalOpen(true)} style={{ borderRadius: '8px', width: '100%', justifyContent: 'center' }}>
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </main>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Account Deletion Confirmation Modal Overlay */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            key="delete-modal-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1300,
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setDeleteModalOpen(false); }}
          >
            <motion.div
              key="delete-modal"
              className="confirm-modal"
              id="deleteConfirmModal"
              role="dialog"
              aria-modal="true"
              aria-label="Confirm Account Deletion"
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              style={{
                width: '90%',
                maxWidth: '400px',
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: 'var(--bg)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '1px solid var(--border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="confirm-modal__title" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>Delete Account</h3>
              <p className="confirm-modal__desc" style={{ fontSize: '0.85rem', color: 'var(--text-2)', margin: '8px 0 16px 0', lineHeight: 1.5 }}>
                Are you absolutely sure you want to delete your account? This action cannot be undone. Please enter your password to confirm:
              </p>

              <form id="deleteAccountForm" onSubmit={handleDeleteAccountSubmit}>
                {deleteError && (
                  <div className="form-api-error" style={{ marginBottom: '12px', padding: '8px 12px', display: 'block' }} role="alert">
                    {deleteError}
                  </div>
                )}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="deletePassword">Password</label>
                  <input
                    className="form-input"
                    type="password"
                    id="deletePassword"
                    placeholder="••••••••"
                    value={deletePass}
                    onChange={(e) => setDeletePass(e.target.value)}
                    required
                    disabled={deleteSubmitting}
                  />
                </div>
                <div className="confirm-modal__buttons" style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn--outline" id="btnDeleteAccountCancel" onClick={() => { setDeleteModalOpen(false); setDeletePass(''); setDeleteError(''); }} style={{ flex: 1, borderRadius: '8px', justifyContent: 'center' }} disabled={deleteSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn--danger" id="btnDeleteAccountSubmit" style={{ flex: 1, borderRadius: '8px', justifyContent: 'center' }} disabled={deleteSubmitting}>
                    {deleteSubmitting ? <span className="spinner" style={{ borderLeftColor: 'white' }}></span> : 'Delete'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
