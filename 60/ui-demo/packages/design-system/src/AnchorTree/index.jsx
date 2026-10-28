import React, { useState } from 'react'
import './index.css'

const defaultGroups = [
  {
    key: 'group-1',
    title: '分组一',
    badge: 3,
    children: [
      { key: 'item-1-1', href: '#section-1', title: '节点1-1' },
      { key: 'item-1-2', href: '#section-2', title: '节点1-2' },
      { key: 'item-1-3', href: '#section-3', title: '节点1-3' },
    ],
  },
  {
    key: 'group-2',
    title: '分组二',
    children: [
      { key: 'item-2-1', href: '#section-4', title: '节点2-1' },
      { key: 'item-2-2', href: '#section-5', title: '节点2-2' },
    ],
  },
]

function renderGroup(group, activeKey, collapsedKeys, onToggle, onChange) {
  const isCollapsed = collapsedKeys.has(group.key)
  const groupClasses = [
    'ds-anchor-tree__group',
    isCollapsed && 'is-collapsed',
  ].filter(Boolean).join(' ')

  return (
    <li className={groupClasses} key={group.key}>
      <div
        className="ds-anchor-tree__group-link"
        onClick={() => onToggle?.(group.key)}
        role="button"
        aria-expanded={!isCollapsed}
        tabIndex={0}
      >
        <span className="ds-anchor-tree__toggle" aria-hidden="true">▶</span>
        <span className="ds-anchor-tree__group-title">{group.title}</span>
        {group.badge !== undefined && (
          <span className="ds-anchor-tree__group-badge">{group.badge}</span>
        )}
      </div>
      {group.children?.length > 0 && (
        <ul className="ds-anchor-tree__sub">
          {group.children.map((item) => {
            const itemKey = item.key || item.href || item.title
            const active = itemKey === activeKey || item.href === activeKey
            const itemClasses = [
              'ds-anchor-tree__item',
              active && 'is-active',
              item.disabled && 'is-disabled',
            ].filter(Boolean).join(' ')

            return (
              <li className={itemClasses} key={itemKey}>
                <a
                  className="ds-anchor-tree__link"
                  href={item.disabled ? undefined : item.href}
                  aria-current={active ? 'true' : undefined}
                  aria-disabled={item.disabled ? 'true' : undefined}
                  title={item.title}
                  onClick={(event) => {
                    if (item.disabled) {
                      event.preventDefault()
                      return
                    }
                    onChange?.(itemKey, item, event)
                  }}
                >
                  <span>{item.title}</span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

export default function DSAnchorTree({
  groups = defaultGroups,
  activeKey,
  defaultCollapsed = [],
  collapsed,
  onToggle,
  onChange,
  size = 'default',
  bordered = false,
  className = '',
  'aria-label': ariaLabel = '分组锚点树',
  ...restProps
}) {
  // 受控/非受控折叠状态
  const isControlled = collapsed !== undefined
  const [internalCollapsed, setInternalCollapsed] = useState(
    new Set(defaultCollapsed)
  )
  const collapsedKeys = isControlled ? new Set(collapsed) : internalCollapsed

  const handleToggle = (groupKey) => {
    if (isControlled) {
      onToggle?.(groupKey)
    } else {
      setInternalCollapsed((prev) => {
        const next = new Set(prev)
        if (next.has(groupKey)) {
          next.delete(groupKey)
        } else {
          next.add(groupKey)
        }
        return next
      })
      onToggle?.(groupKey)
    }
  }

  const classes = [
    'ds-anchor-tree',
    size === 'small' && 'ds-anchor-tree--small',
    bordered && 'ds-anchor-tree--bordered',
    className,
  ].filter(Boolean).join(' ')

  return (
    <nav className={classes} aria-label={ariaLabel} {...restProps}>
      <ul className="ds-anchor-tree__list">
        {groups.map((group) =>
          renderGroup(group, activeKey, collapsedKeys, handleToggle, onChange)
        )}
      </ul>
    </nav>
  )
}