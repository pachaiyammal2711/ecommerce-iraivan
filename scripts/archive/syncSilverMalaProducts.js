const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/iraivan_angadi').then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({}, {strict: false}));
  
  // 1. Update the 3 Karungali Silver Dollar products in MongoDB so their category includes silver-mala
  const dollarNames = [
    'கருங்காலி வெள்ளி டாலர் 20 MM',
    'கருங்காலி வெள்ளி டாலர் 16 MM',
    'கருங்காலி வெள்ளி டாலர் 14 MM'
  ];

  for (let name of dollarNames) {
    let p = await Product.findOne({ name: name });
    if (p) {
      p.category = 'silver-mala, velli-malai, silver-dollars, silver-products, kanganakali-products';
      if (name.includes('20 MM')) p.image = '/images/karungali_silver_dollar.webp';
      if (name.includes('16 MM')) p.image = '/images/karungali_silver_dollar_2.webp';
      if (name.includes('14 MM')) p.image = '/images/karungali_silver_dollar_3.webp';
      p.images = [
        { url: p.image, isMain: true },
        { url: '/images/karungali_silver_dollarcollection.webp', isMain: false },
        { url: '/images/karungali_certificate.webp', isMain: false }
      ];
      await p.save();
      console.log('Updated DB Silver Dollar:', p._id, p.name);
    } else {
      // Create if missing
      const newP = new Product({
        name: name,
        price: name.includes('20 MM') ? 2199 : (name.includes('16 MM') ? 1499 : 1249),
        oldPrice: name.includes('20 MM') ? 2499 : (name.includes('16 MM') ? 1799 : 1499),
        category: 'silver-mala, velli-malai, silver-dollars, silver-products, kanganakali-products',
        image: name.includes('20 MM') ? '/images/karungali_silver_dollar.webp' : (name.includes('16 MM') ? '/images/karungali_silver_dollar_2.webp' : '/images/karungali_silver_dollar_3.webp'),
        images: [
          { url: name.includes('20 MM') ? '/images/karungali_silver_dollar.webp' : (name.includes('16 MM') ? '/images/karungali_silver_dollar_2.webp' : '/images/karungali_silver_dollar_3.webp'), isMain: true },
          { url: '/images/karungali_certificate.webp', isMain: false }
        ],
        size: name.includes('20 MM') ? '20 MM' : (name.includes('16 MM') ? '16 MM' : '14 MM'),
        material: 'வெள்ளி டாலர்',
        stock: 15,
        description: 'கருங்காலி மற்றும் தூய வெள்ளி இணைந்த ஆன்மீக டாலர்.'
      });
      await newP.save();
      console.log('Created DB Silver Dollar:', newP._id, newP.name);
    }
  }

  // 2. Ensure all 4 Silver Malas are present and tagged correctly with silver-mala
  const malaNames = [
    'கருங்காலி வெள்ளி (Cup) மாலை 6 MM (54+1)',
    'கருங்காலி வெள்ளி மாலை 6 MM (54+1)',
    'கருங்காலி வெள்ளி மாலை 8 MM (54+1)',
    'கருங்காலி வெள்ளி (Cup) மாலை 8 MM (54+1)'
  ];

  for (let name of malaNames) {
    let p = await Product.findOne({ name: name });
    if (p) {
      p.category = 'silver-mala, velli-malai, silver-products, karungali-malai, kanganakali-mala';
      await p.save();
      console.log('Updated DB Silver Mala:', p._id, p.name);
    } else {
      console.log('Silver Mala missing in DB:', name);
    }
  }

  console.log('\n--- Finished Syncing DB Silver Products ---');
  process.exit();
});
