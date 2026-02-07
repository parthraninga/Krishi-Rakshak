const { Router } = require('express');
const { getDb } = require('../db');
const { getBroadCategoriesForUi } = require('../categoryMapping');

const router = Router();
const COLLECTION = 'fertilizers_data';
const BRANDS_COLLECTION = 'brands';
const CROPS_COLLECTION = 'crops';

/**
 * GET /api/products/debug – for debugging: connection status and product count. Remove later.
 */
router.get('/debug', async (req, res) => {
  try {
    const database = await getDb();
    const count = await database.collection(COLLECTION).countDocuments({});
    return res.json({ connected: true, productCount: count });
  } catch (err) {
    console.error('debug endpoint error:', err.message);
    return res.json({ connected: false, productCount: 0, error: err.message });
  }
});

/**
 * GET /api/products/by-crop-category?cropName=Wheat&uiCategory=seeds
 * Returns brands with their products filtered by target_crops.name === cropName
 * and category_name in the broad categories for the given uiCategory.
 */
router.get('/by-crop-category', async (req, res) => {
  const cropName = req.query.cropName?.trim();
  const uiCategory = req.query.uiCategory?.trim();
  if (!cropName || !uiCategory) {
    return res.status(400).json({
      error: 'Missing cropName or uiCategory',
      usage: '?cropName=Wheat&uiCategory=seeds|fertilizers|insecticide',
    });
  }
  const broadCategories = getBroadCategoriesForUi(uiCategory);
  if (broadCategories.length === 0) {
    return res.status(400).json({
      error: 'Invalid uiCategory',
      allowed: ['seeds', 'fertilizers', 'insecticide'],
    });
  }

  try {
    const database = await getDb();
    const coll = database.collection(COLLECTION);

    const docs = await coll
      .find({
        'target_crops.name': cropName,
        category_name: { $in: broadCategories },
        isActive: true,
      })
      .project({
        product_id: 1,
        product_name: 1,
        product_image_url: 1,
        brand_name: 1,
        brand_display_name: 1,
        category_name: 1,
        category_display_name: 1,
        target_crops: 1,
      })
      .toArray();

    const byBrand = new Map();
    for (const d of docs) {
      const name = d.brand_name || 'Unknown';
      if (!byBrand.has(name)) {
        byBrand.set(name, {
          name,
          display_name: d.brand_display_name || name,
          image_url: null,
          products: [],
        });
      }
      byBrand.get(name).products.push({
        product_id: d.product_id,
        product_name: d.product_name,
        product_image_url: d.product_image_url,
        category_name: d.category_name,
        category_display_name: d.category_display_name,
        target_crops: d.target_crops || [],
      });
    }

    const brandNames = [...byBrand.keys()];
    if (brandNames.length > 0) {
      const brandsColl = database.collection(BRANDS_COLLECTION);
      const brandDocs = await brandsColl
        .find({ name: { $in: brandNames } })
        .project({ name: 1, image_url: 1 })
        .toArray();
      const brandImageMap = Object.fromEntries(
        brandDocs.map((b) => [b.name, b.image_url])
      );
      for (const b of byBrand.values()) {
        b.image_url = brandImageMap[b.name] || null;
      }
    }

    const brands = [...byBrand.values()];
    return res.json({
      cropName,
      uiCategory,
      brands,
    });
  } catch (err) {
    console.error('by-crop-category error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/products/:productId
 * Returns full fertilizers_data document for the product.
 * Optional ?enrich=crops adds image_url per target crop from crops collection.
 */
router.get('/:productId', async (req, res) => {
  const productId = Number(req.params.productId);
  const enrich = req.query.enrich === 'crops';
  if (Number.isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid productId' });
  }

  try {
    const database = await getDb();
    const doc = await database.collection(COLLECTION).findOne({
      product_id: productId,
      isActive: true,
    });
    if (!doc) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (enrich && doc.target_crops && doc.target_crops.length > 0) {
      const cropNames = doc.target_crops.map((c) => c.name).filter(Boolean);
      const cropsColl = database.collection(CROPS_COLLECTION);
      const cropDocs = await cropsColl
        .find({ name: { $in: cropNames } })
        .project({ name: 1, image_url: 1, id: 1 })
        .toArray();
      const cropMap = Object.fromEntries(
        cropDocs.map((c) => [c.name, { image_url: c.image_url, id: c.id }])
      );
      doc.target_crops = doc.target_crops.map((tc) => ({
        ...tc,
        image_url: cropMap[tc.name]?.image_url || null,
        crop_id: cropMap[tc.name]?.id ?? null,
      }));
    }

    return res.json(doc);
  } catch (err) {
    console.error('product detail error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
