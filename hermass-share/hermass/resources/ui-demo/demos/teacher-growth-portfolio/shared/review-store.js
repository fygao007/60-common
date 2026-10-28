/**
 * 采集审核闭环 · module 级共享 store
 *
 * 串通 t-data-collect(提交) ↔ d-data-review(审核) ↔ 画像重算
 * demo 内用内存态(不接后端),通过 subscribe 通知页面刷新。
 *
 * 数据流:
 *   t-data-collect 提交 → submitReview(item) → pending
 *   d-data-review 通过/驳回 → decideReview(id, pass, reason) → approved/rejected
 *   通过后写回 engine teachers[T001].data[...](运行时对象,画像重算可见变化)
 */
import { teachers } from './portfolio-foundation.js'

// 初始 mock(演示用)
// teacherName 一律从 teachers 资产反查，避免与生成器产出的姓名对不上。
function nameOf(teacherId, fallback) {
  const teacher = teachers.find((t) => t.id === teacherId)
  return teacher ? teacher.name : fallback
}

// 业绩数据分组(与 d-data-review 左侧树一致)
export const REVIEW_CATEGORIES = {
  人事信息: ['家庭成员', '政治面貌'],
  工作经历: ['工作经历'],
  学习培训: ['学习经历', '国内进修', '进修培训'],
  资格证书: ['资格证书'],
  岗位职责: ['岗位职责'],
  实践信息: ['实践信息'],
  考核奖惩: ['考核奖惩'],
  科研信息: ['科研信息'],
  教学信息: ['教学信息'],
  指导学生情况: ['指导学生情况'],
  异动信息: ['异动信息'],
  其他信息: ['其他信息'],
}

const INIT_PENDING = [
  { id: 'pr1', teacherId: 'T001', teacherName: nameOf('T001', '张明'), staffId: '01111004', unit: '计算机学院', category: '科研信息', type: '科研成果补采', summary: '新增 SCI 论文 1 篇《基于深度学习的职教画像建模》', date: '2026-07-08', attach: 2, indicatorId: 'I-res-02', value: 1 },
  { id: 'pr2', teacherId: 'T002', teacherName: nameOf('T002', '李娜'), staffId: '01111021', unit: '计算机学院', category: '实践信息', type: '企业实践更新', summary: '更新华为技术有限公司实践经历 3 个月', date: '2026-07-07', attach: 1, indicatorId: 'I-dev-01', value: 3 },
  { id: 'pr3', teacherId: 'T001', teacherName: nameOf('T001', '张明'), staffId: '01111004', unit: '计算机学院', category: '工作经历', type: '工作经历新增', summary: '新增深圳市迅方技术股份有限公司研发岗经历（2019.07—2021.08）', date: '2026-07-06', attach: 1 },
  { id: 'pr4', teacherId: 'T002', teacherName: nameOf('T002', '李娜'), staffId: '01111021', unit: '计算机学院', category: '学习经历', type: '学习经历补采', summary: '补录华南理工大学工程硕士学习经历（2013.09—2016.06）', date: '2026-07-06', attach: 2 },
  { id: 'pr5', teacherId: 'T001', teacherName: nameOf('T001', '张明'), staffId: '01111004', unit: '计算机学院', category: '资格证书', type: '证书新增', summary: '新增「高等学校教师资格证」证书信息', date: '2026-07-05', attach: 1 },
  { id: 'pr6', teacherId: 'T002', teacherName: nameOf('T002', '李娜'), staffId: '01111021', unit: '计算机学院', category: '教学信息', type: '教学成果申报', summary: '申报省级教学成果奖《产教融合下软件技术专业群改革》', date: '2026-07-05', attach: 3 },
  { id: 'pr7', teacherId: 'T001', teacherName: nameOf('T001', '张明'), staffId: '01111004', unit: '计算机学院', category: '考核奖惩', type: '年度考核补录', summary: '补录 2025 年度考核结果「优秀」', date: '2026-07-04', attach: 1 },
  { id: 'pr8', teacherId: 'T002', teacherName: nameOf('T002', '李娜'), staffId: '01111021', unit: '计算机学院', category: '指导学生情况', type: '竞赛指导新增', summary: '指导学生获全国职业院校技能大赛一等奖', date: '2026-07-04', attach: 2 },
  { id: 'pr9', teacherId: 'T001', teacherName: nameOf('T001', '张明'), staffId: '01111004', unit: '计算机学院', category: '国内进修', type: '进修培训登记', summary: '完成国内访问工程师进修（国内访学 6 个月）', date: '2026-07-03', attach: 1 },
  { id: 'pr10', teacherId: 'T002', teacherName: nameOf('T002', '李娜'), staffId: '01111021', unit: '计算机学院', category: '科研信息', type: '专利授权新增', summary: '新增授权发明专利 1 项「一种实训设备数据采集装置」', date: '2026-07-03', attach: 2 },
  { id: 'pr11', teacherId: 'T001', teacherName: nameOf('T001', '张明'), staffId: '01111004', unit: '计算机学院', category: '家庭成员', type: '家庭成员补录', summary: '补录家庭成员信息 1 条', date: '2026-07-02', attach: 0 },
  { id: 'pr12', teacherId: 'T002', teacherName: nameOf('T002', '李娜'), staffId: '01111021', unit: '计算机学院', category: '政治面貌', type: '政治面貌变更', summary: '政治面貌由「群众」变更为「中共党员」', date: '2026-07-02', attach: 1 },
]
const INIT_APPROVED = [
  { id: 'dr1', teacherId: 'T003', teacherName: nameOf('T003', '王建国'), staffId: '01111035', unit: '人工智能学院', category: '科研信息', type: '科研成果补采', summary: '新增核心期刊论文 1 篇', date: '2026-07-03', result: '已通过', reason: '' },
  { id: 'dr2', teacherId: 'T002', teacherName: nameOf('T002', '李娜'), staffId: '01111021', unit: '计算机学院', category: '教学信息', type: '课程建设补采', summary: '新增省级精品在线开放课程 1 门', date: '2026-06-28', result: '已通过', reason: '' },
  { id: 'dr3', teacherId: 'T001', teacherName: nameOf('T001', '张明'), staffId: '01111004', unit: '计算机学院', category: '实践信息', type: '企业实践登记', summary: '企业实践（华为）2 个月登记', date: '2026-06-25', result: '已通过', reason: '' },
  { id: 'dr4', teacherId: 'T002', teacherName: nameOf('T002', '李娜'), staffId: '01111021', unit: '计算机学院', category: '资格证书', type: '证书新增', summary: '新增「职业技能鉴定考评员」证书', date: '2026-06-20', result: '已通过', reason: '' },
  { id: 'dr5', teacherId: 'T001', teacherName: nameOf('T001', '张明'), staffId: '01111004', unit: '计算机学院', category: '进修培训', type: '进修培训登记', summary: '完成省级骨干教师培训（48 学时）', date: '2026-06-18', result: '已通过', reason: '' },
]
const INIT_REJECTED = [
  { id: 're1', teacherId: 'T004', teacherName: nameOf('T004', '陈晓梅'), staffId: '01111042', unit: '人工智能学院', category: '人事信息', type: '人事信息纠错', summary: '更正职称信息', date: '2026-07-01', result: '已退回', reason: '佐证材料不清晰,请补充职称聘任文件扫描件。' },
  { id: 're2', teacherId: 'T003', teacherName: nameOf('T003', '王建国'), staffId: '01111035', unit: '人工智能学院', category: '工作经历', type: '工作经历新增', summary: '新增企业工作经历（时间存疑）', date: '2026-06-30', result: '已退回', reason: '工作起止时间与劳动合同不一致，请核实后重新提交。' },
  { id: 're3', teacherId: 'T002', teacherName: nameOf('T002', '李娜'), staffId: '01111021', unit: '计算机学院', category: '考核奖惩', type: '荣誉补录', summary: '补录市级「优秀教师」荣誉', date: '2026-06-26', result: '已退回', reason: '缺少荣誉证书编号，请补充完整证书信息。' },
]

const state = {
  pending: [...INIT_PENDING],
  approved: [...INIT_APPROVED],
  rejected: [...INIT_REJECTED],
  listeners: new Set(),
}

function notify() {
  state.listeners.forEach((fn) => fn())
}

export function getReviews(status = 'pending') {
  return [...(state[status] || [])]
}

export function submitReview(item) {
  const rec = {
    id: `pr${Date.now()}`,
    teacherId: item.teacherId || 'T001',
    teacherName: item.teacherName || '张明',
    staffId: item.staffId || '01111004',
    unit: item.unit || '计算机学院',
    category: item.category || '科研信息',
    type: item.type || '数据补采',
    summary: item.summary || '',
    date: new Date().toISOString().slice(0, 10),
    attach: item.attach || 0,
    indicatorId: item.indicatorId || null,
    value: item.value || null,
  }
  state.pending.push(rec)
  notify()
  return rec
}

export function decideReview(id, pass, reason = '') {
  const idx = state.pending.findIndex((r) => r.id === id)
  if (idx === -1) return false
  const [rec] = state.pending.splice(idx, 1)
  if (pass) {
    rec.result = '已通过'
    rec.reason = reason
    state.approved.push(rec)
    // 写回 engine teachers 资产(运行时对象)
    if (rec.indicatorId && rec.value != null) {
      const teacher = teachers.find((t) => t.id === rec.teacherId)
      if (teacher && teacher.data[rec.indicatorId]) {
        teacher.data[rec.indicatorId].value = rec.value
      }
    }
  } else {
    rec.result = '已退回'
    rec.reason = reason
    state.rejected.push(rec)
  }
  notify()
  return true
}

export function subscribe(fn) {
  state.listeners.add(fn)
  return () => state.listeners.delete(fn)
}

// 调试用
export function _dump() {
  return { pending: state.pending.length, approved: state.approved.length, rejected: state.rejected.length }
}