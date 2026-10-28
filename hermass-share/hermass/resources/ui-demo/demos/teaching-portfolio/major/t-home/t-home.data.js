/* ===================== 数据 ===================== */
var PERFORMANCE_ITEMS = [
  { label: '教学工作量', value: '288', unit: '学时' },
  { label: '学生评教均分', value: '4.78', unit: '/5' },
  { label: '科研经费', value: '42.6', unit: '万元' },
  { label: '发表论文', value: '6', unit: '篇' },
  { label: '指导学生', value: '18', unit: '人' },
  { label: '获奖成果', value: '3', unit: '项' }
];

var COURSE_STATS = [
  { name: '国家级', value: 2, percent: 20.0 },
  { name: '省部级', value: 3, percent: 30.0 },
  { name: '校级', value: 1, percent: 10.0 },
  { name: '院级', value: 4, percent: 40.0 }
];

var GUIDANCE_STATS = [
  { name: '专科生', count: 45, unit: '人', color: '#2f6bff' },
  { name: '本科生', count: 55, unit: '人', color: '#00b4a2' }
];

var RESEARCH_STATS = [
  { id: 'project', cls: 'rc-purple', name: '教研项目', value: 12, unit: '项', percent: 33.3 },
  { id: 'research', cls: 'rc-cyan', name: '科研项目', value: 8, unit: '项', percent: 22.2 },
  { id: 'paper', cls: 'rc-pink', name: '论文/著作', value: 10, unit: '项', percent: 27.8 },
  { id: 'award', cls: 'rc-blue', name: '获奖成果', value: 6, unit: '项', percent: 16.7 }
];

var PERIOD_FACTORS = { '3y': 0.72, '5y': 1, 'all': 1.4 };

var COURSES_BY_TERM = {
  '2025-2026-spring': [
    { id: 'c1', name: '数据结构', totalHours: 48, remainingHours: 12 },
    { id: 'c2', name: 'Python 程序设计', totalHours: 40, remainingHours: 8 },
    { id: 'c3', name: 'Web 前端开发技术', totalHours: 40, remainingHours: 20 },
    { id: 'c4', name: '数据库原理与应用实训', totalHours: 32, remainingHours: 16 }
  ],
  '2024-2025-fall': [
    { id: 'c5', name: '计算机网络原理', totalHours: 40, remainingHours: 0 },
    { id: 'c6', name: '操作系统', totalHours: 48, remainingHours: 0 },
    { id: 'c7', name: '软件工程导论', totalHours: 40, remainingHours: 0 }
  ],
  '2024-2025-spring': [
    { id: 'c8', name: 'C 语言程序设计', totalHours: 32, remainingHours: 0 },
    { id: 'c9', name: '信息系统分析与设计', totalHours: 32, remainingHours: 0 }
  ]
};

var COMPLETENESS_DATA = [
  ['基本信息', 10, 10],
  ['学历与资格', 9, 10],
  ['教学信息', 18, 20],
  ['企业实践', 8, 10],
  ['成果与荣誉', 15, 17],
  ['进修培训', 7, 8],
  ['社会服务', 6, 9],
  ['任职情况', 5, 6],
  ['其他教育工作', 8, 10]
];
