require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/productModel');
const User = require('./models/userModel');

const iaBaseDir = path.join(__dirname, '../frontend/src/assets');
const publicImagesDir = path.join(__dirname, '../frontend/public/images');

if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

// Function to normalize filename for public/images
const toSnakeCase = (filename) => {
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${clean}${ext.toLowerCase()}`;
};

// Map of asset file names to public URLs
const assetFileMap = {};

function scanAndMirrorDir(dir) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanAndMirrorDir(fullPath);
    } else if (['.webp', '.webp', '.webp', '.webp'].includes(path.extname(item).toLowerCase())) {
      const publicName = toSnakeCase(item);
      const destPath = path.join(publicImagesDir, publicName);
      try {
        fs.copyFileSync(fullPath, destPath);
        const urlPath = `/images/${publicName}`;
        assetFileMap[item] = urlPath;
        assetFileMap[item.toLowerCase()] = urlPath;
      } catch (err) {
        console.error(`Error copying ${item}:`, err);
      }
    }
  });
}

scanAndMirrorDir(iaBaseDir);
console.log(`Mirrored asset files to public/images.`);

const kanganakaliProducts = [
  {
    name: 'கருங்காலி வேல் 3 இன்ச்',
    nameEn: 'Karungali Vel 3 Inch',
    category: 'kanganakali-products',
    price: 399,
    oldPrice: 599,
    files: ['Karungali Vel.webp', 'Karungali Vel_1.webp', 'Karungali Vel_2.webp']
  },
  {
    name: 'கருங்காலி வேல் 6 இன்ச்',
    nameEn: 'Karungali Vel 6 Inch',
    category: 'kanganakali-products',
    price: 699,
    oldPrice: 899,
    files: ['Karungali Vel.webp', 'Karungali Vel_1.webp', 'Karungali Vel_2.webp']
  },
  {
    name: 'கருங்காலி வேல் 9 இன்ச்',
    nameEn: 'Karungali Vel 9 Inch',
    category: 'kanganakali-products',
    price: 999,
    oldPrice: 1299,
    files: ['Karungali Vel.webp', 'Karungali Vel_1.webp', 'Karungali Vel_2.webp']
  },
  {
    name: 'கருங்காலி சாஸ்தர வேல் 6 இன்ச்',
    nameEn: 'Karungali Sasthara Vel 6 Inch',
    category: 'kanganakali-products',
    price: 749,
    oldPrice: 999,
    files: ['Karungali Vel.webp', 'Karungali Vel_1.webp', 'Karungali Vel_2.webp']
  },
  {
    name: 'கருங்காலி வேல் கீச்செயின் 2 இன்ச்',
    nameEn: 'Karungali Vel Keychain 2 Inch',
    category: 'kanganakali-products',
    price: 199,
    oldPrice: 299,
    files: ['Karungali Vel.webp', 'Karungali Vel_1.webp']
  },
  {
    name: 'கருங்காலி ஓம் கீச்செயின் 2 இன்ச்',
    nameEn: 'Karungali Om Keychain 2 Inch',
    category: 'kanganakali-products',
    price: 199,
    oldPrice: 299,
    files: ['karungali barcelet collection.webp', 'Karungaliproductcollection.webp']
  },
  {
    name: 'கருங்காலி இந்தி ஓம் கீச்செயின் 2 இன்ச்',
    nameEn: 'Karungali Hindi Om Keychain 2 Inch',
    category: 'kanganakali-products',
    price: 199,
    oldPrice: 299,
    files: ['karungali barcelet collection.webp', 'Karungaliproductcollection.webp']
  },
  {
    name: 'கருங்காலி வெள்ளி தாயத்து 1.5 இன்ச்',
    nameEn: 'Karungali Silver Thayath 1.5 Inch',
    category: 'kanganakali-products',
    price: 499,
    oldPrice: 699,
    files: ['Karungali Silver Dollarcollection.webp', 'Karungali Bracelet Silver collection.webp']
  },
  {
    name: 'கருங்காலி எலாஸ்டிக்',
    nameEn: 'Karungali Elastic',
    category: 'kanganakali-products',
    price: 149,
    oldPrice: 249,
    files: ['Karungali Bracelet Normal 6 MM.webp', 'Karungali Bracelet Normal 6 MM_Free_Size.webp']
  },
  {
    name: 'கருங்காலி கட்டை 3 இன்ச்',
    nameEn: 'Karungali Kattai 3 Inch',
    category: 'kanganakali-products',
    price: 299,
    oldPrice: 449,
    files: ['Karungali Kattai.webp', 'Karungali Kattai_1.webp', 'Karungali Kattai_2.webp']
  },
  {
    name: 'கருங்காலி கட்டை 6 இன்ச்',
    nameEn: 'Karungali Kattai 6 Inch',
    category: 'kanganakali-products',
    price: 499,
    oldPrice: 699,
    files: ['Karungali Kattai.webp', 'Karungali Kattai_1.webp', 'Karungali Kattai_2.webp']
  },
  {
    name: 'கருங்காலி கட்டை 3 இன்ச் (10 MM சுற்றளவு)',
    nameEn: 'Karungali Kattai 3 Inch 10MM',
    category: 'kanganakali-products',
    price: 349,
    oldPrice: 499,
    files: ['Karungali Kattai.webp', 'Karungali Kattai_1.webp', 'Karungali Kattai_2.webp']
  },
  {
    name: 'கருங்காலி சிவலிங்க கட்டை 6 இன்ச்',
    nameEn: 'Karungali Shivalinga Kattai 6 Inch',
    category: 'kanganakali-products',
    price: 799,
    oldPrice: 999,
    files: ['Karungali Lingam.webp', 'Karungali Lingam_1.webp', 'Karungali Lingam_2.webp']
  },
  {
    name: 'கருங்காலி விங்கம் 2 இன்ச்',
    nameEn: 'Karungali Lingam 2 Inch',
    category: 'kanganakali-products',
    price: 399,
    oldPrice: 599,
    files: ['Karungali Lingam.webp', 'Karungali Lingam_1.webp', 'Karungali Lingam_2.webp']
  },
  {
    name: 'கருங்காலி வெள்ளி [Cup] வளையல் (Bracelet) 8 MM',
    nameEn: 'Karungali Silver Cup Bracelet 8 MM',
    category: 'kanganakali-products',
    price: 1299,
    oldPrice: 1599,
    files: ['Karungali Bracelet Silver Cup 8 MM.webp', 'Karungali Bracelet Silver Cup 8 MM_1.webp', 'Karungali Bracelet Silver Cup 8 MM_2.webp', 'Karungali Bracelet Silver Cup 8 MM_3.webp']
  },
  {
    name: 'கருங்காலி வெள்ளி [Cup] வளையல் (Bracelet) 6 MM',
    nameEn: 'Karungali Silver Cup Bracelet 6 MM',
    category: 'kanganakali-products',
    price: 1099,
    oldPrice: 1399,
    files: ['Karungali Bracelet Silver Cup 6 MM.webp', 'Karungali Bracelet Silver Cup 6 MM_1.webp', 'Karungali Bracelet Silver Cup 6 MM_2.webp']
  },
  {
    name: 'கருங்காலி வெள்ளி வளையல் (Bracelet) 8 MM',
    nameEn: 'Karungali Silver Bracelet 8 MM',
    category: 'kanganakali-products',
    price: 1199,
    oldPrice: 1499,
    files: ['Karungali Bracelet Silver Without Cup 8 MM.webp', 'Karungali Bracelet Silver Without Cup 8 MM_1.webp', 'Karungali Bracelet Silver Without Cup 8 MM_2.webp', 'Karungali Bracelet Silver Without Cup 8 MM_3.webp']
  },
  {
    name: 'கருங்காலி வெள்ளி வளையல் (Bracelet) 6 MM',
    nameEn: 'Karungali Silver Bracelet 6 MM',
    category: 'kanganakali-products',
    price: 999,
    oldPrice: 1299,
    files: ['Karungali Bracelet Silver Without Cup 6 MM_1.webp', 'Karungali Bracelet Silver Without Cup 6 MM_2.webp', 'Karungali Bracelet Silver Without Cup 6 MM_3.webp', 'Karungali Bracelet Silver Without Cup 6 MM_4.webp']
  },
  {
    name: 'கருங்காலி எலாஸ்டிக் வளையல் (Elastic Bracelet) 8 MM',
    nameEn: 'Karungali Elastic Bracelet 8 MM',
    category: 'kanganakali-products',
    price: 299,
    oldPrice: 449,
    files: ['Karungali Bracelet Normal 6 MM.webp', 'Karungali Bracelet Normal 6 MM_Free_Size.webp']
  },
  {
    name: 'கருங்காலி வெள்ளி டாலர் 20 MM',
    nameEn: 'Karungali Silver Dollar 20 MM',
    category: 'kanganakali-products',
    price: 799,
    oldPrice: 999,
    files: ['Karungali Silver Dollarcollection.webp', 'Karungali Bracelet Silver collection.webp']
  },
  {
    name: 'கருங்காலி வெள்ளி டாலர் 16 MM',
    nameEn: 'Karungali Silver Dollar 16 MM',
    category: 'kanganakali-products',
    price: 699,
    oldPrice: 899,
    files: ['Karungali Silver Dollarcollection.webp', 'Karungali Bracelet Silver collection.webp']
  },
  {
    name: 'கருங்காலி வெள்ளி டாலர் 14 MM',
    nameEn: 'Karungali Silver Dollar 14 MM',
    category: 'kanganakali-products',
    price: 599,
    oldPrice: 799,
    files: ['Karungali Silver Dollarcollection.webp', 'Karungali Bracelet Silver collection.webp']
  }
];

const seedKanganakali = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({});
    if (!adminUser) {
      console.error('No admin user found!');
      process.exit(1);
    }

    for (const item of kanganakaliProducts) {
      const urls = item.files.map(f => assetFileMap[f] || assetFileMap[f.toLowerCase()]).filter(Boolean);
      const mainImg = urls.length > 0 ? urls[0] : '/images/karungali_product_collection.webp';
      const imagesArr = urls.length > 0 ? urls.map((url, i) => ({ url, isMain: i === 0 })) : [{ url: mainImg, isMain: true }];

      const existingProd = await Product.findOne({
        $or: [
          { name: item.name },
          { nameEn: item.nameEn }
        ]
      });

      if (existingProd) {
        existingProd.nameEn = item.nameEn;
        existingProd.category = item.category;
        existingProd.image = existingProd.image && existingProd.image !== 'undefined' ? existingProd.image : mainImg;
        const currentUrls = (existingProd.images || []).map(i => i.url);
        urls.forEach(u => {
          if (!currentUrls.includes(u)) currentUrls.push(u);
        });
        existingProd.images = currentUrls.map((url, i) => ({ url, isMain: i === 0 }));
        await existingProd.save();
        console.log(`Updated Kanganakali DB Product: [${existingProd.name}]`);
      } else {
        await Product.create({
          user: adminUser._id,
          name: item.name,
          nameEn: item.nameEn,
          category: item.category,
          price: item.price,
          oldPrice: item.oldPrice,
          status: 'In Stock',
          countInStock: 10,
          description: `${item.nameEn} - உயர் தர புனித தயாரிப்பு.`,
          rating: 5,
          numReviews: 10,
          image: mainImg,
          images: imagesArr
        });
        console.log(`Created Kanganakali DB Product: [${item.name}]`);
      }
    }

    console.log('\n--- KANGANAKALI DB SEED COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Kanganakali products:', err);
    process.exit(1);
  }
};

seedKanganakali();
