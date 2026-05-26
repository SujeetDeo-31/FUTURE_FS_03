# 🍔 One-Bite

A full-stack restaurant management platform for **One-Bite** — a premium Indian fusion restaurant.

🔗 **Live:** [one-bite-pro.onrender.com](https://one-bite-pro.onrender.com)

---

## Tech Stack

| Layer | Technologies |
|:---|:---|
| **Frontend** | React 19, Vite 8, Framer Motion, Tailwind CSS v4, Lucide React |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Auth** | JWT, bcryptjs, HTTPOnly Cookies |
| **Email** | Resend HTTP API |
| **Security** | Helmet, CORS, express-validator |
| **Deployment** | Render (single-service — API + static frontend) |

---

## Features

- **Menu Explorer** — Filterable animated menu grid (Burgers, Pizzas, Drinks, Desserts)
- **Flavor Concierge** — Mood-based dish recommendation engine
- **Cart & Ordering** — Sliding cart drawer with server-side price recalculation and GST
- **Table Reservations** — Duplicate-prevention booking with admin approve/reject/cancel workflow
- **Authentication** — Signup, login, session persistence via HTTPOnly JWT cookies
- **Reviews** — Authenticated 1–5 star ratings with one-review-per-user enforcement
- **Admin Dashboard** — Analytics, reservations manager, orders manager, reviews moderation
- **Email Notifications** — 7 automated HTML templates (booking created/confirmed/rejected/cancelled, order placed/updated, owner alerts)
- **Light / Dark Mode** — Theme toggle persisted across sessions

---

## Project Structure

```
one-bite-pro/
├── package.json              # Root scripts (dev, build, start, reset-admin)
├── client/                   # React + Vite frontend
│   └── src/
│       ├── components/       # Hero, Navbar, MenuExplorer, CartDrawer, ReservationForm, etc.
│       ├── context/          # Auth, Cart, Theme React contexts
│       ├── data/             # menu.js, flavorGuide.js, testimonials.js
│       └── api/              # Fetch helpers for all API routes
└── server/                   # Express backend
    ├── server.js             # App entry point
    ├── config/db.js          # MongoDB connection
    ├── models/               # User, Reservation, Order, Review schemas
    ├── routes/               # /api/auth, /api/reservations, /api/orders, /api/reviews
    ├── controllers/          # Business logic handlers
    ├── middleware/           # Auth guard, error handler, validators
    ├── services/emailService.js  # All 7 Resend email templates
    └── scripts/              # reset_admin.js, verify_email.js
```

---

## Local Development

### Prerequisites
- Node.js v18+
- MongoDB Atlas cluster
- Resend account (free tier — 3,000 emails/month)

### Setup

```bash
git clone https://github.com/your-username/one-bite-pro.git
cd one-bite-pro
npm install
cp server/.env.example server/.env
```

Fill in `server/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/onebite
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_BOOTSTRAP_SECRET=your_bootstrap_secret
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
OWNER_EMAIL=owner@yourdomain.com
SITE_URL=http://localhost:5173
```

```bash
npm run dev
```

> Vite proxies all `/api/*` requests to Express in development — no CORS setup needed.

---

## Creating the First Admin

```bash
curl -X POST http://localhost:5000/api/auth/admin-signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "admin@onebite.in",
    "password": "your_password",
    "bootstrapSecret": "your_ADMIN_BOOTSTRAP_SECRET"
  }'
```

---

## Deployment (Render)

**Build Command:** `npm install && npm run build`  
**Start Command:** `node server/server.js`

Set these environment variables in the Render dashboard:

`MONGO_URI` · `NODE_ENV=production` · `JWT_SECRET` · `JWT_EXPIRES_IN` · `ADMIN_BOOTSTRAP_SECRET` · `RESEND_API_KEY` · `FROM_EMAIL` · `OWNER_EMAIL` · `SITE_URL` · `CORS_ORIGIN`

In production, Express serves the compiled `client/dist` bundle — no separate hosting needed.

---

## Utility Scripts

```bash
npm run reset-admin                    # Reset admin account password
node server/scripts/verify_email.js   # Test all email templates locally
```
