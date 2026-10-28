import RecruitmentResumePage from './recruitment-resume/RecruitmentResumePage.jsx'

const definitions = new Map()

export function defineSharedPage(definition) {
  if (!definition?.id || !definition?.Component) throw new Error('公共页面必须声明 id 和 Component')
  if (definitions.has(definition.id)) throw new Error(`公共页面重复注册：${definition.id}`)
  const normalized = Object.freeze({
    ...definition,
    allowedExtensions: Object.freeze([...(definition.allowedExtensions || [])]),
  })
  definitions.set(definition.id, normalized)
  return normalized
}

export function getSharedPage(id) {
  return definitions.get(id) || null
}

export function requireSharedPage(id) {
  const page = getSharedPage(id)
  if (!page) throw new Error(`公共页面未注册：${id}`)
  return page
}

export function validatePageExtensions(sharedPage, extensions = {}) {
  const allowed = new Set(sharedPage.allowedExtensions)
  const unknown = Object.keys(extensions).filter((key) => !allowed.has(key))
  if (unknown.length) throw new Error(`${sharedPage.id} 不支持扩展点：${unknown.join(', ')}`)
  return Object.freeze({ ...extensions })
}

export function composeSharedPage(id, extensions = {}) {
  const page = requireSharedPage(id)
  return Object.freeze({
    ...page,
    extensions: validatePageExtensions(page, extensions),
  })
}

export function listSharedPages() {
  return [...definitions.values()]
}

export { RecruitmentResumePage }

export const recruitmentResumePage = defineSharedPage({
  id: 'shared.recruitment-resume',
  Component: RecruitmentResumePage,
  allowedExtensions: ['detailHeaderActions', 'detailFooter', 'detailBack'],
})
