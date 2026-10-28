import { useMemo, useState } from 'react'
import './index.css'

const ARROW_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8,10.66650390625L4,6.66650390625L12,6.66650390625L8,10.66650390625Z" fill="currentColor" fillOpacity="1" />
  </svg>
)

const DRAG_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M5.5,2C4.95000014,2,4.5,2.4499999900000002,4.5,3C4.5,3.55,4.95000014,4,5.5,4C6.05,4,6.5,3.55,6.5,3C6.5,2.45000014,6.05,2,5.5,2ZM5.5,12C4.95000014,12,4.5,12.45,4.5,13C4.5,13.550001,4.95000014,14,5.5,14C6.05,14,6.5,13.550001,6.5,13C6.5,12.45,6.05,12,5.5,12ZM5.5,7C4.95000014,7,4.5,7.4500003,4.5,8C4.5,8.5500002,4.95000014,9,5.5,9C6.05,9,6.5,8.5500002,6.5,8C6.5,7.4500003,6.05,7,5.5,7ZM10.5,2C9.9500003,2,9.5,2.4499999900000002,9.5,3C9.5,3.55,9.9500003,4,10.5,4C11.0500002,4,11.5,3.55,11.5,3C11.5,2.45000014,11.0500002,2,10.5,2ZM10.5,12C9.9500003,12,9.5,12.45,9.5,13C9.5,13.550001,9.9500003,14,10.5,14C11.0500002,14,11.5,13.550001,11.5,13C11.5,12.45,11.0500002,12,10.5,12ZM10.5,7C9.9500003,7,9.5,7.4500003,9.5,8C9.5,8.5500002,9.9500003,9,10.5,9C11.0500002,9,11.5,8.5500002,11.5,8C11.5,7.4500003,11.0500002,7,10.5,7Z" fill="currentColor" />
  </svg>
)

function collectExpandableKeys(nodes, keys = []) {
  nodes.forEach((node) => {
    if (node.children?.length) {
      keys.push(node.key)
      collectExpandableKeys(node.children, keys)
    }
  })
  return keys
}

function findNode(nodes, key) {
  for (const node of nodes) {
    if (node.key === key) return node
    const child = node.children?.length ? findNode(node.children, key) : null
    if (child) return child
  }
  return null
}

export default function DSTree({
  dataSource = [],
  selectedKey,
  expandedKeys,
  defaultExpandedKeys,
  defaultExpandAll = false,
  onSelect,
  onExpand,
  onDrop,
  className = '',
  ariaLabel = '树形目录',
}) {
  const initialExpandedKeys = useMemo(() => {
    if (defaultExpandedKeys) return defaultExpandedKeys
    return defaultExpandAll ? collectExpandableKeys(dataSource) : []
  }, [])
  const [internalExpandedKeys, setInternalExpandedKeys] = useState(initialExpandedKeys)
  const [dragKey, setDragKey] = useState(null)
  const [dropKey, setDropKey] = useState(null)
  const currentExpandedKeys = expandedKeys ?? internalExpandedKeys

  const setExpanded = (node, expanded) => {
    const nextKeys = expanded
      ? [...new Set([...currentExpandedKeys, node.key])]
      : currentExpandedKeys.filter((key) => key !== node.key)
    if (expandedKeys === undefined) setInternalExpandedKeys(nextKeys)
    onExpand?.(nextKeys, node, expanded)
  }

  const renderNodes = (nodes, depth = 0) => (
    <ul className="ds-tree__group" role={depth === 0 ? 'tree' : 'group'} aria-label={depth === 0 ? ariaLabel : undefined}>
      {nodes.map((node) => {
        const hasChildren = Boolean(node.children?.length)
        const expanded = hasChildren && currentExpandedKeys.includes(node.key)
        const selected = node.key === selectedKey
        return (
          <li
            className={[
              'ds-tree__node',
              hasChildren && 'has-children',
              selected && 'is-selected',
              dropKey === node.key && dragKey !== node.key && 'is-drop-target',
              node.disabled && 'is-disabled',
            ].filter(Boolean).join(' ')}
            key={node.key}
            role="treeitem"
            aria-expanded={hasChildren ? expanded : undefined}
            aria-selected={selected}
            aria-disabled={node.disabled || undefined}
          >
            <div
              className="ds-tree__row"
              style={{ '--ds-tree-indent': `${8 + depth * 20}px` }}
              onDragOver={(event) => {
                if (!dragKey || dragKey === node.key) return
                event.preventDefault()
                setDropKey(node.key)
              }}
              onDragLeave={() => setDropKey((current) => (current === node.key ? null : current))}
              onDrop={(event) => {
                if (!dragKey || dragKey === node.key) return
                event.preventDefault()
                onDrop?.({
                  dragKey,
                  dropKey: node.key,
                  dragNode: findNode(dataSource, dragKey),
                  dropNode: node,
                })
                setDragKey(null)
                setDropKey(null)
              }}
            >
              {hasChildren ? (
                <button
                  className={['ds-tree__toggle', expanded && 'is-expanded'].filter(Boolean).join(' ')}
                  type="button"
                  aria-label={`${expanded ? '收起' : '展开'}${node.title}`}
                  onClick={() => setExpanded(node, !expanded)}
                >
                  {ARROW_SVG}
                </button>
              ) : <span className="ds-tree__spacer" aria-hidden="true" />}
              <button
                className="ds-tree__label"
                type="button"
                disabled={node.disabled}
                onClick={() => onSelect?.(node.key, node)}
                onKeyDown={(event) => {
                  if (!hasChildren) return
                  if (event.key === 'ArrowRight' && !expanded) setExpanded(node, true)
                  if (event.key === 'ArrowLeft' && expanded) setExpanded(node, false)
                }}
              >
                {node.icon ? <span className="ds-tree__icon" aria-hidden="true">{node.icon}</span> : null}
                <span className="ds-tree__title" title={typeof node.title === 'string' ? node.title : undefined}>{node.title}</span>
                {node.required ? <span className="ds-tree__required">必填</span> : null}
                {typeof node.count === 'number' ? <span className="ds-tree__count">{node.count}</span> : null}
              </button>
              {node.draggable || node.actions?.length ? (
                <span className="ds-tree__actions" role="group" aria-label={`${node.title}操作`}>
                  {node.draggable ? (
                    <button
                      className="ds-tree__action ds-tree__drag"
                      type="button"
                      draggable
                      aria-label={`拖拽${node.title}`}
                      onDragStart={(event) => {
                        event.stopPropagation()
                        event.dataTransfer?.setData('text/plain', node.key)
                        setDragKey(node.key)
                      }}
                      onDragEnd={() => {
                        setDragKey(null)
                        setDropKey(null)
                      }}
                    >
                      {DRAG_SVG}
                    </button>
                  ) : null}
                  {node.actions?.map((action) => (
                    <button
                      className={['ds-tree__action', action.danger && 'is-danger'].filter(Boolean).join(' ')}
                      type="button"
                      disabled={action.disabled}
                      key={action.key || action.label}
                      onClick={(event) => {
                        event.stopPropagation()
                        action.onClick?.(node)
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </span>
              ) : null}
            </div>
            {expanded ? renderNodes(node.children, depth + 1) : null}
          </li>
        )
      })}
    </ul>
  )

  return <div className={['ds-tree', className].filter(Boolean).join(' ')}>{renderNodes(dataSource)}</div>
}
