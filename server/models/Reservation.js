'use strict';

import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be under 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[\d\s+\-().]{7,20}$/, 'Invalid phone number'],
    },
    guestCount: {
      type: String,
      required: [true, 'Guest count is required'],
      enum: { values: ['1', '2', '3', '4', '5', '6+'], message: 'Invalid guest count' },
    },
    date: {
      type: String, // stored as YYYY-MM-DD string for simplicity
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [500, 'Special requests must be under 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Compound index to efficiently detect duplicate reservations
reservationSchema.index({ email: 1, date: 1, time: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;
