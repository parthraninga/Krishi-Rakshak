const { getDb } = require('./db');
const { getBroadCategoriesForUi } = require('./categoryMapping');

const COLLECTION = 'fertilizers_data';
const BRANDS_COLLECTION = 'brands';
const CROPS_COLLECTION = 'crops';
const CATEGORIES_COLLECTION = 'categories';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Content-Type': 'application/json',
};

function jsonResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, ...headers },
    body: JSON.stringify(body),
  };
}

async function handleDebug() {
  try {
    const database = await getDb();
    const count = await database.collection(COLLECTION).countDocuments({});
    return jsonResponse(200, { connected: true, productCount: count });
  } catch (err) {
    console.error('debug error:', err.message);
    return jsonResponse(200, { connected: false, productCount: 0, error: err.message });
  }
}

async function handleByCropCategory(cropName, uiCategory) {
  if (!cropName || !uiCategory) {
    return jsonResponse(400, {
      error: 'Missing cropName or uiCategory',
      usage: '?cropName=Wheat&uiCategory=seeds|fertilizers|insecticide',
    });
  }
  const broadCategories = getBroadCategoriesForUi(uiCategory);
  if (broadCategories.length === 0) {
    return jsonResponse(400, {
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

    return jsonResponse(200, {
      cropName,
      uiCategory,
      brands: [...byBrand.values()],
    });
  } catch (err) {
    console.error('by-crop-category error:', err.message);
    return jsonResponse(500, { error: err.message });
  }
}

async function handleByCrop(cropName) {
  if (!cropName) {
    return jsonResponse(400, {
      error: 'Missing cropName',
      usage: '?cropName=Wheat',
    });
  }
  try {
    const database = await getDb();
    const coll = database.collection(COLLECTION);
    const docs = await coll
      .find({
        'target_crops.name': cropName,
        isActive: true,
      })
      .toArray();

    // Extract unique brand and category names
    const brandNames = [...new Set(docs.map(d => d.brand_name).filter(Boolean))];
    const categoryNames = [...new Set(docs.map(d => d.category_name).filter(Boolean))];

    // Fetch brand images
    const brandImageMap = {};
    if (brandNames.length > 0) {
      const brandsColl = database.collection(BRANDS_COLLECTION);
      const brandDocs = await brandsColl
        .find({ name: { $in: brandNames } })
        .project({ name: 1, image_url: 1 })
        .toArray();
      for (const b of brandDocs) {
        brandImageMap[b.name] = b.image_url || null;
      }
    }

    // Fetch category images
    const categoryImageMap = {};
    if (categoryNames.length > 0) {
      const categoriesColl = database.collection(CATEGORIES_COLLECTION);
      const categoryDocs = await categoriesColl
        .find({ name: { $in: categoryNames } })
        .project({ name: 1, image_url: 1 })
        .toArray();
      for (const c of categoryDocs) {
        categoryImageMap[c.name] = c.image_url || null;
      }
    }

    // Enrich products with brand and category images
    const enrichedProducts = docs.map(d => ({
      ...d,
      brand_image_url: brandImageMap[d.brand_name] || null,
      category_image_url: categoryImageMap[d.category_name] || null,
    }));

    return jsonResponse(200, {
      cropName,
      count: enrichedProducts.length,
      products: enrichedProducts,
    });
  } catch (err) {
    console.error('by-crop error:', err.message);
    return jsonResponse(500, { error: err.message });
  }
}

async function handleProductByNameAndCategory(productName, categoryName) {
  if (!productName || !categoryName) {
    return jsonResponse(400, {
      error: 'Missing productName or categoryName',
      usage: '?productName=ProductName&categoryName=CategoryName',
    });
  }
  try {
    const database = await getDb();
    const coll = database.collection(COLLECTION);
    const doc = await coll.findOne({
      product_name: productName,
      category_name: categoryName,
      isActive: true,
    });
    if (!doc) {
      return jsonResponse(404, { error: 'Product not found' });
    }
    return jsonResponse(200, doc);
  } catch (err) {
    console.error('product by name/category error:', err.message);
    return jsonResponse(500, { error: err.message });
  }
}

async function handleProductDetail(productId, enrichCrops) {
  const id = Number(productId);
  if (Number.isNaN(id)) {
    return jsonResponse(400, { error: 'Invalid productId' });
  }
  try {
    const database = await getDb();
    const doc = await database.collection(COLLECTION).findOne({
      product_id: id,
      isActive: true,
    });
    if (!doc) {
      return jsonResponse(404, { error: 'Product not found' });
    }
    if (enrichCrops && doc.target_crops && doc.target_crops.length > 0) {
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
    return jsonResponse(200, doc);
  } catch (err) {
    console.error('product detail error:', err.message);
    return jsonResponse(500, { error: err.message });
  }
}

module.exports = {
  handleDebug,
  handleByCropCategory,
  handleByCrop,
  handleProductByNameAndCategory,
  handleProductDetail,
  jsonResponse,
  CORS_HEADERS,
};
