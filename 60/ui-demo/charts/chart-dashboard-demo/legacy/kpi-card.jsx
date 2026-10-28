/**
 * KpiCard - 顶部 KPI 统计卡片（演示用，仅用于 chart-dashboard-demo）
 * 纯净白卡 + 简单线性 SVG 图标，无渐变高光
 */

import './kpi-card.css'

// 线性 SVG 图标（24x24，stroke 用 currentColor）
const ICONS = {
  total: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  types: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9l6 3" />
    </svg>
  ),
  donut: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  ),
  pie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 0 9 9h-9z" />
      <path d="M12 3v9" />
    </svg>
  ),
  barHorizontal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 6h12M4 12h16M4 18h9" />
    </svg>
  ),
  barVertical: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 20V8M12 20V4M18 20v-9" />
    </svg>
  ),
  line: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l5-5 4 3 8-8" />
    </svg>
  ),
  areaLine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l5-5 4 3 8-8v11z" />
    </svg>
  ),
  radar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 6-3 9H7l-3-9z" />
      <path d="M12 3v18M4 9l16 0M7 18l10-12" />
    </svg>
  ),
  progressRing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 3a9 9 0 1 1-9 9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  rankBar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
    </svg>
  ),
}

export default function KpiCard({ icon, label, value, subtext, accent }) {
  const iconNode = ICONS[icon] || ICONS.total

  return (
    <div className={['kpi-card', accent ? `kpi-card--${accent}` : ''].filter(Boolean).join(' ')}>
      <div className="kpi-card__icon">{iconNode}</div>
      <div className="kpi-card__label">{label}</div>
      <strong className="kpi-card__value">{value}</strong>
      {subtext ? <div className="kpi-card__subtext">{subtext}</div> : null}
    </div>
  )
}