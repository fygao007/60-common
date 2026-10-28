(function () {
  var HOME_HREF = '../../home/teacher/home/staff-home.html';

  var ROLES = [
    {
      id: 'hr',
      role: '人事处管理员',
      shortRole: '人事处',
      user: '李明 · 人事处 · 招聘主管',
      avatar: '李',
      menus: [
        { label: '产品功能架构图', single: true, items: [{ key: 'product-arch', label: '产品功能架构图' }] },
        { label: '工作台', items: [
          { key: 'workbench', label: '工作台' },
          { key: 'recruit-portal', label: '招聘外网', externalPath: '招聘外网3/index.html', target: '_blank' }
        ] },
        { label: '岗位征集管理', items: [
          { key: 'plan-initiate', label: '岗位征集批次管理' },
          { key: 'plan-apply', label: '岗位申请' },
          { key: 'plan-audit', label: '岗位审核' }
        ] },
        { label: '岗位与发布', items: [
          { key: 'position', label: '岗位维护与发布' },
          { key: 'website', label: '招聘网站内容发布' }
        ] },
        { label: '招聘过程管理', items: [
          { key: 'process-audit', label: '招聘办理' },
          { key: 'archive-transfer', label: '录用办理' },
          { key: 'monitor', label: '招聘监控' }
        ] },
        { label: '统计分析', single: true, items: [{ key: 'statistics', label: '统计分析' }] },
        { label: '系统配置', items: [
          { key: 'recruit-type', label: '招聘种类' },
          { key: 'position-req-dict', label: '岗位要求设置' },
          { key: 'website-config', label: '招聘网站设置' },
          { key: 'login-setting', label: '注册登录设置' },
          { key: 'notice-setting', label: '通知模板设置' },
          { key: 'print-template', label: '打印模板设置' },
          { key: 'common-params', label: '通用参数设置' },
          { key: 'stat-config', label: '统计分析设置' }
        ] }
      ]
    },
    {
      id: 'dean',
      role: '院系管理员',
      shortRole: '院系',
      user: '陈建国 · 电子与通信工程学院 · 招聘负责人',
      avatar: '陈',
      menus: [
        { label: '工作台', single: true, items: [{ key: 'workbench', label: '工作台' }] },
        { label: '招聘计划申请', items: [
          { key: 'plan-initiate', label: '岗位申请' }
        ] }
      ]
    },
    {
      id: 'sys',
      role: '系统管理员',
      shortRole: '系统',
      user: '系统管理员 · 信息中心',
      avatar: '管',
      menus: [
        { label: '工作台', single: true, items: [{ key: 'workbench', label: '工作台' }] }
      ]
    }
  ];

  var GROUP_ICONS = {
    '工作台': 'home',
    '招聘办理': 'recommend',
    '岗位征集管理': 'prepare',
    '招聘计划申请': 'prepare',
    '岗位与发布': 'archive',
    '招聘过程管理': 'recommend',
    '统计分析': 'exam',
    '系统配置': 'settings',
    '岗位大厅': 'camp',
    '我的投递': 'uploadCloud',
    '我的考试': 'exam',
    '个人中心': 'home'
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
    if (viewKey === 'recruit-portal') return roleId === 'hr';
    // 组入口页(如 plan-manage)对该角色合法——它不在菜单项列表,但文件存在且是分组入口
    if (GROUP_ENTRY_VIEWS[viewKey] === roleId) return true;
    // 子页面(如 hr/plan-manage/plan-initiate-detail 或 hr/plan-manage/plan-audit-detail)对该角色合法
    if (isChildOf(roleId, viewKey)) return true;
    return roleItems(roleById(roleId)).some(function (item) { return item.key === viewKey; });
  }

  function labelForView(role, viewKey) {
    var hit = roleItems(role).find(function (item) { return item.key === viewKey; });
    return hit ? hit.label : viewKey;
  }

  // 子页面归属：key 在哪个父目录下(按角色区分,同一 view 在不同角色可能位于不同目录)
  // - hr 的 plan-initiate / plan-initiate-detail 在 plan-manage/ 子目录下
  // - dean 的 plan-initiate 直接在 dean/ 目录下
  var VIEW_PARENT = {
    hr: {
      'plan-initiate': 'plan-manage',
      'plan-apply': 'plan-manage',
      'plan-initiate-detail': 'plan-manage',
      'audit-detail': 'plan-audit'
    },
    dean: {},
    sys: {}
  };

  // 反向映射：判断某 view 在某角色下是否是子页面(即有父目录前缀)
  function parentOf(roleId, viewKey) {
    var map = VIEW_PARENT[roleId] || {};
    return map[viewKey] || '';
  }
  function isChildOf(roleId, viewKey) {
    return !!parentOf(roleId, viewKey);
  }

  // 组入口页：文件在父目录下(如 hr/plan-manage/plan-manage.html),但不在菜单项列表里。
  // 这些页面是分组的真实入口,mount 时需被识别为合法 view,路径计算时退一级。
  var GROUP_ENTRY_VIEWS = {
    'plan-manage': 'hr'  // hr 角色的招聘计划管理组入口
  };

  function pageConfig() {
    return window.RECRUITMENT_PAGE || {};
  }

  // 构造文件路径段：普通页面 view/view.html；子页面 parent/view/view.html
  // 父目录按角色从 VIEW_PARENT[roleId] 取
  // 特例：workbench 页因与 teacher-growth-portal 同名冲突,bundle 走 name 去重,
  // 故 HTML 改名为 <roleId>-workbench.html(与同名 .page.jsx 对齐)
  function viewPath(roleId, viewKey) {
    var parent = parentOf(roleId, viewKey);
    if (viewKey === 'workbench') {
      return 'workbench/' + roleId + '-workbench.html';
    }
    if (parent) {
      return parent + '/' + viewKey + '/' + viewKey + '.html';
    }
    return viewKey + '/' + viewKey + '.html';
  }

  // 从当前页回退到角色根目录(如 hr/)的相对前缀
  // 当前页若是子页面(在 parent/view/view/ 下),退两级;否则退一级
  function backToRoleDir(cfg) {
    return isChildOf(cfg.role, cfg.view) ? '../../' : '../';
  }
  // 从当前页回退到 recruitment/ 目录的相对前缀
  function backToAppDir(cfg) {
    return isChildOf(cfg.role, cfg.view) ? '../../../' : '../../';
  }

  function pageHref(roleId, viewKey) {
    var cfg = pageConfig();
    var targetView = roleHasView(roleId, viewKey) ? viewKey : firstViewForRole(roleId);
    if (!targetView) return '';

    // 同角色跳转
    if (roleId === cfg.role) {
      var currentParent = parentOf(cfg.role, cfg.view);
      var targetParent = parentOf(roleId, targetView);
      if (currentParent && targetParent === currentParent) {
        // 同一个父目录下的兄弟子页面：回退到父目录即可
        return '../' + targetView + '/' + targetView + '.html';
      }
      return backToRoleDir(cfg) + viewPath(roleId, targetView);
    }
    // 跨角色跳转：回退到 recruitment/ 目录后接 <roleId>/<viewPath>
    return backToAppDir(cfg) + roleId + '/' + viewPath(roleId, targetView);
  }

  function itemHref(role, item) {
    return item.externalPath
      ? backToAppDir(pageConfig()) + item.externalPath
      : pageHref(item.targetRole || role.id, item.targetView || item.key);
  }

  function pageRoutes(role) {
    return roleItems(role).reduce(function (routes, item) {
      if (!item.externalPath) routes[item.key] = itemHref(role, item);
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
          href: itemHref(role, group.items[0])
        };
      }
      return {
        key: 'grp:' + group.label,
        label: group.label,
        icon: GROUP_ICONS[group.label] || 'home',
        children: group.items.map(function (item) {
          return { key: item.key, label: item.label, href: item.externalPath ? '' : itemHref(role, item), target: item.target };
        })
      };
    });
  }

  function currentPageHref() {
    return window.location.pathname.split('/').pop() + window.location.search + window.location.hash;
  }

  function navigateToFeature(role, key) {
    var item = roleItems(role).find(function (candidate) { return candidate.key === key; });
    var href = item ? itemHref(role, item) : pageHref(role.id, key);
    if (!href) return;
    if (item && item.target === '_blank') window.open(href, '_blank', 'noopener');
    else window.location.href = href;
  }

  function toast(msg, type, ms) {
    if (typeof window.toast === 'function') {
      window.toast(msg, type, ms);
    }
  }

  function switchRole(roleId) {
    var cfg = pageConfig();
    var role = roleById(roleId);
    var targetView = roleHasView(roleId, cfg.view) ? cfg.view : firstViewForRole(roleId);
    var href = pageHref(roleId, targetView);
    if (href) window.location.href = href;
  }

  // 招聘应用自带角色列表，覆写框架2角色切换菜单（档案袋应用同款机制）
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
    menu.innerHTML = ROLES.map(function (item) {
      var label = item.shortRole || item.role;
      return '<button class="' + (item.id === roleId ? 'is-active' : '') + '" type="button" role="menuitem" data-recruitment-role="' + item.id + '">' + label + '</button>';
    }).join('');
    menu.querySelectorAll('[data-recruitment-role]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var nextRole = btn.getAttribute('data-recruitment-role');
        var next = roleById(nextRole);
        switchRole(nextRole);
        toast('已切换至「' + ((next && (next.shortRole || next.role)) || nextRole) + '」业务视角', 'ok');
      }, true);
    });
  }

  function mount(options) {
    options = options || {};
    var role = roleById(options.role || 'hr');
    var activeFeature = options.activeFeature || options.view || firstViewForRole(role.id);
    if (!roleHasView(role.id, activeFeature)) {
      activeFeature = firstViewForRole(role.id);
    }

    window.RECRUITMENT_PAGE = {
      role: role.id,
      view: activeFeature,
      label: options.tabLabel || labelForView(role, activeFeature)
    };

    WiseFramework2.mount({
      root: options.root || '.frame2-stage',
      versionLabel: options.versionLabel || '高校招聘管理系统',
      userName: role.user,
      roleName: '教职工',
      activeApp: 'recruitment',
      pinHomeTab: false,
      workspaceVariant: 'canvas',
      appMenus: { 'recruitment': roleAppMenu(role) },
      featureRoutes: pageRoutes(role),
      activeFeature: activeFeature,
      tabs: [
        {
          key: 'home',
          label: '首页',
          href: HOME_HREF,
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
        navigateToFeature(role, key);
      }
    });
    requestAnimationFrame(function () { syncFrameworkRoleSwitch(role.id); });
    setTimeout(function () { syncFrameworkRoleSwitch(role.id); }, 0);
  }

  window.RecruitmentFrame = {
    HOME_HREF: HOME_HREF,
    ROLES: ROLES,
    GROUP_ICONS: GROUP_ICONS,
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
    mount: mount
  };
})();
