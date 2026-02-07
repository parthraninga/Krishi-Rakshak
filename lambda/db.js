const { MongoClient } = require('mongodb');

const uri = (process.env.MONGODB_URI || '').trim();

function getDbName() {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
  if (!uri) return 'krishi-sakhi';
  try {
    const url = new URL(uri.replace(/^mongodb\+srv:/, 'https:'));
    const path = url.pathname.replace(/^\//, '').split('?')[0];
    if (path) return path;
  } catch (_) {}
  return 'krishi-sakhi';
}

const dbName = getDbName();
let client = null;
let db = null;

function validateUri() {
  if (!uri) throw new Error('MONGODB_URI not set – redeploy Lambda with parameter MongoUri');
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv:// – check deploy parameter');
  }
}

async function getDb() {
  if (db) return db;
  validateUri();
  if (!client) client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

module.exports = { getDb };
