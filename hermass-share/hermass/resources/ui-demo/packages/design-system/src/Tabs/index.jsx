import { useRef } from 'react'
import './index.css'

export default function DSTabs({
  items = [],
  activeKey,
  onChange,
  onMore,
  size = 'default',
  variant = 'default',
  orientation = 'horizontal',
  align = 'left',
  overflow = false,
  className = '',
}) {
  const scrollerRef = useRef(null)
  if (variant === 'section' && items.length <= 1) return null
  const classes = [
    'ds-tabs',
    size === 'large' && 'ds-tabs--large',
    variant === 'section' && 'ds-tabs--section',
    variant === 'top' && 'ds-tabs--top',
    variant === 'side' && 'ds-tabs--side',
    orientation === 'vertical' && 'ds-tabs--vertical',
    align === 'right' && 'ds-tabs--align-right',
    className,
  ].filter(Boolean).join(' ')

  const scroll = (direction) => {
    scrollerRef.current?.scrollBy({ left: direction * 160, behavior: 'smooth' })
  }

  const tabs = (
    <nav className={classes} aria-label="页签">
      {items.map((item) => {
        const key = item.key || item.label
        const active = key === activeKey
        const labelText = typeof item.label === 'string' ? item.label : String(key)
        return (
          <span className={['ds-tabs__entry', active && 'is-active'].filter(Boolean).join(' ')} key={key}>
            <button
              className={['ds-tabs__item', active && 'is-active'].filter(Boolean).join(' ')}
              type="button"
              disabled={item.disabled}
              title={item.title || labelText}
              onClick={() => onChange?.(key, item)}
            >
              {item.icon && <span className="ds-tabs__icon" aria-hidden="true">{item.icon}</span>}
              <span className="ds-tabs__label">{item.label}</span>
              {typeof item.count === 'number' && <em>{item.count}</em>}
            </button>
            {(item.more || item.actions || item.onMore) && (
              <button
                className="ds-tabs__more"
                type="button"
                aria-label={`${labelText} 更多操作`}
                onClick={(event) => {
                  event.stopPropagation()
                  item.onMore?.(key, item)
                  onMore?.(key, item)
                }}
              >
                ...
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )

  if (!overflow) return tabs

  return (
    <div className="ds-tabs-overflow">
      <button className="ds-tabs-overflow__button" type="button" aria-label="向左切换" onClick={() => scroll(-1)}>‹</button>
      <div className="ds-tabs-overflow__viewport" ref={scrollerRef}>{tabs}</div>
      <button className="ds-tabs-overflow__button" type="button" aria-label="向右切换" onClick={() => scroll(1)}>›</button>
    </div>
  )
}
