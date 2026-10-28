import esbuild from 'esbuild'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

// ROOT 由脚本位置推导：<ui-demo>/scripts/build-recruit-page.mjs → <ui-demo>
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const page = process.argv[2]
const versionSuffix = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : ''
const pageDirMode = process.argv.includes('--page-dir')

if (!page) {
  console.error('Usage: node scripts/build-recruit-page.mjs <page> [versionSuffix] [--page-dir]')
  process.exit(1)
}

// 入口查找：先按 hr/<page>/<page>.page.jsx，找不到再在 hr/ 下递归找同名页面（支持嵌套目录）
const HR_DIR = path.join(ROOT, 'demos/recruitment/hr')
const findEntry = (dir) => {
  const direct = path.join(dir, `${page}.page.jsx`)
  if (fs.existsSync(direct)) return direct
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!item.isDirectory()) continue
    const found = findEntry(path.join(dir, item.name))
    if (found) return found
  }
  return null
}

const entry = findEntry(HR_DIR)
if (!entry) {
  console.error(`Entry not found for page "${page}" under ${HR_DIR}`)
  process.exit(1)
}

const baseName = versionSuffix ? `${page}.${versionSuffix}.bundle` : `${page}.bundle`
const outdir = pageDirMode ? path.dirname(entry) : path.join(ROOT, 'assets/bundles/pages')

const commonAlias = {
  '@wisedu/design-system': path.join(ROOT, 'packages/design-system/src/index.js'),
  '@wisedu/hr-domain': path.join(ROOT, 'packages/hr-domain/src/index.js'),
  '@wisedu/hr-domain/resume-fields': path.join(ROOT, 'packages/hr-domain/src/resume-fields.js'),
  '@wisedu/shared-pages': path.join(ROOT, 'packages/shared-pages/src/index.js'),
}

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: 'iife',
  minify: true,
  loader: {
    '.jsx': 'jsx',
    '.css': 'css',
    '.svg': 'dataurl',
    '.png': 'dataurl',
    '.jpg': 'dataurl',
    '.gif': 'dataurl',
    '.webp': 'dataurl',
    '.woff': 'dataurl',
    '.woff2': 'dataurl',
    '.ttf': 'dataurl',
  },
  jsx: 'automatic',
  outdir,
  entryNames: baseName,
  alias: commonAlias,
})

console.log(`entry: ${entry}`)
console.log(`${page} bundle built: ${path.join(outdir, baseName + '.js')}`)
