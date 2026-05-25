'use strict';

import Reservation from '../models/Reservation.js';
import * as emailService from '../services/emailService.js';

// ─── POST /api/reservations ──────────────────────────────────
/**
 * Create a new reservation.
 * Performs duplicate check: same email + date + time cannot be booked twice.
 */
export const createReservation = async (req, res, next) => {
  try {
    const { name, email, phone, guestCount, date, time, specialRequests } = req.body;

    // Validate that the date is not in the past
    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Reservation date cannot be in the past.',
      });
    }

    // Duplicate detection — same email, date, and time slot
    const duplicate = await Reservation.findOne({ email, date, time });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'A reservation for this email already exists at the selected date and time. Please choose a different slot or contact us.',
      });
    }

    const reservation = await Reservation.create({
      name,
      email,
      phone,
      guestCount,
      date,
      time,
      specialRequests: specialRequests || '',
      status: 'pending',
    });

    console.log(`[ReservationController] [CREATE SUCCESS] New reservation created. ID: ${reservation._id}, Guest: ${reservation.name}, Email: ${reservation.email}, Date: ${reservation.date}, Time: ${reservation.time}, Status: pending`);

    // Trigger emails in the background
    emailService.sendReservationEmail(reservation).catch(err => {
      console.error('[ReservationController] Customer booking email failed:', err.message);
    });
    emailService.sendOwnerReservationNotification(reservation).catch(err => {
      console.error('[ReservationController] Owner booking notification failed:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Your booking request has been submitted and is awaiting restaurant confirmation.',
      data: {
        id:    reservation._id,
        name:  reservation.name,
        date:  reservation.date,
        time:  reservation.time,
        guests: reservation.guestCount,
        status: reservation.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/reservations/:id/status ──────────────────────
/**
 * Update reservation status (admin only).
 * Triggers specific status email notifications in the background.
 */
export const updateReservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      console.warn(`[ReservationController] [STATUS UPDATE FAILED] Reservation not found for ID: ${id}`);
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const oldStatus = reservation.status;
    reservation.status = status;
    await reservation.save();

    console.log(`[ReservationController] [STATUS UPDATE SUCCESS] Reservation ID: ${id} successfully updated from "${oldStatus}" to "${status}". Guest: ${reservation.name}, Email: ${reservation.email}`);

    // Trigger emails in the background
    if (status === 'confirmed') {
      emailService.sendReservationConfirmedEmail(reservation).catch(err => {
        console.error('[ReservationController] Failed to send confirmed email:', err.message);
      });
    } else if (status === 'rejected') {
      emailService.sendReservationRejectedEmail(reservation).catch(err => {
        console.error('[ReservationController] Failed to send rejected email:', err.message);
      });
    } else if (status === 'cancelled') {
      emailService.sendReservationCancelledEmail(reservation).catch(err => {
        console.error('[ReservationController] Failed to send cancelled email:', err.message);
      });
    }

    res.json({
      success: true,
      message: `Reservation status updated to ${status} successfully.`,
      data: reservation,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/reservations/check ─────────────────────────────
/**
 * Check if a time slot is already taken for a given email.
 * Query params: ?email=&date=&time=
 */
export const checkAvailability = async (req, res, next) => {
  try {
    const { email, date, time } = req.query;
    if (!email || !date || !time) {
      return res.status(400).json({ success: false, message: 'Missing query parameters: email, date, time.' });
    }

    const exists = await Reservation.exists({ email, date, time });
    res.json({ success: true, available: !exists });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/reservations ───────────────────────────────────
/**
 * List reservations (admin / internal use).
 * In production this should be protected by auth middleware.
 */
export const listReservations = async (req, res, next) => {
  try {
    const { date, status, limit = 50 } = req.query;
    const filter = {};
    if (date)   filter.date   = date;
    if (status) filter.status = status;

    const reservations = await Reservation
      .find(filter)
      .sort({ date: -1, time: -1 }) // Sort latest reservations first
      .limit(Number(limit))
      .select('-__v');

    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (err) {
    next(err);
  }
};
