const { del, list, put } = require('@vercel/blob');

const INDEX_PATH = 'materials/index.json';
const VALID_CATEGORIES = new Set(['training', 'tutorial', 'reference', 'other']);

function sendJson(res, status, body) {
  res.status(status).json(body);
}

function getBearerToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return (req.headers['x-admin-token'] || '').trim();
}

function requireAdmin(req, res) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    sendJson(res, 500, { error: 'ADMIN_TOKEN is not configured on the server.' });
    return false;
  }

  if (getBearerToken(req) !== expected) {
    sendJson(res, 401, { error: '管理员口令不正确' });
    return false;
  }

  return true;
}

async function readIndex() {
  const result = await list({ prefix: INDEX_PATH, limit: 1 });
  const blob = result.blobs.find((item) => item.pathname === INDEX_PATH);
  if (!blob) return [];

  const resp = await fetch(blob.url);
  if (!resp.ok) return [];

  try {
    const data = await resp.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeIndex(materials) {
  await put(INDEX_PATH, JSON.stringify(materials, null, 2), {
    access: 'public',
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

function normalizeField(value, fallback = '') {
  if (Array.isArray(value)) return String(value[0] || fallback).trim();
  return String(value || fallback).trim();
}

function normalizeCategory(value) {
  const category = normalizeField(value, 'other');
  return VALID_CATEGORIES.has(category) ? category : 'other';
}

function sanitizeFileName(name) {
  const cleaned = normalizeField(name, 'material')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || 'material';
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function findMaterial(materials, id) {
  return materials.find((item) => item.id === id);
}

async function deleteMaterial(material) {
  const target = material.blobPath || material.url || material.downloadUrl;
  if (target) await del(target);
}

module.exports = {
  deleteMaterial,
  findMaterial,
  formatFileSize,
  normalizeCategory,
  normalizeField,
  readIndex,
  requireAdmin,
  sanitizeFileName,
  sendJson,
  writeIndex,
};
