const {
  deleteMaterial,
  findMaterial,
  readIndex,
  requireAdmin,
  sendJson,
  writeIndex,
} = require('../../lib/materials-store');

module.exports = async function materialHandler(req, res) {
  try {
    if (req.method !== 'DELETE') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    if (!requireAdmin(req, res)) return;

    const { id } = req.query;
    const materials = await readIndex();
    const material = findMaterial(materials, id);
    if (!material) {
      sendJson(res, 404, { error: '资料不存在' });
      return;
    }

    await deleteMaterial(material);
    await writeIndex(materials.filter((item) => item.id !== id));

    sendJson(res, 200, { ok: true });
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Server error' });
  }
};
