const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    nameEn: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    category: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    collectionNumber: {
      type: String,
    },
    collectionSlug: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    descriptionEn: {
      type: String,
    },
    variant: {
      type: String,
      default: '',
    },
    inch: { type: String, default: '' },
    mm: { type: String, default: '' },
    face: { type: String, default: '' },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    // Admin Fields
    sku: { type: String },
    slug: { type: String },
    images: [
      {
        url: { type: String },
        isMain: { type: Boolean, default: false }
      }
    ],
    variants: [
      {
        name: { type: String },
        value: { type: String },
        sku: { type: String },
        price: { type: Number },
        stock: { type: Number }
      }
    ],
    verification: {
      authenticityInfo: { type: Boolean, default: false },
      documentationAvailable: { type: Boolean, default: false },
      careInstructionsAvailable: { type: Boolean, default: false }
    },
    status: {
      type: String,
      default: 'active' // active, inactive
    },
    visibility: {
      type: String,
      default: 'published' // published, draft
    },
    weight: {
      type: Number,
      default: 0
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 }
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    isBestSeller: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
