import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createCandidateConversionService,
  createEntityId,
  createLegacyIdentifier,
  createMemoryHRRepository,
  ENTITY_TYPES,
  isEntityId,
  getEntityModel,
  getFieldModel,
  listEntityModels,
  validateEntityRecord,
} from '../src/index.js'

test('领域 ID 使用规定前缀且每次随机生成', () => {
  const first = createEntityId('personId')
  const second = createEntityId('personId')
  assert.equal(isEntityId('personId', first), true)
  assert.notEqual(first, second)
  assert.throws(() => createEntityId('employeeNumber'), /未知的领域标识字段/)
})

test('外部业务编号只能作为有生效期的映射', () => {
  const mapping = createLegacyIdentifier({
    entityType: ENTITY_TYPES.PERSON,
    entityId: createEntityId('personId'),
    sourceSystem: 'legacy-staff',
    sourceKey: 'jzgbh',
    sourceValue: 'T001',
    validFrom: '2026-01-01',
  })
  assert.equal(mapping.sourceValue, 'T001')
  assert.equal(Object.isFrozen(mapping), true)
  assert.equal(isEntityId('legacyIdentifierId', mapping.legacyIdentifierId), true)
  assert.equal(validateEntityRecord(ENTITY_TYPES.LEGACY_IDENTIFIER, mapping).valid, true)
})

test('候选人完成报到后创建独立人员 ID，重复调用保持幂等', () => {
  const candidateId = createEntityId('candidateId')
  const applicationId = createEntityId('applicationId')
  const repository = createMemoryHRRepository({ candidates: [{ candidateId, name: '测试候选人' }] })
  const service = createCandidateConversionService(repository)
  const onboarding = service.initiateOnboarding({
    candidateId,
    applicationId,
    expectedDate: '2026-09-01',
    organizationId: createEntityId('organizationId'),
    positionId: createEntityId('positionId'),
    actor: 'test',
  })
  const first = service.completeOnboarding({ onboardingCaseId: onboarding.onboardingCaseId, employeeNumber: 'T001', actualDate: '2026-09-01', actor: 'test' })
  const second = service.completeOnboarding({ onboardingCaseId: onboarding.onboardingCaseId, employeeNumber: 'T001', actualDate: '2026-09-01', actor: 'test' })
  assert.equal(isEntityId('personId', first.person.personId), true)
  assert.notEqual(first.person.personId, candidateId)
  assert.equal(second.idempotent, true)
  assert.equal(second.person.personId, first.person.personId)
  assert.equal(validateEntityRecord(ENTITY_TYPES.PERSON, first.person).valid, true)
  assert.equal(validateEntityRecord(ENTITY_TYPES.ONBOARDING_CASE, first.onboardingCase).valid, true)
})

test('模型库可按实体、领域和字段查询', () => {
  assert.equal(listEntityModels().length, 23)
  assert.ok(listEntityModels({ domain: 'recruitment' }).length >= 4)
  assert.equal(getEntityModel('Person').identifier, 'personId')
  assert.equal(getFieldModel('Person', 'employeeNumber').classification, 'sensitive')
  assert.equal(getFieldModel('PersonIdentity', 'documentNumber').searchable, 'exact-encrypted')
})

test('教学档案目录是实体视图而不是私有字段集合', () => {
  assert.equal(getEntityModel('TeachingAssignment').fields.find((field) => field.id === 'personId').target, 'Person')
  assert.equal(getEntityModel('CoursePortfolio').fields.find((field) => field.id === 'teachingAssignmentId').target, 'TeachingAssignment')
  assert.equal(getEntityModel('ProfessionalAppointment').description.includes('不替代校内 EmploymentAssignment'), true)
  assert.equal(getFieldModel('PortfolioReview', 'decision').mutable, false)
  assert.equal(getFieldModel('TeachingAchievement', 'achievementType').vocabulary, 'TeachingAchievementType')
})

test('记录校验报告必填、引用和未知字段错误', () => {
  const result = validateEntityRecord('EmploymentAssignment', {
    assignmentId: createEntityId('assignmentId'),
    personId: 'T001',
    organizationId: createEntityId('organizationId'),
    positionId: createEntityId('positionId'),
    assignmentType: '主要岗位',
    isPrimary: true,
    validFrom: '2026-09-01',
    assignmentStatus: '在任聘',
    legacyName: '不允许的私有字段',
  })
  assert.equal(result.valid, false)
  assert.ok(result.errors.some((item) => item.code === 'invalid_reference' && item.field === 'personId'))
  assert.ok(result.errors.some((item) => item.code === 'unknown_field' && item.field === 'legacyName'))
})
