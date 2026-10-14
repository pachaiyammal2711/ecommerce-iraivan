const Product = require('../models/productModel');
const InventoryTransaction = require('../models/inventoryTransactionModel');

// @desc    Get inventory stats
// @route   GET /api/inventory/stats
// @access  Private/Admin
const getInventoryStats = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false });
    
    let totalProducts = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalStockValue = 0;

    products.forEach(product => {
      const stock = product.countInStock || 0;
      const threshold = product.lowStockThreshold || 10;
      
      if (stock === 0) {
        outOfStock++;
      } else if (stock <= threshold) {
        lowStock++;
      } else {
        inStock++;
      }

      totalStockValue += (stock * (product.price || 0));
    });

    res.json({
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      totalStockValue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inventory
// @route   GET /api/inventory
// @access  Private/Admin
const getInventory = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    
    // Category Filter
    if (req.query.category && req.query.category !== 'All Categories') {
      filter.category = req.query.category;
    }

    // Search Filter
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { nameEn: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    let products = await Product.find(filter);
    
    // Status filter in memory because it depends on threshold
    if (req.query.status && req.query.status !== 'All Stock') {
      products = products.filter(p => {
        const stock = p.countInStock || 0;
        const threshold = p.lowStockThreshold || 10;
        if (req.query.status === 'Out of Stock') return stock === 0;
        if (req.query.status === 'Low Stock') return stock > 0 && stock <= threshold;
        if (req.query.status === 'In Stock') return stock > threshold;
        return true;
      });
    }

    // Sort
    const sortOption = req.query.sort || 'Recently Updated';
    products.sort((a, b) => {
      if (sortOption === 'Product Name A–Z') return (a.nameEn || a.name).localeCompare(b.nameEn || b.name);
      if (sortOption === 'Product Name Z–A') return (b.nameEn || b.name).localeCompare(a.nameEn || a.name);
      if (sortOption === 'Stock: Low to High') return a.countInStock - b.countInStock;
      if (sortOption === 'Stock: High to Low') return b.countInStock - a.countInStock;
      if (sortOption === 'Highest Stock Value') return (b.countInStock * b.price) - (a.countInStock * a.price);
      if (sortOption === 'Lowest Stock Value') return (a.countInStock * a.price) - (b.countInStock * b.price);
      // Recently Updated
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update stock
// @route   PATCH /api/inventory/update
// @access  Private/Admin
const updateStock = async (req, res) => {
  const { productIds, action, quantity, reason, notes } = req.body;
  
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ message: 'No products provided' });
  }

  const qty = Number(quantity);
  if (action !== 'SET' && (!qty || qty <= 0)) {
     return res.status(400).json({ message: 'Valid quantity is required' });
  }

  try {
    const updatedProducts = [];
    
    for (const id of productIds) {
      const product = await Product.findById(id);
      if (!product) continue;

      const prevStock = product.countInStock;
      let newStock = prevStock;

      if (action === 'ADD') {
        newStock += qty;
      } else if (action === 'REMOVE') {
        if (prevStock < qty) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }
        newStock -= qty;
      } else if (action === 'SET') {
        newStock = qty >= 0 ? qty : 0;
      }

      product.countInStock = newStock;
      await product.save();

      // Log transaction
      let transType = action;
      if (reason === 'Order Correction') transType = 'ADJUSTMENT';
      if (reason === 'Returned') transType = 'RETURN';
      
      const changeQty = newStock - prevStock;

      if (changeQty !== 0) {
        await InventoryTransaction.create({
          product: product._id,
          type: transType,
          quantity: changeQty,
          previousStock: prevStock,
          newStock: newStock,
          reason: reason || action,
          admin: req.user._id,
          notes: notes || ''
        });
      }

      updatedProducts.push(product);
    }

    res.json({ message: 'Stock updated successfully', products: updatedProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stock history for a product
// @route   GET /api/inventory/:id/history
// @access  Private/Admin
const getStockHistory = async (req, res) => {
  try {
    const history = await InventoryTransaction.find({ product: req.params.id })
      .populate('admin', 'name')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInventoryStats,
  getInventory,
  updateStock,
  getStockHistory
};
