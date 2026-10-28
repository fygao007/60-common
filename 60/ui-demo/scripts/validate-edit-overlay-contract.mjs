import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(directory, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const manifest = JSON.parse(read('packages/design-system/specs/edit-overlay-templates.json'))
const errors = []

function assert(condition, message) {
  if (!condition) errors.push(message)
}

const generationCheck = spawnSync(
  process.execPath,
  [path.join(directory, 'generate-edit-overlay-spec.mjs'), '--check'],
  { encoding: 'utf8' }
)

if (generationCheck.status !== 0) {
  errors.push(generationCheck.stderr.trim() || generationCheck.stdout.trim())
}

const { shared, templates, interaction, generation } = manifest
assert(shared.labelWidth === 94, 'shared.labelWidth must remain 94')
assert(shared.labelControlGap === 16, 'shared.labelControlGap must remain 16')
assert(shared.surfacePaddingX === 20, 'shared.surfacePaddingX must remain 20')
assert(shared.headerHeight === 56 && shared.footerHeight === 56, 'header and footer must remain 56')
assert(templates.singleModal.width === 600 && templates.singleModal.height === 664, 'single modal must remain 600x664')
assert(templates.doubleModal.width === 900 && templates.doubleModal.height === 520, 'double modal must remain 900x520')
assert(templates.largeModal.width === 1200 && templates.largeModal.height === 640, 'large modal must remain 1200x640')
assert(templates.wideModal.width === 900 && templates.wideModal.height === 640, 'wide modal must remain 900x640')
assert(templates.groupedDrawer.width === 600, 'grouped drawer width must remain 600')
assert(Object.values(interaction).every(Boolean), 'all required interaction guarantees must stay enabled')

const exportsSource = read('packages/design-system/src/index.js')
for (const component of [
  templates.singleModal.component,
  templates.doubleModal.component,
  templates.largeModal.component,
  templates.wideModal.component,
  templates.groupedDrawer.component,
  generation.requiredFieldComponent,
  generation.requiredGroupComponent,
]) {
  assert(exportsSource.includes(component), `${component} must be exported from src/index.js`)
}

const templateSource = read('packages/design-system/src/EditOverlayTemplates/index.jsx')
assert(templateSource.includes('EDIT_OVERLAY_SPEC'), 'scene components must read generated spec')
assert(templateSource.includes('width={singleModal.width}'), 'single modal width must be manifest-driven')
assert(templateSource.includes('height={doubleModal.height}'), 'double modal height must be manifest-driven')
assert(templateSource.includes('height={largeModal.height}'), 'large modal height must be manifest-driven')
assert(templateSource.includes('height={wideModal.height}'), 'wide modal height must be manifest-driven')
assert(templateSource.includes('width={groupedDrawer.width}'), 'grouped drawer width must be manifest-driven')

const previewHtml = read('components/edit-overlay-templates.html')
const previewSource = read('components/edit-overlay-templates.jsx')
assert(previewHtml.includes('edit-overlay-templates.bundle.js'), 'preview HTML must load the React bundle')
assert(previewHtml.includes('edit-overlay-templates.bundle.css'), 'preview HTML must load the bundled component CSS')
assert(!previewHtml.includes('ds-modal__'), 'preview HTML must not copy modal internals')
assert(!previewHtml.includes('ds-drawer__'), 'preview HTML must not copy drawer internals')
assert(previewSource.includes('<DSSingleEditModal'), 'preview must render DSSingleEditModal')
assert(previewSource.includes('<DSDoubleEditModal'), 'preview must render DSDoubleEditModal')
assert(previewSource.includes('<DSLargeModalTemplate'), 'preview must render DSLargeModalTemplate')
assert(previewSource.includes('<DSWideModalTemplate'), 'preview must render DSWideModalTemplate')
assert(previewSource.includes('<DSGroupedEditDrawer'), 'preview must render DSGroupedEditDrawer')

for (const output of [
  'assets/bundles/edit-overlay-templates.bundle.js',
  'assets/bundles/edit-overlay-templates.bundle.css',
]) {
  assert(fs.existsSync(path.join(root, output)), `${output} must be built and committed`)
}

if (errors.length) {
  console.error(`Edit overlay contract validation failed (${errors.length}):`)
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log('Edit overlay contract validation passed.')
}
