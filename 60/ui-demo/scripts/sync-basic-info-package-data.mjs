import fs from 'node:fs'
import path from 'node:path'

const ontologyDir = path.resolve('ontology/basic-information')
const packageDir = path.resolve('packages/hr-domain/data')
const files = [
  'basic-information-fields.json', 'dictionary-catalog.json', 'field-dictionary-bindings.json',
  'basic-information-field-set.schema.json', 'dictionary-catalog.schema.json', 'field-dictionary-bindings.schema.json',
  'business-field-extensions.json', 'business-field-extensions.schema.json',
]
fs.mkdirSync(packageDir, { recursive: true })
for (const file of files) fs.copyFileSync(path.join(ontologyDir, file), path.join(packageDir, file))
console.log(`已同步 ${files.length} 个基本信息 ontology 资产到 hr-domain 包`)
