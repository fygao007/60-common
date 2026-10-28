// 预警中心 · 共享 Mock 数据与字典（产品级单源，页面只消费不复制）
//
// 预警事项 4 类（需求卡确认）：合同到期 / 聘期到期 / 资格证书到期 / 退休到期
// 到期日期字段口径（ontology）：
//   合同到期     → Business.warningCenter.contractExpireDate（合同到期日期）
//   聘期到期     → Business.warningCenter.appointmentExpireDate（聘期到期日期）
//   资格证书到期 → Business.warningCenter.certificateExpireDate（资格证书有效期）
//   退休到期     → StaffBasicInformation.yjltxrq（预计离退休日期，标准库已有）
// 人员维度字段：姓名 xm / 所在单位 szdwdm（标准库已有）

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

export const FREQUENCIES = ['一次', '每天', '每周']

export const RECEIVER_ROLES = ['人事处专员', '二级学院管理员', '部门负责人']

// 到期基准日：以今天为锚点生成剩余天数，保证 demo 语义稳定
const TODAY = new Date()
function dateOffset(days) {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + days)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function triggerOffset(hoursAgo) {
  const d = new Date(TODAY)
  d.setHours(9 - (hoursAgo % 9), 0, 0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:00`
}

const RAW_RECORDS = [
  { id: 'wr-01', name: '陈立群', unit: '电子与通信工程学院', category: 'contract', expireDate: dateOffset(12), status: '未处理', triggerTime: triggerOffset(1) },
  { id: 'wr-02', name: '林静怡', unit: '人事处', category: 'retire', expireDate: dateOffset(25), status: '未处理', triggerTime: triggerOffset(2) },
  { id: 'wr-03', name: '王慧', unit: '财经商贸学院', category: 'certificate', expireDate: dateOffset(40), status: '未处理', triggerTime: triggerOffset(3) },
  { id: 'wr-04', name: '罗一凡', unit: '人工智能学院', category: 'appointment', expireDate: dateOffset(55), status: '未处理', triggerTime: triggerOffset(5) },
  { id: 'wr-05', name: '马新华', unit: '机电工程学院', category: 'contract', expireDate: dateOffset(70), status: '未处理', triggerTime: triggerOffset(6) },
  { id: 'wr-06', name: '何志远', unit: '建筑工程学院', category: 'retire', expireDate: dateOffset(85), status: '未处理', triggerTime: triggerOffset(8) },
  { id: 'wr-07', name: '苏大强', unit: '研究生院', category: 'certificate', expireDate: dateOffset(100), status: '已处理', triggerTime: triggerOffset(10) },
  { id: 'wr-08', name: '刘洋', unit: '信息技术学院', category: 'contract', expireDate: dateOffset(120), status: '未处理', triggerTime: triggerOffset(12) },
  { id: 'wr-09', name: '韩显凤', unit: '外国语学院', category: 'appointment', expireDate: dateOffset(140), status: '已处理', triggerTime: triggerOffset(15) },
  { id: 'wr-10', name: '居曜瑞', unit: '材料科学与工程学院', category: 'retire', expireDate: dateOffset(160), status: '未处理', triggerTime: triggerOffset(18) },
  { id: 'wr-11', name: '闫丘恨真', unit: '汽车与交通学院', category: 'certificate', expireDate: dateOffset(175), status: '已处理', triggerTime: triggerOffset(21) },
  { id: 'wr-12', name: '李四', unit: '数理学院', category: 'contract', expireDate: dateOffset(200), status: '已处理', triggerTime: triggerOffset(24) },
  { id: 'wr-13', name: '赵文博', unit: '电子与通信工程学院', category: 'appointment', expireDate: dateOffset(220), status: '已处理', triggerTime: triggerOffset(28) },
  { id: 'wr-14', name: '钱雅芝', unit: '人事处', category: 'contract', expireDate: dateOffset(240), status: '已处理', triggerTime: triggerOffset(32) },
  { id: 'wr-15', name: '孙启航', unit: '人工智能学院', category: 'retire', expireDate: dateOffset(260), status: '已处理', triggerTime: triggerOffset(36) },
  { id: 'wr-16', name: '周佩兰', unit: '财经商贸学院', category: 'certificate', expireDate: dateOffset(280), status: '已处理', triggerTime: triggerOffset(40) },
]

// 预警记录：默认触发时间倒序（需求卡确认）
export const RECORDS = [...RAW_RECORDS].sort((a, b) => (a.triggerTime < b.triggerTime ? 1 : -1))

// 剩余天数（由到期日期派生，非登记字段）
export function remainDays(record) {
  const expire = new Date(String(record.expireDate).replace(/-/g, '/'))
  const diff = Math.round((expire - TODAY) / 86400000)
  return diff >= 0 ? diff : 0
}

export function categoryStats() {
  return CATEGORIES.map((item) => {
    const rows = RECORDS.filter((row) => row.category === item.key)
    return {
      key: item.key,
      label: item.label,
      total: rows.length,
      pending: rows.filter((row) => row.status === '未处理').length,
    }
  })
}

// 预警规则（示例数据，按需求卡字段口径）
export const RULES = [
  { id: 'rl-01', ruleName: '劳动合同到期30天提醒', category: 'contract', advanceDays: 30, frequency: '一次', receiverRole: '人事处专员', status: '启用', updateTime: '2026-09-20 10:30' },
  { id: 'rl-02', ruleName: '劳动合同到期90天提醒', category: 'contract', advanceDays: 90, frequency: '每周', receiverRole: '二级学院管理员', status: '启用', updateTime: '2026-09-18 14:05' },
  { id: 'rl-03', ruleName: '聘期考核到期提醒', category: 'appointment', advanceDays: 60, frequency: '每天', receiverRole: '人事处专员', status: '启用', updateTime: '2026-09-15 09:12' },
  { id: 'rl-04', ruleName: '教师资格证有效期提醒', category: 'certificate', advanceDays: 90, frequency: '一次', receiverRole: '部门负责人', status: '启用', updateTime: '2026-09-10 16:40' },
  { id: 'rl-05', ruleName: '退休到达前半年提醒', category: 'retire', advanceDays: 180, frequency: '每周', receiverRole: '人事处专员', status: '启用', updateTime: '2026-09-05 11:25' },
  { id: 'rl-06', ruleName: '退休到达前一个月提醒', category: 'retire', advanceDays: 30, frequency: '每天', receiverRole: '部门负责人', status: '停用', updateTime: '2026-08-28 17:02' },
]
