const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/iraivan_angadi').then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({}, {strict: false}));
  
  // 1. Sanitize any ObjectId categories
  const allProds = await Product.find({});
  for (let p of allProds) {
    if (p.category && typeof p.category !== 'string') {
      p.category = 'கருங்காலி பொருட்கள்';
      await p.save();
      console.log('Sanitized category for product:', p.name);
    }
  }

  // 2. Remove existing bracelet products to rebuild clean 6 items
  const dbProds = await Product.find({});
  for (let p of dbProds) {
    const cat = String(p.category || '');
    const name = String(p.name || '');
    if (cat.includes('bracelet') || cat.includes('வளையல்') || name.includes('வளையல்') || name.toLowerCase().includes('bracelet')) {
      await Product.deleteOne({ _id: p._id });
      console.log('Removed old bracelet DB item:', p._id, p.name);
    }
  }

  // 3. Define the exact clean 6 Karungali Bracelet products matching reference grid
  const standardBracelets = [
    {
      name: 'கருங்காலி எலாஸ்டிக் வளையல் (Elastic Bracelet) 8 MM',
      price: 299,
      oldPrice: 499,
      category: 'bracelet, kanganakali-bracelet, karungali-valaiyal, கருங்காலி பொருட்கள்',
      image: '/images/karungali_bracelet_normal_6_mm.webp',
      images: [
        { url: '/images/karungali_bracelet_normal_6_mm.webp', isMain: true },
        { url: '/images/karungali_bracelet_normal_6_mm_free_size.webp', isMain: false },
        { url: '/images/karungali_certificate.webp', isMain: false }
      ],
      size: '8 MM',
      material: 'கருங்காலி',
      stock: 15,
      description: '8 MM அசல் கருங்காலி மணிகள் கொண்ட ஃப்ரீ சைஸ் எலாஸ்டிக் வளையல்.'
    },
    {
      name: 'கருங்காலி வெள்ளி (Cup) வளையல் (Bracelet) 6 MM',
      price: 499,
      oldPrice: 899,
      category: 'bracelet, kanganakali-bracelet, karungali-valaiyal, கருங்காலி பொருட்கள், silver-products',
      image: '/images/karungali_bracelet_silver_cup_6_mm.webp',
      images: [
        { url: '/images/karungali_bracelet_silver_cup_6_mm.webp', isMain: true },
        { url: '/images/karungali_bracelet_silver_cup_6_mm_1.webp', isMain: false },
        { url: '/images/karungali_bracelet_silver_cup_6_mm_2.webp', isMain: false },
        { url: '/images/karungali_certificate.webp', isMain: false }
      ],
      size: '6 MM',
      material: 'வெள்ளி கப்',
      stock: 12,
      description: 'தூய்மையான வெள்ளி கப் மற்றும் அசல் 6 MM கருங்காலி மணிகள் கொண்டு தயாரிக்கப்பட்ட கைவினை வளையல்.'
    },
    {
      name: 'கருங்காலி வெள்ளி (Cup) வளையல் (Bracelet) 8 MM',
      price: 599,
      oldPrice: 999,
      category: 'bracelet, kanganakali-bracelet, karungali-valaiyal, கருங்காலி பொருட்கள், silver-products',
      image: '/images/karungali_bracelet_silver_cup_8_mm.webp',
      images: [
        { url: '/images/karungali_bracelet_silver_cup_8_mm.webp', isMain: true },
        { url: '/images/karungali_bracelet_silver_cup_8_mm_1.webp', isMain: false },
        { url: '/images/karungali_bracelet_silver_cup_8_mm_2.webp', isMain: false },
        { url: '/images/karungali_bracelet_silver_cup_8_mm_3.webp', isMain: false },
        { url: '/images/karungali_certificate.webp', isMain: false }
      ],
      size: '8 MM',
      material: 'வெள்ளி கப்',
      stock: 10,
      description: '8 MM அசல் கருங்காலி மணிகள் மற்றும் தூய வெள்ளி கப் கொண்டு வடிவமைக்கப்பட்ட தெய்வீக வளையல்.'
    },
    {
      name: 'கருங்காலி வெள்ளி வளையல் (Bracelet) 8 MM',
      price: 499,
      oldPrice: 899,
      category: 'bracelet, kanganakali-bracelet, karungali-valaiyal, கருங்காலி பொருட்கள், silver-products',
      image: '/images/karungali_bracelet_silver_without_cup_8_mm.webp',
      images: [
        { url: '/images/karungali_bracelet_silver_without_cup_8_mm.webp', isMain: true },
        { url: '/images/karungali_bracelet_silver_without_cup_8_mm_1.webp', isMain: false },
        { url: '/images/karungali_bracelet_silver_without_cup_8_mm_2.webp', isMain: false },
        { url: '/images/karungali_bracelet_silver_without_cup_8_mm_3.webp', isMain: false },
        { url: '/images/karungali_certificate.webp', isMain: false }
      ],
      size: '8 MM',
      material: 'வெள்ளி கப்பின்றி',
      stock: 14,
      description: '8 MM கருங்காலி மணிகளுடன் தூய வெள்ளி கம்பி கோர்க்கப்பட்ட நேர்த்தியான வளையல்.'
    },
    {
      name: 'கருங்காலி வெள்ளி வளையல் (Bracelet) 6 MM',
      price: 399,
      oldPrice: 699,
      category: 'bracelet, kanganakali-bracelet, karungali-valaiyal, கருங்காலி பொருட்கள், silver-products',
      image: '/images/karungali_bracelet_silver_without_cup_6_mm_1.webp',
      images: [
        { url: '/images/karungali_bracelet_silver_without_cup_6_mm_1.webp', isMain: true },
        { url: '/images/karungali_bracelet_silver_without_cup_6_mm_2.webp', isMain: false },
        { url: '/images/karungali_bracelet_silver_without_cup_6_mm_3.webp', isMain: false },
        { url: '/images/karungali_bracelet_silver_without_cup_6_mm_4.webp', isMain: false },
        { url: '/images/karungali_certificate.webp', isMain: false }
      ],
      size: '6 MM',
      material: 'வெள்ளி கப்பின்றி',
      stock: 10,
      description: '6 MM அசல் கருங்காலி மணிகள் மற்றும் தூய வெள்ளி கம்பி இணைந்த சுந்தர வளையல்.'
    },
    {
      name: 'கருங்காலி எலாஸ்டிக் வளையல் (Elastic Bracelet) 6 MM',
      price: 199,
      oldPrice: 399,
      category: 'bracelet, kanganakali-bracelet, karungali-valaiyal, கருங்காலி பொருட்கள்',
      image: '/images/karungali_bracelet_normal_6_mm.webp',
      images: [
        { url: '/images/karungali_bracelet_normal_6_mm.webp', isMain: true },
        { url: '/images/karungali_bracelet_normal_6_mm_free_size.webp', isMain: false },
        { url: '/images/karungali_certificate.webp', isMain: false }
      ],
      size: '6 MM',
      material: 'கருங்காலி',
      stock: 20,
      description: 'தூய்மையான அசல் கருங்காலி எலாஸ்டிக் வளையல் (6 MM). உடலுக்கு நேர்மறை ஆற்றலும் குளிர்ச்சியும் தரும்.'
    }
  ];

  await Product.insertMany(standardBracelets);
  console.log('Successfully seeded clean 6 Karungali Bracelet products into MongoDB!');

  process.exit();
});
