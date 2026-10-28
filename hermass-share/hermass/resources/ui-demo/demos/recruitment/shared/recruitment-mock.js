/**
 * 招聘管理系统 · 统一 Mock 数据源
 * 挂载到 window.RecruitmentMock,由各业务页 HTML 在 bundle 之前引入。
 *
 * 设计原则:仅统一跨页面共享、且原本各造一份导致不一致的核心实体。
 * 全局一致性 = 一次定义、多处引用,避免 hr/position 与外网门户的岗位数据对不上等问题。
 * 各页面独有、无跨页复用的数据(批次、试题、投递记录等)仍在页面内联,不必集中。
 *
 * 注:应聘者侧已改为独立外网门户(portal/),不纳入内部角色体系,数据独立存储于 localStorage。
 */
(function () {
  // 本院系常量:院系管理员(dean)视角的数据范围基准
  var COLLEGE = '电子与通信工程学院'

  // === 学院列表(开放范围/转移组件复用) ===
  var COLLEGES = [
    '电子与通信工程学院', '机电工程学院', '汽车与交通学院', '建筑与环境工程学院',
    '艺术设计学院', '经济管理学院', '外语学院', '数字媒体学院', '医学技术学院',
    '护理学院', '药学学院', '公共卫生学院', '马克思主义学院', '体育部',
    '继续教育学院', '国际教育学院', '创新创业学院', '图书馆', '信息中心', '后勤管理处'
  ]

  // === 招聘种类 / 岗位类别 / 流程环节 选项 ===
  var RECRUITMENT_CATEGORIES = ['管理岗位', '专业技术岗位', '工勤技能岗位']
  var POSITION_CATEGORIES = ['教师岗', '科研岗', '行政岗', '教辅岗', '专职辅导员', '其他']
  var PROCESS_STAGE_OPTIONS = ['资格审查', '综合素质考察', '笔试', '面试', '试讲', '体检', '心理测试']

  // === 岗位计划申报表字典(对齐《2026年招聘岗位计划申报表》口径) ===
  // 校区
  var CAMPUS_OPTIONS = ['西丽校区（留仙洞园区）', '西丽校区（西丽湖园区）', '西丽校区（官龙山园区）', '香蜜校区', '深汕校区']
  // 已撤销专业(由学校专业设置数据带入,岗位申报时只读提醒)
  var CANCELLED_MAJORS = [
    { name: '电子信息工程技术', year: '2025年' },
    { name: '通信技术', year: '2024年' },
  ]
  // 本科专业岗位类型
  var BACHELOR_POST_TYPE_OPTIONS = ['A 类(国家一流本科专业)', 'B 类(省级一流本科专业)', 'C 类(普通本科专业)']
  // 岗位等级(专业技术系列)
  var POSITION_GRADE_OPTIONS = ['专业技术二级及以上', '专业技术三级', '专业技术四级', '专业技术五级', '专业技术六级', '专业技术七级', '专业技术八级', '专业技术九级', '专业技术十级', '专业技术十一级', '专业技术十二级']
  // 人员管理类型
  // 用人方式:员额制/事业编属编制内用工,需按学位与最低专业技术资格判断申报表模板与选聘要求
  var EMPLOYMENT_FORM_OPTIONS = ['员额制', '校内临聘', '劳务派遣', '返聘', '事业编']
  // 需要判断学位与最低专业技术资格的用人方式
  var QUALIFICATION_RULE_EMPLOYMENT_FORMS = ['员额制', '事业编']
  var PERSONNEL_TYPE_OPTIONS = ['预聘长聘制', '聘任制', '人事代理', '全职聘用']
  // 学历 / 学位 / 最低专业技术资格
  var EDUCATION_OPTIONS = ['研究生', '博士研究生', '硕士研究生', '大学本科', '大学专科']
  var DEGREE_OPTIONS = ['博士', '硕士', '学士']
  var MIN_TITLE_OPTIONS = ['不限', '正高级', '副高级', '中级', '初级']
  // 专业代码字典(本科 B 开头 / 研究生 A 开头,缩样演示)
  var MAJOR_CODE_UNDERGRAD = [
    { code: 'B080701', name: '电子信息工程(080701)' },
    { code: 'B080703', name: '通信工程(080703)' },
    { code: 'B080706', name: '光电信息科学与工程(080706)' },
    { code: 'B080601', name: '电气工程及其自动化(080601)' },
    { code: 'B080202', name: '机械设计制造及其自动化(080202)' },
    { code: 'B120203', name: '会计学(120203)' },
    { code: 'B120201', name: '工商管理(120201)' },
    { code: 'B050201', name: '英语(050201)' },
    { code: 'B050207', name: '日语(050207)' },
  ]
  var MAJOR_CODE_POSTGRAD = [
    { code: 'A081000', name: '信息与通信工程(081000)' },
    { code: 'A080900', name: '电子科学与技术(080900)' },
    { code: 'A081200', name: '计算机科学与技术(081200)' },
    { code: 'A080200', name: '机械工程(080200)' },
    { code: 'A120200', name: '工商管理(120200)' },
    { code: 'A120100', name: '管理科学与工程(120100)' },
    { code: 'A050200', name: '外国语言文学(050200)' },
  ]

  // === 专业目录(精简演示数据,三层级:学科门类→学科→专业) ===
  // 支持年度/启用状态/版本管理
  var MAJOR_CATALOG = {
    // 本科专业目录
    undergraduate: {
      year: '2026',
      enabled: true,
      version: 'v1.0',
      lastUpdate: '2025-12-15',
      categories: [
        {
          code: '08',
          name: '工学',
          disciplines: [
            {
              code: '0807',
              name: '电子信息类',
              majors: [
                { code: 'B080701', name: '电子信息工程', oldNames: ['电子工程', '无线电技术'] },
                { code: 'B080703', name: '通信工程', oldNames: ['电信工程'] },
                { code: 'B080706', name: '光电信息科学与工程', oldNames: ['光信息科学与技术'] },
              ]
            },
            {
              code: '0806',
              name: '电气类',
              majors: [
                { code: 'B080601', name: '电气工程及其自动化', oldNames: ['电气工程'] },
              ]
            },
            {
              code: '0802',
              name: '机械类',
              majors: [
                { code: 'B080202', name: '机械设计制造及其自动化', oldNames: ['机械工程', '机械制造'] },
              ]
            }
          ]
        },
        {
          code: '12',
          name: '管理学',
          disciplines: [
            {
              code: '1202',
              name: '工商管理类',
              majors: [
                { code: 'B120201', name: '工商管理', oldNames: ['企业管理'] },
                { code: 'B120203', name: '会计学', oldNames: [] },
              ]
            }
          ]
        },
        {
          code: '05',
          name: '文学',
          disciplines: [
            {
              code: '0502',
              name: '外国语言文学类',
              majors: [
                { code: 'B050201', name: '英语', oldNames: [] },
                { code: 'B050207', name: '日语', oldNames: [] },
              ]
            }
          ]
        }
      ]
    },
    // 研究生专业目录
    postgraduate: {
      year: '2026',
      enabled: true,
      version: 'v1.0',
      lastUpdate: '2025-12-15',
      categories: [
        {
          code: '08',
          name: '工学',
          disciplines: [
            {
              code: '0810',
              name: '信息与通信工程',
              majors: [
                { code: 'A081000', name: '信息与通信工程', oldNames: [] },
              ]
            },
            {
              code: '0809',
              name: '电子科学与技术',
              majors: [
                { code: 'A080900', name: '电子科学与技术', oldNames: [] },
              ]
            },
            {
              code: '0812',
              name: '计算机科学与技术',
              majors: [
                { code: 'A081200', name: '计算机科学与技术', oldNames: [] },
              ]
            },
            {
              code: '0802',
              name: '机械工程',
              majors: [
                { code: 'A080200', name: '机械工程', oldNames: [] },
              ]
            }
          ]
        },
        {
          code: '12',
          name: '管理学',
          disciplines: [
            {
              code: '1202',
              name: '工商管理',
              majors: [
                { code: 'A120200', name: '工商管理', oldNames: [] },
              ]
            },
            {
              code: '1201',
              name: '管理科学与工程',
              majors: [
                { code: 'A120100', name: '管理科学与工程', oldNames: [] },
              ]
            }
          ]
        },
        {
          code: '05',
          name: '文学',
          disciplines: [
            {
              code: '0502',
              name: '外国语言文学',
              majors: [
                { code: 'A050200', name: '外国语言文学', oldNames: [] },
              ]
            }
          ]
        }
      ]
    },
    // 大专专业目录(精简)
    college: {
      year: '2026',
      enabled: true,
      version: 'v1.0',
      lastUpdate: '2025-12-15',
      categories: [
        {
          code: '08',
          name: '工学',
          disciplines: [
            {
              code: '0807',
              name: '电子信息类',
              majors: [
                { code: 'C080701', name: '电子信息工程技术', oldNames: [] },
                { code: 'C080703', name: '通信技术', oldNames: [] },
              ]
            }
          ]
        }
      ]
    }
  }

  // 专业目录版本历史(用于管理页签)
  var MAJOR_CATALOG_VERSIONS = [
    { id: 'ver-2026', year: '2026', level: 'undergraduate', version: 'v1.0', enabled: true, lastUpdate: '2025-12-15', operator: '人事处管理员', remark: '2026年本科专业目录' },
    { id: 'ver-2026-pg', year: '2026', level: 'postgraduate', version: 'v1.0', enabled: true, lastUpdate: '2025-12-15', operator: '人事处管理员', remark: '2026年研究生专业目录' },
    { id: 'ver-2026-col', year: '2026', level: 'college', version: 'v1.0', enabled: true, lastUpdate: '2025-12-15', operator: '人事处管理员', remark: '2026年大专专业目录' },
    { id: 'ver-2025', year: '2025', level: 'undergraduate', version: 'v2.1', enabled: false, lastUpdate: '2025-06-20', operator: '人事处管理员', remark: '2025年本科专业目录(已停用)' },
    { id: 'ver-2025-pg', year: '2025', level: 'postgraduate', version: 'v2.1', enabled: false, lastUpdate: '2025-06-20', operator: '人事处管理员', remark: '2025年研究生专业目录(已停用)' },
  ]

  // === 招聘计划(单一真源:贯通 hr 招聘计划发布 / dean 计划申请 / hr 计划审核) ===
  // status: 未发布 | 已发布（文档第 8 章口径）
  // ended:  true 表示该已发布计划的招聘工作已办结，仅用于 demo 内部分组，不是对外状态
  var PLANS = [
    {
      id: 'plan-001',
      planName: '2026年春季教职工招聘计划',
      planNameEn: '2026 Spring Faculty Recruitment Plan',
      academicYear: '2025-2026',
      recruitmentCategory: '专业技术岗位',
      positionCategory: ['教师岗', '科研岗'],
      applyStartDate: '2026-03-01',
      applyEndDate: '2026-03-31',
      collectionMaterials: [
        { name: '附件1：2027年招聘岗位计划申报表（选聘岗：博士、副高）.xlsx', size: 28672, status: 'done' },
        { name: '附件2：2027年招聘岗位计划申报表（公开招考岗：硕士）.xlsx', size: 24576, status: 'done' },
      ],
      allowRepeatApply: true,
      // 招聘种类（流程）配置：报名时间供「应聘者计划」卡片与计划详情展示，字段口径同 plan-initiate-detail「报名时间」分组
      recruitmentConfigs: [
        {
          id: 'plan-001-written-interview',
          recruitmentType: '公开招聘',
          processCode: 'public-written-interview',
          processName: '公开招聘——先笔试后面试',
          isDefault: true,
          enabled: true,
          registerStartDate: '2026-03-01 09:00',
          registerEndDate: '2026-03-31 17:00',
          returnDeadline: '2026-04-03 17:00',
          writtenConfirmEndDate: '2026-04-10 17:00',
          interviewConfirmEndDate: '2026-04-24 17:00',
          maxPositionCount: 2,
          allowRepeatApply: true,
        },
      ],
      submittedCount: 5,
      totalUnits: 12,
      status: '已发布', ended: false
    },
    {
      id: 'plan-002',
      planName: '2025年秋季高层次人才引进计划',
      planNameEn: '2025 Autumn High-level Talent Program',
      academicYear: '2025-2026',
      recruitmentCategory: '专业技术岗位',
      positionCategory: '科研岗',
      applyStartDate: '2025-09-10',
      applyEndDate: '2025-10-25',
      allowRepeatApply: false,
      recruitmentConfigs: [
        {
          id: 'plan-002-default',
          recruitmentType: '高层次引进',
          processCode: 'talent-introduction',
          processName: '高层次人才引进——考核招聘',
          isDefault: true,
          enabled: true,
          registerStartDate: '2025-09-10 09:00',
          registerEndDate: '2025-10-25 17:00',
          returnDeadline: '2025-10-28 17:00',
        },
      ],
      submittedCount: 8,
      totalUnits: 8,
      status: '已发布', ended: true
    },
    {
      id: 'plan-003',
      planName: '2025年暑期行政岗位招聘计划',
      planNameEn: '2025 Summer Administrative Recruitment',
      academicYear: '2024-2025',
      recruitmentCategory: '管理岗位',
      positionCategory: '行政岗',
      applyStartDate: '2025-06-01',
      applyEndDate: '2025-06-30',
      allowRepeatApply: true,
      recruitmentConfigs: [
        {
          id: 'plan-003-default',
          recruitmentType: '社会公开招聘',
          processCode: 'public-written-interview',
          processName: '公开招聘——先笔试后面试',
          isDefault: true,
          enabled: true,
          registerStartDate: '2025-06-01 09:00',
          registerEndDate: '2025-06-30 17:00',
          returnDeadline: '2025-07-03 17:00',
        },
      ],
      submittedCount: 3,
      totalUnits: 6,
      status: '已发布', ended: true
    },
    {
      id: 'plan-004',
      planName: '2026年秋季教学科研岗招聘',
      planNameEn: '2026 Autumn Teaching and Research Recruitment',
      academicYear: '2026-2027',
      recruitmentCategory: '专业技术岗位',
      positionCategory: ['教师岗', '科研岗'],
      applyStartDate: '2026-09-01',
      applyEndDate: '2026-09-30',
      allowRepeatApply: true,
      submittedCount: 0,
      totalUnits: 15,
      status: '未发布', ended: false
    },
    {
      id: 'plan-005',
      planName: '2025年春季辅导员招聘计划',
      planNameEn: '2025 Spring Counselor Recruitment',
      academicYear: '2024-2025',
      recruitmentCategory: '管理岗位',
      positionCategory: '专职辅导员',
      applyStartDate: '2025-03-01',
      applyEndDate: '2025-03-31',
      allowRepeatApply: false,
      recruitmentConfigs: [
        {
          id: 'plan-005-default',
          recruitmentType: '社会公开招聘',
          processCode: 'public-interview-written',
          processName: '公开招聘——先面试后笔试',
          isDefault: true,
          enabled: true,
          registerStartDate: '2025-03-01 09:00',
          registerEndDate: '2025-03-31 17:00',
          returnDeadline: '2025-04-03 17:00',
        },
      ],
      submittedCount: 6,
      totalUnits: 6,
      status: '已发布', ended: true
    },
    {
      id: 'plan-006',
      planName: '2026年暑期教辅岗位招聘',
      planNameEn: '2026 Summer Teaching Support Recruitment',
      academicYear: '2025-2026',
      recruitmentCategory: '工勤技能岗位',
      positionCategory: '教辅岗',
      applyStartDate: '2026-07-01',
      applyEndDate: '2026-07-31',
      allowRepeatApply: true,
      submittedCount: 0,
      totalUnits: 8,
      status: '未发布', ended: false
    },
    {
      id: 'plan-007',
      planName: '2026年春季行政管理人员招聘',
      planNameEn: '2026 Spring Administrative Staff Recruitment',
      academicYear: '2025-2026',
      recruitmentCategory: '管理岗位',
      positionCategory: '行政岗',
      applyStartDate: '2026-04-01',
      applyEndDate: '2026-04-30',
      allowRepeatApply: false,
      recruitmentConfigs: [
        {
          id: 'plan-007-written-interview',
          recruitmentType: '公开招聘',
          processCode: 'public-written-interview',
          processName: '公开招聘——先笔试后面试',
          isDefault: true,
          enabled: true,
          registerStartDate: '2026-05-01 09:00',
          registerEndDate: '2026-05-15 17:00',
          returnDeadline: '2026-05-18 17:00',
          writtenConfirmEndDate: '2026-05-22 17:00',
          interviewConfirmEndDate: '2026-06-05 17:00',
          maxPositionCount: 1,
          allowRepeatApply: false,
        },
        {
          id: 'plan-007-interview-written',
          recruitmentType: '公开招聘',
          processCode: 'public-interview-written',
          processName: '公开招聘——先面试后笔试',
          isDefault: false,
          enabled: true,
          registerStartDate: '2026-05-01 09:00',
          registerEndDate: '2026-05-15 17:00',
          returnDeadline: '2026-05-18 17:00',
          interviewConfirmEndDate: '2026-05-22 17:00',
          writtenConfirmEndDate: '2026-06-05 17:00',
          maxPositionCount: 1,
          allowRepeatApply: false,
        },
      ],
      submittedCount: 2,
      totalUnits: 5,
      status: '已发布', ended: false
    },
    {
      id: 'plan-008',
      planName: '2024年秋季高层次人才引进',
      planNameEn: '2024 Autumn High-level Talent Program',
      academicYear: '2024-2025',
      recruitmentCategory: '专业技术岗位',
      positionCategory: '教师岗',
      applyStartDate: '2024-09-01',
      applyEndDate: '2024-10-31',
      allowRepeatApply: false,
      recruitmentConfigs: [
        {
          id: 'plan-008-default',
          recruitmentType: '高层次引进',
          processCode: 'talent-introduction',
          processName: '高层次人才引进——考核招聘',
          isDefault: true,
          enabled: true,
          registerStartDate: '2024-09-01 09:00',
          registerEndDate: '2024-10-31 17:00',
          returnDeadline: '2024-11-03 17:00',
        },
      ],
      submittedCount: 4,
      totalUnits: 4,
      status: '已发布', ended: true
    }
  ]

  // === 院系岗位申请(单一真源:dean 添加岗位 → hr 审核按计划归组) ===
  // status: pending 待审核 / audited 已审核；auditResult: passed | rejected | null
  // 申报表四组字段:基本信息/任职要求/申报说明/配置依据 + 三级人数(院系申报数/人事建议数/委员会审定数)
  var POSITION_APPLICATIONS = [
    { id: 'app-001', planId: 'plan-001', positionName: '通信工程·专任教师', positionNameEn: 'Communication Engineering Teacher', positionCode: 'T2026-D01-001', positionCategory: '教师岗', recruitUnit: COLLEGE, campus: '校本部', bachelorPostType: 'A 类(国家一流本科专业)', positionGrade: '专业技术十级', personnelType: '预聘长聘制', education: '博士研究生', degree: '博士', undergradMajorCode: 'B080703', undergradMajorName: '通信工程', postgradMajorCode: 'A081000', postgradMajorName: '信息与通信工程', minTitle: '不限', otherCondition: '有海外留学经历者优先', duty: '承担通信工程相关课程教学与毕业设计指导,参与重点实验室建设。', qualification: '通信工程、信号处理方向博士,有较强科研能力。', addReason: '生师比22:1高于标准18:1,近3年退休4人仅补1人,同类岗位缺口明显。', currentTeacherCount: 126, hired2025Count: 3, targetTeacherCount: 132, student2023: 580, student2024: 620, student2025: 650, admittedNotOnboardCount: 1, plannedRetirees2027: 2, retireeNameList: '李国强、周慧敏', externalTeacherCount: 12, student2026: 660, expectedStudent2027: 680, annualPerCapitaWorkload: 428, collegeDevelopmentPlan: '通信工程专业对接深圳“20+8”产业集群，未来五年重点建设6G通信与卫星互联网方向，扩大产教融合班规模，师资向无线通信、信号处理方向倾斜。', remarks: '拟聘人员须承担产教融合班教学任务。', deptHead: '张建平', headcount: 2, hrSuggestCount: 2, committeeApprovedCount: 2, submitter: '王老师', submitDate: '2026-03-08', deptHeadConfirmed: '已确认', contact: '0871-65000001', status: 'pending', auditResult: null, hrOpinion: '', committeeOpinion: '', hrConfirmed: '待确认', committeeConfirmed: '待确认' },
    { id: 'app-002', planId: 'plan-001', positionName: '电磁场与微波技术·副教授', positionNameEn: 'EM & Microwave Associate Professor', positionCode: 'T2026-D01-002', positionCategory: '教师岗', recruitUnit: COLLEGE, campus: '校本部', bachelorPostType: 'A 类(国家一流本科专业)', positionGrade: '专业技术七级', personnelType: '预聘长聘制', education: '博士研究生', degree: '博士', undergradMajorCode: 'B080701', undergradMajorName: '电子信息工程', postgradMajorCode: 'A080900', postgradMajorName: '电子科学与技术', minTitle: '副高级', otherCondition: '主持过省部级以上项目', duty: '负责微波技术方向研究生培养与科研项目申报。', qualification: '电磁场与微波技术方向博士,主持过省部级以上项目。', addReason: '微波技术方向学科带头人退休,需补充学术骨干,产业合作项目持续增加。', currentTeacherCount: 126, hired2025Count: 3, targetTeacherCount: 132, student2023: 580, student2024: 620, student2025: 650, admittedNotOnboardCount: 0, plannedRetirees2027: 1, retireeNameList: '陈明远', externalTeacherCount: 12, student2026: 660, expectedStudent2027: 680, annualPerCapitaWorkload: 436, collegeDevelopmentPlan: '电磁场与微波技术方向支撑射频器件与天线测试实验室建设，需补充学术骨干带动省部级项目申报与研究生培养。', remarks: '须具备主持省部级以上项目经历。', deptHead: '张建平', headcount: 1, hrSuggestCount: 1, committeeApprovedCount: 1, submitter: '王老师', submitDate: '2026-03-08', deptHeadConfirmed: '已确认', contact: '0871-65000002', status: 'pending', auditResult: null },
    { id: 'app-003', planId: 'plan-001', positionName: '机电一体化·讲师', positionNameEn: 'Mechatronics Lecturer', positionCode: 'T2026-D02-001', positionCategory: '教师岗', recruitUnit: '机电工程学院', campus: '校本部', bachelorPostType: 'B 类(省级一流本科专业)', positionGrade: '专业技术十级', personnelType: '聘任制', education: '博士研究生', degree: '博士', undergradMajorCode: 'B080202', undergradMajorName: '机械设计制造及其自动化', postgradMajorCode: 'A080200', postgradMajorName: '机械工程', minTitle: '不限', otherCondition: '有工程实践经验', duty: '承担机电一体化、智能制造相关课程教学。', qualification: '机械工程方向博士,有工程实践经验。', addReason: '智能制造产业升级,机电一体化岗位需求旺盛,生师比略高。', currentTeacherCount: 86, hired2025Count: 2, targetTeacherCount: 92, student2023: 420, student2024: 450, student2025: 480, admittedNotOnboardCount: 1, plannedRetirees2027: 1, retireeNameList: '王志刚', externalTeacherCount: 9, student2026: 500, expectedStudent2027: 510, annualPerCapitaWorkload: 452, collegeDevelopmentPlan: '机电一体化专业围绕智能制造转型升级，重点发展工业机器人与智能装备方向，扩大现代学徒制培养规模。', remarks: '优先考虑具有企业工程实践经历人员。', deptHead: '刘兆丰', headcount: 2, hrSuggestCount: 2, committeeApprovedCount: 1, submitter: '李老师', submitDate: '2026-03-09', deptHeadConfirmed: '已确认', contact: '0871-65000003', status: 'pending', auditResult: null, hrOpinion: '', committeeOpinion: '', hrConfirmed: '待确认', committeeConfirmed: '待确认' },
    { id: 'app-004', planId: 'plan-001', positionName: '视觉传达·教师', positionNameEn: 'Visual Communication Teacher', positionCode: 'T2026-D05-001', positionCategory: '教师岗', recruitUnit: '艺术设计学院', campus: '校本部', bachelorPostType: 'A 类(国家一流本科专业)', positionGrade: '专业技术十级', personnelType: '聘任制', education: '硕士研究生', degree: '硕士', undergradMajorCode: '', undergradMajorName: '', postgradMajorCode: '', postgradMajorName: '设计学', minTitle: '不限', otherCondition: '有成熟作品集', duty: '承担视觉传达设计专业核心课程教学与创作指导。', qualification: '设计学方向硕士及以上,有成熟作品集。', addReason: '视觉传达方向课程缺口,需补充实践教学力量。', currentTeacherCount: 42, hired2025Count: 1, targetTeacherCount: 44, student2023: 210, student2024: 230, student2025: 250, admittedNotOnboardCount: 0, plannedRetirees2027: 0, retireeNameList: '', externalTeacherCount: 6, student2026: 260, expectedStudent2027: 270, annualPerCapitaWorkload: 418, collegeDevelopmentPlan: '视觉传达设计专业依托国家一流本科专业建设点，向数字媒体与品牌设计方向拓展，加强工作室制实践教学。', remarks: '须提供近三年代表性作品集。', deptHead: '许文珊', headcount: 1, approvedHeadcount: 2, hrSuggestCount: 2, committeeApprovedCount: 2, submitter: '陈老师', submitDate: '2026-03-07', deptHeadConfirmed: '已确认', contact: '0871-65000004', status: 'audited', auditResult: 'passed' },
    { id: 'app-005', planId: 'plan-001', positionName: '工商管理·讲师', positionNameEn: 'Business Administration Lecturer', positionCode: 'T2026-D06-001', positionCategory: '教师岗', recruitUnit: '经济管理学院', campus: '校本部', bachelorPostType: 'B 类(省级一流本科专业)', positionGrade: '专业技术十级', personnelType: '聘任制', education: '博士研究生', degree: '博士', undergradMajorCode: 'B120201', undergradMajorName: '工商管理', postgradMajorCode: 'A120200', postgradMajorName: '工商管理', minTitle: '不限', otherCondition: '有企业咨询经验者优先', duty: '承担工商管理、市场营销方向课程教学。', qualification: '工商管理方向博士,有企业咨询经验者优先。', addReason: '工商管理专业扩招,生师比偏高,需补充教学力量。', currentTeacherCount: 68, hired2025Count: 2, targetTeacherCount: 72, student2023: 340, student2024: 370, student2025: 400, admittedNotOnboardCount: 1, plannedRetirees2027: 1, retireeNameList: '黄少华', externalTeacherCount: 7, student2026: 420, expectedStudent2027: 430, annualPerCapitaWorkload: 445, collegeDevelopmentPlan: '工商管理专业面向中小企业数字化经营需求，重点建设数字营销与供应链管理方向，扩大校企联合培养规模。', remarks: '', deptHead: '林晓东', headcount: 2, hrSuggestCount: 2, committeeApprovedCount: 2, submitter: '赵老师', submitDate: '2026-03-06', deptHeadConfirmed: '已确认', contact: '0871-65000005', status: 'audited', auditResult: 'passed' },
    { id: 'app-006', planId: 'plan-001', positionName: '日语·专任教师', positionNameEn: 'Japanese Teacher', positionCode: 'T2026-D07-001', positionCategory: '教师岗', recruitUnit: '外语学院', campus: '校本部', bachelorPostType: 'C 类(普通本科专业)', positionGrade: '专业技术十一级', personnelType: '聘任制', education: '硕士研究生', degree: '硕士', undergradMajorCode: 'B050207', undergradMajorName: '日语', postgradMajorCode: 'A050200', postgradMajorName: '外国语言文学', minTitle: '不限', otherCondition: '', duty: '承担日语专业精读、听力课程教学。', qualification: '日语语言文学方向硕士及以上。', addReason: '日语专业教师退休1人,需补充。', currentTeacherCount: 24, hired2025Count: 0, targetTeacherCount: 25, student2023: 120, student2024: 130, student2025: 140, admittedNotOnboardCount: 0, plannedRetirees2027: 1, retireeNameList: '田佳', externalTeacherCount: 4, student2026: 145, expectedStudent2027: 150, annualPerCapitaWorkload: 462, collegeDevelopmentPlan: '日语专业稳定招生规模，向商务日语与跨境电商语言服务方向调整，压缩纯语言方向课程比重。', remarks: '招生规模收窄，暂缓新增编制。', deptHead: '郑海燕', headcount: 1, hrSuggestCount: 0, committeeApprovedCount: 0, submitter: '孙老师', submitDate: '2026-03-05', deptHeadConfirmed: '已确认', contact: '0871-65000006', status: 'audited', auditResult: 'rejected' },
    { id: 'app-007', planId: 'plan-001', positionName: '专职辅导员', positionNameEn: 'Student Counselor', positionCode: 'T2026-D13-001', positionCategory: '专职辅导员', recruitUnit: '马克思主义学院', campus: '校本部', bachelorPostType: '', positionGrade: '专业技术十二级', personnelType: '聘任制', education: '硕士研究生', degree: '硕士', undergradMajorCode: '', undergradMajorName: '', postgradMajorCode: '', postgradMajorName: '', minTitle: '不限', otherCondition: '中共党员,有学生工作经历', duty: '负责学生思想政治教育与日常管理。', qualification: '中共党员,硕士及以上学历,有学生工作经历。', addReason: '学生规模增长,辅导员配比不足。', currentTeacherCount: 8, hired2025Count: 1, targetTeacherCount: 11, student2023: 580, student2024: 620, student2025: 650, admittedNotOnboardCount: 1, plannedRetirees2027: 0, retireeNameList: '', externalTeacherCount: 0, student2026: 660, expectedStudent2027: 680, annualPerCapitaWorkload: 396, collegeDevelopmentPlan: '按照1:200配备专职辅导员，随学生规模增长同步补充队伍，加强心理健康与就业指导能力建设。', remarks: '须为中共党员。', deptHead: '马文博', headcount: 3, hrSuggestCount: 2, committeeApprovedCount: 2, submitter: '周老师', submitDate: '2026-03-04', deptHeadConfirmed: '已确认', contact: '0871-65000007', status: 'hr_review', auditResult: null },
    // === plan-002:2025秋季高层次人才引进(科研岗) ===
    { id: 'app-008', planId: 'plan-002', positionName: '人工智能·学科带头人', positionNameEn: 'AI Discipline Leader', positionCode: 'T2025-AI-001', positionCategory: '科研岗', recruitUnit: '人工智能学院', campus: '校本部', bachelorPostType: '', positionGrade: '专业技术四级', personnelType: '预聘长聘制', education: '博士研究生', degree: '博士', undergradMajorCode: '', undergradMajorName: '', postgradMajorCode: 'A081200', postgradMajorName: '计算机科学与技术', minTitle: '正高级', otherCondition: '长江学者或同层次人才', duty: '负责人工智能学科建设,带领团队申报国家级科研项目。', qualification: '人工智能方向博士,长江学者或同层次人才。', addReason: '人工智能学科建设需要学科带头人引领。', currentTeacherCount: 18, hired2025Count: 0, targetTeacherCount: 20, student2023: 90, student2024: 110, student2025: 130, admittedNotOnboardCount: 0, plannedRetirees2027: 0, retireeNameList: '', externalTeacherCount: 3, student2026: 140, expectedStudent2027: 160, annualPerCapitaWorkload: 380, collegeDevelopmentPlan: '人工智能学院处于建院起步期，重点引进学科带头人组建大模型与具身智能团队，五年内申报硕士点。', remarks: '引进层次须达长江学者或同层次人才。', deptHead: '吴承志', headcount: 1, hrSuggestCount: 1, committeeApprovedCount: 1, submitter: '吴老师', submitDate: '2025-09-15', deptHeadConfirmed: '已确认', contact: '0871-65000010', status: 'audited', auditResult: 'passed' },
    { id: 'app-009', planId: 'plan-002', positionName: '机器学习·研究员', positionNameEn: 'Machine Learning Researcher', positionCode: 'T2025-ME-001', positionCategory: '科研岗', recruitUnit: '机电工程学院', campus: '校本部', bachelorPostType: '', positionGrade: '专业技术七级', personnelType: '预聘长聘制', education: '博士研究生', degree: '博士', undergradMajorCode: '', undergradMajorName: '', postgradMajorCode: 'A081200', postgradMajorName: '计算机科学与技术', minTitle: '副高级', otherCondition: '有 CCF-A 论文', duty: '开展机器学习在智能制造领域应用研究。', qualification: '计算机、自动化相关方向博士,有 CCF-A 论文。', addReason: '智能制造方向科研力量不足,需补充高水平研究员。', currentTeacherCount: 86, hired2025Count: 2, targetTeacherCount: 92, student2023: 420, student2024: 450, student2025: 480, admittedNotOnboardCount: 1, plannedRetirees2027: 1, retireeNameList: '王志刚', externalTeacherCount: 9, student2026: 500, expectedStudent2027: 510, annualPerCapitaWorkload: 452, collegeDevelopmentPlan: '围绕智能制造场景开展机器学习应用研究，建设工业大数据实验室，补充高水平科研人员。', remarks: '须有 CCF-A 类论文发表。', deptHead: '刘兆丰', headcount: 2, hrSuggestCount: 2, committeeApprovedCount: 2, submitter: '郑老师', submitDate: '2025-09-20', deptHeadConfirmed: '已确认', contact: '0871-65000011', status: 'audited', auditResult: 'passed' },
    { id: 'app-010', planId: 'plan-002', positionName: '医学影像·研究员', positionNameEn: 'Medical Imaging Researcher', positionCode: 'T2025-MED-001', positionCategory: '科研岗', recruitUnit: '医学技术学院', campus: '校本部', bachelorPostType: '', positionGrade: '专业技术七级', personnelType: '聘任制', education: '博士研究生', degree: '博士', undergradMajorCode: '', undergradMajorName: '', postgradMajorCode: '', postgradMajorName: '生物医学工程', minTitle: '不限', otherCondition: '', duty: '开展医学影像 AI 辅助诊断研究。', qualification: '医学影像、生物医学工程方向博士。', addReason: '医学影像方向科研起步阶段,需补充研究力量。', currentTeacherCount: 32, hired2025Count: 1, targetTeacherCount: 34, student2023: 160, student2024: 180, student2025: 200, admittedNotOnboardCount: 0, plannedRetirees2027: 0, retireeNameList: '', externalTeacherCount: 3, student2026: 210, expectedStudent2027: 220, annualPerCapitaWorkload: 408, collegeDevelopmentPlan: '医学影像方向处于培育阶段，先以校企联合实验室积累成果，人才布局节奏放缓。', remarks: '本年度暂不新增科研岗位。', deptHead: '钱立群', headcount: 1, hrSuggestCount: 0, committeeApprovedCount: 0, submitter: '钱老师', submitDate: '2025-09-25', deptHeadConfirmed: '已确认', contact: '0871-65000012', status: 'audited', auditResult: 'rejected' },
    // === plan-003:2025暑期行政岗位招聘(行政岗) ===
    { id: 'app-011', planId: 'plan-003', positionName: '行政管理岗', positionNameEn: 'Administrative Manager', positionCode: 'T2025-ADM-001', positionCategory: '行政岗', recruitUnit: '校长办公室', campus: '校本部', bachelorPostType: '', positionGrade: '专业技术九级', personnelType: '聘任制', education: '硕士研究生', degree: '硕士', undergradMajorCode: '', undergradMajorName: '', postgradMajorCode: 'A120100', postgradMajorName: '管理科学与工程', minTitle: '不限', otherCondition: '有相关工作经验', duty: '负责校长办公室日常行政工作、公文起草与会议组织。', qualification: '公共管理、行政管理硕士,有相关工作经验。', addReason: '校办行政事务量增长,需补充管理人员。', currentTeacherCount: 24, hired2025Count: 1, targetTeacherCount: 26, student2023: 0, student2024: 0, student2025: 0, admittedNotOnboardCount: 1, plannedRetirees2027: 1, retireeNameList: '冯国栋', externalTeacherCount: 0, student2026: 0, expectedStudent2027: 0, annualPerCapitaWorkload: 0, collegeDevelopmentPlan: '行政管理岗按校办职能调整补充，重点加强公文与会务统筹能力。', remarks: '非教学岗，无师生比测算。', deptHead: '冯国栋', headcount: 1, hrSuggestCount: 1, committeeApprovedCount: 1, submitter: '冯老师', submitDate: '2025-06-10', deptHeadConfirmed: '已确认', contact: '0871-65000013', status: 'audited', auditResult: 'passed' },
    { id: 'app-012', planId: 'plan-003', positionName: '教务处·科员', positionNameEn: 'Academic Affairs Officer', positionCode: 'T2025-EDU-001', positionCategory: '行政岗', recruitUnit: '教务处', campus: '校本部', bachelorPostType: '', positionGrade: '专业技术十级', personnelType: '聘任制', education: '硕士研究生', degree: '硕士', undergradMajorCode: '', undergradMajorName: '', postgradMajorCode: '', postgradMajorName: '教育管理', minTitle: '不限', otherCondition: '', duty: '协助教务处开展本科教学运行管理工作。', qualification: '教育管理相关专业硕士。', addReason: '教务处工作量增加,需补充科员。', currentTeacherCount: 18, hired2025Count: 1, targetTeacherCount: 20, student2023: 0, student2024: 0, student2025: 0, admittedNotOnboardCount: 1, plannedRetirees2027: 0, retireeNameList: '', externalTeacherCount: 0, student2026: 0, expectedStudent2027: 0, annualPerCapitaWorkload: 0, collegeDevelopmentPlan: '教务处随本科教学运行规模增长补充管理力量，重点加强教学运行与学籍管理。', remarks: '非教学岗，无师生比测算。', deptHead: '许立新', headcount: 2, hrSuggestCount: 2, committeeApprovedCount: 2, submitter: '许老师', submitDate: '2025-06-12', deptHeadConfirmed: '已确认', contact: '0871-65000014', status: 'audited', auditResult: 'passed' },
    // === plan-007:2026春季行政管理人员招聘(行政岗) ===
    { id: 'app-013', planId: 'plan-007', positionName: '人事处·科员', positionNameEn: 'HR Officer', positionCode: 'T2026-HR-001', positionCategory: '行政岗', recruitUnit: '人事处', campus: '校本部', bachelorPostType: '', positionGrade: '专业技术十级', personnelType: '聘任制', education: '大学本科', degree: '学士', undergradMajorCode: 'B120201', undergradMajorName: '工商管理', postgradMajorCode: '', postgradMajorName: '', minTitle: '不限', otherCondition: '', duty: '负责教职工人事档案、招聘配套事务性工作。', qualification: '人力资源、行政管理方向本科及以上。', addReason: '人事处招聘季事务量激增,需补充配套人员。', currentTeacherCount: 12, hired2025Count: 1, targetTeacherCount: 14, student2023: 0, student2024: 0, student2025: 0, admittedNotOnboardCount: 0, plannedRetirees2027: 0, retireeNameList: '', externalTeacherCount: 0, student2026: 0, expectedStudent2027: 0, annualPerCapitaWorkload: 0, collegeDevelopmentPlan: '人事处招聘季事务量激增，需补充招聘配套人员保障流程运转。', remarks: '部门负责人签字待补。', deptHead: '何佩玲', headcount: 2, hrSuggestCount: 1, committeeApprovedCount: 1, submitter: '何老师', submitDate: '2026-04-05', deptHeadConfirmed: '待确认', contact: '0871-65000015', status: 'pending', auditResult: null },
    { id: 'app-014', planId: 'plan-007', positionName: '校办·秘书', positionNameEn: 'Office Secretary', positionCode: 'T2026-ADM-002', positionCategory: '行政岗', recruitUnit: '校长办公室', campus: '校本部', bachelorPostType: '', positionGrade: '专业技术十级', personnelType: '聘任制', education: '大学本科', degree: '学士', undergradMajorCode: '', undergradMajorName: '汉语言文学', postgradMajorCode: '', postgradMajorName: '', minTitle: '不限', otherCondition: '', duty: '协助校长办公室处理日常文书、会务与接待工作。', qualification: '汉语言、行政管理相关本科及以上。', addReason: '校办文书工作量增加,需补充秘书岗位。', currentTeacherCount: 24, hired2025Count: 1, targetTeacherCount: 26, student2023: 0, student2024: 0, student2025: 0, admittedNotOnboardCount: 1, plannedRetirees2027: 1, retireeNameList: '冯国栋', externalTeacherCount: 0, student2026: 0, expectedStudent2027: 0, annualPerCapitaWorkload: 0, collegeDevelopmentPlan: '校办文书与接待工作量增加，补充秘书岗位保障日常运转。', remarks: '非教学岗，无师生比测算。', deptHead: '冯国栋', headcount: 1, hrSuggestCount: 1, committeeApprovedCount: 1, submitter: '范老师', submitDate: '2026-04-06', deptHeadConfirmed: '已确认', contact: '0871-65000016', status: 'audited', auditResult: 'passed' },
    { id: 'app-015', planId: 'plan-007', positionName: '教务处·教学督导', positionNameEn: 'Teaching Supervisor', positionCode: 'T2026-EDU-002', positionCategory: '行政岗', recruitUnit: '教务处', campus: '校本部', bachelorPostType: '', positionGrade: '专业技术八级', personnelType: '聘任制', education: '硕士研究生', degree: '硕士', undergradMajorCode: '', undergradMajorName: '', postgradMajorCode: '', postgradMajorName: '课程与教学论', minTitle: '中级', otherCondition: '', duty: '负责本科课程教学质量监督与评估工作。', qualification: '教育学、课程与教学论方向硕士及以上。', addReason: '教学质量监督力量不足,需补充督导人员。', currentTeacherCount: 18, hired2025Count: 1, targetTeacherCount: 20, student2023: 0, student2024: 0, student2025: 0, admittedNotOnboardCount: 1, plannedRetirees2027: 0, retireeNameList: '', externalTeacherCount: 0, student2026: 0, expectedStudent2027: 0, annualPerCapitaWorkload: 0, collegeDevelopmentPlan: '教学质量监督力量不足，补充督导人员完善课程评价体系。', remarks: '', deptHead: '许立新', headcount: 1, hrSuggestCount: 1, committeeApprovedCount: 1, submitter: '许老师', submitDate: '2026-04-07', deptHeadConfirmed: '待确认', contact: '0871-65000017', status: 'pending', auditResult: null },
  ]

  // === 组织机构岗位库(院系申报岗位时默认带入职责) ===
  var ORG_POSITIONS = [
    { id: 'org-001', positionName: '通信工程·专任教师', positionCategory: '教师岗', duty: '承担通信工程、信号处理相关课程教学与毕业设计指导，参与重点实验室建设与科研项目申报。', qualification: '通信工程、信号处理方向博士，有较强科研能力。' },
    { id: 'org-002', positionName: '电磁场与微波技术·副教授', positionCategory: '教师岗', duty: '负责微波技术方向研究生培养，主持省部级以上科研项目，承担专业核心课程教学。', qualification: '电磁场与微波技术方向博士，主持过省部级以上项目。' },
    { id: 'org-003', positionName: '电子信息·讲师', positionCategory: '教师岗', duty: '承担电子信息类专业基础课程教学，指导学生实验与课程设计。', qualification: '电子信息方向硕士及以上，有工程实践经验。' },
    { id: 'org-004', positionName: '实验室技术员', positionCategory: '教辅岗', duty: '负责实验室设备维护与管理，协助开展实验教学与科研实验。', qualification: '电子信息、通信工程相关本科及以上，熟悉常用测试仪器。' },
    { id: 'org-005', positionName: '教学秘书', positionCategory: '行政岗', duty: '负责学院教学运行管理、排课排考、成绩管理等教务工作。', qualification: '本科及以上学历，熟悉教务管理系统，有教务工作经验者优先。' },
  ]

  // === 历史岗位库(dean/hr 引用历史岗位时选择) ===
  // recruitType: 招聘种类(校招/社招/高层次); positionStartDate/positionEndDate: 岗位起止时间(供过滤与表格展示)
  var HISTORICAL_POSITIONS = [
    { id: 'hp-001', positionName: '信号与信息处理·专任教师', positionCategory: '教师岗', recruitType: '高层次引进', recruitUnit: COLLEGE, sourcePlan: '2025秋季高层次人才引进', positionStartDate: '2025-09-01', positionEndDate: '2026-08-31', duty: '承担信号处理方向课程教学与科研。', qualification: '信号与信息处理方向博士。', contact: '0871-65000001' },
    { id: 'hp-002', positionName: '机械制造·副教授', positionCategory: '教师岗', recruitType: '高层次引进', recruitUnit: '机电工程学院', sourcePlan: '2025秋季高层次人才引进', positionStartDate: '2025-09-01', positionEndDate: '2026-08-31', duty: '承担机械制造课程教学,主持科研项目。', qualification: '机械制造及其自动化方向博士。', contact: '0871-65000003' },
    { id: 'hp-003', positionName: '行政管理岗', positionCategory: '行政岗', recruitType: '社会公开招聘', recruitUnit: '校长办公室', sourcePlan: '2025暑期行政岗位招聘', positionStartDate: '2025-07-15', positionEndDate: '2026-07-14', duty: '负责学校行政管理事务。', qualification: '公共管理、行政管理相关专业硕士。', contact: '0871-65000008' },
    { id: 'hp-004', positionName: '图书管理员', positionCategory: '教辅岗', recruitType: '社会公开招聘', recruitUnit: '图书馆', sourcePlan: '2025暑期行政岗位招聘', positionStartDate: '2025-07-15', positionEndDate: '2026-07-14', duty: '负责图书采编、流通管理。', qualification: '图书情报、信息管理相关本科及以上。', contact: '0871-65000009' },
    { id: 'hp-005', positionName: '人工智能·学科带头人', positionCategory: '科研岗', recruitType: '高层次引进', recruitUnit: '人工智能学院', sourcePlan: '2025秋季高层次人才引进', positionStartDate: '2025-09-01', positionEndDate: '2026-08-31', duty: '负责人工智能学科建设与团队指导。', qualification: '人工智能方向博士,长江学者或同层次人才。', contact: '0871-65000010' },
    { id: 'hp-006', positionName: '专职辅导员', positionCategory: '专职辅导员', recruitType: '校园招聘', recruitUnit: '学生工作部', sourcePlan: '', positionStartDate: '2026-08-15', positionEndDate: '2027-08-14', duty: '负责学生思想政治教育与日常管理。', qualification: '中共党员,硕士及以上学历。', contact: '0871-65000011' },
  ]

  // === 招聘助手分析(按岗位申请 id 索引,mock 多维分析) ===
  // conclusion: 建议招聘 | 建议缓招；confidence: 0~1
  // 四维度: gapHeadcount(缺口人数), studentTeacherRatio(生师比), retireOutflow3y(近3年退休), industryDemand(产业诉求)
  var AI_ANALYSIS = {
    'app-001': {
      conclusion: '建议招聘',
      confidence: 0.86,
      reason: '生师比 22:1 高于标准 18:1，近3年退休 4 人仅补 1 人，同类岗位缺口明显，产业对接需求强。',
      dimensions: {
        gapHeadcount: { label: '缺口人数', value: '6', unit: '人', status: 'warning' },
        studentTeacherRatio: { label: '生师比', value: '22:1', extra: '标准 18:1', status: 'danger' },
        retireOutflow3y: { label: '近3年退休', value: '4', unit: '人', status: 'warning' },
        industryDemand: { label: '产业诉求', value: '对接华为ICT学院，需通信工程专任教师', status: 'success' },
      }
    },
    'app-002': {
      conclusion: '建议招聘',
      confidence: 0.82,
      reason: '微波技术方向学科带头人退休，需补充学术骨干，产业合作项目持续增加。',
      dimensions: {
        gapHeadcount: { label: '缺口人数', value: '2', unit: '人', status: 'warning' },
        studentTeacherRatio: { label: '生师比', value: '19:1', extra: '标准 18:1', status: 'warning' },
        retireOutflow3y: { label: '近3年退休', value: '2', unit: '人', status: 'neutral' },
        industryDemand: { label: '产业诉求', value: '与中电科合作微波实验室，需学术骨干', status: 'success' },
      }
    },
    'app-003': {
      conclusion: '建议招聘',
      confidence: 0.78,
      reason: '智能制造产业升级，机电一体化岗位需求旺盛，生师比略高。',
      dimensions: {
        gapHeadcount: { label: '缺口人数', value: '3', unit: '人', status: 'warning' },
        studentTeacherRatio: { label: '生师比', value: '20:1', extra: '标准 18:1', status: 'warning' },
        retireOutflow3y: { label: '近3年退休', value: '1', unit: '人', status: 'neutral' },
        industryDemand: { label: '产业诉求', value: '区域智能制造产业升级，企业定制班需求', status: 'success' },
      }
    },
    'app-007': {
      conclusion: '建议缓招',
      confidence: 0.65,
      reason: '辅导员编制相对充足，建议结合下一年度学生规模变化再评估。',
      dimensions: {
        gapHeadcount: { label: '缺口人数', value: '1', unit: '人', status: 'neutral' },
        studentTeacherRatio: { label: '生师比', value: '180:1', extra: '标准 200:1', status: 'success' },
        retireOutflow3y: { label: '近3年退休', value: '0', unit: '人', status: 'neutral' },
        industryDemand: { label: '产业诉求', value: '暂无明确产业对接需求', status: 'neutral' },
      }
    },
    'app-008': {
      conclusion: '建议招聘',
      confidence: 0.91,
      reason: '人工智能学科列入"双一流"建设重点,学科带头人岗位长期空缺,需引进领军人才带动学科跃升。',
      dimensions: {
        gapHeadcount: { label: '缺口人数', value: '1', unit: '人', status: 'warning' },
        studentTeacherRatio: { label: '生师比', value: '24:1', extra: '标准 18:1', status: 'danger' },
        retireOutflow3y: { label: '近3年退休', value: '0', unit: '人', status: 'success' },
        industryDemand: { label: '产业诉求', value: '对接区域 AI 产业集群,需学科带头人', status: 'success' },
      }
    },
    'app-009': {
      conclusion: '建议招聘',
      confidence: 0.83,
      reason: '智能制造产教融合项目持续增加,机器学习算法岗企业需求旺盛,建议补充科研骨干。',
      dimensions: {
        gapHeadcount: { label: '缺口人数', value: '2', unit: '人', status: 'warning' },
        studentTeacherRatio: { label: '生师比', value: '20:1', extra: '标准 18:1', status: 'warning' },
        retireOutflow3y: { label: '近3年退休', value: '1', unit: '人', status: 'neutral' },
        industryDemand: { label: '产业诉求', value: '与龙头企业共建实验室,算法岗缺口大', status: 'success' },
      }
    },
    'app-013': {
      conclusion: '建议招聘',
      confidence: 0.74,
      reason: '人事处近三年退休 2 人未及时补充,招聘配套工作量持续上升,建议补充科员。',
      dimensions: {
        gapHeadcount: { label: '缺口人数', value: '2', unit: '人', status: 'warning' },
        studentTeacherRatio: { label: '人均负荷', value: '偏高', extra: '编岗比不足', status: 'warning' },
        retireOutflow3y: { label: '近3年退休', value: '2', unit: '人', status: 'warning' },
        industryDemand: { label: '业务诉求', value: '招聘高峰期事务性工作量大', status: 'success' },
      }
    },
    'app-015': {
      conclusion: '建议缓招',
      confidence: 0.68,
      reason: '教学督导岗位现有编制可覆盖,建议优先从校内遴选经验丰富的退休教师兼任。',
      dimensions: {
        gapHeadcount: { label: '缺口人数', value: '0', unit: '人', status: 'success' },
        studentTeacherRatio: { label: '人均负荷', value: '适中', extra: '1:80', status: 'success' },
        retireOutflow3y: { label: '近3年退休', value: '0', unit: '人', status: 'neutral' },
        industryDemand: { label: '业务诉求', value: '可由返聘退休教师补充', status: 'neutral' },
      }
    },
    default: {
      conclusion: '建议缓招',
      confidence: 0.72,
      reason: '当前编制与工作量基本匹配，建议结合下一年度招生计划再评估。',
      dimensions: {
        gapHeadcount: { label: '缺口人数', value: '1', unit: '人', status: 'neutral' },
        studentTeacherRatio: { label: '生师比', value: '17:1', extra: '标准 18:1', status: 'success' },
        retireOutflow3y: { label: '近3年退休', value: '1', unit: '人', status: 'neutral' },
        industryDemand: { label: '产业诉求', value: '暂无明确产业对接需求', status: 'neutral' },
      }
    }
  }

  // === 招聘岗位(单一真源) ===
  // status: pending 待发布 / published 已发布 / expired 已过期
  // 公开字段贯通 hr 视角与外网门户展示
  var POSITIONS = [
    { id: 'pos-001', title: '人工智能学院·专任教师', dept: '人工智能学院', type: '教学科研岗', positionCategory: '教师岗', plan: '2026春季招聘', planId: 'plan-001', recruitType: '高层次引进', headcount: 2, degree: '博士', publishStart: '2026-03-20 09:00:00', publishEnd: '2026-04-20', signupStart: '2026-03-20 09:00:00', signupEnd: '2026-04-20 18:00:00', status: 'published', applied: 128, requirement: '人工智能、机器学习方向，有 SCI 论文者优先' },
    { id: 'pos-002', title: '机电工程学院·副教授', dept: '机电工程学院', type: '教学科研岗', positionCategory: '教师岗', plan: '2026春季招聘', planId: 'plan-001', recruitType: '高层次引进', headcount: 1, degree: '博士', publishStart: '2026-03-20 09:00:00', publishEnd: '2026-04-20', signupStart: '2026-03-20 09:00:00', signupEnd: '2026-04-20 18:00:00', status: 'published', applied: 86, requirement: '机械制造及其自动化方向，主持过省部级以上项目' },
    { id: 'pos-003', title: '校长办公室·行政管理岗', dept: '校长办公室', type: '行政岗', positionCategory: '行政岗', plan: '2026春季招聘', planId: 'plan-001', recruitType: '社会公开招聘', headcount: 1, degree: '硕士', publishStart: '', publishEnd: '', status: 'pending', applied: 0, requirement: '公共管理、行政管理相关专业' },
    { id: 'pos-004', title: '外语学院·日语专任教师', dept: '外语学院', type: '教学科研岗', positionCategory: '教师岗', plan: '2026春季招聘', planId: 'plan-001', recruitType: '高层次引进', headcount: 1, degree: '硕士', publishStart: '', publishEnd: '', status: 'pending', applied: 0, requirement: '日语语言文学方向' },
    { id: 'pos-005', title: '图书馆·图书管理员', dept: '图书馆', type: '教辅岗', positionCategory: '教辅岗', plan: '2025秋季招聘', planId: 'plan-002', recruitType: '社会公开招聘', headcount: 2, degree: '本科', publishStart: '2025-10-20', publishEnd: '2025-11-20', status: 'expired', applied: 38, requirement: '图书情报、信息管理相关专业' },
    { id: 'pos-006', title: '信息中心·系统运维工程师', dept: '信息中心', type: '教辅岗位', positionCategory: '教辅岗', plan: '2025秋季招聘', planId: 'plan-002', recruitType: '社会公开招聘', headcount: 1, degree: '硕士', publishStart: '2025-10-20', publishEnd: '2025-11-20', status: 'expired', applied: 25, requirement: '熟悉 Linux、容器化技术，有运维经验' },
    { id: 'pos-007', title: '艺术设计学院·视觉传达教师', dept: '艺术设计学院', type: '教学科研岗', positionCategory: '教师岗', plan: '2025秋季招聘', planId: 'plan-002', recruitType: '高层次引进', headcount: 1, degree: '硕士', publishStart: '2025-10-20', publishEnd: '2025-11-20', status: 'expired', applied: 41, requirement: '视觉传达设计方向，有成熟作品集' },
    { id: 'pos-008', title: '经济管理学院·工商管理讲师', dept: '经济管理学院', type: '教学科研岗', positionCategory: '教师岗', plan: '2026春季招聘', planId: 'plan-001', recruitType: '高层次引进', headcount: 2, degree: '博士', publishStart: '2026-03-20 09:00:00', publishEnd: '2026-04-20', signupStart: '2026-03-20 09:00:00', signupEnd: '2026-04-20 18:00:00', status: 'published', applied: 12, requirement: '工商管理、市场营销方向' },
    { id: 'pos-009', title: '马克思主义学院·辅导员', dept: '马克思主义学院', type: '专职辅导员', positionCategory: '行政岗', plan: '2025暑期招聘', planId: 'plan-003', recruitType: '校园招聘', headcount: 3, degree: '硕士', publishStart: '2025-06-01', publishEnd: '2025-06-30', status: 'expired', applied: 72, requirement: '中共党员，有学生工作经历' },
    // 2026 秋季教学科研岗招聘（plan-004）岗位
    { id: 'pos-010', title: '人工智能学院·专任教师', dept: '人工智能学院', type: '教学科研岗', positionCategory: '教师岗', plan: '2026秋季教学科研岗招聘', planId: 'plan-004', recruitType: '高层次引进', headcount: 2, degree: '博士', publishStart: '2026-09-01 09:00:00', publishEnd: '2026-09-30', signupStart: '2026-09-01 09:00:00', signupEnd: '2026-09-30 18:00:00', status: 'published', applied: 0, requirement: '人工智能、机器学习方向，有 SCI 论文者优先' },
    { id: 'pos-011', title: '机电工程学院·副教授', dept: '机电工程学院', type: '教学科研岗', positionCategory: '教师岗', plan: '2026秋季教学科研岗招聘', planId: 'plan-004', recruitType: '高层次引进', headcount: 1, degree: '博士', publishStart: '2026-09-01 09:00:00', publishEnd: '2026-09-30', signupStart: '2026-09-01 09:00:00', signupEnd: '2026-09-30 18:00:00', status: 'published', applied: 0, requirement: '机械制造及其自动化方向，主持过省部级以上项目' },
    { id: 'pos-012', title: '经济管理学院·工商管理讲师', dept: '经济管理学院', type: '教学科研岗', positionCategory: '教师岗', plan: '2026秋季教学科研岗招聘', planId: 'plan-004', recruitType: '高层次引进', headcount: 2, degree: '博士', publishStart: '2026-09-01 09:00:00', publishEnd: '2026-09-30', signupStart: '2026-09-01 09:00:00', signupEnd: '2026-09-30 18:00:00', status: 'published', applied: 0, requirement: '工商管理、市场营销方向' },
    // 本院系岗位(dean 视角数据)
    { id: 'pos-d01', title: '电子与通信工程学院·专任教师', dept: COLLEGE, type: '教学科研岗', positionCategory: '教师岗', plan: '2026春季招聘', planId: 'plan-001', recruitType: '高层次引进', headcount: 2, degree: '博士', publishStart: '2026-03-20 09:00:00', publishEnd: '2026-04-20', signupStart: '2026-03-20 09:00:00', signupEnd: '2026-04-20 18:00:00', status: 'published', applied: 24, requirement: '通信工程、信号处理方向' },
    { id: 'pos-d02', title: '电子与通信工程学院·副教授', dept: COLLEGE, type: '教学科研岗', positionCategory: '教师岗', plan: '2026春季招聘', planId: 'plan-001', recruitType: '高层次引进', headcount: 1, degree: '博士', publishStart: '2026-03-20 09:00:00', publishEnd: '2026-04-20', signupStart: '2026-03-20 09:00:00', signupEnd: '2026-04-20 18:00:00', status: 'published', applied: 9, requirement: '电磁场与微波技术方向' },
  ]

  // === 候选人库(单一真源,贯通 talent-pool 与 position 报名详情) ===
  // status: applied 已投递 / qualifying 资格审查中 / passed 已通过 / hired 已录用
  // contactMasked: 脱敏联系方式(院系可见);contactFull: 完整联系方式(需人事处授权)
  var CANDIDATES = [
    { id: 'r-001', name: '张三', gender: '男', age: 28, degree: '博士', school: '清华大学', major: '计算机科学与技术', positionId: 'pos-001', position: '人工智能学院·专任教师', status: 'applied', submitDate: '2026-03-08', contactMasked: { email: 'z***3@xx.com', phone: '138****1234' }, contactFull: { email: 'zhangsan@xx.com', phone: '13812341234' } },
    { id: 'r-002', name: '李四', gender: '女', age: 26, degree: '硕士', school: '北京大学', major: '机械工程', positionId: 'pos-002', position: '机电工程学院·副教授', status: 'applied', submitDate: '2026-03-07', contactMasked: { email: 'l***4@xx.com', phone: '139****5678' }, contactFull: { email: 'lisi@xx.com', phone: '13956785678' } },
    { id: 'r-003', name: '王五', gender: '男', age: 32, degree: '博士', school: '浙江大学', major: '工商管理', positionId: 'pos-008', position: '经济管理学院·工商管理讲师', status: 'passed', submitDate: '2026-03-06', contactMasked: { email: 'w***5@xx.com', phone: '137****9012' }, contactFull: { email: 'wangwu@xx.com', phone: '13790129012' } },
    { id: 'r-004', name: '赵六', gender: '女', age: 29, degree: '硕士', school: '复旦大学', major: '日语语言文学', positionId: 'pos-004', position: '外语学院·日语专任教师', status: 'passed', submitDate: '2026-03-05', contactMasked: { email: 'z***6@xx.com', phone: '136****3456' }, contactFull: { email: 'zhaoliu@xx.com', phone: '13634563456' } },
    { id: 'r-005', name: '孙七', gender: '男', age: 35, degree: '博士', school: '上海交通大学', major: '艺术设计', positionId: 'pos-007', position: '艺术设计学院·视觉传达教师', status: 'hired', submitDate: '2026-03-04', contactMasked: { email: 's***7@xx.com', phone: '135****7890' }, contactFull: { email: 'sunqi@xx.com', phone: '13578907890' } },
    // 本院系岗位的投递候选人(dean 可见)
    { id: 'r-d01', name: '周毅', gender: '男', age: 27, degree: '博士', school: '清华大学', major: '通信工程', positionId: 'pos-d01', position: '电子与通信工程学院·专任教师', status: 'applied', submitDate: '2026-03-08', contactMasked: { email: 'z***i@xx.com', phone: '138****2103' }, contactFull: { email: 'zhouyi@xx.com', phone: '13821032103' } },
    { id: 'r-d02', name: '吴敏', gender: '女', age: 29, degree: '博士', school: '上海交通大学', major: '信号与信息处理', positionId: 'pos-d01', position: '电子与通信工程学院·专任教师', status: 'qualifying', submitDate: '2026-03-09', contactMasked: { email: 'w***n@xx.com', phone: '139****5178' }, contactFull: { email: 'wumin@xx.com', phone: '13951785178' } },
    { id: 'r-d03', name: '郑浩', gender: '男', age: 31, degree: '博士', school: '浙江大学', major: '电磁场与微波技术', positionId: 'pos-d02', position: '电子与通信工程学院·副教授', status: 'passed', submitDate: '2026-03-06', contactMasked: { email: 'z***o@xx.com', phone: '137****9012' }, contactFull: { email: 'zhenghao@xx.com', phone: '13790129012' } },
    { id: 'r-d04', name: '冯雪', gender: '女', age: 26, degree: '硕士', school: '复旦大学', major: '通信工程', positionId: 'pos-d01', position: '电子与通信工程学院·专任教师', status: 'hired', submitDate: '2026-03-04', contactMasked: { email: 'f***e@xx.com', phone: '136****3456' }, contactFull: { email: 'fengxue@xx.com', phone: '13634563456' } },
  ]

  // === 高层次人才库(单一真源:hr/dean talent-pool 共用) ===
  // 两层模型:主记录一人一条(查重合并后唯一);sources 来源记录一人多条(合并时全部保留)。
  // status: active 储备中 / hired 已引进(转入教职工基本信息后保留留痕)
  // follows/tags 均带 college,院系之间互相隔离,人事处可见全部。
  var TALENT_SOURCE_CHANNELS = ['招聘系统落选回流', '主动投递', '招聘会', '教授推荐', '猎头推荐']
  var TALENT_TAG_OPTIONS = ['重点跟进', '待观察', '已婉拒']
  var TALENTS = [
    {
      id: 'tal-001', name: '陈立群', gender: '男', age: 34, degree: '博士', school: '东南大学', major: '通信与信息系统', intent: '通信工程·专任教师', phone: '13802201001', email: 'chenlq@xx.com', status: 'active',
      birth: '1992-05', nation: '汉族', marriage: '已婚', idCard: '320102199205******', nativePlace: '江苏南京', residence: '江苏南京', politics: '中共党员', foreignLanguage: '英语六级(CET-6)',
      education: [
        { level: '本科', school: '东南大学', major: '信息工程', graduateDate: '2014-06', degree: '工学学士' },
        { level: '博士(硕博连读)', school: '东南大学', major: '通信与信息系统', graduateDate: '2020-06', degree: '工学博士' },
      ],
      spouseName: '李文婧', spouseBirth: '1993-08', spouseResidence: '深圳市南山区', spouseNation: '汉族', spouseNative: '江苏苏州', spouseWorkUnit: '深圳市某三甲医院(主治医师)',
      researchList: [
        { category: 'SCI一区/CCF-A论文', count: '18篇', remark: '近五年12篇,一作/通讯10篇' },
        { category: '主持国家级项目', count: '3项', remark: '优青/面上/重点研发课题各1' },
        { category: '授权发明专利', count: '6件', remark: '2件已产业化转化' },
      ],
      profile: {
        titles: ['国家优青'],
        metrics: [{ label: 'SCI一区/CCF-A论文', value: '18篇' }, { label: '主持国家级项目', value: '3项' }, { label: '授权发明专利', value: '6件' }],
        achievements: [
          { year: '2025', text: '入选国家优秀青年科学基金项目' },
          { year: '2024', text: '主持国家重点研发计划课题(智能通信方向)' },
          { year: '2023', text: 'IEEE通信学会最佳论文奖' },
        ],
        highlights: [
          '国家级青年人才称号获得者,通信信号处理方向近五年SCI一区12篇,学术水平处于同龄段第一梯队。',
          '主持国自然项目3项,研究方向与本校华为ICT产教融合基地、微波重点实验室规划高度契合。',
          '34岁处于学术上升期,引进后可作为通信工程学科带头人梯队核心培养。',
        ],
      },
      sources: [{ channel: '教授推荐', college: COLLEGE, date: '2026-06-05', operator: '王老师', attachment: '陈立群-简历.pdf' }],
      follows: [
        { college: COLLEGE, date: '2026-06-12', operator: '王老师', content: '电话初步沟通,本人有意向来深发展,关注科研启动经费与实验室条件。' },
        { college: COLLEGE, date: '2026-07-02', operator: '王老师', content: '邀请到校交流,已参观重点实验室,拟安排与院长面谈。' },
      ],
      tags: [{ college: COLLEGE, label: '重点跟进' }],
    },
    {
      id: 'tal-002', name: '苏婉晴', gender: '女', age: 29, degree: '博士', school: '华中科技大学', major: '信息与通信工程', intent: '通信工程·专任教师', phone: '13802201002', email: 'suwq@xx.com', status: 'active',
      birth: '1997-02', nation: '汉族', marriage: '未婚', idCard: '420106199702******', nativePlace: '湖北武汉', residence: '湖北武汉', politics: '共青团员', foreignLanguage: '英语六级 / 雅思6.5',
      education: [
        { level: '本科', school: '武汉理工大学', major: '通信工程', graduateDate: '2019-06', degree: '工学学士' },
        { level: '博士(直博)', school: '华中科技大学', major: '信息与通信工程', graduateDate: '2025-06', degree: '工学博士' },
      ],
      researchList: [
        { category: 'CCF-A/SCI论文', count: '8篇', remark: '博士期间CCF-A 3篇' },
        { category: '主持省部级项目', count: '1项', remark: '省自然科学基金青年项目' },
        { category: '学术奖励', count: '2项', remark: '含省优秀博士学位论文' },
      ],
      profile: {
        titles: [],
        metrics: [{ label: 'CCF-A/SCI论文', value: '8篇' }, { label: '主持省部级项目', value: '1项' }, { label: '学术奖励', value: '2项' }],
        achievements: [
          { year: '2025', text: '湖北省优秀博士学位论文' },
          { year: '2024', text: '主持省自然科学基金青年项目' },
        ],
        highlights: [
          '2026春季招聘综合成绩位列该岗第2,仅因名额限制落选,评委一致评价科研潜力突出。',
          '博士期间CCF-A论文3篇,研究方向与本院信息与通信工程主干学科完全对口。',
          '年轻且有明确留深意向,引进成本低,适合作为青年学术骨干储备。',
        ],
      },
      sources: [{ channel: '招聘系统落选回流', college: COLLEGE, date: '2026-05-10', operator: '王老师', attachment: '苏婉晴-简历.pdf' }],
      follows: [{ college: COLLEGE, date: '2026-05-20', operator: '王老师', content: '2026春季招聘面试环节落选,评委评价科研潜力好,建议下一批次重点联系。' }],
      tags: [{ college: COLLEGE, label: '待观察' }],
    },
    {
      id: 'tal-003', name: '高翔', gender: '男', age: 38, degree: '博士', school: '北京邮电大学', major: '电磁场与微波技术', intent: '微波技术·学术骨干', phone: '13802201003', email: 'gaoxiang@xx.com', status: 'active',
      birth: '1988-09', nation: '汉族', marriage: '已婚', idCard: '130104198809******', nativePlace: '河北石家庄', residence: '北京市海淀区', politics: '中共党员', foreignLanguage: '英语六级(CET-6)',
      education: [
        { level: '本科', school: '西安电子科技大学', major: '电子信息工程', graduateDate: '2010-06', degree: '工学学士' },
        { level: '硕士', school: '北京邮电大学', major: '电磁场与微波技术', graduateDate: '2013-06', degree: '工学硕士' },
        { level: '博士', school: '北京邮电大学', major: '电磁场与微波技术', graduateDate: '2016-06', degree: '工学博士' },
      ],
      spouseName: '刘倩', spouseBirth: '1989-04', spouseResidence: '北京市海淀区', spouseNation: '汉族', spouseNative: '河北保定', spouseWorkUnit: '北京某建筑设计院(工程师)',
      researchList: [
        { category: 'SCI论文', count: '32篇', remark: '毫米波方向为主' },
        { category: '主持国自然项目', count: '2项', remark: '面上+青年' },
        { category: '授权发明专利', count: '9件', remark: '3件与中电科联合申请' },
      ],
      profile: {
        titles: ['广东省杰青'],
        metrics: [{ label: 'SCI论文', value: '32篇' }, { label: '主持国自然项目', value: '2项' }, { label: '授权发明专利', value: '9件' }],
        achievements: [
          { year: '2024', text: '入选广东省杰出青年基金项目' },
          { year: '2023', text: '主持国家自然科学基金面上项目(毫米波方向)' },
          { year: '2022', text: '中国电子学会科学技术奖二等奖' },
        ],
        highlights: [
          '省级人才称号,毫米波/微波检测方向兼具学术与工程能力,电通、机电两院均有用武之地。',
          '本院微波技术方向学科带头人今年退休、骨干断档,引进可直接补位。',
          '与中电科、华为有产业合作基础,契合学校产教融合定位。',
        ],
      },
      sources: [
        { channel: '猎头推荐', college: COLLEGE, date: '2026-04-18', operator: '王老师', attachment: '高翔-简历.pdf' },
        { channel: '招聘会', college: '机电工程学院', date: '2026-05-23', operator: '李老师', attachment: '高翔-简历(招聘会).pdf' },
      ],
      follows: [
        { college: COLLEGE, date: '2026-04-25', operator: '王老师', content: '视频面谈一次,主持过 2 项国家自然科学基金,意向明确但待遇期望较高。' },
        { college: '机电工程学院', date: '2026-06-01', operator: '李老师', content: '招聘会现场交流,对智能制造方向的微波检测应用有兴趣。' },
      ],
      tags: [{ college: COLLEGE, label: '重点跟进' }, { college: '机电工程学院', label: '待观察' }],
    },
    {
      id: 'tal-004', name: '林静怡', gender: '女', age: 31, degree: '博士', school: '中山大学', major: '电子科学与技术', intent: '电子信息·专任教师', phone: '13802201004', email: 'linjy@xx.com', status: 'hired',
      birth: '1995-01', nation: '汉族', marriage: '已婚', idCard: '440104199501******', nativePlace: '广东广州', residence: '深圳市福田区', politics: '中共党员', foreignLanguage: '英语六级(CET-6)',
      education: [
        { level: '本科', school: '华南理工大学', major: '电子科学与技术', graduateDate: '2016-06', degree: '工学学士' },
        { level: '博士', school: '中山大学', major: '电子科学与技术', graduateDate: '2022-06', degree: '工学博士' },
      ],
      spouseName: '周子昂', spouseBirth: '1994-11', spouseResidence: '深圳市福田区', spouseNation: '汉族', spouseNative: '广东汕头', spouseWorkUnit: '深圳某科技公司(算法工程师)',
      researchList: [
        { category: 'SCI论文', count: '11篇', remark: '传感器方向' },
        { category: '主持省部级项目', count: '2项', remark: '省自然面上等' },
        { category: '授权发明专利', count: '3件', remark: '' },
      ],
      profile: {
        titles: [],
        metrics: [{ label: 'SCI论文', value: '11篇' }, { label: '主持省部级项目', value: '2项' }, { label: '授权发明专利', value: '3件' }],
        achievements: [
          { year: '2025', text: '广东省自然科学基金面上项目负责人' },
          { year: '2024', text: 'IEEE Sensors Journal 优秀审稿人' },
        ],
        highlights: [
          '电子科学与技术方向青年骨干,博士后出站即具备独立建组能力。',
          '面谈与试讲评价优秀,学院引进评估全票通过(已于2026-06入职)。',
        ],
      },
      sources: [{ channel: '主动投递', college: COLLEGE, date: '2026-03-02', operator: '王老师', attachment: '林静怡-简历.pdf' }],
      follows: [
        { college: COLLEGE, date: '2026-03-15', operator: '王老师', content: '面谈顺利,学院评估通过,报人事处走引进审批。' },
        { college: COLLEGE, date: '2026-06-28', operator: '人事处', content: '引进审批通过,已转入教职工基本信息。' },
      ],
      tags: [],
    },
    {
      id: 'tal-005', name: '何志远', gender: '男', age: 27, degree: '硕士', school: '深圳大学', major: '电子信息', intent: '实验室技术员', phone: '13802201005', email: 'hezy@xx.com', status: 'active',
      birth: '1999-03', nation: '汉族', marriage: '未婚', idCard: '441402199903******', nativePlace: '广东梅州', residence: '深圳市南山区', politics: '共青团员', foreignLanguage: '英语四级(CET-4)',
      education: [
        { level: '本科', school: '广东工业大学', major: '电子信息工程', graduateDate: '2021-06', degree: '工学学士' },
        { level: '硕士', school: '深圳大学', major: '电子信息', graduateDate: '2024-06', degree: '工程硕士' },
      ],
      researchList: [
        { category: '职业技能奖项', count: '2项', remark: '含电子设计竞赛省一等奖' },
        { category: '参与横向项目', count: '4项', remark: '实验平台建设为主' },
        { category: '软件著作权', count: '3项', remark: '' },
      ],
      profile: {
        titles: [],
        metrics: [{ label: '职业技能奖项', value: '2项' }, { label: '参与横向项目', value: '4项' }, { label: '软件著作权', value: '3项' }],
        achievements: [
          { year: '2025', text: '全国大学生电子设计竞赛广东赛区一等奖(研究生组)' },
          { year: '2024', text: '参与深圳市重点实验室平台建设项目' },
        ],
        highlights: [
          '熟悉矢量网络分析仪等高频测试设备,可直接承担微波实验室日常运维与实验教学支持。',
          '本地生源、到岗意愿强;实验技术岗长期招聘困难,合适人选难得。',
        ],
      },
      sources: [{ channel: '招聘会', college: COLLEGE, date: '2026-07-08', operator: '王老师', attachment: '何志远-简历.pdf' }],
      follows: [],
      tags: [{ college: COLLEGE, label: '待观察' }],
    },
    {
      id: 'tal-006', name: '王慧', gender: '女', age: 35, degree: '博士', school: '华南理工大学', major: '机械工程', intent: '机械制造·副教授', phone: '13802201006', email: 'wanghui@xx.com', status: 'active',
      birth: '1991-07', nation: '汉族', marriage: '已婚', idCard: '440604199107******', nativePlace: '广东佛山', residence: '广州市天河区', politics: '中共党员', foreignLanguage: '英语六级(CET-6)',
      education: [
        { level: '本科', school: '华中科技大学', major: '机械设计制造及其自动化', graduateDate: '2013-06', degree: '工学学士' },
        { level: '博士(硕博连读)', school: '华南理工大学', major: '机械工程', graduateDate: '2019-06', degree: '工学博士' },
      ],
      spouseName: '陈骁', spouseBirth: '1990-12', spouseResidence: '广州市天河区', spouseNation: '汉族', spouseNative: '广东湛江', spouseWorkUnit: '广州某高校(讲师)',
      researchList: [
        { category: 'CCF-A/SCI论文', count: '15篇', remark: '智能装备方向' },
        { category: '主持国家级项目', count: '2项', remark: '国自然青年+面上' },
        { category: '授权发明专利', count: '7件', remark: '2件已转让企业' },
      ],
      profile: {
        titles: ['广东省青年拔尖人才'],
        metrics: [{ label: 'CCF-A/SCI论文', value: '15篇' }, { label: '主持国家级项目', value: '2项' }, { label: '授权发明专利', value: '7件' }],
        achievements: [
          { year: '2025', text: '入选广东省青年拔尖人才计划' },
          { year: '2023', text: '主持国家自然科学基金青年、面上项目各1项' },
          { year: '2022', text: '机械工业科学技术奖二等奖' },
        ],
        highlights: [
          '省级人才称号,智能装备方向近五年CCF-A论文3篇,院士团队导师力荐。',
          '智能制造专业群扩招后生师比22:1,师资缺口明确,研究方向精准匹配。',
          '有企业联合实验室工作经历,可带横向项目反哺实践教学。',
        ],
      },
      sources: [{ channel: '教授推荐', college: '机电工程学院', date: '2026-06-20', operator: '李老师', attachment: '王慧-简历.pdf' }],
      follows: [{ college: '机电工程学院', date: '2026-06-27', operator: '李老师', content: '导师推荐,近五年 CCF-A 论文 3 篇,已约本月底到校交流。' }],
      tags: [{ college: '机电工程学院', label: '重点跟进' }],
    },
    {
      id: 'tal-007', name: '张启明', gender: '男', age: 40, degree: '博士', school: '天津大学', major: '智能制造工程', intent: '智能制造·学科带头人', phone: '13802201007', email: 'zhangqm@xx.com', status: 'active',
      birth: '1986-10', nation: '汉族', marriage: '已婚', idCard: '370602198610******', nativePlace: '山东烟台', residence: '天津市南开区', politics: '中共党员', foreignLanguage: '英语六级(CET-6)',
      education: [
        { level: '本科', school: '山东大学', major: '机械工程', graduateDate: '2008-06', degree: '工学学士' },
        { level: '硕士', school: '天津大学', major: '机械制造及其自动化', graduateDate: '2011-06', degree: '工学硕士' },
        { level: '博士(在职)', school: '天津大学', major: '智能制造工程', graduateDate: '2016-06', degree: '工学博士' },
      ],
      spouseName: '孙梅', spouseBirth: '1987-05', spouseResidence: '天津市南开区', spouseNation: '汉族', spouseNative: '山东青岛', spouseWorkUnit: '天津某中学(教师)',
      researchList: [
        { category: '主持型号/重点项目', count: '5项', remark: '央企智能产线方向' },
        { category: '授权发明专利', count: '21件', remark: '8件已实施' },
        { category: '主编行业标准', count: '2项', remark: '智能制造领域' },
      ],
      profile: {
        titles: [],
        metrics: [{ label: '主持型号/重点项目', value: '5项' }, { label: '授权发明专利', value: '21件' }, { label: '主编行业标准', value: '2项' }],
        achievements: [
          { year: '2023', text: '国家科学技术进步奖二等奖(排名第4)' },
          { year: '2022', text: '主持央企智能产线重大技术改造项目' },
        ],
        highlights: [
          '央企研究院总工程师,重大工程实践能力是高校师资中最稀缺的一类。',
          '职业本科强调"双师型"教师,其产业背景可直接支撑现场工程师培养项目。',
          '自带行业资源与真实项目案例,可牵头共建产业学院。',
        ],
      },
      sources: [{ channel: '猎头推荐', college: '机电工程学院', date: '2026-05-06', operator: '李老师', attachment: '张启明-简历.pdf' }],
      follows: [{ college: '机电工程学院', date: '2026-05-18', operator: '李老师', content: '现任某央企研究院总工,有回高校意向,关注团队编制与研究生名额。' }],
      tags: [{ college: '机电工程学院', label: '重点跟进' }],
    },
    {
      id: 'tal-008', name: '刘之夏', gender: '女', age: 30, degree: '硕士', school: '中国美术学院', major: '视觉传达设计', intent: '视觉传达·教师', phone: '13802201008', email: 'liuzx@xx.com', status: 'active',
      birth: '1996-04', nation: '汉族', marriage: '未婚', idCard: '330106199604******', nativePlace: '浙江宁波', residence: '杭州市西湖区', politics: '群众', foreignLanguage: '英语六级(CET-6)',
      education: [
        { level: '本科', school: '中国美术学院', major: '视觉传达设计', graduateDate: '2018-06', degree: '艺术学学士' },
        { level: '硕士', school: '中国美术学院', major: '视觉传达设计', graduateDate: '2021-06', degree: '艺术硕士' },
      ],
      researchList: [
        { category: '国内外设计奖项', count: '5项', remark: '含德国红点奖' },
        { category: '商业项目案例', count: '20+', remark: '品牌全案为主' },
        { category: '个展/联展', count: '3次', remark: '' },
      ],
      profile: {
        titles: [],
        metrics: [{ label: '国内外设计奖项', value: '5项' }, { label: '商业项目案例', value: '20+' }, { label: '个展/联展', value: '3次' }],
        achievements: [
          { year: '2024', text: '德国红点设计奖(品牌传达类)' },
          { year: '2023', text: '深圳环球设计大奖入围' },
        ],
        highlights: [
          '红点奖获得者,作品集成熟,行业一线经验丰富。',
          '视觉传达专业实践型师资紧缺,其商业案例可直接转化为实训课程。',
        ],
      },
      sources: [{ channel: '招聘会', college: '艺术设计学院', date: '2026-04-12', operator: '陈老师', attachment: '刘之夏-简历.pdf' }],
      follows: [],
      tags: [],
    },
    {
      id: 'tal-009', name: '黄绍钧', gender: '男', age: 36, degree: '博士', school: '厦门大学', major: '工商管理', intent: '工商管理·讲师', phone: '13802201009', email: 'huangsj@xx.com', status: 'active',
      birth: '1990-08', nation: '汉族', marriage: '已婚', idCard: '350583199008******', nativePlace: '福建泉州', residence: '厦门市思明区', politics: '中共党员', foreignLanguage: '英语六级(CET-6)',
      education: [
        { level: '本科', school: '福州大学', major: '工商管理', graduateDate: '2012-06', degree: '管理学学士' },
        { level: '硕士', school: '厦门大学', major: '企业管理', graduateDate: '2015-06', degree: '管理学硕士' },
        { level: '博士', school: '厦门大学', major: '工商管理', graduateDate: '2019-06', degree: '管理学博士' },
      ],
      spouseName: '林悦然', spouseBirth: '1991-03', spouseResidence: '厦门市思明区', spouseNation: '汉族', spouseNative: '福建漳州', spouseWorkUnit: '厦门某银行(客户经理)',
      researchList: [
        { category: 'CSSCI论文', count: '9篇', remark: '数字化转型方向' },
        { category: '主持国家社科项目', count: '1项', remark: '青年项目在研' },
        { category: '企业咨询案例', count: '12个', remark: '1个入选全国百优案例' },
      ],
      profile: {
        titles: [],
        metrics: [{ label: 'CSSCI论文', value: '9篇' }, { label: '主持国家社科项目', value: '1项' }, { label: '企业咨询案例', value: '12个' }],
        achievements: [
          { year: '2024', text: '主持国家社科基金青年项目(企业数字化转型方向)' },
          { year: '2023', text: '案例入选全国百优管理案例' },
        ],
        highlights: [
          '春季批次综合排名第3,仅因岗位名额落选,基本功扎实。',
          '国家社科基金在研,可补齐经管学院国家级项目短板。',
          '有企业咨询实务经验,契合应用型商科办学定位。',
        ],
      },
      sources: [{ channel: '招聘系统落选回流', college: '经济管理学院', date: '2026-04-28', operator: '赵老师', attachment: '黄绍钧-简历.pdf' }],
      follows: [{ college: '经济管理学院', date: '2026-05-09', operator: '赵老师', content: '春季批次因岗位数量限制未录用,综合成绩排名第 3,值得储备。' }],
      tags: [{ college: '经济管理学院', label: '待观察' }],
    },
    {
      id: 'tal-010', name: '郑晓岚', gender: '女', age: 32, degree: '博士', school: '中南大学', major: '生物医学工程', intent: '医学影像·研究员', phone: '13802201010', email: 'zhengxl@xx.com', status: 'active',
      birth: '1994-06', nation: '汉族', marriage: '已婚', idCard: '430104199406******', nativePlace: '湖南长沙', residence: '长沙市岳麓区', politics: '中共党员', foreignLanguage: '英语六级(CET-6)',
      education: [
        { level: '本科', school: '中南大学', major: '生物医学工程', graduateDate: '2016-06', degree: '工学学士' },
        { level: '博士(硕博连读)', school: '中南大学', major: '生物医学工程', graduateDate: '2022-06', degree: '工学博士' },
      ],
      spouseName: '何宇', spouseBirth: '1993-09', spouseResidence: '长沙市岳麓区', spouseNation: '汉族', spouseNative: '湖南株洲', spouseWorkUnit: '长沙某三甲医院(放射科医师)',
      researchList: [
        { category: 'SCI论文', count: '16篇', remark: '近三年一区6篇' },
        { category: '主持国家级项目', count: '1项', remark: '国自然青年在研' },
        { category: '授权发明专利', count: '4件', remark: '医学影像AI方向' },
      ],
      profile: {
        titles: [],
        metrics: [{ label: 'SCI论文', value: '16篇' }, { label: '主持国家级项目', value: '1项' }, { label: '授权发明专利', value: '4件' }],
        achievements: [
          { year: '2025', text: '主持国家自然科学基金青年项目(医学影像AI方向)' },
          { year: '2024', text: '湖南省优秀博士后' },
        ],
        highlights: [
          '医学影像AI方向与学院申报中的新专业方向一致,属先导性师资布局。',
          '国自然青年项目在研,近三年SCI一区6篇,学术上升势头明显。',
          '主动投递、意向明确,沟通与引进成本低。',
        ],
      },
      sources: [{ channel: '主动投递', college: '医学技术学院', date: '2026-06-15', operator: '钱老师', attachment: '郑晓岚-简历.pdf' }],
      follows: [{ college: '医学技术学院', date: '2026-06-22', operator: '钱老师', content: '主动来信咨询医学影像 AI 方向,已回复并索取代表作。' }],
      tags: [{ college: '医学技术学院', label: '重点跟进' }],
    },
    {
      id: 'tal-011', name: '宋雨桐', gender: '女', age: 28, degree: '硕士', school: '广东外语外贸大学', major: '日语语言文学', intent: '日语·专任教师', phone: '13802201011', email: 'songyt@xx.com', status: 'active',
      birth: '1998-01', nation: '汉族', marriage: '未婚', idCard: '445102199801******', nativePlace: '广东潮州', residence: '广州市白云区', politics: '共青团员', foreignLanguage: '日语N1 / 英语六级',
      education: [
        { level: '本科', school: '广东外语外贸大学', major: '日语', graduateDate: '2020-06', degree: '文学学士' },
        { level: '硕士', school: '广东外语外贸大学', major: '日语语言文学', graduateDate: '2023-06', degree: '文学硕士' },
      ],
      researchList: [
        { category: '教学竞赛奖', count: '1项', remark: '省外语微课大赛一等奖' },
        { category: '出版译著', count: '2部', remark: '' },
        { category: '海外研修', count: '1年', remark: '日本交换研修' },
      ],
      profile: {
        titles: [],
        metrics: [{ label: '教学竞赛奖', value: '1项' }, { label: '出版译著', value: '2部' }, { label: '海外研修', value: '1年' }],
        achievements: [
          { year: '2025', text: '广东省外语微课大赛一等奖' },
        ],
        highlights: [
          '教学基本功扎实,曾获省级教学竞赛奖(注:已接受其他高校offer,暂缓跟进)。',
        ],
      },
      sources: [{ channel: '招聘系统落选回流', college: '外语学院', date: '2026-02-26', operator: '孙老师', attachment: '宋雨桐-简历.pdf' }],
      follows: [{ college: '外语学院', date: '2026-03-05', operator: '孙老师', content: '联系后表示已接受其他高校 offer,暂不考虑。' }],
      tags: [{ college: '外语学院', label: '已婉拒' }],
    },
    {
      id: 'tal-012', name: '罗一凡', gender: '男', age: 33, degree: '博士', school: '哈尔滨工业大学', major: '信号与信息处理', intent: '信号处理·专任教师', phone: '13802201012', email: 'luoyf@xx.com', status: 'active',
      birth: '1993-02', nation: '汉族', marriage: '已婚', idCard: '230103199302******', nativePlace: '湖北襄阳', residence: '哈尔滨市南岗区', politics: '中共党员', foreignLanguage: '英语六级(CET-6)',
      education: [
        { level: '本科', school: '哈尔滨工业大学', major: '电子信息工程', graduateDate: '2015-06', degree: '工学学士' },
        { level: '博士(硕博连读)', school: '哈尔滨工业大学', major: '信息与通信工程', graduateDate: '2021-06', degree: '工学博士' },
      ],
      spouseName: '田甜', spouseBirth: '1994-07', spouseResidence: '深圳市宝安区', spouseNation: '汉族', spouseNative: '湖北武汉', spouseWorkUnit: '深圳某国企(会计)',
      researchList: [
        { category: 'SCI/EI论文', count: '14篇', remark: '信号处理方向' },
        { category: '参与型号项目', count: '3项', remark: '航天院所在研' },
        { category: '授权发明专利', count: '5件', remark: '' },
      ],
      profile: {
        titles: [],
        metrics: [{ label: 'SCI/EI论文', value: '14篇' }, { label: '参与型号项目', value: '3项' }, { label: '授权发明专利', value: '5件' }],
        achievements: [
          { year: '2024', text: '航天科技集团技术创新奖' },
          { year: '2023', text: '参与某型号信号处理分系统研制' },
        ],
        highlights: [
          '航天院所工程背景+哈工大学术训练,信号处理方向"双师型"潜在人选。',
          '刚入库、待学院初评,建议尽快安排首次联系。',
        ],
      },
      sources: [{ channel: '主动投递', college: COLLEGE, date: '2026-07-14', operator: '王老师', attachment: '罗一凡-简历.pdf' }],
      follows: [],
      tags: [],
    },
  ]

  // === 招聘流程待办（人事处管理员）===
  // 按《子环节内容与逻辑》文档:7 个标准环节 + 各环节子状态签体系。
  // 各计划实际启用的环节由 processStages 决定,流转按此顺序取"下一环节首状态"。
  var TODO_CATEGORIES = [
    { key: '公开招聘', name: '2026年专任教师计划', nodes: ['资格审查', '笔试', '面试', '体检', '心理测试', '校级审核', '招聘录用'] },
    { key: '选聘', name: '2026年高层次人才招聘计划', nodes: ['资格审查', '面试', '调档案'] },
    { key: '高层次人才', name: '2026年辅导员招聘计划', nodes: ['资格审查', '校级审核'] },
  ]

  // 每个环节的合法状态签,首状态即进入该环节时的初始状态签。
  var NODE_SUB_STATUSES = {
    '资格审查': ['待审核'],
    '笔试':     ['待确认参加', '待发准考证', '待录成绩', '待审核'],
    '面试':     ['待确认参加', '待发通知',   '待录成绩', '待审核'],
    '部门初试': ['待填写意见', '待提交复核', '已提交复核', '已锁定'],
    '体检':     ['待确认参加', '待登记结果并审核'],
    '心理测试': ['待确认参加', '待登记结果并审核'],
    '校级审核': ['待审核'],
    '调档案': ['待发送调档邮件', '已发送调档邮件'],
    '招聘录用': ['待我办理', '已录用', '不录用'],
  }

  var TODO_PLANS = [
    { id: 'todo-plan-001', name: '2026年度教学科研人员公开招聘计划（春季批次）', year: '2026', applyEndTime: '2026-03-31 17:00', status: '已发布', ended: false, categoryKey: '公开招聘', categoryKeys: ['公开招聘'], jobCategory: '教师岗',
      processStages: ['资格审查', '笔试', '面试', '体检', '心理测试', '校级审核', '招聘录用', '调档体检'] },
    { id: 'todo-plan-002', name: '2026年度行政管理人员公开招聘计划（第一批）', year: '2026', applyEndTime: '2026-04-30 17:00', status: '已发布', ended: false, categoryKey: '公开招聘', categoryKeys: ['公开招聘'], jobCategory: '行政岗',
      processStages: ['资格审查', '笔试', '面试', '校级审核', '招聘录用', '调档体检'] },
    { id: 'todo-plan-003', name: '2025年度高层次人才引进计划（秋季批次）', year: '2025', applyEndTime: '2025-10-25 17:00', status: '已发布', ended: true, categoryKey: '高层次人才', categoryKeys: ['高层次人才'], jobCategory: '科研岗',
      processStages: ['资格审查', '校级审核'] },
    { id: 'todo-plan-004', name: '2026年度博士后研究人员选聘计划（第一批）', year: '2026', applyEndTime: '2026-05-31 17:00', status: '已发布', ended: false, categoryKey: '选聘', categoryKeys: ['选聘'], jobCategory: '科研岗',
      processStages: ['资格审查', '面试', '调档案', '调档体检'] },
    { id: 'todo-plan-005', name: '2026年度学科领军人才引进专项计划', year: '2026', applyEndTime: '2026-06-30 17:00', status: '已发布', ended: false, categoryKey: '选聘', categoryKeys: ['选聘'], jobCategory: '科研岗',
      processStages: ['资格审查', '面试', '调档案', '调档体检'] },
    { id: 'todo-plan-006', name: '2026年度专职辅导员招聘计划', year: '2026', applyEndTime: '2026-05-20 17:00', status: '已发布', ended: false, categoryKey: '高层次人才', categoryKeys: ['高层次人才'], jobCategory: '行政岗',
      processStages: ['资格审查', '校级审核'] },
    // 新增:包含部门初试环节的计划(高层次人才引进)
    { id: 'todo-plan-007', name: '2026年度高层次人才引进计划（春季批次）', year: '2026', applyEndTime: '2026-04-15 17:00', status: '已发布', ended: false, categoryKey: '高层次人才', categoryKeys: ['高层次人才'], jobCategory: '科研岗',
      processStages: ['资格审查', '部门初试', '面试', '校级审核', '招聘录用', '体检确认'],
      // 部门初试成绩项配置(按招聘方案动态显示)
      deptScoreItems: [
        { key: 'teaching', label: '教学能力', weight: 30, maxScore: 100 },
        { key: 'research', label: '科研能力', weight: 40, maxScore: 100 },
        { key: 'comprehensive', label: '综合素质', weight: 30, maxScore: 100 },
      ],
      // 晋级比例(1:3 表示招聘1人,最多3人进入下一轮)
      advanceRatio: '1:3',
    },
    { id: 'todo-plan-008', name: '2026年度教学科研人员引进计划（第一批）', year: '2026', applyEndTime: '2026-05-31 17:00', status: '已发布', ended: false, categoryKey: '公开招聘', categoryKeys: ['公开招聘'], jobCategory: '教师岗',
      processStages: ['资格审查', '部门初试', '综合素质考察', '面试', '校级审核', '招聘录用', '体检确认'],
      // 部门初试成绩项配置(教学科研岗)
      deptScoreItems: [
        { key: 'teaching', label: '教学试讲', weight: 35, maxScore: 100 },
        { key: 'research', label: '科研成果', weight: 35, maxScore: 100 },
        { key: 'interview', label: '面试表现', weight: 20, maxScore: 100 },
        { key: 'comprehensive', label: '综合素质', weight: 10, maxScore: 100 },
      ],
      advanceRatio: '1:6',
    },
  ]

  var TODO_CANDIDATES = [
    { id: 'todo-c-001', name: '张宁', jobId: 'T2026-AI-01', jobName: '人工智能学院·专任教师', planId: 'todo-plan-001', categoryKey: '公开招聘', currentNode: '资格审查', subStatus: '待审核', score: null, arrivedAt: '2026-03-18 09:20', dueAt: '2026-03-20 17:00', school: '清华大学', degree: '博士', major: '计算机科学与技术', phone: '138****1234', research: '主持省部级项目1项,发表CCF-A论文3篇', requirements: [{ label: '博士学历', matched: true }, { label: '人工智能相关专业', matched: true }, { label: '2篇高水平论文', matched: true }], materials: ['个人简历.pdf', '学历学位证明.pdf', '代表性成果.zip'], ai: ['OCR识别材料完整', '学历及专业满足岗位要求', '未发现异常项'], history: ['03-18 09:20 应聘材料进入资格审查'] },
    { id: 'todo-c-002', name: '李妍', jobId: 'T2026-AI-01', jobName: '人工智能学院·专任教师', planId: 'todo-plan-001', categoryKey: '公开招聘', currentNode: '资格审查', subStatus: '待审核', score: null, arrivedAt: '2026-03-18 10:05', dueAt: '2026-03-20 17:00', school: '北京大学', degree: '硕士', major: '软件工程', phone: '139****5678', research: '发表核心论文2篇,有三年研发经历', requirements: [{ label: '博士学历', matched: false }, { label: '人工智能相关专业', matched: true }, { label: '2篇高水平论文', matched: false }], materials: ['个人简历.pdf', '硕士学位证明.pdf'], ai: ['OCR识别缺少博士学位证明', '学历与岗位要求不符,建议人工重点复核', '存在偏差,建议人工定审'], history: ['03-18 10:05 应聘材料进入资格审查'] },
    { id: 'todo-c-003', name: '王博', jobId: 'T2026-EE-02', jobName: '电子信息学院·副教授', planId: 'todo-plan-001', categoryKey: '公开招聘', currentNode: '笔试', subStatus: '待录成绩', score: null, arrivedAt: '2026-03-22 14:30', dueAt: '2026-03-24 17:00', school: '浙江大学', degree: '博士', major: '电子信息', phone: '137****9012', research: '主持横向项目2项,授权发明专利4项', requirements: [{ label: '博士学历', matched: true }, { label: '电子信息相关专业', matched: true }], materials: ['个人简历.pdf', '资格审查结论.pdf'], ai: ['资格复审无异常', '建议核验考试签到记录'], history: ['03-20 资格审查通过', '03-22 已参加笔试'] },
    { id: 'todo-c-004', name: '周毅', jobId: 'A2026-HR-01', jobName: '人事处·科员', planId: 'todo-plan-002', categoryKey: '公开招聘', currentNode: '面试', subStatus: '待发通知', score: null, arrivedAt: '2026-04-08 11:00', dueAt: '2026-04-10 17:00', school: '武汉大学', degree: '硕士', major: '人力资源管理', phone: '136****3456', research: '五年高校人事工作经历', requirements: [{ label: '硕士及以上学历', matched: true }, { label: '三年相关经历', matched: true }], materials: ['个人简历.pdf', '工作经历证明.pdf'], ai: ['经历证明与简历时间一致', '未发现材料异常'], history: ['04-07 资格审查通过', '04-08 笔试通过,进入面试'] },
    { id: 'todo-c-005', name: '陈晓', jobId: 'A2026-ADM-02', jobName: '校长办公室·秘书', planId: 'todo-plan-002', categoryKey: '公开招聘', currentNode: '面试', subStatus: '待确认参加', score: null, arrivedAt: '2026-04-12 09:00', dueAt: '2026-04-15 17:00', school: '中山大学', degree: '硕士', major: '行政管理', phone: '135****7890', research: '四年行政文秘工作经历', requirements: [{ label: '硕士及以上学历', matched: true }, { label: '文字表达能力', matched: true }], materials: ['个人简历.pdf', '笔试结论.pdf'], ai: ['资格复审无异常', '建议面试关注政策理解与临场表达'], history: ['04-09 资格审查通过', '04-11 笔试通过'] },
    { id: 'todo-c-006', name: '钱学文', jobId: 'S2025-AI-01', jobName: '人工智能学院·学科带头人', planId: 'todo-plan-003', categoryKey: '高层次人才', currentNode: '校级审核', subStatus: '待审核', score: 92, arrivedAt: '2025-11-18 09:00', dueAt: '2025-11-25 17:00', school: '海外知名高校', degree: '博士', major: '人工智能', phone: '134****2233', research: '国家级人才,主持重点项目2项', requirements: [{ label: '博士学历', matched: true }, { label: '学科带头人经历', matched: true }], materials: ['个人简历.pdf', '资格审查结论.pdf'], ai: ['流程材料完整', '前序结论汇总无异常'], history: ['11-10 资格审查通过', '11-18 进入校级审核'] },
  ]

  // 为流程下钻页补足各计划、各环节、各状态签的真实密度数据,确保所有步骤均可点击验收。
  var TODO_NAMES = ['赵嘉', '林悦', '何俊', '孙岚', '刘畅', '郑楠', '冯雪', '吴桐', '蒋晨', '方宁', '唐越', '谢雨']
  var TODO_SCHOOLS = ['清华大学', '北京大学', '浙江大学', '上海交通大学', '武汉大学', '中山大学']
  var TODO_GENERATED_INDEX = 0
  var isTodoPlanActive = function (plan) { return plan.status === '进行中' || (plan.status === '已发布' && !plan.ended) }
  TODO_PLANS.forEach(function (plan) {
    ;(plan.processStages || []).forEach(function (node) {
      var subStatuses = NODE_SUB_STATUSES[node] || []
      // 招聘录用环节:进行中计划各状态签各 2 条(含终态);已结束计划仅生成终态 2 条。
      // 其他环节:进行中计划每个"进行中状态签"生成 2 条,已结束计划每个状态签 1 条。
      subStatuses.forEach(function (subStatus) {
        var isTerminalOfOffer = node === '招聘录用' && (subStatus === '已录用' || subStatus === '不录用')
        var isPendingOfOffer = node === '招聘录用' && subStatus === '待我办理'
        var targetCount
        if (isTodoPlanActive(plan)) {
          targetCount = isTerminalOfOffer ? 2 : 4
        } else {
          // 已结束计划:只保留终态样本
          targetCount = isTerminalOfOffer ? 2 : 0
        }
        var existing = TODO_CANDIDATES.filter(function (item) {
          return item.planId === plan.id && item.currentNode === node && item.subStatus === subStatus
        }).length
        for (var i = existing; i < targetCount; i += 1) {
          var serial = TODO_GENERATED_INDEX
          TODO_GENERATED_INDEX += 1
          var isExamNode = node === '笔试' || node === '面试'
          var hasScore = isExamNode && (subStatus === '待审核' || subStatus === '待确认结果')
          // 部门初试成绩项
          var isDeptInterview = node === '部门初试'
          var deptScores = null
          var deptTotal = null
          var deptRank = null
          if (isDeptInterview && plan.deptScoreItems) {
            deptScores = {}
            var total = 0
            plan.deptScoreItems.forEach(function (item) {
              var score = 70 + (serial % 25)
              deptScores[item.key] = score
              total += score * (item.weight / 100)
            })
            deptTotal = Math.round(total * 100) / 100 // 保留两位小数
            deptRank = (serial % 8) + 1 // 模拟排名
          }
          TODO_CANDIDATES.push({
            id: 'todo-generated-' + serial,
            name: TODO_NAMES[serial % TODO_NAMES.length],
            jobId: (plan.jobCategory === '教师岗' ? 'T' : plan.jobCategory === '行政岗' ? 'A' : 'S') + plan.year + '-' + String(serial + 1).padStart(3, '0'),
            jobName: plan.jobCategory === '行政岗' ? '学校办公室·综合管理岗' : plan.jobCategory === '科研岗' ? '人工智能学院·科研岗' : '电子信息学院·专任教师',
            planId: plan.id,
            categoryKey: plan.categoryKey,
            currentNode: node,
            subStatus: subStatus,
            score: hasScore ? 72 + (serial % 20) : null,
            arrivedAt: plan.year + '-04-' + String(10 + (serial % 12)).padStart(2, '0') + ' 09:30',
            dueAt: plan.year + '-04-' + String(12 + (serial % 12)).padStart(2, '0') + ' 17:00',
            school: TODO_SCHOOLS[serial % TODO_SCHOOLS.length],
            degree: plan.jobCategory === '行政岗' ? '硕士' : '博士',
            major: plan.jobCategory === '行政岗' ? '行政管理' : '电子信息',
            phone: '13' + (serial % 9) + '****' + String(1200 + serial),
            research: plan.jobCategory === '行政岗' ? '具有高校综合管理和文字材料工作经历' : '主持科研项目并发表多篇高水平论文',
            requirements: [{ label: '学历要求', matched: true }, { label: '专业要求', matched: serial % 5 !== 0 }, { label: '工作经历', matched: true }],
            materials: ['个人简历.pdf', '学历学位证明.pdf', node + '材料.pdf'],
            ai: ['OCR识别材料完整', serial % 5 === 0 ? '专业方向存在轻微偏差,建议人工复核' : '岗位要求比对未发现明显异常', '仅辅助、人工定审'],
            history: ['已完成前序环节', '当前进入' + node + ' · ' + subStatus],
            // 部门初试专用字段
            deptScores: deptScores,
            deptTotal: deptTotal,
            deptRank: deptRank,
            deptRecommend: isDeptInterview && subStatus === '待提交复核' ? (serial % 3 !== 0) : null, // 是否推荐学校面试
            deptOpinion: isDeptInterview && subStatus !== '待填写意见' ? '综合考核意见:研究方向匹配,建议进入校级评审' : null,
            deptHead: isDeptInterview && subStatus !== '待填写意见' ? '张教授' : null,
            deptDate: isDeptInterview && subStatus !== '待填写意见' ? '2026-04-15' : null,
            deptFile: isDeptInterview && subStatus !== '待填写意见' ? '部门初试意见书.pdf' : null,
            deptLocked: subStatus === '已锁定',
          })
        }
      })
    })
  })

  // === 「我已办理」留痕样本(单一真源:贯通 hr 招聘办理 · 我已办理 tab) ===
  // 思路:为每个计划(含已结束计划)各环节生成若干"我已办理"留痕记录(handledRecords)。
  // 每条候选人保留完整的全流程 history 与 1~3 条 handledRecords,覆盖通过/退回/不通过/发放/录入/登记等办理结论,
  // 使"我已办理"左侧按计划分组(进行中/已结束)后,各环节叶节点均有密度、办理结论多样,可逐项点击验收。
  var HANDLED_EXTRAS = ['赵嘉', '林悦', '何俊', '孙岚', '刘畅', '郑楠', '冯雪', '吴桐', '蒋晨', '方宁', '唐越', '谢雨', '韩琪', '宋雅', '邓超']
  var HANDLED_SCHOOLS = ['清华大学', '北京大学', '浙江大学', '上海交通大学', '武汉大学', '中山大学', '复旦大学']
  // 各环节候选的办理结论、办理人与办理说明;key 形如 'node|subStatus'(办理前状态签)
  var HANDLED_VERDICTS = {
    '资格审查': [{ status: '已通过', handledBy: '李明', opinion: '学历、专业、年龄均符合岗位要求' }, { status: '已退回', handledBy: '李明', opinion: '缺少博士学位证明,退回补交' }, { status: '不通过', handledBy: '李明', opinion: '专业方向与岗位要求不符' }],
    '笔试': [{ status: '已通过', handledBy: '李明', opinion: '成绩达到合格线' }, { status: '不通过', handledBy: '李明', opinion: '成绩未达合格线' }, { status: '已录成绩', handledBy: '李明', opinion: 'Excel 导入成绩' }, { status: '已发放', handledBy: '李明', opinion: '准考证已发放' }],
    '面试': [{ status: '已通过', handledBy: '李明', opinion: '综合表现优秀' }, { status: '不通过', handledBy: '李明', opinion: '教学试讲不达标' }, { status: '已录成绩', handledBy: '李明', opinion: '面试评委打分汇总' }],
    '部门初试': [{ status: '已通过', handledBy: '李明', opinion: '部门初试意见:研究方向匹配,建议进入校级评审' }, { status: '不通过', handledBy: '李明', opinion: '部门初试意见:科研成果与岗位定位存在差距' }],
    '体检': [{ status: '合格', handledBy: '李明', opinion: '体检结果合格' }, { status: '不合格', handledBy: '李明', opinion: '体检不合格,不予进入下一环节' }, { status: '已确认参加', handledBy: '李明', opinion: '已确认参加体检' }],
    '心理测试': [{ status: '合格', handledBy: '李明', opinion: '心理测试结果正常' }, { status: '不合格', handledBy: '李明', opinion: '心理测试结果异常,建议复核' }],
    '校级审核': [{ status: '已通过', handledBy: '李明', opinion: '各环节结论齐备,审核通过' }, { status: '已退回', handledBy: '李明', opinion: '材料有疑点,退回至资格审查复核' }, { status: '不通过', handledBy: '李明', opinion: '综合评价不满足录用条件' }],
    '调档案': [{ status: '已发送调档邮件', handledBy: '李明', opinion: '已向原单位发送调档函' }],
    '招聘录用': [{ status: '已录用', handledBy: '李明', opinion: '公示无异议,准予录用' }, { status: '不录用', handledBy: '李明', opinion: '综合排名靠后,不予录用' }, { status: '已放弃', handledBy: '李明', opinion: '本人放弃录用资格' }],
  }
  var HANDLED_INDEX = 0
  TODO_PLANS.forEach(function (plan) {
    ;(plan.processStages || []).forEach(function (node) {
      // 进行中计划:前序环节各生成 3 条办理记录;招聘录用/调档案/校级审核等末端环节 2 条。
      // 已结束计划:各环节均生成 2 条办理记录(均为我已办理的留痕历史)。
      var isEndNode = node === '招聘录用' || node === '调档案' || node === '校级审核'
      var targetCount = isTodoPlanActive(plan) ? (isEndNode ? 2 : 3) : 2
      var verdicts = HANDLED_VERDICTS[node] || [{ status: '已通过', handledBy: '李明', opinion: '办理完成' }]
      for (var i = 0; i < targetCount; i += 1) {
        var serial = HANDLED_INDEX
        HANDLED_INDEX += 1
        var verdict = verdicts[i % verdicts.length]
        var isExamNode = node === '笔试' || node === '面试'
        var hasScore = isExamNode && (verdict.status === '已通过' || verdict.status === '不通过' || verdict.status === '已录成绩')
        var stagedAt = plan.year + '-0' + (3 + (serial % 4)) + '-' + String(10 + (serial % 15)).padStart(2, '0') + ' ' + String(9 + (serial % 8)).padStart(2, '0') + ':' + String(10 + (serial % 40)).padStart(2, '0')
        TODO_CANDIDATES.push({
          id: 'todo-handled-' + serial,
          handledOnly: true,
          name: HANDLED_EXTRAS[serial % HANDLED_EXTRAS.length],
          jobId: (plan.jobCategory === '教师岗' ? 'T' : plan.jobCategory === '行政岗' ? 'A' : 'S') + plan.year + '-H' + String(serial + 1).padStart(3, '0'),
          jobName: plan.jobCategory === '行政岗' ? '学校办公室·综合管理岗' : plan.jobCategory === '科研岗' ? '人工智能学院·科研岗' : '电子信息学院·专任教师',
          planId: plan.id,
          categoryKey: plan.categoryKey,
          currentNode: node,
          subStatus: verdict.status,
          score: hasScore ? 70 + (serial % 25) : null,
          arrivedAt: stagedAt,
          dueAt: plan.year + '-0' + (4 + (serial % 3)) + '-' + String(12 + (serial % 14)).padStart(2, '0') + ' 17:00',
          school: HANDLED_SCHOOLS[serial % HANDLED_SCHOOLS.length],
          degree: plan.jobCategory === '行政岗' ? '硕士' : '博士',
          major: plan.jobCategory === '行政岗' ? '行政管理' : '电子信息',
          phone: '13' + (serial % 9) + '****' + String(2000 + serial),
          research: plan.jobCategory === '行政岗' ? '具有高校综合管理和文字材料工作经历' : '主持科研项目并发表多篇高水平论文',
          requirements: [{ label: '学历要求', matched: true }, { label: '专业要求', matched: serial % 5 !== 0 }, { label: '工作经历', matched: true }],
          materials: ['个人简历.pdf', '学历学位证明.pdf', node + '材料.pdf'],
          ai: ['OCR识别材料完整', serial % 5 === 0 ? '专业方向存在轻微偏差,建议人工复核' : '岗位要求比对未发现明显异常', '仅辅助、人工定审'],
          history: ['已完成前序环节', stagedAt + ' 已办理 ' + node + ' · ' + verdict.status],
          handledBy: verdict.handledBy,
          handledAt: stagedAt,
          opinion: verdict.opinion,
          handledRecords: [{
            id: 'todo-handled-' + serial + '-rec',
            candidateId: 'todo-handled-' + serial,
            planId: plan.id,
            categoryKey: plan.categoryKey,
            currentNode: node,
            subStatus: verdict.status,
            status: verdict.status,
            name: HANDLED_EXTRAS[serial % HANDLED_EXTRAS.length],
            jobId: (plan.jobCategory === '教师岗' ? 'T' : plan.jobCategory === '行政岗' ? 'A' : 'S') + plan.year + '-H' + String(serial + 1).padStart(3, '0'),
            jobName: plan.jobCategory === '行政岗' ? '学校办公室·综合管理岗' : plan.jobCategory === '科研岗' ? '人工智能学院·科研岗' : '电子信息学院·专任教师',
            phone: '13' + (serial % 9) + '****' + String(2000 + serial),
            school: HANDLED_SCHOOLS[serial % HANDLED_SCHOOLS.length],
            degree: plan.jobCategory === '行政岗' ? '硕士' : '博士',
            score: hasScore ? 70 + (serial % 25) : null,
            handledAt: stagedAt,
            handledBy: verdict.handledBy,
            opinion: verdict.opinion,
          }],
        })
      }
    })
  })

  // === 拟录取名单(单一真源:贯通「调取档案」「录用」两菜单) ===
  // 来源:各招聘计划推进到末端环节(校级审核)并通过的人员,即"展示所有计划中最新环节通过的人"。
  // 身份证联系方式默认脱敏(idCardMasked),人事处授权后可查完整(idCard);本 mock 提供完整字段供详情展示。
  // archiveStatus / hireStatus 分别为两菜单流转状态的初始态(详情/编辑时由页面本地态进一步推进)。
  var ADMITTED_PLANS = TODO_PLANS.filter(function (plan) { return plan.status === '已发布' || plan.status === '进行中' || plan.status === '已结束' })

  var ADMITTED_LIST = [
    // adm-001 陈思远:准入核查阶段(待查询)
    { id: 'adm-001', name: '陈思远', gender: '男', age: 32, idCard: '440301199312050031', idCardMasked: '440301********0031', phone: '13800010001', phoneMasked: '138****0001',
      college: '电子与通信工程学院', position: '专任教师(通信工程)', campus: '校本部', jobId: 'T2026-ET-01', planId: 'todo-plan-001', planName: '2026年度教学科研人员公开招聘计划(春季批次)', headcount: 2,
      degree: '博士', school: '清华大学', major: '信息与通信工程', isFresh: false, score: 92.5, rank: 1, total: 86.0,
      archiveUnit: '', archiveAddress: '', archivePhone: '', archiveStatus: '待提交信息', archiveLogs: [{ time: '2026-07-12 10:20', op: '系统', content: '校级审核通过,进入拟录取名单' }],
      hireStatus: '准入核查中', accessResult: '', medicalResult: '', publicizeStart: '', publicizeEnd: '', onboardingAt: '', hireLogs: [],
      accessStatus: '待准入核查', accessResult: '', accessLogs: [{ time: '2026-07-12 10:20', op: '系统', content: '考核结束,进入录用流程' }],
      meetingStatus: '待上会', meetingResult: '', meetingLogs: [],
      noticeStatus: '待通知', noticeTime: '', noticeLogs: [],
      medicalStatus: '待体检', medicalResult: '', medicalTime: '', medicalLogs: [],
      archiveAuditStatus: '待审核', archiveAuditResult: '', archiveAuditLogs: [],
      publicizeStatus: '待公示', publicizeStart: '', publicizeEnd: '', publicizeLogs: [],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '', cancelTime: '' },

    // adm-002 林晓婕:上会审定阶段
    { id: 'adm-002', name: '林晓婕', gender: '女', age: 28, idCard: '440307199803220045', idCardMasked: '440307********0045', phone: '13800010002', phoneMasked: '138****0002',
      college: '电子与通信工程学院', position: '专任教师(通信工程)', campus: '校本部', jobId: 'T2026-ET-01', planId: 'todo-plan-001', planName: '2026年度教学科研人员公开招聘计划(春季批次)', headcount: 2,
      degree: '博士', school: '华中科技大学', major: '通信与信息系统', isFresh: true, score: 88.0, rank: 2, total: 82.5,
      archiveUnit: '清华大学就业指导中心', archiveAddress: '北京市海淀区清华大学', archivePhone: '010-62770000', archiveStatus: '已提交', archiveLogs: [{ time: '2026-07-12 10:20', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-07-15 09:10', op: '林晓婕', content: '填写被调档单位与联系方式' }],
      hireStatus: '上会审定中', accessResult: '资质无不良记录', medicalResult: '', publicizeStart: '', publicizeEnd: '', onboardingAt: '', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-07-12 10:20', op: '系统', content: '进入录用流程' }, { time: '2026-07-16 14:00', op: '李明', content: '准入核查通过,进入上会审定' }],
      meetingStatus: '待上会', meetingResult: '', meetingLogs: [{ time: '2026-07-16 14:00', op: '李明', content: '准入核查通过,等待上会审定' }],
      noticeStatus: '待通知', noticeTime: '', noticeLogs: [],
      medicalStatus: '待体检', medicalResult: '', medicalTime: '', medicalLogs: [],
      archiveAuditStatus: '待审核', archiveAuditResult: '', archiveAuditLogs: [],
      publicizeStatus: '待公示', publicizeStart: '', publicizeEnd: '', publicizeLogs: [],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '', cancelTime: '' },

    // adm-011 苏文博:首次结果通知阶段(新增)
    { id: 'adm-011', name: '苏文博', gender: '男', age: 34, idCard: '440106198603200017', idCardMasked: '440106********0017', phone: '13800010011', phoneMasked: '138****0011',
      college: '机电工程学院', position: '副教授(智能制造)', campus: '校本部', jobId: 'T2026-ME-02', planId: 'todo-plan-001', planName: '2026年度教学科研人员公开招聘计划(春季批次)', headcount: 1,
      degree: '博士', school: '哈尔滨工业大学', major: '机械工程', isFresh: false, score: 89.0, rank: 1, total: 83.5,
      archiveUnit: '哈尔滨工业大学人事档案室', archiveAddress: '哈尔滨市南岗区西大直街92号', archivePhone: '0451-86400000', archiveStatus: '待提交信息', archiveLogs: [{ time: '2026-07-10 09:30', op: '系统', content: '校级审核通过,进入拟录取名单' }],
      hireStatus: '结果通知中', accessResult: '资质无不良记录', medicalResult: '', publicizeStart: '', publicizeEnd: '', onboardingAt: '', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-07-10 09:30', op: '系统', content: '进入录用流程' }, { time: '2026-07-12 10:00', op: '李明', content: '准入核查通过' }],
      meetingStatus: '上会通过', meetingResult: '2026年校招聘领导小组第3次会议审定同意', meetingLogs: [{ time: '2026-07-13 15:00', op: '人事处', content: '校招聘领导小组会议审定通过' }],
      noticeStatus: '已通知', noticeTime: '2026-07-14 10:00', noticeLogs: [{ time: '2026-07-14 10:00', op: '系统', content: '已发送首次招聘结果通知(站内信+短信)' }],
      medicalStatus: '待体检', medicalResult: '', medicalTime: '', medicalLogs: [],
      archiveAuditStatus: '待审核', archiveAuditResult: '', archiveAuditLogs: [],
      publicizeStatus: '待公示', publicizeStart: '', publicizeEnd: '', publicizeLogs: [],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '', cancelTime: '' },

    // adm-003 黄志强:调档中(已开商调函),体检合格,档案尚未到齐
    { id: 'adm-003', name: '黄志强', gender: '男', age: 35, idCard: '330106199103150019', idCardMasked: '330106********0019', phone: '13800010003', phoneMasked: '138****0003',
      college: '机电工程学院', position: '副教授(智能制造)', campus: '校本部', jobId: 'T2026-ME-01', planId: 'todo-plan-001', planName: '2026年度教学科研人员公开招聘计划(春季批次)', headcount: 1,
      degree: '博士', school: '上海交通大学', major: '机械工程', isFresh: false, score: 91.0, rank: 1, total: 85.0,
      archiveUnit: '上海交通大学人事档案室', archiveAddress: '上海市东川路800号', archivePhone: '021-34200000', archiveStatus: '已开商调函', archiveLogs: [{ time: '2026-07-12 10:20', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-07-14 11:30', op: '拟聘人员', content: '填写被调档单位信息' }, { time: '2026-07-17 09:00', op: '李明', content: '开具商调函,已寄出' }],
      hireStatus: '调档中', accessResult: '资质无不良记录', medicalResult: '体检合格', publicizeStart: '', publicizeEnd: '', onboardingAt: '', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-07-12 10:20', op: '系统', content: '进入录用流程' }, { time: '2026-07-15 10:00', op: '李明', content: '准入核查通过' }],
      meetingStatus: '上会通过', meetingResult: '2026年校招聘领导小组第3次会议审定同意', meetingLogs: [{ time: '2026-07-15 16:00', op: '人事处', content: '校招聘领导小组会议审定通过' }],
      noticeStatus: '已确认', noticeTime: '2026-07-16 09:00', noticeLogs: [{ time: '2026-07-16 09:00', op: '系统', content: '拟聘人员已确认结果通知' }],
      medicalStatus: '体检合格', medicalResult: '体检合格,各项指标正常', medicalTime: '2026-07-17', medicalLogs: [{ time: '2026-07-17 11:00', op: '校医院', content: '体检完成,结果合格' }],
      archiveAuditStatus: '待审核', archiveAuditResult: '', archiveAuditLogs: [],
      publicizeStatus: '待公示', publicizeStart: '', publicizeEnd: '', publicizeLogs: [],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '', cancelTime: '' },

    // adm-012 钱思琪:体检不合格(新增,演示阶段异常→取消)
    { id: 'adm-012', name: '钱思琪', gender: '女', age: 27, idCard: '320105199907180028', idCardMasked: '320105********0028', phone: '13800010012', phoneMasked: '138****0012',
      college: '艺术设计学院', position: '专任教师(数字媒体)', campus: '校本部', jobId: 'T2026-AD-02', planId: 'todo-plan-001', planName: '2026年度教学科研人员公开招聘计划(春季批次)', headcount: 1,
      degree: '硕士', school: '中央美术学院', major: '数字媒体艺术', isFresh: true, score: 86.0, rank: 1, total: 79.5,
      archiveUnit: '中央美术学院就业中心', archiveAddress: '北京市朝阳区花家地南街8号', archivePhone: '010-64770000', archiveStatus: '已提交', archiveLogs: [{ time: '2026-07-09 10:00', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-07-13 09:00', op: '钱思琪', content: '填写应届生档案存放单位信息' }],
      hireStatus: '体检中', accessResult: '资质无不良记录', medicalResult: '体检不合格', publicizeStart: '', publicizeEnd: '', onboardingAt: '', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-07-09 10:00', op: '系统', content: '进入录用流程' }, { time: '2026-07-11 09:00', op: '李明', content: '准入核查通过' }],
      meetingStatus: '上会通过', meetingResult: '2026年校招聘领导小组第3次会议审定同意', meetingLogs: [{ time: '2026-07-12 14:00', op: '人事处', content: '校招聘领导小组会议审定通过' }],
      noticeStatus: '已确认', noticeTime: '2026-07-13 10:00', noticeLogs: [{ time: '2026-07-13 10:00', op: '系统', content: '拟聘人员已确认结果通知' }],
      medicalStatus: '体检不合格', medicalResult: '体检不合格(色觉异常),不符合岗位体检要求', medicalTime: '2026-07-16', medicalLogs: [{ time: '2026-07-16 15:00', op: '校医院', content: '体检结果不合格,需终止录用流程' }],
      archiveAuditStatus: '待审核', archiveAuditResult: '', archiveAuditLogs: [],
      publicizeStatus: '待公示', publicizeStart: '', publicizeEnd: '', publicizeLogs: [],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '', cancelTime: '' },

    // adm-004 赵雨晴:档案审核通过,待最终公示
    { id: 'adm-004', name: '赵雨晴', gender: '女', age: 27, idCard: '440304199907280062', idCardMasked: '440304********0062', phone: '13800010004', phoneMasked: '138****0004',
      college: '艺术设计学院', position: '专任教师(视觉传达)', campus: '校本部', jobId: 'T2026-AD-01', planId: 'todo-plan-001', planName: '2026年度教学科研人员公开招聘计划(春季批次)', headcount: 1,
      degree: '硕士', school: '中国美术学院', major: '设计学', isFresh: true, score: 87.5, rank: 1, total: 80.0,
      archiveUnit: '中国美术学院就业中心', archiveAddress: '杭州市南山路218号', archivePhone: '0571-87160000', archiveStatus: '无须商调函', archiveLogs: [{ time: '2026-07-12 10:20', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-07-13 10:00', op: '李明', content: '应届生,档案关系仍在毕业学校,无须商调函' }],
      hireStatus: '档案审核中', accessResult: '资质无不良记录', medicalResult: '体检合格', publicizeStart: '', publicizeEnd: '', onboardingAt: '', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-07-12 10:20', op: '系统', content: '进入录用流程' }, { time: '2026-07-14 10:00', op: '李明', content: '准入核查通过' }],
      meetingStatus: '上会通过', meetingResult: '2026年校招聘领导小组第3次会议审定同意', meetingLogs: [{ time: '2026-07-14 16:00', op: '人事处', content: '校招聘领导小组会议审定通过' }],
      noticeStatus: '已确认', noticeTime: '2026-07-15 09:00', noticeLogs: [{ time: '2026-07-15 09:00', op: '系统', content: '拟聘人员已确认结果通知' }],
      medicalStatus: '体检合格', medicalResult: '体检合格,各项指标正常', medicalTime: '2026-07-16', medicalLogs: [{ time: '2026-07-16 11:00', op: '校医院', content: '体检完成,结果合格' }],
      archiveAuditStatus: '审核通过', archiveAuditResult: '档案材料齐全,无不良记录', archiveAuditLogs: [{ time: '2026-07-17 10:00', op: '档案室', content: '应届生档案已核实,审核通过' }],
      publicizeStatus: '待公示', publicizeStart: '', publicizeEnd: '', publicizeLogs: [],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '', cancelTime: '' },

    // adm-013 韩立:档案审核不通过(新增,演示档案审核拦截)
    { id: 'adm-013', name: '韩立', gender: '男', age: 36, idCard: '110108198810200015', idCardMasked: '110108********0015', phone: '13800010013', phoneMasked: '138****0013',
      college: '人工智能学院', position: '副研究员(机器学习)', campus: '校本部', jobId: 'S2026-AI-02', planId: 'todo-plan-003', planName: '2025年度高层次人才引进计划(秋季批次)', headcount: 1,
      degree: '博士', school: '中国科学院大学', major: '计算机科学', isFresh: false, score: 90.5, rank: 1, total: 85.0,
      archiveUnit: '原单位人事档案室', archiveAddress: '北京市海淀区中关村南二条', archivePhone: '010-82000000', archiveStatus: '档案已到', archiveLogs: [{ time: '2026-06-25 10:00', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-07-02 09:00', op: '李明', content: '开具商调函' }, { time: '2026-07-18 14:00', op: '档案室', content: '人事档案已到校,登记签收' }],
      hireStatus: '档案审核中', accessResult: '资质无不良记录', medicalResult: '体检合格', publicizeStart: '', publicizeEnd: '', onboardingAt: '', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-06-25 10:00', op: '系统', content: '进入录用流程' }, { time: '2026-06-27 10:00', op: '李明', content: '准入核查通过' }],
      meetingStatus: '上会通过', meetingResult: '2026年校招聘领导小组第2次会议审定同意', meetingLogs: [{ time: '2026-06-28 15:00', op: '人事处', content: '校招聘领导小组会议审定通过' }],
      noticeStatus: '已确认', noticeTime: '2026-06-29 09:00', noticeLogs: [{ time: '2026-06-29 09:00', op: '系统', content: '拟聘人员已确认结果通知' }],
      medicalStatus: '体检合格', medicalResult: '体检合格,各项指标正常', medicalTime: '2026-07-01', medicalLogs: [{ time: '2026-07-01 11:00', op: '校医院', content: '体检完成,结果合格' }],
      archiveAuditStatus: '审核不通过', archiveAuditResult: '档案中工作经历与申报材料不符,学历存疑', archiveAuditLogs: [{ time: '2026-07-20 10:00', op: '档案室', content: '审档发现工作经历与申报不符,不予通过,终止流程' }],
      publicizeStatus: '待公示', publicizeStart: '', publicizeEnd: '', publicizeLogs: [],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '档案审核不通过:审档发现工作经历与申报材料不符', cancelTime: '' },

    // adm-005 周明轩:最终公示中被(演示公示环节)
    { id: 'adm-005', name: '周明轩', gender: '男', age: 30, idCard: '420106199405100027', idCardMasked: '420106********0027', phone: '13800010005', phoneMasked: '138****0005',
      college: '经济管理学院', position: '专任教师(工商管理)', campus: '校本部', jobId: 'T2026-EM-01', planId: 'todo-plan-001', planName: '2026年度教学科研人员公开招聘计划(春季批次)', headcount: 2,
      degree: '博士', school: '武汉大学', major: '工商管理', isFresh: false, score: 90.0, rank: 1, total: 84.0,
      archiveUnit: '武汉大学档案馆', archiveAddress: '武汉市武昌区八一路299号', archivePhone: '027-68750000', archiveStatus: '档案已到', archiveLogs: [{ time: '2026-07-12 10:20', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-07-15 14:00', op: '李明', content: '开具商调函' }, { time: '2026-07-21 10:00', op: '档案室', content: '人事档案已到校,登记签收' }],
      hireStatus: '最终公示中', accessResult: '资质无不良记录', medicalResult: '体检合格', publicizeStart: '2026-07-24', publicizeEnd: '2026-07-30', onboardingAt: '', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-07-12 10:20', op: '系统', content: '进入录用流程' }, { time: '2026-07-13 09:00', op: '李明', content: '准入核查通过' }],
      meetingStatus: '上会通过', meetingResult: '2026年校招聘领导小组第3次会议审定同意', meetingLogs: [{ time: '2026-07-13 16:00', op: '人事处', content: '校招聘领导小组会议审定通过' }],
      noticeStatus: '已确认', noticeTime: '2026-07-14 09:00', noticeLogs: [{ time: '2026-07-14 09:00', op: '系统', content: '拟聘人员已确认结果通知' }],
      medicalStatus: '体检合格', medicalResult: '体检合格,各项指标正常', medicalTime: '2026-07-16', medicalLogs: [{ time: '2026-07-16 11:00', op: '校医院', content: '体检完成,结果合格' }],
      archiveAuditStatus: '审核通过', archiveAuditResult: '档案材料齐全,无不良记录', archiveAuditLogs: [{ time: '2026-07-22 10:00', op: '档案室', content: '档案审核通过' }],
      publicizeStatus: '公示中', publicizeStart: '2026-07-24', publicizeEnd: '2026-07-30', publicizeLogs: [{ time: '2026-07-24 09:00', op: '人事处', content: '进入最终结果公示(7个自然日)' }],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '', cancelTime: '' },

    // adm-014 唐悦:待报到(新增)
    { id: 'adm-014', name: '唐悦', gender: '女', age: 29, idCard: '440307199608150043', idCardMasked: '440307********0043', phone: '13800010014', phoneMasked: '138****0014',
      college: '马克思主义学院', position: '专职辅导员', campus: '校本部', jobId: 'F2026-COU-01', planId: 'todo-plan-006', planName: '2026年度专职辅导员招聘计划', headcount: 3,
      degree: '硕士', school: '武汉大学', major: '马克思主义理论', isFresh: false, score: 84.0, rank: 2, total: 80.0,
      archiveUnit: '武汉大学档案馆', archiveAddress: '武汉市武昌区八一路299号', archivePhone: '027-68750000', archiveStatus: '档案已到', archiveLogs: [{ time: '2026-07-08 14:00', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-07-12 09:00', op: '李明', content: '开具商调函' }, { time: '2026-07-19 10:00', op: '档案室', content: '档案已到校签收' }],
      hireStatus: '待报到', accessResult: '资质无不良记录', medicalResult: '体检合格', publicizeStart: '2026-07-10', publicizeEnd: '2026-07-17', onboardingAt: '', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-07-08 14:00', op: '系统', content: '进入录用流程' }, { time: '2026-07-10 09:00', op: '李明', content: '准入核查通过' }],
      meetingStatus: '上会通过', meetingResult: '2026年校招聘领导小组第2次会议审定同意', meetingLogs: [{ time: '2026-07-10 16:00', op: '人事处', content: '校招聘领导小组会议审定通过' }],
      noticeStatus: '已确认', noticeTime: '2026-07-11 09:00', noticeLogs: [{ time: '2026-07-11 09:00', op: '系统', content: '拟聘人员已确认结果通知' }],
      medicalStatus: '体检合格', medicalResult: '体检合格,各项指标正常', medicalTime: '2026-07-12', medicalLogs: [{ time: '2026-07-12 11:00', op: '校医院', content: '体检完成,结果合格' }],
      archiveAuditStatus: '审核通过', archiveAuditResult: '档案材料齐全,无不良记录', archiveAuditLogs: [{ time: '2026-07-20 10:00', op: '档案室', content: '档案审核通过' }],
      publicizeStatus: '公示结束', publicizeStart: '2026-07-10', publicizeEnd: '2026-07-17', publicizeLogs: [{ time: '2026-07-10 09:00', op: '人事处', content: '进入最终结果公示' }, { time: '2026-07-17 17:00', op: '系统', content: '公示期满,无异议' }],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [{ time: '2026-07-17 17:00', op: '系统', content: '公示结束,转待报到' }],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '', cancelTime: '' },

    // adm-009 郭睿:已报到,待进校办理
    { id: 'adm-009', name: '郭睿', gender: '男', age: 33, idCard: '32010619920206007X', idCardMasked: '320106********007X', phone: '13800010009', phoneMasked: '138****0009',
      college: '人工智能学院', position: '学科带头人', campus: '校本部', jobId: 'S2026-AI-01', planId: 'todo-plan-003', planName: '2025年度高层次人才引进计划(秋季批次)', headcount: 1,
      degree: '博士', school: '海外知名高校', major: '人工智能', isFresh: false, score: 93.0, rank: 1, total: 88.0,
      archiveUnit: '原单位人事档案室', archiveAddress: '由拟聘人员补充', archivePhone: '', archiveStatus: '档案已到', archiveLogs: [{ time: '2026-06-20 10:00', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-06-25 09:00', op: '李明', content: '高层次人才,开具商调函' }, { time: '2026-07-05 10:00', op: '档案室', content: '人事档案已到校签收' }],
      hireStatus: '进校办理中', accessResult: '资质无不良记录', medicalResult: '体检合格', publicizeStart: '2026-07-01', publicizeEnd: '2026-07-08', onboardingAt: '2026-07-10', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-06-20 10:00', op: '系统', content: '进入录用流程' }, { time: '2026-06-22 10:00', op: '李明', content: '准入核查通过' }],
      meetingStatus: '上会通过', meetingResult: '2026年校招聘领导小组第2次会议审定同意', meetingLogs: [{ time: '2026-06-23 15:00', op: '人事处', content: '校招聘领导小组会议审定通过' }],
      noticeStatus: '已确认', noticeTime: '2026-06-24 09:00', noticeLogs: [{ time: '2026-06-24 09:00', op: '系统', content: '拟聘人员已确认结果通知' }],
      medicalStatus: '体检合格', medicalResult: '体检合格,各项指标正常', medicalTime: '2026-06-26', medicalLogs: [{ time: '2026-06-26 11:00', op: '校医院', content: '体检完成,结果合格' }],
      archiveAuditStatus: '审核通过', archiveAuditResult: '档案材料齐全,无不良记录', archiveAuditLogs: [{ time: '2026-07-06 10:00', op: '档案室', content: '档案审核通过' }],
      publicizeStatus: '公示结束', publicizeStart: '2026-07-01', publicizeEnd: '2026-07-08', publicizeLogs: [{ time: '2026-07-01 09:00', op: '人事处', content: '进入最终结果公示' }, { time: '2026-07-08 17:00', op: '系统', content: '公示期满,无异议' }],
      onboardStatus: '已报到', onboardTime: '2026-07-10', onboardLogs: [{ time: '2026-07-10 08:30', op: '李明', content: '已办理入职报到登记' }],
      entryStatus: '待办理', entryTime: '', entryLogs: [{ time: '2026-07-10 08:30', op: '系统', content: '报到完成,推送至进校办理系统' }],
      cancelReason: '', cancelTime: '' },

    // adm-010 冯雅静:待报到(与周明轩同处公示后)
    { id: 'adm-010', name: '冯雅静', gender: '女', age: 38, idCard: '350203198608120029', idCardMasked: '350203********0029', phone: '13800010010', phoneMasked: '138****0010',
      college: '马克思主义学院', position: '专职辅导员', campus: '校本部', jobId: 'G2026-MAR-01', planId: 'todo-plan-006', planName: '2026年度思政教师招聘计划', headcount: 2,
      degree: '硕士', school: '北京大学', major: '思想政治教育', isFresh: false, score: 85.5, rank: 1, total: 81.0,
      archiveUnit: '北京大学档案馆', archiveAddress: '北京市海淀区颐和园路5号', archivePhone: '010-62750000', archiveStatus: '档案已到', archiveLogs: [{ time: '2026-07-08 14:00', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-07-11 09:00', op: '李明', content: '开具商调函' }, { time: '2026-07-19 15:00', op: '档案室', content: '档案已到校签收' }],
      hireStatus: '待报到', accessResult: '资质无不良记录', medicalResult: '体检合格', publicizeStart: '2026-07-20', publicizeEnd: '2026-07-27', onboardingAt: '', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-07-08 14:00', op: '系统', content: '进入录用流程' }, { time: '2026-07-10 09:00', op: '李明', content: '准入核查通过' }],
      meetingStatus: '上会通过', meetingResult: '2026年校招聘领导小组第2次会议审定同意', meetingLogs: [{ time: '2026-07-10 16:00', op: '人事处', content: '校招聘领导小组会议审定通过' }],
      noticeStatus: '已确认', noticeTime: '2026-07-12 09:00', noticeLogs: [{ time: '2026-07-12 09:00', op: '系统', content: '拟聘人员已确认结果通知' }],
      medicalStatus: '体检合格', medicalResult: '体检合格,各项指标正常', medicalTime: '2026-07-13', medicalLogs: [{ time: '2026-07-13 11:00', op: '校医院', content: '体检完成,结果合格' }],
      archiveAuditStatus: '审核通过', archiveAuditResult: '档案材料齐全,无不良记录', archiveAuditLogs: [{ time: '2026-07-21 10:00', op: '档案室', content: '档案审核通过' }],
      publicizeStatus: '公示结束', publicizeStart: '2026-07-20', publicizeEnd: '2026-07-27', publicizeLogs: [{ time: '2026-07-20 09:00', op: '人事处', content: '进入最终结果公示' }, { time: '2026-07-27 17:00', op: '系统', content: '公示期满,无异议' }],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [{ time: '2026-07-27 17:00', op: '系统', content: '公示结束,转待报到' }],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '', cancelTime: '' },

    // adm-007 孙翊辰:准入核查通过待上会(综合管理岗)
    { id: 'adm-007', name: '孙翊辰', gender: '男', age: 31, idCard: '110108199209040034', idCardMasked: '110108********0034', phone: '13800010007', phoneMasked: '138****0007',
      college: '校长办公室', position: '综合管理岗', campus: '校本部', jobId: 'A2026-OFF-01', planId: 'todo-plan-002', planName: '2026年度行政管理人员公开招聘计划(第一批)', headcount: 2,
      degree: '硕士', school: '中国人民大学', major: '行政管理', isFresh: false, score: 84.0, rank: 1, total: 79.0,
      archiveUnit: '中国人民大学档案处', archiveAddress: '北京市海淀区中关村大街59号', archivePhone: '010-62510000', archiveStatus: '待提交信息', archiveLogs: [{ time: '2026-07-10 09:00', op: '系统', content: '校级审核通过,进入拟录取名单' }],
      hireStatus: '上会审定中', accessResult: '资质无不良记录', medicalResult: '', publicizeStart: '', publicizeEnd: '', onboardingAt: '', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-07-10 09:00', op: '系统', content: '进入录用流程' }, { time: '2026-07-12 10:00', op: '李明', content: '准入核查通过' }],
      meetingStatus: '待上会', meetingResult: '', meetingLogs: [{ time: '2026-07-12 10:00', op: '李明', content: '准入核查通过,等待上会审定' }],
      noticeStatus: '待通知', noticeTime: '', noticeLogs: [],
      medicalStatus: '待体检', medicalResult: '', medicalTime: '', medicalLogs: [],
      archiveAuditStatus: '待审核', archiveAuditResult: '', archiveAuditLogs: [],
      publicizeStatus: '待公示', publicizeStart: '', publicizeEnd: '', publicizeLogs: [],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '', cancelTime: '' },

    // adm-015 陈雨:进校办理中(新增,演示进校环节)
    { id: 'adm-015', name: '陈雨', gender: '女', age: 28, idCard: '440308199705220024', idCardMasked: '440308********0024', phone: '13800010015', phoneMasked: '138****0015',
      college: '信息工程学院', position: '实验师(网络工程)', campus: '校本部', jobId: 'T2026-IE-01', planId: 'todo-plan-001', planName: '2026年度教学科研人员公开招聘计划(春季批次)', headcount: 2,
      degree: '硕士', school: '华南理工大学', major: '计算机技术', isFresh: true, score: 83.0, rank: 1, total: 78.0,
      archiveUnit: '华南理工大学就业指导中心', archiveAddress: '广州市天河区五山路381号', archivePhone: '020-87110000', archiveStatus: '无须商调函', archiveLogs: [{ time: '2026-06-30 10:00', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-07-02 09:00', op: '李明', content: '应届生,档案关系仍在毕业学校,无须商调函' }],
      hireStatus: '进校办理中', accessResult: '资质无不良记录', medicalResult: '体检合格', publicizeStart: '2026-07-05', publicizeEnd: '2026-07-12', onboardingAt: '2026-07-14', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-06-30 10:00', op: '系统', content: '进入录用流程' }, { time: '2026-07-02 10:00', op: '李明', content: '准入核查通过' }],
      meetingStatus: '上会通过', meetingResult: '2026年校招聘领导小组第2次会议审定同意', meetingLogs: [{ time: '2026-07-03 15:00', op: '人事处', content: '校招聘领导小组会议审定通过' }],
      noticeStatus: '已确认', noticeTime: '2026-07-03 16:00', noticeLogs: [{ time: '2026-07-03 16:00', op: '系统', content: '拟聘人员已确认结果通知' }],
      medicalStatus: '体检合格', medicalResult: '体检合格,各项指标正常', medicalTime: '2026-07-04', medicalLogs: [{ time: '2026-07-04 11:00', op: '校医院', content: '体检完成,结果合格' }],
      archiveAuditStatus: '审核通过', archiveAuditResult: '应届生档案已核实,审核通过', archiveAuditLogs: [{ time: '2026-07-06 10:00', op: '档案室', content: '档案审核通过' }],
      publicizeStatus: '公示结束', publicizeStart: '2026-07-05', publicizeEnd: '2026-07-12', publicizeLogs: [{ time: '2026-07-05 09:00', op: '人事处', content: '进入最终结果公示' }, { time: '2026-07-12 17:00', op: '系统', content: '公示期满,无异议' }],
      onboardStatus: '已报到', onboardTime: '2026-07-14', onboardLogs: [{ time: '2026-07-14 09:00', op: '李明', content: '已办理入职报到登记' }],
      entryStatus: '待办理', entryTime: '', entryLogs: [{ time: '2026-07-14 09:00', op: '系统', content: '报到完成,推送至进校办理系统' }],
      cancelReason: '', cancelTime: '' },

    // adm-016 周晨:已入职(新增,演示进校办理完成→终态)
    { id: 'adm-016', name: '周晨', gender: '男', age: 35, idCard: '110108199012050038', idCardMasked: '110108********0038', phone: '13800010016', phoneMasked: '138****0016',
      college: '校长办公室', position: '综合管理岗', campus: '校本部', jobId: 'A2026-OFF-01', planId: 'todo-plan-002', planName: '2026年度行政管理人员公开招聘计划(第一批)', headcount: 2,
      degree: '硕士', school: '复旦大学', major: '公共管理', isFresh: false, score: 85.5, rank: 2, total: 80.5,
      archiveUnit: '复旦大学学生档案室', archiveAddress: '上海市杨浦区邯郸路220号', archivePhone: '021-65640000', archiveStatus: '档案已到', archiveLogs: [{ time: '2026-07-05 09:00', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-07-08 10:00', op: '李明', content: '开具商调函' }, { time: '2026-07-15 14:00', op: '档案室', content: '档案已到校签收' }],
      hireStatus: '已入职', accessResult: '资质无不良记录', medicalResult: '体检合格', publicizeStart: '2026-07-10', publicizeEnd: '2026-07-17', onboardingAt: '2026-07-18', hireLogs: [],
      accessStatus: '准入核查通过', accessResult: '资质无不良记录', accessLogs: [{ time: '2026-07-05 09:00', op: '系统', content: '进入录用流程' }, { time: '2026-07-07 09:00', op: '李明', content: '准入核查通过' }],
      meetingStatus: '上会通过', meetingResult: '2026年校招聘领导小组第1次会议审定同意', meetingLogs: [{ time: '2026-07-07 15:00', op: '人事处', content: '校招聘领导小组会议审定通过' }],
      noticeStatus: '已确认', noticeTime: '2026-07-08 09:00', noticeLogs: [{ time: '2026-07-08 09:00', op: '系统', content: '拟聘人员已确认结果通知' }],
      medicalStatus: '体检合格', medicalResult: '体检合格,各项指标正常', medicalTime: '2026-07-09', medicalLogs: [{ time: '2026-07-09 11:00', op: '校医院', content: '体检完成,结果合格' }],
      archiveAuditStatus: '审核通过', archiveAuditResult: '档案材料齐全,无不良记录', archiveAuditLogs: [{ time: '2026-07-16 10:00', op: '档案室', content: '档案审核通过' }],
      publicizeStatus: '公示结束', publicizeStart: '2026-07-10', publicizeEnd: '2026-07-17', publicizeLogs: [{ time: '2026-07-10 09:00', op: '人事处', content: '进入最终结果公示' }, { time: '2026-07-17 17:00', op: '系统', content: '公示期满,无异议' }],
      onboardStatus: '已报到', onboardTime: '2026-07-18', onboardLogs: [{ time: '2026-07-18 09:00', op: '李明', content: '已办理入职报到登记' }],
      entryStatus: '已办理', entryTime: '2026-07-18', entryLogs: [{ time: '2026-07-14 09:00', op: '系统', content: '报到完成,推送至进校办理系统' }, { time: '2026-07-18 10:00', op: '人事处', content: '进校办理完成(编制、社保、薪酬已建立),录用流程办结' }],
      cancelReason: '', cancelTime: '' },

    // adm-006 徐琳:档案异常→已取消(演示取消录用含原因)
    { id: 'adm-006', name: '徐琳', gender: '女', age: 29, idCard: '440308199512300048', idCardMasked: '440308********0048', phone: '13800010006', phoneMasked: '138****0006',
      college: '经济管理学院', position: '专任教师(工商管理)', campus: '校本部', jobId: 'T2026-EM-01', planId: 'todo-plan-001', planName: '2026年度教学科研人员公开招聘计划(春季批次)', headcount: 2,
      degree: '博士', school: '中山大学', major: '企业管理', isFresh: false, score: 82.5, rank: 2, total: 77.0,
      archiveUnit: '', archiveAddress: '', archivePhone: '', archiveStatus: '异常', archiveLogs: [{ time: '2026-07-12 10:20', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-07-18 16:00', op: '档案室', content: '商调函寄出后档案退回,原单位反馈人员关系待核实,标记异常' }],
      hireStatus: '已取消', accessResult: '', medicalResult: '', publicizeStart: '', publicizeEnd: '', onboardingAt: '', hireLogs: [],
      accessStatus: '待准入核查', accessResult: '', accessLogs: [{ time: '2026-07-12 10:20', op: '系统', content: '进入录用流程(待调档后推进)' }],
      meetingStatus: '待上会', meetingResult: '', meetingLogs: [],
      noticeStatus: '待通知', noticeTime: '', noticeLogs: [],
      medicalStatus: '待体检', medicalResult: '', medicalTime: '', medicalLogs: [],
      archiveAuditStatus: '待审核', archiveAuditResult: '', archiveAuditLogs: [],
      publicizeStatus: '待公示', publicizeStart: '', publicizeEnd: '', publicizeLogs: [],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '调档异常:商调函寄出后档案被原单位退回,人员关系无法核实', cancelTime: '2026-07-19 10:00' },

    // adm-008 吴佩珊:已取消(本人放弃)
    { id: 'adm-008', name: '吴佩珊', gender: '女', age: 26, idCard: '440305199904150056', idCardMasked: '440305********0056', phone: '13800010008', phoneMasked: '138****0008',
      college: '校长办公室', position: '综合管理岗', campus: '校本部', jobId: 'A2026-OFF-01', planId: 'todo-plan-002', planName: '2026年度行政管理人员公开招聘计划(第一批)', headcount: 2,
      degree: '硕士', school: '复旦大学', major: '公共管理', isFresh: true, score: 80.0, rank: 3, total: 75.5,
      archiveUnit: '复旦大学学生档案室', archiveAddress: '上海市杨浦区邯郸路220号', archivePhone: '021-65640000', archiveStatus: '已提交', archiveLogs: [{ time: '2026-07-10 09:00', op: '系统', content: '校级审核通过,进入拟录取名单' }, { time: '2026-07-12 10:30', op: '吴佩珊', content: '填可由同岗位候补第4名替补' }],
      hireStatus: '已取消', accessResult: '', medicalResult: '', publicizeStart: '', publicizeEnd: '', onboardingAt: '', hireLogs: [],
      accessStatus: '待准入核查', accessResult: '', accessLogs: [{ time: '2026-07-10 09:00', op: '系统', content: '进入录用流程' }],
      meetingStatus: '待上会', meetingResult: '', meetingLogs: [],
      noticeStatus: '待通知', noticeTime: '', noticeLogs: [],
      medicalStatus: '待体检', medicalResult: '', medicalTime: '', medicalLogs: [],
      archiveAuditStatus: '待审核', archiveAuditResult: '', archiveAuditLogs: [],
      publicizeStatus: '待公示', publicizeStart: '', publicizeEnd: '', publicizeLogs: [],
      onboardStatus: '待报到', onboardTime: '', onboardLogs: [],
      entryStatus: '待办理', entryTime: '', entryLogs: [],
      cancelReason: '本人放弃录用', cancelTime: '2026-07-14 11:00' },
  ]

  // 调档状态枚举(两菜单共用)
  var ARCHIVE_STATUS_OPTIONS = ['待提交信息', '已提交', '已开商调函', '档案已到', '异常', '无须商调函']
  // 录用主状态枚举(用于统计兼容)
  var HIRE_STATUS_OPTIONS = ['准入核查中', '上会审定中', '结果通知中', '体检中', '调档中', '档案审核中', '最终公示中', '待报到', '进校办理中', '已入职', '已取消']
  // 各阶段状态枚举(新9阶段流程)
  var STAGE_STATUS_OPTIONS = {
    access: ['待准入核查', '准入核查通过', '准入核查异常'],
    meeting: ['待上会', '上会通过', '上会不通过'],
    notice: ['待通知', '已通知', '已确认'],
    medical: ['待体检', '体检合格', '体检不合格'],
    archiveAudit: ['待审核', '审核通过', '审核不通过'],
    publicize: ['待公示', '公示中', '公示结束'],
    onboard: ['待报到', '已报到'],
    entry: ['待办理', '已办理'],
  }

  window.RecruitmentMock = {
    COLLEGE: COLLEGE,
    COLLEGES: COLLEGES,
    RECRUITMENT_CATEGORIES: RECRUITMENT_CATEGORIES,
    POSITION_CATEGORIES: POSITION_CATEGORIES,
    PROCESS_STAGE_OPTIONS: PROCESS_STAGE_OPTIONS,
    CAMPUS_OPTIONS: CAMPUS_OPTIONS,
    CANCELLED_MAJORS: CANCELLED_MAJORS,
    BACHELOR_POST_TYPE_OPTIONS: BACHELOR_POST_TYPE_OPTIONS,
    POSITION_GRADE_OPTIONS: POSITION_GRADE_OPTIONS,
    EMPLOYMENT_FORM_OPTIONS: EMPLOYMENT_FORM_OPTIONS,
    QUALIFICATION_RULE_EMPLOYMENT_FORMS: QUALIFICATION_RULE_EMPLOYMENT_FORMS,
    PERSONNEL_TYPE_OPTIONS: PERSONNEL_TYPE_OPTIONS,
    EDUCATION_OPTIONS: EDUCATION_OPTIONS,
    DEGREE_OPTIONS: DEGREE_OPTIONS,
    MIN_TITLE_OPTIONS: MIN_TITLE_OPTIONS,
    MAJOR_CODE_UNDERGRAD: MAJOR_CODE_UNDERGRAD,
    MAJOR_CODE_POSTGRAD: MAJOR_CODE_POSTGRAD,
    MAJOR_CATALOG: MAJOR_CATALOG,
    MAJOR_CATALOG_VERSIONS: MAJOR_CATALOG_VERSIONS,
    PLANS: PLANS,
    POSITION_APPLICATIONS: POSITION_APPLICATIONS,
    HISTORICAL_POSITIONS: HISTORICAL_POSITIONS,
    ORG_POSITIONS: ORG_POSITIONS,
    AI_ANALYSIS: AI_ANALYSIS,
    POSITIONS: POSITIONS,
    CANDIDATES: CANDIDATES,
    TALENTS: TALENTS,
    TALENT_SOURCE_CHANNELS: TALENT_SOURCE_CHANNELS,
    TALENT_TAG_OPTIONS: TALENT_TAG_OPTIONS,
    // 派生:有指定学院来源记录的人才(院系人才库视角,主记录全校唯一但按录入学院可见)
    talentsByCollege: function (college) {
      return TALENTS.filter(function (t) {
        return t.sources.some(function (s) { return s.college === college })
      })
    },
    // 派生:按手机号查重(录入时提示合并)
    talentByPhone: function (phone) {
      return TALENTS.filter(function (t) { return t.phone === phone })[0] || null
    },
    TODO_CATEGORIES: TODO_CATEGORIES,
    NODE_SUB_STATUSES: NODE_SUB_STATUSES,
    TODO_PLANS: TODO_PLANS,
    TODO_CANDIDATES: TODO_CANDIDATES,
    loadTodos: function () { return TODO_PLANS.map(function (item) { return Object.assign({}, item) }) },
    loadCandidates: function () { return TODO_CANDIDATES.map(function (item) { return Object.assign({}, item) }) },
    // === 拟录取名单(调取档案 / 录用 两菜单同源) ===
    ADMITTED_PLANS: ADMITTED_PLANS,
    ADMITTED_LIST: ADMITTED_LIST,
    ARCHIVE_STATUS_OPTIONS: ARCHIVE_STATUS_OPTIONS,
    HIRE_STATUS_OPTIONS: HIRE_STATUS_OPTIONS,
    STAGE_STATUS_OPTIONS: STAGE_STATUS_OPTIONS,
    loadAdmitted: function () { return ADMITTED_LIST.map(function (item) { return JSON.parse(JSON.stringify(item)) }) },
    // 派生:按身份证号取拟录取详情(两菜单互通跳转用)
    admittedByIdCard: function (idCard) {
      return ADMITTED_LIST.filter(function (a) { return a.idCard === idCard })[0] || null
    },
    // 派生:同岗位候补(同 jobId、非已取消、排名紧随当前人) —— 取消录用替补用
    alternates: function (jobId, afterRank) {
      return ADMITTED_LIST.filter(function (a) {
        return a.jobId === jobId && a.rank > afterRank && a.hireStatus !== '已取消'
      }).sort(function (x, y) { return x.rank - y.rank })
    },
    // 派生:已发布岗位(供 hr/position 等页面筛选)
    publishedPositions: function () {
      return POSITIONS.filter(function (p) { return p.status === 'published' })
    },
    // 派生:按部门过滤岗位
    positionsByDept: function (dept) {
      return POSITIONS.filter(function (p) { return p.dept === dept })
    },
    // 派生:按 id 取候选人
    candidatesByPosition: function (positionId) {
      return CANDIDATES.filter(function (c) { return c.positionId === positionId })
    },
    // === 已取消发布 plan 标记(hr 详情页取消发布 → 个人端联动) ===
    // 跨端通过 localStorage 共享;portal 等独立端可读此列表过滤对外可见的计划
    getUnpublishedPlans: function () {
      try {
        var raw = localStorage.getItem('recruitment_unpublished_plans')
        var list = raw ? JSON.parse(raw) : []
        return Array.isArray(list) ? list.filter(function (id) { return typeof id === 'string' }) : []
      } catch (e) { return [] }
    },
    markPlanUnpublished: function (id) {
      if (!id) return
      try {
        var list = this.getUnpublishedPlans()
        if (list.indexOf(id) < 0) {
          list.push(id)
          localStorage.setItem('recruitment_unpublished_plans', JSON.stringify(list))
        }
      } catch (e) { /* ignore */ }
    },
    clearPlanUnpublished: function (id) {
      try {
        var list = this.getUnpublishedPlans().filter(function (x) { return x !== id })
        localStorage.setItem('recruitment_unpublished_plans', JSON.stringify(list))
      } catch (e) { /* ignore */ }
    },
    // 派生:投递到指定部门岗位的候选人(院系人才库只读视角)
    candidatesByDept: function (dept) {
      var positionIds = {}
      POSITIONS.filter(function (p) { return p.dept === dept }).forEach(function (p) { positionIds[p.id] = true })
      return CANDIDATES.filter(function (c) { return positionIds[c.positionId] })
    },
    // 派生:按计划 id 取岗位申请
    applicationsByPlan: function (planId) {
      return POSITION_APPLICATIONS.filter(function (a) { return a.planId === planId })
    },
    // 派生:取 AI 分析(无匹配时返回 default)
    getAIAnalysis: function (appId) {
      return AI_ANALYSIS[appId] || AI_ANALYSIS['default']
    },
    // 派生:按计划 id 取计划详情
    planById: function (planId) {
      return PLANS.filter(function (p) { return p.id === planId })[0] || null
    },
    // 派生:按岗位名称匹配组织机构岗位库(默认带入职责)
    orgPositionByName: function (name) {
      if (!name) return null
      return ORG_POSITIONS.filter(function (o) { return o.positionName === name })[0] || null
    },
    // 派生:生成简历详情(应聘者简历信息表)
    generateResumeDetail: function (candidateId) {
      var candidate = TODO_CANDIDATES.filter(function (c) { return c.id === candidateId })[0]
      if (!candidate) return null

      var plan = TODO_PLANS.filter(function (p) { return p.id === candidate.planId })[0]
      var female = ['李妍', '林悦', '方宁', '唐越', '周敏', '孙岚', '冯雪', '陈晓', '吴敏', '宋雅'].indexOf(candidate.name) !== -1
      var code = candidateId.charCodeAt(candidateId.length - 1) || 0

      return {
        // 基本信息
        basic: {
          name: candidate.name,
          gender: female ? '女' : '男',
          birth: female ? '1994-08' : '1992-05',
          nation: '汉族',
          nationality: '中国',
          nativePlace: female ? '江苏南京' : '浙江杭州',
          household: female ? '江苏省南京市' : '浙江省杭州市',
          marriage: female ? '未婚' : '已婚',
          politics: female ? '共青团员' : '中共党员',
          idType: '居民身份证',
          idCard: female ? '320102199408182421' : '330102199205181817',
          birthPlace: female ? '江苏南京' : '浙江杭州',
          health: '健康或良好',
          joinPartyDate: female ? '2013-05' : '2015-06',
          workStart: '2019-07',
          phone: candidate.phone,
          email: (function () {
            // 基于姓名姓氏拼音生成合法邮箱,避免 id 末尾拼接产生非法邮箱(如 -001@mail.com)
            var pinyinMap = { '张': 'zhang', '李': 'li', '王': 'wang', '刘': 'liu', '陈': 'chen', '杨': 'yang', '赵': 'zhao', '黄': 'huang', '周': 'zhou', '吴': 'wu', '徐': 'xu', '孙': 'sun', '胡': 'hu', '朱': 'zhu', '高': 'gao', '林': 'lin', '何': 'he', '郭': 'guo', '马': 'ma', '罗': 'luo', '梁': 'liang', '宋': 'song', '郑': 'zheng', '谢': 'xie', '韩': 'han', '唐': 'tang', '冯': 'feng', '于': 'yu', '董': 'dong', '萧': 'xiao', '程': 'cheng', '曹': 'cao', '袁': 'yuan', '邓': 'deng', '许': 'xu', '傅': 'fu', '沈': 'shen', '曾': 'zeng', '彭': 'peng', '吕': 'lv', '苏': 'su', '卢': 'lu', '蒋': 'jiang', '蔡': 'cai', '贾': 'jia', '丁': 'ding', '魏': 'wei', '薛': 'xue', '叶': 'ye', '阎': 'yan', '余': 'yu', '潘': 'pan', '杜': 'du', '戴': 'dai', '夏': 'xia', '钟': 'zhong', '汪': 'wang', '田': 'tian', '任': 'ren', '姜': 'jiang', '范': 'fan', '方': 'fang', '石': 'shi', '姚': 'yao', '谭': 'tan', '廖': 'liao', '邹': 'zou', '熊': 'xiong', '金': 'jin', '陆': 'lu', '郝': 'hao', '孔': 'kong', '白': 'bai', '崔': 'cui', '康': 'kang', '毛': 'mao', '邱': 'qiu', '秦': 'qin', '江': 'jiang', '史': 'shi', '顾': 'gu', '侯': 'hou', '邵': 'shao', '孟': 'meng', '龙': 'long', '万': 'wan', '段': 'duan', '雷': 'lei', '钱': 'qian', '汤': 'tang', '尹': 'yin', '黎': 'li', '易': 'yi', '常': 'chang', '武': 'wu', '乔': 'qiao', '贺': 'he', '赖': 'lai', '龚': 'gong', '文': 'wen', '施': 'shi' }
            var prefix = 'recruit'
            if (candidate.name) {
              var firstChar = candidate.name.charAt(0)
              prefix = pinyinMap[firstChar] || 'recruit'
            }
            // 用 id 数字保证唯一,避免重名冲突
            var num = (candidate.id || '').replace(/[^0-9]/g, '')
            return (prefix + (num || '00') + '@example.com')
          })(),
          usedName: female ? '李晓' : '王志强',
          address: female ? '江苏省南京市玄武区XX路18号' : '浙江省杭州市西湖区XX路66号',
          postcode: female ? '210008' : '310013',
          topEducation: candidate.degree === '博士' ? '博士研究生' : '硕士研究生',
          topDegree: candidate.degree === '博士' ? '博士' : '硕士',
          topMajor: candidate.major,
          topSchool: candidate.school,
          topGraduateDate: candidate.degree === '博士' ? '2023-06' : '2019-06',
          overseas: code % 3 === 0 ? '有' : '无'
        },
        // 配偶信息
        spouse: female ? {
          name: '陈伟',
          birth: '1991-03',
          household: '江苏省苏州市',
          nation: '汉族',
          nativePlace: '江苏苏州',
          workUnit: '苏州某科技有限公司'
        } : null,
        // 应聘信息
        application: {
          batch: plan ? plan.name : '2026年春季招聘',
          department: candidate.jobName.split('·')[0] || '电子与通信工程学院',
          position: candidate.jobName.split('·')[1] || candidate.jobName,
          positionCode: candidate.jobId,
          campus: '校本部',
          recruitType: plan ? plan.categoryKey : '公开招聘',
          applyTime: candidate.arrivedAt,
          status: candidate.subStatus
        },
        // 教育经历
        education: {
          bachelor: {
            school: candidate.school,
            major: candidate.major,
            majorCode: 'B080703',
            education: '本科',
            degree: '学士',
            startDate: '2012-09',
            endDate: '2016-06',
            studyMode: '全日制',
            degreeDate: '2016-06',
            degreeUnit: candidate.school,
            eduCertNo: '10286120160001',
            degreeCertNo: '10286320160001',
            overseas: '境内',
            certificate: '本科毕业证书.pdf'
          },
          master: {
            school: candidate.school,
            major: candidate.major,
            majorCode: 'A081000',
            education: '硕士研究生',
            degree: '硕士',
            startDate: '2016-09',
            endDate: '2019-06',
            studyMode: '全日制',
            degreeDate: '2019-06',
            degreeUnit: candidate.school,
            eduCertNo: '10286120190002',
            degreeCertNo: '10286320190002',
            overseas: '境内',
            certificate: '硕士毕业证书.pdf'
          },
          doctor: candidate.degree === '博士' ? {
            school: candidate.school,
            major: candidate.major,
            majorCode: 'A081000',
            education: '博士研究生',
            degree: '博士',
            startDate: '2019-09',
            endDate: '2023-06',
            studyMode: '全日制',
            degreeDate: '2023-06',
            degreeUnit: candidate.school,
            eduCertNo: '10286120230003',
            degreeCertNo: '10286320230003',
            overseas: code % 3 === 0 ? '境外' : '境内',
            certificate: '博士毕业证书.pdf'
          } : null
        },
        // 工作经历
        workExperience: [{
          id: 'work-001',
          startDate: '2019-07',
          endDate: '至今',
          unit: '某高校',
          department: '电子信息工程系',
          position: '教学科研岗',
          techTitle: '讲师',
          duty: '承担专业课程教学与科研工作',
          unitNature: '事业单位',
          overseas: '否',
          witness: '张主任',
          certificate: '在职证明.pdf'
        }],
        // 专业技术职务或技术工人等级
        technicalTitles: [{
          id: 'tech-001',
          title: '讲师',
          level: '中级',
          major: candidate.major,
          acquireDate: '2021-09',
          workerType: '',
          workerLevel: '',
          certificate: '专业技术资格证书.pdf'
        }],
        // 职业资格
        professionalQualifications: [{
          id: 'prof-001',
          qualification: '高等学校教师资格',
          level: '高等学校',
          obtainWay: '考试取得',
          acquireDate: '2020-06',
          issueDate: '2020-07',
          issuer: '广东省教育厅',
          certNo: '20204400042000123',
          certificate: '教师资格证书.pdf'
        }],
        // 资质信息
        qualification: {
          teacherCertNo: '20204400042000123',
          teacherCertDate: '2020-06',
          subjectCategory: '工学',
          firstSubject: '计算机科学与技术',
          secondSubject: '计算机应用技术',
          degreeSubject: '工学',
          research: '人工智能与图像处理',
          computerLevel: '熟练',
          skillCert: '否'
        },
        // 博士后经历
        postdoctoral: null,
        // 科研能力（各类论文数）
        paperStats: {
          sci: 2,
          ei: 1,
          istp: 0,
          rucopy: 1,
          core: 3,
          national: 1,
          ministerial: 2,
          provincial: 2,
          municipal: 1
        },
        // 论文成果
        papers: [{
          id: 'paper-001',
          title: '基于深度学习的图像识别研究',
          authors: candidate.name + ', 张三, 李四',
          role: '第一作者',
          rank: '1',
          journal: '计算机学报',
          level: 'SCI一区',
          indexType: 'SCI',
          publishDate: '2024-03',
          impact: '3.5',
          representative: '是',
          certificate: '论文全文.pdf'
        }],
        // 著作
        publications: [{
          id: 'pub-001',
          title: '人工智能导论',
          authors: candidate.name + '(参编)',
          role: '参编',
          publisher: '高等教育出版社',
          publisherLevel: '国家级',
          publishDate: '2023-09',
          type: '教材',
          isbn: '978-7-04-058123-4',
          words: '8.5万字',
          certificate: '著作封面及版权页.pdf'
        }],
        // 专利
        patents: [{
          id: 'patent-001',
          title: '一种智能图像处理方法',
          type: '发明专利',
          status: '已授权',
          patentNo: 'ZL202310001234.5',
          applyDate: '2023-01',
          grantDate: '2023-11',
          authors: candidate.name + '(第一发明人)',
          rank: '1',
          owner: '某高校',
          certificate: '专利证书.pdf'
        }],
        // 科研项目
        projects: [{
          id: 'proj-001',
          category: '纵向',
          title: '人工智能关键技术研究',
          projectNo: '2022A1515011234',
          type: '省部级',
          level: '省级',
          origin: '广东省自然科学基金',
          role: '参与',
          startDate: '2022-01',
          endDate: '2024-12',
          funding: '50万元',
          status: '已结项'
        }],
        // 获奖情况
        awards: [{
          id: 'award-001',
          title: '优秀科研成果奖',
          achievement: '基于深度学习的图像识别研究',
          category: '科研类',
          level: '省级',
          grade: '二等奖',
          year: '2023',
          organization: '教育厅',
          rank: '2',
          certificate: '获奖证书.pdf'
        }],
        // 作品集
        portfolios: [],
        // 外语等级
        language: {
          type: '英语',
          level: '六级',
          score: '528',
          acquireDate: '2016-06'
        },
        // 附件材料
        attachments: candidate.materials || ['个人简历.pdf', '学历学位证明.pdf', '代表性成果.zip'],
        // AI审核标记
        aiReview: {
          hasRisk: candidate.requirements ? candidate.requirements.some(function (r) { return !r.matched }) : false,
          advice: candidate.ai ? candidate.ai.join('；') : '材料完整，符合岗位要求',
          mismatchedFields: candidate.requirements ? candidate.requirements.filter(function (r) { return !r.matched }).map(function (r) { return r.label }) : []
        }
      }
    }
  }
})()
