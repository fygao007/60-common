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
import './c-review.css'

// 「更多信息」抽屉顶部一级分组页签：teaching-info 沿用本角色审核视角，其余复用 teacher 子页
const ARCHIVE_TABS = [
  { key: 'teaching-info', label: '教学信息', empty: true },
]

// === 专业群带头人本人信息 ===
const PROFILE = {
  name: '李建国',
  college: '电子与通信工程学院',
  department: '电子信息工程专业群',
}

// === 本系教师名单 ===
const TEACHERS = [
  { id: 't-101', name: '金晓智', jobNo: '20201101' },
  { id: 't-102', name: '王芳', jobNo: '20191045' },
  { id: 't-103', name: '陈建军', jobNo: '20180230' },
  { id: 't-104', name: '刘晓燕', jobNo: '20211189' },
  { id: 't-105', name: '张伟', jobNo: '20261231' },
]

// === 可评审批次 ===
const AUDIT_BATCHES = [
  {
    id: 'batch-2025f',
    name: '2025 秋季学期教学档案评审',
    semester: '2025-2026学年 秋季学期',
    endDate: '2026-02-01',
    fullScore: 100,
    status: '评审中',
  },
  {
    id: 'batch-2025s',
    name: '2025 春季学期教学档案考核',
    semester: '2024-2025学年 春季学期',
    endDate: '2025-07-05',
    fullScore: 100,
    status: '已完结',
  },
  {
    id: 'batch-2026s',
    name: '2026 春季学期教学档案考核',
    semester: '2025-2026学年 春季学期',
    endDate: '2026-07-10',
    fullScore: 100,
    status: '提交中',
  },
]

const SCORER_LABEL = `${PROFILE.name}（${PROFILE.department} 专业群带头人）`

// === 提交与审核记录（教师 × 批次） ===
const SUBMISSIONS = [
  { batchId: 'batch-2026s', teacherId: 't-101', status: '已提交', submitTime: '2026-06-20', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2026s', teacherId: 't-102', status: '未提交', submitTime: '-', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2026s', teacherId: 't-103', status: '已提交', submitTime: '2026-06-25', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2026s', teacherId: 't-104', status: '未提交', submitTime: '-', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2026s', teacherId: 't-105', status: '已提交', submitTime: '2026-06-28', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },

  { batchId: 'batch-2025f', teacherId: 't-101', status: '已提交', submitTime: '2026-01-15', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2025f', teacherId: 't-102', status: '逾期未交', submitTime: '-', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2025f', teacherId: 't-103', status: '已提交', submitTime: '2026-01-18', auditStatus: '已通过', score: 88, comment: '课程设计材料详实，任职记录清晰，建议补充企业实践佐证材料。', scorer: SCORER_LABEL, scoreTime: '2026-01-25' },
  { batchId: 'batch-2025f', teacherId: 't-104', status: '已提交', submitTime: '2026-01-20', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2025f', teacherId: 't-105', status: '已提交', submitTime: '2026-01-22', auditStatus: '已退回', score: null, comment: '课程设计部分材料缺失，请补充教学实施过程佐证后重新提交。', scorer: SCORER_LABEL, scoreTime: '2026-01-24' },

  { batchId: 'batch-2025s', teacherId: 't-101', status: '已提交', submitTime: '2025-06-25', auditStatus: '已通过', score: 90, comment: '教学反思深入，成果材料完整。', scorer: SCORER_LABEL, scoreTime: '2025-07-18' },
  { batchId: 'batch-2025s', teacherId: 't-102', status: '已提交', submitTime: '2025-06-26', auditStatus: '已通过', score: 85, comment: '材料基本完整，课程设计部分略显简单。', scorer: SCORER_LABEL, scoreTime: '2025-07-18' },
  { batchId: 'batch-2025s', teacherId: 't-103', status: '已提交', submitTime: '2025-06-27', auditStatus: '已通过', score: 92, comment: '教学科研成果突出，任职记录详实。', scorer: SCORER_LABEL, scoreTime: '2025-07-19' },
  { batchId: 'batch-2025s', teacherId: 't-104', status: '逾期未交', submitTime: '-', auditStatus: '待审核', score: null, comment: null, scorer: null, scoreTime: null },
  { batchId: 'batch-2025s', teacherId: 't-105', status: '已提交', submitTime: '2025-06-28', auditStatus: '已通过', score: 88, comment: '整体材料扎实，建议持续积累社会服务类材料。', scorer: SCORER_LABEL, scoreTime: '2025-07-19' },
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

function notify(message) {
  if (typeof window.toast === 'function') window.toast(message, 'ok')
}

// 计数：某批次下的待审核/全部教师数
function rosterRowsCountByTab(batchId, tab) {
  let n = 0
  for (const teacher of TEACHERS) {
    const submission = SUBMISSIONS.find((item) => item.batchId === batchId && item.teacherId === teacher.id)
    if (tab === 'pending') {
      if (submission?.status === '已提交' && submission?.auditStatus === '待审核') n += 1
    } else {
      n += 1
    }
  }
  return n
}

// ========================================================================
// 流程审批节点
// ========================================================================
const AUDIT_NODES = [
  { key: 'unit', name: '所在单位审核', assignee: '专业群带头人审核' },
  { key: 'hr', name: '人事处审核', assignee: '人事处审核员' },
  { key: 'leader', name: '分管领导审批', assignee: '分管校领导' },
  { key: 'president', name: '校长审批', assignee: '校长' },
]

const STAGE_TAG = { passed: '已通过', processing: '审核中', pending: '未开始' }

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
    if (index >= 1) {
      if (batchStatus === '已完结') status = 'passed'
      else if (unitPassed && index === 1) status = 'processing'
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

// ========================================================================
// 其他业绩数据
// ========================================================================
const ACHIEVEMENTS_SECTIONS = [
  { key: 'teaching-project', title: '教研项目', columns: ['项目名称', '项目类型', '开始时间', '结束时间', '本人角色'], rows: [['高职数据结构课程项目化教学改革', '校级教改', '2025-03-01', '2025-12-31', '主持']] },
  { key: 'award', title: '获奖', columns: ['获奖成果名称', '奖励名称', '获奖级别', '获奖日期', '颁奖单位'], rows: [['职业教育智能学习分析平台建设', '广东省教学成果奖', '省级二等奖', '2025-09-10', '广东省教育厅']] },
  { key: 'paper', title: '论文', columns: ['论文名称', '刊物名称', '刊物级别', '发表日期', '本人排名'], rows: [['基于学习画像的高职课程质量改进研究', '职业技术教育', '中文核心', '2025-04-12', '1/4']] },
]

const ENTERPRISE_PRACTICE_SECTIONS = [
  { key: 'practice', title: '企业实践', columns: ['企业名称', '所属行业', '实践开始时间', '实践结束时间', '实践内容'], rows: [['联科精密电子股份有限公司', '科技行业', '2025-01-01', '2025-02-01', '参与智能硬件测试流程、生产现场工艺诊断与岗位能力调研。']] },
]

const SOCIAL_SERVICE_SECTIONS = [
  { key: 'tech-service', title: '技术服务', columns: ['项目名称', '合作类型', '合作级别', '合作开始日期', '合作结束日期'], rows: [['中小企业数字化转型咨询', '横向课题', '市级', '2024-05-01', '2024-12-31']] },
  { key: 'expert', title: '专家聘任', columns: ['任职机构名称', '任职类型', '任职级别', '入选日期'], rows: [['广东省职业教育评审专家库', '评审专家', '省级', '2024-03-01']] },
]

const APPOINTMENT_SECTIONS = [
  { key: 'head-teacher', title: '担任班主任情况', columns: ['服务名称', '服务单位', '时间', '内容'], rows: [['2024级软件技术1班班主任', '深圳职业技术大学', '2024-09 至 2025-07', '负责班级日常管理与学风建设']] },
  { key: 'mentor-new-teacher', title: '指导新教师情况', columns: ['新教师名称', '指导周期', '指导开始日期', '指导结束日期'], rows: [['李敏', '一年', '2024-09-01', '2025-08-31']] },
]

const ACHIEVEMENT_GROUPS = [
  { key: 'achievements-honors', title: '成果与荣誉', kind: 'table', data: ACHIEVEMENTS_SECTIONS },
  { key: 'enterprise-practice', title: '企业实践', kind: 'table', data: ENTERPRISE_PRACTICE_SECTIONS },
  { key: 'social-service', title: '社会服务与影响力', kind: 'table', data: SOCIAL_SERVICE_SECTIONS },
  { key: 'appointment', title: '任职情况', kind: 'table', data: APPOINTMENT_SECTIONS },
]

function buildTableColumns(section) {
  return section.columns.map((title, index) => ({ key: `col-${index}`, dataIndex: `col-${index}`, title, minWidth: title.length >= 6 ? 160 : 120 }))
}

function buildTableData(section) {
  return section.rows.map((row, rowIndex) => row.reduce((record, value, columnIndex) => ({ ...record, [`col-${columnIndex}`]: value }), { id: `${section.key}-${rowIndex}` }))
}

function TableGroupSection({ sections }) {
  return (
    <div className="cr-more-table-groups">
      {sections.map((section) => (
        <div className="cr-more-sub-section" id={section.key} key={section.key}>
          <div className="cr-more-sub-head"><h4 className="cr-more-sub-title">{section.title}</h4></div>
          <DSDataTable columns={buildTableColumns(section)} data={buildTableData(section)} rowKey="id" selectable={false} showToolbar={false} tableTools={false} className="cr-more-table" minWidth={640} />
        </div>
      ))}
    </div>
  )
}

// 「更多信息」抽屉：顶部一级分组页签 + 复用 teacher 子页
function MoreInfoDrawer({ open, name, onClose }) {
  const [activeKey, setActiveKey] = useState(ARCHIVE_TABS[0].key)
  const active = ARCHIVE_TABS.find((tab) => tab.key === activeKey) || ARCHIVE_TABS[0]
  const ActiveComp = active.Comp
  return (
    <DSDrawer open={open} title={`${name || ''} · 教学档案详情`} width="80vw" showFooter={false} className="cr-more-drawer is-more-drawer" bodyPadding="none" onClose={onClose}>
      <div className="cr-more-tabs">
        <DSTabs items={ARCHIVE_TABS.map(({ key, label }) => ({ key, label }))} activeKey={activeKey} onChange={setActiveKey} />
      </div>
      <div className="cr-more-pane">
        {active.empty ? <div className="cr-more-empty">暂无数据</div> : (ActiveComp ? <ActiveComp hideHeader /> : null)}
      </div>
    </DSDrawer>
  )
}

function MajorReviewPage() {
  const [selectedBatchId, setSelectedBatchId] = useState(AUDIT_BATCHES.find((batch) => batch.status === '评审中')?.id || AUDIT_BATCHES[0].id)
  const [view, setView] = useState('list')
  const [activeRecord, setActiveRecord] = useState(null)
  const [detailMode, setDetailMode] = useState('view')
  const [auditDraft, setAuditDraft] = useState({ action: 'pass', score: '', comment: '' })
  const [batchSwitcherOpen, setBatchSwitcherOpen] = useState(false)
  const [filters, setFilters] = useState({ keyword: '', status: '全部' })
  const [listTab, setListTab] = useState('pending')
  // 批量审核
  const [selectedKeys, setSelectedKeys] = useState([])
  const [batchAuditOpen, setBatchAuditOpen] = useState(false)
  const [batchAuditDraft, setBatchAuditDraft] = useState({ action: 'pass', score: '', comment: '' })
  // 单条审核弹窗
  const [auditModalOpen, setAuditModalOpen] = useState(false)
  // 详情页抽屉
  const [flowOpen, setFlowOpen] = useState(false)
  const [flowTab, setFlowTab] = useState('flow')
  const [moreOpen, setMoreOpen] = useState(false)
  // 审核版本号：每次审核(单条/批量)后递增，强制名单 useMemo 重算
  const [auditVersion, setAuditVersion] = useState(0)

  const selectedBatch = AUDIT_BATCHES.find((batch) => batch.id === selectedBatchId)

  // 名单（按筛选条件 + 列表页签过滤）
  const rosterRows = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    return TEACHERS.filter((teacher) => {
      if (keyword && ![teacher.name, teacher.jobNo].some((v) => v.toLowerCase().includes(keyword))) return false
      return true
    }).map((teacher) => {
      const submission = SUBMISSIONS.find((item) => item.batchId === selectedBatchId && item.teacherId === teacher.id)
      const status = submission?.status || '未提交'
      if (listTab === 'pending') {
        if (status !== '已提交') return null
        if (submission?.auditStatus !== '待审核') return null
      }
      if (filters.status !== '全部') {
        if (filters.status === '未提交' && status !== '未提交' && status !== '逾期未交') return null
        if (filters.status === '已提交' && status !== '已提交') return null
        if (filters.status === '待审核' && submission?.auditStatus !== '待审核') return null
        if (filters.status === '已通过' && submission?.auditStatus !== '已通过') return null
        if (filters.status === '已退回' && submission?.auditStatus !== '已退回') return null
      }
      return { id: teacher.id, name: teacher.name, jobNo: teacher.jobNo, submissionStatus: status, submitTime: submission?.submitTime || '-', auditStatus: submission?.auditStatus || '待审核', score: submission?.score }
    }).filter(Boolean)
  }, [selectedBatchId, filters, listTab, auditVersion])

  const pendingCount = useMemo(() => rosterRowsCountByTab(selectedBatchId, 'pending'), [selectedBatchId, auditVersion])
  const allCount = useMemo(() => rosterRowsCountByTab(selectedBatchId, 'all'), [selectedBatchId, auditVersion])

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

  const urgeTeacher = (record) => notify(`已向「${record.name}」发送催交提醒`)

  // 单条审核提交
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

  // 批量审核提交
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

  const switchBatch = (batchId) => {
    setSelectedBatchId(batchId)
    setBatchSwitcherOpen(false)
    setFilters({ keyword: '', status: '全部' })
    setListTab('pending')
    setSelectedKeys([])
    notify('已切换至当前批次')
  }

  const rosterColumns = [
    { key: 'name', dataIndex: 'name', title: '姓名', width: 110, fixed: 'left' },
    { key: 'jobNo', dataIndex: 'jobNo', title: '工号', width: 120 },
    { key: 'submissionStatus', dataIndex: 'submissionStatus', title: '提交状态', width: 110, render: (value) => <DSTag tone={submissionStatusTone(value)}>{value}</DSTag> },
    { key: 'auditStatus', dataIndex: 'auditStatus', title: '审核状态', width: 110, render: (value, record) => (record.submissionStatus === '已提交' ? <DSTag tone={auditStatusTone(value)}>{value}</DSTag> : <span className="cr-empty-cell">—</span>) },
    { key: 'score', dataIndex: 'score', title: '得分', width: 90, render: (value) => (value ? `${value}` : <span className="cr-empty-cell">—</span>) },
  ]

  const rosterActions = useMemo(() => {
    const actions = [{ key: 'detail', label: '详情', onClick: (record) => openDetail(record, record.auditStatus !== '待审核' || selectedBatch.status !== '评审中' ? 'view' : 'audit') }]
    if (selectedBatch.status === '提交中') actions.push({ key: 'urge', label: '催交', onClick: (record) => urgeTeacher(record), disabled: (record) => record.submissionStatus === '已提交' })
    return actions
  }, [selectedBatch.status])

  // 列表视图
  if (view === 'list') {
    // 待审核 tab 只有"关键字"筛选（状态单一无意义）；全部 tab 保留"状态"筛选
    const filterFields = listTab === 'pending'
      ? [
        { key: 'keyword', label: '关键字', type: 'text', placeholder: '姓名 / 工号', controlledValue: filters.keyword, onChange: (event) => setFilters((prev) => ({ ...prev, keyword: event.target.value })) },
      ]
      : [
        { key: 'keyword', label: '关键字', type: 'text', placeholder: '姓名 / 工号', controlledValue: filters.keyword, onChange: (event) => setFilters((prev) => ({ ...prev, keyword: event.target.value })) },
        { key: 'status', label: '状态', type: 'select', clearable: true, placeholder: '全部状态', options: ['全部', '未提交', '已提交', '待审核', '已通过', '已退回'], controlledValue: filters.status, onChange: (value) => setFilters((prev) => ({ ...prev, status: value || '全部' })) },
      ]
    const listTabs = [
      { key: 'pending', label: `待审核`, count: pendingCount },
      { key: 'all', label: '全部', count: allCount },
    ]

    // 批量审核目标人员（按勾选的 teacherId 映射回名单）
    const batchTargets = rosterRows.filter((r) => selectedKeys.includes(r.id))

    return (
      <main className="cr-page" data-ds-business-page="c-review">
        <div className="cr-list-wrap">
          <DSRegularListTemplate
            flush
            tabs={listTabs}
            activeTab={listTab}
            onTabChange={(key) => { setListTab(key); setFilters((prev) => ({ ...prev, status: '全部' })); setSelectedKeys([]) }}
            metaLabel="当前批次"
            metaValue={`${selectedBatch.name}（${selectedBatch.status}）· 待审 ${pendingCount} 条`}
            onMetaClick={() => setBatchSwitcherOpen(true)}
            notice=""
            filterProps={{ fields: filterFields, onReset: () => setFilters({ keyword: '', status: '全部' }), showExpand: false, showMore: false }}
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
              onSelectRow: (key, checked) => setSelectedKeys((prev) => checked ? [...prev, key] : prev.filter((k) => k !== key)),
              onSelectAll: (checked, data) => setSelectedKeys(checked ? data.map((r) => r.id) : []),
              showIndex: false,
              minWidth: 800,
            }}
            pagination={null}
            footerActions={[]}
          />
        </div>

        {batchSwitcherOpen && (
          <DSModal open title="切换评审批次" okText="确认" showOk={false} onCancel={() => setBatchSwitcherOpen(false)}>
            <div className="cr-batch-list">
              {AUDIT_BATCHES.map((batch) => (
                <div key={batch.id} className={batch.id === selectedBatchId ? 'cr-batch-item is-active' : 'cr-batch-item'} onClick={() => switchBatch(batch.id)}>
                  <span className="cr-batch-item__name">{batch.name}</span>
                  <DSTag tone={batchStatusTone(batch.status)}>{batch.status}</DSTag>
                </div>
              ))}
            </div>
          </DSModal>
        )}

        {/* 批量审核弹窗 */}
        {batchAuditOpen && (
          <DSModal open title="批量审核" okText="确认" onCancel={() => setBatchAuditOpen(false)} onOk={submitBatchAudit}>
            <div className="cr-audit-modal">
              {/* 被审核人员列表 */}
              <div className="cr-audit-modal__people">
                <div className="cr-audit-modal__people-title">被审核人（{batchTargets.length}）</div>
                <div className="cr-audit-modal__people-list">
                  {batchTargets.map((p) => <span key={p.id} className="cr-audit-modal__person">{p.name}（{p.jobNo}）</span>)}
                </div>
              </div>

              {/* 审核结论：普通单选字段 */}
              <DSEditField label="审核结论" required>
                <DSRadioGroup
                  options={[{ value: 'pass', label: '通过' }, { value: 'return', label: '退回' }]}
                  value={batchAuditDraft.action}
                  onChange={(val) => setBatchAuditDraft((prev) => ({ ...prev, action: val }))}
                />
              </DSEditField>

              {batchAuditDraft.action === 'pass' && (
                <div className="cr-audit-modal__form">
                  <DSEditField label={`总分（满分 ${selectedBatch.fullScore}）`} required>
                    <DSInput type="number" min={0} max={selectedBatch.fullScore} placeholder={`请输入 0-${selectedBatch.fullScore} 的总分`} value={batchAuditDraft.score} onChange={(event) => setBatchAuditDraft((prev) => ({ ...prev, score: event.target.value }))} />
                  </DSEditField>
                  <DSEditField label="通过意见" fullWidth>
                    <DSTextarea rows={4} placeholder="请输入通过意见（选填）" value={batchAuditDraft.comment} onChange={(event) => setBatchAuditDraft((prev) => ({ ...prev, comment: event.target.value }))} />
                  </DSEditField>
                </div>
              )}
              {batchAuditDraft.action === 'return' && (
                <div className="cr-audit-modal__form">
                  <DSEditField label="退回意见" required fullWidth>
                    <DSTextarea rows={5} placeholder="请输入退回意见，说明需补充或修改的内容" value={batchAuditDraft.comment} onChange={(event) => setBatchAuditDraft((prev) => ({ ...prev, comment: event.target.value }))} />
                  </DSEditField>
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
    <main className="cr-page cr-page--detail" data-ds-business-page="c-review">
      <DSSubPageHeader
        className="cr-top-header"
        title={<span className="cr-header-title">{activeRecord?.name} {activeRecord?.jobNo}<DSTag tone={submissionStatusTone(activeRecord?.submissionStatus)}>{activeRecord?.submissionStatus}</DSTag></span>}
        backLabel="返回"
        onBack={backToList}
        surface={false}
        actions={<>
          <DSButton variant="link" onClick={() => { setFlowOpen(true); setFlowTab('flow') }}><span className="cr-flow-entry-label">流程动态</span><span className="cr-flow-entry-current">{getCurrentStageText(auditStages)}</span><span className="cr-flow-entry-arrow">›</span></DSButton>
          <DSButton variant="default" onClick={() => setMoreOpen(true)}>更多信息</DSButton>
        </>}
      />
      <div className="cr-detail-page">
        {notSubmitted && <div className="cr-hint-bar"><span className="cr-hint-bar__text">该教师本次{activeRecord?.submissionStatus}，无法审核。可在名单页点击「催交」提醒。</span></div>}
        {activeRecord && <div className="cr-teaching-info-wrap"><TeachingInfoPage className="cr-teaching-info" pageId="c-review-teaching-info" hideHeader readOnly /></div>}

        {/* 底部审核区：平铺 */}
        <div className="cr-footer-actions">
          {isAudited ? (
            <>
              <span className="cr-audit-summary">
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

        {/* 单条审核弹窗（含被审核人 + 单选 + 分数/意见） */}
        {auditModalOpen && (
          <DSModal open title="审核操作" okText="确认" okDisabled={auditDraft.action === 'pass' ? !auditDraft.score : !auditDraft.comment} onCancel={() => setAuditModalOpen(false)} onOk={submitAudit}>
            <div className="cr-audit-modal">
              <div className="cr-audit-modal__people">
                <div className="cr-audit-modal__people-title">被审核人</div>
                <div className="cr-audit-modal__people-list">
                  <span className="cr-audit-modal__person">{activeRecord?.name}（{activeRecord?.jobNo}）</span>
                </div>
              </div>

              <DSEditField label="审核结论" required>
                <DSRadioGroup
                  options={[{ value: 'pass', label: '通过' }, { value: 'return', label: '退回' }]}
                  value={auditDraft.action}
                  onChange={(val) => setAuditDraft((prev) => ({ ...prev, action: val }))}
                />
              </DSEditField>

              {auditDraft.action === 'pass' && (
                <div className="cr-audit-modal__form">
                  <DSEditField label={`总分（满分 ${selectedBatch.fullScore}）`} required>
                    <DSInput type="number" min={0} max={selectedBatch.fullScore} placeholder={`请输入 0-${selectedBatch.fullScore} 的总分`} value={auditDraft.score} onChange={(event) => setAuditDraft((prev) => ({ ...prev, score: event.target.value }))} />
                  </DSEditField>
                  <DSEditField label="通过意见" fullWidth>
                    <DSTextarea rows={4} placeholder="请输入通过意见（选填）" value={auditDraft.comment} onChange={(event) => setAuditDraft((prev) => ({ ...prev, comment: event.target.value }))} />
                  </DSEditField>
                </div>
              )}
              {auditDraft.action === 'return' && (
                <div className="cr-audit-modal__form">
                  <DSEditField label="退回意见" required fullWidth>
                    <DSTextarea rows={5} placeholder="请输入退回意见，说明需补充或修改的内容" value={auditDraft.comment} onChange={(event) => setAuditDraft((prev) => ({ ...prev, comment: event.target.value }))} />
                  </DSEditField>
                </div>
              )}
            </div>
          </DSModal>
        )}

        {/* 流程动态抽屉 */}
        <DSDrawer open={flowOpen} title="审核流程" size="large" showFooter={false} className="cr-flow-drawer" onClose={() => setFlowOpen(false)}>
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
            <section className="cr-flow-graph">
              <svg viewBox="0 0 800 120" className="cr-flow-graph__svg">
                {auditStages.map((stage, i) => {
                  const x = 100 + i * 200
                  const y = 50
                  const r = 16
                  const isPassed = stage.status === 'passed'
                  const isProcessing = stage.status === 'processing'
                  const circleStyle = { fill: isPassed ? 'var(--ds-color-success)' : isProcessing ? 'var(--ds-color-primary)' : 'transparent', stroke: isPassed || isProcessing ? (isPassed ? 'var(--ds-color-success)' : 'var(--ds-color-primary)') : 'var(--ds-color-border-tertiary)', strokeWidth: 2 }
                  const lineStyle = { stroke: isPassed ? 'var(--ds-color-success)' : 'var(--ds-color-border-tertiary)', strokeWidth: 2, strokeDasharray: isPassed ? '' : '4,4' }
                  return (
                    <g key={stage.key}>
                      {i < auditStages.length - 1 && <line x1={x + r + 8} y1={y} x2={x + 200 - r - 8} y2={y} style={lineStyle} />}
                      <circle cx={x} cy={y} r={r} style={circleStyle} />
                      {isPassed && <text x={x} y={y + 5} textAnchor="middle" style={{ fill: 'var(--ds-color-bg-container)', fontSize: 14, fontWeight: 'bold' }}>✓</text>}
                      <text x={x} y={y + 40} textAnchor="middle" style={{ fill: 'var(--ds-color-text)', fontSize: 13 }}>{stage.name}</text>
                      <text x={x} y={y + 60} textAnchor="middle" style={{ fill: isProcessing ? 'var(--ds-color-primary)' : 'var(--ds-color-text-tertiary)', fontSize: 12 }}>{stage.tag}</text>
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

createRoot(document.getElementById('app')).render(<MajorReviewPage />)
