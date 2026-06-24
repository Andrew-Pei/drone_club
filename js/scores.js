/**
 * 成绩公示
 * 八中无人机社团比赛成绩汇总
 * 支持按赛项筛选，显示获奖等级
 *
 * 奖项来源：第十届全国青少年无人机大赛重庆市赛奖项公示
 */

const scoreData = [
    // ===== 高2027届 =====
    { name: "张晋祎", cls: 3, grade: 25, programming: null, rescue: null, landing: 69.165, ferry: 43,
      awards: { landing: "三等奖", ferry: "三等奖" } },
    // ===== 高2028届（初27届）=====
    { name: "陈浩龙", cls: 7, grade: 27, programming: 20, rescue: 35, landing: null, ferry: null,
      awards: { programming: "三等奖", rescue: "三等奖" } },
    { name: "郭一乐", cls: 7, grade: 27, programming: 80, rescue: 35, landing: null, ferry: null,
      awards: { programming: "一等奖", rescue: "三等奖" } },
    { name: "葛玥彤", cls: 8, grade: 27, programming: 40, rescue: null, landing: null, ferry: null,
      awards: { programming: "二等奖" } },
    { name: "范家烨", cls: 8, grade: 27, programming: 40, rescue: null, landing: null, ferry: null,
      awards: { programming: "三等奖" } },
    { name: "郭丞璟", cls: 16, grade: 27, programming: null, rescue: null, landing: 96.28, ferry: 0,
      awards: { landing: "一等奖" } },
    { name: "曹益铭", cls: 16, grade: 27, programming: null, rescue: null, landing: 76.532, ferry: 0,
      awards: { landing: "三等奖", ferry: "三等奖" } },
    { name: "罗当当", cls: 16, grade: 27, programming: null, rescue: null, landing: 99.32, ferry: 0,
      awards: { landing: "一等奖", ferry: "三等奖" } },
    { name: "黄禹昊", cls: 16, grade: 27, programming: 70, rescue: 95, landing: null, ferry: null,
      awards: { programming: "一等奖", rescue: "一等奖" } },
    { name: "李金隆", cls: 16, grade: 27, programming: 60, rescue: 90, landing: null, ferry: null,
      awards: { programming: "二等奖", rescue: "三等奖" } },
    { name: "居明璁", cls: 16, grade: 27, programming: 20, rescue: 90, landing: null, ferry: null,
      awards: { programming: "三等奖", rescue: "三等奖" } },
    // ===== 高2029届（初28届）=====
    { name: "苏小恕", cls: 1, grade: 28, programming: null, rescue: null, landing: 56.955, ferry: 50.94,
      awards: { landing: "三等奖", ferry: "三等奖" } },
    { name: "张涵泽", cls: 1, grade: 28, programming: null, rescue: null, landing: 64.542, ferry: null,
      awards: { landing: "三等奖" } },
    { name: "邱处峰", cls: 2, grade: 28, programming: null, rescue: null, landing: 70.182, ferry: null,
      awards: { landing: "三等奖" } },
    { name: "兰竣翔", cls: 2, grade: 28, programming: null, rescue: null, landing: 87.312, ferry: null,
      awards: { landing: "二等奖" } },
    { name: "张浩景", cls: 2, grade: 28, programming: null, rescue: null, landing: 77.533, ferry: null,
      awards: { landing: "二等奖" } },
    { name: "夏仕航", cls: 2, grade: 28, programming: null, rescue: null, landing: 68.424, ferry: 0,
      awards: { landing: "三等奖", ferry: "三等奖" } },
    { name: "蓝子骞", cls: 3, grade: 28, programming: null, rescue: null, landing: 99.007, ferry: 95.1,
      awards: { landing: "一等奖", ferry: "一等奖" } },
    { name: "邓文博", cls: 8, grade: 28, programming: 40, rescue: null, landing: null, ferry: null,
      awards: { programming: "三等奖" } },
    { name: "黄敬哲", cls: 13, grade: 28, programming: null, rescue: null, landing: 59.18, ferry: 33.79,
      awards: { landing: "三等奖", ferry: "三等奖" } },
    { name: "陈子墨", cls: 13, grade: 28, programming: 50, rescue: null, landing: null, ferry: null,
      awards: { programming: "三等奖" } },
    { name: "杨益睿", cls: 13, grade: 28, programming: 40, rescue: 95, landing: null, ferry: null,
      awards: { programming: "三等奖", rescue: "一等奖" } },
    { name: "赵敬凯", cls: 15, grade: 28, programming: null, rescue: null, landing: 35.957, ferry: null,
      awards: {} },
    { name: "费子腾", cls: 17, grade: 28, programming: null, rescue: null, landing: 63.893, ferry: null,
      awards: { landing: "三等奖" } },
    { name: "陈怡锜", cls: 20, grade: 28, programming: null, rescue: null, landing: 62.408, ferry: null,
      awards: { landing: "三等奖" } }
];

/**
 * 赛项字段映射
 */
const categoryFields = {
    programming: { label: '编程越障', key: 'programming' },
    rescue:      { label: '侦察救援',  key: 'rescue' },
    landing:     { label: '定点返场',  key: 'landing' },
    ferry:       { label: '大飞机转场', key: 'ferry' }
};

/** 当前选中的赛项 */
let currentCategory = 'all';

/**
 * 格式化成绩显示：空值显示为"—"
 */
function formatScore(val) {
    if (val === null || val === undefined || val === '') return '—';
    if (Number.isInteger(val)) return val.toString();
    return val;
}

/**
 * 获取奖项标签HTML
 */
function awardBadge(award) {
    if (!award) return '';
    const colorMap = {
        '一等奖': '#c62828',
        '二等奖': '#e65100',
        '三等奖': '#2e7d32'
    };
    return `<span class="award-badge" style="background:${colorMap[award] || '#666'}">${award}</span>`;
}

/**
 * 排序函数：年级降序、班级升序
 */
function sortStudents(students) {
    return [...students].sort((a, b) => {
        if (b.grade !== a.grade) return b.grade - a.grade;
        return a.cls - b.cls;
    });
}

/**
 * 渲染成绩表格
 * @param {string} category - 'all' | 'programming' | 'rescue' | 'landing' | 'ferry'
 */
function renderScores(category) {
    const container = document.getElementById('scores-content');
    if (!container) return;

    category = category || currentCategory;
    currentCategory = category;

    // 更新筛选按钮高亮
    document.querySelectorAll('#scoresFilter .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    if (category === 'all') {
        renderAllScores(container);
    } else {
        renderCategoryScores(container, category);
    }
}

/**
 * 渲染全部赛项
 */
function renderAllScores(container) {
    const sorted = sortStudents(scoreData);

    let currentGrade = null;
    let tbodyRows = '';

    sorted.forEach(s => {
        let gradeRow = '';
        if (s.grade !== currentGrade) {
            currentGrade = s.grade;
            gradeRow = `<tr class="grade-separator"><td colspan="7">初${s.grade}届</td></tr>`;
        }

        // 收集该学生所有赛项的奖项
        const awardCells = ['programming', 'rescue', 'landing', 'ferry'].map(key => {
            const score = s[key];
            const award = s.awards ? s.awards[key] : null;
            if (score === null || score === undefined) {
                return '<td>—</td>';
            }
            return `<td>${formatScore(score)}${award ? '<br>' + awardBadge(award) : ''}</td>`;
        }).join('\n                ');

        tbodyRows += `
            ${gradeRow}
            <tr>
                <td class="name-cell">${s.name}</td>
                <td>${s.cls}</td>
                <td>${s.grade}</td>
                ${awardCells}
            </tr>
        `;
    });

    container.innerHTML = `
        <div class="score-table-wrapper">
            <table class="score-table">
                <thead>
                    <tr>
                        <th rowspan="2">姓名</th>
                        <th rowspan="2">班级</th>
                        <th rowspan="2">年级</th>
                        <th colspan="4">比赛成绩</th>
                    </tr>
                    <tr>
                        <th>编程越障</th>
                        <th>侦察救援</th>
                        <th>定点返场</th>
                        <th>大飞机转场</th>
                    </tr>
                </thead>
                <tbody>
                    ${tbodyRows}
                </tbody>
            </table>
        </div>
        <p class="score-note">注："—" 表示该学生未参加对应赛项；奖项标注为第十届全国青少年无人机大赛重庆市赛获奖等级</p>
    `;
}

/**
 * 渲染单个赛项筛选视图
 */
function renderCategoryScores(container, category) {
    const field = categoryFields[category];
    if (!field) return;

    // 筛选出参加了该赛项的学生
    const filtered = scoreData.filter(s => s[field.key] !== null && s[field.key] !== undefined);
    const sorted = sortStudents(filtered);

    let currentGrade = null;
    let tbodyRows = '';

    sorted.forEach(s => {
        let gradeRow = '';
        if (s.grade !== currentGrade) {
            currentGrade = s.grade;
            gradeRow = `<tr class="grade-separator"><td colspan="5">初${s.grade}届</td></tr>`;
        }

        const award = s.awards ? s.awards[field.key] : null;

        tbodyRows += `
            ${gradeRow}
            <tr>
                <td class="name-cell">${s.name}</td>
                <td>${s.cls}</td>
                <td>${s.grade}</td>
                <td>${formatScore(s[field.key])}</td>
                <td>${award ? awardBadge(award) : '—'}</td>
            </tr>
        `;
    });

    const participantCount = sorted.length;

    container.innerHTML = `
        <div class="score-table-wrapper">
            <table class="score-table">
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th>班级</th>
                        <th>年级</th>
                        <th>${field.label}</th>
                        <th>获奖等级</th>
                    </tr>
                </thead>
                <tbody>
                    ${tbodyRows || `<tr><td colspan="5" style="padding:32px;color:var(--text-secondary);">暂无参赛记录</td></tr>`}
                </tbody>
            </table>
        </div>
        <p class="score-note">共 ${participantCount} 名同学参加「${field.label}」赛项</p>
    `;
}

/**
 * 初始化筛选功能
 */
function initScoreFilter() {
    const filterContainer = document.getElementById('scoresFilter');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        const category = btn.dataset.category;
        if (category === currentCategory) return;

        renderScores(category);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initScoreFilter();
});