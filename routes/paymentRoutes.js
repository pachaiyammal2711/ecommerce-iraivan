const express = require('express');
const router = express.Router();
const {
  getPaymentSummary,
  getPayments,
  getPaymentById,
  processRefund
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/summary', protect, admin, getPaymentSummary);
router.get('/', protect, admin, getPayments);
router.get('/:id', protect, admin, getPaymentById);
router.post('/:id/refund', protect, admin, processRefund);

module.exports = router;
