import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const copies = [
  ['ontology/model-library/entity-field-models.json', 'packages/hr-domain/data/entity-field-models.json'],
  ['ontology/basic-information/basic-information-fields.json', 'packages/hr-domain/data/basic-information-fields.json'],
  ['ontology/basic-information/business-field-extensions.json', 'packages/hr-domain/data/business-field-extensions.json'],
]

for (const [source, destination] of copies) {
  fs.copyFileSync(path.join(root, source), path.join(root, destination))
}
console.log(`字段 ontology 已同步：${copies.length} 个目录文件`)
