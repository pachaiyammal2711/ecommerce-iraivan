require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/categoryModel');

const seedCategory = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to DB');

    const catData = {
        categoryId: 'cat_panjakavya',
        name: {
            tamil: 'பஞ்சகவ்ய விளக்கு',
            english: 'Panjakavya Vilaku'
        },
        slug: 'panjakavya-vilaku',
        status: 'active'
    };

    const exists = await Category.findOne({ 'name.english': 'Panjakavya Vilaku' });
    if (!exists) {
      await Category.create(catData);
      console.log('Seeded Category: Panjakavya Vilaku');
    } else {
      console.log('Category Panjakavya Vilaku already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding category:', error);
    process.exit(1);
  }
};

seedCategory();
