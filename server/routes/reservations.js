'use strict';

import express from 'express';
import { body, query } from 'express-validator';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import * as ctrl from '../controllers/reservationController.js';

const router = express.Router();

// ── Validation rules ──────────────────────────────────────────
const createRules = [
  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

  body('phone')
    .trim().notEmpty().withMessage('Phone is required')
    .matches(/^[\d\s+\-().]{7,20}$/).withMessage('Invalid phone number'),

  body('guestCount')
    .notEmpty().withMessage('Guest count is required')
    .isIn(['1','2','3','4','5','6+']).withMessage('Invalid guest count'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD'),

  body('time')
    .notEmpty().withMessage('Time is required')
    .isIn(['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']).withMessage('Reservations are only available between 10:00 AM and 9:00 PM'),

  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Special requests must be under 500 characters'),
];

const checkRules = [
  query('email').isEmail().withMessage('Invalid email'),
  query('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD'),
  query('time')
    .notEmpty().withMessage('Time is required')
    .isIn(['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']).withMessage('Reservations are only available between 10:00 AM and 9:00 PM'),
];

// ── Routes ────────────────────────────────────────────────────
router.post('/',       createRules, validate, ctrl.createReservation);
router.get('/check',   checkRules,  validate, ctrl.checkAvailability);
router.get('/',        auth, ctrl.listReservations);
router.patch('/:id/status', auth, [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'rejected', 'completed', 'cancelled']).withMessage('Invalid status value')
], validate, ctrl.updateReservationStatus);

export default router;
