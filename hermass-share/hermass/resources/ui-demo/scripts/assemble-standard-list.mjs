import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectFiles, createBundleKeyResolver } from './page-files.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const [input, ...args] = process.argv.slice(2)
if (!input) throw new Error('用法：node scripts/assemble-standard-list.mjs <demo-context.json> [--output <目录>] [--check]')
const context = JSON.parse(fs.readFileSync(path.resolve(root, input), 'utf8'))
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'specs/page-template-catalog.json'), 'utf8'))
const template = catalog.templates.find((item) => item.id === context.page?.templateId)
if (template?.id !== 'standard-list-root') throw new Error('该装配器只支持 standard-list-root；其他模板不得冒充固定装配')
const source = path.resolve(root, context.generatedFrom || '')
if (!source.startsWith(path.join(root, 'ontology/product-world/scenarios') + path.sep)) throw new Error('上下文必须来自已登记场景')
const world = JSON.parse(fs.readFileSync(source, 'utf8'))
if (world.id !== context.scenarioId || world.version !== context.version || JSON.stringify(world.page.fieldRefs) !== JSON.stringify(context.page.fieldRefs) || world.page.demoPath !== context.page.demoPath || ![template.id, ...template.aliases].includes(world.page.templateId)) throw new Error('上下文与场景不一致，请重新生成上下文')
const demoPath = context.page.demoPath
if (!/^demos\/[\w/-]+\.html$/.test(demoPath)) throw new Error('demoPath 必须是 demos 下的安全相对 HTML 路径')
const outputIndex = args.indexOf('--output')
if (args.some((arg, index) => !['--output', '--check'].includes(arg) && !(outputIndex >= 0 && index === outputIndex + 1))) throw new Error('未知命令参数')
if (outputIndex >= 0 && !args[outputIndex + 1]) throw new Error('--output 缺少目录')
const output = outputIndex >= 0 ? path.resolve(args[outputIndex + 1]) : path.dirname(path.join(root, demoPath))
const name = path.basename(demoPath, '.html')
const demoDirectory = path.join(root, 'demos')
const targetEntry = path.join(root, demoPath.replace(/\.html$/, '.page.jsx'))
const entries = collectFiles(demoDirectory, (file) => file.endsWith('.page.jsx'))
const bundleKey = createBundleKeyResolver([...new Set([...entries, targetEntry])], demoDirectory)(targetEntry)
const entry = fs.readFileSync(path.join(root, template.sourceTemplate), 'utf8').replaceAll('{{PAGE_NAME}}', name)
const escape = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const relativeRoot = path.relative(output, root).split(path.sep).join('/') || '.'
const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${escape(context.page.title)}</title><link rel="stylesheet" href="${relativeRoot}/assets/bundles/pages/${bundleKey}.bundle.css" /></head><body><div class="ds-scope" data-ds-page="react" data-generated-page-contract="v1" data-page-template="standard-list-root"><div id="app"></div></div><script defer src="${relativeRoot}/assets/bundles/pages/${bundleKey}.bundle.js"></script></body></html>
`
const css = 'html, body, #app { margin: 0; min-height: 100%; }\n'
const config = `import { defineTableColumns } from '@wisedu/hr-domain/fields'
const columns = defineTableColumns(${JSON.stringify(context.page.fieldRefs)})
export function usePageConfig() {
  return { filterProps: { fields: [] }, toolbarActions: [], tableProps: { columns, data: [], selectable: false, actions: [] }, pagination: { total: 0, current: 1, pageSize: 10 } }
}
`
const fixed = { [`${name}.page.jsx`]: entry, [`${name}.html`]: html, [`${name}.css`]: css }
if (args.includes('--check')) {
  for (const [file, expected] of Object.entries(fixed)) {
    if (fs.readFileSync(path.join(output, file), 'utf8') !== expected) throw new Error(`模板骨架被修改：${file}`)
  }
  if (!fs.existsSync(path.join(output, `${name}.config.js`))) throw new Error('缺少业务配置')
  console.log('固定入口、HTML、CSS 检查通过')
} else {
  const files = { ...fixed, [`${name}.config.js`]: config }
  for (const file of Object.keys(files)) if (fs.existsSync(path.join(output, file))) throw new Error(`拒绝覆盖已有文件：${file}；现有页面先审查迁移，不直接重写`)
  fs.mkdirSync(output, { recursive: true })
  for (const [file, contents] of Object.entries(files)) fs.writeFileSync(path.join(output, file), contents, { flag: 'wx' })
  console.log(`已装配固定模板：${output}；只编辑 ${name}.config.js`)
}
