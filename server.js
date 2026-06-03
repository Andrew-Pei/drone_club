const crypto = require('crypto');
const express = require('express');
const fs = require('fs/promises');
const fss = require('fs');
const path = require('path');
const { formidable } = require('formidable');

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const INDEX_PATH = path.join(UPLOAD_DIR, 'index.json');
const VALID_CATEGORIES = new Set(['training', 'tutorial', 'reference', 'other']);

// Ensure upload directory exists
if (!fss.existsSync(UPLOAD_DIR)) {
  fss.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// --- Utility functions ---

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
  try {
    const data = await fs.readFile(INDEX_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(materials) {
  await fs.writeFile(INDEX_PATH, JSON.stringify(materials, null, 2), 'utf-8');
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

// --- API routes ---

// GET /api/materials - List all materials
// POST /api/materials - Upload a new material
app.route('/api/materials')
  .get(async (req, res) => {
    try {
      const materials = await readIndex();
      sendJson(res, 200, materials);
    } catch (err) {
      sendJson(res, 500, { error: err.message || 'Server error' });
    }
  })
  .post((req, res) => {
    if (!requireAdmin(req, res)) return;

    const form = formidable({
      maxFileSize: 100 * 1024 * 1024,
      multiples: false,
    });

    form.parse(req, async (err, fields, files) => {
      try {
        if (err) {
          sendJson(res, 400, { error: '文件解析失败' });
          return;
        }

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!file) {
          sendJson(res, 400, { error: '请选择要上传的文件' });
          return;
        }

        const originalName = sanitizeFileName(
          normalizeField(fields.originalName, file.originalFilename || 'material')
        );
        const id = crypto.randomBytes(8).toString('hex');
        const storedName = `${id}-${originalName}`;
        const destPath = path.join(UPLOAD_DIR, storedName);

        // Copy uploaded file to uploads directory (rename fails across devices in Docker)
        await fs.copyFile(file.filepath, destPath);
        try { await fs.unlink(file.filepath); } catch { /* ignore */ }

        const material = {
          id,
          originalName,
          fileName: originalName,
          fileSize: formatFileSize(file.size),
          bytes: file.size,
          category: normalizeCategory(fields.category),
          description: normalizeField(fields.description),
          uploadTime: new Date().toLocaleString('zh-CN', { hour12: false }),
          storedName,
        };

        const materials = await readIndex();
        materials.unshift(material);
        await writeIndex(materials);

        sendJson(res, 201, material);
      } catch (innerErr) {
        sendJson(res, 500, { error: innerErr.message || 'Server error' });
      }
    });
  });

// DELETE /api/materials/:id - Delete a material
app.delete('/api/materials/:id', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;
    const materials = await readIndex();
    const material = findMaterial(materials, id);
    if (!material) {
      sendJson(res, 404, { error: '资料不存在' });
      return;
    }

    // Delete the file from disk
    if (material.storedName) {
      const filePath = path.join(UPLOAD_DIR, material.storedName);
      try { await fs.unlink(filePath); } catch { /* ignore if file already gone */ }
    }

    await writeIndex(materials.filter((item) => item.id !== id));
    sendJson(res, 200, { ok: true });
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Server error' });
  }
});

// GET /api/materials/:id/download - Download a material
app.get('/api/materials/:id/download', async (req, res) => {
  try {
    const materials = await readIndex();
    const material = findMaterial(materials, req.params.id);
    if (!material || !material.storedName) {
      sendJson(res, 404, { error: '资料不存在' });
      return;
    }

    const filePath = path.join(UPLOAD_DIR, material.storedName);
    try {
      await fs.access(filePath);
    } catch {
      sendJson(res, 404, { error: '文件不存在' });
      return;
    }

    res.download(filePath, material.originalName || material.storedName);
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Server error' });
  }
});

// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));

// Start server (only when run directly, not when required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Drone Club server running on port ${PORT}`);
  });
}

module.exports = {
  app,
  sendJson,
  getBearerToken,
  requireAdmin,
  readIndex,
  writeIndex,
  normalizeField,
  normalizeCategory,
  sanitizeFileName,
  formatFileSize,
  findMaterial,
  VALID_CATEGORIES,
};
