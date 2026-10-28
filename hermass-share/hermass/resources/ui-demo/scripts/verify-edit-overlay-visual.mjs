import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import pixelmatch from 'pixelmatch'
import { chromium } from 'playwright-core'
import { PNG } from 'pngjs'

const directory = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(directory, '..')
const manifest = JSON.parse(fs.readFileSync(
  path.join(root, 'packages/design-system/specs/edit-overlay-templates.json'),
  'utf8'
))
const updateBaselines = process.argv.includes('--update')
const baselineDirectory = path.join(root, 'tests/visual-baselines/edit-overlays')
const diffDirectory = path.join(os.tmpdir(), 'wisedu-edit-overlay-diffs')
const errors = []

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean)
  return candidates.find((candidate) => fs.existsSync(candidate))
}

function assertNear(actual, expected, label, tolerance = 1) {
  if (Math.abs(actual - expected) > tolerance) {
    errors.push(`${label}: expected ${expected}, received ${actual}`)
  }
}

function assert(condition, message) {
  if (!condition) errors.push(message)
}

function compareScreenshot(name, buffer) {
  fs.mkdirSync(baselineDirectory, { recursive: true })
  const baselinePath = path.join(baselineDirectory, `${name}.png`)
  if (updateBaselines) {
    fs.writeFileSync(baselinePath, buffer)
    console.log(`Updated baseline: ${path.relative(root, baselinePath)}`)
    return
  }
  if (!fs.existsSync(baselinePath)) {
    errors.push(`${name}: baseline is missing; run npm run test:edit-overlays:update after design review`)
    return
  }

  const actual = PNG.sync.read(buffer)
  const expected = PNG.sync.read(fs.readFileSync(baselinePath))
  if (actual.width !== expected.width || actual.height !== expected.height) {
    errors.push(`${name}: screenshot dimensions changed from ${expected.width}x${expected.height} to ${actual.width}x${actual.height}`)
    return
  }

  const diff = new PNG({ width: actual.width, height: actual.height })
  const mismatch = pixelmatch(
    expected.data,
    actual.data,
    diff.data,
    actual.width,
    actual.height,
    { threshold: manifest.visualRegression.pixelThreshold }
  )
  const ratio = mismatch / (actual.width * actual.height)
  if (ratio > manifest.visualRegression.maxMismatchRatio) {
    fs.mkdirSync(diffDirectory, { recursive: true })
    const diffPath = path.join(diffDirectory, `${name}.png`)
    fs.writeFileSync(diffPath, PNG.sync.write(diff))
    errors.push(`${name}: visual mismatch ${(ratio * 100).toFixed(2)}%, diff ${diffPath}`)
  }
}

const chromePath = findChrome()
if (!chromePath) {
  console.error('Chrome executable not found. Set CHROME_PATH to run visual regression tests.')
  process.exit(1)
}

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
})
const page = await browser.newPage({
  viewport: {
    width: manifest.visualRegression.desktopViewport[0],
    height: manifest.visualRegression.desktopViewport[1],
  },
})
const consoleErrors = []
page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') {
    consoleErrors.push(`${message.type()}: ${message.text()}`)
  }
})
page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`))

const pageUrl = pathToFileURL(path.join(root, 'components/edit-overlay-templates.html')).href
await page.goto(pageUrl)
await page.addStyleTag({
  content: '*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;caret-color:transparent!important}',
})
await page.locator('[data-preview-trigger="single"]').waitFor()

async function openTemplate(kind) {
  await page.locator(`[data-preview-trigger="${kind}"]`).click()
  const selector = kind === 'drawer'
    ? '[data-template-kind="grouped-drawer"]'
    : `[data-template-kind="${kind}-modal"]`
  const surface = page.locator(selector)
  await surface.waitFor()
  return surface
}

const singleTrigger = page.locator('[data-preview-trigger="single"]')
const single = await openTemplate('single')
const singleBox = await single.boundingBox()
assertNear(singleBox.width, manifest.templates.singleModal.width, 'single modal width')
assertNear(singleBox.height, manifest.templates.singleModal.height, 'single modal height')
const singleMetrics = await single.evaluate((element) => {
  const header = element.querySelector('.ds-modal__header')
  const body = element.querySelector('.ds-modal__body')
  const footer = element.querySelector('.ds-modal__footer')
  const label = element.querySelector('.ds-edit-field__label')
  const field = element.querySelector('.ds-edit-field')
  const control = element.querySelector('.ds-input')
  return {
    header: header.getBoundingClientRect().height,
    footer: footer.getBoundingClientRect().height,
    paddingLeft: Number.parseFloat(getComputedStyle(body).paddingLeft),
    label: label.getBoundingClientRect().width,
    fieldGap: Number.parseFloat(getComputedStyle(field).columnGap),
    control: control.getBoundingClientRect().height,
    fieldHeights: [...element.querySelectorAll('.ds-edit-field')].map((item) => item.getBoundingClientRect().height),
    scrollHeight: body.scrollHeight,
    clientHeight: body.clientHeight,
  }
})
assertNear(singleMetrics.header, manifest.shared.headerHeight, 'single header height')
assertNear(singleMetrics.footer, manifest.shared.footerHeight, 'single footer height')
assertNear(singleMetrics.paddingLeft, manifest.shared.surfacePaddingX, 'single body padding')
assertNear(singleMetrics.label, manifest.shared.labelWidth, 'single label width')
assertNear(singleMetrics.fieldGap, manifest.shared.labelControlGap, 'single field gap')
assertNear(singleMetrics.control, manifest.shared.controlHeight, 'single control height')
assert(
  singleMetrics.scrollHeight === singleMetrics.clientHeight,
  `single modal should not have incidental body scroll (${singleMetrics.scrollHeight}/${singleMetrics.clientHeight}; fields ${singleMetrics.fieldHeights.join(',')})`
)
compareScreenshot('single-modal', await single.screenshot())
await page.keyboard.press('Escape')
assert(await singleTrigger.evaluate((element) => document.activeElement === element), 'single modal must restore trigger focus')

const loadingSingle = await openTemplate('single')
await loadingSingle.locator('.ds-button--primary').click()
assert(
  !(await loadingSingle.locator('.ds-modal__close').isEnabled()),
  'submitting must disable the modal close button'
)
assert(
  !(await loadingSingle.locator('.ds-button--default').isEnabled()),
  'submitting must disable the modal cancel button'
)
await page.waitForTimeout(900)
assert(!(await loadingSingle.isVisible()), 'modal must close after successful submit')

const double = await openTemplate('double')
const doubleBox = await double.boundingBox()
assertNear(doubleBox.width, manifest.templates.doubleModal.width, 'double modal width')
assertNear(doubleBox.height, manifest.templates.doubleModal.height, 'double modal height')
const doubleMetrics = await double.evaluate((element) => {
  const fields = [...element.querySelectorAll('.ds-edit-field')].slice(0, 2).map((field) => field.getBoundingClientRect())
  const grid = element.querySelector('.ds-edit-form__grid')
  const body = element.querySelector('.ds-modal__body')
  return {
    firstWidth: fields[0].width,
    secondWidth: fields[1].width,
    sameRow: Math.abs(fields[0].top - fields[1].top) < 1,
    columnGap: Number.parseFloat(getComputedStyle(grid).columnGap),
    fieldHeights: [...element.querySelectorAll('.ds-edit-field')].map((item) => item.getBoundingClientRect().height),
    scrollHeight: body.scrollHeight,
    clientHeight: body.clientHeight,
  }
})
assert(doubleMetrics.sameRow, 'double modal must render two columns at desktop width')
assertNear(doubleMetrics.firstWidth, 421, 'double first column width')
assertNear(doubleMetrics.secondWidth, 421, 'double second column width')
assertNear(doubleMetrics.columnGap, manifest.shared.fieldGap, 'double column gap')
assert(
  doubleMetrics.scrollHeight === doubleMetrics.clientHeight,
  `double modal should not have incidental body scroll (${doubleMetrics.scrollHeight}/${doubleMetrics.clientHeight}; fields ${doubleMetrics.fieldHeights.join(',')})`
)
compareScreenshot('double-modal', await double.screenshot())
await page.keyboard.press('Escape')

const drawerTrigger = page.locator('[data-preview-trigger="drawer"]')
const drawer = await openTemplate('drawer')
const drawerBox = await drawer.boundingBox()
assertNear(drawerBox.width, manifest.templates.groupedDrawer.width, 'grouped drawer width')
const drawerMetrics = await drawer.evaluate((element) => {
  const header = element.querySelector('.ds-drawer__header')
  const body = element.querySelector('.ds-drawer__body')
  const footer = element.querySelector('.ds-drawer__footer')
  const groups = [...element.querySelectorAll('.ds-form-group')].map((group) => group.getBoundingClientRect())
  const title = element.querySelector('.ds-group-title')
  return {
    header: header.getBoundingClientRect().height,
    footer: footer.getBoundingClientRect().height,
    paddingLeft: Number.parseFloat(getComputedStyle(body).paddingLeft),
    groupGap: groups[1].top - groups[0].bottom,
    titleHeight: title.getBoundingClientRect().height,
  }
})
assertNear(drawerMetrics.header, manifest.shared.headerHeight, 'drawer header height')
assertNear(drawerMetrics.footer, manifest.shared.footerHeight, 'drawer footer height')
assertNear(drawerMetrics.paddingLeft, manifest.shared.surfacePaddingX, 'drawer body padding')
assertNear(drawerMetrics.groupGap, manifest.templates.groupedDrawer.groupGap, 'drawer group gap')
assertNear(drawerMetrics.titleHeight, manifest.templates.groupedDrawer.groupTitleHeight, 'drawer group title height')
compareScreenshot('grouped-drawer', await drawer.screenshot())
await page.keyboard.press('Shift+Tab')
assert(
  await page.locator('[data-template-kind="grouped-drawer"] .ds-button--primary').evaluate((element) => document.activeElement === element),
  'drawer focus trap must wrap from close to primary action'
)
await page.keyboard.press('Escape')
assert(await drawerTrigger.evaluate((element) => document.activeElement === element), 'drawer must restore trigger focus')

const maskDrawer = await openTemplate('drawer')
await page.mouse.click(20, 400)
assert(!(await maskDrawer.isVisible()), 'drawer mask click must close the drawer')
await page.waitForTimeout(50)
const maskFocus = await drawerTrigger.evaluate((element) => ({
  restored: document.activeElement === element,
  activeTag: document.activeElement?.tagName,
  activeText: document.activeElement?.textContent,
}))
assert(
  maskFocus.restored,
  `mask close must restore drawer trigger focus (active ${maskFocus.activeTag}: ${maskFocus.activeText})`
)

await page.setViewportSize({
  width: manifest.visualRegression.responsiveViewport[0],
  height: manifest.visualRegression.responsiveViewport[1],
})
const responsiveDouble = await openTemplate('double')
const responsiveMetrics = await responsiveDouble.evaluate((element) => {
  const fields = [...element.querySelectorAll('.ds-edit-field')].slice(0, 2).map((field) => field.getBoundingClientRect())
  const body = element.querySelector('.ds-modal__body')
  return {
    sameRow: Math.abs(fields[0].top - fields[1].top) < 1,
    firstWidth: fields[0].width,
    secondWidth: fields[1].width,
    bodyScrollable: body.scrollHeight > body.clientHeight,
  }
})
assert(!responsiveMetrics.sameRow, 'double modal must collapse to one column in responsive viewport')
assert(responsiveMetrics.bodyScrollable, 'collapsed double modal must scroll only the body')
compareScreenshot('double-modal-responsive', await responsiveDouble.screenshot())
await page.keyboard.press('Escape')

assert(consoleErrors.length === 0, `browser console errors: ${consoleErrors.join(' | ')}`)
await browser.close()

if (errors.length) {
  console.error(`Edit overlay visual verification failed (${errors.length}):`)
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log(`Edit overlay visual verification passed${updateBaselines ? ' and baselines were updated' : ''}.`)
}
