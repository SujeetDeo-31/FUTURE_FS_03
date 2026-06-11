'use strict';

import nodemailer from 'nodemailer';
import { Resend } from 'resend';

let transporter = null;
let transporterPromise = null;
let isEthereal = false;

/**
 * Creates a nodemailer-compatible transporter backed by the Resend HTTP API.
 * Resend sends emails over HTTPS (port 443) — never blocked by cloud firewalls.
 * @param {string} apiKey - The RESEND_API_KEY environment variable.
 */
function createResendTransporter(apiKey) {
  const resendClient = new Resend(apiKey);
  // FROM_EMAIL must be a Resend-verified domain address (e.g. noreply@yourdomain.com)
  // For testing only, you may use: onboarding@resend.dev
  const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'onboarding@resend.dev';

  return {
    sendMail: async (mailOptions) => {
      const { data, error } = await resendClient.emails.send({
        from: fromEmail,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      if (error) {
        throw new Error(`Resend API error: ${JSON.stringify(error)}`);
      }
      console.log(`[EmailService] ✅ Resend delivery successful. ID: ${data.id}`);
      return { messageId: data.id };
    },
  };
}

// Initialize email transporter with thread-safe caching to prevent concurrent race conditions
async function initTransporter() {
  if (transporter) return transporter;
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    let activeTransporter = null;
    const resendApiKey = process.env.RESEND_API_KEY;

    console.log(`[EmailService] Environment Variables Status:`);
    console.log(`  - RESEND_API_KEY: ${resendApiKey ? 'Present ✅' : 'NOT PRESENT'}`);
    console.log(`  - FROM_EMAIL: ${process.env.FROM_EMAIL || process.env.EMAIL_USER || 'onboarding@resend.dev (default)'}`);

    // ── Priority 1: Resend HTTP API ──────────────────────────────────────────
    // Works on all cloud platforms (Render, Vercel, Railway, etc.)
    // Sends over HTTPS port 443 — completely bypasses SMTP port blocks.
    if (resendApiKey) {
      console.log('[EmailService] Resend API key found. Initializing HTTP email transport...');
      activeTransporter = createResendTransporter(resendApiKey);
      console.log('[EmailService] ✅ Resend transporter ready. Emails will be delivered via HTTPS API.');
    }

    // ── Fallback: Ethereal preview emails ────────────────────────────────────
    // Used automatically when RESEND_API_KEY is not set (local dev / staging).
    // Emails are NOT delivered but can be previewed at https://ethereal.email
    if (!activeTransporter) {
      console.log('[EmailService] No Resend API key. Creating Ethereal preview account...');
      try {
        const testAccount = await nodemailer.createTestAccount();
        isEthereal = true;
        activeTransporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log(`[EmailService] Ethereal test account ready: ${testAccount.user}`);
        console.log(`[EmailService] Preview emails at: https://ethereal.email`);
      } catch (err) {
        console.error('[EmailService] Ethereal failed, using mock logger:', err.message);
        activeTransporter = {
          sendMail: async (options) => {
            console.log('[EmailService MOCK] Would send email:');
            console.log(`  To: ${options.to}`);
            console.log(`  Subject: ${options.subject}`);
            return { messageId: 'mock-id-12345', mock: true };
          }
        };
      }
    }

    return activeTransporter;
  })();

  try {
    transporter = await transporterPromise;
    return transporter;
  } finally {
    transporterPromise = null;
  }
}


// Production-safe site URL — override with SITE_URL env var in deployment
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';

// Global Luxury Styling helper variables
const emailStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #fafaf8;
    margin: 0;
    padding: 0;
    color: #1c1c1e;
  }
  .wrapper {
    width: 100%;
    background-color: #fafaf8;
    padding: 30px 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    border: 1px solid #e4e0da;
  }
  .header {
    background-color: #1d3557;
    padding: 36px 20px;
    text-align: center;
    color: #ffffff;
  }
  .header h1 {
    margin: 10px 0 0 0;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .logo {
    font-size: 36px;
  }
  .content {
    padding: 36px 30px;
  }
  .greeting {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1c1c1e;
  }
  .message {
    font-size: 15px;
    line-height: 1.6;
    color: #48484a;
    margin-bottom: 24px;
  }
  .details-table {
    width: 100%;
    border-collapse: collapse;
    background-color: #f8f6f3;
    border-radius: 12px;
    border: 1px solid #e4e0da;
    margin-bottom: 24px;
  }
  .details-cell-label {
    padding: 12px 16px;
    color: #8a8a8e;
    font-weight: 500;
    font-size: 14px;
    border-bottom: 1px solid #e4e0da;
  }
  .details-cell-value {
    padding: 12px 16px;
    color: #1c1c1e;
    font-weight: 600;
    font-size: 14px;
    text-align: right;
    border-bottom: 1px solid #e4e0da;
  }
  .details-cell-value--status {
    font-weight: 700;
  }
  .footer {
    background-color: #1c1c1e;
    padding: 24px 20px;
    text-align: center;
    color: #8a8a8e;
    font-size: 12px;
    line-height: 1.5;
  }
  .footer a {
    color: #ffffff;
    text-decoration: none;
    font-weight: 600;
  }
  .accent {
    color: #e63946;
  }
`;

/**
 * Send reservation confirmation email
 */
export const sendReservationEmail = async (reservation) => {
  try {
    const client = await initTransporter();
    const formattedDate = new Date(reservation.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reservation Confirmed - One-Bite</title>
        <style>${emailStyles}</style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo">🍔</div>
              <h1>One<span class="accent">-Bite</span></h1>
            </div>
            <div class="content">
              <div class="greeting">Hi ${reservation.name},</div>
              <div class="message">
                Your reservation at One-Bite Indiranagar has been received! Here are your booking details:
              </div>
              
              <table class="details-table">
                <tr>
                  <td class="details-cell-label">Date</td>
                  <td class="details-cell-value">${formattedDate}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Time</td>
                  <td class="details-cell-value">${reservation.time}</td>
                </tr>
                <tr>
                  <td class="details-cell-label" style="border-bottom: none;">Guests</td>
                  <td class="details-cell-value" style="border-bottom: none;">${reservation.guestCount} ${Number(reservation.guestCount) === 1 ? 'Person' : 'People'}</td>
                </tr>
                ${reservation.specialRequests ? `
                <tr>
                  <td class="details-cell-label" style="border-top: 1px dashed #e4e0da; border-bottom: none;">Special Requests</td>
                  <td class="details-cell-value" style="border-top: 1px dashed #e4e0da; border-bottom: none; font-style: italic; color: #48484a;">"${reservation.specialRequests}"</td>
                </tr>
                ` : ''}
              </table>

              <div class="message">
                If you need to modify or cancel your booking, please call us directly at <strong>+91 (80) 4555-0192</strong> or email us at <strong>hello@onebite.in</strong>.
              </div>
              <div class="message" style="margin-bottom: 0;">
                We look forward to giving you an unforgettable culinary experience!
                <br><br>
                Warm regards,<br>
                <strong>Chef Kabir Sen &amp; The One-Bite Team</strong>
              </div>
            </div>
            <div class="footer">
              Plot No. 42, 80 Feet Road, Indiranagar, Bengaluru, KA 560038
              <br><br>
              <a href="${SITE_URL}">Visit Our Website</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const fromAddress = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'onboarding@resend.dev';
    const mailOptions = {
      from: `"One-Bite Restaurant" <${fromAddress}>`,
      to: reservation.email,
      subject: 'Your One-Bite Reservation Confirmation 🍔',
      html: htmlContent,
    };

    const info = await client.sendMail(mailOptions);
    console.log(`[EmailService] Email successfully sent to ${reservation.email}. MessageID: ${info.messageId}`);

    if (isEthereal && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`👉 Preview Ethereal Email: ${previewUrl}`);
    }

    return info;
  } catch (err) {
    console.error('[EmailService] Error occurred sending reservation email:', err.message);
  }
};

/**
 * Send reservation CONFIRMED email
 */
export const sendReservationConfirmedEmail = async (reservation) => {
  try {
    const client = await initTransporter();
    const formattedDate = new Date(reservation.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reservation Confirmed - One-Bite</title>
        <style>
          ${emailStyles}
          .header { background-color: #10b981; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo">🌿</div>
              <h1>One-Bite Confirmed</h1>
            </div>
            <div class="content">
              <div class="greeting">Hi ${reservation.name},</div>
              <div class="message">
                Great news! Your reservation at One-Bite Bengaluru has been <strong>confirmed</strong>. We have saved a perfect table for you. Here are your booking details:
              </div>
              
              <table class="details-table">
                <tr>
                  <td class="details-cell-label">Status</td>
                  <td class="details-cell-value details-cell-value--status" style="color: #10b981;">CONFIRMED</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Date</td>
                  <td class="details-cell-value">${formattedDate}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Time</td>
                  <td class="details-cell-value">${reservation.time}</td>
                </tr>
                <tr>
                  <td class="details-cell-label" style="border-bottom: none;">Guests</td>
                  <td class="details-cell-value" style="border-bottom: none;">${reservation.guestCount} ${Number(reservation.guestCount) === 1 ? 'Person' : 'People'}</td>
                </tr>
                ${reservation.specialRequests ? `
                <tr>
                  <td class="details-cell-label" style="border-top: 1px dashed #e4e0da; border-bottom: none;">Special Requests</td>
                  <td class="details-cell-value" style="border-top: 1px dashed #e4e0da; border-bottom: none; font-style: italic; color: #48484a;">"${reservation.specialRequests}"</td>
                </tr>
                ` : ''}
              </table>

              <div class="message">
                If you need to modify or cancel your booking, please call us at <strong>+91 (80) 4555-0192</strong> or email us at <strong>hello@onebite.in</strong>.
              </div>
              <div class="message" style="margin-bottom: 0;">
                We look forward to giving you an unforgettable culinary experience!
                <br><br>
                Warm regards,<br>
                <strong>Chef Kabir Sen &amp; The One-Bite Team</strong>
              </div>
            </div>
            <div class="footer">
              Plot No. 42, 80 Feet Road, Indiranagar, Bengaluru, KA 560038
              <br><br>
              <a href="${SITE_URL}">Visit Our Website</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const fromAddress = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'onboarding@resend.dev';
    const mailOptions = {
      from: `"One-Bite Restaurant" <${fromAddress}>`,
      to: reservation.email,
      subject: 'Your One-Bite Reservation has been CONFIRMED! 🌿',
      html: htmlContent,
    };

    const info = await client.sendMail(mailOptions);
    console.log(`[EmailService] Confirmed Email sent to ${reservation.email}. MessageID: ${info.messageId}`);
    if (isEthereal && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`👉 Confirmed Email Preview: ${previewUrl}`);
    }
    return info;
  } catch (err) {
    console.error('[EmailService] Error sending reservation confirmed email:', err.message);
  }
};

/**
 * Send reservation REJECTED email
 */
export const sendReservationRejectedEmail = async (reservation) => {
  try {
    const client = await initTransporter();
    const formattedDate = new Date(reservation.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reservation Update - One-Bite</title>
        <style>
          ${emailStyles}
          .header { background-color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo">🍽️</div>
              <h1>Reservation Update</h1>
            </div>
            <div class="content">
              <div class="greeting">Hi ${reservation.name},</div>
              <div class="message">
                Thank you for requesting a reservation at One-Bite Bengaluru. 
              </div>
              <div class="message">
                Unfortunately, we are fully booked during your requested slot on <strong>${formattedDate}</strong> at <strong>${reservation.time}</strong>. We sincerely apologize for any inconvenience caused.
              </div>
              
              <table class="details-table">
                <tr>
                  <td class="details-cell-label">Status</td>
                  <td class="details-cell-value details-cell-value--status" style="color: #ef4444;">FULLY BOOKED</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Requested Date</td>
                  <td class="details-cell-value">${formattedDate}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Requested Time</td>
                  <td class="details-cell-value">${reservation.time}</td>
                </tr>
                <tr>
                  <td class="details-cell-label" style="border-bottom: none;">Guests</td>
                  <td class="details-cell-value" style="border-bottom: none;">${reservation.guestCount} People</td>
                </tr>
              </table>

              <div class="message">
                We would love to host you on another date or at a different time! Please check available timing options on our website, or feel free to call us at <strong>+91 (80) 4555-0192</strong>.
              </div>
              <div class="message" style="margin-bottom: 0;">
                Thank you for your understanding. We hope to see you soon!
                <br><br>
                Warm regards,<br>
                <strong>Chef Kabir Sen &amp; The One-Bite Team</strong>
              </div>
            </div>
            <div class="footer">
              Plot No. 42, 80 Feet Road, Indiranagar, Bengaluru, KA 560038
              <br><br>
              <a href="${SITE_URL}">View Available Tables</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const fromAddress = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'onboarding@resend.dev';
    const mailOptions = {
      from: `"One-Bite Restaurant" <${fromAddress}>`,
      to: reservation.email,
      subject: 'One-Bite Reservation Update: Fully Booked 🍽️',
      html: htmlContent,
    };

    const info = await client.sendMail(mailOptions);
    console.log(`[EmailService] Rejected Email sent to ${reservation.email}. MessageID: ${info.messageId}`);
    if (isEthereal && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`👉 Rejected Email Preview: ${previewUrl}`);
    }
    return info;
  } catch (err) {
    console.error('[EmailService] Error sending reservation rejected email:', err.message);
  }
};

/**
 * Send reservation CANCELLED email
 */
export const sendReservationCancelledEmail = async (reservation) => {
  try {
    const client = await initTransporter();
    const formattedDate = new Date(reservation.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reservation Cancelled - One-Bite</title>
        <style>
          ${emailStyles}
          .header { background-color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo">🧹</div>
              <h1>Reservation Cancelled</h1>
            </div>
            <div class="content">
              <div class="greeting">Hi ${reservation.name},</div>
              <div class="message">
                Your reservation at One-Bite Indiranagar has been <strong>cancelled</strong>. Here are the booking details:
              </div>
              
              <table class="details-table">
                <tr>
                  <td class="details-cell-label">Status</td>
                  <td class="details-cell-value details-cell-value--status" style="color: #4b5563;">CANCELLED</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Date</td>
                  <td class="details-cell-value">${formattedDate}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Time</td>
                  <td class="details-cell-value">${reservation.time}</td>
                </tr>
                <tr>
                  <td class="details-cell-label" style="border-bottom: none;">Guests</td>
                  <td class="details-cell-value" style="border-bottom: none;">${reservation.guestCount} People</td>
                </tr>
              </table>

              <div class="message">
                If you did not request this cancellation or would like to reschedule, please call us directly at <strong>+91 (80) 4555-0192</strong> or reserve another slot on our website.
              </div>
              <div class="message" style="margin-bottom: 0;">
                We hope to have the pleasure of serving you in the future.
                <br><br>
                Warm regards,<br>
                <strong>Chef Kabir Sen &amp; The One-Bite Team</strong>
              </div>
            </div>
            <div class="footer">
              Plot No. 42, 80 Feet Road, Indiranagar, Bengaluru, KA 560038
              <br><br>
              <a href="${SITE_URL}">Make a New Reservation</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const fromAddress = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'onboarding@resend.dev';
    const mailOptions = {
      from: `"One-Bite Restaurant" <${fromAddress}>`,
      to: reservation.email,
      subject: 'One-Bite Reservation Cancelled 🧹',
      html: htmlContent,
    };

    const info = await client.sendMail(mailOptions);
    console.log(`[EmailService] Cancelled Email sent to ${reservation.email}. MessageID: ${info.messageId}`);
    if (isEthereal && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`👉 Cancelled Email Preview: ${previewUrl}`);
    }
    return info;
  } catch (err) {
    console.error('[EmailService] Error sending reservation cancelled email:', err.message);
  }
};

/**
 * Send "New Reservation Request Received" alert to restaurant owner (EMAIL_USER)
 */
export const sendOwnerReservationNotification = async (reservation) => {
  try {
    const client = await initTransporter();
    const formattedDate = new Date(reservation.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Request Alert</title>
        <style>${emailStyles}</style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo">🔔</div>
              <h1>New Booking Alert</h1>
            </div>
            <div class="content">
              <div class="greeting">Hello Chef Kabir Sen,</div>
              <div class="message">
                A customer has just submitted a new table reservation request on the website. Here are the booking details:
              </div>
              
              <table class="details-table">
                <tr>
                  <td class="details-cell-label">Customer Name</td>
                  <td class="details-cell-value">${reservation.name}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Email Address</td>
                  <td class="details-cell-value">${reservation.email}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Phone Number</td>
                  <td class="details-cell-value">${reservation.phone}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Date Requested</td>
                  <td class="details-cell-value">${formattedDate}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Time Requested</td>
                  <td class="details-cell-value">${reservation.time}</td>
                </tr>
                <tr>
                  <td class="details-cell-label" style="border-bottom: none;">Guest Count</td>
                  <td class="details-cell-value" style="border-bottom: none;">${reservation.guestCount} People</td>
                </tr>
                ${reservation.specialRequests ? `
                <tr>
                  <td class="details-cell-label" style="border-top: 1px dashed #e4e0da; border-bottom: none;">Special Requests</td>
                  <td class="details-cell-value" style="border-top: 1px dashed #e4e0da; border-bottom: none; font-style: italic;">"${reservation.specialRequests}"</td>
                </tr>
                ` : ''}
              </table>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}" style="display: inline-block; background-color: #e63946; color: #ffffff !important; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(230, 57, 70, 0.25);">
                  Open Admin Dashboard
                </a>
              </div>
            </div>
            <div class="footer">
              One-Bite Restaurant Full-Stack Notification System
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const ownerEmail = process.env.OWNER_EMAIL || process.env.EMAIL_USER;
    if (!ownerEmail) {
      console.warn('[EmailService] ⚠️ Skipping owner reservation alert email because neither OWNER_EMAIL nor EMAIL_USER is configured in environment variables.');
      return null;
    }

    const fromAddress = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'onboarding@resend.dev';
    const mailOptions = {
      from: `"One-Bite System" <${fromAddress}>`,
      to: ownerEmail,
      subject: `🔔 New Reservation Alert — ${reservation.name} [${reservation.guestCount} Guests]`,
      html: htmlContent,
    };

    const info = await client.sendMail(mailOptions);
    console.log(`[EmailService] Owner Reservation Notification email successfully sent. MessageID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('[EmailService] Error occurred sending owner reservation email alert:', err.message);
  }
};

/**
 * Send customer order confirmation email (GST & items breakdown)
 */
export const sendOrderConfirmationEmail = async (order) => {
  try {
    const client = await initTransporter();
    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsRows = order.items.map(item => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px dashed #e4e0da; font-size: 14px; color: #1c1c1e;">
          <strong>${item.quantity}×</strong> ${item.name}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px dashed #e4e0da; font-size: 14px; text-align: right; font-weight: 600; color: #1c1c1e;">
          ₹${item.price * item.quantity}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Placed Successfully</title>
        <style>${emailStyles}</style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header" style="background-color: ${order.orderType === 'dine-in' ? '#1a1a2e' : '#1d3557'};">
              <div class="logo">${order.orderType === 'dine-in' ? '🪑' : '🍕'}</div>
              <h1>${order.orderType === 'dine-in' ? 'Dine-In Order Confirmed!' : 'Order Confirmed!'}</h1>
            </div>
            <div class="content">
              <div class="greeting">Hi ${order.customerName || 'Valued Customer'},</div>
              <div class="message">
                ${order.orderType === 'dine-in'
                  ? `Your dine-in order for <strong>Table ${order.tableNumber}</strong> has been received! Our kitchen is starting preparation right away.`
                  : 'Thank you for your order! We are starting to prepare your tandoori items immediately. Here is your detailed invoice summary:'
                }
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr style="border-bottom: 1px solid #1c1c1e;">
                    <th style="text-align: left; padding: 6px 0; font-size: 12px; text-transform: uppercase; color: #8a8a8e; font-weight: bold;">Items Details</th>
                    <th style="text-align: right; padding: 6px 0; font-size: 12px; text-transform: uppercase; color: #8a8a8e; font-weight: bold;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <table class="details-table">
                <tr>
                  <td class="details-cell-label">Order Reference</td>
                  <td class="details-cell-value" style="font-family: monospace; font-size: 13px; font-weight: bold;">#${order._id.toString().slice(-6).toUpperCase()}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Order Type</td>
                  <td class="details-cell-value" style="font-weight: 700; color: ${order.orderType === 'dine-in' ? '#7c3aed' : '#ea580c'};">${ order.orderType === 'dine-in' ? '🪑 DINE-IN' : '🛵 DELIVERY'}</td>
                </tr>
                ${order.orderType === 'dine-in' ? `
                <tr>
                  <td class="details-cell-label">Table</td>
                  <td class="details-cell-value" style="font-weight: 700;">Table ${order.tableNumber}</td>
                </tr>` : ''}
                ${order.deliveryAddress ? `
                <tr>
                  <td class="details-cell-label">Delivery Address</td>
                  <td class="details-cell-value">${order.deliveryAddress}</td>
                </tr>` : ''}
                <tr>
                  <td class="details-cell-label">Ordered On</td>
                  <td class="details-cell-value">${formattedDate}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">GST &amp; SGST (5%)</td>
                  <td class="details-cell-value">₹${Math.round(order.subtotal * 0.05)}</td>
                </tr>
                <tr>
                  <td class="details-cell-label" style="border-bottom: none;">Total Payable</td>
                  <td class="details-cell-value" style="border-bottom: none; color: #e63946; font-size: 16px; font-weight: 700;">₹${order.subtotal + Math.round(order.subtotal * 0.05)}</td>
                </tr>
                ${order.notes ? `
                <tr>
                  <td class="details-cell-label" style="border-top: 1px dashed #e4e0da; border-bottom: none;">Cooking Instructions</td>
                  <td class="details-cell-value" style="border-top: 1px dashed #e4e0da; border-bottom: none; font-style: italic; color: #48484a;">"${order.notes}"</td>
                </tr>
                ` : ''}
              </table>

              <div class="message">
                You can live-track your order preparation stage inside the <strong>Account drawer</strong> on our website.
              </div>
              <div class="message" style="margin-bottom: 0;">
                If you have any questions, call us directly at <strong>+91 (80) 4555-0192</strong>.
                <br><br>
                Warm regards,<br>
                <strong>Chef Kabir Sen &amp; The One-Bite Team</strong>
              </div>
            </div>
            <div class="footer">
              Plot No. 42, 80 Feet Road, Indiranagar, Bengaluru, KA 560038
              <br><br>
              <a href="${SITE_URL}">Track Order Status</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Only send if we have a customer email address mapped
    if (order.customerEmail) {
      const fromAddress = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'onboarding@resend.dev';
      const mailOptions = {
        from: `"One-Bite Restaurant" <${fromAddress}>`,
        to: order.customerEmail,
        subject: `Your One-Bite Order Invoice Summary — #${order._id.toString().slice(-6).toUpperCase()} 🍕`,
        html: htmlContent,
      };

      const info = await client.sendMail(mailOptions);
      console.log(`[EmailService] Customer Order Confirmation Email sent to ${order.customerEmail}. MessageID: ${info.messageId}`);
      if (isEthereal && info.messageId) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`👉 Order Email Preview: ${previewUrl}`);
      }
      return info;
    }
  } catch (err) {
    console.error('[EmailService] Error occurred sending customer order confirmation email:', err.message);
  }
};

/**
 * Send "New Customer Order Alert" notification email to restaurant owner (EMAIL_USER)
 */
export const sendOwnerOrderNotification = async (order) => {
  try {
    const client = await initTransporter();
    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsSummary = order.items.map(item => `• ${item.quantity}× ${item.name}`).join('<br>');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Alert</title>
        <style>${emailStyles}</style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo">${order.orderType === 'dine-in' ? '🪑' : '🔔'}</div>
              <h1>${order.orderType === 'dine-in' ? 'New Dine-In Order' : 'New Delivery Order'}</h1>
            </div>
            <div class="content">
              <div class="greeting">Hello Chef Kabir Sen,</div>
              <div class="message">
                ${ order.orderType === 'dine-in'
                  ? `A dine-in order has just been placed for <strong>Table ${order.tableNumber}</strong>. Details are below:`
                  : 'A customer has just submitted a new delivery order! Details are below:'
                }
              </div>
              
              <table class="details-table">
                <tr>
                  <td class="details-cell-label">Order Reference</td>
                  <td class="details-cell-value" style="font-family: monospace; font-size: 13px; font-weight: bold;">#${order._id.toString().slice(-6).toUpperCase()}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Order Type</td>
                  <td class="details-cell-value" style="font-weight: 700; color: ${order.orderType === 'dine-in' ? '#7c3aed' : '#ea580c'};">${ order.orderType === 'dine-in' ? '🪑 DINE-IN' : '🛵 DELIVERY'}</td>
                </tr>
                ${order.orderType === 'dine-in' ? `
                <tr>
                  <td class="details-cell-label">Table</td>
                  <td class="details-cell-value" style="font-weight: 700;">Table ${order.tableNumber}</td>
                </tr>` : ''}
                <tr>
                  <td class="details-cell-label">Customer Name</td>
                  <td class="details-cell-value">${order.customerName || 'Guest'}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Email Address</td>
                  <td class="details-cell-value">${order.customerEmail || '—'}</td>
                </tr>
                ${order.deliveryAddress ? `
                <tr>
                  <td class="details-cell-label">Delivery Address</td>
                  <td class="details-cell-value" style="font-weight: 600;">${order.deliveryAddress}</td>
                </tr>` : ''}
                <tr>
                  <td class="details-cell-label">Ordered On</td>
                  <td class="details-cell-value">${formattedDate}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Order Items</td>
                  <td class="details-cell-value" style="text-align: right; line-height: 1.4;">${itemsSummary}</td>
                </tr>
                <tr>
                  <td class="details-cell-label" style="border-bottom: none;">Total Invoice Amount</td>
                  <td class="details-cell-value" style="border-bottom: none; color: #e63946; font-size: 15px; font-weight: bold;">₹${order.subtotal + Math.round(order.subtotal * 0.05)}</td>
                </tr>
                ${order.notes ? `
                <tr>
                  <td class="details-cell-label" style="border-top: 1px dashed #e4e0da; border-bottom: none;">Cooking Instructions</td>
                  <td class="details-cell-value" style="border-top: 1px dashed #e4e0da; border-bottom: none; font-style: italic; color: #48484a;">"${order.notes}"</td>
                </tr>
                ` : ''}
              </table>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}" style="display: inline-block; background-color: #e63946; color: #ffffff !important; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(230, 57, 70, 0.25);">
                  Open Kitchen Console
                </a>
              </div>
            </div>
            <div class="footer">
              One-Bite Restaurant Full-Stack Notification System
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const ownerEmail = process.env.OWNER_EMAIL || process.env.EMAIL_USER;
    if (!ownerEmail) {
      console.warn('[EmailService] ⚠️ Skipping owner order alert email because neither OWNER_EMAIL nor EMAIL_USER is configured in environment variables.');
      return null;
    }

    const fromAddress = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'onboarding@resend.dev';
    const mailOptions = {
      from: `"One-Bite System" <${fromAddress}>`,
      to: ownerEmail,
      subject: `🔔 New Order Placed — #${order._id.toString().slice(-6).toUpperCase()} [₹${order.subtotal + Math.round(order.subtotal * 0.05)}]`,
      html: htmlContent,
    };

    const info = await client.sendMail(mailOptions);
    console.log(`[EmailService] Owner Order Notification email successfully sent. MessageID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('[EmailService] Error occurred sending owner order alert email:', err.message);
  }
};

/**
 * Send customer order STATUS UPDATE email.
 * Dine-in: fires on completed + cancelled only.
 * Delivery: fires on received, out for delivery, cancelled.
 */
export const sendOrderStatusUpdateEmail = async (order) => {
  try {
    // Dine-in orders: only email on completed or cancelled (no delivery stages)
    // Delivery orders: email on received, out for delivery, cancelled
    const allowedStatuses = order.orderType === 'dine-in'
      ? ['completed', 'cancelled']
      : ['received', 'out for delivery', 'cancelled'];

    if (!allowedStatuses.includes(order.status)) {
      console.log(`[EmailService] Skipping order status email for "${order.status}" (orderType: ${order.orderType || 'delivery'}).`);
      return null;
    }

    const client = await initTransporter();
    const formattedDate = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const statusHeaderColors = {
      'received':         '#1d3557',
      'preparing':        '#7c3aed',
      'out for delivery': '#ea580c',
      'completed':        '#2563eb',
      'cancelled':        '#ef4444',
    };

    const statusIcon = {
      'received':         '🍕',
      'preparing':        '🔥',
      'out for delivery': '🛵',
      'completed':        '🎉',
      'cancelled':        '🧹',
    }[order.status] || '🍔';

    const statusColors = {
      'received':         '#1d3557',
      'preparing':        '#7c3aed',
      'out for delivery': '#ea580c',
      'completed':        '#10b981',
      'cancelled':        '#ef4444',
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Updated</title>
        <style>${emailStyles}</style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header" style="background-color: ${statusHeaderColors[order.status] || '#1d3557'};">
              <div class="logo">${statusIcon}</div>
              <h1>Order Status Update</h1>
            </div>
            <div class="content">
              <div class="greeting">Hi ${order.customerName || 'Valued Customer'},</div>
              <div class="message">
                Your order is moving along! The kitchen console has updated the status of your order:
              </div>
              
              <table class="details-table">
                <tr>
                  <td class="details-cell-label">Order Reference</td>
                  <td class="details-cell-value" style="font-family: monospace; font-size: 13px; font-weight: bold;">#${order._id.toString().slice(-6).toUpperCase()}</td>
                </tr>
                <tr>
                  <td class="details-cell-label">Status Update</td>
                  <td class="details-cell-value details-cell-value--status" style="color: ${statusColors[order.status] || '#1c1c1e'};">${order.status.toUpperCase()}</td>
                </tr>
                <tr>
                  <td class="details-cell-label" style="border-bottom: none;">Last Updated</td>
                  <td class="details-cell-value" style="border-bottom: none;">${formattedDate}</td>
                </tr>
              </table>

              <div class="message">
                Our kitchen matches the highest food safety standards, and Chef Kabir Sen is ensuring every spice is perfectly curated. Keep tracking live updates in the Account panel of our website!
              </div>
              <div class="message" style="margin-bottom: 0;">
                Warm regards,<br>
                <strong>Chef Kabir Sen &amp; The One-Bite Team</strong>
              </div>
            </div>
            <div class="footer">
              Plot No. 42, 80 Feet Road, Indiranagar, Bengaluru, KA 560038
              <br><br>
              <a href="${SITE_URL}">Check Real-Time Progress</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Only send if we have a customer email address mapped
    if (order.customerEmail) {
      const fromAddress = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'onboarding@resend.dev';
      const mailOptions = {
        from: `"One-Bite Restaurant" <${fromAddress}>`,
        to: order.customerEmail,
        subject: `One-Bite Order Update: ${order.status.toUpperCase()} ${statusIcon} — #${order._id.toString().slice(-6).toUpperCase()}`,
        html: htmlContent,
      };

      const info = await client.sendMail(mailOptions);
      console.log(`[EmailService] Customer Order Status Update Email sent to ${order.customerEmail}. MessageID: ${info.messageId}`);
      return info;
    }
  } catch (err) {
    console.error('[EmailService] Error occurred sending customer status update email:', err.message);
  }
};
