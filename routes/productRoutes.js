const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProductReview,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  duplicateProduct,
  getAdminProductById
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin Routes
router.route('/admin').get(protect, admin, getAdminProducts);
router.route('/admin/:id').get(protect, admin, getAdminProductById);
router.route('/:id/status').patch(protect, admin, updateProductStatus);
router.route('/:id/duplicate').post(protect, admin, duplicateProduct);
router.route('/:id/reviews').post(protect, createProductReview);

// Combined Routes
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
