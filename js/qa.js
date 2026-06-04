// 预设的问答数据
const PRESET_QA_LIST = [
  // 编程板块
  {
    id: 'q1',
    category: 'programming',
    title: '如何计算延时？',
    content: `点击上方【帮助】-【辅助计算】，会弹出辅助计算框（如没有看见，可能隐藏在底部了），选择【距离时间】，输入两个点的坐标、速度、加速度，点击【计算】，即可看到预计时间和距离。如延时太长，请将【速度】和【加速度】的数值设置大一点。（如没有专门设置速度、加速度大小，默认数值为左侧积木块上的值）`
  },
  {
    id: 'q2',
    category: 'programming',
    title: '如何配置无人机？',
    content: `点击无人机WiFi符号的按钮，IP地址：192.168.31.XXX（填无人机编号，如109）；Wi-Fi账号：CQBZ001；Wi-Fi密码：cqbz8888；初始位置0，0，0，点击保存。`
  },
  {
    id: 'q3',
    category: 'programming',
    title: '预览看不清轨迹怎么办？',
    content: `预览时，点击右侧设备列表-动作组旁的闪电⚡按钮，显示飞行轨迹。`
  },
  {
    id: 'q4',
    category: 'programming',
    title: '科目1绕竖杆注意事项',
    content: `飞行高度低于标杆高度上限(可以设置为120cm)，以机头方向为前进方向，绕杆飞行一圈并闭合，且需以绿色灯光标明机头方向。<br>示例（四个角）：直线移至XXX；延时XX；转动左/右90°；延时XX（转动度数除角速度，如90/60大约1500ms）......`
  },
  // 模拟板块
  {
    id: 'q5',
    category: 'simulation',
    title: '八中WIFI账号和密码是什么？',
    content: `一共有10个账号。分别是fly01-fly10。密码分别是cqbzwrj01-cqbzwrj10。`
  },
  {
    id: 'q6',
    category: 'simulation',
    title: '莱特模拟飞行训练系统的账号和密码是什么？',
    content: `一共有10个账号。分别是CQ-BZ001~CQ-BZ010，密码全部都是CQbz123。`
  }
];

/**
 * 切换回答的展开/收缩状态
 */
function toggleAnswer(questionId) {
  const answerEl = document.getElementById(`answer-${questionId}`);
  const iconEl = document.getElementById(`toggle-icon-${questionId}`);
  
  if (answerEl.style.display === 'none') {
    answerEl.style.display = 'block';
    iconEl.textContent = '−'; // 展开状态显示减号
  } else {
    answerEl.style.display = 'none';
    iconEl.textContent = '+'; // 收缩状态显示加号
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
function initQA() {
  // 初始渲染问答列表
  renderQAData();
}