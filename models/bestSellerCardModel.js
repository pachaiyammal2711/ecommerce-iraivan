const mongoose = require('mongoose');

const bestSellerCardSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    titleEn: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

const BestSellerCard = mongoose.model('BestSellerCard', bestSellerCardSchema);

module.exports = BestSellerCard;
