const express = require('express');
const router = express.Router();
const {
  authUser,
  googleAdminLogin,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAdminCustomers,
  getAdminCustomerById,
  updateAdminCustomer,
  updateAdminCustomerStatus,
  getAdminCustomerOrders,
  makeAdmin,
  getAdmins,
  revokeAdmin,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/google-admin', googleAdminLogin);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router
  .route('/profile/wishlist')
  .get(protect, getWishlist)
  .post(protect, addToWishlist);
router.route('/profile/wishlist/:id').delete(protect, removeFromWishlist);

// Admin Customer Routes
router.route('/admin/customers')
  .get(protect, admin, getAdminCustomers);

router.route('/admin/customers/:id')
  .get(protect, admin, getAdminCustomerById)
  .put(protect, admin, updateAdminCustomer);

router.route('/admin/customers/:id/status')
  .patch(protect, admin, updateAdminCustomerStatus);

router.route('/admin/customers/:id/orders')
  .get(protect, admin, getAdminCustomerOrders);

router.route('/admin/make-admin')
  .post(protect, admin, makeAdmin);

router.route('/admin/revoke-admin')
  .post(protect, admin, revokeAdmin);

router.route('/admin/admins')
  .get(protect, admin, getAdmins);

module.exports = router;
