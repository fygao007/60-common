import { createRoot } from 'react-dom/client'
import { useMemo, useState } from 'react'
import {
  DSRegularListTemplate,
  DSTag,
} from '@wisedu/design-system'
import { defineOntologyFields, defineTableColumns } from '@wisedu/hr-domain/fields'
import './result.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 字段一律回溯 ontology 单源（AGENTS.md 字段铁律），页面只声明展示约束
const F = Object.fromEntries(
  defineOntologyFields([
    'StaffBasicInformation.xm',
    'Business.vote.proposedPosition',
    'Business.vote.totalVotes',
    'Business.vote.agreeVotes',
    'Business.vote.disagreeVotes',
    'Business.vote.abstainVotes',
    'Business.vote.totalScore',
    'Business.vote.rankingNo',
    'Business.vote.voteResult',
  ]).map((field) => [field.fieldRef, field]),
)

// 结果语义映射：一律落在设计系统六色内（灰/蓝/绿/橙/红/青）
const RESULT_TONE = { 通过: 'green', 未通过: 'red', 待定: 'orange' }
const RESULT_OPTIONS = ['通过', '未通过', '待定']

const VOTE_ROWS = [
  { id: 'r-01', name: '马新华', position: '教授', total: 24, agree: 19, disagree: 3, abstain: 2, result: '通过' },
  { id: 'r-02', name: '陈立群', position: '副教授', total: 24, agree: 21, disagree: 1, abstain: 2, result: '通过' },
  { id: 'r-03', name: '林静怡', position: '副教授', total: 24, agree: 12, disagree: 9, abstain: 3, result: '待定' },
  { id: 'r-04', name: '何志远', position: '讲师', total: 24, agree: 8, disagree: 13, abstain: 3, result: '未通过' },
]

const SCORE_ROWS = [
  { id: 's-01', name: '陈立群', position: '副教授', score: 92.5, rank: 1, result: '通过' },
  { id: 's-02', name: '马新华', position: '教授', score: 89.4, rank: 2, result: '通过' },
  { id: 's-03', name: '林静怡', position: '副教授', score: 81.2, rank: 3, result: '待定' },
  { id: 's-04', name: '何志远', position: '讲师', score: 73.6, rank: 4, result: '未通过' },
]

function ResultPage() {
  const [tab, setTab] = useState('vote')
  const [draft, setDraft] = useState({ keyword: '', result: '' })
  const [filters, setFilters] = useState({ keyword: '', result: '' })

  const voteColumns = useMemo(() => defineTableColumns([
    { fieldRef: 'StaffBasicInformation.xm', product: { width: 140, render: (_, record) => record.name } },
    { fieldRef: 'Business.vote.proposedPosition', product: { width: 140, render: (_, record) => record.position } },
    { fieldRef: 'Business.vote.totalVotes', product: { width: 110, align: 'right', render: (_, record) => record.total } },
    { fieldRef: 'Business.vote.agreeVotes', product: { width: 110, align: 'right', render: (_, record) => record.agree } },
    { fieldRef: 'Business.vote.disagreeVotes', product: { width: 110, align: 'right', render: (_, record) => record.disagree } },
    { fieldRef: 'Business.vote.abstainVotes', product: { width: 110, align: 'right', render: (_, record) => record.abstain } },
    { fieldRef: 'Business.vote.voteResult', product: { width: 110, render: (_, record) => <DSTag tone={RESULT_TONE[record.result] || 'gray'}>{record.result}</DSTag> } },
  ]), [])

  const scoreColumns = useMemo(() => defineTableColumns([
    { fieldRef: 'StaffBasicInformation.xm', product: { width: 140, render: (_, record) => record.name } },
    { fieldRef: 'Business.vote.proposedPosition', product: { width: 140, render: (_, record) => record.position } },
    { fieldRef: 'Business.vote.totalScore', product: { width: 130, align: 'right', render: (_, record) => record.score.toFixed(1) } },
    { fieldRef: 'Business.vote.rankingNo', product: { width: 110, align: 'right', render: (_, record) => record.rank } },
    { fieldRef: 'Business.vote.voteResult', product: { width: 110, render: (_, record) => <DSTag tone={RESULT_TONE[record.result] || 'gray'}>{record.result}</DSTag> } },
  ]), [])

  const source = tab === 'vote' ? VOTE_ROWS : SCORE_ROWS

  const visible = useMemo(() => source.filter((row) => {
    if (filters.keyword && !row.name.includes(filters.keyword.trim())) return false
    if (filters.result && row.result !== filters.result) return false
    return true
  }), [source, filters])

  return (
    <main className="result-page" data-ds-business-page="result">
      <DSRegularListTemplate
        tabs={[
          { key: 'vote', label: '表决结果' },
          { key: 'score', label: '打分结果' },
        ]}
        activeTab={tab}
        onTabChange={setTab}
        metaLabel=""
        metaValue=""
        notice="结果按评审对象汇总展示；「待定」表示得票未达通过线但未构成否决，需进入第二轮投票。"
        filterProps={{
          fields: [
            { key: 'keyword', label: F['StaffBasicInformation.xm'].label, placeholder: '请输入候选人姓名', controlledValue: draft.keyword, onChange: (event) => setDraft((previous) => ({ ...previous, keyword: event.target?.value ?? event })) },
            {
              key: 'result',
              label: F['Business.vote.voteResult'].label,
              type: 'select',
              options: [{ label: '全部', value: '' }, ...RESULT_OPTIONS.map((item) => ({ label: item, value: item }))],
              controlledValue: draft.result,
              onChange: (value) => setDraft((previous) => ({ ...previous, result: value })),
            },
          ],
          collapsedRows: 1,
          showExpand: false,
          showMore: false,
          onSearch: () => setFilters(draft),
          onReset: () => {
            const empty = { keyword: '', result: '' }
            setDraft(empty)
            setFilters(empty)
          },
        }}
        toolbarActions={[{ key: 'export', label: '导出结果', variant: 'primary', onClick: () => setFilters(draft) }]}
        tableTools={false}
        summary={<span>{`共 ${visible.length} 位评审对象 · 通过 ${visible.filter((row) => row.result === '通过').length} 人`}</span>}
        footerActions={[]}
        tableProps={{
          columns: tab === 'vote' ? voteColumns : scoreColumns,
          data: visible,
          rowKey: 'id',
          selectable: false,
          showIndex: true,
          minWidth: 860,
          emptyText: '暂无符合条件的结果记录',
        }}
        pagination={{ pageSize: 10 }}
      />
    </main>
  )
}

createRoot(document.getElementById('app')).render(<ResultPage />)
