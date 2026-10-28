(function (registry) {
  var scriptUrl = document.currentScript.src;
  var expandedFeatures = ['mp-plan-analysis', 'mp-plan-list', 'sys-eval-indicator'];
  var groups = [
  {
    "label": "教师",
    "single": false,
    "items": [
      {
        "key": "t-workbench",
        "label": "档案袋工作台"
      },
      {
        "key": "t-archive",
        "label": "我的成长档案"
      },
      {
        "key": "t-data-collect",
        "label": "我的数据采集"
      },
      {
        "key": "t-data-detail",
        "label": "批次填报"
      },
      {
        "key": "t-goal",
        "label": "我的发展目标"
      },
      {
        "key": "t-diagnosis",
        "label": "教师发展诊断与预警"
      },
      {
        "key": "t-portrait",
        "label": "我的能力画像"
      },
      {
        "key": "t-graph",
        "label": "关系图谱"
      }
    ]
  },
  {
    "label": "二级学院",
    "single": false,
    "items": [
      {
        "key": "d-workbench",
        "label": "档案袋工作台"
      },
      {
        "key": "d-archive",
        "label": "学院教师档案查询"
      },
      {
        "key": "d-data-manage",
        "label": "教师发展数据管理"
      },
      {
        "key": "d-data-review",
        "label": "教师发展数据审核"
      },
      {
        "key": "d-diagnosis",
        "label": "教师发展诊断与预警"
      },
      {
        "key": "d-ability-compare",
        "label": "教师能力对比"
      },
      {
        "key": "d-team-diagnosis",
        "label": "团队建设诊断与预警"
      },
      {
        "key": "d-faculty-dashboard",
        "label": "师资队伍发展诊断与预警"
      },
      {
        "key": "d-graph",
        "label": "关系图谱"
      }
    ]
  },
  {
    "label": "职能部门",
    "single": false,
    "items": [
      {
        "key": "hr-workbench",
        "label": "档案袋工作台"
      },
      {
        "key": "hr-archive",
        "label": "全校教师档案查询"
      },
      {
        "key": "hr-data-manage",
        "label": "教师发展数据管理"
      },
      {
        "key": "hr-data-review",
        "label": "教师发展数据审核"
      },
      {
        "key": "hr-permission",
        "label": "权限与流程管理"
      }
    ]
  },
  {
    "label": "发展规划与目标",
    "single": false,
    "items": [
      {
        "key": "mp-plan-analysis",
        "label": "发展规划分析"
      },
      {
        "key": "mp-plan-list",
        "label": "发展方案台账"
      },
      {
        "key": "mp-plan-config",
        "label": "发展方案配置"
      },
      {
        "key": "mp-task-list",
        "label": "发展任务台账"
      },
      {
        "key": "mp-task-edit",
        "label": "发展任务编辑"
      },
      {
        "key": "mp-requirement-list",
        "label": "师资要求台账"
      },
      {
        "key": "mp-requirement-edit",
        "label": "师资要求编辑"
      },
      {
        "key": "mp-plan-audit",
        "label": "方案确认与版本发布"
      },
      {
        "key": "mp-plan-audit-detail",
        "label": "方案确认详情"
      }
    ]
  },
  {
    "label": "校领导",
    "single": false,
    "items": [
      {
        "key": "l-workbench",
        "label": "档案袋工作台"
      },
      {
        "key": "l-archive",
        "label": "全校教师档案查询"
      },
      {
        "key": "l-diagnosis",
        "label": "教师发展诊断与预警"
      },
      {
        "key": "l-ability-compare",
        "label": "教师能力对比"
      },
      {
        "key": "l-team-diagnosis",
        "label": "团队建设诊断与预警"
      },
      {
        "key": "l-faculty-dashboard",
        "label": "师资队伍发展诊断与预警"
      },
      {
        "key": "l-school-dashboard",
        "label": "办学关键指标监控驾驶舱"
      },
      {
        "key": "l-upgrade-dashboard",
        "label": "升本能力指标监控驾驶舱"
      },
      {
        "key": "l-graph",
        "label": "关系图谱"
      }
    ]
  },
  {
    "label": "团队负责人",
    "single": false,
    "items": [
      {
        "key": "tl-workbench",
        "label": "团队工作台"
      },
      {
        "key": "tl-member-portrait",
        "label": "团队成员画像"
      },
      {
        "key": "tl-result-manage",
        "label": "团队成果管理"
      },
      {
        "key": "tl-task-warning",
        "label": "团队任务预警"
      },
      {
        "key": "tl-graph",
        "label": "关系图谱"
      }
    ]
  },
  {
    "label": "系统管理员",
    "single": false,
    "items": [
      {
        "key": "sys-permission",
        "label": "用户与权限配置"
      },
      {
        "key": "sys-indicator-lib",
        "label": "指标体系配置"
      },
      {
        "key": "sys-model-manage",
        "label": "评价模型配置"
      },
      {
        "key": "sys-eval-indicator",
        "label": "评估指标配置"
      },
      {
        "key": "sys-rule-lib",
        "label": "政策规则配置"
      },
      {
        "key": "sys-integration",
        "label": "数据集成配置"
      }
    ]
  },
  {
    "label": "产品架构",
    "single": false,
    "items": [
      {
        "key": "p-arch",
        "label": "产品功能架构图"
      }
    ]
  }
];
  var routes = {};
  var items = groups.map(function (group) {
    var children = group.items.map(function (item) {
      routes[item.key] = new URL('../teacher/' + item.key + '/' + item.key + '.html', scriptUrl).href;
      return { key: item.key, label: item.label, href: routes[item.key] };
    });
    return group.single ? children[0] : { key: 'grp:' + group.label, label: group.label, expanded: children.some(function (item) { return expandedFeatures.includes(item.key); }), children: children };
  });
  registry.register('teacher-growth-portfolio.management', { appId: 'teacher-growth-portfolio', label: '教师成长档案袋', items: items, routes: routes });
})(window.WiseMenuRegistry);
