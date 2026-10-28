export * from './contracts.js'
export * from './privacy.js'
export * from './identifiers.js'
export * from './entity-models.js'
export * from './basic-information.js'
export * from './resume-fields.js'

import { assertRequired, createEvent, ENTITY_TYPES, EVENT_TYPES, ONBOARDING_STATUS } from './contracts.js'
import { assertEntityId, createEntityId } from './identifiers.js'

export function createMemoryHRRepository(seed = {}) {
  const state = {
    persons: [...(seed.persons || [])],
    candidates: [...(seed.candidates || [])],
    organizations: [...(seed.organizations || [])],
    positions: [...(seed.positions || [])],
    assignments: [...(seed.assignments || [])],
    onboardingCases: [...(seed.onboardingCases || [])],
    events: [...(seed.events || [])],
  }

  const repository = {
    list(type) {
      const map = {
        [ENTITY_TYPES.PERSON]: 'persons',
        [ENTITY_TYPES.CANDIDATE]: 'candidates',
        [ENTITY_TYPES.ORGANIZATION]: 'organizations',
        [ENTITY_TYPES.POSITION]: 'positions',
        [ENTITY_TYPES.ASSIGNMENT]: 'assignments',
        [ENTITY_TYPES.ONBOARDING_CASE]: 'onboardingCases',
        [ENTITY_TYPES.EVENT]: 'events',
      }
      return [...(state[map[type]] || [])]
    },
    find(type, id) {
      const keys = {
        [ENTITY_TYPES.PERSON]: 'personId',
        [ENTITY_TYPES.CANDIDATE]: 'candidateId',
        [ENTITY_TYPES.ORGANIZATION]: 'organizationId',
        [ENTITY_TYPES.POSITION]: 'positionId',
        [ENTITY_TYPES.ASSIGNMENT]: 'assignmentId',
        [ENTITY_TYPES.ONBOARDING_CASE]: 'onboardingCaseId',
        [ENTITY_TYPES.EVENT]: 'eventId',
      }
      const key = keys[type]
      return key ? repository.list(type).find((item) => item[key] === id) || null : null
    },
    save(type, record) {
      const map = {
        [ENTITY_TYPES.PERSON]: ['persons', 'personId'],
        [ENTITY_TYPES.CANDIDATE]: ['candidates', 'candidateId'],
        [ENTITY_TYPES.ASSIGNMENT]: ['assignments', 'assignmentId'],
        [ENTITY_TYPES.ONBOARDING_CASE]: ['onboardingCases', 'onboardingCaseId'],
        [ENTITY_TYPES.EVENT]: ['events', 'eventId'],
      }
      const target = map[type]
      if (!target) throw new Error(`暂不支持保存实体：${type}`)
      const [collection, key] = target
      const index = state[collection].findIndex((item) => item[key] === record[key])
      if (index >= 0) state[collection][index] = record
      else state[collection].push(record)
      return record
    },
    snapshot() {
      return structuredClone(state)
    },
  }
  return repository
}

export function createCandidateConversionService(repository) {
  function recordEvent(input) {
    return repository.save(ENTITY_TYPES.EVENT, createEvent(input))
  }

  return {
    initiateOnboarding({ candidateId, applicationId, expectedDate, organizationId, positionId, actor, sourceSystem = 'recruitment' }) {
      assertRequired({ candidateId, applicationId, expectedDate, organizationId, positionId, actor }, [
        'candidateId', 'applicationId', 'expectedDate', 'organizationId', 'positionId', 'actor',
      ], 'OnboardingCase')
      assertEntityId('candidateId', candidateId)
      assertEntityId('applicationId', applicationId)
      assertEntityId('organizationId', organizationId)
      assertEntityId('positionId', positionId)
      const onboardingCase = repository.save(ENTITY_TYPES.ONBOARDING_CASE, {
        onboardingCaseId: createEntityId('onboardingCaseId'),
        candidateId,
        applicationId,
        organizationId,
        positionId,
        expectedDate,
        actualDate: null,
        onboardingStatus: ONBOARDING_STATUS.PENDING_REVIEW,
        personId: null,
      })
      recordEvent({
        eventType: EVENT_TYPES.ONBOARDING_INITIATED,
        subjectType: ENTITY_TYPES.ONBOARDING_CASE,
        subjectId: onboardingCase.onboardingCaseId,
        effectiveAt: new Date().toISOString(),
        actor,
        sourceSystem,
        sourceRecordId: applicationId,
        payload: { candidateId, organizationId, positionId },
      })
      return onboardingCase
    },

    completeOnboarding({ onboardingCaseId, employeeNumber, actualDate, actor, sourceSystem = 'onboarding' }) {
      assertEntityId('onboardingCaseId', onboardingCaseId)
      const onboardingCase = repository.find(ENTITY_TYPES.ONBOARDING_CASE, onboardingCaseId)
      if (!onboardingCase) throw new Error('未找到进校报到实例')
      assertRequired({ employeeNumber, actualDate, actor }, ['employeeNumber', 'actualDate', 'actor'], 'OnboardingCompleted')
      if (onboardingCase.personId) return { onboardingCase, person: repository.find(ENTITY_TYPES.PERSON, onboardingCase.personId), idempotent: true }

      const candidate = repository.find(ENTITY_TYPES.CANDIDATE, onboardingCase.candidateId)
      if (!candidate) throw new Error('未找到候选人')
      if (repository.list(ENTITY_TYPES.PERSON).some((item) => item.employeeNumber === employeeNumber)) {
        throw new Error('工号已关联其他人员，不能重复分配')
      }
      const createdAt = new Date().toISOString()
      const person = repository.save(ENTITY_TYPES.PERSON, {
        personId: createEntityId('personId'),
        employeeNumber,
        name: candidate.name,
        personnelCategory: candidate.personnelCategory || '专任教师',
        employmentStatus: '在职',
        originatedFromCandidateId: candidate.candidateId,
        createdAt,
        updatedAt: createdAt,
      })
      Object.assign(onboardingCase, {
        onboardingStatus: ONBOARDING_STATUS.COMPLETED,
        actualDate,
        personId: person.personId,
      })
      repository.save(ENTITY_TYPES.ONBOARDING_CASE, onboardingCase)
      repository.save(ENTITY_TYPES.CANDIDATE, { ...candidate, candidateStatus: '已转人员', personId: person.personId })
      repository.save(ENTITY_TYPES.ASSIGNMENT, {
        assignmentId: createEntityId('assignmentId'),
        personId: person.personId,
        organizationId: onboardingCase.organizationId,
        positionId: onboardingCase.positionId,
        assignmentType: '主要岗位',
        isPrimary: true,
        validFrom: actualDate,
        validTo: null,
        assignmentStatus: '在任聘',
      })

      for (const eventType of [EVENT_TYPES.ONBOARDING_COMPLETED, EVENT_TYPES.PERSON_CREATED, EVENT_TYPES.EMPLOYEE_NUMBER_ASSIGNED, EVENT_TYPES.ASSIGNMENT_STARTED]) {
        recordEvent({ eventType, subjectType: eventType === EVENT_TYPES.PERSON_CREATED ? ENTITY_TYPES.PERSON : ENTITY_TYPES.ONBOARDING_CASE, subjectId: eventType === EVENT_TYPES.PERSON_CREATED ? person.personId : onboardingCaseId, effectiveAt: actualDate, actor, sourceSystem, sourceRecordId: onboardingCase.applicationId, payload: { personId: person.personId, employeeNumber } })
      }
      return { onboardingCase, person, idempotent: false }
    },
  }
}
