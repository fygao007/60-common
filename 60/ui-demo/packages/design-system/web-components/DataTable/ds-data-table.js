import { LitElement, css, html, nothing } from 'lit'

const SPECIAL_COLUMN_WIDTH = {
  drag: 40,
  check: 48,
  index: 64,
  actions: 128,
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
    if (column.children?.length) return flattenColumns(column.children, fixed)
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
      if (hasChildren) walk(column.children, level + 1, fixed)
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

class DSDataTableElement extends LitElement {
  static properties = {
    title: { type: String },
    columns: { attribute: false },
    data: { attribute: false },
    actions: { attribute: false },
    pagination: { attribute: false },
    rowKey: { type: String, attribute: 'row-key' },
    selectable: { type: Boolean },
    draggable: { type: Boolean },
    showIndex: { type: Boolean, attribute: 'show-index' },
    striped: { type: Boolean },
    bordered: { type: Boolean },
    showToolbar: { type: Boolean, attribute: 'show-toolbar' },
    selectedKeys: { attribute: false },
    emptyText: { type: String, attribute: 'empty-text' },
    minWidth: { type: Number, attribute: 'min-width' },
    dragIcon: { type: String, attribute: 'drag-icon' },
  }

  static styles = css`
    :host {
      display: flex;
      min-height: 0;
      color: var(--ds-color-text, #000);
      font-family: var(--ds-font-family, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif);
      font-size: var(--ds-font-size-md, 14px);
      line-height: var(--ds-line-height-md, 22px);
      --ds-data-table-border: var(--ds-color-border-secondary, #eeeef0);
      --ds-data-table-header-bg: var(--ds-color-bg-subtle, #fafafa);
      --ds-data-table-row-hover: var(--ds-color-bg-hover, #f6f6f7);
      --ds-data-table-row-selected: var(--ds-color-primary-light, #f5f5ff);
      --ds-data-table-row-selected-hover: var(--ds-color-primary-selected, #ebecff);
    }

    .ds-data-table {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
      background: var(--ds-color-bg-container, #fff);
    }

    .ds-data-table__toolbar {
      display: flex;
      flex: none;
      align-items: center;
      justify-content: space-between;
      gap: var(--ds-space-4, 16px);
      padding: var(--ds-space-3, 12px) var(--ds-space-4, 16px);
      background: var(--ds-color-bg-container, #fff);
    }

    .ds-data-table__title {
      display: inline-flex;
      align-items: center;
      gap: var(--ds-space-2, 8px);
      font-weight: var(--ds-font-weight-semibold, 600);
    }

    .ds-data-table__wrap {
      flex: 1;
      min-height: 0;
      overflow: auto;
      background: var(--ds-color-bg-container, #fff);
      border: 1px solid var(--ds-data-table-border);
    }

    table {
      width: 100%;
      min-width: 1120px;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
    }

    th,
    td {
      height: 46px;
      padding: 0 var(--ds-space-3, 12px);
      overflow: hidden;
      color: var(--ds-color-text-heading, #000);
      text-align: left;
      text-overflow: ellipsis;
      white-space: nowrap;
      background: var(--ds-color-bg-container, #fff);
      border-bottom: 1px solid var(--ds-data-table-border);
      transition: background-color var(--ds-motion-duration-fast, 120ms) var(--ds-motion-ease, cubic-bezier(0.2, 0, 0, 1));
    }

    th {
      position: sticky;
      top: 0;
      z-index: 5;
      height: 40px;
      background: var(--ds-data-table-header-bg);
      font-weight: var(--ds-font-weight-semibold, 600);
    }

    th + th,
    td + td {
      border-left: 1px solid var(--ds-color-divider-alpha-soft, rgba(238, 238, 240, 0.72));
    }

    tbody tr:hover td {
      background: var(--ds-data-table-row-hover);
    }

    tbody tr.is-selected td {
      background: var(--ds-data-table-row-selected);
    }

    tbody tr.is-selected:hover td {
      background: var(--ds-data-table-row-selected-hover);
    }

    tbody tr.is-dragging td {
      background: var(--ds-data-table-row-selected-hover);
      opacity: 0.46;
    }

    .is-fixed-left,
    .is-fixed-right {
      position: sticky;
      z-index: 4;
    }

    th.is-fixed-left,
    th.is-fixed-right {
      z-index: 8;
    }

    .is-fixed-left.has-shadow {
      box-shadow: 1px 0 4px rgba(var(--ds-color-text-rgb, 0, 0, 0), 0.08);
    }

    .is-fixed-right.has-shadow {
      box-shadow: -1px 0 4px rgba(var(--ds-color-text-rgb, 0, 0, 0), 0.08);
    }

    .cell-center,
    .system-drag,
    .system-check {
      text-align: center;
    }

    .cell-right {
      text-align: right;
    }

    input[type="checkbox"] {
      width: 16px;
      height: 16px;
      margin: 0;
      accent-color: var(--ds-color-primary, #333fff);
      vertical-align: middle;
      cursor: pointer;
    }

    .drag-handle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--ds-color-text-heading, #000);
      border-radius: var(--ds-radius-sm, 4px);
      cursor: grab;
      touch-action: none;
      user-select: none;
    }

    .drag-handle:hover {
      background: var(--ds-color-primary-light, #f5f5ff);
    }

    .drag-handle img {
      display: block;
      width: 16px;
      height: 16px;
    }

    .avatar-cell {
      display: inline-flex;
      align-items: center;
      min-width: 0;
      gap: var(--ds-space-2, 8px);
    }

    .avatar {
      display: inline-grid;
      flex: none;
      place-items: center;
      width: 24px;
      height: 24px;
      color: var(--ds-color-primary, #333fff);
      background: linear-gradient(180deg, #d9f0ff 0%, #f7e5d5 100%);
      border: 1px solid var(--ds-color-bg-container, #fff);
      border-radius: var(--ds-radius-pill, 999px);
      font-size: var(--ds-font-size-xs, 12px);
      font-weight: var(--ds-font-weight-semibold, 600);
    }

    .tag {
      display: inline-flex;
      align-items: center;
      height: 24px;
      padding: 0 var(--ds-space-2, 8px);
      color: var(--ds-color-text-secondary, #505266);
      background: var(--ds-color-border-secondary, #eeeef0);
      border-radius: var(--ds-radius-sm, 4px);
      font-size: var(--ds-font-size-xs, 12px);
      line-height: var(--ds-line-height-xs, 20px);
    }

    .switch {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 50px;
      height: 22px;
      padding-left: 6px;
      color: var(--ds-color-text-inverse, #fff);
      background: var(--ds-color-primary, #333fff);
      border: 0;
      border-radius: var(--ds-radius-pill, 999px);
      font: inherit;
      font-size: var(--ds-font-size-xs, 12px);
      line-height: var(--ds-line-height-xs, 20px);
      cursor: pointer;
    }

    .switch::after {
      content: "";
      position: absolute;
      top: 2px;
      right: 2px;
      width: 18px;
      height: 18px;
      background: var(--ds-color-bg-container, #fff);
      border-radius: 50%;
      box-shadow: 0 1px 2px rgba(var(--ds-color-text-rgb, 0, 0, 0), 0.16);
    }

    .switch.is-off {
      justify-content: flex-end;
      padding-right: 6px;
      padding-left: 0;
      background: var(--ds-color-text-disabled, #c9cdd4);
    }

    .switch.is-off::after {
      right: auto;
      left: 2px;
    }

    .progress {
      display: inline-flex;
      align-items: center;
      width: 100%;
      gap: var(--ds-space-2, 8px);
    }

    .progress-track {
      flex: 1;
      height: 6px;
      overflow: hidden;
      background: var(--ds-color-border-secondary, #eeeef0);
      border-radius: var(--ds-radius-pill, 999px);
    }

    .progress-bar {
      display: block;
      height: 100%;
      background: var(--ds-color-primary, #333fff);
      border-radius: inherit;
    }

    .progress-text {
      flex: none;
      width: 32px;
      color: var(--ds-color-text-secondary, #505266);
      font-size: var(--ds-font-size-xs, 12px);
      line-height: var(--ds-line-height-xs, 20px);
    }

    .row-actions {
      display: inline-flex;
      align-items: center;
      max-width: 100%;
      gap: var(--ds-space-2, 8px);
    }

    .text-action,
    .more-action {
      height: 22px;
      padding: 0;
      color: var(--ds-color-primary, #333fff);
      background: transparent;
      border: 0;
      font: inherit;
      cursor: pointer;
    }

    .more-action {
      display: inline-grid;
      place-items: center;
      width: 24px;
      border-radius: var(--ds-radius-sm, 4px);
    }

    .more-action:hover {
      background: var(--ds-color-primary-light, #f5f5ff);
    }

    .empty {
      height: 220px;
      color: var(--ds-color-text-tertiary, #737585);
      text-align: center;
    }

    .pagination {
      display: flex;
      flex: none;
      align-items: center;
      gap: var(--ds-space-2, 8px);
      height: 48px;
      padding: 0 var(--ds-space-4, 16px);
      color: var(--ds-color-text-secondary, #505266);
      background: var(--ds-color-bg-container, #fff);
      border-top: 1px solid var(--ds-color-border-secondary, #eeeef0);
      font-size: var(--ds-font-size-md, 14px);
    }

    .page-spacer {
      flex: 1;
    }

    .page-size,
    .page-jump {
      height: 28px;
      color: var(--ds-color-text-heading, #000);
      background: var(--ds-color-bg-container, #fff);
      border: 1px solid var(--ds-color-border, #dcdce0);
      border-radius: var(--ds-radius-sm, 4px);
    }

    .page-size {
      min-width: 96px;
      padding: 0 var(--ds-space-2, 8px);
    }

    .page-jump {
      width: 40px;
      padding: 0 var(--ds-space-1, 4px);
      text-align: center;
    }

    .page-list {
      display: inline-flex;
      align-items: center;
      gap: var(--ds-space-1, 4px);
    }

    .page-item {
      display: inline-grid;
      place-items: center;
      min-width: 28px;
      height: 28px;
      padding: 0 var(--ds-space-2, 8px);
      color: var(--ds-color-text-heading, #000);
      background: var(--ds-color-bg-container, #fff);
      border: 1px solid var(--ds-color-border-secondary, #eeeef0);
      border-radius: var(--ds-radius-sm, 4px);
      cursor: pointer;
    }

    .page-item.is-active {
      color: var(--ds-color-text-inverse, #fff);
      background: var(--ds-color-primary, #333fff);
      border-color: var(--ds-color-primary, #333fff);
    }

    .page-item:disabled {
      color: var(--ds-color-text-disabled, #c9cdd4);
      cursor: not-allowed;
    }
  `

  constructor() {
    super()
    this.title = '列表'
    this.columns = []
    this.data = []
    this.actions = []
    this.pagination = null
    this.rowKey = 'id'
    this.selectable = true
    this.draggable = false
    this.showIndex = false
    this.striped = false
    this.bordered = true
    this.showToolbar = false
    this.selectedKeys = []
    this.emptyText = '暂无数据'
    this.minWidth = 0
    this.dragIcon = './assets/icons/drag-sort-line.svg'
    this.dragState = null
  }

  get rowKeys() {
    return this.data.map((record, index) => record[this.rowKey] ?? index)
  }

  get normalizedColumns() {
    const systemLeftColumns = [
      this.draggable && { key: '__drag', title: '', width: SPECIAL_COLUMN_WIDTH.drag, fixed: 'left', system: 'drag' },
      this.selectable && { key: '__check', title: '', width: SPECIAL_COLUMN_WIDTH.check, fixed: 'left', system: 'check' },
      this.showIndex && { key: '__index', title: '序号', width: SPECIAL_COLUMN_WIDTH.index, fixed: 'left', system: 'index' },
    ].filter(Boolean)
    const actionColumn = this.actions.length > 0 && {
      key: '__actions',
      title: '操作',
      width: Math.max(SPECIAL_COLUMN_WIDTH.actions, this.actions.length * 52),
      fixed: 'right',
      system: 'actions',
    }

    return [
      ...systemLeftColumns,
      ...this.columns,
      actionColumn,
    ].filter(Boolean)
  }

  get tableModel() {
    const headerColumns = this.normalizedColumns
    const leafColumns = applyFixedOffsets(flattenColumns(headerColumns))
    const leafColumnMap = new Map(leafColumns.map((column) => [column.key, column]))
    const headerRows = buildHeaderRows(headerColumns, getMaxDepth(headerColumns)).map((row) => (
      row.map((column) => ({ ...column, ...leafColumnMap.get(column.key) }))
    ))
    const tableMinWidth = this.minWidth || leafColumns.reduce((total, column) => total + getColumnWidth(column), 0)
    return { headerRows, leafColumns, tableMinWidth }
  }

  isSelected(key) {
    return this.selectedKeys.includes(key)
  }

  setSelectedKeys(nextSelectedKeys) {
    this.selectedKeys = nextSelectedKeys
    this.dispatchEvent(new CustomEvent('ds-selection-change', {
      detail: { selectedKeys: nextSelectedKeys },
      bubbles: true,
      composed: true,
    }))
  }

  toggleAll(event) {
    this.setSelectedKeys(event.target.checked ? this.rowKeys : [])
  }

  toggleRow(key, event) {
    const checked = event.target.checked
    const selected = new Set(this.selectedKeys)
    if (checked) selected.add(key)
    else selected.delete(key)
    this.setSelectedKeys([...selected])
  }

  toggleSwitch(record, column) {
    const key = column.dataIndex || column.key
    record[key] = !record[key]
    this.data = [...this.data]
    this.dispatchEvent(new CustomEvent('ds-cell-change', {
      detail: { record, column, value: record[key] },
      bubbles: true,
      composed: true,
    }))
  }

  emitAction(action, record, rowIndex) {
    this.dispatchEvent(new CustomEvent('ds-row-action', {
      detail: { action, record, rowIndex },
      bubbles: true,
      composed: true,
    }))
  }

  getCellValue(column, record) {
    return record[column.dataIndex || column.key]
  }

  renderCell(column, record, rowIndex, rowKey) {
    if (column.system === 'drag') {
      return html`<span class="drag-handle" title="按住后可以拖拽更换顺序" @pointerdown=${this.startDrag}><img src=${this.dragIcon} alt="" /></span>`
    }
    if (column.system === 'check') {
      return html`<input type="checkbox" aria-label=${`选择第 ${rowIndex + 1} 行`} .checked=${this.isSelected(rowKey)} @change=${(event) => this.toggleRow(rowKey, event)} />`
    }
    if (column.system === 'index') return rowIndex + 1
    if (column.system === 'actions') {
      return html`
        <span class="row-actions">
          ${this.actions.map((action) => html`
            <button class=${action.more ? 'more-action' : 'text-action'} type="button" aria-label=${action.label} @click=${() => this.emitAction(action, record, rowIndex)}>
              ${action.more ? '...' : action.label}
            </button>
          `)}
        </span>
      `
    }

    const value = this.getCellValue(column, record)
    if (typeof column.render === 'function') return column.render(value, record, rowIndex, html)

    if (column.type === 'avatar') {
      const name = value?.name || value || ''
      return html`<span class="avatar-cell"><span class="avatar">${String(name).slice(0, 1)}</span><span>${name}</span></span>`
    }
    if (column.type === 'tag') return html`<span class="tag">${value}</span>`
    if (column.type === 'switch') {
      return html`<button class=${`switch ${value ? '' : 'is-off'}`} type="button" @click=${() => this.toggleSwitch(record, column)}>${value ? '是' : '否'}</button>`
    }
    if (column.type === 'progress') {
      const progress = Number(value) || 0
      const color = column.color?.(value, record, rowIndex) || column.color || 'var(--ds-color-primary, #333fff)'
      return html`
        <span class="progress">
          <span class="progress-track"><span class="progress-bar" style=${`width:${progress}%;background:${color}`}></span></span>
          <span class="progress-text">${progress}%</span>
        </span>
      `
    }

    return value ?? '-'
  }

  renderHeaderCell(column) {
    const classes = [
      column.system && `system-${column.system}`,
      column.fixed && `is-fixed-${column.fixed}`,
      column.fixed === 'left' && column.stickyOffset > 0 && 'has-shadow',
      column.fixed === 'right' && 'has-shadow',
      column.align === 'center' && 'cell-center',
      column.align === 'right' && 'cell-right',
    ].filter(Boolean).join(' ')
    const style = [
      `width:${getColumnWidth(column)}px`,
      column.fixed === 'left' ? `left:${column.stickyOffset || 0}px` : '',
      column.fixed === 'right' ? `right:${column.stickyOffset || 0}px` : '',
      column.align ? `text-align:${column.align}` : '',
    ].filter(Boolean).join(';')

    return html`
      <th class=${classes} style=${style} colspan=${column.colSpan || 1} rowspan=${column.rowSpan || 1}>
        ${column.system === 'check'
          ? html`<input type="checkbox" aria-label="全选" .checked=${this.data.length > 0 && this.selectedKeys.length === this.data.length} @change=${this.toggleAll} />`
          : column.title}
      </th>
    `
  }

  renderBodyCell(column, record, rowIndex) {
    const rowKey = record[this.rowKey] ?? rowIndex
    const classes = [
      column.system && `system-${column.system}`,
      column.fixed && `is-fixed-${column.fixed}`,
      column.fixed === 'left' && column.stickyOffset > 0 && 'has-shadow',
      column.fixed === 'right' && 'has-shadow',
      column.align === 'center' && 'cell-center',
      column.align === 'right' && 'cell-right',
    ].filter(Boolean).join(' ')
    const style = [
      column.fixed === 'left' ? `left:${column.stickyOffset || 0}px` : '',
      column.fixed === 'right' ? `right:${column.stickyOffset || 0}px` : '',
      column.align ? `text-align:${column.align}` : '',
    ].filter(Boolean).join(';')

    return html`<td class=${classes} style=${style} title=${typeof this.getCellValue(column, record) === 'string' ? this.getCellValue(column, record) : nothing}>${this.renderCell(column, record, rowIndex, rowKey)}</td>`
  }

  startDrag(event) {
    if (!this.draggable) return
    const row = event.currentTarget.closest('tr')
    if (!row) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    this.dragState = {
      pointerId: event.pointerId,
      startKey: row.dataset.rowKey,
    }
    row.classList.add('is-dragging')
    window.addEventListener('pointermove', this.moveDrag)
    window.addEventListener('pointerup', this.finishDrag)
    window.addEventListener('pointercancel', this.finishDrag)
  }

  moveDrag = (event) => {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) return
    const rows = [...this.renderRoot.querySelectorAll('tbody tr')]
    const activeRow = rows.find((row) => row.dataset.rowKey === this.dragState.startKey)
    if (!activeRow) return
    const afterRow = rows
      .filter((row) => row !== activeRow)
      .reduce((closest, row) => {
        const rect = row.getBoundingClientRect()
        const offset = event.clientY - rect.top - rect.height / 2
        if (offset < 0 && offset > closest.offset) return { offset, row }
        return closest
      }, { offset: Number.NEGATIVE_INFINITY, row: null }).row
    const activeIndex = rows.indexOf(activeRow)
    const targetIndex = afterRow ? rows.indexOf(afterRow) : rows.length
    if (activeIndex < 0 || activeIndex === targetIndex || activeIndex + 1 === targetIndex) return

    const nextData = [...this.data]
    const moved = nextData.splice(activeIndex, 1)[0]
    nextData.splice(targetIndex > activeIndex ? targetIndex - 1 : targetIndex, 0, moved)
    this.data = nextData
  }

  finishDrag = (event) => {
    if (event?.pointerId && this.dragState?.pointerId !== event.pointerId) return
    this.renderRoot.querySelectorAll('.is-dragging').forEach((row) => row.classList.remove('is-dragging'))
    window.removeEventListener('pointermove', this.moveDrag)
    window.removeEventListener('pointerup', this.finishDrag)
    window.removeEventListener('pointercancel', this.finishDrag)
    this.dragState = null
    this.dispatchEvent(new CustomEvent('ds-row-order-change', {
      detail: { data: this.data },
      bubbles: true,
      composed: true,
    }))
  }

  renderPagination() {
    if (!this.pagination) return nothing
    const total = this.pagination.total ?? this.data.length
    const page = this.pagination.page ?? 1
    return html`
      <footer class="pagination">
        <span>共 ${total} 条</span>
        <select class="page-size" aria-label="每页条数">
          ${(this.pagination.pageSizes || [10, 20, 50]).map((size) => html`<option ?selected=${size === this.pagination.pageSize}>${size}条/页</option>`)}
        </select>
        <span class="page-spacer"></span>
        <div class="page-list" aria-label="分页">
          <button class="page-item" type="button" disabled>‹</button>
          <button class="page-item is-active" type="button">${page}</button>
          <button class="page-item" type="button">${page + 1}</button>
          <button class="page-item" type="button">...</button>
          <button class="page-item" type="button">${Math.ceil(total / (this.pagination.pageSize || 10))}</button>
          <button class="page-item" type="button">›</button>
        </div>
        <span>跳至</span>
        <input class="page-jump" value=${page} aria-label="跳转页码" />
        <span>页</span>
      </footer>
    `
  }

  render() {
    const { headerRows, leafColumns, tableMinWidth } = this.tableModel
    const classes = [
      'ds-data-table',
      this.striped && 'is-striped',
      !this.bordered && 'is-borderless',
    ].filter(Boolean).join(' ')

    return html`
      <section class=${classes} aria-label=${this.title}>
        ${this.showToolbar ? html`
          <div class="ds-data-table__toolbar">
            <div class="ds-data-table__title">${this.title}</div>
            <slot name="toolbar"></slot>
          </div>
        ` : nothing}
        <div class="ds-data-table__wrap">
          <table style=${`min-width:${tableMinWidth}px`}>
            <colgroup>
              ${leafColumns.map((column) => html`<col style=${`width:${getColumnWidth(column)}px`} />`)}
            </colgroup>
            <thead>
              ${headerRows.map((row) => html`<tr>${row.map((column) => this.renderHeaderCell(column))}</tr>`)}
            </thead>
            <tbody>
              ${this.data.length === 0
                ? html`<tr><td class="empty" colspan=${leafColumns.length}>${this.emptyText}</td></tr>`
                : this.data.map((record, rowIndex) => {
                  const rowKey = record[this.rowKey] ?? rowIndex
                  return html`
                    <tr data-row-key=${String(rowKey)} class=${this.isSelected(rowKey) ? 'is-selected' : ''}>
                      ${leafColumns.map((column) => this.renderBodyCell(column, record, rowIndex))}
                    </tr>
                  `
                })}
            </tbody>
          </table>
        </div>
        ${this.renderPagination()}
      </section>
    `
  }
}

if (!customElements.get('ds-data-table')) {
  customElements.define('ds-data-table', DSDataTableElement)
}
