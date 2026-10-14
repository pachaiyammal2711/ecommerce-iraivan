require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/categoryModel');

const missingCategories = [
  {
    categoryId: 'COL-RUDRAKSHAM',
    name: { tamil: 'ருத்ராட்சம்', english: 'Rudraksham' },
    slug: 'rudraksham',
    status: 'active'
  },
  {
    categoryId: 'COL-KARUNGALI-MALAI',
    name: { tamil: 'கருங்காலி மாலைகள்', english: 'Karungali Malai' },
    slug: 'karungali-malai',
    status: 'active'
  },
  {
    categoryId: 'COL-SILVER-MALAI',
    name: { tamil: 'வெள்ளி மாலை', english: 'Silver Malai' },
    slug: 'silver-malai',
    status: 'active'
  },
  {
    categoryId: 'COL-SILVER-DOLLARS',
    name: { tamil: 'வெள்ளி டாலர்கள்', english: 'Silver Dollars' },
    slug: 'silver-dollars',
    status: 'active'
  },
  {
    categoryId: 'COL-SILVER-PRODUCTS',
    name: { tamil: 'வெள்ளி பொருட்கள்', english: 'Silver Products' },
    slug: 'silver-products',
    status: 'active'
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    for (const cat of missingCategories) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        await Category.create(cat);
        console.log(`Created: ${cat.name.english}`);
      } else {
        console.log(`Already exists: ${cat.name.english}`);
      }
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
