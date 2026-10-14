require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');

const tamilDesc = `# **மகாலட்சுமியின் அருள் நிறைந்த பஞ்சகவ்ய விளக்கு..!**

நம்மை சுற்றியுள்ள தீய சக்திகள் விலகவும் நன்மைகள் கைகூடவும் தோஷங்களில் இருந்து நிவர்த்தி அடையவும் ஹோமம் செய்வது வழக்கம்.

ஹோமங்கள் செய்வது குடும்ப வாழ்க்கைக்கு மிகவும் நன்மையை கொடுக்கிறது. வீட்டிலிருக்கும் துன்பங்கள், கஷ்டங்கள், கண் திருஷ்டிகள், மனக்கஷ்டங்கள் அனைத்தையும் தீர்த்து வளமான வாழ்க்கையை ஹோமங்களின் மூலம் பெறலாம்.

மேலும் ஹோமம் செய்வதன் மூலம் பஞ்சபூதங்களின் அருளும் கடவுளின் ஆசிர்வாதமும் கிடைக்கும். இத்தகைய பலன்களை எல்லாம் பஞ்சகவ்ய விளக்கை ஏற்றுவதன் மூலம் பெறலாம். வீட்டில் பஞ்சகவ்ய விளக்கில் தீபம் ஏற்றும் போது அதிலிருந்து வரும் புகையின் வாசம் ஹோமத்திலிருந்து வரும் வாசத்திற்கு நிகரானதாக இருக்கும்.

பஞ்சகவ்ய விளக்கானது பசுவில் இருந்து கிடைக்கும் பால், நெய், கோமியம், தயிர், சாணம் ஆகிய 5 பொருட்களுடன் சில மூலிகைகள் சேர்த்து செய்யப்படுகிறது. பசு மாட்டில் முப்பத்து முக்கோடி தேவர்களும் வாசம் செய்வதாக ஐதீகம். மேலும் பசு மகாலட்சுமியின் அம்சமாக இருக்கிறது. இதன் காரணமாக பஞ்சகவ்ய விளக்கை ஏற்றுவதால் நமக்கு மகாலட்சுமி கடாட்சம் கிடைக்கும்.

**பஞ்சகவ்ய விளக்கேற்றும் முறை:**

பஞ்சகவ்ய விளக்கை நல்லெண்ணெய் அல்லது நெய் ஊற்றி தீபம் ஏற்ற வேண்டும். சாதாரணமாகவே நெய் ஊற்றி, தாமரை தண்டு திரியில் விளக்கேற்றுவது செல்வத்தை பெருக்கும் என்பது ஐதீகம். பஞ்சகவ்ய விளக்கில் விளக்கின் திரி எரிந்த பின்பு, விளக்கும் சேர்ந்து எரிய ஆரம்பிக்கும். அப்படி விளக்கு எரியும்போது வரும் புகை ஹோமத்தில் இருந்து வரும் புகைக்கு இணையான வாசத்தையும், ஹோமத்திற்கு இணையான பலன்களைத் தரக்கூடியதாகும். விளக்கு எரிந்த பின்பு கிடைக்கும் சாம்பல் தெய்வீக விபூதிக்கு சமமானதாகும். இந்த விளக்கு எரிந்த பிறகு கிடைக்கும் சாம்பலை திருநீறாகவும் பயன்படுத்தி கொள்ளலாம்.

**பஞ்சகவ்ய விளக்கை ஏற்றுவதற்கான சிறந்த காலங்கள்?**

பஞ்சகவ்ய விளக்கை கிருத்திகை, அமாவாசை, பௌர்ணமி போன்ற சிறப்பான நாட்களில் மற்றும் வெள்ளிக்கிழமைகளில் வீட்டில் ஏற்றுவதால் கோ பூஜை மற்றும் லட்சுமி நாராயண பூஜை செய்ததற்கும், ஹோமம் நடத்துவதற்கும் சமமாக கருதப்படுகிறது.

**பஞ்சகவ்ய விளக்கின் நன்மைகள்:**

வீட்டின் எதிர்மறை ஆற்றல்களை அடியோடு வெளியேற்றி சண்டை, சச்சரவுகளை நீக்கும். நேர்மறை ஆற்றல்கள் நிரம்பி, லட்சுமி கடாட்சம் பெருகும். மேலும், கடன் பிரச்சனைகள் குறைந்து வீட்டில் செல்வம் பெருகும். கண்திருஷ்டி, நோய் தொந்தரவுகள், சுவாச கோளாறுகள் ஆகியவை பஞ்சகவ்ய விளக்கில் இருந்து வெளிப்படும் புகையின் மூலம் நிவர்த்தியாகும்.`;

const seedPanjakavya = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iraivan_angadi');
    console.log('Connected to DB');

    // First get an admin user
    const User = require('./models/userModel');
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
        // Just find any user if admin not found for dev purpose or create dummy
        adminUser = await User.findOne({});
        if(!adminUser) {
           console.log('No user found. Cannot seed product.');
           process.exit(1);
        }
    }

    const productData = {
        name: 'பஞ்சகவ்ய விளக்கு',
        nameEn: 'Panjakavya Vilaku',
        category: 'Panjakavya Vilaku',
        description: tamilDesc,
        descriptionEn: 'Panjakavya Vilaku',
        price: 449,
        countInStock: 100,
        rating: 5,
        numReviews: 0,
        user: adminUser._id,
        image: '/images/sample.webp',
        variants: [
            {
                name: 'Quantity',
                value: '24 Vilaku',
                sku: 'PANJAKAVYA-24',
                price: 449,
                stock: 100
            },
            {
                name: 'Quantity',
                value: '48 Vilaku',
                sku: 'PANJAKAVYA-48',
                price: 249,
                stock: 100
            }
        ]
    };

    const exists = await Product.findOne({ nameEn: 'Panjakavya Vilaku' });
    if (!exists) {
      await Product.create(productData);
      console.log('Seeded: Panjakavya Vilaku');
    } else {
      // update
      await Product.updateOne({ nameEn: 'Panjakavya Vilaku' }, productData);
      console.log('Updated: Panjakavya Vilaku');
    }

    console.log('Seeding finished');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedPanjakavya();
