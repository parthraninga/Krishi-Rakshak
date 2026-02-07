import { API_BASE } from '../config';
import { getBroadCategoriesForUi } from '../data/categoryMapping';
import {
  isDataApiConfigured,
  find,
  findOne,
  countDocuments,
} from './mongodbDataApi';

const FERTILIZERS_COLLECTION = 'fertilizers_data';
const BRANDS_COLLECTION = 'brands';
const CROPS_COLLECTION = 'crops';

const serverBase = API_BASE ? API_BASE.replace(/\/$/, '') : '';

/** Normalize product so list has name and image_url (from /crop or by-crop-category). */
function normalizeProduct(product) {
  const name = product.name ?? product.product_name ?? '';
  const image_url = product.image_url ?? product.product_image_url ?? product.productImageUrl ?? product.imageUrl ?? null;
  return { ...product, name, image_url };
}

/**
 * Fetch brands and products for a crop and UI category (seeds | fertilizers | insecticide).
 * Uses MongoDB Data API when configured, otherwise the Node server (API_BASE).
 */
export async function fetchProductsByCropAndCategory(cropName, uiCategory) {
  let result;
  if (isDataApiConfigured()) {
    result = await fetchByCropAndCategoryDataApi(cropName, uiCategory);
  } else if (!serverBase) {
    result = { cropName, uiCategory, brands: [] };
  } else {
    const q = new URLSearchParams({ cropName, uiCategory });
    const res = await fetch(`${serverBase}/api/products/by-crop-category?${q}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    result = await res.json();
  }
  if (result.brands?.length) {
    result = {
      ...result,
      brands: result.brands.map((b) => ({
        ...b,
        products: (b.products || []).map(normalizeProduct),
      })),
    };
  }
  return result;
}

/**
 * Fetch products for a crop from API_BASE/api/products/crop?cropName=...
 * Returns array of products (raw from API).
 */
export async function fetchProductsByCrop(cropName) {
  if (!serverBase) return [];
  const q = new URLSearchParams({ cropName: cropName || '' });
  const res = await fetch(`${serverBase}/api/products/crop?${q}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data?.products ?? data?.items ?? [];
}

/**
 * Fetch product list for a crop using only /crop?cropName=...
 * Groups products by brand so the list UI (brands + product rows) can reuse the same shape.
 * Returns { cropName, brands: [ { name, display_name, image_url, products } ] }.
 */
export async function fetchProductsByCropForList(cropName) {
  const products = await fetchProductsByCrop(cropName);
  const byBrand = new Map();
  for (const p of products) {
    const raw = normalizeProduct(p);
    const brandName = p.brand_name || p.brand_display_name || 'Unknown';
    if (!byBrand.has(brandName)) {
      byBrand.set(brandName, {
        name: brandName,
        display_name: p.brand_display_name || p.brand_name || brandName,
        image_url: p.brand_image_url ?? null,
        products: [],
      });
    }
    byBrand.get(brandName).products.push({
      product_id: raw.product_id,
      name: raw.name,
      image_url: raw.image_url,
      brand_name: raw.brand_name,
      brand_display_name: raw.brand_display_name,
      category_name: raw.category_name,
      category_display_name: raw.category_display_name,
    });
  }
  return {
    cropName: cropName || '',
    brands: [...byBrand.values()],
  };
}

async function fetchByCropAndCategoryDataApi(cropName, uiCategory) {
  const broadCategories = getBroadCategoriesForUi(uiCategory);
  if (broadCategories.length === 0) {
    return { cropName, uiCategory, brands: [] };
  }
  const docs = await find(FERTILIZERS_COLLECTION, {
    'target_crops.name': cropName,
    category_name: { $in: broadCategories },
    isActive: true,
  }, {
    projection: {
      product_id: 1,
      name: 1,
      product_name: 1,
      image_url: 1,
      product_image_url: 1,
      brand_name: 1,
      brand_display_name: 1,
      category_name: 1,
      category_display_name: 1,
      target_crops: 1,
    },
  });
  const byBrand = new Map();
  for (const d of docs) {
    const brandName = d.brand_name || 'Unknown';
    if (!byBrand.has(brandName)) {
      byBrand.set(brandName, {
        name: brandName,
        display_name: d.brand_display_name || brandName,
        image_url: null,
        products: [],
      });
    }
    byBrand.get(brandName).products.push({
      product_id: d.product_id,
      name: d.name ?? d.product_name,
      image_url: d.image_url ?? d.product_image_url ?? null,
      brand_name: d.brand_name,
      brand_display_name: d.brand_display_name,
      category_name: d.category_name,
      category_display_name: d.category_display_name,
      target_crops: d.target_crops || [],
    });
  }
  const brandNames = [...byBrand.keys()];
  if (brandNames.length > 0) {
    const brandDocs = await find(BRANDS_COLLECTION, { name: { $in: brandNames } }, { projection: { name: 1, image_url: 1 } });
    const brandImageMap = Object.fromEntries(brandDocs.map((b) => [b.name, b.image_url]));
    for (const b of byBrand.values()) {
      b.image_url = brandImageMap[b.name] || null;
    }
  }
  const brands = [...byBrand.values()].map((b) => ({
    ...b,
    products: (b.products || []).map(normalizeProduct),
  }));
  return { cropName, uiCategory, brands };
}

/**
 * Fetch full product detail by product_id.
 * Uses Data API when configured, otherwise the Node server.
 */
export async function fetchProductDetail(productId, enrichCrops = true) {
  if (isDataApiConfigured()) {
    return fetchProductDetailDataApi(productId, enrichCrops);
  }
  if (!serverBase) return null;
  const url = `${serverBase}/api/products/${productId}${enrichCrops ? '?enrich=crops' : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return null;
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch product by productName and categoryName.
 * GET /api/products/product?productName=...&categoryName=...
 */
export async function fetchProductByProductNameAndCategory(productName, categoryName) {
  if (!serverBase) return null;
  const q = new URLSearchParams({
    productName: productName || '',
    categoryName: categoryName || '',
  });
  const res = await fetch(`${serverBase}/api/products/product?${q}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchProductDetailDataApi(productId, enrichCrops) {
  const doc = await findOne(FERTILIZERS_COLLECTION, {
    product_id: Number(productId),
    isActive: true,
  });
  if (!doc) return null;
  if (enrichCrops && doc.target_crops?.length > 0) {
    const cropNames = doc.target_crops.map((c) => c.name).filter(Boolean);
    const cropDocs = await find(CROPS_COLLECTION, { name: { $in: cropNames } }, { projection: { name: 1, image_url: 1, id: 1 } });
    const cropMap = Object.fromEntries(cropDocs.map((c) => [c.name, { image_url: c.image_url, id: c.id }]));
    doc.target_crops = doc.target_crops.map((tc) => ({
      ...tc,
      image_url: cropMap[tc.name]?.image_url || null,
      crop_id: cropMap[tc.name]?.id ?? null,
    }));
  }
  return doc;
}

/**
 * Debug only: check DB connection and total product count. Remove later.
 * @returns {{ connected: boolean, productCount: number, error?: string }}
 */
export async function getDebugConnectionInfo() {
  if (isDataApiConfigured()) {
    try {
      const productCount = await countDocuments(FERTILIZERS_COLLECTION, {});
      return { connected: true, productCount };
    } catch (e) {
      return { connected: false, productCount: 0, error: e.message || 'Data API failed' };
    }
  }
  if (!serverBase) {
    return { connected: false, productCount: 0, error: 'Set API_BASE in config.js (e.g. http://10.0.2.2:3000)' };
  }
  try {
    const res = await fetch(`${serverBase}/api/products/debug`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { connected: false, productCount: 0, error: data.error || `HTTP ${res.status}` };
    }
    return {
      connected: !!data.connected,
      productCount: data.productCount ?? 0,
      error: data.connected ? undefined : (data.error || 'Server returned not connected'),
    };
  } catch (e) {
    return { connected: false, productCount: 0, error: e.message || 'Server unreachable – is npm run server running?' };
  }
}
