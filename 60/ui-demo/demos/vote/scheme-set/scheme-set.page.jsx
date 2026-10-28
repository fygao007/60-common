import { createRoot } from 'react-dom/client'
import { useMemo, useState } from 'react'
import {
  DSButton,
  DSEditField,
  DSEditForm,
  DSInput,
  DSModal,
  DSRegularListTemplate,
  DSSelect,
  DSSwitch,
  DSTag,
} from '@wisedu/design-system'
import { defineOntologyFields, defineTableColumns } from '@wisedu/hr-domain/fields'
import './scheme-set.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 字段回溯 ontology 单源
const F = Object.fromEntries(defineOntologyFields([
  'Business.vote.schemeName',
  'Business.vote.schemeRound',
  'Business.vote.voteMode',
  'Business.vote.scoreScale',
  'Business.vote.schemeUseStatus',
  'Business.vote.objectScope',
  'Business.vote.scoreMode',
  'Business.vote.calcMode',
  'Business.vote.logicOperator',
  'Business.vote.itemWeight',
  'Business.vote.trimCount',
  'Business.vote.allowExpertViewResult',
  'Business.vote.allowLeaderViewResult',
]).map((field) => [field.fieldRef, field]))

// 状态一律落在设计系统六色语义内
const USE_STATUS_TONE = { 未使用: 'gray', 使用中: 'blue', 已结束: 'teal' }
const MODE_OPTIONS = ['表决', '打分']
const SCALE_OPTIONS = ['十分制', '百分制']
const SCORE_MODE_OPTIONS = ['指标票数占比', '平均分', '自定义']
const CALC_MODE_OPTIONS = ['指标票数占比', '自定义']
const LOGIC_OPTIONS = ['去掉最高最低分', '取平均值']

const INITIAL = [
  { id: 's1', name: '第一轮 · 表决方案', round: 1, mode: '表决', scale: '十分制', useStatus: '使用中', scope: '校内评审专家库（36 人）', scoreMode: '指标票数占比', calcMode: '指标票数占比', logic: '去掉最高最低分', weight: 1, trimCount: 2, allowExpert: false, allowLeader: true },
  { id: 's2', name: '评议备选 · 打分方案', round: 2, mode: '打分', scale: '百分制', useStatus: '未使用', scope: '学院推荐专家（18 人）', scoreMode: '平均分', calcMode: '指标票数占比', logic: '取平均值', weight: 0.8, trimCount: 0, allowExpert: true, allowLeader: true },
  { id: 's3', name: '2025 年沿用方案', round: 1, mode: '表决', scale: '十分制', useStatus: '已结束', scope: '全校评审专家库', scoreMode: '指标票数占比', calcMode: '自定义', logic: '去掉最高最低分', weight: 1, trimCount: 1, allowExpert: false, allowLeader: false },
]

function SchemeSetPage() {
  const [rows, setRows] = useState(INITIAL)
  const [draft, setDraft] = useState({ keyword: '', mode: '' })
  const [filters, setFilters] = useState({ keyword: '', mode: '' })
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2000)
  }

  const visible = useMemo(() => rows.filter((row) => {
    if (filters.keyword && !row.name.includes(filters.keyword.trim())) return false
    if (filters.mode && row.mode !== filters.mode) return false
    return true
  }), [rows, filters])

  const useStatusTone = (value) => USE_STATUS_TONE[value] || 'gray'

  const columns = defineTableColumns([
    { fieldRef: 'Business.vote.schemeName', product: { width: 240, render: (_, record) => record.name } },
    { fieldRef: 'Business.vote.schemeRound', product: { width: 100, render: (_, record) => `第 ${record.round} 轮` } },
    { fieldRef: 'Business.vote.voteMode', product: { width: 110, render: (_, record) => record.mode } },
    { fieldRef: 'Business.vote.scoreScale', product: { width: 110, render: (_, record) => (record.mode === '表决' ? '-' : record.scale) } },
    { fieldRef: 'Business.vote.objectScope', product: { width: 220, render: (_, record) => record.scope } },
    { fieldRef: 'Business.vote.schemeUseStatus', product: { width: 110, render: (_, record) => <DSTag tone={useStatusTone(record.useStatus)}>{record.useStatus}</DSTag> } },
  ])

  const openEdit = (record) => {
    setEditing(record)
    setForm({
      name: record.name,
      round: String(record.round),
      mode: record.mode,
      scale: record.scale,
      scope: record.scope,
      scoreMode: record.scoreMode,
      calcMode: record.calcMode,
      logic: record.logic,
      weight: String(record.weight),
      trimCount: String(record.trimCount),
      allowExpert: record.allowExpert,
      allowLeader: record.allowLeader,
    })
  }

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }))

  const submit = () => {
    if (!form.name.trim()) {
      notify('请输入方案名称')
      return
    }
    setRows((previous) => previous.map((row) => (row.id === editing.id ? {
      ...row,
      name: form.name.trim(),
      round: Number(form.round) || row.round,
      mode: form.mode,
      scale: form.scale,
      scope: form.scope,
      scoreMode: form.scoreMode,
      calcMode: form.calcMode,
      logic: form.logic,
      weight: Number(form.weight) || row.weight,
      trimCount: Number(form.trimCount) || 0,
      allowExpert: form.allowExpert,
      allowLeader: form.allowLeader,
    } : row)))
    setEditing(null)
    notify('方案已保存')
  }

  // 字段联动（功能说明书 4.4 条 29 条规则，含「满足条件时隐藏」条目）
  const isVoteMode = form ? form.mode === '表决' : true
  const hideTrimCount = form ? form.calcMode === '指标票数占比' : true
  const showTrimCount = form ? !hideTrimCount && form.logic === '去掉最高最低分' : false
  const showCustomVotes = form ? form.calcMode === '自定义' : false

  return (
    <main className="scheme-set-page" data-ds-business-page="scheme-set">
      <DSRegularListTemplate
        tabs={[{ key: 'all', label: '全部方案' }, { key: 'active', label: '使用中' }]}
        activeTab="all"
        metaLabel=""
        metaValue=""
        notice={null}
        filterProps={{
          fields: [
            { key: 'keyword', label: F['Business.vote.schemeName'].label, placeholder: '请输入方案名称', controlledValue: draft.keyword, onChange: (event) => setDraft((previous) => ({ ...previous, keyword: event.target?.value ?? event })) },
            { key: 'mode', label: F['Business.vote.voteMode'].label, type: 'select', options: [{ label: '全部', value: '' }, ...MODE_OPTIONS.map((item) => ({ label: item, value: item }))], controlledValue: draft.mode, onChange: (value) => setDraft((previous) => ({ ...previous, mode: value })) },
          ],
          collapsedRows: 1,
          showExpand: false,
          showMore: false,
          onSearch: () => setFilters(draft),
          onReset: () => { const empty = { keyword: '', mode: '' }; setDraft(empty); setFilters(empty) },
        }}
        toolbarActions={[{ key: 'create', label: '新增方案', variant: 'primary', onClick: () => notify('新增方案（演示）') }]}
        tableTools={false}
        footerActions={[]}
        tableProps={{
          columns,
          data: visible,
          rowKey: 'id',
          selectable: false,
          showIndex: true,
          minWidth: 900,
          actions: [{ key: 'edit', label: '编辑', onClick: openEdit }],
          actionsPosition: 'right',
          actionsMaxVisible: 1,
          actionFixed: true,
          emptyText: '暂无投票方案',
        }}
        pagination={{ pageSize: 10 }}
      />

      <DSModal open={Boolean(editing)} title="编辑投票方案" okText="保存" cancelText="取消" size="large" onOk={submit} onCancel={() => setEditing(null)}>
        {form ? (
          <DSEditForm columns={2}>
            <DSEditField label={F['Business.vote.schemeName'].label} required htmlFor="ss-name">
              <DSInput id="ss-name" value={form.name} placeholder="请输入方案名称" onChange={(event) => update('name', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.schemeRound'].label} required htmlFor="ss-round">
              <DSInput id="ss-round" type="number" value={form.round} onChange={(event) => update('round', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.objectScope'].label} htmlFor="ss-scope">
              <DSInput id="ss-scope" value={form.scope} placeholder="请选择投票对象范围" onChange={(event) => update('scope', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.voteMode'].label} required htmlFor="ss-mode">
              <DSSelect id="ss-mode" value={form.mode} options={MODE_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={(value) => update('mode', value)} />
            </DSEditField>
            {isVoteMode ? (
              <DSEditField label={F['Business.vote.scoreScale'].label} htmlFor="ss-scale">
                <DSSelect id="ss-scale" value={form.scale} options={SCALE_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={(value) => update('scale', value)} />
              </DSEditField>
            ) : (
              <DSEditField label={F['Business.vote.scoreMode'].label} htmlFor="ss-score-mode">
                <DSSelect id="ss-score-mode" value={form.scoreMode} options={SCORE_MODE_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={(value) => update('scoreMode', value)} />
              </DSEditField>
            )}
            <DSEditField label={F['Business.vote.calcMode'].label} htmlFor="ss-calc">
              <DSSelect id="ss-calc" value={form.calcMode} options={CALC_MODE_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={(value) => update('calcMode', value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.logicOperator'].label} htmlFor="ss-logic">
              <DSSelect id="ss-logic" value={form.logic} options={LOGIC_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={(value) => update('logic', value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.itemWeight'].label} htmlFor="ss-weight">
              <DSInput id="ss-weight" value={form.weight} placeholder="如 1、0.8" onChange={(event) => update('weight', event.target.value)} />
            </DSEditField>
            {showCustomVotes ? (
              <DSEditField label="自定义票数" htmlFor="ss-custom-votes" help="计算方式为自定义时必填">
                <DSInput id="ss-custom-votes" type="number" placeholder="请输入自定义票数" />
              </DSEditField>
            ) : null}
            {showTrimCount ? (
              <DSEditField label={F['Business.vote.trimCount'].label} htmlFor="ss-trim" help="逻辑符为「去掉最高最低分」时生效">
                <DSInput id="ss-trim" type="number" value={form.trimCount} onChange={(event) => update('trimCount', event.target.value)} />
              </DSEditField>
            ) : null}
            <DSEditField label={F['Business.vote.allowExpertViewResult'].label}>
              <DSSwitch checked={form.allowExpert} checkedText="允许" uncheckedText="不允许" onChange={(value) => update('allowExpert', value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.allowLeaderViewResult'].label}>
              <DSSwitch checked={form.allowLeader} checkedText="允许" uncheckedText="不允许" onChange={(value) => update('allowLeader', value)} />
            </DSEditField>
          </DSEditForm>
        ) : null}
      </DSModal>

      {toast ? <div className="ss-toast" role="status" aria-live="polite">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<SchemeSetPage />)
