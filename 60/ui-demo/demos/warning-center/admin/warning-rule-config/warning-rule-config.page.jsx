import { createRoot } from 'react-dom/client'

export const PAGE_GENERATION_CONTRACT = 'v1'
export const PAGE_TEMPLATE = 'react-business-page'
import { useMemo, useState } from 'react'
import {
  DSButton,
  DSDoubleEditModal,
  DSEditField,
  DSInput,
  DSRegularListTemplate,
  DSSelect,
  DSSingleEditModal,
} from '@wisedu/design-system'
import { CATEGORY_LABELS, CATEGORIES, FREQUENCIES, RECEIVER_ROLES, RULES } from './warning-data.js'
import './warning-rule-config.css'

// 模板选择说明：语义为"配置列表 + 新增/编辑弹窗 + 行内启停/删除"。
// catalog 的 crud-list（DSCrudTemplate）内部为原生 input/table 且操作区写死，
// 套用会砍需求（下拉筛选/弹窗表单/启停用无处安放），按 skill 规则回退
// DSRegularListTemplate 组合（catalog regular-list 模板，标准业务列表页）。
function nowText() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function StatusDot({ value }) {
  const tone = value === '启用' ? 'is-done' : 'is-neutral'
  return (
    <span className={`wrc-status ${tone}`}>
      <i aria-hidden="true" />
      {value}
    </span>
  )
}

function WarningRuleConfigPage() {
  const [rows, setRows] = useState(RULES)
  const [filters, setFilters] = useState({ category: '全部', status: '全部', keyword: '' })
  const [editing, setEditing] = useState(null) // null | {} (新增) | row (编辑)
  const [deleting, setDeleting] = useState(null)
  const [toast, setToast] = useState('')

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }

  const visible = useMemo(() => rows.filter((row) => {
    if (filters.category !== '全部' && CATEGORY_LABELS[row.category] !== filters.category) return false
    if (filters.status !== '全部' && row.status !== filters.status) return false
    if (filters.keyword && !row.ruleName.includes(filters.keyword.trim())) return false
    return true
  }), [rows, filters])

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const paged = useMemo(() => visible.slice((currentPage - 1) * pageSize, currentPage * pageSize), [visible, currentPage])

  function saveRule(form) {
    if (editing && editing.id) {
      setRows((prev) => prev.map((row) => (row.id === editing.id ? { ...row, ...form, updateTime: nowText() } : row)))
      notify('规则已保存')
    } else {
      setRows((prev) => [{ id: `rl-${Date.now()}`, ...form, status: '启用', updateTime: nowText() }, ...prev])
      notify('规则已新增')
    }
    setEditing(null)
  }

  function toggleStatus(row) {
    const next = row.status === '启用' ? '停用' : '启用'
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: next, updateTime: nowText() } : item)))
    notify(`规则「${row.ruleName}」已${next}`)
  }

  function confirmDelete() {
    setRows((prev) => prev.filter((row) => row.id !== deleting.id))
    notify(`规则「${deleting.ruleName}」已删除`)
    setDeleting(null)
  }

  const columns = [
    { key: 'ruleName', dataIndex: 'ruleName', title: '规则名称', width: 220 },
    { key: 'category', dataIndex: 'category', title: '预警事项', width: 120, render: (value) => CATEGORY_LABELS[value] || value },
    { key: 'advanceDays', dataIndex: 'advanceDays', title: '提前天数（天）', width: 120 },
    { key: 'frequency', dataIndex: 'frequency', title: '提醒频率', width: 100 },
    { key: 'receiverRole', dataIndex: 'receiverRole', title: '接收角色', width: 140 },
    { key: 'status', dataIndex: 'status', title: '状态', width: 90, render: (value) => <StatusDot value={value} /> },
    { key: 'updateTime', dataIndex: 'updateTime', title: '更新时间', width: 150 },
  ]

  const actions = [
    { key: 'edit', label: '编辑', onClick: (record) => setEditing(record) },
    { key: 'toggle', label: (record) => (record.status === '启用' ? '停用' : '启用'), onClick: toggleStatus },
    { key: 'delete', label: '删除', danger: true, onClick: (record) => setDeleting(record) },
  ]

  const filterProps = useMemo(() => ({
    fields: [
      { key: 'category', label: '预警事项', type: 'select', options: ['全部', ...CATEGORIES.map((item) => item.label)], controlledValue: filters.category, onChange: (value) => { setFilters((prev) => ({ ...prev, category: value })); setCurrentPage(1) } },
      { key: 'status', label: '状态', type: 'select', options: ['全部', '启用', '停用'], controlledValue: filters.status, onChange: (value) => { setFilters((prev) => ({ ...prev, status: value })); setCurrentPage(1) } },
      { key: 'keyword', label: '规则名称', controlledValue: filters.keyword, placeholder: '请输入规则名称', onChange: (event) => setFilters((prev) => ({ ...prev, keyword: event.target?.value ?? event })) },
    ],
    density: 'compact',
    columns: 4,
    defaultExpanded: true,
    showExpand: false,
    showMore: false,
    onReset: () => { setFilters({ category: '全部', status: '全部', keyword: '' }); setCurrentPage(1) },
    onSearch: () => notify(`查询完成，共 ${visible.length} 条`),
  }), [filters, visible.length])

  const toolbarActions = [
    { key: 'create', label: '新增规则', variant: 'primary', onClick: () => setEditing({}) },
    { key: 'export', label: '导出', onClick: () => notify(`已导出 ${visible.length} 条预警规则`) },
  ]

  const form = editing || { category: 'contract', advanceDays: 30, frequency: '一次', receiverRole: RECEIVER_ROLES[0] }

  return (
    <main className="wrc-page" data-ds-business-page="warning-rule-config">
      <DSRegularListTemplate
        tabs={[]}
        metaLabel=""
        metaValue=""
        notice=""
        filterProps={filterProps}
        toolbarActions={toolbarActions}
        tableTools={false}
        summary=""
        tableProps={{
          columns,
          data: paged,
          rowKey: 'id',
          actions,
          actionsMaxVisible: 3,
          selectable: false,
          showIndex: false,
          bordered: false,
          minWidth: 940,
        }}
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

      {/* 新增 / 编辑规则弹窗 */}
      <DSDoubleEditModal
        open={!!editing}
        title={editing && editing.id ? '编辑预警规则' : '新增预警规则'}
        okText="保存"
        cancelText="取消"
        onCancel={() => setEditing(null)}
        onOk={() => saveRule({
          ruleName: document.getElementById('wrc-rule-name')?.value?.trim() || form.ruleName || '未命名规则',
          category: document.getElementById('wrc-rule-category')?.value || form.category,
          advanceDays: Number(document.getElementById('wrc-rule-days')?.value) || form.advanceDays,
          frequency: document.getElementById('wrc-rule-frequency')?.value || form.frequency,
          receiverRole: document.getElementById('wrc-rule-role')?.value || form.receiverRole,
        })}
      >
        <DSEditField label="规则名称" required>
          <DSInput id="wrc-rule-name" defaultValue={form.ruleName || ''} placeholder="如 劳动合同到期30天提醒" />
        </DSEditField>
        <DSEditField label="预警事项" required>
          <DSSelect id="wrc-rule-category" defaultValue={form.category} native>
            {CATEGORIES.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
          </DSSelect>
        </DSEditField>
        <DSEditField label="提前天数（天）" required>
          <DSInput id="wrc-rule-days" type="number" defaultValue={form.advanceDays} placeholder="如 30" />
        </DSEditField>
        <DSEditField label="提醒频率" required>
          <DSSelect id="wrc-rule-frequency" defaultValue={form.frequency} native>
            {FREQUENCIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </DSSelect>
        </DSEditField>
        <DSEditField label="接收角色" required>
          <DSSelect id="wrc-rule-role" defaultValue={form.receiverRole} native>
            {RECEIVER_ROLES.map((item) => <option key={item} value={item}>{item}</option>)}
          </DSSelect>
        </DSEditField>
      </DSDoubleEditModal>

      {/* 删除确认弹窗 */}
      <DSSingleEditModal
        open={!!deleting}
        title="删除确认"
        okText="删除"
        cancelText="取消"
        onCancel={() => setDeleting(null)}
        onOk={confirmDelete}
      >
        <p className="wrc-delete-tip">
          确认删除规则「{deleting?.ruleName}」？删除后该规则不再触发预警，已产生的预警记录不受影响。
        </p>
      </DSSingleEditModal>

      {toast && <div className="wrc-toast" role="status">{toast}</div>}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<WarningRuleConfigPage />)
