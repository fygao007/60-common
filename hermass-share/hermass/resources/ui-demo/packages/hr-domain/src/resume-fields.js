import resumeCatalog from '../data/resume-fields.json' with { type: 'json' }

const sectionsByKey = new Map(resumeCatalog.sections.map((section) => [section.sectionKey, section]))

export const RESUME_FIELD_SET_ID = resumeCatalog.resumeSetId
export const RESUME_VERSION = resumeCatalog.version

// 安全的嵌套取值（替代 lodash.get），支持 "a.b.c" 形式 path
export function resolveResumeValue(source, path) {
  if (source == null || !path) return undefined
  const segments = String(path).split('.')
  let current = source
  for (const segment of segments) {
    if (current == null) return undefined
    current = current[segment]
  }
  return current
}

// 把 startDate/endDate 组合为 "起止时间"
export function resolvePeriodValue(source, path) {
  const node = resolveResumeValue(source, path)
  if (!node) return undefined
  const start = node.startDate || node.start
  const end = node.endDate || node.end
  if (!start && !end) return undefined
  return `${start || ''} — ${end || ''}`
}

export function listResumeSections() {
  return resumeCatalog.sections
}

// 现场人事模型登记表：字段的 source 以 "model.column" 形式回指这里的 model
export function listResumeModels() {
  return resumeCatalog.models
}

export function getResumeSection(sectionKey) {
  return sectionsByKey.get(sectionKey) || null
}

export function listResumeFormFields(sectionKey) {
  const section = sectionsByKey.get(sectionKey)
  if (!section || section.kind !== 'form') return []
  return section.fields
}

export function listResumeColumns(sectionKey) {
  const section = sectionsByKey.get(sectionKey)
  if (!section || section.kind !== 'table') return []
  return section.columns
}

export function listResumeSubsections(sectionKey) {
  const section = sectionsByKey.get(sectionKey)
  if (!section || section.kind !== 'research') return []
  return section.subsections
}

export function getResumeCatalogSummary() {
  return Object.freeze({
    version: RESUME_VERSION,
    resumeSetId: RESUME_FIELD_SET_ID,
    sectionCount: resumeCatalog.sectionCount,
  })
}
