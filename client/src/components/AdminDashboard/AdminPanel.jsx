import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLogin from './AdminLogin';
import AdminStats from './AdminStats';
import BookingsTab from './BookingsTab';
import OrdersTab from './OrdersTab';
import UsersTab from './UsersTab';
import ReviewsTab from './ReviewsTab';
import SettingsTab from './SettingsTab';
import { useAuth } from '../../context/AuthContext';

const API = '/api';

export default function AdminPanel({ isOpen, onClose }) {
  const { logout: authContextLogout, refreshSession } = useAuth();
  const [adminUser, setAdminUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('reservations'); // 'reservations', 'orders', 'users'
  const [error, setError] = useState('');

  // Dashboard datasets
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Auto-close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Authenticate admin session on panel open
  useEffect(() => {
    if (isOpen) {
      checkAdminSession();
    }
  }, [isOpen]);

  const checkAdminSession = async () => {
    setCheckingAuth(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const result = await res.json();
        if (result.data?.role === 'admin') {
          setAdminUser(result.data);
          // Immediately load dashboard metrics
          await loadDashboardData();
        } else {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
    } catch {
      setAdminUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [resData, ordersData, usersData, reviewsData] = await Promise.all([
        fetch(`${API}/reservations`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/orders/admin/list`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/auth/admin/users`, { credentials: 'include' }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`/api/reviews`, { credentials: 'include' }).then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      setReservations(resData.data || []);
      setOrders(ordersData.data || []);
      setUsers(usersData.data || []);
      setReviews(reviewsData.data || []);
    } catch (err) {
      console.error('[AdminDashboard] Failed to fetch metrics:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdminLoginSuccess = async (user) => {
    setAdminUser(user);
    if (refreshSession) {
      await refreshSession();
    }
    loadDashboardData();
  };

  const handleAdminLogout = async () => {
    try {
      if (authContextLogout) {
        await authContextLogout();
      } else {
        await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
      }
    } catch {}
    setAdminUser(null);
    setReservations([]);
    setOrders([]);
    setUsers([]);
    setReviews([]);
  };

  const handleUpdateReservationStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update reservation status.');

      // Update local state instantly
      setReservations(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert(`Error updating reservation: ${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update order status.');

      // Update local state instantly and sync orders
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(`Error updating order: ${err.message}`);
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to delete review.');

      // Update state instantly
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert(`Error deleting review: ${err.message}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="admin-backdrop"
            className="admin-panel__backdrop"
            id="adminPanelBackdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1100,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Centering Wrapper */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1101,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              pointerEvents: 'none',
            }}
          >
            {/* Core Modal Container */}
            <motion.div
              key="admin-container"
              className="admin-panel__container"
              id="adminPanelContainer"
              role="dialog"
              aria-modal="true"
              aria-label="Admin Dashboard"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              style={{
                pointerEvents: 'auto',
                position: 'relative',
                width: '100%',
                maxWidth: '1200px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border)',
              }}
            >
              <header className="admin-panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-alt)' }}>
                <div className="admin-panel__brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="admin-panel__logo" aria-hidden="true" style={{ fontSize: '1.25rem' }}>🔑</span>
                  <h2 className="admin-panel__title" style={{ fontSize: '1.1rem', fontWeight: 700 }}>One-Bite Admin Dashboard</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    className="btn btn--outline btn--sm"
                    id="adminBackToSiteBtn"
                    aria-label="Back to website"
                    onClick={onClose}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, borderRadius: '8px', padding: '6px 14px' }}
                  >
                    <span aria-hidden="true" style={{ fontSize: '1rem' }}>←</span>
                    Back to Website
                  </button>
                  <button
                    className="admin-panel__close-btn"
                    id="adminPanelClose"
                    aria-label="Close Admin Dashboard"
                    onClick={onClose}
                    style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', lineHeight: 1, padding: '4px 8px' }}
                  >
                    ×
                  </button>
                </div>
              </header>

              <main className="admin-panel__content" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {checkingAuth ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <span className="spinner" style={{ width: '32px', height: '32px' }}></span>
                  </div>
                ) : !adminUser ? (
                  /* Login screen */
                  <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
                ) : (
                  /* Authenticated Dashboard view */
                  <div className="admin-dashboard" id="adminDashboardView">
                    {/* Logout Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
                        Logged in as: <strong>{adminUser.name}</strong> ({adminUser.email})
                      </span>
                      <button className="btn btn--outline btn--sm" id="adminLogoutBtn" onClick={handleAdminLogout}>
                        Sign Out
                      </button>
                    </div>

                    {/* Glassmorphic Stats Grid */}
                    <AdminStats reservations={reservations} orders={orders} />

                    {/* Premium Segmented Slider Tab Controllers */}
                    <div className="admin-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', background: 'var(--bg-alt)', padding: '6px', borderRadius: '30px', maxWidth: '680px', border: '1px solid var(--border)', position: 'relative' }}>
                      {['reservations', 'orders', 'users', 'reviews', 'settings'].map(tab => {
                        const displayLabel = {
                          reservations: 'Bookings',
                          orders: 'Orders History',
                          users: 'Registered Users',
                          reviews: 'Guest Reviews',
                          settings: 'Security Settings'
                        }[tab];
                        return (
                          <button
                            key={tab}
                            className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                            style={{
                              flex: 1,
                              padding: '8px 16px',
                              borderRadius: '20px',
                              border: 'none',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              background: activeTab === tab ? 'var(--primary)' : 'none',
                              color: activeTab === tab ? 'white' : 'var(--text-2)',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {displayLabel}
                          </button>
                        );
                      })}
                    </div>

                    {/* Render active tabs */}
                    <div style={{ display: loadingData ? 'none' : 'block' }}>
                      {activeTab === 'reservations' && (
                        <BookingsTab
                          reservations={reservations}
                          onUpdateStatus={handleUpdateReservationStatus}
                        />
                      )}
                      {activeTab === 'orders' && (
                        <OrdersTab
                          orders={orders}
                          onUpdateStatus={handleUpdateOrderStatus}
                        />
                      )}
                      {activeTab === 'users' && (
                        <UsersTab
                          users={users}
                        />
                      )}
                      {activeTab === 'reviews' && (
                        <ReviewsTab
                          reviews={reviews}
                          onDeleteReview={handleDeleteReview}
                        />
                      )}
                      {activeTab === 'settings' && (
                        <SettingsTab />
                      )}
                    </div>

                    {loadingData && (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <span className="spinner"></span>
                      </div>
                    )}
                  </div>
                )}
              </main>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
