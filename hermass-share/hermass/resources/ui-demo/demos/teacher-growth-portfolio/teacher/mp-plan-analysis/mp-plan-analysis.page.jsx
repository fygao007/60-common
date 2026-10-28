import { createRoot } from 'react-dom/client'

export const PAGE_GENERATION_CONTRACT = 'v1'
export const PAGE_TEMPLATE = 'dashboard'

import { useMemo, useState } from 'react'
import {
  DSAlert,
  DSButton,
  DSDataTable,
  DSDatePicker,
  DSDrawer,
  DSEmptyState,
  DSCard,
  DSDashboardGrid,
  DSDashboardGridItem,
  DSUpload,
  DSTag,
  DSInput,
  DSSelect,
  DSSwitch,
  DSTextarea,
} from '@wisedu/design-system'
import {
  REQUIREMENT_TYPES,
  REQUIREMENT_TYPE_META,
  TARGET_OPERATORS,
  orgName,
  samplePopulation,
} from './growth-plan-store.js'
import {
  ANALYSIS_DOCS,
  ANALYSIS_SCOPES,
  DATA_CUTOFF_DEFAULT,
  DATA_CUTOFF_NOTE,
  SAMPLE_TEXT,
  buildReport,
  emptyRule,
  extractRules,
  extractRulesFromText,
  reportCsv,
  snapshotOf,
  summarizeText,
} from './plan-analysis.js'
import { defineTableColumns, defineOntologyFields } from '@wisedu/hr-domain/fields'
import './mp-plan-analysis.css'

const FIELD_REFS = ['requirementName', 'actualValue', 'targetLower', 'gapValue', 'resultState'].map((code) => `Business.teacher-growth.${code}`)
const RULE_FIELDS = defineOntologyFields(['requirementName', 'requirementType', 'targetOperator', 'targetLower', 'scopeDefinition'].map((code) => `Business.teacher-growth.${code}`))

// 发展规划分析
// 依据：《管理侧发展规划与师资队伍建设详细设计》M18（AI 规划文件辅助创建）
//  - 一个功能、一个页面：**文档 + 规则 + 数据范围 → 分析报表**，不另设导入向导与配置台账。
//  - 规则由人给：AI 只把文档里**可度量的表述**抽成候选（带来源位置），原文没写数字就不补；
//    目标值、类型、运算符、是否纳入都由人确认。
//  - 数据只读统一分析快照：报表口径行写明 规则版本 + 数据截止日 + 统计范围 + 快照编号，
//    与总览/要求台账读的是同一份 requirementId，不新增数据源。
//  - 未知 ≠ 不符合：比例类给「已确认值 + 可能区间」，跨越目标值的一律出「待核验」，
//    数据缺失不按不达标计算；缺口只用百分点表达，不直接换算成招聘人数。
//  - 生成即冻结：报表按生成时刻的规则副本产出，之后再改规则只标记「需重新生成」，不改写已生成报表。

const OPERATOR_FALLBACK = '人工判定'

function ResultDot({ value, tone = 'neutral' }) {
  return <DSTag tone={tone === 'default' ? 'neutral' : tone}>{value}</DSTag>
}

function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function operatorsOf(type) {
  if (type === '人工评估') return [OPERATOR_FALLBACK]
  return TARGET_OPERATORS[type] || ['不低于']
}

function unitOf(type) {
  return (REQUIREMENT_TYPE_META[type] || {}).unitHint || ''
}

// 演示口径：只有能对样本 8 人做明确判定的规则才给人员样例，其余如实说明不可展示。
const SAMPLE_PREDICATES = {
  'RQ-001': { label: '最高学位为博士研究生', test: (person) => person.degree === '博士研究生' },
  'RQ-009': { label: '师德师风考核合格（样本内视为全部合格）', test: () => true },
}

function PlanAnalysisPage() {  const [docKind, setDocKind] = useState('none')
  const [docId, setDocId] = useState('')
  const [docName, setDocName] = useState('')
  const [docNote, setDocNote] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [rules, setRules] = useState([])
  const [scope, setScope] = useState('org-univ')
  const [cutoff, setCutoff] = useState(DATA_CUTOFF_DEFAULT)
  const [ruleRev, setRuleRev] = useState(0)
  const [report, setReport] = useState(null)
  const [stale, setStale] = useState(false)
  const [detail, setDetail] = useState(null)
  const [toast, setToast] = useState('')
  const [uploadFiles, setUploadFiles] = useState([])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  // 任何规则/范围/截止日变化都让已生成的报表失效（只标记，不改写已生成的报表）
  function touch() {
    setStale((value) => (report ? true : value))
  }

  function chooseSample(doc) {
    setDocKind('sample')
    setDocId(doc.docId)
    setDocName(doc.name)
    setDocNote(doc.note)
  }

  function handleFile(file) {
    if (!file) return
    const matched = ANALYSIS_DOCS.find((doc) => file.name.includes(doc.name.slice(0, 6)))
    setDocKind('file')
    setDocName(file.name)
    if (matched) {
      setDocId(matched.docId)
      setDocNote(`与内置示例文档同源 · ${matched.note}`)
    } else {
      setDocId('')
      setDocNote('演示环境不解析真实文件内容，未识别出可度量要求；可用「粘贴正文」或手动添加规则')
    }
  }

  function handleExtract() {
    if (docKind === 'none') {
      notify('请先选择示例文档、上传文件或粘贴正文')
      return
    }
    if (docKind === 'text') {
      const result = extractRulesFromText(pastedText)
      setRules(result.rules)
      setDocNote(result.docNote)
      touch()
      notify(result.rules.length ? `已从正文识别 ${result.rules.length} 条规则候选，请逐条确认` : '未识别到可度量要求，可手动添加规则')
      return
    }
    if (!docId) {
      notify('演示环境不解析真实文件内容：请改用「粘贴正文」或手动添加规则')
      return
    }
    const result = extractRules(docId)
    setRules(result.rules)
    setDocNote(result.docNote)
    touch()
    notify(`已提取 ${result.rules.length} 条规则候选，请逐条确认`)
  }

  function patchRule(ruleId, patch) {
    setRules((prev) => prev.map((rule) => (rule.ruleId === ruleId ? { ...rule, ...patch } : rule)))
    touch()
  }

  function addManualRule() {
    setRules((prev) => [...prev, emptyRule()])
    touch()
    notify('已添加一条空白规则，请填写要求名称与目标值')
  }

  function handleGenerate() {
    const accepted = rules.filter((rule) => rule.accepted)
    if (!accepted.length) {
      notify('至少需要一条纳入分析的规则')
      return
    }
    // 规则版本只在「规则相对上次生成确有变化」时递增，重复生成同一套规则不涨版本
    const nextRev = report && !stale ? ruleRev : ruleRev + 1
    const next = buildReport({
      rules: rules.map((rule) => ({ ...rule })),
      scope,
      cutoff,
      docName: docName || '（未命名文档）',
      ruleVersion: `v${nextRev}`,
    })
    setRuleRev(nextRev)
    setReport(next)
    setStale(false)
    notify(`已生成 ${next.code}：${summarizeText(next.summary)}`)
  }

  function handleExport() {
    if (!report) return
    downloadCsv(`${report.code}_发展规划分析报表.csv`, reportCsv(report))
    notify('报表已导出为 CSV（含口径与来源位置）')
  }

  const snapshot = snapshotOf('PL-2026-001')
  const acceptedCount = rules.filter((rule) => rule.accepted).length

  const columns = useMemo(() => {
    const displayColumns = [
    {
      key: 'name',
      dataIndex: 'name',
      title: '要求 / 指标',
      width: 268,
      render: (value, record) => (
        <div className="mpa2-cell-main">
          <span className="mpa2-cell-title" title={value}>{value || '（未命名要求）'}</span>
          <span className="mpa2-cell-sub">{record.type}{record.indicator ? ` · ${record.indicator}` : ''}</span>
        </div>
      ),
    },
    {
      key: 'valueText',
      dataIndex: 'valueText',
      title: '当前值',
      width: 208,
      render: (value) => <span className="mpa2-num">{value}</span>,
    },
    {
      key: 'target',
      dataIndex: 'targetLower',
      title: '目标值',
      width: 136,
      render: (_, record) => {
        // 运算符写成短式，避免列内被裁切：区间 → 40–60人；每单位不低于 → 90%/单位
        if (record.type === '人工评估' || record.targetLower == null) return <span className="mpa2-num">人工判定</span>
        if (record.operator === '区间' || record.operator === '各层区间') {
          return <span className="mpa2-num">{`${record.targetLower}–${record.targetUpper ?? ''}${record.unit || ''}`}</span>
        }
        if (record.operator === '每单位不低于') {
          return <span className="mpa2-num">{`${record.targetLower}${record.unit || ''}/单位`}</span>
        }
        return <span className="mpa2-num">{`${record.operator} ${record.targetLower}${record.unit || ''}`}</span>
      },
    },
    { key: 'gapText', dataIndex: 'gapText', title: '差距', width: 140 },
    {
      key: 'state',
      dataIndex: 'label',
      title: '结论',
      width: 112,
      render: (value, record) => <ResultDot value={value} tone={record.tone} />,
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ]
    return defineTableColumns(FIELD_REFS).map((column, index) => ({
      ...column,
      dataIndex: displayColumns[index].dataIndex,
      width: displayColumns[index].width,
      render: displayColumns[index].render,
    }))
  }, [])

  const rowActions = useMemo(() => [
    { key: 'detail', label: '查看口径', onClick: (record) => setDetail(record) },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [])

  return (
    <main className="mpa2-page" data-ds-business-page="mp-plan-analysis">
      <DSAlert tone="info" title="文档 + 规则 + 数据 → 分析报表">
        上传或粘贴一段学校发展文档，确认评判要求规则，系统按库中数据生成一份分析报表。
        规则由你定，数据取自统一分析快照；原文没写数字的要求不会被补出目标值，数据缺失的条目不按不达标计算。
        演示环境：文档解析、提取结果与来源位置均为演示数据。
      </DSAlert>

      <DSDashboardGrid gap={12}>
      <DSDashboardGridItem size="medium">
        <DSCard layout="long"
          title="1 · 学校发展文档"
          extra={(
            <span className="mpa2-hint">
              {docKind === 'none' ? '尚未选择文档' : `当前来源：${docName}`}
            </span>
          )}
        >
        <div className="mpa2-section-content">
        <div className="mpa2-doc-grid">
          <div className="mpa2-doc-block">
            <div className="mpa2-doc-actions">
              <DSUpload
                mode="button"
                accept=".doc,.docx,.pdf"
                uploadText="选择文件"
                description="支持 Word / PDF，演示环境不解析真实文件内容"
                files={uploadFiles}
                onChange={(files, meta) => {
                  setUploadFiles(files)
                  if (meta.action === 'add') handleFile(meta.files[0])
                }}
              />
            </div>
            <div className="mpa2-doc-samples">
              <span className="mpa2-hint">或使用内置示例：</span>
              {ANALYSIS_DOCS.map((doc) => (
                <DSButton
                  key={doc.docId}
                  variant="link"
                  size="small"
                  onClick={() => chooseSample(doc)}
                >
                  {doc.name}
                </DSButton>
              ))}
            </div>
          </div>

          <div className="mpa2-doc-block">
            <DSTextarea
              rows={3}
              value={pastedText}
              placeholder="或直接粘贴文档正文（例如规划的师资部分）"
              onChange={(event) => {
                setPastedText(event.target.value)
                setDocKind(event.target.value.trim() ? 'text' : 'none')
                setDocName(event.target.value.trim() ? '粘贴的正文' : '')
                setDocNote('')
              }}
            />
            <div className="mpa2-doc-actions">
              <DSButton size="small" onClick={() => {
                setPastedText(SAMPLE_TEXT)
                setDocKind('text')
                setDocName('粘贴的正文')
                setDocNote('')
              }}
              >
                填入示例正文
              </DSButton>
              <span className="mpa2-hint">按关键词识别可度量要求；只有方向、没有数字的表述不会生成规则</span>
            </div>
          </div>
        </div>
        {docNote ? <p className="mpa2-doc-note">{docNote}</p> : null}
        </div>
        </DSCard>
      </DSDashboardGridItem>



      <DSDashboardGridItem size="medium">
        <DSCard layout="long" title="2 · 数据范围">
        <div className="mpa2-section-content">
        <div className="mpa2-scope-grid">
          <label className="mpa2-field">
            <span className="mpa2-field__label">统计范围</span>
            <DSSelect
              value={scope}
              options={ANALYSIS_SCOPES.map((item) => ({
                value: item.value,
                label: item.available ? item.label : `${item.label}（未登记口径）`,
              }))}
              onChange={(value) => {
                const next = ANALYSIS_SCOPES.find((item) => item.value === value)
                if (next && !next.available) {
                  notify(`该统计范围尚未登记口径：${next.reason}`)
                  return
                }
                setScope(value)
                touch()
              }}
            />
          </label>
          <label className="mpa2-field">
            <span className="mpa2-field__label">数据截止日</span>
            <DSDatePicker
              value={cutoff}
              clearable={false}
              onChange={(value) => {
                setCutoff(value || DATA_CUTOFF_DEFAULT)
                touch()
              }}
            />
          </label>
          <div className="mpa2-field mpa2-field--note">
            <span className="mpa2-hint">{DATA_CUTOFF_NOTE}</span>
            {snapshot ? (
              <span className="mpa2-hint">
                与统一分析快照 {snapshot.snapshotId} 同源，全校人数 {snapshot.populationCount}（校正：快照总人数含未认定人员，不参与要求分子）。
              </span>
            ) : null}
          </div>
          <div className="mpa2-generate">
            <DSButton variant="primary" onClick={handleGenerate} disabled={!acceptedCount}>
              生成分析报表
            </DSButton>
            {!acceptedCount ? <span className="mpa2-hint">至少纳入一条规则后才可生成</span> : null}
          </div>
        </div>
        {stale ? (
          <DSAlert tone="warning" title="规则或数据范围已变更">
            已生成报表 {report ? report.code : ''} 是按上一次规则冻结的，不会随本次修改改写。确认无误后请重新生成。
          </DSAlert>
        ) : null}
        </div>
        </DSCard>
      </DSDashboardGridItem>

      <DSDashboardGridItem size="full">
        <DSCard layout="long"
          title={`3 · 评判要求规则${rules.length ? `（${rules.length} 条，纳入 ${acceptedCount} 条）` : ''}`}
          extra={(
            <div className="mpa2-actions">
              <DSButton size="small" onClick={handleExtract}>识别文档中的规则</DSButton>
              <DSButton size="small" onClick={addManualRule}>手动添加规则</DSButton>
            </div>
          )}
        >
        <div className="mpa2-section-content">
        {rules.length ? (
          <div className="mpa2-rules">
            <div className="mpa2-rule mpa2-rule--head">
              {RULE_FIELDS.map((field) => <span key={field.fieldRef}>{field.label}</span>)}
              <span>纳入</span>
            </div>
            {rules.map((rule) => (
              <div className="mpa2-rule" key={rule.ruleId}>
                <DSInput
                  value={rule.name}
                  placeholder="要求名称"
                  onChange={(event) => patchRule(rule.ruleId, { name: event.target.value, targetEdited: true })}
                />
                <DSSelect
                  options={REQUIREMENT_TYPES.map((item) => ({ value: item, label: item }))}
                  value={rule.type}
                  onChange={(value) => patchRule(rule.ruleId, {
                    type: value || '人工评估',
                    operator: operatorsOf(value)[0],
                    // 单位随类型派生（口径单位只在要求类型里定义，页面不另设单位字段）
                    unit: unitOf(value),
                    targetEdited: true,
                  })}
                />
                <DSSelect
                  options={operatorsOf(rule.type).map((item) => ({ value: item, label: item }))}
                  value={rule.operator}
                  disabled={rule.type === '人工评估'}
                  onChange={(value) => patchRule(rule.ruleId, { operator: value || operatorsOf(rule.type)[0], targetEdited: true })}
                />
                <div className="mpa2-target">
                  <DSInput
                    type="number"
                    value={rule.targetLower == null ? '' : String(rule.targetLower)}
                    placeholder="目标值"
                    disabled={rule.type === '人工评估'}
                    onChange={(event) => patchRule(rule.ruleId, {
                      targetLower: event.target.value === '' ? null : Number(event.target.value),
                      targetEdited: true,
                    })}
                  />
                  <span className="mpa2-unit">{rule.type === '人工评估' ? '人工判定' : (rule.unit || '')}</span>
                </div>
                <span className="mpa2-scope" title={rule.scopeLabel}>{rule.scopeLabel}</span>
                <DSSwitch
                  checked={rule.accepted}
                  checkedText="纳入"
                  uncheckedText="忽略"
                  onChange={(next) => patchRule(rule.ruleId, { accepted: next })}
                />
                <p className="mpa2-rule-clause">
                  <span className="mpa2-rule-clause__label">依据</span>
                  {rule.clauseText
                    ? <span className="mpa2-rule-clause__text">{rule.clauseText}</span>
                    : <span className="mpa2-rule-clause__empty">{rule.extractNote}</span>}
                  <span className="mpa2-rule-clause__from">{rule.clauseLocation}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <DSEmptyState
            compact
            type="data"
            title="还没有评判要求规则"
            description="选择示例文档、上传文件或粘贴正文后点「识别文档中的规则」，由文档生成候选规则；也可以直接「手动添加规则」把口径填进来。原文只有方向、没有目标值的表述不会被自动补数字。"
          />
        )}
        </div>
        </DSCard>
      </DSDashboardGridItem>



      <DSDashboardGridItem size="full">
        <DSCard layout="long"
          title="4 · 分析报表"
          extra={report ? <span className="mpa2-hint">{summarizeText(report.summary)}</span> : null}
        >
        <div className="mpa2-section-content">
        {report ? (
          <>
            <div className="mpa2-report-bar">
              <DSButton variant="primary" size="small" onClick={handleExport}>导出报表</DSButton>
              <span className="mpa2-hint">{`共 ${report.acceptedCount} 条纳入 / ${report.rowCount} 条规则`}</span>
            </div>
            <p className="mpa2-caliber">
              {`口径：报表 ${report.code} · 规则 ${report.ruleVersion} · 数据截止 ${report.cutoff} · 统计范围 ${report.scopeLabel}`
                + ` · 数据快照 ${report.snapshotId || '—'} · 文档《${report.docName}》 · 生成于 ${report.generatedAt}`}
            </p>
            <DSDataTable
              columns={columns}
              data={report.rows}
              rowKey="ruleId"
              selectable={false}
              showIndex={false}
              actions={rowActions}
              actionsMaxVisible={1}
              actionFixed
              variant="lowcode"
              bordered
            />
            <p className="mpa2-report-foot">
              缺口只用百分点表达，不直接换算成招聘人数；数据缺失的条目出「待核验」，未核验前不判定达标或缺口。
            </p>
          </>
        ) : (
          <DSEmptyState
            compact
            type="search"
            title="尚未生成分析报表"
            description="确认好文档与规则、选好数据范围后点「生成分析报表」。报表会冻结当次的规则版本、数据截止日与统计范围，之后修改规则需重新生成。"
          />
        )}
        </div>
        </DSCard>
      </DSDashboardGridItem>

      </DSDashboardGrid>

      <DSDrawer
        open={Boolean(detail)}
        title={detail ? `口径明细 · ${detail.name}` : '口径明细'}
        width={620}
        showFooter={false}
        onClose={() => setDetail(null)}
      >
        {detail ? (
          <div className="mpa2-drawer">
            <div className="mpa2-drawer-row">
              <span className="mpa2-drawer-label">结论</span>
              <ResultDot value={detail.label} tone={detail.tone} />
            </div>
            <div className="mpa2-drawer-row">
              <span className="mpa2-drawer-label">差距</span>
              <span>{detail.gapText}</span>
            </div>
            <div className="mpa2-drawer-row">
              <span className="mpa2-drawer-label">当前值 / 目标</span>
              <span>
                {detail.valueText}
                {' ／ '}
                {detail.targetLower == null ? '人工判定' : `${detail.operator} ${detail.targetLower}${detail.unit || ''}`}
              </span>
            </div>
            <div className="mpa2-drawer-row">
              <span className="mpa2-drawer-label">统计范围</span>
              <span>{detail.scopeLabel}</span>
            </div>
            <div className="mpa2-drawer-section">
              <h3>判定依据</h3>
              <p className="mpa2-drawer-text">
                {detail.note || detail.typeNote || '按统一分析快照的已核验事实判定。'}
              </p>
              {detail.basis ? (
                <p className="mpa2-drawer-text">
                  {`分子 ${detail.basis.numerator} / 分母 ${detail.basis.denominator} / 待核验 ${detail.basis.unknown}；${detail.basis.note}`}
                </p>
              ) : null}
            </div>
            <div className="mpa2-drawer-section">
              <h3>原文依据</h3>
              <p className="mpa2-drawer-quote">
                {detail.clauseText || '原文仅给出方向，未给出可度量口径（按规则不补数字，目标值由人工填写）。'}
              </p>
              <p className="mpa2-hint">{`来源位置：${detail.clauseLocation}（演示数据）`}</p>
            </div>
            <div className="mpa2-drawer-section">
              <h3>人员明细</h3>
              {SAMPLE_PREDICATES[detail.ruleId] ? (
                <>
                  <p className="mpa2-drawer-text">{`判定条件：${SAMPLE_PREDICATES[detail.ruleId].label}`}</p>
                  <ul className="mpa2-person-list">
                    {samplePopulation().filter(SAMPLE_PREDICATES[detail.ruleId].test).map((person) => (
                      <li key={person.personId}>
                        <span>{person.name}</span>
                        <span className="mpa2-hint">{`${person.org} · ${person.title} · ${person.degree}`}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mpa2-hint">演示环境仅内置 8 人样本；正式实现按统计范围全量返回，并支持导出待核验名单。</p>
                </>
              ) : (
                <p className="mpa2-drawer-text">
                  该要求依赖统计范围内的全量事实字段，演示环境未提供对应样本，故不展示人员清单；待核验人数见上方判定依据。
                </p>
              )}
            </div>
            <div className="mpa2-drawer-row">
              <span className="mpa2-drawer-label">责任与期限</span>
              <span>{`${orgName(detail.ownerOrganization)} · ${detail.deadline || '未设置期限'}`}</span>
            </div>
          </div>
        ) : null}
      </DSDrawer>

      {toast ? <div className="mpa2-toast" role="status">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<PlanAnalysisPage />)
