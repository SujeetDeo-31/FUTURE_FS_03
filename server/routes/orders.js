'use strict';

import express from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import * as ctrl from '../controllers/orderController.js';

const router = express.Router();

const itemSchema = [
  body('items').isArray({ min: 1 }).withMessage('Order must include at least one item'),
  body('items.*.itemId').isNumeric().withMessage('Item ID must be a number'),
  body('items.*.name').trim().notEmpty().withMessage('Item name is required'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Item price must be a positive number'),
  body('items.*.quantity').isInt({ min: 1, max: 20 }).withMessage('Quantity must be between 1 and 20'),
  body('sessionId').trim().notEmpty().withMessage('Session ID is required'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
  // optional({ values: 'falsy' }) skips validation when the value is '', null, or undefined.
  // This is the correct way to make email truly optional — .optional() alone only skips undefined.
  body('customerEmail').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
];

router.post('/',          itemSchema, validate, ctrl.createOrder);
router.get('/admin/list', auth, ctrl.listAllOrders);
router.patch('/:id/status', auth, [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['received', 'preparing', 'out for delivery', 'completed', 'cancelled']).withMessage('Invalid status value')
], validate, ctrl.updateOrderStatus);
router.get('/:id',        ctrl.getOrder);
router.get('/',           ctrl.listOrdersBySession);

export default router;
