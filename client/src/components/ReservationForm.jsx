import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createReservation } from '../api/reservations';

export default function ReservationForm() {
  const { user } = useAuth();
  
  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [specialReq, setSpecialReq] = useState('');

  // Field touch/error states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const dateInputRef = useRef(null);

  // Local min date bounds calculation
  const [minDateString, setMinDateString] = useState('');

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setMinDateString(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Autofill name and email if user logs in
  useEffect(() => {
    if (user) {
      setName(prev => prev || user.name || '');
      setEmail(prev => prev || user.email || '');
    } else {
      setName('');
      setEmail('');
    }
  }, [user]);

  // Validation checkers
  const validateField = (fieldName, value) => {
    let error = '';
    switch (fieldName) {
      case 'name':
        if (!value.trim()) error = 'Please enter your full name.';
        else if (value.trim().length < 2) error = 'Please enter your full name (at least 2 characters).';
        break;
      case 'email':
        if (!value.trim()) error = 'Please enter your email address.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) error = 'Please enter a valid email address.';
        break;
      case 'phone':
        if (!value.trim()) error = 'Please enter your phone number.';
        else if (!/^[\d\s+\-().]{7,20}$/.test(value.trim())) error = 'Please enter a valid phone number.';
        break;
      case 'guests':
        if (!value) error = 'Please select the number of guests.';
        break;
      case 'date':
        if (!value) error = 'Please select a reservation date.';
        else {
          const d = new Date(value);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          if (isNaN(d.getTime()) || d < now) {
            error = 'Please select today or a future date.';
          }
        }
        break;
      case 'time':
        if (!value) error = 'Please select a time slot.';
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (fieldName, value) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleChange = (fieldName, value, setter) => {
    setter(value);
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  // Click handler to open date picker on clicking anywhere in input
  const handleDateClick = () => {
    try {
      if (dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      }
    } catch (err) {
      console.warn('[ReservationForm] showPicker is not supported or blocked:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Trigger validation on all fields
    const formValues = { name, email, phone, guests, date, time };
    const newErrors = {};
    const newTouched = {};

    Object.keys(formValues).forEach(key => {
      newTouched[key] = true;
      const error = validateField(key, formValues[key]);
      if (error) newErrors[key] = error;
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Focus the first error input
      const firstErrorKey = Object.keys(newErrors)[0];
      const elementId = {
        name: 'guestName',
        email: 'guestEmail',
        phone: 'guestPhone',
        guests: 'guestCount',
        date: 'resDate',
        time: 'resTime'
      }[firstErrorKey];
      document.getElementById(elementId)?.focus();
      return;
    }

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      guestCount: guests,
      date,
      time,
      specialRequests: specialReq.trim(),
    };

    try {
      await createReservation(payload);
      setSuccess(true);
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    // Reset inputs
    setPhone('');
    setGuests('');
    setDate('');
    setTime('');
    setSpecialReq('');
    
    // Maintain user values if logged in, clear otherwise
    if (!user) {
      setName('');
      setEmail('');
    }

    setErrors({});
    setTouched({});
    setSuccess(false);
    setApiError('');
  };

  return (
    <section className="section reservation-section" id="reservation" aria-label="Reservation and contact">
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="eyebrow">Book a Table</span>
          <h2 className="section-title">Join Us for a Meal</h2>
          <p className="section-sub">Reserve online — your booking is confirmed instantly.</p>
        </div>

        <div className="reservation-grid">
          {/* Reservation form card */}
          <div className="form-card" data-reveal>
            <h3 className="form-card__title">Make a Reservation</h3>

            {/* API error banner */}
            {apiError && (
              <div className="form-api-error" id="formApiError" role="alert">
                {apiError}
              </div>
            )}

            {!success ? (
              <form id="reservationForm" className="res-form" noValidate onSubmit={handleSubmit} aria-label="Table reservation form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="guestName">Full name <span aria-hidden="true">*</span></label>
                    <input
                      className={`form-input ${errors.name ? 'is-error' : ''}`}
                      type="text"
                      id="guestName"
                      placeholder="Priya Nair"
                      value={name}
                      onChange={(e) => handleChange('name', e.target.value, setName)}
                      onBlur={(e) => handleBlur('name', e.target.value)}
                      required
                      autoComplete="name"
                      disabled={submitting}
                    />
                    {errors.name && <span className="form-error" role="alert">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="guestEmail">Email <span aria-hidden="true">*</span></label>
                    <input
                      className={`form-input ${errors.email ? 'is-error' : ''}`}
                      type="email"
                      id="guestEmail"
                      placeholder="priya@example.com"
                      value={email}
                      onChange={(e) => handleChange('email', e.target.value, setEmail)}
                      onBlur={(e) => handleBlur('email', e.target.value)}
                      required
                      autoComplete="email"
                      disabled={submitting}
                    />
                    {errors.email && <span className="form-error" role="alert">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="guestPhone">Phone <span aria-hidden="true">*</span></label>
                    <input
                      className={`form-input ${errors.phone ? 'is-error' : ''}`}
                      type="tel"
                      id="guestPhone"
                      placeholder="+91 98765-43210"
                      value={phone}
                      onChange={(e) => handleChange('phone', e.target.value, setPhone)}
                      onBlur={(e) => handleBlur('phone', e.target.value)}
                      required
                      autoComplete="tel"
                      disabled={submitting}
                    />
                    {errors.phone && <span className="form-error" role="alert">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="guestCount">Guests <span aria-hidden="true">*</span></label>
                    <select
                      className={`form-input form-select ${errors.guests ? 'is-error' : ''}`}
                      id="guestCount"
                      value={guests}
                      onChange={(e) => handleChange('guests', e.target.value, setGuests)}
                      onBlur={(e) => handleBlur('guests', e.target.value)}
                      required
                      disabled={submitting}
                    >
                      <option value="">Select</option>
                      <option value="1">1 person</option>
                      <option value="2">2 people</option>
                      <option value="3">3 people</option>
                      <option value="4">4 people</option>
                      <option value="5">5 people</option>
                      <option value="6+">6+ people</option>
                    </select>
                    {errors.guests && <span className="form-error" role="alert">{errors.guests}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="resDate">Date <span aria-hidden="true">*</span></label>
                    <input
                      ref={dateInputRef}
                      className={`form-input ${errors.date ? 'is-error' : ''}`}
                      type="date"
                      id="resDate"
                      min={minDateString}
                      value={date}
                      onChange={(e) => handleChange('date', e.target.value, setDate)}
                      onBlur={(e) => handleBlur('date', e.target.value)}
                      onClick={handleDateClick}
                      required
                      disabled={submitting}
                      style={{ cursor: 'pointer' }}
                    />
                    {errors.date && <span className="form-error" role="alert">{errors.date}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="resTime">Time <span aria-hidden="true">*</span></label>
                    <select
                      className={`form-input form-select ${errors.time ? 'is-error' : ''}`}
                      id="resTime"
                      value={time}
                      onChange={(e) => handleChange('time', e.target.value, setTime)}
                      onBlur={(e) => handleBlur('time', e.target.value)}
                      required
                      disabled={submitting}
                    >
                      <option value="">Select</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="21:00">9:00 PM</option>
                    </select>
                    {errors.time && <span className="form-error" role="alert">{errors.time}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="specialReq">
                    Special requests <span className="form-label--opt">(optional)</span>
                  </label>
                  <textarea
                    className="form-input form-textarea"
                    id="specialReq"
                    placeholder="Dietary requirements, special occasions, seating preferences…"
                    rows="3"
                    value={specialReq}
                    onChange={(e) => setSpecialReq(e.target.value)}
                    disabled={submitting}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn--primary btn--full" id="submitReservation" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner" style={{ borderLeftColor: 'white' }}></span>
                      Submitting Booking...
                    </>
                  ) : (
                    <>
                      Confirm Reservation
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="form-success" id="formSuccess" role="alert">
                <div className="form-success__icon" aria-hidden="true">✅</div>
                <h4 className="form-success__title">Booking Request Submitted!</h4>
                <p className="form-success__msg" id="formSuccessMsg">
                  Your booking request has been submitted and is awaiting restaurant confirmation.
                </p>
                <button className="btn btn--outline btn--sm" id="newReservation" onClick={handleResetForm}>
                  Make another booking
                </button>
              </div>
            )}
          </div>

          {/* Contact info card */}
          <div className="contact-card" data-reveal>
            <h3 className="form-card__title">Visit Us</h3>
            <ul className="contact-list" aria-label="Contact information">
              <li className="contact-item">
                <span className="contact-item__icon" aria-hidden="true">📍</span>
                <div>
                  <strong className="contact-item__label">Address</strong>
                  <span className="contact-item__value">Plot No. 42, 80 Feet Road, Indiranagar<br />Bengaluru, Karnataka 560038</span>
                </div>
              </li>
              <li className="contact-item">
                <span className="contact-item__icon" aria-hidden="true">📞</span>
                <div>
                  <strong className="contact-item__label">Phone</strong>
                  <a href="tel:+918045550192" className="contact-item__value contact-item__link">+91 (80) 4555-0192</a>
                </div>
              </li>
              <li className="contact-item">
                <span className="contact-item__icon" aria-hidden="true">✉️</span>
                <div>
                  <strong className="contact-item__label">Email</strong>
                  <a href="mailto:hello@onebite.in" className="contact-item__value contact-item__link">hello@onebite.in</a>
                </div>
              </li>
              <li className="contact-item">
                <span className="contact-item__icon" aria-hidden="true">🕐</span>
                <div>
                  <strong className="contact-item__label">Hours</strong>
                  <div className="contact-item__value">
                    <div>Mon – Fri &nbsp;11:00 AM – 10:00 PM</div>
                    <div>Sat – Sun &nbsp;10:00 AM – 11:00 PM</div>
                  </div>
                </div>
              </li>
            </ul>
            <div className="map-block" role="img" aria-label="Location: Plot No. 42, 80 Feet Road, Indiranagar, Bengaluru">
              <div className="map-block__inner">
                <span className="map-block__pin" aria-hidden="true">📍</span>
                <div>
                  <div className="map-block__title">Plot No. 42, 80 Feet Road</div>
                  <div className="map-block__sub">Indiranagar · Bengaluru, KA 560038</div>
                </div>
              </div>
            </div>
            <div className="social-row" aria-label="Social media">
              <a href="#" className="social-btn" aria-label="One-Bite on Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="social-btn" aria-label="One-Bite on TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.83 1.55V6.79a4.85 4.85 0 01-1.06-.1z"/></svg>
              </a>
              <a href="#" className="social-btn" aria-label="One-Bite on Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
