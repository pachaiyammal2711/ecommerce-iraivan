const express = require('express');
const dotenv = require('dotenv');

// Load environment variables FIRST before requiring any routes/services
dotenv.config();
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cancellationRoutes = require('./routes/cancellationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const bestSellerCardRoutes = require('./routes/bestSellerCardRoutes');
const configRoutes = require('./routes/configRoutes');
const couponRoutes = require('./routes/couponRoutes');
const path = require('path');

const { startDelhiveryTrackingSync } = require('./services/delhiveryTrackingScheduler');

// Connect to MongoDB database
connectDB();

// Start Delhivery tracking background sync
startDelhiveryTrackingSync();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main Root Route
app.get('/', (req, res) => {
  res.send('Iraivan Angadi API is running...');
});

// Endpoint Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cancellations', cancellationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/promotions', promotionRoutes);
      app.use('/api/bestsellercards', bestSellerCardRoutes);
app.use('/api/config', configRoutes);
app.use('/api/coupons', couponRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
