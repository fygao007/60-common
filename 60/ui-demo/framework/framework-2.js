(function () {
  const VERSION = '2.2.3';
  const frameworkScriptUrl = document.currentScript?.src
    ? new URL(document.currentScript.src)
    : null;
  const frameworkAssetBase = frameworkScriptUrl
    ? new URL('./assets/', frameworkScriptUrl).href.replace(/\/$/, '')
    : './assets';

  const RULES = Object.freeze({
    topbarHeight: 52,
    cardWorkspaceTopbarHeight: 48,
    tabsbarHeight: 40,
    sidebarWidth: 256,
    collapsedSidebarWidth: 56,
    workspaceInset: 12,
    cardGap: 12,
    maxAppsPerRow: 5
  });

  const DEFAULT_CONFIG = Object.freeze({
    root: '.frame2-stage',
    systemName: '智慧人事一体化服务系统',
    userName: '金晓智',
    roleName: '师资培养发展办',
    frameworkAssetBase,
    frameworkLogoSrc: `${frameworkAssetBase}/szpu-emblem.png`,
    activeApp: 'home',
    activeFeature: 'home',
    pinHomeTab: true,
    hideSidebar: false,
    workspaceVariant: 'canvas',
    topTools: [
      { key: 'search', label: '搜索', icon: `${frameworkAssetBase}/top-search.svg` },
      { key: 'skin', label: '换肤', icon: `${frameworkAssetBase}/top-skin.svg` },
      { key: 'language', label: '中英文', icon: `${frameworkAssetBase}/top-language.svg` }
    ],
    appGroups: [],
    secondaryNav: { items: [] },
    tabs: [
      { key: 'home', label: '首页', wiseIcon: 'homeOutline', closable: false }
    ]
  });

  function copyList(value, fallback) {
    return Array.isArray(value) ? value.slice() : fallback.slice();
  }

  function findFeatureInProfile(roleName, profile, key) {
    if (!profile) return null;
    for (const group of profile.appGroups || []) {
      for (const app of group.apps || [group]) {
        if (app.key === key) return { roleName, app };
      }
    }
    return null;
  }

  function findFeatureContext(preset, key, preferredRoleName) {
    if (!key || !preset.roleProfiles) return null;

    const preferredMatch = findFeatureInProfile(
      preferredRoleName,
      preset.roleProfiles[preferredRoleName],
      key
    );
    if (preferredMatch) return preferredMatch;

    for (const [roleName, profile] of Object.entries(preset.roleProfiles)) {
      const match = findFeatureInProfile(roleName, profile, key);
      if (match) return match;
    }
    return null;
  }

  function normalizeConfig(overrides) {
    const input = overrides || {};
    const preset = window.WiseFramework2StaffPreset || {};
    const preferredRoleName = preset.roleProfiles?.[input.roleName]
      ? input.roleName
      : preset.roleName;
    const featureContext = findFeatureContext(preset, input.activeFeature, preferredRoleName);
    const config = {
      ...DEFAULT_CONFIG,
      ...preset,
      ...input,
      topTools: copyList(input.topTools || preset.topTools, DEFAULT_CONFIG.topTools),
      appGroups: copyList(preset.appGroups, DEFAULT_CONFIG.appGroups),
      tabs: copyList(input.tabs, DEFAULT_CONFIG.tabs),
      secondaryNav: input.secondaryNav || DEFAULT_CONFIG.secondaryNav
    };

    config.systemName = preset.systemName || DEFAULT_CONFIG.systemName;
    config.frameworkAssetBase = input.frameworkAssetBase
      || preset.frameworkAssetBase
      || DEFAULT_CONFIG.frameworkAssetBase;
    config.frameworkLogoSrc = input.frameworkLogoSrc
      || preset.frameworkLogoSrc
      || DEFAULT_CONFIG.frameworkLogoSrc;

    if (preset.roleProfiles) {
      config.roleProfiles = preset.roleProfiles;
      config.roles = preset.roles || Object.keys(preset.roleProfiles);
      config.roleName = featureContext?.roleName
        || (preset.roleProfiles[input.roleName] ? input.roleName : preset.roleName);
      config.activeApp = featureContext?.app.key || input.activeApp || DEFAULT_CONFIG.activeApp;
      config.appGroups = preset.roleProfiles[config.roleName]?.appGroups || [];
    }

    if (config.hideSidebar === 'auto') {
      delete config.hideSidebar;
    }

    config.workspaceVariant = config.workspaceVariant === 'card' ? 'card' : 'canvas';

    return config;
  }

  function validateConfig(config) {
    const errors = [];
    const warnings = [];
    const keys = new Set();

    if (!config.systemName) errors.push('systemName 不能为空');
    if (!Array.isArray(config.appGroups) || !config.appGroups.length) {
      errors.push('appGroups 至少需要一个应用或应用分组');
    }

    (config.appGroups || []).forEach((group) => {
      if (!group?.key || !group?.label) errors.push('每个应用分组必须包含 key 和 label');
      const items = group?.apps || [group];
      items.forEach((app) => {
        if (!app?.key || !app?.label) errors.push('每个应用必须包含 key 和 label');
        if (app?.key && keys.has(app.key)) warnings.push(`应用 key 重复：${app.key}`);
        if (app?.key) keys.add(app.key);
      });
    });

    if (config.roleProfiles) {
      Object.entries(config.roleProfiles).forEach(([role, profile]) => {
        if (!Array.isArray(profile?.appGroups) || !profile.appGroups.length) {
          errors.push(`角色“${role}”未配置 appGroups`);
        }
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  function mount(overrides) {
    if (!window.WiseAppShellV2?.init) {
      throw new Error('框架2加载失败：请先引入 AppShellV2/app-shell-v2.js');
    }
    if (!window.WiseFramework2StaffPreset) {
      throw new Error('框架2加载失败：请先引入 framework-2.staff-preset.js');
    }

    const config = normalizeConfig(overrides);
    const result = validateConfig(config);
    if (!result.valid) {
      throw new Error(`框架2配置错误：${result.errors.join('；')}`);
    }
    if (result.warnings.length && window.console) {
      console.warn('[Framework2]', ...result.warnings);
    }

    const instance = window.WiseAppShellV2.init(config);
    if (instance?.stage) {
      instance.stage.dataset.framework = '2';
      instance.stage.dataset.frameworkVersion = VERSION;
    }
    return instance;
  }

  window.WiseFramework2 = Object.freeze({
    VERSION,
    RULES,
    DEFAULT_CONFIG,
    normalizeConfig,
    validateConfig,
    mount
  });
})();
