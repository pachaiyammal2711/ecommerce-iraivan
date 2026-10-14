require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const User = require('./models/userModel');

const seedGaneshSilverDollar = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to DB');

    const adminUser = await User.findOne({});
    if (!adminUser) {
      console.error('No user found!');
      process.exit(1);
    }

    const mainImage = '/images/ganesh_rudraksham_silver.webp';
    const imagesArray = [
      { url: '/images/ganesh_rudraksham_silver.webp', isMain: true },
      { url: '/images/ganesh_rudraksham_silver_1.webp', isMain: false },
      { url: '/images/ganesh_rudraksham_silver_2.webp', isMain: false }
    ];

    const prodData = {
      user: adminUser._id,
      name: 'கணேஷ் ருத்ராட்சம் வெள்ளி டாலர்',
      nameEn: 'Ganesh Rudraksham Silver Dollar',
      category: 'silver-dollars',
      price: 899.00,
      oldPrice: 1499.00,
      status: 'In Stock',
      countInStock: 10,
      description: 'தூய்மையான வெள்ளி டாலருடன் கூடிய அற்புத கணேஷ் ருத்ராட்சம். ஆன்மிக பலமும் விக்கினங்கள் நீக்கும் அற்புத ஆற்றலும் பெற்றது.',
      rating: 5,
      numReviews: 12,
      isFeatured: false,
      material: 'வெள்ளி',
      image: mainImage,
      images: imagesArray
    };

    const prod = await Product.findOneAndUpdate(
      { name: prodData.name, category: 'silver-dollars' },
      { $set: prodData },
      { upsert: true, new: true }
    );

    console.log(`Successfully saved Ganesh Silver Dollar product! ID: ${prod._id}`);
    console.log(`Main Image: ${prod.image}`);
    console.log(`Images Count: ${prod.images.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Ganesh Silver Dollar:', error);
    process.exit(1);
  }
};

seedGaneshSilverDollar();
