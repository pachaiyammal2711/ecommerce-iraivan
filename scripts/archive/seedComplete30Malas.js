const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/iraivan_angadi').then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({}, {strict: false}));
  
  // 1. Clear "malas" tag from ALL products first so we get a clean set of 30 Mala products
  const allProds = await Product.find({});
  for (let p of allProds) {
    if (typeof p.category === 'string' && p.category.includes('malas')) {
      p.category = p.category.replace(/,?\s*malas/, '').trim();
      if (!p.category) p.category = 'கருங்காலி பொருட்கள்';
      await p.save();
    }
  }
  console.log('Cleared malas category tag from existing products.');

  // 2. Define the exact 30 Mala products matching Image 1
  const exact30Malas = [
    {
      name: 'கருங்காலி செம்பு மாலை 6 MM (54+1)',
      price: 699,
      oldPrice: 999,
      category: 'malas, karungali-malai, kanganakali-mala, செம்பு மாலை',
      image: '/images/karungali_copper_mala_8_mm.webp',
      size: '6 MM',
      beadCount: '54+1',
      description: 'கருங்காலி மணிகளும் செம்பு கம்பியும் இணைந்த பாரம்பரிய 6 MM மாலை.'
    },
    {
      name: 'கருங்காலி செம்பு மாலை 8 MM (54+1)',
      price: 899,
      oldPrice: 1199,
      category: 'malas, karungali-malai, kanganakali-mala, செம்பு மாலை',
      image: '/images/karungali_copper_mala_8_mm.webp',
      size: '8 MM',
      beadCount: '54+1',
      description: 'கருங்காலி மணிகளும் செம்பு கம்பியும் இணைந்த பாரம்பரிய 8 MM மாலை.'
    },
    {
      name: 'தேவதாரு மாலை 6 MM (108+1 மணிகள்)',
      price: 499,
      oldPrice: 799,
      category: 'malas, devadaru-mala',
      image: '/images/devdharu_mala_6_mm.webp',
      size: '6 MM',
      beadCount: '108+1',
      description: 'இமயமலை புனித தேவதாரு மர மணிகளால் ஆன தெய்வீக 108+1 மாலை.'
    },
    {
      name: 'ஸ்படிக மாலை செம்பு 8 MM (54+1)',
      price: 1399,
      oldPrice: 1699,
      category: 'malas, spadika-malai, செம்பு மாலை',
      image: '/images/spadigam_copper_mala.webp',
      size: '8 MM',
      beadCount: '54+1',
      description: 'குளிர்ச்சியும் நேர்மறை ஆற்றலும் தரும் அசல் ஸ்படிக செம்பு மாலை 8 MM.'
    },
    {
      name: 'துளசி மணி மாலை 6 MM (108+1 மணிகள்)',
      price: 299,
      oldPrice: 499,
      category: 'malas, tulsi-mala',
      image: '/images/tulsi_mala_6_mm.webp',
      size: '6 MM',
      beadCount: '108+1',
      description: 'தூய்மையான துளசி மரக் கட்டையினால் செய்யப்பட்ட புனிதமான 108+1 மாலை.'
    },
    {
      name: 'ஸ்படிக மாலை செம்பு 6 MM (54+1)',
      price: 1099,
      oldPrice: 1399,
      category: 'malas, spadika-malai, செம்பு மாலை',
      image: '/images/spadigam_copper_mala.webp',
      size: '6 MM',
      beadCount: '54+1',
      description: 'குளிர்ச்சியும் மன அமைதியும் அளிக்கும் அசல் ஸ்படிக செம்பு மாலை 6 MM.'
    },
    {
      name: 'கருங்காலி மாலை நூலில் கோர்த்த 10MM (108+1)',
      price: 1299,
      oldPrice: 1599,
      category: 'malas, karungali-malai, kanganakali-mala',
      image: '/images/karungali_mala_10_mm_thread.webp',
      size: '10 MM',
      beadCount: '108+1',
      description: '10 MM அசல் கருங்காலி மணிகள் தூய பருத்தி நூலில் கோர்க்கப்பட்ட மாலை.'
    },
    {
      name: 'தேவதாரு மாலை 8 MM (108+1 மணிகள்)',
      price: 699,
      oldPrice: 999,
      category: 'malas, devadaru-mala',
      image: '/images/devdharu_mala_6_mm.webp',
      size: '8 MM',
      beadCount: '108+1',
      description: 'நறுமணம் நிறைந்த 8 MM தேவதாரு மர மணிகளால் ஆன ஜப மாலை.'
    },
    {
      name: 'இரத்த சந்தன மாலை 6 MM (108+1 மணிகள்)',
      price: 599,
      oldPrice: 899,
      category: 'malas, red-sandalwood',
      image: '/images/red_sandalwood_mala.webp',
      size: '6 MM',
      beadCount: '108+1',
      description: 'அசல் இரத்த சந்தன மர மணிகளால் செய்யப்பட்ட ஆன்மீக மாலை.'
    },
    {
      name: 'துளசி மணி மாலை 8 MM (108+1 மணிகள்)',
      price: 399,
      oldPrice: 599,
      category: 'malas, tulsi-mala',
      image: '/images/tulsi_mala_6_mm.webp',
      size: '8 MM',
      beadCount: '108+1',
      description: '8 MM தூய துளசி மணிகளால் ஆன விஷ்ணு வழிபாட்டிற்குரிய புனித மாலை.'
    },
    {
      name: 'கருங்காலி வெள்ளி (Cup) மாலை 6 MM (54+1)',
      price: 9999,
      oldPrice: 11999,
      category: 'malas, karungali-malai, silver-mala, silver-products',
      image: '/images/karungali_mala_6_mm_cup.webp',
      size: '6 MM',
      beadCount: '54+1',
      description: '6 MM கருங்காலி மணிகள் மற்றும் தூய வெள்ளி கப் இணைப்பில் உருவான உயர்தர மாலை.'
    },
    {
      name: 'கருங்காலி மாலை நூலில் கோர்த்த 6MM (108+1)',
      price: 799,
      oldPrice: 999,
      category: 'malas, karungali-malai, kanganakali-mala',
      image: '/images/karungali_mala_6_mm_thread.webp',
      size: '6 MM',
      beadCount: '108+1',
      description: '6 MM அசல் கருங்காலி மணிகள் பலமான நூலில் கோர்க்கப்பட்ட தெய்வீக மாலை.'
    },
    {
      name: 'தேவதாரு செம்பு மாலை 8 MM (54+1 மணிகள்)',
      price: 699,
      oldPrice: 999,
      category: 'malas, devadaru-mala, செம்பு மாலை',
      image: '/images/devdharu_mala_6_mm.webp',
      size: '8 MM',
      beadCount: '54+1',
      description: '8 MM தேவதாரு மணிகளும் தூய செம்பு கம்பியும் இணைந்த மாலை.'
    },
    {
      name: 'இரத்த சந்தன மாலை 8 MM (108+1 மணிகள்)',
      price: 799,
      oldPrice: 1099,
      category: 'malas, red-sandalwood',
      image: '/images/red_sandalwood_mala_1.webp',
      size: '8 MM',
      beadCount: '108+1',
      description: '8 MM அசல் சிவந்த சந்தன மணிகளால் கோர்க்கப்பட்ட லட்சுமி கடாட்ச மாலை.'
    },
    {
      name: 'தேவதாரு செம்பு மாலை 6 MM (54+1 மணிகள்)',
      price: 499,
      oldPrice: 699,
      category: 'malas, devadaru-mala, செம்பு மாலை',
      image: '/images/devdharu_mala_6_mm.webp',
      size: '6 MM',
      beadCount: '54+1',
      description: '6 MM தேவதாரு மணிகளும் செம்பு கம்பியும் இணைந்த பாரம்பரிய மாலை.'
    },
    {
      name: 'கருங்காலி வெள்ளி மாலை 6 MM (54+1)',
      price: 5999,
      oldPrice: 6999,
      category: 'malas, karungali-malai, silver-mala',
      image: '/images/karungali_mala_6_mm_without_cup.webp',
      size: '6 MM',
      beadCount: '54+1',
      description: '6 MM கருங்காலி மணிகள் தூய வெள்ளி கம்பியில் கோர்க்கப்பட்ட மாலை.'
    },
    {
      name: 'சந்தன செம்பு மாலை 6 MM (54+1 மணிகள்)',
      price: 499,
      oldPrice: 699,
      category: 'malas, copper-mala, செம்பு மாலை',
      image: '/images/sandal_sample.webp',
      size: '6 MM',
      beadCount: '54+1',
      description: 'நறுமணம் தரும் சந்தன மணிகளும் செம்பு கம்பியும் இணைந்த மாலை.'
    },
    {
      name: 'ஐயப்பன் துளசி மணி மாலை 10 MM (108+1 மணிகள்)',
      price: 499,
      oldPrice: 699,
      category: 'malas, sabarimala-set, tulsi-mala',
      image: '/images/tulsi_mala_6_mm.webp',
      size: '10 MM',
      beadCount: '108+1',
      description: '10 MM ஐயப்பன் வழிபாட்டிற்குரிய புனிதமான துளசி மணி மாலை.'
    },
    {
      name: 'ஐயப்பன் துளசி மணி மாலை 8 MM (108+1 மணிகள்)',
      price: 399,
      oldPrice: 599,
      category: 'malas, sabarimala-set, tulsi-mala',
      image: '/images/tulsi_mala_6_mm.webp',
      size: '8 MM',
      beadCount: '108+1',
      description: '8 MM ஐயப்பன் மாலை அணிவதற்குரிய தூய்மையான துளசி மாலை.'
    },
    {
      name: 'இரத்த சந்தன மாலை 10 MM (108+1 மணிகள்)',
      price: 999,
      oldPrice: 1299,
      category: 'malas, red-sandalwood',
      image: '/images/red_sandalwood_mala_2.webp',
      size: '10 MM',
      beadCount: '108+1',
      description: '10 MM உயர்தர அசல் இரத்த சந்தன மணிகள் கொண்ட சக்திவாய்ந்த மாலை.'
    },
    {
      name: 'ஸ்படிக மாலை நூலில் கோர்த்தது 8 MM (108+1)',
      price: 1199,
      oldPrice: 1499,
      category: 'malas, spadika-malai',
      image: '/images/spadigam_copper_mala.webp',
      size: '8 MM',
      beadCount: '108+1',
      description: '8 MM அசல் ஸ்படிக மணிகள் நூலில் கோர்க்கப்பட்ட 108+1 தியான மாலை.'
    },
    {
      name: 'கருங்காலி வெள்ளி மாலை 8 MM (54+1)',
      price: 6299,
      oldPrice: 7299,
      category: 'malas, karungali-malai, silver-mala',
      image: '/images/karungali_mala_8_mm_without_cup.webp',
      size: '8 MM',
      beadCount: '54+1',
      description: '8 MM கருங்காலி மணிகள் மற்றும் தூய வெள்ளி கம்பி கோர்க்கப்பட்ட மாலை.'
    },
    {
      name: 'கருங்காலி வெள்ளி (Cup) மாலை 8 MM (54+1)',
      price: 11999,
      oldPrice: 13999,
      category: 'malas, karungali-malai, silver-mala, silver-products',
      image: '/images/karungali_mala_8_mm_cup.webp',
      size: '8 MM',
      beadCount: '54+1',
      description: '8 MM அசல் கருங்காலி மணிகள் தூய வெள்ளி கப் இணைப்பில் உருவான பிரீமியம் மாலை.'
    },
    {
      name: 'ஐயப்பன் துளசி மணி மாலை 6 MM (108+1 மணிகள்)',
      price: 299,
      oldPrice: 499,
      category: 'malas, sabarimala-set, tulsi-mala',
      image: '/images/tulsi_mala_6_mm.webp',
      size: '6 MM',
      beadCount: '108+1',
      description: '6 MM ஐயப்பன் விரதத்திற்குரிய புனித துளசி மணி மாலை.'
    },
    {
      name: 'சந்தன செம்பு மாலை 8 MM (54+1 மணிகள்)',
      price: 699,
      oldPrice: 899,
      category: 'malas, copper-mala, செம்பு மாலை',
      image: '/images/sandal_sample.webp',
      size: '8 MM',
      beadCount: '54+1',
      description: '8 MM சந்தன மணிகளும் தூய செம்பு கம்பியும் இணைந்த ஆன்மீக மாலை.'
    },
    {
      name: 'கருங்காலி ஐம்பொன் மாலை 8 MM (54+1 மணிகள்)',
      price: 1499,
      oldPrice: 1799,
      category: 'malas, karungali-malai, kanganakali-mala',
      image: '/images/karungali_product_collection.webp',
      size: '8 MM',
      beadCount: '54+1',
      description: '8 MM கருங்காலி மணிகளுடன் ஐம்பொன் கம்பியால் கோர்க்கப்பட்ட தெய்வீக மாலை.'
    },
    {
      name: 'கருங்காலி ஐம்பொன் மாலை 6 MM (54+1 மணிகள்)',
      price: 1299,
      oldPrice: 1499,
      category: 'malas, karungali-malai, kanganakali-mala',
      image: '/images/karungali_product_collection.webp',
      size: '6 MM',
      beadCount: '54+1',
      description: '6 MM கருங்காலி மணிகளுடன் ஐம்பொன் கம்பியால் கோர்க்கப்பட்ட மாலை.'
    },
    {
      name: 'கருங்காலி ஐம்பொன் மாலை 5 MM (54+1 மணிகள்)',
      price: 1099,
      oldPrice: 1299,
      category: 'malas, karungali-malai, kanganakali-mala',
      image: '/images/karungali_product_collection.webp',
      size: '5 MM',
      beadCount: '54+1',
      description: '5 MM கருங்காலி மணிகளுடன் ஐம்பொன் கம்பியால் கோர்க்கப்பட்ட மாலை.'
    },
    {
      name: 'ஸ்படிக மாலை நூலில் கோர்த்தது 6 MM (108+1)',
      price: 899,
      oldPrice: 1199,
      category: 'malas, spadika-malai',
      image: '/images/spadigam_copper_mala.webp',
      size: '6 MM',
      beadCount: '108+1',
      description: '6 MM அசல் ஸ்படிக மணிகள் நூலில் கோர்க்கப்பட்ட 108+1 மாலை.'
    },
    {
      name: 'கருங்காலி மாலை நூலில் கோர்த்த 8MM (108+1)',
      price: 999,
      oldPrice: 1299,
      category: 'malas, karungali-malai, kanganakali-mala',
      image: '/images/karungali_mala_8_mm_thread.webp',
      size: '8 MM',
      beadCount: '108+1',
      description: '8 MM அசல் கருங்காலி மணிகள் தூய நூலில் கோர்க்கப்பட்ட 108+1 மாலை.'
    }
  ];

  for (let m of exact30Malas) {
    let p = await Product.findOne({ name: m.name });
    if (p) {
      p.category = m.category;
      p.price = m.price;
      p.oldPrice = m.oldPrice;
      p.image = m.image;
      p.images = [
        { url: m.image, isMain: true },
        { url: '/images/karungali_certificate.webp', isMain: false }
      ];
      await p.save();
      console.log('Updated existing DB mala:', p._id, p.name);
    } else {
      const newP = new Product({
        name: m.name,
        price: m.price,
        oldPrice: m.oldPrice,
        category: m.category,
        image: m.image,
        images: [
          { url: m.image, isMain: true },
          { url: '/images/karungali_certificate.webp', isMain: false }
        ],
        size: m.size,
        beadCount: m.beadCount,
        stock: 15,
        description: m.description
      });
      await newP.save();
      console.log('Inserted missing DB mala:', newP._id, newP.name);
    }
  }

  const malaProdsInDB = await Product.find({ category: /malas/ });
  console.log('\n--- Total Malas in DB with "malas" category:', malaProdsInDB.length, '---');

  process.exit();
});
