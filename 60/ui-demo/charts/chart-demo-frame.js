(function () {

  function mount(options) {
    options = options || {};

    WiseFramework2.mount({
      root: '.frame2-stage',
      versionLabel: options.versionLabel || '图表规范演示',
      userName: '教职工',
      roleName: '教职工',
      activeApp: 'chart-demo',
      activeFeature: 'chart-demo',
      workspaceVariant: 'canvas',
      tabs: [
        {
          key: 'home',
          label: '首页',
          wiseIcon: 'homeOutline',
          closable: false
        },
        {
          key: 'chart-demo',
          label: options.tabLabel || '图表规范演示',
          href: options.tabHref || currentPageHref(),
          closable: true
        }
      ]
    });
  }

  function currentPageHref() {
    return window.location.pathname.split('/').pop() + window.location.search + window.location.hash;
  }

  window.ChartDemoFrame = {
    mount: mount
  };
})();