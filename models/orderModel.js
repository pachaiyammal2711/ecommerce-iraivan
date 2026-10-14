const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: false },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      houseNumber: { type: String, required: true },
      streetAddress: { type: String, required: true },
      area: { type: String },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    couponCode: {
      type: String,
    },
    couponDiscount: {
      type: Number,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      default: 'Pending', // Pending, Completed, Cancelled, Cancellation Requested
    },
    courierName: {
      type: String,
    },
    trackingNumber: {
      type: String,
    },
    cancellationRequest: {
      requested: { type: Boolean, default: false },
      reason: { type: String },
      requestedAt: { type: Date },
      status: { type: String, default: 'Pending' } // Pending, Approved, Rejected
    },
    isStockRestored: {
      type: Boolean,
      default: false,
    },
    isDelhiveryCreated: {
      type: Boolean,
      default: false,
    },
    // Delhivery pickup lifecycle: 'Pickup Pending' | 'Pickup Scheduled' | 'Picked Up'
    pickupStatus: {
      type: String,
      default: null,
    },
    trackingEvents: [
      {
        status: String,
        description: String,
        location: String,
        timestamp: Date
      }
    ],
    packageDetails: {
      weight: { type: Number },
      length: { type: Number },
      width: { type: Number },
      height: { type: Number }
    }
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
