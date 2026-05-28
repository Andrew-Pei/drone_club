/**
 * 赛项规则数据
 * TODO: 请上传各赛项的正式规则文件，替换占位内容
 */
const competitionsData = [
    {
        id: 'programming',
        title: '编程挑战赛',
        icon: '💻',
        badge: '热门',
        description: '参赛选手通过编写程序控制无人机完成指定任务。考验选手的编程能力、逻辑思维和任务规划能力。选手需在规定时间内完成航线规划、目标识别、精准降落等编程挑战。',
        rules: [
            '比赛时间为 XX 分钟',
            '无人机须按照程序自主飞行，不得人工干预',
            '完成指定任务获得相应分数',
            '触碰障碍物扣分'
        ],
        files: [
            // TODO: 上传规则文件后替换
            // { name: '编程挑战赛规则.pdf', size: '2.3MB', url: 'assets/uploads/xxx.pdf' }
        ]
    },
    {
        id: 'reconnaissance',
        title: '目标侦查赛',
        icon: '🔍',
        badge: '竞技',
        description: '参赛选手操控无人机在指定区域内搜索并识别目标。考验选手的飞行操控技巧、观察能力和快速反应能力。需要在复杂环境中精准定位目标并完成侦查任务。',
        rules: [
            '比赛时间为 XX 分钟',
            '需在规定区域内搜索指定目标',
            '正确识别目标获得分数',
            '超时未完成按已识别目标计分'
        ],
        files: [
            // TODO: 上传规则文件后替换
        ]
    },
    {
        id: 'simulation-fixed',
        title: '模拟飞行赛 · 定点返场',
        icon: '🎯',
        badge: '模拟',
        description: '在模拟飞行环境中，选手操控飞机完成指定航线飞行后精确返回起降点。考验选手对飞行姿态、航向和速度的精准控制能力，以及临场应变能力。',
        rules: [
            '须按照指定航线飞行',
            '返场降落偏差越小分数越高',
            '飞行过程不得偏离航线过多',
            '降落精准度为主要评分标准'
        ],
        files: [
            // TODO: 上传规则文件后替换
        ]
    },
    {
        id: 'simulation-large',
        title: '模拟飞行赛 · 大飞机返场',
        icon: '✈',
        badge: '模拟',
        description: '在模拟飞行环境中，选手操控大型飞机完成长途飞行任务后安全返场降落。与定点返场相比，大飞机返场更注重飞行规划的合理性和对大型飞机操控特性的理解。',
        rules: [
            '须完成完整飞行计划',
            '大飞机操控需考虑惯性等因素',
            '返场进近须符合规范',
            '安全着陆为首要评判标准'
        ],
        files: [
            // TODO: 上传规则文件后替换
        ]
    }
];

/**
 * 渲染赛项规则页面
 */
function renderCompetitions() {
    const container = document.getElementById('competitions-content');
    container.innerHTML = competitionsData.map(comp => {
        const filesHtml = comp.files.length > 0
            ? `<div class="competition-files">
                <h4>📎 规则文件</h4>
                <div class="file-list">
                    ${comp.files.map(f => `
                        <div class="file-item">
                            <span class="file-icon">${getFileIcon(f.name)}</span>
                            <span class="file-name">${f.name}</span>
                            <span class="file-size">${f.size}</span>
                            <a href="${f.url}" class="file-download" download>下载</a>
                        </div>
                    `).join('')}
                </div>
               </div>`
            : `<div class="competition-files">
                <h4>📎 规则文件</h4>
                <div class="file-placeholder">规则文件待上传，请管理员在数据中添加</div>
               </div>`;

        const rulesList = comp.rules.map(r => `<li>${r}</li>`).join('');

        return `
            <div class="competition-card" id="${comp.id}">
                <div class="competition-card-header" onclick="toggleCard(this)">
                    <h3><span>${comp.icon}</span> ${comp.title} <span class="badge">${comp.badge}</span></h3>
                    <span class="toggle">▼</span>
                </div>
                <div class="competition-card-body">
                    <div class="competition-card-content">
                        <p>${comp.description}</p>
                        <p><strong>基本规则：</strong></p>
                        <ul style="padding-left:20px; margin:8px 0; color:var(--text-secondary);">${rulesList}</ul>
                        ${filesHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 根据文件名获取图标
 */
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        pdf: '📄', ppt: '📊', pptx: '📊',
        doc: '📝', docx: '📝', jpg: '🖼️',
        png: '🖼️', mp4: '🎬', zip: '📦'
    };
    return icons[ext] || '📎';
}
