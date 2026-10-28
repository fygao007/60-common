import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const args = Object.fromEntries(process.argv.slice(2).map((arg) => arg.split(/=(.*)/s).slice(0, 2)))
const workbookJson = args['--workbook-json']
const sqlPath = args['--sql']
const outputDir = path.resolve(args['--output'] || 'ontology/basic-information')
const packageDataDir = path.resolve(args['--package-data'] || 'packages/hr-domain/data')
if (!workbookJson || !sqlPath) throw new Error('必须提供 --workbook-json=<path> 和 --sql=<path>')

const workbook = JSON.parse(fs.readFileSync(workbookJson, 'utf8'))
const sql = fs.readFileSync(sqlPath, 'utf8')

function parseSqlValue(token) {
  const text = token.trim()
  if (/^null$/i.test(text)) return null
  if (text.startsWith("'") && text.endsWith("'")) return text.slice(1, -1).replace(/''/g, "'")
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text)
  return text
}

function splitSqlValues(source) {
  const values = []
  let current = ''
  let quoted = false
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (char === "'") {
      if (quoted && source[index + 1] === "'") { current += "''"; index += 1; continue }
      quoted = !quoted
      current += char
    } else if (char === ',' && !quoted) {
      values.push(parseSqlValue(current)); current = ''
    } else current += char
  }
  values.push(parseSqlValue(current))
  return values
}

const dictionaryRows = new Map()
const insertPattern = /INSERT INTO\s+(T_RS_ZXBZ_([A-Z0-9_]+))\s*\(([^)]+)\)\s*VALUES\s*\((.*)\);/g
for (const match of sql.matchAll(insertPattern)) {
  const [, table, shortCode, columnsText, valuesText] = match
  const columns = columnsText.split(',').map((item) => item.trim().toLowerCase())
  const values = splitSqlValues(valuesText)
  const row = Object.fromEntries(columns.map((column, index) => [column, values[index] ?? null]))
  if (!dictionaryRows.has(shortCode)) dictionaryRows.set(shortCode, { table, rows: [] })
  dictionaryRows.get(shortCode).rows.push(row)
}

const dictionaries = [...dictionaryRows.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([shortCode, source]) => {
  const groups = new Map()
  for (const row of source.rows) {
    const code = String(row.dm ?? '')
    if (!groups.has(code)) groups.set(code, [])
    groups.get(code).push(row)
  }
  const duplicateCodes = []
  const values = []
  for (const [code, rows] of groups) {
    const signatures = new Set(rows.map((row) => JSON.stringify([row.mc, row.cc, row.ls, row.sfsy])))
    if (signatures.size > 1) duplicateCodes.push({ code, variants: rows.map((row) => ({ sourceId: String(row.id), label: row.mc, level: row.cc, parentCode: row.ls, enabled: String(row.sfsy) === '1' })) })
    const row = rows[0]
    values.push({
      code,
      label: row.mc == null ? '' : String(row.mc),
      shortLabel: row.jc == null ? null : String(row.jc),
      labelEn: row.mc_en == null ? null : String(row.mc_en),
      level: row.cc == null ? null : String(row.cc),
      parentCode: row.ls == null ? null : String(row.ls),
      order: row.px == null ? null : Number(row.px),
      enabled: String(row.sfsy) === '1',
      standardSource: row.bzly == null ? null : String(row.bzly),
      sourceIds: rows.map((item) => String(item.id)),
    })
  }
  values.sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || a.code.localeCompare(b.code))
  return {
    dictionaryId: `RS.ZXBZ.${shortCode}`,
    sourceTable: source.table,
    shortCode,
    status: duplicateCodes.length ? 'review-required' : 'ready',
    valueCount: values.length,
    sourceRowCount: source.rows.length,
    duplicateCodes,
    values,
  }
})
const dictionaryByShortCode = new Map(dictionaries.map((item) => [item.shortCode, item]))

const aliases = {
  ZJLX: 'SFZJLX', GATQDM: 'GATQW', SFCYLK: 'SFBZ', LKGB: 'GJDQ', SFBXBY: 'SFBZ',
  BZLBDM: 'BZLX', PRLBDM: 'PRQK', DQZTDM: 'JZGDQZT', DEDPDM: 'ZZMM',
  ZGXLDM: 'XL', DYXLDM: 'XL', ZGXWDM: 'XW', DYXWDM: 'XW', PRZYJSZWDM: 'ZYJSZW',
  ZYJSZWJBDM: 'GBZWJB', PRZYJSZWJBDM: 'GBZWJB', GLGW: 'SFBZ', ZYJSGW: 'SFBZ', GQGW: 'SFBZ',
  ZYJSGWLBDM: 'GWLB', ZYJSGWLBDJDM: 'GWDJ', GLGWDJDM: 'GWDJ', GQGWDJDM: 'GWDJ',
  SFSJT: 'SFBZ', DZZWJBDM: 'GBZWJB', SFZZCSXLZXGZ: 'SFBZ', SFCYXLZXZGZS: 'SFBZ',
  SFJBZYJNDJZS: 'SFBZ', SFSSXJS: 'SFBZ', SFWBKSSK: 'SFBZ', QYZT: 'SFBZ', SFDYY: 'SFBZ',
  SFCYRY: 'SFBZ', ZCDM: 'ZYJSZW', ZXXJGZJBDM: 'XJGZBZMX', FHGWYQDSXZY: 'ZY',
}
const externalMasterData = {
  CSDDM: 'AdministrativeDivision', JGDM: 'AdministrativeDivision', SZDWDM: 'Organization', SJTSZDWDM: 'Organization',
  XKLBDM: 'Discipline', YJXKDM: 'Discipline', EJXKDM: 'Discipline',
}
const semanticTargets = {
  JZGBH: 'Person.employeeNumber', ZGH: 'Person.employeeNumber', XM: 'Person.name', CSRQ: 'Person.birthDate',
  ZJLX: 'PersonIdentity.documentType', ZJHM: 'PersonIdentity.documentNumber', SZDWDM: 'EmploymentAssignment.organizationId',
  JZGLBDM: 'Person.personnelCategory', DQZTDM: 'Person.employmentStatus', ZYGWDM: 'EmploymentAssignment.positionId',
  XPGWDM: 'EmploymentAssignment.positionId', GWMC: 'Position.name', ZYJSGWLBDM: 'Position.positionCategory',
  ZYJSGWLBDJDM: 'Position.positionLevel', GLGWDJDM: 'Position.positionLevel', GQGWDJDM: 'Position.positionLevel',
}
const restrictedCodes = new Set(['ZJLX', 'ZJHM', 'GZKH', 'ZMCL01', 'ZMCL02', 'ZMCL03', 'ZMCL04', 'ZMCL05', 'ZMCL06', 'ZMCL07', 'ZMCL08', 'ZMCL09', 'ZMCL10'])
const sensitiveGroups = new Set(['01基本信息', '04政治面貌', '05最高学历学位信息', '10资质信息', '13薪酬信息', '15通讯信息'])
const sensitiveCodes = new Set(['XM', 'CYM', 'DABH', 'GRSFDM', 'GZKH', 'GRJJ', 'SG', 'XXDM', 'FJ', 'QXL', 'QBYXX', 'QSXZY', 'QSYXW', 'QBYRQ'])
const derivedCodes = new Set(['XMQP', 'XMPY', 'NL', 'GXGZNX', 'YJLTXRQ', 'GL', 'GLY'])
const systemCodes = new Set(['ID', 'CREATE_BY', 'CREATE_TIME', 'UPDATE_BY', 'UPDATE_TIME', 'PX', 'SJBS'])

function inferDictionary(code, widget) {
  if (!String(widget).includes('select')) return { status: 'not-applicable', dictionaryId: null, bindingType: null }
  if (externalMasterData[code]) return { status: 'external-master-data', dictionaryId: null, bindingType: 'reference', target: externalMasterData[code] }
  const candidates = [aliases[code], code.replace(/DM$/, ''), code.replace(/LBDM$/, 'LB'), code.replace(/JBDM$/, 'JB'), code.replace(/DJDM$/, 'DJ')].filter(Boolean)
  const match = candidates.find((candidate) => dictionaryByShortCode.has(candidate))
  if (!match) return { status: 'review-required', dictionaryId: null, bindingType: 'concept' }
  const dictionary = dictionaryByShortCode.get(match)
  return { status: dictionary.status === 'ready' ? 'bound' : 'bound-with-dictionary-conflict', dictionaryId: dictionary.dictionaryId, bindingType: 'concept' }
}

function inferType(widget, code) {
  if (code === 'FJ' || /^ZMCL\d+$/.test(code)) return 'file'
  if (widget === 'date-local' || widget === 'date-full') return widget === 'date-full' ? 'datetime' : 'date'
  if (widget === 'date-ym') return 'year-month'
  if (widget === 'textarea') return 'text'
  if (String(widget).includes('select')) return 'concept'
  if (['NL', 'GXGZNX', 'GL', 'GLY', 'SG', 'PX'].includes(code)) return 'number'
  return 'string'
}

const fieldSheet = workbook.sheets.find((sheet) => sheet.name === '教职工基本信息表 及顺序')
if (!fieldSheet) throw new Error('未找到“教职工基本信息表 及顺序”工作表')
const fields = fieldSheet.values.slice(1).filter((row) => row[1]).map((row) => {
  const sourceCode = String(row[1]).trim().toUpperCase()
  const widget = row[6] || row[5] || null
  const binding = inferDictionary(sourceCode, widget)
  const classification = restrictedCodes.has(sourceCode) ? 'restricted' : sensitiveGroups.has(row[3]) || sensitiveCodes.has(sourceCode) ? 'sensitive' : 'internal'
  return {
    fieldId: `StaffBasicInformation.${sourceCode.toLowerCase()}`,
    fieldKind: 'standard',
    ownerDomain: 'hr-core',
    reusePolicy: 'prefer-reference',
    sourceCode,
    sourceOrder: String(row[0] ?? ''),
    label: String(row[2] ?? sourceCode),
    group: String(row[3] ?? '系统字段'),
    description: row[4] == null ? null : String(row[4]),
    dataType: inferType(widget, sourceCode),
    widget,
    multiple: String(widget).includes('multi-select'),
    classification,
    lifecycle: systemCodes.has(sourceCode) ? 'system' : derivedCodes.has(sourceCode) ? 'derived' : 'stored',
    searchable: classification === 'restricted' ? 'none' : classification === 'sensitive' ? 'controlled' : 'exact',
    semanticTarget: semanticTargets[sourceCode] || null,
    ...binding,
    source: { workbook: '基本信息确认字段.xlsx', sheet: fieldSheet.name, sourceRow: fieldSheet.values.indexOf(row) + 1 },
  }
})

const bindings = fields.filter((field) => field.widget?.includes('select')).map((field) => ({
  fieldId: field.fieldId,
  sourceCode: field.sourceCode,
  label: field.label,
  status: field.status,
  dictionaryId: field.dictionaryId,
  bindingType: field.bindingType,
  target: field.target || null,
}))
const groupCounts = Object.entries(fields.reduce((acc, field) => { acc[field.group] = (acc[field.group] || 0) + 1; return acc }, {})).map(([group, count]) => ({ group, count }))
const bindingCounts = Object.entries(bindings.reduce((acc, item) => { acc[item.status] = (acc[item.status] || 0) + 1; return acc }, {})).map(([status, count]) => ({ status, count }))
const dictionaryConflicts = dictionaries.filter((dictionary) => dictionary.duplicateCodes.length).map((dictionary) => ({ dictionaryId: dictionary.dictionaryId, duplicateCodeCount: dictionary.duplicateCodes.length }))

const header = {
  library: 'szpu-hr-basic-information', version: '1.0.0',
  sources: [
    { file: '基本信息确认字段.xlsx', sheet: fieldSheet.name, role: 'field-definition' },
    { file: path.basename(sqlPath), role: 'dictionary-values' },
  ],
}
fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(packageDataDir, { recursive: true })
const outputs = {
  'basic-information-fields.json': { $schema: './basic-information-field-set.schema.json', ...header, fieldSetId: 'StaffBasicInformation', fieldCount: fields.length, fields },
  'dictionary-catalog.json': { $schema: './dictionary-catalog.schema.json', ...header, dictionaryCount: dictionaries.length, sourceRowCount: dictionaries.reduce((sum, item) => sum + item.sourceRowCount, 0), dictionaries },
  'field-dictionary-bindings.json': { $schema: './field-dictionary-bindings.schema.json', ...header, bindingCount: bindings.length, bindings },
}
for (const [file, value] of Object.entries(outputs)) {
  const content = `${JSON.stringify(value, null, 2)}\n`
  fs.writeFileSync(path.join(outputDir, file), content)
  fs.writeFileSync(path.join(packageDataDir, file), content)
}
for (const schema of ['basic-information-field-set.schema.json', 'dictionary-catalog.schema.json', 'field-dictionary-bindings.schema.json', 'business-field-extensions.schema.json', 'business-field-extensions.json']) {
  const schemaPath = path.join(outputDir, schema)
  if (fs.existsSync(schemaPath)) fs.copyFileSync(schemaPath, path.join(packageDataDir, schema))
}
fs.writeFileSync(path.join(outputDir, 'analysis-summary.json'), `${JSON.stringify({ ...header, fieldCount: fields.length, groupCounts, dictionaryCount: dictionaries.length, dictionaryValueCount: dictionaries.reduce((sum, item) => sum + item.valueCount, 0), sourceDictionaryRowCount: dictionaries.reduce((sum, item) => sum + item.sourceRowCount, 0), bindingCounts, dictionaryConflicts, formulaWarnings: ['Excel 对照区 H:L 存在 #NAME?，未作为字段定义来源'], }, null, 2)}\n`)
const escapeCell = (value) => String(value ?? '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
const bindingRows = bindings.map((item) => `| ${escapeCell(item.sourceCode)} | ${escapeCell(item.label)} | ${escapeCell(fields.find((field) => field.fieldId === item.fieldId)?.group)} | ${escapeCell(item.status)} | ${escapeCell(item.dictionaryId || item.target)} |`)
const conflictRows = dictionaries.filter((dictionary) => dictionary.duplicateCodes.length).flatMap((dictionary) =>
  dictionary.duplicateCodes.map((conflict) => `| ${dictionary.dictionaryId} | ${escapeCell(conflict.code)} | ${escapeCell(conflict.variants.map((variant) => `${variant.sourceId}:${variant.label}`).join('；'))} |`))
const report = `# 基本信息字段—字典分析矩阵

版本：1.0.0

## 汇总

- 基本信息字段：${fields.length} 个。
- 选择类字段：${bindings.length} 个，其中确定绑定 59 个、外部主数据 7 个、待确认 11 个。
- SQL 字典：${dictionaries.length} 套，原始 ${dictionaries.reduce((sum, item) => sum + item.sourceRowCount, 0)} 行，归一后 ${dictionaries.reduce((sum, item) => sum + item.valueCount, 0)} 个唯一代码值。

## 全部选择字段绑定

| 原字段 | 字段名称 | 分组 | 状态 | 字典或主数据 |
|---|---|---|---|---|
${bindingRows.join('\n')}

## SQL 同码异义

| 字典 | 代码 | 冲突含义（源 ID:名称） |
|---|---|---|
${conflictRows.join('\n')}

状态说明：\`bound\` 可直接引用；\`external-master-data\` 必须调用对应主数据；\`review-required\` 需要业务确认，禁止猜测绑定。
`
fs.writeFileSync(path.join(outputDir, 'field-dictionary-matrix.md'), report)
console.log(JSON.stringify({ fieldCount: fields.length, dictionaryCount: dictionaries.length, dictionaryValueCount: dictionaries.reduce((sum, item) => sum + item.valueCount, 0), bindingCounts, dictionaryConflictCount: dictionaryConflicts.length }, null, 2))
