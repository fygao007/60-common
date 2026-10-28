import fs from 'node:fs'
import path from 'node:path'

export function collectFiles(folder, predicate = () => true) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(folder, entry.name)
    if (entry.isDirectory()) return collectFiles(target, predicate)
    return predicate(target) ? [target] : []
  })
}

// 缓存仅用于一次脚本运行；保留原始字节供基线哈希使用。
export function createFileReader() {
  const contents = new Map()
  return (file, encoding) => {
    if (!contents.has(file)) contents.set(file, fs.readFileSync(file))
    const content = contents.get(file)
    return encoding ? content.toString(encoding) : content
  }
}

export function isStrictContractFamily(file, readFile = fs.readFileSync) {
  const folder = path.dirname(file)
  const name = path.basename(file).replace(/(?:\.page\.jsx|\.html|\.css)$/, '')
  return [path.join(folder, `${name}.html`), path.join(folder, `${name}.page.jsx`)].some((sourceFile) => {
    if (!fs.existsSync(sourceFile)) return false
    const source = readFile(sourceFile, 'utf8')
    return source.includes('data-generated-page-contract="v1"')
      || source.includes("PAGE_GENERATION_CONTRACT = 'v1'")
  })
}

export function createBundleKeyResolver(pageFiles, demoDirectory) {
  const nameCounts = new Map()
  for (const file of pageFiles) {
    const name = path.basename(file).replace(/\.page\.jsx$/, '')
    nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1)
  }
  return (file) => {
    const name = path.basename(file).replace(/\.page\.jsx$/, '')
    // 只有重名入口使用相对路径，保持历史 HTML 引用不变。
    return (nameCounts.get(name) ?? 0) > 1
      ? path.relative(demoDirectory, file).replace(/\.page\.jsx$/, '').split(path.sep).join('/')
      : name
  }
}
