import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

test('只读表单支持三列字段布局', () => {
  const root = path.resolve(import.meta.dirname, '../../..')
  const component = fs.readFileSync(path.join(root, 'packages/design-system/src/ReadOnlyForm/index.jsx'), 'utf8')
  const styles = fs.readFileSync(path.join(root, 'packages/design-system/src/ReadOnlyForm/index.css'), 'utf8')
  assert.match(component, /\[1, 2, 3\]\.includes\(Number\(columns\)\)/)
  assert.match(styles, /\.ds-readonly-form--3-column \.ds-readonly-form__grid/)
})
