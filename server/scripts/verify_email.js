'use strict';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import {
  sendReservationEmail,
  sendOwnerReservationNotification,
  sendOrderConfirmationEmail,
  sendOwnerOrderNotification
} from '../services/emailService.js';

// Resolve directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('--- Email Configuration Test ---');
console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Configured ✅' : 'Not configured ❌'}`);
console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || 'Not configured (defaults to onboarding/noreply)'}`);
console.log(`OWNER_EMAIL: ${process.env.OWNER_EMAIL || 'Not configured ❌'}`);
console.log('--------------------------------');

// Create mock objects
const mockReservation = {
  name: 'Test Customer',
  email: process.env.OWNER_EMAIL || 'sujitkumardeo31@gmail.com', // Recipient
  phone: '+91 98765 43210',
  date: new Date().toISOString(),
  time: '08:00 PM',
  guestCount: 4,
  specialRequests: 'Window seat and candles for an anniversary.'
};

const mockOrder = {
  _id: new mongoose.Types.ObjectId(),
  customerName: 'Test Customer',
  customerEmail: process.env.OWNER_EMAIL || 'sujitkumardeo31@gmail.com', // Recipient
  createdAt: new Date(),
  subtotal: 500,
  notes: 'Extra spicy, please!',
  items: [
    { name: 'Tandoori Roti', quantity: 2, price: 40 },
    { name: 'Butter Chicken', quantity: 1, price: 320 },
    { name: 'Garlic Naan', quantity: 2, price: 50 }
  ]
};

async function runTests() {
  try {
    console.log('\n1. Testing Customer Reservation Email...');
    const resInfo = await sendReservationEmail(mockReservation);
    console.log('Result:', resInfo ? 'Success ✅' : 'Failed ❌');

    console.log('\n2. Testing Owner Reservation Alert Email...');
    const ownerResInfo = await sendOwnerReservationNotification(mockReservation);
    console.log('Result:', ownerResInfo ? 'Success ✅' : 'Failed ❌');

    console.log('\n3. Testing Customer Order Confirmation Email...');
    const orderInfo = await sendOrderConfirmationEmail(mockOrder);
    console.log('Result:', orderInfo ? 'Success ✅' : 'Failed ❌');

    console.log('\n4. Testing Owner Order Alert Email...');
    const ownerOrderInfo = await sendOwnerOrderNotification(mockOrder);
    console.log('Result:', ownerOrderInfo ? 'Success ✅' : 'Failed ❌');

    console.log('\nAll email dispatch cycles complete.');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred during verification:', error);
    process.exit(1);
  }
}

runTests();
