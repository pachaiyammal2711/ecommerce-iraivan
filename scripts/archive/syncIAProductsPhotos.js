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

// Map of asset file relative names/basenames to public URLs
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
        // Also map lowecased/cleaned key
        assetFileMap[item.toLowerCase()] = urlPath;
      } catch (err) {
        console.error(`Error copying ${item}:`, err);
      }
    }
  });
}

scanAndMirrorDir(iaBaseDir);
console.log(`Successfully mirrored ${Object.keys(assetFileMap).length} asset files to frontend/public/images/`);

const syncIAProductsPhotos = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({});
    if (!adminUser) {
      console.error('No admin user found!');
      process.exit(1);
    }

    // List of product definitions matching folders/files in IA Products Photos
    const iaProductsList = [
      {
        name: 'செங்கந்த மாலை',
        nameEn: 'Red Sandalwood Mala',
        category: 'malas',
        files: ['Red Sandalwood Mala.webp', 'Red Sandalwood Mala_1.webp', 'Red Sandalwood Mala_2.webp']
      },
      {
        name: 'துளசி மாலை',
        nameEn: 'Thulasi Mala',
        category: 'malas',
        files: ['Thulasi Mala.webp', 'Thulasi Mala_2.webp', 'Thulasi Mala_3.webp', 'Thulasi Mala_4.webp', 'thulasi_malai.webp']
      },
      {
        name: 'கருங்காலி ஐம்பொன் மாலை',
        nameEn: 'Karungali Impon Mala',
        category: 'karungali-products',
        files: [
          'Karungali Impon Mala.webp',
          'Karungali Mala Impon_3.webp',
          'Karungali Mala Impon_Full View.webp',
          'Karungali Mala Impon_Full View.webp',
          'Karungali Mala Impon_Without_Cup.webp',
          'Karungali Mala Impon_Without_Cup_1.webp',
          'Karungali Mala Impon_Without_Cup_2.webp'
        ]
      },
      {
        name: 'சந்தன செம்பு மாலை',
        nameEn: 'Chandan Copper Mala',
        category: 'copper-mala',
        files: ['Chandan Copper Mala.webp', 'Chandan Copper Mala_1.webp', 'Chandan Copper Mala_2.webp']
      },
      {
        name: 'கருங்காலி லிங்கம்',
        nameEn: 'Karungali Lingam',
        category: 'karungali-products',
        files: ['Karungali Lingam.webp', 'Karungali Lingam_1.webp', 'Karungali Lingam_2.webp']
      },
      {
        name: 'கருங்காலி கட்டை',
        nameEn: 'Karungali Kattai',
        category: 'karungali-products',
        files: ['Karungali Kattai.webp', 'Karungali Kattai_1.webp', 'Karungali Kattai_2.webp']
      },
      {
        name: 'கருங்காலி வேல்',
        nameEn: 'Karungali Vel',
        category: 'karungali-products',
        files: ['Karungali Vel.webp', 'Karungali Vel_1.webp', 'Karungali Vel_2.webp']
      },
      {
        name: 'கருங்காலி வளையல் வெள்ளி கப் 6 MM',
        nameEn: 'Karungali Bracelet Silver Cup 6 MM',
        category: 'kanganakali-bracelet',
        files: ['Karungali Bracelet Silver Cup 6 MM.webp', 'Karungali Bracelet Silver Cup 6 MM_1.webp', 'Karungali Bracelet Silver Cup 6 MM_2.webp']
      },
      {
        name: 'கருங்காலி வளையல் வெள்ளி கப் 8 MM',
        nameEn: 'Karungali Bracelet Silver Cup 8 MM',
        category: 'kanganakali-bracelet',
        files: ['Karungali Bracelet Silver Cup 8 MM.webp', 'Karungali Bracelet Silver Cup 8 MM_1.webp', 'Karungali Bracelet Silver Cup 8 MM_2.webp', 'Karungali Bracelet Silver Cup 8 MM_3.webp']
      },
      {
        name: 'கருங்காலி வளையல் வெள்ளி கப்பின்றி 6 MM',
        nameEn: 'Karungali Bracelet Silver Without Cup 6 MM',
        category: 'kanganakali-bracelet',
        files: ['Karungali Bracelet Silver Without Cup 6 MM_1.webp', 'Karungali Bracelet Silver Without Cup 6 MM_2.webp', 'Karungali Bracelet Silver Without Cup 6 MM_3.webp', 'Karungali Bracelet Silver Without Cup 6 MM_4.webp']
      },
      {
        name: 'கருங்காலி வளையல் வெள்ளி கப்பின்றி 8 MM',
        nameEn: 'Karungali Bracelet Silver Without Cup 8 MM',
        category: 'kanganakali-bracelet',
        files: ['Karungali Bracelet Silver Without Cup 8 MM.webp', 'Karungali Bracelet Silver Without Cup 8 MM_1.webp', 'Karungali Bracelet Silver Without Cup 8 MM_2.webp', 'Karungali Bracelet Silver Without Cup 8 MM_3.webp']
      },
      {
        name: 'கருங்காலி சாதாரண வளையல் 6 MM',
        nameEn: 'Karungali Bracelet Normal 6 MM',
        category: 'kanganakali-bracelet',
        files: ['Karungali Bracelet Normal 6 MM.webp', 'Karungali Bracelet Normal 6 MM_Free_Size.webp']
      },
      {
        name: 'கருங்காலி திரிசூலம் 6 இன்ச்',
        nameEn: 'Karungali Thirisoolam 6 Inch',
        category: 'kanganakali-products',
        files: ['Karungali Thirisoolam 6 Inch.webp', 'Karungali Thirisoolam 6 Inch_1.webp', 'Karungali Thirisoolam 6 Inch_2.webp']
      }
    ];

    for (const item of iaProductsList) {
      const urls = item.files.map(f => assetFileMap[f] || assetFileMap[f.toLowerCase()]).filter(Boolean);
      if (urls.length === 0) continue;

      const existingProd = await Product.findOne({
        $or: [
          { name: item.name },
          { nameEn: item.nameEn }
        ]
      });

      if (existingProd) {
        if (!existingProd.nameEn) existingProd.nameEn = item.nameEn;
        const currentUrls = (existingProd.images || []).map(img => img.url);
        urls.forEach(u => {
          if (!currentUrls.includes(u)) {
            currentUrls.push(u);
          }
        });
        existingProd.image = existingProd.image || currentUrls[0];
        existingProd.images = currentUrls.map((url, i) => ({ url, isMain: i === 0 }));
        await existingProd.save();
        console.log(`Updated Product: [${existingProd.name}] (Gallery: ${currentUrls.length} images)`);
      } else {
        const newProd = await Product.create({
          user: adminUser._id,
          name: item.name,
          nameEn: item.nameEn,
          category: item.category,
          price: 599,
          oldPrice: 899,
          status: 'In Stock',
          countInStock: 10,
          description: `${item.nameEn} - உயர் தர ஆன்மிக தயாரிப்பு.`,
          rating: 5,
          numReviews: 12,
          image: urls[0],
          images: urls.map((url, i) => ({ url, isMain: i === 0 }))
        });
        console.log(`Created Product: [${newProd.name}] (Gallery: ${urls.length} images)`);
      }
    }

    console.log('\n--- ALL IA PRODUCTS PHOTOS SYNCED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('Error during IA products photo sync:', error);
    process.exit(1);
  }
};

syncIAProductsPhotos();
