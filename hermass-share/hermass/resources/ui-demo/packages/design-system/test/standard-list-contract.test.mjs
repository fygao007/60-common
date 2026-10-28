import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveStandardListConfig } from '../src/RegularListTemplate/standard-list-contract.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { checkStandardListEntry } from '../../../scripts/standard-list-entry-contract.mjs'

const config = () => ({ filterProps: { fields: [] }, tableProps: { columns: [{ fieldRef: 'StaffBasicInformation.name', key: 'name', title: '姓名' }], data: [] }, pagination: { total: 0, current: 1, pageSize: 10 } })

test('严格列表自动应用宽度和固定布局，不添加样例业务内容', () => {
  const resolved = resolveStandardListConfig(config())
  assert.equal(resolved.tableProps.columns[0].width, 196)
  assert.equal(resolved.inset, 12)
  assert.equal(resolved.toolbarGap, 8)
  assert.deepEqual(resolved.tableProps.actions, [])
  assert.deepEqual(resolved.tabs, [])
})

test('阻止布局覆盖、过窄列、未登记类型和无引用字段', () => {
  assert.throws(() => resolveStandardListConfig({ ...config(), inset: 0 }), /未登记/)
  for (const column of [{ width: 100 }, { displayType: 'invented' }, { fieldRef: '' }]) {
    const value = config()
    Object.assign(value.tableProps.columns[0], column)
    assert.throws(() => resolveStandardListConfig(value))
  }
})

test('原模板参考页通过，增加自由布局会被拦截', () => {
  const root = path.resolve(import.meta.dirname, '../../..')
  const file = path.join(root, 'scenarios/szd-standard-list-page.page.jsx')
  const source = fs.readFileSync(file, 'utf8')
  assert.equal(checkStandardListEntry(root, file, source), true)
  assert.equal(checkStandardListEntry(root, file, source.replace('<DSStandardListTemplate', '<div>额外内容</div><DSStandardListTemplate')), false)
})
