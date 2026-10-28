import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const registry = JSON.parse(fs.readFileSync(path.join(root, 'specs/page-compositions.json')))
const errors = []
const sharedById = new Map()
const pageIds = new Set()

for (const shared of registry.sharedPages || []) {
  if (sharedById.has(shared.id)) errors.push(`公共页面重复：${shared.id}`)
  sharedById.set(shared.id, shared)
  if (!shared.module.startsWith('@wisedu/shared-pages')) errors.push(`${shared.id}: module 必须来自 @wisedu/shared-pages`)
}

for (const page of registry.pages || []) {
  if (pageIds.has(page.pageId)) errors.push(`页面 ID 重复：${page.pageId}`)
  pageIds.add(page.pageId)
  const target = path.join(root, page.path)
  if (!fs.existsSync(target)) errors.push(`${page.pageId}: 页面不存在 ${page.path}`)
  const source = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : ''
  const folder = path.dirname(target)
  const sourceFiles = fs.existsSync(folder)
    ? fs.readdirSync(folder).filter((name) => /\.(?:js|jsx|mjs)$/.test(name)).map((name) => fs.readFileSync(path.join(folder, name), 'utf8')).join('\n')
    : ''
  const allSource = `${source}\n${sourceFiles}`

  if (page.mode === 'custom') {
    if (page.basePageRef || page.extensions?.length) errors.push(`${page.pageId}: custom 页面不能声明公共页面或扩展点`)
    if (allSource.includes('@wisedu/shared-pages')) errors.push(`${page.pageId}: custom 页面禁止导入公共页面`)
    continue
  }
  if (!page.basePageRef) {
    errors.push(`${page.pageId}: ${page.mode} 页面必须声明 basePageRef`)
    continue
  }
  const shared = sharedById.get(page.basePageRef)
  if (!shared) {
    errors.push(`${page.pageId}: 公共页面未登记 ${page.basePageRef}`)
    continue
  }
  const allowed = new Set(shared.allowedExtensions || [])
  for (const extension of page.extensions || []) {
    if (!allowed.has(extension)) errors.push(`${page.pageId}: 未开放扩展点 ${extension}`)
  }
  if (!allSource.includes('@wisedu/shared-pages')) errors.push(`${page.pageId}: ${page.mode} 页面必须导入公共页面包`)
  if (page.mode === 'shared' && page.extensions?.length) errors.push(`${page.pageId}: shared 页面不能声明个性扩展`)
}

if (errors.length) {
  console.error(`页面组合校验失败：\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log(`页面组合校验通过：${registry.sharedPages.length} 个公共页面，${registry.pages.length} 个页面声明`)
