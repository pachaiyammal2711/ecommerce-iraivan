const { MongoClient } = require('mongodb');
require('dotenv').config();
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const LOCAL_URI = 'mongodb://127.0.0.1:27017/iraivan_angadi';
// Read Atlas URI from .env
const ATLAS_URI = process.env.MONGO_URI;

async function migrateData() {
  if (!ATLAS_URI || !ATLAS_URI.includes('mongodb+srv')) {
    console.error('❌ Error: ATLAS_URI is not set in .env or is invalid.');
    process.exit(1);
  }

  console.log('🔄 Starting Migration Tool...');
  console.log(`📡 Local DB: ${LOCAL_URI}`);
  console.log(`☁️  Atlas DB: ${ATLAS_URI.replace(/:([^:@]+)@/, ':****@')}`); // Hide password

  rl.question('Do you want to start the migration from Local to Atlas? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('Migration cancelled.');
      process.exit(0);
    }

    const localClient = new MongoClient(LOCAL_URI);
    const atlasClient = new MongoClient(ATLAS_URI);

    try {
      console.log('⏳ Connecting to Local MongoDB...');
      await localClient.connect();
      const localDb = localClient.db('iraivan_angadi');

      console.log('⏳ Connecting to Atlas MongoDB...');
      await atlasClient.connect();
      // The Atlas URI in .env already has /iraivanangadi in it, but we can explicitly select it
      const atlasDb = atlasClient.db('iraivanangadi');

      const collectionsToMigrate = [
        'categories', 'products', 'users', 'orders', 
        'cancellations', 'contacts', 'inventorytransactions', 'payments'
      ];

      for (const collName of collectionsToMigrate) {
        console.log(`\n--- Migrating collection: ${collName} ---`);
        const localCollection = localDb.collection(collName);
        const atlasCollection = atlasDb.collection(collName);

        // Fetch all documents from local
        const docs = await localCollection.find({}).toArray();
        console.log(`Found ${docs.length} documents in local ${collName}.`);

        if (docs.length > 0) {
          // Check if data already exists in Atlas to prevent duplicates
          const atlasCount = await atlasCollection.countDocuments();
          if (atlasCount > 0) {
            console.log(`⚠️  Atlas collection ${collName} already has ${atlasCount} documents. Skipping to prevent duplicates.`);
            continue;
          }

          // Insert into Atlas (preserves _id, ObjectIds, and Dates exactly)
          const result = await atlasCollection.insertMany(docs);
          console.log(`✅ Successfully inserted ${result.insertedCount} documents into Atlas ${collName}.`);
        } else {
          console.log(`ℹ️  Local collection ${collName} is empty. Skipping.`);
        }
      }

      console.log('\n🎉 MIGRATION COMPLETE! 🎉');
      console.log('You can now check MongoDB Atlas UI to verify your data.');

    } catch (err) {
      console.error('❌ Migration failed:', err);
    } finally {
      await localClient.close();
      await atlasClient.close();
      rl.close();
    }
  });
}

migrateData();
