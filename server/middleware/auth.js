'use strict';

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { COOKIE_NAME } from '../utils/sendCookie.js';

/**
 * adminAuth middleware
 * Verifies the JWT cookie AND checks that the user's role is 'admin'.
 * Replaces the old PIN-based x-admin-secret header check.
 */
export default async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      console.warn(`[AdminAuthMiddleware] Authentication failed: No token cookie (ob_token) provided.`);
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'one_bite_fallback_secret_change_in_prod'
      );
    } catch (jwtErr) {
      console.warn(`[AdminAuthMiddleware] Authentication failed: JWT verify failed. Error: ${jwtErr.message}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired admin session.',
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.warn(`[AdminAuthMiddleware] Authentication failed: User ID ${decoded.id} not found in database.`);
      return res.status(401).json({
        success: false,
        message: 'Account not found.',
      });
    }

    if (user.role !== 'admin') {
      console.warn(`[AdminAuthMiddleware] Access denied: User ${user.email} (ID: ${user._id}) does not have admin privileges.`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(`[AdminAuthMiddleware] Unhandled error during authentication: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};
