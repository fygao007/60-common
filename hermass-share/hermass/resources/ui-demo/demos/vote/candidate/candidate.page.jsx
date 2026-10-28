import { createRoot } from 'react-dom/client'
import { useMemo, useState } from 'react'
import {
  DSEditField,
  DSEditForm,
  DSImportUpload,
  DSInput,
  DSModal,
  DSRegularListTemplate,
  DSTag,
} from '@wisedu/design-system'
import { defineOntologyFields, defineTableColumns } from '@wisedu/hr-domain/fields'
import './candidate.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 姓名 / 单位 / 职务 / 排序 / 备注 复用人员基本信息标准库；投票专属字段用 vote 扩展
const F = Object.fromEntries(defineOntologyFields([
  'StaffBasicInformation.xm',
  'StaffBasicInformation.szdwdm',
  'StaffBasicInformation.zyjszwdm',
  'StaffBasicInformation.px',
  'StaffBasicInformation.bz',
  'Business.vote.proposedPosition',
  'Business.vote.specialQuota',
]).map((field) => [field.fieldRef, field]))

const INITIAL = [
  { id: 'c1', name: '马新华', unit: '电子与通信工程学院', currentTitle: '副教授', proposed: '教授', special: false, order: 1, remark: '省级教学名师' },
  { id: 'c2', name: '林静怡', unit: '人工智能学院', currentTitle: '讲师', proposed: '副教授', special: false, order: 2, remark: '-' },
  { id: 'c3', name: '何志远', unit: '机电工程学院', currentTitle: '副教授', proposed: '教授', special: true, order: 3, remark: '高技能人才绿色通道' },
  { id: 'c4', name: '王慧', unit: '经济学院', currentTitle: '讲师', proposed: '副教授', special: false, order: 4, remark: '-' },
  { id: 'c5', name: '罗一凡', unit: '建筑工程学院', currentTitle: '助教', proposed: '讲师', special: false, order: 5, remark: '-' },
]

function CandidatePage() {
  const [rows, setRows] = useState(INITIAL)
  const [draft, setDraft] = useState({ keyword: '' })
  const [filters, setFilters] = useState({ keyword: '' })
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2000)
  }

  const visible = useMemo(() => rows.filter((row) => {
    if (!filters.keyword) return true
    const keyword = filters.keyword.trim()
    return row.name.includes(keyword) || row.unit.includes(keyword)
  }), [rows, filters])

  const columns = defineTableColumns([
    { fieldRef: 'StaffBasicInformation.xm', product: { width: 100, render: (_, record) => record.name } },
    { fieldRef: 'StaffBasicInformation.szdwdm', product: { width: 200, render: (_, record) => record.unit } },
    { fieldRef: 'StaffBasicInformation.zyjszwdm', product: { width: 120, render: (_, record) => record.currentTitle } },
    { fieldRef: 'Business.vote.proposedPosition', product: { width: 120, render: (_, record) => record.proposed } },
    { fieldRef: 'Business.vote.specialQuota', product: { width: 110, render: (_, record) => (record.special ? <DSTag tone="warning">特殊名额</DSTag> : '-') } },
    { fieldRef: 'StaffBasicInformation.px', product: { width: 90, align: 'right', render: (_, record) => record.order } },
    { fieldRef: 'StaffBasicInformation.bz', product: { width: 180, render: (_, record) => record.remark } },
  ])

  const openEdit = (record) => {
    setEditing(record)
    setForm({
      name: record.name,
      unit: record.unit,
      currentTitle: record.currentTitle,
      proposed: record.proposed,
      special: record.special,
      order: String(record.order),
      remark: record.remark === '-' ? '' : record.remark,
    })
  }

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }))

  const submit = () => {
    if (!form.name.trim()) {
      notify('请输入姓名')
      return
    }
    setRows((previous) => previous.map((row) => (row.id === editing.id ? {
      ...row,
      name: form.name.trim(),
      unit: form.unit,
      currentTitle: form.currentTitle,
      proposed: form.proposed,
      special: form.special,
      order: Number(form.order) || row.order,
      remark: form.remark.trim() || '-',
    } : row)))
    setEditing(null)
    notify('候选人已保存')
  }

  const runImport = () => {
    if (!importFile) {
      notify('请先选择导入文件')
      return
    }
    setImporting(false)
    setImportFile(null)
    notify('正在导入数据，请稍后...')
  }

  return (
    <main className="candidate-page" data-ds-business-page="candidate">
      <DSRegularListTemplate
        tabs={[{ key: 'all', label: '候选人名单' }, { key: 'special', label: '特殊名额' }]}
        activeTab="all"
        metaLabel=""
        metaValue=""
        notice={false}
        filterProps={{
          fields: [
            { key: 'keyword', label: '姓名 / 单位', placeholder: '请输入姓名或所在单位', controlledValue: draft.keyword, onChange: (event) => setDraft((previous) => ({ ...previous, keyword: event.target?.value ?? event })) },
          ],
          collapsedRows: 1,
          showExpand: false,
          showMore: false,
          onSearch: () => setFilters(draft),
          onReset: () => { const empty = { keyword: '' }; setDraft(empty); setFilters(empty) },
        }}
        toolbarActions={[
          { key: 'create', label: '新增候选人', variant: 'primary', onClick: () => notify('新增候选人（演示）') },
          { key: 'import', label: '批量导入', onClick: () => setImporting(true) },
        ]}
        tableTools={false}
        summary={<span>{`共 ${visible.length} 位候选人`}</span>}
        footerActions={[]}
        tableProps={{
          columns,
          data: visible,
          rowKey: 'id',
          selectable: false,
          showIndex: true,
          minWidth: 1000,
          actions: [{ key: 'edit', label: '编辑', onClick: openEdit }],
          actionsPosition: 'right',
          actionsMaxVisible: 1,
          actionFixed: true,
          emptyText: '暂无候选人',
        }}
        pagination={{ pageSize: 10 }}
      />

      <DSModal open={Boolean(editing)} title="编辑候选人" okText="保存" cancelText="取消" size="large" onOk={submit} onCancel={() => setEditing(null)}>
        {form ? (
          <DSEditForm columns={2}>
            <DSEditField label={F['StaffBasicInformation.xm'].label} required htmlFor="cd-name">
              <DSInput id="cd-name" value={form.name} placeholder="请输入姓名" onChange={(event) => update('name', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['StaffBasicInformation.szdwdm'].label} required htmlFor="cd-unit">
              <DSInput id="cd-unit" value={form.unit} placeholder="请输入所在单位" onChange={(event) => update('unit', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['StaffBasicInformation.zyjszwdm'].label} htmlFor="cd-current">
              <DSInput id="cd-current" value={form.currentTitle} placeholder="请输入现职务" onChange={(event) => update('currentTitle', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['Business.vote.proposedPosition'].label} htmlFor="cd-proposed">
              <DSInput id="cd-proposed" value={form.proposed} placeholder="请输入拟评聘职务" onChange={(event) => update('proposed', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['StaffBasicInformation.px'].label} htmlFor="cd-order">
              <DSInput id="cd-order" type="number" value={form.order} onChange={(event) => update('order', event.target.value)} />
            </DSEditField>
            <DSEditField label={F['StaffBasicInformation.bz'].label} htmlFor="cd-remark">
              <DSInput id="cd-remark" value={form.remark} placeholder="请输入备注" onChange={(event) => update('remark', event.target.value)} />
            </DSEditField>
          </DSEditForm>
        ) : null}
      </DSModal>

      <DSModal open={importing} title="批量导入候选人" okText="开始导入" cancelText="取消" onOk={runImport} onCancel={() => { setImporting(false); setImportFile(null) }}>
        <DSImportUpload
          file={importFile}
          onTemplateDownload={() => notify('已下载候选人导入模板')}
          onChange={(event) => setImportFile((event && event.target && event.target.files && event.target.files[0]) || null)}
        />
      </DSModal>

      {toast ? <div className="cd-toast" role="status" aria-live="polite">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<CandidatePage />)
