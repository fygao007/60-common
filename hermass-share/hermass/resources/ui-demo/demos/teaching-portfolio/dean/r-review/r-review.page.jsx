import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSButton,
  DSDataTable,
  DSDrawer,
  DSEditField,
  DSInput,
  DSModal,
  DSRadioGroup,
  DSRegularListTemplate,
  DSSelect,
  DSSubPageHeader,
  DSTag,
  DSTabs,
  DSTextarea,
} from '@wisedu/design-system'
import { TeachingInfoPage } from '../t-overview/teaching-info.page.jsx'
import './r-review.css'

// 「更多信息」抽屉顶部一级分组页签：teaching-info 沿用本角色审核视角，其余复用 teacher 子页
const ARCHIVE_TABS = [
  { key: 'teaching-info', label: '教学信息', empty: true },
]

// === 院长本人信息 ===
const DEAN_PROFILE = {
  name: '李建国',
  college: '电子与通信工程学院',
}

// === 本院各系及其专业（用于筛选与名单展示） ===
const DEPARTMENTS = [
  { id: 'dep-ei', name: '电子信息工程系', majors: ['电子信息工程技术', '通信工程'] },
  { id: 'dep-comm', name: '通信工程系', majors: ['物联网应用技术'] },
  { id: 'dep-info', name: '信息工程系', majors: ['软件技术', '大数据技术'] },
]
const UNIT_OPTIONS = DEPARTMENTS.map((dep) => dep.name)

// === 本院教师名单（含专业/系归属） ===
const TEACHERS = [
  { id: 't-101', name: '金晓智', jobNo: 'T20210315', departmentId: 'dep-ei', major: '电子信息工程技术' },
  { id: 't-102', name: '王芳', jobNo: 'T20190472', departmentId: 'dep-ei', major: '通信工程' },
  { id: 't-103', name: '陈建军', jobNo: 'T20180230', departmentId: 'dep-comm', major: '物联网应用技术' },
  { id: 't-104', name: '刘晓燕', jobNo: 'T20211189', departmentId: 'dep-info', major: '软件技术' },
  { id: 't-105', name: '张伟', jobNo: 'T20261231', departmentId: 'dep-info', major: '大数据技术' },
  { id: 't-106', name: '赵敏', jobNo: 'T20230528', departmentId: 'dep-comm', major: '物联网应用技术' },
]
const DEP_MAP = DEPARTMENTS.reduce((map, item) => ({ ...map, [item.id]: item }), {})

// === 可评审批次 ===
const AUDIT_BATCHES = [
  { id: 'batch-2025f', name: '2025 秋季学期教学档案评审', semester: '2025-2026学年 秋季学期', endDate: '2026-02-01', fullScore: 100, status: '评审中' },
  { id: 'batch-2025s', name: '2025 春季学期教学档案考核', semester: '2024-2025学年 春季学期', endDate: '2025-07-05', fullScore: 100, status: '已完结' },
  { id: 'batch-2026s', name: '2026 春季学期教学档案考核', semester: '2025-2026学年 春季学期', endDate: '2026-07-10', fullScore: 100, status: '提交中' },
]

const SCORER_LABEL = `${DEAN_PROFILE.name}（${DEAN_PROFILE.college} 院长）`

// === 提交与审核记录（教师 × 批次） ===
const SUBMISSIONS = [
  { batchId: 'batch-2026s', teacherId: 't-101', status: '已提交', submitTime: '2026-06-20', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2026s', teacherId: 't-102', status: '未提交', submitTime: '-', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2026s', teacherId: 't-103', status: '已提交', submitTime: '2026-06-25', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2026s', teacherId: 't-104', status: '未提交', submitTime: '-', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2026s', teacherId: 't-105', status: '已提交', submitTime: '2026-06-28', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2026s', teacherId: 't-106', status: '逾期未交', submitTime: '-', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },

  { batchId: 'batch-2025f', teacherId: 't-101', status: '已提交', submitTime: '2026-01-15', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2025f', teacherId: 't-102', status: '逾期未交', submitTime: '-', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2025f', teacherId: 't-103', status: '已提交', submitTime: '2026-01-18', auditStatus: '已通过', score: 88, comment: '课程设计材料详实，任职记录清晰，建议补充企业实践佐证材料。', scorer: SCORER_LABEL, scoreTime: '2026-01-25' },
  { batchId: 'batch-2025f', teacherId: 't-104', status: '已提交', submitTime: '2026-01-20', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2025f', teacherId: 't-105', status: '已提交', submitTime: '2026-01-22', auditStatus: '已退回', score: null, comment: '课程设计部分材料缺失，请补充教学实施过程佐证后重新提交。', scorer: SCORER_LABEL, scoreTime: '2026-01-24' },
  { batchId: 'batch-2025f', teacherId: 't-106', status: '已提交', submitTime: '2026-01-23', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },

  { batchId: 'batch-2025s', teacherId: 't-101', status: '已提交', submitTime: '2025-06-25', auditStatus: '已通过', score: 90, comment: '教学反思深入，成果材料完整。', scorer: SCORER_LABEL, scoreTime: '2025-07-18' },
  { batchId: 'batch-2025s', teacherId: 't-102', status: '已提交', submitTime: '2025-06-26', auditStatus: '已通过', score: 85, comment: '材料基本完整，课程设计部分略显简单。', scorer: SCORER_LABEL, scoreTime: '2025-07-18' },
  { batchId: 'batch-2025s', teacherId: 't-103', status: '已提交', submitTime: '2025-06-27', auditStatus: '已通过', score: 92, comment: '教学科研成果突出，任职记录详实。', scorer: SCORER_LABEL, scoreTime: '2025-07-19' },
  { batchId: 'batch-2025s', teacherId: 't-104', status: '逾期未交', submitTime: '-', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2025s', teacherId: 't-105', status: '已提交', submitTime: '2025-06-28', auditStatus: '已通过', score: 88, comment: '整体材料扎实，建议持续积累社会服务类材料。', scorer: SCORER_LABEL, scoreTime: '2025-07-19' },
  { batchId: 'batch-2025s', teacherId: 't-106', status: '已提交', submitTime: '2025-06-29', auditStatus: '已通过', score: 86, comment: '任职记录完整，教学效果良好。', scorer: SCORER_LABEL, scoreTime: '2025-07-20' },
]

// === 辅助函数 ===
function batchStatusTone(status) {
  const map = { 提交中: 'primary', 评审中: 'warning', 已完结: 'success', 已关闭: 'neutral' }
  return map[status] || 'neutral'
}
function submissionStatusTone(status) {
  const map = { 未提交: 'danger', 已提交: 'success', 逾期未交: 'danger' }
  return map[status] || 'neutral'
}
function auditStatusTone(status) {
  if (status === '已通过') return 'success'
  if (status === '已退回') return 'danger'
  return 'warning'
}
function notify(message) { if (typeof window.toast === 'function') window.toast(message, 'ok') }

// 计数（用于待我审核/我已审核/全部页签徽标）
function rosterCountByTab(batchId, tab) {
  let n = 0
  for (const teacher of TEACHERS) {
    const submission = SUBMISSIONS.find((item) => item.batchId === batchId && item.teacherId === teacher.id)
    if (tab === 'pending') {
      if (submission?.status === '已提交' && submission?.auditStatus === '待审核') n += 1
    } else if (tab === 'reviewed') {
      if (submission?.scorer === SCORER_LABEL && ['已通过', '已退回'].includes(submission?.auditStatus)) n += 1
    } else {
      n += 1
    }
  }
  return n
}

// === 流程审批节点 ===
const AUDIT_NODES = [
  { key: 'unit', name: '所在单位审核', assignee: '专业主任审核' },
  { key: 'college', name: '二级学院审核', assignee: '二级学院院长审核' },
  { key: 'hr', name: '人事处审核', assignee: '人事处审核员' },
  { key: 'leader', name: '分管领导审批', assignee: '分管校领导' },
  { key: 'president', name: '校长审批', assignee: '校长' },
]
const STAGE_TAG = { passed: '已通过', processing: '审核中', pending: '未开始' }

// dean 版流程：unit(专业主任) 依据 auditStatus，college(dean) 依据本角色审核状态
function mapAuditStages(batchStatus, auditStatus, submissionStatus) {
  const notSubmitted = submissionStatus !== '已提交'
  const unitPassed = auditStatus === '已通过'
  const unitReturned = auditStatus === '已退回'
  return AUDIT_NODES.map((node, index) => {
    let status = 'pending'
    if (index === 0) {
      if (unitPassed) status = 'passed'
      else if (unitReturned) status = 'wait'
      else if (!notSubmitted) status = 'processing'
    }
    if (index === 1) {
      // 二级学院(dean)：mock 状态——前端只读,假设 unit passed 后自动流转
      if (unitPassed) status = 'processing'
      else if (unitReturned) status = 'wait'
    }
    if (index >= 2) {
      if (batchStatus === '已完结') status = 'passed'
    }
    return { key: node.key, name: node.name, assignee: node.assignee, status, tag: STAGE_TAG[status] }
  })
}
function getCurrentStageText(stages) {
  const current = stages.find((s) => s.status === 'processing')
  if (current) return `待${current.name}`
  if (stages.every((s) => s.status === 'passed')) return '流程已结束'
  return '待审核'
}

// === 其他业绩数据（复用 portfolio-detail 结构） ===
const ACHIEVEMENTS_SECTIONS = [
  { key: 'teaching-project', title: '教研项目', columns: ['项目名称', '项目类型', '开始时间', '结束时间', '本人角色'], rows: [['高职数据结构课程项目化教学改革', '校级教改', '2025-03-01', '2025-12-31', '主持']] },
  { key: 'award', title: '获奖', columns: ['获奖成果名称', '奖励名称', '获奖级别', '获奖日期', '颁奖单位'], rows: [['职业教育智能学习分析平台建设', '广东省教学成果奖', '省级二等奖', '2025-09-10', '广东省教育厅']] },
]
const ENTERPRISE_PRACTICE_SECTIONS = [
  { key: 'practice', title: '企业实践', columns: ['企业名称', '所属行业', '实践开始时间', '实践结束时间', '实践内容'], rows: [['联科精密电子股份有限公司', '科技行业', '2025-01-01', '2025-02-01', '参与智能硬件测试流程、生产现场工艺诊断。']] },
]
const APPOINTMENT_SECTIONS = [
  { key: 'head-teacher', title: '担任班主任情况', columns: ['服务名称', '服务单位', '时间', '内容'], rows: [['2024级软件技术1班班主任', '深圳职业技术大学', '2024-09 至 2025-07', '负责班级日常管理与学风建设']] },
]
const ACHIEVEMENT_GROUPS = [
  { key: 'achievements-honors', title: '成果与荣誉', kind: 'table', data: ACHIEVEMENTS_SECTIONS },
  { key: 'enterprise-practice', title: '企业实践', kind: 'table', data: ENTERPRISE_PRACTICE_SECTIONS },
  { key: 'appointment', title: '任职情况', kind: 'table', data: APPOINTMENT_SECTIONS },
]
function buildTableColumns(section) { return section.columns.map((title, index) => ({ key: `col-${index}`, dataIndex: `col-${index}`, title, minWidth: title.length >= 6 ? 160 : 120 })) }
function buildTableData(section) { return section.rows.map((row, i) => row.reduce((acc, v, j) => ({ ...acc, [`col-${j}`]: v }), { id: `${section.key}-${i}` })) }
function TableGroupSection({ sections }) {
  return (<div className="rr-more-table-groups">{sections.map((s) => (<div className="rr-more-sub-section" id={s.key} key={s.key}><div className="rr-more-sub-head"><h4 className="rr-more-sub-title">{s.title}</h4></div><DSDataTable columns={buildTableColumns(s)} data={buildTableData(s)} rowKey="id" selectable={false} showToolbar={false} tableTools={false} className="rr-more-table" minWidth={640} /></div>))}</div>)
}

// 「更多信息」抽屉：顶部一级分组页签 + 复用 teacher 子页
function MoreInfoDrawer({ open, name, onClose }) {
  const [activeKey, setActiveKey] = useState(ARCHIVE_TABS[0].key)
  const active = ARCHIVE_TABS.find((tab) => tab.key === activeKey) || ARCHIVE_TABS[0]
  const ActiveComp = active.Comp
  return (
    <DSDrawer open={open} title={`${name || ''} · 教学档案详情`} width="80vw" showFooter={false} className="rr-more-drawer is-more-drawer" bodyPadding="none" onClose={onClose}>
      <div className="rr-more-tabs">
        <DSTabs items={ARCHIVE_TABS.map(({ key, label }) => ({ key, label }))} activeKey={activeKey} onChange={setActiveKey} />
      </div>
      <div className="rr-more-pane">
        {active.empty ? <div className="rr-more-empty">暂无数据</div> : (ActiveComp ? <ActiveComp hideHeader /> : null)}
      </div>
    </DSDrawer>
  )
}

function ReviewPage() {
  const [selectedBatchId, setSelectedBatchId] = useState(AUDIT_BATCHES.find((b) => b.status === '评审中')?.id || AUDIT_BATCHES[0].id)
  const [view, setView] = useState('list')
  const [activeRecord, setActiveRecord] = useState(null)
  const [detailMode, setDetailMode] = useState('view')
  const [auditDraft, setAuditDraft] = useState({ action: 'pass', score: '', comment: '' })
  const [batchSwitcherOpen, setBatchSwitcherOpen] = useState(false)
  const [filters, setFilters] = useState({ keyword: '', unit: '', status: '全部' })
  const [listTab, setListTab] = useState('pending')
  const [selectedKeys, setSelectedKeys] = useState([])
  const [batchAuditOpen, setBatchAuditOpen] = useState(false)
  const [batchAuditDraft, setBatchAuditDraft] = useState({ action: 'pass', score: '', comment: '' })
  const [auditModalOpen, setAuditModalOpen] = useState(false)
  const [flowOpen, setFlowOpen] = useState(false)
  const [flowTab, setFlowTab] = useState('flow')
  const [moreOpen, setMoreOpen] = useState(false)
  const [auditVersion, setAuditVersion] = useState(0)

  const selectedBatch = AUDIT_BATCHES.find((b) => b.id === selectedBatchId)

  const rosterRows = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    return TEACHERS.filter((t) => {
      if (keyword && ![t.name, t.jobNo].some((v) => v.toLowerCase().includes(keyword))) return false
      if (filters.unit && DEP_MAP[t.departmentId]?.name !== filters.unit) return false
      return true
    }).map((t) => {
      const submission = SUBMISSIONS.find((item) => item.batchId === selectedBatchId && item.teacherId === t.id)
      const status = submission?.status || '未提交'
      if (listTab === 'pending') {
        if (status !== '已提交') return null
        if (submission?.auditStatus !== '待审核') return null
      } else if (listTab === 'reviewed') {
        if (submission?.scorer !== SCORER_LABEL) return null
        if (!['已通过', '已退回'].includes(submission?.auditStatus)) return null
      }
      if (filters.status !== '全部') {
        if (filters.status === '未提交' && status !== '未提交' && status !== '逾期未交') return null
        if (filters.status === '已提交' && status !== '已提交') return null
        if (filters.status === '待审核' && submission?.auditStatus !== '待审核') return null
        if (filters.status === '已通过' && submission?.auditStatus !== '已通过') return null
        if (filters.status === '已退回' && submission?.auditStatus !== '已退回') return null
      }
      return { id: t.id, name: t.name, jobNo: t.jobNo, department: DEP_MAP[t.departmentId]?.name || '-', major: t.major, submissionStatus: status, submitTime: submission?.submitTime || '-', auditStatus: submission?.auditStatus || '待审核', score: submission?.score }
    }).filter(Boolean)
  }, [selectedBatchId, filters, listTab, auditVersion])

  const pendingCount = useMemo(() => rosterCountByTab(selectedBatchId, 'pending'), [selectedBatchId, auditVersion])
  const reviewedCount = useMemo(() => rosterCountByTab(selectedBatchId, 'reviewed'), [selectedBatchId, auditVersion])
  const allCount = useMemo(() => rosterCountByTab(selectedBatchId, 'all'), [selectedBatchId, auditVersion])

  const openDetail = (record, mode) => {
    const submission = SUBMISSIONS.find((item) => item.batchId === selectedBatchId && item.teacherId === record.id)
    setActiveRecord({ ...record, submission })
    setDetailMode(mode)
    setAuditDraft({ action: 'pass', score: submission?.score ?? '', comment: submission?.comment ?? '' })
    setAuditModalOpen(false)
    setFlowOpen(false)
    setMoreOpen(false)
    setView('detail')
  }
  const backToList = () => { setView('list'); setActiveRecord(null); setSelectedKeys([]) }

  const submitAudit = () => {
    const submission = SUBMISSIONS.find((item) => item.batchId === selectedBatchId && item.teacherId === activeRecord.id)
    if (submission) {
      const isPass = auditDraft.action === 'pass'
      submission.auditStatus = isPass ? '已通过' : '已退回'
      submission.score = isPass ? Number(auditDraft.score) : null
      submission.comment = auditDraft.comment
      submission.scorer = SCORER_LABEL
      submission.scoreTime = new Date().toISOString().slice(0, 10)
    }
    backToList()
    setAuditModalOpen(false)
    setAuditVersion((v) => v + 1)
    notify(auditDraft.action === 'pass' ? '已通过该教师审核' : '已退回，已通知该教师')
  }

  const submitBatchAudit = () => {
    const isPass = batchAuditDraft.action === 'pass'
    for (const teacherId of selectedKeys) {
      const submission = SUBMISSIONS.find((item) => item.batchId === selectedBatchId && item.teacherId === teacherId)
      if (submission) {
        submission.auditStatus = isPass ? '已通过' : '已退回'
        submission.score = isPass ? Number(batchAuditDraft.score) : null
        submission.comment = batchAuditDraft.comment
        submission.scorer = SCORER_LABEL
        submission.scoreTime = new Date().toISOString().slice(0, 10)
      }
    }
    setBatchAuditOpen(false)
    setSelectedKeys([])
    setAuditVersion((v) => v + 1)
    notify(`已批量${isPass ? '通过' : '退回'} ${selectedKeys.length} 条记录`)
  }

  const switchBatch = (batchId) => { setSelectedBatchId(batchId); setBatchSwitcherOpen(false); setFilters({ keyword: '', unit: '', status: '全部' }); setListTab('pending'); setSelectedKeys([]); notify('已切换至当前批次') }

  const rosterColumns = [
    { key: 'name', dataIndex: 'name', title: '姓名', width: 110, fixed: 'left' },
    { key: 'jobNo', dataIndex: 'jobNo', title: '工号', width: 120 },
    { key: 'department', dataIndex: 'department', title: '所在学院', width: 180 },
    { key: 'submissionStatus', dataIndex: 'submissionStatus', title: '提交状态', width: 110, render: (v) => <DSTag tone={submissionStatusTone(v)}>{v}</DSTag> },
    { key: 'auditStatus', dataIndex: 'auditStatus', title: '审核状态', width: 110, render: (v, r) => (r.submissionStatus === '已提交' ? <DSTag tone={auditStatusTone(v)}>{v}</DSTag> : <span className="rr-empty-cell">—</span>) },
    { key: 'score', dataIndex: 'score', title: '得分', width: 90, render: (v) => (v ? `${v}` : <span className="rr-empty-cell">—</span>) },
  ]

  const rosterActions = useMemo(() => {
    const actions = [{ key: 'detail', label: '详情', onClick: (record) => openDetail(record, record.auditStatus !== '待审核' || selectedBatch.status !== '评审中' ? 'view' : 'audit') }]
    if (selectedBatch.status === '提交中') actions.push({ key: 'urge', label: '催交', onClick: (record) => notify(`已向「${record.name}」发送催交提醒`), disabled: (record) => record.submissionStatus === '已提交' })
    return actions
  }, [selectedBatch.status])

  // 列表视图
  if (view === 'list') {
    const filterFields = listTab === 'pending'
      ? [
        { key: 'keyword', label: '关键字', type: 'text', placeholder: '姓名 / 工号', controlledValue: filters.keyword, onChange: (e) => setFilters((p) => ({ ...p, keyword: e.target.value })) },
        { key: 'unit', label: '所在单位', type: 'select', clearable: true, placeholder: '全部单位', options: UNIT_OPTIONS, controlledValue: filters.unit, onChange: (v) => setFilters((p) => ({ ...p, unit: v || '' })) },
      ]
      : [
        { key: 'keyword', label: '关键字', type: 'text', placeholder: '姓名 / 工号', controlledValue: filters.keyword, onChange: (e) => setFilters((p) => ({ ...p, keyword: e.target.value })) },
        { key: 'unit', label: '所在单位', type: 'select', clearable: true, placeholder: '全部单位', options: UNIT_OPTIONS, controlledValue: filters.unit, onChange: (v) => setFilters((p) => ({ ...p, unit: v || '' })) },
        { key: 'status', label: '状态', type: 'select', clearable: true, placeholder: '全部状态', options: ['全部', '未提交', '已提交', '待审核', '已通过', '已退回'], controlledValue: filters.status, onChange: (v) => setFilters((p) => ({ ...p, status: v || '全部' })) },
      ]
    const listTabs = [
      { key: 'pending', label: '待我审核', count: pendingCount },
      { key: 'reviewed', label: '我已审核', count: reviewedCount },
      { key: 'all', label: '全部', count: allCount },
    ]
    const batchTargets = rosterRows.filter((r) => selectedKeys.includes(r.id))

    return (
      <main className="rr-page" data-ds-business-page="r-review">
        <div className="rr-list-wrap">
          <DSRegularListTemplate
            flush
            tabs={listTabs}
            activeTab={listTab}
            onTabChange={(key) => { setListTab(key); setFilters((p) => ({ ...p, status: '全部' })); setSelectedKeys([]) }}
            metaLabel="当前批次"
            metaValue={`${selectedBatch.name}（${selectedBatch.status}）· 待审 ${pendingCount} 条`}
            onMetaClick={() => setBatchSwitcherOpen(true)}
            notice=""
            filterProps={{ fields: filterFields, onReset: () => setFilters({ keyword: '', unit: '', status: '全部' }), showExpand: false, showMore: false }}
            toolbarActions={listTab === 'pending' ? [
              { key: 'batch-audit', label: `批量审核${selectedKeys.length > 0 ? `（${selectedKeys.length}）` : ''}`, variant: 'primary', disabled: selectedKeys.length === 0, onClick: () => { setBatchAuditDraft({ action: 'pass', score: '', comment: '' }); setBatchAuditOpen(true) } },
            ] : []}
            tableTools={false}
            summary={null}
            tableProps={{
              actions: rosterActions,
              actionsMaxVisible: 2,
              bordered: false,
              columns: rosterColumns,
              data: rosterRows,
              rowKey: 'id',
              selectable: listTab === 'pending',
              selectedRowKeys: selectedKeys,
              onSelectRow: (key, checked) => setSelectedKeys((p) => checked ? [...p, key] : p.filter((k) => k !== key)),
              onSelectAll: (checked, data) => setSelectedKeys(checked ? data.map((r) => r.id) : []),
              showIndex: false,
              minWidth: 1000,
            }}
            pagination={null}
            footerActions={[]}
          />
        </div>

        {batchSwitcherOpen && (
          <DSModal open title="切换评审批次" okText="确认" showOk={false} onCancel={() => setBatchSwitcherOpen(false)}>
            <div className="rr-batch-list">
              {AUDIT_BATCHES.map((batch) => (
                <div key={batch.id} className={batch.id === selectedBatchId ? 'rr-batch-item is-active' : 'rr-batch-item'} onClick={() => switchBatch(batch.id)}>
                  <span className="rr-batch-item__name">{batch.name}</span>
                  <DSTag tone={batchStatusTone(batch.status)}>{batch.status}</DSTag>
                </div>
              ))}
            </div>
          </DSModal>
        )}

        {batchAuditOpen && (
          <DSModal open title="批量审核" okText="确认" onCancel={() => setBatchAuditOpen(false)} onOk={submitBatchAudit}>
            <div className="rr-audit-modal">
              <div className="rr-audit-modal__people">
                <div className="rr-audit-modal__people-title">被审核人（{batchTargets.length}）</div>
                <div className="rr-audit-modal__people-list">
                  {batchTargets.map((p) => <span key={p.id} className="rr-audit-modal__person">{p.name}（{p.jobNo}）</span>)}
                </div>
              </div>
              <DSEditField label="审核结论" required><DSRadioGroup options={[{ value: 'pass', label: '通过' }, { value: 'return', label: '退回' }]} value={batchAuditDraft.action} onChange={(val) => setBatchAuditDraft((p) => ({ ...p, action: val }))} /></DSEditField>
              {batchAuditDraft.action === 'pass' && (
                <div className="rr-audit-modal__form">
                  <DSEditField label={`总分（满分 ${selectedBatch.fullScore}）`} required><DSInput type="number" min={0} max={selectedBatch.fullScore} placeholder={`请输入 0-${selectedBatch.fullScore} 的总分`} value={batchAuditDraft.score} onChange={(e) => setBatchAuditDraft((p) => ({ ...p, score: e.target.value }))} /></DSEditField>
                  <DSEditField label="通过意见" fullWidth><DSTextarea rows={4} placeholder="请输入通过意见（选填）" value={batchAuditDraft.comment} onChange={(e) => setBatchAuditDraft((p) => ({ ...p, comment: e.target.value }))} /></DSEditField>
                </div>
              )}
              {batchAuditDraft.action === 'return' && (
                <div className="rr-audit-modal__form">
                  <DSEditField label="退回意见" required fullWidth><DSTextarea rows={5} placeholder="请输入退回意见，说明需补充或修改的内容" value={batchAuditDraft.comment} onChange={(e) => setBatchAuditDraft((p) => ({ ...p, comment: e.target.value }))} /></DSEditField>
                </div>
              )}
            </div>
          </DSModal>
        )}
      </main>
    )
  }

  // —— 详情视图 ——
  const submission = activeRecord?.submission
  const canAudit = detailMode === 'audit' && selectedBatch.status === '评审中' && submission?.status === '已提交'
  const isAudited = submission?.auditStatus === '已通过' || submission?.auditStatus === '已退回'
  const notSubmitted = submission?.status !== '已提交'
  const auditStages = mapAuditStages(selectedBatch.status, submission?.auditStatus, submission?.status)

  return (
    <main className="rr-page rr-page--detail" data-ds-business-page="r-review">
      <DSSubPageHeader
        className="rr-top-header"
        title={<span className="rr-header-title">{activeRecord?.name} {activeRecord?.jobNo}</span>}
        backLabel="返回"
        onBack={backToList}
        surface={false}
        actions={<>
          <DSButton variant="link" onClick={() => { setFlowOpen(true); setFlowTab('flow') }}><span className="rr-flow-entry-label">流程动态</span><span className="rr-flow-entry-current">{getCurrentStageText(auditStages)}</span><span className="rr-flow-entry-arrow">›</span></DSButton>
          <DSButton variant="default" onClick={() => setMoreOpen(true)}>更多信息</DSButton>
        </>}
      />
      <div className="rr-detail-page">
        {notSubmitted && <div className="rr-hint-bar"><span className="rr-hint-bar__text">该教师本次{activeRecord?.submissionStatus}，无法审核。可在名单页点击「催交」提醒。</span></div>}
        {activeRecord && <div className="rr-teaching-info-wrap"><TeachingInfoPage className="rr-teaching-info" pageId="r-review-teaching-info" hideHeader readOnly /></div>}

        <div className="rr-footer-actions">
          {isAudited ? (
            <>
              <span className="rr-audit-summary">
                {submission.auditStatus === '已通过' ? (<>{submission.auditStatus} <strong>{submission.score}</strong> 分{submission.scorer ? <em>· {submission.scorer}</em> : null}</>) : (<>{submission.auditStatus}{submission.scorer ? <em>· {submission.scorer}</em> : null}</>)}
              </span>
              {selectedBatch.status === '评审中' && <DSButton onClick={() => { setDetailMode('audit'); setAuditDraft({ action: submission.auditStatus === '已通过' ? 'pass' : 'return', score: submission.score ?? '', comment: submission.comment ?? '' }); setAuditModalOpen(true) }}>修改审核</DSButton>}
            </>
          ) : canAudit ? (
            <>
              <DSButton variant="primary" onClick={() => { setAuditDraft({ action: 'pass', score: '', comment: '' }); setAuditModalOpen(true) }}>审核操作</DSButton>
            </>
          ) : null}
        </div>

        {auditModalOpen && (
          <DSModal open title="审核操作" okText="确认" okDisabled={auditDraft.action === 'pass' ? !auditDraft.score : !auditDraft.comment} onCancel={() => setAuditModalOpen(false)} onOk={submitAudit}>
            <div className="rr-audit-modal">
              <div className="rr-audit-modal__people">
                <div className="rr-audit-modal__people-title">被审核人</div>
                <div className="rr-audit-modal__people-list">
                  <span className="rr-audit-modal__person">{activeRecord?.name}（{activeRecord?.jobNo}）</span>
                </div>
              </div>
              <DSEditField label="审核结论" required><DSRadioGroup options={[{ value: 'pass', label: '通过' }, { value: 'return', label: '退回' }]} value={auditDraft.action} onChange={(val) => setAuditDraft((p) => ({ ...p, action: val }))} /></DSEditField>
              {auditDraft.action === 'pass' && (
                <div className="rr-audit-modal__form">
                  <DSEditField label={`总分（满分 ${selectedBatch.fullScore}）`} required><DSInput type="number" min={0} max={selectedBatch.fullScore} placeholder={`请输入 0-${selectedBatch.fullScore} 的总分`} value={auditDraft.score} onChange={(e) => setAuditDraft((p) => ({ ...p, score: e.target.value }))} /></DSEditField>
                  <DSEditField label="通过意见" fullWidth><DSTextarea rows={4} placeholder="请输入通过意见（选填）" value={auditDraft.comment} onChange={(e) => setAuditDraft((p) => ({ ...p, comment: e.target.value }))} /></DSEditField>
                </div>
              )}
              {auditDraft.action === 'return' && (
                <div className="rr-audit-modal__form">
                  <DSEditField label="退回意见" required fullWidth><DSTextarea rows={5} placeholder="请输入退回意见，说明需补充或修改的内容" value={auditDraft.comment} onChange={(e) => setAuditDraft((p) => ({ ...p, comment: e.target.value }))} /></DSEditField>
                </div>
              )}
            </div>
          </DSModal>
        )}

        <DSDrawer open={flowOpen} title="审核流程" size="large" showFooter={false} className="rr-flow-drawer" onClose={() => setFlowOpen(false)}>
          <div className="flow-section-title">
            <span className="title-left"><span className="title-bar"></span><span>{flowTab === 'flow' ? '流程动态' : '流程图'}</span></span>
            <button className="switch-log" type="button" onClick={() => setFlowTab((t) => t === 'flow' ? 'graph' : 'flow')}>{flowTab === 'flow' ? '切换流程图' : '切换流程动态'}</button>
          </div>
          {flowTab === 'flow' && (
            <section className="ds-audit-flow ds-audit-flow--vertical">
              <ol className="ds-audit-flow__track">
                {auditStages.map((stage) => (
                  <li key={stage.key} className={`ds-audit-flow__node is-${stage.status === 'passed' ? 'finish' : stage.status === 'processing' ? 'process' : 'wait'}`}>
                    <span className="ds-audit-flow__connector" aria-hidden="true"></span>
                    <span className="ds-audit-flow__icon">{stage.status === 'passed' ? '✓' : ''}</span>
                    <div className="ds-audit-flow__body">
                      <div className="ds-audit-flow__title-row"><strong className="ds-audit-flow__name">{stage.name}</strong><span className="ds-audit-flow__tag">{stage.tag}</span></div>
                      <span className="ds-audit-flow__assignee">{stage.assignee}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {flowTab === 'graph' && (
            <section className="rr-flow-graph">
              <svg viewBox="0 0 1000 120" className="rr-flow-graph__svg">
                {auditStages.map((stage, i) => {
                  const x = 100 + i * 200
                  const y = 50
                  const r = 16
                  const isPassed = stage.status === 'passed'
                  const isProcessing = stage.status === 'processing'
                  const cStyle = { fill: isPassed ? 'var(--ds-color-success)' : isProcessing ? 'var(--ds-color-primary)' : 'transparent', stroke: isPassed || isProcessing ? (isPassed ? 'var(--ds-color-success)' : 'var(--ds-color-primary)') : 'var(--ds-color-border-tertiary)', strokeWidth: 2 }
                  const lStyle = { stroke: isPassed ? 'var(--ds-color-success)' : 'var(--ds-color-border-tertiary)', strokeWidth: 2, strokeDasharray: isPassed ? '' : '4,4' }
                  return (
                    <g key={stage.key}>
                      {i < auditStages.length - 1 && <line x1={x + r + 8} y1={y} x2={x + 200 - r - 8} y2={y} style={lStyle} />}
                      <circle cx={x} cy={y} r={r} style={cStyle} />
                      {isPassed && <text x={x} y={y + 5} textAnchor="middle" style={{ fill: 'var(--ds-color-bg-container)', fontSize: 14, fontWeight: 'bold' }}>✓</text>}
                      <text x={x} y={y + 40} textAnchor="middle" style={{ fill: 'var(--ds-color-text)', fontSize: 12 }}>{stage.name}</text>
                      <text x={x} y={y + 58} textAnchor="middle" style={{ fill: isProcessing ? 'var(--ds-color-primary)' : 'var(--ds-color-text-tertiary)', fontSize: 11 }}>{stage.tag}</text>
                    </g>
                  )
                })}
              </svg>
            </section>
          )}
        </DSDrawer>

        {/* 查看更多信息抽屉（顶部一级分组页签） */}
        <MoreInfoDrawer open={moreOpen} name={activeRecord?.name} onClose={() => setMoreOpen(false)} />
      </div>
    </main>
  )
}

createRoot(document.getElementById('app')).render(<ReviewPage />)
