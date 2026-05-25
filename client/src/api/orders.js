/**
 * api/orders.js
 * Thin wrapper around the Express /api/orders endpoint.
 * credentials: 'include' ensures the httpOnly auth cookie is sent automatically.
 */

const BASE = '/api/orders';

/**
 * Submit a cart order to the Express API.
 * @param {Object} payload
 * @param {string} payload.sessionId
 * @param {Array}  payload.items
 * @param {number} payload.subtotal
 * @param {string} [payload.customerName]
 * @param {string} [payload.customerEmail]
 * @param {string} [payload.notes]
 * @returns {Promise<{success, message, data}>}
 * @throws {Error}
 */
export async function submitOrder(payload) {
  const res = await fetch(BASE, {
    method:      'POST',
    headers:     { 'Content-Type': 'application/json' },
    credentials: 'include',   // Send auth cookie if user is logged in
    body:        JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    const err = new Error(json.message || 'Failed to submit order. Please try again.');
    err.status = res.status;
    throw err;
  }

  return json;
}

/**
 * Fetch order history for the current session.
 * @param {string} sessionId
 * @returns {Promise<Array>}
 */
export async function getOrdersBySession(sessionId) {
  const params = new URLSearchParams({ sessionId });
  const res = await fetch(`${BASE}?${params}`, { credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load order history.');
  return json.data || [];
}
