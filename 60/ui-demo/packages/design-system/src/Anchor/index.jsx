import './index.css'

const defaultItems = [
  { key: 'overview', href: '#overview', title: '组件概览' },
  {
    key: 'usage',
    href: '#usage',
    title: '使用方式',
    children: [
      { key: 'basic', href: '#basic', title: '基础锚点' },
      { key: 'horizontal', href: '#horizontal', title: '横向锚点' },
    ],
  },
  { key: 'api', href: '#api', title: 'API' },
]

function renderItems(items, activeKey, onChange, depth = 0) {
  return items.map((item) => {
    const key = item.key || item.href || item.title
    const active = key === activeKey || item.href === activeKey
    const classes = [
      'ds-anchor__item',
      active && 'is-active',
      item.disabled && 'is-disabled',
    ].filter(Boolean).join(' ')

    return (
      <li className={classes} key={key} style={{ '--ds-anchor-depth': depth }}>
        <a
          className="ds-anchor__link"
          href={item.disabled ? undefined : item.href}
          aria-current={active ? 'true' : undefined}
          aria-disabled={item.disabled ? 'true' : undefined}
          title={item.title}
          onClick={(event) => {
            if (item.disabled) {
              event.preventDefault()
              return
            }

            onChange?.(key, item, event)
          }}
        >
          <span>{item.title}</span>
        </a>
        {item.children?.length > 0 && (
          <ol className="ds-anchor__list ds-anchor__list--nested">
            {renderItems(item.children, activeKey, onChange, depth + 1)}
          </ol>
        )}
      </li>
    )
  })
}

export default function DSAnchor({
  items = defaultItems,
  activeKey,
  direction = 'vertical',
  placement = 'left',
  size = 'default',
  bordered = false,
  offset = false,
  onChange,
  className = '',
  'aria-label': ariaLabel = '锚点导航',
  ...restProps
}) {
  const classes = [
    'ds-anchor',
    `ds-anchor--${direction}`,
    placement === 'right' && 'ds-anchor--right',
    size === 'small' && 'ds-anchor--small',
    bordered && 'ds-anchor--bordered',
    offset && 'ds-anchor--offset',
    className,
  ].filter(Boolean).join(' ')

  return (
    <nav className={classes} aria-label={ariaLabel} {...restProps}>
      <ol className="ds-anchor__list">
        {renderItems(items, activeKey, onChange)}
      </ol>
    </nav>
  )
}
