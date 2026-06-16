/**
 * 成绩公示
 * 八中无人机社团比赛成绩汇总
 */

const scoreData = [
    { name: "张晋祎", cls: 3, grade: 25, programming: null, rescue: null, landing: 69.165, ferry: 43 },
    { name: "陈浩龙", cls: 7, grade: 27, programming: 20, rescue: 35, landing: null, ferry: null },
    { name: "郭一乐", cls: 7, grade: 27, programming: 80, rescue: 35, landing: null, ferry: null },
    { name: "葛玥彤", cls: 8, grade: 27, programming: 40, rescue: null, landing: null, ferry: null },
    { name: "范家烨", cls: 8, grade: 27, programming: 40, rescue: null, landing: null, ferry: null },
    { name: "郭丞璟", cls: 16, grade: 27, programming: null, rescue: null, landing: 96.28, ferry: 0 },
    { name: "曹益铭", cls: 16, grade: 27, programming: null, rescue: null, landing: 76.532, ferry: 0 },
    { name: "罗当当", cls: 16, grade: 27, programming: null, rescue: null, landing: 99.32, ferry: 0 },
    { name: "黄禹昊", cls: 16, grade: 27, programming: 70, rescue: 95, landing: null, ferry: null },
    { name: "李金隆", cls: 16, grade: 27, programming: 60, rescue: 90, landing: null, ferry: null },
    { name: "居明璁", cls: 16, grade: 27, programming: 20, rescue: 90, landing: null, ferry: null },
    { name: "苏小恕", cls: 1, grade: 28, programming: null, rescue: null, landing: 56.955, ferry: 50.94 },
    { name: "张涵泽", cls: 1, grade: 28, programming: null, rescue: null, landing: 64.542, ferry: null },
    { name: "邱处峰", cls: 2, grade: 28, programming: null, rescue: null, landing: 70.182, ferry: null },
    { name: "兰竣翔", cls: 2, grade: 28, programming: null, rescue: null, landing: 87.312, ferry: null },
    { name: "张浩景", cls: 2, grade: 28, programming: null, rescue: null, landing: 77.533, ferry: null },
    { name: "夏仕航", cls: 2, grade: 28, programming: null, rescue: null, landing: 68.424, ferry: 0 },
    { name: "蓝子骞", cls: 3, grade: 28, programming: null, rescue: null, landing: 99.007, ferry: 95.1 },
    { name: "邓文博", cls: 8, grade: 28, programming: 40, rescue: null, landing: null, ferry: null },
    { name: "黄敬哲", cls: 13, grade: 28, programming: null, rescue: null, landing: 59.18, ferry: 33.79 },
    { name: "陈子墨", cls: 13, grade: 28, programming: 50, rescue: null, landing: null, ferry: null },
    { name: "杨益睿", cls: 13, grade: 28, programming: 40, rescue: 95, landing: null, ferry: null },
    { name: "赵敬凯", cls: 15, grade: 28, programming: null, rescue: null, landing: 35.957, ferry: null },
    { name: "费子腾", cls: 17, grade: 28, programming: null, rescue: null, landing: 63.893, ferry: null },
    { name: "陈怡锜", cls: 20, grade: 28, programming: null, rescue: null, landing: 62.408, ferry: null }
];

/**
 * 格式化成绩显示：空值显示为"—"
 */
function formatScore(val) {
    if (val === null || val === undefined || val === '') return '—';
    // 如果是整数则显示整数，否则保留合理小数位数
    if (Number.isInteger(val)) return val.toString();
    return val;
}

/**
 * 渲染成绩表格
 */
function renderScores() {
    const container = document.getElementById('scores-content');
    if (!container) return;

    // 按年级和班级排序（年级降序、班级升序）
    const sorted = [...scoreData].sort((a, b) => {
        if (b.grade !== a.grade) return b.grade - a.grade;
        return a.cls - b.cls;
    });

    const theadRows = `
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
    `;

    let currentGrade = null;
    let tbodyRows = '';

    sorted.forEach((s, i) => {
        // 年级分组标记
        let gradeRow = '';
        if (s.grade !== currentGrade) {
            currentGrade = s.grade;
            gradeRow = `<tr class="grade-separator"><td colspan="7">初${s.grade}届</td></tr>`;
        }

        tbodyRows += `
            ${gradeRow}
            <tr>
                <td class="name-cell">${s.name}</td>
                <td>${s.cls}</td>
                <td>${s.grade}</td>
                <td>${formatScore(s.programming)}</td>
                <td>${formatScore(s.rescue)}</td>
                <td>${formatScore(s.landing)}</td>
                <td>${formatScore(s.ferry)}</td>
            </tr>
        `;
    });

    container.innerHTML = `
        <div class="score-table-wrapper">
        ${theadRows}
            ${tbodyRows}
        </tbody></table>
        </div>
        <p class="score-note">注："—" 表示该学生未参加对应赛项</p>
    `;
}