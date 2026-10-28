(function () {
  const STAFF_ROLE_PROFILES = {
    '人事处领导（决策视角）': {
      appGroups: [
        { key: 'leader-workbench', label: '工作台', apps: [
          { key: 'system-workbench', label: '系统工作台' },
          { key: 'home', label: '首页', href: '../demos/staff-portal-homepage.html' }
        ] },
        { key: 'decision-analysis', label: '决策分析', apps: [
          { key: 'hr-center', label: '人事综合中心' },
          { key: 'core-statistics', label: '核心数据统计' },
          { key: 'major-project-monitor', label: '重大项目监测' },
          { key: 'hr-annual-report', label: '人事年报' },
          { key: 'report-center', label: '预制报表中心' },
          { key: 'ai-observatory', label: 'AI观察室' }
        ] },
        { key: 'team-portrait', label: '队伍画像', apps: [
          { key: 'system-portrait', label: '系统画像' },
          { key: 'group-portrait', label: '群体画像' },
          { key: 'external-achievement', label: '外部业绩中心' },
          { key: 'teacher-growth-profile', label: '教师成长档案' },
          { key: 'teaching-portfolio', label: '教学档案袋', href: '../demos/teaching-portfolio.html' },
          { key: 'custom-portrait', label: '自定义画像' }
        ] }
      ]
    },
    '综合办公室': {
      appGroups: [
        { key: 'office-workbench', label: '工作台', apps: [
          { key: 'system-workbench', label: '系统工作台' },
          { key: 'home', label: '首页', href: '../demos/staff-portal-homepage.html' }
        ] },
        { key: 'general-affairs', label: '综合事务', apps: [
          { key: 'expert-library', label: '专家库建设' },
          { key: 'external-parttime', label: '校外兼职' },
          { key: 'discipline-business', label: '处分业务' },
          { key: 'overseas-business', label: '教职工出国' },
          { key: 'leave-shenzhen', label: '离深报备' }
        ] },
        { key: 'certificate-budget', label: '证明预算', apps: [
          { key: 'certificate-print', label: '教职工证明打印', href: '../demos/certificate-print.html' },
          { key: 'budget-statistics', label: '预算统计' }
        ] }
      ]
    },
    '人才引进与项目办': {
      appGroups: [
        { key: 'talent-workbench', label: '工作台', apps: [
          { key: 'system-workbench', label: '系统工作台' },
          { key: 'home', label: '首页', href: '../demos/staff-portal-homepage.html' }
        ] },
        { key: 'recruitment-entry', label: '招聘进校', apps: [
          { key: 'staff-recruitment', label: '教职工招聘' },
          { key: 'staff-entry', label: '教职工进校' },
          { key: 'personnel-filing', label: '人员备案' },
          { key: 'industry-mentor', label: '行业导师' }
        ] },
        { key: 'talent-project', label: '人才项目', apps: [
          { key: 'talent-project-apply', label: '人才项目申报' },
          { key: 'one-case-one-discussion', label: '一事一议专项' },
          { key: 'pre-long-appointment', label: '预长聘专项' }
        ] },
        { key: 'postdoctoral', label: '博士后', apps: [
          { key: 'postdoc-opening-report', label: '博士后开题报告' },
          { key: 'postdoc-assessment', label: '博士后考核管理' },
          { key: 'postdoc-extension', label: '博士后延期出站' },
          { key: 'postdoc-mentor-change', label: '博士后导师变更' }
        ] }
      ]
    },
    '师资培养发展办': {
      appGroups: [
        { key: 'development-workbench', label: '工作台', apps: [
          { key: 'system-workbench', label: '系统工作台' },
          { key: 'home', label: '首页', href: '../demos/staff-portal-homepage.html' }
        ] },
        { key: 'training-development', label: '培养发展', apps: [
          { key: 'training-manage', label: '进修培训管理' },
          { key: 'degree-study', label: '攻读硕博管理' },
          { key: 'visiting-exchange', label: '访学交流' },
          { key: 'follow-up-training', label: '跟岗锻炼' },
          { key: 'enterprise-practice', label: '企业实践锻炼' },
          { key: 'teacher-space', label: '教工空间' }
        ] },
        { key: 'qualification', label: '资格认定', apps: [
          { key: 'dual-qualified', label: '双师型教师申报认定', href: '../demos/dual-qualified.html' }
        ] },
        { key: 'ethics-special', label: '师德专项', apps: [
          { key: 'teacher-ethics-assessment', label: '师德考核' },
          { key: 'foreign-teacher-special', label: '外教专项' },
          { key: 'labor-dispatch-special', label: '劳派专项' },
          { key: 'security-team-special', label: '校卫队专项' }
        ] },
        { key: 'design-resources', label: '设计资源', apps: [
          { key: 'component-library', label: '组件库', href: '../components/component-library-index.html' }
        ] }
      ]
    },
    '岗位职称办': {
      appGroups: [
        { key: 'position-workbench', label: '工作台', apps: [
          { key: 'system-workbench', label: '系统工作台' },
          { key: 'home', label: '首页', href: '../demos/staff-portal-homepage.html' }
        ] },
        { key: 'position-employment', label: '岗位聘用', apps: [
          { key: 'position-setting', label: '岗位设置' },
          { key: 'position-system-setting', label: '岗位体系设置' },
          { key: 'position-employ', label: '岗位聘用' },
          { key: 'regularization', label: '转正定级' }
        ] },
        { key: 'assessment-evaluation', label: '考核评价', apps: [
          { key: 'annual-assessment', label: '年度考核', href: '../demos/annual-assessment.html' },
          { key: 'period-assessment', label: '聘期考核', href: '../demos/period-assessment.html' },
          { key: 'honor-evaluation', label: '评优评先' }
        ] },
        { key: 'title-contract', label: '职称合同', apps: [
          { key: 'title-review', label: '职称评审', href: '../demos/title-review.html' },
          { key: 'contract-signing', label: '职签合同' }
        ] }
      ]
    },
    '信息档案办': {
      appGroups: [
        { key: 'archive-workbench', label: '工作台', apps: [
          { key: 'system-workbench', label: '系统工作台' },
          { key: 'home', label: '首页', href: '../demos/staff-portal-homepage.html' }
        ] },
        { key: 'information-maintenance', label: '信息维护', apps: [
          { key: 'org-manage', label: '组织机构管理' },
          { key: 'staff-info-manage', label: '教职工信息管理' },
          { key: 'staff-info-change', label: '教职工信息变更', href: '../demos/my-info.html' }
        ] },
        { key: 'data-governance', label: '数据治理', apps: [
          { key: 'data-quality-check', label: '数据质量自检' },
          { key: 'data-integration-share', label: '数据集成与共享' },
          { key: 'staff-change-query', label: '教职工异动查询' },
          { key: 'personalized-share', label: '个性化共享' },
          { key: 'data-collection', label: '数据采集' },
          { key: 'material-submit', label: '通用材料报送' },
          { key: 'performance-submit', label: '业绩申报', href: '../demos/performance-data.html' }
        ] },
        { key: 'archive-college', label: '档案高校', apps: [
          { key: 'archive-manage', label: '档案管理' },
          { key: 'digital-archive', label: '数字档案' },
          { key: 'staff-college', label: '教职工高校' }
        ] },
        { key: 'system-manage', label: '系统管理', apps: [
          { key: 'system-management', label: '系统管理' }
        ] }
      ]
    },
    '优才公司': {
      appGroups: [
        { key: 'youcai-workbench', label: '工作台', apps: [
          { key: 'system-workbench', label: '系统工作台' },
          { key: 'home', label: '首页', href: '../demos/staff-portal-homepage.html' }
        ] },
        { key: 'employment-manage', label: '用工管理', apps: [
          { key: 'personnel-filing', label: '人员备案' },
          { key: 'online-contract', label: '网签合同' },
          { key: 'labor-dispatch-special', label: '劳派专项' }
        ] },
        { key: 'entry-exit', label: '入离职', apps: [
          { key: 'staff-entry', label: '教职工进校' },
          { key: 'staff-exit', label: '教职工离校' }
        ] }
      ]
    },
    '干部管理员（组织部/干部处）': {
      appGroups: [
        { key: 'cadre-workbench', label: '工作台', apps: [
          { key: 'system-workbench', label: '系统工作台' },
          { key: 'home', label: '首页', href: '../demos/staff-portal-homepage.html' }
        ] },
        { key: 'cadre-information', label: '干部信息', apps: [
          { key: 'cadre-info-manage', label: '干部信息管理' },
          { key: 'cadre-evaluation', label: '干部测评' }
        ] },
        { key: 'cadre-appointment-team', label: '干部任用部门队伍', apps: [
          { key: 'cadre-appointment', label: '干部任免' },
          { key: 'cadre-regularization', label: '干部转正' },
          { key: 'cadre-parttime', label: '干部兼职' },
          { key: 'staff-info-manage', label: '教职工信息管理' },
          { key: 'staff-change-query', label: '教职工异动查询' },
          { key: 'group-portrait', label: '群体画像' },
          { key: 'teaching-portfolio', label: '教学档案袋', href: '../demos/teaching-portfolio.html' }
        ] },
        { key: 'department-assessment', label: '部门考核', apps: [
          { key: 'annual-assessment', label: '年度考核', href: '../demos/annual-assessment.html' },
          { key: 'period-assessment', label: '聘期考核', href: '../demos/period-assessment.html' },
          { key: 'honor-evaluation', label: '评优评先' },
          { key: 'performance-submit', label: '业绩申报', href: '../demos/performance-data.html' }
        ] }
      ]
    },
    '校领导（只读驾驶舱）': {
      appGroups: [
        { key: 'decision-center', label: '决策中心', apps: [
          { key: 'hr-center', label: '人事综合中心' },
          { key: 'core-statistics', label: '核心数据统计' },
          { key: 'major-project-monitor', label: '重大项目监测' },
          { key: 'hr-annual-report', label: '人事年报' }
        ] },
        { key: 'talent-insight', label: '人才洞察', apps: [
          { key: 'ai-observatory', label: 'AI观察室' },
          { key: 'system-portrait', label: '系统画像' },
          { key: 'group-portrait', label: '群体画像' },
          { key: 'external-achievement', label: '外部业绩中心' },
          { key: 'custom-portrait', label: '自定义画像' }
        ] }
      ]
    },
    '离退休人员': {
      appGroups: [
        { key: 'retired-workbench', label: '工作台', apps: [
          { key: 'home', label: '首页', href: '../demos/staff-portal-homepage.html' }
        ] },
        { key: 'retired-service', label: '我的服务', apps: [
          { key: 'certificate-print', label: '教职工证明打印', href: '../demos/certificate-print.html' },
          { key: 'health-care', label: '二三级保健' },
          { key: 'salary-query', label: '薪酬管理' }
        ] }
      ]
    },
    '教职工': {
      appGroups: [
        { key: 'staff-self-workbench', label: '工作台', apps: [
          { key: 'home', label: '首页', href: '../demos/staff-portal-homepage.html' },
          { key: 'task-center', label: '任务中心', href: '../demos/task-center.html' }
        ] },
        { key: 'staff-self-affairs', label: '我的事务', apps: [
          { key: 'my-info', label: '我的信息', href: '../demos/my-info.html' },
          { key: 'my-salary', label: '我的薪酬', href: '../demos/my-salary.html' },
          { key: 'leave-application', label: '请假申请', href: '../demos/leave-application.html' },
          { key: 'certificate-print', label: '证明打印', href: '../demos/certificate-print.html' },
          { key: 'overseas-report', label: '因公出国（境）', href: '../demos/overseas-report.html' }
        ] },
        { key: 'staff-self-teaching', label: '教学发展', apps: [
          { key: 'teaching-portfolio', label: '教学档案袋', href: '../demos/teaching-portfolio-teacher.html' },
          { key: 'performance-submit', label: '业绩申报', href: '../demos/performance-data.html' },
          { key: 'dual-qualified', label: '双师型教师申报', href: '../demos/dual-qualified.html' },
          { key: 'annual-assessment', label: '年度考核', href: '../demos/annual-assessment.html' }
        ] }
      ]
    }
  };

  window.WiseFramework2StaffPreset = Object.freeze({
    roleName: '师资培养发展办',
    roles: Object.keys(STAFF_ROLE_PROFILES),
    roleProfiles: STAFF_ROLE_PROFILES
  });
})();
