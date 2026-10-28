import fieldCatalog from '../data/basic-information-fields.json' with { type: 'json' }
import dictionaryCatalog from '../data/dictionary-catalog.json' with { type: 'json' }
import bindingCatalog from '../data/field-dictionary-bindings.json' with { type: 'json' }
import businessFieldCatalog from '../data/business-field-extensions.json' with { type: 'json' }

const fieldsById = new Map(fieldCatalog.fields.map((field) => [field.fieldId, field]))
const fieldsBySourceCode = new Map(fieldCatalog.fields.map((field) => [field.sourceCode, field]))
const dictionariesById = new Map(dictionaryCatalog.dictionaries.map((dictionary) => [dictionary.dictionaryId, dictionary]))
const bindingsByFieldId = new Map(bindingCatalog.bindings.map((binding) => [binding.fieldId, binding]))
const businessFieldsById = new Map(businessFieldCatalog.fields.map((field) => [field.fieldId, field]))
const classificationRank = { public: 0, internal: 1, sensitive: 2, restricted: 3 }

export const BASIC_INFORMATION_VERSION = fieldCatalog.version
export const BASIC_INFORMATION_FIELD_SET_ID = fieldCatalog.fieldSetId

export function listBasicInformationFields({ group, classification, lifecycle, bindingStatus } = {}) {
  return fieldCatalog.fields.filter((field) =>
    (!group || field.group === group)
    && (!classification || field.classification === classification)
    && (!lifecycle || field.lifecycle === lifecycle)
    && (!bindingStatus || field.status === bindingStatus))
}

export function getBasicInformationField(fieldIdOrSourceCode) {
  return fieldsById.get(fieldIdOrSourceCode) || fieldsBySourceCode.get(String(fieldIdOrSourceCode).toUpperCase()) || null
}

export function listRegisteredFields({ ownerDomain, fieldKind, status } = {}) {
  return [...fieldCatalog.fields, ...businessFieldCatalog.fields].filter((field) =>
    (!ownerDomain || field.ownerDomain === ownerDomain)
    && (!fieldKind || field.fieldKind === fieldKind)
    && (!status || field.status === status))
}

export function getRegisteredField(fieldIdOrSourceCode) {
  const standard = getBasicInformationField(fieldIdOrSourceCode)
  if (standard) return standard
  const business = businessFieldsById.get(fieldIdOrSourceCode)
  if (!business) return null
  if (!business.extends) return business
  const base = getBasicInformationField(business.extends)
  return base ? { ...base, ...business, standardFieldId: base.fieldId } : business
}

export function validateBusinessFieldDefinition(definition) {
  const errors = []
  if (!definition?.fieldId?.startsWith('Business.')) errors.push({ code: 'invalid_field_id' })
  if (!definition?.ownerDomain) errors.push({ code: 'owner_domain_required' })
  if (!['business-extension', 'business-specific'].includes(definition?.fieldKind)) errors.push({ code: 'invalid_field_kind' })
  if (definition?.fieldKind === 'business-extension') {
    const base = getBasicInformationField(definition.extends)
    if (!base) errors.push({ code: 'standard_field_required', field: 'extends' })
    else {
      if (classificationRank[definition.classification] < classificationRank[base.classification]) errors.push({ code: 'classification_downgrade', standardFieldId: base.fieldId })
      for (const key of ['dataType', 'dictionaryId', 'bindingType', 'semanticTarget']) {
        if (definition[key] != null && base[key] != null && definition[key] !== base[key]) errors.push({ code: 'standard_semantics_override', field: key, standardFieldId: base.fieldId })
      }
    }
  }
  if (definition?.fieldKind === 'business-specific') {
    if (!definition.dataType) errors.push({ code: 'data_type_required' })
    if (!definition.lifecycle) errors.push({ code: 'lifecycle_required' })
    const duplicate = fieldCatalog.fields.find((field) => field.label.trim() === String(definition.label || '').trim())
    if (duplicate) errors.push({ code: 'standard_field_exists', standardFieldId: duplicate.fieldId })
  }
  return { valid: errors.length === 0, errors }
}

export function createFieldReference(fieldIdOrSourceCode) {
  const field = getRegisteredField(fieldIdOrSourceCode)
  if (!field) throw new Error(`未登记字段：${fieldIdOrSourceCode}`)
  return Object.freeze({ fieldRef: field.standardFieldId || field.fieldId, businessFieldId: field.standardFieldId ? field.fieldId : null })
}

function normalizeSearch(value) {
  return String(value || '').trim().toLowerCase().replace(/[\s_\-.]/g, '')
}

export function searchRegisteredFields(query, { limit = 20, ownerDomain } = {}) {
  const keyword = normalizeSearch(query)
  if (!keyword) return []
  return listRegisteredFields({ ownerDomain }).map((field) => {
    const candidates = [field.fieldId, field.sourceCode, field.label, field.semanticTarget].filter(Boolean).map(normalizeSearch)
    const exact = candidates.some((value) => value === keyword)
    const prefix = candidates.some((value) => value.startsWith(keyword))
    const contains = candidates.some((value) => value.includes(keyword))
    return { field, score: exact ? 100 : prefix ? 70 : contains ? 40 : 0 }
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.field.fieldId.localeCompare(b.field.fieldId)).slice(0, limit).map((item) => item.field)
}

export function resolveProductField(fieldIdOrSourceCode) {
  const field = getRegisteredField(fieldIdOrSourceCode)
  if (!field) throw new Error(`产品字段未登记：${fieldIdOrSourceCode}`)
  const standardFieldId = field.standardFieldId || field.extends || field.fieldId
  const binding = getFieldDictionaryBinding(standardFieldId)
  return Object.freeze({
    ...field,
    fieldRef: standardFieldId,
    businessFieldId: standardFieldId === field.fieldId ? null : field.fieldId,
    binding,
    options: binding?.dictionaryId ? listDictionaryValues(binding.dictionaryId) : [],
    referenceTarget: binding?.target || null,
  })
}

export function defineProductField(fieldIdOrSourceCode, productOptions = {}) {
  const allowed = new Set(['required', 'readOnly', 'hidden', 'label', 'placeholder', 'helpText', 'defaultValue', 'componentProps'])
  const forbidden = Object.keys(productOptions).filter((key) => !allowed.has(key))
  if (forbidden.length) throw new Error(`产品层不得覆盖标准字段属性：${forbidden.join('、')}`)
  const resolved = resolveProductField(fieldIdOrSourceCode)
  return Object.freeze({ ...resolved, product: Object.freeze({ ...productOptions }) })
}

export function defineProductFieldSet(definitions) {
  if (!Array.isArray(definitions)) throw new Error('产品字段集合必须是数组')
  const fields = definitions.map((definition) => typeof definition === 'string'
    ? defineProductField(definition)
    : defineProductField(definition.fieldRef, definition.product))
  const duplicates = fields.filter((field, index) => fields.findIndex((item) => item.fieldRef === field.fieldRef) !== index)
  if (duplicates.length) throw new Error(`产品字段集合重复引用：${[...new Set(duplicates.map((field) => field.fieldRef))].join('、')}`)
  return Object.freeze(fields)
}

export function getFieldDictionaryBinding(fieldIdOrSourceCode) {
  const field = getBasicInformationField(fieldIdOrSourceCode)
  return field ? bindingsByFieldId.get(field.fieldId) || null : null
}

export function getDictionary(dictionaryId) {
  return dictionariesById.get(dictionaryId) || null
}

export function listDictionaryValues(dictionaryId, { enabledOnly = true, parentCode } = {}) {
  const dictionary = getDictionary(dictionaryId)
  if (!dictionary) return []
  return dictionary.values.filter((item) => (!enabledOnly || item.enabled) && (parentCode === undefined || item.parentCode === parentCode))
}

export function resolveDictionaryValue(fieldIdOrSourceCode, code) {
  const binding = getFieldDictionaryBinding(fieldIdOrSourceCode)
  if (!binding?.dictionaryId) return { found: false, reason: binding?.status || 'field-not-found', value: null }
  const dictionary = getDictionary(binding.dictionaryId)
  const value = dictionary?.values.find((item) => item.code === String(code)) || null
  const conflict = dictionary?.duplicateCodes.find((item) => item.code === String(code)) || null
  return { found: Boolean(value), reason: value ? conflict ? 'ambiguous-code' : 'ok' : 'code-not-found', value, conflict }
}

export function getBasicInformationCatalogSummary() {
  return Object.freeze({
    version: BASIC_INFORMATION_VERSION,
    fieldCount: fieldCatalog.fieldCount,
    bindingCount: bindingCatalog.bindingCount,
    dictionaryCount: dictionaryCatalog.dictionaryCount,
    dictionarySourceRowCount: dictionaryCatalog.sourceRowCount,
    businessFieldCount: businessFieldCatalog.fields.length,
  })
}
