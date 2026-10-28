import { createRoot } from 'react-dom/client'
import { useMemo, useState } from 'react'
import {
  DSEditField,
  DSEditForm,
  DSInput,
  DSModal,
  DSRegularListTemplate,
  DSSelect,
  DSTag,
  DSTree,
} from '@wisedu/design-system'
import { defineOntologyFields, defineTableColumns } from '@wisedu/hr-domain/fields'
import './vote-item.css'

const PAGE_GENERATION_CONTRACT = 'v1'

const F = Object.fromEntries(defineOntologyFields([
  'Business.vote.itemName',
  'Business.vote.itemType',
  'Business.vote.itemLevel',
  'Business.vote.itemWeight',
  'Business.vote.itemMaxScore',
  'Business.vote.itemOrderNo',
]).map((field) => [field.fieldRef, field]))

const LEVELS = ['一级指标', '二级指标', '三级指标']
const TYPE_OPTIONS = ['打分', '选项']
const TYPE_TONE = { 打分: 'blue', 选项: 'teal' }

const TREE = [
  { key: '师德师风', title: '师德师风', children: [{ key: '政治素养', title: '政治素养' }, { key: '师德表现', title: '师德表现' }] },
  { key: '教学业绩', title: '教学业绩', children: [{ key: '课堂教学', title: '课堂教学' }, { key: '教学成果', title: '教学成果' }] },
  { key: '科研业绩', title: '科研业绩', children: [{ key: '论文著作', title: '论文著作' }, { key: '科研项目', title: '科研项目' }] },
]

const INITIAL = [
  { id: 'i1', name: '师德师风', level: '一级指标', type: '打分', weight: 0.2, max: 20, order: 1, parent: '-' },
  { id: 'i2', name: '教学业绩', level: '一级指标', type: '打分', weight: 0.3, max: 30, order: 2, parent: '-' },
  { id: 'i3', name: '科研业绩', level: '一级指标', type: '打分', weight: 0.3, max: 30, order: 3, parent: '-' },
  { id: 'i4', name: '课堂教学', level: '二级指标', type: '打分', weight: 0.15, max: 15, order: 1, parent: '教学业绩' },
  { id: 'i5', name: '教学成果', level: '二级指标', type: '打分', weight: 0.15, max: 15, order: 2, parent: '教学业绩' },
  { id: 'i6', name: '论文著作', level: '二级指标', type: '打分', weight: 0.2, max: 20, order: 3, parent: '科研业绩' },
  { id: 'i7', name: '是否推荐为学科带头人', level: '三级指标', type: '选项', weight: 0, max: 0, order: 1, parent: '论文著作' },
]

function VoteItemPage() {
  const [level, setLevel] = useState('一级指标')
  const [items, setItems] = useState(INITIAL)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2000)
  }

  const visible = useMemo(() => items.filter((item) => item.level === level), [items, level])

  const columns = defineTableColumns([
    { fieldRef: 'Business.vote.itemName', product: { width: 260, render: (_, record) => record.parent === '-' ? record.name : `${record.parent} / ${record.name}` } },
    { fieldRef: 'Business.vote.itemType', product: { width: 110, render: (_, record) => <DSTag tone={TYPE_TONE[record.type] || 'gray'}>{record.type}</DSTag> } },
    { fieldRef: 'Business.vote.itemWeight', product: { width: 100, align: 'right', render: (_, record) => (record.type === '打分' ? record.weight : '-') } },
    { fieldRef: 'Business.vote.itemMaxScore', product: { width: 100, align: 'right', render: (_, record) => (record.type === '打分' ? record.max : '-') } },
    { fieldRef: 'Business.vote.itemOrderNo', product: { width: 90, align: 'right', render: (_, record) => record.order } },
  ])

  const openEdit = (record) => {
    setEditing(record)
    setForm({ name: record.name, type: record.type, weight: String(record.weight), max: String(record.max), order: String(record.order), parent: record.parent === '-' ? '' : record.parent })
  }

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }))

  const submit = () => {
    if (!form.name.trim()) {
      notify('请输入指标名称')
      return
    }
    setItems((previous) => previous.map((item) => (item.id === editing.id ? {
      ...item,
      name: form.name.trim(),
      type: form.type,
      weight: Number(form.weight) || 0,
      max: Number(form.max) || 0,
      order: Number(form.order) || item.order,
      parent: form.parent || '-',
    } : item)))
    setEditing(null)
    notify('指标已保存')
  }

  const isScore = form ? form.type === '打分' : true

  return (
    <main className="vote-item-page" data-ds-business-page="vote-item">
      <DSRegularListTemplate
        tabs={LEVELS.map((item) => ({ key: item, label: item, count: items.filter((record) => record.level === item).length }))}
        activeTab={level}
        onTabChange={setLevel}
        metaLabel=""
        metaValue=""
        notice={null}
        filterProps={false}
        toolbarActions={[{ key: 'create', label: '新增指标', variant: 'primary', onClick: () => notify('新增指标（演示）') }]}
        tableTools={false}
        footerActions={[]}
        tableProps={{
          columns,
          data: visible,
          rowKey: 'id',
          selectable: false,
          showIndex: true,
          minWidth: 760,
          actions: [{ key: 'edit', label: '编辑', onClick: openEdit }],
          actionsPosition: 'right',
          actionsMaxVisible: 1,
          actionFixed: true,
          emptyText: '当前层级暂无指标',
        }}
        pagination={{ pageSize: 10 }}
      />

      <DSModal open={Boolean(editing)} title="编辑投票指标" okText="保存" cancelText="取消" size="large" onOk={submit} onCancel={() => setEditing(null)}>
        {form ? (
          <DSEditForm columns={2}>
            <DSEditField label={F['Business.vote.itemName'].label} required htmlFor="vi-name">
              <DSInput id="vi-name" value={form.name} placeholder="请输入指标名称" onChange={(event) => update('name', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.itemType'].label} required htmlFor="vi-type">
              <DSSelect id="vi-type" value={form.type} options={TYPE_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={(value) => update('type', value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.itemOrderNo'].label} htmlFor="vi-order">
              <DSInput id="vi-order" type="number" value={form.order} onChange={(event) => update('order', event.target.value)} />
            </DSEditField>
            {isScore ? (
              <DSEditField label={F['Business.vote.itemWeight'].label} htmlFor="vi-weight">
                <DSInput id="vi-weight" value={form.weight} placeholder="如 0.2" onChange={(event) => update('weight', event.target.value)} />
              </DSEditField>
            ) : null}
            {isScore ? (
              <DSEditField label={F['Business.vote.itemMaxScore'].label} htmlFor="vi-max">
                <DSInput id="vi-max" type="number" value={form.max} onChange={(event) => update('max', event.target.value)} />
              </DSEditField>
            ) : null}
            {!isScore ? (
              <DSEditField label="选项配置" htmlFor="vi-options" fullWidth help="类型为「选项」时按行配置可选值">
                <DSInput id="vi-options" value="推荐 / 不推荐" onChange={(event) => update('options', event.target.value)} />
              </DSEditField>
            ) : null}
            <DSEditField label="上级指标" fullWidth help="点击下方树节点选择，用于维护三级层级">
              <DSTree
                dataSource={TREE}
                selectedKey={form.parent}
                defaultExpandAll
                onSelect={(node) => update('parent', typeof node === 'string' ? node : (node && node.key) || '')}
              />
            </DSEditField>
          </DSEditForm>
        ) : null}
      </DSModal>

      {toast ? <div className="vi-toast" role="status" aria-live="polite">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<VoteItemPage />)
