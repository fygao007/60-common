import { createRoot } from 'react-dom/client'
import { useMemo, useState } from 'react'
import {
  DSRegularListTemplate,
  DSTag,
} from '@wisedu/design-system'
import { defineOntologyFields, defineTableColumns } from '@wisedu/hr-domain/fields'
import './report.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 字段一律回溯 ontology 单源（AGENTS.md 字段铁律），页面只声明展示约束
const F = Object.fromEntries(
  defineOntologyFields([
    'Business.vote.reportName',
    'Business.vote.reportType',
    'Business.vote.reportTemplate',
  ]).map((field) => [field.fieldRef, field]),
)

// 类型语义映射：一律落在设计系统六色内（灰/蓝/绿/橙/红/青）
const TYPE_TONE = { 结果报表: 'blue', 明细报表: 'gray', 统计报表: 'teal', 排名报表: 'gray' }
const TYPE_OPTIONS = ['结果报表', '明细报表', '统计报表', '排名报表']

const INITIAL = [
  { id: 'rp-01', name: '投票结果汇总表', type: '结果报表', template: '标准结果模板', owner: '评审办公室' },
  { id: 'rp-02', name: '评委投票明细表', type: '明细报表', template: '明细结果模板', owner: '评审办公室' },
  { id: 'rp-03', name: '分组得票统计表', type: '统计报表', template: '分组汇总模板', owner: '评审办公室' },
  { id: 'rp-04', name: '候选人得分排名表', type: '排名报表', template: '排名模板', owner: '评审办公室' },
]

function ReportPage() {
  const [draft, setDraft] = useState({ keyword: '', type: '' })
  const [filters, setFilters] = useState({ keyword: '', type: '' })
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const visible = useMemo(() => INITIAL.filter((row) => {
    if (filters.keyword && !row.name.includes(filters.keyword.trim())) return false
    if (filters.type && row.type !== filters.type) return false
    return true
  }), [filters])

  const columns = defineTableColumns([
    { fieldRef: 'Business.vote.reportName', product: { width: 240, render: (_, record) => record.name } },
    { fieldRef: 'Business.vote.reportType', product: { width: 140, render: (_, record) => <DSTag tone={TYPE_TONE[record.type] || 'gray'}>{record.type}</DSTag> } },
    { fieldRef: 'Business.vote.reportTemplate', product: { width: 220, render: (_, record) => record.template } },
    { fieldRef: 'Business.vote.reportType', product: { width: 160, render: (_, record) => record.owner } },
  ])

  return (
    <main className="report-page" data-ds-business-page="report">
      <DSRegularListTemplate
        tabs={[{ key: 'all', label: '全部报表' }]}
        activeTab="all"
        metaLabel=""
        metaValue=""
        notice="报表基于当前投票项目的实时数据生成；导出格式统一为 Excel，含表头与统计口径说明。"
        filterProps={{
          fields: [
            { key: 'keyword', label: F['Business.vote.reportName'].label, placeholder: '请输入报表名称', controlledValue: draft.keyword, onChange: (event) => setDraft((previous) => ({ ...previous, keyword: event.target?.value ?? event })) },
            {
              key: 'type',
              label: F['Business.vote.reportType'].label,
              type: 'select',
              options: [{ label: '全部', value: '' }, ...TYPE_OPTIONS.map((item) => ({ label: item, value: item }))],
              controlledValue: draft.type,
              onChange: (value) => setDraft((previous) => ({ ...previous, type: value })),
            },
          ],
          collapsedRows: 1,
          showExpand: false,
          showMore: false,
          onSearch: () => setFilters(draft),
          onReset: () => {
            const empty = { keyword: '', type: '' }
            setDraft(empty)
            setFilters(empty)
          },
        }}
        toolbarActions={[
          { key: 'generate', label: '生成报表', variant: 'primary', onClick: () => notify('已按当前投票数据生成报表') },
          { key: 'export', label: '批量导出', onClick: () => notify('已导出全部报表（演示）') },
        ]}
        tableTools={false}
        summary={<span>{`共 ${visible.length} 张报表`}</span>}
        footerActions={[]}
        tableProps={{
          columns,
          data: visible,
          rowKey: 'id',
          selectable: false,
          showIndex: true,
          minWidth: 820,
          actions: [
            { key: 'preview', label: '预览', onClick: (record) => notify(`预览《${record.name}》`) },
            { key: 'download', label: '下载', onClick: (record) => notify(`已下载《${record.name}》`) },
          ],
          actionsPosition: 'right',
          actionsMaxVisible: 2,
          actionFixed: true,
          emptyText: '暂无符合条件的报表',
        }}
        pagination={{ pageSize: 10 }}
      />

      {toast ? <div className="rp-toast" role="status" aria-live="polite">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<ReportPage />)
