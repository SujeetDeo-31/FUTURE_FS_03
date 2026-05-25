/**
 * api/reservations.js
 * Thin wrapper around the Express /api/reservations endpoint.
 * credentials: 'include' ensures the httpOnly auth cookie is sent automatically.
 */

const BASE = '/api/reservations';

/**
 * Submit a new reservation.
 * @param {Object} data — reservation payload
 * @returns {Promise<{success, message, data}>}
 * @throws {Error} with .message from the API
 */
export async function createReservation(data) {
  const res = await fetch(BASE, {
    method:      'POST',
    headers:     { 'Content-Type': 'application/json' },
    credentials: 'include',       // Send auth cookie if logged in
    body:        JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    const err = new Error(json.message || 'Something went wrong. Please try again.');
    err.status = res.status;
    err.errors = json.errors || [];
    throw err;
  }

  return json;
}

/**
 * Check if a time slot is available for a given email.
 * @returns {Promise<boolean>} true if available
 */
export async function checkAvailability(email, date, time) {
  const params = new URLSearchParams({ email, date, time });
  const res = await fetch(`${BASE}/check?${params}`, { credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Availability check failed');
  return json.available;
}
