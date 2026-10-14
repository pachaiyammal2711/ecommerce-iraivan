require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const User = require('./models/userModel');

const seedThulasiMalai = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to DB');

    // Get a user
    const adminUser = await User.findOne({});
    if (!adminUser) {
      console.error('No user found!');
      process.exit(1);
    }

    const description = `### **மகத்துவம் வாய்ந்த துளசி மணி மாலை :**\n\nதுளசி செடியை வீட்டில் வளர்ப்பதாலும், பராமரிப்பதாலும், அதைக் கொண்டு இறைவனுக்கு அர்ச்சனை செய்வதாலும், நமது மனம், உடல், வாக்கு ஆகியவற்றால் செய்யும் பாவங்கள் அனைத்தும் மறைந்து போவதாக ஐதீகம். அதேபோல், துளசி மாலையை பயன்படுத்தி ஜெபம் செய்தாலும் எண்ணற்ற பலன்களையும் பெறலாம்.\n\n### **முக்கியத்துவம் :**\n\nதுளசி செடியின் கட்டையில் இருந்து செய்யப்படும் துளசி மாலை மகாவிஷ்ணுவின் வழிபாடுகளில் முக்கியமாக இருக்கிறது. மகாவிஷ்ணு, கிருஷ்ணர், கண்ணன், ஐயப்பன் ஆகியோருக்கு துளசி மணி மாலை மிகவும் பிரியமானவை.\n\n### **பயன்கள் :**\n\nதுளசி மாலையை கழுத்தில் அணிந்துகொண்டோ அல்லது துளசி மணி மாலையை கையில் பிடித்தபடியோ மந்திரங்களை ஜெபித்தால், ஆயிரம் அஸ்வமேத யாகம் செய்த பலன் கிடைக்கும்.\n\nதொடர்ந்து ஜெபம் செய்தால், ஞாபக சக்தி, கூர்மையாக சிந்தித்தல், வேகமான செயல் போன்றவை ஏற்படும்.\n\nதுளசி மணி மாலை அணிந்து கொண்டால் நோய்கள் நெருங்காது. மேலும் உடல் ஆரோக்கியம் மேம்படும்.\n\nநோய் உள்ளவர்களுக்கு அருகில் இருந்து, அவர்கள் குணமாக ஜெபம் செய்தால் அவர்களின் உடலில் முன்னேற்றம் ஏற்படும்.\n\nதுளசி மாலையை அணிந்து வீட்டில் அமர்ந்து ஜெபம் செய்திட ஒரு பங்கு பலனும், பசுவின் அருகில் அமர்ந்து ஜெபம் செய்திட 100 மடங்கு பலனும்,\n\nஆறு மற்றும் குளக்கரையில் அமர்ந்து ஜெபித்திட 1000 மடங்கு பலனும்,\n\nமலை மீது அமர்ந்து ஜெபித்திட 10,000 மடங்கு பலனும்,\n\nகோவிலில் அமர்ந்து ஜெபித்தால் லட்சம் மடங்கு பலனும்,\n\nகுருவின் பாதங்களுக்கு அருகில் அமர்ந்து ஜெபித்தால் கோடானகோடி பலனும் ஏற்படுகிறது.`;

    const products = [
      {
        user: adminUser._id,
        name: 'ஐயப்பன் துளசி மணி மாலை 8 MM (108+1 மணிகள்)',
        nameEn: 'Iyappan Thulasi Mani Malai 8 MM (108+1 Beads)',
        category: 'sabarimala-set',
        price: 649,
        oldPrice: 1199,
        description: description,
        descriptionEn: 'Thulasi Mani Malai',
        countInStock: 50,
        image: '/images/thulasi_malai.webp',
        images: [
          { url: '/images/thulasi_malai.webp', isMain: true },
          { url: '/images/thulasi_malai.webp', isMain: false }
        ],
        status: 'active',
        visibility: 'published',
        rating: 5,
        numReviews: 0
      },
      {
        user: adminUser._id,
        name: 'ஐயப்பன் துளசி மணி மாலை 10 MM (108+1 மணிகள்)',
        nameEn: 'Iyappan Thulasi Mani Malai 10 MM (108+1 Beads)',
        category: 'sabarimala-set',
        price: 749,
        oldPrice: 1399,
        description: description,
        descriptionEn: 'Thulasi Mani Malai',
        countInStock: 50,
        image: '/images/thulasi_malai.webp',
        images: [
          { url: '/images/thulasi_malai.webp', isMain: true },
          { url: '/images/thulasi_malai.webp', isMain: false }
        ],
        status: 'active',
        visibility: 'published',
        rating: 5,
        numReviews: 0
      },
      {
        user: adminUser._id,
        name: 'ஐயப்பன் துளசி மணி மாலை 6 MM (108+1 மணிகள்)',
        nameEn: 'Iyappan Thulasi Mani Malai 6 MM (108+1 Beads)',
        category: 'sabarimala-set',
        price: 449,
        oldPrice: 999,
        description: description,
        descriptionEn: 'Thulasi Mani Malai',
        countInStock: 50,
        image: '/images/thulasi_malai.webp',
        images: [
          { url: '/images/thulasi_malai.webp', isMain: true },
          { url: '/images/thulasi_malai.webp', isMain: false }
        ],
        status: 'active',
        visibility: 'published',
        rating: 5,
        numReviews: 0
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Successfully added ${createdProducts.length} products`);
    process.exit(0);
  } catch (error) {
    console.error('Error inserting products:', error);
    process.exit(1);
  }
};

seedThulasiMalai();
