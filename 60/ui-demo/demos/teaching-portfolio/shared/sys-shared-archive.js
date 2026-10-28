import { STAFF_FIELDS, archiveStaffField, createEntityArchiveFields } from './standard-basic-info-fields'

/* ═══════════════ 系统管理员共享：教学档案袋结构、字段与树操作辅助 ═══════════════
   被 sys 下的 form-management（可编辑）、audit-config / audit-batch（只读引用）共用。
*/

export const archiveDisplayTypes = ['表格', '表单', '卡片', '时间轴', '大文本', '文件']
export const archiveFieldTypes = ['单行文本', '多行文本', '数字', '日期', '日期区间', '单选', '多选', '附件', '图片', '开关']

export const PERMISSION_USER_GROUPS = ['导师组', '院系秘书', '专业负责人', '专业群负责人', '学校管理员', '超级管理员']

export const makeField = (id, name, key, type, required = false, visible = true, source = '教学档案袋维护') => ({
  id, name, key, type, source,
  perGroup: {
    '全部用户': { visible, required, view: visible, edit: false },
  },
})

export const initialArchiveGroups = [
  {
    id: 'basic-info', name: '基本信息', enabled: true, children: [
      { id: 'profile', name: '个人信息', displayType: '详情信息', enabled: true, description: '教师身份、学院与岗位基础信息。', fields: [archiveStaffField('name', STAFF_FIELDS.name, 'name'), archiveStaffField('job-no', STAFF_FIELDS.employeeNumber, 'jobNo'), archiveStaffField('gender', STAFF_FIELDS.gender, 'gender'), archiveStaffField('birth-date', STAFF_FIELDS.birthDate, 'birthDate'), archiveStaffField('age', STAFF_FIELDS.age, 'age'), archiveStaffField('ethnicity', STAFF_FIELDS.ethnicity, 'ethnicity'), archiveStaffField('politics', STAFF_FIELDS.politicalAffiliation, 'politicalAffiliation'), archiveStaffField('college', STAFF_FIELDS.organization, 'organizationId', '组织机构'), archiveStaffField('position', STAFF_FIELDS.primaryPosition, 'primaryPosition'), archiveStaffField('teacher-type', STAFF_FIELDS.teacherType, 'teacherType'), archiveStaffField('school-entry-date', STAFF_FIELDS.schoolEntryDate, 'schoolEntryDate'), archiveStaffField('title', STAFF_FIELDS.professionalTitle, 'professionalTitle'), archiveStaffField('title-level', STAFF_FIELDS.professionalTitleLevel, 'professionalTitleLevel')] },
      { id: 'education', name: '学历信息', displayType: '标准表格', enabled: true, description: '学历、学位及毕业院校记录。', fields: [archiveStaffField('education', STAFF_FIELDS.highestEducation, 'highestEducation'), archiveStaffField('degree', STAFF_FIELDS.highestDegree, 'highestDegree'), archiveStaffField('school', STAFF_FIELDS.graduateSchool, 'graduateSchool'), archiveStaffField('major', STAFF_FIELDS.majorStudied, 'majorStudied')] },
      { id: 'certificates', name: '资格证书', displayType: '卡片列表', enabled: true, description: '教师资格、职业资格及技能证书。', fields: [makeField('cert-name', '证书名称', 'certificateName', '单行文本'), makeField('cert-no', '证书编号', 'certificateNo', '单行文本'), makeField('cert-file', '证书附件', 'certificateFile', '附件')] },
    ],
  },
  {
    id: 'teaching-info', name: '教学信息', enabled: true, children: [
      { id: 'courses', name: '课程清单', entityType: 'TeachingAssignment', displayType: '标准表格', enabled: true, description: '教师承担课程及教学任务。', fields: createEntityArchiveFields('TeachingAssignment') },
      { id: 'course-design', name: '课程设计与实施', entityType: 'CoursePortfolio', displayType: '图文材料', enabled: true, sourceTable: '数据采集', description: '教学设计、实施过程与支撑材料。', fields: createEntityArchiveFields('CoursePortfolio', { exclude: ['teachingAssignmentId'] }) },
      { id: 'reflection', name: '课程反思', entityType: 'CoursePortfolio', displayType: '图文材料', enabled: true, sourceTable: '数据采集', description: '课程反馈、问题分析与改进记录。', fields: createEntityArchiveFields('CoursePortfolio', { exclude: ['teachingAssignmentId'] }) },
    ],
  },
  { id: 'enterprise-practice', name: '企业实践', enabled: true, children: [{ id: 'practice-records', name: '实践经历', entityType: 'EnterprisePractice', displayType: '时间轴', enabled: true, description: '企业实践、挂职及产学合作经历。', fields: createEntityArchiveFields('EnterprisePractice') }] },
  { id: 'achievements-honors', name: '成果与荣誉', enabled: true, children: [{ id: 'achievements', name: '教学科研成果', entityType: 'TeachingAchievement', displayType: '卡片列表', enabled: true, sourceTable: '数据采集', description: '成果、获奖及荣誉称号。', fields: createEntityArchiveFields('TeachingAchievement') }] },
  { id: 'training', name: '进修（访学）培训', enabled: true, children: [{ id: 'training-records', name: '培训记录', entityType: 'TrainingExperience', displayType: '时间轴', enabled: true, description: '进修访学、专业培训与学历提升。', fields: createEntityArchiveFields('TrainingExperience') }] },
  { id: 'social-service', name: '社会服务与影响力', enabled: true, children: [{ id: 'service-records', name: '社会服务', entityType: 'TeachingAchievement', displayType: '标准表格', enabled: true, description: '社会服务项目与行业影响力。', fields: createEntityArchiveFields('TeachingAchievement') }] },
  { id: 'appointment', name: '任职情况', enabled: true, children: [{ id: 'appointment-records', name: '任职记录', entityType: 'ProfessionalAppointment', displayType: '时间轴', enabled: true, sourceTable: '数据采集', description: '校外专业组织、行业组织和专家任职情况。', fields: createEntityArchiveFields('ProfessionalAppointment') }] },
  { id: 'other-education', name: '其他教育工作', enabled: true, children: [{ id: 'other-records', name: '教育工作记录', entityType: 'TeachingAchievement', displayType: '标准表格', enabled: true, description: '其他与教育工作相关的成果材料。', fields: createEntityArchiveFields('TeachingAchievement') }] },
]

const legacyDisplayTypeMap = {
  标准表格: '表格',
  详情信息: '表单',
  卡片列表: '卡片',
  时间轴: '时间轴',
  图文材料: '大文本',
}

export const createInitialArchiveStructure = () => initialArchiveGroups.map((group) => ({
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

/* ── 教学档案袋结构递归辅助 ── */

// 深度优先查找节点（含完整父链 path）
export function findNodeById(groups, id, path = []) {
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
export function collectTables(groups, path = []) {
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
export function updateNodeById(groups, id, updater) {
  return groups.map((node) => {
    if (node.id === id) return updater(node)
    if (node.children?.length) return { ...node, children: updateNodeById(node.children, id, updater) }
    return node
  })
}

// 不可变更新：在 parentId 的 children 末尾追加 child
export function appendChildById(groups, parentId, child) {
  return groups.map((node) => {
    if (node.id === parentId) return { ...node, children: [...(node.children || []), child] }
    if (node.children?.length) return { ...node, children: appendChildById(node.children, parentId, child) }
    return node
  })
}

// 辅助函数：从 archiveGroups 查找表（递归）
export function findTableById(archiveGroups, tableId) {
  for (const node of archiveGroups) {
    if (node.nodeType === 'table' && node.id === tableId) return node
    if (node.children?.length) {
      const found = findTableById(node.children, tableId)
      if (found) return found
    }
  }
  return null
}
