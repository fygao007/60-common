// 预警中心 · 预警处置审批 Mock 数据（页面本地副本，只保留本页消费的字段口径）
//
// 字段口径（ontology）：
//   姓名         → StaffBasicInformation.xm（标准库）
//   所在单位     → StaffBasicInformation.szdwdm（标准库）
//   预警事项     → Business.warningCenter.warningCategory
//   到期日期     → 合同/聘期/资格证书 → Business.warningCenter.*ExpireDate；退休 → StaffBasicInformation.yjltxrq
//   处置状态     → Business.warningCenter.handleStatus
//   处置说明     → Business.warningCenter.handleRemark
//   处置提交人   → Business.warningCenter.submitter
//   处置提交时间 → Business.warningCenter.submitTime
//   审核意见     → Business.warningCenter.auditOpinion
//   审核人       → Business.warningCenter.auditor
//   审核时间     → Business.warningCenter.auditTime
// 剩余天数由到期日期派生，不登记字段。

export const CATEGORIES = [
  { key: 'contract', label: '合同到期', dateField: 'Business.warningCenter.contractExpireDate' },
  { key: 'appointment', label: '聘期到期', dateField: 'Business.warningCenter.appointmentExpireDate' },
  { key: 'certificate', label: '资格证书到期', dateField: 'Business.warningCenter.certificateExpireDate' },
  { key: 'retire', label: '退休到期', dateField: 'StaffBasicInformation.yjltxrq' },
]

export const CATEGORY_LABELS = CATEGORIES.reduce((map, item) => {
  map[item.key] = item.label
  return map
}, {})

// 处置状态：待处置 / 已通过 / 已退回（需求卡确认）
export const HANDLE_STATUS = {
  pending: '待处置',
  approved: '已通过',
  returned: '已退回',
}

export const HANDLE_STATUS_OPTIONS = ['全部', ...Object.values(HANDLE_STATUS)]

// 到期日期以今天为锚点生成，保证 demo 语义稳定
const TODAY = new Date()

function dateOffset(days) {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + days)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function timeOffset(daysAgo, hour) {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, 0, 0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:00`
}

const BRIEFS = {
  contract: '已与本人确认续签意向，续签材料已收齐',
  appointment: '聘期考核材料已收齐，考核结论合格',
  certificate: '已通知本人办理换证，继续教育学时已完成',
  retire: '人事档案已核对，按流程办理退休手续',
}

const RETURN_REASON = '佐证附件未上传，材料不完整，请补充后重新提交'

function pending(id, name, unit, category, days, submitter, submitDaysAgo) {
  return {
    id,
    name,
    unit,
    category,
    expireDate: dateOffset(days),
    handleStatus: 'pending',
    handleRemark: BRIEFS[category],
    submitter,
    submitTime: timeOffset(submitDaysAgo, 10),
    auditor: '',
    auditOpinion: '',
    auditTime: '',
  }
}

function audited(id, name, unit, category, days, status, submitter, submitDaysAgo, auditor, opinion, auditHoursAgo) {
  return {
    id,
    name,
    unit,
    category,
    expireDate: dateOffset(days),
    handleStatus: status,
    handleRemark: BRIEFS[category],
    submitter,
    submitTime: timeOffset(submitDaysAgo, 10),
    auditor,
    auditOpinion: opinion,
    auditTime: timeOffset(1, 15 + (auditHoursAgo % 6)),
  }
}

const RAW_RECORDS = [
  pending('wr-01', '陈立群', '电子与通信工程学院', 'contract', 12, '李建国', 2),
  pending('wr-02', '林静怡', '人事处', 'retire', 25, '张敏', 3),
  pending('wr-03', '王慧', '财经商贸学院', 'certificate', 40, '王海涛', 3),
  pending('wr-04', '罗一凡', '人工智能学院', 'appointment', 55, '陈晓东', 4),
  pending('wr-05', '马新华', '机电工程学院', 'contract', 70, '刘志强', 5),
  pending('wr-06', '何志远', '建筑工程学院', 'retire', 85, '赵敏', 6),
  pending('wr-07', '苏大强', '研究生院', 'certificate', 100, '周琳', 7),
  pending('wr-08', '刘洋', '信息技术学院', 'contract', 120, '吴俊', 8),
  pending('wr-10', '居曜瑞', '材料科学与工程学院', 'retire', 160, '冯超', 9),
  audited('wr-09', '韩显凤', '外国语学院', 'appointment', 140, 'approved', '许静', 14, '高管理员', '续签材料齐全，同意通过', 1),
  audited('wr-11', '闫丘恨真', '汽车与交通学院', 'certificate', 175, 'approved', '何磊', 17, '高管理员', '换证材料已核验，同意通过', 2),
  audited('wr-12', '李四', '数理学院', 'contract', 200, 'approved', '马晓东', 20, '高管理员', '同意通过', 2),
  audited('wr-13', '赵文博', '电子与通信工程学院', 'appointment', 220, 'returned', '杨帆', 23, '高管理员', RETURN_REASON, 3),
  audited('wr-14', '钱雅芝', '人事处', 'contract', 240, 'approved', '蒋宁', 26, '高管理员', '同意通过', 4),
  audited('wr-15', '孙启航', '人工智能学院', 'retire', 260, 'approved', '谢婷', 29, '高管理员', '退休手续按流程办理，同意', 5),
  audited('wr-16', '周佩兰', '财经商贸学院', 'certificate', 280, 'returned', '沈涛', 32, '高管理员', RETURN_REASON, 5),
]

// 默认按到期日期升序（越临近越靠前），审核队列先处理最紧急的
export const AUDIT_RECORDS = [...RAW_RECORDS].sort((a, b) => (a.expireDate < b.expireDate ? -1 : 1))

// 剩余天数（由到期日期派生，非登记字段）
export function remainDays(record) {
  const expire = new Date(String(record.expireDate).replace(/-/g, '/'))
  const diff = Math.round((expire - TODAY) / 86400000)
  return diff >= 0 ? diff : 0
}

export function unitOptions(records = AUDIT_RECORDS) {
  return ['全部', ...Array.from(new Set(records.map((row) => row.unit)))]
}

export function statusCounts(records) {
  return {
    pending: records.filter((row) => row.handleStatus === 'pending').length,
    handled: records.filter((row) => row.handleStatus !== 'pending').length,
    all: records.length,
  }
}
