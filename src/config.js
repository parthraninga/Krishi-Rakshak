/**
 * Geocode API base URL (node-geocoder backend).
 * When set, the app uses the backend for reverse geocoding.
 * When null/empty, the app uses in-app Nominatim fetch.
 *
 * For Android emulator use: 'http://10.0.2.2:3000'
 * For iOS simulator use: 'http://localhost:3000'
 * For physical device use your computer's IP: 'http://192.168.x.x:3000'
 */
export const GEOCODE_API_BASE = null;

/**
 * Products API base URL (Lambda API Gateway).
 * Deployed Lambda: https://pc656fqj0k.execute-api.ap-south-1.amazonaws.com/api/products
 */
export const API_BASE = 'https://pc656fqj0k.execute-api.ap-south-1.amazonaws.com';

/**
 * MongoDB Atlas Data API – direct CRUD from app, no server, no .env.
 * The connection string (mongodb+srv://...) cannot be used from React Native; use Data API instead.
 * In Atlas: App Services → Create app (or use existing) → Link cluster → Data API → Enable →
 *   copy "App ID" and create an "API key". Paste both below.
 * Database = krishi-sakhi (from your URI). Data source = name of linked cluster in App (often "mongodb-atlas").
 */
export const MONGODB_DATA_API_APP_ID = '';
export const MONGODB_DATA_API_KEY = '';
export const MONGODB_DATABASE = 'krishi-sakhi';
export const MONGODB_DATA_SOURCE = 'mongodb-atlas';

/**
 * Ask AI / chat API (e.g. ngrok backend).
 * POST { "query": "user message" } to CHAT_API_BASE + '/api/chat'
 */
export const CHAT_API_BASE = 'https://shelli-nonenforceable-unbiographically.ngrok-free.dev';
