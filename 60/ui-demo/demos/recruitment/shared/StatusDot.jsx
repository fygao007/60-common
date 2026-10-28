// 统一状态展示：圆点 + 状态文字
//
// 依据《招聘管理需求说明书》第 10 章「状态展示规范」与本目录 AGENTS.md：
//   列表、详情摘要和流程节点中的状态一律用「圆点 + 状态文字」，禁止用色块标签承载常规业务状态。
//   灰色 = 待提交、未开始、草稿、已撤回等未进入或已终止流程的状态
//   蓝色 = 审核中、进行中、待办理等处理中状态
//   绿色 = 已通过、已结束、已发布、已录用等完成或生效状态
//   橙色 = 已退回（见第 8 章「业务对象状态」中岗位申请的颜色列）
//
// 圆点只辅助表达状态分组，文字必须显示真实业务状态，颜色不得作为状态的唯一表达。
//
// 用法：
//   <StatusDot value="已发布" />              自动按下表推断色组
//   <StatusDot value="特殊态" tone="process" />  显式指定色组
import './StatusDot.css'

// 完成 / 生效
const DONE = new Set([
  '已通过', '通过', '符合', '符合要求', '合格', '已发布', '已结束', '已录用', '正式录用',
  '已完成', '已办结', '已生成', '已启用', '启用', '已体检', '已确认', '已上传', '已锁定',
  '已转递', '拟录用', '发送成功', '已确认参加',
])

// 处理中
const PROCESS = new Set([
  '审核中', '待审核', '进行中', '处理中', '执行中', '编辑中', '待办理', '待审批', '招聘中',
  '报名中', '待确认', '待确认参加', '待确认结果', '待发准考证', '待发通知', '待录成绩',
  '待登记结果', '待上传成绩', '待填写意见', '待提交复核', '已提交复核', '待体检', '待通知',
  '待录用确认', '待录用', '待生成', '待处理',
])

// 退回类（需申报人 / 候选人再次处理）
const WARN = new Set([
  '已退回', '退回', '待补充材料', '待重新提交', '调档信息退回', '发送失败',
])

// 其余（待提交、草稿、未开始、已撤回、不通过、已停用……）一律走 neutral

export function statusTone(value) {
  const text = String(value ?? '').trim()
  if (!text) return 'neutral'
  if (DONE.has(text)) return 'done'
  if (PROCESS.has(text)) return 'process'
  if (WARN.has(text)) return 'warn'
  return 'neutral'
}

export default function StatusDot({ value, tone, className = '' }) {
  const text = value == null || value === '' ? '-' : String(value)
  const resolved = tone || statusTone(text)
  return (
    <span className={`ds-status-dot ds-status-dot--${resolved} ${className}`.trim()}>
      <i aria-hidden="true" />
      {text}
    </span>
  )
}
