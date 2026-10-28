/**
 * SegmentBarCard - 条形占比统计卡片
 * 用于展示分段占比/状态分布，类似数据采集健康度
 */

import './SegmentBarCard.css'

// 状态色（语义色）
const SEGMENT_COLORS = {
  excellent: '#1FB09D',
  good: '#3167FF',
  attention: '#FF913B',
  risk: '#FA5151',
}

export default function SegmentBarCard({
  title,
  actionLabel = '查看详情',
  onAction,
  stats,
  segments,
  className,
  style,
}) {
  if (!segments || segments.length === 0) return null

  const totalValue = segments.reduce((sum, seg) => sum + seg.value, 0)

  return (
    <section
      className={['segment-bar-card', className].filter(Boolean).join(' ')}
      style={style}
    >
      <header className="segment-bar-card__header">
        <div className="segment-bar-card__header-left">
          <span className="segment-bar-card__header-bar" aria-hidden="true" />
          <h3 className="segment-bar-card__title">{title}</h3>
        </div>
        {actionLabel ? (
          <button
            className="segment-bar-card__action"
            onClick={onAction}
            type="button"
          >
            {actionLabel}
          </button>
        ) : null}
      </header>

      {stats && stats.length > 0 ? (
        <div className="segment-bar-card__stats">
          {stats.map((stat, index) => (
            <div key={index} className="segment-bar-card__stat-item">
              <strong className={['segment-bar-card__stat-value', stat.risk ? 'segment-bar-card__stat-value--risk' : null].filter(Boolean).join(' ')}>{stat.value}</strong>
              <span className="segment-bar-card__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="segment-bar-card__bar-wrapper">
        <div className="segment-bar-card__bar">
          {segments.map((seg, index) => {
            const percent = ((seg.value / totalValue) * 100).toFixed(1)
            const color = SEGMENT_COLORS[seg.status] || SEGMENT_COLORS.good
            return (
              <div
                key={index}
                className="segment-bar-card__segment"
                style={{
                  width: `${percent}%`,
                  backgroundColor: color,
                }}
                aria-label={`${seg.label}: ${seg.value} (${percent}%)`}
              />
            )
          })}
        </div>
      </div>

      <div className="segment-bar-card__legend">
        {segments.map((seg, index) => {
          const color = SEGMENT_COLORS[seg.status] || SEGMENT_COLORS.good
          return (
            <div key={index} className="segment-bar-card__legend-item">
              <span
                className="segment-bar-card__legend-dot"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span className="segment-bar-card__legend-label">{seg.label}</span>
              <span className="segment-bar-card__legend-value">{seg.value}人</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}