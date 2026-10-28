import { createRoot } from 'react-dom/client'
import { useMemo, useState } from 'react'
import {
  DSRegularListTemplate,
  DSTag,
} from '@wisedu/design-system'
import { defineOntologyFields, defineTableColumns } from '@wisedu/hr-domain/fields'
import './progress.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 字段一律回溯 ontology 单源（AGENTS.md 字段铁律），页面只声明展示约束
const F = Object.fromEntries(
  defineOntologyFields([
    'StaffBasicInformation.xm',
    'Business.vote.groupName',
    'Business.vote.submitStatus',
    'Business.vote.submitTime',
    'Business.vote.voteProjectName',
  ]).map((field) => [field.fieldRef, field]),
)

// 状态语义映射：一律落在设计系统六色内（灰/蓝/绿/橙/红/青）
const SUBMIT_TONE = { 已提交: 'green', 未提交: 'orange', 草稿: 'gray' }
const SUBMIT_OPTIONS = ['已提交', '未提交', '草稿']
const GROUP_OPTIONS = ['理工组', '人文组', '综合组', '辅导员组']

const INITIAL = [
  { id: 'pg-01', name: '马新华', group: '理工组', status: '已提交', time: '2026-10-08 09:12' },
  { id: 'pg-02', name: '陈立群', group: '理工组', status: '已提交', time: '2026-10-08 09:40' },
  { id: 'pg-03', name: '林静怡', group: '人文组', status: '已提交', time: '2026-10-08 10:05' },
  { id: 'pg-04', name: '何志远', group: '综合组', status: '草稿', time: '—' },
  { id: 'pg-05', name: '王慧', group: '辅导员组', status: '未提交', time: '—' },
  { id: 'pg-06', name: '周毅', group: '理工组', status: '未提交', time: '—' },
]

function ProgressPage() {
  const [tab, setTab] = useState('all')
  const [draft, setDraft] = useState({ keyword: '', group: '', status: '' })
  const [filters, setFilters] = useState({ keyword: '', group: '', status: '' })

  const visible = useMemo(() => INITIAL.filter((row) => {
    if (tab === 'submitted' && row.status !== '已提交') return false
    if (tab === 'pending' && row.status === '已提交') return false
    if (filters.keyword && !row.name.includes(filters.keyword.trim())) return false
    if (filters.group && row.group !== filters.group) return false
    if (filters.status && row.status !== filters.status) return false
    return true
  }), [tab, filters])

  const submitted = visible.filter((row) => row.status === '已提交').length
  const pending = visible.length - submitted
  const rate = visible.length ? `${Math.round((submitted / visible.length) * 100)}%` : '0%'

  const columns = defineTableColumns([
    { fieldRef: 'StaffBasicInformation.xm', product: { width: 140, render: (_, record) => record.name } },
    { fieldRef: 'Business.vote.groupName', product: { width: 140, render: (_, record) => record.group } },
    { fieldRef: 'Business.vote.submitStatus', product: { width: 130, render: (_, record) => <DSTag tone={SUBMIT_TONE[record.status] || 'gray'}>{record.status}</DSTag> } },
    { fieldRef: 'Business.vote.submitTime', product: { width: 200, render: (_, record) => record.time } },
  ])

  return (
    <main className="progress-page" data-ds-business-page="progress">
      <DSRegularListTemplate
        tabs={[
          { key: 'all', label: '全部评委' },
          { key: 'submitted', label: '已提交' },
          { key: 'pending', label: '未提交' },
        ]}
        activeTab={tab}
        onTabChange={setTab}
        metaLabel=""
        metaValue=""
        notice="本轮投票共 24 位评委，请在 2026-10-10 18:00 前完成提交；未提交的评委将在截止前 2 小时收到提醒。"
        filterProps={{
          fields: [
            { key: 'keyword', label: F['StaffBasicInformation.xm'].label, placeholder: '请输入评委姓名', controlledValue: draft.keyword, onChange: (event) => setDraft((previous) => ({ ...previous, keyword: event.target?.value ?? event })) },
            {
              key: 'group',
              label: F['Business.vote.groupName'].label,
              type: 'select',
              options: [{ label: '全部', value: '' }, ...GROUP_OPTIONS.map((item) => ({ label: item, value: item }))],
              controlledValue: draft.group,
              onChange: (value) => setDraft((previous) => ({ ...previous, group: value })),
            },
            {
              key: 'status',
              label: F['Business.vote.submitStatus'].label,
              type: 'select',
              options: [{ label: '全部', value: '' }, ...SUBMIT_OPTIONS.map((item) => ({ label: item, value: item }))],
              controlledValue: draft.status,
              onChange: (value) => setDraft((previous) => ({ ...previous, status: value })),
            },
          ],
          collapsedRows: 1,
          showExpand: false,
          showMore: false,
          onSearch: () => setFilters(draft),
          onReset: () => {
            const empty = { keyword: '', group: '', status: '' }
            setDraft(empty)
            setFilters(empty)
          },
        }}
        toolbarActions={[{ key: 'notify', label: '催办未提交', variant: 'primary', onClick: () => setFilters(draft) }]}
        tableTools={false}
        summary={<span>{`共 ${visible.length} 位 · 已提交 ${submitted} · 未提交 ${pending} · 完成率 ${rate}`}</span>}
        footerActions={[]}
        tableProps={{
          columns,
          data: visible,
          rowKey: 'id',
          selectable: false,
          showIndex: true,
          minWidth: 720,
          emptyText: '暂无符合条件的提交记录',
        }}
        pagination={{ pageSize: 10 }}
      />
    </main>
  )
}

createRoot(document.getElementById('app')).render(<ProgressPage />)
