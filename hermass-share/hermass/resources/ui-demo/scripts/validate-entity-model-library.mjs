import process from 'node:process'
import fs from 'node:fs'
import { ENTITY_MODELS, FIELD_CLASSIFICATIONS, FIELD_TYPES, validateEntityRecord } from '../packages/hr-domain/src/entity-models.js'
import { ID_PREFIXES } from '../packages/hr-domain/src/identifiers.js'

const errors = []
const vocabularySource = fs.readFileSync('ontology/vocabularies/core-vocabularies.yaml', 'utf8')
const vocabularies = new Set([...vocabularySource.matchAll(/^  - id: ([A-Za-z][A-Za-z0-9]+)$/gm)].map((match) => match[1]))
const ids = new Set()
for (const entity of Object.values(ENTITY_MODELS)) {
  if (ids.has(entity.id)) errors.push(`实体 ID 重复：${entity.id}`)
  ids.add(entity.id)
  const fields = new Set()
  for (const field of entity.fields) {
    if (fields.has(field.id)) errors.push(`${entity.id}: 字段重复 ${field.id}`)
    fields.add(field.id)
    if (!FIELD_TYPES.includes(field.type)) errors.push(`${entity.id}.${field.id}: 未知类型 ${field.type}`)
    if (!FIELD_CLASSIFICATIONS.includes(field.classification)) errors.push(`${entity.id}.${field.id}: 未知分级 ${field.classification}`)
    if (field.required && field.nullable) errors.push(`${entity.id}.${field.id}: required 字段不能 nullable`)
    if (field.type === 'concept' && !field.vocabulary) errors.push(`${entity.id}.${field.id}: concept 缺少 vocabulary`)
    if (field.type === 'concept' && field.vocabulary && !vocabularies.has(field.vocabulary)) errors.push(`${entity.id}.${field.id}: 词表 ${field.vocabulary} 不存在`)
    if (field.type === 'reference' && !ENTITY_MODELS[field.target]) errors.push(`${entity.id}.${field.id}: 引用了未知实体 ${field.target}`)
  }
  if (!fields.has(entity.identifier)) errors.push(`${entity.id}: 主键字段 ${entity.identifier} 不存在`)
  if (!ID_PREFIXES[entity.identifier]) errors.push(`${entity.id}: 主键字段 ${entity.identifier} 没有 ID 前缀规则`)
  const identifierField = entity.fields.find((item) => item.id === entity.identifier)
  if (identifierField?.type !== 'id' || identifierField.mutable || !identifierField.required) errors.push(`${entity.id}: 主键字段约束不完整`)
  const emptyResult = validateEntityRecord(entity.id, {})
  if (emptyResult.valid) errors.push(`${entity.id}: 空记录不应通过校验`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`实体模型库校验通过：${ids.size} 个实体，${Object.values(ENTITY_MODELS).reduce((sum, entity) => sum + entity.fields.length, 0)} 个字段`)
