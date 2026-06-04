/**
 * 社团规章数据
 */
const rulesData = [
    {
        id: 'club-rules',
        title: '无人机社团章程',
        icon: '📖',
        content: `
            <p><strong>第一章 总则</strong></p>
            <p>第一条 重庆八中无人机社团是在学校指导下，由对无人机技术感兴趣的学生自愿组成的科技类学生社团。</p>
            <p>第二条 社团宗旨：培养学生的科技创新精神和实践能力，提高学生对无人机技术的认知和操作水平。</p>
            <p><strong>第二章 社员权利与义务</strong></p>
            <ul>
                <li>参加社团组织的各项培训和活动</li>
                <li>使用社团提供的无人机设备和场地</li>
                <li>代表社团参加各类无人机竞赛</li>
                <li>对社团工作提出建议和意见</li>
                <li>遵守社团章程和各项规章制度</li>
                <li>按时参加社团活动，完成学习任务</li>
                <li>爱护社团设备，损坏须照价赔偿</li>
            </ul>
            <p><strong>第三章 组织架构</strong></p>
            <ul>
                <li>指导老师：裴老师、王老师</li>
                <li>社长：黄禹昊（管理编程赛项同学）</li>
                <li>副社长：郭丞璟（管理模拟赛项同学）</li>
            </ul>
        `
    },
    {
        id: 'elimination',
        title: '社员考核与淘汰办法',
        icon: '⚠️',
        content: `
            <p><strong>考核制度</strong></p>
            <p>社团实行定期考核制度，考核内容包括：</p>
            <ul>
                <li>出勤情况：缺勤次数不得超过3次</li>
                <li>技能考核：定期进行无人机操作技能测试</li>
                <li>学习态度：完成培训任务和作业情况</li>
                <li>团队协作：在团队活动中的表现和贡献</li>
            </ul>
            <p><strong>违纪行为</strong></p>
            <ul>
                <li>大吵大闹，影响他人训练</li>
                <li>做与比赛训练无关的娱乐行为</li>
            </ul>
            <p><strong>淘汰标准</strong></p>
            <ul>
                <li>缺勤超过3次，予以淘汰</li>
                <li>违纪行为超过3次，予以淘汰</li>
                <li>严重违反安全操作规程</li>
                <li>损坏设备后拒不赔偿或态度恶劣</li>
            </ul>
            <p><strong>退出程序</strong></p>
            <p>对符合淘汰标准的社员，经指导老师和社团干部讨论后，给予劝退处理。社员也可自愿申请退出。</p>
        `
    },
    {
        id: 'safety',
        title: '安全操作规范',
        icon: '🛡️',
        content: `
            <p><strong>飞行前检查</strong></p>
            <ul>
                <li>检查无人机电池电量是否充足</li>
                <li>检查螺旋桨是否安装牢固，有无损坏</li>
                <li>确认飞行区域无人员和障碍物</li>
                <li>检查遥控器信号是否正常</li>
            </ul>
            <p><strong>飞行中规范</strong></p>
            <ul>
                <li>严格在指定区域飞行，禁止飞越人群</li>
                <li>保持视距内飞行，不得超过可视范围</li>
                <li>遇到异常情况立即降落</li>
                <li>服从指导老师指挥，不得擅自操作</li>
            </ul>
            <p><strong>飞行后处理</strong></p>
            <ul>
                <li>关闭无人机电源和遥控器</li>
                <li>检查设备状态，记录使用情况</li>
                <li>将设备归还至指定存放位置</li>
            </ul>
        `
    }
];

/**
 * 渲染规章页面
 */
function renderRules() {
    const container = document.getElementById('rules-content');
    container.innerHTML = rulesData.map(rule => `
        <div class="rule-card" id="${rule.id}">
            <div class="rule-card-header" onclick="toggleCard(this)">
                <h3><span class="icon">${rule.icon}</span>${rule.title}</h3>
                <span class="toggle">▼</span>
            </div>
            <div class="rule-card-body">
                <div class="rule-card-content">${rule.content}</div>
            </div>
        </div>
    `).join('');
}
