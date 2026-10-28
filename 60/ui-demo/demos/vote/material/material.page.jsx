import { createRoot } from 'react-dom/client'
import { useMemo, useState } from 'react'
import {
  DSEditField,
  DSEditForm,
  DSImportUpload,
  DSModal,
  DSRegularListTemplate,
  DSSelect,
  DSTag,
  DSUpload,
} from '@wisedu/design-system'
import { defineOntologyFields, defineTableColumns } from '@wisedu/hr-domain/fields'
import './material.css'

const PAGE_GENERATION_CONTRACT = 'v1'

const F = Object.fromEntries(defineOntologyFields([
  'StaffBasicInformation.xm',
  'Business.vote.materialType',
  'Business.vote.materialUploadTime',
]).map((field) => [field.fieldRef, field]))

const TYPE_OPTIONS = ['述职报告', '佐证材料', '学历学位', '业绩证明']
const TYPE_TONE = { 述职报告: 'blue', 佐证材料: 'teal', 学历学位: 'gray', 业绩证明: 'gray' }

const INITIAL = [
  { id: 'm1', name: '马新华', type: '述职报告', file: '马新华-述职报告.pdf', time: '2026-10-08 09:12' },
  { id: 'm2', name: '马新华', type: '佐证材料', file: '教改项目结题证书.pdf', time: '2026-10-08 09:14' },
  { id: 'm3', name: '林静怡', type: '述职报告', file: '林静怡-述职报告.pdf', time: '2026-10-08 10:02' },
  { id: 'm4', name: '何志远', type: '学历学位', file: '博士学位证书.pdf', time: '2026-10-08 11:35' },
  { id: 'm5', name: '王慧', type: '业绩证明', file: '横向课题合同.pdf', time: '2026-10-08 14:20' },
]

function MaterialPage() {
  const [rows, setRows] = useState(INITIAL)
  const [draft, setDraft] = useState({ keyword: '', type: '' })
  const [filters, setFilters] = useState({ keyword: '', type: '' })
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState('述职报告')
  const [files, setFiles] = useState([])
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const visible = useMemo(() => rows.filter((row) => {
    if (filters.keyword && !row.name.includes(filters.keyword.trim())) return false
    if (filters.type && row.type !== filters.type) return false
    return true
  }), [rows, filters])

  const columns = defineTableColumns([
    { fieldRef: 'StaffBasicInformation.xm', product: { width: 110, render: (_, record) => record.name } },
    { fieldRef: 'Business.vote.materialType', product: { width: 130, render: (_, record) => <DSTag tone={TYPE_TONE[record.type] || 'gray'}>{record.type}</DSTag> } },
    { fieldRef: 'StaffBasicInformation.fj', product: { width: 280, render: (_, record) => record.file } },
    { fieldRef: 'Business.vote.materialUploadTime', product: { width: 180, render: (_, record) => record.time } },
  ])

  const submitUpload = () => {
    if (!files.length) {
      notify('请先选择要上传的材料文件')
      return
    }
    setRows((previous) => [
      ...files.map((item, index) => ({
        id: `m-${Date.now()}-${index}`,
        name: '当前候选人',
        type: uploadType,
        file: (item && (item.name || item.fileName)) || '未命名文件',
        time: new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16),
      })),
      ...previous,
    ])
    setUploading(false)
    setFiles([])
    notify('材料已上传')
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
    <main className="material-page" data-ds-business-page="material">
      <DSRegularListTemplate
        tabs={[{ key: 'all', label: '全部材料' }, { key: 'report', label: '述职报告' }]}
        activeTab="all"
        metaLabel=""
        metaValue=""
        notice={false}
        filterProps={{
          fields: [
            { key: 'keyword', label: '候选人', placeholder: '请输入姓名', controlledValue: draft.keyword, onChange: (event) => setDraft((previous) => ({ ...previous, keyword: event.target?.value ?? event })) },
            { key: 'type', label: F['Business.vote.materialType'].label, type: 'select', options: [{ label: '全部', value: '' }, ...TYPE_OPTIONS.map((item) => ({ label: item, value: item }))], controlledValue: draft.type, onChange: (value) => setDraft((previous) => ({ ...previous, type: value })) },
          ],
          collapsedRows: 1,
          showExpand: false,
          showMore: false,
          onSearch: () => setFilters(draft),
          onReset: () => { const empty = { keyword: '', type: '' }; setDraft(empty); setFilters(empty) },
        }}
        toolbarActions={[
          { key: 'upload', label: '上传材料', variant: 'primary', onClick: () => setUploading(true) },
          { key: 'import', label: '批量导入', onClick: () => setImporting(true) },
        ]}
        tableTools={false}
        summary={<span>{`共 ${visible.length} 份材料`}</span>}
        footerActions={[]}
        tableProps={{
          columns,
          data: visible,
          rowKey: 'id',
          selectable: false,
          showIndex: true,
          minWidth: 800,
          actions: [{ key: 'preview', label: '预览', onClick: (record) => notify(`正在预览 ${record.file}`) }],
          actionsPosition: 'right',
          actionsMaxVisible: 1,
          actionFixed: true,
          emptyText: '暂无材料',
        }}
        pagination={{ pageSize: 10 }}
      />

      <DSModal open={uploading} title="上传候选人材料" okText="上传" cancelText="取消" onOk={submitUpload} onCancel={() => { setUploading(false); setFiles([]) }}>
        <DSEditForm columns={1}>
          <DSEditField label={F['Business.vote.materialType'].label} required htmlFor="mt-type">
            <DSSelect id="mt-type" value={uploadType} options={TYPE_OPTIONS.map((item) => ({ label: item, value: item }))} onChange={setUploadType} />
          </DSEditField>
          <DSEditField label="材料文件" fullWidth help="支持 PDF / Word / 图片，单个不超过 20MB">
            <DSUpload multiple listType="text" accept=".pdf,.doc,.docx,.jpg,.png" maxCount={10} files={files} onChange={setFiles} onPreview={(file) => notify(`预览 ${(file && file.name) || '文件'}`)} />
          </DSEditField>
        </DSEditForm>
      </DSModal>

      <DSModal open={importing} title="批量导入材料清单" okText="开始导入" cancelText="取消" onOk={runImport} onCancel={() => { setImporting(false); setImportFile(null) }}>
        <DSImportUpload
          file={importFile}
          onTemplateDownload={() => notify('已下载材料清单模板')}
          onChange={(event) => setImportFile((event && event.target && event.target.files && event.target.files[0]) || null)}
        />
      </DSModal>

      {toast ? <div className="mt-toast" role="status" aria-live="polite">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<MaterialPage />)
