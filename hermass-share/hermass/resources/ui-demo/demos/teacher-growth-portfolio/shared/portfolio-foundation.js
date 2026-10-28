/**
 * 教师成长档案袋 · 统一数据契约 + 评分引擎 + 规则引擎 + AI 抽取引擎
 * （4 层底座的唯一真源）
 *
 * 设计目标：终结"应用层丰满、底层空心"。
 *  - 所有页面（画像/诊断/看板/模型/指标/规则/集成）的数据与口径都从这里读。
 *  - 只有一套 5 维评价框架，对应"破五唯 / 师德第一标准"等政策。
 *  - 评分由 computeScore 统一算出；预警/校验/KPI 由 policyRules 参数化驱动。
 *  - AI 抽取：对任意制度文本，用句式模板生成候选（启发式拟真，不接真 LLM）。
 *
 * 这是原型 demo 的 mock 数据 + 纯函数，不接真实后端 / LLM。
 */

// ============================================================================
// 固定 5 维评价框架（全系统唯一，破五唯收敛）
// ============================================================================
export const DIMENSIONS_5 = [
  { id: 'ethics', name: '师德师风', short: '师德', defaultWeight: 20, isVeto: true, desc: '第一标准，可设一票否决' },
  { id: 'teaching', name: '教育教学', short: '教学', defaultWeight: 30, isVeto: false, desc: '课堂教学、教研教改、育人成效' },
  { id: 'research', name: '科研与社会服务', short: '科研', defaultWeight: 20, isVeto: false, desc: '含技术服务、成果转化，破唯论文' },
  { id: 'development', name: '专业发展', short: '专业', defaultWeight: 15, isVeto: false, desc: '双师能力、企业实践、培训进修、证书' },
  { id: 'contribution', name: '团队与贡献', short: '团队', defaultWeight: 15, isVeto: false, desc: '团队建设、传帮带、公共服务' },
]

// ============================================================================
// 政策制度源（L2）
// ============================================================================
export const policySources = [
  { id: 'PS-01', name: '《高校教师职称制度改革指导意见》', type: '职称评审', publishedAt: '2020', status: '已入库', extractedCount: 6 },
  { id: 'PS-02', name: '《职业教育"双师型"教师队伍建设改革的意见》', type: '双师认定', publishedAt: '2019', status: '已入库', extractedCount: 5 },
  { id: 'PS-03', name: '2026 版讲师聘期考核办法', type: '聘期考核', publishedAt: '2026', status: '已入库', extractedCount: 9 },
]

// mock 制度全文（A3 抽索取数基准 / 上传快捷入口）
export const POLICY_SAMPLE_TEXT = `第一条 教师评价坚持师德师风第一标准。师德考核不合格者，聘期考核一票否决。
第二条 克服唯论文倾向，论文类指标合计权重不得超过百分之三十。
第三条 聘期内教学工作量不得少于三百二十学时。
第四条 双师型教师企业实践经历累计不得少于六个月。
第五条 参评副教授须包含教书育人实绩指标，教学成果作为重要依据。
第六条 科研经费聘期内累计不得少于五十万元。
第七条 指导学生技能竞赛获奖纳入教育教学实绩。
第八条 培训进修学时累计不得少于二百四十学时。`

// ============================================================================
// 政策规则库（参数化，L2 合规校验 / L3 预警 / KPI / 聘期 都消费它）
// ============================================================================
// 规则不再用 JS 函数硬编码，而是声明式 params，由解释器 evaluateRule 统一执行。
// 这样改阈值不用改代码，规则库管理页可在线编辑参数。
//
//   type:   'veto' 一票否决 | 'threshold' 预警线 | 'floor' 门槛 | 'cap' 权重上限
//   scope:  规则求值的对象层级 —— 'model' 模型层 | 'indicator' 指标层
//   appliesTo: 消费场景 ['compliance' | 'warning' | 'kpi' | 'tenure']
//   params:  { metric, op, value }  metric 取值见 METRIC_GETTERS
// ============================================================================
export const policyRules = [
  {
    id: 'R-ethics-veto', name: '师德一票否决', type: 'veto', scope: 'model',
    params: { metric: 'ethicsWeight', op: '>', value: 0 },
    appliesTo: ['compliance'],
    policySourceId: 'PS-01', clause: '师德师风作为教师评价第一标准，存在师德问题者一票否决。', confidence: 0.97,
    status: 'active', version: 'v1.0', versions: [{ version: 'v1.0', summary: '迁移为参数化', time: '2026-07-01', operator: '周敏' }],
    failMsg: '模型未设"师德师风"维度或权重为 0，违反师德一票否决要求',
  },
  {
    id: 'R-paper-cap', name: '破唯论文（权重上限）', type: 'cap', scope: 'model',
    params: { metric: 'paperWeight', op: '<=', value: 40 },
    appliesTo: ['compliance'],
    policySourceId: 'PS-01', clause: '克服唯论文倾向，论文类指标合计权重不应超过 40%。', confidence: 0.96,
    status: 'active', version: 'v1.0', versions: [{ version: 'v1.0', summary: '迁移为参数化', time: '2026-07-01', operator: '周敏' }],
    failMsg: '论文类指标合计权重超过 40%，疑似唯论文倾向',
  },
  {
    id: 'R-teaching-floor', name: '教学实绩门槛', type: 'floor', scope: 'model',
    params: { metric: 'teachingIndicatorCount', op: '>=', value: 1 },
    appliesTo: ['compliance'],
    policySourceId: 'PS-01', clause: '须包含教书育人实绩指标。', confidence: 0.94,
    status: 'active', version: 'v1.0', versions: [{ version: 'v1.0', summary: '迁移为参数化', time: '2026-07-01', operator: '周敏' }],
    failMsg: '缺少教育教学实绩指标',
  },
  // —— 预警线（warning 场景，驱动教师/学院/领导预警）——
  // 注意：params.op 统一表示"通过方向"（达标条件），evaluateRule 返回 passed=是否达标；
  // getWarnings 以 !passed 判定触发。此前写成 '<'（触发方向）导致满分指标反向触发预警。
  {
    id: 'R-warn-dim-score', name: '维度预警线', type: 'threshold', scope: 'indicator',
    params: { metric: 'scoreRate', op: '>=', value: 80 },
    appliesTo: ['warning'],
    policySourceId: 'PS-03', clause: '聘期考核维度达成率低于 80% 触发预警。', confidence: 0.90,
    status: 'active', version: 'v1.1',
    versions: [
      { version: 'v1.1', summary: '修正 op 语义为通过方向（>=80% 达标）', time: '2026-09-28', operator: '周敏' },
      { version: 'v1.0', summary: '初始化预警线 80%', time: '2026-07-01', operator: '周敏' },
    ],
    failMsg: '达成率低于预警线',
  },
  {
    id: 'R-warn-total', name: '总分预警线', type: 'threshold', scope: 'model',
    params: { metric: 'totalScore', op: '>=', value: 70 },
    appliesTo: ['warning', 'kpi'],
    policySourceId: 'PS-03', clause: '聘期履职综合得分低于 70 分为不合格，触发预警。', confidence: 0.92,
    status: 'active', version: 'v1.0', versions: [{ version: 'v1.0', summary: '初始化 70 分', time: '2026-07-01', operator: '周敏' }],
    failMsg: '综合得分低于合格线',
  },
  // —— KPI（kpi 场景，领导驾驶舱红黄绿）——
  {
    id: 'R-kpi-dual', name: '双师比底线', type: 'threshold', scope: 'indicator',
    params: { metric: 'groupDualRate', op: '>=', value: 70 },
    appliesTo: ['kpi'],
    policySourceId: 'PS-02', clause: '双师型教师占比不低于 70%（升本要求）。', confidence: 0.93,
    status: 'active', version: 'v1.0', versions: [{ version: 'v1.0', summary: '初始化 70%', time: '2026-07-01', operator: '周敏' }],
    failMsg: '双师型教师占比未达标',
  },
  {
    id: 'R-kpi-doctor', name: '博士占比底线', type: 'threshold', scope: 'indicator',
    params: { metric: 'groupDoctorRate', op: '>=', value: 20 },
    appliesTo: ['kpi'],
    policySourceId: 'PS-01', clause: '博士占比不低于 20%（升本要求）。', confidence: 0.90,
    status: 'active', version: 'v1.0', versions: [{ version: 'v1.0', summary: '初始化 20%', time: '2026-07-01', operator: '周敏' }],
    failMsg: '博士占比未达标',
  },
  // —— 聘期（tenure 场景，驱动聘期满考核/成果登记预警）—— 停用态演示
  {
    id: 'R-tenure-practice', name: '聘期企业实践底线', type: 'floor', scope: 'indicator',
    params: { metric: 'indicatorRate', op: '>=', value: 50 },
    appliesTo: ['tenure'],
    policySourceId: 'PS-02', clause: '双师型教师企业实践至少完成 50%（6 个月 / 12 个月）。', confidence: 0.88,
    status: 'inactive', version: 'v1.0', versions: [{ version: 'v1.0', summary: '初始化', time: '2026-07-01', operator: '周敏' }],
    failMsg: '企业实践不足 50%',
  },
]

// 指标度量获取器：把 metric 名翻译成具体数值
// modelScope: 传 (model, ctx) ；indicatorScope: 传 (indicatorResult, ctx)
const METRIC_GETTERS = {
  // model 层
  ethicsWeight: (ctx) => {
    const d = ctx.model.dimensions.find((x) => x.dimensionId === 'ethics')
    return d ? d.weight : 0
  },
  paperWeight: (ctx) => {
    return ctx.model.dimensions
      .flatMap((d) => d.indicators)
      .filter((ind) => /论文|著作|paper/i.test(indicatorById(ind.indicatorId)?.name || ''))
      .reduce((s, ind, _i, arr) => {
        const dimInd = ctx.model.dimensions.flatMap((d) => d.indicators).filter((x) => x.indicatorId === ind.indicatorId)
        const dimWeight = ctx.model.dimensions.find((d) => d.indicators.some((x) => x.indicatorId === ind.indicatorId))?.weight || 0
        return s + (ind.weight / 100) * dimWeight
      }, 0)
  },
  teachingIndicatorCount: (ctx) => {
    const d = ctx.model.dimensions.find((x) => x.dimensionId === 'teaching')
    return d ? d.indicators.length : 0
  },
  totalScore: (ctx) => (ctx.total != null ? ctx.total : 0),
  groupDualRate: (ctx) => ctx.groupStats?.dualRate ?? 0,
  groupDoctorRate: (ctx) => ctx.groupStats?.doctorRate ?? 0,
  // indicator 层
  scoreRate: (ctx) => {
    const ind = ctx.indicator
    return ind ? Math.round((ind.score / 100) * 100) : 0 // score 已是百分制
  },
  indicatorRate: (ctx) => {
    const ind = ctx.indicator
    return ind && ind.target > 0 ? Math.round((ind.actual / ind.target) * 100) : 0
  },
}

const OPS = {
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
}

// 解释执行单条规则：返回是否通过
function evaluateRule(rule, ctx) {
  const getter = METRIC_GETTERS[rule.params.metric]
  if (!getter) return { passed: true, actual: null } // 未知度量默认通过（稳健）
  const actual = getter(ctx)
  const op = OPS[rule.params.op]
  return { passed: op ? op(actual, rule.params.value) : true, actual }
}

// ============================================================================
// 数据源（L1）：6 大外部系统 + 字段级血缘
// ============================================================================
export const sourceSystems = [
  { id: 'hr-sys', name: '人事系统', status: 'normal', lastSync: '2026-07-08 03:00', recordCount: 2846, fields: ['姓名', '工号', '职称', '学历', '入职日期'] },
  { id: 'academic-sys', name: '教务系统', status: 'normal', lastSync: '2026-07-08 03:15', recordCount: 18592, fields: ['授课学时', '教学质量评价', '课程数'] },
  { id: 'research-sys', name: '科研系统', status: 'normal', lastSync: '2026-07-08 03:30', recordCount: 6824, fields: ['科研项目', '科研经费', '论文', '专利'] },
  { id: 'training-sys', name: '培训系统', status: 'normal', lastSync: '2026-07-08 03:45', recordCount: 4521, fields: ['培训学时', '进修记录', '证书'] },
  { id: 'quality-sys', name: '质量平台', status: 'normal', lastSync: '2026-07-08 04:00', recordCount: 2348, fields: ['巡课评价', '督导评价'] },
  { id: 'patrol-sys', name: '巡课系统', status: 'error', lastSync: '2026-07-07 04:00', recordCount: 0, fields: ['课堂秩序', '出勤'] },
]

export const dataQuality = {
  completeness: 92.4, timeliness: 88.1, anomalyRate: 3.2,
  anomalies: [
    { id: 'a1', source: '巡课系统', desc: '数据源连接异常，已 24h 未同步', level: 'danger' },
    { id: 'a2', source: '科研系统', desc: '12 位教师经费字段为空', level: 'warning' },
    { id: 'a3', source: '培训系统', desc: '5 条培训记录日期早于入职日期', level: 'warning' },
  ],
}

// ============================================================================
// 指标库（L2，原子单位）
// collectionMethod: 'auto' 自动采集 | 'manual' 人工填报 | 'audit' 审核认定
// calcType: 'number' 数值 | 'boolean' 布尔达标 | 'segment' 分段赋分 | 'representative' 代表作评议
// ============================================================================
export const indicators = [
  { id: 'I-ethics-01', name: '师德考核结果', dimensionId: 'ethics', archiveDomainKey: 'ethics', definition: '年度师德师风专项考核结果', sourceMapping: { sourceSystemId: 'quality-sys', sourceField: '师德考核等级', collectionMethod: 'audit' }, calcType: 'boolean', target: 1, unit: '', fullScore: 100, weight: 60, policyBasis: { policySourceId: 'PS-01', clause: '师德师风作为教师评价第一标准，师德考核不合格者一票否决。', confidence: 0.97 }, status: 'confirmed' },
  { id: 'I-ethics-02', name: '学生评教满意度', dimensionId: 'ethics', archiveDomainKey: 'ethics', definition: '近两学年学生评教平均分', sourceMapping: { sourceSystemId: 'academic-sys', sourceField: '学生评教分', collectionMethod: 'auto' }, calcType: 'number', target: 4.5, unit: '分', fullScore: 100, weight: 40, policyBasis: { policySourceId: 'PS-01', clause: '突出教书育人实绩，重视学生评价。', confidence: 0.88 }, status: 'confirmed' },
  { id: 'I-teach-01', name: '教学工作量', dimensionId: 'teaching', archiveDomainKey: 'teaching', definition: '聘期累计教学工作量', sourceMapping: { sourceSystemId: 'academic-sys', sourceField: '授课学时', collectionMethod: 'auto' }, calcType: 'number', target: 320, unit: '学时', fullScore: 100, weight: 30, policyBasis: { policySourceId: 'PS-03', clause: '讲师聘期内应完成不少于 320 学时教学工作量。', confidence: 0.95 }, status: 'confirmed' },
  { id: 'I-teach-02', name: '教学质量评价', dimensionId: 'teaching', archiveDomainKey: 'teaching', definition: '教学质量综合评价', sourceMapping: { sourceSystemId: 'quality-sys', sourceField: '督导评价', collectionMethod: 'auto' }, calcType: 'number', target: 4.5, unit: '分', fullScore: 100, weight: 30, policyBasis: { policySourceId: 'PS-01', clause: '把教学质量作为职称评审的重要依据。', confidence: 0.92 }, status: 'confirmed' },
  { id: 'I-teach-03', name: '教学成果奖', dimensionId: 'teaching', archiveDomainKey: 'contest', definition: '聘期内获校级及以上教学成果奖', sourceMapping: { sourceSystemId: 'research-sys', sourceField: '教学成果获奖', collectionMethod: 'manual' }, calcType: 'segment', target: 1, unit: '项', fullScore: 100, weight: 25, policyBasis: { policySourceId: 'PS-01', clause: '重视教学成果，破唯论文。', confidence: 0.85 }, status: 'confirmed' },
  { id: 'I-teach-04', name: '指导学生竞赛', dimensionId: 'teaching', archiveDomainKey: 'contest', definition: '指导学生获省级以上技能竞赛奖', sourceMapping: { sourceSystemId: 'academic-sys', sourceField: '竞赛指导记录', collectionMethod: 'manual' }, calcType: 'segment', target: 2, unit: '项', fullScore: 100, weight: 15, policyBasis: { policySourceId: 'PS-03', clause: '指导学生技能竞赛获奖纳入教育教学实绩。', confidence: 0.80 }, status: 'confirmed' },
  { id: 'I-res-01', name: '科研经费', dimensionId: 'research', archiveDomainKey: 'research', definition: '聘期累计到账科研经费', sourceMapping: { sourceSystemId: 'research-sys', sourceField: '科研经费', collectionMethod: 'auto' }, calcType: 'number', target: 85, unit: '万元', fullScore: 100, weight: 30, policyBasis: { policySourceId: 'PS-03', clause: '聘期内应承担一定科研任务。', confidence: 0.90 }, status: 'confirmed' },
  { id: 'I-res-02', name: '代表作业（论文/著作）', dimensionId: 'research', archiveDomainKey: 'research', definition: '代表作评议，重质量非数量', sourceMapping: { sourceSystemId: 'research-sys', sourceField: '论文/著作', collectionMethod: 'audit' }, calcType: 'representative', target: 2, unit: '篇', fullScore: 100, weight: 25, policyBasis: { policySourceId: 'PS-01', clause: '实行代表作评价制度，破除唯论文数量倾向。', confidence: 0.96 }, status: 'confirmed' },
  { id: 'I-res-03', name: '技术服务项目', dimensionId: 'research', archiveDomainKey: 'practice', definition: '横向技术服务项目数', sourceMapping: { sourceSystemId: 'research-sys', sourceField: '横向项目', collectionMethod: 'manual' }, calcType: 'segment', target: 3, unit: '项', fullScore: 100, weight: 25, policyBasis: { policySourceId: 'PS-02', clause: '鼓励教师从事技术服务，促进产教融合。', confidence: 0.87 }, status: 'confirmed' },
  { id: 'I-res-04', name: '专利与成果转化', dimensionId: 'research', archiveDomainKey: 'research', definition: '发明专利及成果转化收益', sourceMapping: { sourceSystemId: 'research-sys', sourceField: '专利/转化', collectionMethod: 'manual' }, calcType: 'segment', target: 1, unit: '项', fullScore: 100, weight: 20, policyBasis: { policySourceId: 'PS-02', clause: '重视技术技能积累与成果转化。', confidence: 0.82 }, status: 'draft' },
  { id: 'I-dev-01', name: '企业实践经历', dimensionId: 'development', archiveDomainKey: 'practice', definition: '聘期累计企业实践月数', sourceMapping: { sourceSystemId: 'hr-sys', sourceField: '企业实践记录', collectionMethod: 'manual' }, calcType: 'number', target: 12, unit: '月', fullScore: 100, weight: 35, policyBasis: { policySourceId: 'PS-02', clause: '双师型教师须有累计不少于 6 个月企业实践经历。', confidence: 0.94 }, status: 'confirmed' },
  { id: 'I-dev-02', name: '技能/职业资格证书', dimensionId: 'development', archiveDomainKey: 'practice', definition: '持有的职业资格或技能等级证书', sourceMapping: { sourceSystemId: 'training-sys', sourceField: '证书', collectionMethod: 'manual' }, calcType: 'segment', target: 3, unit: '个', fullScore: 100, weight: 25, policyBasis: { policySourceId: 'PS-02', clause: '鼓励获取非教师系列执业资格或职业技能等级证书。', confidence: 0.89 }, status: 'confirmed' },
  { id: 'I-dev-03', name: '培训进修学时', dimensionId: 'development', archiveDomainKey: 'training', definition: '聘期累计培训进修学时', sourceMapping: { sourceSystemId: 'training-sys', sourceField: '培训学时', collectionMethod: 'auto' }, calcType: 'number', target: 240, unit: '学时', fullScore: 100, weight: 25, policyBasis: { policySourceId: 'PS-03', clause: '聘期内应完成规定培训进修学时。', confidence: 0.86 }, status: 'confirmed' },
  { id: 'I-dev-04', name: '课程开发成果', dimensionId: 'development', archiveDomainKey: 'teaching', definition: '开发/主编课程或教材', sourceMapping: { sourceSystemId: 'academic-sys', sourceField: '课程/教材', collectionMethod: 'manual' }, calcType: 'segment', target: 1, unit: '门/本', fullScore: 100, weight: 15, policyBasis: { policySourceId: 'PS-01', clause: '重视课程与教材建设能力。', confidence: 0.78 }, status: 'draft' },
  { id: 'I-team-01', name: '团队建设贡献', dimensionId: 'contribution', archiveDomainKey: 'contest', definition: '在教学创新团队/名师工作室中的贡献', sourceMapping: { sourceSystemId: 'hr-sys', sourceField: '团队任职', collectionMethod: 'audit' }, calcType: 'segment', target: 1, unit: '项', fullScore: 100, weight: 40, policyBasis: { policySourceId: 'PS-02', clause: '重视团队协作与建设贡献。', confidence: 0.84 }, status: 'confirmed' },
  { id: 'I-team-02', name: '传帮带/公共服务', dimensionId: 'contribution', archiveDomainKey: 'service', definition: '指导青年教师、担任公共服务岗位', sourceMapping: { sourceSystemId: 'hr-sys', sourceField: '公共服务记录', collectionMethod: 'manual' }, calcType: 'segment', target: 2, unit: '项', fullScore: 100, weight: 35, policyBasis: { policySourceId: 'PS-01', clause: '鼓励教师承担公共服务与传帮带责任。', confidence: 0.80 }, status: 'draft' },
  { id: 'I-team-03', name: '学术兼职影响力', dimensionId: 'contribution', archiveDomainKey: 'service', definition: '担任学术组织/行业协会职务', sourceMapping: { sourceSystemId: 'research-sys', sourceField: '学术兼职', collectionMethod: 'manual' }, calcType: 'segment', target: 1, unit: '项', fullScore: 100, weight: 25, policyBasis: { policySourceId: 'PS-01', clause: '可纳入综合影响力评价。', confidence: 0.72 }, status: 'draft' },
]

// ============================================================================
// 档案八域（FR-A 全息档案域）—— 与 5 评价维分离：材料按域归集，评价按维计算
// 教学 archiveDomainKey 含义：档案域用 teaching，但评价仍按 5 维（dimensionId 不变）
// ============================================================================
export const ARCHIVE_DOMAINS = [
  { key: 'basic',    label: '基本信息', items: ['个人信息', '学历学位', '职称聘任', '岗位变动'] },
  { key: 'ethics',   label: '师德师风', items: ['师德考核', '表彰记录', '承诺践诺', '负面清单'] },
  { key: 'research', label: '科研成果', items: ['论文论著', '纵/横向项目', '专利软著', '成果获奖'] },
  { key: 'practice', label: '企业实践', items: ['企业锻炼', '挂职实践', '技术服务', '双师佐证'] },
  { key: 'training', label: '培训研修', items: ['国培省培', '校本研修', '访学进修', '学历提升'] },
  { key: 'contest',  label: '竞赛荣誉', items: ['教学能力比赛', '指导学生竞赛', '荣誉称号', '人才项目'] },
  { key: 'service',  label: '社会服务', items: ['社会培训', '行业任职', '志愿服务', '咨询服务'] },
  { key: 'teaching', label: '教学档案', items: ['备课设计', '课堂实施', '学生评教', '督导听课', '教研教改', '课程建设'] },
]

// AI 抽取预置候选（固定剧本，向导演示快捷入口保留用）
export const aiExtractionCandidates = [
  { id: 'ai-1', name: '主持省级科研项目', dimensionId: 'research', sourceClause: '聘期内应主持或参与省级及以上科研项目至少 1 项。', confidence: 0.93, duplicateOf: null, calcType: 'segment', mapping: { sourceSystemId: 'research-sys', sourceField: '科研项目', collectionMethod: 'auto', needsManual: false } },
  { id: 'ai-2', name: '获省级教学能力比赛奖', dimensionId: 'teaching', sourceClause: '参加教学能力比赛并获省级以上奖励者予以加分。', confidence: 0.90, duplicateOf: 'I-teach-03', calcType: 'segment', mapping: { sourceSystemId: 'academic-sys', sourceField: '比赛获奖', collectionMethod: 'manual', needsManual: false } },
  { id: 'ai-3', name: '师德年度考核达标', dimensionId: 'ethics', sourceClause: '师德师风作为第一标准，考核不合格者一票否决。', confidence: 0.97, duplicateOf: 'I-ethics-01', calcType: 'boolean', mapping: { sourceSystemId: 'quality-sys', sourceField: '师德考核等级', collectionMethod: 'audit', needsManual: false } },
  { id: 'ai-4', name: '横向技术服务到款额', dimensionId: 'research', sourceClause: '横向技术服务到款额计入社会服务贡献。', confidence: 0.85, duplicateOf: 'I-res-03', calcType: 'number', mapping: { sourceSystemId: 'research-sys', sourceField: '横向到款', collectionMethod: 'auto', needsManual: false } },
  { id: 'ai-5', name: '指导学生创新创业项目', dimensionId: 'teaching', sourceClause: '指导学生开展创新创业实践并获奖。', confidence: 0.81, duplicateOf: null, calcType: 'segment', mapping: { sourceSystemId: null, sourceField: null, collectionMethod: 'manual', needsManual: true } },
  { id: 'ai-6', name: '行业标准制定参与', dimensionId: 'contribution', sourceClause: '参与行业/团体标准制定体现专业影响力。', confidence: 0.74, duplicateOf: null, calcType: 'segment', mapping: { sourceSystemId: null, sourceField: null, collectionMethod: 'manual', needsManual: true } },
]

// ============================================================================
// AI 规则/指标抽取引擎（A3 后端 · 启发式拟真，对任意文本产出候选）
// 句式模板：从自然语言条款识别"可校验/可预警"的参数化规则与指标
// ============================================================================
const N = '[\\d零一二三四五六七八九十百千两]' // 数字（阿拉伯/中文）一起匹配
const RULE_TEMPLATES = [
  // type=cap 权重上限: "论文...不得超过百分之三十" / "论文...不得超过30%" —— 支持两种语序
  { type: 'cap', scope: 'model', metric: 'paperWeight',
    re: new RegExp('(论文|著作|paper)[^。]*(?:不得(?:超过|高于)|不超过|不得高于)[^。]*?(?:百分之\\s*(' + N + '{1,3})|(' + N + '{1,3})\\s*%)', 'i'),
    paramKey: 'value', appliesTo: ['compliance'], op: '<=', typeLabel: '权重上限', name: (m) => '论文权重上限 ' + m + '%' },
  // 一票否决
  { type: 'veto', scope: 'model', metric: 'ethicsWeight', re: /(师德|师风).{0,8}(一票否决|否决)/i, paramKey: null, appliesTo: ['compliance'], op: '>', value: 0, typeLabel: '一票否决', name: () => '师德一票否决' },
  // threshold 预警: "低于X分触发预警" / "X分以下不合格"
  { type: 'threshold', scope: 'model', metric: 'totalScore', re: new RegExp('(?:低于|不超过|少于|以下)[^。]{0,6}(' + N + '{1,3})\\s*分?[^。]*(?:预警|不合格|扣分)', 'i'), paramKey: 'value', appliesTo: ['warning'], op: '<', typeLabel: '预警线', name: (m) => '综合得分预警线 ' + m + ' 分' },
  // floor 门槛：物理量 "不得少于X学时/月/万/项/个"  —— 抽出指标候选
  { type: 'floor', scope: 'indicator', metric: 'indicatorRate', re: new RegExp('(.{2,12}?)(?:不得少于|不少于|至少|不得低于)[^。]*?(' + N + '{1,4})\\s*(学时|个月|月|万元|万|项|篇|个|门|本)', 'i'), paramKey: 'value', appliesTo: ['tenure'], op: '>=', typeLabel: '门槛', name: (m) => '指标达标门槛 ' + m + '%' },
]

// 中文数字归一：六→6（用于制度文里"六个月""三百二十学时"等）
const CN_NUM = { 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 百: 100, 千: 1000 }
function cnToInt(s) {
  if (/^\d+$/.test(s)) return parseInt(s, 10)
  let total = 0, cur = 0
  for (const ch of s) {
    if (ch in CN_NUM) {
      const n = CN_NUM[ch]
      if (n >= 10) { cur = (cur || 1) * n; if (n >= 100) { total += cur; cur = 0 } }
      else cur = n
    }
  }
  return total + cur
}

/**
 * 对任意制度文本抽取候选规则 + 候选指标。
 * @returns { rules: [...], indicators: [...], unknown: ['未识别为规则/指标的条款...'] }
 * 非固定剧本：句式正则驱动，不同文本产出不同结果。
 */
export function extractFromPolicyText(text) {
  if (!text || !text.trim()) return { rules: [], indicators: [], unknown: [] }
  // 按句/条切分
  const clauses = text
    .replace(/第[一二三四五六七八九十百]+条/g, '§')
    .split(/[。；;\n§]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 4)

  const rules = []
  const indicators = []
  const unknown = []
  let rId = 1, iId = 1
  const usedClauses = new Set()

  clauses.forEach((clause) => {
    let matched = false
    // 规则匹配
    for (const tpl of RULE_TEMPLATES) {
      const m = clause.match(tpl.re)
      if (m) {
        matched = true
        usedClauses.add(clause)
        // 取第一个非空的数字捕获组（不同模板数字组位置可能不同）
        const valueRaw = tpl.paramKey === 'value'
          ? (m.slice(1).find((g) => g && /[\d零一二三四五六七八九十百千两]/.test(g)))
          : tpl.value
        const num = cnToInt(valueRaw != null ? String(valueRaw) : '0')
        const params = { metric: tpl.metric, op: tpl.op, value: num }
        rules.push({
          id: `NEW-R-${rId++}`,
          name: tpl.name(String(num)),
          type: tpl.type,
          scope: tpl.scope,
          params,
          appliesTo: tpl.appliesTo,
          clause,
          confidence: 0.7 + Math.min(0.25, (clause.length % 5) / 20),
          duplicateOf: null,
        })
        break
      }
    }
    if (matched) return
    // 指标启发式：含指标核心词 + 目标量词
    const indM = clause.match(/(.{2,12}?)(?:不得少于|不少于|至少|不得低于|累计[^。]{0,4})[^。]*?(\d{1,4})\s*(学时|个月|月|万元|万|项|篇|个|门|本|分)/)
    if (indM) {
      usedClauses.add(clause)
      const dimGuess = guessDimension(clause)
      indicators.push({
        id: `NEW-I-${iId++}`,
        name: indM[1].slice(0, 12) + '要求',
        dimensionId: dimGuess,
        sourceClause: clause,
        confidence: 0.7 + (clause.length % 4) / 20,
        calcType: 'number',
        mapping: { sourceSystemId: guessSource(dimGuess), sourceField: indM[1].slice(0, 6), collectionMethod: 'auto', needsManual: false },
        unit: indM[3],
        target: cnToInt(indM[2]),
      })
      return
    }
    unknown.push(clause)
  })

  return { rules, indicators, unknown }
}

function guessDimension(text) {
  if (/师德|师风/.test(text)) return 'ethics'
  if (/教学|授课|课程|学生|教改|育人/.test(text)) return 'teaching'
  if (/科研|论文|专利|经费|技术|转化/.test(text)) return 'research'
  if (/实践|培训|进修|证书|教材|双师/.test(text)) return 'development'
  if (/团队|传帮带|服务|兼职|贡献/.test(text)) return 'contribution'
  return 'teaching'
}
function guessSource(dim) {
  const map = { ethics: 'quality-sys', teaching: 'academic-sys', research: 'research-sys', development: 'training-sys', contribution: 'hr-sys' }
  return map[dim] || null
}

// ============================================================================
// 教师原始数据资产（L1，字段带 source 血缘）+ careerEvents 时间轴
// ============================================================================
// T001/T002 手写为"详细演示样本"；T003~T016 由确定性生成器造分布（不依赖 Math.random，保证可复现）

// 数据点辅助器：所有教师共享的字段血缘约定
const D = (system, field) => ({ system, field })

// 手写演示样本（张明：整体优秀但科研经费与竞赛短板；李娜：讲师，多项待补）
const T001 = {
  id: 'T001', name: '张明', avatar: '张', college: '电子与通信工程学院', title: '副教授',
  dualTeacher: '高级双师', degree: '博士', employeeId: '20201234', entryDate: '2017-09',
  teachingYears: 9, practiceMonths: 6,
  data: {
    'I-ethics-01': { value: 1, source: D('质量平台', '师德考核等级') },
    'I-ethics-02': { value: 4.8, source: D('教务系统', '学生评教分') },
    'I-teach-01': { value: 288, source: D('教务系统', '授课学时') },
    'I-teach-02': { value: 4.8, source: D('质量平台', '督导评价') },
    'I-teach-03': { value: 1, source: D('本人填报', '教学成果奖证书') },
    'I-teach-04': { value: 1, source: D('本人填报', '竞赛指导证明') },
    'I-res-01': { value: 42.6, source: D('科研系统', '科研经费') },
    'I-res-02': { value: 3, source: D('本人填报', '论文代表作') },
    'I-res-03': { value: 2, source: D('本人填报', '技术服务合同') },
    'I-res-04': { value: 1, source: D('本人填报', '专利证书') },
    'I-dev-01': { value: 6, source: D('本人填报', '企业实践证明') },
    'I-dev-02': { value: 2, source: D('本人填报', '技能证书') },
    'I-dev-03': { value: 186, source: D('培训系统', '培训学时') },
    'I-dev-04': { value: 1, source: D('本人填报', '教材主编') },
    'I-team-01': { value: 1, source: D('人事系统', '团队任职') },
    'I-team-02': { value: 1, source: D('本人填报', '传帮带记录') },
    'I-team-03': { value: 1, source: D('本人填报', '学术兼职') },
  },
  careerEvents: [
    { type: 'entry', date: '2017-09', title: '入职电子与通信工程学院', dimensionId: 'contribution', evidenceRef: '人事系统·入职记录' },
    { type: 'degree', date: '2019-09', title: '获得博士学位', dimensionId: 'development', evidenceRef: '本人填报·学位证书' },
    { type: 'title', date: '2020-06', title: '晋升讲师', dimensionId: 'contribution', evidenceRef: '人事系统·职称' },
    { type: 'practice', date: '2021-07', title: '企业实践：XX科技技术工程师', dimensionId: 'development', evidenceRef: '本人填报·企业实践证明' },
    { type: 'title', date: '2023-09', title: '晋升副教授', dimensionId: 'contribution', evidenceRef: '人事系统·职称' },
    { type: 'project', date: '2024-03', title: '主持省级教改项目', dimensionId: 'research', evidenceRef: '科研系统·项目' },
    { type: 'award', date: '2025-06', title: '获校级教学成果奖', dimensionId: 'teaching', evidenceRef: '本人填报·教学成果奖证书' },
    { type: 'training', date: '2025-12', title: '国家级骨干教师培训', dimensionId: 'development', evidenceRef: '培训系统·培训学时' },
  ],
}

const T002 = {
  id: 'T002', name: '李娜', avatar: '李', college: '人工智能学院', title: '讲师',
  dualTeacher: '中级双师', degree: '硕士', employeeId: '20211567', entryDate: '2021-07',
  teachingYears: 5, practiceMonths: 4,
  data: {
    'I-ethics-01': { value: 1, source: D('质量平台', '师德考核等级') },
    'I-ethics-02': { value: 4.3, source: D('教务系统', '学生评教分') },
    'I-teach-01': { value: 264, source: D('教务系统', '授课学时') },
    'I-teach-02': { value: 4.2, source: D('质量平台', '督导评价') },
    'I-teach-03': { value: 0, source: D('本人填报', '教学成果奖证书') },
    'I-teach-04': { value: 0, source: D('本人填报', '竞赛指导证明') },
    'I-res-01': { value: 28, source: D('科研系统', '科研经费') },
    'I-res-02': { value: 1, source: D('本人填报', '论文代表作') },
    'I-res-03': { value: 1, source: D('本人填报', '技术服务合同') },
    'I-res-04': { value: 0, source: D('本人填报', '专利证书') },
    'I-dev-01': { value: 4, source: D('本人填报', '企业实践证明') },
    'I-dev-02': { value: 1, source: D('本人填报', '技能证书') },
    'I-dev-03': { value: 120, source: D('培训系统', '培训学时') },
    'I-dev-04': { value: 0, source: D('本人填报', '教材主编') },
    'I-team-01': { value: 0, source: D('人事系统', '团队任职') },
    'I-team-02': { value: 0, source: D('本人填报', '传帮带记录') },
    'I-team-03': { value: 0, source: D('本人填报', '学术兼职') },
  },
  careerEvents: [
    { type: 'entry', date: '2021-07', title: '入职人工智能学院', dimensionId: 'contribution', evidenceRef: '人事系统·入职记录' },
    { type: 'training', date: '2022-08', title: '暑期骨干教师研修', dimensionId: 'development', evidenceRef: '培训系统·培训学时' },
    { type: 'practice', date: '2023-06', title: '企业实践：AI算法工程师', dimensionId: 'development', evidenceRef: '本人填报·企业实践证明' },
    { type: 'certificate', date: '2024-03', title: '获得高级数据分析师证书', dimensionId: 'development', evidenceRef: '本人填报·技能证书' },
    { type: 'title', date: '2024-09', title: '晋升讲师', dimensionId: 'contribution', evidenceRef: '人事系统·职称' },
    { type: 'course', date: '2025-04', title: '主讲《深度学习实践》', dimensionId: 'teaching', evidenceRef: '教务系统·授课' },
    { type: 'project', date: '2025-11', title: '参与横向技术服务项目', dimensionId: 'research', evidenceRef: '本人填报·技术服务合同' },
    { type: 'training', date: '2026-06', title: '双师素养提升培训', dimensionId: 'development', evidenceRef: '培训系统·培训学时' },
  ],
}

// —— 确定性生成器：为 T003~T016 造分布 ——
// 用 id hash 做种子，保证同一 teacherId 每次生成同一份数据
function seededHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}
function seededPick(seed, arr) { return arr[seed % arr.length] }
function seededRange(seed, min, max) { return min + (seed % (max - min + 1)) }

// ============================================================================
// 二级学院编制规模（真实口径）
// ----------------------------------------------------------------------------
// 每个二级学院按专任教师 90~200 人设定，符合职业技术大学单个学院的真实规模。
// 这份规模直接决定 teachers 资产的生成数量：院级/校级的所有人数、占比、预警条数
// 都是这份资产的真聚合，不存在"统计口径写死、明细列表对不上"的情况。
//
// 注：demo 只覆盖 8 个主要二级学院，不是全校学院清单。
// ============================================================================
// doctorRate / seniorRate / dualRate 是各院的学缘特征（百分比），按学科属性区分：
// 新兴学科(人工智能/医药)博士多、双师少；制造类(机电/汽车)双师多、博士少。
// 不给所有学院同一套分布，院际对比、能力对比、师资画像才有真实的差异可看。
export const COLLEGE_PROFILES = [
  { name: '电子与通信工程学院', staffCount: 168, doctorRate: 28, seniorRate: 42, dualRate: 62 },
  { name: '人工智能学院', staffCount: 124, doctorRate: 42, seniorRate: 28, dualRate: 48 },
  { name: '机电工程学院', staffCount: 176, doctorRate: 15, seniorRate: 40, dualRate: 78 },
  { name: '经济管理学院', staffCount: 195, doctorRate: 24, seniorRate: 36, dualRate: 52 },
  { name: '汽车与交通学院', staffCount: 132, doctorRate: 13, seniorRate: 34, dualRate: 80 },
  { name: '建筑工程学院', staffCount: 118, doctorRate: 18, seniorRate: 38, dualRate: 70 },
  { name: '医药与生物学院', staffCount: 96, doctorRate: 35, seniorRate: 44, dualRate: 55 },
  { name: '数字创意学院', staffCount: 141, doctorRate: 20, seniorRate: 30, dualRate: 65 },
]
const COLLEGE_PROFILE_BY_NAME = COLLEGE_PROFILES.reduce((acc, item) => {
  acc[item.name] = item
  return acc
}, {})
const COLLEGES = COLLEGE_PROFILES.map((item) => item.name)

const TITLES = ['助教', '讲师', '副教授', '教授']
const DEGREES = ['学士', '硕士', '博士']
const DUAL = ['未认定', '初级双师', '中级双师', '高级双师']
// 姓名池：1100+ 教师需要足够的组合空间，否则分页列表里会出现大量重名
const SURNAMES = '王李张刘陈杨黄赵吴周徐孙马朱胡林郭何高罗郑梁谢宋唐许韩冯邓曹彭曾肖田董袁潘于蒋蔡余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范金石廖贾夏韦'
const GIVEN_CHARS = '明芳强静磊丽平敏军伟勇艳娟涛超霞秀娜刚健俊鹏辉波飞燕梅玲琳婷洁颖慧宁欣悦文华国建志远成安然嘉宇轩泽睿思博雅'

function generateTeacher(idNum, forcedCollege) {
  const id = 'T' + String(idNum).padStart(3, '0')
  const seed = seededHash(id)
  const surname = SURNAMES[seed % SURNAMES.length]
  // 55% 双字名 / 45% 单字名，贴近真实教师名册的构成
  const given1 = GIVEN_CHARS[seededHash(id + 'g1') % GIVEN_CHARS.length]
  const given2 = seededHash(id + 'g2') % 100 < 55
    ? GIVEN_CHARS[seededHash(id + 'g2c') % GIVEN_CHARS.length]
    : ''
  const name = surname + given1 + given2
  // 学院由 COLLEGE_PROFILES 的编制规模指派（见文件末尾的 teachers 装配），
  // 只有在未指派时才回退到散列分配。
  const college = forcedCollege || seededPick(seededHash(id + 'col'), COLLEGES)
  // 职称 / 学历 / 双师：按所属学院的学缘特征分桶，学院之间刻意拉开差异
  const cp = COLLEGE_PROFILE_BY_NAME[college] || { doctorRate: 22, seniorRate: 40, dualRate: 60 }

  // 职称：高级(副教授+教授)占 seniorRate，其中教授约占高级的 1/4；
  //       剩余名额里约 1/3 为助教、2/3 为讲师
  const seniorRate = cp.seniorRate
  const profRate = Math.round(seniorRate / 4)
  const assistantRate = Math.round((100 - seniorRate) * 0.32)
  const titleRoll = seededHash(id + 'title') % 100
  const title = titleRoll < assistantRate ? '助教'
    : titleRoll < 100 - seniorRate ? '讲师'
      : titleRoll < 100 - profRate ? '副教授' : '教授'

  // 学历：博士占 doctorRate，余下约 78% 为硕士、其余为学士
  const doctorRate = cp.doctorRate
  const masterRate = Math.round((100 - doctorRate) * 0.78)
  const degRoll = seededHash(id + 'degree') % 100
  const degree = degRoll < doctorRate ? '博士'
    : degRoll < doctorRate + masterRate ? '硕士' : '学士'

  // 双师：已认定占 dualRate，内部按 初级30% / 中级45% / 高级25% 分级
  const dualRate = cp.dualRate
  const unratedRate = 100 - dualRate
  const juniorEnd = unratedRate + Math.round(dualRate * 0.30)
  const midEnd = unratedRate + Math.round(dualRate * 0.75)
  const dualRoll = seededHash(id + 'dual') % 100
  const dual = dualRoll < unratedRate ? '未认定'
    : dualRoll < juniorEnd ? '初级双师'
      : dualRoll < midEnd ? '中级双师' : '高级双师'
  // 生成 17 项指标数据，值围绕目标值上下分布
  const data = {}
  const inds = [
    ['I-ethics-01', 1, 0, 1, '质量平台', '师德考核等级'],
    ['I-ethics-02', 4.5, 3.8, 5.0, '教务系统', '学生评教分'],
    ['I-teach-01', 320, 180, 380, '教务系统', '授课学时'],
    ['I-teach-02', 4.5, 3.8, 4.9, '质量平台', '督导评价'],
    ['I-teach-03', 1, 0, 3, '本人填报', '教学成果奖证书'],
    ['I-teach-04', 2, 0, 4, '本人填报', '竞赛指导证明'],
    ['I-res-01', 85, 10, 120, '科研系统', '科研经费'],
    ['I-res-02', 2, 0, 5, '本人填报', '论文代表作'],
    ['I-res-03', 3, 0, 6, '本人填报', '技术服务合同'],
    ['I-res-04', 1, 0, 3, '本人填报', '专利证书'],
    ['I-dev-01', 12, 0, 18, '本人填报', '企业实践证明'],
    ['I-dev-02', 3, 0, 5, '本人填报', '技能证书'],
    ['I-dev-03', 240, 80, 320, '培训系统', '培训学时'],
    ['I-dev-04', 1, 0, 3, '本人填报', '教材主编'],
    ['I-team-01', 1, 0, 3, '人事系统', '团队任职'],
    ['I-team-02', 2, 0, 4, '本人填报', '传帮带记录'],
    ['I-team-03', 1, 0, 3, '本人填报', '学术兼职'],
  ]
  inds.forEach(([indId, target, min, max, sys, field], i) => {
    const s = seededHash(id + indId)
    // 10% 概率为 missing（数据缺失，不参与评分）
    const isMissing = (s % 10) === 0
    if (isMissing) {
      data[indId] = { value: null, source: null, missing: true }
      return
    }
    let value = seededRange(s, min, max)
    // 20% 概率值为 0（有数据但为 0，比如没获奖）
    if ((s % 5) === 0 && min === 0) value = 0
    // 教学质量类保留小数
    if (indId === 'I-ethics-02' || indId === 'I-teach-02') {
      value = (min + (s % 100) / 100 * (max - min)).toFixed(1) * 1
    }
    data[indId] = { value, source: D(sys, field) }
  })
  const entryYear = 2015 + (seed % 10)
  // careerEvents：按 seed 派生 ≥8 条，有起伏（近两年部分维度空档），T001/T002 为手写范本
  // 剧本骨架：入职 → 入职培训 → 学历/学位 → 企业实践 → 晋升 → (项目/获奖，部分教师近两年空档) → 培训/证书
  const events = [
    { type: 'entry', date: `${entryYear}-09`, title: `入职${college}`, dimensionId: 'contribution', evidenceRef: '人事系统·入职记录' },
    { type: 'training', date: `${entryYear + 1}-06`, title: '入职培训', dimensionId: 'development', evidenceRef: '培训系统·培训学时' },
  ]
  // 学位（仅硕士/博士有学位节点，本科略过）
  if (degree !== '学士') {
    events.push({ type: 'degree', date: `${entryYear + 2}-06`, title: `取得${degree}学位`, dimensionId: 'development', evidenceRef: '本人填报·学位证书' })
  }
  // 企业实践（双师型教师）
  if (dual !== '未认定') {
    events.push({ type: 'practice', date: `${entryYear + 3}-07`, title: `企业实践:${dual.includes('高级') ? '首席工程师' : '技术工程师'}`, dimensionId: 'development', evidenceRef: '本人填报·企业实践证明' })
  }
  // 晋升
  events.push({ type: 'title', date: `${entryYear + 3}-09`, title: `晋升${title}`, dimensionId: 'contribution', evidenceRef: '人事系统·职称' })
  // 科研项目：约 60% 教师有，近两年部分空档(seed 决定)
  if (seededHash(id + 'proj') % 5 < 3) {
    events.push({ type: 'project', date: `${entryYear + 5}-03`, title: '主持/参与横向技术服务项目', dimensionId: 'research', evidenceRef: '本人填报·技术服务合同' })
  }
  // 获奖教学成果：约 45%，制造起伏
  if (seededHash(id + 'award') % 9 < 4) {
    events.push({ type: 'award', date: `${entryYear + 6}-06`, title: '校级教学成果奖', dimensionId: 'teaching', evidenceRef: '本人填报·教学成果奖证书' })
  }
  // 证书 / 课程开发：双师或副高以上
  if (dual !== '未认定' || title === '副教授' || title === '教授') {
    events.push({ type: 'certificate', date: `${entryYear + 6}-11`, title: '职业资格/技能等级证书', dimensionId: 'development', evidenceRef: '本人填报·技能证书' })
  }
  // 近期培训(2025-2026) —— 全员有，呼应"持续进修"
  events.push({ type: 'training', date: '2025-08', title: '骨干教师能力提升培训', dimensionId: 'development', evidenceRef: '培训系统·培训学时' })
  events.sort((a, b) => a.date.localeCompare(b.date))
  return {
    id, name, avatar: name[0], college, title, dualTeacher: dual, degree,
    employeeId: String(entryYear) + String(idNum).padStart(4, '0'),
    entryDate: `${entryYear}-0${(seed % 8) + 1}`,
    teachingYears: 2026 - entryYear,
    practiceMonths: data['I-dev-01'].value,
    data,
    careerEvents: events,
  }
}

// ============================================================================
// teachers 资产装配：按 COLLEGE_PROFILES 的编制规模逐院生成
// ----------------------------------------------------------------------------
// T001（张明·电子与通信）/ T002（李娜·人工智能）是手写的详细演示样本，
// 分别占用所在学院的 1 个编制名额，其余名额由确定性生成器补齐。
// 生成顺序固定 => teacherId 与学院归属可复现，刷新页面结果不变。
// ============================================================================
export const teachers = [T001, T002]

const handwrittenByCollege = teachers.reduce((acc, teacher) => {
  acc[teacher.college] = (acc[teacher.college] || 0) + 1
  return acc
}, {})

let nextTeacherSeq = 3
COLLEGE_PROFILES.forEach((profile) => {
  const remaining = profile.staffCount - (handwrittenByCollege[profile.name] || 0)
  for (let i = 0; i < remaining; i++) {
    teachers.push(generateTeacher(nextTeacherSeq++, profile.name))
  }
})

// ============================================================================
// 评价模型（L2）—— 5 维 → 指标 → 权重 的编排
// ============================================================================
export const models = [
  {
    id: 'M-tenure', name: '副教授聘期履职模型', category: 'tenure', scene: '聘期履职', target: '副教授',
    version: 'v2.0', status: 'published', updatedAt: '2026-05-20', algorithm: 'weighted-sum',
    gradeRules: [{ grade: '优秀', min: 90 }, { grade: '良好', min: 80 }, { grade: '合格', min: 70 }],
    dimensions: [
      { dimensionId: 'ethics', weight: 20, indicators: [{ indicatorId: 'I-ethics-01', weight: 60 }, { indicatorId: 'I-ethics-02', weight: 40 }] },
      { dimensionId: 'teaching', weight: 30, indicators: [{ indicatorId: 'I-teach-01', weight: 30 }, { indicatorId: 'I-teach-02', weight: 30 }, { indicatorId: 'I-teach-03', weight: 25 }, { indicatorId: 'I-teach-04', weight: 15 }] },
      { dimensionId: 'research', weight: 20, indicators: [{ indicatorId: 'I-res-01', weight: 30 }, { indicatorId: 'I-res-02', weight: 25 }, { indicatorId: 'I-res-03', weight: 25 }, { indicatorId: 'I-res-04', weight: 20 }] },
      { dimensionId: 'development', weight: 15, indicators: [{ indicatorId: 'I-dev-01', weight: 35 }, { indicatorId: 'I-dev-02', weight: 25 }, { indicatorId: 'I-dev-03', weight: 25 }, { indicatorId: 'I-dev-04', weight: 15 }] },
      { dimensionId: 'contribution', weight: 15, indicators: [{ indicatorId: 'I-team-01', weight: 40 }, { indicatorId: 'I-team-02', weight: 35 }, { indicatorId: 'I-team-03', weight: 25 }] },
    ],
    versions: [
      { version: 'v2.0', summary: '提升教学实绩权重，强化教学门槛', time: '2026-05-20', operator: '周敏' },
      { version: 'v1.8', summary: '调整科研代表作权重，破唯论文', time: '2026-04-10', operator: '周敏' },
    ],
  },
  {
    id: 'M-dual', name: '初级双师认定模型', category: 'dualTeacher', scene: '双师认定', target: '初级双师',
    version: 'v1.5', status: 'published', updatedAt: '2026-06-01', algorithm: 'weighted-sum',
    gradeRules: [{ grade: '合格', min: 70 }],
    dimensions: [
      { dimensionId: 'ethics', weight: 15, indicators: [{ indicatorId: 'I-ethics-01', weight: 100 }] },
      { dimensionId: 'teaching', weight: 25, indicators: [{ indicatorId: 'I-teach-01', weight: 50 }, { indicatorId: 'I-teach-02', weight: 50 }] },
      { dimensionId: 'development', weight: 40, indicators: [{ indicatorId: 'I-dev-01', weight: 50 }, { indicatorId: 'I-dev-02', weight: 30 }, { indicatorId: 'I-dev-03', weight: 20 }] },
      { dimensionId: 'research', weight: 10, indicators: [{ indicatorId: 'I-res-03', weight: 100 }] },
      { dimensionId: 'contribution', weight: 10, indicators: [{ indicatorId: 'I-team-01', weight: 100 }] },
    ],
    versions: [{ version: 'v1.5', summary: '强化企业实践权重至 50%', time: '2026-06-01', operator: '周敏' }],
  },
  {
    id: 'M-teach-cap', name: '教学能力评价模型', category: 'teaching', scene: '教学能力', target: '全体教师',
    version: 'v1.0', status: 'published', updatedAt: '2026-07-01', algorithm: 'weighted-sum',
    gradeRules: [{ grade: '优秀', min: 90 }, { grade: '良好', min: 80 }, { grade: '合格', min: 70 }],
    dimensions: [
      { dimensionId: 'ethics', weight: 15, indicators: [{ indicatorId: 'I-ethics-02', weight: 100 }] },
      { dimensionId: 'teaching', weight: 55, indicators: [{ indicatorId: 'I-teach-01', weight: 25 }, { indicatorId: 'I-teach-02', weight: 35 }, { indicatorId: 'I-teach-03', weight: 20 }, { indicatorId: 'I-teach-04', weight: 20 }] },
      { dimensionId: 'development', weight: 20, indicators: [{ indicatorId: 'I-dev-04', weight: 60 }, { indicatorId: 'I-dev-03', weight: 40 }] },
      { dimensionId: 'contribution', weight: 10, indicators: [{ indicatorId: 'I-team-02', weight: 100 }] },
    ],
    versions: [{ version: 'v1.0', summary: '聚焦教学实绩与课程建设能力', time: '2026-07-01', operator: '周敏' }],
  },
  {
    id: 'M-title-promo', name: '职称晋升模型（讲师→副教授）', category: 'title', scene: '职称晋升', target: '讲师晋升副教授',
    version: 'v1.0', status: 'published', updatedAt: '2026-07-05', algorithm: 'weighted-sum',
    gradeRules: [{ grade: '达标', min: 85 }],
    dimensions: [
      { dimensionId: 'ethics', weight: 15, indicators: [{ indicatorId: 'I-ethics-01', weight: 70 }, { indicatorId: 'I-ethics-02', weight: 30 }] },
      { dimensionId: 'teaching', weight: 35, indicators: [{ indicatorId: 'I-teach-01', weight: 20 }, { indicatorId: 'I-teach-02', weight: 30 }, { indicatorId: 'I-teach-03', weight: 25 }, { indicatorId: 'I-teach-04', weight: 25 }] },
      { dimensionId: 'research', weight: 25, indicators: [{ indicatorId: 'I-res-02', weight: 40 }, { indicatorId: 'I-res-01', weight: 30 }, { indicatorId: 'I-res-03', weight: 30 }] },
      { dimensionId: 'development', weight: 15, indicators: [{ indicatorId: 'I-dev-01', weight: 50 }, { indicatorId: 'I-dev-02', weight: 30 }, { indicatorId: 'I-dev-03', weight: 20 }] },
      { dimensionId: 'contribution', weight: 10, indicators: [{ indicatorId: 'I-team-01', weight: 60 }, { indicatorId: 'I-team-02', weight: 40 }] },
    ],
    versions: [{ version: 'v1.0', summary: '讲师晋升副教授综合评价标准', time: '2026-07-05', operator: '周敏' }],
  },
]

// ============================================================================
// 评分引擎（L3，纯函数）—— 全部画像/诊断/看板的单一真源
// ============================================================================
function indicatorScore(indicator, dataPoint) {
  // missing: 不参与评分，返回 null（上层做权重重分配）
  if (dataPoint && dataPoint.missing) return null
  const actual = dataPoint ? dataPoint.value : 0
  const target = indicator.target
  let rate
  if (indicator.calcType === 'boolean') rate = actual >= target ? 1 : 0
  else if (indicator.calcType === 'representative') rate = Math.min(actual / target, 1)
  else rate = target > 0 ? Math.min(actual / target, 1) : 0
  return Math.round(rate * indicator.fullScore)
}

/**
 * 计算某教师按某模型的评分。四段归因由规则库驱动。
 */
export function computeScore(teacherId, modelId) {
  const model = models.find((m) => m.id === modelId)
  const teacher = teachers.find((t) => t.id === teacherId)
  if (!model || !teacher) return null

  let total = 0
  const dimensionResults = model.dimensions.map((dimCfg) => {
    const dim = DIMENSIONS_5.find((d) => d.id === dimCfg.dimensionId)
    const indicatorResults = dimCfg.indicators.map((indCfg) => {
      const indicator = indicators.find((i) => i.id === indCfg.indicatorId)
      const dataPoint = teacher.data[indCfg.indicatorId]
      const score = indicatorScore(indicator, dataPoint)
      const isMissing = dataPoint && dataPoint.missing
      return {
        indicatorId: indCfg.indicatorId, name: indicator.name, weight: indCfg.weight,
        score: isMissing ? 0 : score, // missing 显示 0（兼容排序），但实际不参与加权
        missing: isMissing,
        actual: isMissing ? null : (dataPoint ? dataPoint.value : 0),
        target: indicator.target,
        unit: indicator.unit, calcType: indicator.calcType,
        source: dataPoint ? dataPoint.source : null,
        shortOf: !isMissing && (dataPoint ? dataPoint.value : 0) < indicator.target,
        dimensionId: dimCfg.dimensionId,
        policyBasis: indicator.policyBasis,
        sourceMapping: indicator.sourceMapping,
      }
    })
    // 权重重分配：missing 指标不参与加权，分母剔除其 weight
    const activeInds = indicatorResults.filter((i) => !i.missing)
    const activeWeightSum = activeInds.reduce((s, i) => s + i.weight, 0)
    const dimensionRawScore = activeWeightSum > 0
      ? activeInds.reduce((s, i) => s + i.score * i.weight, 0) / activeWeightSum
      : 0 // 全维 missing 时维度分记 0
    const dimensionScore = Math.round(dimensionRawScore)
    const contribution = Math.round((dimensionScore * dimCfg.weight) / 100)
    total += contribution
    return {
      dimensionId: dimCfg.dimensionId, name: dim.name, score: dimensionScore,
      weight: dimCfg.weight, contribution, indicators: indicatorResults,
    }
  })

  // 短板 = 未通过预警规则的指标（用规则库判定，非硬编码 80 分）
  const warningRules = policyRules.filter((r) => r.status === 'active' && r.appliesTo.includes('warning') && r.scope === 'indicator')
  const allInds = dimensionResults.flatMap((d) => d.indicators.map((i) => ({ ...i, dimensionName: d.name })))
  const gaps = allInds
    .filter((ind) => {
      // 只要有一条规则不通过，就算短板
      return warningRules.some((r) => !evaluateRule(r, { indicator: ind }).passed)
    })
    .map((ind) => ({
      ...ind,
      reason: buildAttribution(ind), // 保留兼容字段
      attribution: buildAttributionChain(ind, teacher), // 新增四段归因链
    }))
    .sort((a, b) => a.score - b.score)

  const totalRounded = Math.round(total)
  return {
    teacherId, teacherName: teacher.name, modelId, modelName: model.name,
    total: totalRounded, grade: gradeOf(totalRounded, model.gradeRules),
    dimensions: dimensionResults, gaps,
  }
}

function gradeOf(total, gradeRules) {
  if (!gradeRules || !gradeRules.length) return total >= 70 ? '合格' : '不合格'
  const sorted = [...gradeRules].sort((a, b) => b.min - a.min)
  for (const rule of sorted) if (total >= rule.min) return rule.grade
  return '不合格'
}

/**
 * 统一预警函数：按规则库判定某教师某模型的预警项。
 * 被教师/学院/团队诊断、采集审核等所有"预警清单"消费——删散落页面的硬编码阈值。
 * @returns [{ ruleId, name, level, msg, action, indicatorId, indicatorName }]
 *   level: 'danger' 一票否决触发 | 'warning' 维度/指标未达标 | 'info' 总分相关
 */
export function getWarnings(teacherId, modelId) {
  const result = computeScore(teacherId, modelId)
  if (!result) return []
  const warnings = []
  const warningRules = policyRules.filter((r) => r.status === 'active' && r.appliesTo.includes('warning') && r.scope === 'indicator')
  result.dimensions.forEach((d) => {
    d.indicators.forEach((ind) => {
      const triggered = warningRules.find((r) => !evaluateRule(r, { indicator: ind }).passed)
      if (triggered) {
        const chain = ind.attribution || buildAttributionChain(ind, teachers.find((t) => t.id === teacherId))
        warnings.push({
          ruleId: triggered.id,
          name: triggered.name,
          level: triggered.type === 'veto' ? 'danger' : 'warning',
          msg: `${ind.name} ${triggered.failMsg || '触发预警'}`,
          action: chain?.action || null,
          indicatorId: ind.indicatorId,
          indicatorName: ind.name,
          dimensionId: ind.dimensionId,
          cause: chain?.cause,
          causeLevel: chain?.causeLevel,
          policySourceId: triggered.policySourceId,
          clause: triggered.clause,
        })
      }
    })
  })
  // 总分级预警（scope=model, warning 场景）
  const totalRules = policyRules.filter((r) => r.status === 'active' && r.appliesTo.includes('warning') && r.scope === 'model')
  totalRules.forEach((r) => {
    const { passed } = evaluateRule(r, { total: result.total })
    if (!passed) {
      warnings.push({
        ruleId: r.id, name: r.name, level: 'warning',
        msg: `综合得分 ${result.total} 分，${r.failMsg || '触发预警'}`,
        action: null, policySourceId: r.policySourceId, clause: r.clause,
      })
    }
  })
  return warnings
}

// 旧接口保留（兼容既有页面 gap.reason 一行文案的用法）
function buildAttribution(indicator) {
  if (indicator.actual === 0 || !indicator.source) {
    return `该项数据缺失（系统未采集到），需到数据采集页补充「${indicator.name}」的佐证材料。`
  }
  const rate = Math.round((indicator.actual / indicator.target) * 100)
  return `当前 ${indicator.actual}${indicator.unit}，目标 ${indicator.target}${indicator.unit}（达成 ${rate}%）。数据来自${indicator.source.system}·${indicator.source.field}。`
}

// 四段归因链：短板指标 → 成因 → 政策依据 → 建议动作
// PRD B1 要求 —— 成因分级(数据缺失 / 材料被驳回 / 未达标)，建议动作可跳转
function buildAttributionChain(indicator, teacher) {
  const actual = indicator.actual
  const target = indicator.target
  const unit = indicator.unit || ''
  const src = indicator.source
  // 成因分级：missing 以指标数据点为准（actual 为 null 表示未采集），不能拿 actual===0 误判
  let cause, causeLevel
  if (indicator.missing || !src || actual == null) {
    cause = '数据缺失'
    causeLevel = 'missing'
  } else if (actual < target) {
    const rate = Math.round((actual / target) * 100)
    cause = rate < 50 ? '严重未达标' : '未达标'
    causeLevel = 'shortfall'
  } else {
    cause = '达标但触发规则'
    causeLevel = 'ok'
  }
  // 建议动作
  let action
  if (causeLevel === 'missing') {
    action = {
      type: 'collect',
      label: '去补材料',
      hint: `${indicator.name} 系统未采集到，需上传佐证或人工填报`,
    }
  } else if (causeLevel === 'shortfall') {
    const gap = target - actual
    action = {
      type: 'improve',
      label: '查看提升路径',
      hint: `距目标还差 ${(+gap.toFixed(1))}${unit}，聚焦补齐这一差距可提高维度分`,
    }
  } else {
    action = { type: 'view', label: '查看明细', hint: '' }
  }
  // 血缘：数据来自哪
  const lineage = src ? `${src.system}·${src.field}` : '未映射（需人工填报）'
  return {
    indicatorId: indicator.indicatorId,
    indicatorName: indicator.name,
    dimensionId: indicator.dimensionId,
    cause,
    causeLevel,
    factsText: causeLevel === 'missing'
      ? `未采集到「${indicator.name}」数据`
      : `当前 ${actual}${unit}，目标 ${target}${unit}（达成 ${Math.round((actual / target) * 100)}%）`,
    lineage,
    policyBasis: indicator.policyBasis || null,
    action,
  }
}

/**
 * 全校/学院群体聚合得分（看板用）+ 群体归因（PRD B3）
 */
export function computeGroupScore(teacherIds, modelId) {
  const scores = teacherIds.map((id) => computeScore(id, modelId)).filter(Boolean)
  if (!scores.length) return null
  const dimAgg = DIMENSIONS_5.map((dim) => {
    const dimScores = scores.map((s) => (s.dimensions.find((x) => x.dimensionId === dim.id)?.score) || 0)
    const avg = Math.round(dimScores.reduce((a, b) => a + b, 0) / dimScores.length)
    return { dimensionId: dim.id, name: dim.name, score: avg }
  })
  const totalAvg = Math.round(scores.reduce((s, x) => s + x.total, 0) / scores.length)
  // 群体归因：每维统计"数据缺失/未达标"教师比例
  const cohortAttribution = DIMENSIONS_5.map((dim) => {
    const total = scores.length
    let missing = 0, shortfall = 0
    scores.forEach((s) => {
      const dimResult = s.dimensions.find((x) => x.dimensionId === dim.id)
      if (!dimResult) return
      const shortInds = dimResult.indicators.filter((i) => i.missing || i.score < 80)
      if (!shortInds.length) return
      const anyMissing = shortInds.some((i) => i.missing || i.actual === 0)
      if (anyMissing) missing++
      else shortfall++
    })
    const missingRate = Math.round((missing / total) * 100)
    const shortRate = Math.round((shortfall / total) * 100)
    const dimAvg = dimAgg.find((d) => d.dimensionId === dim.id).score
    let summary = ''
    if (dimAvg < 75) {
      summary = `${dim.name}群体均分 ${dimAvg} 分偏弱：${missingRate}% 教师数据缺失、${shortRate}% 未达标`
      if (missingRate >= shortRate) summary += '，建议督办佐证材料采集'
      else summary += '，建议加强对应能力培训'
    }
    return { dimensionId: dim.id, name: dim.name, dimAvg, missingRate, shortRate, summary }
  })
  return { dimensions: dimAgg, total: totalAvg, count: scores.length, cohortAttribution }
}

// 群体统计（用于 KPI 规则与各级看板）
// 同时给出「真实人数」和「占比」：页面一律直接用 *Count，不要再用 total × rate 反推，
// 那样会把四舍五入误差放大成看得见的错数（例如 168 人 × 29% = 49，实际 48 人）。
export function computeGroupStats(teacherIds) {
  const list = teacherIds.map((id) => teachers.find((t) => t.id === id)).filter(Boolean)
  const total = list.length || 1
  const countOf = (fn) => list.filter(fn).length
  const rateOf = (count) => Math.round((count / total) * 100)

  const doctorCount = countOf((t) => t.degree === '博士')
  const masterCount = countOf((t) => t.degree === '硕士')
  const bachelorCount = countOf((t) => t.degree === '学士')

  const professorCount = countOf((t) => t.title === '教授')
  const associateCount = countOf((t) => t.title === '副教授')
  const lecturerCount = countOf((t) => t.title === '讲师')
  const assistantCount = countOf((t) => t.title === '助教')
  const seniorCount = professorCount + associateCount

  const dualCount = countOf((t) => t.dualTeacher && !t.dualTeacher.includes('未'))
  const dualSeniorCount = countOf((t) => t.dualTeacher === '高级双师')
  const dualMidCount = countOf((t) => t.dualTeacher === '中级双师')
  const dualJuniorCount = countOf((t) => t.dualTeacher === '初级双师')

  return {
    total: list.length,
    doctorCount, masterCount, bachelorCount,
    professorCount, associateCount, lecturerCount, assistantCount, seniorCount,
    dualCount, dualSeniorCount, dualMidCount, dualJuniorCount,
    doctorRate: rateOf(doctorCount),
    seniorRate: rateOf(seniorCount),
    dualRate: rateOf(dualCount),
  }
}

// ============================================================================
// 合规校验（L2 发布模型前 + 评审可追溯）—— 全部走参数化规则解释执行
// ============================================================================
export function runComplianceCheck(model) {
  const complianceRules = policyRules.filter((r) => r.status === 'active' && r.appliesTo.includes('compliance') && r.scope === 'model')
  const items = complianceRules.map((rule) => {
    const { passed, actual } = evaluateRule(rule, { model })
    return {
      ruleId: rule.id, name: rule.name, level: rule.type === 'veto' ? 'veto' : rule.type === 'cap' || rule.type === 'floor' ? 'hard' : 'soft',
      policySourceId: rule.policySourceId, clause: rule.clause,
      passed, msg: passed ? '符合' : rule.failMsg, actual, expected: rule.params,
    }
  })
  const passed = items.every((i) => i.passed || i.level === 'soft')
  return { passed, items }
}

// KPI 规则求值（看板红黄绿用）—— 传入群体统计上下文
export function runKpiCheck(teacherIds) {
  const groupStats = computeGroupStats(teacherIds)
  const kpiRules = policyRules.filter((r) => r.status === 'active' && r.appliesTo.includes('kpi') && r.scope === 'indicator')
  return kpiRules.map((rule) => {
    const { passed, actual } = evaluateRule(rule, { groupStats })
    return { ruleId: rule.id, name: rule.name, passed, actual, expected: rule.params.value, clause: rule.clause, policySourceId: rule.policySourceId }
  })
}

// 模型权重合计（冲突检测用）
export function modelWeightSum(model) {
  return model.dimensions.reduce((s, d) => s + d.weight, 0)
}

// ============================================================================
// AI 洞察构造（E2 后端）—— 各页顶部一句话结论 + 取数依据
// 结论随 computeScore/规则库变化，非写死文案
// ============================================================================
export function buildInsight(kind, ctx) {
  // kind: 'personal' | 'group' | 'kpi'
  if (kind === 'personal') {
    const s = ctx.score
    if (!s) return null
    const weakest = s.dimensions.slice().sort((a, b) => a.score - b.score)[0]
    const strongest = s.dimensions.slice().sort((a, b) => b.score - a.score)[0]
    const missing = s.gaps.filter((g) => g.attribution?.causeLevel === 'missing').length
    return {
      text: `综合评分 ${s.total} 分（${s.grade}）：${strongest.name} ${strongest.score} 分领先，${weakest.name} ${weakest.score} 分为主要短板，共 ${s.gaps.length} 项待改进${missing ? `（其中 ${missing} 项数据缺失）` : ''}。`,
      refs: [
        { label: 'computeScore 评分引擎', kind: 'engine' },
        { label: `模型：${s.modelName}`, kind: 'model' },
        { label: `${s.gaps.length} 项短板由预警规则判定`, kind: 'rule' },
      ],
    }
  }
  if (kind === 'group') {
    const g = ctx.group
    if (!g) return null
    const weakest = g.cohortAttribution.filter((c) => c.summary).sort((a, b) => a.dimAvg - b.dimAvg)[0]
    return {
      text: weakest
        ? `${g.count} 位教师群体：5 维均分 ${g.total} 分，${weakest.summary}。`
        : `${g.count} 位教师群体：5 维均分 ${g.total} 分，各维均达合格线。`,
      refs: [
        { label: 'computeGroupScore 聚合', kind: 'engine' },
        { label: `样本 ${g.count} 人`, kind: 'data' },
        { label: `预警规则驱动短板判定`, kind: 'rule' },
      ],
    }
  }
  // kind: 'kpi' —— 升本 / 办学关键指标。ctx.kpi 传 getUpgradeStatus() 的结果，
  // 结论走加权就绪指数 + 达标预测，而不是简单数一遍"几项未达标"。
  if (kind === 'kpi') {
    const kpi = ctx.kpi || []
    if (!kpi.length) return null
    const analysis = ctx.analysis || null
    if (analysis) {
      return { text: analysis.headline, refs: analysis.refs }
    }
    const r = getUpgradeReadiness(kpi)
    const failed = kpi.filter((k) => k.status !== 'success')
    return {
      text: r.offTrack.length
        ? `升本就绪指数 ${r.index}（${r.grade}）：${r.total} 项指标 ${r.passCount} 项达标，${failed.map((k) => `${k.label} ${k.prettyActual}/目标 ${k.op === '<=' ? '≤' : '≥'}${k.target}${k.unit}`).join('、')} 仍有缺口；按近三年增速，${r.offTrack.map((k) => k.label).join('、')}赶不上 ${r.targetYear} 年评估窗口。`
        : `升本就绪指数 ${r.index}（${r.grade}）：${r.total} 项指标按现有增速均可在 ${r.targetYear} 年前达标。`,
      refs: [
        { label: 'getUpgradeStatus 指标实算', kind: 'engine' },
        { label: 'getUpgradeReadiness 加权就绪指数', kind: 'engine' },
        { label: `${kpi.length} 项 KPI 阈值来自规则库 / 设置标准`, kind: 'rule' },
      ],
    }
  }
  return null
}

// ============================================================================
// AI 成长叙事(配合履历图):基于 careerEvents + computeScore 模板生成
// 非写死文案,改 teachers.careerEvents 或指标数据后叙事随之变
// ============================================================================
export function buildCareerNarrative(teacherId) {
  const teacher = teachers.find((t) => t.id === teacherId)
  if (!teacher) return null
  const events = teacher.careerEvents || []
  const dimCount = {}
  events.forEach((e) => { dimCount[e.dimensionId] = (dimCount[e.dimensionId] || 0) + 1 })
  const top = Object.entries(dimCount).sort((a, b) => b[1] - a[1])[0]
  const score = computeScore(teacherId, 'M-tenure')
  const dimName = (id) => DIMENSIONS_5.find((d) => d.id === id)?.name || id
  const firstTitle = events.find((e) => e.type === 'title')
  const lastTitle = [...events].reverse().find((e) => e.type === 'title')

  let narrative = `${teacher.name}，${teacher.college}，${teacher.title}，入职 ${teacher.teachingYears} 年。`
  if (firstTitle && lastTitle && firstTitle.title !== lastTitle.title) {
    narrative += `职业路径上从 ${firstTitle.title} 成长为 ${lastTitle.title}。`
  } else {
    narrative += `现任 ${teacher.title}。`
  }
  if (top) {
    narrative += `履历中「${dimName(top[0])}」维度经历最为丰富（累计 ${top[1]} 个关键节点）。`
  }
  if (score) {
    const strong = score.dimensions.slice().sort((a, b) => b.score - a.score)[0]
    const weak = score.dimensions.slice().sort((a, b) => a.score - b.score)[0]
    narrative += `综合评分 ${score.total} 分（${score.grade}），${strong.name} ${strong.score} 分为主要优势，${weak.name} ${weak.score} 分为当前短板。`
    narrative += `建议聚焦「${weak.name}」相关经历积累（如科研产出、企业实践或社会服务），聘期考核有望明显提升。`
  }
  return {
    text: narrative,
    refs: [
      { label: `careerEvents(${events.length} 个节点)`, kind: 'data' },
      { label: 'computeScore 评分趋势', kind: 'engine' },
      { label: `${teacher.name} 的教师档案`, kind: 'data' },
    ],
  }
}

// ============================================================================
// 升本能力指标（校级 KPI，与教师个人评分模型区分）
// ----------------------------------------------------------------------------
// actual 全部由 teachers 资产真聚合，target 由 KPI 规则库 / 校方目标提供。
// 在"单点达成度"之外补 4 个分析维度，让驾驶舱能研判、而不只是报数：
//   ① 分类维度：指标归入《本科层次职业学校设置标准》的师资 / 教学 / 科研三块，
//              带权重 —— 于是能算"加权就绪指数"，而不是 6 项拉平平均。
//   ② 时间维度：history 近 4 年 + 当前实算值 → 线性外推给出"预计达标年"，
//              判断的是"能不能赶上 2028 评估窗口"，而不只是"现在差多少"。
//   ③ 组织维度：getUpgradeByCollege() 把人力类指标下钻到二级学院，
//              定位缺口到底压在谁身上（校级净缺口 ≠ 分院缺口合计）。
//   ④ 攻坚维度：gapPlan 把百分比缺口换算成"要引进/认定/晋升多少人、建多少门课"，
//              并按剩余年份摊成年度节奏 —— 缺口从"看得见"变成"派得下去"。
// 历史值是「办学基础数据年报」的 mock，当前值一律实算 —— 趋势线末点与指标卡同源。
// ============================================================================
// 在校学生总数(校级基础数据 mock,供生师比计算)
// 与 COLLEGE_PROFILES 合计 1150 名专任教师配套：20160 / 1150 ≈ 17.5:1，
// 略低于 18:1 的达标线 —— 符合职业技术大学的真实生师比区间。
const SCHOOL_TOTAL_STUDENTS = 20160
export const UPGRADE_BASE_YEAR = 2026
export const UPGRADE_TARGET_YEAR = 2028
export const UPGRADE_HISTORY_YEARS = [2022, 2023, 2024, 2025]

// 升本指标分类（对应设置标准三大板块）
export const UPGRADE_CATEGORIES = [
  { id: 'faculty', name: '师资队伍', desc: '生师比 / 学历 / 职称 / 双师结构，人事系统真聚合' },
  { id: 'teaching', name: '教学建设', desc: '课程与教学资源建设水平' },
  { id: 'research', name: '科研服务', desc: '科研项目与社会服务能力' },
]

// 改善难度（决定同样的缺口该给多高的风险等级）
export const UPGRADE_DIFFICULTY = {
  high: { label: '攻坚难', tone: 'danger', desc: '受编制与引进周期约束，两年内提升空间有限' },
  mid: { label: '中等', tone: 'warning', desc: '专项计划推动，可在聘期内改善' },
  low: { label: '易改善', tone: 'success', desc: '存量挖潜即可完成' },
}

export const UPGRADE_RISK_LABEL = {
  high: { label: '高风险', tone: 'danger' },
  mid: { label: '中风险', tone: 'warning' },
  low: { label: '低风险', tone: 'success' },
}

const ceilUp = (n) => Math.max(0, Math.ceil(n - 1e-9))
const round1 = (n) => Math.round(n * 10) / 10

// collegeMetric：可下钻到二级学院的人力类指标
//   mode 'hire'    引进增量（分母同步变大）：n ≥ (t·N − C) / (1 − t)
//   mode 'promote' 存量转化（晋升/认定，分母不变）：n ≥ t·N − C
export const upgradeIndicators = [
  {
    key: 'teacher-ratio', label: '生师比', target: 18, op: '<=', unit: ':1', dim: 'contribution',
    category: 'faculty', weight: 20, difficulty: 'high', owner: '人事处 · 编制科',
    history: [19.8, 19.2, 18.6, 18.0],
    actualRaw: (stats) => stats.total > 0 ? Math.round((SCHOOL_TOTAL_STUDENTS / stats.total) * 10) / 10 : 0,
    gapPlan: (ctx) => {
      const need = ceilUp(SCHOOL_TOTAL_STUDENTS / ctx.target - ctx.stats.total)
      if (!need) {
        const headroom = ctx.stats.total * ctx.target - SCHOOL_TOTAL_STUDENTS
        return { need: 0, unitLabel: '名专任教师', text: `现有 ${ctx.stats.total} 名专任教师承担 ${SCHOOL_TOTAL_STUDENTS.toLocaleString()} 名在校生，尚可承接扩招 ${headroom} 人而不破 ${ctx.target}:1` }
      }
      return { need, unitLabel: '名专任教师', text: `按在校生 ${SCHOOL_TOTAL_STUDENTS.toLocaleString()} 人测算，需净增 ${need} 名专任教师` }
    },
  },
  {
    key: 'doctor-rate', label: '博士占比', target: 20, op: '>=', unit: '%', dim: 'development',
    category: 'faculty', weight: 18, difficulty: 'high', owner: '人事处 · 人才办',
    history: [15, 17, 19, 21],
    collegeMetric: { statKey: 'doctorRate', countKey: 'doctorCount', mode: 'hire', action: '引进' },
    actualRaw: (stats) => stats.doctorRate,
    gapPlan: (ctx) => {
      const t = ctx.target / 100
      const need = ceilUp((t * ctx.stats.total - ctx.stats.doctorCount) / (1 - t))
      if (!need) {
        const buffer = ctx.stats.doctorCount - Math.ceil(t * ctx.stats.total)
        return { need: 0, unitLabel: '名博士', text: `博士 ${ctx.stats.doctorCount} 人已达 ${ctx.actual}%，高于标准线 ${buffer} 人，可对冲两年内的退休与流失` }
      }
      return { need, unitLabel: '名博士', text: `需引进 ${need} 名博士（分母同步变大，按 (0.${ctx.target}N−C)/(1−0.${ctx.target}) 测算）`, perYear: Math.ceil(need / ctx.years) }
    },
  },
  {
    key: 'senior-rate', label: '高级职称占比', target: 30, op: '>=', unit: '%', dim: 'contribution',
    category: 'faculty', weight: 15, difficulty: 'mid', owner: '人事处 · 职称办',
    history: [28, 30, 32, 33],
    collegeMetric: { statKey: 'seniorRate', countKey: 'seniorCount', mode: 'promote', action: '晋升' },
    actualRaw: (stats) => stats.seniorRate,
    gapPlan: (ctx) => {
      const need = ceilUp(ctx.target / 100 * ctx.stats.total - ctx.stats.seniorCount)
      if (!need) {
        const buffer = ctx.stats.seniorCount - Math.ceil(ctx.target / 100 * ctx.stats.total)
        return { need: 0, unitLabel: '名高级职称教师', text: `正高 ${ctx.stats.professorCount} 人 + 副高 ${ctx.stats.associateCount} 人共 ${ctx.stats.seniorCount} 人，超标准线 ${buffer} 人` }
      }
      return { need, unitLabel: '名高级职称教师', text: `需新增晋升 ${need} 名副高及以上`, perYear: Math.ceil(need / ctx.years) }
    },
  },
  {
    key: 'dual-rate', label: '双师型占比', target: 70, op: '>=', unit: '%', dim: 'development',
    category: 'faculty', weight: 22, difficulty: 'mid', owner: '教师发展中心',
    history: [48, 53, 57, 61],
    collegeMetric: { statKey: 'dualRate', countKey: 'dualCount', mode: 'promote', action: '认定' },
    actualRaw: (stats) => stats.dualRate,
    gapPlan: (ctx) => {
      const need = ceilUp(ctx.target / 100 * ctx.stats.total - ctx.stats.dualCount)
      if (!need) return { need: 0, unitLabel: '名双师型教师', text: `双师型 ${ctx.stats.dualCount} 人已达 ${ctx.actual}%` }
      return { need, unitLabel: '名双师型教师', text: `需新增认定 ${need} 名双师型教师（现有 ${ctx.stats.dualCount} 人，其中高级双师仅 ${ctx.stats.dualSeniorCount} 人）`, perYear: Math.ceil(need / ctx.years) }
    },
  },
  // 校级聚合(不在 teachers 资产内,来自"办学基础数据"mock,标注来源)
  {
    key: 'province-course', label: '省级以上课程', target: 100, op: '>=', unit: '门', dim: 'teaching',
    category: 'teaching', weight: 13, difficulty: 'mid', owner: '教务处',
    history: [58, 66, 74, 80], actualMock: 86, source: '教务系统·省级以上课程库',
    gapPlan: (ctx) => ({ need: ctx.gap, unitLabel: '门省级以上课程', text: `需新增建设 ${ctx.gap} 门省级以上课程`, perYear: Math.ceil(ctx.gap / ctx.years) }),
  },
  {
    key: 'province-project', label: '省级以上项目', target: 50, op: '>=', unit: '项', dim: 'research',
    category: 'research', weight: 12, difficulty: 'high', owner: '科研处',
    history: [26, 31, 35, 38], actualMock: 42, source: '科研系统·省级以上项目库',
    gapPlan: (ctx) => ({ need: ctx.gap, unitLabel: '项省级以上项目', text: `需新增立项 ${ctx.gap} 项省级以上项目`, perYear: Math.ceil(ctx.gap / ctx.years) }),
  },
]

/**
 * 达标预测（时间维度）
 * 用近三年斜率线性外推：既给"预计达标年"，也给"到目标年能到多少"。
 * 只看当年值判断不出"来不及"，这一步才是驾驶舱和报表的区别。
 */
function forecastUpgrade(item, actual, years) {
  const series = [...item.history, actual]
  const n = series.length
  const look = Math.min(3, n - 1)
  const slope = round1((series[n - 1] - series[n - look - 1]) / look * 100) / 100
  const yoy = round1(series[n - 1] - series[n - 2])
  const dir = item.op === '<=' ? -1 : 1
  const pace = Math.round(slope * dir * 100) / 100 // > 0 表示正朝达标方向走
  const gapNow = round1(item.op === '<=' ? actual - item.target : item.target - actual)
  const projected = round1(actual + slope * years)
  const paceUnit = item.unit === ':1' ? '' : item.unit
  let reachYear = null
  if (gapNow <= 0) reachYear = UPGRADE_BASE_YEAR
  else if (pace > 0) reachYear = UPGRADE_BASE_YEAR + Math.ceil(gapNow / pace)
  const onTrack = reachYear !== null && reachYear <= UPGRADE_TARGET_YEAR
  const needPerYear = gapNow > 0 ? round1(gapNow / years) : 0
  let text
  if (gapNow <= 0) {
    text = `已达标，按近三年节奏 ${UPGRADE_TARGET_YEAR} 年约为 ${projected}${item.unit}，留有冗余`
  } else if (!reachYear) {
    text = `近三年无改善趋势，按现状到 ${UPGRADE_TARGET_YEAR} 年仍无法达标`
  } else if (onTrack) {
    text = `近三年年均改善 ${Math.abs(pace)}${paceUnit}，预计 ${reachYear} 年达标${reachYear === UPGRADE_TARGET_YEAR ? '，正好卡在评估窗口、无冗余' : ''}`
  } else {
    text = `按近三年年均 ${Math.abs(pace)}${paceUnit} 的速度需到 ${reachYear} 年才达标，晚于 ${UPGRADE_TARGET_YEAR} 年评估窗口`
  }
  return {
    years: [...UPGRADE_HISTORY_YEARS, UPGRADE_BASE_YEAR],
    series, slope, pace, yoy, projected, reachYear, onTrack, needPerYear, gapNow, paceUnit, text,
  }
}

/**
 * 升本能力指标状态：返回每项 {actual, target, rate, gap, status, advice}
 * status: 'success' 达标 | 'warning' 接近 | 'danger' 未达标
 * 另附 forecast(达标预测) / plan(缺口换算) / risk(风险等级) / weight(权重) 等分析维度
 */
export function getUpgradeStatus() {
  const stats = computeGroupStats(teacherIdsAll())
  const years = UPGRADE_TARGET_YEAR - UPGRADE_BASE_YEAR
  return upgradeIndicators.map((item) => {
    let actual
    if (item.actualRaw) {
      actual = item.actualRaw(stats)
    } else {
      actual = item.actualMock
    }
    const prettyActual = `${actual}${item.unit}`
    // 达成率/缺口(生师比是"越小越好"的反向指标)
    let rate, gap, status, advice
    if (item.op === '<=') {
      rate = actual <= item.target ? 100 : Math.max(0, Math.round((item.target / actual) * 100))
      gap = actual > item.target ? actual - item.target : 0
      status = actual <= item.target ? 'success' : (actual <= item.target * 1.1 ? 'warning' : 'danger')
      advice = actual <= item.target ? '已达标,保持' : `当前 ${prettyActual},超目标 ${gap.toFixed(1)}${item.unit},需增师控生`
    } else {
      rate = Math.round((actual / item.target) * 100)
      gap = actual < item.target ? item.target - actual : 0
      status = actual >= item.target ? 'success' : (rate >= 90 ? 'warning' : 'danger')
      advice = actual >= item.target
        ? '已达标,继续保持'
        : (rate >= 90 ? `已接近目标(${rate}%),再提升 ${gap.toFixed(1)}${item.unit} 即达标` : `未达标,距目标差 ${gap.toFixed(1)}${item.unit},需加大投入`)
    }
    const forecast = forecastUpgrade(item, actual, years)
    const plan = item.gapPlan ? item.gapPlan({ stats, actual, target: item.target, gap: round1(gap), years }) : null
    // 风险 = 当前档位 ⊕ 达标预测 ⊕ 改善难度：只看缺口会漏掉"缺口小但赶不上"的项
    let risk = status === 'danger' ? 'high' : status === 'warning' ? 'mid' : 'low'
    if (!forecast.onTrack) risk = 'high'
    else if (risk === 'low' && forecast.reachYear === UPGRADE_TARGET_YEAR) risk = 'mid'
    else if (risk === 'mid' && item.difficulty === 'high') risk = 'high'
    const category = UPGRADE_CATEGORIES.find((c) => c.id === item.category)
    return {
      key: item.key, label: item.label, dim: item.dim,
      actual, prettyActual, target: item.target, op: item.op, unit: item.unit,
      rate, gap, status, advice,
      lineage: item.actualRaw ? '人事系统 · 教师基本信息聚合' : (item.source || 'mock'),
      // —— 新增分析维度 ——
      category: item.category, categoryName: category ? category.name : '',
      weight: item.weight, weightedRate: Math.round(Math.min(rate, 100) * item.weight) / 100,
      difficulty: item.difficulty, owner: item.owner,
      history: item.history, forecast, plan, risk,
      adviceFull: `${advice}。${forecast.text}${plan ? `；${plan.text}` : ''}`,
    }
  })
}

/**
 * 升本就绪度（分类 + 权重维度）
 * 6 项指标重要性不同：拉平平均会把"双师型差 6 个点"和"高级职称超 5 个点"当同一回事。
 * 这里按权重加权、按设置标准三大板块分类聚合，并把"谁最拖后腿"直接算出来。
 */
export function getUpgradeReadiness(list) {
  const items = list || getUpgradeStatus()
  const weightSum = items.reduce((s, i) => s + i.weight, 0) || 1
  const index = Math.round(items.reduce((s, i) => s + Math.min(i.rate, 100) * i.weight, 0) / weightSum)
  const passed = items.filter((i) => i.status === 'success')
  const near = items.filter((i) => i.status === 'warning')
  const failed = items.filter((i) => i.status === 'danger')
  const offTrack = items.filter((i) => !i.forecast.onTrack)
  const tight = items.filter((i) => i.forecast.onTrack && i.forecast.gapNow > 0 && i.forecast.reachYear === UPGRADE_TARGET_YEAR)
  const grade = index >= 95 ? '基本具备申报条件' : index >= 85 ? '接近达标 · 仍有硬缺口' : index >= 70 ? '存在明显差距' : '差距较大'
  const tone = index >= 95 ? 'success' : index >= 85 ? 'warning' : 'danger'
  const categories = UPGRADE_CATEGORIES.map((c) => {
    const own = items.filter((i) => i.category === c.id)
    const w = own.reduce((s, i) => s + i.weight, 0) || 1
    return {
      id: c.id, name: c.name, desc: c.desc, weight: w, count: own.length,
      rate: Math.round(own.reduce((s, i) => s + Math.min(i.rate, 100) * i.weight, 0) / w),
      failed: own.filter((i) => i.status !== 'success').map((i) => i.label),
      items: own,
    }
  })
  // 拖后腿排序：权重 × 未达成的百分点，权重高的小缺口可能比权重低的大缺口更要命
  const bottlenecks = items
    .filter((i) => i.rate < 100)
    .map((i) => ({ ...i, drag: Math.round((100 - Math.min(i.rate, 100)) * i.weight) / 100 }))
    .sort((a, b) => b.drag - a.drag)
  const reachYears = items.map((i) => i.forecast.reachYear)
  const allReachYear = reachYears.some((y) => y === null) ? null : Math.max(...reachYears)
  return {
    index, grade, tone,
    total: items.length, passCount: passed.length, nearCount: near.length, failCount: failed.length,
    weightPassed: passed.reduce((s, i) => s + i.weight, 0),
    weightAtRisk: items.filter((i) => i.risk === 'high').reduce((s, i) => s + i.weight, 0),
    baseYear: UPGRADE_BASE_YEAR, targetYear: UPGRADE_TARGET_YEAR,
    yearsLeft: UPGRADE_TARGET_YEAR - UPGRADE_BASE_YEAR,
    categories, bottlenecks, offTrack, tight, allReachYear,
    onTrack: offTrack.length === 0,
    passedLabels: passed.map((i) => i.label),
    failedLabels: failed.map((i) => i.label),
  }
}

/**
 * 升本指标的学院维度下钻（组织维度）
 * 校级一个数字看不出缺口压在谁身上：博士占比 23% 达标，但机电、汽车两院都不足 20%。
 * 需求人数按各院自身规模测算 —— 分院缺口合计 ≠ 校级净缺口，差额就是院际调剂空间。
 */
export function getUpgradeByCollege() {
  const metrics = upgradeIndicators.filter((i) => i.collegeMetric)
  const rows = COLLEGE_PROFILES.map((profile) => {
    const stats = computeGroupStats(teacherIdsByCollege(profile.name))
    const cells = metrics.map((item) => {
      const cfg = item.collegeMetric
      const value = stats[cfg.statKey]
      const count = stats[cfg.countKey]
      const t = item.target / 100
      const need = cfg.mode === 'hire'
        ? ceilUp((t * stats.total - count) / (1 - t))
        : ceilUp(t * stats.total - count)
      return {
        key: item.key, label: item.label, action: cfg.action,
        value, count, target: item.target, need,
        rate: Math.round((value / item.target) * 100),
        passed: value >= item.target,
      }
    })
    const score = Math.round(cells.reduce((s, c) => s + Math.min(c.rate, 100), 0) / (cells.length || 1))
    const shortfalls = cells.filter((c) => !c.passed)
    return {
      name: profile.name, total: stats.total, stats, cells, score,
      metCount: cells.length - shortfalls.length,
      shortLabels: shortfalls.map((c) => c.label),
      needTotal: cells.reduce((s, c) => s + c.need, 0),
      gapText: shortfalls.length
        ? shortfalls.map((c) => `${c.label} ${c.value}%（差 ${round1(c.target - c.value)} 点，需${c.action} ${c.need} 人）`).join('；')
        : '三项人力指标全部达标',
    }
  })
  const ranked = [...rows].sort((a, b) => b.score - a.score || b.total - a.total)
  ranked.forEach((r, i) => { r.rank = i + 1 })
  const schoolStats = computeGroupStats(teacherIdsAll())
  const needByMetric = metrics.map((item) => {
    const cfg = item.collegeMetric
    const t = item.target / 100
    const schoolNeed = cfg.mode === 'hire'
      ? ceilUp((t * schoolStats.total - schoolStats[cfg.countKey]) / (1 - t))
      : ceilUp(t * schoolStats.total - schoolStats[cfg.countKey])
    const collegeNeed = rows.reduce((s, r) => s + (r.cells.find((c) => c.key === item.key)?.need || 0), 0)
    const hotspots = rows
      .map((r) => ({ name: r.name, need: r.cells.find((c) => c.key === item.key)?.need || 0 }))
      .filter((x) => x.need > 0)
      .sort((a, b) => b.need - a.need)
    return {
      key: item.key, label: item.label, action: cfg.action, target: item.target,
      schoolNeed, collegeNeed, surplus: collegeNeed - schoolNeed, hotspots,
      // 超额储备：本院已超线的人数 —— 校级净缺口小于分院合计，差额就出在这些院
      surplusHotspots: rows
        .map((r) => ({
          name: r.name,
          surplus: Math.max(0, r.stats[cfg.countKey] - Math.ceil(t * r.stats.total)),
        }))
        .filter((x) => x.surplus > 0)
        .sort((a, b) => b.surplus - a.surplus),
    }
  })
  return {
    metrics: metrics.map((i) => ({ key: i.key, label: i.label, target: i.target, action: i.collegeMetric.action })),
    rows: ranked,
    needByMetric,
    benchmark: ranked[0],
    lagging: ranked[ranked.length - 1],
  }
}

/**
 * AI 升本研判（E2 后端）—— 驾驶舱顶部的结构化分析
 * 结论、发现、风险、行动四段全部由上面几个函数算出：
 * 改一条 KPI 阈值或一个学院的编制规模，这里的每个数字和每句话都会跟着变。
 */
export function buildUpgradeAnalysis() {
  const items = getUpgradeStatus()
  const readiness = getUpgradeReadiness(items)
  const colleges = getUpgradeByCollege()
  const group = computeGroupScore(teacherIdsAll(), 'M-tenure')
  const catSorted = [...readiness.categories].sort((a, b) => b.rate - a.rate)
  const strongCat = catSorted[0]
  const weakCat = catSorted[catSorted.length - 1]
  const topDrag = readiness.bottlenecks[0]

  const headline = readiness.offTrack.length
    ? `升本就绪指数 ${readiness.index}（${readiness.grade}）：${readiness.total} 项设置标准指标 ${readiness.passCount} 项达标、${readiness.nearCount} 项接近、${readiness.failCount} 项未达标；按近三年增速外推，${readiness.offTrack.map((i) => i.label).join('、')}赶不上 ${readiness.targetYear} 年评估窗口。`
    : `升本就绪指数 ${readiness.index}（${readiness.grade}）：${readiness.total} 项指标按现有增速均可在 ${readiness.targetYear} 年前达标，其中 ${readiness.tight.length} 项无冗余。`

  const findings = []
  findings.push({
    title: `结构：强在${strongCat.name}，短板压在${weakCat.name}`,
    text: `${strongCat.name}加权达成 ${strongCat.rate}%（${strongCat.count} 项指标、权重 ${strongCat.weight}），${weakCat.name}仅 ${weakCat.rate}%。达标项权重合计 ${readiness.weightPassed}，高风险项权重合计 ${readiness.weightAtRisk} —— 拖后腿最重的是「${topDrag.label}」，权重 ${topDrag.weight} × 未达成 ${100 - Math.min(topDrag.rate, 100)} 个百分点。`,
    evidence: `加权就绪指数 = Σ(min(达成率,100) × 权重) / ${items.reduce((s, i) => s + i.weight, 0)}`,
    tone: 'warning',
  })
  findings.push({
    title: `时间：${readiness.offTrack.length ? `${readiness.offTrack.length} 项赶不上 ${readiness.targetYear} 年窗口` : `全部指标可在 ${readiness.targetYear} 年前达标`}`,
    text: items.filter((i) => i.forecast.gapNow > 0)
      .map((i) => `${i.label}：${i.prettyActual} → ${i.forecast.text}`)
      .join('；') || '各项均已达标，按近三年节奏继续保持即可。',
    evidence: `近三年斜率线性外推，历史值取自办学基础数据年报 ${UPGRADE_HISTORY_YEARS[0]}—${UPGRADE_HISTORY_YEARS[UPGRADE_HISTORY_YEARS.length - 1]}，${UPGRADE_BASE_YEAR} 年为实算值`,
    tone: readiness.offTrack.length ? 'danger' : 'success',
  })
  const dualNeed = colleges.needByMetric.find((m) => m.key === 'dual-rate')
  const doctorNeed = colleges.needByMetric.find((m) => m.key === 'doctor-rate')
  const orgParts = []
  if (dualNeed && dualNeed.hotspots.length) {
    orgParts.push(`双师型：校级净缺口 ${dualNeed.schoolNeed} 人，但分院测算合计 ${dualNeed.collegeNeed} 人 —— 差额 ${dualNeed.surplus} 人来自${dualNeed.surplusHotspots.slice(0, 2).map((h) => `${h.name}（超线 ${h.surplus} 人）`).join('、')}的超额储备，缺口实际压在${dualNeed.hotspots.slice(0, 2).map((h) => `${h.name}（${h.need} 人）`).join('、')}`)
  }
  if (doctorNeed && doctorNeed.hotspots.length) {
    orgParts.push(`博士占比校级 ${items.find((i) => i.key === 'doctor-rate').prettyActual} 虽已达标，仍有 ${doctorNeed.hotspots.length} 个学院不足 ${doctorNeed.target}%，${doctorNeed.hotspots.slice(0, 2).map((h) => `${h.name}需引进 ${h.need} 人`).join('、')}`)
  }
  findings.push({
    title: '组织：校级达标掩盖了院际失衡',
    text: `${orgParts.join('；')}。达成度最高 ${colleges.benchmark.name}（${colleges.benchmark.score}），最低 ${colleges.lagging.name}（${colleges.lagging.score}）。`,
    evidence: `按 COLLEGE_PROFILES 编制规模逐院聚合 teachers 资产（${colleges.rows.length} 个二级学院、${colleges.rows.reduce((s, r) => s + r.total, 0)} 名专任教师）`,
    tone: 'warning',
  })
  if (group) {
    const weakDim = [...group.dimensions].sort((a, b) => a.score - b.score)[0]
    const attribution = group.cohortAttribution.find((c) => c.dimensionId === weakDim.dimensionId)
    findings.push({
      title: '内涵：硬指标达标 ≠ 材料经得起评',
      text: `全校教师 5 维均分 ${group.total} 分，最弱维「${weakDim.name}」${weakDim.score} 分${attribution ? `，其中 ${attribution.missingRate}% 教师该维佐证材料缺失` : ''}。升本材料要按人举证，佐证缺失率高会让已达标的结构性指标在评估现场"报得出、证不了"。`,
      evidence: `computeGroupScore 全校 ${group.count} 人聚合 + 群体归因`,
      tone: 'warning',
    })
  }

  const risks = items
    .filter((i) => i.risk !== 'low')
    .sort((a, b) => (b.risk === 'high') - (a.risk === 'high') || b.weight - a.weight)
    .map((i) => ({
      key: i.key, label: i.label, level: i.risk, weight: i.weight,
      text: `${i.forecast.text}；${UPGRADE_DIFFICULTY[i.difficulty].label}（${UPGRADE_DIFFICULTY[i.difficulty].desc}）`,
    }))

  const actions = items
    .filter((i) => i.plan && i.plan.need > 0)
    .sort((a, b) => b.weight - a.weight)
    .map((i) => ({
      key: i.key, label: i.label, owner: i.owner, need: i.plan.need, unitLabel: i.plan.unitLabel,
      perYear: i.plan.perYear || Math.ceil(i.plan.need / readiness.yearsLeft),
      difficulty: i.difficulty, risk: i.risk,
      text: i.plan.text,
      hotspots: (colleges.needByMetric.find((m) => m.key === i.key)?.hotspots || []).slice(0, 3),
    }))

  return {
    items, readiness, colleges, group,
    headline, findings, risks, actions,
    refs: [
      { label: 'getUpgradeStatus 指标实算 + 达标预测', kind: 'engine' },
      { label: 'getUpgradeReadiness 加权就绪指数（分类/权重维度）', kind: 'engine' },
      { label: `getUpgradeByCollege 学院下钻（${colleges.rows.length} 院真聚合）`, kind: 'data' },
      { label: `computeGroupScore 全校 ${group ? group.count : 0} 人 5 维内涵校验`, kind: 'engine' },
      { label: `KPI 阈值来自规则库（双师 ≥70% / 博士 ≥20%）`, kind: 'rule' },
      { label: `历史值：办学基础数据年报 ${UPGRADE_HISTORY_YEARS[0]}—${UPGRADE_HISTORY_YEARS[UPGRADE_HISTORY_YEARS.length - 1]}`, kind: 'data' },
    ],
  }
}

// ============================================================================
export const indicatorById = (id) => indicators.find((i) => i.id === id)
export const dimensionById = (id) => DIMENSIONS_5.find((d) => d.id === id)
export const modelById = (id) => models.find((m) => m.id === id)
export const sourceSystemById = (id) => sourceSystems.find((s) => s.id === id)
export const policySourceById = (id) => policySources.find((p) => p.id === id)
export const ruleById = (id) => policyRules.find((r) => r.id === id)
export const indicatorsByDimension = (dimId) => indicators.filter((i) => i.dimensionId === dimId)
export const teacherIdsAll = () => teachers.map((t) => t.id)
export const teacherIdsByCollege = (college) => teachers.filter((t) => t.college === college).map((t) => t.id)

export const COLLECTION_METHOD_LABEL = {
  auto: { label: '自动采集', tone: 'success' },
  manual: { label: '人工填报', tone: 'warning' },
  audit: { label: '审核认定', tone: 'info' },
}

export const INDICATOR_STATUS_LABEL = {
  draft: { label: 'AI 草稿', tone: 'warning' },
  confirmed: { label: '人工确认', tone: 'info' },
  published: { label: '已入库', tone: 'success' },
}

export const RULE_TYPE_LABEL = {
  veto: { label: '一票否决', tone: 'danger' },
  threshold: { label: '预警线', tone: 'warning' },
  floor: { label: '门槛', tone: 'info' },
  cap: { label: '权重上限', tone: 'muted' },
}

export const RULE_APPLIES_LABEL = {
  compliance: '合规校验',
  warning: '预警',
  kpi: 'KPI 阈值',
  tenure: '聘期考核',
}

export const RULE_STATUS_LABEL = {
  active: { label: '已启用', tone: 'success' },
  inactive: { label: '停用', tone: 'muted' },
  draft: { label: 'AI 草稿', tone: 'warning' },
}

