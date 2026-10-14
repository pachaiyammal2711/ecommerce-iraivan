const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');

// @desc    Get payment summary
// @route   GET /api/payments/summary
// @access  Private/Admin
const getPaymentSummary = async (req, res) => {
  try {
    const payments = await Payment.find({});
    
    const totalPayments = payments.length;
    let successfulPayments = 0;
    let pendingPayments = 0;
    let failedPayments = 0;
    let totalRevenue = 0;
    let refundedAmount = 0;

    payments.forEach(payment => {
      if (payment.status === 'Successful' || payment.status === 'Partially Refunded') {
        successfulPayments++;
        // Calculate revenue (Amount minus what was refunded)
        totalRevenue += (payment.amount - (payment.refundAmount || 0));
      } else if (payment.status === 'Pending') {
        pendingPayments++;
      } else if (payment.status === 'Failed') {
        failedPayments++;
      }
      
      if (payment.refundAmount) {
        refundedAmount += payment.refundAmount;
      }
    });

    res.json({
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      totalRevenue,
      refundedAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }
    if (req.query.method && req.query.method !== 'All Methods') {
      filter.method = req.query.method;
    }
    if (req.query.search) {
      filter.$or = [
        { paymentId: { $regex: req.query.search, $options: 'i' } },
        { transactionId: { $regex: req.query.search, $options: 'i' } }
      ];
      // Note: searching by customer name/phone requires aggregation or lookup, 
      // but for simplicity in this basic setup we search what is on the payment document.
      // We'll populate customer to send to frontend.
    }
    
    // Date filter
    if (req.query.date && req.query.date !== 'All Time') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let fromDate, toDate;
      
      switch(req.query.date) {
        case 'Today':
          fromDate = new Date(today);
          toDate = new Date(today);
          toDate.setDate(toDate.getDate() + 1);
          break;
        case 'Yesterday':
          fromDate = new Date(today);
          fromDate.setDate(fromDate.getDate() - 1);
          toDate = new Date(today);
          break;
        case 'Last 7 Days':
          fromDate = new Date(today);
          fromDate.setDate(fromDate.getDate() - 7);
          toDate = new Date(today);
          toDate.setDate(toDate.getDate() + 1);
          break;
        case 'Last 30 Days':
          fromDate = new Date(today);
          fromDate.setDate(fromDate.getDate() - 30);
          toDate = new Date(today);
          toDate.setDate(toDate.getDate() + 1);
          break;
        // add more as needed
      }
      
      if (fromDate && toDate) {
        filter.createdAt = {
          $gte: fromDate,
          $lt: toDate
        };
      }
    }

    const payments = await Payment.find(filter)
      .populate('customerId', 'name email phone')
      .populate('orderId', '_id totalPrice createdAt')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private/Admin
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('orderId');
    if (payment) {
      res.json(payment);
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
const processRefund = async (req, res) => {
  const { refundAmount, reason } = req.body;
  
  if (!refundAmount || refundAmount <= 0) {
    return res.status(400).json({ message: 'Valid refund amount is required' });
  }

  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const maxRefundable = payment.amount - (payment.refundAmount || 0);
    
    if (refundAmount > maxRefundable) {
      return res.status(400).json({ message: `Cannot refund more than ${maxRefundable}` });
    }

    // Since we don't have real Razorpay keys to trigger a real API refund, 
    // we will record the refund locally as requested by the plan.
    const refundId = `REF${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    
    payment.refunds.push({
      refundId,
      amount: refundAmount,
      reason: reason || 'Customer Cancellation',
      status: 'Refunded',
      adminId: req.user._id
    });
    
    payment.refundAmount = (payment.refundAmount || 0) + Number(refundAmount);
    
    if (payment.refundAmount === payment.amount) {
      payment.status = 'Refunded';
    } else {
      payment.status = 'Partially Refunded';
    }
    
    const updatedPayment = await payment.save();

    if (payment.orderId) {
      const order = await Order.findById(payment.orderId);
      if (order) {
        if (payment.status === 'Refunded') {
          order.status = 'Refunded';
        } else if (payment.status === 'Partially Refunded') {
          order.status = 'Partially Refunded';
        }
        await order.save();
      }
    }
    res.json(updatedPayment);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPaymentSummary,
  getPayments,
  getPaymentById,
  processRefund
};
