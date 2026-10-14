const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/iraivan_angadi').then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({}, {strict: false}));
  
  // 1. Clear "malas" category tag from ALL products first
  const allProds = await Product.find({});
  for (let p of allProds) {
    if (typeof p.category === 'string' && p.category.includes('malas')) {
      p.category = p.category.replace(/,?\s*malas/, '').trim();
      if (!p.category) p.category = 'கருங்காலி பொருட்கள்';
      await p.save();
    }
  }

  // Exact 30 Malas matching Image 1
  const exact30 = [
    { name: 'கருங்காலி செம்பு மாலை 6 MM (54+1)', price: 699, oldPrice: 999, image: '/images/karungali_copper_mala_8_mm.webp', size: '6 MM', beadCount: '54+1', cat: 'malas, karungali-malai, kanganakali-mala, செம்பு மாலை' },
    { name: 'கருங்காலி செம்பு மாலை 8 MM (54+1)', price: 899, oldPrice: 1199, image: '/images/karungali_copper_mala_8_mm.webp', size: '8 MM', beadCount: '54+1', cat: 'malas, karungali-malai, kanganakali-mala, செம்பு மாலை' },
    { name: 'தேவதாரு மாலை 6 MM (108+1 மணிகள்)', price: 499, oldPrice: 799, image: '/images/devdharu_mala_6_mm.webp', size: '6 MM', beadCount: '108+1', cat: 'malas, devadaru-mala' },
    { name: 'ஸ்படிக மாலை செம்பு 8 MM (54+1)', price: 1399, oldPrice: 1699, image: '/images/spadigam_copper_mala.webp', size: '8 MM', beadCount: '54+1', cat: 'malas, spadika-malai, செம்பு மாலை' },
    { name: 'துளசி மணி மாலை 6 MM (108+1 மணிகள்)', price: 299, oldPrice: 499, image: '/images/tulsi_mala_6_mm.webp', size: '6 MM', beadCount: '108+1', cat: 'malas, tulsi-mala' },
    { name: 'ஸ்படிக மாலை செம்பு 6 MM (54+1)', price: 1099, oldPrice: 1399, image: '/images/spadigam_copper_mala.webp', size: '6 MM', beadCount: '54+1', cat: 'malas, spadika-malai, செம்பு மாலை' },
    { name: 'கருங்காலி மாலை நூலில் கோர்த்த 10MM (108+1)', price: 1299, oldPrice: 1599, image: '/images/karungali_mala_10_mm_thread.webp', size: '10 MM', beadCount: '108+1', cat: 'malas, karungali-malai, kanganakali-mala' },
    { name: 'தேவதாரு மாலை 8 MM (108+1 மணிகள்)', price: 699, oldPrice: 999, image: '/images/devdharu_mala_6_mm.webp', size: '8 MM', beadCount: '108+1', cat: 'malas, devadaru-mala' },
    { name: 'இரத்த சந்தன மாலை 6 MM (108+1 மணிகள்)', price: 599, oldPrice: 899, image: '/images/red_sandalwood_mala.webp', size: '6 MM', beadCount: '108+1', cat: 'malas, red-sandalwood' },
    { name: 'துளசி மணி மாலை 8 MM (108+1 மணிகள்)', price: 399, oldPrice: 599, image: '/images/tulsi_mala_6_mm.webp', size: '8 MM', beadCount: '108+1', cat: 'malas, tulsi-mala' },
    { name: 'கருங்காலி வெள்ளி (Cup) மாலை 6 MM (54+1)', price: 9999, oldPrice: 11999, image: '/images/karungali_mala_6_mm_cup.webp', size: '6 MM', beadCount: '54+1', cat: 'malas, karungali-malai, silver-mala, silver-products' },
    { name: 'கருங்காலி மாலை நூலில் கோர்த்த 6MM (108+1)', price: 799, oldPrice: 999, image: '/images/karungali_mala_6_mm_thread.webp', size: '6 MM', beadCount: '108+1', cat: 'malas, karungali-malai, kanganakali-mala' },
    { name: 'தேவதாரு செம்பு மாலை 8 MM (54+1 மணிகள்)', price: 699, oldPrice: 999, image: '/images/devdharu_mala_6_mm.webp', size: '8 MM', beadCount: '54+1', cat: 'malas, devadaru-mala, செம்பு மாலை' },
    { name: 'இரத்த சந்தன மாலை 8 MM (108+1 மணிகள்)', price: 799, oldPrice: 1099, image: '/images/red_sandalwood_mala_1.webp', size: '8 MM', beadCount: '108+1', cat: 'malas, red-sandalwood' },
    { name: 'தேவதாரு செம்பு மாலை 6 MM (54+1 மணிகள்)', price: 499, oldPrice: 699, image: '/images/devdharu_mala_6_mm.webp', size: '6 MM', beadCount: '54+1', cat: 'malas, devadaru-mala, செம்பு மாலை' },
    { name: 'கருங்காலி வெள்ளி மாலை 6 MM (54+1)', price: 5999, oldPrice: 6999, image: '/images/karungali_mala_6_mm_without_cup.webp', size: '6 MM', beadCount: '54+1', cat: 'malas, karungali-malai, silver-mala' },
    { name: 'சந்தன செம்பு மாலை 6 MM (54+1 மணிகள்)', price: 499, oldPrice: 699, image: '/images/sandal_sample.webp', size: '6 MM', beadCount: '54+1', cat: 'malas, copper-mala, செம்பு மாலை' },
    { name: 'ஐயப்பன் துளசி மணி மாலை 10 MM (108+1 மணிகள்)', price: 499, oldPrice: 699, image: '/images/tulsi_mala_6_mm.webp', size: '10 MM', beadCount: '108+1', cat: 'malas, sabarimala-set, tulsi-mala' },
    { name: 'ஐயப்பன் துளசி மணி மாலை 8 MM (108+1 மணிகள்)', price: 399, oldPrice: 599, image: '/images/tulsi_mala_6_mm.webp', size: '8 MM', beadCount: '108+1', cat: 'malas, sabarimala-set, tulsi-mala' },
    { name: 'இரத்த சந்தன மாலை 10 MM (108+1 மணிகள்)', price: 999, oldPrice: 1299, image: '/images/red_sandalwood_mala_2.webp', size: '10 MM', beadCount: '108+1', cat: 'malas, red-sandalwood' },
    { name: 'ஸ்படிக மாலை நூலில் கோர்த்தது 8 MM (108+1)', price: 1199, oldPrice: 1499, image: '/images/spadigam_copper_mala.webp', size: '8 MM', beadCount: '108+1', cat: 'malas, spadika-malai' },
    { name: 'கருங்காலி வெள்ளி மாலை 8 MM (54+1)', price: 6299, oldPrice: 7299, image: '/images/karungali_mala_8_mm_without_cup.webp', size: '8 MM', beadCount: '54+1', cat: 'malas, karungali-malai, silver-mala' },
    { name: 'கருங்காலி வெள்ளி (Cup) மாலை 8 MM (54+1)', price: 11999, oldPrice: 13999, image: '/images/karungali_mala_8_mm_cup.webp', size: '8 MM', beadCount: '54+1', cat: 'malas, karungali-malai, silver-mala, silver-products' },
    { name: 'ஐயப்பன் துளசி மணி மாலை 6 MM (108+1 மணிகள்)', price: 299, oldPrice: 499, image: '/images/tulsi_mala_6_mm.webp', size: '6 MM', beadCount: '108+1', cat: 'malas, sabarimala-set, tulsi-mala' },
    { name: 'சந்தன செம்பு மாலை 8 MM (54+1 மணிகள்)', price: 699, oldPrice: 899, image: '/images/sandal_sample.webp', size: '8 MM', beadCount: '54+1', cat: 'malas, copper-mala, செம்பு மாலை' },
    { name: 'கருங்காலி ஐம்பொன் மாலை 8 MM (54+1 மணிகள்)', price: 1499, oldPrice: 1799, image: '/images/karungali_product_collection.webp', size: '8 MM', beadCount: '54+1', cat: 'malas, karungali-malai, kanganakali-mala' },
    { name: 'கருங்காலி ஐம்பொன் மாலை 6 MM (54+1 மணிகள்)', price: 1299, oldPrice: 1499, image: '/images/karungali_product_collection.webp', size: '6 MM', beadCount: '54+1', cat: 'malas, karungali-malai, kanganakali-mala' },
    { name: 'கருங்காலி ஐம்பொன் மாலை 5 MM (54+1 மணிகள்)', price: 1099, oldPrice: 1299, image: '/images/karungali_product_collection.webp', size: '5 MM', beadCount: '54+1', cat: 'malas, karungali-malai, kanganakali-mala' },
    { name: 'ஸ்படிக மாலை நூலில் கோர்த்தது 6 MM (108+1)', price: 899, oldPrice: 1199, image: '/images/spadigam_copper_mala.webp', size: '6 MM', beadCount: '108+1', cat: 'malas, spadika-malai' },
    { name: 'கருங்காலி மாலை நூலில் கோர்த்த 8MM (108+1)', price: 999, oldPrice: 1299, image: '/images/karungali_mala_8_mm_thread.webp', size: '8 MM', beadCount: '108+1', cat: 'malas, karungali-malai, kanganakali-mala' }
  ];

  const adminUserId = new mongoose.Types.ObjectId();

  for (let m of exact30) {
    let p = await Product.findOne({ name: m.name });
    if (p) {
      p.category = m.cat;
      p.price = m.price;
      p.oldPrice = m.oldPrice;
      p.image = m.image;
      p.images = [
        { url: m.image, isMain: true },
        { url: '/images/karungali_certificate.webp', isMain: false }
      ];
      await p.save();
      console.log('Updated DB item:', p._id, p.name);
    } else {
      const newP = new Product({
        user: adminUserId,
        name: m.name,
        nameEn: m.name,
        price: m.price,
        oldPrice: m.oldPrice,
        category: m.cat,
        image: m.image,
        images: [
          { url: m.image, isMain: true },
          { url: '/images/karungali_certificate.webp', isMain: false }
        ],
        size: m.size,
        beadCount: m.beadCount,
        stock: 15,
        countInStock: 15,
        description: `${m.name} - 100% அசல் ஆன்மீக மாலை.`,
        rating: 4.8,
        numReviews: 10
      });
      await newP.save();
      console.log('Inserted DB item:', newP._id, newP.name);
    }
  }

  const finalProds = await Product.find({});
  const malasInDB = finalProds.filter(p => p.category && String(p.category).includes('malas'));
  console.log('\n=== Final Total Malas in DB with "malas" category:', malasInDB.length, '===');
  malasInDB.forEach((m, i) => console.log((i+1) + '.', m._id, m.name, '| Cat:', m.category));

  process.exit();
});
