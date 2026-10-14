require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/productModel');
const User = require('./models/userModel');

const assetsDir = path.join(__dirname, '../frontend/src/assets');
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

// Map of asset original names to public URLs
const assetFileMap = {};
const allAssetFiles = fs.readdirSync(assetsDir);

allAssetFiles.forEach(file => {
  if (['.webp', '.webp', '.webp', '.webp'].includes(path.extname(file).toLowerCase())) {
    const publicName = toSnakeCase(file);
    const srcPath = path.join(assetsDir, file);
    const destPath = path.join(publicImagesDir, publicName);
    
    // Copy file to public/images
    fs.copyFileSync(srcPath, destPath);
    assetFileMap[file] = `/images/${publicName}`;
  }
});

console.log(`Successfully mirrored ${Object.keys(assetFileMap).length} images to frontend/public/images/`);

const seedProductAssets = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({});
    if (!adminUser) {
      console.error('No admin user found!');
      process.exit(1);
    }

    // List of products with their corresponding image files in assets
    const productAssetMap = [
      // Rudraksha Beads
      {
        name: '3 முக ருத்ராட்சம்',
        nameEn: '3 Face Rudraksha',
        category: 'rudraksha',
        files: [
          '3 Face Rudraksham.webp',
          '3 Face Rudraksham_With_Face.webp',
          '3 Face Rudraksham_Planet.webp',
          '3 Face Rudraksham_God.webp',
          '3 Face Rudraksham_All_Items.webp'
        ]
      },
      {
        name: '4 முக ருத்ராட்சம்',
        nameEn: '4 Face Rudraksha',
        category: 'rudraksha',
        files: [
          '4 Face Rudraksham.webp',
          '4 Face Rudraksham_With Faces.webp',
          '4 Face Rudraksham_Planet.webp',
          '4 Face Rudraksham_God.webp',
          '4 Face Rudraksham_All_Items.webp'
        ]
      },
      {
        name: '5 முக ருத்ராட்சம்',
        nameEn: '5 Face Rudraksha',
        category: 'rudraksha',
        files: [
          '5 Face Rudraksham.webp',
          '5 Face Rudraksham_With Faces.webp',
          '5 Face Rudraksham_Planet.webp',
          '5 Face Rudraksham_God.webp',
          '5 Face Rudraksham_All_Items.webp'
        ]
      },
      {
        name: '6 முக ருத்ராட்சம்',
        nameEn: '6 Face Rudraksha',
        category: 'rudraksha',
        files: [
          '6 Face Rudraksham.webp',
          '6 Face Rudraksham_With Faces.webp',
          '6 Face Rudraksham_Planet.webp',
          '6 Face Rudraksham_God.webp',
          '6 Face Rudraksham_All_Items.webp'
        ]
      },
      {
        name: '7 முக ருத்ராட்சம்',
        nameEn: '7 Face Rudraksha',
        category: 'rudraksha',
        files: [
          '7 Face Rudraksham.webp',
          '7 Face Rudraksham_With_Face.webp',
          '7 Face Rudraksham_Planet.webp',
          '7 Face Rudraksham_God.webp',
          '7 Face Rudraksham_All_Items.webp'
        ]
      },
      {
        name: 'கணேஷ் ருத்ராட்சம்',
        nameEn: 'Ganesh Rudraksham',
        category: 'rudraksha',
        files: [
          'Ganesh Rudraksham.webp',
          'Ganesh Rudraksham_With Free Gift.webp',
          'Ganesh Rudraksham_With God.webp',
          'Ganesh Rudraksham_With Thudhikkai.webp'
        ]
      },
      {
        name: 'கணேஷ் ருத்ராட்சம் வெள்ளி டாலர்',
        nameEn: 'Ganesh Rudraksham Silver Dollar',
        category: 'silver-dollars',
        files: [
          'Ganesh Rudraksham Silver.webp',
          'Ganesh Rudraksham Silver_1.webp',
          'Ganesh Rudraksham Silver_2.webp'
        ]
      },
      // Bracelets
      {
        name: 'கருங்காலி வளையல் வெள்ளி கப் 6 MM',
        nameEn: 'Karungali Bracelet Silver Cup 6 MM',
        category: 'kanganakali-bracelet',
        files: [
          'Karungali Bracelet Silver Cup 6 MM.webp',
          'Karungali Bracelet Silver Cup 6 MM_1.webp',
          'Karungali Bracelet Silver Cup 6 MM_2.webp'
        ]
      },
      {
        name: 'கருங்காலி வளையல் வெள்ளி கப் 8 MM',
        nameEn: 'Karungali Bracelet Silver Cup 8 MM',
        category: 'kanganakali-bracelet',
        files: [
          'Karungali Bracelet Silver Cup 8 MM.webp',
          'Karungali Bracelet Silver Cup 8 MM_1.webp',
          'Karungali Bracelet Silver Cup 8 MM_2.webp',
          'Karungali Bracelet Silver Cup 8 MM_3.webp'
        ]
      },
      {
        name: 'கருங்காலி வளையல் வெள்ளி கப்பின்றி 6 MM',
        nameEn: 'Karungali Bracelet Silver Without Cup 6 MM',
        category: 'kanganakali-bracelet',
        files: [
          'Karungali Bracelet Silver Without Cup 6 MM_1.webp',
          'Karungali Bracelet Silver Without Cup 6 MM_2.webp',
          'Karungali Bracelet Silver Without Cup 6 MM_3.webp',
          'Karungali Bracelet Silver Without Cup 6 MM_4.webp'
        ]
      },
      {
        name: 'கருங்காலி வளையல் வெள்ளி கப்பின்றி 8 MM',
        nameEn: 'Karungali Bracelet Silver Without Cup 8 MM',
        category: 'kanganakali-bracelet',
        files: [
          'Karungali Bracelet Silver Without Cup 8 MM.webp',
          'Karungali Bracelet Silver Without Cup 8 MM_1.webp',
          'Karungali Bracelet Silver Without Cup 8 MM_2.webp',
          'Karungali Bracelet Silver Without Cup 8 MM_3.webp'
        ]
      },
      {
        name: 'கருங்காலி சாதாரண வளையல் 6 MM',
        nameEn: 'Karungali Bracelet Normal 6 MM',
        category: 'kanganakali-bracelet',
        files: [
          'Karungali Bracelet Normal 6 MM.webp',
          'Karungali Bracelet Normal 6 MM_Free_Size.webp'
        ]
      },
      // Thirisoolam & Accessories
      {
        name: 'கருங்காலி திரிசூலம் 6 இன்ச்',
        nameEn: 'Karungali Thirisoolam 6 Inch',
        category: 'kanganakali-products',
        files: [
          'Karungali Thirisoolam 6 Inch.webp',
          'Karungali Thirisoolam 6 Inch_1.webp',
          'Karungali Thirisoolam 6 Inch_2.webp'
        ]
      }
    ];

    for (const item of productAssetMap) {
      const urls = item.files.map(f => assetFileMap[f]).filter(Boolean);
      if (urls.length === 0) continue;

      const existingProd = await Product.findOne({
        $or: [
          { name: item.name },
          { nameEn: item.nameEn }
        ]
      });

      if (existingProd) {
        const currentUrls = (existingProd.images || []).map(img => img.url);
        urls.forEach(u => {
          if (!currentUrls.includes(u)) {
            currentUrls.push(u);
          }
        });
        existingProd.image = existingProd.image || currentUrls[0];
        existingProd.images = currentUrls.map((url, i) => ({ url, isMain: i === 0 }));
        await existingProd.save();
        console.log(`Updated Product: ${existingProd.name} (Gallery: ${currentUrls.length} images)`);
      } else {
        const newProd = await Product.create({
          user: adminUser._id,
          name: item.name,
          nameEn: item.nameEn,
          category: item.category,
          price: 499,
          oldPrice: 799,
          status: 'In Stock',
          countInStock: 10,
          description: `${item.nameEn} - உயர் தர ஆன்மிக தயாரிப்பு.`,
          rating: 5,
          numReviews: 10,
          image: urls[0],
          images: urls.map((url, i) => ({ url, isMain: i === 0 }))
        });
        console.log(`Created Product: ${newProd.name} (Gallery: ${urls.length} images)`);
      }
    }

    console.log('\n--- SEED & SYNC COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('Error during asset seeding:', error);
    process.exit(1);
  }
};

seedProductAssets();
