import { createRoot } from 'react-dom/client'

export const PAGE_GENERATION_CONTRACT = 'v1'
export const PAGE_TEMPLATE = 'react-business-page'
import { useMemo, useState } from 'react'
import { DSButton, DSRegularListTemplate } from '@wisedu/design-system'
import { CATEGORY_LABELS, CATEGORIES, RECORDS, remainDays } from './warning-data.js'
import './warning-record.css'

// 预警记录台账：纯只读（需求卡确认），默认触发时间倒序（数据源已排序）
// 不做紧急程度分级：剩余天数仅数字展示（需求卡确认）
function StatusDot({ value }) {
  const tone = value === '已处理' ? 'is-done' : 'is-warn'
  return (
    <span className={`wr-status ${tone}`}>
      <i aria-hidden="true" />
      {value}
    </span>
  )
}

function triggerDownload(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function csvCell(value) {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function buildCsv(rows) {
  const headers = ['姓名', '所在单位', '预警事项', '到期日期', '剩余天数（天）', '处理状态', '触发时间']
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push([
      row.name, row.unit, CATEGORY_LABELS[row.category], row.expireDate,
      remainDays(row), row.status, row.triggerTime,
    ].map(csvCell).join(','))
  }
  return '﻿' + lines.join('\r\n')
}

function WarningRecordPage() {
  const [filters, setFilters] = useState({ category: '全部', status: '全部', keyword: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [toast, setToast] = useState('')

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }

  const visible = useMemo(() => RECORDS.filter((row) => {
    if (filters.category !== '全部' && CATEGORY_LABELS[row.category] !== filters.category) return false
    if (filters.status !== '全部' && row.status !== filters.status) return false
    if (filters.keyword && !row.name.includes(filters.keyword.trim())) return false
    return true
  }), [filters])

  const paged = useMemo(() => visible.slice((currentPage - 1) * pageSize, currentPage * pageSize), [visible, currentPage])

  const columns = [
    { key: 'name', dataIndex: 'name', title: '姓名', width: 100 },
    { key: 'unit', dataIndex: 'unit', title: '所在单位', width: 190 },
    { key: 'category', dataIndex: 'category', title: '预警事项', width: 120, render: (value) => CATEGORY_LABELS[value] || value },
    { key: 'expireDate', dataIndex: 'expireDate', title: '到期日期', width: 120 },
    { key: 'remainDays', dataIndex: 'remainDays', title: '剩余天数（天）', width: 120, render: (_, record) => remainDays(record) },
    { key: 'status', dataIndex: 'status', title: '处理状态', width: 100, render: (value) => <StatusDot value={value} /> },
    { key: 'triggerTime', dataIndex: 'triggerTime', title: '触发时间', width: 160 },
  ]

  const filterProps = useMemo(() => ({
    fields: [
      { key: 'category', label: '预警事项', type: 'select', options: ['全部', ...CATEGORIES.map((item) => item.label)], controlledValue: filters.category, onChange: (value) => { setFilters((prev) => ({ ...prev, category: value })); setCurrentPage(1) } },
      { key: 'status', label: '处理状态', type: 'select', options: ['全部', '未处理', '已处理'], controlledValue: filters.status, onChange: (value) => { setFilters((prev) => ({ ...prev, status: value })); setCurrentPage(1) } },
      { key: 'keyword', label: '姓名', controlledValue: filters.keyword, placeholder: '请输入姓名', onChange: (event) => setFilters((prev) => ({ ...prev, keyword: event.target?.value ?? event })) },
    ],
    density: 'compact',
    columns: 4,
    defaultExpanded: true,
    showExpand: false,
    showMore: false,
    onReset: () => { setFilters({ category: '全部', status: '全部', keyword: '' }); setCurrentPage(1) },
    onSearch: () => notify(`查询完成，共 ${visible.length} 条`),
  }), [filters, visible.length])

  // 导出按钮：左对齐置于筛选区与表格之间（summary 区），主色蓝
  const summary = (
    <div className="wr-export-bar">
      <DSButton
        variant="primary"
        onClick={() => {
          if (!visible.length) return notify('当前没有可导出的预警记录')
          triggerDownload(`预警记录台账_${new Date().toISOString().slice(0, 10)}.csv`, buildCsv(visible), 'text/csv;charset=utf-8')
          notify(`已导出 ${visible.length} 条预警记录`)
        }}
      >
        导出
      </DSButton>
    </div>
  )

  return (
    <main className="wr-page" data-ds-business-page="warning-record">
      <DSRegularListTemplate
        tabs={[]}
        metaLabel=""
        metaValue=""
        notice=""
        filterProps={filterProps}
        toolbarActions={[]}
        tableTools={false}
        summary={summary}
        tableProps={{
          columns,
          data: paged,
          rowKey: 'id',
          actions: [],
          selectable: false,
          showIndex: false,
          bordered: false,
          minWidth: 910,
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

      {toast && <div className="wr-toast" role="status">{toast}</div>}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<WarningRecordPage />)
