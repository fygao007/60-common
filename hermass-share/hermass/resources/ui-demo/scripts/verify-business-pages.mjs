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
  path.join(root, 'specs/business-page-regression.json'),
  'utf8',
))
const updateBaselines = process.argv.includes('--update')
const baselineDirectory = path.join(root, 'tests/visual-baselines/business-pages')
const diffDirectory = path.join(os.tmpdir(), 'wisedu-business-page-diffs')
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

function assert(condition, message) {
  if (!condition) errors.push(message)
}

function assertNear(actual, expected, label, tolerance = 1) {
  if (Math.abs(actual - expected) > tolerance) {
    errors.push(`${label}: expected ${expected}, received ${actual}`)
  }
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
    errors.push(`${name}: baseline is missing; run npm run test:business-pages:update after design review`)
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
    { threshold: manifest.visualRegression.pixelThreshold },
  )
  const ratio = mismatch / (actual.width * actual.height)
  if (ratio > manifest.visualRegression.maxMismatchRatio) {
    fs.mkdirSync(diffDirectory, { recursive: true })
    const diffPath = path.join(diffDirectory, `${name}.png`)
    fs.writeFileSync(diffPath, PNG.sync.write(diff))
    errors.push(`${name}: visual mismatch ${(ratio * 100).toFixed(2)}%, diff ${diffPath}`)
  }
}

async function waitForStablePage(page, pageSpec) {
  await page.locator(pageSpec.rootSelector).waitFor()
  await page.evaluate(() => document.fonts?.ready)
  await page.addStyleTag({
    content: '*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;caret-color:transparent!important}',
  })
}

async function verifyFramework(page, pageSpec) {
  const metrics = await page.evaluate(() => {
    const host = document.querySelector('.frame2-stage[data-ds-page="react"]')
    const root = host.shadowRoot
    const topbar = root?.querySelector('.frame2-topbar')
    const tabsbar = root?.querySelector('.frame2-tabsbar')
    const sidebar = root?.querySelector('.frame2-sidebar')
    return {
      hasShadowRoot: Boolean(root),
      topbarHeight: topbar?.getBoundingClientRect().height,
      tabsbarHeight: tabsbar?.getBoundingClientRect().height,
      sidebarWidth: sidebar?.getBoundingClientRect().width,
      activeFeature: root?.querySelector('.frame2-side-item.is-active')?.dataset.feature,
    }
  })
  assert(metrics.hasShadowRoot, `${pageSpec.name}: Framework 2 shadow root is missing`)
  assertNear(metrics.topbarHeight, manifest.framework.topbarHeight, `${pageSpec.name}: topbar height`)
  assertNear(metrics.tabsbarHeight, manifest.framework.tabsbarHeight, `${pageSpec.name}: tabsbar height`)
  assertNear(metrics.sidebarWidth, manifest.framework.sidebarWidth, `${pageSpec.name}: sidebar width`)
  assert(metrics.activeFeature === 'tp-achievements', `${pageSpec.name}: expected tp-achievements to be active, received ${metrics.activeFeature}`)
}

async function verifyComponents(page, pageSpec) {
  for (const [selector, minimum] of Object.entries(pageSpec.requiredSelectors)) {
    const count = await page.locator(`${pageSpec.rootSelector} ${selector}`).count()
    assert(count >= minimum, `${pageSpec.name}: ${selector} expected at least ${minimum}, received ${count}`)
  }
  const copiedComponents = await page.locator(`${pageSpec.rootSelector} [class*="ap-"]`).count()
  assert(copiedComponents === 0, `${pageSpec.name}: legacy ap-* component markup is present`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  assert(overflow <= 1, `${pageSpec.name}: page has ${overflow}px horizontal overflow`)
}

async function verifyColumns(page, selector, expectedSameRow, label) {
  const boxes = await page.locator(selector).evaluateAll((elements) => (
    elements.slice(0, 2).map((element) => {
      const rect = element.getBoundingClientRect()
      return { top: rect.top, width: rect.width }
    })
  ))
  assert(boxes.length === 2, `${label}: two fields are required for column verification`)
  if (boxes.length !== 2) return
  const sameRow = Math.abs(boxes[0].top - boxes[1].top) < 1
  assert(sameRow === expectedSameRow, `${label}: expected ${expectedSameRow ? 'two' : 'one'} column layout`)
  assert(boxes.every((box) => box.width > 0), `${label}: field width must be positive`)
}

async function verifyInteractions(page, pageSpec) {
  const firstSelect = page.locator(`${pageSpec.rootSelector} .ds-select`).first()
  await firstSelect.locator('.ds-select__trigger').click()
  await page.getByRole('option', { name: pageSpec.selectOption, exact: true }).click()
  assert(
    await firstSelect.locator('.ds-select__text').textContent() === pageSpec.selectOption,
    `${pageSpec.name}: select value did not update`,
  )

  const submit = page.getByRole('button', { name: pageSpec.submitButton, exact: true })
  await submit.click()
  assert(!(await submit.isEnabled()), `${pageSpec.name}: submit button must be disabled while loading`)
  await page.getByRole('status').filter({ hasText: pageSpec.submitMessage }).waitFor()

  await page.getByRole('button', { name: pageSpec.navigationItem, exact: true }).click()
  await page.getByRole('heading', { name: pageSpec.navigationHeading, exact: true }).waitFor()
  await page.locator(`${pageSpec.rootSelector} ${pageSpec.navigationResult}`).waitFor()
}

const chromePath = findChrome()
if (!chromePath) {
  console.error('Chrome executable not found. Set CHROME_PATH to run business page regression tests.')
  process.exit(1)
}

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
})

try {
  for (const pageSpec of manifest.pages) {
    const page = await browser.newPage({
      deviceScaleFactor: 1,
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

    const pageUrl = pathToFileURL(path.join(root, pageSpec.file)).href
    await page.goto(pageUrl)
    await waitForStablePage(page, pageSpec)
    await verifyFramework(page, pageSpec)
    await verifyComponents(page, pageSpec)
    await verifyColumns(
      page,
      `${pageSpec.rootSelector} ${pageSpec.desktopColumns}`,
      true,
      `${pageSpec.name}: desktop form`,
    )
    compareScreenshot(`${pageSpec.name}-desktop`, await page.screenshot())
    await verifyInteractions(page, pageSpec)

    await page.setViewportSize({
      width: manifest.visualRegression.responsiveViewport[0],
      height: manifest.visualRegression.responsiveViewport[1],
    })
    await page.goto(pageUrl)
    await waitForStablePage(page, pageSpec)
    await verifyColumns(
      page,
      `${pageSpec.rootSelector} ${pageSpec.responsiveColumns}`,
      false,
      `${pageSpec.name}: responsive form`,
    )
    compareScreenshot(`${pageSpec.name}-responsive`, await page.screenshot())

    assert(consoleErrors.length === 0, `${pageSpec.name}: browser console errors: ${consoleErrors.join(' | ')}`)
    await page.close()
  }
} finally {
  await browser.close()
}

if (errors.length) {
  console.error(`Business page regression failed (${errors.length}):`)
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log(`Business page regression passed${updateBaselines ? ' and baselines were updated' : ''}.`)
}
