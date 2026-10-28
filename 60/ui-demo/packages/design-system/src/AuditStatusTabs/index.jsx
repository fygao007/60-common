import './index.css'

const defaultItems = [
  { key: 'pending', label: '待审核', count: 0 },
  { key: 'reviewed', label: '已审核' },
  { key: 'all', label: '全部' },
]

export default function DSAuditStatusTabs({
  items = defaultItems,
  activeKey = 'pending',
  onChange,
  className = '',
}) {
  const classes = ['ds-audit-status-tabs', className].filter(Boolean).join(' ')

  return (
    <nav className={classes} aria-label="审核状态">
      {items.map((item) => {
        const key = item.key || item.label
        return (
          <button
            className={['ds-audit-status-tabs__item', key === activeKey && 'is-active'].filter(Boolean).join(' ')}
            type="button"
            disabled={item.disabled}
            key={key}
            onClick={() => onChange?.(key, item)}
          >
            <span>{item.label}</span>
            {typeof item.count === 'number' && <em>{item.count}</em>}
          </button>
        )
      })}
    </nav>
  )
}
