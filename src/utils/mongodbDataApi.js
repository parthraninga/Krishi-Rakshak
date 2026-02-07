/**
 * MongoDB Atlas Data API client – direct CRUD from the app, no server, no .env.
 * Set MONGODB_DATA_API_APP_ID and MONGODB_DATA_API_KEY in src/config.js.
 * In Atlas: App Services → your app → Data API → Enable, create API key, copy App ID.
 */

import {
  MONGODB_DATA_API_APP_ID,
  MONGODB_DATA_API_KEY,
  MONGODB_DATABASE,
  MONGODB_DATA_SOURCE,
} from '../config';

const BASE = 'https://data.mongodb-api.com/app';

function getConfig() {
  const appId = MONGODB_DATA_API_APP_ID;
  const apiKey = MONGODB_DATA_API_KEY;
  const database = MONGODB_DATABASE || 'krishi-sakhi';
  const dataSource = MONGODB_DATA_SOURCE || 'Cluster0';
  return { appId, apiKey, database, dataSource };
}

export function isDataApiConfigured() {
  const { appId, apiKey } = getConfig();
  return !!(appId && apiKey);
}

/**
 * Call a Data API action (find, findOne, insertOne, etc.).
 */
export async function dataApiRequest(action, body) {
  const { appId, apiKey, database, dataSource } = getConfig();
  if (!appId || !apiKey) {
    throw new Error('MongoDB Data API not configured: set MONGODB_DATA_API_APP_ID and MONGODB_DATA_API_KEY in config.js');
  }
  const url = `${BASE}/${appId}/endpoint/data/v1/action/${action}`;
  const payload = {
    dataSource,
    database,
    ...body,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      apiKey,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function find(collection, filter = {}, options = {}) {
  const { documents } = await dataApiRequest('find', {
    collection,
    filter,
    sort: options.sort,
    limit: options.limit,
    projection: options.projection,
  });
  return documents || [];
}

export async function findOne(collection, filter = {}, options = {}) {
  const { document } = await dataApiRequest('findOne', {
    collection,
    filter,
    ...(options.projection && { projection: options.projection }),
  });
  return document ?? null;
}

/** For debugging: count documents in a collection. Remove later. */
export async function countDocuments(collection, filter = {}) {
  const { documents } = await dataApiRequest('aggregate', {
    collection,
    pipeline: [{ $match: filter }, { $count: 'n' }],
  });
  return documents?.[0]?.n ?? 0;
}
