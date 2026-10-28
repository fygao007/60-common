import { useMemo, useState } from 'react'
import './index.css'

const EMPTY_LIST = []
const DEFAULT_TITLES = ['待选', '已选']

function getItemKey(item) {
  return item.key ?? item.value
}

function getItemLabel(item) {
  return item.title ?? item.label ?? String(getItemKey(item) ?? '')
}

function flattenItems(items, depth = 0, parentKey) {
  return items.flatMap((item) => {
    const key = getItemKey(item)
    return [
      { ...item, key, depth, parentKey },
      ...flattenItems(item.children ?? EMPTY_LIST, depth + 1, key),
    ]
  })
}

function renderContent(item, renderItem) {
  return renderItem ? renderItem(item) : getItemLabel(item)
}

function DSCheckbox({
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  onChange,
}) {
  return (
    <label className={[
      'ds-transfer__checkbox',
      checked && 'is-checked',
      indeterminate && 'is-indeterminate',
      disabled && 'is-disabled',
    ].filter(Boolean).join(' ')}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onChange={onChange}
      />
      <span className="ds-transfer__checkbox-mark" aria-hidden="true" />
    </label>
  )
}

function EmptyResult({ text }) {
  return <div className="ds-transfer__empty">{text}</div>
}

function FlatSource({
  items,
  disabled,
  renderItem,
  onSelect,
}) {
  if (!items.length) return <EmptyResult text="暂无待选数据" />

  return (
    <div className="ds-transfer__flat-list">
      {items.map((item) => {
        const itemDisabled = disabled || item.disabled
        return (
          <div
            className={[
              'ds-transfer__option',
              itemDisabled && 'is-disabled',
            ].filter(Boolean).join(' ')}
            key={getItemKey(item)}
          >
            <DSCheckbox
              disabled={itemDisabled}
              label={`选择${getItemLabel(item)}`}
              onChange={() => onSelect(item)}
            />
            <span className="ds-transfer__option-label">{renderContent(item, renderItem)}</span>
          </div>
        )
      })}
    </div>
  )
}

function GroupedSource({
  items,
  disabled,
  renderItem,
  collapsedGroups,
  onToggleGroup,
  onSelect,
  onSelectGroup,
}) {
  const groups = []
  const groupMap = new Map()

  items.forEach((item) => {
    const group = item.group ?? '未分组'
    if (!groupMap.has(group)) {
      const entry = { name: group, items: [] }
      groupMap.set(group, entry)
      groups.push(entry)
    }
    groupMap.get(group).items.push(item)
  })

  if (!groups.length) return <EmptyResult text="暂无待选数据" />

  return (
    <div className="ds-transfer__groups">
      {groups.map((group) => {
        const enabledItems = group.items.filter((item) => !disabled && !item.disabled)
        const collapsed = collapsedGroups.has(group.name)
        return (
          <section className="ds-transfer__group" key={group.name}>
            <div className="ds-transfer__group-head">
              <button
                className="ds-transfer__expand"
                type="button"
                disabled={disabled}
                aria-label={collapsed ? `展开${group.name}` : `收起${group.name}`}
                aria-expanded={!collapsed}
                onClick={() => onToggleGroup(group.name)}
              />
              <DSCheckbox
                disabled={!enabledItems.length}
                label={`选择${group.name}全部字段`}
                onChange={() => onSelectGroup(enabledItems)}
              />
              <span>{group.name}</span>
              <span className="ds-transfer__group-count">{group.items.length}</span>
            </div>
            {!collapsed && (
              <div className="ds-transfer__group-grid">
                {group.items.map((item) => {
                  const itemDisabled = disabled || item.disabled
                  return (
                    <div
                      className={[
                        'ds-transfer__option',
                        itemDisabled && 'is-disabled',
                      ].filter(Boolean).join(' ')}
                      key={getItemKey(item)}
                    >
                      <DSCheckbox
                        disabled={itemDisabled}
                        label={`选择${getItemLabel(item)}`}
                        onChange={() => onSelect(item)}
                      />
                      <span className="ds-transfer__option-label">{renderContent(item, renderItem)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function TableSource({
  items,
  columns,
  disabled,
  onSelect,
}) {
  const resolvedColumns = columns.length
    ? columns
    : [{ key: 'title', title: '名称', dataIndex: 'title' }]

  return (
    <div className="ds-transfer__table-wrap">
      <table className="ds-transfer__table">
        <thead>
          <tr>
            <th className="ds-transfer__check-cell" aria-label="选择" />
            {resolvedColumns.map((column) => (
              <th key={column.key ?? column.dataIndex}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const itemDisabled = disabled || item.disabled
            return (
              <tr className={itemDisabled ? 'is-disabled' : ''} key={getItemKey(item)}>
                <td className="ds-transfer__check-cell">
                  <DSCheckbox
                    disabled={itemDisabled}
                    label={`选择${getItemLabel(item)}`}
                    onChange={() => onSelect(item)}
                  />
                </td>
                {resolvedColumns.map((column) => {
                  const key = column.key ?? column.dataIndex
                  const value = item[column.dataIndex]
                  return (
                    <td key={key}>
                      {column.render ? column.render(value, item) : value ?? (key === 'title' ? getItemLabel(item) : '')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
          {!items.length && (
            <tr>
              <td className="ds-transfer__table-empty" colSpan={resolvedColumns.length + 1}>
                暂无待选数据
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function TreeSource({
  items,
  disabled,
  renderItem,
  collapsedKeys,
  query,
  onToggleNode,
  onSelect,
}) {
  const hiddenByParent = new Set()
  const visibleItems = items.filter((item) => {
    if (!query && item.parentKey !== undefined && hiddenByParent.has(item.parentKey)) {
      hiddenByParent.add(item.key)
      return false
    }
    if (!query && collapsedKeys.has(item.key)) hiddenByParent.add(item.key)
    return true
  })

  if (!visibleItems.length) return <EmptyResult text="暂无待选数据" />

  return (
    <div className="ds-transfer__tree">
      {visibleItems.map((item) => {
        const itemDisabled = disabled || item.disabled
        const hasChildren = Boolean(item.children?.length)
        const collapsed = collapsedKeys.has(item.key)
        return (
          <div
            className={[
              'ds-transfer__tree-row',
              itemDisabled && 'is-disabled',
            ].filter(Boolean).join(' ')}
            style={{ '--ds-transfer-tree-indent': `${8 + item.depth * 20}px` }}
            key={item.key}
          >
            {hasChildren ? (
              <button
                className="ds-transfer__tree-toggle"
                type="button"
                disabled={disabled}
                aria-label={collapsed ? `展开${getItemLabel(item)}` : `收起${getItemLabel(item)}`}
                aria-expanded={!collapsed}
                onClick={() => onToggleNode(item.key)}
              />
            ) : (
              <span className="ds-transfer__tree-spacer" />
            )}
            <DSCheckbox
              disabled={itemDisabled}
              label={`选择${getItemLabel(item)}`}
              onChange={() => onSelect(item)}
            />
            <span className="ds-transfer__option-label">{renderContent(item, renderItem)}</span>
          </div>
        )
      })}
    </div>
  )
}

function SelectedCards({
  items,
  disabled,
  renderItem,
  onRemove,
}) {
  if (!items.length) return <EmptyResult text="暂无已选数据" />

  return (
    <div className="ds-transfer__selected-list">
      {items.map((item) => (
        <div className="ds-transfer__selected-item" key={getItemKey(item)}>
          <span className="ds-transfer__selected-label">{renderContent(item, renderItem)}</span>
          <button
            className="ds-transfer__remove"
            type="button"
            disabled={disabled || item.disabled}
            aria-label={`移除${getItemLabel(item)}`}
            onClick={() => onRemove(item)}
          />
        </div>
      ))}
    </div>
  )
}

function SelectedTable({
  items,
  columns,
  disabled,
  onRemove,
}) {
  const resolvedColumns = columns.length
    ? columns
    : [{ key: 'title', title: '名称', dataIndex: 'title' }]

  return (
    <div className="ds-transfer__table-wrap">
      <table className="ds-transfer__table ds-transfer__table--selected">
        <thead>
          <tr>
            {resolvedColumns.map((column) => (
              <th key={column.key ?? column.dataIndex}>{column.title}</th>
            ))}
            <th className="ds-transfer__action-cell">操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={getItemKey(item)}>
              {resolvedColumns.map((column) => {
                const key = column.key ?? column.dataIndex
                const value = item[column.dataIndex]
                return (
                  <td key={key}>
                    {column.render ? column.render(value, item) : value ?? (key === 'title' ? getItemLabel(item) : '')}
                  </td>
                )
              })}
              <td className="ds-transfer__action-cell">
                <button
                  className="ds-transfer__remove-text"
                  type="button"
                  disabled={disabled || item.disabled}
                  onClick={() => onRemove(item)}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
          {!items.length && (
            <tr>
              <td className="ds-transfer__table-empty" colSpan={resolvedColumns.length + 1}>
                暂无已选数据
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function DSTransfer({
  dataSource = EMPTY_LIST,
  value,
  defaultValue = EMPTY_LIST,
  variant = 'list',
  selectedVariant = 'cards',
  columns = EMPTY_LIST,
  titles = DEFAULT_TITLES,
  searchable = true,
  searchPlaceholder = '搜索',
  showSelectAll = true,
  clearable = true,
  disabled = false,
  className = '',
  emptyText = '暂无待选数据',
  filterOption,
  renderItem,
  renderSelectedItem,
  sourceExtra,
  sourceFooter,
  onSearch,
  onChange,
  ...props
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [query, setQuery] = useState('')
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set())
  const [collapsedKeys, setCollapsedKeys] = useState(() => new Set())

  const currentValue = value !== undefined ? value : internalValue
  const selectedKeySet = useMemo(() => new Set(currentValue), [currentValue])
  const flattenedItems = useMemo(() => flattenItems(dataSource), [dataSource])
  const itemMap = useMemo(
    () => new Map(flattenedItems.map((item) => [item.key, item])),
    [flattenedItems],
  )
  const selectedItems = currentValue
    .map((key) => itemMap.get(key))
    .filter(Boolean)

  const allSourceItems = flattenedItems.filter((item) => !selectedKeySet.has(item.key))
  const sourceItems = allSourceItems.filter((item) => {
    if (!query) return true
    if (filterOption) return filterOption(query, item)
    return getItemLabel(item).toLocaleLowerCase().includes(query.toLocaleLowerCase())
  })
  const selectableSourceItems = sourceItems.filter((item) => !disabled && !item.disabled)

  const commitValue = (nextValue, action, item) => {
    if (value === undefined) setInternalValue(nextValue)
    onChange?.(
      nextValue,
      nextValue.map((key) => itemMap.get(key)).filter(Boolean),
      { action, item },
    )
  }

  const addItems = (items, action = 'add') => {
    const nextKeys = items
      .map(getItemKey)
      .filter((key) => key !== undefined && !selectedKeySet.has(key))
    if (!nextKeys.length) return
    commitValue([...currentValue, ...nextKeys], action, items[0])
  }

  const removeItem = (item) => {
    commitValue(currentValue.filter((key) => key !== getItemKey(item)), 'remove', item)
  }

  const clearItems = () => {
    const disabledKeys = selectedItems
      .filter((item) => item.disabled)
      .map(getItemKey)
    commitValue(disabledKeys, 'clear')
  }

  const toggleSetValue = (setter, key) => {
    setter((previous) => {
      const next = new Set(previous)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSearch = (event) => {
    const nextQuery = event.target.value
    setQuery(nextQuery)
    onSearch?.(nextQuery)
  }

  const classes = [
    'ds-transfer',
    `ds-transfer--${variant}`,
    selectedVariant === 'table' && 'ds-transfer--selected-table',
    disabled && 'is-disabled',
    className,
  ].filter(Boolean).join(' ')

  const sourceContent = (() => {
    if (!sourceItems.length) return <EmptyResult text={emptyText} />
    if (variant === 'grouped') {
      return (
        <GroupedSource
          items={sourceItems}
          disabled={disabled}
          renderItem={renderItem}
          collapsedGroups={collapsedGroups}
          onToggleGroup={(group) => toggleSetValue(setCollapsedGroups, group)}
          onSelect={(item) => addItems([item])}
          onSelectGroup={(items) => addItems(items, 'add-group')}
        />
      )
    }
    if (variant === 'table') {
      return (
        <TableSource
          items={sourceItems}
          columns={columns}
          disabled={disabled}
          onSelect={(item) => addItems([item])}
        />
      )
    }
    if (variant === 'tree') {
      return (
        <TreeSource
          items={sourceItems}
          disabled={disabled}
          renderItem={renderItem}
          collapsedKeys={collapsedKeys}
          query={query}
          onToggleNode={(key) => toggleSetValue(setCollapsedKeys, key)}
          onSelect={(item) => addItems([item])}
        />
      )
    }
    return (
      <FlatSource
        items={sourceItems}
        disabled={disabled}
        renderItem={renderItem}
        onSelect={(item) => addItems([item])}
      />
    )
  })()

  return (
    <div className={classes} {...props}>
      <section className="ds-transfer__panel ds-transfer__panel--source">
        <header className="ds-transfer__panel-head">
          <span className="ds-transfer__panel-title">
            <strong>{titles[0]}</strong>
            <span>{allSourceItems.length}</span>
          </span>
        </header>
        <div className="ds-transfer__panel-body">
          {sourceExtra ? <div className="ds-transfer__source-extra">{sourceExtra}</div> : null}
          {(searchable || showSelectAll) && (
            <div className="ds-transfer__toolbar">
              {showSelectAll && (
                <div className="ds-transfer__select-all">
                  <DSCheckbox
                    disabled={!selectableSourceItems.length}
                    label="选择当前全部待选项"
                    onChange={() => addItems(selectableSourceItems, 'add-all')}
                  />
                  <span>全选</span>
                </div>
              )}
              {searchable && (
                <label className="ds-transfer__search">
                  <input
                    value={query}
                    disabled={disabled}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    onChange={handleSearch}
                  />
                  <span aria-hidden="true" />
                </label>
              )}
            </div>
          )}
          <div className="ds-transfer__source-content">{sourceContent}</div>
          {sourceFooter ? <div className="ds-transfer__source-footer">{sourceFooter}</div> : null}
        </div>
      </section>

      <section className="ds-transfer__panel ds-transfer__panel--selected">
        <header className="ds-transfer__panel-head">
          <span className="ds-transfer__panel-title">
            <strong>{titles[1]}</strong>
            <span>{selectedItems.length}</span>
          </span>
          {clearable && (
            <button
              className="ds-transfer__clear"
              type="button"
              disabled={disabled || !selectedItems.some((item) => !item.disabled)}
              onClick={clearItems}
            >
              清空
            </button>
          )}
        </header>
        <div className="ds-transfer__panel-body">
          {selectedVariant === 'table' ? (
            <SelectedTable
              items={selectedItems}
              columns={columns}
              disabled={disabled}
              onRemove={removeItem}
            />
          ) : (
            <SelectedCards
              items={selectedItems}
              disabled={disabled}
              renderItem={renderSelectedItem ?? renderItem}
              onRemove={removeItem}
            />
          )}
        </div>
      </section>
    </div>
  )
}
