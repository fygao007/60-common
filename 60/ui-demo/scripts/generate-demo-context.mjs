import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const input = process.argv[2]
if (!input) throw new Error('请提供产品世界模型 JSON 路径')
const source = path.resolve(root, input)
const world = JSON.parse(fs.readFileSync(source))
const templates = JSON.parse(fs.readFileSync(path.join(root, 'specs/page-template-catalog.json')))
const entities = JSON.parse(fs.readFileSync(path.join(root, 'ontology/model-library/entity-field-models.json')))
const basic = JSON.parse(fs.readFileSync(path.join(root, 'ontology/basic-information/basic-information-fields.json')))
const extensions = JSON.parse(fs.readFileSync(path.join(root, 'ontology/basic-information/business-field-extensions.json')))
const fieldMap = new Map()
for (const entity of entities.entities) {
  for (const field of entity.fields) fieldMap.set(`${entity.id}.${field.id}`, { ...field, fieldRef: `${entity.id}.${field.id}`, entityId: entity.id })
}
for (const field of [...basic.fields, ...extensions.fields]) fieldMap.set(field.fieldId, { ...field, fieldRef: field.fieldId })
const template = templates.templates.find((item) => item.id === world.page.templateId || item.aliases?.includes(world.page.templateId))
if (!template) throw new Error(`未登记模板：${world.page.templateId}`)
const fields = world.page.fieldRefs.map((ref) => {
  const field = fieldMap.get(ref)
  if (!field) throw new Error(`未登记字段：${ref}`)
  return field
})
const context = {
  generatedFrom: path.relative(root, source),
  scenarioId: world.id,
  version: world.version,
  generationRules: {
    framework: template.contract?.frameworkShell === false ? null : 'framework-2',
    useTemplateFirst: true,
    useDesignSystemOnly: true,
    useFieldRefsOnly: true,
    copyCrossDemoCode: false,
    preserveDeletedCodeAsComments: false
  },
  research: world.research,
  scenario: world.scenario,
  requirements: world.requirements,
  page: {
    ...world.page,
    templateId: template.id,
    template,
    ...(template.sourceTemplate ? { fixedEntrySource: fs.readFileSync(path.join(root, template.sourceTemplate), 'utf8') } : {}),
    resolvedFields: fields
  }
}
const output = path.join(root, 'ontology/product-world/generated', `${world.id}.demo-context.json`)
fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, `${JSON.stringify(context, null, 2)}\n`)
console.log(path.relative(root, output))
