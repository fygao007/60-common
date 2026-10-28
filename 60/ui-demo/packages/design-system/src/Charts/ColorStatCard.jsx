/**
 * ColorStatCard - 彩色统计卡片组
 * 一行多个彩色统计卡，每张卡：浅色背景 + 同色系深色文字
 * 用于首页/看板页的关键指标展示
 */

import './ColorStatCard.css'

// 预设颜色方案（浅底 + 深色文字）
const COLOR_SCHEMES = {
  purple: { bg: '#EBEDFF', text: '#060C77' },
  cyan: { bg: '#E9FAFB', text: '#0F4A68' },
  blue: { bg: '#EBF2FF', text: '#0F2C67' },
  green: { bg: '#F1FDF8', text: '#083A25' },
  deepPurple: { bg: '#EEEBFF', text: '#1A0F67' },
  pink: { bg: '#FFF0F7', text: '#470A27' },
  orange: { bg: '#FFF7EB', text: '#67450F' },
}

// 默认图标（简单 SVG）
const DEFAULT_ICONS = {
  project: (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="10" height="10" rx="2" />
      <path d="M5 7h4M7 5v4" />
    </svg>
  ),
  award: (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="5" r="3" />
      <path d="M5 8l-1 4 3-2 3 2-1-4" />
    </svg>
  ),
  person: (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="4" r="2.5" />
      <path d="M3 12c0-2.5 2-4 4-4s4 1.5 4 4" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11V6M7 11V4M11 11V8" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h10v9H2z" />
      <path d="M7 3v9M2 6h5" />
    </svg>
  ),
  money: (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5" />
      <path d="M7 4v6M5 6h4M5 8h4" />
    </svg>
  ),
  time: (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5" />
      <path d="M7 4v3l2 2" />
    </svg>
  ),
}

function ColorStatItem({ item, index }) {
  // 颜色方案：预设名或自定义
  const scheme = typeof item.color === 'string' && COLOR_SCHEMES[item.color]
    ? COLOR_SCHEMES[item.color]
    : { bg: item.bg || '#EBEDFF', text: item.textColor || '#060C77' }

  // 图标：预设名或自定义 SVG
  const iconNode = item.icon
    ? (typeof item.icon === 'string' && DEFAULT_ICONS[item.icon] ? DEFAULT_ICONS[item.icon] : item.icon)
    : DEFAULT_ICONS.project

  return (
    <div
      className="color-stat-card__item"
      style={{ backgroundColor: scheme.bg }}
    >
      <div className="color-stat-card__content">
        <div className="color-stat-card__header" style={{ color: scheme.text }}>
          <span className="color-stat-card__label">{item.label}</span>
          <span className="color-stat-card__icon">{iconNode}</span>
        </div>
        <div className="color-stat-card__body" style={{ color: scheme.text }}>
          <div className="color-stat-card__value-row">
            <span className="color-stat-card__value">{item.value}</span>
            <span className="color-stat-card__unit">{item.unit || ''}</span>
          </div>
          {item.compare ? (
            <span className="color-stat-card__compare">对比:{item.compare}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function ColorStatCard({
  items,
  className,
  style,
}) {
  if (!items || items.length === 0) return null

  return (
    <div
      className={['color-stat-card', className].filter(Boolean).join(' ')}
      style={style}
    >
      {items.map((item, index) => (
        <ColorStatItem key={item.id || index} item={item} index={index} />
      ))}
    </div>
  )
}

// 导出颜色方案供外部使用
export { COLOR_SCHEMES, DEFAULT_ICONS }