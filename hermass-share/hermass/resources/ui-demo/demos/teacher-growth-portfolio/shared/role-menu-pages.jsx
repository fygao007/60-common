import { useMemo, useState } from 'react'
import { DSButton, DSRegularListTemplate, DSTag } from '@wisedu/design-system'
import { teachers, computeScore } from './portfolio-foundation.js'
import { STAFF_FIELDS } from './ontology-adapter.js'

function statusTone(status) {
  if (/启用|完成|推荐|正常/.test(status)) return 'success'
  if (/预警|复核|待|进行/.test(status)) return 'warning'
  return 'info'
}

function goTo(href) {
  if (href) window.location.href = href
}

export function RoleFunctionHub({ title, description, metrics = [], sections = [], notice, hideHeader = false, className = '' }) {
  const [filters, setFilters] = useState({ keyword: '', status: '全部状态' })
  const rows = useMemo(() => sections.map((section, index) => ({
    id: `function-${index + 1}`,
    name: section.title,
    description: section.description,
    status: section.status || '正常',
    action: section.actions?.[0],
  })), [sections])
  const statusOptions = useMemo(() => ['全部状态', ...new Set(rows.map((row) => row.status))], [rows])
  const filtered = useMemo(() => rows.filter((row) => {
    const keyword = filters.keyword.trim().toLowerCase()
    if (keyword && !`${row.name}${row.description}`.toLowerCase().includes(keyword)) return false
    return filters.status === '全部状态' || row.status === filters.status
  }), [filters, rows])

  const filterProps = {
    fields: [
      {
        key: 'keyword',
        label: '功能名称',
        placeholder: '请输入功能名称',
        controlledValue: filters.keyword,
        onChange: (event) => setFilters((current) => ({ ...current, keyword: event.target.value })),
      },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: statusOptions,
        controlledValue: filters.status,
        onChange: (value) => setFilters((current) => ({ ...current, status: value })),
      },
    ],
    collapsedRows: 1,
    defaultExpanded: false,
    showExpand: false,
    showMore: false,
    onSearch: () => {},
    onReset: () => setFilters({ keyword: '', status: '全部状态' }),
  }

  const columns = [
    { key: 'name', dataIndex: 'name', title: '功能模块', width: 180, render: (value) => <b>{value}</b> },
    { key: 'description', dataIndex: 'description', title: '功能说明', width: 480 },
    { key: 'status', dataIndex: 'status', title: '状态', width: 120, render: (value) => <DSTag tone={statusTone(value)}>{value}</DSTag> },
    {
      key: 'action',
      title: '操作',
      width: 140,
      render: (_, row) => row.action
        ? <DSButton variant="link" size="small" onClick={() => goTo(row.action.href)}>{row.action.label}</DSButton>
        : null,
    },
  ]

  const metricSummary = metrics.length
    ? metrics.map((metric) => `${metric.label} ${metric.value}`).join('　')
    : `功能总数 ${filtered.length}`

  return (
    <main data-ds-business-page="role-function-list" className={className}>
      <DSRegularListTemplate
        tabs={[]}
        metaLabel={hideHeader ? '' : title}
        metaValue={hideHeader ? '' : `共 ${filtered.length} 项`}
        notice={[description, notice].filter(Boolean).join('；')}
        filterProps={filterProps}
        toolbarActions={[]}
        tableTools={false}
        summary={metricSummary}
        tableProps={{ columns, data: filtered, rowKey: 'id', selectable: false, showIndex: true, actions: [], minWidth: 920 }}
        pagination={{ total: filtered.length, totalPages: 1, current: 1, pageSize: 10 }}
        footerActions={[]}
        className="role-function-hub__template"
      />
    </main>
  )
}

const PERSON_OPTIONS = teachers.slice(0, 8).map((teacher) => ({
  value: teacher.id,
  label: `${teacher.name} · ${teacher.title}`,
}))

const COMPARE_DIMENSIONS = [
  { key: 'ethics', label: '师德师风' },
  { key: 'teaching', label: '教育教学' },
  { key: 'research', label: '科研与社会服务' },
  { key: 'development', label: '专业发展' },
  { key: 'contribution', label: '团队与贡献' },
]

function profileFor(teacherId) {
  const teacher = teachers.find((item) => item.id === teacherId) || teachers[0]
  const score = computeScore(teacher.id, 'M-tenure')
  const dimensions = Object.fromEntries((score?.dimensions || []).map((item) => [item.dimensionId, item.score]))
  return { teacher, score, dimensions }
}

export function AbilityComparePage({ scopeLabel, backHref }) {
  const initialLeftId = PERSON_OPTIONS[0]?.value
  const initialRightId = PERSON_OPTIONS[1]?.value || initialLeftId
  const [leftId, setLeftId] = useState(initialLeftId)
  const [rightId, setRightId] = useState(initialRightId)
  const left = useMemo(() => profileFor(leftId), [leftId])
  const right = useMemo(() => profileFor(rightId), [rightId])

  const rows = useMemo(() => COMPARE_DIMENSIONS.map((dimension, index) => {
    const leftValue = left.dimensions[dimension.key] ?? 0
    const rightValue = right.dimensions[dimension.key] ?? 0
    return {
      id: `dimension-${index + 1}`,
      dimension: dimension.label,
      leftValue,
      rightValue,
      difference: Math.abs(leftValue - rightValue),
      leader: leftValue === rightValue ? '持平' : leftValue > rightValue ? left.teacher.name : right.teacher.name,
    }
  }), [left, right])

  const filterProps = {
    fields: [
      {
        key: 'leftTeacher',
        fieldRef: STAFF_FIELDS.name.fieldRef,
        label: `${STAFF_FIELDS.name.label} A`,
        type: 'select',
        options: PERSON_OPTIONS,
        controlledValue: leftId,
        onChange: setLeftId,
      },
      {
        key: 'rightTeacher',
        fieldRef: STAFF_FIELDS.name.fieldRef,
        label: `${STAFF_FIELDS.name.label} B`,
        type: 'select',
        options: PERSON_OPTIONS,
        controlledValue: rightId,
        onChange: setRightId,
      },
    ],
    collapsedRows: 1,
    defaultExpanded: false,
    showExpand: false,
    showMore: false,
    onSearch: () => {},
    onReset: () => {
      setLeftId(initialLeftId)
      setRightId(initialRightId)
    },
  }

  const columns = [
    { key: 'dimension', dataIndex: 'dimension', title: '能力维度', width: 220, render: (value) => <b>{value}</b> },
    { key: 'leftValue', dataIndex: 'leftValue', title: left.teacher.name, width: 160 },
    { key: 'rightValue', dataIndex: 'rightValue', title: right.teacher.name, width: 160 },
    { key: 'difference', dataIndex: 'difference', title: '分值差', width: 140 },
    { key: 'leader', dataIndex: 'leader', title: '对比结果', width: 160, render: (value) => <DSTag tone={value === '持平' ? 'muted' : 'primary'}>{value}</DSTag> },
  ]

  return (
    <main data-ds-business-page="ability-compare-list">
      <DSRegularListTemplate
        tabs={[]}
        metaLabel="教师能力对比"
        metaValue={scopeLabel}
        notice="选择两位教师，对比五维能力、综合得分和主要差距。"
        filterProps={filterProps}
        toolbarActions={[{ key: 'back', label: '返回诊断预警', onClick: () => goTo(backHref) }]}
        tableTools={false}
        summary={`${left.teacher.name} 综合分 ${left.score?.total ?? 0}　${right.teacher.name} 综合分 ${right.score?.total ?? 0}`}
        tableProps={{ columns, data: rows, rowKey: 'id', selectable: false, showIndex: true, actions: [], minWidth: 900 }}
        pagination={null}
        footerActions={[]}
      />
    </main>
  )
}
