import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { collectFiles, createBundleKeyResolver, createFileReader, isStrictContractFamily } from './page-files.mjs'

test('页面命名、契约识别和缓存保留原有边界', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'page-files-'))
  try {
    const demos = path.join(root, 'demos')
    const files = {
      'demos/a/detail.page.jsx': "export const PAGE_GENERATION_CONTRACT = 'v1'",
      'demos/a/detail.css': '',
      'demos/b/detail.page.jsx': '旧页面',
      'demos/b/detail.html': '<main />',
      'demos/b/detail.css': '',
      'demos/a/home.html': '<main data-generated-page-contract="v1" />',
      'demos/a/home.css': '',
      'demos/a/unique.page.jsx': '',
      'charts/unique.page.jsx': '',
    }
    for (const [name, source] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
      fs.writeFileSync(path.join(root, name), source)
    }
    const all = collectFiles(demos)
    assert.equal(all.length, 8)
    const entries = all.filter((file) => file.endsWith('.page.jsx'))
    const key = createBundleKeyResolver(entries, demos)
    assert.equal(key(path.join(demos, 'a/detail.page.jsx')), 'a/detail')
    assert.equal(key(path.join(demos, 'b/detail.page.jsx')), 'b/detail')
    assert.equal(key(path.join(demos, 'a/unique.page.jsx')), 'unique')
    assert.equal(key(path.join(demos, 'missing.page.jsx')), 'missing')
    const chart = path.join(root, 'charts/unique.page.jsx')
    const buildKey = createBundleKeyResolver([...entries, chart], demos)
    assert.equal(buildKey(chart), '../charts/unique')
    assert.equal(buildKey(path.join(demos, 'a/unique.page.jsx')), 'a/unique')
    const read = createFileReader()
    assert.equal(isStrictContractFamily(path.join(demos, 'a/detail.css'), read), true)
    assert.equal(isStrictContractFamily(path.join(demos, 'a/home.css'), read), true)
    assert.equal(isStrictContractFamily(path.join(demos, 'b/detail.css'), read), false)
    const legacy = path.join(demos, 'b/detail.page.jsx')
    assert.deepEqual(read(legacy), Buffer.from('旧页面'))
    fs.writeFileSync(legacy, '已修改')
    assert.equal(read(legacy, 'utf8'), '旧页面')
    assert.equal(createFileReader()(legacy, 'utf8'), '已修改')
    assert.throws(() => read(path.join(root, 'missing')), { code: 'ENOENT' })
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
