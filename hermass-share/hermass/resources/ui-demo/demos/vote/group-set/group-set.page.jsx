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
import './group-set.css'

const PAGE_GENERATION_CONTRACT = 'v1'

const F = Object.fromEntries(defineOntologyFields([
  'Business.vote.groupName',
  'Business.vote.groupLeader',
  'Business.vote.groupPositionCount',
]).map((field) => [field.fieldRef, field]))

const INITIAL = [
  { id: 'g1', group: '理工组', leader: '马新华', positions: 12, scope: '电子与通信工程学院、人工智能学院' },
  { id: 'g2', group: '人文组', leader: '林静怡', positions: 8, scope: '经济学院、管理学院' },
  { id: 'g3', group: '综合组', leader: '何志远', positions: 6, scope: '机关职能部门' },
  { id: 'g4', group: '辅导员组', leader: '王慧', positions: 4, scope: '学生工作处' },
]

function GroupSetPage() {
  const [rows, setRows] = useState(INITIAL)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [batching, setBatching] = useState(false)
  const [batchCount, setBatchCount] = useState('')
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2000)
  }

  const visible = useMemo(() => rows, [rows])

  const columns = defineTableColumns([
    { fieldRef: 'Business.vote.groupName', product: { width: 160, render: (_, record) => record.group } },
    { fieldRef: 'Business.vote.groupLeader', product: { width: 120, render: (_, record) => record.leader } },
    { fieldRef: 'Business.vote.groupPositionCount', product: { width: 120, align: 'right', render: (_, record) => `${record.positions} 个` } },
    { fieldRef: 'Business.vote.objectScope', product: { width: 260, render: (_, record) => record.scope } },
    { fieldRef: 'Business.vote.judgeAccountStatus', product: { width: 120, render: (_, record) => <DSTag tone={record.positions > 0 ? 'blue' : 'gray'}>{record.positions > 0 ? '已设岗' : '未设岗'}</DSTag> } },
  ])

  const openEdit = (record) => {
    setEditing(record)
    setForm({ group: record.group, leader: record.leader, positions: String(record.positions) })
  }

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }))

  const submit = () => {
    const positions = Number(form.positions)
    if (Number.isNaN(positions) || positions < 0) {
      notify('请输入有效的岗位数量')
      return
    }
    setRows((previous) => previous.map((row) => (row.id === editing.id ? { ...row, group: form.group, leader: form.leader, positions } : row)))
    setEditing(null)
    notify('分组已保存')
  }

  const submitBatch = () => {
    const count = Number(batchCount)
    if (Number.isNaN(count) || count < 0) {
      notify('请输入有效的岗位数量')
      return
    }
    setRows((previous) => previous.map((row) => ({ ...row, positions: count })))
    setBatching(false)
    setBatchCount('')
    notify(`已将全部 ${rows.length} 个分组的岗位数批量设为 ${count}`)
  }

  return (
    <main className="group-set-page" data-ds-business-page="group-set">
      <DSRegularListTemplate
        tabs={[{ key: 'all', label: '全部分组' }, { key: 'unset', label: '未设岗' }]}
        activeTab="all"
        metaLabel=""
        metaValue=""
        notice="分组用于限额与岗位归属；岗位数量决定该组可分配的评审名额。"
        filterProps={false}
        toolbarActions={[
          { key: 'create', label: '新增分组', variant: 'primary', onClick: () => notify('新增分组（演示）') },
          { key: 'batch', label: '批量设置岗位数', onClick: () => setBatching(true) },
        ]}
        tableTools={false}
        summary={<span>{`共 ${visible.length} 个分组 · 岗位合计 ${visible.reduce((sum, row) => sum + row.positions, 0)} 个`}</span>}
        footerActions={[]}
        tableProps={{
          columns,
          data: visible,
          rowKey: 'id',
          selectable: false,
          showIndex: true,
          minWidth: 860,
          actions: [{ key: 'edit', label: '编辑', onClick: openEdit }],
          actionsPosition: 'right',
          actionsMaxVisible: 1,
          actionFixed: true,
          emptyText: '暂无分组',
        }}
        pagination={{ pageSize: 10 }}
      />

      <DSModal open={Boolean(editing)} title="编辑分组设岗" okText="保存" cancelText="取消" onOk={submit} onCancel={() => setEditing(null)}>
        {form ? (
          <DSEditForm columns={1}>
            <DSEditField label={F['Business.vote.groupName'].label} required htmlFor="gs-group">
              <DSInput id="gs-group" value={form.group} placeholder="请输入分组名称" onChange={(event) => update('group', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.groupLeader'].label} htmlFor="gs-leader">
              <DSInput id="gs-leader" value={form.leader} placeholder="请输入组长姓名" onChange={(event) => update('leader', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.groupPositionCount'].label} htmlFor="gs-positions">
              <DSInput id="gs-positions" type="number" value={form.positions} onChange={(event) => update('positions', event.target.value)} />
            </DSEditField>
          </DSEditForm>
        ) : null}
      </DSModal>

      <DSModal open={batching} title="批量设置岗位数" okText="应用" cancelText="取消" onOk={submitBatch} onCancel={() => { setBatching(false); setBatchCount('') }}>
        <DSEditForm columns={1}>
          <DSEditField label={F['Business.vote.groupPositionCount'].label} help={`将统一应用到全部 ${rows.length} 个分组`} htmlFor="gs-batch">
            <DSInput id="gs-batch" type="number" value={batchCount} placeholder="请输入岗位数量" onChange={(event) => setBatchCount(event.target.value)} />
          </DSEditField>
        </DSEditForm>
      </DSModal>

      {toast ? <div className="gs-toast" role="status" aria-live="polite">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<GroupSetPage />)
