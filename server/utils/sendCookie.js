'use strict';

/**
 * utils/sendCookie.js
 * Sets the JWT as a secure, httpOnly cookie on the response.
 * Centralising cookie options here ensures they are consistent
 * across every auth route (signup, login, admin-signup).
 */

export const COOKIE_NAME = 'ob_token';
const MS_PER_DAY  = 24 * 60 * 60 * 1000;

/**
 * @param {import('express').Response} res
 * @param {string} token  — signed JWT
 * @param {number} [days] — cookie TTL in days (default 7)
 */
export function sendCookie(res, token, days = 7) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,                                     // Not accessible via JS
    secure:   process.env.NODE_ENV === 'production',    // HTTPS only in prod
    sameSite: 'strict',                                 // CSRF protection
    maxAge:   days * MS_PER_DAY,
    path:     '/',
  });
}

/**
 * Clear the auth cookie (used on logout).
 * @param {import('express').Response} res
 */
export function clearCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/',
  });
}
