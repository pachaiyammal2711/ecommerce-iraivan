const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/iraivan_angadi').then(async () => {
  try {
    const result = await mongoose.connection.db.collection('products').updateMany(
      { $or: [{ isDeleted: { $exists: false } }, { isDeleted: null }] },
      { $set: { isDeleted: false } }
    );
    console.log("Products explicitly updated with isDeleted:false : " + result.modifiedCount);
    
    const result2 = await mongoose.connection.db.collection('products').updateMany(
      { $or: [{ status: { $exists: false } }, { status: null }] },
      { $set: { status: 'active' } }
    );
    console.log("Products explicitly updated with status:active : " + result2.modifiedCount);
    
    process.exit();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
});
