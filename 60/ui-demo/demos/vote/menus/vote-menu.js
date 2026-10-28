/* 在线投票应用 · 菜单模块
 *
 * 职责（对齐 AGENTS.md「菜单解耦」约束）：
 *   1. 导航元数据与路由的唯一来源，注册到 WiseMenuRegistry（id: recruitment.vote）。
 *   2. 对外暴露 VoteAppFrame.mount()，把已注册菜单装配进框架2 外壳。
 *      页面只声明「菜单 ID + 当前功能 key」，不持有菜单结构副本。
 *
 * 页面间跳转统一走 WiseMenuRegistry.route('recruitment.vote:<feature>')。
 */
(function (registry) {
  var scriptUrl = document.currentScript && document.currentScript.src;
  function resolve(path) {
    return scriptUrl ? new URL(path, scriptUrl).href : path;
  }
  function featureHref(key) {
    return resolve('../' + key + '/' + key + '.html');
  }

  var HOME_HREF = resolve('../../home/teacher/home/staff-home.html');

  // 功能页清单：应用 → 一级分组 → 二级功能页（6 组 / 17 页）
  var MENU_TREE = [
    { label: '投票项目', icon: 'prepare', items: ['vote-project'] },
    { label: '项目设置', icon: 'settings', items: [
      'scheme-set', 'vote-item', 'candidate', 'quota-set',
      'group-set', 'judge-account', 'material', 'promise-set'
    ] },
    { label: '投票执行', icon: 'recommend', items: ['project-status', 'progress'] },
    { label: '结果与报表', icon: 'exam', items: ['result', 'report'] },
    { label: '展示端', icon: 'camp', items: ['screen-config', 'screen-preview', 'judge-preview'] },
    { label: '系统设置', icon: 'settings', items: ['global-set'] }
  ];

  var FEATURE_LABELS = {
    'vote-project': '投票项目',
    'scheme-set': '方案设置',
    'vote-item': '投票指标',
    'candidate': '候选人',
    'quota-set': '限额设置',
    'group-set': '分组设岗',
    'judge-account': '评委账号',
    'material': '材料与佐证',
    'promise-set': '承诺书设置',
    'project-status': '项目状态',
    'progress': '投票进度',
    'result': '结果查看',
    'report': '报表中心',
    'screen-config': '大屏配置',
    'screen-preview': '大屏预览',
    'judge-preview': '评委端预览',
    'global-set': '全局设置'
  };

  // 演示形态差异较大，独立窗口打开（方案待确认项 #2 的默认值）
  var NEW_WINDOW_FEATURES = ['screen-preview', 'judge-preview'];

  var ROUTES = {};
  Object.keys(FEATURE_LABELS).forEach(function (key) { ROUTES[key] = featureHref(key); });

  function menuItems() {
    return MENU_TREE.map(function (group) {
      if (group.items.length === 1) {
        return { key: group.items[0], label: group.label, icon: group.icon };
      }
      return {
        key: 'grp:' + group.label,
        label: group.label,
        icon: group.icon,
        children: group.items.map(function (key) {
          return { key: key, label: FEATURE_LABELS[key] };
        })
      };
    });
  }

  function appMenus() {
    return MENU_TREE.map(function (group) {
      if (group.items.length === 1) {
        return { key: group.items[0], label: group.label, icon: group.icon, href: ROUTES[group.items[0]] };
      }
      return {
        key: 'grp:' + group.label,
        label: group.label,
        icon: group.icon,
        children: group.items.map(function (key) {
          return { key: key, label: FEATURE_LABELS[key], href: ROUTES[key] };
        })
      };
    });
  }

  registry.register('recruitment.vote', {
    appId: 'recruitment-vote',
    label: '投票应用',
    routes: ROUTES,
    items: menuItems()
  });

  function currentPageHref() {
    return window.location.pathname.split('/').pop() + window.location.search + window.location.hash;
  }

  function mount(options) {
    options = options || {};
    var view = FEATURE_LABELS[options.view] ? options.view : 'vote-project';
    var label = options.tabLabel || FEATURE_LABELS[view];

    window.VOTE_APP_PAGE = { view: view, label: label };

    window.WiseFramework2.mount({
      root: options.root || '.frame2-stage',
      versionLabel: options.versionLabel || '在线投票应用',
      userName: '王建国 · 评审办公室 · 投票管理员',
      roleName: '教职工',
      roles: ['教职工'],
      activeApp: 'recruitment-vote',
      activeFeature: view,
      pinHomeTab: false,
      workspaceVariant: 'canvas',
      appMenus: { 'recruitment-vote': appMenus() },
      featureRoutes: ROUTES,
      tabs: [
        { key: 'home', label: '首页', href: options.homeHref || HOME_HREF, wiseIcon: 'homeOutline', closable: false },
        { key: options.tabKey || view, label: label, href: options.tabHref || currentPageHref(), closable: true }
      ],
      onFeatureChange: function (key) {
        var href = ROUTES[key];
        if (!href) return;
        if (NEW_WINDOW_FEATURES.indexOf(key) >= 0) window.open(href, '_blank', 'noopener');
        else window.location.href = href;
      }
    });
  }

  window.VoteAppFrame = {
    MENU_ID: 'recruitment.vote',
    HOME_HREF: HOME_HREF,
    FEATURE_LABELS: FEATURE_LABELS,
    ROUTES: ROUTES,
    route: function (key) { return ROUTES[key] || registry.route('recruitment.vote:' + key); },
    mount: mount
  };
}(window.WiseMenuRegistry));
