const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Admin:Dp74wyxZ3vFcgHAf@cluster0.gtlis6r.mongodb.net/krishi-rakshak?retryWrites=true&w=majority&appName=Cluster0";

async function testQuery() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('krishi-rakshak');
    const collection = db.collection('fertilizers_data');
    
    // First, let's see what crop names exist
    console.log('=== Checking what crop names exist ===');
    const sampleDocs = await collection
      .find({ target_crops: { $exists: true, $ne: [] } })
      .limit(3)
      .toArray();
    
    console.log('Sample docs with target_crops:');
    sampleDocs.forEach(doc => {
      console.log(`\nProduct ID: ${doc.product_id}`);
      console.log(`Product Name: ${doc.product_name}`);
      console.log(`Brand: ${doc.brand_name}`);
      console.log(`Category: ${doc.category_name}`);
      console.log('Crops:', doc.target_crops?.map(c => `"${c.name}"`).join(', '));
    });
    
    // Check if any docs have Mustard (with or without comma)
    console.log('\n=== Searching for Mustard variations ===');
    const mustardVariations = ['Mustard', 'Mustard,', 'mustard', 'mustard,'];
    for (const variant of mustardVariations) {
      const count = await collection.countDocuments({
        'target_crops.name': variant,
      });
      console.log(`"${variant}": ${count} products`);
    }
    
    // Check active vs inactive
    console.log('\n=== Checking isActive field ===');
    const activeCount = await collection.countDocuments({ isActive: true });
    const inactiveCount = await collection.countDocuments({ isActive: { $ne: true } });
    const totalCount = await collection.countDocuments({});
    console.log(`Active: ${activeCount}, Inactive: ${inactiveCount}, Total: ${totalCount}`);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.close();
  }
}

testQuery();
