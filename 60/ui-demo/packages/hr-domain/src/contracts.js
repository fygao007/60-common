export const HR_DOMAIN_VERSION = '0.1.0'

import { createEntityId } from './identifiers.js'

export const ENTITY_TYPES = Object.freeze({
  PERSON: 'Person',
  PERSON_IDENTITY: 'PersonIdentity',
  CANDIDATE: 'Candidate',
  ORGANIZATION: 'Organization',
  POSITION: 'Position',
  POSITION_SLOT: 'PositionSlot',
  ASSIGNMENT: 'EmploymentAssignment',
  RECRUITMENT_PLAN: 'RecruitmentPlan',
  RECRUITMENT_POSITION: 'RecruitmentPosition',
  APPLICATION: 'Application',
  ONBOARDING_CASE: 'OnboardingCase',
  CONTRACT: 'Contract',
  COURSE: 'Course',
  TEACHING_ASSIGNMENT: 'TeachingAssignment',
  COURSE_PORTFOLIO: 'CoursePortfolio',
  ENTERPRISE_PRACTICE: 'EnterprisePractice',
  TEACHING_ACHIEVEMENT: 'TeachingAchievement',
  TRAINING_EXPERIENCE: 'TrainingExperience',
  PROFESSIONAL_APPOINTMENT: 'ProfessionalAppointment',
  PORTFOLIO_SUBMISSION: 'PortfolioSubmission',
  PORTFOLIO_REVIEW: 'PortfolioReview',
  LEGACY_IDENTIFIER: 'LegacyIdentifier',
  EVENT: 'HREvent',
})

export const EVENT_TYPES = Object.freeze({
  CANDIDATE_SELECTED: 'CandidateSelected',
  ONBOARDING_INITIATED: 'OnboardingInitiated',
  ONBOARDING_DEFERRED: 'OnboardingDeferred',
  ONBOARDING_WAIVED: 'OnboardingWaived',
  ONBOARDING_COMPLETED: 'OnboardingCompleted',
  PERSON_CREATED: 'PersonCreated',
  EMPLOYEE_NUMBER_ASSIGNED: 'EmployeeNumberAssigned',
  ASSIGNMENT_STARTED: 'AssignmentStarted',
})

export const ONBOARDING_STATUS = Object.freeze({
  PENDING_REVIEW: '待审核',
  PENDING_CHECKIN: '待报到',
  PROCESSING: '办理中',
  DEFERRED: '延期',
  WAIVED: '已放弃',
  COMPLETED: '已完成',
})

export function assertRequired(record, fields, entityName = 'record') {
  const missing = fields.filter((field) => record?.[field] == null || record[field] === '')
  if (missing.length) throw new Error(`${entityName} 缺少必填字段：${missing.join('、')}`)
  return record
}

export function createEvent({ eventType, subjectType, subjectId, effectiveAt, actor, sourceSystem, sourceRecordId, payload = {} }) {
  assertRequired({ eventType, subjectType, subjectId, effectiveAt, actor, sourceSystem }, [
    'eventType', 'subjectType', 'subjectId', 'effectiveAt', 'actor', 'sourceSystem',
  ], 'HREvent')
  return {
    eventId: createEntityId('eventId'),
    eventType,
    subjectType,
    subjectId,
    occurredAt: new Date().toISOString(),
    effectiveAt,
    actor,
    sourceSystem,
    sourceRecordId: sourceRecordId || null,
    payload,
  }
}
