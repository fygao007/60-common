/**
 * 教师成长档案袋 · 管理侧统一口径源（发展规划与师资队伍建设）
 *
 * 依据：《教师成长档案袋：管理侧学校发展与师资队伍建设详细设计》v1.0
 *       （对应 ontology/product-world/designs/teacher-growth-management-design.json）
 *
 * 边界（文档第二节 / 第九节明令）：
 *  - 本文件是管理侧（方案 / 任务 / 要求 / 梯队 / 分析快照）的**唯一口径源**。
 *  - **不读五维评分**：`computeScore`、`runKpiCheck`、`DIMENSIONS_5` 属教师个人评价底座，
 *    管理侧一律不使用。禁止用任意综合分把教师分成高低等级，也禁止用个人评分 target 当校级要求。
 *  - 字段口径引用 ontology 已登记的 `Business.teacher-growth.*`（当前 status=draft）。
 *  - 平台侧物理目录仍在 teacher/<view>/，但本文件服务的是管理角色页面，与教师个人页无关。
 *
 * 状态语义（文档 6.3 明确"状态不要混成一个字段"）：
 *  configurationStatus 配置状态 / 分析结果 resultState / 行动状态 actionStatus / 逾期标记
 *  / 数据新鲜度 分别是独立字段，不互相覆盖。
 */

// ============================================================================
// 一、词典（候选值只在 ontology 维护，页面只读取；此处为草案镜像）
// ============================================================================

// B.planPeriodType
export const PERIOD_TYPES = ['年度方案', '中期方案', '专项方案']

// B.stageName —— 待学校确认（文档第十节 openQuestion 1），当前为标注草案
export const SCHOOL_STAGES = ['双高建设攻坚期', '职业本科申办期', '本科层次办学适应期']

// B.priority
export const PRIORITIES = ['关键', '重要', '普通']

// B.taskDirection —— 任务方向不预设为学校正式分类，由学校维护（文档第四节）
export const TASK_DIRECTIONS = [
  '高层次人才引进',
  '双师型教师培养',
  '专业带头人培育',
  '青年教师成长',
  '教学创新团队建设',
  '科研能力提升',
  '师德师风建设',
]

// B.requirementType —— 六种类型（文档 M06）
export const REQUIREMENT_TYPES = ['人数', '比例', '覆盖', '梯队', '培养完成', '人工评估']

// B.targetOperator
export const TARGET_OPERATORS = {
  人数: ['不低于', '不高于', '区间'],
  比例: ['不低于', '不高于', '区间'],
  覆盖: ['每单位不低于'],
  梯队: ['各层区间'],
  培养完成: ['不低于'],
  人工评估: ['人工判定'],
}

// B.resultState —— 要求分析结果（派生）。未分析不得混作缺口。
export const RESULT_STATES = {
  satisfied: { label: '已满足', tone: 'success' },
  gap: { label: '存在缺口', tone: 'danger' },
  pending: { label: '待核验', tone: 'warning' },
  manual: { label: '待人工评估', tone: 'info' },
  notApplicable: { label: '不适用', tone: 'default' },
  notAnalyzed: { label: '未分析', tone: 'default' },
}

// B.configurationStatus —— 配置生命周期状态
export const CONFIG_STATUSES = {
  draft: { label: '草稿', tone: 'default' },
  pending: { label: '待确认', tone: 'warning' },
  published: { label: '已发布', tone: 'success' },
  archived: { label: '已归档', tone: 'default' },
  superseded: { label: '已替代', tone: 'info' },
}

export const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '草稿' },
  { key: 'pending', label: '待确认' },
  { key: 'published', label: '已发布' },
  { key: 'archived', label: '已归档' },
]

// 组织主数据（Organization.organizationId；不使用自由文本组织名）
export const ORGANIZATIONS = [
  { id: 'org-univ', name: '深圳职业技术大学', children: [
    { id: 'org-ei', name: '电子与通信工程学院' },
    { id: 'org-ai', name: '人工智能学院' },
    { id: 'org-me', name: '机电工程学院' },
    { id: 'org-mg', name: '管理学院' },
    { id: 'org-ad', name: '艺术设计学院' },
    { id: 'org-au', name: '汽车与交通学院' },
    { id: 'org-mc', name: '医学技术与护理学院' },
    { id: 'org-ce', name: '建筑工程学院' },
  ] },
]

export const ORG_OPTIONS = ORGANIZATIONS.flatMap((root) => [root, ...(root.children || [])])

export function orgName(orgId) {
  const hit = ORG_OPTIONS.find((item) => item.id === orgId)
  return hit ? hit.name : orgId
}

// 归口责任人与管理角色（demo 内固定，不代表真实授权）
export const OWNER_PERSONS = [
  { id: 'u-zhang', name: '张启明', orgId: 'org-univ', title: '人事处处长' },
  { id: 'u-li', name: '李慧', orgId: 'org-univ', title: '教师发展中心主任' },
  { id: 'u-wang', name: '王建国', orgId: 'org-univ', title: '教务处处长' },
  { id: 'u-chen', name: '陈晓', orgId: 'org-ei', title: '电子与通信工程学院院长' },
]

export function personName(personId) {
  const hit = OWNER_PERSONS.find((item) => item.id === personId)
  return hit ? hit.name : personId
}

// B.documentRefs —— 依据文件（引用集合，不复制文件本体）
export const DOCUMENT_LIBRARY = [
  { id: 'doc-20hao', name: '校发〔2026〕20号《人员招聘管理办法》', type: '校内制度' },
  { id: 'doc-shuanggao', name: '《广东省职业教育"扩容提质强服务"实施方案》', type: '上级文件' },
  { id: 'doc-shizi', name: '《深圳职业技术大学"十五五"师资队伍建设规划》', type: '校内规划' },
  { id: 'doc-shuangshi', name: '《职业教育"双师型"教师队伍建设改革意见》', type: '上级文件' },
  { id: 'doc-benke', name: '《职业学校本科层次办学条件（试行）》', type: '上级文件' },
]

// ============================================================================
// 二、统一分析快照（管理侧唯一口径）
// ============================================================================
// 文档 M10 与第六节：任一条件变化，所有卡片/图/矩阵都按**同一快照**重新查询；
// 加载失败保留旧完整快照并明确时间，不允许卡片新旧混用。
// 这里的 populationCount 与 l-faculty-dashboard 的 SCHOOL_SNAPSHOT.total 保持同源（1864），
// 用于消除"页面内 1864 快照与另一引擎人群混用"的既有问题；批次 3 会把该页改为直接读本快照。

export const ANALYSIS_SNAPSHOTS = [
  {
    snapshotId: 'SNAP-20260912-01',
    planId: 'PL-2026-001',
    schemeVersion: 'v1.2',
    ladderId: 'LAD-2026-01',
    dataCutoff: '2026-09-12 24:00',
    calculatedAt: '2026-09-13 02:10',
    populationCount: 1864,
    levelPopulation: 612,
    unclassifiedPopulation: 1252,
    unresolvedPopulation: 34, // 附加标记，不参与层人数求和
    requirementSummary: { satisfied: 5, gap: 4, pending: 2, manual: 1 },
    configurationCoverage: { computable: 10, total: 12 },
    measuredChange: '同口径（2025—2026 学年 vs 2024—2025 学年）',
  },
  {
    snapshotId: 'SNAP-20260912-02',
    planId: 'PL-2026-002',
    schemeVersion: 'v1.0',
    ladderId: 'LAD-2026-01',
    dataCutoff: '2026-09-12 24:00',
    calculatedAt: '2026-09-13 02:12',
    populationCount: 1864,
    levelPopulation: 612,
    unclassifiedPopulation: 1252,
    unresolvedPopulation: 34,
    requirementSummary: { satisfied: 2, gap: 2, pending: 1, manual: 1 },
    configurationCoverage: { computable: 5, total: 6 },
    measuredChange: '同口径（2025—2026 学年 vs 2024—2025 学年）',
  },
]

export function snapshotForPlan(planId) {
  return ANALYSIS_SNAPSHOTS.find((item) => item.planId === planId) || null
}

// ============================================================================
// 三、发展方案台账（M01 / M02）
// ============================================================================

let planSeq = 100

/**
 * 方案记录。字段名与 ontology `Business.teacher-growth.*` 一一对应。
 * 派生字段（requirementCount / businessUpdatedAt）由本文件统一计算，页面不自行拼装。
 */
const PLAN_ROWS = [
  {
    planId: 'PL-2026-001',
    planCode: 'FZ-2026-001',
    planName: '"十五五"师资队伍建设规划（2026—2030）',
    planPeriodType: '中期方案',
    stageName: '职业本科申办期',
    stageDescription: '以职业本科申办为核心，结构性补强高层次人才与双师队伍。',
    periodStart: '2026-01-01',
    periodEnd: '2030-12-31',
    baselineDate: '2026-01-01',
    scopeDefinition: { organizations: ['org-univ'], personCategories: ['专任教师'], employmentStates: ['在职'], primaryOnly: true },
    ownerOrganization: 'org-univ',
    ownerPerson: 'u-zhang',
    documentRefs: ['doc-shizi', 'doc-shuanggao'],
    sourceClause: '到2030年，专任教师中具有博士学位者比例不低于55%，双师型教师占比不低于85%。',
    configurationStatus: 'published',
    schemeVersion: 'v1.2',
    effectiveFrom: '2026-02-01',
    changeReason: '按2026年本科层次办学条件复核，上调博士学位比例目标。',
    publicationTime: '2026-02-01 09:20',
    businessUpdatedAt: '2026-09-28 16:40',
    requirementCount: 12,
    taskCount: 4,
  },
  {
    planId: 'PL-2026-002',
    planCode: 'FZ-2026-002',
    planName: '2026年度高层次人才引育专项方案',
    planPeriodType: '专项方案',
    stageName: '职业本科申办期',
    stageDescription: '面向重点专业群的高层次人才引进与培育专项行动。',
    periodStart: '2026-01-01',
    periodEnd: '2026-12-31',
    baselineDate: '2026-01-01',
    scopeDefinition: { organizations: ['org-univ'], personCategories: ['专任教师'], employmentStates: ['在职'], primaryOnly: true },
    ownerOrganization: 'org-univ',
    ownerPerson: 'u-zhang',
    documentRefs: ['doc-benke'],
    sourceClause: '申办期内重点专业群须配备具有博士学位的专业带头人。',
    configurationStatus: 'published',
    schemeVersion: 'v1.0',
    effectiveFrom: '2026-03-01',
    changeReason: '',
    publicationTime: '2026-03-01 10:05',
    businessUpdatedAt: '2026-09-20 11:12',
    requirementCount: 6,
    taskCount: 3,
  },
  {
    planId: 'PL-2026-003',
    planCode: 'FZ-2026-003',
    planName: '2026—2027学年双师型教师队伍建设方案',
    planPeriodType: '年度方案',
    stageName: '职业本科申办期',
    stageDescription: '以企业实践与技能等级为抓手，年度性提升双师比例。',
    periodStart: '2026-09-01',
    periodEnd: '2027-08-31',
    baselineDate: '2026-09-01',
    scopeDefinition: { organizations: ['org-univ'], personCategories: ['专任教师'], employmentStates: ['在职'], primaryOnly: true },
    ownerOrganization: 'org-univ',
    ownerPerson: 'u-li',
    documentRefs: ['doc-shuangshi'],
    sourceClause: '双师型教师占专业课教师比例不低于85%。',
    configurationStatus: 'pending',
    schemeVersion: 'v0.3',
    effectiveFrom: '2026-10-01',
    changeReason: '首版编制。',
    publicationTime: '',
    businessUpdatedAt: '2026-10-06 15:30',
    requirementCount: 4,
    taskCount: 2,
  },
  {
    planId: 'PL-2026-004',
    planCode: 'FZ-2026-004',
    planName: '专业带头人梯队培育方案',
    planPeriodType: '专项方案',
    stageName: '职业本科申办期',
    stageDescription: '面向专业带头人的梯队化培育与认定。',
    periodStart: '2026-10-01',
    periodEnd: '2028-09-30',
    baselineDate: '2026-10-01',
    scopeDefinition: { organizations: ['org-univ'], personCategories: ['专任教师'], employmentStates: ['在职'], primaryOnly: true },
    ownerOrganization: 'org-univ',
    ownerPerson: 'u-wang',
    documentRefs: [],
    sourceClause: '',
    configurationStatus: 'draft',
    schemeVersion: 'v0.1',
    effectiveFrom: '',
    changeReason: '',
    publicationTime: '',
    businessUpdatedAt: '2026-10-08 09:15',
    requirementCount: 2,
    taskCount: 1,
  },
  {
    planId: 'PL-2026-005',
    planCode: 'FZ-2026-005',
    planName: '青年教师三年成长支持方案',
    planPeriodType: '专项方案',
    stageName: '职业本科申办期',
    stageDescription: '入职三年内青年教师的导师制与教学能力培养。',
    periodStart: '2026-09-01',
    periodEnd: '2029-08-31',
    baselineDate: '2026-09-01',
    scopeDefinition: { organizations: ['org-univ'], personCategories: ['专任教师'], employmentStates: ['在职'], primaryOnly: true },
    ownerOrganization: 'org-univ',
    ownerPerson: 'u-li',
    documentRefs: [],
    sourceClause: '',
    configurationStatus: 'draft',
    schemeVersion: 'v0.1',
    effectiveFrom: '',
    changeReason: '',
    publicationTime: '',
    businessUpdatedAt: '2026-10-07 17:02',
    requirementCount: 0,
    taskCount: 0,
  },
  {
    planId: 'PL-2025-002',
    planCode: 'FZ-2025-002',
    planName: '2025年度师资结构优化方案',
    planPeriodType: '年度方案',
    stageName: '双高建设攻坚期',
    stageDescription: '上一周期年度方案，聚焦职称与学历结构优化。',
    periodStart: '2025-01-01',
    periodEnd: '2025-12-31',
    baselineDate: '2025-01-01',
    scopeDefinition: { organizations: ['org-univ'], personCategories: ['专任教师'], employmentStates: ['在职'], primaryOnly: true },
    ownerOrganization: 'org-univ',
    ownerPerson: 'u-zhang',
    documentRefs: ['doc-shuanggao'],
    sourceClause: '高级职称占比不低于38%。',
    configurationStatus: 'archived',
    schemeVersion: 'v1.0',
    effectiveFrom: '2025-02-01',
    changeReason: '',
    publicationTime: '2025-02-01 09:00',
    businessUpdatedAt: '2026-01-08 10:00',
    requirementCount: 5,
    taskCount: 2,
  },
  {
    planId: 'PL-2025-001',
    planCode: 'FZ-2025-001',
    planName: '"十四五"师资队伍建设规划（2021—2025）',
    planPeriodType: '中期方案',
    stageName: '双高建设攻坚期',
    stageDescription: '上一轮五年规划，已被"十五五"规划替代。',
    periodStart: '2021-01-01',
    periodEnd: '2025-12-31',
    baselineDate: '2021-01-01',
    scopeDefinition: { organizations: ['org-univ'], personCategories: ['专任教师'], employmentStates: ['在职'], primaryOnly: true },
    ownerOrganization: 'org-univ',
    ownerPerson: 'u-zhang',
    documentRefs: ['doc-shuanggao'],
    sourceClause: '',
    configurationStatus: 'superseded',
    schemeVersion: 'v1.4',
    effectiveFrom: '2021-03-01',
    changeReason: '由"十五五"师资队伍建设规划（PL-2026-001）替代。',
    publicationTime: '2021-03-01 09:00',
    businessUpdatedAt: '2026-02-10 14:20',
    requirementCount: 9,
    taskCount: 6,
  },
]

// 审计（M07）与"显式默认方案"语义所需字段在此统一补齐：
//  - submittedAt / submittedBy：**实际提交记录**。文档 M07 明确"提交时间查询以实际提交记录实现，
//    不能拿 businessUpdatedAt 替代"，故与业务更新时间分开存储。
//  - analysisStatus：发布后初次分析结果（ok | failed | pending）。分析失败不撤销有效配置。
//  - isDefault：显式默认方案。同范围/周期允许多个专项方案，但只有一个显式默认，
//    不按更新时间自动选任意方案。
const PLAN_SEED_PATCH = {
  'PL-2026-001': { submittedAt: '2026-01-26 14:10', submittedBy: 'u-zhang', analysisStatus: 'ok', isDefault: true },
  'PL-2026-002': { submittedAt: '2026-02-24 09:30', submittedBy: 'u-zhang', analysisStatus: 'ok', isDefault: false },
  'PL-2026-003': { submittedAt: '2026-10-06 15:30', submittedBy: 'u-li', analysisStatus: 'pending', isDefault: false },
  'PL-2026-004': { submittedAt: '', submittedBy: '', analysisStatus: 'pending', isDefault: false },
  // PL-2026-005 曾于 10-06 提交、10-07 被退回（见 AUDIT_DECISIONS 的 return 记录），
  // 因此必须保留实际提交时间，否则「我已处理」会出现"有决定、无提交"的错账。
  'PL-2026-005': { submittedAt: '2026-10-06 16:40', submittedBy: 'u-li', analysisStatus: 'pending', isDefault: false },
  'PL-2025-001': { submittedAt: '2021-02-20 10:00', submittedBy: 'u-zhang', analysisStatus: 'ok', isDefault: false },
  'PL-2025-002': { submittedAt: '2025-01-22 10:00', submittedBy: 'u-zhang', analysisStatus: 'ok', isDefault: false },
}

// 复制/修订产生的新记录统一挂在这里，页面刷新后回到初始 mock（demo 无持久化后端）
let PLAN_STORE = PLAN_ROWS.map((row) => ({
  submittedAt: '',
  submittedBy: '',
  analysisStatus: 'pending',
  isDefault: false,
  ...row,
  ...(PLAN_SEED_PATCH[row.planId] || {}),
}))

// 历史流转记录（新的在前）。初始提交、确认意见、发布时间必须与服务端记录一致：
// 文档 M07「历史」要求保留提交、意见、发布时间、版本关系、启停和默认切换记录，
// 因此与 AUDIT_DECISIONS 中已存在的决定一一对应，避免出现"有决定、无提交记录"的错账。
let PLAN_EVENTS = [
  { id: 'EV-1', planId: 'PL-2026-004', type: 'created', label: '创建草稿', at: '2026-10-08 09:15', operator: '王建国' },
  { id: 'EV-2', planId: 'PL-2026-005', type: 'returned', label: '退回修改：「青年教师导师制覆盖」未选择统计指标引用，也未设置证据核验规则', at: '2026-10-07 17:20', operator: '张启明' },
  { id: 'EV-3', planId: 'PL-2026-005', type: 'submitted', label: '提交确认', at: '2026-10-06 16:40', operator: '李慧' },
  { id: 'EV-4', planId: 'PL-2026-003', type: 'submitted', label: '提交确认', at: '2026-10-06 15:30', operator: '李慧' },
  { id: 'EV-5', planId: 'PL-2026-002', type: 'published', label: '确认通过并发布 v1.0（生效日期 2026-03-01）', at: '2026-03-01 10:05', operator: '张启明' },
  { id: 'EV-6', planId: 'PL-2026-002', type: 'submitted', label: '提交确认', at: '2026-02-24 09:30', operator: '张启明' },
  { id: 'EV-7', planId: 'PL-2026-001', type: 'published', label: '确认通过并发布 v1.2（生效日期 2026-02-01）', at: '2026-02-01 09:20', operator: '张启明' },
  { id: 'EV-8', planId: 'PL-2026-001', type: 'submitted', label: '提交确认', at: '2026-01-26 14:10', operator: '张启明' },
  { id: 'EV-9', planId: 'PL-2025-002', type: 'published', label: '确认通过并发布 v1.0（生效日期 2025-02-01）', at: '2025-02-01 09:00', operator: '张启明' },
  { id: 'EV-10', planId: 'PL-2025-001', type: 'superseded', label: '默认方案切换至 FZ-2025-002 v1.0，本版本保留只读', at: '2025-02-01 09:00', operator: '张启明' },
  { id: 'EV-11', planId: 'PL-2025-002', type: 'submitted', label: '提交确认', at: '2025-01-22 10:00', operator: '张启明' },
  { id: 'EV-12', planId: 'PL-2025-001', type: 'published', label: '确认通过并发布 v1.0（生效日期 2021-02-20）', at: '2021-02-20 10:30', operator: '张启明' },
  { id: 'EV-13', planId: 'PL-2025-001', type: 'submitted', label: '提交确认', at: '2021-02-20 10:00', operator: '张启明' },
]

function nowStamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function today() {
  return nowStamp().slice(0, 10)
}

function nextCode(periodStart) {
  const year = (periodStart || today()).slice(0, 4)
  const used = PLAN_STORE.filter((row) => row.planCode.startsWith(`FZ-${year}-`)).length
  return `FZ-${year}-${String(used + 1).padStart(3, '0')}`
}

function nextPlanId() {
  planSeq += 1
  return `PL-${new Date().getFullYear()}-${String(planSeq).padStart(3, '0')}`
}

function logEvent(planId, type, label, operator) {
  PLAN_EVENTS = [
    { id: `EV-${PLAN_EVENTS.length + 1}`, planId, type, label, at: nowStamp(), operator: operator || '张启明' },
    ...PLAN_EVENTS,
  ]
}

export function planEvents(planId) {
  return PLAN_EVENTS.filter((item) => item.planId === planId)
}

// ---------------------------------------------------------------------------
// 查询
// ---------------------------------------------------------------------------

export const EMPTY_FILTERS = {
  keyword: '',
  statuses: [],
  periodType: '',
  ownerOrganization: '',
  periodStart: '',
}

/**
 * M01 查询规则（文档"查询规则"）：
 *  - 筛选采用"编辑条件 → 查询生效"，因此这里只接收已提交的条件。
 *  - 默认排序：业务最近更新时间倒序，方案编号作为稳定次序。
 *  - 高级筛选 periodStart：与查询期间重叠的方案（即 periodEnd >= 条件值）。
 */
export function queryPlans(filters) {
  const f = { ...EMPTY_FILTERS, ...(filters || {}) }
  const keyword = (f.keyword || '').trim().toLowerCase()
  const rows = PLAN_STORE.filter((row) => {
    if (keyword) {
      const hit = `${row.planName}${row.planCode}`.toLowerCase().includes(keyword)
      if (!hit) return false
    }
    if (f.statuses && f.statuses.length && !f.statuses.includes(row.configurationStatus)) return false
    if (f.periodType && row.planPeriodType !== f.periodType) return false
    if (f.ownerOrganization && row.ownerOrganization !== f.ownerOrganization) return false
    if (f.periodStart && row.periodEnd < f.periodStart) return false
    return true
  })
  return rows.sort((a, b) => {
    if (a.businessUpdatedAt === b.businessUpdatedAt) return a.planCode < b.planCode ? 1 : -1
    return a.businessUpdatedAt < b.businessUpdatedAt ? 1 : -1
  }).map(decoratePlan)
}

export function paginate(rows, page, pageSize) {
  const safeSize = pageSize || 20
  const safePage = Math.max(1, page || 1)
  const start = (safePage - 1) * safeSize
  return { rows: rows.slice(start, start + safeSize), total: rows.length }
}

export function statusCounts() {
  const counts = { all: PLAN_STORE.length, draft: 0, pending: 0, published: 0, archived: 0, superseded: 0 }
  PLAN_STORE.forEach((row) => { counts[row.configurationStatus] = (counts[row.configurationStatus] || 0) + 1 })
  return counts
}

/** 方案血缘：修订版本继承被修订方案的任务与要求主体。 */
function lineageOf(planId) {
  const row = PLAN_STORE.find((item) => item.planId === planId)
  return (row && row.revisedFromPlanId) || planId
}

/**
 * 派生字段统一由 store 计算，页面不自行拼装（M01/M03/M05 显示同一口径）：
 * requirementCount / taskCount 按**台账实际行数**统计，避免与台账列表出现数量漂移。
 */
function decoratePlan(row) {
  const key = row.revisedFromPlanId || row.planId
  return {
    ...row,
    requirementCount: REQUIREMENT_STORE.filter((item) => item.planId === key).length,
    taskCount: TASK_STORE.filter((item) => item.planId === key).length,
  }
}

/** 原始存储行（可变）。所有状态机必须作用于原始行——getPlan 返回的是派生副本，改副本不落库。 */
function rawPlan(planId) {
  return PLAN_STORE.find((item) => item.planId === planId) || null
}

export function getPlan(planId) {
  const row = rawPlan(planId)
  return row ? decoratePlan(row) : null
}

export function allPlans() {
  return PLAN_STORE.map(decoratePlan)
}

// ---------------------------------------------------------------------------
// 行操作（状态机；文档 M01"行操作"与"复制区别"）
// ---------------------------------------------------------------------------

/** 草稿删除前置条件：无提交历史且无业务引用。 */
export function canDeleteDraft(planId) {
  const plan = getPlan(planId)
  if (!plan || plan.configurationStatus !== 'draft') {
    return { ok: false, reason: '仅草稿可删除；已有提交历史的版本请使用归档。' }
  }
  const submitted = planEvents(planId).some((item) => item.type !== 'created')
  if (submitted) return { ok: false, reason: '该草稿存在提交历史，不能删除，请使用归档。' }
  if (plan.requirementCount > 0) {
    return { ok: false, reason: `该草稿已关联 ${plan.requirementCount} 项师资要求，属业务引用，不能删除。` }
  }
  return { ok: true }
}

export function deleteDraft(planId) {
  const check = canDeleteDraft(planId)
  if (!check.ok) return check
  PLAN_STORE = PLAN_STORE.filter((row) => row.planId !== planId)
  return { ok: true }
}

export function submitForConfirm(planId) {
  const plan = getPlan(planId)
  if (!plan || plan.configurationStatus !== 'draft') return { ok: false, reason: '仅草稿可提交确认。' }
  const validation = validatePlanForPublish(planId)
  const row = rawPlan(planId)
  row.configurationStatus = 'pending'
  row.submittedAt = nowStamp()
  row.submittedBy = row.ownerPerson || ''
  row.notifyPerson = row.notifyPerson || OTHER_CONFIRM_PERSON
  row.businessUpdatedAt = nowStamp()
  ensureAuditDecision(planId)
  logEvent(planId, 'submitted', '提交确认')
  return { ok: true, validation }
}

export function withdrawSubmission(planId) {
  const plan = getPlan(planId)
  if (!plan || plan.configurationStatus !== 'pending') return { ok: false, reason: '当前节点不允许撤回。' }
  const row = rawPlan(planId)
  row.configurationStatus = 'draft'
  row.businessUpdatedAt = nowStamp()
  logEvent(planId, 'withdrawn', '撤回提交')
  return { ok: true }
}

export function archivePlan(planId) {
  const plan = getPlan(planId)
  if (!plan) return { ok: false, reason: '方案不存在。' }
  if (plan.configurationStatus !== 'published') return { ok: false, reason: '仅已发布版本可归档。' }
  const row = rawPlan(planId)
  row.configurationStatus = 'archived'
  row.isDefault = false
  row.businessUpdatedAt = nowStamp()
  logEvent(planId, 'archived', '归档')
  return { ok: true }
}

/**
 * 复制为新方案：生成新 planId，**不继承**原认定名单与建设行动，要求与任务需重新确认。
 * 与"创建修订版本"严格区分（文档 M01"复制区别"）。
 */
export function duplicateAsNewPlan(planId) {
  const source = getPlan(planId)
  if (!source) return { ok: false, reason: '方案不存在。' }
  const planIdNew = nextPlanId()
  const code = nextCode(source.periodStart)
  PLAN_STORE = [
    ...PLAN_STORE,
    {
      ...source,
      planId: planIdNew,
      planCode: code,
      planName: `${source.planName}（复制）`,
      configurationStatus: 'draft',
      schemeVersion: 'v0.1',
      publicationTime: '',
      effectiveFrom: '',
      changeReason: `复制自 ${source.planCode}，未继承认定名单与建设行动。`,
      businessUpdatedAt: nowStamp(),
      requirementCount: 0,
      taskCount: 0,
    },
  ]
  logEvent(planIdNew, 'created', `复制自 ${source.planCode}`, '张启明')
  return { ok: true, planId: planIdNew, message: '已生成新方案草稿；原方案的认定名单与建设行动不会被继承。' }
}

/** 创建修订版本：保持方案主体，版本号递增，旧发布版本保留可读。 */
export function createRevision(planId) {
  const source = getPlan(planId)
  if (!source) return { ok: false, reason: '方案不存在。' }
  if (!['published', 'archived', 'superseded'].includes(source.configurationStatus)) {
    return { ok: false, reason: '仅已发布或已归档版本可创建修订版本。' }
  }
  const planIdNew = nextPlanId()
  const versionNumber = Number(String(source.schemeVersion).replace(/^v/, '').split('.')[0]) + 1
  PLAN_STORE = [
    ...PLAN_STORE,
    {
      ...source,
      planId: planIdNew,
      planName: source.planName,
      configurationStatus: 'draft',
      schemeVersion: `v${versionNumber}.0`,
      publicationTime: '',
      effectiveFrom: '',
      changeReason: '',
      revisedFromPlanId: source.planId,
      businessUpdatedAt: nowStamp(),
    },
  ]
  logEvent(planIdNew, 'created', `由 ${source.planCode} ${source.schemeVersion} 创建修订版本`, '张启明')
  return {
    ok: true,
    planId: planIdNew,
    message: `已创建 ${source.schemeVersion} 的修订版本；旧发布版本 ${source.schemeVersion} 保持不变。`,
  }
}

export function createPlanDraft(partial) {
  const planId = nextPlanId()
  const periodStart = partial.periodStart || today()
  const row = {
    planId,
    planCode: nextCode(periodStart),
    planName: partial.planName || '',
    planPeriodType: partial.planPeriodType || '',
    stageName: partial.stageName || '',
    stageDescription: partial.stageDescription || '',
    periodStart,
    periodEnd: partial.periodEnd || '',
    baselineDate: partial.baselineDate || periodStart,
    scopeDefinition: partial.scopeDefinition || { organizations: [], personCategories: ['专任教师'], employmentStates: ['在职'], primaryOnly: true },
    ownerOrganization: partial.ownerOrganization || '',
    ownerPerson: partial.ownerPerson || '',
    documentRefs: partial.documentRefs || [],
    sourceClause: partial.sourceClause || '',
    configurationStatus: 'draft',
    schemeVersion: 'v0.1',
    effectiveFrom: '',
    changeReason: '',
    publicationTime: '',
    businessUpdatedAt: nowStamp(),
    requirementCount: 0,
    taskCount: 0,
  }
  PLAN_STORE = [...PLAN_STORE, row]
  logEvent(planId, 'created', '创建草稿', '张启明')
  return { ok: true, planId, plan: row }
}

export function savePlan(planId, patch) {
  const plan = getPlan(planId)
  if (!plan) return { ok: false, reason: '方案不存在。' }
  if (['published', 'archived', 'superseded'].includes(plan.configurationStatus)) {
    return { ok: false, reason: '已发布版本只读；如需调整，请创建修订版本。' }
  }
  Object.assign(rawPlan(planId), patch, { businessUpdatedAt: nowStamp() })
  return { ok: true }
}

// ---------------------------------------------------------------------------
// 发布前阻断（文档 M02"发布前阻断"）
// ---------------------------------------------------------------------------

export function validatePlanForPublish(planId) {
  const plan = getPlan(planId)
  if (!plan) return { blockers: ['方案不存在'], warnings: [] }
  const blockers = []
  const warnings = []

  if (!plan.ownerPerson) blockers.push('未指定业务责任人')
  if (!plan.ownerOrganization) blockers.push('未指定业务责任组织')
  if (!plan.periodStart || !plan.periodEnd) blockers.push('未设置有效分析周期')
  if (plan.periodStart && plan.periodEnd && plan.periodEnd < plan.periodStart) blockers.push('周期结束日期早于开始日期')
  if (plan.baselineDate && plan.periodEnd && plan.baselineDate > plan.periodEnd) blockers.push('方案基准日期晚于数据截止日期')
  if (!plan.taskCount) blockers.push('方案下没有发展任务（M03）')
  if (!plan.requirementCount) blockers.push('方案下没有师资要求（M05）')
  if (!plan.ownerPerson) warnings.push('确认策略未指定学校确认人（待学校确认，openQuestion 5）')

  // 引用停用指标的未发布要求：阻止新发布（文档 M05"引用停用指标时阻止新发布"）
  const stopped = requirementsByPlan(planId).filter((row) => {
    const indicator = row.metricRef ? getIndicator(row.metricRef) : null
    return Boolean(indicator && indicator.status === '已停用' && row.requirementStatus !== '已发布')
  })
  stopped.forEach((row) => {
    blockers.push(`要求「${row.requirementName}」引用的统计指标已停用，不能随本方案发布`)
  })
  // 任务下没有要求：提示而非阻断（允许先建任务、后配要求）
  planReadiness(planId).taskWithoutRequirement.forEach((task) => {
    warnings.push(`任务「${task.taskName}」尚未配置师资要求`)
  })

  const scope = plan.scopeDefinition || {}
  if (!scope.organizations || !scope.organizations.length) blockers.push('统计人员范围未选择组织')
  if (!scope.personCategories || !scope.personCategories.length) blockers.push('统计人员范围未选择人员类别')

  return { blockers, warnings }
}

// ---------------------------------------------------------------------------
// 统计范围预览（文档 M02"范围预览"）
// ---------------------------------------------------------------------------

// 演示用的人员排除原因统计。真实实现由服务端按 Person/任职/基础信息字段组合去重计算。
export const SCOPE_EXCLUSIONS = [
  { reason: '无主任职（兼职/外聘）', count: 96 },
  { reason: '任职状态为离职或退休', count: 41 },
  { reason: '人员类别不属于所选类别', count: 128 },
  { reason: '单位归属未完成主数据映射', count: 17 },
]

export function previewScope(scopeDefinition) {
  const scope = scopeDefinition || {}
  const organizationCount = (scope.organizations || []).length
  const base = 1864 // 与统一分析快照同源
  const categoryFactor = scope.personCategories && scope.personCategories.length ? 1 : 0
  const stateFactor = scope.employmentStates && scope.employmentStates.length ? 1 : 0.97
  const total = organizationCount && categoryFactor ? Math.round(base * stateFactor) : 0
  const excluded = SCOPE_EXCLUSIONS.map((item) => ({
    ...item,
    count: categoryFactor ? item.count : Math.round(item.count * 1.6),
  }))
  const excludedTotal = excluded.reduce((sum, item) => sum + item.count, 0)
  return {
    total,
    organizationCount,
    excluded,
    excludedTotal,
    // 方案组织范围不是登录授权；两者取交集后才是可查询范围
    intersectNote: '方案组织范围与登录授权范围取交集后才可查询；方案范围本身不放大授权。',
    sample: total ? SAMPLE_POPULATION.slice(0, 8) : [],
  }
}

const SAMPLE_POPULATION = [
  { personId: 'P-1001', name: '陈晓', zgh: '20190312', org: '电子与通信工程学院', title: '副教授', degree: '博士研究生' },
  { personId: 'P-1002', name: '刘敏', zgh: '20180527', org: '人工智能学院', title: '教授', degree: '博士研究生' },
  { personId: 'P-1003', name: '赵鹏', zgh: '20160904', org: '机电工程学院', title: '副教授', degree: '硕士研究生' },
  { personId: 'P-1004', name: '孙婷', zgh: '20210118', org: '管理学院', title: '讲师', degree: '硕士研究生' },
  { personId: 'P-1005', name: '周伟', zgh: '20140422', org: '艺术设计学院', title: '副教授', degree: '硕士研究生' },
  { personId: 'P-1006', name: '吴迪', zgh: '20220815', org: '汽车与交通学院', title: '讲师', degree: '博士研究生' },
  { personId: 'P-1007', name: '郑琳', zgh: '20170909', org: '医学技术与护理学院', title: '教授', degree: '博士研究生' },
  { personId: 'P-1008', name: '黄凯', zgh: '20151130', org: '建筑工程学院', title: '副教授', degree: '硕士研究生' },
]

export function samplePopulation() {
  return SAMPLE_POPULATION.slice()
}

// ============================================================================
// 五、发展任务（M03 台账 / M04 编辑）
// ============================================================================
// 文档 M03/M04 要点：
//  - 草稿方案下任务可编辑 / 复制 / 删除；**方案发布后任务正文锁定**，只有行动办理状态可变化；
//    要改任务口径必须修订方案，不直接改写已发布内容。
//  - 「所有关联行动完成」不自动使发展任务达标；结项须同时展示要求最新分析与未完成事项，
//    目标仍有缺口时结项要走例外确认并留说明，历史结果保持。
//  - 行动数按 actionId 去重（一个行动可关联多个要求）。

// B.taskStatus —— 系统维护（随行动推进与结项更新，不由用户直接改）
export const TASK_STATUSES = {
  notStarted: { label: '未开始', tone: 'default' },
  inProgress: { label: '进行中', tone: 'info' },
  completed: { label: '已完成', tone: 'success' },
  cancelled: { label: '已取消', tone: 'default' },
}

export const TASK_STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'notStarted', label: '未开始' },
  { key: 'inProgress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
]

export const TASK_DIRECTION_OPTIONS = TASK_DIRECTIONS.map((item) => ({ value: item, label: item }))

export const TASK_PRIORITY_OPTIONS = PRIORITIES.map((item) => ({ value: item, label: item }))

// 仅供占位提示，**不预填**：文档要求"任务保存后引导添加师资要求，但不自动生成指标或目标值"。
export const TASK_PURPOSE_HINT = '例如：到2028年，重点专业群各配备1名具有博士学位的专业带头人'

function taskRow(partial) {
  return {
    taskId: '',
    planId: '',
    taskName: '',
    taskDirection: '',
    taskPurpose: '',
    ownerOrganization: '',
    ownerPerson: '',
    collaboratingOrganizations: [],
    deadline: '',
    priority: '普通',
    taskStatus: 'notStarted',
    documentRefs: [],
    sourceClause: '',
    createdAt: '',
    submittedAt: '',
    closedAt: '',
    closedWithException: false,
    closeNote: '',
    responsibilityNote: '',
    ...partial,
  }
}

const TASK_ROWS = [
  taskRow({ taskId: 'TK-001', planId: 'PL-2026-001', taskName: '高层次人才引育', taskDirection: '高层次人才引进', taskPurpose: '到2028年，专任教师中博士学位净增 120 人；重点专业群各配备 1 名具有博士学位的专业带头人。', ownerOrganization: 'org-univ', ownerPerson: 'u-zhang', collaboratingOrganizations: ['org-ei', 'org-ai', 'org-me'], deadline: '2028-12-31', priority: '关键', taskStatus: 'inProgress', documentRefs: ['doc-shizi', 'doc-benke'], sourceClause: '到2030年，专任教师中具有博士学位者比例不低于55%。', createdAt: '2026-01-15 10:20' }),
  taskRow({ taskId: 'TK-002', planId: 'PL-2026-001', taskName: '双师型教师队伍提质', taskDirection: '双师型教师培养', taskPurpose: '到2027年，双师型教师占专业课教师比例不低于 85%；专业课教师年度企业实践累计不少于 1 个月。', ownerOrganization: 'org-univ', ownerPerson: 'u-li', collaboratingOrganizations: ['org-ei', 'org-me', 'org-au'], deadline: '2027-12-31', priority: '关键', taskStatus: 'inProgress', documentRefs: ['doc-shuangshi'], sourceClause: '双师型教师占专业课教师比例不低于85%。', createdAt: '2026-01-15 10:35' }),
  taskRow({ taskId: 'TK-003', planId: 'PL-2026-001', taskName: '专业带头人梯队培育', taskDirection: '专业带头人培育', taskPurpose: '到2029年，建立"认定—培育—使用"三级专业带头人后备人选库，各层人数达到规划区间。', ownerOrganization: 'org-univ', ownerPerson: 'u-wang', collaboratingOrganizations: ['org-ai'], deadline: '2029-06-30', priority: '重要', taskStatus: 'inProgress', documentRefs: ['doc-benke'], sourceClause: '申办期内重点专业群须配备具有博士学位的专业带头人。', createdAt: '2026-01-16 09:05' }),
  taskRow({ taskId: 'TK-004', planId: 'PL-2026-001', taskName: '青年教师成长支持', taskDirection: '青年教师成长', taskPurpose: '到2028年，入职三年内青年教师导师制覆盖 100%，三年内取得双师资格比例不低于 70%。', ownerOrganization: 'org-univ', ownerPerson: 'u-li', collaboratingOrganizations: [], deadline: '2028-06-30', priority: '普通', taskStatus: 'notStarted', documentRefs: ['doc-shizi'], sourceClause: '', createdAt: '2026-01-16 09:30' }),
  taskRow({ taskId: 'TK-005', planId: 'PL-2026-002', taskName: '重点专业群带头人引进', taskDirection: '高层次人才引进', taskPurpose: '到2026年底，重点专业群各配备 1 名具有博士学位的专业带头人。', ownerOrganization: 'org-univ', ownerPerson: 'u-zhang', collaboratingOrganizations: ['org-ei', 'org-ai'], deadline: '2026-12-31', priority: '关键', taskStatus: 'inProgress', documentRefs: ['doc-benke'], sourceClause: '申办期内重点专业群须配备具有博士学位的专业带头人。', createdAt: '2026-02-02 14:00' }),
  taskRow({ taskId: 'TK-008', planId: 'PL-2026-002', taskName: '引进人才待遇与平台保障', taskDirection: '高层次人才引进', taskPurpose: '引进人才安家与科研启动经费按标准落实率 100%，三年留存率不低于 90%。', ownerOrganization: 'org-univ', ownerPerson: 'u-zhang', collaboratingOrganizations: [], deadline: '2026-12-31', priority: '重要', taskStatus: 'inProgress', documentRefs: ['doc-benke'], sourceClause: '', createdAt: '2026-02-02 14:12' }),
  taskRow({ taskId: 'TK-009', planId: 'PL-2026-002', taskName: '柔性引才与产业教授', taskDirection: '高层次人才引进', taskPurpose: '引进产业教授不少于 10 人，柔性引进专家年度服务时长人均不少于 60 小时。', ownerOrganization: 'org-univ', ownerPerson: 'u-zhang', collaboratingOrganizations: ['org-au', 'org-me'], deadline: '2026-12-31', priority: '普通', taskStatus: 'notStarted', documentRefs: [], sourceClause: '', createdAt: '2026-02-02 14:20' }),
  taskRow({ taskId: 'TK-006', planId: 'PL-2026-003', taskName: '专业课教师企业实践全覆盖', taskDirection: '双师型教师培养', taskPurpose: '本学年专业课教师企业实践累计不少于 1 个月，覆盖全部企业实践基地单位。', ownerOrganization: 'org-univ', ownerPerson: 'u-li', collaboratingOrganizations: ['org-ei', 'org-ai', 'org-me'], deadline: '2027-08-31', priority: '关键', taskStatus: 'notStarted', documentRefs: ['doc-shuangshi'], sourceClause: '双师型教师占专业课教师比例不低于85%。', createdAt: '2026-09-10 11:00' }),
  taskRow({ taskId: 'TK-010', planId: 'PL-2026-003', taskName: '双师认定与技能等级提升', taskDirection: '双师型教师培养', taskPurpose: '本学年取得高级职业技能等级证书不少于 80 人，双师型教师认定通过率不低于 95%。', ownerOrganization: 'org-univ', ownerPerson: 'u-li', collaboratingOrganizations: [], deadline: '2027-08-31', priority: '重要', taskStatus: 'notStarted', documentRefs: [], sourceClause: '', createdAt: '2026-09-10 11:08' }),
  taskRow({ taskId: 'TK-007', planId: 'PL-2026-004', taskName: '专业带头人认定口径建设', taskDirection: '专业带头人培育', taskPurpose: '形成专业带头人认定条件与证据核验规则，建立后备人选库（口径待学校确认）。', ownerOrganization: 'org-univ', ownerPerson: 'u-wang', collaboratingOrganizations: [], deadline: '2027-12-31', priority: '重要', taskStatus: 'notStarted', documentRefs: [], sourceClause: '', createdAt: '2026-10-08 09:20' }),
  taskRow({ taskId: 'TK-011', planId: 'PL-2026-005', taskName: '青年教师导师制落地', taskDirection: '青年教师成长', taskPurpose: '入职三年内青年教师 100% 配备导师，形成年度带教与考核记录。', ownerOrganization: 'org-univ', ownerPerson: 'u-li', collaboratingOrganizations: [], deadline: '2029-08-31', priority: '普通', taskStatus: 'notStarted', documentRefs: [], sourceClause: '', createdAt: '2026-10-07 16:10' }),
  taskRow({ taskId: 'TK-012', planId: 'PL-2025-001', taskName: '高级职称结构优化', taskDirection: '科研能力提升', taskPurpose: '到2025年，高级职称占比不低于 38%。', ownerOrganization: 'org-univ', ownerPerson: 'u-zhang', collaboratingOrganizations: [], deadline: '2025-12-31', priority: '关键', taskStatus: 'completed', documentRefs: ['doc-shuanggao'], sourceClause: '', createdAt: '2021-02-18 09:00', closedAt: '2026-01-05 10:00' }),
  taskRow({ taskId: 'TK-013', planId: 'PL-2025-001', taskName: '学历结构优化', taskDirection: '高层次人才引进', taskPurpose: '到2025年，具有博士学位教师比例不低于 45%。', ownerOrganization: 'org-univ', ownerPerson: 'u-zhang', collaboratingOrganizations: [], deadline: '2025-12-31', priority: '重要', taskStatus: 'completed', documentRefs: ['doc-shuanggao'], sourceClause: '', createdAt: '2021-02-18 09:05', closedAt: '2026-01-05 10:02' }),
  taskRow({ taskId: 'TK-014', planId: 'PL-2025-002', taskName: '年度师资结构优化', taskDirection: '科研能力提升', taskPurpose: '2025年度高级职称占比与双师型占比达到年度目标。', ownerOrganization: 'org-univ', ownerPerson: 'u-zhang', collaboratingOrganizations: [], deadline: '2025-12-31', priority: '关键', taskStatus: 'completed', documentRefs: ['doc-shuanggao'], sourceClause: '高级职称占比不低于38%。', createdAt: '2025-01-20 09:00', closedAt: '2026-01-08 10:05' }),
]

// 关联建设行动（M13 行动台账属批次 4；此处只提供台账所需的关联关系与计数口径）
const ACTION_ROWS = [
  { actionId: 'AC-001', planId: 'PL-2026-001', taskId: 'TK-001', actionName: '重点专业群博士带头人公开招聘', ownerOrganization: 'org-univ', actionStatus: '进行中', progress: 40, deadline: '2026-12-31', overdue: false, requirementIds: ['RQ-001', 'RQ-010'] },
  { actionId: 'AC-002', planId: 'PL-2026-001', taskId: 'TK-001', actionName: '在职教师博士学历提升资助计划', ownerOrganization: 'org-univ', actionStatus: '进行中', progress: 55, deadline: '2028-12-31', overdue: false, requirementIds: ['RQ-001'] },
  { actionId: 'AC-003', planId: 'PL-2026-001', taskId: 'TK-001', actionName: '正高级职称评审推荐机制优化', ownerOrganization: 'org-univ', actionStatus: '延期', progress: 25, deadline: '2026-06-30', overdue: true, requirementIds: ['RQ-002'] },
  { actionId: 'AC-004', planId: 'PL-2026-001', taskId: 'TK-002', actionName: '专业课教师企业实践基地共建', ownerOrganization: 'org-univ', actionStatus: '进行中', progress: 60, deadline: '2027-06-30', overdue: false, requirementIds: ['RQ-004', 'RQ-008'] },
  { actionId: 'AC-005', planId: 'PL-2026-001', taskId: 'TK-002', actionName: '双师型教师认定标准修订', ownerOrganization: 'org-univ', actionStatus: '已完成', progress: 100, deadline: '2026-08-31', overdue: false, requirementIds: ['RQ-003'] },
  { actionId: 'AC-006', planId: 'PL-2026-001', taskId: 'TK-002', actionName: '技能大师工作室建设', ownerOrganization: 'org-univ', actionStatus: '进行中', progress: 35, deadline: '2027-12-31', overdue: false, requirementIds: ['RQ-003', 'RQ-008'] },
  { actionId: 'AC-007', planId: 'PL-2026-001', taskId: 'TK-003', actionName: '专业带头人后备人选遴选', ownerOrganization: 'org-univ', actionStatus: '进行中', progress: 45, deadline: '2027-06-30', overdue: false, requirementIds: ['RQ-005', 'RQ-011'] },
  { actionId: 'AC-008', planId: 'PL-2026-001', taskId: 'TK-003', actionName: '师德师风年度考核组织', ownerOrganization: 'org-univ', actionStatus: '已完成', progress: 100, deadline: '2026-09-30', overdue: false, requirementIds: ['RQ-009'] },
  { actionId: 'AC-009', planId: 'PL-2026-002', taskId: 'TK-005', actionName: '重点专业群带头人靶向引进', ownerOrganization: 'org-univ', actionStatus: '进行中', progress: 50, deadline: '2026-12-31', overdue: false, requirementIds: ['RQ-013'] },
  { actionId: 'AC-010', planId: 'PL-2026-002', taskId: 'TK-008', actionName: '引进人才待遇包落实', ownerOrganization: 'org-univ', actionStatus: '进行中', progress: 70, deadline: '2026-12-31', overdue: false, requirementIds: ['RQ-014', 'RQ-015'] },
]

// 任务版本历史与流转记录
let TASK_EVENTS = [
  { id: 'TEV-1', taskId: 'TK-001', type: 'created', label: '创建任务', at: '2026-01-15 10:20', operator: '张启明' },
  { id: 'TEV-2', taskId: 'TK-002', type: 'created', label: '创建任务', at: '2026-01-15 10:35', operator: '张启明' },
  { id: 'TEV-3', taskId: 'TK-008', type: 'responsibility', label: '责任人由 李慧 变更为 张启明（原岗位调整）', at: '2026-06-12 09:40', operator: '张启明' },
  { id: 'TEV-4', taskId: 'TK-012', type: 'closed', label: '结项（目标已满足）', at: '2026-01-05 10:00', operator: '张启明' },
]

let TASK_STORE = TASK_ROWS.map((row) => ({ ...row }))
let TASK_ACTION_STORE = ACTION_ROWS.map((row) => ({ ...row }))
let taskSeq = 200

function nextTaskId() {
  taskSeq += 1
  return `TK-${String(taskSeq).padStart(3, '0')}`
}

function rawTask(taskId) {
  return TASK_STORE.find((row) => row.taskId === taskId) || null
}

// 行动数按 actionId 去重（文档 M03："一个行动可关联多个要求，行动数按 actionId 去重"）
export function actionCountByTask(taskId) {
  const set = new Set(TASK_ACTION_STORE.filter((row) => row.taskId === taskId).map((row) => row.actionId))
  return set.size
}

export function requirementCountByTask(taskId) {
  return REQUIREMENT_STORE.filter((row) => row.taskId === taskId).length
}

export function taskActions(taskId) {
  return TASK_ACTION_STORE.filter((row) => row.taskId === taskId).map((row) => ({ ...row }))
}

function decorateTask(row) {
  return {
    ...row,
    requirementCount: requirementCountByTask(row.taskId),
    actionCount: actionCountByTask(row.taskId),
  }
}

export function allTasks() {
  return TASK_STORE.map(decorateTask)
}

export function getTask(taskId) {
  const row = rawTask(taskId)
  return row ? decorateTask(row) : null
}

export function tasksByPlan(planId) {
  const key = lineageOf(planId)
  return TASK_STORE.filter((row) => row.planId === key).map(decorateTask)
}

/** 方案是否已发布：发布后任务正文锁定（文档 M03"发布方案的任务不能直接改写"）。 */
export function taskLedgerLocked(planId) {
  const plan = getPlan(planId)
  if (!plan) return false
  return ['published', 'archived', 'superseded'].includes(plan.configurationStatus)
}

export const EMPTY_TASK_FILTERS = {
  keyword: '',
  planId: '',
  taskDirection: '',
  ownerOrganization: '',
  statuses: [],
  deadlineFrom: '',
  deadlineTo: '',
  priority: '',
}

export function queryTasks(filters) {
  const f = { ...EMPTY_TASK_FILTERS, ...(filters || {}) }
  const keyword = (f.keyword || '').trim().toLowerCase()
  return TASK_STORE.filter((row) => {
    if (keyword && !`${row.taskName}${row.taskId}`.toLowerCase().includes(keyword)) return false
    if (f.planId && row.planId !== f.planId) return false
    if (f.taskDirection && row.taskDirection !== f.taskDirection) return false
    if (f.ownerOrganization && row.ownerOrganization !== f.ownerOrganization) return false
    if (f.statuses && f.statuses.length && !f.statuses.includes(row.taskStatus)) return false
    if (f.deadlineFrom && row.deadline && row.deadline < f.deadlineFrom) return false
    if (f.deadlineTo && row.deadline && row.deadline > f.deadlineTo) return false
    if (f.priority && row.priority !== f.priority) return false
    return true
  }).map(decorateTask).sort((a, b) => {
    if (a.deadline === b.deadline) return a.taskId < b.taskId ? -1 : 1
    return a.deadline < b.deadline ? -1 : 1
  })
}

export function taskStatusCounts() {
  const counts = { all: TASK_STORE.length, notStarted: 0, inProgress: 0, completed: 0, cancelled: 0 }
  TASK_STORE.forEach((row) => { counts[row.taskStatus] = (counts[row.taskStatus] || 0) + 1 })
  return counts
}

export function taskStatusCountsByPlan(planId) {
  const key = lineageOf(planId)
  const rows = TASK_STORE.filter((row) => row.planId === key)
  const counts = { all: rows.length, notStarted: 0, inProgress: 0, completed: 0, cancelled: 0 }
  rows.forEach((row) => { counts[row.taskStatus] = (counts[row.taskStatus] || 0) + 1 })
  return counts
}

/** 同方案同范围同名称的重复候选（文档 M04：提示候选，允许查看已有或说明不同任务，不按名称强制合并）。 */
export function findDuplicateTasks(planId, taskName, ownerOrganization, excludingTaskId) {
  const name = (taskName || '').trim()
  if (!name) return []
  return TASK_STORE
    .filter((row) => row.planId === planId
      && row.taskId !== excludingTaskId
      && row.taskName.trim() === name
      && (!ownerOrganization || row.ownerOrganization === ownerOrganization))
    .map(decorateTask)
}

/** 期限是否越出方案周期（文档 M04：应在方案周期内，例外需确认）。 */
export function deadlineOutsidePlan(planId, deadline) {
  const plan = getPlan(planId)
  if (!plan || !deadline) return false
  return Boolean((plan.periodStart && deadline < plan.periodStart) || (plan.periodEnd && deadline > plan.periodEnd))
}

function logTaskEvent(taskId, type, label, operator) {
  TASK_EVENTS = [
    { id: `TEV-${TASK_EVENTS.length + 1}`, taskId, type, label, at: nowStamp(), operator: operator || '张启明' },
    ...TASK_EVENTS,
  ]
}

export function taskEvents(taskId) {
  return TASK_EVENTS.filter((item) => item.taskId === taskId)
}

export function taskValidation(task) {
  const blockers = []
  if (!task.planId) blockers.push('未关联发展方案')
  if (!(task.taskName || '').trim()) blockers.push('发展任务名称必填')
  if (!task.taskDirection) blockers.push('发展任务方向必填（引用学校已登记分类）')
  if (!(task.taskPurpose || '').trim()) blockers.push('发展任务预期成果必填，不能提交')
  if (!task.ownerOrganization) blockers.push('业务责任组织必填')
  if (!task.ownerPerson) blockers.push('业务责任人必填')
  if (!task.deadline) blockers.push('建设完成期限必填')
  if (!task.priority) blockers.push('建设优先级必填')
  return blockers
}

export function createTaskDraft(partial) {
  const taskId = nextTaskId()
  const row = taskRow({
    ...partial,
    taskId,
    planId: partial.planId || '',
    createdAt: nowStamp(),
    taskStatus: 'notStarted',
  })
  TASK_STORE = [...TASK_STORE, row]
  logTaskEvent(taskId, 'created', '创建任务草稿')
  return { ok: true, taskId, duplicates: findDuplicateTasks(row.planId, row.taskName, row.ownerOrganization, taskId) }
}

export function saveTask(taskId, patch) {
  const row = rawTask(taskId)
  if (!row) return { ok: false, reason: '任务不存在。' }
  if (taskLedgerLocked(row.planId)) {
    return { ok: false, reason: '所属方案已发布，任务正文锁定；如需调整请创建方案修订版本。' }
  }
  Object.assign(row, patch)
  logTaskEvent(taskId, 'updated', '保存任务')
  return { ok: true, duplicates: findDuplicateTasks(row.planId, row.taskName, row.ownerOrganization, taskId) }
}

export function canDeleteTask(taskId) {
  const row = rawTask(taskId)
  if (!row) return { ok: false, reason: '任务不存在。' }
  if (taskLedgerLocked(row.planId)) {
    return { ok: false, reason: '所属方案已发布，不能删除已发布方案下的任务；请走取消任务并说明原因与行动处置。' }
  }
  if (reactiveIsReferenced(taskId)) {
    return { ok: false, reason: `该任务已关联 ${requirementCountByTask(taskId)} 项师资要求，属业务引用，不能删除。` }
  }
  if (actionCountByTask(taskId) > 0) {
    return { ok: false, reason: `该任务已关联 ${actionCountByTask(taskId)} 项建设行动，不能删除；请先处置关联行动。` }
  }
  return { ok: true }
}

function reactiveIsReferenced(taskId) {
  return requirementCountByTask(taskId) > 0
}

export function deleteTaskDraft(taskId) {
  const check = canDeleteTask(taskId)
  if (!check.ok) return check
  TASK_STORE = TASK_STORE.filter((row) => row.taskId !== taskId)
  TASK_EVENTS = TASK_EVENTS.filter((item) => item.taskId !== taskId)
  return { ok: true }
}

/** 复制任务：生成同方案新任务草稿，要求与行动**不继承**（避免误以为已配置完成）。 */
export function duplicateTask(taskId) {
  const source = getTask(taskId)
  if (!source) return { ok: false, reason: '任务不存在。' }
  if (taskLedgerLocked(source.planId)) {
    return { ok: false, reason: '所属方案已发布，不能复制已在发布版本中的任务。' }
  }
  const taskIdNew = nextTaskId()
  TASK_STORE = [...TASK_STORE, taskRow({
    ...source,
    taskId: taskIdNew,
    taskName: `${source.taskName}（副本）`,
    taskStatus: 'notStarted',
    createdAt: nowStamp(),
    closedAt: '',
    closedWithException: false,
    closeNote: '',
    submittedAt: '',
  })]
  logTaskEvent(taskIdNew, 'created', `复制自 ${source.taskId}`)
  return { ok: true, taskId: taskIdNew, message: '已生成任务副本；师资要求与建设行动不会被继承，需重新确认。' }
}

/** 取消任务：必须写原因与关联行动处置，不直接删除已发布内容。 */
export function cancelTask(taskId, options) {
  const row = rawTask(taskId)
  if (!row) return { ok: false, reason: '任务不存在。' }
  const reason = (options && options.reason || '').trim()
  if (!reason) return { ok: false, reason: '取消任务必须填写原因。' }
  const disposal = (options && options.disposal || '').trim()
  if (actionCountByTask(taskId) > 0 && !disposal) {
    return { ok: false, reason: '该任务存在关联建设行动，必须说明关联行动的处置方式。' }
  }
  row.taskStatus = 'cancelled'
  row.closeNote = reason
  logTaskEvent(taskId, 'cancelled', `取消任务：${reason}${disposal ? ` · 行动处置：${disposal}` : ''}`)
  return { ok: true }
}

/** 结项前检查：行动完成 ≠ 任务达标，须同时展示要求最新分析与未完成事项。 */
export function closeTaskReview(taskId) {
  const task = getTask(taskId)
  if (!task) return null
  const requirements = requirementsByTask(taskId)
  const actions = taskActions(taskId)
  const openActions = actions.filter((row) => row.actionStatus !== '已完成')
  const unfinished = requirements.filter((row) => row.resultState === 'gap' || row.resultState === 'pending')
  return {
    actions,
    openActions,
    requirements,
    unfinished,
    allActionsDone: actions.length > 0 && openActions.length === 0,
    hasGap: unfinished.some((row) => row.resultState === 'gap'),
  }
}

export function closeTask(taskId, options) {
  const row = rawTask(taskId)
  if (!row) return { ok: false, reason: '任务不存在。' }
  const review = closeTaskReview(taskId)
  const exception = Boolean(options && options.exception)
  const note = (options && options.note || '').trim()
  if (review.hasGap && !exception) {
    return { ok: false, reason: '仍有要求存在缺口，不能直接结项；若目标有缺口仍结项，须走例外流程并留说明。', review }
  }
  if (exception && !note) {
    return { ok: false, reason: '例外结项必须填写说明，历史结果保持。' }
  }
  row.taskStatus = 'completed'
  row.closedAt = nowStamp()
  row.closedWithException = exception
  row.closeNote = note
  logTaskEvent(taskId, 'closed', exception ? `例外结项：${note}` : '结项（目标已满足）')
  return { ok: true, review }
}

/**
 * 责任变更：责任人调岗后发起责任变更记录，**不修改原提交者与历史责任**
 * （文档 M04"责任人调岗后发起责任变更记录，不能修改原提交者或历史责任"）。
 */
export function changeTaskOwner(taskId, options) {
  const row = rawTask(taskId)
  if (!row) return { ok: false, reason: '任务不存在。' }
  const nextPerson = options && options.ownerPerson
  const reason = (options && options.reason || '').trim()
  if (!nextPerson) return { ok: false, reason: '请选择新的业务责任人。' }
  if (!reason) return { ok: false, reason: '责任变更必须填写变更原因。' }
  const previous = row.ownerPerson
  row.ownerPerson = nextPerson
  row.responsibilityNote = `责任变更：${personName(previous)} → ${personName(nextPerson)}`
  logTaskEvent(taskId, 'responsibility', `责任变更：${personName(previous)} → ${personName(nextPerson)}（${reason}）`)
  return { ok: true }
}

// ============================================================================
// 六、师资要求（M05 台账 / M06 编辑与条件配置）
// ============================================================================
// 文档 M05/M06 要点：
//  - **规则与目标分离**：统计指标定义"计算什么"，师资要求定义"在哪个范围、什么周期、目标多少"；
//    同一指标可被不同任务引用，目标不覆盖指标库默认值。
//  - 不用所有要求权重合成一个"学校发展总分"；汇总只统计 已满足/缺口/待核验/人工评估 数量并突出关键要求。
//  - 引用**停用指标**时阻止新发布；已有历史快照保留；指标版本升级后只提示影响，不静默改写已发布要求。
//  - 统计预览只标"配置预览"，测试计算不发布；保存后保留预览输入哈希，修改条件即失效。

// ---------------------------------------------------------------------------
// 6.1 统计指标库（B.metricRef 引用的组织统计指标；正式定义在 sys-indicator-lib）
// ---------------------------------------------------------------------------
export const INDICATORS = [
  { metricRef: 'IND-DOCTOR-RATE', name: '专任教师博士学位比例', unit: '%', kind: '比例', status: '启用', version: 'v2', formula: '专任教师中最高学位为博士研究生的人数 ÷ 专任教师去重人数 × 100%', denominatorHint: '专任教师去重人数' },
  { metricRef: 'IND-DOCTOR-RATE-V1', name: '专任教师博士学位比例（旧版口径）', unit: '%', kind: '比例', status: '已停用', version: 'v1', formula: '旧版按人事在库口径统计，已由 v2 替代', denominatorHint: '专任教师去重人数' },
  { metricRef: 'IND-SENIOR-COUNT', name: '正高级职称人数', unit: '人', kind: '计数', status: '启用', version: 'v1', formula: '专业技术职务级别为正高级的在职人员去重人数', denominatorHint: '' },
  { metricRef: 'IND-DUAL-RATE', name: '双师型教师占专业课教师比例', unit: '%', kind: '比例', status: '启用', version: 'v3', formula: '双师型认定通过的专任教师人数 ÷ 专业课教师去重人数 × 100%', denominatorHint: '专业课教师去重人数' },
  { metricRef: 'IND-DUAL-RATE-V1', name: '双师型教师占专业课教师比例（旧版口径）', unit: '%', kind: '比例', status: '已停用', version: 'v1', formula: '旧版以系部上报数统计，已由 v3 替代', denominatorHint: '专业课教师去重人数' },
  { metricRef: 'IND-PRACTICE-COVER', name: '专业课教师年度企业实践覆盖率', unit: '%', kind: '覆盖', status: '启用', version: 'v2', formula: '近一年企业实践累计≥1个月的人数 ÷ 专业课教师去重人数 × 100%', denominatorHint: '专业课教师去重人数' },
  { metricRef: 'IND-LADDER-LEADER', name: '专业带头人后备人选', unit: '人', kind: '梯队', status: '启用', version: 'v2', formula: '按已发布梯队版本逐层统计人数', denominatorHint: '' },
  { metricRef: 'IND-LADDER-LEADER-V1', name: '专业带头人后备人选（旧版层级口径）', unit: '人', kind: '梯队', status: '已停用', version: 'v1', formula: '旧版三级口径，已由 v2 替代', denominatorHint: '' },
  { metricRef: 'IND-MENTOR-COVER', name: '青年教师导师制覆盖率', unit: '%', kind: '覆盖', status: '启用', version: 'v1', formula: '已配备导师的入职三年内青年教师 ÷ 入职三年内青年教师去重人数 × 100%', denominatorHint: '入职三年内青年教师去重人数' },
  { metricRef: 'IND-TEACHING-AWARD', name: '省级以上教学能力比赛获奖人数', unit: '人', kind: '计数', status: '启用', version: 'v1', formula: '获奖记录已核验的教师去重人数', denominatorHint: '' },
  { metricRef: 'IND-TECH-REVENUE', name: '技术服务到账经费', unit: '万元', kind: '计数', status: '启用', version: 'v2', formula: '会计年度内技术服务到账金额合计', denominatorHint: '' },
  { metricRef: 'IND-ETHICS-PASS', name: '师德师风考核合格率', unit: '%', kind: '比例', status: '启用', version: 'v1', formula: '师德师风考核合格人数 ÷ 参加考核去重人数 × 100%', denominatorHint: '参加考核去重人数' },
  { metricRef: 'IND-YOUTH-DUAL', name: '青年教师三年内取得双师资格比例', unit: '%', kind: '比例', status: '启用', version: 'v1', formula: '入职三年内已认定双师的青年教师 ÷ 入职满三年青年教师去重人数 × 100%', denominatorHint: '入职满三年青年教师去重人数' },
  { metricRef: 'IND-LEADER-COVER', name: '重点专业群带头人配备覆盖率', unit: '%', kind: '覆盖', status: '启用', version: 'v1', formula: '已配备符合条件带头人的重点专业群 ÷ 重点专业群总数 × 100%', denominatorHint: '重点专业群总数' },
  { metricRef: 'IND-SETTLE-FUND', name: '引进人才安家与科研启动经费落实率', unit: '%', kind: '比例', status: '启用', version: 'v1', formula: '已按标准落实经费的引进人才 ÷ 期内引进人才去重人数 × 100%', denominatorHint: '期内引进人才去重人数' },
  { metricRef: 'IND-RETAIN-3Y', name: '引进人才三年留存率', unit: '%', kind: '比例', status: '启用', version: 'v1', formula: '满三年仍在职的引进人才 ÷ 满三年引进人才去重人数 × 100%', denominatorHint: '满三年引进人才去重人数' },
  { metricRef: 'IND-INDUSTRY-PROF', name: '产业教授到岗人数', unit: '人', kind: '计数', status: '启用', version: 'v1', formula: '已到岗产业教授去重人数', denominatorHint: '' },
  { metricRef: 'IND-FLEX-HOURS', name: '柔性引进专家年度服务时长', unit: '小时', kind: '计数', status: '启用', version: 'v1', formula: '柔性引进专家年度服务时长合计 ÷ 柔性引进专家人数', denominatorHint: '' },
  { metricRef: 'IND-INTEGRITY-PASS', name: '引进人才师德审查合格率', unit: '%', kind: '比例', status: '启用', version: 'v1', formula: '师德审查合格人数 ÷ 期内引进人才去重人数 × 100%', denominatorHint: '期内引进人才去重人数' },
  { metricRef: 'IND-PRACTICE-BASE', name: '企业实践基地覆盖单位数', unit: '家', kind: '覆盖', status: '启用', version: 'v1', formula: '本年度有教师实践的基地单位去重数', denominatorHint: '' },
  { metricRef: 'IND-SKILL-CERT', name: '取得高级职业技能等级证书人数', unit: '人', kind: '计数', status: '启用', version: 'v1', formula: '取得高级及以上职业技能等级证书的教师去重人数', denominatorHint: '' },
  { metricRef: 'IND-DUAL-PASS', name: '双师型教师认定通过率', unit: '%', kind: '比例', status: '启用', version: 'v1', formula: '双师认定通过人数 ÷ 申报认定去重人数 × 100%', denominatorHint: '申报认定去重人数' },
  { metricRef: 'IND-SENIOR-DEGREE', name: '具有博士学位教师比例', unit: '%', kind: '比例', status: '启用', version: 'v1', formula: '最高学位为博士的教师 ÷ 教师去重人数 × 100%', denominatorHint: '教师去重人数' },
  { metricRef: 'IND-SENIOR-TITLE-RATE', name: '高级职称占比', unit: '%', kind: '比例', status: '启用', version: 'v1', formula: '副高级及以上职称人数 ÷ 教师去重人数 × 100%', denominatorHint: '教师去重人数' },
]

export const INDICATOR_OPTIONS = INDICATORS.map((item) => ({
  value: item.metricRef,
  label: `${item.name}（${item.version}${item.status === '已停用' ? ' · 已停用' : ''}）`,
}))

export function getIndicator(metricRef) {
  return INDICATORS.find((item) => item.metricRef === metricRef) || null
}

export function indicatorName(metricRef) {
  const hit = getIndicator(metricRef)
  if (!hit) return metricRef ? `未知指标（${metricRef}）` : '未选择'
  return `${hit.name} ${hit.version}${hit.status === '已停用' ? '（已停用）' : ''}`
}

// ---------------------------------------------------------------------------
// 6.2 条件字段能力白名单（文档 M06"字段能力白名单"）
// ---------------------------------------------------------------------------
// enabled=false 表示该字段未接数据：条件编辑器禁用并提示缺少映射，
// **不能把文本专业名称冒充组织主数据**。
export const CONDITION_FIELDS = [
  { ref: 'BF-HIGHEST-DEGREE', label: '最高学位', dataType: 'enum', options: ['博士研究生', '硕士研究生', '学士及以下'], enabled: true, mapping: '基础信息·学历学位（已接入）' },
  { ref: 'BF-HIGHEST-EDU', label: '最高学历', dataType: 'enum', options: ['研究生', '本科', '专科及以下'], enabled: true, mapping: '基础信息·学历学位（已接入）' },
  { ref: 'BF-TITLE-LEVEL', label: '专业技术职务级别', dataType: 'enum', options: ['正高级', '副高级', '中级', '初级'], enabled: true, mapping: '正式任职关系（已接入）' },
  { ref: 'BF-DUAL-TEACHER', label: '双师型教师认定结果', dataType: 'boolean', enabled: true, mapping: '已核验认定结果（已接入）' },
  { ref: 'BF-PRIMARY-ORG', label: '主任职组织归属', dataType: 'relation', enabled: true, mapping: '正式任职关系（已接入）' },
  { ref: 'BF-FACULTY-ROLE', label: '任职角色（专任教师 / 行政教辅 / 辅导员）', dataType: 'enum', options: ['专任教师', '行政教辅', '辅导员'], enabled: true, mapping: '正式任职关系（已接入）' },
  { ref: 'BF-ENTERPRISE-PRACTICE', label: '近一年企业实践累计月数', dataType: 'number', enabled: true, mapping: '已核验实践记录（已接入）' },
  { ref: 'BF-TRAINING-VERIFIED', label: '已核验培训完成记录', dataType: 'boolean', enabled: true, mapping: '已核验培训记录（已接入）' },
  { ref: 'BF-TEACHING-AWARD', label: '省级以上教学能力比赛获奖', dataType: 'boolean', enabled: true, mapping: '已核验成果（已接入）' },
  { ref: 'BF-HIRE-DATE', label: '入职日期', dataType: 'date', enabled: true, mapping: '正式任职关系（已接入）' },
  { ref: 'BF-TALENT-LADDER', label: '人才梯队认定结果', dataType: 'enum', options: ['第一层', '第二层', '第三层'], enabled: false, mapping: '需先发布梯队版本（M08/M09），当前缺少映射' },
  { ref: 'BF-RESEARCH-PLATFORM', label: '科研平台归属', dataType: 'relation', enabled: false, mapping: '暂无正式实体与归属关系，当前缺少映射' },
  { ref: 'BF-MAJOR-GROUP', label: '专业群归属', dataType: 'relation', enabled: false, mapping: '暂无正式归属关系；不能以文本专业名称冒充组织主数据' },
]

export const CONDITION_FIELD_OPTIONS = CONDITION_FIELDS.map((item) => ({
  value: item.ref,
  label: item.enabled ? item.label : `${item.label}（未接数据）`,
  disabled: !item.enabled,
}))

// 不作为默认队伍条件的无关敏感字段（文档 M06 明确排除）
export const CONDITION_FIELD_EXCLUDED = [
  { group: '健康与体检', reason: '与师资队伍建设条件无关，个人健康数据不参与队伍统计条件' },
  { group: '婚姻与家庭', reason: '不相关敏感字段' },
  { group: '宗教信仰', reason: '不相关敏感字段' },
  { group: '证件号码', reason: '不相关敏感字段' },
]

export function getConditionField(ref) {
  return CONDITION_FIELDS.find((item) => item.ref === ref) || null
}

export function conditionFieldLabel(ref) {
  const hit = getConditionField(ref)
  return hit ? hit.label : (ref ? `未知字段（${ref}）` : '未选择')
}

// 适配运算：由字段类型决定可用运算符（文档 M06"适配运算"）
export const CONDITION_OPERATORS = {
  enum: [
    { value: 'in', label: '属于集合' },
    { value: 'equals', label: '等于' },
    { value: 'notIn', label: '不属于' },
  ],
  number: [
    { value: 'gte', label: '大于或等于（≥）' },
    { value: 'lte', label: '小于或等于（≤）' },
    { value: 'eq', label: '等于（=）' },
    { value: 'between', label: '在区间内' },
  ],
  date: [
    { value: 'after', label: '晚于' },
    { value: 'before', label: '早于' },
    { value: 'between', label: '在区间内' },
  ],
  boolean: [
    { value: 'isTrue', label: '是' },
    { value: 'isFalse', label: '否' },
  ],
  relation: [
    { value: 'exists', label: '存在已核验记录' },
    { value: 'notExists', label: '不存在已核验记录' },
  ],
  string: [
    { value: 'contains', label: '包含' },
    { value: 'equals', label: '等于' },
  ],
}

export function operatorsForField(ref) {
  const field = getConditionField(ref)
  if (!field) return []
  return CONDITION_OPERATORS[field.dataType] || CONDITION_OPERATORS.string
}

export function operatorLabel(dataType, value) {
  const list = CONDITION_OPERATORS[dataType] || []
  const hit = list.find((item) => item.value === value)
  return hit ? hit.label : value
}

export const GROUP_LOGICS = [
  { value: 'all', label: '全部满足（且）' },
  { value: 'any', label: '任一满足（或）' },
]

// 一阶段最多两层条件组：组内用 groupLogic，组间用顶层 groupLogic（文档 M06 明确不开放任意代码/SQL/无限嵌套）
export const MAX_CONDITION_LAYERS = 2
export const MAX_CONDITION_GROUPS = 2

export const DENOMINATOR_MODES = [
  { value: 'category-scope', label: '按所选人员类别去重（方案统计范围内）' },
  { value: 'teaching-only', label: '仅专业课教师计提' },
  { value: 'primary-org', label: '按主任职组织归属去重' },
]

export const EVIDENCE_POLICIES = [
  { value: 'ev-verified-only', label: '仅采用已核验记录（未核验计入待核验）' },
  { value: 'ev-verified-or-declared', label: '已核验记录 + 本人申报（申报部分计入待核验）' },
  { value: 'ev-document-required', label: '须有可核验证明材料，否则不计入满足' },
]

export function evidencePolicyLabel(value) {
  const hit = EVIDENCE_POLICIES.find((item) => item.value === value)
  return hit ? hit.label : (value || '未设置')
}

// B.requirementStatus —— 师资要求配置状态（配置状态与派生分析结果分字段，不混用）
export const REQUIREMENT_STATUSES = {
  草稿: { label: '草稿', tone: 'default' },
  待确认: { label: '待确认', tone: 'warning' },
  已发布: { label: '已发布', tone: 'success' },
  已停用: { label: '已停用', tone: 'default' },
}

export const REQUIREMENT_STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: '已满足', label: '已满足' },
  { key: '存在缺口', label: '存在缺口' },
  { key: '待核验', label: '待核验' },
  { key: '待人工评估', label: '待人工评估' },
  { key: '未分析', label: '未分析' },
]

export const RESULT_STATE_BY_TAB = {
  '已满足': 'satisfied',
  '存在缺口': 'gap',
  '待核验': 'pending',
  '待人工评估': 'manual',
  '未分析': 'notAnalyzed',
}

// 六种要求类型的配置能力与第一期限制（文档 M06 表格）
export const REQUIREMENT_TYPE_META = {
  人数: { auto: true, unitHint: '人', description: '人员范围 + 符合条件 + 目标人数；结果为去重符合人数与缺口，不把附件/记录数当人数。', limit: '第一期限制：不把附件/记录数当人数。' },
  比例: { auto: true, unitHint: '%', needDenominator: true, description: '分子条件 + 分母口径 + 目标比例；结果为实际比例、待核验人数、百分点差。', limit: '第一期限制：分母为 0 显示不适用，不得用 0 冒充缺口。' },
  覆盖: { auto: true, unitHint: '%', needCoverage: true, description: '单位集合 + 每单位最低符合人数 + 符合条件；逐单位判断已覆盖 / 未覆盖 / 待核验。', limit: '第一期限制：逐单位判断，不以全校平均替代。' },
  梯队: { auto: true, unitHint: '人', needLadder: true, description: '发布梯队版本 + 各层目标区间；结果为逐层人数与缺口。', limit: '第一期限制：不合成单个梯队分数。' },
  培养完成: { auto: true, unitHint: '%', needConditions: true, description: '固定培养对象 + 完成证据 + 目标；结果为已完成 / 待核验 / 未完成人数比例。', limit: '第一期限制：对象变更要版本化。' },
  人工评估: { auto: false, unitHint: '', needManualGuide: true, description: '评估说明 + 依据 + 责任人 + 期限；无数值也可完整配置。', limit: '第一期限制：无数值不报配置错误。' },
}

// 梯队层级（M08/M09 属批次 3；此处为要求编辑器可引用的草案层级）
export const LADDER_LEVELS = [
  { key: 'L1', label: '第一层（专业带头人）', targetLower: 40, targetUpper: 60 },
  { key: 'L2', label: '第二层（后备骨干）', targetLower: 80, targetUpper: 120 },
  { key: 'L3', label: '第三层（青年储备）', targetLower: 150, targetUpper: 200 },
]

function requirementRow(partial) {
  return {
    requirementId: '',
    planId: '',
    taskId: '',
    requirementName: '',
    requirementType: '',
    metricRef: '',
    scopeNarrowing: { organizations: [], facultyRoles: [], note: '' },
    filterGroups: [],
    groupLogic: 'all',
    targetOperator: '',
    targetLower: null,
    targetUpper: null,
    targetUnit: '',
    denominatorMode: '',
    coverageOrganizations: [],
    coverageMinimum: null,
    manualAssessmentGuide: '',
    evidencePolicy: '',
    sourceClause: '',
    mandatory: false,
    requirementStatus: '草稿',
    resultState: 'notAnalyzed',
    resultNote: '',
    actualValue: null,
    unknownCount: 0,
    verifiedMismatch: 0,
    ownerOrganization: '',
    ownerPerson: '',
    deadline: '',
    startNode: '',
    assignmentPeriods: [],
    previewHash: '',
    updatedAt: '',
    ...partial,
  }
}

const REQUIREMENT_ROWS = [
  // ---- PL-2026-001（"十五五"师资队伍建设规划）：12 项 ----
  requirementRow({
    requirementId: 'RQ-001', planId: 'PL-2026-001', taskId: 'TK-001',
    requirementName: '专任教师博士学位比例', requirementType: '比例', metricRef: 'IND-DOCTOR-RATE',
    filterGroups: [{ logic: 'all', conditions: [{ fieldRef: 'BF-HIGHEST-DEGREE', operator: 'in', value: ['博士研究生'] }] }],
    targetOperator: '不低于', targetLower: 55, targetUnit: '%', denominatorMode: 'category-scope',
    evidencePolicy: 'ev-verified-only', sourceClause: '到2030年，专任教师中具有博士学位者比例不低于55%。',
    mandatory: true, requirementStatus: '已发布', resultState: 'gap', actualValue: 40.9, unknownCount: 62,
    ownerOrganization: 'org-univ', deadline: '2030-12-31', previewHash: 'PH-1F3A9C21',
  }),
  requirementRow({
    requirementId: 'RQ-002', planId: 'PL-2026-001', taskId: 'TK-001',
    requirementName: '正高级职称人数', requirementType: '人数', metricRef: 'IND-SENIOR-COUNT',
    filterGroups: [{ logic: 'all', conditions: [{ fieldRef: 'BF-TITLE-LEVEL', operator: 'in', value: ['正高级'] }] }],
    targetOperator: '不低于', targetLower: 260, targetUnit: '人', evidencePolicy: 'ev-verified-only',
    sourceClause: '', mandatory: false, requirementStatus: '已发布', resultState: 'gap', actualValue: 211, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2030-12-31', previewHash: 'PH-2B77E410',
  }),
  requirementRow({
    requirementId: 'RQ-003', planId: 'PL-2026-001', taskId: 'TK-002',
    requirementName: '双师型教师占专业课教师比例', requirementType: '比例', metricRef: 'IND-DUAL-RATE',
    filterGroups: [{ logic: 'all', conditions: [{ fieldRef: 'BF-DUAL-TEACHER', operator: 'isTrue', value: null }] }],
    targetOperator: '不低于', targetLower: 85, targetUnit: '%', denominatorMode: 'teaching-only',
    evidencePolicy: 'ev-verified-only', sourceClause: '双师型教师占专业课教师比例不低于85%。',
    mandatory: true, requirementStatus: '已发布', resultState: 'pending', actualValue: 80.0, unknownCount: 118,
    ownerOrganization: 'org-univ', deadline: '2027-12-31', previewHash: 'PH-3C1820D5',
  }),
  requirementRow({
    requirementId: 'RQ-004', planId: 'PL-2026-001', taskId: 'TK-002',
    requirementName: '专业课教师年度企业实践≥1个月', requirementType: '覆盖', metricRef: 'IND-PRACTICE-COVER',
    filterGroups: [{ logic: 'all', conditions: [{ fieldRef: 'BF-ENTERPRISE-PRACTICE', operator: 'gte', value: 1 }] }],
    targetOperator: '每单位不低于', targetLower: 90, targetUnit: '%',
    coverageOrganizations: ['org-ei', 'org-ai', 'org-me', 'org-au'],
    coverageMinimum: 3, evidencePolicy: 'ev-document-required', sourceClause: '',
    mandatory: false, requirementStatus: '已发布', resultState: 'pending', actualValue: null, unknownCount: 204,
    ownerOrganization: 'org-univ', deadline: '2027-12-31', previewHash: 'PH-4D5511A2',
  }),
  requirementRow({
    requirementId: 'RQ-005', planId: 'PL-2026-001', taskId: 'TK-003',
    requirementName: '专业带头人后备人选', requirementType: '梯队', metricRef: 'IND-LADDER-LEADER',
    targetOperator: '各层区间', targetLower: 40, targetUpper: 60, targetUnit: '人',
    evidencePolicy: 'ev-verified-only', sourceClause: '', mandatory: true,
    requirementStatus: '已发布', resultState: 'gap', actualValue: 26, unknownCount: 12,
    ownerOrganization: 'org-univ', deadline: '2029-06-30', previewHash: 'PH-5E9033F7',
  }),
  requirementRow({
    requirementId: 'RQ-006', planId: 'PL-2026-001', taskId: 'TK-004',
    requirementName: '青年教师导师制覆盖率', requirementType: '覆盖', metricRef: 'IND-MENTOR-COVER',
    filterGroups: [{ logic: 'all', conditions: [{ fieldRef: 'BF-HIRE-DATE', operator: 'after', value: '2023-09-01' }] }],
    targetOperator: '每单位不低于', targetLower: 100, targetUnit: '%',
    coverageOrganizations: ['org-ei', 'org-ai', 'org-me', 'org-mg', 'org-ad', 'org-au', 'org-mc', 'org-ce'],
    coverageMinimum: 1, evidencePolicy: 'ev-verified-only', sourceClause: '',
    mandatory: false, requirementStatus: '已发布', resultState: 'satisfied', actualValue: 100, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2028-06-30', previewHash: 'PH-6F6620B8',
  }),
  requirementRow({
    requirementId: 'RQ-007', planId: 'PL-2026-001', taskId: 'TK-004',
    requirementName: '省级以上教学能力比赛获奖', requirementType: '人数', metricRef: 'IND-TEACHING-AWARD',
    filterGroups: [{ logic: 'all', conditions: [{ fieldRef: 'BF-TEACHING-AWARD', operator: 'isTrue', value: null }] }],
    targetOperator: '不低于', targetLower: 12, targetUnit: '人', evidencePolicy: 'ev-document-required',
    sourceClause: '', mandatory: false, requirementStatus: '已发布', resultState: 'gap', actualValue: 9, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2028-06-30', previewHash: 'PH-70A14C93',
  }),
  requirementRow({
    requirementId: 'RQ-008', planId: 'PL-2026-001', taskId: 'TK-002',
    requirementName: '技术服务到账经费', requirementType: '人数', metricRef: 'IND-TECH-REVENUE',
    targetOperator: '不低于', targetLower: 5000, targetUnit: '万元', evidencePolicy: 'ev-verified-only',
    sourceClause: '', mandatory: false, requirementStatus: '已发布', resultState: 'gap', actualValue: 3560, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2030-12-31', previewHash: 'PH-81B25D6E',
  }),
  requirementRow({
    requirementId: 'RQ-009', planId: 'PL-2026-001', taskId: 'TK-003',
    requirementName: '师德师风考核合格率', requirementType: '比例', metricRef: 'IND-ETHICS-PASS',
    targetOperator: '不低于', targetLower: 100, targetUnit: '%', denominatorMode: 'category-scope',
    evidencePolicy: 'ev-verified-only', sourceClause: '', mandatory: true,
    requirementStatus: '已发布', resultState: 'satisfied', actualValue: 100, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2030-12-31', previewHash: 'PH-92C36E4F',
  }),
  requirementRow({
    requirementId: 'RQ-010', planId: 'PL-2026-001', taskId: 'TK-001',
    requirementName: '师资队伍国际交流经历', requirementType: '人工评估', metricRef: '',
    targetOperator: '人工判定', manualAssessmentGuide: '由人事处国际交流归口组织专家评估，依据派出批件与回国总结，逐人出具结论。',
    evidencePolicy: 'ev-document-required', sourceClause: '', mandatory: false,
    requirementStatus: '已发布', resultState: 'manual', actualValue: null, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2030-12-31', previewHash: 'PH-A3D47F30',
  }),
  requirementRow({
    requirementId: 'RQ-011', planId: 'PL-2026-001', taskId: 'TK-003',
    requirementName: '校级教学创新团队数量', requirementType: '人数', metricRef: '',
    targetOperator: '不低于', targetLower: 20, targetUnit: '个', evidencePolicy: '',
    sourceClause: '', mandatory: false, requirementStatus: '草稿', resultState: 'notAnalyzed',
    actualValue: null, unknownCount: 0, ownerOrganization: 'org-univ', deadline: '2029-06-30',
  }),
  requirementRow({
    requirementId: 'RQ-012', planId: 'PL-2026-001', taskId: 'TK-004',
    requirementName: '青年教师三年内取得双师资格', requirementType: '培养完成', metricRef: 'IND-YOUTH-DUAL',
    filterGroups: [{ logic: 'all', conditions: [{ fieldRef: 'BF-HIRE-DATE', operator: 'after', value: '2023-09-01' }] }],
    targetOperator: '不低于', targetLower: 70, targetUnit: '%', evidencePolicy: 'ev-verified-only',
    sourceClause: '', mandatory: false, requirementStatus: '已发布', resultState: 'satisfied', actualValue: 61, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2028-06-30', previewHash: 'PH-B4E58011',
  }),

  // ---- PL-2026-002（高层次人才引育专项）：6 项 ----
  requirementRow({
    requirementId: 'RQ-013', planId: 'PL-2026-002', taskId: 'TK-005',
    requirementName: '重点专业群博士带头人配备', requirementType: '覆盖', metricRef: 'IND-LEADER-COVER',
    filterGroups: [{ logic: 'all', conditions: [
      { fieldRef: 'BF-HIGHEST-DEGREE', operator: 'in', value: ['博士研究生'] },
      { fieldRef: 'BF-FACULTY-ROLE', operator: 'in', value: ['专任教师'] },
    ] }],
    targetOperator: '每单位不低于', targetLower: 1, targetUnit: '家',
    coverageOrganizations: ['org-ei', 'org-ai', 'org-me', 'org-au'], coverageMinimum: 1,
    evidencePolicy: 'ev-verified-only', sourceClause: '申办期内重点专业群须配备具有博士学位的专业带头人。',
    mandatory: true, requirementStatus: '已发布', resultState: 'pending', actualValue: null, unknownCount: 26,
    ownerOrganization: 'org-univ', deadline: '2026-12-31', previewHash: 'PH-C5F69122',
  }),
  requirementRow({
    requirementId: 'RQ-014', planId: 'PL-2026-002', taskId: 'TK-008',
    requirementName: '引进人才安家与科研启动经费落实率', requirementType: '比例', metricRef: 'IND-SETTLE-FUND',
    targetOperator: '不低于', targetLower: 100, targetUnit: '%', denominatorMode: 'category-scope',
    evidencePolicy: 'ev-document-required', sourceClause: '', mandatory: true,
    requirementStatus: '已发布', resultState: 'satisfied', actualValue: 100, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2026-12-31', previewHash: 'PH-D607A233',
  }),
  requirementRow({
    requirementId: 'RQ-015', planId: 'PL-2026-002', taskId: 'TK-008',
    requirementName: '引进人才三年留存率', requirementType: '比例', metricRef: 'IND-RETAIN-3Y',
    targetOperator: '不低于', targetLower: 90, targetUnit: '%', denominatorMode: 'category-scope',
    evidencePolicy: 'ev-verified-only', sourceClause: '', mandatory: false,
    requirementStatus: '已发布', resultState: 'gap', actualValue: 82.4, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2026-12-31', previewHash: 'PH-E718B344',
  }),
  requirementRow({
    requirementId: 'RQ-016', planId: 'PL-2026-002', taskId: 'TK-009',
    requirementName: '产业教授到岗人数', requirementType: '人数', metricRef: 'IND-INDUSTRY-PROF',
    targetOperator: '不低于', targetLower: 10, targetUnit: '人', evidencePolicy: 'ev-document-required',
    sourceClause: '', mandatory: false, requirementStatus: '已发布', resultState: 'gap', actualValue: 6, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2026-12-31', previewHash: 'PH-F829C455',
  }),
  requirementRow({
    requirementId: 'RQ-017', planId: 'PL-2026-002', taskId: 'TK-009',
    requirementName: '柔性引进专家年度服务时长', requirementType: '人数', metricRef: 'IND-FLEX-HOURS',
    targetOperator: '不低于', targetLower: 60, targetUnit: '小时', evidencePolicy: 'ev-verified-only',
    sourceClause: '', mandatory: false, requirementStatus: '已发布', resultState: 'pending', actualValue: null, unknownCount: 34,
    ownerOrganization: 'org-univ', deadline: '2026-12-31', previewHash: 'PH-093AD566',
  }),
  requirementRow({
    requirementId: 'RQ-018', planId: 'PL-2026-002', taskId: 'TK-009',
    requirementName: '引进人才师德审查合格率', requirementType: '比例', metricRef: 'IND-INTEGRITY-PASS',
    targetOperator: '不低于', targetLower: 100, targetUnit: '%', denominatorMode: 'category-scope',
    evidencePolicy: 'ev-verified-only', sourceClause: '', mandatory: true,
    requirementStatus: '已发布', resultState: 'satisfied', actualValue: 100, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2026-12-31', previewHash: 'PH-1A4BE677',
  }),

  // ---- PL-2026-003（双师型队伍建设方案，待确认）：4 项 ----
  requirementRow({
    requirementId: 'RQ-019', planId: 'PL-2026-003', taskId: 'TK-006',
    requirementName: '专业课教师双师占比', requirementType: '比例', metricRef: 'IND-DUAL-RATE',
    filterGroups: [{ logic: 'all', conditions: [{ fieldRef: 'BF-DUAL-TEACHER', operator: 'isTrue', value: null }] }],
    targetOperator: '不低于', targetLower: 85, targetUnit: '%', denominatorMode: 'teaching-only',
    evidencePolicy: 'ev-verified-only', sourceClause: '双师型教师占专业课教师比例不低于85%。',
    mandatory: true, requirementStatus: '待确认', resultState: 'pending', actualValue: 80.0, unknownCount: 118,
    ownerOrganization: 'org-univ', deadline: '2027-08-31', previewHash: 'PH-2B5CF788',
  }),
  requirementRow({
    requirementId: 'RQ-020', planId: 'PL-2026-003', taskId: 'TK-006',
    requirementName: '企业实践基地覆盖单位数', requirementType: '覆盖', metricRef: 'IND-PRACTICE-BASE',
    filterGroups: [{ logic: 'all', conditions: [{ fieldRef: 'BF-ENTERPRISE-PRACTICE', operator: 'gte', value: 1 }] }],
    targetOperator: '每单位不低于', targetLower: 1, targetUnit: '家',
    coverageOrganizations: ['org-ei', 'org-ai', 'org-me', 'org-au', 'org-mc'], coverageMinimum: 1,
    evidencePolicy: 'ev-document-required', sourceClause: '', mandatory: false,
    requirementStatus: '待确认', resultState: 'notAnalyzed', actualValue: null, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2027-08-31',
  }),
  requirementRow({
    requirementId: 'RQ-021', planId: 'PL-2026-003', taskId: 'TK-010',
    requirementName: '取得高级职业技能等级证书人数', requirementType: '人数', metricRef: 'IND-SKILL-CERT',
    filterGroups: [{ logic: 'any', conditions: [
      { fieldRef: 'BF-FACULTY-ROLE', operator: 'in', value: ['专任教师'] },
      { fieldRef: 'BF-ENTERPRISE-PRACTICE', operator: 'gte', value: 3 },
    ] }],
    targetOperator: '不低于', targetLower: 80, targetUnit: '人', evidencePolicy: 'ev-document-required',
    sourceClause: '', mandatory: false, requirementStatus: '待确认', resultState: 'notAnalyzed',
    actualValue: null, unknownCount: 0, ownerOrganization: 'org-univ', deadline: '2027-08-31',
  }),
  requirementRow({
    requirementId: 'RQ-022', planId: 'PL-2026-003', taskId: 'TK-010',
    requirementName: '双师型教师认定通过率', requirementType: '比例', metricRef: 'IND-DUAL-PASS',
    targetOperator: '不低于', targetLower: 95, targetUnit: '%', denominatorMode: 'primary-org',
    evidencePolicy: 'ev-verified-only', sourceClause: '', mandatory: false,
    requirementStatus: '待确认', resultState: 'notApplicable', actualValue: null, unknownCount: 0,
    resultNote: '分母（申报认定去重人数）为 0，按"不适用"处理，不得用 0 冒充缺口。',
    ownerOrganization: 'org-univ', deadline: '2027-08-31',
  }),

  // ---- PL-2026-004（专业带头人梯队培育方案，草稿）：2 项 ----
  requirementRow({
    requirementId: 'RQ-023', planId: 'PL-2026-004', taskId: 'TK-007',
    requirementName: '专业带头人认定条件', requirementType: '人工评估', metricRef: '',
    targetOperator: '人工判定', manualAssessmentGuide: '按认定口径组织学院初评、校级评议，逐人出具认定结论与依据材料清单。',
    evidencePolicy: 'ev-document-required', sourceClause: '', mandatory: true,
    requirementStatus: '草稿', resultState: 'manual', actualValue: null, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2027-12-31',
  }),
  requirementRow({
    requirementId: 'RQ-024', planId: 'PL-2026-004', taskId: 'TK-007',
    requirementName: '专业带头人后备人选库人数', requirementType: '人数', metricRef: 'IND-LADDER-LEADER-V1',
    targetOperator: '不低于', targetLower: 60, targetUnit: '人', evidencePolicy: 'ev-verified-only',
    sourceClause: '', mandatory: false, requirementStatus: '草稿', resultState: 'notAnalyzed',
    actualValue: null, unknownCount: 0, ownerOrganization: 'org-univ', deadline: '2027-12-31',
  }),

  // ---- PL-2026-005（青年教师成长支持方案，草稿）：1 项（未完成配置，用于演示配置校验） ----
  requirementRow({
    requirementId: 'RQ-025', planId: 'PL-2026-005', taskId: 'TK-011',
    requirementName: '青年教师导师制覆盖（待配置）', requirementType: '', metricRef: '',
    targetOperator: '', targetLower: null, targetUnit: '', evidencePolicy: '',
    requirementStatus: '草稿', resultState: 'notAnalyzed', ownerOrganization: '', deadline: '',
  }),

  // ---- PL-2025-001（"十四五"规划，已替代）：3 项历史结果 ----
  requirementRow({
    requirementId: 'RQ-026', planId: 'PL-2025-001', taskId: 'TK-012',
    requirementName: '高级职称占比', requirementType: '比例', metricRef: 'IND-SENIOR-TITLE-RATE',
    targetOperator: '不低于', targetLower: 38, targetUnit: '%', denominatorMode: 'category-scope',
    evidencePolicy: 'ev-verified-only', requirementStatus: '已发布', resultState: 'satisfied',
    actualValue: 39.6, unknownCount: 0, ownerOrganization: 'org-univ', deadline: '2025-12-31',
  }),
  requirementRow({
    requirementId: 'RQ-027', planId: 'PL-2025-001', taskId: 'TK-012',
    requirementName: '正高级职称人数', requirementType: '人数', metricRef: 'IND-SENIOR-COUNT',
    targetOperator: '不低于', targetLower: 200, targetUnit: '人', evidencePolicy: 'ev-verified-only',
    requirementStatus: '已发布', resultState: 'satisfied', actualValue: 214, unknownCount: 0,
    ownerOrganization: 'org-univ', deadline: '2025-12-31',
  }),
  requirementRow({
    requirementId: 'RQ-028', planId: 'PL-2025-001', taskId: 'TK-013',
    requirementName: '具有博士学位教师比例', requirementType: '比例', metricRef: 'IND-SENIOR-DEGREE',
    targetOperator: '不低于', targetLower: 45, targetUnit: '%', denominatorMode: 'category-scope',
    evidencePolicy: 'ev-verified-only', requirementStatus: '已发布', resultState: 'gap',
    actualValue: 42.1, unknownCount: 0, ownerOrganization: 'org-univ', deadline: '2025-12-31',
  }),

  // ---- PL-2025-002（2025年度师资结构优化，已归档）：2 项历史结果（引用已停用旧版指标，仅提示不阻断） ----
  requirementRow({
    requirementId: 'RQ-029', planId: 'PL-2025-002', taskId: 'TK-014',
    requirementName: '高级职称占比', requirementType: '比例', metricRef: 'IND-SENIOR-TITLE-RATE',
    targetOperator: '不低于', targetLower: 38, targetUnit: '%', denominatorMode: 'category-scope',
    evidencePolicy: 'ev-verified-only', requirementStatus: '已发布', resultState: 'satisfied',
    actualValue: 38.7, unknownCount: 0, ownerOrganization: 'org-univ', deadline: '2025-12-31',
  }),
  requirementRow({
    requirementId: 'RQ-030', planId: 'PL-2025-002', taskId: 'TK-014',
    requirementName: '双师型教师占比（旧版口径）', requirementType: '比例', metricRef: 'IND-DUAL-RATE-V1',
    targetOperator: '不低于', targetLower: 80, targetUnit: '%', denominatorMode: 'teaching-only',
    evidencePolicy: 'ev-verified-only', requirementStatus: '已发布', resultState: 'gap',
    actualValue: 78.2, unknownCount: 0, ownerOrganization: 'org-univ', deadline: '2025-12-31',
  }),
]

let REQUIREMENT_STORE = REQUIREMENT_ROWS.map((row) => ({ ...row }))
let requirementSeq = 300

let REQUIREMENT_EVENTS = [
  { id: 'REV-1', requirementId: 'RQ-001', type: 'published', label: '随方案 v1.2 发布', at: '2026-02-01 09:20', operator: '张启明' },
  { id: 'REV-2', requirementId: 'RQ-003', type: 'analysis', label: '重新分析（快照 SNAP-20260912-01）', at: '2026-09-13 02:10', operator: '系统' },
  { id: 'REV-3', requirementId: 'RQ-024', type: 'updated', label: '保存草稿', at: '2026-10-08 09:40', operator: '王建国' },
]

function nextRequirementId() {
  requirementSeq += 1
  return `RQ-${String(requirementSeq).padStart(3, '0')}`
}

function rawRequirement(requirementId) {
  return REQUIREMENT_STORE.find((row) => row.requirementId === requirementId) || null
}

export function getRequirement(requirementId) {
  return rawRequirement(requirementId)
}

export function allRequirements() {
  return REQUIREMENT_STORE.slice()
}

export function requirementsByPlan(planId) {
  const key = lineageOf(planId)
  return REQUIREMENT_STORE.filter((row) => row.planId === key)
}

export function requirementsByTask(taskId) {
  return REQUIREMENT_STORE.filter((row) => row.taskId === taskId)
}

export function requirementSummaryByPlan(planId) {
  const rows = requirementsByPlan(planId)
  const summary = { satisfied: 0, gap: 0, pending: 0, manual: 0, notAnalyzed: 0, notApplicable: 0 }
  rows.forEach((row) => { summary[row.resultState] = (summary[row.resultState] || 0) + 1 })
  const computable = rows.filter((row) => row.requirementType !== '人工评估' && row.metricRef && row.requirementStatus === '已发布').length
  return { ...summary, total: rows.length, computable, mandatory: rows.filter((row) => row.mandatory).length }
}

export function requirementSummaryByTask(taskId) {
  const rows = requirementsByTask(taskId)
  const summary = { satisfied: 0, gap: 0, pending: 0, manual: 0, notAnalyzed: 0, notApplicable: 0 }
  rows.forEach((row) => { summary[row.resultState] = (summary[row.resultState] || 0) + 1 })
  return { ...summary, total: rows.length }
}

export const EMPTY_REQUIREMENT_FILTERS = {
  keyword: '',
  planId: '',
  taskId: '',
  requirementType: '',
  requirementStatus: '',
  resultState: '',
  ownerOrganization: '',
  mandatoryOnly: false,
}

export function queryRequirements(filters) {
  const f = { ...EMPTY_REQUIREMENT_FILTERS, ...(filters || {}) }
  const keyword = (f.keyword || '').trim().toLowerCase()
  return REQUIREMENT_STORE.filter((row) => {
    if (keyword && !`${row.requirementName}${row.requirementId}`.toLowerCase().includes(keyword)) return false
    if (f.planId && row.planId !== f.planId) return false
    if (f.taskId && row.taskId !== f.taskId) return false
    if (f.requirementType && row.requirementType !== f.requirementType) return false
    if (f.requirementStatus && row.requirementStatus !== f.requirementStatus) return false
    if (f.resultState && row.resultState !== f.resultState) return false
    if (f.ownerOrganization && row.ownerOrganization !== f.ownerOrganization) return false
    if (f.mandatoryOnly && !row.mandatory) return false
    return true
  }).sort((a, b) => (a.requirementId < b.requirementId ? -1 : 1))
}

export function requirementCounts(rows) {
  const source = rows || REQUIREMENT_STORE
  const counts = { all: source.length, satisfied: 0, gap: 0, pending: 0, manual: 0, notAnalyzed: 0, notApplicable: 0, mandatory: 0 }
  source.forEach((row) => {
    counts[row.resultState] = (counts[row.resultState] || 0) + 1
    if (row.mandatory) counts.mandatory += 1
  })
  return counts
}

export function requirementStatusCounts() {
  const counts = { all: REQUIREMENT_STORE.length, 草稿: 0, 待确认: 0, 已发布: 0, 已停用: 0 }
  REQUIREMENT_STORE.forEach((row) => { counts[row.requirementStatus] = (counts[row.requirementStatus] || 0) + 1 })
  return counts
}

function logRequirementEvent(requirementId, type, label, operator) {
  REQUIREMENT_EVENTS = [
    { id: `REV-${REQUIREMENT_EVENTS.length + 1}`, requirementId, type, label, at: nowStamp(), operator: operator || '张启明' },
    ...REQUIREMENT_EVENTS,
  ]
}

export function requirementEvents(requirementId) {
  return REQUIREMENT_EVENTS.filter((item) => item.requirementId === requirementId)
}

// ---------------------------------------------------------------------------
// 6.3 条件与口径的自然语言描述（文档 M06"自然语言口径与计算一致"）
// ---------------------------------------------------------------------------
function describeCondition(condition) {
  const field = getConditionField(condition.fieldRef)
  const label = field ? field.label : `未知字段（${condition.fieldRef || '未选择'}）`
  const dataType = field ? field.dataType : 'string'
  const op = operatorLabel(dataType, condition.operator)
  if (dataType === 'boolean') return `${label} ${op}`
  if (dataType === 'relation') return `${label} ${op}`
  if (condition.operator === 'between') {
    const range = Array.isArray(condition.value) ? condition.value : []
    return `${label} 在 ${range[0] || '?'} 至 ${range[1] || '?'} 之间`
  }
  const value = Array.isArray(condition.value)
    ? `{${condition.value.join('、')}}`
    : (condition.value === null || condition.value === undefined || condition.value === '' ? '（未填值）' : condition.value)
  return `${label} ${op} ${value}`
}

export function describeFilterGroups(filterGroups, groupLogic) {
  const groups = (filterGroups || []).filter((group) => (group.conditions || []).length)
  if (!groups.length) return ''
  const innerLogicLabel = (logic) => (logic === 'any' ? '任一满足' : '全部满足')
  const parts = groups.map((group) => {
    const text = (group.conditions || []).map(describeCondition).join(`，${innerLogicLabel(group.logic) === '任一满足' ? '或' : '且'} `)
    return groups.length > 1 ? `（${text}）` : text
  })
  const joiner = (groupLogic === 'any') ? ' 或 ' : ' 且 '
  return parts.join(joiner)
}

export function describeScope(planId, scopeNarrowing) {
  const plan = getPlan(planId)
  const narrowing = scopeNarrowing || {}
  const orgs = (narrowing.organizations || []).length
    ? narrowing.organizations.map(orgName).join('、')
    : (plan && plan.scopeDefinition && plan.scopeDefinition.organizations || []).map(orgName).join('、')
  const roles = (narrowing.facultyRoles || []).length
    ? narrowing.facultyRoles.join('、')
    : ((plan && plan.scopeDefinition && plan.scopeDefinition.personCategories) || []).join('、')
  const states = ((plan && plan.scopeDefinition && plan.scopeDefinition.employmentStates) || []).join('、')
  const primary = plan && plan.scopeDefinition && plan.scopeDefinition.primaryOnly ? '主任职口径' : '全部任职'
  const narrowingNote = (narrowing.organizations || []).length || (narrowing.facultyRoles || []).length
    ? '（在方案范围基础上进一步收窄）'
    : '（继承方案统计范围，未再收窄）'
  return `统计范围：${orgs || '未选择组织'} · ${roles || '未选择人员类别'} · ${states || '未设置任职状态'} · ${primary}${narrowingNote}`
}

export function describeTarget(draft) {
  const meta = REQUIREMENT_TYPE_META[draft.requirementType] || {}
  const unit = draft.targetUnit || meta.unitHint || ''
  if (draft.requirementType === '人工评估') return '判定方式：人工判定（无自动计算）'
  if (draft.targetOperator === '区间') {
    return `目标：${draft.targetLower ?? '?'} ～ ${draft.targetUpper ?? '?'} ${unit}`
  }
  if (draft.targetOperator === '各层区间') {
    return `目标：逐层区间（第一层 ${LADDER_LEVELS[0].targetLower}—${LADDER_LEVELS[0].targetUpper} 人 等）`
  }
  if (draft.targetOperator === '每单位不低于') {
    return `目标：每个覆盖单位不低于 ${draft.targetLower ?? '?'}${unit || '人'}`
  }
  return `目标：${draft.targetOperator || '未设置'} ${draft.targetLower ?? '?'} ${unit}`.trim()
}

export function describeRequirement(draft) {
  const lines = [describeScope(draft.planId, draft.scopeNarrowing)]
  if (draft.requirementType && draft.requirementType !== '人工评估') {
    const conditions = describeFilterGroups(draft.filterGroups, draft.groupLogic)
    lines.push(`符合条件：${conditions || '未配置条件（无法测试通过）'}`)
  }
  if (draft.requirementType === '比例') {
    const mode = DENOMINATOR_MODES.find((item) => item.value === draft.denominatorMode)
    lines.push(`分母口径：${mode ? mode.label : '未设置（比例类型必填）'}`)
  }
  if (draft.requirementType === '覆盖') {
    const units = (draft.coverageOrganizations || []).map(orgName).join('、')
    lines.push(`覆盖单位：${units || '未选择单位'}；每单位最低符合人数：${draft.coverageMinimum ?? '未设置'}`)
  }
  if (draft.requirementType === '梯队') {
    lines.push(`梯队层级：${LADDER_LEVELS.map((level) => level.label).join(' / ')}（引用已发布梯队版本）`)
  }
  if (draft.requirementType === '培养完成') {
    lines.push('固定培养对象：按入职时间段的青年教师集合；对象变更需版本化。')
  }
  if (draft.requirementType === '人工评估') {
    lines.push(`人工评估说明：${draft.manualAssessmentGuide || '未填写（人工类型必填）'}`)
  }
  lines.push(describeTarget(draft))
  if (draft.requirementType !== '人工评估') {
    lines.push(`证据核验：${evidencePolicyLabel(draft.evidencePolicy)}`)
  }
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// 6.4 配置预览 / 测试计算（不发布，标"配置预览"；保存后保留输入哈希，改条件即失效）
// ---------------------------------------------------------------------------
function hashString(text) {
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seedRatio(seed, salt) {
  const value = Math.sin((seed % 100000) * 0.0001 + salt * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

function draftSignature(draft) {
  return JSON.stringify({
    planId: draft.planId || '',
    requirementType: draft.requirementType || '',
    metricRef: draft.metricRef || '',
    scopeNarrowing: draft.scopeNarrowing || {},
    filterGroups: draft.filterGroups || [],
    groupLogic: draft.groupLogic || 'all',
    targetOperator: draft.targetOperator || '',
    targetLower: draft.targetLower ?? null,
    targetUpper: draft.targetUpper ?? null,
    denominatorMode: draft.denominatorMode || '',
    coverageOrganizations: draft.coverageOrganizations || [],
    coverageMinimum: draft.coverageMinimum ?? null,
    manualAssessmentGuide: draft.manualAssessmentGuide || '',
    evidencePolicy: draft.evidencePolicy || '',
  })
}

export function requirementPreviewHash(draft) {
  return `PH-${hashString(draftSignature(draft)).toString(16).toUpperCase()}`
}

/** 条件合法性检查：返回 blockers（阻断）与 notices（提示）。 */
export function checkRequirementDraft(draft) {
  const blockers = []
  const notices = []
  const meta = REQUIREMENT_TYPE_META[draft.requirementType] || {}
  const indicator = draft.metricRef ? getIndicator(draft.metricRef) : null

  if (!(draft.requirementName || '').trim()) blockers.push('师资要求名称必填。')
  if (!draft.requirementType) blockers.push('师资要求类型必填。')
  if (!draft.planId) blockers.push('未关联发展方案。')

  if (draft.requirementType === '人工评估') {
    if (!(draft.manualAssessmentGuide || '').trim()) blockers.push('人工评估说明必填（无数值也可完整配置，但说明不能为空）。')
  } else if (draft.requirementType) {
    if (!draft.metricRef) blockers.push('自动计算类型必须选择统计指标引用。')
    else if (!indicator) blockers.push(`统计指标「${draft.metricRef}」不在指标库中，不能测试通过。`)
    else if (indicator.status === '已停用') blockers.push(`统计指标「${indicator.name} ${indicator.version}」已停用，引用停用指标不能发布。`)
  }

  if (meta.needConditions !== false && draft.requirementType) {
    const groups = (draft.filterGroups || []).filter((group) => (group.conditions || []).length)
    if (!groups.length && draft.requirementType !== '人工评估' && draft.requirementType !== '梯队') {
      blockers.push('尚未配置任何符合条件，无法测试通过。')
    }
    ;(draft.filterGroups || []).forEach((group) => {
      (group.conditions || []).forEach((condition) => {
        const field = getConditionField(condition.fieldRef)
        if (!field) blockers.push('存在未选择条件字段的条件行。')
        else if (!field.enabled) blockers.push(`条件字段「${field.label}」未接数据（${field.mapping}），不能作为有效条件。`)
        if (!condition.operator) notices.push(`条件字段「${field ? field.label : '未选择'}」未选择比较运算符。`)
      })
    })
    if ((draft.filterGroups || []).length > MAX_CONDITION_GROUPS) {
      blockers.push(`第一期最多 ${MAX_CONDITION_GROUPS} 层条件组，不开放无限嵌套与任意代码/SQL。`)
    }
  }

  if (draft.requirementType && draft.requirementType !== '人工评估') {
    if (!draft.targetOperator) blockers.push('目标比较方式必填。')
    if (draft.targetLower === null || draft.targetLower === undefined || draft.targetLower === '') {
      blockers.push('目标下限值必填。')
    }
    if (draft.targetOperator === '区间') {
      if (draft.targetUpper === null || draft.targetUpper === undefined || draft.targetUpper === '') {
        blockers.push('区间目标必须填写目标上限值。')
      } else if (Number(draft.targetUpper) < Number(draft.targetLower)) {
        blockers.push('区间目标上限不得小于下限。')
      }
    }
    if (draft.requirementType === '比例') {
      if (Number(draft.targetLower) > 100) blockers.push('比例目标不得超过 100%。')
      if (draft.targetUpper !== null && draft.targetUpper !== '' && Number(draft.targetUpper) > 100) blockers.push('比例目标上限不得超过 100%。')
      if (!draft.denominatorMode) blockers.push('比例类型必须选择分母口径。')
    }
    if (meta.needCoverage) {
      if (!(draft.coverageOrganizations || []).length) blockers.push('覆盖类型必须选择覆盖单位集合。')
      if (draft.coverageMinimum === null || draft.coverageMinimum === undefined || draft.coverageMinimum === '') {
        blockers.push('覆盖类型必须填写每单位最低符合人数。')
      } else if (Number(draft.coverageMinimum) < 1) blockers.push('每单位最低符合人数必须为正整数。')
    }
    if (!draft.evidencePolicy) blockers.push('要求证据核验规则必填（引用已核验口径）。')
  }

  return { blockers, notices, indicator, meta }
}

export function computeRequirementPreview(draft) {
  const check = checkRequirementDraft(draft)
  const hash = requirementPreviewHash(draft)
  const saved = draft.requirementId ? rawRequirement(draft.requirementId) : null
  const result = {
    ok: check.blockers.length === 0,
    blockers: check.blockers,
    notices: check.notices,
    hash,
    narrative: describeRequirement(draft),
    applicable: true,
    notApplicableReason: '',
    resultNote: '',
    scopeCount: 0,
    matchCount: 0,
    verifiedMismatch: 0,
    pendingVerify: 0,
    excluded: [],
    metrics: [],
    perUnit: [],
    perLevel: [],
    sample: [],
    label: '配置预览',
    consistentWithSnapshot: false,
  }

  if (!result.ok) {
    result.narrative = `${result.narrative}\n\n当前配置存在 ${check.blockers.length} 项阻断，无法给出试算结果。`
    return result
  }

  // 与已保存快照一致时直接回填派生值，避免"已发布要求测试计算与总览不一致"
  if (saved && saved.previewHash && saved.previewHash === hash && saved.actualValue !== null && saved.actualValue !== undefined) {
    result.consistentWithSnapshot = true
    result.scopeCount = 1864
    result.matchCount = saved.actualValue
    result.pendingVerify = saved.unknownCount || 0
    result.verifiedMismatch = saved.verifiedMismatch || 0
    result.excluded = SCOPE_EXCLUSIONS.map((item) => ({ ...item }))
    result.metrics = [{ label: '当前计算值', value: saved.actualValue, unit: saved.targetUnit }]
    result.narrative = `${result.narrative}\n\n与当前统一分析快照一致（预览哈希 ${hash}），未修改条件。`
    return result
  }

  const seed = hashString(hash)
  const scopeCount = 140 + (seed % 240)
  const matchCount = Math.round(scopeCount * (0.32 + seedRatio(seed, 3) * 0.58))
  const pendingVerify = 4 + (seed % 86)
  const verifiedMismatch = Math.round(scopeCount * seedRatio(seed, 7) * 0.18)

  result.scopeCount = scopeCount
  result.matchCount = matchCount
  result.pendingVerify = pendingVerify
  result.verifiedMismatch = verifiedMismatch
  result.excluded = SCOPE_EXCLUSIONS.map((item) => ({ ...item, count: Math.max(1, Math.round(item.count * (0.6 + seedRatio(seed, item.count) * 0.9))) }))
  result.sample = SAMPLE_POPULATION.slice(0, 6)

  const meta = check.meta || {}
  if (draft.requirementType === '比例') {
    const denominator = Math.max(scopeCount, 1)
    const percent = Number(((matchCount / denominator) * 100).toFixed(1))
    const lower = Number(draft.targetLower)
    const gap = Number((percent - lower).toFixed(1))
    result.applicable = true
    result.metrics = [
      { label: '统计范围内去重人数', value: scopeCount, unit: '人' },
      { label: '分子（符合条件）人数', value: matchCount, unit: '人' },
      { label: '实际比例', value: percent, unit: '%' },
      { label: '百分点差', value: gap, unit: '百分点' },
      { label: '待核验人数', value: pendingVerify, unit: '人' },
    ]
    // 分母为 0 → 按"不适用"处理，不得用 0 冒充缺口（文档 M06 第一期限制）
    const denominatorEmpty = (draft.denominatorMode === 'teaching-only' && seedRatio(seed, 11) < 0.12)
      || (draft.denominatorMode === 'primary-org' && seedRatio(seed, 19) < 0.18)
    if (denominatorEmpty) {
      result.applicable = false
      result.notApplicableReason = '分母（按所选分母口径去重后的人数）为 0，按"不适用"处理，不得用 0 冒充缺口。'
      result.resultNote = result.notApplicableReason
      result.metrics = [{ label: '不适用', value: '—', unit: '' }]
    }
  } else if (draft.requirementType === '覆盖') {
    const units = (draft.coverageOrganizations || []).map(orgName)
    result.perUnit = units.map((unit, index) => {
      const matched = Math.max(0, Math.round(scopeCount / Math.max(units.length, 1) * (0.6 + seedRatio(seed, index + 2))))
      const minimum = Number(draft.coverageMinimum) || 1
      const pending = seedRatio(seed, index + 13) < 0.25
      const state = pending ? '待核验' : (matched >= minimum ? '已覆盖' : '未覆盖')
      return { unit, matched, minimum, state }
    })
    const covered = result.perUnit.filter((row) => row.state === '已覆盖').length
    result.metrics = [
      { label: '已覆盖单位', value: covered, unit: '个' },
      { label: '未覆盖单位', value: result.perUnit.filter((row) => row.state === '未覆盖').length, unit: '个' },
      { label: '待核验单位', value: result.perUnit.filter((row) => row.state === '待核验').length, unit: '个' },
      { label: '待核验人数', value: pendingVerify, unit: '人' },
    ]
    result.narrative = `${result.narrative}\n\n逐单位判断，不以全校平均替代；共享人员允许多单位覆盖，全校人数去重。`
  } else if (draft.requirementType === '梯队') {
    result.perLevel = LADDER_LEVELS.map((level, index) => {
      const actual = Math.max(0, Math.round((level.targetLower + level.targetUpper) / 2 * (0.55 + seedRatio(seed, index + 5))))
      const state = actual >= level.targetLower ? '已满足' : '存在缺口'
      return { level: level.label, actual, lower: level.targetLower, upper: level.targetUpper, state }
    })
    result.metrics = result.perLevel.map((row) => ({ label: row.level, value: row.actual, unit: '人' }))
    result.narrative = `${result.narrative}\n\n逐层人数与缺口分别展示，不合成单个梯队分数。`
  } else if (draft.requirementType === '人工评估') {
    result.metrics = []
    result.narrative = `${result.narrative}\n\n人工评估类型无数值结果；待评估 / 已满足 / 存在缺口 / 待核验由评估人按说明逐条判定。`
  } else if (draft.requirementType === '培养完成') {
    const percent = Number(((matchCount / Math.max(scopeCount, 1)) * 100).toFixed(1))
    result.metrics = [
      { label: '固定培养对象人数', value: scopeCount, unit: '人' },
      { label: '已完成人数', value: matchCount, unit: '人' },
      { label: '完成比例', value: percent, unit: '%' },
      { label: '待核验人数', value: pendingVerify, unit: '人' },
    ]
  } else {
    const gap = matchCount - Number(draft.targetLower || 0)
    result.metrics = [
      { label: '统计范围内去重人数', value: scopeCount, unit: '人' },
      { label: '符合条件人数（去重）', value: matchCount, unit: '人' },
      { label: '缺口', value: gap, unit: '人' },
      { label: '待核验人数', value: pendingVerify, unit: '人' },
    ]
    result.narrative = `${result.narrative}\n\n人数按人员去重计算，不把附件数或记录数当人数。`
  }

  result.narrative = `${result.narrative}\n\n本次为「配置预览」，测试计算不发布；保存后本预览输入哈希为 ${hash}，条件变更即失效。`
  return result
}

// ---------------------------------------------------------------------------
// 6.5 要求的保存 / 删除 / 复制（草稿可改；已发布只读或发起修订）
// ---------------------------------------------------------------------------
export function requirementEditable(row) {
  if (!row) return false
  if (row.requirementStatus === '已停用') return { ok: false, reason: '该要求已停用，只读。' }
  const plan = getPlan(row.planId)
  if (plan && ['published', 'archived', 'superseded'].includes(plan.configurationStatus) && row.requirementStatus === '已发布') {
    return { ok: false, reason: '所属方案已发布，该要求只读；如需调整请创建方案修订版本。' }
  }
  return { ok: true }
}

export function saveRequirement(requirementId, patch) {
  const row = rawRequirement(requirementId)
  if (!row) return { ok: false, reason: '师资要求不存在。' }
  const editable = requirementEditable(row)
  if (editable !== true && !editable.ok) return editable
  Object.assign(row, patch, { updatedAt: nowStamp(), previewHash: requirementPreviewHash({ ...row, ...patch }) })
  logRequirementEvent(requirementId, 'updated', '保存要求配置')
  return { ok: true }
}

export function createRequirementDraft(partial) {
  const requirementId = nextRequirementId()
  const row = requirementRow({
    ...partial,
    requirementId,
    requirementStatus: '草稿',
    resultState: 'notAnalyzed',
    actualValue: null,
    unknownCount: 0,
    updatedAt: nowStamp(),
  })
  REQUIREMENT_STORE = [...REQUIREMENT_STORE, row]
  logRequirementEvent(requirementId, 'created', '新建师资要求草稿')
  return { ok: true, requirementId }
}

export function canDeleteRequirement(requirementId) {
  const row = rawRequirement(requirementId)
  if (!row) return { ok: false, reason: '师资要求不存在。' }
  if (row.requirementStatus !== '草稿') {
    return { ok: false, reason: '仅草稿要求可删除；已发布要求只读或走方案修订。' }
  }
  return { ok: true }
}

export function deleteRequirementDraft(requirementId) {
  const check = canDeleteRequirement(requirementId)
  if (!check.ok) return check
  REQUIREMENT_STORE = REQUIREMENT_STORE.filter((row) => row.requirementId !== requirementId)
  REQUIREMENT_EVENTS = REQUIREMENT_EVENTS.filter((item) => item.requirementId !== requirementId)
  return { ok: true }
}

/** 复制已有要求到草稿：**必须重新确认范围 / 目标 / 期限**（文档 M05 工具栏）。 */
export function copyRequirementAsDraft(requirementId) {
  const source = rawRequirement(requirementId)
  if (!source) return { ok: false, reason: '师资要求不存在。' }
  const requirementIdNew = nextRequirementId()
  REQUIREMENT_STORE = [...REQUIREMENT_STORE, requirementRow({
    ...source,
    requirementId: requirementIdNew,
    requirementName: `${source.requirementName}（复制）`,
    requirementStatus: '草稿',
    resultState: 'notAnalyzed',
    actualValue: null,
    unknownCount: 0,
    verifiedMismatch: 0,
    previewHash: '',
    startNode: '',
    assignmentPeriods: [],
    updatedAt: nowStamp(),
  })]
  logRequirementEvent(requirementIdNew, 'created', `复制自 ${source.requirementId}`)
  return { ok: true, requirementId: requirementIdNew, message: '已复制为草稿；请重新确认统计范围、目标值与期限后再提交。' }
}

/** 引用停用指标的既有发布要求：只提示影响，不静默改写、不阻断历史快照读取。 */
export function requirementIndicatorNotice(row) {
  if (!row || !row.metricRef) return ''
  const indicator = getIndicator(row.metricRef)
  if (!indicator) return `引用的统计指标「${row.metricRef}」已不在指标库中，历史快照仍可读，但不能再次发布。`
  if (indicator.status === '已停用') {
    return row.requirementStatus === '已发布'
      ? `引用的统计指标「${indicator.name} ${indicator.version}」已停用；历史分析结果保留可读，指标升级不静默改写已发布要求。`
      : `引用的统计指标「${indicator.name} ${indicator.version}」已停用，不能发布；请改选启用版本。`
  }
  return ''
}

/**
 * 逐项在方案周期内、且逐项完成配置的检查（M02 第三步/第四步提示）。
 * 遵循"未配置项提示"而非自动补默认值。
 */
export function planReadiness(planId) {
  const plan = getPlan(planId)
  const tasks = tasksByPlan(planId)
  const requirements = requirementsByPlan(planId)
  const incomplete = requirements.filter((row) => {
    if (!row.requirementName || !row.requirementType) return true
    if (row.requirementType === '人工评估') return false
    if (!row.metricRef) return true
    if (row.targetLower == null && row.targetOperator !== '人工判定') return true
    return false
  })
  return {
    tasks,
    requirements,
    incomplete,
    taskWithoutRequirement: tasks.filter((task) => !requirements.some((row) => row.taskId === task.taskId)),
    periodOverflow: tasks.filter((task) => plan && task.deadline && plan.periodEnd && task.deadline > plan.periodEnd),
    stoppedIndicator: requirements.filter((row) => {
      const indicator = row.metricRef ? getIndicator(row.metricRef) : null
      return Boolean(indicator && indicator.status === '已停用' && row.requirementStatus !== '已发布')
    }),
  }
}

// ============================================================================
// 七、方案确认与版本发布（M07）
// ============================================================================
// 文档 M07 要点：
//  - 批量确认第一期关闭（列表改用顶部页签表格页 DSRegularListTemplate，工具条传空数组，不再有模板默认的"批量通过/批量退回"）。
//  - 批次提交版本冻结：确认人查看的是冻结版本，提交者新草稿不覆盖本次审查。
//  - 发布原子性：确认通过后固定配置版本与生效日期并开启初次分析；分析失败**不撤销**有效配置，
//    显示"已发布，分析失败"，可用同一配置与快照重试；生效日期在未来时不提前替代现行版。
//  - 同范围 / 周期允许多个专项方案，但只有一个**显式默认方案**，不按更新时间自动选。
//  - 退回必须给意见，可标记问题位置。

export const AUDIT_TABS = [
  { key: 'pending', label: '待我确认' },
  { key: 'handled', label: '我已处理' },
  { key: 'all', label: '授权全部' },
]

// 演示用：当前确认人（文档第十节 openQuestion 5：确认人由学校指定，此处为草案）
export const AUDIT_CURRENT_PERSON = 'u-zhang'
export const OTHER_CONFIRM_PERSON = 'u-sun'
export const AUDIT_PERSON_OPTIONS = [
  { value: 'u-zhang', label: '张启明（人事处处长）' },
  { value: 'u-sun', label: '孙明远（分管校领导）' },
  { value: 'u-li', label: '李慧（教师发展中心主任）' },
]

export const AUDIT_REJECT_TAGS = [
  '目标口径与上级文件不一致',
  '统计范围与授权范围不符',
  '缺少统计指标引用',
  '证据核验规则不明确',
  '依据原文条款缺失',
]

let AUDIT_DECISIONS = {
  'PL-2026-001': { decision: 'pass', at: '2026-02-01 09:20', by: 'u-zhang', opinion: '目标口径与《"十五五"师资队伍建设规划》一致，同意发布并开启初次分析。', marks: [] },
  'PL-2026-002': { decision: 'pass', at: '2026-03-01 10:05', by: 'u-zhang', opinion: '重点专业群范围与教务在库口径一致，同意发布。', marks: [] },
  'PL-2026-003': { decision: null, at: '', by: '', opinion: '', marks: [] },
  'PL-2026-005': { decision: 'return', at: '2026-10-07 17:20', by: 'u-zhang', opinion: '「青年教师导师制覆盖」未选择统计指标引用，也未设置证据核验规则，请补齐后重新提交。', marks: [{ section: '任务要求', note: '导师制覆盖缺统计指标引用' }] },
  'PL-2025-001': { decision: 'pass', at: '2021-02-20 10:30', by: 'u-zhang', opinion: '同意发布。', marks: [] },
  'PL-2025-002': { decision: 'pass', at: '2025-01-22 10:20', by: 'u-zhang', opinion: '同意发布。', marks: [] },
}

function ensureAuditDecision(planId) {
  if (!AUDIT_DECISIONS[planId]) {
    AUDIT_DECISIONS = { ...AUDIT_DECISIONS, [planId]: { decision: null, at: '', by: '', opinion: '', marks: [] } }
  }
  return AUDIT_DECISIONS[planId]
}

/** 确认队列条目：只有发生过提交的方案才进入队列（提交时间取实际提交记录）。 */
export function auditRows() {
  return PLAN_STORE
    .filter((row) => row.submittedAt)
    .map((row) => {
      const decision = AUDIT_DECISIONS[row.planId] || { decision: null, at: '', by: '', opinion: '', marks: [] }
      return {
        ...decoratePlan(row),
        decision: decision.decision,
        decidedAt: decision.at,
        decidedBy: decision.by,
        opinion: decision.opinion,
        marks: decision.marks || [],
        // 待我确认 = 仍停在待确认节点且尚无决定；其余（含历史已发布/已归档）一律归入我已处理
        auditState: decision.decision
          ? 'handled'
          : (row.configurationStatus === 'pending' ? 'pending' : 'handled'),
      }
    })
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
}

export function queryAudit(tab, filters) {
  const f = { ...(filters || {}) }
  const keyword = (f.keyword || '').trim().toLowerCase()
  return auditRows().filter((row) => {
    if (tab === 'pending' && row.auditState !== 'pending') return false
    if (tab === 'handled' && row.auditState !== 'handled') return false
    if (keyword && !`${row.planName}${row.planCode}`.toLowerCase().includes(keyword)) return false
    if (f.configurationStatus && row.configurationStatus !== f.configurationStatus) return false
    if (f.ownerOrganization && row.ownerOrganization !== f.ownerOrganization) return false
    if (f.submittedFrom && row.submittedAt.slice(0, 10) < f.submittedFrom) return false
    if (f.submittedTo && row.submittedAt.slice(0, 10) > f.submittedTo) return false
    return true
  })
}

export function auditCounts() {
  const rows = auditRows()
  return {
    all: rows.length,
    pending: rows.filter((row) => row.auditState === 'pending').length,
    handled: rows.filter((row) => row.auditState === 'handled').length,
  }
}

export const EMPTY_AUDIT_FILTERS = {
  keyword: '',
  configurationStatus: '',
  ownerOrganization: '',
  submittedFrom: '',
  submittedTo: '',
}

export function businessStatusOf(row) {
  if (row.configurationStatus === 'published') {
    if (row.analysisStatus === 'failed') return '已发布，分析失败'
    if (row.effectiveFrom && row.effectiveFrom > today()) return '已发布（待生效）'
    return '已发布'
  }
  return (CONFIG_STATUSES[row.configurationStatus] || {}).label || row.configurationStatus
}

/**
 * 确认详情六段（文档 M07："分为方案背景、人员范围、任务要求、试算结果、变更影响、原文依据"）。
 * 展示的是**冻结提交版本**；提交者的新草稿不覆盖本次审查内容。
 */
export function auditDetail(planId) {
  const row = rawPlan(planId)
  if (!row) return null
  const plan = decoratePlan(row)
  const freeze = { schemeVersion: row.schemeVersion, submittedAt: row.submittedAt, submittedBy: row.submittedBy, changeReason: row.changeReason }
  const tasks = tasksByPlan(planId)
  const requirements = requirementsByPlan(planId)
  const scope = previewScope(row.scopeDefinition)
  const indicatorStopped = requirements.filter((item) => {
    const indicator = item.metricRef ? getIndicator(item.metricRef) : null
    return Boolean(indicator && indicator.status === '已停用' && item.requirementStatus !== '已发布')
  })
  const previous = PLAN_STORE
    .filter((item) => item.planId !== planId && item.planCode === row.planCode && item.publicationTime)
    .sort((a, b) => (a.schemeVersion < b.schemeVersion ? 1 : -1))[0] || null
  const previousRequirements = previous ? requirementsByPlan(previous.planId) : []
  const currentIds = new Set(requirements.map((item) => item.requirementId))
  const previousIds = new Set(previousRequirements.map((item) => item.requirementId))

  return {
    plan,
    freeze,
    background: [
      { label: '方案编号', value: row.planCode },
      { label: '发展方案名称', value: row.planName },
      { label: '配置版本号', value: row.schemeVersion },
      { label: '周期类型', value: row.planPeriodType },
      { label: '学校发展阶段', value: row.stageName },
      { label: '规划周期', value: `${row.periodStart} 至 ${row.periodEnd}` },
      { label: '业务责任组织', value: orgName(row.ownerOrganization) },
      { label: '业务责任人', value: personName(row.ownerPerson) },
      { label: '实际提交时间', value: row.submittedAt },
      { label: '提交人', value: personName(row.submittedBy) },
      { label: '配置生效日期', value: row.effectiveFrom || '待设置' },
      { label: '版本变更原因', value: row.changeReason || '首版编制' },
    ],
    scope,
    tasks,
    requirements,
    trial: requirementSummaryByPlan(planId),
    currentDefault: PLAN_STORE.filter((item) => item.isDefault).map((item) => ({ planId: item.planId, planName: item.planName, schemeVersion: item.schemeVersion })),
    impact: {
      previousVersion: previous ? previous.schemeVersion : '',
      added: requirements.filter((item) => !previousIds.has(item.requirementId)).length,
      removed: previousRequirements.filter((item) => !currentIds.has(item.requirementId)).length,
      stoppedIndicator: indicatorStopped,
      notes: [
        '确认通过后固定当前配置版本与生效日期，并开启初次分析。',
        previous ? `相对上一发布版本 ${previous.schemeVersion} 的差异见上；旧版已生成的报告与快照继续可读，不被新规则覆盖。` : '本方案尚无上一发布版本，属首次发布。',
        '分析失败不撤销有效配置，显示「已发布，分析失败」，可用同一配置与数据快照重试。',
      ],
    },
    validation: validatePlanForPublish(planId),
    documents: (row.documentRefs || []).map((ref) => {
      const hit = DOCUMENT_LIBRARY.find((item) => item.id === ref)
      return hit || { id: ref, name: ref, type: '未知' }
    }),
    sourceClause: row.sourceClause,
    frozenRequirements: requirements.map((item) => ({ ...item })),
  }
}

export function canDecide(planId) {
  const row = rawPlan(planId)
  if (!row) return { ok: false, reason: '方案不存在。' }
  if (row.configurationStatus !== 'pending') return { ok: false, reason: '该版本当前不在待确认节点。' }
  const decision = AUDIT_DECISIONS[planId]
  if (decision && decision.decision) return { ok: false, reason: '该提交已被处理，不能重复发布。' }
  return { ok: true }
}

/** 是否为同一「显式默认方案」竞争分组：统计范围一致 + 规划周期重叠。 */
function sameDefaultGroup(a, b) {
  const sa = a.scopeDefinition || {}
  const sb = b.scopeDefinition || {}
  const orgA = (sa.organizations || []).slice().sort().join(',')
  const orgB = (sb.organizations || []).slice().sort().join(',')
  const roleA = (sa.personCategories || []).slice().sort().join(',')
  const roleB = (sb.personCategories || []).slice().sort().join(',')
  if (orgA !== orgB || roleA !== roleB) return false
  if (!a.periodStart || !a.periodEnd || !b.periodStart || !b.periodEnd) return true
  return a.periodStart <= b.periodEnd && b.periodStart <= a.periodEnd
}

/**
 * 确认通过并发布。发布原子性（文档 M07）：
 *  - 固定配置版本与生效日期 → 开启初次分析；
 *  - 生效日期在未来 → 不替代当前有效版，到生效日切换；
 *  - 分析失败 → 配置仍有效，标记 analysisStatus='failed'；
 *  - 并发确认 → 已处理则拒绝，不重复发布。
 */
export function confirmPublish(planId, options) {
  const check = canDecide(planId)
  if (!check.ok) return check
  const options2 = options || {}
  const opinion = (options2.opinion || '').trim()
  const row = rawPlan(planId)
  const validation = validatePlanForPublish(planId)
  if (validation.blockers.length) {
    return { ok: false, reason: `仍有 ${validation.blockers.length} 项发布前阻断项，不能发布：${validation.blockers[0]}`, validation }
  }
  const effectiveFrom = options2.effectiveFrom || row.effectiveFrom || today()
  const futureEffective = effectiveFrom > today()
  const analysisFailed = Boolean(options2.simulateAnalysisFailure)

  row.configurationStatus = 'published'
  row.effectiveFrom = effectiveFrom
  row.publicationTime = nowStamp()
  row.analysisStatus = analysisFailed ? 'failed' : 'ok'
  row.businessUpdatedAt = nowStamp()
  if (!futureEffective) {
    // 生效日期不是未来 → 本版本成为显式默认方案；同「统计范围 + 周期重叠」分组的其他版本让出默认位。
    // 文档 M07：同范围/周期允许多个专项方案，但只有一个显式默认方案，不按更新时间自动选。
    PLAN_STORE.forEach((item) => {
      if (item.planId === planId) return
      if (!item.isDefault) return
      if (!sameDefaultGroup(item, row)) return
      item.isDefault = false
      logEvent(item.planId, 'superseded', `默认方案切换至 ${row.planCode} ${row.schemeVersion}`)
    })
    row.isDefault = true
  }
  AUDIT_DECISIONS = {
    ...AUDIT_DECISIONS,
    [planId]: { decision: 'pass', at: nowStamp(), by: AUDIT_CURRENT_PERSON, opinion, marks: [] },
  }
  logEvent(planId, 'published', `确认通过并发布 ${row.schemeVersion}（生效日期 ${effectiveFrom}）`)
  if (analysisFailed) logEvent(planId, 'analysis-failed', '初次分析失败，配置仍有效，可用同一快照重试')

  return {
    ok: true,
    effectiveFrom,
    futureEffective,
    analysisFailed,
    message: analysisFailed
      ? '已发布，分析失败；配置有效，可用同一配置与数据快照重试分析。'
      : (futureEffective ? `已确认发布；生效日期 ${effectiveFrom} 在未来，暂不替代当前有效版本。` : '已确认通过并发布，已开启初次分析。'),
  }
}

export function returnForRevision(planId, options) {
  const check = canDecide(planId)
  if (!check.ok) return check
  const opinion = (options && options.opinion || '').trim()
  if (!opinion) return { ok: false, reason: '退回必须填写确认意见。' }
  const row = rawPlan(planId)
  row.configurationStatus = 'draft'
  row.businessUpdatedAt = nowStamp()
  AUDIT_DECISIONS = {
    ...AUDIT_DECISIONS,
    [planId]: { decision: 'return', at: nowStamp(), by: AUDIT_CURRENT_PERSON, opinion, marks: (options && options.marks) || [] },
  }
  logEvent(planId, 'returned', `退回修改：${opinion}`)
  return { ok: true, message: '已退回修改；提交人将从草稿继续完善，历史意见保留可查。' }
}

export function retryAnalysis(planId, options) {
  const row = rawPlan(planId)
  if (!row) return { ok: false, reason: '方案不存在。' }
  if (row.analysisStatus !== 'failed') return { ok: false, reason: '该版本当前没有失败的分析任务。' }
  const succeed = !(options && options.stillFailing)
  row.analysisStatus = succeed ? 'ok' : 'failed'
  logEvent(planId, 'analysis-retry', succeed ? '重试分析成功（同一配置与数据快照）' : '重试分析仍然失败')
  return { ok: true, analysisStatus: row.analysisStatus, message: succeed ? '重试成功，分析结果已更新。' : '重试仍失败；配置保持有效，可继续重试。' }
}

export function auditEvents(planId) {
  return planEvents(planId).filter((item) => ['submitted', 'withdrawn', 'published', 'returned', 'archived', 'superseded', 'analysis-failed', 'analysis-retry'].includes(item.type))
}
