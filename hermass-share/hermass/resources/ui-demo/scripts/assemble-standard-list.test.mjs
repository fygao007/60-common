import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

test('装配固定骨架、拒绝覆盖、检测结构偏离和过期上下文', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hermass-assembly-'))
  const repository = path.resolve(import.meta.dirname, '..')
  for (const folder of ['scripts', 'specs', 'demos', 'templates/react-business-page', 'ontology/product-world/scenarios']) fs.mkdirSync(path.join(root, folder), { recursive: true })
  for (const file of ['scripts/assemble-standard-list.mjs', 'scripts/page-files.mjs', 'specs/page-template-catalog.json', 'templates/react-business-page/standard-list.page.jsx.template']) fs.copyFileSync(path.join(repository, file), path.join(root, file))
  const page = { templateId: 'standard-list-root', title: '人员列表', demoPath: 'demos/test/staff/staff.html', fieldRefs: ['StaffBasicInformation.xm'] }
  const source = 'ontology/product-world/scenarios/test.json'
  fs.writeFileSync(path.join(root, source), JSON.stringify({ id: 'test', version: 1, page }))
  const context = { generatedFrom: source, scenarioId: 'test', version: 1, page }
  fs.writeFileSync(path.join(root, 'context.json'), JSON.stringify(context))
  const run = (...args) => spawnSync(process.execPath, ['scripts/assemble-standard-list.mjs', 'context.json', ...args], { cwd: root, encoding: 'utf8' })
  assert.equal(run().status, 0)
  assert.equal(run('--check').status, 0)
  assert.match(run().stderr, /拒绝覆盖/)
  const entry = path.join(root, 'demos/test/staff/staff.page.jsx')
  fs.appendFileSync(entry, '\nconst extraLayout = true\n')
  assert.match(run('--check').stderr, /模板骨架被修改/)
  context.version = 2
  fs.writeFileSync(path.join(root, 'context.json'), JSON.stringify(context))
  assert.match(run('--check').stderr, /上下文与场景不一致/)
  fs.rmSync(root, { recursive: true })
})
