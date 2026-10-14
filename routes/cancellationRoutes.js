const express = require('express');
const router = express.Router();
const {
  getCancellationSummary,
  getCancellations,
  getCancellationById,
  reviewCancellation,
  approveCancellation,
  rejectCancellation
} = require('../controllers/cancellationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/summary', protect, admin, getCancellationSummary);
router.get('/', protect, admin, getCancellations);
router.get('/:id', protect, admin, getCancellationById);
router.post('/:id/review', protect, admin, reviewCancellation);
router.post('/:id/approve', protect, admin, approveCancellation);
router.post('/:id/reject', protect, admin, rejectCancellation);

module.exports = router;
