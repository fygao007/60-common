(function (registry) {
  var scriptUrl = document.currentScript && document.currentScript.src;
  function page(path) {
    return scriptUrl ? new URL(path, scriptUrl).href : path;
  }

  registry.register('teaching-portfolio.major', {
    appId: 'teaching-portfolio',
    label: '教学档案袋',
    routes: {
      't-home': page('../major/t-home/t-home.html'),
      't-overview': page('../major/t-overview/t-overview.html'),
      't-submission': page('../major/t-submission/t-submission.html'),
      't-portrait': page('../major/t-portrait/t-portrait.html'),
      'p-board': page('../major/p-board/p-board.html'),
      'p-major-group': page('../major/p-major-group/p-major-group.html'),
      'c-review': page('../major/c-review/c-review.html'),
      'p-review': page('../major/p-review/p-review.html')
    },
    items: [
      { key: 't-home', label: '教学档案袋首页', icon: 'home' },
      { key: 't-overview', label: '我的教学档案', icon: 'archive' },
      { key: 't-submission', label: '教学档案提交', icon: 'uploadCloud' },
      { key: 't-portrait', label: '我的教学画像', icon: 'exam' },
      { key: 'p-board', label: '教学档案管理', icon: 'prepare' },
      { key: 'p-major-group', label: '统计分析看板', icon: 'exam' },
      { key: 'c-review', label: '教学档案审核', icon: 'recommend' },
      { key: 'p-review', label: '专业档案评阅', icon: 'recommend' }
    ]
  });
}(window.WiseMenuRegistry));
