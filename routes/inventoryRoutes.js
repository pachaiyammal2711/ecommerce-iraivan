const express = require('express');
const router = express.Router();
const {
  getInventoryStats,
  getInventory,
  updateStock,
  getStockHistory
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getInventoryStats);
router.get('/', protect, admin, getInventory);
router.patch('/update', protect, admin, updateStock);
router.get('/:id/history', protect, admin, getStockHistory);

module.exports = router;
