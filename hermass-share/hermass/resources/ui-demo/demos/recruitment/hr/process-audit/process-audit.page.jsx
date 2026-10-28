import { createRoot } from 'react-dom/client'
import { useCallback, useEffect, useMemo, useRef, useState, Fragment } from 'react'
import {
  DSButton, DSDataTable, DSDrawer, DSEditField,
  DSInput, DSProcessDynamics, DSReadOnlyForm, DSSelect,
  DSModal, DSRichTextEditor, DSTabs, DSTag, DSTextarea, DSTree, DSUpload,
} from '@wisedu/design-system'
import {
  listResumeSections,
  listResumeFormFields,
  listResumeColumns,
  listResumeSubsections,
  resolveResumeValue,
} from '@wisedu/hr-domain/resume-fields'
import { RecruitmentResumePage } from '@wisedu/shared-pages'
import './process-audit.css'

// These URLs are resolved by the standalone business-page HTML, not by the bundle file.
const candidatePhoto = '../../../../assets/upload-images/e455e4bccf26ac34d3ac6cf5f09c5cc9.png'
const documentScan = '../../../../assets/upload-images/3937226a9b8a2cdc0d3ff68fdce83f0f.png'
const identityScan = '../../../../assets/upload-images/5cc99b7828db0d275c98c2cff8062ae2.png'
const researchImage = '../../../../assets/upload-images/6e645e3e358c28666be54a5aa92f3e02.png'
const researchPdf = '../plan-audit/downloads/2026年招聘岗位计划申报表-本科教育学院.pdf'

const mock = window.RecruitmentMock || {}
const ALL_PLANS = mock.loadTodos?.() || []
const CATEGORIES = mock.TODO_CATEGORIES || []
const isActivePlan = (plan) => plan.status === '进行中' || (plan.status === '已发布' && !plan.ended)
const isEndedPlan = (plan) => plan.status === '已结束' || plan.ended === true
const PLANS = ALL_PLANS.filter(isActivePlan)
const NODES_ORDER = ['资格审查', '确认名单', '笔试', '综合素质考察', '面试', '部门初面', '校级面试', '上会审议', '拟录用']
const STORAGE_KEY = 'recruitment:hr:process-audit:candidates:v19-hire-stage-removed'
const FIELD_CONFIG_STORAGE_KEY = 'recruitment:hr:process-audit:field-config:v1'
const PAGE_SIZE = 20

// ── 字段配置（按环节单独配置表格字段，刷新后保留）──
function loadFieldConfigs() {
  try {
    const raw = localStorage.getItem(FIELD_CONFIG_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}
function saveFieldConfigs(cfg) {
  try { localStorage.setItem(FIELD_CONFIG_STORAGE_KEY, JSON.stringify(cfg)) } catch {}
}
// 结构性状态列（确认状态 / 准考证号 / 状态标签）：不属于可配置的“数据字段”，
// 由系统按子状态自动呈现，字段配置不覆盖它们。
const STRUCTURAL_KEYS = new Set(['confirmStatus', 'admissionNo', 'subStatus'])
const PINNED_KEYS = new Set(['name', 'phone', 'unit', 'jobName'])
// 环节 -> 类型：同一类型（如笔试/面试都属“考试类”）共用一套字段定义池
function typeOfStage(node) {
  if (['资格审查', '确认名单'].includes(node)) return '资格审查'
  if (['笔试', '面试', '综合素质考察', '部门初面', '校级面试'].includes(node)) return '考试'
  if (node === '上会审议') return '审核'
  // 拟录用之后不再有「录用」环节（录用办理已移至「录用办理」菜单 archive-transfer）
  if (node === '拟录用') return '录用'
  return '其他'
}
// 环节显示名（仅用于 UI 展示；逻辑 key 仍为原始节点名）
const STAGE_DISPLAY = {}
const dispStage = (node) => STAGE_DISPLAY[node] || node
const RECRUITMENT_TYPES = ['选聘', '先笔后面', '先面后笔']
// 三套招聘流程的环节顺序，严格对齐《招聘各环节确认清单》
const PROCESS_NODES_BY_TYPE = {
  '选聘': ['资格审查', '确认名单', '部门初面', '校级面试', '上会审议', '拟录用'],
  '先笔后面': ['资格审查', '笔试', '综合素质考察', '面试', '上会审议', '拟录用'],
  '先面后笔': ['资格审查', '综合素质考察', '面试', '笔试', '上会审议', '拟录用'],
}

const STATUS_SEQUENCES = {
  '资格审查': ['待审核'],
  '确认名单': ['待审核'],
  '笔试': ['待确认参加', '待发准考证', '待录成绩'],
  '综合素质考察': ['待上传成绩'],
  '面试': ['待确认参加', '待录成绩'],
  '部门初面': ['待上传成绩'],
  '校级面试': ['待确认参加', '待录成绩'],
  '上会审议': ['待审核'],
  '拟录用': ['待录用确认'],
}
// 「录用」环节已整体移至「录用办理」菜单（archive-transfer），此处不再配置

// 各「环节 | 子状态」对应的批量操作（操作项与顺序严格对齐 Excel《招聘各环节确认清单》的「操作」列）
const NODE_ACTIONS = {
  '资格审查|待审核': [
    { key: 'pass', label: '批量通过', primary: true },
    { key: 'reject', label: '批量退回', needsReason: true },
    { key: 'unpass', label: '批量不通过' },
    { key: 'exportResume', label: '导出简历', alwaysEnabled: true },
    { key: 'exportSummary', label: '导出汇总表', alwaysEnabled: true },
  ],
  '确认名单|待审核': [
    { key: 'pass', label: '批量通过', primary: true },
    { key: 'unpass', label: '批量不通过' },
    { key: 'exportResume', label: '导出简历', alwaysEnabled: true },
    { key: 'exportSummary', label: '导出汇总表', alwaysEnabled: true },
  ],
  '笔试|待确认参加': [
    { key: 'confirm', label: '确认参加', primary: true },
    { key: 'skip', label: '确认不参加' },
    { key: 'exportSummary', label: '导出', alwaysEnabled: true },
    { key: 'sendMessage', label: '发送消息', alwaysEnabled: true },
  ],
  '笔试|待发准考证': [
    { key: 'uploadAdmission', label: '上传准考证', alwaysEnabled: true },
    { key: 'issue', label: '发放准考证', primary: true },
    { key: 'sendMessage', label: '发送消息', alwaysEnabled: true },
    { key: 'exportSummary', label: '导出汇总表', alwaysEnabled: true },
  ],
  '笔试|待录成绩': [
    { key: 'pass', label: '通过', primary: true },
    { key: 'unpass', label: '不通过' },
    { key: 'import', label: '导入成绩', alwaysEnabled: true },
    { key: 'calculate', label: '算分', alwaysEnabled: true },
    { key: 'exportSummary', label: '导出汇总表', alwaysEnabled: true },
    { key: 'sendMessage', label: '发送消息', alwaysEnabled: true },
  ],
  '综合素质考察|待上传成绩': [
    { key: 'pass', label: '通过', primary: true },
    { key: 'unpass', label: '不通过' },
    { key: 'import', label: '导入成绩', alwaysEnabled: true },
    { key: 'calculate', label: '算分', alwaysEnabled: true },
    { key: 'exportSummary', label: '导出汇总表', alwaysEnabled: true },
    { key: 'sendMessage', label: '发送消息', alwaysEnabled: true },
    { key: 'importExamInfo', label: '导入考试信息', alwaysEnabled: true },
  ],
  '面试|待确认参加': [
    { key: 'confirm', label: '确认参加', primary: true },
    { key: 'skip', label: '确认不参加' },
    { key: 'exportSummary', label: '导出', alwaysEnabled: true },
    { key: 'sendMessage', label: '发送消息', alwaysEnabled: true },
  ],
  '面试|待录成绩': [
    { key: 'pass', label: '通过', primary: true },
    { key: 'unpass', label: '不通过' },
    { key: 'import', label: '导入成绩', alwaysEnabled: true },
    { key: 'calculate', label: '算分', alwaysEnabled: true },
    { key: 'exportSummary', label: '导出汇总表', alwaysEnabled: true },
    { key: 'sendMessage', label: '发送消息', alwaysEnabled: true },
  ],
  '部门初面|待上传成绩': [
    { key: 'pass', label: '通过', primary: true },
    { key: 'unpass', label: '不通过' },
    { key: 'import', label: '导入成绩', alwaysEnabled: true },
    { key: 'calculate', label: '算分', alwaysEnabled: true },
    { key: 'importAptitude', label: '导入适岗能力清单', alwaysEnabled: true },
    { key: 'exportSummary', label: '导出汇总表', alwaysEnabled: true },
    { key: 'sendMessage', label: '发送消息', alwaysEnabled: true },
  ],
  '校级面试|待确认参加': [
    { key: 'confirm', label: '确认参加', primary: true },
    { key: 'skip', label: '确认不参加' },
    { key: 'exportSummary', label: '导出', alwaysEnabled: true },
    { key: 'sendMessage', label: '发送消息', alwaysEnabled: true },
  ],
  '校级面试|待录成绩': [
    { key: 'pass', label: '通过', primary: true },
    { key: 'unpass', label: '不通过' },
    { key: 'import', label: '导入成绩', alwaysEnabled: true },
    { key: 'calculate', label: '算分', alwaysEnabled: true },
    { key: 'exportSummary', label: '导出汇总表', alwaysEnabled: true },
    { key: 'sendMessage', label: '发送消息', alwaysEnabled: true },
  ],
  '上会审议|待审核': [
    { key: 'pass', label: '批量通过', primary: true },
    { key: 'unpass', label: '批量不通过' },
    { key: 'exportSecurity', label: '导出国安材料', alwaysEnabled: true },
    { key: 'sendMessage', label: '发送消息', alwaysEnabled: true },
    { key: 'uploadMeeting', label: '上传会议材料', alwaysEnabled: true },
  ],
  '拟录用|待录用确认': [
    { key: 'pass', label: '批量通过', primary: true },
    { key: 'unpass', label: '批量不通过' },
    { key: 'exportSummary', label: '导出汇总表', alwaysEnabled: true },
    { key: 'importResult', label: '导入结果', alwaysEnabled: true },
    { key: 'exportMeeting', label: '导出会议材料', alwaysEnabled: true },
  ],
}

// 三套招聘流程的操作差异（严格对齐 Excel 三个 sheet）：
// 选聘·资格审查为「符合 / 退回 / 不符合」，且「不符合」仅标记、数据仍进入下一环节
const NODE_ACTIONS_BY_TYPE = {
  '选聘|资格审查|待审核': [
    { key: 'fit', label: '符合', primary: true },
    { key: 'reject', label: '退回', needsReason: true },
    { key: 'unpassAdvance', label: '不符合' },
    { key: 'exportResume', label: '导出简历', alwaysEnabled: true },
    { key: 'exportSummary', label: '导出汇总表', alwaysEnabled: true },
  ],
}
// 详情抽屉底部的单人办理动作：仅保留真正面向个人的操作；
// 导出 / 导入 / 发送消息等属批量操作，只在工具栏提供（Excel「操作列」仅为「详情」）
const PERSON_ACTION_KEYS = new Set(['pass', 'unpass', 'reject', 'confirm', 'skip', 'issue', 'fit', 'unpassAdvance'])

// 按招聘方式取环节动作：「上传会议材料」（上会审议）仅先笔后面流程提供
function nodeActionsFor(recruitmentType, node, subStatus) {  const override = NODE_ACTIONS_BY_TYPE[`${recruitmentType}|${node}|${subStatus}`]
  if (override) return override
  let actions = NODE_ACTIONS[`${node}|${subStatus}`]
  if (!actions) return []
  if (node === '上会审议' && recruitmentType !== '先笔后面') actions = actions.filter((action) => action.key !== 'uploadMeeting')
  return actions
}

const TERMINAL_STATUSES = ['已录用', '不录用', '不通过', '放弃', '已放弃']

const latestStageStatus = (row) => {
  const status = row.status || row.subStatus || '-'
  if (['不通过', '不晋级', '不合格', '不录用', '已录用', '已退回', '放弃', '已放弃'].some((item) => status.includes(item))) return status
  const stages = PROCESS_NODES_BY_TYPE[recruitmentTypeOf(row)] || NODES_ORDER
  const idx = stages.indexOf(row.currentNode)
  const nextNode = idx >= 0 && idx < stages.length - 1 ? stages[idx + 1] : null
  return nextNode ? `待${nextNode}` : status
}

function normalizeRow(row) {
  let currentNode = row.currentNode
  let subStatus = row.subStatus
  // 子状态根因对齐：Excel 每个环节的子环节固定（STATUS_SEQUENCES）。
  // 历史 mock 数据可能带入旧状态签（如 面试·待审核 / 待发通知），统一归一到该环节的有效子状态。
  const validSeq = STATUS_SEQUENCES[currentNode]
  if (validSeq && !validSeq.includes(subStatus)) {
    if (subStatus === '待确认结果') subStatus = '待录成绩'
    else if (!TERMINAL_STATUSES.includes(subStatus) && !['已退回', '不符合'].includes(subStatus)) subStatus = validSeq[0]
  }
  const code = row.id?.charCodeAt(row.id.length - 1) || 0
  const issued = !!row.issuedAt || !!row.admissionNo
  return {
    ...row,
    currentNode,
    subStatus,
    admissionNo: row.admissionNo || ((subStatus === '待发准考证' && code % 3 !== 0) ? `2026${String(code).padStart(5, '0')}` : ''),
    issuedAt: row.issuedAt || ((subStatus === '待发准考证' && code % 3 !== 0) ? row.arrivedAt : ''),
    downloadStatus: row.downloadStatus || (issued ? (code % 2 ? '已发未下载' : '已下载') : (subStatus === '待发准考证' && code % 3 !== 0 ? (code % 2 ? '已发未下载' : '已下载') : '未发')),
  }
}

function recruitmentTypeOf(row) {
  if (row.recruitmentType && RECRUITMENT_TYPES.includes(row.recruitmentType)) return row.recruitmentType
  const code = row.id?.charCodeAt(row.id.length - 1) || 0
  return RECRUITMENT_TYPES[code % RECRUITMENT_TYPES.length]
}

function processStagesFor(plan) {
  return [...(plan?.processStages || NODES_ORDER)]
}

// ── 简历详情右上角「动态」抽屉：流程日志 + 流程图，统一走设计系统 DSProcessDynamics ──
// 历史留痕是「时间 · 事项」文本，时间前缀可能缺省（如「已完成前序环节」）
const HISTORY_TIME_RE = /^(\d{4}[-/]\d{1,2}[-/]\d{1,2}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?|\d{1,2}-\d{1,2}(?:\s+\d{1,2}:\d{2})?)\s*[·•]?\s*/
// 环节/日志状态统一收敛到 5 个标准状态，保证色语义走 DSTag 的流程状态色映射
function processStatusOf(text) {
  const value = String(text || '')
  if (/不通过|未通过|不合格|不符合|不录用/.test(value)) return '不通过'
  if (/退回|补交/.test(value)) return '退回'
  if (/放弃|撤回|取消/.test(value)) return '放弃'
  // 带「→」的留痕表示一次已完成并推进到下一环节的动作
  if (/→/.test(value)) return '已完成'
  if (/待审核|待办理|待确认|待发|待录|待上传|待提交|当前进入|进行中/.test(value)) return '待审核'
  return '已完成'
}
const PROCESS_STATUS_TONE = { '不通过': 'danger', '退回': 'warning', '放弃': 'neutral', '待审核': 'primary', '已完成': 'success' }
function processToneOf(status) {
  const value = String(status || '')
  if (/不通过|不合格|不录用|不符合|驳回/.test(value)) return 'danger'
  if (/退回|补交/.test(value)) return 'warning'
  if (/放弃|撤回|取消/.test(value)) return 'neutral'
  if (/已完成|通过|合格|已录用|已发放|已录成绩|已登记|已发送/.test(value)) return 'success'
  if (/待|进行|处理/.test(value)) return 'primary'
  return 'neutral'
}
// 留痕按时间正序追加，时间轴需新 → 旧；有 handledRecords 时带出操作人与办理意见
function candidateTimelineItems(row) {
  if (!row) return []
  const records = row.handledRecords || []
  const items = (row.history || []).map((entry) => {
    const text = String(entry || '')
    const matched = text.match(HISTORY_TIME_RE)
    const time = matched ? matched[1] : ''
    const title = matched ? text.slice(matched[0].length) : text
    const record = time ? records.find((item) => String(item.handledAt || '') === time) : null
    const status = processStatusOf(title)
    return {
      title,
      status,
      tone: PROCESS_STATUS_TONE[status],
      timeLabel: '操作时间',
      time,
      operatorLabel: '操作人',
      operator: record?.handledBy || (time && time === row.handledAt ? row.handledBy : ''),
      opinionLabel: '办理意见',
      opinion: record?.opinion || '',
    }
  })
  return items.reverse().map((item, index) => ({
    ...item,
    id: `${item.title}-${index}`,
    // 最新一条留痕（= 进入当前环节）若自带时间缺失，用「到达本环节时间」补齐
    time: item.time || (index === 0 ? row.arrivedAt || '' : ''),
    current: index === 0,
    expanded: index === 0,
  }))
}
// 流程图：按招聘方式的环节顺序（选聘 / 先笔后面 / 先面后笔）逐节点推导状态
function candidateGraphRows(row, plan) {
  if (!row) return []
  const stages = PROCESS_NODES_BY_TYPE[recruitmentTypeOf(row)] || processStagesFor(plan)
  const currentIndex = stages.indexOf(row.currentNode)
  const currentStatus = row.subStatus || '进行中'
  return stages.map((stage, index) => {
    const isDone = currentIndex >= 0 && index < currentIndex
    const isCurrent = index === currentIndex
    return {
      id: stage,
      nodes: [{
        id: stage,
        title: dispStage(stage),
        status: isDone ? '已完成' : isCurrent ? currentStatus : '未开始',
        tone: isDone ? 'success' : isCurrent ? processToneOf(currentStatus) : 'neutral',
        current: isCurrent,
      }],
    }
  })
}

// 晋级人数计算(1:3/1:6比例)
function calculateAdvanceCount(recommendCount, ratio, recruitCount) {
  if (!ratio) return recommendCount
  const [recruit, maxAdvance] = ratio.split(':').map(Number)
  const expected = recruitCount ? recruitCount * (maxAdvance / recruit) : maxAdvance
  // 边界同分全部进入
  return Math.min(recommendCount, Math.ceil(expected))
}

function loadRows() {
  const expandQualificationRows = (source) => {
    const rows = source.map(normalizeRow)
    const names = ['赵嘉', '李妍', '王博', '林悦', '孙岚', '方宁', '唐越', '周敏', '吴桐', '冯雪', '陈晓', '郑楠', '蒋晨', '刘畅', '何俊', '徐宁', '韩璐', '高远', '许文', '罗晴']
    const groups = new Map()
    rows.filter((row) => ['资格审查'].includes(row.currentNode) && row.subStatus === '待审核').forEach((row) => {
      const key = `${row.planId}|${recruitmentTypeOf(row)}|${row.currentNode}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(row)
    })
    groups.forEach((items, key) => {
      const seed = items[0]
      for (let index = items.length; index < 20; index += 1) {
        rows.push({
          ...seed,
          id: `${seed.id}-qualification-${index + 1}`,
          candidateId: `${seed.id}-qualification-${index + 1}`,
          name: names[index % names.length],
          recruitmentType: recruitmentTypeOf(seed),
          school: ['清华大学', '北京大学', '华南理工大学', '南京大学'][index % 4],
          degree: ['博士', '硕士', '本科'][index % 3],
          major: ['电子信息', '软件工程', '公共管理', '人工智能'][index % 4],
          birth: index % 4 === 0 ? '1988-05' : '1992-05',
          ai: index % 4 === 0 ? ['缺少代表性成果证明材料'] : [],
          requirements: index % 4 === 0
            ? seed.requirements
            : (seed.requirements || []).map((item) => ({ ...item, matched: true })),
        })
      }
    })
    const allPlanIds = [...new Set(rows.map((row) => row.planId))]
    const stageNames = ['林悦', '周敏', '唐越', '陈晓', '刘畅', '徐宁']
    allPlanIds.forEach((planId) => {
      RECRUITMENT_TYPES.forEach((type, typeIndex) => {
        const typeRows = rows.filter((row) => row.planId === planId && recruitmentTypeOf(row) === type)
        const fallbackRows = typeRows.length ? typeRows : rows.filter((row) => row.planId === planId)
        if (!fallbackRows.length) return
        ;(PROCESS_NODES_BY_TYPE[type] || []).forEach((node, nodeIndex) => {
          const subs = STATUS_SEQUENCES[node] || ['待审核']
          subs.forEach((subStatus, subIndex) => {
            const hasPending = rows.some((row) => row.planId === planId
              && recruitmentTypeOf(row) === type
              && row.currentNode === node
              && row.subStatus === subStatus
              && !row.handledOnly
              && !TERMINAL_STATUSES.includes(row.subStatus))
            if (hasPending) return
            const seed = fallbackRows[(nodeIndex + typeIndex + subIndex) % fallbackRows.length]
            const count = 3
            for (let index = 0; index < count; index += 1) {
              const writtenScore = 68 + ((nodeIndex * 3 + index * 2 + typeIndex) % 25)
              const qualityScore = 70 + ((nodeIndex * 2 + index * 3 + typeIndex) % 22)
              const interviewScore = 72 + ((nodeIndex + index * 2 + typeIndex) % 20)
              const schoolInterviewScore = 80 + ((nodeIndex + index) % 15)
              const deptInitialScore = 78 + ((nodeIndex + index) % 16)
              rows.push({
                ...seed,
                id: `${seed.id}-demo-${typeIndex}-${nodeIndex}-${subIndex}-${index + 1}`,
                candidateId: `${seed.candidateId || seed.id}-demo-${nodeIndex}-${index + 1}`,
                name: stageNames[(nodeIndex + index) % stageNames.length],
                recruitmentType: type,
                currentNode: node,
                subStatus,
                school: ['清华大学', '北京大学', '华南理工大学', '南京大学', '浙江大学'][(nodeIndex + index) % 5],
                degree: ['博士', '硕士', '本科'][(nodeIndex + index) % 3],
                major: ['电子信息', '软件工程', '公共管理', '人工智能', '机械工程'][(nodeIndex + index) % 5],
                birth: `${1992 - (index % 6)}-05`,
                gender: ['男', '女'][(nodeIndex + index) % 2],
                writtenScore,
                qualityScore,
                interviewScore,
                schoolInterviewScore,
                deptInitialScore,
                recommendResult: '',
                currentRank: index + 1,
                sendCount: index % 2,
                score: node === '笔试' ? writtenScore : node === '综合素质考察' ? qualityScore : (node === '面试' || node === '校级面试') ? interviewScore : seed.score,
                handledOnly: false,
                handledRecords: [],
                history: [...(seed.history || []), `2026-07-25 10:00 · 已进入${node}·${subStatus}`],
              })
            }
          })
        })
      })
    })
    return rows
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
    return expandQualificationRows(Array.isArray(saved) && saved.length ? saved : (mock.loadCandidates?.() || []))
  } catch { return expandQualificationRows(mock.loadCandidates?.() || []) }
}
function dueTone(row) {
  const due = new Date(row.dueAt).getTime()
  if (!due) return 'neutral'
  if (due < Date.now()) return 'danger'
  if (due - Date.now() < 86400000) return 'warning'
  return 'neutral'
}
function timeNow() { return new Date().toLocaleString('zh-CN', { hour12: false }) }
// 联系方式（demo 稳定伪号，与列表「联系方式」列共用同一来源）
function phoneOf(row) {
  return `138${String(10000000 + Math.abs((row.id || '').split('').reduce((sum, char) => sum + char.charCodeAt(0) * 97, 0)) % 90000000).slice(-8)}`
}
function registrationNo(row) {
  const source = String(row.candidateId || row.id || `${row.name}-${row.phone || ''}`)
  let hash = 0
  for (let index = 0; index < source.length; index += 1) hash = (hash * 31 + source.charCodeAt(index)) % 1000000
  return `BM2026${String(hash).padStart(6, '0')}`
}
function stableScore(row, base = 80, range = 12) {
  const source = String(row.candidateId || row.id || row.name || '')
  const total = [...source].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return Number((base + (total % (range * 2)) / 2).toFixed(1))
}
function schoolInterviewScoreOf(row) {
  return Number(row.schoolInterviewScore ?? stableScore(row, 85, 10))
}
function deptInitialScoreOf(row) {
  return Number(row.deptInitialScore ?? stableScore(row, 84, 12))
}
function writtenScoreOf(row) {
  return Number(row.writtenScore ?? stableScore(row, 78, 18))
}
function qualityScoreOf(row) {
  return Number(row.qualityScore ?? stableScore(row, 80, 16))
}
function interviewScoreOf(row) {
  return Number(row.interviewScore ?? stableScore(row, 82, 15))
}
// 综合成绩按招聘方式分别计算（严格对齐 Excel《招聘各环节确认清单》）
function comprehensiveScoreOf(row) {
  const type = recruitmentTypeOf(row)
  if (type === '选聘') return Number((deptInitialScoreOf(row) * 0.3 + schoolInterviewScoreOf(row) * 0.7).toFixed(2))
  if (type === '先面后笔') return Number((qualityScoreOf(row) * 0.2 + interviewScoreOf(row) * 0.4 + writtenScoreOf(row) * 0.4).toFixed(2))
  // 先笔后面：笔试 40% + 综合素质考察 20% + 面试 40%
  return Number((writtenScoreOf(row) * 0.4 + qualityScoreOf(row) * 0.2 + interviewScoreOf(row) * 0.4).toFixed(2))
}

// ── 算分（推荐结果计算）──
// 各算分环节的规则（严格对齐 Excel《招聘各环节确认清单》推荐结果备注）：
// 笔试：先笔后面 通过=分数>60 且 1:6 入围、递补=1:8；先面后笔 通过=分数>60
// 综合素质考察：先笔后面 按笔试40%+综考20% 计算成绩依序 3 倍拟聘入围；先面后笔 按 1:6 入围
// 面试：先笔后面 通过=面试成绩>60；先面后笔 按综考20%+面试40% 计算排序 3 倍拟聘入围，且面试<60 不通过
// 部门初面（选聘）：按 1:3 进入下一环节；校级面试（选聘）：通过=成绩 60 分以上
// 演示数据无「拟聘人数」字段，按每岗位 2 人取值（DEMO_HIRE_COUNT），比例规则与 Excel 一致
const DEMO_HIRE_COUNT = 2

// 各环节用于排序/入围判定的成绩（同分则排名相同）
function stageScoreOf(row, stageNode, recruitmentType) {
  if (stageNode === '笔试') return writtenScoreOf(row)
  if (stageNode === '综合素质考察') {
    return recruitmentType === '先笔后面'
      ? Number((writtenScoreOf(row) * 0.4 + qualityScoreOf(row) * 0.2).toFixed(2))
      : qualityScoreOf(row)
  }
  if (stageNode === '面试') {
    return recruitmentType === '先面后笔'
      ? Number((qualityScoreOf(row) * 0.2 + interviewScoreOf(row) * 0.4).toFixed(2))
      : interviewScoreOf(row)
  }
  if (stageNode === '部门初面') return deptInitialScoreOf(row)
  if (stageNode === '校级面试') return schoolInterviewScoreOf(row)
  return Number(row.score ?? 0)
}

// 对当前环节视图（某招聘方式 × 某环节 × 某子环节）计算推荐结果与岗位排名
function computeRecommend(stageRows, stageNode, recruitmentType) {
  const byJob = new Map()
  stageRows.forEach((row) => {
    const key = row.jobId || row.jobName
    if (!byJob.has(key)) byJob.set(key, [])
    byJob.get(key).push(row)
  })
  const patch = new Map()
  byJob.forEach((list) => {
    const sorted = [...list].sort((a, b) => stageScoreOf(b, stageNode, recruitmentType) - stageScoreOf(a, stageNode, recruitmentType))
    let prevScore = null
    let prevRank = 0
    let qualifiedPos = 0
    sorted.forEach((row, index) => {
      const score = stageScoreOf(row, stageNode, recruitmentType)
      const rank = score === prevScore ? prevRank : index + 1
      prevScore = score
      prevRank = rank
      const qualified = stageNode === '笔试' || stageNode === '面试' ? score > 60
        : stageNode === '校级面试' ? score >= 60
          : true
      if (qualified) qualifiedPos += 1
      let result = '不通过'
      if (stageNode === '笔试') {
        if (score > 60) {
          if (recruitmentType === '先笔后面') result = qualifiedPos <= DEMO_HIRE_COUNT * 6 ? '通过' : qualifiedPos <= DEMO_HIRE_COUNT * 8 ? '递补' : '不通过'
          else result = '通过'
        }
      } else if (stageNode === '综合素质考察') {
        result = rank <= DEMO_HIRE_COUNT * (recruitmentType === '先笔后面' ? 3 : 6) ? '通过' : '不通过'
      } else if (stageNode === '面试') {
        // 先面后笔：按综考20%+面试40%加权排序取 3 倍拟聘入围；硬性线 60 分作用于实操面试成绩本身
        if (recruitmentType === '先面后笔') result = interviewScoreOf(row) < 60 ? '不通过' : (rank <= DEMO_HIRE_COUNT * 3 ? '通过' : '不通过')
        else result = score > 60 ? '通过' : '不通过'
      } else if (stageNode === '部门初面') {
        result = rank <= DEMO_HIRE_COUNT * 3 ? '通过' : '不通过'
      } else if (stageNode === '校级面试') {
        result = score >= 60 ? '通过' : '不通过'
      }
      patch.set(row.id, { recommendResult: result, currentRank: rank })
    })
  })
  return patch
}
// ── 标签：统一使用设计系统 DSTag（浅色底 + 彩色文字，六色语义：灰/橙/红/绿/青/蓝）──
function pillTone(value = '') {
  if (value.includes('不通过') || value.includes('不符合') || value.includes('不录用') || value.includes('不合格') || value.includes('删除')) return 'red'
  if (value.includes('退回') || value.includes('递补') || value.includes('补交') || value.includes('新增')) return 'orange'
  if (value.includes('完成') || value.includes('办结')) return 'teal'
  if (value.includes('待') || value.includes('拟') || value.includes('进行中') || value.includes('审核中')) return 'blue'
  if (value.includes('未') || value.includes('撤回') || value.includes('撤销') || value.includes('放弃')) return 'gray'
  if (value.startsWith('已') || value.includes('通过') || value.includes('符合') || value.includes('合格') || value.includes('发布') || value.includes('提交')) return 'green'
  return 'gray'
}
function StatusPill({ value }) {
  return <DSTag tone={pillTone(value)}>{value}</DSTag>
}
function handledStatus(actionKeyName) {
  return ({
    pass: '已通过',
    reject: '已退回',
    unpass: '不通过',
    confirm: '已确认参加',
    skip: '已放弃',
    issue: '已发放',
    fit: '符合',
    unpassAdvance: '不符合',
  })[actionKeyName] || ''
}

// 按 processStages 找下一个环节的首状态签
function nextStageFirstStatus(plan, node, row) {
  const stages = row ? (PROCESS_NODES_BY_TYPE[recruitmentTypeOf(row)] || processStagesFor(plan)) : processStagesFor(plan)
  const idx = stages.indexOf(node)
  if (idx < 0 || idx >= stages.length - 1) return null
  const nextNode = stages[idx + 1]
  return { node: nextNode, subStatus: (STATUS_SEQUENCES[nextNode] || [])[0] || '待办理' }
}

function resumeOf(candidate) {
  const female = ['林悦', '方宁', '唐越', '周敏', '孙岚', '冯雪', '陈晓'].includes(candidate.name)
  return {
    formerName: '无', gender: female ? '女' : '男', birth: candidate.birth || (female ? '1994-08' : '1992-05'), workStart: '2019-07',
    nation: '汉族', marriage: '未婚',
    idCard: female ? '320102199408182421' : '330102199205181817',
    nativePlace: '江苏南京', household: '江苏省南京市', phone: '13812341234',
    politics: '中共党员', email: `${candidate.id.slice(-4)}@mail.com`,
    major: candidate.major || '公共管理', school: candidate.school || '南京大学',
    language: '大学英语六级 528分',
    spouseName: '无', spouseBirth: '-', spouseHousehold: '-', spouseNation: '-', spouseNativePlace: '-', spouseWorkUnit: '-',
    bachelor: `2012.09—2016.06  ${candidate.school || '南京大学'}  ${candidate.major || '公共管理'}  学士`,
    master: `2016.09—2019.06  ${candidate.school || '南京大学'}  ${candidate.major || '公共管理'}  硕士`,
    doctor: candidate.degree === '博士' ? `2019.09—2023.06  ${candidate.school || '南京大学'}  管理科学与工程  博士` : '无',
    work: '2019.07—至今  某高校行政管理岗位,负责综合事务与项目管理',
    awards: '2023年度校级优秀教育工作者',
    papers: '以第一作者发表相关领域论文5篇,其中核心期刊3篇',
    attachments: '个人简历.pdf；学历学位证明.pdf；代表性成果.zip',
    technicalTitle: '讲师', professionalQualification: '高等学校教师资格', postdoctoral: '无',
    sciPapers: 3, eiPapers: 2, istpPapers: 0, reprintPapers: 0,
    corePapers: 3, nationalPapers: 1, ministryPapers: 0, provincialPapers: 1, municipalPapers: 0,
    publications: '2024年《高校智能招聘决策模型研究》，第一作者，核心期刊',
    books: '2023年参编《数据驱动的组织管理》，高等教育出版社',
    patents: '发明专利 1 项：一种人才匹配评估方法（已授权）',
    projects: '主持省级高校人才评价研究项目 1 项，参与市级科研项目 2 项',
  }
}

function safeFilename(value) {
  return String(value || '').replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '').replace(/-+/g, '-')
}

// 拟录用结果（Excel「拟录用」环节表格字段：拟录用结果）
function proposedHireStatusOf(row) {
  return row.hireResult || '待录入'
}

function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

function createResumeZip(files) {
  const encoder = new TextEncoder()
  const parts = []
  const centralParts = []
  let offset = 0
  files.forEach(file => {
    const name = encoder.encode(file.name)
    const content = file.content instanceof Uint8Array ? file.content : encoder.encode(file.content)
    const crc = crc32(content)
    const local = new Uint8Array(30 + name.length + content.length)
    const localView = new DataView(local.buffer)
    localView.setUint32(0, 0x04034b50, true)
    localView.setUint16(4, 20, true)
    localView.setUint16(6, 0x0800, true)
    localView.setUint32(14, crc, true)
    localView.setUint32(18, content.length, true)
    localView.setUint32(22, content.length, true)
    localView.setUint16(26, name.length, true)
    local.set(name, 30)
    local.set(content, 30 + name.length)
    parts.push(local)

    const central = new Uint8Array(46 + name.length)
    const centralView = new DataView(central.buffer)
    centralView.setUint32(0, 0x02014b50, true)
    centralView.setUint16(4, 20, true)
    centralView.setUint16(6, 20, true)
    centralView.setUint16(8, 0x0800, true)
    centralView.setUint32(16, crc, true)
    centralView.setUint32(20, content.length, true)
    centralView.setUint32(24, content.length, true)
    centralView.setUint16(28, name.length, true)
    centralView.setUint32(42, offset, true)
    central.set(name, 46)
    centralParts.push(central)
    offset += local.length
  })
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0)
  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(8, files.length, true)
  endView.setUint16(10, files.length, true)
  endView.setUint32(12, centralSize, true)
  endView.setUint32(16, offset, true)
  return new Blob([...parts, ...centralParts, end], { type: 'application/zip' })
}

function ProcessAuditPage() {
  const [tab, setTab] = useState('pending')
  const [rows, setRows] = useState(loadRows)
  const [selectedStage, setSelectedStage] = useState('')
  const emptyFilters = { category: '', job: '', unit: '', status: '', subStatus: '', name: '', sendStatus: '' }
  const [filters, setFilters] = useState(emptyFilters)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [opinion, setOpinion] = useState('')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState('')
  const [batchAuditOpen, setBatchAuditOpen] = useState(false)
  const [detailAuditOpen, setDetailAuditOpen] = useState(false)
  // 简历详情右上角「动态」抽屉（日志 / 流程图）
  const [dynamicsOpen, setDynamicsOpen] = useState(false)
  const [dynamicsTab, setDynamicsTab] = useState('timeline')
  const [detailAuditResult, setDetailAuditResult] = useState('pass')
  const [recordDetail, setRecordDetail] = useState(null)
  const [attachmentPreview, setAttachmentPreview] = useState(null)
  const [uploadAdmissionOpen, setUploadAdmissionOpen] = useState(false)
  const [resumeGenerationProgress, setResumeGenerationProgress] = useState(null)
  const resumeGenerationTimer = useRef(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [scoreImportOpen, setScoreImportOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationType, setNotificationType] = useState('')
  const [notificationTemplates, setNotificationTemplates] = useState([
    { key: 'handling', name: '办理提醒', title: '招聘事项办理提醒', system: '<p>您好，您申报的招聘事项已进入当前办理环节，请及时登录系统查看并按要求完成后续操作。</p>', email: '<p>您好：</p><p>您申报的招聘事项有新的办理进展，请登录智慧人事一体化服务系统查看详情。</p><p>此邮件由系统自动发送，请勿直接回复。</p>', sms: '您申报的招聘事项有新的办理进展，请登录智慧人事一体化服务系统查看详情。' },
    { key: 'admission', name: '准考证发放通知', title: '招聘考试准考证发放通知', system: '<p>您好，您的准考证已发放，请及时登录系统下载并核对信息。</p>', email: '<p>您好：</p><p>您的招聘考试准考证已发放，请登录系统下载，并按准考证上的时间、地点参加考试。</p>', sms: '您的招聘考试准考证已发放，请及时登录系统下载并核对信息。' },
    { key: 'interview', name: '面试安排通知', title: '招聘面试安排通知', system: '<p>您好，您的面试安排已发布，请登录系统查看具体时间和地点。</p>', email: '<p>您好：</p><p>您的面试安排已发布，请登录系统查看具体时间、地点及注意事项。</p>', sms: '您的面试安排已发布，请登录系统查看具体时间、地点及注意事项。' },
  ])
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationContent, setNotificationContent] = useState('')
  const [notificationEmailContent, setNotificationEmailContent] = useState('')
  const [notificationSmsContent, setNotificationSmsContent] = useState('')
  const [admissionIssueOpen, setAdmissionIssueOpen] = useState(false)
  const selectedNotificationTemplate = notificationTemplates.find((item) => item.key === notificationType)
  const notificationTemplateModified = notificationType === 'custom'
    || !selectedNotificationTemplate
    || notificationTitle !== selectedNotificationTemplate.title
    || notificationContent !== selectedNotificationTemplate.system
    || notificationEmailContent !== selectedNotificationTemplate.email
    || notificationSmsContent !== selectedNotificationTemplate.sms
  const hasNotificationChannel = Boolean(notificationContent.trim() || notificationEmailContent.trim() || notificationSmsContent.trim())
  const openNotification = () => {
    if (!selectedKeys.length) { notify('请先选择人员'); return }
    setNotificationType('')
    setNotificationTitle('')
    setNotificationContent('')
    setNotificationEmailContent('')
    setNotificationSmsContent('')
    setNotificationOpen(true)
  }

  const planMap = useMemo(() => Object.fromEntries(ALL_PLANS.map((plan) => [plan.id, plan])), [])
  const activePlanIds = useMemo(() => new Set(PLANS.map((plan) => plan.id)), [])
  const allPlanIds = useMemo(() => new Set(ALL_PLANS.map((plan) => plan.id)), [])
  const isPending = useCallback((r) => !r.handledOnly && !TERMINAL_STATUSES.includes(r.subStatus) && !!STATUS_SEQUENCES[r.currentNode], [])
  const pendingRows = useMemo(() => rows.filter((row) => activePlanIds.has(row.planId) && isPending(row)), [activePlanIds, isPending, rows])
  const handledRows = useMemo(() => {
    const records = rows.flatMap((row) => (row.handledRecords || []).map((record) => ({
    ...row,
    ...record,
    candidateId: row.id,
    history: row.history || [],
    }))).filter((row) => allPlanIds.has(row.planId))
    if (records.length) return records
    return rows.filter((row) => allPlanIds.has(row.planId) && row.currentNode !== '资格审查')
      .slice(0, 18)
      .map((row, index) => ({
        ...row,
        id: `${row.id}-handled-demo`,
        candidateId: row.id,
        status: index % 5 === 0 ? '不通过' : '已办理',
        handledAt: `2026-08-${String((index % 8) + 1).padStart(2, '0')} 10:${String(index + 10).padStart(2, '0')}`,
        handledBy: index % 2 ? '李明' : '王芳',
        history: [...(row.history || []), '2026-08-01 10:00 · 已完成当前环节办理'],
      }))
  }, [allPlanIds, rows])
  const tabRows = tab === 'pending' ? pendingRows : handledRows
  const jobOptions = useMemo(() => [...new Set(rows.map((row) => row.jobName).filter(Boolean))].sort(), [rows])
  const unitOptions = useMemo(() => [...new Set(rows.map((row) => String(row.jobName || '').split('·')[0]).filter(Boolean))].sort(), [rows])

  // 左侧:按「招聘计划」分组,叶节点 = 大环节(合并该环节下所有状态签的人数)。
  // 待我办理:进行中计划平铺;我已办理:顶层分「进行中的计划 / 已结束的计划」两块。
  const planTree = useMemo(() => {
    const matchingPlans = ALL_PLANS.filter((plan) => !filters.category || plan.categoryKey === filters.category)
    // 待办保持原有单计划工作视图；已办必须能回看所有计划的历史。
    const plansInScope = tab === 'pending' ? matchingPlans.slice(0, 1) : matchingPlans
    const buildTypes = (plan) => {
      return RECRUITMENT_TYPES.map((type) => ({
        type,
        nodes: (PROCESS_NODES_BY_TYPE[type] || []).map((node) => {
          const list = tabRows.filter((r) => r.planId === plan.id && recruitmentTypeOf(r) === type && r.currentNode === node)
          return { node, count: list.length, overdue: list.filter((r) => dueTone(r) === 'danger').length }
        }),
      }))
    }
    return plansInScope.map((plan) => ({
      plan,
      status: plan.status,
      types: buildTypes(plan),
    })).filter((group) => group.types.length)
  }, [filters.category, tabRows, tab])

  const defaultStage = useMemo(() => {
    const stages = planTree.flatMap((group) => group.types.flatMap(type => type.nodes.map((node) => ({ key: `${group.plan.id}|${type.type}|${node.node}`, node }))))
    const firstOverdue = stages.find((stage) => stage.node.overdue > 0)
    return firstOverdue ? firstOverdue.key : (stages[0]?.key || '')
  }, [planTree])
  const validStageKeys = useMemo(() => {
    const set = new Set()
    planTree.forEach((group) => group.types.forEach(type => type.nodes.forEach((node) => set.add(`${group.plan.id}|${type.type}|${node.node}`))))
    return set
  }, [planTree])
  const stageKey = validStageKeys.has(selectedStage) ? selectedStage : defaultStage
  const [stagePlanId, stageRecruitmentType, stageNode] = stageKey ? stageKey.split('|') : ['', '', '']

  const stageBaseRows = useMemo(() => {
    return tabRows.filter((row) => {
    if (row.planId !== stagePlanId || row.currentNode !== stageNode) return false
    if (recruitmentTypeOf(row) !== stageRecruitmentType) return false
    if (filters.category && row.categoryKey !== filters.category) return false
    if (tab === 'done' && filters.status && planMap[row.planId]?.status !== filters.status) return false
    if (filters.job && row.jobName !== filters.job) return false
    if (filters.unit && String(row.jobName || '').split('·')[0] !== filters.unit) return false
    // 关键词：姓名 / 证件号 / 手机号（对齐 Excel 筛选字段「关键词」）
    if (filters.name) {
      const keyword = filters.name.trim()
      if (keyword && ![row.name, phoneOf(row), String(row.idCard || '')].some((value) => String(value || '').includes(keyword))) return false
    }
    // 发送状态：已发送 / 未发送（对齐 Excel 筛选字段）
    if (filters.sendStatus === '已发送' && !(Number(row.sendCount) > 0)) return false
    if (filters.sendStatus === '未发送' && Number(row.sendCount) > 0) return false
    return true
    })
  }, [filters, planMap, stageNode, stagePlanId, stageRecruitmentType, tab, tabRows])

  const availableSubStatuses = useMemo(() => {
    const present = new Set(stageBaseRows.map((row) => row.subStatus))
    const defined = (STATUS_SEQUENCES[stageNode] || []).filter((status) => !((stageNode === '笔试' || stageNode === '面试') && status === '待确认结果'))
    const ordered = tab === 'pending' ? [...defined] : defined.filter((status) => present.has(status))
    present.forEach((status) => {
      if ((stageNode === '笔试' || stageNode === '面试') && status === '待确认结果') return
      if (stageNode === '校级面试' && status === '待审核') return
      if (!ordered.includes(status)) ordered.push(status)
    })
    return ordered
  }, [stageBaseRows, stageNode, tab])

  const statusCounts = useMemo(() => Object.fromEntries(availableSubStatuses.map((status) => [
    status,
    stageBaseRows.filter((row) => row.subStatus === status
      || (status === '待录成绩' && row.subStatus === '待发准考证' && row.issuedAt)
      || (status === '待录成绩' && row.subStatus === '待确认结果')).length,
  ])), [availableSubStatuses, stageBaseRows])
  const defaultSubStatus = availableSubStatuses.find((status) => statusCounts[status] > 0) || availableSubStatuses[0] || ''
  const currentSubStatus = filters.subStatus && availableSubStatuses.includes(filters.subStatus)
      ? filters.subStatus
      : defaultSubStatus
  const batchActions = nodeActionsFor(stageRecruitmentType, stageNode, currentSubStatus)
  const showInlineSubStatusFilter = availableSubStatuses.length > 1
    && !['综合素质考察'].includes(stageNode)
  const displaySubStatus = (status) => status === '待录成绩' ? '待确认结果' : status
  const showSendStatusFilter = tab === 'pending' && !['资格审查', '确认名单'].includes(stageNode)
  const primaryFilterCount = 3
    + (showSendStatusFilter ? 1 : 0)
    + (tab === 'done' ? 1 : 0)
  const filterClassName = `pra-filter${primaryFilterCount >= 3 ? ' has-extra' : ''}`

  const filtered = useMemo(() => stageBaseRows.filter((row) => {
    const isIssuedWaitingForScore = currentSubStatus === '待录成绩' && row.subStatus === '待发准考证' && !!row.issuedAt
    const isWaitingForResultInMergedScoreView = currentSubStatus === '待录成绩' && row.subStatus === '待确认结果'
    if (currentSubStatus && row.subStatus !== currentSubStatus && !isIssuedWaitingForScore && !isWaitingForResultInMergedScoreView) return false
    return true
  }).sort((a, b) => {
    if (currentSubStatus === '待确认结果') return (Number(b.score) || 0) - (Number(a.score) || 0)
    const ta = dueTone(a) === 'danger' ? 0 : 1
    const tb = dueTone(b) === 'danger' ? 0 : 1
    if (ta !== tb) return ta - tb
    return new Date(a.dueAt) - new Date(b.dueAt)
  }), [currentSubStatus, stageBaseRows, stageNode])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const active = filtered.find((row) => row.id === activeId) || rows.find((row) => row.id === activeId)
  const activeIndex = filtered.findIndex((row) => row.id === activeId)
  const resume = active ? resumeOf(active) : null
  const activePlan = active ? planMap[active.planId] : null
  // 详情抽屉内「单人」操作与批量操作同源（按该人所在环节 + 招聘方式取动作），过滤掉批量专属动作
  const detailActions = active && tab === 'pending'
    ? nodeActionsFor(recruitmentTypeOf(active), active.currentNode, active.subStatus).filter((action) => PERSON_ACTION_KEYS.has(action.key))
    : []

  const notify = useCallback((message) => { setToast(message); setTimeout(() => setToast(''), 1800) }, [])
  const save = useCallback((next) => { setRows(next); sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)) }, [])
  // 字段配置（按环节单独配置表格字段）
  const [fieldConfigs, setFieldConfigs] = useState(() => loadFieldConfigs())
  const [fieldEditorOpen, setFieldEditorOpen] = useState(false)
  const [fieldEditorStage, setFieldEditorStage] = useState('')
  const [fieldDraft, setFieldDraft] = useState([])
  useEffect(() => () => {
    if (resumeGenerationTimer.current) clearInterval(resumeGenerationTimer.current)
  }, [])
  const cancelResumeGeneration = useCallback(() => {
    if (resumeGenerationTimer.current) clearInterval(resumeGenerationTimer.current)
    resumeGenerationTimer.current = null
    setResumeGenerationProgress(null)
    notify('已取消生成简历文件')
  }, [notify])
  const downloadResumes = useCallback(() => {
    if (resumeGenerationTimer.current) return
    const selected = filtered.filter(row => selectedKeys.includes(row.id))
    if (!selected.length) { notify('请先选择人员'); return }
    const first = selected[0]
    const [unit, ...positionParts] = String(first.jobName || '招聘单位-招聘岗位').split('·')
    const position = positionParts.join('·') || '招聘岗位'
    const firstResume = resumeOf(first)
    const baseName = selected.length === 1
      ? `${unit}-${position}_${first.name}_${firstResume.idCard}`
      : `${unit}-${position}_${first.name}等${selected.length}人_简历包`
    const files = selected.flatMap(row => {
      const rowResume = resumeOf(row)
      const rowUnit = row.jobName?.split('·')[0] || '招聘单位'
      const rowPosition = row.jobName?.split('·').slice(1).join('·') || '招聘岗位'
      const folderName = safeFilename(`${rowUnit}-${rowPosition}_${row.name}_${rowResume.idCard}`)
      const form = `深圳职业技术大学岗位报名表\n姓名：${row.name}\n招聘岗位：${rowPosition}\n身份证号：${rowResume.idCard}\n最高学历：${row.degree || '-'}\n毕业院校：${row.school || '-'}\n所学专业：${row.major || '-'}\n联系电话：${rowResume.phone}\n`
      return [
        { name: `${folderName}/材料附件（请严格按照公告要求上传材料附件）.pdf`, content: `报名材料清单\n${form}` },
        { name: `${folderName}/${folderName}.zip_报名表.pdf`, content: form },
        { name: `${folderName}/个人一寸相片.jpg`, content: `${row.name}个人一寸相片` },
      ]
    })
    setResumeGenerationProgress(6)
    resumeGenerationTimer.current = window.setInterval(() => {
      setResumeGenerationProgress((current) => {
        const next = Math.min(100, (current || 0) + (current < 45 ? 9 : current < 80 ? 7 : 4))
        if (next < 100) return next
        clearInterval(resumeGenerationTimer.current)
        resumeGenerationTimer.current = null
        window.setTimeout(() => {
          const url = URL.createObjectURL(createResumeZip(files))
          const link = document.createElement('a')
          link.href = url
          link.download = `${safeFilename(baseName)}.zip`
          link.click()
          URL.revokeObjectURL(url)
          setResumeGenerationProgress(null)
          notify(`简历文件生成完成，已自动下载 ${selected.length} 人简历包`)
        }, 240)
        return 100
      })
    }, 260)
  }, [filtered, notify, selectedKeys])
  const resetFilters = () => { setFilters(emptyFilters); setSelectedKeys([]); setPage(1) }
  const selectStage = (key) => {
    setSelectedStage(key)
    setSelectedKeys([])
    setPage(1)
    setActiveId(null)
    setFilters((prev) => ({ ...emptyFilters, category: prev.category }))
  }

  // 应用一个动作到单条记录,返回改动后的记录(不落盘)
  const applyActionToRow = useCallback((row, actionKeyName) => {
    const plan = planMap[row.planId]
    const next = { ...row, handledAt: timeNow(), handledBy: '李明' }
    const history = [...(row.history || [])]
    const opinionText = opinion || (actionKeyName === 'reject' ? '材料不完整' : '')

    switch (actionKeyName) {
      case 'pass': {
        const nextStage = nextStageFirstStatus(plan, row.currentNode, row)
        if (nextStage) {
          next.currentNode = nextStage.node
          next.subStatus = nextStage.subStatus
          history.push(`${next.handledAt} · ${dispStage(row.currentNode)} 通过 → ${dispStage(nextStage.node)}·${nextStage.subStatus}${opinionText ? ' · ' + opinionText : ''}`)
        } else {
          // 最后一环节（拟录用）通过：流程结束，转入「录用办理」菜单继续办理
          next.subStatus = '已录用'
          history.push(`${next.handledAt} · 通过并结束流程（转入录用办理）`)
        }
        break
      }
      case 'reject': // 资格审查·退回:退回考生补材料;实际状态保持"待审核",打上"补交"标签
        next.rebmit = true
        history.push(`${next.handledAt} · 退回考生补交材料${opinionText ? ' · ' + opinionText : ''}`)
        break
      case 'unpass':
        next.subStatus = '不通过'
        history.push(`${next.handledAt} · ${dispStage(row.currentNode)} 不通过${opinionText ? ' · ' + opinionText : ''}`)
        break
      case 'confirm': {
        const stages = STATUS_SEQUENCES[row.currentNode] || []
        const idx = stages.indexOf(row.subStatus)
        next.subStatus = stages[idx + 1] || row.subStatus
        history.push(`${next.handledAt} · 确认参加 → ${next.subStatus}`)
        break
      }
      case 'skip':
        next.subStatus = '放弃'
        history.push(`${next.handledAt} · 标记不参加(放弃)`)
        break
      case 'issue': {
        if ((row.currentNode === '笔试' || row.currentNode === '面试' || row.currentNode === '校级面试') && row.subStatus === '待发准考证') {
          next.admissionNo = row.admissionNo || `2026${Math.floor(10000 + Math.random() * 90000)}`
        }
        next.issuedAt = timeNow()
        next.downloadStatus = row.downloadStatus === '已下载' ? '已下载' : '已发未下载'
        history.push(`${next.handledAt} · 准考证已发放`)
        break
      }
      case 'fit': {
        // 选聘·资格审查「符合」：标记符合，数据进入下一环节
        const nextStage = nextStageFirstStatus(plan, row.currentNode, row)
        if (nextStage) {
          next.currentNode = nextStage.node
          next.subStatus = nextStage.subStatus
          history.push(`${next.handledAt} · ${dispStage(row.currentNode)} 符合 → ${dispStage(nextStage.node)}·${nextStage.subStatus}`)
        }
        break
      }
      case 'unpassAdvance': {
        // 选聘·资格审查「不符合」：仅标记不符合，数据仍进入下一环节
        const nextStage = nextStageFirstStatus(plan, row.currentNode, row)
        if (nextStage) {
          next.currentNode = nextStage.node
          next.subStatus = nextStage.subStatus
          history.push(`${next.handledAt} · ${dispStage(row.currentNode)} 标记不符合，数据进入 ${dispStage(nextStage.node)}·${nextStage.subStatus}`)
        }
        break
      }
      default:
        break
    }
    next.opinion = opinionText || next.opinion
    next.history = history
    const status = handledStatus(actionKeyName)
    if (status) {
      next.handledRecords = [
        ...(row.handledRecords || []),
        {
          id: `${row.id}-handled-${Date.now()}-${history.length}`,
          candidateId: row.id,
          planId: row.planId,
          categoryKey: row.categoryKey,
          currentNode: row.currentNode,
          subStatus: row.subStatus,
          status,
          name: row.name,
          jobId: row.jobId,
          jobName: row.jobName,
          phone: phoneOf(row),
          school: row.school,
          degree: row.degree,
          score: next.score ?? row.score,
          handledAt: next.handledAt,
          handledBy: next.handledBy,
          opinion: opinionText,
        },
      ]
    }
    return next
  }, [opinion, planMap])

  const processOne = useCallback((actionKeyName) => {
    if (!active) return
    if (actionKeyName === 'issue') {
      setSelectedKeys([active.id])
      setAdmissionIssueOpen(true)
      return
    }
    if (actionKeyName === 'reject' && !opinion.trim()) { notify('请填写退回原因'); return }
    const next = rows.map((row) => row.id === active.id ? applyActionToRow(row, actionKeyName) : row)
    save(next)
    const label = detailActions.find((a) => a.key === actionKeyName)?.label || '已办理'
    notify(`已完成:${label}`)
    setActiveId(actionKeyName === 'pass' || actionKeyName === 'fit' ? filtered.filter((row) => row.id !== active.id)[0]?.id || null : null)
    setOpinion('')
  }, [active, applyActionToRow, detailActions, filtered, notify, opinion, rows, save])

  const batchProcess = useCallback((actionKeyName) => {
    if (actionKeyName === 'issue') {
      setAdmissionIssueOpen(true)
      return
    }
    if (actionKeyName === 'uploadAdmission') {
      setUploadProgress(0)
      setUploadAdmissionOpen(true)
      return
    }
    if (actionKeyName === 'import') {
      setScoreImportOpen(true)
      return
    }
    // 算分：按 Excel 各环节推荐结果规则计算，作用于当前视图全部人员（非自动触发，点击按钮才计算）
    if (actionKeyName === 'calculate') {
      const patch = computeRecommend(filtered, stageNode, stageRecruitmentType)
      if (!patch.size) { notify('当前没有可算分的人员'); return }
      const counts = { 通过: 0, 递补: 0, 不通过: 0 }
      const next = rows.map((row) => {
        const item = patch.get(row.id)
        if (!item) return row
        counts[item.recommendResult] = (counts[item.recommendResult] || 0) + 1
        return {
          ...row,
          recommendResult: item.recommendResult,
          currentRank: item.currentRank,
          history: [...(row.history || []), `${timeNow()} · 算分：推荐结果「${item.recommendResult}」，当前岗位排名第 ${item.currentRank} 名`],
        }
      })
      save(next)
      notify(`算分完成：通过 ${counts['通过'] || 0} 人、递补 ${counts['递补'] || 0} 人、不通过 ${counts['不通过'] || 0} 人`)
      return
    }
    if (!selectedKeys.length) { notify('请先选择人员'); return }
    const set = new Set(selectedKeys)
    const next = rows.map((row) => set.has(row.id) ? applyActionToRow(row, actionKeyName) : row)
    save(next)
    const label = batchActions.find((item) => item.key === actionKeyName)?.label || '批量办理'
    notify(`已${label} ${selectedKeys.length} 人`)
    setSelectedKeys([])
  }, [applyActionToRow, batchActions, filtered, notify, rows, save, selectedKeys, stageNode, stageRecruitmentType])
  const showAiCol = false
  const openDetail = (row) => { setActiveId(row.id); setOpinion('') }
  const nameColumn = {
    key: 'name',
    dataIndex: 'name',
    title: '姓名',
    width: 88,
    fixed: 'left',
    render: (value, row) => <span className="pra-name-cell"><a className="pra-name-link" onClick={(e) => { e.stopPropagation(); openDetail(row) }}>{value}</a>{row.rebmit ? <StatusPill value="补交" /> : null}</span>,
  }
  const unitColumn = {
    key: 'unit',
    dataIndex: 'unit',
    title: '招聘部门',
    width: 140,
    render: (_, row) => tooltipText(String(row.jobName || '').split('·')[0] || '-'),
  }
  const phoneColumn = { key: 'phone', dataIndex: 'phone', title: '联系方式', width: 132, render: (_, row) => phoneOf(row) }
  const tooltipText = (value) => <span className="pra-ellipsis-tip" title={value || '-'}>{value || '-'}</span>

  // ── 简历详情：全部字段来自 hr-domain 通用简历字段库（单源），改库即全页同步 ──
  const RESUME_SECTIONS = listResumeSections()

  function resumeModelOf(row) {
    const r = resumeOf(row)
    const doctor = row.degree === '博士'
    const school = row.school || r.school
    const major = row.major || r.major
    return {
      basic: {
        name: row.name,
        gender: r.gender,
        birth: r.birth,
        workStart: r.workStart,
        nation: r.nation,
        nativePlace: r.nativePlace,
        marriage: r.marriage,
        household: r.household,
        idCard: r.idCard,
        photo: candidatePhoto,
        phone: r.phone,
        usedName: r.formerName,
        politics: r.politics,
        email: r.email,
        topMajor: major,
        topSchool: school,
        topDegree: row.degree || (doctor ? '博士学位' : '硕士学位'),
        nationality: '中国',
      },
      spouse: {
        name: r.spouseName, birth: r.spouseBirth, household: r.spouseHousehold,
        nation: r.spouseNation, nativePlace: r.spouseNativePlace, workUnit: r.spouseWorkUnit,
      },
      application: {
        batch: '2026年公开招聘',
        department: row.unit || '-',
        position: row.jobName,
        positionCode: '-',
        campus: '-',
        recruitType: recruitmentTypeOf(row),
        applyTime: row.applyTime || '-',
        status: row.subStatus,
      },
      education: [
        { id: 'bachelor', level: '本科', school, major, majorCode: '-', education: '本科', degree: '学士', startDate: '2012-09-01', endDate: '2016-06-30', overseas: '境内', certificate: '学历学位证书.pdf' },
        { id: 'master', level: '硕士研究生', school: '华南理工大学', major: '软件工程', majorCode: '-', education: '硕士', degree: '硕士', startDate: '2016-09-01', endDate: '2019-06-30', overseas: '境内', certificate: '学历学位证书.pdf' },
        ...(doctor ? [{ id: 'doctor', level: '博士研究生', school, major, majorCode: '-', education: '博士', degree: '博士', startDate: '2019-09-01', endDate: '2023-06-30', overseas: '境内', certificate: '学历学位证书.pdf' }] : []),
      ],
      work: [
        { id: 'work-1', startDate: '2019-07-01', endDate: '至今', unit: '某高校', position: '综合管理岗', duty: '综合事务与项目管理' },
      ],
      technical: [
        { id: 'tech-1', title: r.technicalTitle, major: '-', acquireDate: '-', certificate: '-' },
      ],
      professional: [
        { id: 'pro-1', qualification: r.professionalQualification, major: '-', acquireDate: '-', certificate: '-' },
      ],
      postdoc: {
        station: r.postdoctoral === '无' ? '-' : r.postdoctoral,
        research: '-',
        startDate: '-', endDate: '-',
        supervisor: '-',
      },
      paperStats: {
        sci: r.sciPapers, ei: r.eiPapers, istp: r.istpPapers, rucopy: r.reprintPapers,
        core: r.corePapers, national: r.nationalPapers, ministerial: r.ministryPapers,
        provincial: r.provincialPapers, municipal: r.municipalPapers,
      },
      research: {
        papers: [
          { id: 'paper-1', title: '高校智能招聘决策模型研究', authors: '第一作者', journal: '高等教育研究', level: '核心', publishDate: '2024-06', impact: '-' },
          { id: 'paper-2', title: '数据驱动的人才评价机制研究', authors: '通讯作者', journal: '教育管理评论', level: '核心', publishDate: '2023-12', impact: '-' },
        ],
        publications: [
          { id: 'book-1', title: '数据驱动的组织管理', authors: '参编', publisher: '高等教育出版社', publishDate: '2023-08', type: '学术专著' },
        ],
        patents: [
          { id: 'patent-1', title: '一种人才匹配评估方法', type: '发明专利', status: '已授权', patentNo: 'ZL202410123456.7', authors: row.name },
        ],
        projects: [
          { id: 'project-1', title: '省级高校人才评价研究项目', type: '教育科研', role: '主持', startDate: '2024-01-10', endDate: '至今', funding: '-' },
        ],
        awards: [
          { id: 'award-1', title: '校级优秀教育工作者', level: '校级', year: '2023', organization: '某高校' },
        ],
      },
      language: {
        type: '英语', level: '大学英语六级', score: '528', acquireDate: '-',
      },
      submission: {
        formDate: row.applyTime ? String(row.applyTime).slice(0, 10) : '2026-03-30',
        signature: row.name,
      },
      attachments: [
        { id: 'id-front', cat: '身份证', name: '居民身份证正面.pdf', time: '2026-03-10 09:12', status: '已上传', url: identityScan },
        { id: 'id-back', cat: '身份证', name: '居民身份证反面.pdf', time: '2026-03-10 09:12', status: '已上传', url: identityScan },
        { id: 'party-1', cat: '党员材料', name: '党员身份证明.pdf', time: '2026-03-10 09:15', status: '已上传', url: documentScan },
        { id: 'party-2', cat: '党员材料', name: '党组织关系证明.pdf', time: '2026-03-10 09:15', status: '已上传', url: identityScan },
        { id: 'promise', cat: '诚信承诺书', name: '应聘人员诚信承诺书.pdf', time: '2026-03-10 09:20', status: '已上传', url: documentScan },
        { id: 'other-1', cat: '其他证明材料', name: '教师资格证.pdf', time: '2026-03-11 10:02', status: '已上传', url: candidatePhoto },
        { id: 'other-2', cat: '其他证明材料', name: '工作经历证明.pdf', time: '2026-03-11 10:05', status: '已上传', url: documentScan },
        { id: 'other-3', cat: '其他证明材料', name: '代表性成果证明材料.zip', time: '2026-03-11 10:08', status: '已上传', url: researchPdf },
      ],
    }
  }

  function renderResumeFieldValue(field, model) {
    const value = resolveResumeValue(model, field.path)
    if (field.render === 'photo') {
      return <div className="pra-id-photo" role="img" aria-label="证件照"><img src={value} alt="证件照" /></div>
    }
    if (field.render === 'maskedId') {
      const s = String(value || '')
      return s.length > 10 ? `${s.slice(0, 4)}**********${s.slice(-4)}` : (value || '-')
    }
    if (field.render === 'statusTag') return <StatusPill value={value} />
    return value == null || value === '' ? '-' : value
  }

  function renderFormSection(section, model) {
    const fields = listResumeFormFields(section.sectionKey)
    return (
      <section className="pra-detail-section" id={`detail-${section.sectionKey}`}>
        <div className="ti-section-head"><h3>{section.title}</h3></div>
        <DSReadOnlyForm columns={2} items={fields.map((f) => ({
          label: f.label,
          fullWidth: f.render === 'photo',
          value: renderResumeFieldValue(f, model),
        }))} />
      </section>
    )
  }

  function renderTableSection(section, model) {
    const cols = listResumeColumns(section.sectionKey)
    const rows = model[section.sectionKey] || []
    const hasOp = cols.some((c) => c.key === 'op')
    const columns = [
      ...cols.map((c) => {
        if (c.key === 'op') {
          return {
            key: 'op', title: c.title, width: c.width,
            render: (_, item) => <DSButton variant="link" onClick={() => setAttachmentPreview({ name: item.name, url: item.url || researchPdf })}>预览</DSButton>,
          }
        }
        return {
          key: c.key, title: c.title, width: c.width, minWidth: c.minWidth,
          render: (_, item) => {
            if (c.computed === 'period') {
              const start = item.startDate || item.start || ''
              const end = item.endDate || item.end || ''
              return (start || end) ? `${start} — ${end}` : '-'
            }
            if (c.attachmentView) return item[c.key] || '-'
            if (c.render === 'statusTone') return <StatusPill value={item[c.key]} />
            const v = item[c.key]
            return v == null || v === '' ? '-' : v
          },
        }
      }),
      ...(hasOp ? [] : [{
        key: 'action', title: '操作', width: 72,
        render: (_, item) => (
          <DSButton variant="link" onClick={() => setRecordDetail({
            type: section.title,
            fields: cols
              .filter((c) => c.key !== 'action' && c.key !== 'op')
              .map((c) => [c.title, c.computed === 'period' ? `${item.startDate || item.start || ''} — ${item.endDate || item.end || ''}` : (item[c.key] ?? '-')]),
          })}>详情</DSButton>
        ),
      }]),
    ]
    return (
      <section className="pra-detail-section" id={`detail-${section.sectionKey}`}>
        <div className="ti-section-head"><h3>{section.title}</h3></div>
        <DSDataTable bordered columns={columns} data={rows} rowKey="id" selectable={false} showToolbar={false} pagination={false} />
      </section>
    )
  }

  function renderResearchSection(section, model) {
    const subs = listResumeSubsections(section.sectionKey)
    const data = model.research || {}
    return (
      <section className="pra-detail-section" id={`detail-${section.sectionKey}`}>
        <div className="ti-section-head"><h3>{section.title}</h3></div>
        {subs.map((sub) => {
          const rows = data[sub.key] || []
          const columns = [
            ...sub.columns.map((c) => ({
              key: c.key, title: c.title, width: c.width, minWidth: c.minWidth,
              render: (_, item) => { const v = item[c.key]; return v == null || v === '' ? '-' : v },
            })),
            {
              key: 'action', title: '操作', width: 72,
              render: (_, item) => (
                <DSButton variant="link" onClick={() => setRecordDetail({
                  type: sub.title,
                  fields: sub.columns.map((c) => [c.title, item[c.key] ?? '-']),
                })}>详情</DSButton>
              ),
            },
          ]
          return (
            <div key={sub.key}>
              <h4 className="pra-secondary-heading">{sub.title}</h4>
              <DSDataTable bordered columns={columns} data={rows} rowKey="id" selectable={false} showToolbar={false} pagination={false} />
            </div>
          )
        })}
      </section>
    )
  }

  function renderResumeSection(section, model) {
    if (section.kind === 'form') return renderFormSection(section, model)
    if (section.kind === 'table') return renderTableSection(section, model)
    if (section.kind === 'research') return renderResearchSection(section, model)
    return null
  }
  const jobColumn = { key: 'jobName', dataIndex: 'jobName', title: '应聘岗位', width: 190, render: tooltipText }
  const openBatchAudit = () => {
    if (!selectedKeys.length) { notify('请先选择人员'); return }
    setOpinion('')
    setBatchAuditOpen(true)
  }
  const scoreValue = (value) => value == null || value === '' ? '-' : <span className={Number(value) > 60 ? 'pra-score-pass' : ''}>{value}</span>
  const writtenScoreColumn = {
    key: 'writtenResultScore',
    title: '笔试成绩',
    width: 110,
    align: 'right',
    render: (_, row) => scoreValue(writtenScoreOf(row)),
  }
  const qualityScoreColumn = {
    key: 'qualityScore', title: '综合素质考察成绩', width: 150, align: 'right',
    render: (_, row) => scoreValue(qualityScoreOf(row)),
  }
  const interviewScoreColumn = {
    key: 'interviewResultScore', title: '面试成绩', width: 110, align: 'right',
    render: (_, row) => scoreValue(interviewScoreOf(row)),
  }
  const schoolInterviewScoreColumn = {
    key: 'schoolInterviewScore', title: '面试成绩', width: 120, align: 'right',
    render: (_, row) => scoreValue(schoolInterviewScoreOf(row)),
  }
  const deptInitialScoreColumn = {
    key: 'deptInitialScore', title: '部门初试成绩', width: 120, align: 'right',
    render: (_, row) => scoreValue(deptInitialScoreOf(row)),
  }
  const comprehensiveScoreColumn = {
    key: 'comprehensiveScore', title: '综合成绩', width: 120, align: 'right',
    render: (_, row) => <strong className={comprehensiveScoreOf(row) > 60 ? 'pra-score-pass' : 'pra-comprehensive-score'}>{comprehensiveScoreOf(row).toFixed(2)}</strong>,
  }
  const idCardColumn = { key: 'idCard', dataIndex: 'idCard', title: '证件号', width: 168, render: (value) => <span className="pra-mono">{value || '-'}</span> }
  const genderColumn = { key: 'gender', title: '性别', width: 64, align: 'center', render: (_, row) => row.gender || resumeOf(row).gender || '-' }
  const ageColumn = {
    key: 'age', title: '年龄', width: 72, align: 'center',
    render: (_, row) => {
      const birthYear = Number(String(resumeOf(row).birthDate || resumeOf(row).birth || '').slice(0, 4))
      return birthYear ? new Date().getFullYear() - birthYear : '-'
    },
  }
  const schoolColumn = { key: 'school', dataIndex: 'school', title: '毕业院校', width: 140, render: tooltipText }
  const degreeColumn = { key: 'degree', dataIndex: 'degree', title: '最高学历', width: 90 }
  const majorColumn = { key: 'major', dataIndex: 'major', title: '所学专业', width: 150, render: tooltipText }
  const rankColumn = { key: 'currentRank', dataIndex: 'currentRank', title: '当前环节岗位排名', width: 140, align: 'center', render: (value) => value != null ? value : '-' }
  const recommendColumn = {
    key: 'recommendResult', dataIndex: 'recommendResult', title: '推荐结果', width: 150, align: 'center',
    render: (value) => <StatusPill value={value || '未算分'} />,
  }
  const sendCountColumn = { key: 'sendCount', dataIndex: 'sendCount', title: '发送消息(次数)', width: 120, align: 'center', render: (value) => value != null ? value : 0 }
  const admissionNoColumn = { key: 'admissionNo', dataIndex: 'admissionNo', title: '准考证号', width: 130, render: (value) => value || '-' }
  const examRoomColumn = { key: 'examRoom', dataIndex: 'examRoom', title: '考场', width: 90, render: (value) => value || '-' }
  const seatNoColumn = { key: 'seatNo', dataIndex: 'seatNo', title: '座位号', width: 80, render: (value) => value || '-' }
  const examSiteColumn = { key: 'examSite', dataIndex: 'examSite', title: '考点名称', width: 140, render: (value) => value || '-' }
  const examAddressColumn = { key: 'examAddress', dataIndex: 'examAddress', title: '考点地址', width: 180, render: (value) => value || '-' }
  const examTimeColumn = { key: 'examTime', dataIndex: 'examTime', title: '考试时间', width: 150, render: (value) => value || '-' }
  const examTimeSubjectColumn = { key: 'examTimeSubject', dataIndex: 'examTimeSubject', title: '考试时间及科目', width: 170, render: (value) => value || '-' }
  const admissionIssueStatusColumn = { key: 'admissionIssueStatus', dataIndex: 'admissionIssueStatus', title: '准考证发放状态', width: 130, align: 'center', render: (value) => <StatusPill value={value || '未发放'} /> }
  const downloadStatusColumn = { key: 'downloadStatus', dataIndex: 'downloadStatus', title: '准考证下载状态', width: 130, align: 'center', render: (value) => value || '-' }
  const auditResultColumn = { key: 'auditResult', dataIndex: 'auditResult', title: '审核结果', width: 150, render: (value) => value || '-' }
  const hireStatusColumn = { key: 'hireStatus', title: '拟录用结果', width: 110, render: (_, row) => <StatusPill value={proposedHireStatusOf(row)} /> }
  const unitOpinionColumn = { key: 'unitOpinion', dataIndex: 'unitOpinion', title: '单位意见', width: 150, render: (value) => value || '-' }
  const suggestColumn = { key: 'suggest', dataIndex: 'suggest', title: '建议说明', width: 150, render: (value) => value || '-' }
  const qualityExamTimeColumn = { key: 'qualityExamTime', dataIndex: 'qualityExamTime', title: '综合素质考察时间', width: 150, render: (value) => value || '-' }
  const qualityMeetingColumn = { key: 'qualityMeetingNo', dataIndex: 'qualityMeetingNo', title: '综考腾讯会议号', width: 150, render: (value) => value || '-' }
  const qualityInterviewNoColumn = { key: 'qualityInterviewNo', dataIndex: 'qualityInterviewNo', title: '面试序号', width: 90, align: 'center', render: (value) => value != null ? value : '-' }

  // ── 按类型共享的字段池 ──
  // 每个环节从该类型的字段池中挑选要显示的字段，支持：
  //  1) 同类型不同环节字段不同；2) 后续环节借用前置环节的成绩列（只读）。
  const FIELD_DEFS = {
    writtenResultScore: { def: writtenScoreColumn, types: ['考试'], label: '笔试成绩' },
    interviewResultScore: { def: interviewScoreColumn, types: ['考试'], label: '面试成绩' },
    qualityScore: { def: qualityScoreColumn, types: ['考试'], label: '综合素质考察成绩' },
    schoolInterviewScore: { def: schoolInterviewScoreColumn, types: ['考试', '审核'], label: '面试成绩' },
    deptInitialScore: { def: deptInitialScoreColumn, types: ['考试', '审核'], label: '部门初试成绩' },
    comprehensiveScore: { def: comprehensiveScoreColumn, types: ['考试', '审核'], label: '综合成绩' },
    idCard: { def: idCardColumn, types: ['资格审查', '考试', '审核', '录用'], label: '证件号' },
    unit: { def: unitColumn, types: ['资格审查', '考试', '审核', '录用'], label: '招聘部门' },
    gender: { def: genderColumn, types: ['资格审查'], label: '性别' },
    age: { def: ageColumn, types: ['资格审查'], label: '年龄' },
    school: { def: schoolColumn, types: ['资格审查'], label: '毕业院校' },
    degree: { def: degreeColumn, types: ['资格审查'], label: '最高学历' },
    major: { def: majorColumn, types: ['资格审查'], label: '所学专业' },
    currentRank: { def: rankColumn, types: ['考试', '审核'], label: '当前环节岗位排名' },
    recommendResult: { def: recommendColumn, types: ['考试', '审核'], label: '推荐结果' },
    sendCount: { def: sendCountColumn, types: ['资格审查', '考试', '审核', '录用'], label: '发送消息(次数)' },
    admissionNo: { def: admissionNoColumn, types: ['考试'], label: '准考证号' },
    examRoom: { def: examRoomColumn, types: ['考试'], label: '考场' },
    seatNo: { def: seatNoColumn, types: ['考试'], label: '座位号' },
    examSite: { def: examSiteColumn, types: ['考试'], label: '考点名称' },
    examAddress: { def: examAddressColumn, types: ['考试'], label: '考点地址' },
    examTime: { def: examTimeColumn, types: ['考试'], label: '考试时间' },
    examTimeSubject: { def: examTimeSubjectColumn, types: ['考试'], label: '考试时间及科目' },
    admissionIssueStatus: { def: admissionIssueStatusColumn, types: ['考试'], label: '准考证发放状态' },
    downloadStatus: { def: downloadStatusColumn, types: ['考试'], label: '准考证下载状态' },
    auditResult: { def: auditResultColumn, types: ['审核'], label: '审核结果' },
    hireStatus: { def: hireStatusColumn, types: ['录用'], label: '拟录用结果' },
    unitOpinion: { def: unitOpinionColumn, types: ['资格审查'], label: '单位意见' },
    suggest: { def: suggestColumn, types: ['资格审查'], label: '建议说明' },
    qualityExamTime: { def: qualityExamTimeColumn, types: ['考试'], label: '综合素质考察时间' },
    qualityMeetingNo: { def: qualityMeetingColumn, types: ['考试'], label: '综考腾讯会议号' },
    qualityInterviewNo: { def: qualityInterviewNoColumn, types: ['考试'], label: '面试序号' },
  }
  // 按环节字段配置转换列表列：支持隐藏 / 改名 / 改列宽 / 排序 / 自定义字段 / 跨环节借用字段
  // cfg: { fields: [{ key, title?, width?, hidden?, custom?, source?, staticValue? }] }
  function applyStageFieldConfig(baseColumns, allDefs, cfg) {
    const baseMap = new Map(baseColumns.map((c) => [c.key, c]))
    if (!cfg || !Array.isArray(cfg.fields) || !cfg.fields.length) {
      // 未配置：返回默认列（去掉由调用方统一前置的姓名/手机/岗位）
      return baseColumns.filter((c) => !PINNED_KEYS.has(c.key))
    }
    const result = []
    for (const spec of cfg.fields) {
      if (spec.hidden || PINNED_KEYS.has(spec.key)) continue
      const b = baseMap.get(spec.key)
      if (b) {
        result.push({ ...b, title: spec.title ?? b.title, width: spec.width ?? b.width })
        baseMap.delete(spec.key)
        continue
      }
      const entry = allDefs[spec.key]
      if (entry && entry.def) {
        result.push({ ...entry.def, title: spec.title ?? entry.def.title, width: spec.width ?? entry.def.width })
        continue
      }
      if (spec.custom) {
        result.push({
          key: spec.key,
          title: spec.title || spec.key,
          width: spec.width || 120,
          render: (_, row) => {
            if (spec.source === 'static') return (spec.staticValue != null && spec.staticValue !== '') ? spec.staticValue : '-'
            const v = row ? row[spec.key] : undefined
            return (v != null && v !== '') ? String(v) : '-'
          },
        })
      }
    }
    // 结构性状态列始终保留，避免被配置遗漏
    for (const c of baseColumns) if (STRUCTURAL_KEYS.has(c.key) && baseMap.has(c.key)) result.push(c)
    return result
  }
  // 各「环节 | 子状态」展示的表格字段，严格对齐 Excel《招聘各环节确认清单》的「表格字段」列（三套流程差异分开处理）
  const stageBaseColumns = (() => {
    // 确认参加子状态：证件号 + 确认状态 + 发送次数（先笔后面·面试额外展示当前岗位排名）
    if (currentSubStatus === '待确认参加') {
      const cols = [idCardColumn, { key: 'confirmStatus', title: '确认状态', width: 120, render: () => <StatusPill value="待确认" /> }, sendCountColumn]
      if (stageNode === '面试' && stageRecruitmentType === '先笔后面') cols.splice(2, 0, rankColumn)
      return cols
    }
    // 发放准考证子状态（笔试）：准考证相关字段 + 发送次数（表格列含「证件号」）
    if (currentSubStatus === '待发准考证') {
      return [idCardColumn, admissionNoColumn, examRoomColumn, seatNoColumn, examSiteColumn, examAddressColumn, examTimeColumn, examTimeSubjectColumn, downloadStatusColumn, admissionIssueStatusColumn, sendCountColumn]
    }
    // 成绩录入子状态：对应成绩列 + 推荐结果 + 排名 + 发送次数
    if (currentSubStatus === '待录成绩') {
      const scoreCols = []
      if (stageNode === '笔试') scoreCols.push(writtenScoreColumn)
      if (stageNode === '面试') {
        // 先面后笔：面试在笔试之前，只展示 综合素质考察成绩 + 面试成绩
        if (stageRecruitmentType === '先面后笔') scoreCols.push(qualityScoreColumn, interviewScoreColumn)
        else scoreCols.push(writtenScoreColumn, qualityScoreColumn, interviewScoreColumn)
      }
      if (stageNode === '校级面试') scoreCols.push(deptInitialScoreColumn, schoolInterviewScoreColumn)
      if (stageNode === '部门初面') scoreCols.push(deptInitialScoreColumn)
      return [...scoreCols, recommendColumn, rankColumn, sendCountColumn]
    }
    // 资格审查：性别、年龄、证件号、最高学历（无发送消息列）
    if (stageNode === '资格审查') return [genderColumn, ageColumn, idCardColumn, degreeColumn]
    // 确认名单（选聘）：性别、年龄、证件号、最高学历、单位意见、建议说明
    if (stageNode === '确认名单') return [genderColumn, ageColumn, idCardColumn, degreeColumn, unitOpinionColumn, suggestColumn]
    if (stageNode === '笔试') return [idCardColumn, writtenScoreColumn, recommendColumn, rankColumn, sendCountColumn]
    // 综合素质考察：先笔后面需带出笔试成绩；先面后笔展示考试信息（时间/会议号/面试序号）
    if (stageNode === '综合素质考察') {
      const cols = [idCardColumn]
      if (stageRecruitmentType === '先笔后面') cols.push(writtenScoreColumn)
      cols.push(qualityScoreColumn, recommendColumn, rankColumn, sendCountColumn)
      if (stageRecruitmentType === '先面后笔') cols.push(qualityExamTimeColumn, qualityMeetingColumn, qualityInterviewNoColumn)
      return cols
    }
    if (stageNode === '面试') {
      const cols = [idCardColumn]
      if (stageRecruitmentType === '先面后笔') cols.push(qualityScoreColumn, interviewScoreColumn)
      else cols.push(writtenScoreColumn, qualityScoreColumn, interviewScoreColumn)
      cols.push(recommendColumn, rankColumn, sendCountColumn)
      return cols
    }
    if (stageNode === '部门初面') return [idCardColumn, deptInitialScoreColumn, recommendColumn, rankColumn, sendCountColumn]
    if (stageNode === '校级面试') return [idCardColumn, deptInitialScoreColumn, schoolInterviewScoreColumn, recommendColumn, rankColumn, sendCountColumn]
    // 上会审议：三套流程的成绩列与「审核结果」差异严格对齐 Excel
    if (stageNode === '上会审议') {
      if (stageRecruitmentType === '选聘') return [idCardColumn, deptInitialScoreColumn, schoolInterviewScoreColumn, rankColumn, comprehensiveScoreColumn, sendCountColumn]
      if (stageRecruitmentType === '先面后笔') return [idCardColumn, writtenScoreColumn, qualityScoreColumn, interviewScoreColumn, rankColumn, comprehensiveScoreColumn, sendCountColumn]
      // 先笔后面：含 推荐结果（待定） + 审核结果
      return [idCardColumn, writtenScoreColumn, qualityScoreColumn, interviewScoreColumn, comprehensiveScoreColumn, recommendColumn, auditResultColumn, sendCountColumn]
    }
    // 拟录用（招聘办理最后环节）：证件号、拟录用结果、审核结果、发送消息（次数）；录用环节已移至「录用办理」菜单
    if (stageNode === '拟录用') return [idCardColumn, hireStatusColumn, auditResultColumn, sendCountColumn]
    return []
  })()
  const stageDataColumns = applyStageFieldConfig(stageBaseColumns, FIELD_DEFS, fieldConfigs[stageNode])
  const columns = [nameColumn, phoneColumn, unitColumn, jobColumn, ...stageDataColumns, ...(tab === 'done' ? [
  { key: 'recruitmentType', title: '招聘方式', width: 100, render: (_, row) => recruitmentTypeOf(row) },
  { key: 'handledNode', dataIndex: 'currentNode', title: '办理环节', width: 128, render: (_, row) => tooltipText(dispStage(row.currentNode)) },
  { key: 'status', title: '办理结果', width: 110, render: (_, row) => {
    const value = row.status || latestStageStatus(row)
    return <StatusPill value={value} />
  } }, { key: 'handledAt', dataIndex: 'handledAt', title: '办理时间', width: 150, render: (value) => tooltipText(value || '-') }, { key: 'handledBy', dataIndex: 'handledBy', title: '办理人', width: 90 }] : []), {
    key: 'operation',
    title: '操作',
    width: 76,
    fixed: 'right',
    render: (_, row) => <span className="pra-row-actions">
      <DSButton variant="link" onClick={() => openDetail(row)}>详情</DSButton>
    </span>,
  }]

  // ── 字段配置：按环节单独配置表格字段 ──
  const openFieldEditor = (stage) => {
    setFieldEditorStage(stage)
    const type = typeOfStage(stage)
    // 本环节所属类型的全部字段（含同类型其他环节的字段，可跨环节借用）
    const poolKeys = Object.keys(FIELD_DEFS).filter((k) => FIELD_DEFS[k].types.includes(type))
    const existing = fieldConfigs[stage]
    if (existing && Array.isArray(existing.fields) && existing.fields.length) {
      // 已保存配置：以保存顺序为准，池中其余字段标记为隐藏，便于随时勾选借用
      const cfgMap = new Map(existing.fields.map((f) => [f.key, f]))
      setFieldDraft(poolKeys.map((k) => {
        const c = cfgMap.get(k)
        return c ? { ...c } : { key: k, title: FIELD_DEFS[k].label, width: FIELD_DEFS[k].def.width, hidden: true }
      }))
    } else {
      // 未配置：以当前环节默认显示的字段为可见基线，池中其他字段隐藏
      const baseKeys = new Set(stageBaseColumns.map((c) => c.key))
      setFieldDraft(poolKeys.map((k) => ({ key: k, title: FIELD_DEFS[k].label, width: FIELD_DEFS[k].def.width, hidden: !baseKeys.has(k) })))
    }
    setFieldEditorOpen(true)
  }
  const saveFieldEditor = () => {
    const next = { ...fieldConfigs, [fieldEditorStage]: { fields: fieldDraft } }
    setFieldConfigs(next)
    saveFieldConfigs(next)
    setFieldEditorOpen(false)
    notify(`已保存「${fieldEditorStage}」环节的字段配置`)
  }
  const resetFieldEditor = () => {
    const next = { ...fieldConfigs }
    delete next[fieldEditorStage]
    setFieldConfigs(next)
    saveFieldConfigs(next)
    setFieldDraft(stageBaseColumns.map((c) => ({ key: c.key, title: c.title, width: c.width, hidden: false })))
    notify(`已恢复「${fieldEditorStage}」环节为默认字段`)
  }
  const updateFieldSpec = (index, patch) => setFieldDraft((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)))
  const moveField = (index, dir) => setFieldDraft((prev) => {
    const target = index + dir
    if (target < 0 || target >= prev.length) return prev
    const copy = [...prev]
    const tmp = copy[index]
    copy[index] = copy[target]
    copy[target] = tmp
    return copy
  })
  const removeFieldSpec = (index) => setFieldDraft((prev) => prev.filter((_, i) => i !== index))
  const addCustomField = () => setFieldDraft((prev) => [...prev, { key: `field_${Date.now()}`, title: '新字段', width: 120, hidden: false, custom: true, source: 'row', staticValue: '' }])

  const actionName = (node, sub, row) => {
    if (sub === '待我办理') return '办理'
    if (sub === '待登记结果') return '登记'
    if (sub === '待确认结果') return '确认结果'
    if (sub === '待录成绩') return '录入'
    if (sub === '待发准考证') return row?.issuedAt ? '重发准考证' : '发放准考证'
    if (sub === '待发通知') return row?.issuedAt ? '重发通知' : '发放通知'
    if (sub === '待确认参加') return '确认参加'
    if (sub === '待审核') return '审核'
    return '审核'
  }
  const batchLabel = (action) => {
    const label = action.label.replace(/^批量/, '')
    if (action.alwaysEnabled || !selectedKeys.length) return label
    return `${label}(${selectedKeys.length})`
  }

  // 这几个弹窗跨越列表页/详情页：触发点可能在任一视图，但之前被错误地只挂在详情页 main 内，
  // 导致从列表页触发时不渲染、残留的 open 状态在进入详情页时才弹出。
  // 提取为共享变量，确保无论在列表页还是详情页触发都能正确弹出。
  const sharedModals = (
    <>
      <DSModal
        open={admissionIssueOpen}
        size="small"
        title="确认发放准考证"
        okText="确认发放"
        cancelText="取消"
        onCancel={() => setAdmissionIssueOpen(false)}
        onOk={() => {
          const targetIds = new Set(selectedKeys.length ? selectedKeys : filtered.map((row) => row.id))
          if (!targetIds.size) { notify('当前没有可发放的人员'); return }
          save(rows.map((row) => targetIds.has(row.id) ? applyActionToRow(row, 'issue') : row))
          notify(`已发放 ${targetIds.size} 人准考证`)
          setAdmissionIssueOpen(false)
          setSelectedKeys([])
        }}
      >
        <div className="pra-batch-audit-modal">
          <p>将向{selectedKeys.length || filtered.length}名人员发放准考证，并同步发送站内消息和短信通知。</p>
        </div>
      </DSModal>
      <DSModal open={uploadAdmissionOpen} width="min(1080px, calc(100vw - 64px))" maxHeight="calc(100vh - 80px)" className="pra-upload-admission-modal" title="上传准考证信息" okText="完成" cancelText="取消" onCancel={() => setUploadAdmissionOpen(false)} onOk={() => setUploadAdmissionOpen(false)}>
        <div className="pra-upload-admission">
          <div className={`pra-upload-dropzone${uploadProgress === 100 ? ' is-complete' : ''}`}>
            <DSUpload accept=".xlsx,.xls,.csv,.zip" maxCount={1} uploadText="选择准考证文件" description="支持 Excel、CSV 或 ZIP" onChange={(files) => { if (!files.length) return; setUploadProgress(12); setTimeout(() => setUploadProgress(58), 250); setTimeout(() => setUploadProgress(86), 520); setTimeout(() => setUploadProgress(100), 850) }} />
            <label htmlFor="admission-upload"><b>{uploadProgress === 100 ? '✓' : '⇧'}</b><strong>{uploadProgress === 100 ? '准考证信息上传完成' : '选择或拖拽准考证文件到此处'}</strong><span>支持 Excel、CSV 或 ZIP 文件</span></label>
          </div>
          {uploadProgress > 0 ? <div className="pra-upload-progress"><div><span>准考证信息文件.xlsx</span><strong>{uploadProgress === 100 ? '处理完成' : `${uploadProgress}%`}</strong></div><progress max="100" value={uploadProgress} /><p>{uploadProgress === 100 ? '已完成数据校验，可关闭弹窗。' : '正在上传并校验准考证信息…'}</p></div> : null}
        </div>
      </DSModal>
    </>
  )

  if (active) {
    const acts = tab === 'pending' ? detailActions : []
    const rModel = resumeModelOf(active)
    const educationRows = rModel.education || []
    const publicResume = {
      ...rModel,
      education: {
        bachelor: educationRows.find((item) => item.level === '本科') || educationRows[0],
        master: educationRows.find((item) => String(item.level).includes('硕士')) || educationRows[1],
        doctor: educationRows.find((item) => String(item.level).includes('博士')),
      },
      workExperience: rModel.work || [],
      technicalTitles: rModel.technical || [],
      professionalQualifications: rModel.professional || [],
      postdoctoral: rModel.postdoc,
      ...(rModel.research || {}),
      attachments: (rModel.attachments || []).map((item) => item.name || item.cat).filter(Boolean),
      aiReview: {
        hasRisk: active.aiPass === false,
        advice: active.aiPass === false ? '报名信息存在待核验项，请结合证明材料复核。' : '报名字段与材料信息完整，可进入当前审核环节。',
        mismatchedFields: active.aiPass === false ? ['报名信息或证明材料'] : [],
      },
    }

    const detailFooter = tab === 'pending' && acts.length ? <footer className="pra-detail-footer">
      <div className="pra-detail-actions">{acts.map((action) => <DSButton
        key={action.key}
        danger={!!action.danger}
        variant={action.primary ? 'primary' : 'default'}
        onClick={() => {
          if (['pass', 'reject', 'unpass'].includes(action.key) && ['资格审查', '综合素质考察'].includes(active.currentNode)) {
            setDetailAuditResult(action.key)
            setDetailAuditOpen(true)
            return
          }
          processOne(action.key)
        }}
      >{action.label}</DSButton>)}</div>
      <div className="pra-detail-nav">
        <DSButton disabled={activeIndex <= 0} onClick={() => setActiveId(filtered[activeIndex - 1]?.id)}>上一位:{filtered[activeIndex - 1]?.name || '无'}</DSButton>
        <span className="pra-current-person">当前:{active.name}({activeIndex + 1}/{filtered.length})</span>
        <DSButton disabled={activeIndex < 0 || activeIndex >= filtered.length - 1} onClick={() => setActiveId(filtered[activeIndex + 1]?.id)}>下一位:{filtered[activeIndex + 1]?.name || '无'}</DSButton>
      </div>
    </footer> : null

    return <>
      <RecruitmentResumePage
        detailRecord={{ ...active, idCardFull: rModel.basic?.idCard }}
        detailResume={publicResume}
        detailTitle="简历详情"
        detailHeaderActions={<div className="pra-detail-dynamics">
          <span className="pra-detail-dynamics__stage">当前环节&nbsp;&nbsp;<strong>{active.subStatus === '待审核' ? '人事处初审' : dispStage(active.currentNode)}</strong></span>
          <DSButton variant="default" onClick={() => { setDynamicsTab('timeline'); setDynamicsOpen(true) }}>动态</DSButton>
        </div>}
        detailFooter={detailFooter}
        enableSectionReview={false}
        showAiOverview={false}
        showApplicationInfo={false}
        onDetailBack={() => { setActiveId(null); setOpinion('') }}
      />
      <DSModal
        open={detailAuditOpen}
        size="small"
        title={`审核·${active.name}`}
        okText={'确认审核'}
        cancelText="取消"
        onCancel={() => setDetailAuditOpen(false)}
        onOk={() => {
          if ((active.currentNode === '资格审查' || detailAuditResult !== 'pass') && !opinion.trim()) { notify('请填写审核意见'); return }
          processOne(detailAuditResult)
          setDetailAuditOpen(false)
        }}
      >
        <div className="pra-batch-audit-modal">
          <DSEditField label={`${detailAuditResult === 'pass' ? '通过' : detailAuditResult === 'reject' ? '退回' : '不通过'}意见`} required><DSTextarea value={opinion} placeholder="请输入审核意见" rows={4} onChange={(event) => setOpinion(event.target.value)} /></DSEditField>
        </div>
      </DSModal>
      {/* 简历详情右上角「动态」：抽屉内切「日志 / 流程图」 */}
      <DSDrawer
        open={dynamicsOpen}
        width={520}
        showFooter={false}
        className="pra-dynamics-drawer"
        onClose={() => setDynamicsOpen(false)}
        title={<DSTabs
          items={[{ key: 'timeline', label: '日志' }, { key: 'graph', label: '流程图' }]}
          activeKey={dynamicsTab}
          onChange={setDynamicsTab}
          variant="section"
        />}
      >
        <DSProcessDynamics
          showHeader={false}
          view={dynamicsTab === 'graph' ? 'graph' : 'timeline'}
          items={candidateTimelineItems(active)}
          graphRows={candidateGraphRows(active, activePlan)}
          emptyDescription="暂无该考生的流程日志。"
        />
      </DSDrawer>
      {sharedModals}
      {toast ? <div className="pra-toast" role="status" aria-live="polite">{toast}</div> : null}
    </>
  }

  return <main className="process-audit-page" data-ds-business-page="process-audit">
    <header className="pra-top">
      <DSTabs
        items={[
          { key: 'pending', label: `待我办理（${pendingRows.length}）` },
          { key: 'done', label: '我已办理' },
        ]}
        activeKey={tab}
        onChange={(key) => {
          setTab(key)
          setSelectedStage('')
          setSelectedKeys([])
          setFilters((prev) => ({ ...prev, subStatus: '' }))
          setPage(1)
        }}
        variant="section"
      />
    </header>
    <section className="pra-workspace">
      <aside className="pra-stage-pane">
        {planTree.length ? <DSTree
          ariaLabel={tab === 'pending' ? '待我办理环节' : '我已办理环节'}
          selectedKey={stageKey}
          defaultExpandAll
          dataSource={(() => {
            const planCard = (group) => ({
              key: `plan-${group.plan.id}`,
              title: <span className="pra-tree-plan"><span title={group.plan.name}>{group.plan.name}</span></span>,
              children: group.types.map(type => ({
                key: `${group.plan.id}-type-${type.type}`,
                title: <span className="pra-tree-group-title">{type.type}</span>,
                children: type.nodes.map((stage) => ({
                  key: `${group.plan.id}|${type.type}|${stage.node}`,
                  title: <span className={`pra-tree-leaf${`${group.plan.id}|${type.type}|${stage.node}` === stageKey ? ' is-selected' : ''}`}>{dispStage(stage.node)}</span>,
                  count: tab === 'pending' ? stage.count : undefined,
                })),
              })),
            })
            if (tab === 'pending') return planTree.map(planCard)
            // 我已办理:按「进行中 / 已结束」两块归拢计划
            const active = planTree.filter((group) => isActivePlan(group.plan)).map(planCard)
            const ended = planTree.filter((group) => isEndedPlan(group.plan)).map(planCard)
            return [
              { key: 'group-active', title: <span className="pra-tree-group-title">进行中的计划</span>, children: active },
              { key: 'group-ended', title: <span className="pra-tree-group-title">已结束的计划</span>, children: ended },
            ].filter((group) => group.children?.length)
          })()}
          onSelect={(key, node) => { if (!node.children?.length) selectStage(key) }}
        /> : null}
        {!planTree.length ? <div className="pra-empty-tip">当前没有{tab === 'pending' ? '待办' : '已办'}事项</div> : null}
      </aside>

      <section className="pra-main">
        <div className="pra-filter-panel">
        <div className={filterClassName}>
          <label><span>关键字</span><DSInput value={filters.name} placeholder="姓名/证件号/手机号" onChange={(event) => { setFilters((prev) => ({ ...prev, name: event.target.value })); setPage(1) }} /></label>
          <label><span>招聘部门</span><DSSelect value={filters.unit} options={unitOptions} placeholder="请选择招聘部门" clearable onChange={(value) => { setFilters((prev) => ({ ...prev, unit: value || '' })); setPage(1) }} /></label>
          <label><span>应聘岗位</span><DSSelect value={filters.job} options={jobOptions} placeholder="请选择岗位" clearable onChange={(value) => { setFilters((prev) => ({ ...prev, job: value || '' })); setPage(1) }} /></label>
          {showSendStatusFilter ? <label><span>发送状态</span><DSSelect value={filters.sendStatus} options={[{ label: '全部', value: '' }, { label: '已发送', value: '已发送' }, { label: '未发送', value: '未发送' }]} clearable onChange={(value) => { setFilters((prev) => ({ ...prev, sendStatus: value || '' })); setPage(1) }} /></label> : null}
          {tab === 'done' ? <label><span>计划状态</span><DSSelect value={filters.status} options={[{ label: '全部状态', value: '' }, { label: '进行中', value: '进行中' }, { label: '已结束', value: '已结束' }]} onChange={(value) => { setFilters((prev) => ({ ...prev, status: value })); setPage(1) }} /></label> : null}
          <div className="pra-filter-actions">
            <DSButton variant="default" onClick={resetFilters}>重置</DSButton>
            <DSButton variant="primary" onClick={() => notify('查询完成')}>查询</DSButton>
          </div>
        </div>

        {showInlineSubStatusFilter ? <div className="pra-inline-filter" aria-label={`${stageNode}办理状态`}>
          <div className="pra-inline-status-group">
            <span className="pra-inline-filter-label">办理状态</span>
            <div className="pra-inline-filter-options">
              {availableSubStatuses.map((status) => <DSButton
                key={status}
                className={`pra-inline-filter-option${status === currentSubStatus ? ' is-active' : ''}`}
                variant="link"
                size="small"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, subStatus: status }))
                  setSelectedKeys([])
                  setPage(1)
                }}
              >{displaySubStatus(status)}（{statusCounts[status] || 0}）</DSButton>)}
            </div>
          </div>
          <span className="pra-filter-action-spacer" aria-hidden="true" />
        </div> : null}
        </div>

        <div className="pra-toolbar">
          <div className="pra-toolbar-primary">
            {/* 批量操作完全由 NODE_ACTIONS / nodeActionsFor 驱动（对齐 Excel「操作」列），避免硬编码重复按钮 */}
            {tab === 'pending' && batchActions.length ? batchActions.map((a) => <DSButton
              key={a.key}
              variant={a.primary ? 'primary' : 'default'}
              danger={!!a.danger}
              onClick={() => {
                if (a.key === 'sendMessage') { openNotification(); return }
                if (a.needsReason) { openBatchAudit(); return }
                batchProcess(a.key)
              }}
            >{batchLabel(a)}</DSButton>) : null}
            {resumeGenerationProgress !== null ? <div className="pra-resume-generation" role="status" aria-live="polite">
              <span>生成中 {resumeGenerationProgress}%</span>
              <progress value={resumeGenerationProgress} max="100" />
              <DSButton variant="link" onClick={cancelResumeGeneration}>取消</DSButton>
            </div> : null}
          </div>
        </div>

        <div className="pra-table-frame"><DSDataTable bordered className="pra-table" showToolbar={false} columns={columns} data={pageRows} rowKey="id"
          selectable={tab === 'pending'} selectedRowKeys={selectedKeys}
          onSelectRow={(key, checked) => setSelectedKeys((prev) => checked ? [...prev, key] : prev.filter((item) => item !== key))}
          onSelectAll={(checked, records) => setSelectedKeys(checked ? records.map((record) => record.id) : [])}
          showIndex minWidth={showAiCol ? 1180 : 980} emptyText="当前状态暂无人员"
        /></div>

        <div className="pra-page-actions">
          <span>共 {filtered.length} 条</span>
          <DSButton variant="link" size="small" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>上一页</DSButton>
          <b>{currentPage}</b>
          <DSButton variant="link" size="small" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>下一页</DSButton>
          <span>共 {pageCount} 页</span>
        </div>
      </section>
    </section>
    <DSModal
      open={scoreImportOpen}
      size="small"
      title="导入成绩"
      showFooter={false}
      onCancel={() => setScoreImportOpen(false)}
    >
      <div className="pra-score-import-modal">
        <p>请选择 Excel 或 CSV 成绩文件（姓名、证件号、招聘部门、应聘岗位、分数）。上传完成后，系统将按证件号匹配人员并自动录入成绩。</p>
        <DSUpload
          accept=".xlsx,.xls,.csv"
          maxCount={1}
          uploadText="选择成绩文件"
          description="支持 Excel、CSV 文件"
          onChange={(files) => {
            if (!files.length) return
            const targetIds = new Set(filtered.map((row) => row.id))
            const next = rows.map((row) => targetIds.has(row.id) ? {
              ...row,
              score: row.score ?? 72 + ((row.id?.charCodeAt(row.id.length - 1) || 0) % 24),
              qualityScore: stageNode === '综合素质考察' ? qualityScoreOf(row) : row.qualityScore,
              history: [...(row.history || []), `${timeNow()} · Excel 导入成绩`],
            } : row)
            save(next)
            setScoreImportOpen(false)
            notify(`已从 ${files[0].name} 自动录入 ${targetIds.size} 人成绩`)
          }}
        />
      </div>
    </DSModal>
    <DSModal
      open={batchAuditOpen}
      size="small"
      title="批量退回"
      okText="确认退回"
      cancelText="取消"
      onCancel={() => setBatchAuditOpen(false)}
      onOk={() => {
        if (!opinion.trim()) { notify('请填写退回原因'); return }
        batchProcess('reject')
        setBatchAuditOpen(false)
        setOpinion('')
      }}
    >
      <div className="pra-batch-audit-modal">
        <div className="pra-batch-audit-count">已选择 <strong>{selectedKeys.length}</strong> 人</div>
        <DSEditField label="退回原因" required>
          <DSTextarea value={opinion} placeholder="请输入退回原因" rows={4} onChange={(event) => setOpinion(event.target.value)} />
        </DSEditField>
      </div>
    </DSModal>
    <DSModal
      open={notificationOpen}
      width="min(900px, calc(100vw - 64px))"
      className="pra-notification-modal"
      title="发送消息"
      onCancel={() => setNotificationOpen(false)}
      footer={<div className="pra-notification-footer">
        <DSButton variant={notificationTemplateModified ? 'primary' : 'default'} disabled={!notificationTemplateModified || !notificationTitle.trim() || !hasNotificationChannel} onClick={() => {
          const key = `custom-${Date.now()}`
          setNotificationTemplates((prev) => [...prev, { key, name: notificationTitle.trim(), title: notificationTitle.trim(), system: notificationContent, email: notificationEmailContent, sms: notificationSmsContent }])
          setNotificationType(key)
          notify('通知模版保存成功')
        }}>保存为模版</DSButton>
        <div className="pra-notification-footer__actions">
          <DSButton variant="default" onClick={() => setNotificationOpen(false)}>取消</DSButton>
          <DSButton variant="primary" disabled={!notificationTitle.trim() || !hasNotificationChannel} onClick={() => {
            notify(`已向 ${selectedKeys.length} 人发送消息`)
            setNotificationOpen(false)
            setSelectedKeys([])
          }}>确认发送</DSButton>
        </div>
      </div>}
    >
      <div className="pra-notification-form">
        <p className="pra-notification-tip">提示：用户可重复接收信息</p>
        <DSEditField label="通知模版">
          <DSSelect
            value={notificationType}
            placeholder="请选择通知模版"
            clearable
            options={[
              ...notificationTemplates.map((item) => ({ label: item.name, value: item.key })),
            ]}
            onChange={(value) => {
              setNotificationType(value || '')
              const template = notificationTemplates.find((item) => item.key === value)
              if (template) {
                setNotificationTitle(template.title)
                setNotificationContent(template.system)
                setNotificationEmailContent(template.email)
                setNotificationSmsContent(template.sms || '')
              } else {
                setNotificationType('')
              }
            }}
          />
        </DSEditField>
        <DSEditField label="通知标题" required>
          <DSInput value={notificationTitle} placeholder="请输入通知标题" onChange={(event) => setNotificationTitle(event.target.value)} />
        </DSEditField>
        <DSEditField label="系统通知内容" align="start" fullWidth>
          <DSRichTextEditor value={notificationContent} maxLength={2000} placeholder="请输入系统通知内容" onChange={setNotificationContent} />
        </DSEditField>
        <DSEditField label="邮件通知内容" align="start" fullWidth>
          <DSRichTextEditor value={notificationEmailContent} maxLength={3000} placeholder="请输入邮件通知内容" onChange={setNotificationEmailContent} />
        </DSEditField>
        <DSEditField label="短信内容" align="start" fullWidth>
          <DSTextarea value={notificationSmsContent} rows={3} maxLength={500} placeholder="请输入短信内容" onChange={(event) => setNotificationSmsContent(event.target.value)} />
        </DSEditField>
      </div>
    </DSModal>
    {/* 字段配置抽屉（按环节单独配置表格字段） */}
    <DSModal
      open={fieldEditorOpen}
      width="min(780px, calc(100vw - 48px))"
      title={`字段配置 · ${fieldEditorStage}`}
      okText="保存"
      cancelText="取消"
      onCancel={() => setFieldEditorOpen(false)}
      onOk={saveFieldEditor}
    >
      <div className="pra-field-editor">
        <p className="pra-field-editor__hint">「{fieldEditorStage}」属「{typeOfStage(fieldEditorStage)}」类，下列为该类型全部字段（含同类型其他环节字段）。勾选显示 / 隐藏即可跨环节借用前置环节成绩列（如笔试环节查看面试成绩，只读）；可改标题、列宽、用 ↑↓ 排序、新增自定义字段。配置仅对「{fieldEditorStage}」环节生效，刷新后保留。</p>
        <div className="pra-field-editor__list">
          {fieldDraft.map((spec, index) => (
            <div key={spec.key} className={`pra-field-row${spec.hidden ? ' is-hidden' : ''}`}>
              <button type="button" className="pra-field-row__move" title="上移" disabled={index === 0} onClick={() => moveField(index, -1)}>↑</button>
              <button type="button" className="pra-field-row__move" title="下移" disabled={index === fieldDraft.length - 1} onClick={() => moveField(index, 1)}>↓</button>
              <input type="checkbox" className="pra-field-row__check" checked={!spec.hidden} onChange={(event) => updateFieldSpec(index, { hidden: !event.target.checked })} title="显示" />
              <input type="text" className="pra-field-row__title" value={spec.title} onChange={(event) => updateFieldSpec(index, { title: event.target.value })} />
              <label className="pra-field-row__width">列宽<input type="number" min={40} max={400} value={spec.width} onChange={(event) => updateFieldSpec(index, { width: Number(event.target.value) || 120 })} /></label>
              {spec.custom ? (
                <>
                  <DSSelect
                    className="pra-field-row__source"
                    value={spec.source || 'row'}
                    options={[{ label: '取数据字段', value: 'row' }, { label: '固定文本', value: 'static' }]}
                    onChange={(value) => updateFieldSpec(index, { source: value })}
                  />
                  {spec.source === 'static' ? (
                    <input type="text" className="pra-field-row__static" value={spec.staticValue || ''} onChange={(event) => updateFieldSpec(index, { staticValue: event.target.value })} placeholder="固定文本" />
                  ) : (
                    <input type="text" className="pra-field-row__key" value={spec.key} onChange={(event) => updateFieldSpec(index, { key: event.target.value })} placeholder="数据字段名" />
                  )}
                  <button type="button" className="pra-field-row__del" onClick={() => removeFieldSpec(index)}>删除</button>
                </>
              ) : null}
            </div>
          ))}
        </div>
        <div className="pra-field-editor__footer">
          <DSButton variant="default" onClick={addCustomField}>＋ 添加自定义字段</DSButton>
          <DSButton variant="text" onClick={resetFieldEditor}>恢复默认</DSButton>
        </div>
      </div>
    </DSModal>
    {sharedModals}
    {toast ? <div className="pra-toast" role="status" aria-live="polite">{toast}</div> : null}
  </main>
}

createRoot(document.getElementById('app')).render(<ProcessAuditPage />)
