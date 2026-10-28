import entityCatalog from '../data/entity-field-models.json' with { type: 'json' }
import basicCatalog from '../data/basic-information-fields.json' with { type: 'json' }
import extensionCatalog from '../data/business-field-extensions.json' with { type: 'json' }

const allowedProductKeys = new Set([
  'required', 'readOnly', 'hidden', 'label', 'placeholder', 'helpText',
  'defaultValue', 'width', 'align', 'sortable', 'filterable', 'render',
])

const fields = new Map()

for (const entity of entityCatalog.entities) {
  for (const field of entity.fields) {
    fields.set(`${entity.id}.${field.id}`, Object.freeze({
      ...field,
      fieldRef: `${entity.id}.${field.id}`,
      entityId: entity.id,
      domain: entity.domain,
    }))
  }
}

for (const field of [...basicCatalog.fields, ...extensionCatalog.fields]) {
  fields.set(field.fieldId, Object.freeze({ ...field, fieldRef: field.fieldId }))
}

export function getOntologyField(fieldRef) {
  return fields.get(fieldRef) || null
}

export function requireOntologyField(fieldRef) {
  const definition = getOntologyField(fieldRef)
  if (!definition) throw new Error(`字段未登记到 ontology：${fieldRef}`)
  return definition
}

export function defineOntologyField(fieldRef, product = {}) {
  const forbidden = Object.keys(product).filter((key) => !allowedProductKeys.has(key))
  if (forbidden.length) {
    throw new Error(`${fieldRef} 不允许在模块中重定义 ontology 属性：${forbidden.join(', ')}`)
  }
  const definition = requireOntologyField(fieldRef)
  return Object.freeze({
    ...definition,
    fieldRef,
    product: Object.freeze({ ...product }),
  })
}

export function defineOntologyFields(entries) {
  return entries.map((entry) => typeof entry === 'string'
    ? defineOntologyField(entry)
    : defineOntologyField(entry.fieldRef, entry.product))
}

export function defineTableColumns(entries) {
  return defineOntologyFields(entries).map((field) => ({
    fieldRef: field.fieldRef,
    key: field.fieldRef,
    dataIndex: field.id || field.sourceCode,
    title: field.product.label || field.label,
    width: field.product.width,
    align: field.product.align,
    sortable: field.product.sortable,
    render: field.product.render,
  }))
}

export function listOntologyFields({ domain, entityId } = {}) {
  return [...fields.values()].filter((field) =>
    (!domain || field.domain === domain || field.ownerDomain === domain)
    && (!entityId || field.entityId === entityId))
}
