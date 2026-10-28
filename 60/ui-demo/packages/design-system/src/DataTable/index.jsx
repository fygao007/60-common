import { useState } from 'react'
import DSButton from '../Button'
import DSPagination from '../Pagination'
import './index.css'

const SPECIAL_COLUMN_WIDTH = {
  drag: 40,
  check: 48,
  index: 64,
  actions: 116,
}

function estimateActionWidth(action) {
  const label = typeof action.label === 'function' ? '' : String(action.label || '')
  const charWidth = 15
  const textWidth = label.length * charWidth
  const variant = action.variant || 'link'
  // link/text: 仅水平内边距，无背景/边框；预留间隔避免长文案被截断
  if (variant === 'link' || variant === 'text') {
    return Math.max(44, textWidth + 16)
  }
  // ghost/default/primary: 水平内边距 16+16 + 边框 2
  return Math.max(76, textWidth + 40)
}

function getColumnKey(column, index) {
  return column.key || column.dataIndex || `column-${index}`
}

function getColumnWidth(column, fallback = 140) {
  const rawWidth = column.width || column.minWidth || fallback
  const parsed = Number.parseInt(rawWidth, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getLeafCount(column) {
  if (!column.children?.length) return 1
  return column.children.reduce((total, child) => total + getLeafCount(child), 0)
}

function getMaxDepth(columns) {
  if (!columns.length) return 1
  return columns.reduce((depth, column) => Math.max(depth, column.children?.length ? 1 + getMaxDepth(column.children) : 1), 1)
}

function flattenColumns(columns, inheritedFixed) {
  return columns.flatMap((column, index) => {
    const fixed = column.fixed || inheritedFixed
    const normalizedColumn = { ...column, key: getColumnKey(column, index), fixed }
    if (column.children?.length) {
      return flattenColumns(column.children, fixed)
    }
    return normalizedColumn
  })
}

function buildHeaderRows(columns, depth) {
  const rows = Array.from({ length: depth }, () => [])

  const walk = (items, level = 0, inheritedFixed) => {
    items.forEach((column, index) => {
      const fixed = column.fixed || inheritedFixed
      const key = getColumnKey(column, index)
      const hasChildren = column.children?.length
      rows[level].push({
        ...column,
        key,
        fixed,
        colSpan: hasChildren ? getLeafCount(column) : 1,
        rowSpan: hasChildren ? 1 : depth - level,
      })
      if (hasChildren) {
        walk(column.children, level + 1, fixed)
      }
    })
  }

  walk(columns)
  return rows
}

function applyFixedOffsets(columns) {
  let leftOffset = 0
  const withLeft = columns.map((column) => {
    if (column.fixed !== 'left') return column
    const fixedColumn = { ...column, stickyOffset: leftOffset }
    leftOffset += getColumnWidth(column)
    return fixedColumn
  })

  let rightOffset = 0
  return [...withLeft].reverse().map((column) => {
    if (column.fixed !== 'right') return column
    const fixedColumn = { ...column, stickyOffset: rightOffset }
    rightOffset += getColumnWidth(column)
    return fixedColumn
  }).reverse()
}

function getFixedStyle(column) {
  if (column.fixed === 'left') return { left: column.stickyOffset }
  if (column.fixed === 'right') return { right: column.stickyOffset }
  return undefined
}

function getCellTextAlign(column) {
  // 数据表内容统一左对齐；勾选框和拖拽柄属于操作控件，继续由各自样式居中。
  if (column.system === 'check' || column.system === 'drag') return undefined
  return 'left'
}

function renderCellValue(column, record, index) {
  const value = record[column.dataIndex || column.key]
  return column.render ? column.render(value, record, index) : value ?? '-'
}

export default function DSDataTable({
  title = '列表',
  summary,
  columns = [],
  data = [],
  rowKey = 'id',
  actions = [],
  toolbarActions,
  tableTools,
  pagination,
  selectable = true,
  selectedKeys = [],
  draggable = false,
  rowDraggable = draggable,
  // 行拖拽排序回调:传了才启用真拖拽(无回调时 rowDraggable 仅是装饰手柄,行为不变)
  // (fromIndex, toIndex, reorderedData) => void
  onRowDrop,
  actionsPosition = 'right',
  actionsMaxVisible = 2,
  actionFixed = true,
  // 「更多」按钮的回调；不传时按钮仍渲染（保持既有 DOM），但点击无副作用
  onMoreActions,
  showToolbar = true,
  emptyText = '暂无数据',
  emptyRender,
  variant = 'default',
  showIndex = false,
  indexTitle = '序号',
  striped = false,
  bordered = true,
  selectedRowKeys,
  onSelectRow,
  onSelectAll,
  rowSelectable = true,
  minWidth,
  rowClassName,
  className = '',
}) {
  const currentSelectedKeys = selectedRowKeys || selectedKeys
  // 行拖拽排序(仅 onRowDrop 存在时启用)
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const canDragRow = !!onRowDrop
  const handleRowDragStart = (index) => () => setDragIndex(index)
  const handleRowDragOver = (index) => (event) => {
    if (!canDragRow) return
    event.preventDefault()
    if (overIndex !== index) setOverIndex(index)
  }
  const handleRowDrop = (index) => (event) => {
    if (!canDragRow) return
    event.preventDefault()
    const from = dragIndex
    setDragIndex(null)
    setOverIndex(null)
    if (from === null || from === index) return
    const next = [...data]
    const [moved] = next.splice(from, 1)
    next.splice(index, 0, moved)
    onRowDrop(from, index, next)
  }
  const classes = [
    'ds-data-table',
    'ds-card',
    variant === 'lowcode' && 'ds-data-table--lowcode',
    striped && 'ds-data-table--striped',
    bordered && 'ds-data-table--bordered',
    !bordered && 'ds-data-table--borderless',
    className,
  ].filter(Boolean).join(' ')
  const hasActions = actions.length > 0
  const actionsAtLeft = hasActions && actionsPosition === 'left'
  const actionsAtRight = hasActions && actionsPosition !== 'left'
  // 行操作支持「按行差异」：action.hidden(record) 为真则该行不渲染这个动作，
  // 未声明 hidden 的动作在所有行照常渲染（向后兼容）。
  const resolveActions = (record) => actions.filter((action) => {
    const hidden = typeof action.hidden === 'function' ? action.hidden(record) : action.hidden
    return !hidden
  })
  const estimateActionsWidth = (list) => {
    const shown = list.slice(0, actionsMaxVisible)
    return shown.reduce((total, action) => total + estimateActionWidth(action), 0)
      + (shown.length > 1 ? 16 : 0)
      + (list.length > actionsMaxVisible ? 32 : 0)
  }
  // 列宽按「各行实际可见动作的最宽组合」预留：表格是 table-layout: fixed，
  // 宽度不足不会撑开、会直接裁掉末尾按钮；按行求最大值可保证任何一行都完整可见。
  const actionColumnWidth = Math.max(
    SPECIAL_COLUMN_WIDTH.actions,
    ...(data.length ? data.map((record) => estimateActionsWidth(resolveActions(record))) : [estimateActionsWidth(actions)]),
  )

  const systemLeftColumns = [
    rowDraggable && { key: '__drag', title: '', width: SPECIAL_COLUMN_WIDTH.drag, fixed: 'left', className: 'ds-data-table__drag', system: 'drag' },
    selectable && { key: '__check', title: '', width: SPECIAL_COLUMN_WIDTH.check, fixed: 'left', className: 'ds-data-table__check', system: 'check' },
    showIndex && { key: '__index', title: indexTitle, width: SPECIAL_COLUMN_WIDTH.index, fixed: 'left', className: 'ds-data-table__index', system: 'index' },
  ].filter(Boolean)
  const actionColumn = hasActions && {
    key: '__actions',
    title: '操作',
    width: actionColumnWidth,
    fixed: actionFixed ? (actionsAtLeft ? 'left' : 'right') : undefined,
    className: 'ds-data-table__actions-col',
    system: 'actions',
  }
  const headerColumns = [
    ...systemLeftColumns,
    actionsAtLeft && actionColumn,
    ...columns,
    actionsAtRight && actionColumn,
  ].filter(Boolean)
  const leafColumns = applyFixedOffsets(flattenColumns(headerColumns))
  const leafColumnMap = new Map(leafColumns.map((column) => [column.key, column]))
  const headerRows = buildHeaderRows(headerColumns, getMaxDepth(headerColumns)).map((row) => (
    row.map((column) => ({ ...column, ...leafColumnMap.get(column.key) }))
  ))
  const tableMinWidth = minWidth || leafColumns.reduce((total, column) => total + getColumnWidth(column), 0)
  const colSpan = leafColumns.length

  const renderSelectionCheckbox = (record, index, key) => {
    const disabled = typeof rowSelectable === 'function' ? !rowSelectable(record, index) : !rowSelectable
    return (
      <input
        type="checkbox"
        checked={currentSelectedKeys.includes(key)}
        disabled={disabled}
        readOnly={!onSelectRow}
        aria-label={`选择第 ${index + 1} 行`}
        onChange={(event) => onSelectRow?.(key, event.target.checked, record)}
      />
    )
  }

  const renderActionsCell = (record) => {
    const list = resolveActions(record)
    return (
      <span className="ds-data-table__row-actions">
        {list.slice(0, actionsMaxVisible).map((action) => (
          <DSButton
            variant={action.variant || 'link'}
            danger={action.danger}
            disabled={typeof action.disabled === 'function' ? action.disabled(record) : action.disabled}
            key={action.key || action.label}
            onClick={() => action.onClick?.(record)}
          >
            {typeof action.label === 'function' ? action.label(record) : action.label}
          </DSButton>
        ))}
        {list.length > actionsMaxVisible && (
          <button
            className="ds-data-table__more"
            type="button"
            aria-label="更多操作"
            onClick={() => onMoreActions?.(record)}
          >
            <span aria-hidden="true">...</span>
          </button>
        )}
      </span>
    )
  }

  const renderBodyCell = (column, record, index, key) => {
    if (column.system === 'drag') {
      return <span className="ds-data-table__drag-handle" aria-hidden="true" />
    }
    if (column.system === 'check') {
      return renderSelectionCheckbox(record, index, key)
    }
    if (column.system === 'index') {
      return index + 1
    }
    if (column.system === 'actions') {
      return renderActionsCell(record)
    }

    return renderCellValue(column, record, index)
  }

  const renderTableTools = () => {
    if (tableTools === false) return null

    if (tableTools) {
      return <div className="ds-data-table__table-tools">{tableTools}</div>
    }

    if (variant !== 'lowcode') return null

    return (
      <div className="ds-data-table__table-tools">
        <button className="ds-data-table__tool-button" type="button" aria-label="全屏表格">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3H3v3M10 3h3v3M6 13H3v-3M10 13h3v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="ds-data-table__tool-button" type="button" aria-label="列设置">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 4h4v8H3V4ZM9 4h4v8H9V4Z" stroke="currentColor" strokeWidth="1.4" />
            <path d="M5 6v4M11 6v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    )
  }

  const renderHeaderCell = (column) => {
    const fixedColumn = leafColumnMap.get(column.key) || column
    const cellClasses = [
      column.className,
      fixedColumn.fixed && `ds-data-table__cell--fixed-${fixedColumn.fixed}`,
      fixedColumn.fixed === 'left' && fixedColumn.stickyOffset > 0 && 'ds-data-table__cell--fixed-left-shadow',
      fixedColumn.fixed === 'right' && 'ds-data-table__cell--fixed-right-shadow',
    ].filter(Boolean).join(' ')

    return (
      <th
        className={cellClasses}
        colSpan={column.colSpan}
        rowSpan={column.rowSpan}
        style={{
          width: column.width,
          minWidth: column.minWidth,
          textAlign: getCellTextAlign(column),
          ...getFixedStyle(fixedColumn),
        }}
        key={column.key}
      >
        {column.system === 'check' ? (
          <input
            type="checkbox"
            aria-label="全选"
            checked={data.length > 0 && data.every((record, index) => currentSelectedKeys.includes(record[rowKey] ?? index))}
            readOnly={!onSelectAll}
            onChange={(event) => onSelectAll?.(event.target.checked, data)}
          />
        ) : column.title}
      </th>
    )
  }

  return (
    <section className={classes} aria-label={title}>
      {showToolbar && (
        <div className="ds-data-table__toolbar">
          <div className="ds-data-table__title">
            <strong>{title}</strong>
            {summary && <span>{summary}</span>}
          </div>
          <div className="ds-data-table__toolbar-side">
            {toolbarActions && <div className="ds-data-table__toolbar-actions">{toolbarActions}</div>}
            {renderTableTools()}
          </div>
        </div>
      )}

      <div className="ds-data-table__wrap">
        <table className="ds-data-table__table" style={{ minWidth: tableMinWidth }}>
          <colgroup>
            {leafColumns.map((column) => (
              <col style={{ width: getColumnWidth(column) }} key={column.key} />
            ))}
          </colgroup>
          <thead>
            {headerRows.map((row, rowIndex) => (
              <tr key={`header-${rowIndex}`}>
                {row.map(renderHeaderCell)}
              </tr>
            ))}
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td className="ds-data-table__empty" colSpan={colSpan}>
                  {emptyRender || <div className="ds-data-table__empty-content">{emptyText}</div>}
                </td>
              </tr>
            )}
            {data.map((record, index) => {
              const key = record[rowKey] ?? index
              const trClassName = [
                currentSelectedKeys.includes(key) && 'is-selected',
                canDragRow && 'ds-data-table__row--draggable',
                canDragRow && overIndex === index && dragIndex !== index && 'is-drop-target',
                typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName,
              ].filter(Boolean).join(' ')
              return (
                <tr
                  className={trClassName}
                  key={key}
                  draggable={canDragRow || undefined}
                  onDragStart={canDragRow ? handleRowDragStart(index) : undefined}
                  onDragOver={canDragRow ? handleRowDragOver(index) : undefined}
                  onDrop={canDragRow ? handleRowDrop(index) : undefined}
                  onDragEnd={canDragRow ? () => { setDragIndex(null); setOverIndex(null) } : undefined}
                >
                  {leafColumns.map((column) => {
                    const cellClasses = [
                      column.cellClassName,
                      column.className,
                      column.fixed && `ds-data-table__cell--fixed-${column.fixed}`,
                      column.fixed === 'left' && column.stickyOffset > 0 && 'ds-data-table__cell--fixed-left-shadow',
                      column.fixed === 'right' && 'ds-data-table__cell--fixed-right-shadow',
                      column.editable && 'ds-data-table__cell--editable',
                      column.error && 'ds-data-table__cell--error',
                    ].filter(Boolean).join(' ')

                    return (
                      <td
                        className={cellClasses}
                        style={{ textAlign: getCellTextAlign(column), ...getFixedStyle(column) }}
                        key={column.key}
                      >
                        {renderBodyCell(column, record, index, key)}
                        {typeof column.error === 'function' && column.error(record) && (
                          <span className="ds-data-table__cell-error-text">{column.error(record)}</span>
                        )}
                        {typeof column.error === 'string' && (
                          <span className="ds-data-table__cell-error-text">{column.error}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination && <DSPagination {...pagination} />}
    </section>
  )
}
