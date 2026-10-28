import fs from 'node:fs'
import { getBasicInformationField } from '../packages/hr-domain/src/basic-information.js'
import { getEntityModel } from '../packages/hr-domain/src/entity-models.js'

const view = JSON.parse(fs.readFileSync('ontology/teaching-portfolio/portfolio-view.json', 'utf8'))
const errors = []
const sectionIds = new Set()

for (const group of view.groups || []) {
  for (const section of group.sections || []) {
    if (sectionIds.has(section.id)) errors.push(`视图 section ID 重复：${section.id}`)
    sectionIds.add(section.id)
    const entity = getEntityModel(section.entityType)
    if (!entity) errors.push(`${section.id}: 未知实体 ${section.entityType}`)
    for (const fieldRef of section.fieldRefs || []) {
      if (fieldRef.startsWith('StaffBasicInformation.')) {
        if (!getBasicInformationField(fieldRef)) errors.push(`${section.id}: 未知标准字段 ${fieldRef}`)
        continue
      }
      const [entityType, fieldId, extra] = fieldRef.split('.')
      const fieldEntity = !extra ? getEntityModel(entityType) : null
      if (!fieldEntity?.fields.some((field) => field.id === fieldId)) errors.push(`${section.id}: 未知实体字段 ${fieldRef}`)
      if (entity && entityType !== section.entityType) errors.push(`${section.id}: ${fieldRef} 不属于 ${section.entityType}`)
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`教学档案 ontology 校验通过：${view.groups.length} 个视图分组、${sectionIds.size} 个区段`)
