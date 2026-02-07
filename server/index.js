/**
 * Geocode API server using node-geocoder.
 * Run: npm run server
 * Reverse geocode: GET /reverse-geocode?lat=28.6139&lon=77.2090
 * Loads .env from project root (MONGODB_URI, PORT, etc.)
 */
require('dotenv').config();

const express = require('express');
const NodeGeocoder = require('node-geocoder');
const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/products', productsRouter);

const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  language: 'en',
  // Optional: set for Nominatim usage policy (replace with your app contact)
  ...(process.env.GEOCODER_EMAIL && { email: process.env.GEOCODER_EMAIL }),
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'User-Agent': 'KrishiRakshak/1.0 (contact@example.com)',
      },
    });
  },
});

/**
 * Build a readable place name from node-geocoder result.
 * Prefer formattedAddress (Nominatim display_name); fallback to city, state, country.
 * Never returns raw coordinates.
 */
function formatPlaceName(result) {
  if (!result) return null;
  if (result.formattedAddress && typeof result.formattedAddress === 'string') {
    return result.formattedAddress.trim();
  }
  const parts = [
    result.city,
    result.town,
    result.village,
    result.county,
    result.state,
    result.stateCode,
    result.country,
  ].filter(Boolean);
  const unique = [...new Set(parts)];
  if (unique.length > 0) return unique.join(', ');
  return null;
}

app.get('/reverse-geocode', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return res.status(400).json({ error: 'Missing or invalid lat, lon' });
  }

  try {
    const results = await geocoder.reverse({ lat, lon });
    const first = results?.[0];
    const placeName = formatPlaceName(first);
    if (!placeName) {
      return res.status(404).json({ error: 'No address found', address: null });
    }
    return res.json({ address: placeName });
  } catch (err) {
    console.error('Reverse geocode error:', err.message);
    return res.status(500).json({ error: err.message, address: null });
  }
});

app.listen(PORT, () => {
  console.log(`Geocode server running at http://localhost:${PORT}`);
  console.log('Example: GET /reverse-geocode?lat=28.6139&lon=77.2090');
});
