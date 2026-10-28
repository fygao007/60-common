import { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSButton,
  DSCard,
  DSCheckbox,
  DSDataTable,
  DSDatePicker,
  DSDoubleEditModal,
  DSEditField,
  DSFormGroup,
  DSInput,
  DSModal,
  DSPageHeader,
  DSRegularListTemplate,
  DSSelect,
  DSSingleEditModal,
  DSSteps,
  DSSubPageHeader,
  DSSwitch,
  DSTag,
  DSTextarea,
  DSTree,
} from '@wisedu/design-system'
import {
  STAFF_FIELDS,
  ONTOLOGY_FIELD_OPTIONS,
  archiveStaffField,
  createOntologyArchiveField,
  isRegisteredArchiveField,
} from '../../shared/standard-basic-info-fields'
import { initialArchiveGroups as ontologyArchiveGroups } from '../../shared/sys-shared-archive.js'
import './sys-accounts.css'

const MODULES = [
  {
    key: 'majorGroup',
    label: '专业群管理',
    title: '专业群管理',
    description: '统一管理学校专业群结构，为教学、招聘、考核提供基础组织维度。',
    primaryAction: '新增专业群',
  },
  {
    key: 'formManagement',
    label: '档案字段设置',
    title: '档案字段设置',
    description: '配置教学档案袋三级目录、表展示类型和字段结构。',
    primaryAction: '新增一级分组',
  },
  {
    key: 'auditConfig',
    label: '审核流配置',
    title: '审核流全局配置',
    description: '统一维护考核学期口径、批次模板与审核范围默认值，供各学院发起考核批次时复用。',
    primaryAction: '新增批次模板',
  },
  {
    key: 'auditBatch',
    label: '考核批次管理',
    title: '考核批次管理（全校）',
    description: '统一发起全校考核批次，套用审核流模板，覆盖各部门提交与评分窗口。',
    primaryAction: '新建批次',
  },
]

const MODULE_MAP = MODULES.reduce((map, item) => ({ ...map, [item.key]: item }), {})
const HASH_ALIASES = {
  overview: 'majorGroup',
  permissions: 'majorGroup',
  majors: 'majorGroup',
  majorGroup: 'majorGroup',
  fieldAuth: 'formManagement',
  formManagement: 'formManagement',
  auditConfig: 'auditConfig',
  audit: 'auditConfig',
  auditBatch: 'auditBatch',
}

const statusTone = {
  已启用: 'success',
  进行中: 'primary',
  待发布: 'primary',
  草稿: 'neutral',
  待完善: 'warning',
  已停用: 'neutral',
}

const collegeOptions = [
  '电子与通信工程学院',
  '人工智能学院',
  '机电工程学院',
]

const majorDictionaryOptions = [
  '电子信息工程技术',
  '通信工程',
  '物联网应用技术',
  '人工智能技术应用',
  '大数据技术',
  '软件技术',
  '智能制造技术',
  '工业机器人技术',
  '机电一体化技术',
]

const initialMajorGroups = [
  {
    id: 'mg-01',
    name: '电子信息专业群',
    code: 'MG-EI-2026',
    college: '电子与通信工程学院',
    majors: '电子信息工程技术、通信工程、物联网应用技术',
    status: '已启用',
    createdAt: '2026-06-01',
    references: { teachers: 86, courses: 4 },
  },
  {
    id: 'mg-02',
    name: '人工智能技术应用专业群',
    code: 'MG-AI-2026',
    college: '人工智能学院',
    majors: '人工智能技术应用、大数据技术、软件技术',
    status: '已启用',
    createdAt: '2026-05-18',
    references: { teachers: 54, courses: 4 },
  },
  {
    id: 'mg-03',
    name: '智能制造专业群',
    code: 'MG-IM-2026',
    college: '机电工程学院',
    majors: '智能制造技术、工业机器人技术、数字化设计与制造技术',
    status: '已停用',
    createdAt: '2026-06-12',
    references: { teachers: 0, courses: 0 },
  },
]

const archiveDisplayTypes = ['表格', '表单', '卡片', '大文本', '文件']
const USER_GROUP_OPTIONS = ['全部用户', '教师', '二级学院管理员', '人事管理员']

const PERMISSION_USER_GROUPS = ['导师组', '院系秘书', '学校管理员', '超级管理员']

const makeField = (id, name, key, type, required = false, visible = true, source = '教学档案袋维护') => ({
  id, name, key, type, source,
  // 按用户组存储权限：第一步用 visible/required，第二步用 view/edit/required
  perGroup: {
    '全部用户': { visible, required, view: visible, edit: false },
  },
})

const legacyInitialArchiveGroups = [
  {
    id: 'basic-info', name: '基本信息', enabled: true, children: [
      { id: 'profile', name: '个人信息', displayType: '详情信息', enabled: true, description: '教师身份、学院与岗位基础信息。', fields: [archiveStaffField('name', STAFF_FIELDS.name, 'name'), archiveStaffField('job-no', STAFF_FIELDS.employeeNumber, 'jobNo'), archiveStaffField('college', STAFF_FIELDS.organization, 'organizationId', '组织机构'), archiveStaffField('title', STAFF_FIELDS.professionalTitle, 'professionalTitle')] },
      { id: 'education', name: '学历信息', displayType: '标准表格', enabled: true, description: '学历、学位及毕业院校记录。', fields: [archiveStaffField('education', STAFF_FIELDS.highestEducation, 'highestEducation'), archiveStaffField('degree', STAFF_FIELDS.highestDegree, 'highestDegree'), archiveStaffField('school', STAFF_FIELDS.graduateSchool, 'graduateSchool')] },
      { id: 'certificates', name: '资格证书', displayType: '卡片列表', enabled: true, description: '教师资格、职业资格及技能证书。', fields: [makeField('cert-name', '证书名称', 'certificateName', '单行文本'), makeField('cert-no', '证书编号', 'certificateNo', '单行文本'), makeField('cert-file', '证书附件', 'certificateFile', '附件')] },
    ],
  },
  {
    id: 'teaching-info', name: '教学信息', enabled: true, children: [
      { id: 'courses', name: '课程清单', displayType: '标准表格', enabled: true, description: '教师承担课程及教学任务。', fields: [makeField('course-name', '课程名称', 'courseName', '单行文本', false, true, '教务系统'), makeField('semester', '开课学期', 'semester', '单选', false, true, '教务系统'), makeField('hours', '学时', 'hours', '数字')] },
      { id: 'course-design', name: '课程设计与实施', displayType: '图文材料', enabled: true, sourceTable: '数据采集', description: '教学设计、实施过程与支撑材料。', fields: [makeField('design', '教学设计', 'design', '多行文本'), makeField('courseware', '课件材料', 'courseware', '附件')] },
      { id: 'reflection', name: '课程反思', displayType: '图文材料', enabled: true, sourceTable: '数据采集', description: '课程反馈、问题分析与改进记录。', fields: [makeField('reflection-text', '反思内容', 'reflection', '多行文本'), makeField('reflection-file', '支撑附件', 'supportingFile', '附件')] },
    ],
  },
  { id: 'enterprise-practice', name: '企业实践', enabled: true, children: [{ id: 'practice-records', name: '实践经历', displayType: '时间轴', enabled: true, description: '企业实践、挂职及产学合作经历。', fields: [makeField('company', '实践企业', 'company', '单行文本'), makeField('practice-range', '实践时间', 'practiceRange', '日期区间'), makeField('practice-result', '实践成果', 'practiceResult', '多行文本')] }] },
  { id: 'achievements-honors', name: '成果与荣誉', enabled: true, children: [{ id: 'achievements', name: '教学科研成果', displayType: '卡片列表', enabled: true, sourceTable: '数据采集', description: '成果、获奖及荣誉称号。', fields: [makeField('achievement-name', '成果名称', 'achievementName', '单行文本'), makeField('achievement-type', '成果类型', 'achievementType', '单选'), makeField('award-level', '获奖等级', 'awardLevel', '单选'), makeField('award-file', '证明材料', 'awardFile', '附件')] }] },
  { id: 'training', name: '进修（访学）培训', enabled: true, children: [{ id: 'training-records', name: '培训记录', displayType: '时间轴', enabled: true, description: '进修访学、专业培训与学历提升。', fields: [makeField('training-name', '项目名称', 'trainingName', '单行文本'), makeField('training-org', '培训机构', 'trainingOrg', '单行文本'), makeField('training-range', '培训时间', 'trainingRange', '日期区间')] }] },
  { id: 'social-service', name: '社会服务与影响力', enabled: true, children: [{ id: 'service-records', name: '社会服务', displayType: '标准表格', enabled: true, description: '社会服务项目与行业影响力。', fields: [makeField('service-name', '服务项目', 'serviceName', '单行文本'), makeField('service-type', '服务类型', 'serviceType', '单选'), makeField('service-result', '服务成效', 'serviceResult', '多行文本')] }] },
  { id: 'appointment', name: '任职情况', enabled: true, children: [{ id: 'appointment-records', name: '任职记录', displayType: '时间轴', enabled: true, sourceTable: '数据采集', description: '岗位聘任、职务任职与履职情况。', fields: [makeField('position', '任职岗位', 'position', '单行文本'), makeField('department', '任职部门', 'department', '单行文本'), makeField('appointment-range', '任职时间', 'appointmentRange', '日期区间')] }] },
  { id: 'other-education', name: '其他教育工作', enabled: true, children: [{ id: 'other-records', name: '教育工作记录', displayType: '标准表格', enabled: true, description: '其他与教育工作相关的材料。', fields: [makeField('work-name', '工作名称', 'workName', '单行文本'), makeField('work-type', '工作类型', 'workType', '单选'), makeField('work-file', '支撑材料', 'workFile', '附件')] }] },
]

const initialArchiveGroups = ontologyArchiveGroups

const legacyDisplayTypeMap = {
  标准表格: '表格',
  详情信息: '表单',
  卡片列表: '卡片',
  时间轴: '卡片',
  图文材料: '大文本',
}

const createInitialArchiveStructure = () => initialArchiveGroups.map((group) => ({
  id: group.id,
  name: group.name,
  nodeType: 'group',
  enabled: group.enabled,
  children: group.children.map((module) => ({
    id: module.id,
    name: module.name,
    nodeType: 'group',
    enabled: module.enabled,
    children: [
      {
        id: `table-${module.id}`,
        displayName: module.name,
        name: `table_${module.id.replace(/-/g, '_')}`,
        nodeType: 'table',
        displayType: legacyDisplayTypeMap[module.displayType] || '表格',
        sourceTable: module.sourceTable || '教学档案袋',
        sourceSystem: module.sourceSystem || module.fields.find((field) => field.source && field.source !== '教学档案袋维护')?.source || '教学档案袋',
        entityType: module.entityType || null,
        enabled: module.enabled,
        description: module.description,
        defaultSort: '按时间倒序',
        fields: module.fields,
      },
    ],
  })),
}))

/* ── 教学档案袋结构递归辅助：统一 children 树（group/table 节点混合） ── */

// 深度优先查找节点（含完整父链 path）
function findNodeById(groups, id, path = []) {
  for (const node of groups) {
    const nextPath = [...path, node]
    if (node.id === id) return { node, path: nextPath }
    if (node.children?.length) {
      const found = findNodeById(node.children, id, nextPath)
      if (found) return found
    }
  }
  return null
}

// 收集所有「表」节点及其祖先分组（path 不含表本身）
function collectTables(groups, path = []) {
  const tables = []
  for (const node of groups) {
    if (node.nodeType === 'table') {
      tables.push({ table: node, path })
    } else if (node.children?.length) {
      tables.push(...collectTables(node.children, [...path, node]))
    }
  }
  return tables
}

// 不可变更新：按 id 替换树中某节点
function updateNodeById(groups, id, updater) {
  return groups.map((node) => {
    if (node.id === id) return updater(node)
    if (node.children?.length) return { ...node, children: updateNodeById(node.children, id, updater) }
    return node
  })
}

// 不可变更新：在 parentId 的 children 末尾追加 child
function appendChildById(groups, parentId, child) {
  return groups.map((node) => {
    if (node.id === parentId) return { ...node, children: [...(node.children || []), child] }
    if (node.children?.length) return { ...node, children: appendChildById(node.children, parentId, child) }
    return node
  })
}

function normalizeModuleKey(rawKey) {
  return MODULE_MAP[rawKey] ? rawKey : HASH_ALIASES[rawKey] || 'majorGroup'
}

function getInitialModule() {
  return normalizeModuleKey(window.location.hash.replace('#', '') || window.SYS_ADMIN_INITIAL_MODULE)
}

function toneTag(value, toneMap = statusTone) {
  return <DSTag tone={toneMap[value] || 'neutral'}>{value}</DSTag>
}

function notify(setMessage, text) {
  setMessage(text)
  window.setTimeout(() => setMessage(''), 1800)
}

function nextMajorGroupCode(list) {
  return `MG-NEW-${String(list.length + 1).padStart(2, '0')}`
}

function createMajorGroupDraft(list) {
  const timestamp = Date.now()
  return {
    id: `mg-${timestamp}`,
    name: '新专业群',
    code: nextMajorGroupCode(list),
    college: collegeOptions[0],
    majors: '',
    status: '已启用',
    createdAt: new Date().toISOString().slice(0, 10),
    references: { teachers: 0, courses: 0 },
  }
}

/* ═══════════════ 教学档案袋结构与字段配置工作区（两步向导） ═══════════════ */

const STEPS_ITEMS = [
  { key: 'fields', title: '设置档案字段', description: '配置分组、表与字段结构' },
  { key: 'permissions', title: '设置用户组权限', description: '按用户组配置查看/编辑/必填' },
]

function FormManagementWorkbench({ groups, setGroups }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedNodeKey, setSelectedNodeKey] = useState('table-profile')
  const [fieldEditor, setFieldEditor] = useState({ open: false, mode: 'create', draft: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [expandedTreeKeys, setExpandedTreeKeys] = useState(['basic-info', 'profile'])
  const [tableFormDraft, setTableFormDraft] = useState(null)
  const [groupFormDraft, setGroupFormDraft] = useState(null)
  const [permUserGroup, setPermUserGroup] = useState(PERMISSION_USER_GROUPS[0])
  const [permExpandedGroups, setPermExpandedGroups] = useState(['basic-info', 'teaching-info'])

  const found = useMemo(() => findNodeById(groups, selectedNodeKey), [groups, selectedNodeKey])
  const selectedNode = found?.node || null
  const selectedPath = found?.path || []
  const selectedLevel = !selectedNode ? 'empty'
    : selectedNode.nodeType === 'table' ? 'table'
    : 'group'
  const selectedParentId = selectedPath.length > 1 ? selectedPath[selectedPath.length - 2].id : null
  const selectedTable = selectedLevel === 'table' ? selectedNode : null

  // 同步表编辑 draft（仅第一步）
  useEffect(() => {
    if (currentStep === 0 && selectedLevel === 'table' && selectedNode) {
      setTableFormDraft({ ...selectedNode, isNew: false })
    } else if (currentStep === 0) {
      setTableFormDraft(null)
    }
  }, [currentStep, selectedLevel, selectedNode?.id])

  // 同步分组编辑 draft（仅第一步）
  useEffect(() => {
    if (currentStep === 0 && selectedLevel === 'group' && selectedNode) {
      setGroupFormDraft({
        id: selectedNode.id,
        name: selectedNode.name,
        enabled: selectedNode.enabled,
        depth: selectedPath.length,
        childrenCount: selectedNode.children?.length || 0,
        isNew: false,
      })
    } else if (currentStep === 0) {
      setGroupFormDraft(null)
    }
  }, [currentStep, selectedLevel, selectedNode?.id])

  const archiveTreeData = useMemo(() => {
    const mapNode = (node) => {
      if (node.nodeType === 'table') {
        return {
          key: node.id,
          title: node.displayName || node.name,
          nodeType: 'table',
          enabled: node.enabled,
          actions: [
            { key: 'delete', label: '删除', danger: true, onClick: (treeNode) => setDeleteTarget({ type: 'table', id: treeNode.key, name: treeNode.title }) },
          ],
        }
      }
      return {
        key: node.id,
        title: node.name,
        nodeType: 'group',
        enabled: node.enabled,
        draggable: true,
        actions: [
          { key: 'add-group', label: '新增分组', onClick: (treeNode) => openGroupEditor(treeNode.key) },
          { key: 'add-table', label: '添加表', onClick: (treeNode) => openTableEditor(treeNode.key) },
          { key: 'delete', label: '删除', danger: true, onClick: (treeNode) => setDeleteTarget({ type: 'group', id: treeNode.key, name: treeNode.title }) },
        ],
        children: (node.children || []).map(mapNode),
      }
    }
    return groups.map(mapNode)
  }, [groups])

  const showMessage = (text) => notify(setMessageText, text)
  const updateSelectedTable = (updater) => {
    if (!selectedTable) return
    setGroups((current) => updateNodeById(current, selectedTable.id, (table) => updater(table)))
  }

  const handleSelectNode = (key, node) => {
    setSelectedNodeKey(key)
    if (node.nodeType !== 'table') {
      setExpandedTreeKeys((current) => [...new Set([...current, key])])
    }
  }

  // 新增一级分组：右侧进入空白分组编辑
  const openPrimaryEditor = () => {
    const newId = `group-${Date.now()}`
    setGroupFormDraft({
      id: newId,
      name: '',
      enabled: true,
      depth: 1,
      childrenCount: 0,
      isNew: true,
      parentId: null,
    })
    setSelectedNodeKey(newId)
  }

  // 新增子分组：右侧进入空白分组编辑
  const openGroupEditor = (parentId) => {
    const newId = `group-${Date.now()}`
    const parentFound = findNodeById(groups, parentId)
    const parentDepth = parentFound?.path?.length || 1
    setGroupFormDraft({
      id: newId,
      name: '',
      enabled: true,
      depth: parentDepth + 1,
      childrenCount: 0,
      isNew: true,
      parentId,
    })
    setSelectedNodeKey(newId)
    setExpandedTreeKeys((current) => [...new Set([...current, parentId])])
  }

  const changeGroupFormDraft = (key, value) => setGroupFormDraft((current) => (
    current ? { ...current, [key]: value } : current
  ))

  const saveGroupForm = () => {
    if (!groupFormDraft?.name?.trim()) {
      showMessage('分组名称不能为空')
      return
    }
    const { isNew, parentId, depth, childrenCount, ...nodeData } = groupFormDraft
    const newNode = { ...nodeData, nodeType: 'group', children: [] }
    if (isNew) {
      if (parentId) {
        setGroups((current) => appendChildById(current, parentId, newNode))
      } else {
        setGroups((current) => [...current, newNode])
      }
      showMessage('分组已新增')
    } else {
      setGroups((current) => updateNodeById(current, groupFormDraft.id, (node) => ({
        ...node,
        name: groupFormDraft.name,
        enabled: groupFormDraft.enabled,
      })))
      showMessage('分组设置已保存')
    }
    setGroupFormDraft((current) => current ? { ...current, isNew: false } : current)
  }

  // 新增表：右侧进入空白表编辑
  const openTableEditor = (parentId) => {
    const newId = `table-${Date.now()}`
    setTableFormDraft({
      id: newId,
      displayName: '',
      name: '',
      nodeType: 'table',
      displayType: '表格',
      sourceTable: '教学档案袋',
      enabled: true,
      description: '',
      defaultSort: '按时间倒序',
      fields: [],
      isNew: true,
      parentId,
    })
    setSelectedNodeKey(newId)
    setExpandedTreeKeys((current) => [...new Set([...current, parentId])])
  }

  const changeTableFormDraft = (key, value) => setTableFormDraft((current) => (
    current ? { ...current, [key]: value } : current
  ))

  const saveTableForm = () => {
    if (!tableFormDraft?.displayName?.trim()) {
      showMessage('表显示名称不能为空')
      return
    }
    if (!tableFormDraft?.name?.trim()) {
      showMessage('表名称不能为空')
      return
    }
    const { isNew, parentId, ...nextTable } = tableFormDraft
    if (isNew && parentId) {
      setGroups((current) => appendChildById(current, parentId, nextTable))
      showMessage('表已新增')
    } else if (!isNew) {
      setGroups((current) => updateNodeById(current, tableFormDraft.id, () => nextTable))
      showMessage('表设置已保存')
    }
    setTableFormDraft((current) => current ? { ...current, isNew: false } : current)
  }

  const openFieldEditor = (mode, field = null) => {
    setFieldEditor({
      open: true,
      mode,
      draft: field ? { ...field } : null,
    })
  }

  const selectRegisteredField = (fieldRef) => setFieldEditor((current) => {
    const previous = current.draft
    const draft = createOntologyArchiveField(fieldRef, {
      id: previous?.id || `field-${Date.now()}`,
      key: previous?.key,
    })
    return { ...current, draft }
  })

  const changeFieldDraft = (key, value) => setFieldEditor((current) => ({
    ...current,
    draft: current.draft ? { ...current.draft, [key]: value } : current.draft,
  }))

  const submitField = () => {
    const { draft, mode } = fieldEditor
    if (!draft?.fieldRef || !isRegisteredArchiveField(draft)) {
      showMessage('请选择系统字段')
      return
    }
    if (!draft?.key?.trim()) {
      showMessage('字段标识不能为空')
      return
    }
    const duplicated = selectedTable?.fields.some((field) => field.fieldRef === draft.fieldRef && field.id !== draft.id)
    if (duplicated) {
      showMessage(`当前表已包含“${draft.name}”字段`)
      return
    }
    const lockedDraft = {
      ...createOntologyArchiveField(draft.fieldRef, { id: draft.id, key: draft.key, source: draft.source }),
      perGroup: draft.perGroup,
      cardRole: draft.cardRole,
    }
    updateSelectedTable((table) => ({
      ...table,
      fields: mode === 'create'
        ? [...table.fields, lockedDraft]
        : table.fields.map((field) => (field.id === draft.id ? lockedDraft : field)),
    }))
    setFieldEditor({ open: false, mode: 'create', draft: null })
    showMessage(mode === 'create' ? '字段已新增' : '字段已保存')
  }

  // 字段编辑弹窗里修改「全部用户」组的默认值
  const changeFieldDraftPerm = (permKey, value) => setFieldEditor((current) => {
    if (!current.draft) return current
    const perGroup = { ...(current.draft.perGroup || {}) }
    perGroup['全部用户'] = { ...getFieldPerm(current.draft, '全部用户'), [permKey]: value }
    return { ...current, draft: { ...current.draft, perGroup } }
  })

  // 读取字段在指定用户组下的权限（未单独配置时回退到「全部用户」默认值）
  const getFieldPerm = (field, groupKey) => {
    const perGroup = field.perGroup || {}
    const fallback = perGroup['全部用户'] || { visible: true, required: false, view: true, edit: false }
    const merged = { ...fallback, ...perGroup[groupKey] }
    return merged
  }

  // 第一步：更新字段在「全部用户」组下的 visible/required
  const updateFieldPerm = (fieldId, permKey, value) => updateSelectedTable((table) => ({
    ...table,
    fields: table.fields.map((field) => {
      if (field.id !== fieldId) return field
      const perGroup = { ...(field.perGroup || {}) }
      perGroup['全部用户'] = { ...getFieldPerm(field, '全部用户'), [permKey]: value }
      return { ...field, perGroup }
    }),
  }))

  const handleTreeDrop = ({ dragNode, dropNode }) => {
    if (!dragNode || !dropNode || dragNode.nodeType !== dropNode.nodeType) {
      showMessage('仅支持同层级分组排序')
      return
    }
    if (dragNode.nodeType === 'group') {
      // 递归查找父节点并重排 children
      const dragFound = findNodeById(groups, dragNode.key)
      const dropFound = findNodeById(groups, dropNode.key)
      if (!dragFound || !dropFound) return
      const dragParent = dragFound.path.length > 1 ? dragFound.path[dragFound.path.length - 2] : null
      const dropParent = dropFound.path.length > 1 ? dropFound.path[dropFound.path.length - 2] : null
      if (dragParent?.id !== dropParent?.id) {
        showMessage('仅支持同父级下的分组排序')
        return
      }
      if (!dragParent) {
        // 根层级排序
        setGroups((current) => {
          const next = [...current]
          const from = next.findIndex((item) => item.id === dragNode.key)
          const to = next.findIndex((item) => item.id === dropNode.key)
          if (from < 0 || to < 0) return current
          const [moved] = next.splice(from, 1)
          next.splice(to, 0, moved)
          return next
        })
      } else {
        // 子层级排序
        setGroups((current) => updateNodeById(current, dragParent.id, (parent) => {
          const nextChildren = [...(parent.children || [])]
          const from = nextChildren.findIndex((item) => item.id === dragNode.key)
          const to = nextChildren.findIndex((item) => item.id === dropNode.key)
          if (from < 0 || to < 0) return parent
          const [moved] = nextChildren.splice(from, 1)
          nextChildren.splice(to, 0, moved)
          return { ...parent, children: nextChildren }
        }))
      }
      showMessage('分组顺序已更新')
    }
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'field') {
      updateSelectedTable((table) => ({ ...table, fields: table.fields.filter((field) => field.id !== deleteTarget.id) }))
    } else if (deleteTarget.type === 'table' || deleteTarget.type === 'group') {
      // 递归删除节点
      const found = findNodeById(groups, deleteTarget.id)
      if (!found) return
      const parent = found.path.length > 1 ? found.path[found.path.length - 2] : null
      if (!parent) {
        // 删除根节点
        setGroups((current) => current.filter((item) => item.id !== deleteTarget.id))
        const nextRoot = groups.find((item) => item.id !== deleteTarget.id) || groups[0]
        setSelectedNodeKey(nextRoot?.id || '')
      } else {
        // 删除子节点
        setGroups((current) => updateNodeById(current, parent.id, (p) => ({
          ...p,
          children: (p.children || []).filter((child) => child.id !== deleteTarget.id),
        })))
        const nextSibling = (parent.children || []).find((child) => child.id !== deleteTarget.id)
        setSelectedNodeKey(nextSibling?.id || parent.id)
      }
    }
    setDeleteTarget(null)
    showMessage('配置项已删除')
  }

  const fieldColumns = [
    { key: 'name', dataIndex: 'name', title: '字段名称', width: 150 },
    { key: 'key', dataIndex: 'key', title: '字段标识', width: 150 },
    { key: 'visible', title: '页面展示', width: 110, render: (_, record) => {
      const perm = getFieldPerm(record, '全部用户')
      return <DSSwitch checked={perm.visible} checkedText="是" uncheckedText="否" onChange={(next) => updateFieldPerm(record.id, 'visible', next)} />
    } },
    { key: 'required', title: '必填', width: 100, render: (_, record) => {
      const perm = getFieldPerm(record, '全部用户')
      return <DSSwitch checked={perm.required} checkedText="是" uncheckedText="否" onChange={(next) => updateFieldPerm(record.id, 'required', next)} />
    } },
    { key: 'actions', title: '操作', width: 90, render: (_, record) => <DSButton size="small" variant="text" onClick={() => openFieldEditor('edit', record)}>设置</DSButton> },
  ]

  if (!groups.length) return null

  // 第二步权限辅助函数
  const getPerm = (field, groupKey) => {
    const perGroup = field.perGroup || {}
    const fallback = perGroup['全部用户'] || { view: true, edit: false, required: false }
    return perGroup[groupKey] || fallback
  }

  const updatePerm = (fieldId, permKey, value) => {
    setGroups((current) => updateNodeById(current, fieldId, (field) => {
      const perGroup = { ...(field.perGroup || {}) }
      perGroup[permUserGroup] = { ...getPerm(field, permUserGroup), [permKey]: value }
      return { ...field, perGroup }
    }))
  }

  // 收集分组下所有字段（递归）
  const collectGroupFields = (group) => {
    const fields = []
    const traverse = (node) => {
      if (node.nodeType === 'table' && node.fields) {
        fields.push(...node.fields)
      } else if (node.children) {
        node.children.forEach(traverse)
      }
    }
    traverse(group)
    return fields
  }

  // 分组级权限聚合（所有字段都勾选才算勾选）
  const getGroupPerm = (group, groupKey) => {
    const fields = collectGroupFields(group)
    if (!fields.length) return { view: false, edit: false, required: false }
    return {
      view: fields.every((f) => getPerm(f, groupKey).view),
      edit: fields.every((f) => getPerm(f, groupKey).edit),
      required: fields.every((f) => getPerm(f, groupKey).required),
    }
  }

  // 批量更新分组下所有字段的权限
  const updateGroupPerm = (groupId, permKey, value) => {
    const groupFound = findNodeById(groups, groupId)
    if (!groupFound) return
    collectGroupFields(groupFound.node).forEach((field) => {
      updatePerm(field.id, permKey, value)
    })
  }

  // 第二步：渲染权限矩阵
  const renderPermissionMatrix = () => (
    <section className="archive-permission-layout" aria-label="用户组权限配置">
      <aside className="archive-permission-sidebar">
        <h3>用户组</h3>
        <ul className="archive-permission-groups">
          {PERMISSION_USER_GROUPS.map((group) => (
            <li
              key={group}
              className={['archive-permission-groups__item', group === permUserGroup && 'is-active'].filter(Boolean).join(' ')}
              onClick={() => setPermUserGroup(group)}
            >
              {group}
            </li>
          ))}
        </ul>
      </aside>

      <div className="archive-permission-main">
        {groups.map((group) => {
          const expanded = permExpandedGroups.includes(group.id)
          const groupPerm = getGroupPerm(group, permUserGroup)
          const fields = collectGroupFields(group)

          return (
            <div key={group.id} className="archive-permission-block">
              <div className="archive-permission-block__header">
                <DSButton
                  variant="link"
                  className="archive-permission-block__toggle"
                  onClick={() => setPermExpandedGroups((current) =>
                    expanded ? current.filter((id) => id !== group.id) : [...current, group.id]
                  )}
                >
                  <span className={['archive-permission-block__arrow', expanded && 'is-expanded'].filter(Boolean).join(' ')}>▶</span>
                  <span className="archive-permission-block__title">{group.name}</span>
                </DSButton>
                <span className="archive-permission-block__batch">
                  <DSCheckbox label="查看" checked={groupPerm.view} onChange={(next) => updateGroupPerm(group.id, 'view', next)} />
                  <DSCheckbox label="编辑" checked={groupPerm.edit} onChange={(next) => updateGroupPerm(group.id, 'edit', next)} />
                  <DSCheckbox label="必填" checked={groupPerm.required} onChange={(next) => updateGroupPerm(group.id, 'required', next)} />
                </span>
              </div>
              {expanded && fields.length ? (
                <div className="archive-permission-block__body">
                  {fields.map((field) => {
                    const perm = getPerm(field, permUserGroup)
                    return (
                      <div key={field.id} className="archive-permission-field">
                        <span className="archive-permission-field__name">{field.name}</span>
                        <span className="archive-permission-field__perms">
                          <DSCheckbox label="查看" checked={perm.view} onChange={(next) => updatePerm(field.id, 'view', next)} />
                          <DSCheckbox label="编辑" checked={perm.edit} onChange={(next) => updatePerm(field.id, 'edit', next)} />
                          <DSCheckbox label="必填" checked={perm.required} onChange={(next) => updatePerm(field.id, 'required', next)} />
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )

  return (
    <>
      <section className="archive-wizard" aria-label="档案字段设置向导">
        <DSSteps
          items={STEPS_ITEMS}
          current={currentStep}
          clickable
          onChange={(index) => setCurrentStep(index)}
        />

        {currentStep === 0 ? (
          <section className="archive-config-layout" aria-label="设置档案字段">
            <aside className="archive-config-tree">
              <div className="archive-config-tree-header">
                <h3>档案目录</h3>
                <DSButton size="small" onClick={openPrimaryEditor}>新增一级分组</DSButton>
              </div>
              <DSTree
                ariaLabel="教学档案袋目录"
                className="archive-tree-scroll"
                dataSource={archiveTreeData}
                expandedKeys={expandedTreeKeys}
                selectedKey={selectedNodeKey}
                onDrop={handleTreeDrop}
                onExpand={setExpandedTreeKeys}
                onSelect={handleSelectNode}
              />
            </aside>

            <div className="archive-config-main">
              {selectedLevel === 'group' && groupFormDraft ? (
                <div className="archive-config-group">
                  <div className="archive-config-group__header">
                    <h3>{groupFormDraft.name || '分组设置'}</h3>
                  </div>
                  <div className="archive-config-table-form">
                    <DSEditField label="分组名称" required>
                      <DSInput value={groupFormDraft.name || ''} placeholder="请输入分组名称" onChange={(event) => changeGroupFormDraft('name', event.target.value)} />
                    </DSEditField>
                    <DSEditField label="启用状态">
                      <DSSwitch checked={Boolean(groupFormDraft.enabled)} checkedText="启用" uncheckedText="停用" onChange={(value) => changeGroupFormDraft('enabled', value)} />
                    </DSEditField>
                  </div>
                </div>
              ) : selectedLevel === 'table' && tableFormDraft ? (
                <div className="archive-config-group">
                  <div className="archive-config-group__header">
                    <h3>{tableFormDraft.displayName || '表设置'}</h3>
                  </div>
                  <div className="archive-config-table-form">
                    <DSEditField label="表显示名称" required>
                      <DSInput value={tableFormDraft.displayName || ''} placeholder="请输入表显示名称" onChange={(event) => changeTableFormDraft('displayName', event.target.value)} />
                    </DSEditField>
                    <DSEditField label="表名称（标识）" required>
                      <DSInput value={tableFormDraft.name || ''} placeholder="英文标识，如 table_profile" onChange={(event) => changeTableFormDraft('name', event.target.value)} />
                    </DSEditField>
                    <DSEditField label="展示类型" required>
                      <DSSelect options={archiveDisplayTypes} value={tableFormDraft.displayType} onChange={(value) => changeTableFormDraft('displayType', value)} />
                    </DSEditField>
                    <DSEditField label="来源表">
                      <DSSelect options={['教学档案袋', '人事系统', '教务系统', '组织机构', '数据采集']} value={tableFormDraft.sourceTable || '教学档案袋'} onChange={(value) => changeTableFormDraft('sourceTable', value)} />
                    </DSEditField>
                    <DSEditField label="状态">
                      <DSSwitch checked={Boolean(tableFormDraft.enabled)} checkedText="启用" uncheckedText="停用" onChange={(value) => changeTableFormDraft('enabled', value)} />
                    </DSEditField>
                    <DSEditField label="默认排序方式">
                      <DSSelect options={['无', '按时间倒序', '按时间正序', '按名称排序', '按权重排序', '手动排序']} value={tableFormDraft.defaultSort || '无'} onChange={(value) => changeTableFormDraft('defaultSort', value)} />
                    </DSEditField>
                    <DSEditField label="内容说明" align="start" fullWidth>
                      <DSTextarea rows={3} value={tableFormDraft.description || ''} placeholder="请输入表的内容说明" onChange={(event) => changeTableFormDraft('description', event.target.value)} />
                    </DSEditField>
                  </div>
                  {selectedTable?.fields?.length ? (
                    <><div className="archive-config-field-actions"><DSButton size="small" variant="primary" onClick={() => openFieldEditor('create')}>新增标准字段</DSButton></div><DSDataTable
                      className="archive-config-field-table"
                      title="字段配置"
                      summary={`共 ${selectedTable.fields.length} 个字段`}
                      columns={fieldColumns}
                      data={selectedTable.fields}
                      rowKey="id"
                      selectable={false}
                      bordered={false}
                      tableTools={false}
                      draggable
                    /></>
                  ) : <div className="archive-config-field-actions"><DSButton size="small" variant="primary" onClick={() => openFieldEditor('create')}>新增标准字段</DSButton></div>}
                </div>
              ) : (
                <div className="archive-config-group">
                  <div className="archive-config-group__header">
                    <h3>请选择节点</h3>
                  </div>
                  <p className="archive-config-group__notice">请在左侧树中选择分组或表进行配置。</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          renderPermissionMatrix()
        )}

        <div className="archive-wizard-footer">
          {currentStep > 0 && <DSButton onClick={() => setCurrentStep(currentStep - 1)}>上一步</DSButton>}
          {currentStep < STEPS_ITEMS.length - 1 && <DSButton variant="primary" onClick={() => setCurrentStep(currentStep + 1)}>下一步</DSButton>}
          <DSButton variant="primary" onClick={() => {
            if (currentStep === 0) {
              if (groupFormDraft?.isNew) saveGroupForm()
              else if (tableFormDraft?.isNew) saveTableForm()
              else showMessage('第一步设置已保存')
            } else {
              showMessage('用户组权限已保存')
            }
          }}>保存</DSButton>
        </div>
      </section>

      {messageText ? <div className="sys-admin-status" role="status">{messageText}</div> : null}

      <DSSingleEditModal
        open={fieldEditor.open}
        title={`${fieldEditor.mode === 'create' ? '新增' : '编辑'}字段`}
        onCancel={() => setFieldEditor({ open: false, mode: 'create', draft: null })}
        onOk={submitField}
      >
        <DSEditField label="选择字段" required><DSSelect searchable options={ONTOLOGY_FIELD_OPTIONS} value={fieldEditor.draft?.fieldRef || ''} placeholder="请选择字段" disabled={fieldEditor.mode === 'edit'} onChange={selectRegisteredField} /></DSEditField>
        <DSEditField label="字段名称"><DSInput value={fieldEditor.draft?.name || ''} readOnly placeholder="选择后自动带出" /></DSEditField>
        <DSEditField label="字段标识" required><DSInput value={fieldEditor.draft?.key || ''} disabled={!fieldEditor.draft} onChange={(event) => changeFieldDraft('key', event.target.value)} /></DSEditField>
        <DSEditField label="字段类型"><DSInput value={fieldEditor.draft?.type || ''} readOnly placeholder="选择后自动带出" /></DSEditField>
        <DSEditField label="页面展示"><DSSwitch checked={getFieldPerm(fieldEditor.draft || {}, '全部用户').visible} checkedText="是" uncheckedText="否" onChange={(value) => changeFieldDraftPerm('visible', value)} /></DSEditField>
        <DSEditField label="是否必填"><DSSwitch checked={getFieldPerm(fieldEditor.draft || {}, '全部用户').required} checkedText="是" uncheckedText="否" onChange={(value) => changeFieldDraftPerm('required', value)} /></DSEditField>
        <DSEditField label="只读"><DSSwitch checked={!getFieldPerm(fieldEditor.draft || {}, '全部用户').edit} checkedText="是" uncheckedText="否" onChange={(value) => changeFieldDraftPerm('edit', !value)} /></DSEditField>
      </DSSingleEditModal>

      <DSModal
        open={Boolean(deleteTarget)}
        title="确认删除"
        danger
        okText="删除"
        onCancel={() => setDeleteTarget(null)}
        onOk={confirmDelete}
      >
        <p className="sys-admin-muted">删除“{deleteTarget?.name}”后无法恢复，请确认是否继续。</p>
      </DSModal>
    </>
  )
}

function MajorGroupWorkbench() {
  const [groups, setGroups] = useState(initialMajorGroups)
  const [filters, setFilters] = useState({ keyword: '', college: '全部学院', status: '全部状态' })
  const [editor, setEditor] = useState({ open: false, mode: 'create', draft: null })
  const [deleteConfig, setDeleteConfig] = useState(null)
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 1600)
  }
  const change = (field, value) => setEditor((current) => ({
    ...current,
    draft: current.draft ? { ...current.draft, [field]: value } : current.draft,
  }))
  const openCreate = () => setEditor({ open: true, mode: 'create', draft: createMajorGroupDraft(groups) })
  const openEdit = (record) => setEditor({ open: true, mode: 'edit', draft: { ...record } })
  const closeEditor = () => setEditor({ open: false, mode: 'create', draft: null })

  const save = () => {
    const draft = editor.draft
    if (!draft?.name?.trim()) {
      notify('专业群名称不能为空')
      return
    }
    if (!draft?.code?.trim()) {
      notify('专业群编码不能为空')
      return
    }
    setGroups((current) => (
      editor.mode === 'create'
        ? [draft, ...current]
        : current.map((item) => (item.id === draft.id ? draft : item))
    ))
    closeEditor()
    notify(editor.mode === 'create' ? '专业群已新增' : '专业群已保存')
  }

  const requestDelete = (record) => {
    const hasReferences = record.references?.teachers > 0 || record.references?.courses > 0
    setDeleteConfig({ mode: hasReferences ? 'blocked' : 'normal', record })
  }
  const confirmDelete = () => {
    if (deleteConfig?.mode === 'normal') {
      setGroups((current) => current.filter((item) => item.id !== deleteConfig.record.id))
      notify('专业群已删除')
    }
    setDeleteConfig(null)
  }

  const filtered = useMemo(() => groups.filter((row) => {
    const keyword = filters.keyword.trim().toLowerCase()
    if (keyword && !`${row.name}${row.code}`.toLowerCase().includes(keyword)) return false
    if (filters.college !== '全部学院' && row.college !== filters.college) return false
    if (filters.status !== '全部状态' && row.status !== filters.status) return false
    return true
  }), [filters, groups])

  const filterProps = useMemo(() => ({
    fields: [
      { key: 'keyword', label: '名称/编码', placeholder: '搜索专业群或编码', controlledValue: filters.keyword, onChange: (event) => setFilters((current) => ({ ...current, keyword: event.target.value })) },
      { key: 'college', label: '所属学院', type: 'select', options: ['全部学院', ...collegeOptions], controlledValue: filters.college, onChange: (value) => setFilters((current) => ({ ...current, college: value })) },
      { key: 'status', label: '状态', type: 'select', options: ['全部状态', '已启用', '已停用'], controlledValue: filters.status, onChange: (value) => setFilters((current) => ({ ...current, status: value })) },
    ],
    showExpand: false,
    showMore: false,
    onSearch: () => notify('已按当前条件查询'),
    onReset: () => setFilters({ keyword: '', college: '全部学院', status: '全部状态' }),
  }), [filters])

  const columns = [
    { key: 'name', dataIndex: 'name', title: '专业群名称', width: 200, fixed: 'left', render: (value) => <b>{value}</b> },
    { key: 'code', dataIndex: 'code', title: '专业群编码', width: 140 },
    { key: 'college', dataIndex: 'college', title: '所属学院', width: 190 },
    { key: 'majors', dataIndex: 'majors', title: '包含专业', width: 280 },
    { key: 'status', dataIndex: 'status', title: '状态', width: 100, render: (value) => <DSTag tone={statusTone[value] || 'neutral'}>{value}</DSTag> },
    { key: 'createdAt', dataIndex: 'createdAt', title: '创建时间', width: 120 },
  ]

  return (
    <>
      <DSRegularListTemplate
        activeTab="all"
        className="sys-admin-major-group-list-table"
        footerActions={[]}
        flush
        metaLabel=""
        metaValue=""
        notice=""
        pagination={{ total: filtered.length, totalPages: 1, current: 1, pageSize: 10 }}
        summary=""
        tabs={[]}
        tableTools={false}
        toolbarActions={[
          { key: 'create', label: '新增专业群', variant: 'primary', onClick: openCreate },
        ]}
        filterProps={filterProps}
        tableProps={{
          actions: [
            { key: 'edit', label: '编辑', onClick: openEdit },
            { key: 'delete', label: '删除', danger: true, onClick: requestDelete },
          ],
          actionsMaxVisible: 2,
          bordered: false,
          columns,
          data: filtered,
          minWidth: 1000,
          rowKey: 'id',
          selectable: false,
          showIndex: true,
        }}
      />

      <DSDoubleEditModal
        open={editor.open}
        title={editor.mode === 'edit' ? '编辑专业群' : '新增专业群'}
        description="维护专业群名称、编码、所属学院与状态。"
        okText="保存"
        onCancel={closeEditor}
        onOk={save}
      >
        {editor.draft ? (
          <>
            <DSEditField label="专业群名称" required>
              <DSInput value={editor.draft.name} placeholder="请输入专业群名称" onChange={(event) => change('name', event.target.value)} />
            </DSEditField>
            <DSEditField label="专业群编码" required>
              <DSInput value={editor.draft.code} placeholder="请输入专业群编码" onChange={(event) => change('code', event.target.value)} />
            </DSEditField>
            <DSEditField label="所属学院" required>
              <DSSelect options={collegeOptions} value={editor.draft.college} onChange={(value) => change('college', value)} />
            </DSEditField>
            <DSEditField label="包含专业" fullWidth>
              <DSSelect
                multiple
                searchable
                options={majorDictionaryOptions}
                value={editor.draft.majors ? editor.draft.majors.split('、').filter(Boolean) : []}
                placeholder="请选择专业字典项"
                onChange={(values) => change('majors', values.join('、'))}
              />
            </DSEditField>
            <DSEditField label="状态">
              <DSSwitch
                checked={editor.draft.status === '已启用'}
                checkedText="启用"
                uncheckedText="停用"
                onChange={(checked) => change('status', checked ? '已启用' : '已停用')}
              />
            </DSEditField>
          </>
        ) : null}
      </DSDoubleEditModal>

      <DSModal
        open={Boolean(deleteConfig)}
        title={deleteConfig?.mode === 'blocked' ? '不可删除' : '确认删除专业群'}
        description={deleteConfig?.mode === 'blocked'
          ? `专业群「${deleteConfig?.record?.name}」已被教师或课程引用。`
          : `删除「${deleteConfig?.record?.name}」后不可恢复。`}
        okText={deleteConfig?.mode === 'blocked' ? '我知道了' : '确认删除'}
        danger={deleteConfig?.mode !== 'blocked'}
        showCancel={deleteConfig?.mode !== 'blocked'}
        onCancel={() => setDeleteConfig(null)}
        onOk={deleteConfig?.mode === 'blocked' ? () => setDeleteConfig(null) : confirmDelete}
      >
        <p className="sys-admin-muted">
          {deleteConfig?.mode === 'blocked'
            ? '当前专业群存在教师归属或课程关联，只允许停用，不允许直接删除。'
            : '删除前会再次校验教师归属和课程引用。'}
        </p>
      </DSModal>

      {toast ? <div className="sys-admin-status" role="status">{toast}</div> : null}
    </>
  )
}

/* ═══════════════ 审核流全局配置工作区 ═══════════════ */

const overdueRuleOptions = ['允许逾期补交', '截止后锁定不可补交', '逾期自动记 0 分']

const initialAuditDefaults = {
  scope: ['教学信息', '成果与荣誉', '任职情况'],
  duration: 20,
  overdue: '截止后锁定不可补交',
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

function AuditConfigWorkbench({ archiveGroups, defaults, setDefaults, semesters, setSemesters, templates, setTemplates }) {
  const [defaultsDraft, setDefaultsDraft] = useState(defaults)
  const [templateEditor, setTemplateEditor] = useState({ open: false, mode: 'create', draft: null })
  const [semesterEditor, setSemesterEditor] = useState({ open: false, mode: 'create', draft: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [messageText, setMessageText] = useState('')

  const showMessage = (text) => notify(setMessageText, text)
  const scopeOptions = useMemo(() => archiveGroups.map((group) => ({ label: group.name, value: group.name })), [archiveGroups])

  const changeDefaults = (key, value) => setDefaultsDraft((current) => ({ ...current, [key]: value }))
  const saveDefaults = () => {
    if (!defaultsDraft.scope.length) {
      showMessage('默认审核范围不能为空')
      return
    }
    setDefaults(defaultsDraft)
    showMessage('全局默认设置已保存')
  }

  const setCurrentSemester = (id) => {
    setSemesters((current) => current.map((item) => ({ ...item, current: item.id === id })))
    showMessage('已切换当前考核学期')
  }
  const openSemesterEditor = (mode, record = null) => {
    setSemesterEditor({ open: true, mode, draft: record ? { ...record } : { id: `sem-${Date.now()}`, name: '', current: false, note: '' } })
  }
  const changeSemesterDraft = (key, value) => setSemesterEditor((current) => ({ ...current, draft: { ...current.draft, [key]: value } }))
  const submitSemester = () => {
    const { draft, mode } = semesterEditor
    if (!draft?.name?.trim()) {
      showMessage('学期名称不能为空')
      return
    }
    setSemesters((current) => (mode === 'create' ? [draft, ...current] : current.map((item) => (item.id === draft.id ? draft : item))))
    setSemesterEditor({ open: false, mode: 'create', draft: null })
    showMessage(mode === 'create' ? '考核学期已新增' : '考核学期已保存')
  }

  const openTemplateEditor = (mode, record = null) => {
    setTemplateEditor({
      open: true,
      mode,
      draft: record
        ? { ...record, scope: [...record.scope] }
        : { id: `tpl-${Date.now()}`, name: '', scope: [...defaults.scope], duration: defaults.duration, overdue: defaults.overdue, note: '' },
    })
  }
  const changeTemplateDraft = (key, value) => setTemplateEditor((current) => ({ ...current, draft: { ...current.draft, [key]: value } }))
  const submitTemplate = () => {
    const { draft, mode } = templateEditor
    if (!draft?.name?.trim()) {
      showMessage('模板名称不能为空')
      return
    }
    if (!draft.scope.length) {
      showMessage('审核范围不能为空')
      return
    }
    setTemplates((current) => (mode === 'create' ? [draft, ...current] : current.map((item) => (item.id === draft.id ? draft : item))))
    setTemplateEditor({ open: false, mode: 'create', draft: null })
    showMessage(mode === 'create' ? '批次模板已新增' : '批次模板已保存')
  }
  const confirmDelete = () => {
    if (!deleteTarget) return
    setTemplates((current) => current.filter((item) => item.id !== deleteTarget.id))
    setDeleteTarget(null)
    showMessage('批次模板已删除')
  }

  const semesterColumns = [
    { key: 'name', dataIndex: 'name', title: '学年学期', width: 220 },
    { key: 'current', dataIndex: 'current', title: '状态', width: 120, render: (value) => <DSTag tone={value ? 'success' : 'neutral'}>{value ? '当前学期' : '历史'}</DSTag> },
    { key: 'note', dataIndex: 'note', title: '说明', width: 260 },
  ]
  const templateColumns = [
    { key: 'name', dataIndex: 'name', title: '模板名称', width: 220 },
    { key: 'scope', dataIndex: 'scope', title: '审核范围', width: 280, render: (value) => <span className="audit-config-tags">{value.map((item) => <DSTag key={item} tone="primary">{item}</DSTag>)}</span> },
    { key: 'duration', dataIndex: 'duration', title: '提交时长', width: 100, render: (value) => `${value} 天` },
    { key: 'overdue', dataIndex: 'overdue', title: '逾期处理', width: 160 },
    { key: 'note', dataIndex: 'note', title: '说明', width: 260 },
  ]

  return (
    <>
      <section className="audit-config-stack" aria-label="审核流全局配置">
        <DSCard layout="long" title="全局默认设置" tag="发起批次默认值">
          <div className="audit-config-defaults">
            <DSEditField label="默认审核范围" required>
              <DSSelect multiple options={scopeOptions} value={defaultsDraft.scope} onChange={(value) => changeDefaults('scope', value)} />
            </DSEditField>
            <DSEditField label="默认提交时长（天）" required>
              <DSInput type="number" min={1} value={defaultsDraft.duration} onChange={(event) => changeDefaults('duration', Number(event.target.value))} />
            </DSEditField>
            <DSEditField label="逾期处理默认">
              <DSSelect options={overdueRuleOptions} value={defaultsDraft.overdue} onChange={(value) => changeDefaults('overdue', value)} />
            </DSEditField>
            <DSEditField label="评分满分">
              <DSInput type="number" min={1} value={defaultsDraft.fullScore} onChange={(event) => changeDefaults('fullScore', Number(event.target.value))} />
            </DSEditField>
            <div className="audit-config-defaults__actions">
              <DSButton variant="primary" onClick={saveDefaults}>保存</DSButton>
              <DSButton onClick={() => setDefaultsDraft(defaults)}>重置</DSButton>
            </div>
          </div>
        </DSCard>

        <DSDataTable
          variant="lowcode"
          title="考核学期口径"
          summary={`共 ${semesters.length} 个学期`}
          columns={semesterColumns}
          data={semesters}
          rowKey="id"
          selectable={false}
          bordered={false}
          actionsMaxVisible={2}
          actions={[
            { key: 'current', label: '设为当前', disabled: (record) => record.current, onClick: (record) => setCurrentSemester(record.id) },
            { key: 'edit', label: '编辑', onClick: (record) => openSemesterEditor('edit', record) },
          ]}
          toolbarActions={<DSButton onClick={() => openSemesterEditor('create')}>新增学期</DSButton>}
        />

        <DSRegularListTemplate
          activeTab="all"
          className="audit-template-list"
          flush
          metaLabel=""
          metaValue=""
          notice=""
          pagination={{ total: templates.length, totalPages: 1, current: 1, pageSize: 10 }}
          summary=""
          tabs={[]}
          tableTools={false}
          footerActions={[]}
          toolbarActions={[{ key: 'create', label: '新增批次模板', variant: 'primary', onClick: () => openTemplateEditor('create') }]}
          filterProps={{
            fields: [
              {
                key: 'name',
                label: '模板名称',
                placeholder: '搜索模板名称',
                controlledValue: '',
                onChange: () => {},
              },
              {
                key: 'scope',
                label: '审核范围',
                type: 'select',
                options: ['全部', ...scopeOptions.map((item) => item.label)],
                controlledValue: '全部',
                onChange: () => {},
              },
              {
                key: 'status',
                label: '状态',
                type: 'select',
                options: ['全部', '已启用', '已停用'],
                controlledValue: '全部',
                onChange: () => {},
              },
            ],
            showExpand: false,
            showMore: false,
            onReset: () => {},
            onSearch: () => showMessage('已按当前条件查询'),
          }}
          tableProps={{
            columns: templateColumns,
            data: templates,
            rowKey: 'id',
            selectable: false,
            bordered: false,
            minWidth: 1000,
            actions: [
              { key: 'edit', label: '编辑', onClick: (record) => openTemplateEditor('edit', record) },
              { key: 'delete', label: '删除', danger: true, onClick: (record) => setDeleteTarget(record) },
            ],
            actionsMaxVisible: 2,
          }}
        />
      </section>

      {messageText ? <div className="sys-admin-status" role="status">{messageText}</div> : null}

      <DSSingleEditModal
        open={semesterEditor.open}
        title={`${semesterEditor.mode === 'create' ? '新增' : '编辑'}考核学期`}
        onCancel={() => setSemesterEditor({ open: false, mode: 'create', draft: null })}
        onOk={submitSemester}
      >
        <DSEditField label="学年学期" required>
          <DSInput value={semesterEditor.draft?.name || ''} placeholder="如 2025-2026学年 春季学期" onChange={(event) => changeSemesterDraft('name', event.target.value)} />
        </DSEditField>
        <DSEditField label="说明">
          <DSInput value={semesterEditor.draft?.note || ''} placeholder="请输入说明" onChange={(event) => changeSemesterDraft('note', event.target.value)} />
        </DSEditField>
      </DSSingleEditModal>

      <DSSingleEditModal
        open={templateEditor.open}
        title={`${templateEditor.mode === 'create' ? '新增' : '编辑'}批次模板`}
        onCancel={() => setTemplateEditor({ open: false, mode: 'create', draft: null })}
        onOk={submitTemplate}
      >
        <DSEditField label="模板名称" required>
          <DSInput value={templateEditor.draft?.name || ''} placeholder="请输入模板名称" onChange={(event) => changeTemplateDraft('name', event.target.value)} />
        </DSEditField>
        <DSEditField label="审核范围" required>
          <DSSelect multiple options={scopeOptions} value={templateEditor.draft?.scope || []} onChange={(value) => changeTemplateDraft('scope', value)} />
        </DSEditField>
        <DSEditField label="提交时长（天）" required>
          <DSInput type="number" min={1} value={templateEditor.draft?.duration ?? 20} onChange={(event) => changeTemplateDraft('duration', Number(event.target.value))} />
        </DSEditField>
        <DSEditField label="逾期处理">
          <DSSelect options={overdueRuleOptions} value={templateEditor.draft?.overdue} onChange={(value) => changeTemplateDraft('overdue', value)} />
        </DSEditField>
        <DSEditField label="说明" align="start">
          <DSTextarea rows={3} value={templateEditor.draft?.note || ''} placeholder="请输入模板说明" onChange={(event) => changeTemplateDraft('note', event.target.value)} />
        </DSEditField>
      </DSSingleEditModal>

      <DSModal
        open={Boolean(deleteTarget)}
        title="确认删除"
        danger
        okText="删除"
        onCancel={() => setDeleteTarget(null)}
        onOk={confirmDelete}
      >
        <p className="sys-admin-muted">删除模板“{deleteTarget?.name}”后无法恢复，请确认是否继续。</p>
      </DSModal>
    </>
  )
}

/* ═══════════════ 考核批次管理（全校）工作区 ═══════════════
   批次字段结构与 dean/r-review 完全一致，差异：
   - level 固定 'school'（全校级发起）
   - 增加 scopeType（全校/学院/专业群）+ scopeTargets[]（指定范围）
   - 套用审核流配置的批次模板（initialAuditTemplates）与全局默认满分
*/

const auditBatchStatusTone = (status) => ({
  未发布: 'neutral',
  提交中: 'primary',
  评审中: 'warning',
  已完结: 'success',
  已关闭: 'danger',
}[status] || 'neutral')

const scopeTypeOptions = ['全校', '学院', '专业群']
// 全校范围内的学院与专业群（演示数据，源同 majorGroup / collegeOptions）
const batchCollegeOptions = ['电子与通信工程学院', '人工智能学院', '机电工程学院']
const batchMajorGroupOptions = ['电子信息专业群', '人工智能技术应用专业群', '智能制造专业群']

// 条件构造器：可选字段 + 操作符
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
  // 默认选中档案字段设置中所有来源为"教学档案袋"或"数据采集"的表
  // requiredFields 默认取该表 field.required 为 true 的字段 key
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
    status: '未发布',
    progress: [],
  }
}

// 进度按「发起范围内层级单位」聚合：全校=学院、学院=系、专业群=专业（此处简化为示例单元）
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

// 辅助函数：从 archiveGroups 查找表（递归）
function findTableById(archiveGroups, tableId) {
  for (const node of archiveGroups) {
    if (node.nodeType === 'table' && node.id === tableId) return node
    if (node.children?.length) {
      const found = findTableById(node.children, tableId)
      if (found) return found
    }
  }
  return null
}

function buildInitialBatches(auditDefaults, archiveGroups, auditTemplates) {
  const units = batchScopeUnits.全校
  // 默认表引用（演示数据）
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
    seed('2026 春季学期教学档案考核（全校）', '2025-2026学年 春季学期', '全校', '提交中', { submitted: 8, scored: 0 }),
    seed('2025 秋季学期教学档案评审（全校）', '2025-2026学年 秋季学期', '全校', '评审中', { submitted: 30, scored: 18 }),
    seed('2025 春季学期教学档案考核（全校）', '2024-2025学年 春季学期', '全校', '已完结', { submitted: 25, scored: 25 }),
    seed('2026 秋季学期教学档案考核（全校）', '2025-2026学年 秋季学期', '全校', '未发布', { submitted: 0, scored: 0 }),
  ]
}

function AuditBatchWorkbench({ archiveGroups, auditDefaults, auditTemplates, semesterOptions }) {
  const [batches, setBatches] = useState(() => buildInitialBatches(auditDefaults, archiveGroups, auditTemplates))
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
      progress: batchScopeUnits[batch.scopeType || '全校'].map((unit) => ({ depId: unit.id, submitted: 0, scored: 0, total: unit.total })),
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

  // 设置内容头部计数：已选 N 张表，其中必填字段 M 个
  const tableScopeSummary = useMemo(() => {
    const list = detailDraft?.tableScope || []
    return {
      total: list.length,
      requiredFieldsCount: list.reduce((sum, item) => sum + (item.requiredFields?.length || 0), 0),
    }
  }, [detailDraft])

  const scopeTargetOptions = detailDraft?.scopeType === '学院' ? batchCollegeOptions : batchMajorGroupOptions

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
    { key: 'window', title: '提交窗口', width: 190, render: (_, record) => `${record.startDate} ~ ${record.endDate}` },
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

        {/* 上半部分：批次信息 */}
        <DSFormGroup className="ab-detail-group" title="批次信息">
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
                <div className="ab-info-readonly__item"><span>发起范围</span><strong>{readonlyScopeLabel}</strong></div>
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
                    <div className="ab-content-hidden">开启“是否展示”后，可配置该分组的本次必填字段。</div>
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

function AdminPage() {
  const [activeKey, setActiveKey] = useState(getInitialModule)
  const [archiveGroups, setArchiveGroups] = useState(createInitialArchiveStructure)
  const [message, setMessage] = useState('')
  // 审核流全局配置：在 AdminPage 维护，供审核流配置与考核批次管理共享
  const [auditDefaults, setAuditDefaults] = useState(initialAuditDefaults)
  const [auditSemesters, setAuditSemesters] = useState(initialAuditSemesters)
  const [auditTemplates, setAuditTemplates] = useState(initialAuditTemplates)

  useEffect(() => {
    window.__SYS_ADMIN_SET_MODULE__ = (nextKey) => {
      const normalized = normalizeModuleKey(nextKey)
      setActiveKey(normalized)
      window.history.replaceState(null, '', `#${normalized}`)
    }
    const handleHash = () => setActiveKey(getInitialModule())
    window.addEventListener('hashchange', handleHash)
    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.__SYS_ADMIN_SET_MODULE__ = null
    }
  }, [])

  const activeModule = MODULE_MAP[activeKey]

  return (
    <main className={`sys-admin-page sys-admin-page--${activeKey}`} data-ds-business-page="sys-accounts">
      {activeKey === 'auditConfig' ? (
        <DSPageHeader
          title={activeModule.title}
          description={activeModule.description}
        />
      ) : null}

      {activeKey === 'majorGroup' ? (
        <MajorGroupWorkbench />
      ) : activeKey === 'auditConfig' ? (
        <AuditConfigWorkbench
          archiveGroups={archiveGroups}
          defaults={auditDefaults}
          setDefaults={setAuditDefaults}
          semesters={auditSemesters}
          setSemesters={setAuditSemesters}
          templates={auditTemplates}
          setTemplates={setAuditTemplates}
        />
      ) : activeKey === 'auditBatch' ? (
        <AuditBatchWorkbench
          archiveGroups={archiveGroups}
          auditDefaults={auditDefaults}
          auditTemplates={auditTemplates}
          semesterOptions={auditSemesters.map((item) => item.name)}
        />
      ) : activeKey === 'formManagement' ? (
        <FormManagementWorkbench groups={archiveGroups} setGroups={setArchiveGroups} />
      ) : null}

      {message ? <div className="sys-admin-status" role="status">{message}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<AdminPage />)
