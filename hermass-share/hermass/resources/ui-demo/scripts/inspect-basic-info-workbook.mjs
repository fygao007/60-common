import fs from 'node:fs/promises'
import path from 'node:path'
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool'

const [, , inputPath, outputDir = '/private/tmp/basic-info-analysis/output'] = process.argv
if (!inputPath) throw new Error('用法：inspect-basic-info-workbook.mjs <xlsx路径> [输出目录]')
await fs.mkdir(outputDir, { recursive: true })

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath))
const summary = await workbook.inspect({ kind: 'workbook,sheet,table', maxChars: 12000, tableMaxRows: 12, tableMaxCols: 16, tableMaxCellChars: 160 })
await fs.writeFile(path.join(outputDir, 'inspect.ndjson'), summary.ndjson)

const sheets = []
for (const sheet of workbook.worksheets.items) {
  const used = sheet.getUsedRange()
  const values = used ? used.values : []
  sheets.push({ name: sheet.name, values })
  const preview = await workbook.render({ sheetName: sheet.name, autoCrop: 'all', scale: 1, format: 'png' })
  const safeName = sheet.name.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]+/g, '_')
  await fs.writeFile(path.join(outputDir, `${safeName}.png`), new Uint8Array(await preview.arrayBuffer()))
}
await fs.writeFile(path.join(outputDir, 'workbook-values.json'), JSON.stringify({ sheets }, null, 2))
console.log(JSON.stringify({ sheetCount: sheets.length, sheets: sheets.map((sheet) => ({ name: sheet.name, rows: sheet.values.length, cols: Math.max(0, ...sheet.values.map((row) => row.length)) })) }, null, 2))
