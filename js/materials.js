/**
 * 培训资料模块 — Vercel Serverless 后端版
 */

// Vercel API 地址（部署后替换为实际 URL）
const API_BASE = 'https://drone-club-six.vercel.app';

let pendingFiles = [];

/**
 * 从 Worker 获取资料列表
 */
async function getMaterials() {
  try {
    const resp = await fetch(`${API_BASE}/api/materials`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch {
    return [];
  }
}

/**
 * 渲染资料列表
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
    .map(
      (m) => `
    <div class="material-card" data-id="${m.id}">
      <div class="material-icon">${getMaterialIcon(m.fileName)}</div>
      <div class="material-info">
        <h4>${escapeHtml(m.fileName)}</h4>
        <div class="material-meta">
          <span>${categoryMap[m.category] || m.category}</span>
          <span>${m.fileSize}</span>
          <span>${m.uploadTime}</span>
        </div>
        ${m.description ? `<p class="material-desc">${escapeHtml(m.description)}</p>` : ''}
      </div>
      <div class="material-actions">
        <a href="${m.downloadUrl || `${API_BASE}/api/materials/${m.id}/download`}" class="btn btn-primary" target="_blank">下载</a>
        <button class="btn btn-delete" onclick="handleDelete('${m.id}')">删除</button>
      </div>
    </div>
  `
    )
    .join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
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
 * 处理文件选择
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
 * 确认上传 — 发送到 Worker
 */
async function handleConfirmUpload() {
  const category = document.getElementById('fileCategory').value;
  const description = document.getElementById('fileDesc').value;
  const confirmBtn = document.getElementById('confirmUpload');

  confirmBtn.disabled = true;
  confirmBtn.textContent = '上传中...';

  for (const file of pendingFiles) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('description', description);

    try {
      const resp = await fetch(`${API_BASE}/api/materials`, {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) {
        alert(`上传失败: ${file.name}`);
      }
    } catch (err) {
      alert(`上传出错: ${file.name} - ${err.message}`);
    }
  }

  // 重置表单
  pendingFiles = [];
  confirmBtn.disabled = false;
  confirmBtn.textContent = '确认上传';
  document.getElementById('uploadMeta').style.display = 'none';
  document.getElementById('fileDesc').value = '';
  document.getElementById('fileInput').value = '';

  renderMaterials(getCurrentFilter());
}

/**
 * 取消上传
 */
function handleCancelUpload() {
  pendingFiles = [];
  document.getElementById('uploadMeta').style.display = 'none';
  document.getElementById('fileDesc').value = '';
  document.getElementById('fileInput').value = '';
}

/**
 * 删除资料
 */
async function handleDelete(id) {
  if (!confirm('确定要删除这份资料吗？')) return;

  try {
    await fetch(`${API_BASE}/api/materials/${id}`, { method: 'DELETE' });
  } catch (err) {
    alert('删除失败: ' + err.message);
  }

  renderMaterials(getCurrentFilter());
}

function getCurrentFilter() {
  const activeBtn = document.querySelector('.filter-btn.active');
  return activeBtn ? activeBtn.dataset.filter : 'all';
}

/**
 * 初始化培训资料模块
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
