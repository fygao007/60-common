export const ID_RULE_VERSION = '1.0.0'

export const ID_PREFIXES = Object.freeze({
  personId: 'per',
  identityId: 'pid',
  candidateId: 'can',
  organizationId: 'org',
  positionId: 'pos',
  slotId: 'slot',
  assignmentId: 'asg',
  recruitmentPlanId: 'rpl',
  recruitmentPositionId: 'rps',
  applicationId: 'app',
  onboardingCaseId: 'onb',
  contractId: 'con',
  courseId: 'crs',
  teachingAssignmentId: 'tas',
  coursePortfolioId: 'cpf',
  enterprisePracticeId: 'epr',
  achievementId: 'ach',
  trainingExperienceId: 'trn',
  professionalAppointmentId: 'pat',
  portfolioSubmissionId: 'psb',
  portfolioReviewId: 'prv',
  legacyIdentifierId: 'lid',
  eventId: 'evt',
})

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function randomUuid() {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error('当前运行环境不支持 crypto.randomUUID，领域 ID 必须由可信服务生成')
  }
  return globalThis.crypto.randomUUID()
}

export function createEntityId(idField) {
  const prefix = ID_PREFIXES[idField]
  if (!prefix) throw new Error(`未知的领域标识字段：${idField}`)
  return `${prefix}_${randomUuid()}`
}

export function isEntityId(idField, value) {
  const prefix = ID_PREFIXES[idField]
  if (!prefix || typeof value !== 'string') return false
  const [actualPrefix, uuid, extra] = value.split('_')
  return !extra && actualPrefix === prefix && UUID_PATTERN.test(uuid)
}

export function assertEntityId(idField, value) {
  if (!isEntityId(idField, value)) throw new Error(`${idField} 不符合 ${ID_RULE_VERSION} 标识规则`)
  return value
}

export function createLegacyIdentifier({ entityType, entityId, sourceSystem, sourceKey, sourceValue, validFrom, validTo = null }) {
  if (![entityType, entityId, sourceSystem, sourceKey, sourceValue, validFrom].every(Boolean)) {
    throw new Error('LegacyIdentifier 缺少必填字段')
  }
  return Object.freeze({
    legacyIdentifierId: createEntityId('legacyIdentifierId'),
    entityType,
    entityId,
    sourceSystem,
    sourceKey,
    sourceValue: String(sourceValue),
    validFrom,
    validTo,
  })
}
