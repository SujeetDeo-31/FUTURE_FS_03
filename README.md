# 🍔 One-Bite Pro — Unified Premium Indian Fusion Restaurant Platform

One-Bite Pro is a production-ready, full-stack unified restaurant management platform built for **One-Bite**, a premium casual-gourmet restaurant in Indiranagar, Bengaluru. 

It is architected as a **unified single-service deployment** where the Express.js server natively serves the optimized Vite production client from a single domain. It features secure HTTPOnly cookie authentication, real table reservations, order management, an admin dashboard, and automated email confirmations.

---

## ✨ Features

### 🎨 Premium Frontend
- **Polished UX Transitions**: Cohesive theme switching with a unified light/dark mode and smooth micro-interactions.
- **Glassmorphic Layouts**: Smooth spring-bouncy hover states and tactile active-click presses using custom elastic transitions (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Menu Concierge**: Interactive mood-based dish recommendations dynamically curated by the kitchen team.
- **Indian Pricing Style**: Curated premium burger and pizza menus displayed in **INR ₹**.
- **Cart System**: Live order selection and calculation incorporating 5% GST on checkout.

### 👤 Customer Accounts (`/api/auth`)
- **Signup & Login**: Fully responsive sign-up and login drawers.
- **HTTPOnly Cookies Security**: JWT session tokens are issued and saved securely in the browser's `httpOnly` cookie layer, completely removing client `localStorage` storage to eliminate Cross-Site Scripting (XSS) attacks.
- **Retrospective Account Linking**: User reservation and order histories automatically sync to their profile if they register using the same email address!
- **Auto-Fills**: The table booking form automatically locks in user credentials if logged in.

### 📅 Table Reservations (`/api/reservations`)
- **Double-booking Prevention**: Blocks reservation attempts matching the same email, date, and time.
- **Confirmation Service**: Dispatches HTML booking notifications via Nodemailer (Ethereal test mail fallbacks in development).
- **Validation**: Strict server-side verification using `express-validator` on phone numbers, guest count ranges, and dates.

### 💬 Customer Reviews & Moderation (`/api/reviews`)
- **Authenticated Reviews Submission**: Authenticated regular guests can publish 1-5 star ratings and reviews complete with dynamic character counters.
- **Micro-Glassmorphic Actions**: Review owner cards show beautiful, circular edit (`✏️`) and delete (`🗑️`) action buttons.
- **Smooth-Scroll Editing**: Clicking edit smooth-scrolls guests to the submission form, pre-loads text, and saves modifications via PATCH.
- **Central Moderation**: Administrators can oversee every submitted review via a dedicated grid tab and delete any review directly.

### 📊 Admin Dashboard (`/admin`)
- **Real Admin Authentication**: Restricts dashboard access to authenticators with full Email + Password accounts.
- **Earnings Analytics**: Tracks Total Bookings, Today's Reservations, Total Orders, and Estimated Revenue in rupees (₹).
- **Activity Logs**: Dual glassmorphic lists for managing table reservations and orders logs.
- **Reviews Moderation Panel**: Dedicated tab allowing administrators to search, filter, and delete customer reviews instantly.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | HTML5, CSS3 (Custom Design Tokens), Modern JS (ESModules), Vite |
| **Backend** | Node.js, Express.js, cookie-parser, Helmet, Morgan, cors |
| **Auth** | jsonwebtoken (JWT), bcryptjs, Secure HTTPOnly Cookies |
| **Database** | MongoDB Atlas Cloud, Mongoose ODM |
| **Email** | Nodemailer (with auto-provisioning dev fallbacks) |
| **Dev Tools** | Nodemon, Concurrently |

---

## 📂 Project Structure

The project has been refactored into a dry, unified structure with a single backend `package.json` at the root and a frontend `package.json` inside `/client`:

```
one-bite-pro/
├── package.json               # Main package coordinating root backend and client scripts
├── nodemon.json               # Root nodemon configuration for targeted backend watches
├── client/                    # Vite Frontend Client
│   ├── index.html             # Single-page UI shell
│   ├── vite.config.js         # Client builder configuration with dev proxy settings
│   ├── dist/                  # Optimized client build assets (production target)
│   └── src/                   # Client application modules & stylesheets
│
└── server/                    # Express Backend API
    ├── server.js              # Server entry point serving APIs and static assets
    ├── .env                   # Configuration file (gitignored)
    ├── config/                # Mongoose Database configuration
    ├── controllers/           # API handlers (reservations, orders, and authentication)
    ├── middleware/            # JWT validators, global error handles, and validators
    ├── models/                # MongoDB Mongoose schemas
    ├── routes/                # Backend routing endpoints (/api/*)
    ├── scripts/               # Database bootstrap and reset utilities (reset_admin.js)
    └── services/              # Emailer scripts with nodemailer
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** 18+
- A **MongoDB Atlas** database connection string (or local MongoDB database)

### 2. Install Dependencies
Running `npm install` at the root automatically installs the backend packages and triggers a nested installer for the frontend:
```bash
# Run from the project root
npm install
```

### 3. Environment Setup
Copy the server's env template to `.env`:
```bash
cp server/.env.example server/.env
```

Open `server/.env` and edit your variables:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/onebite
PORT=5000
NODE_ENV=development

# Generate a strong JWT Secret for signing session cookies
JWT_SECRET=your_jwt_signing_key_here
JWT_EXPIRES_IN=7d

# Required to signup your first admin user
ADMIN_BOOTSTRAP_SECRET=your_bootstrap_key_here
```

---

## 💻 Development Workflow

To launch both the backend API server and frontend Vite development server concurrently:
```bash
# Run from the root directory
npm run dev
```
- **Vite Dev Server (Frontend)**: http://localhost:5173
- **Express API Port**: http://localhost:5000

In development mode, Vite automatically proxies any client calls starting with `/api` to Express on port 5000, ensuring cross-origin cookies function correctly.

---

## 🚢 Production Deployment

To run One-Bite Pro as a single-service full-stack web application:

### 1. Build the Frontend
Compile the client application into the static [client/dist](file:///C:/Users/sujit/.gemini/antigravity/scratch/one-bite-pro/client/dist) production target:
```bash
npm run build
```

### 2. Launch the Service
Set your environment to `production` and start the server:
```bash
# Windows PowerShell
$env:NODE_ENV="production"; npm start

# Linux / MacOS / Render / Railway
NODE_ENV=production npm start
```

### 3. Verification
In production:
* The entire platform runs seamlessly from a single host: **http://localhost:5000**.
* Express serves client HTML, CSS, and JS statically.
* The wildcard router fallbacks handle refreshes on paths like `/reservations` beautifully, while missing `/api/*` requests still correctly trigger JSON 404 responses.

---

## 🔒 Security Summary

| Feature | Implementation |
|---|---|
| **JWT Storage** | Saved in HTTPOnly Cookie — completely secure from JavaScript `document.cookie` reads |
| **Authentication** | Password validation hashed via `bcryptjs` with salt configurations |
| **Headers Protection** | `helmet` middleware sets secure headers |
| **Input Sanitization** | `express-validator` validates booking inputs, dates, and phone numbers |
| **SameSite Cookie** | `sameSite: 'strict'` settings defend against CSRF attacks |

---

## 📧 Email Service
If SMTP properties are omitted from your `.env`, the server automatically creates an **Ethereal Mail** dev account at boot. Reservation receipts generate an inline preview URL printed to the terminal console:
```
=============================================================
[EmailService] PREVIEW ETHEREAL EMAIL:
👉 https://ethereal.email/message/...
=============================================================
```
Open the URL in your browser to inspect the custom confirmation email template.

---

## 📄 License
MIT License. Free to use, modify, and present to clients!
