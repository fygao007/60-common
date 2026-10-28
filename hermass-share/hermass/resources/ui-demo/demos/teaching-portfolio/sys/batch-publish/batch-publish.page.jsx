import { useCallback, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSButton,
  DSCheckbox,
  DSDataTable,
  DSDatePicker,
  DSEditField,
  DSInput,
  DSModal,
  DSRegularListTemplate,
  DSSelect,
  DSSteps,
  DSSubPageHeader,
  DSSwitch,
  DSTag,
  DSTree,
} from '@wisedu/design-system'
import {
  createInitialArchiveStructure,
  findNodeById,
  collectTables,
  findTableById,
  PERMISSION_USER_GROUPS,
} from '../../shared/sys-shared-archive.js'
import './batch-publish.css'

// 详情页两步骤
const DETAIL_STEPS = [
  { key: 'info', title: '批次信息', description: '设定批次范围与考核周期' },
  { key: 'users', title: '设置用户组', description: '配置参与批次的用户组' },
]

/* ═══════════════ 考核批次管理（全校）工作区 ═══════════════ */

const auditBatchStatusTone = (status) => ({
  待发布: 'neutral',
  已发布: 'primary',
  已结束: 'success',
  已关闭: 'danger',
}[status] || 'neutral')

const scopeTypeOptions = ['全校', '学院', '专业群']
const batchCollegeOptions = ['电子与通信工程学院', '人工智能学院', '机电工程学院']
const batchMajorGroupOptions = ['电子信息专业群', '人工智能技术应用专业群', '智能制造专业群']

const CONDITION_FIELDS = [
  { value: 'college', label: '学院' },
  { value: 'majorGroup', label: '专业群' },
  { value: 'title', label: '职称' },
]
const CONDITION_OPERATORS = [
  { value: 'eq', label: '等于' },
  { value: 'ne', label: '不等于' },
  { value: 'in', label: '属于' },
]
const CONDITION_VALUE_OPTIONS = {
  college: batchCollegeOptions,
  majorGroup: batchMajorGroupOptions,
  title: ['教授', '副教授', '讲师', '助理教授'],
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
    level: 'school',
    scopeType: '全校',
    scopeTargets: [],
    scopeCondition: [],
    semester: '2025-2026学年 春季学期',
    tableScope: defaultTables,
    startDate: today,
    endDate: addDays(today, auditDefaults.duration),
    fullScore: auditDefaults.fullScore,
    flowId: auditTemplates[0]?.id || '',
    scoreStage: auditTemplates[0]?.nodes?.[0] || '',
    status: '待发布',
    progress: [],
  }
}

const batchScopeUnits = {
  全校: [
    { id: 'unit-eie', name: '电子与通信工程学院', total: 43 },
    { id: 'unit-ai', name: '人工智能学院', total: 31 },
    { id: 'unit-im', name: '机电工程学院', total: 27 },
  ],
  学院: [
    { id: 'unit-dep-ei', name: '电子信息工程系', total: 12 },
    { id: 'unit-dep-comm', name: '通信工程系', total: 9 },
    { id: 'unit-dep-info', name: '信息工程系', total: 10 },
  ],
  专业群: [
    { id: 'unit-ei', name: '电子信息专业群', total: 28 },
    { id: 'unit-ai', name: '人工智能技术应用专业群', total: 22 },
    { id: 'unit-im', name: '智能制造专业群', total: 0 },
  ],
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

function buildInitialBatches(auditDefaults, archiveGroups, auditTemplates) {
  const units = batchScopeUnits.全校
  const defaultTableScope = collectTables(archiveGroups)
    .filter((item) => item.table.sourceTable === '教学档案袋' || item.table.sourceTable === '数据采集')
    .slice(0, 6)
    .map((item) => ({
      tableId: item.table.id,
      requiredFields: (item.table.fields || []).filter((f) => {
        const perm = f.perGroup?.['全部用户'] || { visible: true, required: false }
        return perm.required
      }).map((f) => f.key),
    }))

  const seed = (name, semester, scopeType, status, fill) => ({
    id: `batch-${Date.now()}-${status}`,
    name,
    level: 'school',
    scopeType,
    scopeTargets: scopeType === '全校' ? [] : [units[0].name],
    scopeCondition: [],
    semester,
    tableScope: defaultTableScope,
    startDate: '2026-06-15',
    endDate: '2026-07-10',
    fullScore: auditDefaults.fullScore,
    flowId: auditTemplates[0]?.id || '',
    scoreStage: auditTemplates[0]?.nodes?.[0] || '',
    status,
    progress: units.map((unit) => ({
      depId: unit.id,
      submitted: fill.submitted,
      scored: fill.scored,
      total: unit.total,
    })),
  })

  return [
    seed('2026 春季学期教学档案考核（全校）', '2025-2026学年 春季学期', '全校', '已发布', { submitted: 8, scored: 0 }),
    seed('2025 秋季学期教学档案评审（全校）', '2025-2026学年 秋季学期', '全校', '已发布', { submitted: 30, scored: 18 }),
    seed('2025 春季学期教学档案考核（全校）', '2024-2025学年 春季学期', '全校', '已结束', { submitted: 25, scored: 25 }),
    seed('2026 秋季学期教学档案考核（全校）', '2025-2026学年 秋季学期', '全校', '待发布', { submitted: 0, scored: 0 }),
  ]
}

function notify(setMessage, text) {
  setMessage(text)
  window.setTimeout(() => setMessage(''), 1800)
}

function AuditBatchWorkbench({ archiveGroups, auditDefaults, auditTemplates, semesterOptions }) {
  const [batches, setBatches] = useState(() => buildInitialBatches(auditDefaults, archiveGroups, auditTemplates))
  const [view, setView] = useState('list')
  const [activeBatchId, setActiveBatchId] = useState(null)
  const [detailDraft, setDetailDraft] = useState(null)
  const [selectedTableKey, setSelectedTableKey] = useState(null)
  const [selectedGroupKey, setSelectedGroupKey] = useState(null)
  // 权限矩阵(第3步): { 用户组名: { tableId: { view, edit, required } } }
  const [permUserGroup, setPermUserGroup] = useState(PERMISSION_USER_GROUPS[0])
  // 第3步右侧一级分组页签 + 表展开（与档案字段设置第二步同款布局）
  const [permActiveGroupTab, setPermActiveGroupTab] = useState(archiveGroups[0]?.id)
  const [permExpandedGroups, setPermExpandedGroups] = useState([])
  const [confirmConfig, setConfirmConfig] = useState(null)
  const [message, setMessage] = useState('')
  const [filters, setFilters] = useState({ name: '', scope: '全部' })
  // 两步骤向导:0=批次信息 1=设置用户组
  const [currentStep, setCurrentStep] = useState(0)

  const showMessage = (text) => notify(setMessage, text)
  const isEditable = detailDraft?.status === '待发布'

  // 从 tableScope 反查一级分组名称（用于列表展示）
  const getScopeFromTableScope = useCallback((tableScope) => {
    if (!tableScope?.length) return []
    const groupNames = new Set()
    tableScope.forEach((item) => {
      const found = findNodeById(archiveGroups, item.tableId)
      if (found?.path?.length) groupNames.add(found.path[0].name)
    })
    return Array.from(groupNames)
  }, [archiveGroups])

  // 筛选后的列表数据
  const filteredRows = useMemo(() => {
    return batches.filter((batch) => {
      if (filters.name && !batch.name.toLowerCase().includes(filters.name.toLowerCase())) return false
      if (filters.scope !== '全部') {
        if (batch.scopeType === '全校') return filters.scope === '全校'
        if (!batch.scopeTargets?.includes(filters.scope)) return false
      }
      return true
    }).map((batch) => {
      const { submitted, scored, total } = batchTotals(batch)
      const scope = getScopeFromTableScope(batch.tableScope)
      return {
        ...batch,
        scope,
        submitRate: ratio(submitted, total),
        scoreRate: ratio(scored, submitted),
        submitted,
        scored,
        total,
      }
    })
  }, [batches, filters, getScopeFromTableScope])

  // 进入详情页：从 batch 深拷贝草稿
  const enterDetail = (batch) => {
    const draft = JSON.parse(JSON.stringify(batch))
    draft.tableScope = (draft.tableScope || []).map((item) => ({ tableId: item.tableId, requiredFields: [...(item.requiredFields || [])] }))
    draft.scopeTargets = [...(draft.scopeTargets || [])]
    draft.scopeCondition = (draft.scopeCondition || []).map((c) => ({ ...c }))
    draft.userGroups = [...(draft.userGroups || PERMISSION_USER_GROUPS)]
    setActiveBatchId(batch.id)
    setDetailDraft(draft)
    setSelectedTableKey((draft.tableScope[0]?.tableId) || null)
    setSelectedGroupKey(null)
    setPermUserGroup(PERMISSION_USER_GROUPS[0])
    setCurrentStep(0)
    setView('detail')
  }

  // 权限矩阵:取/设 某用户组对某表的某权限(view/edit/required)
  const getPerm = (tableId, permKey) => {
    const m = detailDraft?.userGroupPerms || {}
    const perms = m[permUserGroup]?.[tableId] || {}
    // 默认: 档案袋参与本次批次的表默认 view=true
    const inScope = (detailDraft?.tableScope || []).some((t) => t.tableId === tableId)
    return perms[permKey] ?? (permKey === 'view' ? inScope : false)
  }
  const setPerm = (tableId, permKey, value) => {
    setDetailDraft((prev) => {
      const m = { ...(prev.userGroupPerms || {}) }
      const groupMap = { ...(m[permUserGroup] || {}) }
      const tablePerms = { ...(groupMap[tableId] || {}) }
      tablePerms[permKey] = value
      groupMap[tableId] = tablePerms
      m[permUserGroup] = groupMap
      return { ...prev, userGroupPerms: m }
    })
  }

  // 第3步右侧：渲染单个表的权限设置（表级 + 字段级）
  const renderPermTable = (table) => {
    const expanded = permExpandedGroups.includes(table.id)
    const tablePerm = { view: getPerm(table.id, 'view'), edit: getPerm(table.id, 'edit'), required: getPerm(table.id, 'required') }
    const canEdit = isEditable && (detailDraft?.userGroups || []).includes(permUserGroup)
    return (
      <div key={table.id} className="archive-permission-section">
        <div className="archive-permission-section__header">
          <DSButton
            variant="link"
            className="archive-permission-section__toggle"
            onClick={() => setPermExpandedGroups((current) =>
              expanded ? current.filter((id) => id !== table.id) : [...current, table.id]
            )}
          >
            <span className={['archive-permission-section__arrow', expanded && 'is-expanded'].filter(Boolean).join(' ')}>▶</span>
            <span className="archive-permission-section__title">{table.displayName || table.name}</span>
          </DSButton>
          <span className="archive-permission-section__batch">
            <DSCheckbox label="查看" checked={tablePerm.view} disabled={!canEdit} onChange={(next) => setPerm(table.id, 'view', next)} />
            <DSCheckbox label="编辑" checked={tablePerm.edit} disabled={!canEdit} onChange={(next) => setPerm(table.id, 'edit', next)} />
            <DSCheckbox label="必填" checked={tablePerm.required} disabled={!canEdit} onChange={(next) => setPerm(table.id, 'required', next)} />
          </span>
        </div>
        {expanded && table.fields?.length ? (
          <div className="archive-permission-section__fields">
            {table.fields.map((field) => {
              const perm = { view: getPerm(field.id, 'view'), edit: getPerm(field.id, 'edit'), required: getPerm(field.id, 'required') }
              return (
                <div key={field.id} className="archive-permission-field">
                  <span className="archive-permission-field__name">{field.name}</span>
                  <span className="archive-permission-field__perms">
                    <DSCheckbox label="查看" checked={perm.view} disabled={!canEdit} onChange={(next) => setPerm(field.id, 'view', next)} />
                    <DSCheckbox label="编辑" checked={perm.edit} disabled={!canEdit} onChange={(next) => setPerm(field.id, 'edit', next)} />
                    <DSCheckbox label="必填" checked={perm.required} disabled={!canEdit} onChange={(next) => setPerm(field.id, 'required', next)} />
                  </span>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    )
  }

  // 第3步右侧：递归渲染分组节点
  const renderPermNode = (node) => {
    if (node.nodeType === 'table' || node.fields) return renderPermTable(node)
    return (
      <section key={node.id} className="archive-permission-subgroup">
        <h4 className="archive-permission-subgroup__title">{node.name}</h4>
        <div className="archive-permission-sections">
          {(node.children || []).map(renderPermNode)}
        </div>
      </section>
    )
  }

  // 新增批次：建待发布空草稿，直接进详情页
  const openCreate = () => {
    const draft = { ...createBatchDraft(auditDefaults, archiveGroups, auditTemplates) }
    draft.id = `batch-${Date.now()}`
    enterDetail(draft)
  }

  const copyBatch = (batch) => {
    const copy = {
      ...batch,
      id: `batch-${Date.now()}`,
      name: `${batch.name}（副本）`,
      status: '待发布',
      progress: batchScopeUnits[batch.scopeType || '全校'].map((unit) => ({ depId: unit.id, submitted: 0, scored: 0, total: unit.total })),
      tableScope: (batch.tableScope || []).map((item) => ({ tableId: item.tableId, requiredFields: [...(item.requiredFields || [])] })),
    }
    setBatches((current) => [copy, ...current])
    showMessage('已复制为待发布批次')
  }

  const applyConfirm = () => {
    if (!confirmConfig) return
    const { batchId, mode } = confirmConfig
    if (mode === 'delete') {
      const target = batches.find((item) => item.id === batchId)
      if (target?.status !== '待发布') {
        showMessage('仅待发布批次支持删除')
      } else {
        setBatches((current) => current.filter((item) => item.id !== batchId))
        showMessage('批次已删除')
      }
    }
    if (mode === 'unpublish') {
      const target = batches.find((item) => item.id === batchId)
      if (target?.status !== '已发布') {
        showMessage('仅已发布批次支持取消发布')
      } else {
        const next = { ...target, status: '待发布', wasPublished: true }
        setBatches((current) => current.map((item) => (item.id === batchId ? next : item)))
        setDetailDraft((current) => (current?.id === batchId ? { ...current, status: '待发布', wasPublished: true } : current))
        showMessage('已取消发布，可重新发布或结束批次')
      }
    }
    if (mode === 'end-batch') {
      const target = batches.find((item) => item.id === batchId)
      if (target?.status !== '待发布' || !target?.wasPublished) {
        showMessage('仅取消发布后的批次支持结束')
      } else {
        const next = { ...target, status: '已结束' }
        setBatches((current) => current.map((item) => (item.id === batchId ? next : item)))
        setDetailDraft((current) => (current?.id === batchId ? { ...current, status: '已结束' } : current))
        showMessage('批次已结束')
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
      if (key === 'scopeType') next.scopeTargets = []
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
    if ((d.scopeType === '学院' || d.scopeType === '专业群') && !(d.scopeTargets?.length)) { showMessage(`请选择指定的${d.scopeType}`); return false }
    if (!d.startDate || !d.endDate) { showMessage('请选择提交时间'); return false }
    if (d.endDate < d.startDate) { showMessage('截止时间需晚于或等于开始时间'); return false }
    if (!d.fullScore || Number(d.fullScore) < 1) { showMessage('评分满分需 ≥ 1'); return false }
    if (!d.flowId) { showMessage('请选择设置流程'); return false }
    if (!d.scoreStage) { showMessage('请选择打分环节'); return false }
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

  // 发布：写回 + status=已发布，返回列表
  const publishDetail = () => {
    if (!validateDetail()) return
    const next = { ...detailDraft, fullScore: Number(detailDraft.fullScore), status: '已发布', wasPublished: true }
    setBatches((current) => {
      const exists = current.some((item) => item.id === next.id)
      return exists
        ? current.map((item) => (item.id === next.id ? { ...item, ...next } : item))
        : [next, ...current]
    })
    showMessage('批次已发布，范围内教师待办已生成')
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

  // 历史批次的内容范围摘要（列表展示仍保留）
  const tableScopeSummary = useMemo(() => {
    const list = detailDraft?.tableScope || []
    return {
      total: list.length,
      requiredFieldsCount: list.reduce((sum, item) => sum + (item.requiredFields?.length || 0), 0),
    }
  }, [detailDraft])

  const scopeTargetOptions = detailDraft?.scopeType === '学院' ? batchCollegeOptions : batchMajorGroupOptions

  // 用户组树数据(第三步用):"参与用户组" 根节点 + 6 个用户组叶子
  const userGroupTreeData = useMemo(() => {
    const selected = detailDraft?.userGroups || []
    return [{
      key: '__root_user_groups__',
      title: `参与用户组（${selected.length}/${PERMISSION_USER_GROUPS.length}）`,
      nodeType: 'group',
      children: PERMISSION_USER_GROUPS.map((g) => {
        const checked = selected.includes(g)
        return { key: g, title: g, nodeType: 'group-leaf', icon: checked ? '✓' : '◻' }
      }),
    }]
  }, [detailDraft?.userGroups])

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
      key: 'scopeType',
      title: '发起范围',
      width: 180,
      render: (_, record) => {
        if (record.scopeType === '全校') return <DSTag tone="primary">全校</DSTag>
        const targets = record.scopeTargets || []
        return (
          <span className="ab-scope-tags">
            <DSTag tone="primary">{record.scopeType}</DSTag>
            {targets.map((item) => <DSTag key={item} tone="neutral">{item}</DSTag>)}
          </span>
        )
      },
    },
    { key: 'semester', dataIndex: 'semester', title: '考核学期', width: 170 },
    { key: 'scope', dataIndex: 'scope', title: '审核范围', width: 220, render: (value) => <span className="ab-scope-tags">{value.map((item) => <DSTag key={item} tone="neutral">{item}</DSTag>)}</span> },
    { key: 'status', dataIndex: 'status', title: '状态', width: 96, render: (value) => <DSTag tone={auditBatchStatusTone(value)}>{value}</DSTag> },
    { key: 'window', title: '起止时间', width: 190, render: (_, record) => `${record.startDate} ~ ${record.endDate}` },
    { key: 'submitRate', dataIndex: 'submitRate', title: '提交率', width: 130, render: (value, record) => `${value}%（${record.submitted}/${record.total}）` },
    { key: 'scoreRate', dataIndex: 'scoreRate', title: '评分完成率', width: 140, render: (value, record) => (record.submitted ? `${value}%（${record.scored}/${record.submitted}）` : '-') },
  ]

  const listActions = useMemo(() => [
    { key: 'edit', label: (record) => (record.status === '待发布' ? '编辑' : '详情'), onClick: enterDetail },
    { key: 'copy', label: '复制', onClick: copyBatch },
    { key: 'delete', label: '删除', danger: true, onClick: (record) => askConfirm(record, 'delete'), disabled: (record) => record.status !== '待发布' },
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
          toolbarActions={[{ key: 'create', label: '新增', variant: 'primary', onClick: openCreate }]}
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
                options: ['全部', '全校', ...batchCollegeOptions, ...batchMajorGroupOptions],
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

  // 已发布：基本信息一行只读
  const readonlyScopeLabel = draft?.scopeType === '全校' ? '全校' : `${draft?.scopeType}：${(draft?.scopeTargets || []).join('、')}`

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

        {/* 两步骤向导 */}
        <div className="ab-detail-steps">
          <DSSteps items={DETAIL_STEPS} current={currentStep} clickable onChange={(index) => setCurrentStep(index)} />
        </div>

        {/* 第一步：批次信息 */}
        {currentStep === 0 ? (
        <div className="ab-detail-group ab-info-group">
          <div className="ab-detail-group__body">
            {isEditable ? (
              <div className="ab-info-grid">
                <DSEditField label="批次名称" required>
                  <DSInput value={draft?.name || ''} placeholder="请输入批次名称" onChange={(event) => changeDetailField('name', event.target.value)} />
                </DSEditField>
                <DSEditField label="发起范围" required>
                  <DSSelect options={scopeTypeOptions} value={draft?.scopeType} onChange={(value) => changeDetailField('scopeType', value)} />
                </DSEditField>
                {draft?.scopeType && draft.scopeType !== '全校' ? (
                  <DSEditField label={`指定${draft.scopeType}`} required>
                    <DSSelect multiple options={scopeTargetOptions} value={draft?.scopeTargets || []} onChange={(value) => changeDetailField('scopeTargets', value)} />
                  </DSEditField>
                ) : null}
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
                  <DSSelect multiple options={semesterOptions} value={draft?.semester || []} onChange={(value) => changeDetailField('semester', value)} />
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
                <div className="ab-info-readonly__item"><span>考核学期</span><strong>{Array.isArray(draft?.semester) ? draft.semester.join('、') : draft?.semester}</strong></div>
                <div className="ab-info-readonly__item"><span>发起范围</span><strong>{readonlyScopeLabel}</strong></div>
                <div className="ab-info-readonly__item"><span>选择范围</span><strong>{formatScopeCondition(draft?.scopeCondition)}</strong></div>
                <div className="ab-info-readonly__item"><span>起止时间</span><strong>{draft?.startDate} ~ {draft?.endDate}</strong></div>
                <div className="ab-info-readonly__item"><span>设置流程</span><strong>{currentFlowName}</strong></div>
                <div className="ab-info-readonly__item"><span>评分满分</span><strong>{draft?.fullScore}</strong></div>
                <div className="ab-info-readonly__item"><span>打分环节</span><strong>{draft?.scoreStage}</strong></div>
                <div className="ab-info-readonly__item"><span>发布状态</span><DSTag tone={auditBatchStatusTone(draft?.status)}>{draft?.status}</DSTag></div>
              </div>
            )}
          </div>
        </div>
        ) : null}

        {/* 第二步：设置用户组（权限矩阵） */}
        {currentStep === 1 ? (
        <div className="ab-detail-group">
          <section className="archive-permission-layout" aria-label="用户组权限配置">
            <aside className="archive-permission-sidebar">
              <h3>用户组</h3>
              <ul className="archive-permission-groups">
                {PERMISSION_USER_GROUPS.map((group) => {
                  return (
                    <li
                      key={group}
                      className={['archive-permission-groups__item', group === permUserGroup && 'is-active'].filter(Boolean).join(' ')}
                      onClick={() => setPermUserGroup(group)}
                    >
                      {group}
                    </li>
                  )
                })}
              </ul>
            </aside>
            <div className="archive-permission-main">
              <div className="archive-permission-tabs">
                {archiveGroups.map((group) => (
                  <div
                    key={group.id}
                    className={['archive-permission-tabs__item', group.id === permActiveGroupTab && 'is-active'].filter(Boolean).join(' ')}
                    onClick={() => setPermActiveGroupTab(group.id)}
                    role="tab"
                    aria-selected={group.id === permActiveGroupTab}
                    tabIndex={group.id === permActiveGroupTab ? 0 : -1}
                  >
                    {group.name}
                  </div>
                ))}
              </div>
              <div className="archive-permission-tab-content">
                {(() => {
                  const tabGroup = archiveGroups.find((g) => g.id === permActiveGroupTab) || archiveGroups[0]
                  if (!tabGroup) return null
                  return renderPermNode(tabGroup)
                })()}
              </div>
            </div>
          </section>
        </div>
        ) : null}

        {/* 底部操作（按步骤及发布状态） */}
        {isEditable || draft?.status === '已发布' ? (
          <div className="ab-detail-footer">
            {draft?.status === '已发布' ? (
              <DSButton variant="default" onClick={() => askConfirm(draft, 'unpublish')}>取消发布</DSButton>
            ) : (
              <>
                {currentStep > 0 && <DSButton onClick={() => setCurrentStep(currentStep - 1)}>上一步</DSButton>}
                {currentStep < DETAIL_STEPS.length - 1 && <DSButton variant="primary" onClick={() => setCurrentStep(currentStep + 1)}>下一步</DSButton>}
                {currentStep === DETAIL_STEPS.length - 1 && <DSButton variant="primary" onClick={saveDetail}>保存</DSButton>}
                {currentStep === DETAIL_STEPS.length - 1 && <DSButton variant="primary" onClick={publishDetail}>发布</DSButton>}
                {draft?.wasPublished && <DSButton variant="default" danger onClick={() => askConfirm(draft, 'end-batch')}>结束批次</DSButton>}
              </>
            )}
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
  delete: { title: '确认删除批次', desc: '删除后无法恢复，仅待发布批次可删除。', ok: '删除' },
  unpublish: { title: '确认取消发布', desc: '取消发布后将停止本批次的提交入口，批次可重新发布或结束。', ok: '确认取消' },
  'end-batch': { title: '确认结束批次', desc: '结束后本批次将不能再次发布或继续提交。', ok: '确认结束' },
}

function BatchConfirmModal({ config, onCancel, onOk }) {
  if (!config) return null
  const text = BATCH_CONFIRM_TEXT[config.mode]
  return (
    <DSModal open title={text.title} danger={config.mode === 'delete' || config.mode === 'end-batch'} okText={text.ok} onCancel={onCancel} onOk={onOk}>
      <p className="sys-admin-muted">{config.name}</p>
      <p style={{ color: 'var(--ds-color-text-secondary)' }}>{text.desc}</p>
    </DSModal>
  )
}

// sys 角色的审核流全局配置默认数据（与 audit-config 页面一致，演示用）
const initialAuditDefaults = {
  scope: ['教学信息', '成果与荣誉', '任职情况'],
  duration: 20,
  overdue: '截止后锁定不可补交',
  fullScore: 100,
}

const initialAuditTemplates = [
  { id: 'tpl-term', name: '学期教学档案考核（标准）', scope: ['教学信息', '成果与荣誉', '任职情况'], duration: 20, note: '每学期末各学院统一发起的标准考核模板。', nodes: ['系初审', '院评审', '校终审'] },
  { id: 'tpl-double-high', name: '双高专业群支撑材料考核', scope: ['教学信息', '成果与荣誉', '企业实践'], duration: 30, note: '面向双高建设专业群的过程性材料考核。', nodes: ['专业群初评', '院评审', '校终审'] },
  { id: 'tpl-new-teacher', name: '青年教师教学成长考核', scope: ['教学信息'], duration: 15, note: '入职三年内青年教师的教学材料专项考核。', nodes: ['指导教师评', '院评审'] },
]

const initialAuditSemesters = [
  { id: 'sem-2026s', name: '2025-2026学年 春季学期', current: true, note: '当前进行中的考核学期' },
  { id: 'sem-2025f', name: '2025-2026学年 秋季学期', current: false, note: '已归档' },
  { id: 'sem-2025s', name: '2024-2025学年 春季学期', current: false, note: '已归档' },
]

function AuditBatchPage() {
  const [archiveGroups] = useState(createInitialArchiveStructure)
  const [auditDefaults] = useState(initialAuditDefaults)
  const [auditTemplates] = useState(initialAuditTemplates)
  const semesterOptions = initialAuditSemesters.map((item) => item.name)

  return (
    <main className="sys-admin-page sys-admin-page--audit-batch" data-ds-business-page="batch-publish">
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
