import { createRoot } from 'react-dom/client'
import { useMemo, useState } from 'react'
import {
  DSEditField,
  DSEditForm,
  DSInput,
  DSModal,
  DSRegularListTemplate,
  DSTag,
} from '@wisedu/design-system'
import { defineOntologyFields, defineTableColumns } from '@wisedu/hr-domain/fields'
import './quota-set.css'

const PAGE_GENERATION_CONTRACT = 'v1'

const F = Object.fromEntries(defineOntologyFields([
  'Business.vote.quotaItemName',
  'Business.vote.groupName',
  'Business.vote.minVotes',
  'Business.vote.maxVotes',
]).map((field) => [field.fieldRef, field]))

const INITIAL = [
  { id: 'q1', item: '师德师风', group: '理工组', min: 0, max: 3, active: true },
  { id: 'q2', item: '教学业绩', group: '理工组', min: 1, max: 4, active: true },
  { id: 'q3', item: '科研业绩', group: '理工组', min: 1, max: 4, active: true },
  { id: 'q4', item: '师德师风', group: '人文组', min: 0, max: 2, active: false },
  { id: 'q5', item: '教学业绩', group: '人文组', min: 1, max: 3, active: false },
]

function QuotaSetPage() {
  const [rows, setRows] = useState(INITIAL)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  const visible = useMemo(() => rows, [rows])

  const columns = defineTableColumns([
    { fieldRef: 'Business.vote.quotaItemName', product: { width: 200, render: (_, record) => record.item } },
    { fieldRef: 'Business.vote.groupName', product: { width: 140, render: (_, record) => record.group } },
    { fieldRef: 'Business.vote.minVotes', product: { width: 120, align: 'right', render: (_, record) => record.min } },
    { fieldRef: 'Business.vote.maxVotes', product: { width: 120, align: 'right', render: (_, record) => record.max } },
    { fieldRef: 'Business.vote.projectStatus', product: { width: 120, render: (_, record) => <DSTag tone={record.active ? 'blue' : 'gray'}>{record.active ? '本轮生效' : '未生效'}</DSTag> } },
  ])

  const openEdit = (record) => {
    setEditing(record)
    setForm({ item: record.item, group: record.group, min: String(record.min), max: String(record.max) })
  }

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }))

  const submit = () => {
    const min = Number(form.min)
    const max = Number(form.max)
    if (Number.isNaN(min) || Number.isNaN(max)) {
      notify('请输入有效的票数')
      return
    }
    if (min > max) {
      notify('本轮投票有限额，请修改')
      return
    }
    if (max > 6) {
      notify('该组可投同意票数已达上限')
      return
    }
    setRows((previous) => previous.map((row) => (row.id === editing.id ? { ...row, min, max } : row)))
    setEditing(null)
    notify('限额已保存')
  }

  return (
    <main className="quota-set-page" data-ds-business-page="quota-set">
      <DSRegularListTemplate
        tabs={[{ key: 'all', label: '全部限额' }, { key: 'active', label: '本轮生效' }]}
        activeTab="all"
        metaLabel=""
        metaValue=""
        notice="限额为分项票数的上下限；同一分组内各项限额之和不得超过该组可用票数。"
        filterProps={false}
        toolbarActions={[{ key: 'create', label: '新增限额', variant: 'primary', onClick: () => notify('新增限额（演示）') }]}
        tableTools={false}
        summary={<span>{`共 ${visible.length} 条限额规则`}</span>}
        footerActions={[]}
        tableProps={{
          columns,
          data: visible,
          rowKey: 'id',
          selectable: false,
          showIndex: true,
          minWidth: 720,
          actions: [{ key: 'edit', label: '编辑', onClick: openEdit }],
          actionsPosition: 'right',
          actionsMaxVisible: 1,
          actionFixed: true,
          emptyText: '暂无限额设置',
        }}
        pagination={{ pageSize: 10 }}
      />

      <DSModal open={Boolean(editing)} title="编辑限额" okText="保存" cancelText="取消" onOk={submit} onCancel={() => setEditing(null)}>
        {form ? (
          <DSEditForm columns={1}>
            <DSEditField label={F['Business.vote.quotaItemName'].label} required htmlFor="qs-item">
              <DSInput id="qs-item" value={form.item} placeholder="请输入分项名称" onChange={(event) => update('item', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.groupName'].label} required htmlFor="qs-group">
              <DSInput id="qs-group" value={form.group} placeholder="请输入分组名称" onChange={(event) => update('group', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.minVotes'].label} htmlFor="qs-min">
              <DSInput id="qs-min" type="number" value={form.min} onChange={(event) => update('min', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.maxVotes'].label} htmlFor="qs-max" help="单组上限为 6 票">
              <DSInput id="qs-max" type="number" value={form.max} onChange={(event) => update('max', event.target.value)} />
            </DSEditField>
          </DSEditForm>
        ) : null}
      </DSModal>

      {toast ? <div className="qs-toast" role="status" aria-live="polite">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<QuotaSetPage />)
