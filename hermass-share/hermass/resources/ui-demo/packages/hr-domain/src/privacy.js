export const DATA_CLASSIFICATION = Object.freeze({
  PUBLIC: 'public',
  INTERNAL: 'internal',
  SENSITIVE: 'sensitive',
  RESTRICTED: 'restricted',
})

export function maskIdentityNumber(value) {
  const text = String(value || '')
  if (text.length < 8) return text ? `${text.slice(0, 1)}***` : '—'
  return `${text.slice(0, 3)}***********${text.slice(-4)}`
}

export function maskPhone(value) {
  const text = String(value || '')
  if (text.length < 7) return text ? `${text.slice(0, 2)}***` : '—'
  return `${text.slice(0, 3)}****${text.slice(-4)}`
}

export function sanitizePersonForList(person) {
  if (!person) return person
  const { identityNumber, phone, bankAccount, salary, socialSecurityNumber, ...safe } = person
  return {
    ...safe,
    identityNumberMasked: maskIdentityNumber(identityNumber),
    phoneMasked: maskPhone(phone),
  }
}

export function canRevealRestricted(context = {}) {
  return Boolean(context.purpose && context.auditReason && context.permissions?.includes('hr.restricted.read'))
}
