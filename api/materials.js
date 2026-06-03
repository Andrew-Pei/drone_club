const crypto = require('crypto');
const fs = require('fs/promises');
const { put } = require('@vercel/blob');
const { formidable } = require('formidable');
const {
  formatFileSize,
  normalizeCategory,
  normalizeField,
  readIndex,
  requireAdmin,
  sanitizeFileName,
  sendJson,
  writeIndex,
} = require('../lib/materials-store');

function parseForm(req) {
  const form = formidable({
    maxFileSize: 100 * 1024 * 1024,
    multiples: false,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

function firstFile(files) {
  const value = files.file;
  return Array.isArray(value) ? value[0] : value;
}

async function materialsHandler(req, res) {
  try {
    if (req.method === 'GET') {
      const materials = await readIndex();
      sendJson(res, 200, materials);
      return;
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    if (!requireAdmin(req, res)) return;

    const { fields, files } = await parseForm(req);
    const file = firstFile(files);
    if (!file) {
      sendJson(res, 400, { error: '请选择要上传的文件' });
      return;
    }

    const originalName = sanitizeFileName(
      normalizeField(fields.originalName, file.originalFilename || file.name || 'material')
    );
    const id = crypto.randomBytes(8).toString('hex');
    const blobPath = `materials/${id}-${originalName}`;
    const bytes = await fs.readFile(file.filepath);
    const blob = await put(blobPath, bytes, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.mimetype || 'application/octet-stream',
    });

    const material = {
      id,
      originalName,
      fileName: originalName,
      fileSize: formatFileSize(file.size),
      bytes: file.size,
      category: normalizeCategory(fields.category),
      description: normalizeField(fields.description),
      uploadTime: new Date().toLocaleString('zh-CN', { hour12: false }),
      blobPath,
      url: blob.url,
      downloadUrl: `${blob.url}?download=1`,
    };

    const materials = await readIndex();
    materials.unshift(material);
    await writeIndex(materials);

    sendJson(res, 201, material);
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Server error' });
  }
}

module.exports = materialsHandler;
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
