const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const srcDir = path.resolve('../frontend/src/assets/IA Products Photos/Photo Frames');
const destDir = path.resolve('../frontend/public/images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 1. Ensure all files from Photo Frames exist in public/images with clean snake_case filenames
const srcFiles = fs.readdirSync(srcDir);
srcFiles.forEach(f => {
  if (['.webp', '.webp', '.webp', '.webp'].includes(path.extname(f).toLowerCase())) {
    const cleanName = path.basename(f, path.extname(f))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') + path.extname(f).toLowerCase();
    
    const destPath = path.join(destDir, cleanName);
    fs.copyFileSync(path.join(srcDir, f), destPath);
    console.log('Copied frame image:', cleanName);
  }
});

mongoose.connect('mongodb://127.0.0.1:27017/iraivan_angadi').then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({}, {strict: false}));
  const adminUserId = new mongoose.Types.ObjectId();

  const exact16Pictures = [
    {
      id: 222,
      name: 'சிவன், பார்வதி, விநாயகர், முருகர் (Shivan with Family Golden Foil Printed Photo Frame_6*8_Inches)',
      price: 299,
      oldPrice: 499,
      category: 'pictures',
      image: '/images/shivan_with_family_golden_foil_printed_photo_frame_dimensions.webp',
      images: [
        '/images/shivan_with_family_golden_foil_printed_photo_frame_dimensions.webp',
        '/images/shivan_with_family_golden_foil_printed_photo_frame.webp'
      ],
      frameType: 'Golden Foil Printed (6*8 Inches)',
      description: 'Golden Foil Printed வடிவமைப்பில் உருவாக்கப்பட்ட சிவன், பார்வதி, விநாயகர், முருகர் புகைப்பட அலங்காரம் (6*8 Inches).'
    },
    {
      id: 223,
      name: 'விநாயகர் (Vinayagar Photo Golden Frame)',
      price: 249,
      oldPrice: 350,
      category: 'pictures',
      image: '/images/vinayagar_photo_golden_frame.webp',
      images: [
        '/images/vinayagar_photo_golden_frame.webp',
        '/images/vinayagar_photo_golden_frame_dimensions.webp'
      ],
      frameType: 'Golden Frame',
      description: 'நேர்த்தியான தங்க நிற பிரேமில் அமைந்த விநாயகர் புகைப்பட அலங்காரம்.'
    },
    {
      id: 224,
      name: 'சரஸ்வதி (Saraswathi Photo Golden Frame)',
      price: 249,
      oldPrice: 350,
      category: 'pictures',
      image: '/images/saraswathi_photo_golden_frame.webp',
      images: [
        '/images/saraswathi_photo_golden_frame.webp',
        '/images/saraswathi_photo_golden_frame_dimensions.webp'
      ],
      frameType: 'Golden Frame',
      description: 'கலைமகள் சரஸ்வதி தேவியின் அருள் தரும் தங்க பிரேம் புகைப்பட அலங்காரம்.'
    },
    {
      id: 225,
      name: 'விநாயகர் (Vinayagar Golden Foil Printed Photo Frame)',
      price: 449,
      oldPrice: 550,
      category: 'pictures',
      image: '/images/vinayagar_golden_foil_printed_photo_frame.webp',
      images: [
        '/images/vinayagar_golden_foil_printed_photo_frame.webp',
        '/images/vinayagar_golden_foil_printed_photo_frame_dimensions.webp'
      ],
      frameType: 'Golden Foil Printed',
      description: 'Golden Foil Printed உயர்தர வடிவமைப்பில் உருவாக்கப்பட்ட கணபதி புகைப்பட பிரேம்.'
    },
    {
      id: 226,
      name: 'சிவன், பார்வதி, விநாயகர், முருகர் (Shivan with Family Golden Foil Printed Photo Frame)',
      price: 449,
      oldPrice: 550,
      category: 'pictures',
      image: '/images/shivan_with_family_golden_foil_printed_photo_frame.webp',
      images: [
        '/images/shivan_with_family_golden_foil_printed_photo_frame.webp',
        '/images/shivan_with_family_golden_foil_printed_photo_frame_dimensions.webp'
      ],
      frameType: 'Golden Foil Printed',
      description: 'சிவ குடும்பத்தின் பூரண அருளைத் தரும் Golden Foil Printed புகைப்பட பிரேம்.'
    },
    {
      id: 227,
      name: 'சிவன், விஷ்ணு, பிரம்மா, அனுமன், விநாயகர் (Shiva, Vishnu, Bramma, Hanuman, Vinayagar Golden Foil Printed Photo Frame)',
      price: 449,
      oldPrice: 550,
      category: 'pictures',
      image: '/images/shiva_vishnu_bramma_hanuman_vinayagar_golden_foil_printed_photo_frame.webp',
      images: [
        '/images/shiva_vishnu_bramma_hanuman_vinayagar_golden_foil_printed_photo_frame.webp',
        '/images/shiva_vishnu_bramma_hanuman_vinayagar_golden_foil_printed_photo_frame_dimensions.webp'
      ],
      frameType: 'Golden Foil Printed',
      description: 'மும்மூர்த்திகள் மற்றும் அனுமன், விநாயகர் அருள் நிறைந்த ஆன்மீக புகைப்பட பிரேம்.'
    },
    {
      id: 228,
      name: 'சரஸ்வதி (Saraswathi Golden Foil Printed Photo Frame)',
      price: 449,
      oldPrice: 550,
      category: 'pictures',
      image: '/images/saraswathi_golden_foil_printed_photo_frame.webp',
      images: [
        '/images/saraswathi_golden_foil_printed_photo_frame.webp',
        '/images/saraswathi_golden_foil_printed_photo_frame_dimensions.webp'
      ],
      frameType: 'Golden Foil Printed',
      description: 'கல்வி மற்றும் ஞானம் தரும் ஸ்ரீ சரஸ்வதி தேவியின் Golden Foil Printed புகைப்பட பிரேம்.'
    },
    {
      id: 229,
      name: 'பெருமாள் (Perumal Golden Foil Printed Photo Frame)',
      price: 449,
      oldPrice: 550,
      category: 'pictures',
      image: '/images/perumal_golden_foil_printed_photo_frame.webp',
      images: [
        '/images/perumal_golden_foil_printed_photo_frame.webp',
        '/images/perumal_golden_foil_printed_photo_frame_dimensions.webp'
      ],
      frameType: 'Golden Foil Printed',
      description: 'ஸ்ரீ வெங்கடாசலபதி பெருமாளின் தெய்வீக Golden Foil Printed புகைப்பட பிரேம்.'
    },
    {
      id: 301,
      name: 'முருகர் அறுபடை வீடுகளுடன் (Murugar with 6 Homes Golden Foil Printed Photo Frame)',
      price: 449,
      oldPrice: 550,
      category: 'pictures',
      image: '/images/murugar_with_7_homes_golden_foil_printed_photo_frame.webp',
      images: [
        '/images/murugar_with_7_homes_golden_foil_printed_photo_frame.webp',
        '/images/murugar_with_7_homes_golden_foil_printed_photo_frame_dimensions.webp'
      ],
      frameType: 'Golden Foil Printed',
      description: 'தமிழ் கடவுள் ஸ்ரீ முருகப்பெருமான் அறுபடை வீடுகளுடன் காட்சி தரும் தங்க பிரேம்.'
    },
    {
      id: 302,
      name: 'முருகர் (Murugar Photo)',
      price: 449,
      oldPrice: 550,
      category: 'pictures',
      image: '/images/murugar_photo.webp',
      images: [
        '/images/murugar_photo.webp',
        '/images/murugar_photo_dimensions.webp'
      ],
      frameType: 'Photo Frame',
      description: 'தெய்வீக ஒளி பொருந்திய ஸ்ரீ முருகப்பெருமான் புகைப்பட அலங்காரம்.'
    },
    {
      id: 303,
      name: 'முருகர் (Murugar Photo Golden Frame)',
      price: 249,
      oldPrice: 350,
      category: 'pictures',
      image: '/images/murugar_photo_golden_frame.webp',
      images: [
        '/images/murugar_photo_golden_frame.webp',
        '/images/murugar_photo_golden_frame_dimensions.webp'
      ],
      frameType: 'Golden Frame',
      description: 'அழகிய தங்க பிரேமில் அமைந்த ஸ்ரீ முருகப்பெருமான் புகைப்பட பிரேம்.'
    },
    {
      id: 304,
      name: 'முருகர் (Murugar Golden Foil Printed Photo Frame)',
      price: 299,
      oldPrice: 450,
      category: 'pictures',
      image: '/images/murugar_golden_foil_printed_photo_frame.webp',
      images: [
        '/images/murugar_golden_foil_printed_photo_frame.webp',
        '/images/murugar_golden_foil_printed_photo_frame_dimensions.webp'
      ],
      frameType: 'Golden Foil Printed',
      description: 'வெற்றி தரும் வேல் மாறன் ஸ்ரீ முருகனின் Golden Foil Printed பிரேம்.'
    },
    {
      id: 305,
      name: 'லட்சுமி (Lakshmi Golden Foil Printed Photo Frame)',
      price: 449,
      oldPrice: 550,
      category: 'pictures',
      image: '/images/lakshmi_golden_foil_printed_photo_frame.webp',
      images: [
        '/images/lakshmi_golden_foil_printed_photo_frame.webp',
        '/images/lakshmi_golden_foil_printed_photo_frame_dimensions.webp'
      ],
      frameType: 'Golden Foil Printed',
      description: 'செல்வ வளம் தரும் ஸ்ரீ மகாலட்சுமி தேவியின் Golden Foil Printed புகைப்பட பிரேம்.'
    },
    {
      id: 306,
      name: 'பால முருகன் அறுபடை வீடுகளுடன் (Bala Murugar with 6 Homes and Vel Golden Foil Printed Photo Frame_7*10)',
      price: 449,
      oldPrice: 550,
      category: 'pictures',
      image: '/images/bala_murugar_with_7_homes_and_vel_golden_foil_printed_photo_frame.webp',
      images: [
        '/images/bala_murugar_with_7_homes_and_vel_golden_foil_printed_photo_frame.webp'
      ],
      frameType: 'Golden Foil Printed (7*10)',
      description: 'பால முருகன் அறுபடை வீடுகளுடன் மற்றும் வேல் கொண்ட Golden Foil Printed புகைப்பட பிரேம் (7*10).'
    },
    {
      id: 307,
      name: 'பால முருகன் அறுபடை வீடுகளுடன் (Bala Murugar with 6 Homes and Vel Golden Foil Printed Photo Frame)',
      price: 299,
      oldPrice: 450,
      category: 'pictures',
      image: '/images/bala_murugar_with_7_homes_and_vel_golden_foil_printed_photo_frame.webp',
      images: [
        '/images/bala_murugar_with_7_homes_and_vel_golden_foil_printed_photo_frame.webp',
        '/images/bala_murugar_with_7_homes_and_vel_golden_foil_printed_photo_frame_dimensions.webp'
      ],
      frameType: 'Golden Foil Printed',
      description: 'பால முருகன் அறுபடை வீடுகளுடன் மற்றும் வேல் கொண்ட Golden Foil Printed புகைப்பட பிரேம்.'
    },
    {
      id: 308,
      name: 'அம்மன் (Amman Photo)',
      price: 449,
      oldPrice: 550,
      category: 'pictures',
      image: '/images/amman_photo.webp',
      images: [
        '/images/amman_photo.webp',
        '/images/amman_photo_dimensions.webp'
      ],
      frameType: 'Photo Frame',
      description: 'அருள்மிகு பராசக்தி ஸ்ரீ அம்மன் தேவியின் தெய்வீக புகைப்பட அலங்காரம்.'
    }
  ];

  // Delete all existing picture products to avoid duplicate name mismatches
  await Product.deleteMany({ category: 'pictures' });
  console.log('Cleared existing picture products from DB.');

  for (let pic of exact16Pictures) {
    const imagesFormatted = pic.images.map((url, idx) => ({ url, isMain: idx === 0 }));

    const newP = new Product({
      user: adminUserId,
      name: pic.name,
      nameEn: pic.name,
      price: pic.price,
      oldPrice: pic.oldPrice,
      category: 'pictures',
      image: pic.image,
      images: imagesFormatted,
      stock: 10,
      countInStock: 10,
      description: pic.description,
      rating: 4.9,
      numReviews: 15
    });
    await newP.save();
    console.log('Inserted DB Picture product:', newP._id, newP.name);
  }

  const picProds = await Product.find({ category: 'pictures' });
  console.log('\n=== Total Picture products in DB:', picProds.length, '===');
  picProds.forEach((p, i) => console.log((i+1) + '.', p._id, '| Name:', p.name, '| Img:', p.image));

  process.exit();
});
