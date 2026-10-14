const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  createRazorpayOrder,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  updateOrderShipping,
  getCancellationRequests,
  approveCancellation,
  rejectCancellation,
  getOrderTracking
} = require('../controllers/orderController');
const { requestCancellation } = require('../controllers/cancellationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/razorpay').post(protect, createRazorpayOrder);
router.route('/cancellations').get(protect, admin, getCancellationRequests);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/verify').post(protect, updateOrderToPaid);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/shipping').put(protect, admin, updateOrderShipping);
router.route('/:id/tracking').get(protect, getOrderTracking);
router.route('/:id/cancellation/approve').put(protect, admin, approveCancellation);
router.route('/:id/cancellation/reject').put(protect, admin, rejectCancellation);
router.route('/:orderId/cancellation-request').post(protect, requestCancellation);

module.exports = router;
