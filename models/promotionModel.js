const mongoose = require('mongoose');

const promotionSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['image', 'video'],
    },
    mediaUrl: {
      type: String, // Kept for backward compatibility
      required: false,
    },
    desktopMediaUrl: {
      type: String,
    },
    mobileMediaUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    buttonText: {
      type: String,
    },
    link: {
      type: String,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
