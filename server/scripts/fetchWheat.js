/**
 * Terminal script: query fertilizers_data for Wheat (and inspect DB structure).
 * Run from project root: node server/scripts/fetchWheat.js
 * Loads .env from project root if present (MONGODB_URI, MONGODB_DB).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { getDb, closeDb } = require('../db');
const { getBroadCategoriesForUi } = require('../categoryMapping');

const COLLECTION = 'fertilizers_data';

async function main() {
  console.log('Connecting to MongoDB...');
  const db = await getDb();
  const coll = db.collection(COLLECTION);

  // 1) How many docs have target_crops at all?
  const withTargetCrops = await coll.countDocuments({ target_crops: { $exists: true, $ne: [] } });
  console.log('\n1) Docs with non-empty target_crops:', withTargetCrops);

  // 2) Sample one doc to see structure of target_crops
  const sample = await coll.findOne(
    { target_crops: { $exists: true, $ne: [] } },
    { projection: { product_name: 1, category_name: 1, target_crops: 1 } }
  );
  if (sample) {
    console.log('\n2) Sample doc target_crops structure:', JSON.stringify(sample.target_crops, null, 2));
    console.log('   category_name:', sample.category_name);
  }

  // 3) Distinct category_name values
  const categories = await coll.distinct('category_name');
  console.log('\n3) All category_name in DB:', categories);

  // 4) Get some distinct crop names from target_crops (flatten)
  const allDocs = await coll.find({ target_crops: { $exists: true, $ne: [] } }).limit(200).toArray();
  const cropNames = new Set();
  allDocs.forEach((d) => (d.target_crops || []).forEach((tc) => tc && cropNames.add(tc.name)));
  console.log('\n4) Sample of target_crops names (from first 200 docs):', [...cropNames].sort().slice(0, 30));

  // 5) Query for Wheat exactly (no category filter)
  const wheatAny = await coll.find({ 'target_crops.name': 'Wheat' }).limit(5).toArray();
  console.log('\n5) Products with target_crops.name === "Wheat" (count):', await coll.countDocuments({ 'target_crops.name': 'Wheat' }));
  if (wheatAny.length > 0) {
    console.log('   First product:', wheatAny[0].product_name, '| category_name:', wheatAny[0].category_name);
  }

  // 6) Try case-insensitive or alternate: "wheat"
  const wheatLower = await coll.countDocuments({ 'target_crops.name': 'wheat' });
  console.log('\n6) Products with target_crops.name === "wheat":', wheatLower);

  // 7) Same query as API: Wheat + each uiCategory
  for (const uiCat of ['seeds', 'fertilizers', 'insecticide']) {
    const broad = getBroadCategoriesForUi(uiCat);
    const count = await coll.countDocuments({
      'target_crops.name': 'Wheat',
      category_name: { $in: broad },
      isActive: true,
    });
    console.log(`\n7) API query: cropName=Wheat, uiCategory=${uiCat} (broad: ${broad.join(', ')}) => count: ${count}`);
  }

  // 8) If still 0, try without isActive (field might be missing or false)
  const wheatNoActive = await coll.countDocuments({
    'target_crops.name': 'Wheat',
    category_name: { $in: getBroadCategoriesForUi('insecticide') },
  });
  console.log('\n8) Same query WITHOUT isActive filter:', wheatNoActive);

  await closeDb();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
