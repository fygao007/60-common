export const STANDARD_LIST_MIN_WIDTHS = Object.freeze({
  text: 196, remark: 196, datetime: 166, date: 103,
  calendar: 126, dictionary: 126, number: 136, switch: 80, status: 100,
})

function allowOnly(value, keys, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${name} 必须是配置对象`)
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) throw new Error(`${name} 未登记配置项：${key}`)
  }
}

export function resolveStandardListConfig(config) {
  allowOnly(config, ['filterProps', 'toolbarActions', 'tableProps', 'pagination'], 'standard-list')
  allowOnly(config.filterProps, ['fields', 'onSearch', 'onReset', 'collapsedRows', 'defaultExpanded'], 'filterProps')
  allowOnly(config.tableProps, ['columns', 'data', 'rowKey', 'selectable', 'selectedRowKeys', 'onSelectRow', 'onSelectAll', 'rowSelectable', 'actions', 'actionsMaxVisible', 'onMoreActions', 'emptyText'], 'tableProps')
  if (!Array.isArray(config.filterProps.fields)) throw new Error('filterProps.fields 必须显式配置')
  for (const field of config.filterProps.fields) {
    if (!field.fieldRef) throw new Error('筛选字段必须携带 ontology fieldRef')
  }
  if (!Array.isArray(config.tableProps.columns) || !Array.isArray(config.tableProps.data)) throw new Error('tableProps.columns 和 data 必须显式配置')
  if (!config.pagination) throw new Error('standard-list 必须配置分页')
  const columns = config.tableProps.columns.map((column) => {
    allowOnly(column, ['fieldRef', 'key', 'dataIndex', 'title', 'displayType', 'width', 'minWidth', 'render', 'fixed', 'className', 'align', 'sortable'], 'column')
    if (!column.fieldRef) throw new Error('标准列表业务列必须由 defineTableColumns() 生成并携带 fieldRef')
    const minimum = STANDARD_LIST_MIN_WIDTHS[column.displayType || 'text']
    if (!minimum) throw new Error(`未登记列展示类型：${column.displayType}`)
    for (const key of ['width', 'minWidth']) {
      if (column[key] !== undefined && (!Number.isFinite(column[key]) || column[key] < minimum)) throw new Error(`${column.fieldRef}.${key} 不得小于 ${minimum}px`)
    }
    const { displayType, ...resolved } = column
    return { ...resolved, width: column.width ?? column.minWidth ?? minimum, minWidth: minimum }
  })
  for (const action of [...(config.toolbarActions || []), ...(config.tableProps.actions || [])]) {
    if (action.node) throw new Error('标准列表操作禁止传入自定义 node')
  }
  return {
    tabs: [], metaLabel: '', metaValue: '', notice: '',
    inset: 12, contentGap: 12, toolbarGap: 8, footerActions: [], tableTools: false,
    filterProps: { ...config.filterProps, density: 'compact', showMore: false, columns: Math.max(1, config.filterProps.fields.length) },
    toolbarActions: config.toolbarActions || [],
    tableProps: { ...config.tableProps, columns, actions: config.tableProps.actions || [], showIndex: false, bordered: true, minWidth: 0 },
    pagination: config.pagination,
  }
}
