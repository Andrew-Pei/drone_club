// 预设的问答数据
const PRESET_QA_LIST = [
  {
    id: 'q1',
    title: '如何计算延时？',
    content: `点击上方【帮助】-【辅助计算】，会弹出辅助计算框（如没有看见，可能隐藏在底部了），选择【距离时间】，输入两个点的坐标、速度、加速度，点击【计算】，即可看到预计时间和距离。如延时太长，请将【速度】和【加速度】的数值设置大一点。（如没有专门设置速度、加速度大小，默认数值为左侧积木块上的值）`
  },
  {
    id: 'q2',
    title: '如何配置无人机？',
    content: `点击无人机WiFi符号的按钮，IP地址：192.168.31.XXX（填无人机编号，如109）；Wi-Fi账号：CQBZ001；Wi-Fi密码：cqbz8888；初始位置0，0，0，点击保存。`
  },
  {
    id: 'q3',
    title: '预览看不清轨迹怎么办？',
    content: `预览时，点击右侧设备列表-动作组旁的闪电⚡按钮，显示飞行轨迹。`
  },
  {
    id: 'q4',
    title: '科目1绕竖杆注意事项',
    content: `飞行高度低于标杆高度上限(可以设置为120cm)，以机头方向为前进方向，绕杆飞行一圈并闭合，且需以绿色灯光标明机头方向。<br>示例（四个角）：直线移至XXX；延时XX；转动左/右90°；延时XX（转动度数除角速度，如90/60大约1500ms）......`
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
function renderQAData() {
  const container = document.getElementById('qaList');

  // 渲染静态问答卡片（带收缩展开功能）
  container.innerHTML = PRESET_QA_LIST.map(qa => `
    <div class="qa-card" data-id="${qa.id}">
      <div class="qa-question" onclick="toggleAnswer('${qa.id}')" style="cursor: pointer;">
        <div class="qa-question-header">
          <h3 class="qa-question-title">
            <span id="toggle-icon-${qa.id}" class="toggle-icon">+</span>
            ${qa.title}
          </h3>
        </div>
        <!-- 回答区域，默认收缩 -->
        <div id="answer-${qa.id}" class="qa-answer-content" style="display: none; margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
          ${qa.content.replace(/\n/g, '<br>')}
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * 初始化 Q&A 模块
 */
function initQA() {
  // 初始渲染问答列表
  renderQAData();
}