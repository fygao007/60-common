import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(directory, '..')
const manifest = JSON.parse(fs.readFileSync(
  path.join(root, 'packages/design-system/specs/edit-overlay-templates.json'),
  'utf8'
))
const scanDirectories = ['components', 'scenarios', 'demos']
const extensions = new Set(['.html', '.jsx', '.js', '.css'])
const legacyAllowlist = new Set([
  'components/modal-components.html',
  'demos/recruitment/hr/plan-audit/audit-detail/audit-detail.css',
  'demos/recruitment/hr/plan-declare-scheme/plan-declare-scheme.css',
  'demos/recruitment/hr/plan-manage/plan-apply/plan-apply.css',
  'demos/recruitment/hr/plan-manage/plan-initiate/plan-initiate.css',
  'demos/recruitment/hr/plan-manage/plan-initiate-detail/plan-initiate-detail.css',
  'demos/recruitment/hr/position/position.css',
  'demos/recruitment/hr/position-adjust/position-adjust.css',
  'demos/recruitment/hr/position-req-dict/position-req-dict.css',
  'demos/recruitment/hr/process-audit/process-audit.css',
  'demos/recruitment/hr/recruit-type/recruit-type.css',
  'demos/recruitment/hr/website/website.css',
  'demos/recruitment/hr/website-config/website-config.css',
  'demos/teaching-portfolio/chief/c-review/c-review.css',
  'demos/teaching-portfolio/chief/c-review/c-review.html',
  'demos/teaching-portfolio/dean/portfolio-detail/portfolio-detail.css',
  'demos/teaching-portfolio/dean/r-review/r-review.css',
  'demos/teaching-portfolio/major/portfolio-detail/portfolio-detail.css',
  'demos/teaching-portfolio/sys/batch-publish/batch-publish.css',
  'demos/teaching-portfolio/sys/form-management/form-management.css',
])
const errors = []

function collectFiles(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(folder, entry.name)
    if (entry.isDirectory() && entry.name === '.workbuddy') return []
    if (entry.isDirectory()) return collectFiles(target)
    if (/\.bundle\.(?:js|css)$/.test(entry.name)) return []
    return extensions.has(path.extname(entry.name)) ? [target] : []
  })
}

for (const folder of scanDirectories) {
  const folderPath = path.join(root, folder)
  for (const file of collectFiles(folderPath)) {
    const relative = path.relative(root, file)
    if (legacyAllowlist.has(relative)) continue
    const source = fs.readFileSync(file, 'utf8')
    const matches = manifest.generation.forbiddenPageSelectors
      .filter((selector) => source.includes(selector))
    if (matches.length) {
      errors.push(`${relative}: ${matches.join(', ')}`)
    }
  }
}

if (errors.length) {
  console.error('New pages must use scene-level overlay components instead of internal selectors:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log('No new page copies edit overlay internals.')
}
