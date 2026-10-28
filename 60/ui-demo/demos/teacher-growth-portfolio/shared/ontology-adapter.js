import basicInformation from '../../../ontology/basic-information/basic-information-fields.json'
import entityModels from '../../../ontology/model-library/entity-field-models.json'
import portfolioView from '../../../ontology/teaching-portfolio/portfolio-view.json'
import portfolioSpec from '../../../ontology/teaching-portfolio/portfolio-spec-4.0.json'

// UI 只能通过本适配层读取字段元数据。字段定义、分组和来源系统均以 ontology 为准。
const basicFieldMap = new Map(basicInformation.fields.map((field) => [field.fieldId, field]))
const entityFieldMap = new Map(entityModels.entities.flatMap((entity) =>
  entity.fields.map((field) => [`${entity.id}.${field.id}`, { ...field, entityType: entity.id }]),
))

export const ONTOLOGY_VERSION = {
  basicInformation: basicInformation.version,
  entityModels: entityModels.version,
  portfolioView: portfolioView.version,
  portfolioSpec: portfolioSpec.source.version,
}

export function getOntologyField(fieldRef) {
  const field = basicFieldMap.get(fieldRef) || entityFieldMap.get(fieldRef)
  if (!field) throw new Error(`Ontology field not found: ${fieldRef}`)
  return {
    fieldRef,
    label: field.label,
    dataType: field.dataType || field.type,
    dictionaryId: field.dictionaryId || field.vocabulary || null,
    classification: field.classification,
    required: Boolean(field.required),
    searchable: field.searchable,
  }
}

export function defineProductField(fieldRef, constraints = {}) {
  return { ...getOntologyField(fieldRef), ...constraints, fieldRef }
}

export const STAFF_FIELDS = Object.freeze({
  name: defineProductField('StaffBasicInformation.xm'),
  employeeNumber: defineProductField('StaffBasicInformation.zgh'),
  teacherType: defineProductField('StaffBasicInformation.jslx'),
  highestEducation: defineProductField('StaffBasicInformation.zgxldm'),
  highestDegree: defineProductField('StaffBasicInformation.zgxwdm'),
  professionalTitle: defineProductField('StaffBasicInformation.zcdm'),
  dualTeacher: defineProductField('StaffBasicInformation.sfssxjs'),
})

export const portfolioViewGroups = portfolioView.groups.map((group) => ({
  ...group,
  sections: group.sections.map((section) => ({
    ...section,
    fields: section.fieldRefs.map(getOntologyField),
  })),
}))

const groupKey = (name) => ({
  '教育初心及育人理念': 'philosophy',
  '一、基本信息': 'basic',
  '一、基本信息/资格证书': 'qualification',
  '二、教育教学信息': 'teaching',
  '三、企业实践信息': 'practice',
  '四、成果与荣誉': 'achievement',
  '五、进修（访学）培训': 'training',
  '六、社会服务与影响力': 'service',
  '七、任职情况': 'appointment',
  '八、其他教育工作': 'other',
  '九、专业或专业群工作': 'major',
}[name] || name)

export const portfolioSections = portfolioSpec.sections.map((section, index) => ({
  id: `ontology-section-${index + 1}`,
  domainKey: groupKey(section.group),
  group: section.group,
  label: section.sheet,
  sourceSystem: section.sourceSystem,
  fields: section.fields.map((field, fieldIndex) => ({
    id: `ontology-field-${index + 1}-${fieldIndex + 1}`,
    label: field.name,
    dataType: field.type,
    dictionary: /字典/.test(field.type),
  })),
}))

export const portfolioDomains = Array.from(
  portfolioSections.reduce((domains, section) => {
    const current = domains.get(section.domainKey) || {
      key: section.domainKey,
      label: section.group.replace(/^[一二三四五六七八九]+、/, ''),
      sections: [],
      fieldCount: 0,
    }
    current.sections.push(section)
    current.fieldCount += section.fields.length
    domains.set(section.domainKey, current)
    return domains
  }, new Map()).values(),
)
