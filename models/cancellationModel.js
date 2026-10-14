const mongoose = require('mongoose');

const cancellationSchema = mongoose.Schema(
  {
    cancellationId: {
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
    reason: {
      type: String,
      required: true,
    },
    customerNotes: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    requestedAmount: {
      type: Number,
      required: true,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      default: 'PENDING', // PENDING, UNDER_REVIEW, APPROVED, REJECTED, CANCELLED
    },
    refundStatus: {
      type: String,
      default: 'Not Applicable', // Not Applicable, Refund Pending, Refunded, Partially Refunded
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Cancellation = mongoose.model('Cancellation', cancellationSchema);

module.exports = Cancellation;
