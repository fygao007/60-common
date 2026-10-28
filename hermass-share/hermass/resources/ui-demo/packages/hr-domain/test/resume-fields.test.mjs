import assert from 'node:assert'
import test from 'node:test'
import {
  RESUME_FIELD_SET_ID, RESUME_VERSION,
  listResumeSections, getResumeSection,
  listResumeFormFields, listResumeColumns, listResumeSubsections, listResumeModels,
  resolveResumeValue, resolvePeriodValue,
} from '../src/resume-fields.js'

test('简历表库元数据正确', () => {
  assert.strictEqual(RESUME_FIELD_SET_ID, 'ApplicantResume')
  assert.strictEqual(RESUME_VERSION, '1.2.0')
  assert.strictEqual(listResumeSections().length, 13)
})

test('基础信息分区包含姓名、身份证等字段', () => {
  const fields = listResumeFormFields('basic')
  const labels = fields.map((f) => f.label)
  assert.ok(labels.includes('姓名'))
  assert.ok(labels.includes('身份证号'))
  assert.ok(labels.includes('联系电话'))
})

test('学历学位分区是表格，包含学历层次/学校/专业等列', () => {
  const section = getResumeSection('education')
  assert.strictEqual(section.kind, 'table')
  const titles = listResumeColumns('education').map((c) => c.title)
  assert.ok(titles.includes('学历层次'))
  assert.ok(titles.includes('学校'))
  assert.ok(titles.includes('专业'))
})

test('科研与业绩成果包含 5 个子表', () => {
  const subs = listResumeSubsections('research')
  assert.strictEqual(subs.length, 5)
  assert.ok(subs.some((s) => s.key === 'papers'))
  assert.ok(subs.some((s) => s.key === 'patents'))
})

test('每个字段的 source 都指向已声明的现场模型列', () => {
  const models = Object.keys(listResumeModels())
  const sources = []
  const collect = (entries = []) => entries.forEach((e) => { if (e.source) sources.push(e.source) })
  for (const section of listResumeSections()) {
    collect(section.fields)
    collect(section.columns)
    for (const sub of section.subsections || []) collect(sub.columns)
  }
  assert.ok(sources.length > 0)
  for (const source of sources) {
    // 形如 "model.col" / "model.col1,col2" / "modelA.col|modelB.col"（横纵向项目双源）
    for (const part of source.split('|')) {
      const model = part.split('.')[0]
      assert.ok(models.includes(model), `source「${source}」引用了未声明的模型 ${model}`)
    }
  }
})

test('resolveResumeValue 支持嵌套 path', () => {
  const source = { basic: { name: '张三', phone: '13800138000' } }
  assert.strictEqual(resolveResumeValue(source, 'basic.name'), '张三')
  assert.strictEqual(resolveResumeValue(source, 'basic.missing'), undefined)
})

test('resolvePeriodValue 组合起止时间', () => {
  const source = { work: { startDate: '2019-07', endDate: '2022-06' } }
  assert.strictEqual(resolvePeriodValue(source, 'work'), '2019-07 — 2022-06')
})
