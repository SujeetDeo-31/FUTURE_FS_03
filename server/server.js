'use strict';



import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ 
  path: path.join(__dirname, '.env'),
  override: true 
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import reservations from './routes/reservations.js';
import orders from './routes/orders.js';
import authRoutes from './routes/auth.js';
import reviews from './routes/reviews.js';
import errorHandler from './middleware/errorHandler.js';

// ── Connect to MongoDB ────────────────────────────────────────
connectDB();

// ── Process Level Exception Handlers ──────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception] Critical Error:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] Promise:', promise, 'Reason:', reason);
});

// ── App setup ─────────────────────────────────────────────────
const app = express();

// Security headers with production CSP rules to allow Google Fonts & same-origin assets
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "http://localhost:*", "http://127.0.0.1:*"],
    },
  },
}));

// CORS — only applied in development mode for the Vite local dev server proxy
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
}

// Parse cookies (needed for httpOnly JWT cookie)
app.use(cookieParser());

// Request logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/reservations', reservations);
app.use('/api/orders',       orders);
app.use('/api/auth',         authRoutes);
app.use('/api/reviews',      reviews);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'One-Bite API',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV,
  });
});

// Serve static assets from Vite build in production
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// SPA fallback for non-API routes (preserves clean SPA state on page reloads)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(); // Pass to 404 handler for unknown API routes
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler (must be last)
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] One-Bite API running on http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
