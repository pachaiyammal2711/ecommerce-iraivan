require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/orderModel');

const migrateOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to Database');

    const orders = await Order.find({ orderId: { $exists: false } }).sort({ createdAt: 1 });
    console.log(`Found ${orders.length} orders to migrate.`);

    // Group orders by date (YYYYMMDD) to assign sequence numbers
    const dailySequences = {};

    for (const order of orders) {
      const date = new Date(order.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}${month}${day}`;

      if (!dailySequences[dateString]) {
        dailySequences[dateString] = 1;
      } else {
        dailySequences[dateString]++;
      }

      const sequence = String(dailySequences[dateString]).padStart(4, '0');
      const orderId = `IRA-${dateString}-${sequence}`;

      order.orderId = orderId;
      await order.save({ validateBeforeSave: false }); // Bypass full validation in case of other strict schema issues
      console.log(`Migrated order ${order._id} -> ${orderId}`);
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateOrders();
