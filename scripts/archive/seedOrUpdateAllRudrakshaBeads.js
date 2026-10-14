require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const User = require('./models/userModel');

const seedOrUpdateRudrakshaBeads = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to DB');

    const adminUser = await User.findOne({});
    if (!adminUser) {
      console.error('No admin user found!');
      process.exit(1);
    }

    const items = [
      {
        name: '4 முக ருத்ராட்சம்',
        nameEn: '4 Face Rudraksha',
        category: 'rudraksha',
        price: 299,
        oldPrice: 499,
        status: 'In Stock',
        countInStock: 10,
        description: 'நான்கு முக ருத்ராட்சம் - அறிவு, படைப்பாற்றல் மற்றும் நல்ல சிந்தனைகளை வளர்க்கக்கூடிய தெய்வீக ருத்ராட்சம்.',
        rating: 5,
        numReviews: 12,
        image: '/images/4_face_rudraksham.webp',
        images: [
          { url: '/images/4_face_rudraksham.webp', isMain: true },
          { url: '/images/4_face_rudraksham_with_faces.webp', isMain: false },
          { url: '/images/4_face_rudraksham_planet.webp', isMain: false },
          { url: '/images/4_face_rudraksham_god.webp', isMain: false },
          { url: '/images/4_face_rudraksham_all_items.webp', isMain: false }
        ]
      },
      {
        name: '5 முக ருத்ராட்சம்',
        nameEn: '5 Face Rudraksha',
        category: 'rudraksha',
        price: 199,
        oldPrice: 399,
        status: 'In Stock',
        countInStock: 15,
        description: 'ஐந்து முக ருத்ராட்சம் - மன அமைதி, உடல் ஆரோக்கியம் மற்றும் தெய்வ அருளை அளிக்கும் புனித ருத்ராட்சம்.',
        rating: 5,
        numReviews: 25,
        image: '/images/5_face_rudraksham.webp',
        images: [
          { url: '/images/5_face_rudraksham.webp', isMain: true },
          { url: '/images/5_face_rudraksham_with_faces.webp', isMain: false },
          { url: '/images/5_face_rudraksham_planet.webp', isMain: false },
          { url: '/images/5_face_rudraksham_god.webp', isMain: false },
          { url: '/images/5_face_rudraksham_all_items.webp', isMain: false }
        ]
      },
      {
        name: '6 முக ருத்ராட்சம்',
        nameEn: '6 Face Rudraksha',
        category: 'rudraksha',
        price: 399,
        oldPrice: 599,
        status: 'In Stock',
        countInStock: 10,
        description: 'ஆறு முக ருத்ராட்சம் - முருகப்பெருமானின் அருள் பெற்ற, தைரியம் மற்றும் சுக்கிர தோஷ நிவாரண ருத்ராட்சம்.',
        rating: 5,
        numReviews: 18,
        image: '/images/6_face_rudraksham.webp',
        images: [
          { url: '/images/6_face_rudraksham.webp', isMain: true },
          { url: '/images/6_face_rudraksham_with_faces.webp', isMain: false },
          { url: '/images/6_face_rudraksham_planet.webp', isMain: false },
          { url: '/images/6_face_rudraksham_god.webp', isMain: false },
          { url: '/images/6_face_rudraksham_all_items.webp', isMain: false }
        ]
      },
      {
        name: '7 முக ருத்ராட்சம்',
        nameEn: '7 Face Rudraksha',
        category: 'rudraksha',
        price: 499,
        oldPrice: 699,
        status: 'In Stock',
        countInStock: 8,
        description: 'ஏழு முக ருத்ராட்சம் - மஹாலக்ஷ்மியின் அருள் பெற்ற, செல்வம் மற்றும் சனி தோஷ நிவாரண ருத்ராட்சம்.',
        rating: 5,
        numReviews: 14,
        image: '/images/7_face_rudraksham.webp',
        images: [
          { url: '/images/7_face_rudraksham.webp', isMain: true },
          { url: '/images/7_face_rudraksham_with_faces.webp', isMain: false },
          { url: '/images/7_face_rudraksham_planet.webp', isMain: false },
          { url: '/images/7_face_rudraksham_god.webp', isMain: false },
          { url: '/images/7_face_rudraksham_all_items.webp', isMain: false }
        ]
      }
    ];

    for (const item of items) {
      // Find existing product matching 4/5/6/7 Mukhi/Face or create
      const regexName = item.name.substring(0, 4); // "4 முக", "5 முக", "6 முக", "7 முக"
      const existing = await Product.findOne({
        $or: [
          { name: { $regex: regexName, $options: 'i' }, category: { $in: ['rudraksha', 'ருத்ராட்சம்'] } },
          { name: item.name },
          { nameEn: item.nameEn }
        ]
      });

      if (existing) {
        existing.name = item.name;
        existing.nameEn = item.nameEn;
        existing.category = item.category;
        existing.image = item.image;
        existing.images = item.images;
        await existing.save();
        console.log(`Updated existing product: ${existing.name} (ID: ${existing._id})`);
      } else {
        const newProd = await Product.create({ ...item, user: adminUser._id });
        console.log(`Created new product: ${newProd.name} (ID: ${newProd._id})`);
      }
    }

    console.log('All 4 Rudraksha products updated with 5 images each successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding/updating Rudraksha beads:', error);
    process.exit(1);
  }
};

seedOrUpdateRudrakshaBeads();
