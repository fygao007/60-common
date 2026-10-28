import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSButton,
  DSDataTable,
  DSDatePicker,
  DSEditField,
  DSFormGroup,
  DSInput,
  DSModal,
  DSRegularListTemplate,
  DSSelect,
  DSSubPageHeader,
  DSSwitch,
  DSTag,
  DSTree,
} from '@wisedu/design-system'
import './audit-batch.css'

// 本院视角：电子与通信工程学院
const COLLEGE = '电子与通信工程学院'

// 本院下设的系（用于发起范围锁定本院各系）
const DEPARTMENTS = [
  { id: 'dep-ei', name: '电子信息工程系', total: 12 },
  { id: 'dep-comm', name: '通信工程系', total: 9 },
  { id: 'dep-info', name: '信息工程系', total: 10 },
]

// 档案分组结构（简化版，仅用于设置内容左树）
const ARCHIVE_GROUPS = [
  {
    id: 'teaching-info', name: '教学信息', nodeType: 'group', children: [
      { id: 'table-courses', displayName: '课程清单', name: 'table_courses', nodeType: 'table', sourceTable: '教务系统', fields: [
        { key: 'courseName', name: '课程名称', type: '单行文本' },
        { key: 'semester', name: '开课学期', type: '单选' },
        { key: 'hours', name: '学时', type: '数字' },
      ] },
      { id: 'table-design', displayName: '课程设计与实施', name: 'table_design', nodeType: 'table', sourceTable: '数据采集', fields: [
        { key: 'design', name: '教学设计', type: '多行文本' },
        { key: 'courseware', name: '课件材料', type: '附件' },
      ] },
      { id: 'table-reflection', displayName: '课程反思', name: 'table_reflection', nodeType: 'table', sourceTable: '数据采集', fields: [
        { key: 'reflection', name: '反思内容', type: '多行文本' },
        { key: 'supportingFile', name: '支撑附件', type: '附件' },
      ] },
    ],
  },
  {
    id: 'achievements-honors', name: '成果与荣誉', nodeType: 'group', children: [
      { id: 'table-achievements', displayName: '教学科研成果', name: 'table_achievements', nodeType: 'table', sourceTable: '数据采集', fields: [
        { key: 'achievementName', name: '成果名称', type: '单行文本' },
        { key: 'achievementType', name: '成果类型', type: '单选' },
        { key: 'awardLevel', name: '获奖等级', type: '单选' },
        { key: 'awardFile', name: '证明材料', type: '附件' },
      ] },
    ],
  },
  {
    id: 'appointment', name: '任职情况', nodeType: 'group', children: [
      { id: 'table-appointment', displayName: '任职记录', name: 'table_appointment', nodeType: 'table', sourceTable: '数据采集', fields: [
        { key: 'position', name: '任职岗位', type: '单行文本' },
        { key: 'department', name: '任职部门', type: '单行文本' },
        { key: 'appointmentRange', name: '任职时间', type: '日期区间' },
      ] },
    ],
  },
]

// 辅助函数：从 archiveGroups 查找表（递归）
function findTableById(groups, tableId) {
  for (const node of groups) {
    if (node.nodeType === 'table' && node.id === tableId) return node
    if (node.children?.length) {
      const found = findTableById(node.children, tableId)
      if (found) return found
    }
  }
  return null
}

// 辅助函数：收集所有「表」节点
function collectTables(groups) {
  const tables = []
  for (const node of groups) {
    if (node.nodeType === 'table') {
      tables.push({ table: node, path: [] })
    } else if (node.children?.length) {
      tables.push(...collectTables(node.children))
    }
  }
  return tables
}

// 审核流全局配置（本地副本）
const initialAuditDefaults = {
  scope: ['教学信息', '成果与荣誉', '任职情况'],
  duration: 20,
  fullScore: 100,
}

const initialAuditSemesters = [
  { id: 'sem-2026s', name: '2025-2026学年 春季学期', current: true, note: '当前进行中的考核学期' },
  { id: 'sem-2025f', name: '2025-2026学年 秋季学期', current: false, note: '已归档' },
  { id: 'sem-2025s', name: '2024-2025学年 春季学期', current: false, note: '已归档' },
]

const initialAuditTemplates = [
  { id: 'tpl-term', name: '学期教学档案考核（标准）', scope: ['教学信息', '成果与荣誉', '任职情况'], duration: 20, note: '每学期末各学院统一发起的标准考核模板。', nodes: ['系初审', '院评审', '校终审'] },
  { id: 'tpl-double-high', name: '双高专业群支撑材料考核', scope: ['教学信息', '成果与荣誉', '企业实践'], duration: 30, note: '面向双高建设专业群的过程性材料考核。', nodes: ['专业群初评', '院评审', '校终审'] },
  { id: 'tpl-new-teacher', name: '青年教师教学成长考核', scope: ['教学信息'], duration: 15, note: '入职三年内青年教师的教学材料专项考核。', nodes: ['指导教师评', '院评审'] },
]

// 本院可选专业（发起范围多选）
const MAJOR_OPTIONS = ['电子信息工程技术', '通信工程', '物联网应用技术', '软件技术', '大数据技术']

// 条件构造器：可选字段 + 操作符
const CONDITION_FIELDS = [
  { value: 'major', label: '专业' },
  { value: 'title', label: '职称' },
  { value: 'department', label: '所属系' },
]
const CONDITION_OPERATORS = [
  { value: 'eq', label: '等于' },
  { value: 'ne', label: '不等于' },
  { value: 'in', label: '属于' },
]
const CONDITION_VALUE_OPTIONS = {
  major: MAJOR_OPTIONS,
  title: ['教授', '副教授', '讲师', '助理教授'],
  department: ['电子信息工程系', '通信工程系', '信息工程系'],
}

// 批次状态色
const auditBatchStatusTone = (status) => ({
  未发布: 'neutral',
  提交中: 'primary',
  评审中: 'warning',
  已完结: 'success',
  已关闭: 'danger',
}[status] || 'neutral')

// 进度按「发起范围内层级单位」聚合：学院=系
const batchScopeUnits = {
  学院: DEPARTMENTS.map((dep) => ({ id: dep.id, name: dep.name, total: dep.total })),
}

function batchTotals(batch) {
  const submitted = batch.progress.reduce((sum, item) => sum + item.submitted, 0)
  const scored = batch.progress.reduce((sum, item) => sum + item.scored, 0)
  const total = batch.progress.reduce((sum, item) => sum + item.total, 0)
  return { submitted, scored, total }
}

function ratio(numerator, denominator) {
  if (!denominator) return 0
  return Math.round((numerator / denominator) * 100)
}

function notify(setMessage, text) {
  setMessage(text)
  window.setTimeout(() => setMessage(''), 1800)
}

function addDays(dateStr, days) {
  const base = new Date(dateStr)
  base.setDate(base.getDate() + Number(days) || 0)
  return base.toISOString().slice(0, 10)
}

function createBatchDraft(auditDefaults, archiveGroups, auditTemplates) {
  const today = new Date().toISOString().slice(0, 10)
  const defaultTables = collectTables(archiveGroups)
    .filter((item) => item.table.sourceTable === '教学档案袋' || item.table.sourceTable === '数据采集')
    .map((item) => ({
      tableId: item.table.id,
      requiredFields: (item.table.fields || []).filter((f) => {
        const perm = f.perGroup?.['全部用户'] || { visible: true, required: false }
        return perm.required
      }).map((f) => f.key),
    }))
  return {
    id: `batch-${Date.now()}`,
    name: '',
    level: 'college',
    scopeType: '学院', // 院级固定学院，只读
    majors: [], // 发起范围：本院可选专业（多选）
    scopeCondition: [], // 选择范围：条件构造器
    semester: '2025-2026学年 春季学期',
    tableScope: defaultTables,
    startDate: today,
    endDate: addDays(today, auditDefaults.duration),
    fullScore: auditDefaults.fullScore,
    flowId: auditTemplates[0]?.id || '',
    scoreStage: auditTemplates[0]?.nodes?.[0] || '',
    status: '未发布',
    progress: batchScopeUnits['学院'].map((unit) => ({ depId: unit.id, submitted: 0, scored: 0, total: unit.total })),
  }
}

// 初始批次数据（本院视角）
const initialBatches = [
  {
    id: 'batch-2026s',
    name: '电子与通信工程学院 2026 春季学期教学档案考核',
    level: 'college',
    scopeType: '学院',
    majors: ['电子信息工程技术', '通信工程', '物联网应用技术'],
    scopeCondition: [{ field: 'title', op: 'ne', value: '助理教授' }],
    semester: '2025-2026学年 春季学期',
    tableScope: [
      { tableId: 'table-courses', requiredFields: ['courseName', 'semester'] },
      { tableId: 'table-achievements', requiredFields: ['achievementName', 'awardLevel'] },
      { tableId: 'table-appointment', requiredFields: ['position'] },
    ],
    startDate: '2026-06-15',
    endDate: '2026-07-10',
    fullScore: 100,
    flowId: 'tpl-term',
    scoreStage: '院评审',
    status: '提交中',
    progress: [
      { depId: 'dep-ei', submitted: 8, scored: 0, total: 12 },
      { depId: 'dep-comm', submitted: 5, scored: 0, total: 9 },
      { depId: 'dep-info', submitted: 6, scored: 0, total: 10 },
    ],
  },
  {
    id: 'batch-2025f',
    name: '电子与通信工程学院 2025 秋季学期教学档案评审',
    level: 'college',
    scopeType: '学院',
    majors: ['通信工程', '物联网应用技术'],
    scopeCondition: [{ field: 'title', op: 'eq', value: '副教授' }],
    semester: '2025-2026学年 秋季学期',
    tableScope: [
      { tableId: 'table-courses', requiredFields: ['courseName', 'semester'] },
      { tableId: 'table-achievements', requiredFields: ['achievementName', 'awardLevel'] },
      { tableId: 'table-appointment', requiredFields: ['position'] },
    ],
    startDate: '2026-01-10',
    endDate: '2026-02-01',
    fullScore: 100,
    flowId: 'tpl-term',
    scoreStage: '院评审',
    status: '评审中',
    progress: [
      { depId: 'dep-ei', submitted: 11, scored: 7, total: 12 },
      { depId: 'dep-comm', submitted: 8, scored: 5, total: 9 },
      { depId: 'dep-info', submitted: 9, scored: 6, total: 10 },
    ],
  },
  {
    id: 'batch-2025s',
    name: '电子与通信工程学院 2025 春季学期教学档案考核',
    level: 'college',
    scopeType: '学院',
    majors: ['电子信息工程技术', '通信工程', '软件技术', '大数据技术'],
    scopeCondition: [],
    semester: '2024-2025学年 春季学期',
    tableScope: [
      { tableId: 'table-courses', requiredFields: ['courseName', 'semester'] },
      { tableId: 'table-achievements', requiredFields: ['achievementName', 'awardLevel'] },
      { tableId: 'table-appointment', requiredFields: ['position'] },
    ],
    startDate: '2025-06-10',
    endDate: '2025-07-05',
    fullScore: 100,
    flowId: 'tpl-term',
    scoreStage: '院评审',
    status: '已完结',
    progress: [
      { depId: 'dep-ei', submitted: 12, scored: 12, total: 12 },
      { depId: 'dep-comm', submitted: 9, scored: 9, total: 9 },
      { depId: 'dep-info', submitted: 10, scored: 10, total: 10 },
    ],
  },
]

function AuditBatchWorkbench({ archiveGroups, auditDefaults, auditTemplates, semesterOptions }) {
  const [batches, setBatches] = useState(initialBatches)
  const [view, setView] = useState('list')
  const [activeBatchId, setActiveBatchId] = useState(null)
  const [detailDraft, setDetailDraft] = useState(null)
  const [selectedTableKey, setSelectedTableKey] = useState(null)
  const [confirmConfig, setConfirmConfig] = useState(null)
  const [message, setMessage] = useState('')
  const [filters, setFilters] = useState({ name: '', scope: '全部' })

  const showMessage = (text) => notify(setMessage, text)
  const isEditable = detailDraft?.status === '未发布'

  // 从 tableScope 反查一级分组名称（用于列表展示）
  // 筛选后的列表数据
  const filteredRows = useMemo(() => {
    return batches.filter((batch) => {
      if (filters.name && !batch.name.toLowerCase().includes(filters.name.toLowerCase())) return false
      if (filters.scope !== '全部') {
        if (!batch.majors?.includes(filters.scope)) return false
      }
      return true
    }).map((batch) => {
      const { submitted, scored, total } = batchTotals(batch)
      return {
        ...batch,
        submitRate: ratio(submitted, total),
        scoreRate: ratio(scored, submitted),
        submitted,
        scored,
        total,
      }
    })
  }, [batches, filters])

  // 进入详情页：从 batch 深拷贝草稿
  const enterDetail = (batch) => {
    const draft = JSON.parse(JSON.stringify(batch))
    draft.tableScope = (draft.tableScope || []).map((item) => ({ tableId: item.tableId, requiredFields: [...(item.requiredFields || [])] }))
    draft.majors = [...(draft.majors || [])]
    draft.scopeCondition = (draft.scopeCondition || []).map((c) => ({ ...c }))
    setActiveBatchId(batch.id)
    setDetailDraft(draft)
    setSelectedTableKey((draft.tableScope[0]?.tableId) || null)
    setView('detail')
  }

  // 新建批次：建未发布空草稿，直接进详情页
  const openCreate = () => {
    const draft = { ...createBatchDraft(auditDefaults, archiveGroups, auditTemplates) }
    draft.id = `batch-${Date.now()}`
    draft.tableScope = []
    enterDetail(draft)
  }

  const copyBatch = (batch) => {
    const copy = {
      ...batch,
      id: `batch-${Date.now()}`,
      name: `${batch.name}（副本）`,
      status: '未发布',
      progress: batchScopeUnits['学院'].map((unit) => ({ depId: unit.id, submitted: 0, scored: 0, total: unit.total })),
      tableScope: (batch.tableScope || []).map((item) => ({ tableId: item.tableId, requiredFields: [...(item.requiredFields || [])] })),
    }
    setBatches((current) => [copy, ...current])
    showMessage('已复制为未发布批次')
  }

  const applyConfirm = () => {
    if (!confirmConfig) return
    const { batchId, mode } = confirmConfig
    if (mode === 'delete') {
      const target = batches.find((item) => item.id === batchId)
      if (target?.status !== '未发布') {
        showMessage('仅未发布批次支持删除')
      } else {
        setBatches((current) => current.filter((item) => item.id !== batchId))
        showMessage('批次已删除')
      }
    }
    setConfirmConfig(null)
  }

  const askConfirm = (record, mode) => setConfirmConfig({ batchId: record.id, mode, name: record.name })

  // —— 详情页草稿编辑（全部改 detailDraft，不直接改 batches）——
  const changeDetailField = (key, value) => {
    if (!isEditable) return
    setDetailDraft((current) => {
      if (!current) return current
      const next = { ...current, [key]: value }
      // 切换设置流程时，打分环节重置为新流程的第一个节点
      if (key === 'flowId') {
        const tpl = auditTemplates.find((item) => item.id === value)
        next.scoreStage = tpl?.nodes?.[0] || ''
      }
      return next
    })
  }

  // —— 条件构造器：增删改行 ——
  const addCondition = () => {
    if (!isEditable) return
    setDetailDraft((current) => {
      if (!current) return current
      const next = [...(current.scopeCondition || []), { field: CONDITION_FIELDS[0].value, op: CONDITION_OPERATORS[0].value, value: '' }]
      return { ...current, scopeCondition: next }
    })
  }
  const updateCondition = (index, key, value) => {
    if (!isEditable) return
    setDetailDraft((current) => {
      if (!current) return current
      const next = (current.scopeCondition || []).map((item, i) => (i === index ? { ...item, [key]: value } : item))
      return { ...current, scopeCondition: next }
    })
  }
  const removeCondition = (index) => {
    if (!isEditable) return
    setDetailDraft((current) => {
      if (!current) return current
      const next = (current.scopeCondition || []).filter((_, i) => i !== index)
      return { ...current, scopeCondition: next }
    })
  }

  // 表勾选（纳入/移除 tableScope），作用于 detailDraft
  const toggleTableSelected = (tableId, checked) => {
    if (!isEditable) return
    setDetailDraft((current) => {
      if (!current) return current
      let nextScope = [...(current.tableScope || [])]
      if (checked) {
        const table = findTableById(archiveGroups, tableId)
        nextScope.push({
          tableId,
          requiredFields: (table?.fields || []).filter((f) => {
            const perm = f.perGroup?.['全部用户'] || { visible: true, required: false }
            return perm.required
          }).map((f) => f.key),
        })
      } else {
        nextScope = nextScope.filter((item) => item.tableId !== tableId)
      }
      return { ...current, tableScope: nextScope }
    })
  }

  // 切字段本次必填
  const toggleFieldRequired = (fieldKey, required) => {
    if (!isEditable || !selectedTableKey) return
    setDetailDraft((current) => {
      if (!current) return current
      return {
        ...current,
        tableScope: (current.tableScope || []).map((item) => {
          if (item.tableId !== selectedTableKey) return item
          const nextFields = required
            ? [...new Set([...(item.requiredFields || []), fieldKey])]
            : (item.requiredFields || []).filter((k) => k !== fieldKey)
          return { ...item, requiredFields: nextFields }
        }),
      }
    })
  }

  // 全部必填/全部选填
  const setAllFieldsRequired = (required) => {
    if (!isEditable || !selectedTableKey) return
    const table = findTableById(archiveGroups, selectedTableKey)
    const allFieldKeys = (table?.fields || []).map((f) => f.key)
    setDetailDraft((current) => {
      if (!current) return current
      return {
        ...current,
        tableScope: (current.tableScope || []).map((item) => {
          if (item.tableId !== selectedTableKey) return item
          return { ...item, requiredFields: required ? allFieldKeys : [] }
        }),
      }
    })
  }

  // 5 条校验
  const validateDetail = () => {
    const d = detailDraft
    if (!d) return false
    if (!d.name?.trim()) { showMessage('批次名称不能为空'); return false }
    if (!(d.majors?.length)) { showMessage('请选择发起范围（专业）'); return false }
    if (!d.startDate || !d.endDate) { showMessage('请选择提交时间'); return false }
    if (d.endDate < d.startDate) { showMessage('截止时间需晚于或等于开始时间'); return false }
    if (!d.fullScore || Number(d.fullScore) < 1) { showMessage('评分满分需 ≥ 1'); return false }
    if (!d.flowId) { showMessage('请选择设置流程'); return false }
    if (!d.scoreStage) { showMessage('请选择打分环节'); return false }
    if (!(d.tableScope?.length)) { showMessage('请至少选择一张提交的表'); return false }
    return true
  }

  // 保存：写回 batches，留详情页
  const saveDetail = () => {
    if (!validateDetail()) return
    const next = { ...detailDraft, fullScore: Number(detailDraft.fullScore) }
    setBatches((current) => {
      const exists = current.some((item) => item.id === next.id)
      return exists
        ? current.map((item) => (item.id === next.id ? { ...item, ...next } : item))
        : [next, ...current]
    })
    setDetailDraft(next)
    showMessage('已保存')
  }

  // 发布：写回 + status=提交中，返回列表
  const publishDetail = () => {
    if (!validateDetail()) return
    const next = { ...detailDraft, fullScore: Number(detailDraft.fullScore), status: '提交中' }
    setBatches((current) => {
      const exists = current.some((item) => item.id === next.id)
      return exists
        ? current.map((item) => (item.id === next.id ? { ...item, ...next } : item))
        : [next, ...current]
    })
    showMessage('批次已发布，本院教师待办已生成')
    setView('list')
  }

  // 详情页派生数据（基于 detailDraft）
  const selectedTableKeys = useMemo(() => (detailDraft?.tableScope || []).map((item) => item.tableId), [detailDraft])

  const currentTable = useMemo(() => findTableById(archiveGroups, selectedTableKey), [archiveGroups, selectedTableKey])
  const currentTableVisible = Boolean(currentTable && selectedTableKeys.includes(currentTable.id))
  const flowOptions = useMemo(() => auditTemplates.map((item) => ({ label: item.name, value: item.id })), [auditTemplates])
  const currentFlowName = useMemo(
    () => auditTemplates.find((item) => item.id === detailDraft?.flowId)?.name || '-',
    [auditTemplates, detailDraft?.flowId],
  )
  // 当前流程的打分环节选项（只用该流程配置的节点）
  const currentFlowNodes = useMemo(() => {
    const tpl = auditTemplates.find((item) => item.id === detailDraft?.flowId)
    return tpl?.nodes || []
  }, [auditTemplates, detailDraft?.flowId])

  // 条件构造器只读展示格式化
  const formatScopeCondition = (conditions) => {
    if (!conditions?.length) return '全部'
    return conditions.map((c) => {
      const fieldLabel = CONDITION_FIELDS.find((f) => f.value === c.field)?.label || c.field
      const opLabel = CONDITION_OPERATORS.find((o) => o.value === c.op)?.label || c.op
      return `${fieldLabel} ${opLabel} ${c.value}`
    }).join(' 且 ')
  }
  const currentRequiredFields = useMemo(() => {
    if (!detailDraft || !selectedTableKey) return []
    const item = (detailDraft.tableScope || []).find((i) => i.tableId === selectedTableKey)
    return item?.requiredFields || []
  }, [detailDraft, selectedTableKey])

  // 设置内容头部计数：已选 N 张表，其中必填字段 M 个
  const tableScopeSummary = useMemo(() => {
    const list = detailDraft?.tableScope || []
    return {
      total: list.length,
      requiredFieldsCount: list.reduce((sum, item) => sum + (item.requiredFields?.length || 0), 0),
    }
  }, [detailDraft])

  // 左树数据：表节点用 selectedCount 标记；点击表节点同时切右栏
  const tableTreeData = useMemo(() => {
    const mapNode = (node) => {
      if (node.nodeType === 'table') {
        const checked = selectedTableKeys.includes(node.id)
        return {
          key: node.id,
          title: node.displayName || node.name,
          nodeType: 'table',
          checked,
          sourceTable: node.sourceTable,
          icon: checked ? '✓' : '◻',
        }
      }
      return {
        key: node.id,
        title: node.name,
        nodeType: 'group',
        children: (node.children || []).map(mapNode),
      }
    }
    return archiveGroups.map(mapNode)
  }, [archiveGroups, selectedTableKeys])

  const handleTreeNodeSelect = (key, node) => {
    if (node.nodeType !== 'table') return
    setSelectedTableKey(key)
  }

  const listColumns = [
    { key: 'name', dataIndex: 'name', title: '批次名称', width: 260, fixed: 'left' },
    {
      key: 'majors',
      title: '发起范围',
      width: 220,
      render: (_, record) => (
        <span className="ab-scope-tags">
          {(record.majors || []).map((item) => <DSTag key={item} tone="neutral">{item}</DSTag>)}
        </span>
      ),
    },
    { key: 'semester', dataIndex: 'semester', title: '考核学期', width: 170 },
    { key: 'status', dataIndex: 'status', title: '状态', width: 96, render: (value) => <DSTag tone={auditBatchStatusTone(value)}>{value}</DSTag> },
    { key: 'startDate', dataIndex: 'startDate', title: '开始时间', width: 130 },
    { key: 'endDate', dataIndex: 'endDate', title: '结束时间', width: 130 },
    { key: 'submitRate', dataIndex: 'submitRate', title: '提交率', width: 130, render: (value, record) => `${value}%（${record.submitted}/${record.total}）` },
    { key: 'scoreRate', dataIndex: 'scoreRate', title: '评分完成率', width: 140, render: (value, record) => (record.submitted ? `${value}%（${record.scored}/${record.submitted}）` : '-') },
  ]

  const listActions = useMemo(() => [
    { key: 'edit', label: '编辑', onClick: enterDetail },
    { key: 'copy', label: '复制', onClick: copyBatch },
    { key: 'delete', label: '删除', danger: true, onClick: (record) => askConfirm(record, 'delete'), disabled: (record) => record.status !== '未发布' },
  ], [])

  if (view === 'list') {
    return (
      <>
        <DSRegularListTemplate
          activeTab="all"
          className="audit-batch-list"
          flush
          metaLabel=""
          metaValue=""
          notice=""
          pagination={{ total: filteredRows.length, totalPages: 1, current: 1, pageSize: 10 }}
          summary=""
          tabs={[]}
          tableTools={false}
          footerActions={[]}
          toolbarActions={[{ key: 'create', label: '新建批次', variant: 'primary', onClick: openCreate }]}
          filterProps={{
            fields: [
              {
                key: 'name',
                label: '批次名称',
                placeholder: '搜索批次名称',
                controlledValue: filters.name,
                onChange: (event) => setFilters((current) => ({ ...current, name: event.target.value })),
              },
              {
                key: 'scope',
                label: '发起范围',
                type: 'select',
                options: ['全部', ...MAJOR_OPTIONS],
                controlledValue: filters.scope,
                onChange: (value) => setFilters((current) => ({ ...current, scope: value })),
              },
            ],
            showExpand: false,
            showMore: false,
            onReset: () => setFilters({ name: '', scope: '全部' }),
            onSearch: () => showMessage('已按当前条件查询'),
          }}
          tableProps={{
            columns: listColumns,
            data: filteredRows,
            rowKey: 'id',
            selectable: false,
            bordered: false,
            minWidth: 1400,
            actions: listActions,
            actionsMaxVisible: 3,
          }}
        />

        {message ? <div className="sys-admin-status" role="status">{message}</div> : null}

        <BatchConfirmModal config={confirmConfig} onCancel={() => setConfirmConfig(null)} onOk={applyConfirm} />
      </>
    )
  }

  // —— 详情视图 ——
  const draft = detailDraft

  return (
    <>
      <section className="audit-batch-stack ab-detail-page" aria-label="考核批次详情">
        <DSSubPageHeader
          className="ab-detail-header"
          title={draft?.name || '新建批次'}
          backLabel="返回"
          onBack={() => setView('list')}
          surface={false}
        />

        {/* 上半部分：批次信息 */}
        <DSFormGroup className="ab-detail-group" title="批次信息">
          <div className="ab-detail-group__body">
            {isEditable ? (
              <div className="ab-info-grid">
                <DSEditField label="批次名称" required>
                  <DSInput value={draft?.name || ''} placeholder="请输入批次名称" onChange={(event) => changeDetailField('name', event.target.value)} />
                </DSEditField>
                <DSEditField label="发起范围" required>
                  <DSSelect multiple options={MAJOR_OPTIONS} value={draft?.majors || []} onChange={(value) => changeDetailField('majors', value)} />
                </DSEditField>
                <DSEditField label="选择范围" fullWidth>
                  <div className="ab-condition-builder">
                    {(draft?.scopeCondition || []).map((cond, index) => (
                      <div key={index} className="ab-condition-row">
                        <DSSelect options={CONDITION_FIELDS} value={cond.field} onChange={(value) => updateCondition(index, 'field', value)} />
                        <DSSelect options={CONDITION_OPERATORS} value={cond.op} onChange={(value) => updateCondition(index, 'op', value)} />
                        <DSSelect options={CONDITION_VALUE_OPTIONS[cond.field] || []} value={cond.value} onChange={(value) => updateCondition(index, 'value', value)} />
                        <DSButton variant="link" size="small" onClick={() => removeCondition(index)}>删除</DSButton>
                      </div>
                    ))}
                    <DSButton variant="link" size="small" onClick={addCondition}>添加条件</DSButton>
                  </div>
                </DSEditField>
                <DSEditField label="考核学期" required>
                  <DSSelect options={semesterOptions} value={draft?.semester} onChange={(value) => changeDetailField('semester', value)} />
                </DSEditField>
                <DSEditField label="提交开始时间" required>
                  <DSDatePicker value={draft?.startDate} onChange={(value) => changeDetailField('startDate', value)} />
                </DSEditField>
                <DSEditField label="提交截止时间" required>
                  <DSDatePicker value={draft?.endDate} onChange={(value) => changeDetailField('endDate', value)} />
                </DSEditField>
                <DSEditField label="设置流程" required>
                  <DSSelect options={flowOptions} value={draft?.flowId || undefined} onChange={(value) => changeDetailField('flowId', value)} />
                </DSEditField>
                <DSEditField label="评分满分" required>
                  <DSInput type="number" min={1} value={draft?.fullScore ?? auditDefaults.fullScore} onChange={(event) => changeDetailField('fullScore', Number(event.target.value))} />
                </DSEditField>
                <DSEditField label="打分环节" required>
                  <DSSelect options={currentFlowNodes} value={draft?.scoreStage || ''} onChange={(value) => changeDetailField('scoreStage', value)} />
                </DSEditField>
                <DSEditField label="发布状态">
                  <DSTag tone={auditBatchStatusTone(draft?.status)}>{draft?.status}</DSTag>
                </DSEditField>
              </div>
            ) : (
              <div className="ab-info-readonly">
                <div className="ab-info-readonly__item"><span>考核学期</span><strong>{draft?.semester}</strong></div>
                <div className="ab-info-readonly__item"><span>发起范围</span><strong>{(draft?.majors || []).join('、')}</strong></div>
                <div className="ab-info-readonly__item"><span>选择范围</span><strong>{formatScopeCondition(draft?.scopeCondition)}</strong></div>
                <div className="ab-info-readonly__item"><span>提交窗口</span><strong>{draft?.startDate} ~ {draft?.endDate}</strong></div>
                <div className="ab-info-readonly__item"><span>设置流程</span><strong>{currentFlowName}</strong></div>
                <div className="ab-info-readonly__item"><span>评分满分</span><strong>{draft?.fullScore}</strong></div>
                <div className="ab-info-readonly__item"><span>打分环节</span><strong>{draft?.scoreStage}</strong></div>
                <div className="ab-info-readonly__item"><span>发布状态</span><DSTag tone={auditBatchStatusTone(draft?.status)}>{draft?.status}</DSTag></div>
              </div>
            )}
          </div>
        </DSFormGroup>

        {/* 下半部分：设置内容（左树右配） */}
        <DSFormGroup
          className="ab-detail-group"
          title="设置内容"
          extra={<span className="ab-content-summary">已选 {tableScopeSummary.total} 张表，其中必填字段 {tableScopeSummary.requiredFieldsCount} 个</span>}
        >
          <div className="ab-content-layout ab-detail-group__body">
            <aside className="ab-content-tree">
              <DSTree
                ariaLabel="档案结构"
                dataSource={tableTreeData}
                selectedKey={selectedTableKey || undefined}
                defaultExpandAll
                onSelect={handleTreeNodeSelect}
              />
            </aside>
            <div className="ab-content-main">
              {currentTable ? (
                <>
                  <div className="ab-content-head">
                    <span className="ab-content-head__name">{currentTable.displayName || currentTable.name}</span>
                    <span className="ab-content-head__meta">数据来源：{currentTable.sourceTable || '教学档案袋'}</span>
                    {(() => {
                      const perm = window.resolveFieldPermission?.('teacher', currentTable.sourceTable) || 'read'
                      return <DSTag tone={perm === 'edit' ? 'success' : 'neutral'}>教师{perm === 'edit' ? '可编辑' : '只读'}</DSTag>
                    })()}
                  </div>
                  <div className="ab-content-settings">
                    <span className="ab-content-settings__field">
                      <span className="ab-content-settings__label">是否展示</span>
                      <DSSwitch
                        checked={currentTableVisible}
                        checkedText="展示"
                        uncheckedText="不展示"
                        disabled={!isEditable}
                        onChange={(next) => toggleTableSelected(currentTable.id, next)}
                      />
                    </span>
                    {isEditable && currentTableVisible ? (
                      <span className="ab-content-settings__actions">
                        <DSButton size="small" onClick={() => setAllFieldsRequired(true)}>全部必填</DSButton>
                        <DSButton size="small" onClick={() => setAllFieldsRequired(false)}>全部选填</DSButton>
                      </span>
                    ) : null}
                  </div>
                  {currentTableVisible ? (
                    <DSDataTable
                      className="ab-field-list"
                      showToolbar={false}
                      columns={[
                        { key: 'name', dataIndex: 'name', title: '字段名称', width: 150 },
                        { key: 'type', dataIndex: 'type', title: '字段类型', width: 110 },
                        {
                          key: 'batchRequired',
                          title: '本次必填',
                          width: 110,
                          render: (_, record) => (
                            <DSSwitch
                              checked={currentRequiredFields.includes(record.key)}
                              checkedText="必填"
                              uncheckedText="选填"
                              disabled={!isEditable}
                              onChange={(next) => toggleFieldRequired(record.key, next)}
                            />
                          ),
                        },
                      ]}
                      data={currentTable.fields || []}
                      rowKey="key"
                      selectable={false}
                      bordered={false}
                      minWidth={420}
                    />
                  ) : (
                    <div className="ab-content-hidden">开启"是否展示"后，可配置该分组的本次必填字段。</div>
                  )}
                </>
              ) : (
                <div className="ab-content-empty">请在左侧勾选并点击一张表，配置本次必填字段。</div>
              )}
            </div>
          </div>
        </DSFormGroup>

        {/* 底部操作（仅未发布） */}
        {isEditable ? (
          <div className="ab-detail-footer">
            <DSButton variant="primary" onClick={saveDetail}>保存</DSButton>
            <DSButton variant="primary" onClick={publishDetail}>发布</DSButton>
          </div>
        ) : null}
      </section>

      {message ? <div className="sys-admin-status" role="status">{message}</div> : null}
      <BatchConfirmModal config={confirmConfig} onCancel={() => setConfirmConfig(null)} onOk={applyConfirm} />
    </>
  )
}

const BATCH_CONFIRM_TEXT = {
  publish: { title: '确认发布批次', desc: '发布后范围内教师待办将立即生成，进入提交阶段。', ok: '确认发布' },
  delete: { title: '确认删除批次', desc: '删除后无法恢复，仅未发布批次可删除。', ok: '删除' },
}

function BatchConfirmModal({ config, onCancel, onOk }) {
  if (!config) return null
  const text = BATCH_CONFIRM_TEXT[config.mode]
  return (
    <DSModal open title={text.title} danger={config.mode === 'delete' || config.mode === 'close-batch'} okText={text.ok} onCancel={onCancel} onOk={onOk}>
      <p className="sys-admin-muted">{config.name}</p>
      <p style={{ color: 'var(--ds-color-text-secondary)' }}>{text.desc}</p>
    </DSModal>
  )
}

function AuditBatchPage() {
  const [archiveGroups] = useState(ARCHIVE_GROUPS)
  const [auditDefaults] = useState(initialAuditDefaults)
  const [auditTemplates] = useState(initialAuditTemplates)
  const semesterOptions = initialAuditSemesters.map((item) => item.name)

  return (
    <main className="sys-admin-page sys-admin-page--auditBatch" data-ds-business-page="audit-batch">
      <AuditBatchWorkbench
        archiveGroups={archiveGroups}
        auditDefaults={auditDefaults}
        auditTemplates={auditTemplates}
        semesterOptions={semesterOptions}
      />
    </main>
  )
}

createRoot(document.getElementById('app')).render(<AuditBatchPage />)