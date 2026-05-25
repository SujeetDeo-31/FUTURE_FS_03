import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer() {
  const { user } = useAuth();
  const { cartItems, cartOpen, setCartOpen, updateQuantity, removeFromCart, subtotal, checkout } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' }); // success or error states
  const [notes, setNotes] = useState('');

  // Auto-close cart drawer on Escape key
  useEffect(() => {
    if (!cartOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCartOpen(false);
        document.body.style.overflow = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartOpen, setCartOpen]);

  const handleClose = () => {
    setCartOpen(false);
    document.body.style.overflow = '';
    // Clear status when closing unless success
    if (status.type !== 'success') {
      setStatus({ type: '', msg: '' });
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setSubmitting(true);
    setStatus({ type: '', msg: '' });

    try {
      const result = await checkout(notes);
      setStatus({
        type: 'success',
        msg: `✅ ${result.message || "Order placed successfully! We'll have it ready soon."}`
      });
      setNotes('');
    } catch (err) {
      setStatus({
        type: 'error',
        msg: `❌ ${err.message || 'Something went wrong. Please try again.'}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            key="cart-backdrop"
            className="cart-panel__backdrop"
            id="cartOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, zIndex: 1200, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          />

          {/* Sliding drawer panel */}
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
            <header className="cart-panel__header">
              <div className="cart-panel__brand">
                <span className="cart-panel__logo" aria-hidden="true">🛒</span>
                <h2 className="cart-panel__title">Your Order</h2>
                {cartItems.length > 0 && (
                  <span className="cart-panel__count">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
                )}
              </div>
              <button className="cart-panel__close" id="cartClose" aria-label="Close Order Panel" onClick={handleClose}>
                ×
              </button>
            </header>

            <main className="cart-panel__body" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: 0 }}>
              {status.type && (
                <div
                  className={status.type === 'success' ? 'form-success' : 'form-api-error'}
                  style={{
                    margin: '1.25rem',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    display: 'block',
                  }}
                >
                  {status.type === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
                      <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem' }}>Order Placed!</p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginTop: '6px', lineHeight: 1.5 }}>
                        Your delicious meals are being prepared. Check progress on the Account dashboard.
                      </p>
                    </div>
                  ) : (
                    status.msg
                  )}
                </div>
              )}

              {cartItems.length === 0 ? (
                status.type !== 'success' && (
                  <div className="cart-empty" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="cart-empty__icon">🍕</div>
                    <h3 className="cart-empty__title">Your order is empty</h3>
                    <p className="cart-empty__sub">
                      Explore our menu and add some tandoori delights!
                    </p>
                    <a href="#menu" className="btn btn--primary btn--sm" style={{ marginTop: '1.25rem', borderRadius: '8px' }} onClick={handleClose}>
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
                        <img
                          src={item.img}
                          alt={item.name}
                          className="cart-item__img"
                        />
                        <div className="cart-item__info">
                          <h4 className="cart-item__name">{item.name}</h4>
                          <span className="cart-item__price">₹{item.price} each</span>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
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

                  {/* Checkout Area */}
                  <form onSubmit={handleCheckoutSubmit} className="cart-panel__footer">
                    <div className="cart-summary">
                      <div className="cart-summary__row">
                        <span>Items Subtotal</span>
                        <span>₹{subtotal}</span>
                      </div>
                      <div className="cart-summary__row">
                        <span>CGST & SGST (5%)</span>
                        <span>₹{Math.round(subtotal * 0.05)}</span>
                      </div>
                      <div className="cart-summary__row cart-summary__row--total">
                        <span>Total Payable</span>
                        <span>₹{subtotal + Math.round(subtotal * 0.05)}</span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label" htmlFor="cartNotes" style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Cooking / Delivery Notes <span className="form-label--opt">(optional)</span>
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        id="cartNotes"
                        placeholder="Less spicy, extra cheese, leave at gate..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={submitting}
                        style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                      />
                    </div>

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
                          Placing order...
                        </>
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
