/**
 * 首页极客风格动画
 * ASCII art 无人机起飞动画 + 终端打字效果
 */

// ===== ASCII 无人机帧 =====
const droneFrames = [
  // 帧1: 地面待机，螺旋桨静止
  `
       _____
      /     \\
     /  (O)  \\
    /___________\\
    |           |
  --|  [====]  |--
    |___________|
      ||     ||
   ====       ====
   ====       ====
  `,
  // 帧2: 螺旋桨启动
  `
       _____
      /     \\
     /  (O)  \\
    /___________\\
    |           |
  --|  [====]  |--
    |___________|
      ||     ||
   ///         ///
  //////     //////
 `,
  // 帧3: 起飞，微微离地
  `
        _____
       /     \\
      /  (O)  \\
     /___________\\
     |           |
   --|  [====]  |--
     |___________|
       ||     ||
    ///         ///
   //////     //////
   ~~~~         ~~~~`,
  // 帧4: 空中飞行
  `


          _____
         /     \\
        /  (O)  \\
       /___________\\
       |           |
     --|  [====]  |--
       |___________|
         ||     ||
      ///         ///
     //////     //////
     ~~~~         ~~~~`,
  // 帧5: 高空巡航
  `



             _____
            /     \\
           /  (O)  \\
          /___________\\
          |           |
        --|  [====]  |--
          |___________|
            ||     ||
         ///         ///
        //////     //////
        ~~~~         ~~~~`,
];

let currentFrame = 0;
let droneAnimInterval = null;

/**
 * 启动无人机动画
 */
function startDroneAnimation() {
  const el = document.getElementById('ascii-drone');
  if (!el) return;

  // 播放起飞序列：帧0→1→2→3→4（每帧600ms），然后循环3-4-5
  let frame = 0;
  const takeoffSpeed = 500;
  const cruiseSpeed = 800;

  function showFrame(idx) {
    el.textContent = droneFrames[idx];
  }

  // 起飞阶段
  showFrame(0);
  setTimeout(() => showFrame(1), takeoffSpeed);
  setTimeout(() => showFrame(2), takeoffSpeed * 2);
  setTimeout(() => showFrame(3), takeoffSpeed * 3);
  setTimeout(() => {
    showFrame(4);
    // 巡航阶段：在帧3和帧4之间循环
    let cruise = true;
    droneAnimInterval = setInterval(() => {
      cruise = !cruise;
      showFrame(cruise ? 3 : 4);
    }, cruiseSpeed);
  }, takeoffSpeed * 4);
}

/**
 * 终端打字效果
 */
function typeWriter(elementId, text, speed = 100, callback) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let i = 0;
  el.textContent = '';
  el.style.visibility = 'visible';

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      // 打字完成，移除光标
      el.classList.add('typing-done');
      if (callback) callback();
    }
  }

  type();
}

/**
 * 初始化 Hero 动画
 */
function initHero() {
  // 启动无人机动画
  startDroneAnimation();

  // 打字效果延迟启动
  setTimeout(() => {
    typeWriter('hero-title', '重庆八中无人机社团', 120, () => {
      // 标题打完后显示副标题
      setTimeout(() => {
        const subtitle = document.getElementById('hero-subtitle');
        if (subtitle) {
          subtitle.style.opacity = '1';
          subtitle.style.transform = 'translateY(0)';
        }
        // 显示统计数字
        const stats = document.querySelector('.hero-stats');
        if (stats) {
          stats.style.opacity = '1';
          stats.style.transform = 'translateY(0)';
        }
      }, 300);
    });
  }, 1500);
}

document.addEventListener('DOMContentLoaded', initHero);
