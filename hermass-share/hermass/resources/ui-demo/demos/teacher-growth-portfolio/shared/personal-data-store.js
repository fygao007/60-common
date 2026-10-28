/**
 * 个人数据维护 · module 级共享 store
 *
 * 教师端「数据采集详情页(t-data-detail)」可编辑个人全部数据，
 * 通过 localStorage 持久化，跨页面跳转 / 刷新后仍保留。
 * 同时写回 engine 运行时 teachers 资产，使同会话内画像重算可见。
 */
import { teachers } from './portfolio-foundation.js'

const LS_PREFIX = 'tgp:personal:'

function seed(teacherId) {
  const t = teachers.find((x) => x.id === teacherId)
  if (!t) return null
  const basic = {
    // 教师成长档案袋既有字段
    name: t.name,
    college: t.college,
    title: t.title,
    dualTeacher: t.dualTeacher,
    degree: t.degree,
    employeeId: t.employeeId,
    entryDate: t.entryDate,
    teachingYears: t.teachingYears,
    // 60sysV2/personnel-my-info2 人事基础字段（默认值由页面表单维护）
    namePinyin: '',
    nameFullPinyin: '',
    formerName: '',
    gender: '',
    birthDate: '',
    age: null,
    recognizedBirthDate: '',
    recognizedAge: null,
    nativePlace: '',
    birthplace: '',
    ethnicity: '',
    nationality: '',
    idCardNo: '',
    politicalStatus: '',
    idCardType: '',
    secondParty: '',
    secondPartyDate: '',
    workStartDate: '',
    maritalStatus: '',
    familyPlanningStatus: '',
    isMilitaryTransfer: '',
    isForeigner: '',
    isHongKongMacauTaiwan: '',
    householdType: '',
    householdLocation: '',
    religion: '',
    hkMacauTaiwan: '',
    hasGreenCard: '',
    greenCardCountry: '',
    healthStatus: '',
    marriageDate: '',
    teachingStartDate: '',
    householdNature: '',
    academicStructure: '',
    contractStatus: '',
    hasVocationalCert: '',
    positionName: '',
    priorDegree: '',
    priorGradSchool: '',
    priorMajor: '',
    priorDegreeAwarded: '',
    priorGradDate: '',
    committeeReviewDate: '',
    universityWorkYears: null,
    firstDegree: '',
    firstBachelorDegree: '',
    firstDegreeDate: '',
    firstBachelorDate: '',
    computerLevel: '',
    englishLevel: '',
    archiveNo: '',
    majorFitPosition: '',
    workYears: null,
    workMonths: null,
    unaccountedWorkYears: '',
    brokenWorkYears: '',
    unifiedPayCategory: '',
    unifiedPayLevel: '',
    salaryGrade: '',
    basePerformanceCategory: '',
  }
  const indicators = {}
  Object.entries(t.data).forEach(([indId, dp]) => {
    indicators[indId] = { value: dp.value, missing: !!dp.missing }
  })
  return {
    basic,
    indicators,
    careerEvents: t.careerEvents ? [...t.careerEvents] : [],
  }
}

function load(teacherId) {
  const base = seed(teacherId)
  if (!base) return null
  try {
    const raw = localStorage.getItem(LS_PREFIX + teacherId)
    if (raw) {
      const saved = JSON.parse(raw)
      return {
        basic: { ...base.basic, ...(saved.basic || {}) },
        indicators: { ...base.indicators, ...(saved.indicators || {}) },
        careerEvents: saved.careerEvents || base.careerEvents,
      }
    }
  } catch (e) {
    /* ignore corrupt cache */
  }
  return base
}

const cache = {}
const listeners = new Set()

export function getPersonalData(teacherId) {
  if (!cache[teacherId]) cache[teacherId] = load(teacherId)
  return cache[teacherId]
}

export function savePersonalData(teacherId, next) {
  cache[teacherId] = next
  try {
    localStorage.setItem(LS_PREFIX + teacherId, JSON.stringify(next))
  } catch (e) {
    /* ignore quota */
  }
  // 写回 engine 运行时对象(画像重算可见变化)
  const t = teachers.find((x) => x.id === teacherId)
  if (t) {
    if (next.basic) Object.assign(t, next.basic)
    if (next.indicators) {
      Object.entries(next.indicators).forEach(([indId, v]) => {
        if (t.data[indId]) {
          t.data[indId] = { ...t.data[indId], value: v.value, missing: !!v.missing }
        }
      })
    }
  }
  listeners.forEach((fn) => fn())
}

export function resetPersonalData(teacherId) {
  try {
    localStorage.removeItem(LS_PREFIX + teacherId)
  } catch (e) {
    /* ignore */
  }
  delete cache[teacherId]
  listeners.forEach((fn) => fn())
}

export function subscribePersonalData(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
