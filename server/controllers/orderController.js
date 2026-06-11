'use strict';

import Order from '../models/Order.js';
import * as emailService from '../services/emailService.js';

// ─── POST /api/orders ────────────────────────────────────────
/**
 * Submit a new cart order.
 * The frontend sends items, subtotal, sessionId, and optional contact info.
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      sessionId, items, subtotal,
      customerName, customerEmail, deliveryAddress,
      notes, tableNumber, orderType,
      isGuest,   // flag sent by frontend when user is not logged in
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // ── Guest delivery validation ─────────────────────────────
    // Dine-in guests provide their name via the table welcome modal — no extra validation needed here.
    // Delivery guests must supply name + address; email is optional.
    if (isGuest && orderType !== 'dine-in') {
      if (!customerName || !customerName.trim()) {
        return res.status(400).json({ success: false, message: 'Please enter your name to continue.' });
      }
      if (!deliveryAddress || !deliveryAddress.trim()) {
        return res.status(400).json({ success: false, message: 'Please enter your delivery address.' });
      }
    }

    // Server-side subtotal recalculation to prevent client tampering
    const serverSubtotal = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    const roundedSubtotal = Math.round(serverSubtotal * 100) / 100;

    const order = await Order.create({
      sessionId,
      items,
      subtotal:        roundedSubtotal,
      customerName:    customerName    || '',
      customerEmail:   customerEmail   || '',
      deliveryAddress: deliveryAddress || '',
      notes:           notes           || '',
      orderType:       orderType       || 'delivery',
      tableNumber:     tableNumber     || '',
    });

    console.log(`[OrderController] [CREATE SUCCESS] Order ID: ${order._id}, Type: ${order.orderType}, Guest: ${!!isGuest}, Email: ${order.customerEmail || '—'}`);

    // Trigger emails in the background (confirmation only sent if email available)
    emailService.sendOrderConfirmationEmail(order).catch(err => {
      console.error('[OrderController] Customer order email failed:', err.message);
    });
    emailService.sendOwnerOrderNotification(order).catch(err => {
      console.error('[OrderController] Owner order notification failed:', err.message);
    });

    res.status(201).json({
      success: true,
      message: orderType === 'dine-in'
        ? "Order sent to the kitchen! Sit back and enjoy."
        : "Order received! We'll start preparing it right away.",
      data: {
        orderId:   order._id,
        subtotal:  order.subtotal,
        itemCount: order.items.reduce((n, i) => n + i.quantity, 0),
        status:    order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/:id ─────────────────────────────────────
/**
 * Retrieve a single order by ID.
 */
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).select('-__v');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders?sessionId= ──────────────────────────────
/**
 * List orders for an anonymous session (order history for the current browser).
 */
export const listOrdersBySession = async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required.' });
    }

    const orders = await Order
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-__v');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/admin/list ──────────────────────────────
/**
 * List all customer orders for the admin dashboard.
 */
export const listAllOrders = async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const orders = await Order
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('-__v');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/orders/:id/status ────────────────────────────
/**
 * Update order status (admin only).
 * Pushes to statusHistory array via Mongoose pre-save hook.
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      console.warn(`[OrderController] [STATUS UPDATE FAILED] Order not found for ID: ${id}`);
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save(); // Saves status change and triggers history log pre-save

    console.log(`[OrderController] [STATUS UPDATE SUCCESS] Order ID: ${id} successfully updated from "${oldStatus}" to "${status}". Customer: ${order.customerName || 'Guest'}, Email: ${order.customerEmail || '—'}`);

    // Trigger status update email in the background
    emailService.sendOrderStatusUpdateEmail(order).catch(err => {
      console.error('[OrderController] Customer status update email failed:', err.message);
    });

    res.json({
      success: true,
      message: `Order status updated to ${status} successfully.`,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

