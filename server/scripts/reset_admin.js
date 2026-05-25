/**
 * @file reset_admin.js
 * @description Database utility script to bootstrap or reset the default administrator account
 * in the One-Bite Pro database cluster. Uses secure bcrypt hashing and robust Mongoose hooks.
 * 
 * @usage
 * Run from the server directory or root directory:
 *   node server/scripts/reset_admin.js
 */

'use strict';

import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']); // Force custom DNS for robust Atlas connection resolution on Windows systems

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
// Load environment variables dynamically from the server/ root
dotenv.config({ 
  path: path.join(__dirname, '../.env'),
  override: true 
});

import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Bootstraps or resets the administrator account in MongoDB.
 */
async function resetAdmin() {
  const uri = process.env.MONGO_URI;
  
  if (!uri) {
    console.error('❌ MONGO_URI is not configured in server/.env file. Aborting.');
    process.exit(1);
  }

  try {
    console.log('[ResetAdmin] Connecting to MongoDB Atlas cluster...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connection established successfully.');

    const adminEmail = 'admin@onebite.in';
    const defaultPassword = 'admin123';

    // Query for existing administrator user (case-insensitive)
    let admin = await User.findOne({ email: adminEmail.toLowerCase() });
    
    if (admin) {
      console.log(`[ResetAdmin] Found existing administrator account: "${admin.name}" (${admin.email})`);
      console.log(`[ResetAdmin] Resetting security password to default: "${defaultPassword}"...`);
      
      admin.password = defaultPassword;
      await admin.save(); // pre-save hook will securely salt and hash using bcrypt automatically
      
      console.log('✅ Administrator password successfully updated and hashed!');
    } else {
      console.log(`[ResetAdmin] Administrator account "${adminEmail}" not found. Bootstrapping fresh account...`);
      
      admin = await User.create({
        name: 'Default Administrator',
        email: adminEmail,
        password: defaultPassword,
        role: 'admin'
      });
      
      console.log('✅ Fresh administrator account successfully created and password hashed!');
    }

    // Perform verification comparison
    const isMatch = await admin.comparePassword(defaultPassword);
    console.log(`[ResetAdmin] Security Check: Does the new key match the hashed database credentials? ${isMatch ? 'YES (Verified)' : 'NO (Error)'}`);

  } catch (err) {
    console.error('❌ An error occurred during the administrator reset process:', err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    await mongoose.disconnect();
    console.log('[ResetAdmin] Database connection closed.');
  }
}

resetAdmin();
