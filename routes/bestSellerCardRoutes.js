const express = require('express');
const router = express.Router();
const {
  getBestSellerCards,
  createBestSellerCard,
  updateBestSellerCard,
  deleteBestSellerCard,
} = require('../controllers/bestSellerCardController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// The get route might be called publicly without auth
const optionalAuth = (req, res, next) => {
  // Simple check to pass if auth is present, otherwise just continue
  protect(req, res, (err) => {
    if (err) {
      next(); // Ignore error, just proceed without req.user
    } else {
      next();
    }
  });
};

router.route('/')
  .get(getBestSellerCards) // Will handle public vs admin inside controller if we want, or just always return all if admin? Actually, let's just make it public. The controller checks req.user. We'll use optional Auth if needed. To be safe for public, just use standard route.
  .post(protect, admin, createBestSellerCard);

router.route('/:id')
  .put(protect, admin, updateBestSellerCard)
  .delete(protect, admin, deleteBestSellerCard);

module.exports = router;
