#!/usr/bin/env node
// 页面静态检查（替代 design-qa-loop 里的 grep 命令，Windows / macOS / Linux 通用）。
// 用法：
//   node scripts/check-page.mjs <页面.html | 目录> [--static] [--ui-demo <路径>]
//   --static   按纯静态工程（file:// 直开）的规则检查，禁 Web Component / ES module
// 退出码 0 表示通过，1 表示有问题。

import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs'
import { join, resolve, dirname, extname, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = resolve(HERE, '..')
const argv = process.argv.slice(2)
const flags = new Set(argv.filter((a) => a.startsWith('--')))
const positional = argv.filter((a) => !a.startsWith('--'))
const argOf = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null }

const STATIC_MODE = flags.has('--static')
const target = positional[0]
if (!target) {
  console.error('用法：node scripts/check-page.mjs <页面.html | 目录> [--static] [--ui-demo <路径>]')
  process.exit(2)
}

const uiDemoArg = argOf('--ui-demo')
const UI_DEMO_ROOT = [
  uiDemoArg,
  join(PKG_ROOT, 'resources', 'ui-demo'),
  join(PKG_ROOT, 'ui-demo'),
  join(PKG_ROOT, '..', 'ui-demo'),
].filter(Boolean).map((p) => (isAbsolute(p) ? p : resolve(process.cwd(), p)))
  .find((p) => existsSync(join(p, 'packages/design-system/src/tokens.css'))) || null

function collectHtml(abs) {
  if (statSync(abs).isFile()) return [abs]
  const out = []
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    const p = join(abs, entry.name)
    if (entry.isDirectory()) out.push(...collectHtml(p))
    else if (/\.html?$/i.test(entry.name)) out.push(p)
  }
  return out
}

const count = (text, re) => (text.match(re) || []).length

function checkPage(file) {
  const rel = file.replace(process.cwd() + '/', '').replace(process.cwd() + '\\', '')
  const html = readFileSync(file, 'utf8')
  const issues = []
  const notes = []

  // 1. 静态工程禁用项
  if (STATIC_MODE) {
    const wc = count(html, /<ds-[a-z-]+/gi)
    if (wc > 0) issues.push(`出现 ${wc} 处 <ds-*> Web Component，静态工程（file://）下不会注册`)
    const mod = count(html, /type\s*=\s*["']module["']/gi)
    if (mod > 0) issues.push(`出现 ${mod} 处 type="module"，静态工程不支持 ES module`)
    // 靠构建产物渲染的页面（React 场景页）也不能当静态模板搬：搬走就没有 bundle
    const bundleRef = count(html, /assets\/bundles\/|\.bundle\.(?:js|css)/gi)
    if (bundleRef > 0) issues.push(`引用了 ${bundleRef} 处 *.bundle.* 构建产物，这是 React 场景页而非静态模板，搬到别处会渲染空白`)
    // 正文几乎为空 = 靠 JS 渲染，同理不可搬
    const bodyInner = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [])[1] || ''
    const structCount = (bodyInner.match(/<(div|table|section|header|footer|main|nav|ul|form)\b/gi) || []).length
    if (structCount < 3) issues.push(`body 内静态结构只有 ${structCount} 个，疑似全靠 JS 渲染，不能作为静态模板`)
  }

  // 2. body 背景
  const bodyRule = html.match(/body\s*\{[^}]*\}/i)
  if (bodyRule) {
    const rule = bodyRule[0]
    if (/--ds-color-bg-page|#f0f2f5/i.test(rule)) {
      issues.push('body 背景使用了页面灰（--ds-color-bg-page / #f0f2f5），应为 #fff')
    }
  }

  // 3. 尺寸覆盖残留（tokens 已给对，页面不应重复声明）
  const inset = count(html, /--ds-regular-list-inset\s*:/g)
  if (inset > 0) issues.push(`页面重复声明 --ds-regular-list-inset ${inset} 处；tokens 已是 12px，删掉`)
  const rowVar = count(html, /--ds-table-(row|header)-height\s*:/g)
  if (rowVar > 0) notes.push(`页面声明 --ds-table-*-height ${rowVar} 处（tokens 已给，通常应删除）`)
  // 自造表格（.data-table / .preview-table 等）不读 DS 变量，写死高度本身没错，
  // 但值必须与 tokens 一致；不一致才是 bug。组合选择器 `th, td { height: 46px }` 视为合法。
  const blocks = [...html.matchAll(/([^{}]+)\{([^}]*)\}/g)]
  const cells = []
  for (const [, selector, body] of blocks) {
    const sel = selector.trim().replace(/\s+/g, ' ')
    if (!/(^|[\s,>])(th|td)\b/i.test(sel)) continue
    const hm = body.match(/height\s*:\s*(\d+)px/i)
    if (!hm) continue
    const hasTh = /(^|[\s,>])th\b/i.test(sel)
    const hasTd = /(^|[\s,>])td\b/i.test(sel)
    cells.push({ sel, value: Number(hm[1]), hasTh, hasTd })
  }
  if (cells.length > 0) {
    const wrong = cells.filter((c) => {
      const v = c.value
      if (c.hasTh && c.hasTd) return v !== 40 && v !== 46
      if (c.hasTh) return v !== 40
      return v !== 46
    })
    if (wrong.length > 0) {
      // 无法从源码判断是否属于弹窗内紧凑表格（如 .import-preview 常用 36px），因此只提示不阻断。
      notes.push(`单元格高度非 40/46：${wrong.map((c) => `${c.sel} = ${c.value}px`).join(' ; ')}（主数据表格应为 th 40 / td 46；紧凑预览表格可忽略）`)
    } else {
      const uniq = [...new Set(cells.map((c) => `${c.value}px`))].join('/')
      notes.push(`自造表格写死高度 ${uniq}，值正确但与 tokens 脱钩；建议改用 var(--ds-table-header-height) / var(--ds-table-row-height)`)
    }
  }

  // 4. 自造间距（10/14/18/24 之类）
  const odd = [...html.matchAll(/padding\s*:\s*(1[0134]|1[89]|2[0246])px/gi)].map((m) => m[1])
  if (odd.length > 0) notes.push(`出现非规范内边距 ${[...new Set(odd)].join('/')}px（骨架区应为 12/8/0）`)

  // 5. 引用的本地资源是否真实存在（grep 查不出 404，这里能）
  const baseDir = dirname(file)
  const refs = [
    ...html.matchAll(/(?:href|src)\s*=\s*["']([^"'#?]+)["']/gi),
  ].map((m) => m[1]).filter((u) => !/^(https?:|data:|mailto:|javascript:|\/\/)/i.test(u))
  const missing = []
  for (const ref of refs) {
    const p = ref.startsWith('/') ? null : join(baseDir, ref.split('?')[0])
    if (p && !existsSync(p) && !missing.includes(ref)) missing.push(ref)
  }
  if (missing.length > 0) issues.push(`引用的本地文件不存在（会 404）：${missing.slice(0, 6).join(', ')}${missing.length > 6 ? ` 等 ${missing.length} 个` : ''}`)

  // 6. 页面映射登记（仅静态工程，给了外壳才有意义）
  const shell = argOf('--shell')
  if (shell && STATIC_MODE) {
    const shellAbs = isAbsolute(shell) ? shell : resolve(process.cwd(), shell)
    if (existsSync(shellAbs)) {
      const shellHtml = readFileSync(shellAbs, 'utf8')
      const marker = rel.split(/[\\/]/).slice(-2).join('/')
      if (!shellHtml.includes(marker)) notes.push(`外壳 index.html 里未发现页面映射（${marker}），菜单可能进不去`)
    }
  }

  return { rel, issues, notes }
}

const files = collectHtml(resolve(target))
if (files.length === 0) {
  console.error(`没有找到 .html：${resolve(target)}`)
  process.exit(2)
}

console.log(`\n检查目标：${resolve(target)}${STATIC_MODE ? '（静态工程规则）' : ''}`)
if (STATIC_MODE) console.log('规则：禁 <ds-*> Web Component、禁 type="module"、body #fff、页面不重复声明骨架尺寸')

let failed = 0
for (const f of files) {
  const { rel, issues, notes } = checkPage(f)
  const pass = issues.length === 0
  if (!pass) failed++
  console.log(`\n${pass ? '[PASS]' : '[FAIL]'} ${rel}`)
  for (const i of issues) console.log(`   x ${i}`)
  for (const n of notes) console.log(`   ! ${n}`)
  if (pass && notes.length === 0) console.log('   无问题')
}

// tokens 源头核对（只要找到模板工程就查）
if (UI_DEMO_ROOT) {
  const tokens = join(UI_DEMO_ROOT, 'packages/design-system/src/tokens.css')
  const css = readFileSync(tokens, 'utf8')
  const want = { '--ds-regular-list-inset': '12px', '--ds-table-header-height': '40px', '--ds-table-row-height': '46px' }
  console.log('\ntokens 源头')
  for (const [k, v] of Object.entries(want)) {
    const m = css.match(new RegExp(`${k}\\s*:\\s*([^;]+);`))
    const cur = m ? m[1].trim() : '(未定义)'
    console.log(`   ${cur === v ? 'ok' : 'XX'} ${k} = ${cur}${cur === v ? '' : `（应为 ${v}）`}`)
    if (cur !== v) failed++
  }
  // 拷贝版一致性（只有本机存在 60sysV2 这类拷贝工程时才查）
  const copy = [
    join(UI_DEMO_ROOT, '..', 'assets', 'tokens.css'),
    join(UI_DEMO_ROOT, '..', '..', '60sysV2', 'assets', 'tokens.css'),
  ].find((p) => existsSync(p))
  if (copy) {
    const same = readFileSync(copy, 'utf8') === css
    console.log(`   ${same ? 'ok' : 'XX'} 拷贝版 ${copy} ${same ? '与源码一致' : '与源码不一致 —— 同一页面在两处跑会得到不同行高，需同步'}`)
    if (!same) failed++
  } else {
    console.log('   .. 未发现 tokens 拷贝版，跳过一致性检查')
  }
}

console.log(`\n${'-'.repeat(56)}\n${failed === 0 ? '全部通过' : `${failed} 个文件/项未通过`}\n`)
process.exit(failed === 0 ? 0 : 1)
