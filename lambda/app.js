/**
 * Lambda handler for KrishiRakshak products API.
 * API Gateway HTTP API (or REST) sends requests here; path and query are in the event.
 */
const {
  handleDebug,
  handleByCropCategory,
  handleByCrop,
  handleProductByNameAndCategory,
  handleProductDetail,
  jsonResponse,
  CORS_HEADERS,
} = require('./handlers');

function parsePath(path) {
  const base = '/api/products';
  if (!path.startsWith(base)) return { route: 'unknown' };
  const rest = path.slice(base.length).replace(/^\//, '');
  if (rest === 'debug') return { route: 'debug' };
  if (rest === 'by-crop-category') return { route: 'by-crop-category' };
  if (rest === 'crop') return { route: 'crop' };
  if (rest === 'product') return { route: 'product-by-name' };
  const productIdMatch = rest.match(/^(\d+)(?:\?|$)/);
  if (productIdMatch) {
    return { route: 'product-by-id', productId: productIdMatch[1] };
  }
  return { route: 'unknown' };
}

exports.handler = async (event) => {
  const rawPath = event.rawPath || event.path || '';
  const query = event.queryStringParameters || {};
  const { route, productId } = parsePath(rawPath);

  if (event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...CORS_HEADERS,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  switch (route) {
    case 'debug':
      return handleDebug();
    case 'by-crop-category':
      return handleByCropCategory(
        query.cropName?.trim(),
        query.uiCategory?.trim()
      );
    case 'crop':
      return handleByCrop(query.cropName?.trim());
    case 'product-by-name':
      return handleProductByNameAndCategory(
        query.productName?.trim(),
        query.categoryName?.trim()
      );
    case 'product-by-id':
      return handleProductDetail(
        productId,
        query.enrich === 'crops'
      );
    default:
      return jsonResponse(404, {
        error: 'Not found',
        usage: [
          'GET /api/products/debug',
          'GET /api/products/by-crop-category?cropName=Wheat&uiCategory=seeds',
          'GET /api/products/crop?cropName=Wheat',
          'GET /api/products/product?productName=ProductName&categoryName=CategoryName',
          'GET /api/products/:productId?enrich=crops',
        ],
      });
  }
};
