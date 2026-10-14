require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const User = require('./models/userModel');

const seedThreadSpatika = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to DB');

    const adminUser = await User.findOne({});
    if (!adminUser) {
      console.error('No user found!');
      process.exit(1);
    }

    const descriptionText = `### **மன அமைதியை தரும் ஸ்படிகம்:**\n\nஸ்படிகம் என்பது ஒரு நீர் பாறை ஆகும். இது பூமிக்கு அடியில் பல்லாயிரம் ஆண்டுகளாக புதையுண்ட நீர் இறுகி பாறைகளாக உள்ள கற்களை வெட்டி எடுத்து அதில் இருந்து ஸ்படிக மாலை, ஸ்படிக லிங்கம், ஸ்படிக விநாயகர் என பல பொருட்களாக செய்யப்படுகிறது.\n\nமேலும் இது சக்தியின் அம்சமாக கருதப்படுகிறது.\n\nஸ்படிகத்தை நீரில் போட்டால் அது நீரில் இருப்பதே தெரியாது, அந்த அளவிற்கு மிகவும் தூய்மையானது.\n\nஸ்படிகம் பிரபஞ்சத்திலிருந்து ஒளியையும், காந்த சக்தியையும் தன்னுள் ஈர்த்து வைத்துக்கொள்ளும் திறன் படைத்தது.\n\n### **பலன்கள்:**\n\nஉடலின் வெப்பநிலையை சீராக்கி, தெய்வ அருள், மன அமைதி, சாந்தம், நல்ல சிந்தனை, தெளிவான அறிவு , தீர்க்கமான முடிவு போன்ற அற்புதங்களை நம்முள் நிகழ்த்தும் ஸ்படிக மாலை, நம் மனதில் 7ம் அறிவை உயிர் பெறச் செய்கிறது என்றால் அது மிகையாகாது.\n\nஸ்படிகம் ஒரு வினாடிக்கு பல்லாயிர கணக்கான நேர்மறை அதிர்வுகளை வெளிப்படுத்தும் திறன் கொண்டது.\n\nஸ்படிக மாலையை கையில் வைத்து சிவனின் பஞ்சாட்சர (ஓம் நம சிவாய) மந்திரத்தை 108 முறை ஜபித்தால் அனைத்து பாவங்களிலிருந்தும் விடுபடலாம்.`;

    const mainImage = '/images/spadiga_mala_8mm.webp';
    const imagesArray = [
      { url: '/images/spadiga_mala_8mm.webp', isMain: true },
      { url: '/images/spadiga_mala_8mm_1.webp', isMain: false },
      { url: '/images/spadiga_mala_8mm_2.webp', isMain: false },
      { url: '/images/spadiga_mala_8mm_3.webp', isMain: false },
      { url: '/images/spadigam_copper_mala.webp', isMain: false }
    ];

    const threadProducts = [
      {
        user: adminUser._id,
        name: 'ஸ்படிக மாலை நூலில் கோர்த்தது 8 MM (108+1)',
        nameEn: 'Spadiga Mala Thread 8 MM (108+1)',
        category: 'spadika-malai',
        price: 999.00,
        oldPrice: 1599.00,
        status: 'In Stock',
        countInStock: 10,
        description: descriptionText,
        rating: 5,
        numReviews: 10,
        isFeatured: false,
        size: '8 MM',
        beadCount: '108+1',
        material: 'ஸ்படிகம் நூல்',
        image: mainImage,
        images: imagesArray
      },
      {
        user: adminUser._id,
        name: 'ஸ்படிக மாலை நூலில் கோர்த்தது 6 MM (108+1)',
        nameEn: 'Spadiga Mala Thread 6 MM (108+1)',
        category: 'spadika-malai',
        price: 799.00,
        oldPrice: 1299.00,
        status: 'In Stock',
        countInStock: 10,
        description: descriptionText,
        rating: 5,
        numReviews: 8,
        isFeatured: false,
        size: '6 MM',
        beadCount: '108+1',
        material: 'ஸ்படிகம் நூல்',
        image: mainImage,
        images: imagesArray
      }
    ];

    for (const prod of threadProducts) {
      await Product.findOneAndUpdate(
        { name: prod.name, category: 'spadika-malai' },
        { $set: prod },
        { upsert: true, new: true }
      );
    }

    console.log('Thread Spatika products successfully saved with spadiga_mala_8mm.webp and gallery thumbnails!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding thread products:', error);
    process.exit(1);
  }
};

seedThreadSpatika();
