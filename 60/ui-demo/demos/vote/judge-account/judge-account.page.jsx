import { createRoot } from 'react-dom/client'
import { useMemo, useState } from 'react'
import {
  DSButton,
  DSCard,
  DSCardListTemplate,
  DSEditField,
  DSEditForm,
  DSEmptyState,
  DSImportUpload,
  DSInput,
  DSModal,
  DSSelect,
  DSTag,
} from '@wisedu/design-system'
import { defineOntologyFields } from '@wisedu/hr-domain/fields'
import './judge-account.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 字段一律回溯 ontology 单源（AGENTS.md 字段铁律），页面只声明展示约束
const FIELDS = Object.fromEntries(
  defineOntologyFields([
    'StaffBasicInformation.xm',
    'Business.vote.judgeAccountNo',
    'Business.vote.groupName',
    'Business.vote.judgeAccountStatus',
  ]).map((field) => [field.fieldRef, field]),
)

// 状态语义映射：一律落在设计系统六色内（灰/蓝/绿/橙/红/青）
const STATUS_TONE = { 正常: 'green', 待激活: 'orange', 已停用: 'gray' }
const STATUS_OPTIONS = ['正常', '待激活', '已停用']
const GROUP_OPTIONS = ['理工组', '人文组', '综合组', '辅导员组']

const INITIAL = [
  { id: 'ja-01', name: '马新华', account: 'jxpg-mxh', group: '理工组', status: '正常', lastLogin: '2026-10-09 08:40' },
  { id: 'ja-02', name: '陈立群', account: 'jxpg-clq', group: '理工组', status: '正常', lastLogin: '2026-10-09 09:02' },
  { id: 'ja-03', name: '林静怡', account: 'jxpg-ljy', group: '人文组', status: '正常', lastLogin: '2026-10-08 15:21' },
  { id: 'ja-04', name: '何志远', account: 'jxpg-hzy', group: '综合组', status: '待激活', lastLogin: '—' },
  { id: 'ja-05', name: '王慧', account: 'jxpg-wh', group: '辅导员组', status: '已停用', lastLogin: '2026-09-28 10:15' },
]

function JudgeAccountPage() {
  const [draftFilters, setDraftFilters] = useState({ keyword: '', group: '', status: '' })
  const [filters, setFilters] = useState({ keyword: '', group: '', status: '' })
  const [rows, setRows] = useState(INITIAL)
  const [editing, setEditing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [form, setForm] = useState({ name: '', account: '', group: '理工组' })
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const visible = useMemo(() => rows.filter((row) => {
    if (filters.keyword && !`${row.name}${row.account}`.includes(filters.keyword.trim())) return false
    if (filters.group && row.group !== filters.group) return false
    if (filters.status && row.status !== filters.status) return false
    return true
  }), [rows, filters])

  const openCreate = () => {
    setForm({ name: '', account: '', group: '理工组' })
    setEditing(true)
  }

  const submit = () => {
    if (!form.name.trim()) {
      notify('请输入评委姓名')
      return
    }
    if (!form.account.trim()) {
      notify('请输入评委账号')
      return
    }
    setRows((previous) => [{
      id: `ja-${Date.now()}`,
      name: form.name.trim(),
      account: form.account.trim(),
      group: form.group,
      status: '待激活',
      lastLogin: '—',
    }, ...previous])
    setEditing(false)
    notify('已新增评委账号')
  }

  const toggleStatus = (record) => {
    const next = record.status === '已停用' ? '正常' : '已停用'
    setRows((previous) => previous.map((row) => (row.id === record.id ? { ...row, status: next } : row)))
    notify(next === '正常' ? `已启用 ${record.name} 的账号` : `已停用 ${record.name} 的账号`)
  }

  const confirmImport = () => {
    if (!importFile) {
      notify('请先选择导入文件')
      return
    }
    setRows((previous) => [
      { id: `ja-${Date.now()}`, name: '赵敏', account: 'jxpg-zm', group: '理工组', status: '待激活', lastLogin: '—' },
      { id: `ja-${Date.now() + 1}`, name: '孙浩', account: 'jxpg-sh', group: '人文组', status: '待激活', lastLogin: '—' },
      ...previous,
    ])
    setImporting(false)
    setImportFile(null)
    notify('已导入 2 个评委账号')
  }

  const renderCard = (card) => {
    const record = card.record
    return (
      <DSCard
        key={record.id}
        className="ja-card"
        title={record.name}
        status={record.status}
        statusTone={STATUS_TONE[record.status] || 'gray'}
        fields={[
          { label: FIELDS['Business.vote.judgeAccountNo'].label, value: record.account },
          { label: FIELDS['Business.vote.groupName'].label, value: record.group },
          { label: '最近登录', value: record.lastLogin },
        ]}
        actions={[
          { key: 'reset', label: '重置密码', onClick: () => notify(`已重置 ${record.name} 的密码（演示）`) },
          { key: 'toggle', label: record.status === '已停用' ? '启用' : '停用', onClick: () => toggleStatus(record) },
        ]}
      />
    )
  }

  return (
    <main className="judge-account-page" data-ds-business-page="judge-account">
      <DSCardListTemplate
        className="ja-shell"
        tabs={[{ key: 'all', label: '全部账号' }, { key: 'pending', label: '待激活' }]}
        activeTab="all"
        metaLabel=""
        metaValue=""
        filterProps={{
          fields: [
            {
              key: 'keyword',
              label: '姓名 / 账号',
              placeholder: '请输入姓名或账号',
              controlledValue: draftFilters.keyword,
              onChange: (event) => setDraftFilters((previous) => ({ ...previous, keyword: event.target?.value ?? event })),
            },
            {
              key: 'group',
              label: FIELDS['Business.vote.groupName'].label,
              type: 'select',
              options: [{ label: '全部', value: '' }, ...GROUP_OPTIONS.map((item) => ({ label: item, value: item }))],
              controlledValue: draftFilters.group,
              onChange: (value) => setDraftFilters((previous) => ({ ...previous, group: value })),
            },
            {
              key: 'status',
              label: FIELDS['Business.vote.judgeAccountStatus'].label,
              type: 'select',
              options: [{ label: '全部', value: '' }, ...STATUS_OPTIONS.map((item) => ({ label: item, value: item }))],
              controlledValue: draftFilters.status,
              onChange: (value) => setDraftFilters((previous) => ({ ...previous, status: value })),
            },
          ],
          collapsedRows: 1,
          showExpand: false,
          showMore: false,
          onSearch: () => setFilters(draftFilters),
          onReset: () => {
            const empty = { keyword: '', group: '', status: '' }
            setDraftFilters(empty)
            setFilters(empty)
          },
        }}
        toolbarActions={[
          { key: 'create', label: '新增评委账号', variant: 'primary', onClick: openCreate },
          { key: 'import', label: '批量导入', onClick: () => setImporting(true) },
        ]}
        tableTools={<span />}
        cards={visible.map((record) => ({ id: record.id, record }))}
        renderCard={renderCard}
        empty={<DSEmptyState title="暂无符合条件的评委账号" />}
        pagination={{ total: visible.length, totalPages: 1, current: 1, pageSize: 12 }}
      />

      <DSModal open={editing} title="新增评委账号" okText="保存" cancelText="取消" onOk={submit} onCancel={() => setEditing(false)}>
        <DSEditForm columns={1}>
          <DSEditField label={FIELDS['StaffBasicInformation.xm'].label} required htmlFor="ja-name">
            <DSInput id="ja-name" value={form.name} placeholder="请输入评委姓名" onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} />
          </DSEditField>
          <DSEditField label={FIELDS['Business.vote.judgeAccountNo'].label} required htmlFor="ja-account">
            <DSInput id="ja-account" value={form.account} placeholder="请输入评委账号" onChange={(event) => setForm((previous) => ({ ...previous, account: event.target.value }))} />
          </DSEditField>
          <DSEditField label={FIELDS['Business.vote.groupName'].label} required htmlFor="ja-group">
            <DSSelect id="ja-group" value={form.group} options={GROUP_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={(value) => setForm((previous) => ({ ...previous, group: value }))} />
          </DSEditField>
        </DSEditForm>
      </DSModal>

      <DSModal open={importing} title="批量导入评委账号" okText="开始导入" cancelText="取消" onOk={confirmImport} onCancel={() => { setImporting(false); setImportFile(null) }}>
        <DSImportUpload
          file={importFile}
          onTemplateDownload={() => notify('已下载评委账号导入模板')}
          onChange={(event) => setImportFile((event && event.target && event.target.files && event.target.files[0]) || null)}
          description="请按模板填写评委姓名、账号与所属分组后上传"
        />
      </DSModal>

      {toast ? <div className="ja-toast" role="status" aria-live="polite">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<JudgeAccountPage />)
