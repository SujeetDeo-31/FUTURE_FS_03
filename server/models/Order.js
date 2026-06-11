'use strict';

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    itemId:   { type: Number, required: true },
    name:     { type: String, required: true, trim: true },
    price:    { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 20 },
  },
  { _id: false } // no separate _id for embedded items
);

const orderSchema = new mongoose.Schema(
  {
    // Anonymous session identifier from localStorage
    sessionId: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: arr => arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    status: {
      type: String,
      enum: ['received', 'preparing', 'out for delivery', 'completed', 'cancelled'],
      default: 'received',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now }
      }
    ],
    // Customer contact for order follow-up (optional at this stage)
    customerName:    { type: String, trim: true, default: '' },
    customerEmail:   { type: String, trim: true, lowercase: true, default: '' },
    deliveryAddress: { type: String, trim: true, maxlength: 400, default: '' },
    notes:           { type: String, trim: true, maxlength: 300, default: '' },
    // Dine-in / QR table ordering fields
    orderType:   { type: String, enum: ['delivery', 'dine-in'], default: 'delivery' },
    tableNumber: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to automatically push to status history
orderSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('status')) {
    this.statusHistory.push({ status: this.status, updatedAt: new Date() });
  }
  next();
});

// Index for looking up orders by sessionId
orderSchema.index({ sessionId: 1 });
orderSchema.index({ createdAt: -1 }); // latest orders first

const Order = mongoose.model('Order', orderSchema);

export default Order;
