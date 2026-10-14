require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/categoryModel');

const collections = [
  { nameTamil: 'ருத்ராட்ச மாலை', slug: 'rudraksha-malai', num: '01' },
  { nameTamil: 'செம்பு மாலை', slug: 'copper-mala', num: '02' },
  { nameTamil: 'ருத்ராட்சம்', slug: 'rudraksha', num: '03' },
  { nameTamil: 'கருங்காலி பொருட்கள்', slug: 'kanganakali-products', num: '04' },
  { nameTamil: 'மாலைகள்', slug: 'malas', num: '05' },
  { nameTamil: 'ஸ்படிக மாலைகள்', slug: 'spadika-malai', num: '06' },
  { nameTamil: 'கருங்காலி மாலைகள்', slug: 'kanganakali-mala', num: '07' },
  { nameTamil: 'வெள்ளி மாலை', slug: 'silver-mala', num: '08' },
  { nameTamil: 'வெள்ளி டாலர்கள்', slug: 'silver-dollars', num: '09' },
  { nameTamil: 'வெள்ளி பொருட்கள்', slug: 'silver-products', num: '10' },
  { nameTamil: 'கருங்காலி வளையல்', slug: 'kanganakali-bracelet', num: '11' },
  { nameTamil: 'வளையல்', slug: 'bracelet', num: '12' },
  { nameTamil: 'சபரிமலை செட்', slug: 'sabarimala-set', num: '13' },
  { nameTamil: 'Pictures', slug: 'pictures', num: '14' }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi').then(async () => {
  for (const col of collections) {
    const existing = await Category.findOne({ slug: col.slug });
    if (existing) {
      existing.categoryId = col.num;
      existing.name.tamil = col.nameTamil;
      await existing.save();
      console.log(`Updated existing: ${col.slug}`);
    } else {
      await Category.create({
        categoryId: col.num,
        slug: col.slug,
        name: {
          tamil: col.nameTamil,
          english: col.nameTamil // Using same for English since mostly Tamil names are used
        },
        status: 'active'
      });
      console.log(`Created new: ${col.slug}`);
    }
  }
  console.log('Done!');
  process.exit(0);
});
