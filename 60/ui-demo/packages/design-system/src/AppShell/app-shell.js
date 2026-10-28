/**
 * DSAppShell · HTML 预览底子（JS）
 *
 * 用法：
 *   <link rel="stylesheet" href="./packages/design-system/src/AppShell/app-shell.css" />
 *   <body>
 *     <div class="stage ds-scope">
 *       <!-- 业务内容（会被自动移到 .operation-content 中） -->
 *       <header class="operation-header">...</header>
 *       <div class="operation-query-row">...</div>
 *       <div class="operation-table-wrap">...</div>
 *       <footer class="operation-footer">...</footer>
 *     </div>
 *     <script src="./assets/icon-registry.js"></script>
 *     <script src="./packages/design-system/src/AppShell/app-shell.js"></script>
 *     <script>
 *       WiseAppShell.init({
 *         activeModule: 'doctor',
 *         secondaryNav: {
 *           title: '协议管理',
 *           status: ['进行', 6],
 *           items: ['协议模板','条款库','机构管理','年级管理','引用配置','条款审核'],
 *           foot: '流程参数设置'
 *         },
 *         activeFeature: '条款库',
 *         // 可选：业务一级页签切换，例如“待审核 / 已审核”
 *         // onSectionTabChange: (key) => renderBusinessPanel(key)
 *       });
 *     </script>
 *   </body>
 *
 * 依赖：
 *   - ./app-shell.css
 *   - ../../assets/icon-registry.js（如已加载，会自动调用 renderIcons）
 */

(function () {
  const PRIMARY_MODULES = [
    { key: 'prepare',   icon: 'prepare',   label: '准备工作' },
    { key: 'master',    icon: 'master',    label: '硕士' },
    { key: 'doctor',    icon: 'doctor',    label: '博士' },
    { key: 'camp',      icon: 'camp',      label: '夏令营' },
    { key: 'recommend', icon: 'recommend', label: '推免' },
    { key: 'hkmt',      icon: 'hkmt',      label: '港澳台' },
    { key: 'exam',      icon: 'exam',      label: '考务管理' }
  ];

  function renderPrimaryModules(activeModule) {
    return PRIMARY_MODULES.map(m => `
      <a class="primary-nav-item${m.key === activeModule ? ' active' : ''}" href="#" data-module="${m.key}">
        <span class="primary-nav-icon"><span class="wise-icon" data-wise-icon="${m.icon}"></span></span>
        <span class="primary-label">${m.label}</span>
      </a>
    `).join('');
  }

  function renderSecondaryNav(nav, activeFeature) {
    const status = nav.status
      ? `<span class="navigation-status">${nav.status[0]} <strong>${nav.status[1]}</strong></span>`
      : '';
    const items = (nav.items || []).map(f => `
      <a class="navigation-child${f === activeFeature ? ' active' : ''}" href="#" data-feature="${f}"><span>${f}</span></a>
    `).join('');
    return `
      <a class="navigation-row" href="#">
        <span class="navigation-title">${nav.title || ''}</span>
        ${status}
        <span class="navigation-arrow"><span class="wise-icon" data-wise-icon="chevronDown"></span></span>
      </a>
      ${items}
    `;
  }

  function renderTabs(items, activeFeature) {
    return (items || []).map(f => `
      <div class="operation-tab${f === activeFeature ? ' active' : ''}" data-tab="${f}">
        <span>${f}</span><span class="operation-tab-close">×</span>
      </div>
    `).join('');
  }

  function buildShellSkeleton(config) {
    const tabs = config.tabs || (config.secondaryNav && config.secondaryNav.items) || [];
    return `
      <nav class="primary-nav" aria-label="一级导航">
        <div class="primary-nav-main">
          <div class="primary-nav-head">
            <div class="primary-logo-frame"><img class="primary-logo" src="./assets/icons/金智logo.svg" alt="Wisedu" /></div>
            <p class="primary-system-name">系统</p>
            <button class="primary-collapse-toggle" type="button" aria-label="展开导航区"><img src="./assets/icons/indent-increase.png" alt="" /></button>
            <a class="primary-icon-button" href="#" aria-label="搜索"><span class="wise-icon" data-wise-icon="search"></span></a>
            <a class="primary-home primary-nav-item" href="#" data-module="home"><span class="primary-nav-icon"><span class="wise-icon" data-wise-icon="home"></span></span><span class="primary-label">首页</span></a>
          </div>
          <div class="primary-nav-list">${renderPrimaryModules(config.activeModule)}</div>
          <div class="primary-tools">
            <a class="primary-tool" href="#" aria-label="皮肤"><span class="wise-icon" data-wise-icon="skin"></span></a>
            <a class="primary-tool" href="#" aria-label="下载"><span class="wise-icon" data-wise-icon="download"></span></a>
            <a class="primary-tool" href="#" aria-label="设置"><span class="wise-icon" data-wise-icon="settings"></span></a>
          </div>
          <div class="primary-avatar"></div>
        </div>
        <div class="primary-user"><span>${config.userName || '管理员'}</span><span class="wise-icon" data-wise-icon="chevronDown"></span></div>
      </nav>

      <section class="navigation-area" aria-label="导航区">
        <nav class="navigation-menu" aria-label="二级导航栏">
          <div class="navigation-menu-head">
            <button class="navigation-collapse" type="button" aria-label="收起导航区"><img src="./assets/icons/indent-decrease.png" alt="" /></button>
            <div class="navigation-head-space"></div>
          </div>
          <div class="navigation-list">${renderSecondaryNav(config.secondaryNav || {}, config.activeFeature)}</div>
          <div class="navigation-menu-foot">
            <a class="navigation-bottom-row" href="#">
              <span class="navigation-bottom-icon"><span class="wise-icon" data-wise-icon="flow"></span></span>
              <span class="navigation-bottom-text"><span>${(config.secondaryNav && config.secondaryNav.foot) || '流程参数设置'}</span></span>
            </a>
          </div>
        </nav>
        <main class="operation-area" aria-label="操作区">
          <div class="operation-shell">
            <div class="operation-tabs-bar">
              <div class="operation-tabs">${renderTabs(tabs, config.activeFeature)}</div>
              <button class="operation-tab-add" type="button" aria-label="新增页签">＋</button>
              <button class="operation-tool" type="button" aria-label="刷新">↻</button>
              <button class="operation-tool" type="button" aria-label="全屏">□</button>
            </div>
            <section class="operation-body">
              <div class="operation-content"></div>
            </section>
          </div>
        </main>
      </section>
    `;
  }

  function init(config) {
    config = config || {};
    const stage = document.querySelector(config.root || '.stage');
    if (!stage) {
      console.warn('[WiseAppShell] .stage not found');
      return null;
    }

    // 1. 保留业务内容（.stage 当前的所有子节点）
    const businessContent = Array.from(stage.children);

    // 2. 渲染外壳骨架
    stage.innerHTML = buildShellSkeleton(config);

    // 3. 把业务内容移进 .operation-content
    const slot = stage.querySelector('.operation-content');
    businessContent.forEach(node => slot.appendChild(node));

    // 4. 收起 / 展开
    const expandBtn = stage.querySelector('.navigation-collapse');
    const collapseBtn = stage.querySelector('.primary-collapse-toggle');
    function setCollapsed(c) {
      stage.classList.toggle('nav-collapsed', c);
      if (expandBtn) expandBtn.setAttribute('aria-expanded', String(!c));
      if (collapseBtn) collapseBtn.setAttribute('aria-expanded', String(!c));
    }
    if (expandBtn) expandBtn.addEventListener('click', () => setCollapsed(true));
    if (collapseBtn) collapseBtn.addEventListener('click', () => setCollapsed(false));

    // 5. 业务一级页签：多页签才展示标题行，点击后切换 active 和可选 panel
    function getSectionTabKey(tab) {
      return tab.dataset.sectionTab || tab.dataset.reviewTab || tab.dataset.tab || '';
    }

    function activateSectionTab(key, source) {
      if (!key) return;
      stage.querySelectorAll('.operation-section-tabs [data-section-tab], .operation-section-tabs [data-review-tab], .operation-section-tabs [data-tab]').forEach(tab => {
        tab.classList.toggle('is-active', getSectionTabKey(tab) === key);
      });
      const panels = stage.querySelectorAll('[data-section-panel]');
      panels.forEach(panel => {
        panel.hidden = panel.dataset.sectionPanel !== key;
      });
      if (typeof config.onSectionTabChange === 'function') {
        config.onSectionTabChange(key, source);
      }
    }

    stage.querySelectorAll('.operation-section-tabs').forEach(group => {
      const tabs = group.querySelectorAll('[data-section-tab], [data-review-tab], [data-tab]');
      const header = group.closest('.operation-header');
      if (header) header.classList.toggle('is-hidden', tabs.length <= 1);
      group.addEventListener('click', event => {
        const tab = event.target.closest('[data-section-tab], [data-review-tab], [data-tab]');
        if (!tab || !group.contains(tab)) return;
        event.preventDefault();
        activateSectionTab(getSectionTabKey(tab), tab);
      });
      const active = group.querySelector('.is-active') || tabs[0];
      if (active) activateSectionTab(getSectionTabKey(active), active);
    });

    // 6. 二级导航 ↔ 顶 Tab 双向联动
    function activateFeature(feature) {
      if (!feature) return;
      stage.querySelectorAll('.navigation-child').forEach(n =>
        n.classList.toggle('active', n.dataset.feature === feature));
      stage.querySelectorAll('.operation-tab').forEach(t =>
        t.classList.toggle('active', t.dataset.tab === feature));
      if (typeof config.onFeatureChange === 'function') {
        config.onFeatureChange(feature);
      } else {
        // 默认行为：同步更新 operation-title
        const title = stage.querySelector('.operation-title');
        const titleText = title && title.querySelector('span');
        if (titleText) titleText.textContent = feature;
        else if (title) title.textContent = feature;
      }
    }

    stage.querySelectorAll('.navigation-child').forEach(item => {
      item.addEventListener('click', e => { e.preventDefault(); activateFeature(item.dataset.feature); });
    });
    stage.querySelectorAll('.operation-tab').forEach(tab => {
      tab.addEventListener('click', e => {
        if (e.target.classList.contains('operation-tab-close')) return;
        activateFeature(tab.dataset.tab);
      });
    });

    // 7. 一级导航点击：仅切换 active（不重渲染二级导航，避免 demo 失焦）
    if (config.onModuleChange) {
      stage.querySelectorAll('.primary-nav-item[data-module]').forEach(item => {
        item.addEventListener('click', e => {
          e.preventDefault();
          stage.querySelectorAll('.primary-nav-item').forEach(n => n.classList.remove('active'));
          item.classList.add('active');
          config.onModuleChange(item.dataset.module);
        });
      });
    }

    // 8. 渲染图标（icon-registry.js 必须已加载）
    if (window.WiseIconRegistry) {
      window.WiseIconRegistry.renderIcons(stage);
    } else {
      console.warn('[WiseAppShell] icon-registry.js not loaded - icons will not render');
    }

    return { stage, setCollapsed, activateFeature, activateSectionTab };
  }

  window.WiseAppShell = { init, PRIMARY_MODULES };
})();
