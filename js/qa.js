// Q&A 问答数据（从 data/qa.json 加载）
let PRESET_QA_LIST = [];

/**
 * 切换回答的展开/收缩状态
 */
function toggleAnswer(questionId) {
  const answerEl = document.getElementById(`answer-${questionId}`);
  const iconEl = document.getElementById(`toggle-icon-${questionId}`);
  
  if (answerEl.style.display === 'none') {
    answerEl.style.display = 'block';
    iconEl.textContent = '−';
  } else {
    answerEl.style.display = 'none';
    iconEl.textContent = '+';
  }
}

/**
 * 渲染问答列表
 */
function renderQAData(activeTab = 'programming') {
  const container = document.getElementById('qaList');

  const tabs = [
    { key: 'programming', label: '编程', icon: '💻' },
    { key: 'simulation', label: '模拟', icon: '✈' }
  ];

  const tabsHtml = `<div class="qa-tabs">
    ${tabs.map(t => `<button class="qa-tab ${t.key === activeTab ? 'active' : ''}" onclick="switchQATab('${t.key}')">${t.icon} ${t.label}</button>`).join('')}
  </div>`;

  const filtered = PRESET_QA_LIST.filter(qa => qa.category === activeTab);

  const listHtml = filtered.length > 0
    ? filtered.map(qa => `
        <div class="qa-card" data-id="${qa.id}">
          <div class="qa-question" onclick="toggleAnswer('${qa.id}')" style="cursor: pointer;">
            <div class="qa-question-header">
              <h3 class="qa-question-title">
                <span id="toggle-icon-${qa.id}" class="toggle-icon">+</span>
                ${qa.title}
              </h3>
            </div>
            <div id="answer-${qa.id}" class="qa-answer-content" style="display: none; margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
              ${qa.content.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
      `).join('')
    : '<div class="qa-empty">暂无问题，敬请期待</div>';

  container.innerHTML = tabsHtml + listHtml;
}

/**
 * 切换问答分类
 */
function switchQATab(tab) {
  renderQAData(tab);
}

/**
 * 初始化 Q&A 模块
 */
async function initQA() {
  try {
    const resp = await fetch('data/qa.json');
    PRESET_QA_LIST = await resp.json();
  } catch {
    PRESET_QA_LIST = [];
  }
  renderQAData();
}
