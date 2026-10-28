import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const entityCatalog = JSON.parse(fs.readFileSync(path.join(root, 'ontology/model-library/entity-field-models.json')))
const basicCatalog = JSON.parse(fs.readFileSync(path.join(root, 'ontology/basic-information/basic-information-fields.json')))
const extensionCatalog = JSON.parse(fs.readFileSync(path.join(root, 'ontology/basic-information/business-field-extensions.json')))
const refs = new Set()
const errors = []

for (const entity of entityCatalog.entities) {
  for (const field of entity.fields) {
    const ref = `${entity.id}.${field.id}`
    if (refs.has(ref)) errors.push(`字段重复：${ref}`)
    refs.add(ref)
  }
}
for (const field of [...basicCatalog.fields, ...extensionCatalog.fields]) {
  if (refs.has(field.fieldId)) errors.push(`字段重复：${field.fieldId}`)
  refs.add(field.fieldId)
}

function walk(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(folder, entry.name)
    return entry.isDirectory() ? walk(file) : [file]
  })
}

for (const file of walk(path.join(root, 'demos')).filter((item) => /\.(?:js|jsx|mjs)$/.test(item))) {
  const source = fs.readFileSync(file, 'utf8')
  if (!source.includes("PAGE_GENERATION_CONTRACT = 'v1'")) continue
  const relative = path.relative(root, file)
  for (const match of source.matchAll(/fieldRef\s*:\s*['"]([^'"]+)['"]/g)) {
    if (!refs.has(match[1])) errors.push(`${relative}: 未登记的 fieldRef ${match[1]}`)
  }
  const inlineColumns = /\{[^{}]*dataIndex\s*:[^{}]*(?:title|label)\s*:/s.test(source)
    || /\{[^{}]*(?:title|label)\s*:[^{}]*dataIndex\s*:/s.test(source)
  if (inlineColumns) errors.push(`${relative}: 禁止内联定义表字段；请使用 defineTableColumns(fieldRef[])`)
}

if (errors.length) {
  console.error(`字段 ontology 校验失败：\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log(`字段 ontology 校验通过：${refs.size} 个字段引用`)
