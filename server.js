const crypto = require('crypto');
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { formidable } = require('formidable');
const store = require('./lib/cloud-store');

const app = express();
const PORT = process.env.PORT || 3000;

const VALID_CATEGORIES = new Set(['training', 'tutorial', 'reference', 'other']);

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

function guessContentType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const types = {
    pdf: 'application/pdf',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    mp4: 'video/mp4',
    zip: 'application/zip',
  };
  return types[ext] || 'application/octet-stream';
}

// --- API routes ---

// GET /api/materials - List all materials
// POST /api/materials - Upload a new material
app.route('/api/materials')
  .get(async (req, res) => {
    try {
      const materials = await store.readIndex();
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
        const contentType = guessContentType(originalName);

        // Upload file to cloud storage (or local filesystem)
        await store.uploadFile(storedName, file.filepath, contentType);
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

        const materials = await store.readIndex();
        materials.unshift(material);
        await store.writeIndex(materials);

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
    const materials = await store.readIndex();
    const material = findMaterial(materials, id);
    if (!material) {
      sendJson(res, 404, { error: '资料不存在' });
      return;
    }

    // Delete the file from cloud storage (or local filesystem)
    if (material.storedName) {
      await store.deleteFile(material.storedName);
    }

    await store.writeIndex(materials.filter((item) => item.id !== id));
    sendJson(res, 200, { ok: true });
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Server error' });
  }
});

// GET /api/materials/:id/download - Download a material
app.get('/api/materials/:id/download', async (req, res) => {
  try {
    const materials = await store.readIndex();
    const material = findMaterial(materials, req.params.id);
    if (!material || !material.storedName) {
      sendJson(res, 404, { error: '资料不存在' });
      return;
    }

    const stream = await store.getFileStream(material.storedName);
    if (!stream) {
      sendJson(res, 404, { error: '文件不存在' });
      return;
    }

    const downloadName = material.originalName || material.storedName;
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`);
    res.setHeader('Content-Type', guessContentType(downloadName));
    stream.pipe(res);
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Server error' });
  }
});

// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));

// Start server (only when run directly, not when required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    const mode = store.isCloudEnabled() ? 'cloud (S3)' : 'local filesystem';
    console.log(`Drone Club server running on port ${PORT} (storage: ${mode})`);
  });
}

module.exports = {
  app,
  sendJson,
  getBearerToken,
  requireAdmin,
  readIndex: () => store.readIndex(),
  writeIndex: (m) => store.writeIndex(m),
  normalizeField,
  normalizeCategory,
  sanitizeFileName,
  formatFileSize,
  findMaterial,
  VALID_CATEGORIES,
};
