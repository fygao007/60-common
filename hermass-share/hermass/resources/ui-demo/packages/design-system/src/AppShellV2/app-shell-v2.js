(function () {
  const shellScriptUrl = document.currentScript?.src
    ? new URL(document.currentScript.src)
    : null;
  const shellStyleUrl = shellScriptUrl
    ? new URL('./app-shell-v2.css', shellScriptUrl)
    : null;
  if (shellStyleUrl && shellScriptUrl) {
    shellStyleUrl.search = shellScriptUrl.search;
  }
  const SHELL_STYLE_URL = shellStyleUrl?.href || '';
  const DEFAULT_FRAMEWORK_ASSET_BASE = shellScriptUrl
    ? new URL('../../../../framework/assets/', shellScriptUrl).href.replace(/\/$/, '')
    : './framework/assets';
  const HOST_FRAMEWORK_CLASSES = new Set(['frame2-stage', 'ds-scope']);

  const DEFAULT_APPS = [
    { key: 'home', label: '首页' },
    { key: 'task', label: '任务中心' },
    { key: 'personnel', label: '人事服务', apps: [
      { key: 'staff', label: '教职工管理' },
      { key: 'contract', label: '合同管理' }
    ] },
    { key: 'daily', label: '日常管理', apps: [
      { key: 'attendance', label: '考勤管理' },
      { key: 'approval', label: '流程审批' }
    ] },
    { key: 'ai', label: 'AI观察室' },
    { key: 'stats', label: '数据统计' }
  ];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function escapeSelector(value) {
    if (window.CSS?.escape) return CSS.escape(value);
    return String(value).replace(/["\\]/g, '\\$&');
  }

  function shortLabel(label) {
    const text = String(label || '');
    return text.length > 8 ? `${text.slice(0, 8)}...` : text;
  }

  function normalizeItem(item) {
    return typeof item === 'string' ? { key: item, label: item } : item;
  }

  function normalizeTab(item) {
    const tab = normalizeItem(item);
    return {
      key: tab.key || tab.label,
      label: tab.label || tab.key,
      icon: tab.icon,
      wiseIcon: tab.wiseIcon,
      href: tab.href || tab.url || tab.path,
      closable: tab.closable !== false
    };
  }

  function isHomeTab(tab) {
    return tab.key === 'home' || tab.label === '首页';
  }

  function homeTab(config) {
    return normalizeTab({
      key: 'home',
      label: '首页',
      wiseIcon: 'homeOutline',
      href: config.homeHref || config.homeUrl || config.appRoutes?.home || './staff-portal-homepage.html',
      closable: false
    });
  }

  function ensureHomeTab(tabs, config) {
    if (config.pinHomeTab === false) return tabs;
    const items = [...tabs];
    const index = items.findIndex(isHomeTab);
    const fixedHome = index >= 0 ? { ...items[index], key: items[index].key || 'home', label: '首页', wiseIcon: items[index].wiseIcon || 'homeOutline', closable: false } : homeTab(config);
    if (index >= 0) items.splice(index, 1);
    return [fixedHome, ...items];
  }

  function flattenMenu(items, parents = []) {
    return (items || []).flatMap((raw) => {
      const item = normalizeItem(raw);
      const children = item.children || [];
      const key = item.key || item.label;
      const label = item.label || item.key;
      if (children.length) return flattenMenu(children, [...parents, { key, label }]);
      const parent = parents[parents.length - 1];
      return [{
        key,
        label,
        parentKey: parent?.key,
        parentLabel: parents.map((node) => node.label).join(' / '),
        icon: item.icon,
        href: appHref(item)
      }];
    });
  }

  function firstFeature(items) {
    return flattenMenu(items)[0] || null;
  }

  function hasMenuItems(items) {
    return Array.isArray(items) && items.length > 0;
  }

  function flattenApps(groups) {
    return (groups || DEFAULT_APPS).flatMap((item) => item.apps || [item]);
  }

  function findApp(groups, key) {
    return flattenApps(groups).find((item) => item.key === key) || null;
  }

  function roleLabels(config) {
    if (Array.isArray(config.roles) && config.roles.length) return config.roles;
    const profiles = config.roleProfiles || {};
    return Object.keys(profiles);
  }

  function roleAppGroups(config, role) {
    const profile = config.roleProfiles?.[role];
    return profile?.appGroups || profile?.groups || config.appGroups || DEFAULT_APPS;
  }

  function appGroupActive(group, activeApp) {
    return group.key === activeApp || (group.apps || []).some((item) => item.key === activeApp);
  }

  function appHref(item) {
    return item.href || item.url || item.path || '';
  }

  function renderAppAttrs(item) {
    const href = appHref(item);
    return `${href ? ` data-app-href="${escapeHtml(href)}"` : ''}`;
  }

  function appMenuColumns(apps) {
    return Math.min(Math.max((apps || []).length, 1), 5);
  }

  function renderAppOptionIcon(app) {
    if (app.icon) return `<span class="frame2-app-option-icon"><img src="${escapeHtml(app.icon)}" alt="" /></span>`;
    if (app.wiseIcon) return `<span class="frame2-app-option-icon"><span class="wise-icon" data-wise-icon="${escapeHtml(app.wiseIcon)}"></span></span>`;
    return `<span class="frame2-app-option-icon">${escapeHtml(shortLabel(app.label || app.key).slice(0, 1))}</span>`;
  }

  function renderApps(groups, activeApp) {
    return (groups || DEFAULT_APPS).map((item) => {
      if (item.apps && item.apps.length) {
        return `
          <div class="frame2-app-group${appGroupActive(item, activeApp) ? ' is-active' : ''}" data-app-group="${escapeHtml(item.key)}">
            <button class="frame2-app-trigger" type="button" title="${escapeHtml(item.label)}" aria-haspopup="menu" aria-expanded="false">
              <span>${escapeHtml(shortLabel(item.label))}</span>
              <span class="frame2-app-arrow"><span class="wise-icon" data-wise-icon="chevronDown"></span></span>
            </button>
            <div class="frame2-app-menu" role="menu" style="--frame2-app-menu-columns: ${appMenuColumns(item.apps)};">
              ${item.apps.map((app) => `
                <button class="frame2-app-option${app.key === activeApp ? ' is-active' : ''}" type="button" role="menuitem" data-app="${escapeHtml(app.key)}" data-app-label="${escapeHtml(app.label)}"${renderAppAttrs(app)} title="${escapeHtml(app.label)}">
                  ${renderAppOptionIcon(app)}
                  <span class="frame2-app-option-label">${escapeHtml(shortLabel(app.label))}</span>
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }
      return `
        <button class="frame2-module${item.key === activeApp ? ' is-active' : ''}" type="button" data-app="${escapeHtml(item.key)}" data-app-label="${escapeHtml(item.label)}"${renderAppAttrs(item)} title="${escapeHtml(item.label)}">
          <span>${escapeHtml(shortLabel(item.label))}</span>
        </button>
      `;
    }).join('');
  }

  function menuItemActive(item, activeFeature) {
    const normalized = normalizeItem(item);
    return normalized.key === activeFeature
      || normalized.label === activeFeature
      || (normalized.children || []).some((child) => menuItemActive(child, activeFeature));
  }

  function renderMenu(items, activeFeature, level = 1) {
    return (items || []).map(normalizeItem).map((item) => {
      const key = item.key || item.label;
      const label = item.label || item.key;
      if (level < 3 && item.children && item.children.length) {
        const active = menuItemActive(item, activeFeature);
        const open = item.expanded !== false || active;
        return `
          <div class="frame2-side-group is-level-${level}${open ? ' is-open' : ''}${active ? ' is-active' : ''}" data-menu-group="${escapeHtml(key)}">
            <button class="frame2-side-item is-group is-level-${level}" type="button" data-menu-toggle="${escapeHtml(key)}" title="${escapeHtml(label)}" aria-expanded="${open}">
              ${level === 1 ? `<span class="frame2-side-icon"><span class="wise-icon" data-wise-icon="${escapeHtml(item.icon || 'chevronRight')}"></span></span>` : ''}
              <span class="frame2-side-label">${escapeHtml(label)}</span>
              <span class="frame2-side-arrow" aria-hidden="true"><span class="wise-icon" data-wise-icon="${open ? 'chevronUp' : 'chevronDown'}"></span></span>
            </button>
            <div class="frame2-side-children is-level-${level + 1}">
              ${level === 1 ? `<div class="frame2-side-flyout-title">${escapeHtml(label)}</div>` : ''}
              ${renderMenu(item.children, activeFeature, level + 1)}
            </div>
          </div>
        `;
      }
      const href = appHref(item);
      return `
        <button class="frame2-side-item is-level-${level}${key === activeFeature || label === activeFeature ? ' is-active' : ''}" type="button" data-feature="${escapeHtml(key)}" data-feature-label="${escapeHtml(label)}"${href ? ` data-feature-href="${escapeHtml(href)}"` : ''} title="${escapeHtml(label)}">
          ${level === 1 ? `<span class="frame2-side-icon"><span class="wise-icon" data-wise-icon="${escapeHtml(item.icon || 'chevronRight')}"></span></span>` : ''}
          ${level === 3 ? '<span class="frame2-side-dot" aria-hidden="true"></span>' : ''}
          <span class="frame2-side-label">${escapeHtml(label)}</span>
        </button>
      `;
    }).join('');
  }

  function renderTabs(items, activeFeature) {
    return (items || []).map(normalizeTab).map((item) => {
      const fallbackWiseIcon = !item.icon && !item.wiseIcon && (item.key === 'home' || item.label === '首页') ? 'homeOutline' : '';
      return `
      <button class="frame2-tab${item.key === activeFeature ? ' is-active' : ''}" type="button" role="tab" aria-selected="${item.key === activeFeature ? 'true' : 'false'}" data-tab="${escapeHtml(item.key)}" data-tab-label="${escapeHtml(item.label)}"${item.href ? ` data-tab-href="${escapeHtml(item.href)}"` : ''} title="${escapeHtml(item.label)}">
        ${item.icon ? `<span class="frame2-tab-icon"><img src="${escapeHtml(item.icon)}" alt="" /></span>` : ''}
        ${item.wiseIcon || fallbackWiseIcon ? `<span class="frame2-tab-icon"><span class="wise-icon" data-wise-icon="${escapeHtml(item.wiseIcon || fallbackWiseIcon)}"></span></span>` : ''}
        <span>${escapeHtml(item.label)}</span>
        ${item.closable ? '<span class="frame2-tab-close" aria-label="关闭页签">×</span>' : ''}
      </button>
    `;
    }).join('');
  }

  function getUtilityTools(items) {
    return Array.isArray(items) && items.length ? items : [
      { key: 'search', label: '搜索', wiseIcon: 'search' },
      { key: 'skin', label: '换肤', wiseIcon: 'skin' },
      { key: 'language', label: '中英文', wiseIcon: 'settings' }
    ];
  }

  function renderUserUtilityItems(items) {
    const tools = getUtilityTools(items);
    const labels = { search: '搜索', skin: '换肤', language: '中英文' };
    return tools.map((item) => {
      const icon = item.icon ? `<img src="${escapeHtml(item.icon)}" alt="" />` : '';
      const label = labels[item.key] || item.label || item.key;
      return `<button type="button" data-user-action="${escapeHtml(item.key)}">${icon}<span>${escapeHtml(label)}</span></button>`;
    }).join('');
  }

  function renderRoleOptions(roles, activeRole) {
    const items = Array.isArray(roles) && roles.length ? roles : ['师资科', '教职工', '部门管理员', '系统管理员'];
    return items.map((role) => {
      const value = typeof role === 'string' ? role : role.value || role.label;
      const label = typeof role === 'string' ? role : role.label || role.value;
      const active = label === activeRole || value === activeRole;
      return `<button class="${active ? 'is-active' : ''}" type="button" data-user-role="${escapeHtml(value)}">${escapeHtml(label)}</button>`;
    }).join('');
  }

  function renderSearchResults(results) {
    if (!results.length) return '<div class="frame2-search-empty">暂无匹配结果</div>';
    return results.map((item) => `
      <button class="frame2-search-result" type="button" data-search-type="${escapeHtml(item.type)}" data-search-key="${escapeHtml(item.key)}" data-search-label="${escapeHtml(item.label)}"${item.href ? ` data-search-href="${escapeHtml(item.href)}"` : ''}>
        <span class="frame2-search-type">${escapeHtml(item.typeLabel)}</span>
        <span class="frame2-search-label">${escapeHtml(item.label)}</span>
      </button>
    `).join('');
  }

  function buildShell(config, state, useContentSlot) {
    const frameworkAssetBase = config.frameworkAssetBase || DEFAULT_FRAMEWORK_ASSET_BASE;
    const brandLogo = config.frameworkLogoSrc || `${frameworkAssetBase}/szpu-emblem.png`;
    const brandLogoAlt = config.logoAlt || '深圳职业技术大学';
    const roleName = state.roleName || config.roleName || config.userRole || '师资科';
    const appGroups = state.appGroups || config.appGroups || DEFAULT_APPS;
    const roles = roleLabels(config);
    return `
      <header class="frame2-topbar">
        <div class="frame2-brand">
          <img class="frame2-brand-logo" src="${escapeHtml(brandLogo)}" alt="${escapeHtml(brandLogoAlt)}" />
          <span class="frame2-brand-text">
            <span class="frame2-brand-name">${escapeHtml(config.systemName || '系统框架2')}</span>
            <span class="frame2-brand-sub">${escapeHtml(config.versionLabel || 'Frame 2')}</span>
          </span>
        </div>
        <nav class="frame2-module-tabs" aria-label="应用导航">${renderApps(appGroups, state.activeApp)}</nav>
        <div class="frame2-tools">
          <div class="frame2-user">
            <button class="frame2-profile-trigger" type="button" data-profile-trigger aria-haspopup="menu" aria-expanded="false">
              <span class="frame2-avatar" aria-hidden="true"></span>
              <span class="frame2-user-name">${escapeHtml(config.userName || '人事处管理员')}</span>
            </button>
            <div class="frame2-profile-menu" role="menu">
              <div class="frame2-user-menu-section">${renderUserUtilityItems(config.topTools)}</div>
              <div class="frame2-user-menu-section">
                <button type="button" data-user-action="profile">个人中心</button>
                <button type="button" data-user-action="password">修改密码</button>
                <button type="button" data-user-action="logout">退出登录</button>
              </div>
            </div>
            <button class="frame2-role-trigger" type="button" data-role-trigger aria-haspopup="menu" aria-expanded="false">
              <span class="frame2-user-role" data-current-role title="${escapeHtml(roleName)}">${escapeHtml(roleName)}</span>
              <span class="frame2-user-arrow">⌄</span>
            </button>
            <div class="frame2-role-menu" role="menu" aria-label="角色切换">
              ${renderRoleOptions(roles, roleName)}
            </div>
          </div>
        </div>
        <div class="frame2-search-panel" data-search-panel>
          <div class="frame2-search-box">
            <span class="wise-icon" data-wise-icon="search"></span>
            <input type="search" data-search-input placeholder="搜索应用、菜单或页签" />
          </div>
          <div class="frame2-search-results" data-search-results></div>
        </div>
      </header>
      <div class="frame2-main">
        <aside class="frame2-sidebar">
          <nav class="frame2-menu" aria-label="二级导航">${renderMenu(state.menuItems, state.activeFeature)}</nav>
          <button class="frame2-side-collapse" type="button" aria-label="收起导航">
            <span class="frame2-side-icon"><img src="${escapeHtml(frameworkAssetBase)}/indent-decrease.svg" alt="" /></span>
            <span class="frame2-side-label">收起导航</span>
          </button>
        </aside>
        <main class="frame2-workspace">
          <div class="frame2-tabsbar">
            <div class="frame2-tabs">${renderTabs(state.tabs, state.activeFeature)}</div>
            <button class="frame2-tool" type="button" data-tab-refresh aria-label="刷新当前页签" title="刷新当前页签"><img src="${escapeHtml(frameworkAssetBase)}/tab-refresh.svg" alt="" /></button>
            <button class="frame2-tool" type="button" data-fullscreen aria-label="全屏" title="全屏"><img src="${escapeHtml(frameworkAssetBase)}/tab-fullscreen.svg" alt="" /></button>
          </div>
          <section class="frame2-content-shell">
            <div class="frame2-content">${useContentSlot ? '<slot name="frame2-content"></slot>' : ''}</div>
          </section>
        </main>
      </div>
      <div class="frame2-toast" data-toast></div>
    `;
  }

  function prepareBusinessContent(host) {
    let nodes = Array.from(host.children);
    const businessClasses = Array.from(host.classList).filter((name) => (
      !HOST_FRAMEWORK_CLASSES.has(name)
      && !name.startsWith('is-')
    ));

    if (businessClasses.length) {
      let contentRoot = nodes[0] || document.createElement('div');
      if (!nodes.length) {
        host.appendChild(contentRoot);
        nodes = [contentRoot];
      } else if (nodes.length > 1) {
        contentRoot = document.createElement('div');
        nodes.forEach((node) => contentRoot.appendChild(node));
        host.appendChild(contentRoot);
        nodes = [contentRoot];
      }
      contentRoot.classList.add(...businessClasses);
      host.classList.remove(...businessClasses);
    }

    return nodes;
  }

  function createMountSurface(host, businessContent) {
    host.classList.add('frame2-stage', 'ds-scope');
    host.style.display = 'block';
    host.style.width = '100vw';
    host.style.height = '100vh';
    host.style.minWidth = '0';
    host.style.minHeight = '0';
    host.style.overflow = 'hidden';

    if (!host.attachShadow) {
      if (SHELL_STYLE_URL && !document.querySelector('link[data-frame2-fallback-style]')) {
        const fallbackStyle = document.createElement('link');
        fallbackStyle.rel = 'stylesheet';
        fallbackStyle.href = SHELL_STYLE_URL;
        fallbackStyle.dataset.frame2FallbackStyle = '';
        document.head.appendChild(fallbackStyle);
      }
      return { stage: host, useContentSlot: false };
    }

    const shadowRoot = host.shadowRoot || host.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      ${SHELL_STYLE_URL ? `<link rel="stylesheet" href="${escapeHtml(SHELL_STYLE_URL)}" />` : ''}
      <div class="frame2-stage ds-scope" data-frame2-shell-root></div>
    `;
    businessContent.forEach((node) => {
      node.setAttribute('slot', 'frame2-content');
    });
    return {
      stage: shadowRoot.querySelector('[data-frame2-shell-root]'),
      useContentSlot: true
    };
  }

  function init(config) {
    config = config || {};
    const host = document.querySelector(config.root || '.frame2-stage');
    if (!host) return null;
    const businessContent = prepareBusinessContent(host);
    const mountSurface = createMountSurface(host, businessContent);
    const stage = mountSurface.stage;

    const defaultMenu = config.secondaryNav?.items || [];
    const initialRole = config.roleName || config.userRole || roleLabels(config)[0] || '师资科';
    const appGroups = roleAppGroups(config, initialRole);
    const forceHideSidebar = config.hideSidebar === true || config.sidebar === false;
    const workspaceVariant = config.workspaceVariant === 'card' ? 'card' : 'canvas';
    function getAppMenu(key) {
      const app = findApp(state.appGroups, key);
      if (config.appMenus && Object.prototype.hasOwnProperty.call(config.appMenus, key)) return config.appMenus[key] || [];
      return app?.secondaryNav?.items || app?.menuItems || app?.menus || defaultMenu;
    }
    const state = {
      activeApp: config.activeApp || config.activeModule || appGroups[0]?.key || 'home',
      roleName: initialRole,
      appGroups,
      menuItems: defaultMenu,
      activeFeature: config.activeFeature,
      tabs: (config.tabs || []).map(normalizeTab)
    };
    state.menuItems = getAppMenu(state.activeApp);
    stage.classList.toggle('is-sidebar-hidden', forceHideSidebar || !hasMenuItems(state.menuItems));
    stage.classList.toggle('is-workspace-card', workspaceVariant === 'card');
    stage.dataset.workspaceVariant = workspaceVariant;
    const initialFeature = state.activeFeature || firstFeature(state.menuItems)?.key;
    state.activeFeature = initialFeature;
    if (!state.tabs.length && initialFeature) {
      const initial = firstFeature(state.menuItems);
      state.tabs = [{ key: initialFeature, label: initial?.label || initialFeature, closable: false }];
    } else if (!state.tabs.length && state.activeApp) {
      const app = findApp(state.appGroups, state.activeApp);
      state.activeFeature = state.activeApp;
      state.tabs = [{ key: state.activeApp, label: app?.label || state.activeApp, closable: false }];
    }
    state.tabs = ensureHomeTab(state.tabs, config);

    stage.innerHTML = buildShell(
      config,
      state,
      mountSurface.useContentSlot && config.emptyContent !== true
    );
    const moduleTabs = stage.querySelector('.frame2-module-tabs');
    const menu = stage.querySelector('.frame2-menu');
    const tabs = stage.querySelector('.frame2-tabs');
    const searchInput = stage.querySelector('[data-search-input]');
    const searchResults = stage.querySelector('[data-search-results]');
    const content = stage.querySelector('.frame2-content');
    if (content && config.emptyContent !== true && !mountSurface.useContentSlot) {
      businessContent.forEach((node) => content.appendChild(node));
    }

    function renderDynamic() {
      if (menu) menu.innerHTML = renderMenu(state.menuItems, state.activeFeature);
      if (tabs) tabs.innerHTML = renderTabs(state.tabs, state.activeFeature);
      window.WiseIconRegistry?.renderIcons(stage);
    }

    function updateActiveState() {
      stage.querySelectorAll('[data-feature]').forEach((node) => {
        const active = node.dataset.feature === state.activeFeature || node.dataset.featureLabel === state.activeFeature;
        node.classList.toggle('is-active', active);
        const group = node.closest('.frame2-side-group');
        if (group && active) {
          group.classList.add('is-active', 'is-open');
          const arrow = group.querySelector('.frame2-side-arrow');
          if (arrow) arrow.innerHTML = '<span class="wise-icon" data-wise-icon="chevronUp"></span>';
        }
      });
      stage.querySelectorAll('.frame2-side-group').forEach((group) => {
        const active = Boolean(group.querySelector('[data-feature].is-active'));
        group.classList.toggle('is-active', active);
      });
      stage.querySelectorAll('[data-tab]').forEach((node) => {
        const active = node.dataset.tab === state.activeFeature;
        node.classList.toggle('is-active', active);
        node.setAttribute('aria-selected', String(active));
      });
    }

    function ensureTab(key, label, closable = true) {
      if (!key) return;
      if (!state.tabs.some((tab) => tab.key === key)) {
        state.tabs.push({ key, label: label || key, closable });
        state.tabs = ensureHomeTab(state.tabs, config);
      }
    }

    function resolveFeatureHref(key, href) {
      return href || config.featureRoutes?.[key] || '';
    }

    function activateFeature(key, label, href) {
      if (!key) return;
      state.activeFeature = key;
      const tabCount = state.tabs.length;
      ensureTab(key, label || key);
      const target = resolveFeatureHref(key, href);
      if (target) {
        const tab = state.tabs.find((item) => item.key === key);
        if (tab) tab.href = target;
      }
      if (state.tabs.length !== tabCount) {
        if (tabs) tabs.innerHTML = renderTabs(state.tabs, state.activeFeature);
        window.WiseIconRegistry?.renderIcons(stage);
      }
      updateActiveState();
      if (typeof config.onFeatureChange === 'function') config.onFeatureChange(key);
      if (target) window.location.href = target;
    }

    function closeTab(key) {
      const index = state.tabs.findIndex((tab) => tab.key === key);
      if (index < 0 || state.tabs[index].closable === false) return;
      const wasActive = state.activeFeature === key;
      state.tabs.splice(index, 1);
      if (wasActive) {
        const next = state.tabs[index] || state.tabs[index - 1] || null;
        state.activeFeature = next?.key || null;
      }
      renderDynamic();
    }

    function refreshActiveTab() {
      if (typeof config.onTabRefresh === 'function') {
        const result = config.onTabRefresh(state.activeFeature);
        if (result === false) return;
      }
      window.location.reload();
    }

    function resolveAppHref(key, href) {
      return href || config.appRoutes?.[key] || '';
    }

    function navigateApp(key, label, href) {
      const target = resolveAppHref(key, href);
      if (typeof config.onAppNavigate === 'function') {
        const result = config.onAppNavigate(key, label, target);
        if (result === false) return;
      }
      if (target) window.location.href = target;
    }

    function activateApp(key, label, href) {
      state.activeApp = key;
      state.menuItems = getAppMenu(key);
      const next = firstFeature(state.menuItems);
      const showSidebar = !forceHideSidebar && hasMenuItems(state.menuItems);
      stage.classList.toggle('is-sidebar-hidden', !showSidebar);
      if (next) {
        state.activeFeature = next.key;
        ensureTab(next.key, next.label);
      } else {
        state.activeFeature = key;
        ensureTab(key, label || key);
      }
      renderDynamic();
      updateActiveState();
      stage.querySelectorAll('.frame2-module, .frame2-app-option, .frame2-app-group').forEach((item) => item.classList.remove('is-active'));
      stage.querySelectorAll(`[data-app="${escapeSelector(key)}"]`).forEach((node) => node.classList.add('is-active'));
      const group = stage.querySelector(`[data-app="${escapeSelector(key)}"]`)?.closest('.frame2-app-group');
      if (group) group.classList.add('is-active');
      closeAppGroups();
      if (typeof config.onAppChange === 'function') config.onAppChange(key, label);
      if (typeof config.onModuleChange === 'function') config.onModuleChange(key, label);
      navigateApp(key, label, href);
    }

    function searchItems(query = '') {
      const q = query.trim().toLowerCase();
      const appItems = (state.appGroups || DEFAULT_APPS).flatMap((item) => item.apps || [item]).map((item) => ({
        type: 'app',
        typeLabel: '应用',
        key: item.key,
        label: item.label,
        href: resolveAppHref(item.key, appHref(item))
      }));
      const menuItems = flattenMenu(state.menuItems).map((item) => ({
        type: 'feature',
        typeLabel: '菜单',
        key: item.key,
        label: item.parentLabel ? `${item.parentLabel} / ${item.label}` : item.label,
        href: resolveFeatureHref(item.key, item.href)
      }));
      const tabItems = state.tabs.map((item) => ({
        type: 'tab',
        typeLabel: '页签',
        key: item.key,
        label: item.label
      }));
      return [...appItems, ...menuItems, ...tabItems].filter((item) => !q || `${item.label} ${item.key}`.toLowerCase().includes(q)).slice(0, 12);
    }

    function updateSearch() {
      if (!searchResults) return;
      searchResults.innerHTML = renderSearchResults(searchItems(searchInput?.value || ''));
    }

    function toggleSearch(force) {
      const panel = stage.querySelector('[data-search-panel]');
      const open = force ?? !stage.classList.contains('is-search-open');
      stage.classList.toggle('is-search-open', open);
      if (open) {
        updateSearch();
        requestAnimationFrame(() => searchInput?.focus());
      } else {
        if (searchInput) searchInput.value = '';
      }
      panel?.setAttribute('aria-hidden', String(!open));
    }

    function toast(message) {
      const node = stage.querySelector('[data-toast]');
      if (!node) return;
      node.textContent = message;
      stage.classList.add('has-toast');
      clearTimeout(stage.__frame2ToastTimer);
      stage.__frame2ToastTimer = setTimeout(() => stage.classList.remove('has-toast'), 1600);
    }

    function closeAppGroups(exceptGroup) {
      stage.querySelectorAll('.frame2-app-group.is-open').forEach((group) => {
        if (group === exceptGroup) return;
        group.classList.remove('is-open');
        group.querySelector('.frame2-app-trigger')?.setAttribute('aria-expanded', 'false');
      });
    }

    function setProfileMenuOpen(open) {
      stage.classList.toggle('is-profile-open', open);
      stage.querySelector('[data-profile-trigger]')?.setAttribute('aria-expanded', String(open));
    }

    function setRoleMenuOpen(open) {
      stage.classList.toggle('is-role-open', open);
      stage.querySelector('[data-role-trigger]')?.setAttribute('aria-expanded', String(open));
    }

    stage.addEventListener('click', (event) => {
      const target = event.target;
      const appTrigger = target.closest('.frame2-app-trigger');
      const appNode = target.closest('[data-app]');
      const appGroup = target.closest('.frame2-app-group');
      const featureNode = target.closest('[data-feature]');
      const tabNode = target.closest('[data-tab]');
      const closeNode = target.closest('.frame2-tab-close');
      const toolNode = target.closest('[data-tool]');
      const searchResult = target.closest('[data-search-key]');
      const profileTrigger = target.closest('[data-profile-trigger]');
      const roleTrigger = target.closest('[data-role-trigger]');
      const userAction = target.closest('[data-user-action]');
      const userRole = target.closest('[data-user-role]');
      const searchPanel = target.closest('[data-search-panel]');
      const userMenu = target.closest('.frame2-user');

      if (!appGroup) closeAppGroups();
      if (!userMenu) {
        setProfileMenuOpen(false);
        setRoleMenuOpen(false);
      }
      if (!searchPanel && !searchResult && !(userAction?.dataset.userAction === 'search')) {
        toggleSearch(false);
      }

      if (target.closest('.frame2-side-collapse')) {
        stage.classList.toggle('is-side-collapsed');
        const collapsed = stage.classList.contains('is-side-collapsed');
        const collapse = stage.querySelector('.frame2-side-collapse');
        collapse?.setAttribute('aria-label', collapsed ? '展开导航' : '收起导航');
        collapse?.setAttribute('title', collapsed ? '展开导航' : '收起导航');
        return;
      }
      if (target.closest('[data-menu-toggle]')) {
        const group = target.closest('.frame2-side-group');
        group?.classList.toggle('is-open');
        const arrow = group?.querySelector('.frame2-side-arrow');
        const open = group?.classList.contains('is-open');
        target.closest('[data-menu-toggle]')?.setAttribute('aria-expanded', String(open));
        if (arrow) arrow.innerHTML = `<span class="wise-icon" data-wise-icon="${open ? 'chevronUp' : 'chevronDown'}"></span>`;
        window.WiseIconRegistry?.renderIcons(arrow);
        return;
      }
      if (closeNode && tabNode) {
        closeTab(tabNode.dataset.tab);
        return;
      }
      if (tabNode) {
        if (tabNode.dataset.tabHref) {
          window.location.href = tabNode.dataset.tabHref;
          return;
        }
        activateFeature(tabNode.dataset.tab, tabNode.dataset.tabLabel);
        return;
      }
      if (featureNode) {
        activateFeature(featureNode.dataset.feature, featureNode.dataset.featureLabel, featureNode.dataset.featureHref);
        return;
      }
      if (appTrigger) {
        const group = appTrigger.closest('.frame2-app-group');
        const expanded = !group.classList.contains('is-open');
        closeAppGroups(group);
        group.classList.toggle('is-open', expanded);
        appTrigger.setAttribute('aria-expanded', String(expanded));
        return;
      }
      if (appNode) {
        activateApp(appNode.dataset.app, appNode.dataset.appLabel, appNode.dataset.appHref);
        return;
      }
      if (toolNode) {
        const key = toolNode.dataset.tool;
        if (key === 'search') toggleSearch();
        else toast(toolNode.getAttribute('aria-label') || '操作已触发');
        return;
      }
      if (userRole) {
        const role = userRole.dataset.userRole;
        state.roleName = role;
        state.appGroups = roleAppGroups(config, role);
        if (!findApp(state.appGroups, state.activeApp)) {
          state.activeApp = state.appGroups[0]?.apps?.[0]?.key || state.appGroups[0]?.key || 'home';
        }
        state.menuItems = getAppMenu(state.activeApp);
        stage.classList.toggle('is-sidebar-hidden', forceHideSidebar || !hasMenuItems(state.menuItems));
        const next = firstFeature(state.menuItems);
        if (next) {
          state.activeFeature = next.key;
          ensureTab(next.key, next.label);
        } else {
          const app = findApp(state.appGroups, state.activeApp);
          state.activeFeature = state.activeApp;
          ensureTab(state.activeApp, app?.label || state.activeApp);
        }
        const roleNode = stage.querySelector('[data-current-role]');
        if (roleNode) {
          roleNode.textContent = role;
          roleNode.title = role;
        }
        stage.querySelectorAll('[data-user-role]').forEach((item) => item.classList.toggle('is-active', item === userRole));
        if (moduleTabs) moduleTabs.innerHTML = renderApps(state.appGroups, state.activeApp);
        renderDynamic();
        updateActiveState();
        updateSearch();
        setRoleMenuOpen(false);
        toast(`已切换至${role}`);
        if (typeof config.onRoleChange === 'function') config.onRoleChange(role, state.appGroups);
        return;
      }
      if (searchResult) {
        const type = searchResult.dataset.searchType;
        if (type === 'app') activateApp(searchResult.dataset.searchKey, searchResult.dataset.searchLabel, searchResult.dataset.searchHref);
        else activateFeature(searchResult.dataset.searchKey, searchResult.dataset.searchLabel.split(' / ').pop(), searchResult.dataset.searchHref);
        toggleSearch(false);
        return;
      }
      if (target.closest('[data-tab-refresh]')) {
        refreshActiveTab();
        return;
      }
      if (target.closest('[data-fullscreen]')) {
        stage.classList.toggle('is-workspace-fullscreen');
        return;
      }
      if (profileTrigger) {
        const open = !stage.classList.contains('is-profile-open');
        setRoleMenuOpen(false);
        setProfileMenuOpen(open);
        return;
      }
      if (roleTrigger) {
        const open = !stage.classList.contains('is-role-open');
        setProfileMenuOpen(false);
        setRoleMenuOpen(open);
        return;
      }
      if (userAction) {
        const action = userAction.dataset.userAction;
        if (action === 'search') toggleSearch();
        else toast(userAction.textContent.trim());
        setProfileMenuOpen(false);
      }
    });

    document.addEventListener('click', (event) => {
      if (!host.contains(event.target)) {
        stage.classList.remove('is-search-open');
        setProfileMenuOpen(false);
        setRoleMenuOpen(false);
        closeAppGroups();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        stage.classList.remove('is-search-open');
        setProfileMenuOpen(false);
        setRoleMenuOpen(false);
        closeAppGroups();
      }
    });

    searchInput?.addEventListener('input', updateSearch);
    searchInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') toggleSearch(false);
      if (event.key === 'Enter') stage.querySelector('[data-search-key]')?.click();
    });

    renderDynamic();
    updateSearch();
    return {
      stage: host,
      shell: stage,
      activateFeature,
      activateApp,
      closeTab,
      refreshActiveTab
    };
  }

  window.WiseAppShellV2 = { init, DEFAULT_APPS };
})();
