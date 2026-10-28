import { createRoot } from 'react-dom/client'

export const PAGE_GENERATION_CONTRACT = 'v1'
export const PAGE_TEMPLATE = 'react-business-page'
import { useMemo, useState } from 'react'
import { DSAuditOpinionModal, DSButton, DSRegularListTemplate } from '@wisedu/design-system'
import {
  AUDIT_RECORDS,
  CATEGORIES,
  CATEGORY_LABELS,
  HANDLE_STATUS,
  HANDLE_STATUS_OPTIONS,
  remainDays,
  statusCounts,
  unitOptions,
} from './warning-data.js'
import './warning-audit.css'

// 模板选择说明：需求语义为"审核/审批列表"，catalog 的 audit（DSAuditTemplate）虽名义匹配，
// 但其内部未透传 DSDataTable 的 onSelectRow / onSelectAll（勾选框 readOnly），批量审核不可用；
// 且自带 h1 页头与框架壳重复。故按 catalog fallback 规则回退：用 regular-list 模板
// （DSRegularListTemplate 自带页签/筛选/工具栏/表格/分页）+ 原始审核组件 DSAuditOpinionModal 组装。

const AUDITOR_NAME = '高管理员'

const PENDING_TONE = 'is-pending'
const STATUS_TONE = { pending: PENDING_TONE, approved: 'is-approved', returned: 'is-returned' }

// 列定义：字段口径来自 ontology，value 一处定义同时供表格渲染使用
const FIELD_LIST = [
  { fieldRef: 'StaffBasicInformation.xm', key: 'name', title: '姓名', width: 100 },
  { fieldRef: 'StaffBasicInformation.szdwdm', key: 'unit', title: '所在单位', width: 190 },
  {
    fieldRef: 'Business.warningCenter.warningCategory',
    key: 'category',
    title: '预警事项',
    width: 120,
    value: (row) => CATEGORY_LABELS[row.category] || '-',
  },
  { key: 'expireDate', title: '到期日期', width: 120 },
  { key: 'remainDays', title: '剩余天数（天）', width: 120, value: (row) => remainDays(row) },
  {
    fieldRef: 'Business.warningCenter.handleStatus',
    key: 'handleStatus',
    title: '处置状态',
    width: 110,
    value: (row) => <StatusDot status={row.handleStatus} />,
  },
]

const COLUMNS = FIELD_LIST.map((field) => ({
  key: field.key,
  title: field.title,
  width: field.width,
  render: field.value ? (_, row) => field.value(row) : undefined,
}))

function StatusDot({ status }) {
  return (
    <span className={`wa-status ${STATUS_TONE[status] || PENDING_TONE}`}>
      <i aria-hidden="true" />
      {HANDLE_STATUS[status]}
    </span>
  )
}

function nowText() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function WarningAuditPage() {
  const [records, setRecords] = useState(AUDIT_RECORDS)
  const [activeTab, setActiveTab] = useState('pending')
  const [filters, setFilters] = useState({ category: '全部', status: '全部', unit: '全部', keyword: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [auditState, setAuditState] = useState(null)
  const [opinion, setOpinion] = useState('')
  const [toast, setToast] = useState('')
  const pageSize = 10

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }

  const counts = useMemo(() => statusCounts(records), [records])
  const units = useMemo(() => unitOptions(records), [records])
  const isPendingTab = activeTab === 'pending'

  const visible = useMemo(() => records.filter((row) => {
    if (activeTab === 'pending' && row.handleStatus !== 'pending') return false
    if (activeTab === 'handled' && row.handleStatus === 'pending') return false
    if (filters.category !== '全部' && CATEGORY_LABELS[row.category] !== filters.category) return false
    if (filters.status !== '全部' && HANDLE_STATUS[row.handleStatus] !== filters.status) return false
    if (filters.unit !== '全部' && row.unit !== filters.unit) return false
    if (filters.keyword && !row.name.includes(filters.keyword.trim())) return false
    return true
  }), [records, activeTab, filters])

  const paged = useMemo(
    () => visible.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [visible, currentPage],
  )

  function openAudit(type, record, batch) {
    setOpinion('')
    setAuditState({ type, record, batch })
  }

  function closeAudit() {
    setAuditState(null)
    setOpinion('')
  }

  function submitAudit() {
    if (!auditState) return
    const targets = auditState.batch ? selectedKeys : [auditState.record.id]
    if (!targets.length) return
    const nextStatus = auditState.type === 'pass' ? 'approved' : 'returned'
    const auditTime = nowText()
    setRecords((prev) => prev.map((row) => (targets.includes(row.id)
      ? { ...row, handleStatus: nextStatus, auditOpinion: opinion.trim(), auditor: AUDITOR_NAME, auditTime }
      : row)))
    setSelectedKeys([])
    setAuditState(null)
    setOpinion('')
    notify(`已${auditState.type === 'pass' ? '通过' : '退回'} ${targets.length} 条预警处置`)
  }

  const tabs = [
    { key: 'pending', label: `待处置(${counts.pending})` },
    { key: 'handled', label: `已处置(${counts.handled})` },
    { key: 'all', label: `全部(${counts.all})` },
  ]

  function handleTabChange(key) {
    setActiveTab(key)
    setSelectedKeys([])
    setCurrentPage(1)
  }

  const filterProps = useMemo(() => ({
    fields: [
      {
        key: 'category',
        label: '预警事项',
        type: 'select',
        options: ['全部', ...CATEGORIES.map((item) => item.label)],
        controlledValue: filters.category,
        onChange: (value) => { setFilters((prev) => ({ ...prev, category: value })); setCurrentPage(1) },
      },
      {
        key: 'status',
        label: '处置状态',
        type: 'select',
        options: HANDLE_STATUS_OPTIONS,
        controlledValue: filters.status,
        onChange: (value) => { setFilters((prev) => ({ ...prev, status: value })); setCurrentPage(1) },
      },
      {
        key: 'unit',
        label: '所在单位',
        type: 'select',
        options: units,
        controlledValue: filters.unit,
        onChange: (value) => { setFilters((prev) => ({ ...prev, unit: value })); setCurrentPage(1) },
      },
      {
        key: 'keyword',
        label: '姓名',
        controlledValue: filters.keyword,
        placeholder: '请输入姓名',
        onChange: (event) => {
          setFilters((prev) => ({ ...prev, keyword: event.target?.value ?? event }))
          setCurrentPage(1)
        },
      },
    ],
    density: 'compact',
    columns: 4,
    defaultExpanded: true,
    showExpand: false,
    showMore: false,
    onReset: () => { setFilters({ category: '全部', status: '全部', unit: '全部', keyword: '' }); setCurrentPage(1) },
    onSearch: () => notify(`查询完成，共 ${visible.length} 条`),
  }), [filters, units, visible.length])

  // 批量审核按钮：仅待处置页签出现，未勾选时置灰
  const toolbarActions = useMemo(() => (isPendingTab ? [
    {
      key: 'batch-pass',
      label: '批量通过',
      variant: 'primary',
      disabled: !selectedKeys.length,
      onClick: () => openAudit('pass', null, true),
    },
    {
      key: 'batch-return',
      label: '批量退回',
      disabled: !selectedKeys.length,
      onClick: () => openAudit('return', null, true),
    },
  ] : []), [isPendingTab, selectedKeys.length])

  const rowActions = useMemo(() => [
    {
      key: 'pass',
      label: '通过',
      disabled: (row) => row.handleStatus !== 'pending',
      onClick: (row) => openAudit('pass', row, false),
    },
    {
      key: 'return',
      label: '退回',
      disabled: (row) => row.handleStatus !== 'pending',
      onClick: (row) => openAudit('return', row, false),
    },
  ], [])

  const tableProps = useMemo(() => ({
    columns: COLUMNS,
    data: paged,
    rowKey: 'id',
    selectable: isPendingTab,
    selectedRowKeys: selectedKeys,
    onSelectRow: (key, checked) => setSelectedKeys((prev) => (checked
      ? [...new Set([...prev, key])]
      : prev.filter((item) => item !== key))),
    onSelectAll: (checked, rows) => setSelectedKeys(checked ? rows.map((row) => row.id) : []),
    actions: rowActions,
    actionsMaxVisible: 2,
    actionFixed: true,
    showIndex: false,
    bordered: false,
    minWidth: 900,
  }), [paged, selectedKeys, isPendingTab, rowActions])

  const auditSummary = useMemo(() => (!auditState || auditState.batch ? null : [
    ['预警事项', CATEGORY_LABELS[auditState.record.category]],
    ['到期日期', auditState.record.expireDate],
    ['处置说明', auditState.record.handleRemark],
    ['提交人', auditState.record.submitter],
    ['提交时间', auditState.record.submitTime],
  ]), [auditState])

  return (
    <main className="wa-page" data-ds-business-page="warning-audit">
      <DSRegularListTemplate
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        metaLabel=""
        metaValue=""
        notice=""
        filterProps={filterProps}
        toolbarActions={toolbarActions}
        tableTools={false}
        summary={selectedKeys.length ? `已选 ${selectedKeys.length} 条` : ''}
        tableProps={tableProps}
        pagination={{
          total: visible.length,
          totalPages: Math.max(1, Math.ceil(visible.length / pageSize)),
          current: currentPage,
          pageSize,
          showJumper: true,
          onChange: (page) => setCurrentPage(page),
        }}
        footerActions={[]}
        inset={12}
        contentGap={12}
        toolbarGap={8}
      />

      <DSAuditOpinionModal
        open={Boolean(auditState)}
        type={auditState?.type || 'pass'}
        record={auditState?.batch
          ? { name: `已选 ${selectedKeys.length} 条预警处置` }
          : auditState?.record}
        opinionLabel="审核意见"
        opinionPlaceholder={auditState?.type === 'return' ? '请输入退回原因（退回必填）' : '请输入审核意见（选填）'}
        opinion={opinion}
        onOpinionChange={setOpinion}
        opinionRows={4}
        okText="提交"
        okDisabled={auditState?.type === 'return' && !opinion.trim()}
        onOk={submitAudit}
        onCancel={closeAudit}
      >
        {auditSummary ? (
          <div className="wa-audit-brief">
            {auditSummary.map(([label, value]) => (
              <div className="wa-audit-brief-row" key={label}>
                <span>{label}</span>
                <strong>{value || '-'}</strong>
              </div>
            ))}
          </div>
        ) : null}
        {auditState?.batch ? (
          <p className="wa-audit-brief-tip">所选记录将按同一审核意见处理</p>
        ) : null}
      </DSAuditOpinionModal>

      {toast && <div className="wa-toast" role="status">{toast}</div>}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<WarningAuditPage />)
