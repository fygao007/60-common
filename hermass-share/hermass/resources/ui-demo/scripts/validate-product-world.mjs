import fs from 'node:fs'
import path from 'node:path'
import { checkStandardListEntry } from './standard-list-entry-contract.mjs'

const root = path.resolve(import.meta.dirname, '..')
const folder = path.join(root, 'ontology/product-world/scenarios')
const templateCatalog = JSON.parse(fs.readFileSync(path.join(root, 'specs/page-template-catalog.json')))
const entityCatalog = JSON.parse(fs.readFileSync(path.join(root, 'ontology/model-library/entity-field-models.json')))
const basicCatalog = JSON.parse(fs.readFileSync(path.join(root, 'ontology/basic-information/basic-information-fields.json')))
const extensionCatalog = JSON.parse(fs.readFileSync(path.join(root, 'ontology/basic-information/business-field-extensions.json')))
const templates = new Set(templateCatalog.templates.flatMap((item) => [item.id, ...(item.aliases || [])]))
const designSystemSource = fs.readFileSync(path.join(root, 'packages/design-system/src/index.js'), 'utf8')
const menuSources = fs.existsSync(path.join(root, 'demos'))
  ? fs.readdirSync(path.join(root, 'demos'), { recursive: true })
      .filter((name) => /menus\/[^/]+\.js$/.test(String(name)))
      .map((name) => fs.readFileSync(path.join(root, 'demos', String(name)), 'utf8'))
      .join('\n')
  : ''
const fields = new Set(entityCatalog.entities.flatMap((entity) => entity.fields.map((field) => `${entity.id}.${field.id}`)))
for (const field of [...basicCatalog.fields, ...extensionCatalog.fields]) fields.add(field.fieldId)
const errors = []
const files = fs.existsSync(folder) ? fs.readdirSync(folder).filter((name) => name.endsWith('.json')) : []

for (const name of files) {
  const model = JSON.parse(fs.readFileSync(path.join(folder, name)))
  const required = ['id', 'version', 'research', 'scenario', 'page', 'requirements']
  for (const key of required) if (!model[key]) errors.push(`${name}: 缺少 ${key}`)
  if (!templates.has(model.page?.templateId)) errors.push(`${name}: 未登记模板 ${model.page?.templateId}`)
  const selectedTemplate = templateCatalog.templates.find((item) => item.id === model.page?.templateId || item.aliases?.includes(model.page?.templateId))
  if (selectedTemplate?.id === 'standard-list-root') {
    const entry = path.resolve(root, model.page.demoPath.replace(/\.html$/, '.page.jsx'))
    if (!fs.existsSync(entry) || !checkStandardListEntry(root, entry, fs.readFileSync(entry, 'utf8'))) errors.push(`${name}: 场景指定标准列表模板，但实际入口未遵守固定结构`)
  }
  for (const ref of model.page?.fieldRefs || []) if (!fields.has(ref)) errors.push(`${name}: 未登记字段 ${ref}`)
  for (const component of model.page?.components || []) {
    if (!new RegExp(`\\b${component}\\b`).test(designSystemSource)) errors.push(`${name}: 未从设计系统导出的组件 ${component}`)
  }
  const actors = new Set((model.research?.actors || []).map((actor) => actor.id))
  for (const ref of model.scenario?.actorRefs || []) if (!actors.has(ref)) errors.push(`${name}: 未登记角色 ${ref}`)
  if (!/^[^.]+\.[^:]+:[^:]+$/.test(model.page?.menuRef || '')) errors.push(`${name}: menuRef 必须使用 app.menu:feature 格式`)
  else {
    const [menuId, feature] = model.page.menuRef.split(':')
    if (!menuSources.includes(`register('${menuId}'`) || !menuSources.includes(`'${feature}'`)) errors.push(`${name}: 未注册菜单引用 ${model.page.menuRef}`)
  }
  if (!model.requirements?.acceptanceCriteria?.length) errors.push(`${name}: 至少需要一条验收标准`)
}
if (errors.length) {
  console.error(`产品世界模型校验失败：\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log(`产品世界模型校验通过：${files.length} 个场景`)
