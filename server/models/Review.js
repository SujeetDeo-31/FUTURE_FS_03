'use strict';

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for authenticity'],
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Star rating must be at least 1'],
      max: [5, 'Star rating cannot exceed 5'],
    },
    message: {
      type: String,
      required: [true, 'Review message text is required'],
      trim: true,
      maxlength: [1000, 'Review message must be under 1000 characters'],
    },
  },
  {
    timestamps: true, // Dynamically maps createdAt & updatedAt
  }
);

// High-speed indices for sorting reviews
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
