const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/orderModel');
const { updateOrderStatus } = require('./controllers/orderController');

dotenv.config();

async function triggerShipment() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivanangadi', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to DB...");

    const dummyOrder = await Order.findOne({ orderId: 'TEST-DELHIVERY-8166' });
    
    if (!dummyOrder) {
      console.error("Dummy order not found!");
      process.exit(1);
    }
    console.log(`Found Dummy Order: ${dummyOrder._id}`);
    
    // Mock Express Request and Response
    const req = {
      params: { id: dummyOrder._id.toString() },
      body: { status: 'Shipped' },
      user: { _id: dummyOrder.user } // Mock admin user if needed
    };

    let responseData = null;
    let statusCode = 200;

    const res = {
      status: function(code) {
        statusCode = code;
        return this;
      },
      json: function(data) {
        responseData = data;
        return this;
      }
    };

    console.log("Triggering status update to 'Shipped' to call Delhivery...");
    
    // Call controller function (This will make the REAL API call to Delhivery)
    await updateOrderStatus(req, res);

    console.log("\n=================================================");
    console.log(`Response Status: ${statusCode}`);
    if (statusCode !== 200 && statusCode !== 201) {
       console.log("❌ Failed to create Delhivery shipment.");
       console.log("Error Detail:", responseData);
    } else {
       // Fetch the updated order to verify tracking info
       const updatedOrder = await Order.findById(dummyOrder._id);
       console.log("✅ Success!");
       console.log(`Updated Order Status: ${updatedOrder.status}`);
       console.log(`Tracking Courier: ${updatedOrder.courierName}`);
       console.log(`Waybill / Tracking Number: ${updatedOrder.trackingNumber || 'Not Found'}`);
       
       if (updatedOrder.trackingNumber) {
           console.log("Delhivery integration is fully working!");
       } else {
           console.log("Status updated but no Waybill was generated.");
       }
    }
    console.log("=================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Script Error:", error);
    process.exit(1);
  }
}

triggerShipment();
