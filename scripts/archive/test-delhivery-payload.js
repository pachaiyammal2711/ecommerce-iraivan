const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/orderModel');
const Product = require('./models/productModel');

dotenv.config();

// Mock express response
const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.data = data;
    return this;
  }
};

// We will mock createDelhiveryShipment so it doesn't call the real API
jest = { fn: () => {} }; // Mocking jest-like structure if needed, but simple override is better

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivanangadi', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("Connected to DB");

  // Create a dummy user
  const dummyUserId = new mongoose.Types.ObjectId();

  // Scenario 1: Products with valid dimensions and weight
  const p1 = new Product({
    user: dummyUserId, name: 'Product A', nameEn: 'Product A', category: 'Test', description: 'Test',
    price: 100, countInStock: 10, rating: 0, numReviews: 0,
    weight: 200, dimensions: { length: 15, width: 10, height: 5 }
  });
  await p1.save();

  const p2 = new Product({
    user: dummyUserId, name: 'Product B', nameEn: 'Product B', category: 'Test', description: 'Test',
    price: 200, countInStock: 10, rating: 0, numReviews: 0,
    weight: 350, dimensions: { length: 20, width: 8, height: 6 }
  });
  await p2.save();

  // Create an order with valid products
  const order1 = new Order({
    orderId: 'TEST-ORD-001',
    user: dummyUserId,
    orderItems: [
      { product: p1._id, qty: 2, name: p1.name, price: p1.price }, // Weight: 400, Vol: maxL:15, maxW:10, H:10
      { product: p2._id, qty: 1, name: p2.name, price: p2.price }  // Weight: 350, Vol: maxL:20, maxW:10(from p1), H:10+6=16
    ],
    shippingAddress: { fullName: 'Test', houseNumber: '1', streetAddress: 'Test St', city: 'Test City', state: 'Test State', pincode: '123456', country: 'India', phone: '1234567890' },
    paymentMethod: 'Prepaid',
    itemsPrice: 400, taxPrice: 0, shippingPrice: 0, totalPrice: 400, isPaid: true, status: 'Pending'
  });
  await order1.save();

  // Scenario 2: Product with missing dimensions
  const p3 = new Product({
    user: dummyUserId, name: 'Product C', nameEn: 'Product C', category: 'Test', description: 'Test',
    price: 100, countInStock: 10, rating: 0, numReviews: 0,
    // NO WEIGHT/DIMENSIONS
  });
  await p3.save();

  const order2 = new Order({
    orderId: 'TEST-ORD-002',
    user: dummyUserId,
    orderItems: [
      { product: p3._id, qty: 1, name: p3.name, price: p3.price }
    ],
    shippingAddress: { fullName: 'Test', houseNumber: '1', streetAddress: 'Test St', city: 'Test City', state: 'Test State', pincode: '123456', country: 'India', phone: '1234567890' },
    paymentMethod: 'Prepaid',
    itemsPrice: 100, taxPrice: 0, shippingPrice: 0, totalPrice: 100, isPaid: true, status: 'Pending'
  });
  await order2.save();

  // Mock require cache to intercept delhiveryService
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  let interceptedPayload = null;
  Module.prototype.require = function(path) {
    if (path === '../services/delhiveryService') {
      return {
        createDelhiveryShipment: async (payload) => {
          interceptedPayload = payload;
          return { success: true, packages: [{ waybill: 'TEST-WAYBILL-123' }] };
        }
      };
    }
    return originalRequire.apply(this, arguments);
  };

  // Import controller after mocking
  const { updateOrderStatus } = require('./controllers/orderController');

  // Test 1: Valid Order
  console.log("--- Test 1: Valid Order ---");
  await updateOrderStatus({ params: { id: order1._id.toString() }, body: { status: 'Shipped' } }, mockRes);
  
  if (interceptedPayload) {
    const shipment = interceptedPayload.shipments[0];
    console.log("Calculated Weight:", shipment.weight, "(Expected: 750)"); // 200*2 + 350*1 = 750
    console.log("Calculated Length:", shipment.shipment_length, "(Expected: 20)");
    console.log("Calculated Width:", shipment.shipment_width, "(Expected: 10)");
    console.log("Calculated Height:", shipment.shipment_height, "(Expected: 16)"); // 5*2 + 6*1 = 16
    console.log("Hardcoded values removed:", shipment.weight !== "500" && shipment.shipment_width !== "10");
  } else {
    console.log("Error: createDelhiveryShipment was not called!");
  }

  // Test 2: Missing Data Order
  console.log("\n--- Test 2: Missing Package Data Order ---");
  interceptedPayload = null; // reset
  await updateOrderStatus({ params: { id: order2._id.toString() }, body: { status: 'Shipped' } }, mockRes);
  
  if (!interceptedPayload) {
    console.log("Success: Shipment creation blocked due to missing data.");
    console.log("Response:", mockRes.statusCode, mockRes.data);
  } else {
    console.log("Error: Shipment was created despite missing data!");
  }

  // Cleanup
  await Order.deleteMany({ orderId: { $in: ['TEST-ORD-001', 'TEST-ORD-002'] } });
  await Product.deleteMany({ _id: { $in: [p1._id, p2._id, p3._id] } });
  
  mongoose.connection.close();
  console.log("\nTests finished.");
}

runTest().catch(console.error);
