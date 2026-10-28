(function () {
  // 教学档案袋全站紧凑布局规范。基于当前脚本地址加载，兼容不同层级页面。
  var compactStyleId = 'teaching-portfolio-compact-style';
  if (!document.getElementById(compactStyleId)) {
    var compactStyle = document.createElement('link');
    compactStyle.id = compactStyleId;
    compactStyle.rel = 'stylesheet';
    compactStyle.href = new URL('portfolio-compact.css?v=20260926-fullbleed', document.currentScript.src).href;
    document.head.appendChild(compactStyle);
  }

  var HOME_HREF = '';  // 由 mount() 动态计算，兼容不同角色首页；不再硬编码外部路径

  var ROLES = [{
    id: 'unified',
    role: '教学档案综合管理',
    shortRole: '综合管理',
    user: '金晓智 · 教学档案综合工作台',
    avatar: '档',
    menus: [
      { label: '我的教学档案', single: true, items: [{ key: 't-overview', label: '我的教学档案', path: 'major/t-overview/t-overview.html' }] },
      { label: '教学档案提交', single: true, items: [{ key: 't-submission', label: '教学档案提交', path: 'major/t-submission/t-submission.html' }] },
      { label: '教学档案审核', single: true, items: [{ key: 'c-review', label: '教学档案审核', path: 'chief/c-review/c-review.html' }] },
      { label: '教学档案管理', single: true, items: [{ key: 'p-board', label: '教学档案管理', path: 'chief/p-board/p-board.html' }] },
      { label: '考核批次管理', single: true, items: [{ key: 'batch-publish', label: '考核批次管理', path: 'sys/batch-publish/batch-publish.html' }] },
      { label: '档案字段设置', single: true, items: [{ key: 'form-management', label: '档案字段设置', path: 'sys/form-management/form-management.html' }] },
      { label: '审核流程配置', single: true, items: [{ key: 'audit-config', label: '审核流程配置', path: 'sys/audit-config/audit-config.html' }] },
      { label: '专业权限管理', single: true, items: [{ key: 'major-group', label: '专业权限管理', path: 'sys/major-group/major-group.html' }] },
      { label: '统计分析看板', single: true, items: [{ key: 'hr-statistics', label: '统计分析看板', path: 'major/p-major-group/p-major-group.html' }] },
      { label: '教学档案袋首页', single: true, items: [{ key: 't-home', label: '教学档案袋首页', path: 'major/t-home/t-home.html' }] },
      { label: '我的教学画像', single: true, items: [{ key: 't-portrait', label: '我的教学画像', path: 'major/t-portrait/t-portrait.html' }] },
      { label: '图表配置能力', single: true, items: [{ key: 'chart-designer', label: '图表配置能力', path: 'sys/chart-designer/chart-designer.html' }] }
    ]
  }];

  var GROUP_ICONS = {
    '工作台': 'home',
    '我的画像': 'home',
    '教师全景信息': 'archive',
    '教师教学画像': 'archive',
    '首页': 'archive',
    '个人信息': 'home',
    '档案袋首页': 'home',
    '教学档案袋首页': 'home',
    '我的教学档案': 'prepare',
    '教学档案管理': 'prepare',
    '团队项目管理': 'exam',
    '青蓝合作': 'recommend',
    '数据采集': 'prepare',
    '特色档案': 'camp',
    '其他材料': 'prepare',
    '审核与开放': 'recommend',
    '目标与画像': 'exam',
    '我的学习': 'prepare',
    '学习档案': 'prepare',
    '我的专业群': 'camp',
    '专业群档案空间': 'camp',
    '校企档案': 'prepare',
    '我的贡献': 'exam',
    '教研室空间': 'home',
    '审核台': 'recommend',
    '目标管理': 'exam',
    '团队画像': 'exam',
    '画像': 'exam',
    '专业群': 'camp',
    '教学档案质量': 'recommend',
    '标准管理': 'recommend',
    '评阅台': 'recommend',
    '学院驾驶舱': 'home',
    '组织画像': 'exam',
    '指导意见': 'recommend',
    '评价标准': 'recommend',
    '数据治理': 'prepare',
    '统计分析': 'exam',
    '权限管理': 'recommend',
    '模板管理': 'prepare',
    '专业群管理': 'camp',
    '专业权限管理': 'camp',
    '专业组织管理': 'camp',
    '专业群看板': 'camp',
    '专业群设置': 'camp',
    '团队建设': 'exam',
    '系统设置': 'home',
    '运维': 'prepare',
    '数据采集发布': 'prepare',
    '数据审核': 'recommend',
    '数据补采管理': 'prepare',
    '字段权限设置': 'home',
    '档案字段设置': 'recommend',
    '流程配置': 'exam',
    '教学档案提交': 'uploadCloud',
    '教学档案审核': 'recommend',
    '统计分析看板': 'exam',
    '图表配置': 'exam'
  };

  // sys 菜单已拆分为独立页面，旧 hash 别名映射到新 key 以兼容历史链接
  var SYS_MODULE_ROUTES = {
    overview: 'major-group',
    permissions: 'major-group',
    majors: 'major-group',
    majorGroup: 'major-group',
    formManagement: 'form-management',
    fieldAuth: 'form-management',
    auditConfig: 'audit-config',
    audit: 'audit-config',
    auditBatch: 'batch-publish'
  };

  function roleById(roleId) {
    return ROLES.find(function (role) { return role.id === roleId; }) || ROLES[0];
  }

  function roleItems(role) {
    return role.menus.reduce(function (items, group) {
      return items.concat(group.items || []);
    }, []);
  }

  function firstViewForRole(roleId) {
    var first = roleItems(roleById(roleId))[0];
    return first ? first.key : '';
  }

  function roleHasView(roleId, viewKey) {
    return roleItems(roleById(roleId)).some(function (item) { return item.key === viewKey; });
  }

  function labelForView(role, viewKey) {
    var hit = roleItems(role).find(function (item) { return item.key === viewKey; });
    return hit ? hit.label : viewKey;
  }

  function pageConfig() {
    return window.PORTFOLIO_V3_PAGE || {};
  }

  function pageHref(roleId, viewKey) {
    var role = roleById(roleId);
    var targetView = roleHasView(role.id, viewKey) ? viewKey : firstViewForRole(role.id);
    var item = roleItems(role).find(function (candidate) { return candidate.key === targetView; });
    return item && item.path ? '../../' + item.path : '';
  }

  function pageRoutes(role) {
    return roleItems(role).reduce(function (routes, item) {
      routes[item.key] = pageHref(role.id, item.key);
      return routes;
    }, {});
  }

  function roleAppMenu(role) {
    return role.menus.map(function (group) {
      if (group.single && group.items && group.items[0]) {
        return {
          key: group.items[0].key,
          label: group.label,
          icon: GROUP_ICONS[group.label] || 'home',
          href: pageHref(role.id, group.items[0].key)
        };
      }
      return {
        key: 'grp:' + group.label,
        label: group.label,
        icon: GROUP_ICONS[group.label] || 'home',
        children: group.items.map(function (item) {
          return { key: item.key, label: item.label, href: pageHref(role.id, item.key) };
        })
      };
    });
  }

  function toast(msg, type, ms) {
    if (typeof window.toast === 'function') {
      window.toast(msg, type, ms);
    }
  }

  function switchRole(roleId, viewKey) {
    var cfg = pageConfig();
    var targetView = viewKey || (roleHasView(roleId, cfg.view) ? cfg.view : firstViewForRole(roleId));
    var href = pageHref(roleId, targetView);
    if (href) window.location.href = href;
  }

  function syncFrameworkRoleSwitch(roleId) {
    var role = roleById(roleId);
    var host = document.querySelector('.frame2-stage');
    var root = host && host.shadowRoot;
    if (!root) return;

    var roleLabel = role.shortRole || role.role;
    var current = root.querySelector('[data-current-role]');
    if (current) {
      current.textContent = roleLabel;
      current.title = role.role;
    }

    var menu = root.querySelector('.frame2-role-menu');
    if (!menu) return;
    menu.innerHTML = '';
    menu.hidden = true;
    menu.querySelectorAll('[data-portfolio-role]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var nextRole = btn.getAttribute('data-portfolio-role');
        var next = roleById(nextRole);
        switchRole(nextRole);
        toast('已切换至「' + ((next && (next.shortRole || next.role)) || nextRole) + '」业务视角', 'ok');
      }, true);
    });
  }

  function currentPageHref() {
    return window.location.pathname.split('/').pop() + window.location.search + window.location.hash;
  }

  function navigateToFeature(role, key, customHandler) {
    if (customHandler) {
      customHandler(key);
      return;
    }
    var href = pageHref(role.id, key);
    if (href) window.location.href = href;
  }

  function mount(options) {
    options = options || {};
    var role = roleById(options.role || 'teacher');
    var activeFeature = options.activeFeature || options.view || firstViewForRole(role.id);
    if (!roleHasView(role.id, activeFeature) && role.id !== 'sys') {
      activeFeature = firstViewForRole(role.id);
    }
    if (role.id === 'sys') {
      activeFeature = normalizeSysAdminModule(activeFeature);
    }

    window.PORTFOLIO_V3_PAGE = {
      role: role.id,
      view: activeFeature,
      label: options.tabLabel || labelForView(role, activeFeature)
    };

    var instance = WiseFramework2.mount({
      root: options.root || '.frame2-stage',
      versionLabel: options.versionLabel || '深圳职业技术大学 · 教学档案袋平台',
      userName: options.userName || role.user,
      roleName: options.roleName || '教职工',
      activeApp: 'teaching-portfolio',
      pinHomeTab: false,
      workspaceVariant: 'canvas',
      appMenus: { 'teaching-portfolio': roleAppMenu(role) },
      featureRoutes: pageRoutes(role),
      activeFeature: activeFeature,
      tabs: [
        {
          key: 'home',
          label: '首页',
          href: pageHref(role.id, firstViewForRole(role.id)),
          wiseIcon: 'homeOutline',
          closable: false
        },
        {
          key: options.tabKey || activeFeature,
          label: options.tabLabel || labelForView(role, activeFeature),
          href: options.tabHref || currentPageHref(),
          closable: true
        }
      ],
      onFeatureChange: function (key) {
        navigateToFeature(role, key, options.onFeatureChange);
      }
    });
    requestAnimationFrame(function () { syncFrameworkRoleSwitch(role.id); });
    setTimeout(function () { syncFrameworkRoleSwitch(role.id); }, 0);
    if (typeof options.afterMount === 'function') {
      requestAnimationFrame(function () {
        syncFrameworkRoleSwitch(role.id);
        options.afterMount(instance, role, activeFeature);
      });
      setTimeout(function () {
        syncFrameworkRoleSwitch(role.id);
        options.afterMount(instance, role, activeFeature);
      }, 0);
      setTimeout(function () { options.afterMount(instance, role, activeFeature); }, 80);
    }
    return instance;
  }

  function normalizeSysAdminModule(key) {
    var raw = key || 'majorGroup';
    var mapped = SYS_MODULE_ROUTES[raw] || raw;
    return roleHasView('sys', mapped) ? mapped : 'majorGroup';
  }

  function getSysAdminModuleLabel(key) {
    return labelForView(roleById('sys'), normalizeSysAdminModule(key));
  }

  function selectSysAdminModule(key) {
    var normalized = normalizeSysAdminModule(key);
    if (window.__SYS_ADMIN_SET_MODULE__) window.__SYS_ADMIN_SET_MODULE__(normalized);
    else window.location.hash = normalized;
  }

  function setupSysAdminPage() {
    window.SYS_ADMIN_MODULES = roleItems(roleById('sys')).map(function (item) {
      return {
        key: item.key,
        label: item.label,
        icon: GROUP_ICONS[item.label] || 'home'
      };
    });
    window.SYS_ADMIN_HASH_ALIASES = SYS_MODULE_ROUTES;
    window.normalizeSysAdminModule = normalizeSysAdminModule;
    window.SYS_ADMIN_INITIAL_MODULE = normalizeSysAdminModule(window.location.hash.replace('#', ''));
    window.SYS_ADMIN_HOME_HREF = HOME_HREF;
    window.getSysAdminModuleLabel = getSysAdminModuleLabel;
    window.selectSysAdminModule = selectSysAdminModule;
  }

  window.TeachingPortfolioFrame = {
    HOME_HREF: HOME_HREF,
    ROLES: ROLES,
    GROUP_ICONS: GROUP_ICONS,
    SYS_MODULE_ROUTES: SYS_MODULE_ROUTES,
    roleById: roleById,
    roleItems: roleItems,
    firstViewForRole: firstViewForRole,
    roleHasView: roleHasView,
    labelForView: labelForView,
    pageHref: pageHref,
    pageRoutes: pageRoutes,
    roleAppMenu: roleAppMenu,
    switchRole: switchRole,
    syncFrameworkRoleSwitch: syncFrameworkRoleSwitch,
    mount: mount,
    normalizeSysAdminModule: normalizeSysAdminModule,
    getSysAdminModuleLabel: getSysAdminModuleLabel,
    selectSysAdminModule: selectSysAdminModule,
    setupSysAdminPage: setupSysAdminPage
  };
})();
