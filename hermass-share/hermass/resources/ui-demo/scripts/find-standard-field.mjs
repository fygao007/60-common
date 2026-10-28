import { searchRegisteredFields } from '../packages/hr-domain/src/basic-information.js'

const query = process.argv.slice(2).join(' ').trim()
if (!query) {
  console.error('用法：node scripts/find-standard-field.mjs <字段名称、编码或语义>')
  process.exit(1)
}
const results = searchRegisteredFields(query)
if (!results.length) {
  console.log(`未找到“${query}”对应的登记字段；请先登记 business-specific，再用于产品。`)
  process.exitCode = 2
} else {
  for (const field of results) {
    console.log([field.fieldId, field.label, field.sourceCode || '—', field.dataType, field.dictionaryId || field.target || '—', field.classification].join('\t'))
  }
}
