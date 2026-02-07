const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Use MONGODB_DB if set; otherwise parse database name from URI (e.g. ...mongodb.net/krishi-sakhi?retryWrites=...)
function getDbName() {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
  try {
    const url = new URL(uri.replace(/^mongodb\+srv:/, 'https:'));
    const path = url.pathname.replace(/^\//, '').split('?')[0];
    if (path) return path;
  } catch (_) {}
  return 'krishi-rakshak';
}

const dbName = getDbName();

let client = null;
let db = null;

async function getDb() {
  if (db) return db;
  if (!client) client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { getDb, closeDb };
