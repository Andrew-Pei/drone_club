const { findMaterial, readIndex, sendJson } = require('../../../lib/materials-store');

module.exports = async function materialDownloadHandler(req, res) {
  try {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    const materials = await readIndex();
    const material = findMaterial(materials, req.query.id);
    if (!material || !material.downloadUrl) {
      sendJson(res, 404, { error: '资料不存在' });
      return;
    }

    res.writeHead(302, { Location: material.downloadUrl });
    res.end();
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Server error' });
  }
};
