const Cancellation = require('../models/cancellationModel');
const Order = require('../models/orderModel');
const Payment = require('../models/paymentModel');
const Product = require('../models/productModel');
const InventoryTransaction = require('../models/inventoryTransactionModel');

// @desc    Get cancellation summary
// @route   GET /api/cancellations/summary
// @access  Private/Admin
const getCancellationSummary = async (req, res) => {
  try {
    const cancellations = await Cancellation.find({});
    
    const totalRequests = cancellations.length;
    let pendingRequests = 0;
    let approved = 0;
    let rejected = 0;
    let refunded = 0;

    cancellations.forEach(c => {
      if (c.status === 'PENDING' || c.status === 'UNDER_REVIEW') pendingRequests++;
      else if (c.status === 'APPROVED' || c.status === 'CANCELLED') approved++;
      else if (c.status === 'REJECTED') rejected++;
      
      if (c.refundStatus === 'Refunded') refunded++;
    });

    res.json({
      totalRequests,
      pendingRequests,
      approved,
      rejected,
      refunded,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all cancellations
// @route   GET /api/cancellations
// @access  Private/Admin
const getCancellations = async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.status && req.query.status !== 'All') {
      // Map frontend status if needed, but assuming direct mapping
      filter.status = req.query.status.toUpperCase().replace(' ', '_');
      // If filtering by refund status
      if (req.query.status === 'Refund Pending' || req.query.status === 'Refunded') {
         delete filter.status;
         filter.refundStatus = req.query.status;
      }
    }
    
    if (req.query.search) {
      filter.$or = [
        { cancellationId: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Date filter...
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
      }
      if (fromDate && toDate) {
        filter.createdAt = { $gte: fromDate, $lt: toDate };
      }
    }

    const cancellations = await Cancellation.find(filter)
      .populate('customerId', 'name email phone')
      .populate('orderId', '_id totalPrice')
      .sort({ createdAt: -1 });

    res.json(cancellations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cancellation by ID
// @route   GET /api/cancellations/:id
// @access  Private/Admin
const getCancellationById = async (req, res) => {
  try {
    const cancellation = await Cancellation.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate({
         path: 'orderId',
         populate: { path: 'orderItems.product', select: 'name' }
      })
      .populate('paymentId');
      
    if (cancellation) {
      res.json(cancellation);
    } else {
      res.status(404).json({ message: 'Cancellation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit cancellation request
// @route   POST /api/orders/:orderId/cancellation-request
// @access  Private (Customer)
const requestCancellation = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { reason, notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verify ownership
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Check if already delivered or cancelled
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return res.status(400).json({ message: `Cannot cancel order in ${order.status} state` });
    }

    // Check existing
    const existing = await Cancellation.findOne({ orderId: order._id });
    if (existing && existing.status !== 'REJECTED') {
      return res.status(400).json({ message: 'Cancellation request already submitted for this order.' });
    }

    const payment = await Payment.findOne({ orderId: order._id });
    
    const cancellationId = `CAN${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    
    let refundStatus = 'Not Applicable';
    if (payment && payment.status === 'Successful') {
       refundStatus = 'Pending';
    }

    const cancellation = await Cancellation.create({
      cancellationId,
      orderId: order._id,
      customerId: order.user,
      reason,
      customerNotes: notes,
      requestedAmount: order.totalPrice,
      paymentId: payment ? payment._id : null,
      refundStatus
    });

    // Update order embedded field for backward compatibility
    order.cancellationRequest = {
      requested: true,
      reason,
      requestedAt: Date.now(),
      status: 'Pending'
    };
    await order.save();

    res.status(201).json(cancellation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update / Review cancellation (add admin notes)
// @route   POST /api/cancellations/:id/review
// @access  Private/Admin
const reviewCancellation = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const cancellation = await Cancellation.findById(req.params.id);
    
    if (cancellation) {
      cancellation.adminNotes = adminNotes !== undefined ? adminNotes : cancellation.adminNotes;
      if (cancellation.status === 'PENDING') {
         cancellation.status = 'UNDER_REVIEW';
         cancellation.reviewedBy = req.user._id;
         cancellation.reviewedAt = Date.now();
      }
      const updated = await cancellation.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Cancellation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve cancellation
// @route   POST /api/cancellations/:id/approve
// @access  Private/Admin
const approveCancellation = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const cancellation = await Cancellation.findById(req.params.id);
    
    if (!cancellation) {
      return res.status(404).json({ message: 'Cancellation not found' });
    }

    const order = await Order.findById(cancellation.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Associated order not found' });
    }

    // 1. Update Cancellation Status
    cancellation.status = 'APPROVED';
    cancellation.adminNotes = adminNotes || cancellation.adminNotes;
    cancellation.reviewedBy = req.user._id;
    cancellation.reviewedAt = Date.now();
    cancellation.processedAt = Date.now();
    
    // 2. Update Payment Refund Status if applicable
    const payment = await Payment.findOne({ orderId: order._id });
    if (payment && payment.status === 'Successful') {
       cancellation.refundStatus = 'Refund Pending';
    } else {
       cancellation.refundStatus = 'Not Applicable';
    }
    
    await cancellation.save();

    // 3. Update Order Status
    order.status = 'Cancelled';
    if (order.cancellationRequest) {
      order.cancellationRequest.status = 'Approved';
    }
    
    // 4. Restore Inventory (Exactly Once)
    if (!order.isStockRestored) {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          const prevStock = product.countInStock;
          product.countInStock += item.qty;
          await product.save();
          
          await InventoryTransaction.create({
            product: product._id,
            type: 'CANCEL',
            quantity: item.qty,
            previousStock: prevStock,
            newStock: product.countInStock,
            reason: `Order Cancellation #${order._id.toString().slice(-8).toUpperCase()}`,
            referenceId: order._id,
            referenceModel: 'Order',
            admin: req.user._id
          });
        }
      }
      order.isStockRestored = true;
    }
    await order.save();

    res.json(cancellation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject cancellation
// @route   POST /api/cancellations/:id/reject
// @access  Private/Admin
const rejectCancellation = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const cancellation = await Cancellation.findById(req.params.id);
    
    if (!cancellation) {
      return res.status(404).json({ message: 'Cancellation not found' });
    }

    cancellation.status = 'REJECTED';
    cancellation.adminNotes = adminNotes || cancellation.adminNotes;
    cancellation.reviewedBy = req.user._id;
    cancellation.reviewedAt = Date.now();
    cancellation.processedAt = Date.now();
    cancellation.refundStatus = 'Not Applicable';
    
    await cancellation.save();

    const order = await Order.findById(cancellation.orderId);
    if (order) {
      if (order.cancellationRequest) {
        order.cancellationRequest.status = 'Rejected';
      }
      if (order.status === 'Cancellation Requested') {
         order.status = 'Pending';
      }
      await order.save();
    }

    res.json(cancellation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCancellationSummary,
  getCancellations,
  getCancellationById,
  requestCancellation,
  reviewCancellation,
  approveCancellation,
  rejectCancellation
};
