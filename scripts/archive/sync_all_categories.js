const { MongoClient } = require('mongodb');
const { mockProducts } = require('../frontend/src/data/mockProducts.js');

async function run() {
  const uri = 'mongodb+srv://pachaiyammalvillzone_db_user:pZgxLjX71X0tP7Zh@cluster0.w21pshz.mongodb.net/';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('iraivanangadi');
    const productsCol = db.collection('products');
    
    const dbProducts = await productsCol.find({}).toArray();
    let updatedCount = 0;
    
    for (const mockProd of mockProducts) {
      // Find the corresponding DB product
      const dbProd = dbProducts.find(p => p.name === mockProd.name || p.nameEn === mockProd.name || p.nameEn === mockProd.nameEn);
      
      if (dbProd) {
        // Extract mock categories
        let mockCategories = [];
        if (typeof mockProd.category === 'string') {
          mockCategories = mockProd.category.split(',').map(c => c.trim());
        } else if (Array.isArray(mockProd.category)) {
          mockCategories = mockProd.category.map(c => c.trim());
        }
        
        // Extract DB categories
        let dbCategories = [];
        if (typeof dbProd.category === 'string') {
          dbCategories = dbProd.category.split(',').map(c => c.trim());
        } else if (Array.isArray(dbProd.category)) {
          dbCategories = dbProd.category.map(c => c.trim());
        }
        
        let needsUpdate = false;
        
        // Ensure all mock categories are in the DB
        for (const cat of mockCategories) {
          if (cat && !dbCategories.includes(cat)) {
            dbCategories.push(cat);
            needsUpdate = true;
          }
        }
        
        if (needsUpdate) {
          await productsCol.updateOne(
            { _id: dbProd._id },
            { $set: { category: dbCategories } }
          );
          console.log(`Updated tags for: ${dbProd.nameEn || dbProd.name}`);
          updatedCount++;
        }
      }
    }
    
    console.log(`\nFinished perfectly syncing categories! Successfully updated tags for ${updatedCount} products.`);
    
  } catch (error) {
    console.error('Error during sync:', error);
  } finally {
    await client.close();
  }
}

run();
