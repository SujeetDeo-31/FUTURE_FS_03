'use strict';

import express from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import validate from '../middleware/validate.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/auth.js';
import User from '../models/User.js';
import Reservation from '../models/Reservation.js';
import Order from '../models/Order.js';
import { sendCookie, clearCookie } from '../utils/sendCookie.js';

const router = express.Router();

// ── Validation rules ─────────────────────────────────────────

const signupRules = [
  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── JWT helper ───────────────────────────────────────────────

const signToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET || 'one_bite_fallback_secret_change_in_prod',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ── POST /api/auth/signup ────────────────────────────────────
router.post('/signup', signupRules, validate, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);

    // Set JWT as secure httpOnly cookie — never exposed to JS
    sendCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to One-Bite.',
      data: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', loginRules, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const token = signToken(user._id);
    sendCookie(res, token);

    res.json({
      success: true,
      message: 'Welcome back!',
      data: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', (req, res) => {
  clearCookie(res);
  res.json({ success: true, message: 'Signed out successfully.' });
});

// ── GET /api/auth/me ─────────────────────────────────────────
// Lightweight session-check + profile data. Called on page load.
router.get('/me', userAuth, async (req, res, next) => {
  try {
    const reservations = await Reservation
      .find({ email: req.user.email })
      .sort({ date: -1, time: -1 })
      .limit(10)
      .select('-__v');

    const orders = await Order
      .find({ customerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-__v');

    res.json({
      success: true,
      data: {
        id:           req.user._id,
        name:         req.user.name,
        email:        req.user.email,
        role:         req.user.role,
        reservations,
        orders,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/admin-signup ──────────────────────────────
// One-time bootstrap endpoint to create the first admin account.
// Protected by ADMIN_BOOTSTRAP_SECRET set in .env.
router.post('/admin-signup', [
  ...signupRules,
  body('bootstrapSecret').notEmpty().withMessage('Bootstrap secret required'),
], validate, async (req, res, next) => {
  try {
    const { name, email, password, bootstrapSecret } = req.body;

    const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (!expectedSecret || bootstrapSecret !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: 'Invalid bootstrap secret. Admin account creation denied.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({ name, email, password, role: 'admin' });
    const token = signToken(user._id);
    sendCookie(res, token);

    res.status(201).json({
      success: true,
      message: `Admin account created for ${user.name}. Keep your credentials secure.`,
      data: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/admin/users ────────────────────────────────
// Lists registered users (admin only)
router.get('/admin/users', adminAuth, async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password -__v');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/auth/delete-account ──────────────────────────
// Customer account deletion. Secures deletion with password verification,
// anonymizes reservations & orders to save statistics, and clears auth cookies.
router.delete('/delete-account', userAuth, [
  body('password').notEmpty().withMessage('Password is required to confirm deletion')
], validate, async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Deletion cancelled.' });
    }

    const email = user.email;

    // Anonymize reservation data
    await Reservation.updateMany(
      { email },
      { $set: { email: 'deleted-user@onebite.in', name: 'Deleted Customer', phone: '0000000000' } }
    );

    // Anonymize order data
    await Order.updateMany(
      { customerEmail: email },
      { $set: { customerEmail: 'deleted-user@onebite.in', customerName: 'Deleted Customer' } }
    );

    // Delete user document
    await User.findByIdAndDelete(req.user._id);

    // Wipe authentication cookie
    clearCookie(res);

    res.json({
      success: true,
      message: 'Your account has been deleted successfully and all your personal details anonymized. We are sorry to see you go!',
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/admin/change-password ──────────────────────
// Secure endpoint to allow logged-in administrators to change their password.
// Performs current password verification, inputs validation, and hashes the new credentials.
router.post('/admin/change-password', adminAuth, [
  body('currentPassword').notEmpty().withMessage('Current password is required to verify identity'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], validate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Fetch the fresh administrator record
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      console.warn(`[AdminAuth] [PASSWORD CHANGE FAILURE] Unauthorized password change attempt for Admin ID: ${user._id}`);
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password. Verification failed.'
      });
    }

    // Set new password (pre-save hook hashes with bcrypt automatically)
    user.password = newPassword;
    await user.save();

    console.log(`[AdminAuth] [PASSWORD CHANGE SUCCESS] Password updated securely for Admin: ${user.email}`);

    res.json({
      success: true,
      message: 'Your administrator password has been updated securely.'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
