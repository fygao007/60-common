import assert from 'node:assert/strict'
import fs from 'node:fs'

const ontologyDir = 'ontology/basic-information'
const packageDir = 'packages/hr-domain/data'
const read = (dir, name) => JSON.parse(fs.readFileSync(`${dir}/${name}`, 'utf8'))
const fields = read(ontologyDir, 'basic-information-fields.json')
const dictionaries = read(ontologyDir, 'dictionary-catalog.json')
const bindings = read(ontologyDir, 'field-dictionary-bindings.json')
const extensions = read(ontologyDir, 'business-field-extensions.json')

assert.equal(fields.version, dictionaries.version)
assert.equal(fields.version, bindings.version)
assert.equal(fields.fieldCount, fields.fields.length)
assert.equal(fields.fieldCount, 158, 'Excel 主字段表应完整导入 158 个字段')
assert.equal(new Set(fields.fields.map((field) => field.fieldId)).size, fields.fieldCount, 'fieldId 必须唯一')
assert.equal(new Set(fields.fields.map((field) => field.sourceCode)).size, fields.fieldCount, 'sourceCode 必须唯一')
assert.equal(bindings.bindingCount, bindings.bindings.length)
assert.equal(bindings.bindingCount, 77, '所有 select/select-tree/multi-select 字段必须有绑定记录')
assert.equal(dictionaries.dictionaryCount, dictionaries.dictionaries.length)
assert.equal(dictionaries.dictionaryCount, 145, 'SQL 中全部字典表必须导入')

const dictionaryIds = new Set(dictionaries.dictionaries.map((dictionary) => dictionary.dictionaryId))
for (const field of fields.fields) {
  for (const key of ['fieldId', 'fieldKind', 'ownerDomain', 'reusePolicy', 'sourceCode', 'label', 'group', 'dataType', 'classification', 'lifecycle', 'status']) assert.ok(key in field, `${field.fieldId} 缺少 ${key}`)
  assert.equal(field.fieldKind, 'standard', `${field.fieldId} 必须标记为标准字段`)
  assert.equal(field.reusePolicy, 'prefer-reference', `${field.fieldId} 必须优先引用`)
  if (field.dictionaryId) assert.ok(dictionaryIds.has(field.dictionaryId), `${field.fieldId} 引用了不存在的 ${field.dictionaryId}`)
}
const standardById = new Map(fields.fields.map((field) => [field.fieldId, field]))
const extensionIds = new Set()
const rank = { public: 0, internal: 1, sensitive: 2, restricted: 3 }
for (const field of extensions.fields) {
  assert.ok(!extensionIds.has(field.fieldId), `业务字段重复：${field.fieldId}`)
  extensionIds.add(field.fieldId)
  assert.ok(field.fieldId.startsWith('Business.'), `${field.fieldId} 必须使用 Business 命名空间`)
  assert.ok(field.ownerDomain, `${field.fieldId} 缺少 ownerDomain`)
  if (field.fieldKind === 'business-extension') {
    const base = standardById.get(field.extends)
    assert.ok(base, `${field.fieldId} 必须继承存在的标准字段`)
    assert.ok(rank[field.classification] >= rank[base.classification], `${field.fieldId} 不得降低标准字段分级`)
    for (const key of ['dataType', 'dictionaryId', 'bindingType', 'semanticTarget']) if (field[key] != null && base[key] != null) assert.equal(field[key], base[key], `${field.fieldId} 不得覆盖标准 ${key}`)
  } else {
    assert.equal(field.fieldKind, 'business-specific', `${field.fieldId} 的 fieldKind 无效`)
    assert.ok(field.dataType && field.lifecycle, `${field.fieldId} 的业务专属定义不完整`)
    assert.ok(!fields.fields.some((standard) => standard.label.trim() === field.label.trim()), `${field.fieldId} 与标准字段同名，应改为 extends`)
  }
}
for (const binding of bindings.bindings) {
  assert.ok(fields.fields.some((field) => field.fieldId === binding.fieldId), `${binding.fieldId} 不在字段库`)
  if (binding.status.startsWith('bound')) assert.ok(binding.dictionaryId && dictionaryIds.has(binding.dictionaryId), `${binding.fieldId} 的字典绑定无效`)
  if (binding.status === 'external-master-data') assert.ok(binding.target, `${binding.fieldId} 缺少主数据目标`)
}
const uniqueValues = dictionaries.dictionaries.reduce((sum, dictionary) => sum + dictionary.valueCount, 0)
const duplicateRows = dictionaries.dictionaries.reduce((sum, dictionary) => sum + dictionary.sourceRowCount - dictionary.valueCount, 0)
assert.equal(uniqueValues + duplicateRows, dictionaries.sourceRowCount, 'SQL 字典行数无法对账')

for (const name of ['basic-information-fields.json', 'dictionary-catalog.json', 'field-dictionary-bindings.json', 'basic-information-field-set.schema.json', 'dictionary-catalog.schema.json', 'field-dictionary-bindings.schema.json', 'business-field-extensions.json', 'business-field-extensions.schema.json']) {
  assert.equal(fs.readFileSync(`${ontologyDir}/${name}`, 'utf8'), fs.readFileSync(`${packageDir}/${name}`, 'utf8'), `${name} 的 ontology 与包内副本不一致`)
}
console.log(`基本信息 ontology 校验通过：${fields.fieldCount} 字段、${bindings.bindingCount} 选择字段、${dictionaries.dictionaryCount} 字典、${uniqueValues} 唯一代码值`)
