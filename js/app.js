/**
 * 主应用逻辑
 * 页面导航、卡片折叠等
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMobileNav();
    initQuickNav();
    renderRules();
    renderCompetitions();
    initQA();
});

/**
 * 页面导航
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            switchPage(page);

            // 关闭移动端菜单
            document.getElementById('navLinks').classList.remove('open');
        });
    });
}

/**
 * 切换页面
 */
function switchPage(pageName) {
    // 更新导航高亮
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageName);
    });

    // 切换页面显示
    document.querySelectorAll('.page').forEach(page => {
        page.classList.toggle('active', page.id === `page-${pageName}`);
    });

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 移动端导航切换
 */
function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    toggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
}

/**
 * 首页快速导航
 */
function initQuickNav() {
    document.querySelectorAll('.quick-nav-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const target = card.dataset.goto;
            switchPage(target);
        });
    });
}

/**
 * 折叠/展开卡片
 */
function toggleCard(headerEl) {
    const card = headerEl.parentElement;
    card.classList.toggle('expanded');
}
