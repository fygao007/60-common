import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { collectFiles, createFileReader, isStrictContractFamily } from './page-files.mjs'

const readFile = createFileReader()

if (!process.argv.includes('--accept')) {
  throw new Error('该命令会接受当前旧页面内容为监管基线，请显式传入 --accept')
}

const root = path.resolve(import.meta.dirname, '..')
const demos = path.join(root, 'demos')
const output = path.join(root, 'specs/business-page-baseline.json')

function hashFile(file) {
  return crypto.createHash('sha256').update(readFile(file)).digest('hex')
}

const files = Object.fromEntries(
  collectFiles(demos, (file) => /(?:\.html|\.page\.jsx|\.css)$/.test(file))
    .filter((file) => !isStrictContractFamily(file, readFile))
    .map((file) => [path.relative(root, file).split(path.sep).join('/'), hashFile(file)])
    .sort(([left], [right]) => left.localeCompare(right)),
)

fs.writeFileSync(output, `${JSON.stringify({
  version: 1,
  policy: '旧页面只读监管基线；修改旧页面前必须迁移到 PAGE_GENERATION_CONTRACT v1。',
  files,
}, null, 2)}\n`)

console.log(`旧页面监管基线已更新：${Object.keys(files).length} 个文件`)
