#!/usr/bin/env node
// 出图 + 计算样式核对（跨平台，自动找 Chrome / Edge）。
// 用法：
//   node scripts/shot.mjs <页面路径或 URL> [--out 截图.png] [--width 1440] [--height 900] [--full] [--ui-demo <路径>]
// 例：
//   node scripts/shot.mjs ../../ui-demo/demos/xxx/xxx.html --out out/xxx.png
//   node scripts/shot.mjs http://127.0.0.1:8765/pages/a/index.html
// 有 playwright-core 时输出骨架实测值；没有时降级为纯截图。

import { existsSync, statSync, mkdirSync, readFileSync } from 'node:fs'
import { join, resolve, dirname, isAbsolute, extname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = resolve(HERE, '..')
const argv = process.argv.slice(2)
const flags = new Set(argv.filter((a) => a.startsWith('--')))
const positional = argv.filter((a) => !a.startsWith('--'))
const argOf = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null }

const target = positional[0]
if (!target) {
  console.error('用法：node scripts/shot.mjs <页面路径或 URL> [--out 截图.png] [--width 1440] [--height 900] [--full]')
  process.exit(2)
}

const WIDTH = Number(argOf('--width') || 1440)
const HEIGHT = Number(argOf('--height') || 900)
const FULL = flags.has('--full')
const isWin = process.platform === 'win32'

// ---------- 找浏览器 ----------
const chromeCandidates = [
  process.env.CHROME_PATH,
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  !isWin && '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  !isWin && '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  isWin && process.env['PROGRAMFILES'] && join(process.env['PROGRAMFILES'], 'Google/Chrome/Application/chrome.exe'),
  isWin && process.env['PROGRAMFILES(X86)'] && join(process.env['PROGRAMFILES(X86)'], 'Google/Chrome/Application/chrome.exe'),
  isWin && process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
  isWin && process.env['PROGRAMFILES'] && join(process.env['PROGRAMFILES'], 'Microsoft/Edge/Application/msedge.exe'),
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)

const CHROME = chromeCandidates.find((p) => { try { return existsSync(p) && statSync(p).isFile() } catch { return false } })
if (!CHROME) {
  console.error('没找到 Chrome / Edge。设置环境变量 CHROME_PATH 指向浏览器可执行文件后重试。')
  process.exit(2)
}

// ---------- 目标 URL ----------
let url = target
if (!/^https?:\/\//i.test(target)) {
  const abs = isAbsolute(target) ? target : resolve(process.cwd(), target)
  if (!existsSync(abs)) { console.error(`文件不存在：${abs}`); process.exit(2) }
  url = pathToFileURL(abs).href
}

// ---------- 输出路径 ----------
const stem = url.split('/').filter(Boolean).slice(-2).join('-').replace(/\.html?$/i, '') || 'shot'
const outPath = resolve(argOf('--out') || join(process.cwd(), `${stem}.png`))
mkdirSync(dirname(outPath), { recursive: true })

// ---------- 解析 playwright-core ----------
const UI_DEMO_ROOT = [
  argOf('--ui-demo'),
  join(PKG_ROOT, 'resources', 'ui-demo'),
  join(PKG_ROOT, 'ui-demo'),
  join(PKG_ROOT, '..', 'ui-demo'),
].filter(Boolean).map((p) => (isAbsolute(p) ? p : resolve(process.cwd(), p)))
  .find((p) => existsSync(join(p, 'node_modules', 'playwright-core'))) || null

async function withPlaywright() {
  const req = createRequire(join(UI_DEMO_ROOT, 'package.json'))
  const { chromium } = req('playwright-core')
  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } })
  const errors = []
  page.on('pageerror', (e) => errors.push('JS: ' + String(e).split('\n')[0].slice(0, 160)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)) })
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url().split('/').slice(-2).join('/')}`) })

  await page.goto(url, { waitUntil: 'load', timeout: 30000 })
  await page.waitForTimeout(900)
  await page.screenshot({ path: outPath, fullPage: FULL })

  const metrics = await page.evaluate(() => {
    const px = (v) => (v == null ? null : Math.round(parseFloat(v)))
    const content = document.querySelector('.ds-regular-list-template__content')
    const th = document.querySelector('table thead th')
    const td = document.querySelector('table tbody td')
    const bodyBg = getComputedStyle(document.body).backgroundColor
    const rect = (el) => (el ? Math.round(el.getBoundingClientRect().height) : null)
    return {
      contentPadLeft: content ? px(getComputedStyle(content).paddingLeft) : null,
      thHeight: rect(th),
      tdHeight: rect(td),
      bodyBg,
      hasDsTable: !!document.querySelector('table.ds-data-table__table'),
      rowCount: document.querySelectorAll('table tbody tr').length,
    }
  })
  await browser.close()
  return { metrics, errors }
}

function shotByCli() {
  const args = ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${WIDTH},${HEIGHT}`, `--screenshot=${outPath}`, url]
  execFileSync(CHROME, args, { stdio: 'ignore' })
  return { metrics: null, errors: [] }
}

console.log(`\n出图：${url}`)
console.log(`浏览器：${CHROME}`)
console.log(`视口：${WIDTH}×${HEIGHT}${FULL ? '（整页）' : ''}\n`)

let result
if (UI_DEMO_ROOT) {
  result = await withPlaywright()
} else {
  console.log('[WARN] 没找到 playwright-core，降级为纯截图，无法输出计算样式。在模板工程执行 npm ci 可恢复完整校验。')
  result = shotByCli()
}

console.log(`截图：${outPath}`)
let bad = 0
if (result.metrics) {
  const m = result.metrics
  const judge = (label, cur, want) => {
    const pass = String(cur) === String(want)
    if (!pass) bad++
    console.log(`  ${pass ? 'ok' : 'XX'} ${label}：${cur == null ? '未测到（页面无该结构）' : cur + 'px'}${pass ? '' : `　应为 ${want}px`}`)
  }
  console.log('\n骨架实测：')
  judge('内容左右内边距', m.contentPadLeft, 12)
  judge('表头高', m.thHeight, 40)
  judge('数据行高', m.tdHeight, 46)
  console.log(`  ${m.bodyBg === 'rgb(255, 255, 255)' ? 'ok' : '!!'} body 背景：${m.bodyBg}${m.bodyBg === 'rgb(255, 255, 255)' ? '' : '　应为 rgb(255,255,255) / #fff'}`)
  console.log(`  .. 表格数据行数：${m.rowCount}${m.rowCount === 0 ? '（0 行 = 表格没渲染，检查数据与 JS）' : ''}`)
}

if (result.errors.length > 0) {
  console.log(`\n控制台 / 网络问题 ${result.errors.length} 条：`)
  for (const e of result.errors.slice(0, 10)) console.log(`  - ${e}`)
  bad += result.errors.length
}

console.log('\n' + '-'.repeat(56))
console.log(bad === 0 ? '出图通过' : `有 ${bad} 项需要处理`)
console.log('')
process.exit(bad === 0 ? 0 : 1)
