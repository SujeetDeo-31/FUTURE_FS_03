'use strict';

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { COOKIE_NAME } from '../utils/sendCookie.js';

/**
 * userAuth middleware
 * Reads the JWT from the secure httpOnly cookie (ob_token).
 * Attaches the verified user document to req.user.
 */
export default async (req, res, next) => {
  try {
    // Read token from httpOnly cookie (not Authorization header)
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      console.warn(`[UserAuthMiddleware] Authentication failed: No token cookie (ob_token) provided.`);
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to your account.',
      });
    }

    // Verify and decode
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'one_bite_fallback_secret_change_in_prod'
      );
    } catch (jwtErr) {
      console.warn(`[UserAuthMiddleware] Authentication failed: JWT verify failed. Error: ${jwtErr.message}`);
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please sign in again.',
      });
    }

    // Fetch fresh user document — catches deleted accounts mid-session
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.warn(`[UserAuthMiddleware] Authentication failed: User ID ${decoded.id} not found in database.`);
      return res.status(401).json({
        success: false,
        message: 'Account not found. Please sign in again.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(`[UserAuthMiddleware] Unhandled error during authentication: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};
