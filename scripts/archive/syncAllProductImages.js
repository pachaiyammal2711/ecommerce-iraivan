require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/productModel');

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
    
    // Copy to public/images if not exists or update
    fs.copyFileSync(srcPath, destPath);
    assetFileMap[file] = `/images/${publicName}`;
  }
});

console.log(`Copied ${Object.keys(assetFileMap).length} image files to public/images/`);

const syncImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Auditing ${products.length} products...\n`);

    for (const prod of products) {
      if (!prod.nameEn) {
        prod.nameEn = prod.name;
      }

      const existingUrls = (prod.images || []).map(img => img.url);
      const newUrls = [...existingUrls];

      // Identify corresponding asset files for this product based on name/nameEn
      const matches = [];

      // 1. Karungali Malai Original / கருங்காலி மாலை (10mm)
      if (prod.name.includes('கருங்காலி மாலை (10mm)') || prod.name.includes('Karungali Malai Original')) {
        const files = ['Karungali Mala collection.webp', 'Karungali Mala in collection.webp', 'Karungaliproductcollection.webp'];
        files.forEach(f => { if (assetFileMap[f]) matches.push(assetFileMap[f]); });
      }

      // 2. 5 Mukhi Rudraksha / 5 முக ருத்ராட்சம் / ருத்ராட்ச மாலை (5 முகி)
      else if (prod.name === '5 முக ருத்ராட்சம்' || prod.name === '5 Mukhi Rudraksha') {
        const files = [
          '5 Face Rudraksham.webp',
          '5 Face Rudraksham_With Faces.webp',
          '5 Face Rudraksham_Planet.webp',
          '5 Face Rudraksham_God.webp',
          '5 Face Rudraksham_All_Items.webp'
        ];
        files.forEach(f => { if (assetFileMap[f]) matches.push(assetFileMap[f]); });
      }

      // 3. 4 Mukhi Rudraksha / 4 முக ருத்ராட்சம்
      else if (prod.name === '4 முக ருத்ராட்சம்' || prod.name === '4 Face Rudraksha') {
        const files = [
          '4 Face Rudraksham.webp',
          '4 Face Rudraksham_With Faces.webp',
          '4 Face Rudraksham_Planet.webp',
          '4 Face Rudraksham_God.webp',
          '4 Face Rudraksham_All_Items.webp'
        ];
        files.forEach(f => { if (assetFileMap[f]) matches.push(assetFileMap[f]); });
      }

      // 4. 6 Mukhi Rudraksha / 6 முக ருத்ராட்சம்
      else if (prod.name === '6 முக ருத்ராட்சம்' || prod.name === '6 Face Rudraksha') {
        const files = [
          '6 Face Rudraksham.webp',
          '6 Face Rudraksham_With Faces.webp',
          '6 Face Rudraksham_Planet.webp',
          '6 Face Rudraksham_God.webp',
          '6 Face Rudraksham_All_Items.webp'
        ];
        files.forEach(f => { if (assetFileMap[f]) matches.push(assetFileMap[f]); });
      }

      // 5. 7 Mukhi Rudraksha / 7 முக ருத்ராட்சம்
      else if (prod.name === '7 முக ருத்ராட்சம்' || prod.name === '7 Face Rudraksha') {
        const files = [
          '7 Face Rudraksham.webp',
          '7 Face Rudraksham_With_Face.webp',
          '7 Face Rudraksham_Planet.webp',
          '7 Face Rudraksham_God.webp',
          '7 Face Rudraksham_All_Items.webp'
        ];
        files.forEach(f => { if (assetFileMap[f]) matches.push(assetFileMap[f]); });
      }

      // 6. 5 முக ருத்ராட்ச செம்பு மாலை (5 MM, 6 MM, 8 MM, 10 MM)
      else if (prod.name.includes('5 முக ருத்ராட்ச செம்பு மாலை') || prod.category === 'ருத்ராட்ச மாலை') {
        const files = [
          '5 Face Rudraksha Copper Mala.webp',
          '5 Face Rudraksha Copper Mala_1.webp',
          '5 Face Rudraksha Copper Mala_3.webp',
          '5 Face Rudraksham_God.webp',
          '5 Face Rudraksham_Planet.webp',
          'Rudraksham_Free_Gift.webp'
        ];
        files.forEach(f => { if (assetFileMap[f]) matches.push(assetFileMap[f]); });
      }

      // 7. கருங்காலி செம்பு மாலை 8 MM (54+1)
      else if (prod.name.includes('கருங்காலி செம்பு மாலை 8 MM')) {
        const files = [
          'Karungali Copper Mala 8 MM.webp',
          'Karungali Copper Mala 8 MM_1.webp',
          'Karungali Copper Mala 8 MM_2.webp',
          'Karungali Copper Mala 8 MM_3.webp'
        ];
        files.forEach(f => { if (assetFileMap[f]) matches.push(assetFileMap[f]); });
      }

      // 8. ஸ்படிக மாலை செம்பு (6 MM, 8 MM)
      else if (prod.name.includes('ஸ்படிக மாலை செம்பு')) {
        const files = [
          'Spadigam Copper Mala_1.webp',
          'Spadigam Copper Mala.webp',
          'Spadigam Copper Mala_2.webp',
          'Spadigam Copper Mala_3.webp'
        ];
        files.forEach(f => { if (assetFileMap[f]) matches.push(assetFileMap[f]); });
      }

      // 9. ஸ்படிக மாலை நூலில் கோர்த்தது (6 MM, 8 MM)
      else if (prod.name.includes('ஸ்படிக மாலை நூலில் கோர்த்தது')) {
        const files = [
          'Spadiga Mala 8 MM.webp',
          'Spadiga Mala 8 MM_1.webp',
          'Spadiga Mala 8 MM_2.webp',
          'Spadiga Mala 8 MM_3.webp'
        ];
        files.forEach(f => { if (assetFileMap[f]) matches.push(assetFileMap[f]); });
      }

      // 10. தேவதாரு செம்பு மாலை
      else if (prod.name.includes('தேவதாரு செம்பு மாலை')) {
        const files = [
          'Devdharu Mala 6 MM.webp',
          'Devdharu Mala 6 MM_1.webp',
          'Devdharu Mala 6 MM_2.webp',
          'Devdharu Mala_1.webp',
          'Devdharu Mala.webp'
        ];
        files.forEach(f => { if (assetFileMap[f]) matches.push(assetFileMap[f]); });
      }

      // 11. பஞ்சகவ்ய விளக்கு
      else if (prod.name.includes('பஞ்சகவ்ய விளக்கு') || prod.category === 'Panjakavya Vilaku') {
        const files = [
          'Panjakavya Vilaku.webp',
          'Panjakavya Vilaku_1.webp',
          'Panjakavya Vilaku_2.webp',
          'Panjakavya Vilaku_3.webp'
        ];
        files.forEach(f => { if (assetFileMap[f]) matches.push(assetFileMap[f]); });
      }

      // 12. கணேஷ் ருத்ராட்சம் வெள்ளி டாலர்
      else if (prod.name.includes('கணேஷ் ருத்ராட்சம்')) {
        const files = [
          'Ganesh Rudraksham Silver.webp',
          'Ganesh Rudraksham Silver_1.webp',
          'Ganesh Rudraksham Silver_2.webp'
        ];
        files.forEach(f => { if (assetFileMap[f]) matches.push(assetFileMap[f]); });
      }

      // Add missing matched URLs without duplicating existing ones
      matches.forEach(url => {
        if (!newUrls.includes(url)) {
          newUrls.push(url);
        }
      });

      // Update product if images changed or if main image was missing
      if (newUrls.length > 0) {
        if (!prod.image || prod.image === 'undefined' || prod.image === '') {
          prod.image = newUrls[0];
        }
        prod.images = newUrls.map((url, i) => ({ url, isMain: i === 0 }));
        await prod.save();
        console.log(`Updated Product [${prod.name}]: ${existingUrls.length} -> ${newUrls.length} images.`);
      } else {
        await prod.save();
        console.log(`Saved Product [${prod.name}] without image changes.`);
      }
    }

    console.log('\n--- MASTER SYNC FINISHED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('Error during master sync:', err);
    process.exit(1);
  }
};

syncImages();
