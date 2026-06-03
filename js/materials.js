/**
 * Training materials module.
 */

const MATERIALS_CONFIG = window.DRONE_CLUB_CONFIG || {};
const API_BASE = (MATERIALS_CONFIG.apiBase || window.location.origin).replace(/\/$/, '');
const ADMIN_TOKEN_KEY = MATERIALS_CONFIG.adminTokenStorageKey || 'droneClubAdminToken';

let pendingFiles = [];

function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

function requestAdminToken() {
  const current = getAdminToken();
  const token = prompt('请输入管理员口令', current);
  if (!token) return '';
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token.trim());
  return token.trim();
}

function authHeaders() {
  const token = requestAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
}

async function fetchJson(url, options) {
  const resp = await fetch(url, options);
  if (!resp.ok) {
    let message = resp.statusText || '请求失败';
    try {
      const body = await resp.json();
      message = body.error || message;
    } catch {
      // Ignore non-JSON error bodies.
    }
    throw new Error(message);
  }
  return resp.json();
}

/**
 * Get materials from the API.
 */
async function getMaterials() {
  try {
    return await fetchJson(`${API_BASE}/api/materials`);
  } catch (err) {
    return [];
  }
}

function getDisplayName(material) {
  return material.originalName || material.fileName || material.name || material.id || '未命名资料';
}

/**
 * Render materials list.
 */
async function renderMaterials(filter = 'all') {
  const container = document.getElementById('materials-content');
  let materials = await getMaterials();

  if (filter !== 'all') {
    materials = materials.filter((m) => m.category === filter);
  }

  if (materials.length === 0) {
    container.innerHTML = `
      <div class="materials-empty">
        <div class="empty-icon">📂</div>
        <p>暂无资料，点击上方区域上传</p>
      </div>
    `;
    return;
  }

  const categoryMap = {
    training: '培训课件',
    tutorial: '操作教程',
    reference: '参考资料',
    other: '其他',
  };

  container.innerHTML = materials
    .map((m) => {
      const displayName = getDisplayName(m);
      const downloadUrl = m.downloadUrl || m.url || `${API_BASE}/api/materials/${encodeURIComponent(m.id)}/download`;
      return `
        <div class="material-card" data-id="${escapeHtml(m.id)}">
          <div class="material-icon">${getMaterialIcon(displayName)}</div>
          <div class="material-info">
            <h4>${escapeHtml(displayName)}</h4>
            <div class="material-meta">
              <span>${escapeHtml(categoryMap[m.category] || m.category || '其他')}</span>
              <span>${escapeHtml(m.fileSize || '')}</span>
              <span>${escapeHtml(m.uploadTime || '')}</span>
            </div>
            ${m.description ? `<p class="material-desc">${escapeHtml(m.description)}</p>` : ''}
          </div>
          <div class="material-actions">
            <a href="${escapeHtml(downloadUrl)}" class="btn btn-primary" target="_blank" rel="noopener">下载</a>
            <button class="btn btn-delete" data-delete-id="${escapeHtml(m.id)}">删除</button>
          </div>
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('[data-delete-id]').forEach((button) => {
    button.addEventListener('click', () => handleDelete(button.dataset.deleteId));
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function getMaterialIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    pdf: '📄',
    ppt: '📊',
    pptx: '📊',
    doc: '📝',
    docx: '📝',
    jpg: '🖼️',
    png: '🖼️',
    mp4: '🎬',
    zip: '📦',
  };
  return icons[ext] || '📎';
}

/**
 * Handle file selection.
 */
function handleFileSelect(files) {
  if (!files || files.length === 0) return;

  pendingFiles = Array.from(files);
  const uploadMeta = document.getElementById('uploadMeta');

  if (pendingFiles.length === 1) {
    document.getElementById('fileDesc').placeholder = `为"${pendingFiles[0].name}"添加描述`;
  } else {
    document.getElementById('fileDesc').placeholder = `已选择 ${pendingFiles.length} 个文件，添加统一描述`;
  }

  uploadMeta.style.display = 'block';
}

/**
 * Confirm upload.
 */
async function handleConfirmUpload() {
  if (pendingFiles.length === 0) return;

  const headers = authHeaders();
  if (!headers) return;

  const category = document.getElementById('fileCategory').value;
  const description = document.getElementById('fileDesc').value;
  const confirmBtn = document.getElementById('confirmUpload');

  confirmBtn.disabled = true;
  confirmBtn.textContent = '上传中...';

  try {
    for (const file of pendingFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('originalName', file.name);
      formData.append('category', category);
      formData.append('description', description);

      await fetchJson(`${API_BASE}/api/materials`, {
        method: 'POST',
        headers,
        body: formData,
      });
    }

    pendingFiles = [];
    document.getElementById('uploadMeta').style.display = 'none';
    document.getElementById('fileDesc').value = '';
    document.getElementById('fileInput').value = '';
    renderMaterials(getCurrentFilter());
  } catch (err) {
    alert(`上传失败: ${err.message}`);
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = '确认上传';
  }
}

/**
 * Cancel upload.
 */
function handleCancelUpload() {
  pendingFiles = [];
  document.getElementById('uploadMeta').style.display = 'none';
  document.getElementById('fileDesc').value = '';
  document.getElementById('fileInput').value = '';
}

/**
 * Delete material.
 */
async function handleDelete(id) {
  if (!confirm('确定要删除这份资料吗？')) return;

  const headers = authHeaders();
  if (!headers) return;

  try {
    await fetchJson(`${API_BASE}/api/materials/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers,
    });
    renderMaterials(getCurrentFilter());
  } catch (err) {
    alert(`删除失败: ${err.message}`);
  }
}

function getCurrentFilter() {
  const activeBtn = document.querySelector('.filter-btn.active');
  return activeBtn ? activeBtn.dataset.filter : 'all';
}

/**
 * Initialize materials module.
 */
function initMaterials() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');

  uploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleFileSelect(e.target.files));

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFileSelect(e.dataTransfer.files);
  });

  document.getElementById('confirmUpload').addEventListener('click', handleConfirmUpload);
  document.getElementById('cancelUpload').addEventListener('click', handleCancelUpload);

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderMaterials(btn.dataset.filter);
    });
  });

  renderMaterials();
}