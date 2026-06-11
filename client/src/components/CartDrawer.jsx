import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer() {
  const { user, isLoggedIn } = useAuth();
  const {
    cartItems, cartOpen, setCartOpen,
    updateQuantity, removeFromCart,
    subtotal, checkout,
    tableNumber, dineInName,
  } = useCart();

  const isDineIn = !!tableNumber;
  const isGuest  = !isLoggedIn;
  // Show address for ALL delivery orders (guest or logged-in)
  const showDeliveryFields = !isDineIn;
  // Show name + email fields only for guests (logged-in users already have these on account)
  const showGuestOnlyFields = isGuest && !isDineIn;

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus]         = useState({ type: '', msg: '' });
  const [notes, setNotes]           = useState('');

  // Address field — shown for all delivery orders
  const [deliveryAddress, setDeliveryAddress] = useState('');
  // Guest-only fields
  const [guestName,    setGuestName]    = useState('');
  const [guestEmail,   setGuestEmail]   = useState('');
  const [fieldErrors,  setFieldErrors]  = useState({});

  // Auto-close on Escape
  useEffect(() => {
    if (!cartOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        setCartOpen(false);
        document.body.style.overflow = '';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cartOpen, setCartOpen]);

  const handleClose = () => {
    setCartOpen(false);
    document.body.style.overflow = '';
    if (status.type !== 'success') setStatus({ type: '', msg: '' });
  };

  // Validation — address required for all delivery orders; name required for guests
  const validateDelivery = () => {
    const errs = {};
    if (showGuestOnlyFields && !guestName.trim()) {
      errs.name = 'Your name is required.';
    }
    if (!deliveryAddress.trim()) {
      errs.address = 'Delivery address is required.';
    }
    if (showGuestOnlyFields && guestEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    return errs;
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    // Validate delivery fields before sending
    if (showDeliveryFields) {
      const errs = validateDelivery();
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        return;
      }
      setFieldErrors({});
    }

    setSubmitting(true);
    setStatus({ type: '', msg: '' });

    try {
      // Always pass address; pass name+email only for guests
      const extraData = {
        address: deliveryAddress.trim(),
        ...(showGuestOnlyFields && {
          name:  guestName.trim(),
          email: guestEmail.trim(),
        }),
      };

      const result = await checkout(notes, showDeliveryFields ? extraData : null);
      setStatus({ type: 'success', msg: result.message || 'Order placed!' });
      setNotes('');
      setDeliveryAddress('');
      setGuestName('');
      setGuestEmail('');
    } catch (err) {
      setStatus({ type: 'error', msg: `❌ ${err.message || 'Something went wrong. Please try again.'}` });
    } finally {
      setSubmitting(false);
    }
  };

  // Shared input style
  const inputStyle = { padding: '10px 14px', fontSize: '0.85rem' };
  const labelStyle = { fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' };
  const errorStyle = { fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', fontWeight: 500 };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            className="cart-panel__backdrop"
            id="cartOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 1200,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            className="cart-panel is-open"
            id="cartPanel"
            role="dialog"
            aria-modal="true"
            aria-label="Your Order"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: '480px',
              zIndex: 1201,
              display: 'flex', flexDirection: 'column',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
              backgroundColor: 'var(--bg)',
              borderLeft: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <header className="cart-panel__header">
              <div className="cart-panel__brand">
                <span className="cart-panel__logo" aria-hidden="true">🛒</span>
                <h2 className="cart-panel__title">Your Order</h2>
                {cartItems.length > 0 && (
                  <span className="cart-panel__count">
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                className="cart-panel__close"
                id="cartClose"
                aria-label="Close Order Panel"
                onClick={handleClose}
              >
                ×
              </button>
            </header>

            {/* Dine-In Table Badge */}
            {isDineIn && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 1.5rem',
                  background: 'rgba(230, 57, 70, 0.08)',
                  borderBottom: '1px solid rgba(230, 57, 70, 0.15)',
                  fontSize: '0.8rem', fontWeight: 700,
                  color: 'var(--primary)', letterSpacing: '0.02em',
                }}
              >
                <span>🪑</span>
                <span>Table {tableNumber}</span>
                {dineInName && (
                  <>
                    <span style={{ color: 'var(--border)', fontWeight: 400 }}>·</span>
                    <span>{dineInName}</span>
                  </>
                )}
              </div>
            )}

            <main
              className="cart-panel__body"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: 0 }}
            >
              {/* Status Messages */}
              {status.type && (
                <div
                  className={status.type === 'success' ? 'form-success' : 'form-api-error'}
                  style={{ margin: '1.25rem', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', display: 'block' }}
                >
                  {status.type === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
                      <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem' }}>
                        {isDineIn ? 'Sent to Kitchen!' : 'Order Placed!'}
                      </p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginTop: '6px', lineHeight: 1.5 }}>
                        {isDineIn
                          ? 'Your order is being prepared. Sit back and relax!'
                          : guestEmail
                            ? 'Order confirmed! We\'ll email you updates at ' + guestEmail + '.'
                            : 'Your delicious meals are being prepared right away.'}
                      </p>
                    </div>
                  ) : (
                    status.msg
                  )}
                </div>
              )}

              {cartItems.length === 0 ? (
                status.type !== 'success' && (
                  <div
                    className="cart-empty"
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <div className="cart-empty__icon">🍕</div>
                    <h3 className="cart-empty__title">Your order is empty</h3>
                    <p className="cart-empty__sub">Explore our menu and add some tandoori delights!</p>
                    <a
                      href="#menu"
                      className="btn btn--primary btn--sm"
                      style={{ marginTop: '1.25rem', borderRadius: '8px' }}
                      onClick={handleClose}
                    >
                      Explore Menu
                    </a>
                  </div>
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Cart Item List */}
                  <div className="cart-list" style={{ padding: '0 1.5rem', flex: 1, overflowY: 'auto' }}>
                    {cartItems.map(item => (
                      <div key={item.id} className="cart-item">
                        <img src={item.img} alt={item.name} className="cart-item__img" />
                        <div className="cart-item__info">
                          <h4 className="cart-item__name">{item.name}</h4>
                          <span className="cart-item__price">₹{item.price} each</span>
                          <div
                            style={{
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'space-between', marginTop: '8px',
                            }}
                          >
                            <div className="cart-qty">
                              <button
                                className="cart-qty__btn"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="cart-qty__val">{item.quantity}</span>
                              <button
                                className="cart-qty__btn"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                            <button
                              className="cart-item__remove"
                              onClick={() => removeFromCart(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Footer */}
                  <form onSubmit={handleCheckoutSubmit} className="cart-panel__footer">
                    {/* Price Summary */}
                    <div className="cart-summary">
                      <div className="cart-summary__row">
                        <span>Items Subtotal</span>
                        <span>₹{subtotal}</span>
                      </div>
                      <div className="cart-summary__row">
                        <span>CGST &amp; SGST (5%)</span>
                        <span>₹{Math.round(subtotal * 0.05)}</span>
                      </div>
                      <div className="cart-summary__row cart-summary__row--total">
                        <span>Total Payable</span>
                        <span>₹{subtotal + Math.round(subtotal * 0.05)}</span>
                      </div>
                    </div>

                    {/* ── Delivery Details (address for all, + name/email for guests) */}
                    {showDeliveryFields && (
                      <div
                        style={{
                          background: 'var(--bg-alt)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '1rem 1.1rem',
                          marginBottom: '1.1rem',
                        }}
                      >
                        {/* Section label */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.85rem' }}>
                          <span style={{ fontSize: '1rem' }}>🏠</span>
                          <span
                            style={{
                              fontSize: '0.75rem', fontWeight: 800,
                              textTransform: 'uppercase', letterSpacing: '0.07em',
                              color: 'var(--text-2)',
                            }}
                          >
                            Delivery Details
                          </span>
                        </div>

                        {/* Guest-only: Name */}
                        {showGuestOnlyFields && (
                          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                            <label className="form-label" htmlFor="guestName" style={labelStyle}>
                              Your Name <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                              className="form-input"
                              type="text"
                              id="guestName"
                              placeholder="e.g. Arjun Mehta"
                              value={guestName}
                              onChange={(e) => { setGuestName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
                              disabled={submitting}
                              maxLength={60}
                              style={{ ...inputStyle, borderColor: fieldErrors.name ? '#ef4444' : undefined }}
                            />
                            {fieldErrors.name && <p style={errorStyle}>{fieldErrors.name}</p>}
                          </div>
                        )}

                        {/* Address — shown for everyone doing delivery */}
                        <div className="form-group" style={{ marginBottom: showGuestOnlyFields ? '0.85rem' : 0 }}>
                          <label className="form-label" htmlFor="deliveryAddress" style={labelStyle}>
                            Delivery Address <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            className="form-input"
                            type="text"
                            id="deliveryAddress"
                            placeholder="Flat/Building, Street, City, PIN"
                            value={deliveryAddress}
                            onChange={(e) => { setDeliveryAddress(e.target.value); setFieldErrors(p => ({ ...p, address: '' })); }}
                            disabled={submitting}
                            maxLength={200}
                            style={{ ...inputStyle, borderColor: fieldErrors.address ? '#ef4444' : undefined }}
                          />
                          {fieldErrors.address && <p style={errorStyle}>{fieldErrors.address}</p>}
                        </div>

                        {/* Guest-only: Email (optional) */}
                        {showGuestOnlyFields && (
                          <div className="form-group" style={{ marginBottom: 0, marginTop: '0.85rem' }}>
                            <label className="form-label" htmlFor="guestEmail" style={labelStyle}>
                              Email{' '}
                              <span className="form-label--opt" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
                                (optional — for order updates)
                              </span>
                            </label>
                            <input
                              className="form-input"
                              type="email"
                              id="guestEmail"
                              placeholder="you@example.com"
                              value={guestEmail}
                              onChange={(e) => { setGuestEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                              disabled={submitting}
                              style={{ ...inputStyle, borderColor: fieldErrors.email ? '#ef4444' : undefined }}
                            />
                            {fieldErrors.email && <p style={errorStyle}>{fieldErrors.email}</p>}
                            {!fieldErrors.email && (
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '4px' }}>
                                We'll send status updates if you provide an email.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label
                        className="form-label"
                        htmlFor="cartNotes"
                        style={labelStyle}
                      >
                        {isDineIn ? 'Special Requests' : 'Cooking / Delivery Notes'}{' '}
                        <span className="form-label--opt">(optional)</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        id="cartNotes"
                        placeholder={
                          isDineIn
                            ? 'Less spicy, extra cheese, no onions...'
                            : 'Less spicy, extra cheese, leave at gate...'
                        }
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={submitting}
                        style={inputStyle}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn--primary btn--full"
                      id="placeOrderBtn"
                      disabled={submitting}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        boxShadow: '0 4px 18px rgba(230, 57, 70, 0.25)',
                      }}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner" style={{ borderLeftColor: 'white' }}></span>
                          {isDineIn ? 'Sending to kitchen...' : 'Placing order...'}
                        </>
                      ) : isDineIn ? (
                        `🍳 Send to Kitchen (₹${subtotal + Math.round(subtotal * 0.05)})`
                      ) : (
                        `Place Order (₹${subtotal + Math.round(subtotal * 0.05)})`
                      )}
                    </button>
                  </form>
                </div>
              )}
            </main>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
