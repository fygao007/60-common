/**
 * 统一状态指示器：圆点 + 文字（AGENTS.md 状态展示规则）
 * 用法：
 *   <StatusDot value="填报中" />            自动按文案推断色组
 *   <StatusDot value="特殊态" tone="warn" /> 显式指定色组
 * 色组：done=完成/生效 process=处理中 warn=退回/待补 neutral=未开始 danger=强提示
 */
import './StatusDot.css'

// 完成 / 生效
const DONE = new Set(['已通过', '通过', '已提交', '已提交审核', '已完成', '已发布', '已生效'])

// 处理中
const PROCESS = new Set(['填报中', '审核中', '待审核', '进行中', '处理中', '已提交复核'])

// 退回类（需再次处理）
const WARN = new Set(['已退回', '退回', '待补充材料', '待重新提交'])

// 强提示
const DANGER = new Set(['已作废', '已终止'])

export function statusTone(value) {
  const text = value == null ? '' : String(value)
  if (DONE.has(text)) return 'done'
  if (PROCESS.has(text)) return 'process'
  if (WARN.has(text)) return 'warn'
  if (DANGER.has(text)) return 'danger'
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
