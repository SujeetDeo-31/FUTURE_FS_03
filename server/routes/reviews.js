'use strict';

import express from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import userAuth from '../middleware/userAuth.js';
import Review from '../models/Review.js';

const router = express.Router();

// Input sanitization rules
const reviewRules = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('message')
    .trim()
    .notEmpty().withMessage('Review message cannot be empty')
    .isLength({ max: 1000 }).withMessage('Review message must be under 1000 characters'),
];

// ── GET /api/reviews ─────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/reviews ────────────────────────────────────────
router.post('/', userAuth, reviewRules, validate, async (req, res, next) => {
  try {
    const { rating, message } = req.body;

    const review = await Review.create({
      user: req.user._id,
      customerName: req.user.name,
      rating: Number(rating),
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published successfully.',
      data: review,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/reviews/:id ──────────────────────────────────
router.delete('/:id', userAuth, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = review.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own reviews.',
      });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/reviews/:id ───────────────────────────────────
router.patch('/:id', userAuth, reviewRules, validate, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Restrict editing exclusively to the owner
    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own reviews.',
      });
    }

    const { rating, message } = req.body;
    review.rating = Number(rating);
    review.message = message;
    await review.save();

    res.json({
      success: true,
      message: 'Your review has been updated successfully.',
      data: review,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
