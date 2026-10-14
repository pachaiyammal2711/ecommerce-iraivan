require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const Order = require('./models/orderModel');
const User = require('./models/userModel');
const Payment = require('./models/paymentModel');
const Cancellation = require('./models/cancellationModel');
const InventoryTransaction = require('./models/inventoryTransactionModel');

async function exportData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to MongoDB');

    const data = {
      categories: await Category.find({}),
      products: await Product.find({}),
      orders: await Order.find({}),
      users: await User.find({}),
      payments: await Payment.find({}),
      cancellations: await Cancellation.find({}),
      inventoryTransactions: await InventoryTransaction.find({})
    };

    fs.writeFileSync('all_collections_data.json', JSON.stringify(data, null, 2));
    console.log('Successfully exported all collection data to all_collections_data.json');
    
    process.exit(0);
  } catch (error) {
    console.error('Error exporting data:', error);
    process.exit(1);
  }
}

exportData();
