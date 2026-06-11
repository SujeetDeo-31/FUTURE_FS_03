import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const CART_KEY      = 'ob-cart';
const SESSION_KEY   = 'ob-session';
const TABLE_KEY     = 'ob-table';
const DINEIN_NAME_KEY = 'ob-dinein-name';

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // ── Session ID ─────────────────────────────────────────────
  const [sessionId] = useState(() => {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  });

  // ── Dine-In / QR Table State ────────────────────────────────
  // On mount: check URL for ?table= param, persist to localStorage
  const [tableNumber, setTableNumber] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTable = params.get('table');
    if (urlTable) {
      localStorage.setItem(TABLE_KEY, urlTable);
      return urlTable;
    }
    return localStorage.getItem(TABLE_KEY) || '';
  });

  // dineInName — name customer enters at the welcome modal
  const [dineInName, setDineInName] = useState(() => {
    return localStorage.getItem(DINEIN_NAME_KEY) || '';
  });

  // Show welcome modal when table is detected but name not yet set
  const [showTableModal, setShowTableModal] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTable = params.get('table');
    const savedName = localStorage.getItem(DINEIN_NAME_KEY);
    // Show modal if coming via QR (table in URL) and name not already stored
    return !!urlTable && !savedName;
  });

  const confirmDineInName = (name) => {
    const trimmed = name.trim();
    setDineInName(trimmed);
    localStorage.setItem(DINEIN_NAME_KEY, trimmed);
    setShowTableModal(false);
  };

  const clearTableSession = () => {
    setTableNumber('');
    setDineInName('');
    localStorage.removeItem(TABLE_KEY);
    localStorage.removeItem(DINEIN_NAME_KEY);
  };

  // ── Cart Persistence ────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch (err) {
      console.warn('[CartContext] Failed to load cart cache:', err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.warn('[CartContext] Failed to persist cart:', err);
    }
  }, [cartItems]);

  // ── Cart Actions ────────────────────────────────────────────
  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, qty) => {
    if (qty <= 0) { removeFromCart(itemId); return; }
    setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setCartItems([]);

  const getItemCount = () => cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const getSubtotal  = () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // ── Checkout ────────────────────────────────────────────────
  // guestDetails = { name, email, address } — only used when user is not logged in
  const checkout = async (notes = '', guestDetails = null) => {
    if (cartItems.length === 0) return;

    const isDineIn = !!tableNumber;
    const isGuest  = !user;

    // Determine name and email from context:
    // - Logged-in: use account data
    // - Dine-in guest: name comes from the table modal (dineInName), email unknown
    // - Delivery guest: name + email come from guestDetails form
    const resolvedName  = isDineIn
      ? dineInName
      : (user ? user.name  : guestDetails?.name  || '');
    const resolvedEmail = user
      ? user.email
      : guestDetails?.email || '';
    const resolvedAddress = isDineIn ? '' : (guestDetails?.address || '');

    const payload = {
      sessionId,
      customerName:    resolvedName,
      customerEmail:   resolvedEmail,
      deliveryAddress: resolvedAddress,
      items: cartItems.map(item => ({
        itemId:   item.id,
        name:     item.name,
        price:    item.price,
        quantity: item.quantity,
      })),
      subtotal:    getSubtotal(),
      notes:       notes.trim() || '',
      orderType:   isDineIn ? 'dine-in' : 'delivery',
      tableNumber: isDineIn ? tableNumber : '',
      isGuest,
    };

    const res = await fetch('/api/orders', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to submit order. Please try again.');

    clearCart();
    return json;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount: getItemCount(),
        subtotal:  getSubtotal(),
        checkout,
        // Dine-in state
        tableNumber,
        dineInName,
        showTableModal,
        confirmDineInName,
        clearTableSession,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
