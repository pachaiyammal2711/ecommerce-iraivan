const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  getActiveCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, createCoupon)
  .get(protect, admin, getCoupons);

router.post('/validate', validateCoupon);
router.get('/active', getActiveCoupon);

router.route('/:id')
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

module.exports = router;
