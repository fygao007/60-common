import catalog from '../data/entity-field-models.json' with { type: 'json' }
import { assertEntityId, ID_PREFIXES } from './identifiers.js'

export const ENTITY_MODEL_VERSION = catalog.version
export const FIELD_TYPES = Object.freeze([...catalog.fieldTypes])
export const FIELD_CLASSIFICATIONS = Object.freeze([...catalog.classifications])

function freezeModel(entity) {
  return Object.freeze({
    ...entity,
    fields: Object.freeze(entity.fields.map((field) => Object.freeze({ ...field }))),
  })
}

export const ENTITY_MODELS = Object.freeze(Object.fromEntries(
  catalog.entities.map((entity) => [entity.id, freezeModel(entity)]),
))

export function listEntityModels({ domain } = {}) {
  const models = Object.values(ENTITY_MODELS)
  return domain ? models.filter((item) => item.domain === domain) : models
}

export function getEntityModel(entityType) {
  return ENTITY_MODELS[entityType] || null
}

export function getFieldModel(entityType, fieldId) {
  return getEntityModel(entityType)?.fields.find((item) => item.id === fieldId) || null
}

export function validateEntityRecord(entityType, record, { partial = false, rejectUnknown = true } = {}) {
  const entityModel = getEntityModel(entityType)
  if (!entityModel) return { valid: false, errors: [{ code: 'unknown_entity', entityType }] }
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return { valid: false, errors: [{ code: 'invalid_record', entityType }] }
  }
  const errors = []
  const knownFields = new Set(entityModel.fields.map((item) => item.id))
  for (const definition of entityModel.fields) {
    const value = record[definition.id]
    if (!partial && definition.required && (value === undefined || value === null || value === '')) errors.push({ code: 'required', field: definition.id })
    if (value === undefined) continue
    if (value === null) {
      if (!definition.nullable) errors.push({ code: 'not_nullable', field: definition.id })
      continue
    }
    if (definition.type === 'id') {
      if (ID_PREFIXES[definition.id]) {
        try { assertEntityId(definition.id, value) } catch { errors.push({ code: 'invalid_id', field: definition.id }) }
      } else if (typeof value !== 'string' || !value) errors.push({ code: 'invalid_id', field: definition.id })
    }
    if (definition.type === 'reference') {
      const targetId = getEntityModel(definition.target)?.identifier
      if (targetId && ID_PREFIXES[targetId]) {
        try { assertEntityId(targetId, value) } catch { errors.push({ code: 'invalid_reference', field: definition.id, target: definition.target }) }
      }
    }
    if (['string', 'text', 'concept', 'reference', 'date', 'datetime'].includes(definition.type) && typeof value !== 'string') errors.push({ code: 'invalid_type', field: definition.id, expected: definition.type })
    if (definition.type === 'integer' && !Number.isInteger(value)) errors.push({ code: 'invalid_type', field: definition.id, expected: 'integer' })
    if (definition.type === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) errors.push({ code: 'invalid_type', field: definition.id, expected: 'number' })
    if (definition.type === 'boolean' && typeof value !== 'boolean') errors.push({ code: 'invalid_type', field: definition.id, expected: 'boolean' })
    if (definition.type === 'object' && (!value || typeof value !== 'object' || Array.isArray(value))) errors.push({ code: 'invalid_type', field: definition.id, expected: 'object' })
    if (definition.minimum != null && typeof value === 'number' && value < definition.minimum) errors.push({ code: 'minimum', field: definition.id, minimum: definition.minimum })
  }
  if (rejectUnknown) {
    for (const key of Object.keys(record)) if (!knownFields.has(key)) errors.push({ code: 'unknown_field', field: key })
  }
  return { valid: errors.length === 0, errors }
}
