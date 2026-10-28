import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectFiles, createBundleKeyResolver, createFileReader, isStrictContractFamily } from './page-files.mjs'
import { checkStandardListEntry } from './standard-list-entry-contract.mjs'

const readFile = createFileReader()

const directory = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(directory, '..')
const demosDirectory = path.join(root, 'demos')
const legacyManifest = JSON.parse(readFile(
  path.join(root, 'specs/legacy-static-pages.json'),
  'utf8',
))
const regressionManifest = JSON.parse(readFile(
  path.join(root, 'specs/business-page-regression.json'),
  'utf8',
))
const historicalBaseline = JSON.parse(readFile(
  path.join(root, 'specs/business-page-baseline.json'),
  'utf8',
))
const regressionPages = new Map(
  regressionManifest.pages.map((page) => [page.file, page]),
)
const errors = []

function hashFile(file) {
  return crypto.createHash('sha256').update(readFile(file)).digest('hex')
}

function addError(file, message) {
  errors.push(`${file}: ${message}`)
}

function toRootRelative(file) {
  return path.relative(root, file).split(path.sep).join('/')
}

function validateDemoIsolation(file, source) {
  const isGeneratedContractPage = source.includes('data-generated-page-contract="v1"')
    || source.includes("PAGE_GENERATION_CONTRACT = 'v1'")
  if (!isGeneratedContractPage) return
  const relative = toRootRelative(file)
  const ownerDirectory = path.posix.dirname(relative)
  const references = [...source.matchAll(/(?:from\s+|import\s*\(|(?:src|href)=)["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((reference) => !reference.startsWith('#'))

  for (const reference of references) {
    if (!reference.startsWith('.')) continue
    const resolved = path.posix.normalize(path.posix.join(ownerDirectory, reference))
    if (!resolved.startsWith('demos/')) continue
    // 产品菜单是正式导航依赖，页面只引用菜单模块，不能复制菜单结构。
    const product = relative.split('/')[1]
    if (resolved.startsWith(`demos/${product}/menus/`) && resolved.endsWith('.js')) continue
    if (!resolved.startsWith(`${ownerDirectory}/`)) {
      addError(relative, `页面实现禁止跨 Demo 导入；跨页面跳转请使用 WiseMenuRegistry.route()：${reference}`)
    }
    if (/(?:^|\/)shared(?:\/|$)/.test(resolved)) {
      addError(relative, `Demo 禁止依赖业务 shared 目录：${reference}；请沉淀为设计系统组件或复制为当前 Demo 的独立数据/配置`)
    }
  }
}

for (const [relative, expectedHash] of Object.entries(legacyManifest.pages)) {
  const file = path.join(root, relative)
  if (!fs.existsSync(file)) {
    addError(relative, '旧页面已删除但仍在 legacy manifest 中')
    continue
  }
  if (hashFile(file) !== expectedHash) {
    addError(relative, '旧静态页面禁止继续修改；请迁移为 data-ds-page="react" + 同名 .page.jsx')
  }
}

const demoFiles = collectFiles(demosDirectory)
const htmlFiles = demoFiles.filter((file) => file.endsWith('.html'))
const pageEntries = demoFiles.filter((file) => file.endsWith('.page.jsx'))
const pageEntrySet = new Set(pageEntries.map(toRootRelative))
const governedFiles = demoFiles.filter((file) => /(?:\.html|\.page\.jsx|\.css)$/.test(file))
const governedSet = new Set(governedFiles.map(toRootRelative))

for (const file of governedFiles) {
  if (isStrictContractFamily(file, readFile)) continue
  const relative = toRootRelative(file)
  const expectedHash = historicalBaseline.files[relative]
  if (!expectedHash) {
    addError(relative, '新增页面文件必须使用 PAGE_GENERATION_CONTRACT v1，禁止继续扩展无约束旧页面')
    continue
  }
  if (hashFile(file) !== expectedHash) {
    addError(relative, '旧页面内容已变化；请迁移到 PAGE_GENERATION_CONTRACT v1 后再修改')
  }
}

for (const relative of Object.keys(historicalBaseline.files)) {
  if (governedSet.has(relative)) continue
  addError(relative, '监管基线中的旧页面文件已不存在；确认删除后请显式刷新基线')
}

const bundleKeyFor = createBundleKeyResolver(pageEntries, demosDirectory)

for (const file of htmlFiles) {
  const relative = toRootRelative(file)
  if (legacyManifest.pages[relative]) continue

  const source = readFile(file, 'utf8')
  if (!source.includes('data-generated-page-contract="v1"')) continue
  validateDemoIsolation(file, source)
  if (!source.includes('data-ds-page="react"')) continue

  const baseName = path.basename(file).replace(/\.html$/, '')
  const entryRelative = toRootRelative(path.join(path.dirname(file), `${baseName}.page.jsx`))

  if (!pageEntrySet.has(entryRelative)) {
    addError(relative, `缺少 React 入口 ${entryRelative}`)
  }
  const bundleKey = bundleKeyFor(path.join(path.dirname(file), `${baseName}.page.jsx`))
  if (!source.includes(`assets/bundles/pages/${bundleKey}.bundle.js`)) {
    addError(relative, '必须加载 build:previews 生成的同名业务页 bundle')
  }
  const regressionPage = regressionPages.get(relative)
  if (!regressionPage) {
    addError(relative, 'React 业务页必须登记到 specs/business-page-regression.json')
  } else {
    if (regressionPage.name !== baseName) {
      addError(relative, `回归规范 name 必须为 ${baseName}`)
    }
    if (!regressionPage.rootSelector || !regressionPage.requiredSelectors) {
      addError(relative, '回归规范必须声明 rootSelector 和 requiredSelectors')
    }
  }
  if (/<style[\s>]/i.test(source) || /staff-app-pages\.css/.test(source)) {
    addError(relative, 'React 业务页 HTML 只能负责框架配置和 bundle 加载，禁止承载业务样式')
  }
  if (/\bap-(?:btn|panel|field|upload|table|tag)\b/.test(source)) {
    addError(relative, '禁止继续引用 ap-* 仿制基础组件')
  }
}

for (const file of pageEntries) {
  const relative = toRootRelative(file)
  const source = readFile(file, 'utf8')
  if (!source.includes("PAGE_GENERATION_CONTRACT = 'v1'")) continue
  if (/PAGE_TEMPLATE\s*=\s*['"]standard-list-root['"]/.test(source)) {
    if (!checkStandardListEntry(root, file, source)) {
      addError(relative, 'standard-list-root 入口必须使用已登记模板；业务差异仅允许放入同目录 .config.js')
    }
  }
  validateDemoIsolation(file, source)
  const cssName = path.basename(file).replace(/\.page\.jsx$/, '.css')
  const cssFile = path.join(path.dirname(file), cssName)
  const htmlFile = path.join(path.dirname(file), path.basename(file).replace(/\.page\.jsx$/, '.html'))

  if (!fs.existsSync(htmlFile)) {
    addError(relative, `缺少同名业务页 HTML ${toRootRelative(htmlFile)}`)
  }

  if (!/from\s+['"]@wisedu\/design-system['"]/.test(source)) {
    addError(relative, '业务页必须从 @wisedu/design-system 公共入口导入组件')
  }
  if (/from\s+['"][^'"]*packages\/design-system\/src\//.test(source)) {
    addError(relative, '禁止从设计系统内部路径导入组件')
  }
  const nativeControls = [...source.matchAll(/<(button|input|select|textarea|table)\b/gi)]
    .map((match) => match[1].toLowerCase())
  if (nativeControls.length) {
    addError(relative, `禁止手写基础控件：${[...new Set(nativeControls)].join(', ')}`)
  }
  if (/\b(?:ds-modal__|ds-drawer__|ds-edit-field__|ap-(?:btn|panel|field|upload|table|tag))/.test(source)) {
    addError(relative, '禁止复制设计系统内部 DOM 或旧 ap-* 组件')
  }

  if (!fs.existsSync(cssFile)) {
    addError(relative, `缺少同名业务布局样式 ${toRootRelative(cssFile)}`)
    continue
  }
  const cssSource = readFile(cssFile, 'utf8')
  if (/[^{}]*\.(?:ds|frame2)-[\w-]+[^{}]*\{/m.test(cssSource)) {
    addError(toRootRelative(cssFile), '业务 CSS 禁止覆盖 .ds-* 或 .frame2-* 组件选择器')
  }
  if (/\b(?:#(?:[0-9a-f]{3}){1,2}|rgba?\s*\()/i.test(cssSource)) {
    addError(toRootRelative(cssFile), '业务 CSS 颜色必须使用设计 token，禁止硬编码颜色')
  }
}

const standardExample = path.join(root, 'scenarios/szd-standard-list-page.page.jsx')
if (!checkStandardListEntry(root, standardExample, readFile(standardExample, 'utf8'))) {
  addError('scenarios/szd-standard-list-page.page.jsx', '标准列表参考页必须使用固定入口模板')
}

if (errors.length) {
  console.error(`Business page contract failed with ${errors.length} issue(s):`)
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  const contractPages = pageEntries.filter((file) => readFile(file, 'utf8').includes("PAGE_GENERATION_CONTRACT = 'v1'")).length
  console.log(`Business page contract passed: ${contractPages} strict contract page(s); ${Object.keys(historicalBaseline.files).length} historical file(s) locked by baseline.`)
}
