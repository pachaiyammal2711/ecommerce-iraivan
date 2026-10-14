const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      tamil: { type: String, required: true },
      english: { type: String, required: true },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    description: {
      tamil: { type: String },
      english: { type: String },
    },
    seo: {
      title: { type: String },
      description: { type: String },
    },
    status: {
      type: String,
      default: 'active', // active, inactive
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
