const mongoose = require('mongoose');

const refundSchema = mongoose.Schema(
  {
    refundId: { type: String, required: true },
    amount: { type: Number, required: true },
    reason: { type: String },
    status: { type: String, default: 'Refunded' }, // Refund Pending, Refunded, Refund Failed
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true }
);

const paymentSchema = mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String,
      required: true, // Razorpay, Cash on Delivery, etc.
    },
    gateway: {
      type: String,
    },
    gatewayOrderId: {
      type: String, // e.g., razorpay_order_id
    },
    transactionId: {
      type: String, // e.g., razorpay_payment_id
    },
    status: {
      type: String,
      required: true,
      default: 'Pending', // Pending, Successful, Failed, Refunded, Partially Refunded
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refunds: [refundSchema],
    failureReason: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
