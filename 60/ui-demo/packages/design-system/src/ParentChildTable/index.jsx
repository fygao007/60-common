import { useMemo, useState } from 'react'
import DSButton from '../Button'
import DSPagination from '../Pagination'
import './index.css'

const defaultParentColumns = [
  { key: 'name', title: '父级名称', width: 240 },
  { key: 'type', title: '类型', width: 140 },
  { key: 'status', title: '状态', width: 120 },
]

const defaultChildColumns = [
  { key: 'name', title: '子级名称', width: 240 },
  { key: 'owner', title: '负责人', width: 140 },
  { key: 'status', title: '状态', width: 120 },
]

export default function DSParentChildTable({
  title = '父子表格',
  summary,
  parentColumns = defaultParentColumns,
  childColumns = defaultChildColumns,
  data = [],
  rowKey = 'id',
  childrenKey = 'children',
  defaultExpandedKeys = [],
  expandedKeys,
  onExpandChange,
  parentActions = [],
  childActions = [],
  toolbarActions,
  selectable,
  selectedKeys = [],
  childSelectable = false,
  selectedChildKeys = [],
  childRowKey,
  childTitle = '子级数据',
  childSummary,
  childToolbarActions,
  childEmptyText = '暂无子级数据',
  emptyText = '暂无数据',
  rowExpandable,
  expandedRowRender,
  pagination,
  layout = 'nested',
  groupTitleKey = 'groupTitle',
  renderGroupTitle,
  renderParentSummary,
  showChildHeader = true,
  className = '',
}) {
  const [innerExpandedKeys, setInnerExpandedKeys] = useState(defaultExpandedKeys)
  const activeExpandedKeys = expandedKeys || innerExpandedKeys
  const expandedSet = useMemo(() => new Set(activeExpandedKeys), [activeExpandedKeys])
  const isGrouped = layout === 'grouped'
  const enableSelectable = selectable ?? !isGrouped
  const headerColumns = isGrouped ? childColumns : parentColumns
  const classes = ['ds-parent-child-table', 'ds-card', isGrouped && 'is-grouped', className].filter(Boolean).join(' ')

  const getKey = (record, index) => record[rowKey] ?? index
  const getChildKey = (record, parentKey, index) => record[childRowKey || rowKey] ?? `${parentKey}-${index}`

  const toggleExpand = (key, record) => {
    const nextKeys = expandedSet.has(key)
      ? activeExpandedKeys.filter((item) => item !== key)
      : [...activeExpandedKeys, key]

    if (!expandedKeys) {
      setInnerExpandedKeys(nextKeys)
    }

    onExpandChange?.(nextKeys, record)
  }

  const renderActions = (actions, record, scope) => {
    if (!actions.length) return null

    return (
      <span className="ds-parent-child-table__actions">
        {actions.map((action) => {
          const disabled = typeof action.disabled === 'function' ? action.disabled(record) : action.disabled
          return (
            <DSButton
              variant="link"
              danger={action.danger}
              disabled={disabled}
              key={action.key || action.label}
              onClick={() => action.onClick?.(record, scope)}
            >
              {action.label}
            </DSButton>
          )
        })}
      </span>
    )
  }

  const renderCell = (column, record, index) => {
    const value = record[column.key]
    return column.render ? column.render(value, record, index) : value
  }

  return (
    <section className={classes} aria-label={title}>
      <div className="ds-parent-child-table__toolbar">
        <div className="ds-parent-child-table__title">
          <strong>{title}</strong>
          {summary && <span>{summary}</span>}
        </div>
        {toolbarActions && <div className="ds-parent-child-table__toolbar-actions">{toolbarActions}</div>}
      </div>

      <div className="ds-parent-child-table__wrap">
        <table className="ds-parent-child-table__table">
          <thead>
            <tr>
              {enableSelectable && <th className="ds-parent-child-table__check"><input type="checkbox" aria-label="全选" /></th>}
              <th className="ds-parent-child-table__expand" aria-label="展开" />
              {headerColumns.map((column) => (
                <th className={column.className} style={{ width: column.width }} key={column.key}>{column.title}</th>
              ))}
              {(isGrouped ? childActions.length > 0 : parentActions.length > 0) && <th className="ds-parent-child-table__actions-col">操作</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td className="ds-parent-child-table__empty" colSpan={headerColumns.length + (enableSelectable ? 1 : 0) + 1 + ((isGrouped ? childActions.length : parentActions.length) ? 1 : 0)}>
                  {emptyText}
                </td>
              </tr>
            )}
            {data.map((record, index) => {
              const key = getKey(record, index)
              const children = record[childrenKey] || []
              const expanded = expandedSet.has(key)
              const actionColumnCount = isGrouped ? childActions.length : parentActions.length
              const childColSpan = headerColumns.length + (enableSelectable ? 1 : 0) + 1 + (actionColumnCount ? 1 : 0)
              const expandable = typeof rowExpandable === 'function' ? rowExpandable(record) : children.length > 0 || Boolean(expandedRowRender)
              const groupTitle = renderGroupTitle ? renderGroupTitle(record, index) : record[groupTitleKey]

              return (
                <FragmentRow
                  childActions={childActions}
                  childColSpan={childColSpan}
                  childColumns={childColumns}
                  childEmptyText={childEmptyText}
                  childRowKeyGetter={getChildKey}
                  childSelectable={childSelectable}
                  childSummary={childSummary}
                  childToolbarActions={childToolbarActions}
                  childrenData={children}
                  childTitle={childTitle}
                  expandable={expandable}
                  expanded={expanded}
                  expandedRowRender={expandedRowRender}
                  groupTitle={groupTitle}
                  key={key}
                  isGrouped={isGrouped}
                  parentActions={parentActions}
                  record={record}
                  renderParentSummary={renderParentSummary}
                  renderActions={renderActions}
                  renderCell={renderCell}
                  rowIndex={index}
                  rowKeyValue={key}
                  selectable={enableSelectable}
                  selected={selectedKeys.includes(key)}
                  selectedChildKeys={selectedChildKeys}
                  showChildHeader={showChildHeader}
                  toggleExpand={toggleExpand}
                  parentColumns={parentColumns}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination && <DSPagination {...pagination} />}
    </section>
  )
}

function FragmentRow({
  childActions,
  childColSpan,
  childColumns,
  childEmptyText,
  childRowKeyGetter,
  childSelectable,
  childSummary,
  childToolbarActions,
  childrenData,
  childTitle,
  expandable,
  expanded,
  expandedRowRender,
  groupTitle,
  isGrouped,
  parentActions,
  parentColumns,
  record,
  renderParentSummary,
  renderActions,
  renderCell,
  rowIndex,
  rowKeyValue,
  selectable,
  selected,
  selectedChildKeys,
  showChildHeader,
  toggleExpand,
}) {
  const hasChildren = childrenData.length > 0
  const childTableColSpan = childColumns.length + (childSelectable ? 1 : 0) + (childActions.length ? 1 : 0)
  const renderedExpandedContent = expandedRowRender?.(record)
  const parentSummary = renderParentSummary?.(record, { expanded, rowIndex }) || (
    <DefaultParentSummary record={record} parentColumns={parentColumns} />
  )

  return (
    <>
      {groupTitle && (
        <tr className="ds-parent-child-table__group-row">
          <td colSpan={childColSpan}>{groupTitle}</td>
        </tr>
      )}
      {isGrouped ? (
        <tr className={expanded ? 'ds-parent-child-table__parent-summary-row is-expanded' : 'ds-parent-child-table__parent-summary-row'}>
          <td colSpan={childColSpan}>
            <div className="ds-parent-child-table__parent-summary">
              <button
                className="ds-parent-child-table__expand-button"
                type="button"
                aria-label={expanded ? '收起子表' : '展开子表'}
                aria-expanded={expanded}
                disabled={!expandable}
                onClick={() => toggleExpand(rowKeyValue, record)}
              />
              <div className="ds-parent-child-table__parent-summary-content">{parentSummary}</div>
            </div>
          </td>
        </tr>
      ) : (
        <tr className={expanded ? 'is-expanded' : ''}>
          {selectable && (
            <td className="ds-parent-child-table__check">
              <input type="checkbox" defaultChecked={selected} aria-label={`选择第 ${rowIndex + 1} 行`} />
            </td>
          )}
          <td className="ds-parent-child-table__expand">
            <button
              className="ds-parent-child-table__expand-button"
              type="button"
              aria-label={expanded ? '收起子表' : '展开子表'}
              aria-expanded={expanded}
              disabled={!expandable}
              onClick={() => toggleExpand(rowKeyValue, record)}
            />
          </td>
          {parentColumns.map((column) => (
            <td key={column.key}>{renderCell(column, record, rowIndex)}</td>
          ))}
          {parentActions.length > 0 && <td className="ds-parent-child-table__actions-col">{renderActions(parentActions, record, 'parent')}</td>}
        </tr>
      )}
      {expanded && (
        <tr className="ds-parent-child-table__child-row">
          <td colSpan={childColSpan}>
            <div className="ds-parent-child-table__child-panel">
              {showChildHeader && (
                <div className="ds-parent-child-table__child-title">
                  <div>
                    <strong>{childTitle}</strong>
                    <span>{childSummary || `共 ${childrenData.length} 条`}</span>
                  </div>
                  {childToolbarActions && <div className="ds-parent-child-table__child-actions">{childToolbarActions}</div>}
                </div>
              )}
              {renderedExpandedContent || (hasChildren ? (
                <table className="ds-parent-child-table__child-table">
                  {showChildHeader && (
                    <thead>
                      <tr>
                        {childSelectable && <th className="ds-parent-child-table__check"><input type="checkbox" aria-label="全选子级" /></th>}
                        {childColumns.map((column) => (
                          <th className={column.className} style={{ width: column.width }} key={column.key}>{column.title}</th>
                        ))}
                        {childActions.length > 0 && <th className="ds-parent-child-table__actions-col">操作</th>}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {childrenData.map((child, childIndex) => (
                      <tr key={childRowKeyGetter(child, rowKeyValue, childIndex)}>
                        {childSelectable && (
                          <td className="ds-parent-child-table__check">
                            <input
                              type="checkbox"
                              defaultChecked={selectedChildKeys.includes(childRowKeyGetter(child, rowKeyValue, childIndex))}
                              aria-label={`选择第 ${childIndex + 1} 条子级`}
                            />
                          </td>
                        )}
                        {childColumns.map((column) => (
                          <td key={column.key}>{renderCell(column, child, childIndex)}</td>
                        ))}
                        {childActions.length > 0 && <td className="ds-parent-child-table__actions-col">{renderActions(childActions, child, 'child')}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="ds-parent-child-table__child-empty" style={{ gridColumn: `span ${childTableColSpan}` }}>{childEmptyText}</div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function DefaultParentSummary({ record, parentColumns }) {
  const title = record.title || record.name || record[parentColumns[0]?.key]
  const code = record.code || record.number
  const count = record.countText || (typeof record.count === 'number' ? `共${record.count}人` : record.count)
  const tag = record.degree || record.type || record.tag

  return (
    <>
      {tag && <span className="ds-parent-child-table__parent-tag">{tag}</span>}
      {title && <strong>{title}</strong>}
      {code && <span>{code}</span>}
      {count && <span>{count}</span>}
    </>
  )
}
