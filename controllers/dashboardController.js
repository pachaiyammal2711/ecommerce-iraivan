const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Total Orders & Today's Orders
    const totalOrders = await Order.countDocuments();
    const todaysOrders = await Order.countDocuments({ createdAt: { $gte: today } });

    // 2. Total Sales & Today's Sales
    // We sum 'totalPrice' for orders that are not Cancelled
    const allValidOrders = await Order.find({ status: { $ne: 'Cancelled' } }).select('totalPrice createdAt');
    
    let totalSales = 0;
    let todaysSales = 0;
    
    allValidOrders.forEach(order => {
      totalSales += order.totalPrice || 0;
      if (new Date(order.createdAt) >= today) {
        todaysSales += order.totalPrice || 0;
      }
    });

    // 3. Total Customers
    // Assuming role 'customer', or all users minus 'admin'
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // 4. Low Stock Products
    const lowStockCount = await Product.countDocuments({ countInStock: { $lt: 5 } });

    // 5. Recent Orders (last 5)
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // 6. Sales Data for Chart (Last 7 Days)
    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const daysOrders = await Order.find({
        createdAt: { $gte: date, $lt: nextDate },
        status: { $ne: 'Cancelled' }
      });

      let dailySales = 0;
      daysOrders.forEach(order => {
        dailySales += order.totalPrice || 0;
      });

      salesData.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: dailySales,
        orders: daysOrders.length
      });
    }

    res.json({
      totalOrders,
      todaysOrders,
      totalSales,
      todaysSales,
      totalCustomers,
      lowStockCount,
      recentOrders,
      salesData
    });
    
  } catch (error) {
    console.error(error);
    res.status(500);
    res.json({ message: 'Server Error retrieving dashboard stats' });
  }
};

module.exports = {
  getDashboardStats
};
