(function () {

  // 自身脚本地址（必须在 IIFE 同步执行期读取），用于解析 shared/ 下的共享资源
  var FRAME_SCRIPT_URL = (document.currentScript && document.currentScript.src) || '';

  function sharedAssetHref(name) {
    if (!FRAME_SCRIPT_URL) return '../../shared/' + name;
    return new URL(name, FRAME_SCRIPT_URL).href;
  }

  // 单一统一角色：所有页面物理上均位于 teacher/<view>/，左侧按原角色分组
  var ROLES = [
    {
      id: 'teacher',
      role: '综合视图',
      shortRole: '综合视图',
      user: '平台管理员 · 教师成长档案袋平台',
      avatar: '综',
      menus: [
        {
          label: '教师',
          single: false,
          items: [
            { key: 't-workbench', label: '档案袋工作台' },
            { key: 't-archive', label: '我的成长档案' },
            { key: 't-data-collect', label: '我的数据采集' },
            { key: 't-data-detail', label: '批次填报' },
            { key: 't-goal', label: '我的发展目标' },
            { key: 't-diagnosis', label: '教师发展诊断与预警' },
            { key: 't-portrait', label: '我的能力画像' },
            { key: 't-graph', label: '关系图谱' }
          ]
        },
        {
          label: '二级学院',
          single: false,
          items: [
            { key: 'd-workbench', label: '档案袋工作台' },
            { key: 'd-archive', label: '学院教师档案查询' },
            { key: 'd-data-manage', label: '教师发展数据管理' },
            { key: 'd-data-review', label: '教师发展数据审核' },
            { key: 'd-diagnosis', label: '教师发展诊断与预警' },
            { key: 'd-ability-compare', label: '教师能力对比' },
            { key: 'd-team-diagnosis', label: '团队建设诊断与预警' },
            { key: 'd-faculty-dashboard', label: '师资队伍发展诊断与预警' },
            { key: 'd-graph', label: '关系图谱' }
          ]
        },
        {
          label: '职能部门',
          single: false,
          items: [
            { key: 'hr-workbench', label: '档案袋工作台' },
            { key: 'hr-archive', label: '全校教师档案查询' },
            { key: 'hr-data-manage', label: '教师发展数据管理' },
            { key: 'hr-data-review', label: '教师发展数据审核' },
            { key: 'hr-permission', label: '权限与流程管理' }
          ]
        },
        {
          label: '发展规划与目标',
          single: false,
          items: [
            { key: 'mp-plan-analysis', label: '发展规划分析' },
            { key: 'mp-plan-list', label: '发展方案台账' },
            { key: 'mp-plan-config', label: '发展方案配置' },
            { key: 'mp-task-list', label: '发展任务台账' },
            { key: 'mp-task-edit', label: '发展任务编辑' },
            { key: 'mp-requirement-list', label: '师资要求台账' },
            { key: 'mp-requirement-edit', label: '师资要求编辑' },
            { key: 'mp-plan-audit', label: '方案确认与版本发布' },
            { key: 'mp-plan-audit-detail', label: '方案确认详情' }
          ]
        },
        {
          label: '校领导',
          single: false,
          items: [
            { key: 'l-workbench', label: '档案袋工作台' },
            { key: 'l-archive', label: '全校教师档案查询' },
            { key: 'l-diagnosis', label: '教师发展诊断与预警' },
            { key: 'l-ability-compare', label: '教师能力对比' },
            { key: 'l-team-diagnosis', label: '团队建设诊断与预警' },
            { key: 'l-faculty-dashboard', label: '师资队伍发展诊断与预警' },
            { key: 'l-school-dashboard', label: '办学关键指标监控驾驶舱' },
            { key: 'l-upgrade-dashboard', label: '升本能力指标监控驾驶舱' },
            { key: 'l-graph', label: '关系图谱' }
          ]
        },
        {
          label: '团队负责人',
          single: false,
          items: [
            { key: 'tl-workbench', label: '团队工作台' },
            { key: 'tl-member-portrait', label: '团队成员画像' },
            { key: 'tl-result-manage', label: '团队成果管理' },
            { key: 'tl-task-warning', label: '团队任务预警' },
            { key: 'tl-graph', label: '关系图谱' }
          ]
        },
        {
          label: '系统管理员',
          single: false,
          items: [
            { key: 'sys-permission', label: '用户与权限配置' },
            { key: 'sys-indicator-lib', label: '指标体系配置' },
            { key: 'sys-model-manage', label: '评价模型配置' },
            { key: 'sys-eval-indicator', label: '评估指标配置' },
            { key: 'sys-rule-lib', label: '政策规则配置' },
            { key: 'sys-integration', label: '数据集成配置' }
          ]
        },
        {
          label: '产品架构',
          single: false,
          items: [
            { key: 'p-arch', label: '产品功能架构图' }
          ]
        }
      ]
    }
  ];

  var GROUP_ICONS = {
    '教师': 'home',
    '二级学院': 'archive',
    '职能部门': 'recommend',
    '发展规划与目标': 'prepare',
    '发展方案台账': 'prepare',
    '方案配置与发布预览': 'prepare',
    '校领导': 'home',
    '团队负责人': 'exam',
    '系统管理员': 'recommend',
    '产品架构': 'recommend',
    '指标体系配置': 'recommend',
    '评估指标配置': 'recommend',
    '评价模型配置': 'recommend',
    '政策规则配置': 'recommend',
    '数据集成配置': 'home',
    '关系图谱': 'exam',
    '档案袋工作台': 'home',
    '教师成长档案': 'archive',
    '我的成长档案': 'archive',
    '数据采集': 'prepare',
    '教师发展诊断': 'exam',
    '能力画像': 'exam',
    '数据管理': 'prepare',
    '数据审核': 'recommend',
    '团队建设诊断': 'exam',
    '师资队伍驾驶舱': 'home',
    '能力模型管理': 'recommend',
    '指标库管理': 'recommend',
    '规则库管理': 'recommend',
    '系统集成': 'home',
    '办学指标驾驶舱': 'home',
    '升本指标驾驶舱': 'home',
    '团队成员画像': 'exam',
    '团队成果管理': 'prepare',
    '团队任务预警': 'recommend',
    '产品功能架构': 'recommend',
    '产品功能架构图': 'recommend',
    '我的档案查询': 'archive',
    '学院教师档案查询': 'archive',
    '全校教师档案查询': 'archive',
    '我的数据采集': 'prepare',
    '我的发展目标': 'exam',
    '教师发展数据管理': 'prepare',
    '教师发展数据审核': 'recommend',
    '权限与流程管理': 'recommend',
    '教师发展诊断与预警': 'exam',
    '教师能力对比': 'exam',
    '团队建设诊断与预警': 'exam',
    '师资队伍发展诊断与预警': 'home',
    '教师能力模型管理': 'recommend',
    '能力指标库管理': 'recommend',
    '政策规则库管理': 'recommend',
    '系统集成管理': 'home',
    '办学关键指标监控驾驶舱': 'home',
    '升本能力指标监控驾驶舱': 'home',
    '我的能力画像': 'exam',
    '团队工作台': 'home',
    '用户与权限配置': 'recommend'
  };

  function roleById(roleId) {
    return ROLES.find(function (role) { return role.id === roleId; }) || ROLES[0];
  }

  // 框架右上角角色切换下拉里的「当前角色」名称（来自 framework-2.staff-preset 的全局档案）。
  // 本 demo 只保留这一个角色，其余 10 个部门/人员角色与本应用无关，不再列出。
  function presetRoleName() {
    var preset = window.WiseFramework2StaffPreset || {};
    return preset.roleName || '师资培养发展办';
  }

  function roleItems(role) {
    return role.menus.reduce(function (items, group) {
      return items.concat(group.items || []);
    }, []);
  }

  // 二级页面登记（key -> 所属父菜单 key），用于「不属于菜单但仍需放行访问」的页面。
  // 原 5 个二级页（t-data-detail / mp-plan-config / mp-task-edit /
  // mp-requirement-edit / mp-plan-audit-detail）已提升为左侧菜单正式项，
  // 统一登记在 ROLES 的对应分组内，此处不再单列。
  var SECONDARY_VIEWS = {};

  function firstViewForRole(roleId) {
    var first = roleItems(roleById(roleId))[0];
    return first ? first.key : '';
  }

  function roleHasView(roleId, viewKey) {
    if (SECONDARY_VIEWS[viewKey]) return true;
    return roleItems(roleById(roleId)).some(function (item) { return item.key === viewKey; });
  }

  function labelForView(role, viewKey) {
    var hit = roleItems(role).find(function (item) { return item.key === viewKey; });
    return hit ? hit.label : viewKey;
  }

  function pageConfig() {
    return window.GROWTH_FRAME_PAGE || {};
  }

  function pageHref(roleId, viewKey) {
    var targetView = roleHasView(roleId, viewKey) ? viewKey : firstViewForRole(roleId);
    if (!targetView) return '';
    // 所有页面统一在 teacher/<view>/ 下，从当前页面 teacher/<currentView>/<currentView>.html 跳转
    return '../' + targetView + '/' + targetView + '.html';
  }

  function pageRoutes(role) {
    return roleItems(role).reduce(function (routes, item) {
      routes[item.key] = pageHref(role.id, item.key);
      return routes;
    }, {});
  }

  function roleAppMenu(role, activeFeature) {
    return role.menus.map(function (group) {
      if (group.single && group.items && group.items[0]) {
        return {
          key: group.items[0].key,
          label: group.label,
          icon: GROUP_ICONS[group.label] || 'home',
          href: pageHref(role.id, group.items[0].key)
        };
      }
      var activeInGroup = Array.isArray(group.items) && group.items.some(function (item) {
        return item.key === activeFeature;
      });
      return {
        key: 'grp:' + group.label,
        label: group.label,
        icon: GROUP_ICONS[group.label] || 'home',
        expanded: activeInGroup,
        children: group.items.map(function (item) {
          return { key: item.key, label: item.label, href: pageHref(role.id, item.key) };
        })
      };
    });
  }

  function scrollActiveMenuItemIntoView(root) {
    if (!root) return;
    var active = root.querySelector('.frame2-side-item.is-active');
    if (active) {
      requestAnimationFrame(function () {
        active.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      });
    }
  }

  function switchRole(roleId, viewKey) {
    var cfg = pageConfig();
    var targetView = viewKey || (roleHasView(roleId, cfg.view) ? cfg.view : firstViewForRole(roleId));
    var href = pageHref(roleId, targetView);
    if (href) window.location.href = href;
  }

  function currentPageHref() {
    return window.location.pathname.split('/').pop() + window.location.search + window.location.hash;
  }

  function ensureProductQualityLayer(role, activeFeature) {
    var head = document.head || document.getElementsByTagName('head')[0];
    if (head && !head.querySelector('link[data-growth-quality]')) {
      var qualityLink = document.createElement('link');
      qualityLink.rel = 'stylesheet';
      qualityLink.href = sharedAssetHref('product-quality.css');
      qualityLink.setAttribute('data-growth-quality', 'true');
      head.appendChild(qualityLink);
    }
    document.documentElement.setAttribute('data-growth-role', role.id);
    document.documentElement.setAttribute('data-growth-view', activeFeature);
    document.body && document.body.setAttribute('data-growth-ready', 'true');
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
    if (!roleHasView(role.id, activeFeature)) {
      activeFeature = firstViewForRole(role.id);
    }

    window.GROWTH_FRAME_PAGE = {
      role: role.id,
      view: activeFeature,
      label: options.tabLabel || labelForView(role, activeFeature)
    };

    ensureProductQualityLayer(role, activeFeature);

    var instance = WiseFramework2.mount({
      root: options.root || '.frame2-stage',
      versionLabel: options.versionLabel || '深圳职业技术大学 · 教师成长档案袋平台',
      userName: role.user,
      // 不传 roleName：'综合视图' 不属于 framework-2.staff-preset 的预设角色，
      // 按框架2规范由框架依据 activeFeature / activeApp 自行匹配角色。
      // 右上角角色切换：框架默认列出 staff-preset 的全部 11 个部门/人员角色，
      // 本应用只保留当前这一个（其余角色与本应用无关），切换器本身保留。
      roles: [presetRoleName()],
      activeApp: 'teacher-growth-portfolio',
      pinHomeTab: true,
      workspaceVariant: 'canvas',
      appMenus: { 'teacher-growth-portfolio': roleAppMenu(role, activeFeature) },
      featureRoutes: pageRoutes(role),
      activeFeature: activeFeature,
      tabs: [
        {
          key: 'home',
          label: '首页',
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

    // 菜单项较多（45+），把当前项滚入可视区。只读取框架节点做滚动，
    // 不注入样式、不改写框架 DOM 结构。
    var shadow = instance && instance.stage && instance.stage.shadowRoot;
    if (shadow) {
      requestAnimationFrame(function () { scrollActiveMenuItemIntoView(shadow); });
      setTimeout(function () { scrollActiveMenuItemIntoView(shadow); }, 0);
    }

    return instance;
  }

  window.TeacherGrowthFrame = {
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
    mount: mount
  };
})();
