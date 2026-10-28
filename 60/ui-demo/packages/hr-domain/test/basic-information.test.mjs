import assert from 'node:assert/strict'
import test from 'node:test'
import businessFieldCatalog from '../data/business-field-extensions.json' with { type: 'json' }
import {
  getBasicInformationCatalogSummary,
  getBasicInformationField,
  getFieldDictionaryBinding,
  listBasicInformationFields,
  listDictionaryValues,
  resolveDictionaryValue,
  createFieldReference,
  validateBusinessFieldDefinition,
  defineProductField,
  defineProductFieldSet,
  searchRegisteredFields,
} from '../src/basic-information.js'

test('基本信息目录完整且可按旧字段编码查询', () => {
  assert.deepEqual(getBasicInformationCatalogSummary(), {
    version: '1.0.0', fieldCount: 158, bindingCount: 77, dictionaryCount: 145, dictionarySourceRowCount: 6592, businessFieldCount: businessFieldCatalog.fields.length,
  })
  assert.equal(getBasicInformationField('ZJHM').fieldId, 'StaffBasicInformation.zjhm')
  assert.equal(getBasicInformationField('ZJHM').classification, 'restricted')
  assert.equal(listBasicInformationFields({ group: '15通讯信息' }).length, 8)
})

test('业务字段必须优先继承标准字段', () => {
  const valid = validateBusinessFieldDefinition({
    fieldId: 'Business.recruitment.applicantGender', fieldKind: 'business-extension', ownerDomain: 'recruitment',
    extends: 'StaffBasicInformation.xbdm', label: '应聘人性别', classification: 'sensitive', status: 'active',
  })
  assert.equal(valid.valid, true)
  assert.deepEqual(createFieldReference('XBDM'), { fieldRef: 'StaffBasicInformation.xbdm', businessFieldId: null })

  const duplicate = validateBusinessFieldDefinition({
    fieldId: 'Business.recruitment.genderAgain', fieldKind: 'business-specific', ownerDomain: 'recruitment',
    label: '性别', dataType: 'string', classification: 'sensitive', lifecycle: 'stored', status: 'draft',
  })
  assert.ok(duplicate.errors.some((error) => error.code === 'standard_field_exists' && error.standardFieldId === 'StaffBasicInformation.xbdm'))
})

test('产品字段默认继承标准类型、字典与分级', () => {
  assert.equal(searchRegisteredFields('性别')[0].fieldId, 'StaffBasicInformation.xbdm')
  assert.equal(searchRegisteredFields('ZJHM')[0].classification, 'restricted')

  const gender = defineProductField('XBDM', { required: true, placeholder: '请选择' })
  assert.equal(gender.fieldRef, 'StaffBasicInformation.xbdm')
  assert.equal(gender.binding.dictionaryId, 'RS.ZXBZ.XB')
  assert.deepEqual(gender.options.map((item) => item.label), ['男', '女'])
  assert.equal(gender.product.required, true)

  const organization = defineProductField('SZDWDM')
  assert.equal(organization.referenceTarget, 'Organization')
  assert.deepEqual(organization.options, [])
  assert.throws(() => defineProductField('XBDM', { dictionaryId: 'MyGender' }), /不得覆盖标准字段属性/)
  assert.throws(() => defineProductFieldSet(['XBDM', 'StaffBasicInformation.xbdm']), /重复引用/)
})

test('字段通过绑定引用唯一字典，不复制下拉项', () => {
  const binding = getFieldDictionaryBinding('XBDM')
  assert.equal(binding.dictionaryId, 'RS.ZXBZ.XB')
  assert.deepEqual(listDictionaryValues(binding.dictionaryId).map((item) => item.label), ['男', '女'])
  assert.equal(listDictionaryValues(binding.dictionaryId, { enabledOnly: false }).length, 4)
  assert.equal(resolveDictionaryValue('XBDM', '1').value.label, '男')
  assert.equal(resolveDictionaryValue('SFCYLK', '0').value.label, '否')
})

test('外部主数据和未确认字典保持显式状态', () => {
  assert.equal(getFieldDictionaryBinding('SZDWDM').target, 'Organization')
  assert.equal(getFieldDictionaryBinding('GRJSGZDM').status, 'review-required')
  assert.equal(resolveDictionaryValue('GRJSGZDM', '1').found, false)
})
