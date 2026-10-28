import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { collectFiles, createBundleKeyResolver } from './page-files.mjs'

const directory = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(directory, '..')

await build({
  entryPoints: [path.join(root, 'components/edit-overlay-templates.jsx')],
  outfile: path.join(root, 'assets/bundles/edit-overlay-templates.bundle.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  jsx: 'automatic',
  minify: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  loader: {
    '.png': 'file',
    '.svg': 'file',
  },
  assetNames: 'edit-overlay-assets/[name]-[hash]',
  legalComments: 'none',
})

const demoDirectory = path.join(root, 'demos')
const scenarioDirectory = path.join(root, 'scenarios')
// 图表规范页与组件、场景模板平级，单独放在 charts/，构建时一并扫描
const pageRoots = [demoDirectory, path.join(root, 'charts')]

const pageFiles = pageRoots.flatMap((folder) =>
  fs.existsSync(folder) ? collectFiles(folder, (target) => target.endsWith('.page.jsx')) : [],
)
const scenarioPageFiles = fs.existsSync(scenarioDirectory)
  ? collectFiles(scenarioDirectory, (target) => target.endsWith('.page.jsx'))
  : []

const bundleKeyFor = createBundleKeyResolver(pageFiles, demoDirectory)
const pageEntries = Object.fromEntries([
  ...pageFiles.map((file) => [bundleKeyFor(file), file]),
  ...scenarioPageFiles.map((file) => [path.basename(file).replace(/\.page\.jsx$/, ''), file]),
])

if (Object.keys(pageEntries).length) {
  await build({
    entryPoints: pageEntries,
    outdir: path.join(root, 'assets/bundles/pages'),
    // 冲突条目的 key 带有 "目录/文件名"，[dir] 让 esbuild 把它们输出到对应子目录，
    // 避免与 [name] 只取末段文件名导致的同名覆盖。
    entryNames: '[dir]/[name].bundle',
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    jsx: 'automatic',
    minify: true,
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    alias: {
      '@wisedu/design-system': path.join(root, 'packages/design-system/src/index.js'),
      '@wisedu/hr-domain': path.join(root, 'packages/hr-domain/src/index.js'),
      '@wisedu/hr-domain/basic-information': path.join(root, 'packages/hr-domain/src/basic-information.js'),
      '@wisedu/hr-domain/models': path.join(root, 'packages/hr-domain/src/entity-models.js'),
      '@wisedu/hr-domain/fields': path.join(root, 'packages/hr-domain/src/field-registry.js'),
      '@wisedu/hr-domain/resume-fields': path.join(root, 'packages/hr-domain/src/resume-fields.js'),
      '@wisedu/shared-pages': path.join(root, 'packages/shared-pages/src/index.js'),
    },
    loader: {
      '.png': 'file',
      // 业务页与 bundle 不同目录，file loader 的相对路径按页面 URL 解析会 404，svg 需内联
      '.svg': 'dataurl',
    },
    assetNames: 'page-assets/[name]-[hash]',
    legalComments: 'none',
  })

  // 部分历史 Demo 的 HTML 仍引用带版本号的 bundle 文件名（例如
  // plan-audit.v9.bundle.js），而 esbuild 只会更新无版本号的标准产物。
  // 构建后同步这些兼容别名，避免页面继续加载旧 bundle、看不到公共组件更新。
  const htmlFiles = collectFiles(demoDirectory, (target) => target.endsWith('.html'))
  const versionedBundlePattern = /assets\/bundles\/pages\/([^"'?]+?)\.v\d+\.bundle\.(js|css)/g
  const bundleDirectory = path.join(root, 'assets/bundles/pages')

  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(htmlFile, 'utf8')
    for (const match of html.matchAll(versionedBundlePattern)) {
      const [, bundleName, extension] = match
      const source = path.join(bundleDirectory, `${bundleName}.bundle.${extension}`)
      const alias = path.join(bundleDirectory, match[0].split('/').at(-1))
      if (fs.existsSync(source)) fs.copyFileSync(source, alias)
    }
  }
}

console.log(`Built React previews and ${Object.keys(pageEntries).length} business page bundle(s).`)
