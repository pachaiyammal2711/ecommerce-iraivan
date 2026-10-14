require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');

const mockProducts = [
  {
    name: '5 முக ருத்ராட்ச செம்பு மாலை 5 MM (108+1 மணிகள்)',
    nameEn: '5 Mukhi Rudraksha Copper Mala 5 MM (108+1)',
    price: 849,
    oldPrice: 1099,
    rating: 5.0,
    numReviews: 60,
    category: 'ருத்ராட்ச மாலை',
    image: 'https://images.unsplash.com/photo-1616762391054-073c683b9f69?auto=format&fit=crop&w=800&q=80',
    countInStock: 12,
    variant: '5 MM',
    description: '5 MM அளவிலான 5 முக ருத்ராட்ச மணிகளுடன் வடிவமைக்கப்பட்ட செம்பு மாலை. 108+1 மணிகள் கொண்ட சிறப்பு வடிவம்.',
  },
  {
    name: '5 முக ருத்ராட்ச செம்பு மாலை 6 MM (54+1 மணிகள்)',
    nameEn: '5 Mukhi Rudraksha Copper Mala 6 MM (54+1)',
    price: 599,
    oldPrice: 799,
    rating: 4.8,
    numReviews: 20,
    category: 'ருத்ராட்ச மாலை',
    image: 'https://images.unsplash.com/photo-1616762391054-073c683b9f69?auto=format&fit=crop&w=800&q=80',
    countInStock: 10,
    variant: '6 MM',
    description: '5 முக ருத்ராட்சம் மற்றும் செம்பு மணிகளால் உருவாக்கப்பட்ட பாரம்பரிய மாலை. 54+1 மணிகள் கொண்ட வடிவம்.',
  },
  {
    name: '5 முக ருத்ராட்ச செம்பு மாலை 10 MM (54+1 மணிகள்)',
    nameEn: '5 Mukhi Rudraksha Copper Mala 10 MM (54+1)',
    price: 799,
    oldPrice: 999,
    rating: 4.9,
    numReviews: 35,
    category: 'ருத்ராட்ச மாலை',
    image: 'https://images.unsplash.com/photo-1616762391054-073c683b9f69?auto=format&fit=crop&w=800&q=80',
    countInStock: 15,
    variant: '10 MM',
    description: '10 MM அளவிலான 5 முக ருத்ராட்ச மணிகளுடன் வடிவமைக்கப்பட்ட செம்பு மாலை. 54+1 மணிகள் கொண்டது.',
  },
  {
    name: '5 முக ருத்ராட்ச செம்பு மாலை 5 MM (54+1 மணிகள்)',
    nameEn: '5 Mukhi Rudraksha Copper Mala 5 MM (54+1)',
    price: 499,
    oldPrice: 699,
    rating: 4.7,
    numReviews: 15,
    category: 'ருத்ராட்ச மாலை',
    image: 'https://images.unsplash.com/photo-1616762391054-073c683b9f69?auto=format&fit=crop&w=800&q=80',
    countInStock: 8,
    variant: '5 MM',
    description: '5 MM அளவிலான 5 முக ருத்ராட்ச மணிகளுடன் உருவாக்கப்பட்ட அழகான செம்பு மாலை. 54+1 மணிகள் கொண்டது.',
  },
  {
    name: '5 முக ருத்ராட்ச செம்பு மாலை 8 MM (54+1 மணிகள்)',
    nameEn: '5 Mukhi Rudraksha Copper Mala 8 MM (54+1)',
    price: 699,
    oldPrice: 899,
    rating: 4.9,
    numReviews: 40,
    category: 'ருத்ராட்ச மாலை',
    image: 'https://images.unsplash.com/photo-1616762391054-073c683b9f69?auto=format&fit=crop&w=800&q=80',
    countInStock: 5,
    variant: '8 MM',
    description: '8 MM அளவிலான 5 முக ருத்ராட்ச மணிகளுடன் தயாரிக்கப்பட்ட பாரம்பரிய செம்பு மாலை. 54+1 மணிகள் கொண்டது.',
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to DB');

    // First get an admin user
    const User = require('./models/userModel');
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Cannot seed products.');
      process.exit(1);
    }

    // Insert 5 products if they don't exist
    for (const item of mockProducts) {
      const exists = await Product.findOne({ name: item.name });
      if (!exists) {
        await Product.create({ ...item, user: adminUser._id });
        console.log(`Seeded: ${item.name}`);
      } else {
        console.log(`Already exists: ${item.name}`);
      }
    }

    console.log('Seeding finished');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedProducts();
