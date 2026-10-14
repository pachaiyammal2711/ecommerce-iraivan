const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/orderModel');
const Product = require('./models/productModel');
const User = require('./models/userModel');

dotenv.config();

async function createDummyOrder() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivanangadi', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to DB...");

    // Find an admin user to attach the product to (or just any user)
    let user = await User.findOne({ isAdmin: true });
    if (!user) {
        user = await User.findOne({});
    }
    
    if (!user) {
        console.error("No users found in the database. Please register a user first.");
        process.exit(1);
    }

    console.log(`Using user: ${user.email} as the creator/buyer...`);

    // 1. Create a dummy product with valid weight and dimensions
    const dummyProduct = new Product({
      user: user._id,
      name: 'Delhivery Test Product',
      nameEn: 'Delhivery Test Product',
      category: 'Test Category',
      description: 'This is a dummy product created to test the Delhivery integration.',
      price: 150,
      countInStock: 50,
      rating: 0,
      numReviews: 0,
      weight: 500, // 500 grams
      dimensions: {
        length: 15,
        width: 10,
        height: 10
      }
    });

    const savedProduct = await dummyProduct.save();
    console.log(`Created Dummy Product (ID: ${savedProduct._id}) with Weight: 500g`);

    // 2. Create a dummy order using this product
    const orderId = `TEST-DELHIVERY-${Math.floor(Math.random() * 10000)}`;
    const dummyOrder = new Order({
      orderId: orderId,
      user: user._id,
      orderItems: [
        {
          name: savedProduct.name,
          qty: 1,
          image: savedProduct.image || '',
          price: savedProduct.price,
          product: savedProduct._id,
        }
      ],
      shippingAddress: {
        fullName: 'Test Dummy User',
        houseNumber: '123',
        streetAddress: 'Dummy Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001', // Real Indian Pincode for Delhivery validation
        country: 'India',
        phone: '9876543210',
      },
      paymentMethod: 'COD',
      itemsPrice: 150,
      taxPrice: 0,
      shippingPrice: 50,
      totalPrice: 200,
      isPaid: false,
      status: 'Pending',
    });

    const savedOrder = await dummyOrder.save();
    console.log(`\n✅ SUCCESS: Dummy Order Created!`);
    console.log(`Order ID: ${savedOrder.orderId}`);
    console.log(`Status: ${savedOrder.status}`);
    
    console.log(`\n=================================================`);
    console.log(`WHAT TO DO NEXT:`);
    console.log(`1. Go to your frontend Admin Panel (http://localhost:5173).`);
    console.log(`2. Navigate to the 'Orders' section.`);
    console.log(`3. Find the order with ID: ${savedOrder.orderId}`);
    console.log(`4. Change its status from "Pending" to "Shipped".`);
    console.log(`5. The system will now automatically call Delhivery to create a shipment!`);
    console.log(`=================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error("Error creating dummy order:", error);
    process.exit(1);
  }
}

createDummyOrder();
