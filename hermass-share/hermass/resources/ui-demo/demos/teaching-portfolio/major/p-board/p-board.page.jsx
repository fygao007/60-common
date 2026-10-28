import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSRegularListTemplate,
  DSTag,
} from '@wisedu/design-system'
import './p-board.css'

// 示例数据：本学院教师教学档案袋（档案完成率 = 已填分类数 / 9）
const TEACHER_ROWS = [
  { id: 't-01', name: '金晓智', pinyin: 'JXZ', code: 'T20210315', unit: '电子与通信工程系', major: '软件技术', title: '副教授', filled: 9, total: 9, updatedAt: '2026-06-24' },
  { id: 't-02', name: '王芳', pinyin: 'WF', code: 'T20190472', unit: '电子与通信工程系', major: '人工智能技术应用', title: '教授', filled: 8, total: 9, updatedAt: '2026-06-22' },
  { id: 't-03', name: '张磊', pinyin: 'ZL', code: 'T20200819', unit: '信息工程系', major: '大数据技术', title: '副教授', filled: 7, total: 9, updatedAt: '2026-06-20' },
  { id: 't-04', name: '刘洋', pinyin: 'LY', code: 'T20211203', unit: '信息工程系', major: '云计算技术应用', title: '讲师', filled: 9, total: 9, updatedAt: '2026-06-19' },
  { id: 't-05', name: '陈晨', pinyin: 'CC', code: 'T20220714', unit: '通信工程系', major: '软件技术', title: '讲师', filled: 6, total: 9, updatedAt: '2026-06-15' },
  { id: 't-06', name: '赵敏', pinyin: 'ZM', code: 'T20230528', unit: '电子与通信工程系', major: '人工智能技术应用', title: '讲师', filled: 5, total: 9, updatedAt: '2026-06-12' },
  { id: 't-07', name: '孙颖', pinyin: 'SY', code: 'T20230901', unit: '通信工程系', major: '大数据技术', title: '助理教授', filled: 4, total: 9, updatedAt: '2026-06-08' },
  { id: 't-08', name: '周强', pinyin: 'ZQ', code: 'T20180317', unit: '信息工程系', major: '云计算技术应用', title: '教授', filled: 8, total: 9, updatedAt: '2026-06-05' },
  { id: 't-09', name: '吴蔚', pinyin: 'WW', code: 'T20170625', unit: '电子与通信工程系', major: '软件技术', title: '教授', filled: 9, total: 9, updatedAt: '2026-05-30' },
  { id: 't-10', name: '郑昊', pinyin: 'ZH', code: 'T20221019', unit: '通信工程系', major: '人工智能技术应用', title: '副教授', filled: 7, total: 9, updatedAt: '2026-05-28' },
  { id: 't-11', name: '冯雪', pinyin: 'FX', code: 'T20231102', unit: '信息工程系', major: '大数据技术', title: '讲师', filled: 6, total: 9, updatedAt: '2026-05-25' },
  { id: 't-12', name: '褚伟', pinyin: 'CW', code: 'T20201208', unit: '电子与通信工程系', major: '云计算技术应用', title: '副教授', filled: 8, total: 9, updatedAt: '2026-05-20' },
]

const PAGE_SIZE = 10
const UNIT_OPTIONS = [...new Set(TEACHER_ROWS.map((row) => row.unit))]

function completenessTone(row) {
  const ratio = row.filled / row.total
  if (ratio >= 0.875) return 'success'
  if (ratio >= 0.625) return 'primary'
  if (ratio >= 0.375) return 'warning'
  return 'danger'
}

function PBoardPage() {
  const [filters, setFilters] = useState({ keyword: '', units: UNIT_OPTIONS })
  const [sort, setSort] = useState({ key: 'updatedAt', dir: 'desc' })

  const filterProps = useMemo(() => ({
    fields: [
      {
        key: 'keyword',
        label: '关键词',
        type: 'text',
        placeholder: '请输入姓名/职工号/拼音',
        controlledValue: filters.keyword,
        onChange: (event) => setFilters((prev) => ({ ...prev, keyword: event.target.value })),
      },
      {
        key: 'units',
        label: '所在单位',
        type: 'select',
        multiple: true,
        searchable: true,
        placeholder: '请选择所在单位',
        options: UNIT_OPTIONS,
        controlledValue: filters.units,
        onChange: (value) => setFilters((prev) => ({ ...prev, units: Array.isArray(value) ? value : [value] })),
      },
    ],
    collapsedRows: 1,
    defaultExpanded: false,
    onSearch: () => setToast('已按当前条件查询'),
    onReset: () => { setFilters({ keyword: '', units: UNIT_OPTIONS }); setToast('筛选条件已重置') },
    showExpand: false,
    showMore: false,
  }), [filters])

  const [toastMsg, setToastState] = useState('')
  const setToast = (msg) => { setToastState(msg); window.setTimeout(() => setToastState(''), 1600) }

  const filtered = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    const selectedUnits = filters.units || []
    return TEACHER_ROWS.filter((row) => {
      const matchKeyword = !keyword || [row.name, row.code, row.pinyin]
        .some((value) => value.toLowerCase().includes(keyword))
      const matchUnit = selectedUnits.length === 0 || selectedUnits.includes(row.unit)
      return matchKeyword && matchUnit
    })
  }, [filters])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      let av
      let bv
      if (sort.key === 'completeness') { av = a.filled / a.total; bv = b.filled / b.total }
      else { av = a.updatedAt; bv = b.updatedAt }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1
      if (av > bv) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [filtered, sort])

  const columns = [
    { key: 'name', dataIndex: 'name', title: '姓名', width: 110, render: (v) => <b>{v}</b> },
    { key: 'code', dataIndex: 'code', title: '工号', width: 130 },
    { key: 'unit', dataIndex: 'unit', title: '所在单位', width: 180 },
    { key: 'title', dataIndex: 'title', title: '职称', width: 100 },
    { key: 'updatedAt', dataIndex: 'updatedAt', title: '最近更新时间', width: 140 },
  ]

  const actions = [{
    key: 'detail',
    label: '详情',
    onClick: (row) => { window.location.href = '../portfolio-detail/portfolio-detail.html?teacher=' + (row ? row.code : '') },
  }]

  const toolbarActions = []

  return (
    <main className="pb-page" data-ds-business-page="p-board">
      <DSRegularListTemplate
        className="pb-list"
        tabs={[]}
        metaLabel=""
        metaValue=""
        notice=""
        filterProps={filterProps}
        toolbarActions={toolbarActions}
        tableTools={false}
        summary=""
        tableProps={{
          columns,
          data: sorted,
          rowKey: 'id',
          selectable: false,
          showIndex: true,
          actions,
          actionsMaxVisible: 2,
          actionFixed: true,
          minWidth: 620,
        }}
        pagination={{ total: sorted.length, totalPages: Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)), current: 1, pageSize: PAGE_SIZE }}
        footerActions={[]}
      />
      {toastMsg ? (
        <div className="pb-toast" role="status">{toastMsg}</div>
      ) : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<PBoardPage />)
