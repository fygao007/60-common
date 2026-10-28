/**
 * 发展规划分析 · 文档 + 规则 + 数据 → 报表
 *
 * 依据：《管理侧发展规划与师资队伍建设详细设计》
 *   - M18 AI 规划文件辅助创建（提取候选、逐项决定、只写草稿、不自动发布）
 *   - §6.2 比例缺口、人数测算与未知（未知 ≠ 不符合；比例变化用百分点）
 *   - §6.3 状态不混成一个字段
 *
 * 边界（与文档一致，页面不得越过）：
 *  - **不新增数据源**：规则与数据一律来自 `shared/growth-plan-store.js` 的同一份口径，
 *    报表与师资要求台账读的是同一批 requirementId。
 *  - **原文没写数字就不许补**：只提取方向，目标值留空由人填。
 *  - **未知 ≠ 不符合**：结论按「已确认值 + 可能区间」判断，数据缺失出「待核验」。
 *  - **AI 不自动发布、不自动认定人员、不用无依据的置信百分比当可信度**。
 *  - 演示环境：文档解析、提取结果与来源位置均为**演示数据**，无真实 AI 服务；
 *    「上传文件」只按文件名判定用哪套内置规则，不解析真实文件内容。
 */

import {
  ANALYSIS_SNAPSHOTS,
  REQUIREMENT_TYPE_META,
  RESULT_STATES,
  requirementsByPlan,
} from './growth-plan-store.js'

// ============================================================================
// 一、数据范围（统计范围口径未登记的一律不可选，不给假数据）
// ============================================================================

/** 与统一分析快照同源（§6.1 基准快照固定于基准日）。 */
export const DATA_CUTOFF_DEFAULT = '2026-09-12'
export const DATA_CUTOFF_NOTE = '比例类指标以去重人数为分母；招聘新增会同时改变分子与分母，故不把缺口直接换算成招聘人数。'

export const ANALYSIS_SCOPES = [
  { value: 'org-univ', label: '全校（专任教师口径）', available: true },
  { value: 'org-colleges', label: '各二级学院分别统计', available: false, reason: '单位归属主数据尚未完成映射（文档 §10 openQuestion 4）' },
  { value: 'org-groups', label: '重点专业群', available: false, reason: '专业群与教师关系未建模（文档 §10 openQuestion 4）' },
]

export function getScope(value) {
  return ANALYSIS_SCOPES.find((item) => item.value === value) || ANALYSIS_SCOPES[0]
}

/** 统一分析快照（报表口径行引用，与总览页同源）。 */
export function snapshotOf(planId) {
  return ANALYSIS_SNAPSHOTS.find((item) => item.planId === planId) || null
}

// ============================================================================
// 二、文档（演示：内置示例 + 粘贴正文两种输入）
// ============================================================================

export const ANALYSIS_DOCS = [
  {
    docId: 'DOC-SW5',
    name: '"十五五"师资队伍建设规划（2026—2030）.docx',
    sizeLabel: '2.4 MB',
    planId: 'PL-2026-001',
    note: '共 5 章 · 识别到 12 条与师资相关的表述',
    requirementIds: null,
  },
  {
    docId: 'DOC-SW5-EXTRACT',
    name: '"十五五"规划·师资部分（节选）.docx',
    sizeLabel: '640 KB',
    planId: 'PL-2026-001',
    note: '节选 · 识别到 6 条与师资相关的表述',
    requirementIds: ['RQ-001', 'RQ-002', 'RQ-003', 'RQ-005', 'RQ-009', 'RQ-010'],
  },
]

/** 粘贴正文的示例段落：三条带数字、一条只有方向（用于演示「不补数字」）。 */
export const SAMPLE_TEXT = [
  '学校"十五五"期间全面对标职业本科设置标准：专任教师中具有博士学位者比例不低于 55%；',
  '正高级职称教师不低于 260 人；双师型教师占专业课教师比例不低于 85%。',
  '同时加强骨干队伍建设，打造高水平教学创新团队，全面提升教师队伍整体水平。',
].join('\n')

// 关键词 → 要求。仅用于演示「粘贴正文」时的识别；不匹配即不提规则。
const TEXT_KEYWORDS = [
  { requirementId: 'RQ-012', words: ['三年内取得双师'] },
  { requirementId: 'RQ-001', words: ['博士'] },
  { requirementId: 'RQ-002', words: ['正高级', '正高'] },
  { requirementId: 'RQ-003', words: ['双师型'] },
  { requirementId: 'RQ-004', words: ['企业实践'] },
  { requirementId: 'RQ-005', words: ['带头人'] },
  { requirementId: 'RQ-006', words: ['导师制'] },
  { requirementId: 'RQ-007', words: ['教学能力比赛', '获奖'] },
  { requirementId: 'RQ-008', words: ['技术服务', '到账经费'] },
  { requirementId: 'RQ-009', words: ['师德'] },
]

// ============================================================================
// 三、规则（AI 候选 → 人工确认；本文件只产出候选）
// ============================================================================

// 演示用口径明细（分子 / 分母 / 待核验）。数值与要求台账的 actualValue 自洽：
// 458/1120=40.9%、512/640=80.0%、78/128=60.9%。
const RULE_BASIS = {
  'RQ-001': { numerator: 458, denominator: 1120, unknown: 62, note: '分子＝最高学位为博士研究生的专任教师；分母＝专任教师去重人数' },
  'RQ-003': { numerator: 512, denominator: 640, unknown: 118, note: '分子＝双师型认定通过的专任教师；分母＝专业课教师去重人数' },
  'RQ-009': { numerator: 1120, denominator: 1120, unknown: 0, note: '分子＝师德师风考核合格人数；分母＝专任教师去重人数' },
  'RQ-012': { numerator: 78, denominator: 128, unknown: 0, note: '分子＝三年内取得双师资格的青年教师；分母＝2023-09-01 后入职的青年教师' },
}

const SCOPE_LABEL_BY_DENOMINATOR = {
  'category-scope': '全校专任教师',
  'teaching-only': '专业课教师',
}

/** 来源位置为演示数据（无真实文件解析）。 */
function clauseLocationOf(index) {
  return `第 ${1 + Math.floor(index / 4)} 章 · 第 ${1 + (index % 4)} 条`
}

function ruleFromRequirement(row, index) {
  const meta = REQUIREMENT_TYPE_META[row.requirementType] || {}
  return {
    ruleId: row.requirementId,
    name: row.requirementName,
    type: row.requirementType,
    typeNote: meta.description || '',
    indicator: row.metricRef,
    operator: row.targetOperator,
    targetLower: row.targetLower,
    targetUpper: row.targetUpper,
    unit: row.targetUnit || meta.unitHint || '',
    scopeLabel: SCOPE_LABEL_BY_DENOMINATOR[row.denominatorMode] || '全校（统计范围与方案一致）',
    actualValue: row.actualValue,
    unknownCount: row.unknownCount,
    storedStateKey: row.resultState,
    requirementStatus: row.requirementStatus,
    deadline: row.deadline,
    ownerOrganization: row.ownerOrganization,
    clauseText: row.sourceClause || '',
    clauseLocation: clauseLocationOf(index),
    basis: RULE_BASIS[row.requirementId] || null,
    accepted: row.requirementStatus !== '草稿',
    targetEdited: false,
    extractNote: row.sourceClause ? '原文给出可度量口径' : '原文未给出数值，目标值由人工填写',
  }
}

/** 从内置示例文档提取候选规则。 */
export function extractRules(docId) {
  const doc = ANALYSIS_DOCS.find((item) => item.docId === docId)
  if (!doc) return { rules: [], docNote: '' }
  const rows = requirementsByPlan(doc.planId).filter((row) => (
    !doc.requirementIds || doc.requirementIds.includes(row.requirementId)
  ))
  return {
    rules: rows.map(ruleFromRequirement),
    docNote: doc.note,
  }
}

/** 从粘贴正文提取候选规则（关键词匹配，演示用）。 */
export function extractRulesFromText(text) {
  const source = String(text || '')
  const hitIds = TEXT_KEYWORDS
    .filter((item) => item.words.some((word) => source.includes(word)))
    .map((item) => item.requirementId)
  const rows = requirementsByPlan('PL-2026-001').filter((row) => hitIds.includes(row.requirementId))
  const rules = rows.map((row, index) => ruleFromRequirement(row, index))
  const missedDirections = ['骨干队伍建设', '教学创新团队'].filter((word) => source.includes(word))

  let docNote = `识别到 ${rules.length} 条可度量要求`
  if (rules.length && missedDirections.length) {
    docNote += `；另有 ${missedDirections.length} 处方向性表述（${missedDirections.join('、')}）未给出目标值，需人工补充`
  } else if (!rules.length && missedDirections.length) {
    docNote = `仅识别到方向性表述（${missedDirections.join('、')}），原文没有目标值——按规则不补数字，请手动添加规则`
  } else if (!rules.length) {
    docNote = '未识别到与师资相关的可度量要求，可手动添加规则'
  }
  return { rules, docNote }
}

/** 手动添加一条空规则（目标值由人填）。 */
export function emptyRule() {
  return {
    ruleId: `MANUAL-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    type: '人工评估',
    typeNote: '',
    indicator: '',
    operator: '人工判定',
    targetLower: null,
    targetUpper: null,
    unit: '',
    scopeLabel: '全校（统计范围与方案一致）',
    actualValue: null,
    unknownCount: 0,
    storedStateKey: 'notAnalyzed',
    requirementStatus: '手动添加',
    deadline: '',
    ownerOrganization: 'org-univ',
    clauseText: '',
    clauseLocation: '人工添加',
    basis: null,
    accepted: true,
    targetEdited: true,
    extractNote: '手动添加',
  }
}

// ============================================================================
// 四、结论（未知 ≠ 不符合；比例用百分点）
// ============================================================================

function round1(value) {
  return Math.round(value * 10) / 10
}

/** 可能区间：已确认值 → 把未知人按「全部不符合」与「全部符合」夹出上下界（§6.2）。 */
export function possibleRange(rule) {
  const basis = rule.basis
  if (!basis || !basis.denominator) return null
  const low = round1((basis.numerator / basis.denominator) * 100)
  const high = round1(((basis.numerator + basis.unknown) / basis.denominator) * 100)
  return { low, high, denominator: basis.denominator, unknown: basis.unknown }
}

function recomputedKey(rule) {
  const target = rule.targetLower
  if (target == null) return 'notApplicable'
  if (rule.operator === '区间') {
    if (rule.actualValue == null) return 'pending'
    if (rule.actualValue < target) return 'gap'
    if (rule.targetUpper != null && rule.actualValue > rule.targetUpper) return 'gap'
    return 'satisfied'
  }
  if (rule.operator === '不高于') {
    if (rule.actualValue == null) return 'pending'
    return rule.actualValue <= target ? 'satisfied' : 'gap'
  }
  // 不低于 / 每单位不低于：能用分子分母就算可能区间，否则保守出待核验
  const range = possibleRange(rule)
  if (range) {
    if (range.high < target) return 'gap'
    if (range.low >= target) return 'satisfied'
    return 'pending'
  }
  if (rule.actualValue == null) return 'pending'
  if (rule.unknownCount > 0) return rule.actualValue >= target ? 'satisfied' : 'pending'
  return rule.actualValue >= target ? 'satisfied' : 'gap'
}

/** 结论文案：状态取「未改目标＝台账既有结论；改过目标＝按新目标重算」。 */
export function describeRule(rule) {
  const meta = RESULT_STATES[rule.storedStateKey] || { label: rule.storedStateKey, tone: 'default' }
  const base = { basisNote: '', range: null, note: '' }

  if (!rule.accepted) {
    return { ...base, key: 'excluded', label: '已忽略', tone: 'default', gapText: '—', note: '未纳入本次报表', valueText: '—' }
  }
  if (rule.type === '人工评估') {
    return {
      ...base,
      key: 'manual',
      label: RESULT_STATES.manual.label,
      tone: RESULT_STATES.manual.tone,
      gapText: '人工判定',
      note: '无数值口径：按评估说明与依据材料逐人出具结论',
      valueText: rule.actualValue == null ? '—' : String(rule.actualValue),
    }
  }

  const range = possibleRange(rule)
  const key = rule.targetEdited ? recomputedKey(rule) : rule.storedStateKey
  const stateMeta = RESULT_STATES[key] || meta
  const unit = rule.unit || ''

  let gapText = '—'
  if (key === 'gap' && rule.actualValue != null && rule.targetLower != null) {
    const diff = round1(Math.abs(rule.targetLower - rule.actualValue))
    gapText = unit === '%' ? `差 ${diff} 个百分点` : `差 ${diff} ${unit}`
  } else if (key === 'pending') {
    gapText = rule.unknownCount ? `${rule.unknownCount} 项待核验` : '待核验'
  } else if (key === 'notAnalyzed') {
    gapText = '未分析'
  } else if (key === 'notApplicable') {
    gapText = '不适用'
  }

  let valueText = rule.actualValue == null ? '—' : `${rule.actualValue}${unit}`
  // 只有存在未核验人数时才给「可能区间」，无未知项时区间退化（如 100%–100%）反而是噪声
  if (range && range.unknown > 0 && rule.actualValue != null) {
    valueText = `${rule.actualValue}${unit}（可能 ${range.low}%–${range.high}%）`
  }

  const note = key === 'pending' && range
    ? `可能区间 ${range.low}%–${range.high}% 跨越目标值，未知 ${range.unknown} 人未核验前不能判定达标或缺口`
    : rule.targetEdited
      ? '按本次修改后的目标值重算（与要求台账记录不同）'
      : ''

  return { key, label: stateMeta.label, tone: stateMeta.tone, gapText, note, range, valueText, basisNote: (rule.basis || {}).note || '' }
}

/** 汇总（按逐条结论计数；未分析/已忽略单列，不混入缺口）。 */
export function summarize(rules) {
  const counts = { satisfied: 0, gap: 0, pending: 0, manual: 0, notAnalyzed: 0, notApplicable: 0, excluded: 0 }
  rules.forEach((rule) => {
    const key = describeRule(rule).key
    counts[key] = (counts[key] || 0) + 1
  })
  return { total: rules.length, ...counts }
}

export function summarizeText(summary) {
  const parts = []
  if (summary.satisfied) parts.push(`${summary.satisfied} 条已满足`)
  if (summary.gap) parts.push(`${summary.gap} 条存在缺口`)
  if (summary.pending) parts.push(`${summary.pending} 条待核验`)
  if (summary.manual) parts.push(`${summary.manual} 条待人工评估`)
  if (summary.notAnalyzed) parts.push(`${summary.notAnalyzed} 条未分析`)
  if (summary.excluded) parts.push(`${summary.excluded} 条已忽略`)
  return parts.length ? parts.join('、') : '没有可统计的规则'
}

// ============================================================================
// 五、报表（生成即冻结一份快照；改规则后需重新生成）
// ============================================================================

let reportSeq = 0

export function nextReportCode() {
  reportSeq += 1
  return `R-20261009-${String(reportSeq).padStart(2, '0')}`
}

/**
 * 生成报表。传入的是**当前规则副本**，生成后修改规则不会影响已生成的报表
 * （与文档「确认人查看的是冻结提交版本」同一语义）。
 */
export function buildReport({ rules, scope, cutoff, docName, ruleVersion }) {
  const accepted = rules.filter((rule) => rule.accepted)
  const rows = sortReportRows(rules.map((rule) => {
    const descriptor = describeRule(rule)
    return { ...rule, ...descriptor, descriptor, rule }
  }))
  const snapshot = snapshotOf('PL-2026-001')
  return {
    code: nextReportCode(),
    generatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    docName,
    ruleVersion,
    cutoff: cutoff || DATA_CUTOFF_DEFAULT,
    scopeLabel: getScope(scope).label,
    scopeValue: scope,
    snapshotId: snapshot ? snapshot.snapshotId : '',
    populationCount: snapshot ? snapshot.populationCount : null,
    rowCount: rows.length,
    acceptedCount: accepted.length,
    summary: summarize(rules),
    rows,
  }
}

/** 缺口规则按「差得最多」排前面，便于先看要补什么。 */
export function sortReportRows(rows) {
  const weight = { gap: 0, pending: 1, manual: 2, notAnalyzed: 3, satisfied: 4, notApplicable: 5, excluded: 6 }
  return rows.slice().sort((a, b) => (weight[a.key] ?? 9) - (weight[b.key] ?? 9))
}

export function reportCsv(report) {
  const headers = ['要求/指标', '类型', '当前值', '目标值', '差距', '结论', '统计范围', '依据原文', '来源位置']
  const lines = [headers.join(',')]
  const cell = (value) => {
    const text = String(value ?? '')
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  report.rows.forEach((row) => {
    lines.push([
      row.name,
      row.type,
      row.valueText,
      `${row.operator || ''} ${row.targetLower ?? ''}${row.unit || ''}`.trim(),
      row.gapText,
      row.label,
      row.scopeLabel,
      row.clauseText || '（原文未给出可度量口径）',
      row.clauseLocation,
    ].map(cell).join(','))
  })
  return `\ufeff${lines.join('\r\n')}`
}
