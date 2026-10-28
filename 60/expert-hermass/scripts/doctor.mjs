#!/usr/bin/env node
// Hermass 环境自检：一条命令告诉你还缺什么。
// 用法：node scripts/doctor.mjs [--ui-demo <路径>]
// 只用 node 内置模块，无第三方依赖，macOS / Windows / Linux 通用。

import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, resolve, dirname, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = resolve(HERE, '..')
const isWin = process.platform === 'win32'

const argv = process.argv.slice(2)
const argOf = (name) => {
  const i = argv.indexOf(name)
  return i >= 0 ? argv[i + 1] : null
}

const ok = (m) => console.log(`  [OK]   ${m}`)
const bad = (m) => console.log(`  [MISS] ${m}`)
const info = (m) => console.log(`  [..]   ${m}`)
const warn = (m) => console.log(`  [WARN] ${m}`)

let problems = 0

// ---------- 1. Node ----------
console.log('\n1. Node 运行时')
const major = Number(process.versions.node.split('.')[0])
if (major >= 18) ok(`node ${process.version} (${process.platform}/${process.arch})`)
else {
  bad(`node ${process.version} 版本过低，需要 >= 18`)
  problems++
}

// ---------- 2. UI Demo 模板工程 ----------
console.log('\n2. 模板工程 (UI_DEMO_ROOT)')
// 查找顺序：显式参数 > 包内 resources/ui-demo > 包内 ui-demo > 包外的 common/60/ui-demo
const candidates = [
  argOf('--ui-demo'),
  join(PKG_ROOT, 'resources', 'ui-demo'),
  join(PKG_ROOT, 'ui-demo'),
  join(PKG_ROOT, '..', 'ui-demo'),
]
const marker = ['package.json', 'scenarios', 'specs/page-template-catalog.json', 'packages/design-system/src/index.js']
let UI_DEMO_ROOT = null
for (const c of candidates) {
  if (!c) continue
  const abs = isAbsolute(c) ? c : resolve(process.cwd(), c)
  if (marker.every((m) => existsSync(join(abs, m)))) {
    UI_DEMO_ROOT = abs
    break
  }
}
if (UI_DEMO_ROOT) {
  ok(`定位到 ${UI_DEMO_ROOT}`)
} else {
  bad('没找到合格的模板工程。四件套必须具备：package.json / scenarios/ / specs/page-template-catalog.json / packages/design-system/src/index.js')
  info(`已尝试：${candidates.filter(Boolean).join(' | ')}`)
  info('用 --ui-demo <路径> 显式指定，例如 --ui-demo D:\\share\\common\\60\\ui-demo')
  problems++
}

// ---------- 3. 依赖 ----------
console.log('\n3. 工程依赖')
if (UI_DEMO_ROOT) {
  const nm = join(UI_DEMO_ROOT, 'node_modules')
  const lock = join(UI_DEMO_ROOT, 'package-lock.json')
  if (existsSync(nm)) {
    ok('node_modules 已存在')
    // esbuild 的平台二进制是否匹配（跨系统拷贝 node_modules 会失效）
    const esbuildPkg = join(nm, 'esbuild', 'package.json')
    if (existsSync(esbuildPkg)) {
      try {
        const v = JSON.parse(readFileSync(esbuildPkg, 'utf8')).version
        info(`esbuild ${v}`)
        const platDir = join(nm, `@esbuild/${process.platform === 'win32' ? 'win32-x64' : process.platform === 'darwin' ? 'darwin-arm64' : 'linux-x64'}`)
        if (!existsSync(platDir)) {
          warn('node_modules 里缺本机平台的 esbuild 二进制 —— 通常是从别的系统整包拷过来的。删掉 node_modules 后重装。')
        }
      } catch { /* 忽略 */ }
    }
  } else {
    bad('node_modules 不存在。在该目录执行：npm ci（没有 lock 时用 npm install）')
    if (!existsSync(lock)) warn('package-lock.json 也缺失')
    problems++
  }
}

// ---------- 4. 骨架尺寸真源 ----------
console.log('\n4. 骨架尺寸 tokens')
if (UI_DEMO_ROOT) {
  const tokens = join(UI_DEMO_ROOT, 'packages/design-system/src/tokens.css')
  const expect = {
    '--ds-regular-list-inset': '12px',
    '--ds-table-header-height': '40px',
    '--ds-table-row-height': '46px',
  }
  if (!existsSync(tokens)) {
    bad(`缺少 ${tokens}`)
    problems++
  } else {
    const css = readFileSync(tokens, 'utf8')
    for (const [name, want] of Object.entries(expect)) {
      const m = css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))
      if (!m) {
        bad(`${name} 未定义，应为 ${want}`)
        problems++
      } else if (m[1].trim() !== want) {
        bad(`${name} = ${m[1].trim()}，应为 ${want}`)
        problems++
      } else ok(`${name} = ${want}`)
    }
  }
}

// ---------- 5. 浏览器（出图用） ----------
console.log('\n5. 浏览器（截图与计算样式核对）')
const chromeCandidates = [
  process.env.CHROME_PATH,
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  !isWin && '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  !isWin && '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  isWin && process.env['PROGRAMFILES'] && join(process.env['PROGRAMFILES'], 'Google/Chrome/Application/chrome.exe'),
  isWin && process.env['PROGRAMFILES(X86)'] && join(process.env['PROGRAMFILES(X86)'], 'Google/Chrome/Application/chrome.exe'),
  isWin && process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
  isWin && process.env['PROGRAMFILES'] && join(process.env['PROGRAMFILES'], 'Microsoft/Edge/Application/msedge.exe'),
  isWin && process.env['PROGRAMFILES(X86)'] && join(process.env['PROGRAMFILES(X86)'], 'Microsoft/Edge/Application/msedge.exe'),
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)

let CHROME = null
for (const c of chromeCandidates) {
  try {
    if (existsSync(c) && statSync(c).isFile()) { CHROME = c; break }
  } catch { /* ignore */ }
}
if (CHROME) ok(`浏览器：${CHROME}`)
else {
  bad('没找到 Chrome / Edge。装一个，或设置环境变量 CHROME_PATH 指向 chrome.exe')
  info(isWin ? 'PowerShell: $env:CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"' : 'export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"')
  problems++
}

// ---------- 6. playwright-core ----------
console.log('\n6. playwright-core')
if (UI_DEMO_ROOT) {
  const pwPath = join(UI_DEMO_ROOT, 'node_modules', 'playwright-core')
  if (existsSync(pwPath)) ok('已安装（供 scripts/shot.mjs 使用）')
  else {
    bad('未安装。在模板工程目录执行 npm ci')
    problems++
  }
}

// ---------- 7. 端口 ----------
console.log('\n7. 预览端口')
const net = await import('node:net')
const probe = (port) => new Promise((res) => {
  const s = net.createServer()
  s.once('error', () => res(false))
  s.once('listening', () => s.close(() => res(true)))
  s.listen(port, '127.0.0.1')
})
for (const p of [8765, 8852]) {
  const free = await probe(p)
  if (free) info(`端口 ${p} 空闲（可用 node scripts/serve.mjs <目录> ${p} 启动预览）`)
  else warn(`端口 ${p} 已被占用；serve.mjs 会自动顺延到下一个可用端口`)
}

// ---------- 汇总 ----------
console.log('\n' + '-'.repeat(56))
if (problems === 0) {
  console.log('自检通过。下一步：node scripts/serve.mjs <工程目录>')
} else {
  console.log(`有 ${problems} 项需要处理，按上面的 [MISS] 逐条修。`)
  console.log('常见原因：整包从别的系统拷来 → 删 node_modules 重装；路径写错 → 用 --ui-demo 指定。')
}
console.log('')
process.exit(problems === 0 ? 0 : 1)
