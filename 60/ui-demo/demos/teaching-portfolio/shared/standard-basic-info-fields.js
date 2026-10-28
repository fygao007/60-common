import {
  defineProductField,
  listRegisteredFields,
  resolveProductField,
} from '@wisedu/hr-domain/basic-information'
import { getEntityModel, listEntityModels } from '@wisedu/hr-domain/models'

// 教学档案袋只在这里声明人员基本信息的产品约束。
// 字段类型、数据分级、字典和语义目标均继承 StaffBasicInformation ontology。
export const STAFF_FIELDS = Object.freeze({
  name: defineProductField('StaffBasicInformation.xm', { required: true }),
  employeeNumber: defineProductField('StaffBasicInformation.zgh', { readOnly: true }),
  gender: defineProductField('StaffBasicInformation.xbdm'),
  birthDate: defineProductField('StaffBasicInformation.csrq', { label: '出生年月' }),
  age: defineProductField('StaffBasicInformation.nl', { readOnly: true }),
  ethnicity: defineProductField('StaffBasicInformation.mzdm'),
  politicalAffiliation: defineProductField('StaffBasicInformation.zzmmdm'),
  organization: defineProductField('StaffBasicInformation.szdwdm', {
    label: '所属部门',
    readOnly: true,
    helpText: '引用组织主数据',
  }),
  primaryPosition: defineProductField('StaffBasicInformation.zygwdm', { label: '岗位类型' }),
  teacherType: defineProductField('StaffBasicInformation.jslx', { label: '专任教师类型' }),
  schoolEntryDate: defineProductField('StaffBasicInformation.lxrq', { label: '初次来校时间' }),
  highestEducation: defineProductField('StaffBasicInformation.zgxldm'),
  highestDegree: defineProductField('StaffBasicInformation.zgxwdm', { label: '学位类型' }),
  graduateSchool: defineProductField('StaffBasicInformation.byxx', { label: '毕业院校' }),
  majorStudied: defineProductField('StaffBasicInformation.sxzy', { label: '毕业专业' }),
  professionalTitle: defineProductField('StaffBasicInformation.zyjszwdm', { label: '当前职称' }),
  professionalTitleLevel: defineProductField('StaffBasicInformation.zyjszwjbdm', { label: '职称等级' }),
  professionalTitleAssessedAt: defineProductField('StaffBasicInformation.zyjszwpdrq', { label: '评审时间' }),
  teacherCertificateNumber: defineProductField('StaffBasicInformation.jszgzh', { label: '教师资格证编号' }),
  dualTeacher: defineProductField('StaffBasicInformation.sfssxjs'),
  dualTeacherLevel: defineProductField('StaffBasicInformation.ssrdjb', { label: '双师型认定等级' }),
})

export function fieldLabel(field) {
  return field.product.label || field.label
}

export function fieldOptions(field) {
  return field.options.map(({ code, label }) => ({ value: code, label }))
}

export function fieldOptionCode(field, label) {
  return field.options.find((option) => option.label === label)?.code || ''
}

export function staffFieldItem(field, value, extra = {}) {
  return {
    fieldRef: field.fieldRef,
    label: fieldLabel(field),
    value,
    classification: field.classification,
    lifecycle: field.lifecycle,
    ...extra,
  }
}

export function archiveStaffField(id, field, key, source = '人事系统') {
  return {
    id,
    name: fieldLabel(field),
    key,
    type: field.dataType,
    dataType: field.dataType,
    source,
    fieldRef: field.fieldRef,
    fieldKind: field.fieldKind,
    ownerDomain: field.ownerDomain,
    classification: field.classification,
    dictionaryId: field.dictionaryId,
    binding: field.binding,
    referenceTarget: field.referenceTarget,
    semanticTarget: field.semanticTarget,
    lifecycle: field.lifecycle,
    ontologyLocked: true,
    perGroup: {
      '全部用户': {
        visible: !field.product.hidden,
        required: Boolean(field.product.required),
        view: !field.product.hidden,
        edit: !field.product.readOnly,
      },
    },
  }
}

export const REGISTERED_STAFF_FIELD_OPTIONS = Object.freeze(
  listRegisteredFields()
    .map((field) => ({
      value: field.fieldId,
      label: field.label,
    }))
    .sort((left, right) => left.label.localeCompare(right.label, 'zh-CN')),
)

const ARCHIVE_TYPE_LABELS = Object.freeze({
  string: '单行文本',
  text: '多行文本',
  number: '数字',
  date: '日期',
  'year-month': '年月',
  datetime: '日期时间',
  concept: '标准字典/主数据',
  file: '附件',
})

export function createRegisteredArchiveField(fieldId, { id, key, source } = {}) {
  const field = resolveProductField(fieldId)
  return {
    ...archiveStaffField(
      id || `field-${field.sourceCode?.toLowerCase() || Date.now()}`,
      field,
      key || field.sourceCode?.toLowerCase() || field.fieldRef,
      source || (field.referenceTarget === 'Organization' ? '组织机构' : '人事系统'),
    ),
    name: field.label,
    type: ARCHIVE_TYPE_LABELS[field.dataType] || field.dataType,
    dataType: field.dataType,
    fieldKind: field.fieldKind,
    ownerDomain: field.ownerDomain,
    semanticTarget: field.semanticTarget,
    lifecycle: field.lifecycle,
  }
}

export function isRegisteredArchiveField(field) {
  return Boolean(field?.fieldRef && field?.ontologyLocked)
}

export const ONTOLOGY_FIELD_OPTIONS = Object.freeze([
  ...REGISTERED_STAFF_FIELD_OPTIONS,
  ...listEntityModels()
    .flatMap((entity) => entity.fields
      .filter((field) => field.type !== 'id')
      .map((field) => ({
        value: `${entity.id}.${field.id}`,
        label: `${entity.label} / ${field.label}`,
      }))),
].sort((left, right) => left.label.localeCompare(right.label, 'zh-CN')))

export function createOntologyArchiveField(fieldRef, options = {}) {
  if (fieldRef.startsWith('StaffBasicInformation.') || fieldRef.startsWith('Business.')) {
    return createRegisteredArchiveField(fieldRef, options)
  }
  const [entityType, fieldId, extra] = fieldRef.split('.')
  const definition = !extra ? getEntityModel(entityType)?.fields.find((field) => field.id === fieldId) : null
  if (!definition) throw new Error(`未登记 ontology 字段：${fieldRef}`)
  return {
    id: options.id || `field-${entityType.toLowerCase()}-${fieldId}`,
    name: definition.label,
    key: options.key || fieldId,
    type: ARCHIVE_TYPE_LABELS[definition.type] || definition.type,
    dataType: definition.type,
    source: options.source || '教学档案袋',
    fieldRef,
    entityType,
    fieldKind: 'entity-field',
    ownerDomain: getEntityModel(entityType).domain,
    classification: definition.classification,
    dictionaryId: definition.vocabulary || null,
    referenceTarget: definition.target || null,
    semanticTarget: definition.target ? `${definition.target}.${getEntityModel(definition.target)?.identifier || 'id'}` : null,
    ontologyLocked: true,
    perGroup: {
      '全部用户': { visible: true, required: definition.required, view: true, edit: definition.mutable },
    },
  }
}

export function createEntityArchiveFields(entityType, { exclude = [] } = {}) {
  const entity = getEntityModel(entityType)
  if (!entity) throw new Error(`未登记实体：${entityType}`)
  const excluded = new Set([entity.identifier, 'personId', ...exclude])
  return entity.fields
    .filter((field) => !excluded.has(field.id))
    .map((field) => createOntologyArchiveField(`${entityType}.${field.id}`))
}
