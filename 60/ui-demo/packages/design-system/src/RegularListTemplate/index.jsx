import DSButton from '../Button'
import DSDataTable from '../DataTable'
import DSFilterBar from '../FilterBar'
import DSPagination from '../Pagination'
import DSTabs from '../Tabs'
import './index.css'

const DEFAULT_TABS = [
  { key: 'all', label: '选项' },
  { key: 'other', label: '选项' },
]

const DEFAULT_FIELDS = Array.from({ length: 7 }, (_, index) => ({
  key: `field-${index + 1}`,
  label: '标题名称',
  placeholder: '请输入',
}))

const DEFAULT_COLUMNS = Array.from({ length: 4 }, (_, index) => ({
  key: `column-${index + 1}`,
  dataIndex: `column${index + 1}`,
  title: '标题',
  width: 240,
}))

const DEFAULT_DATA = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  column1: '文本',
  column2: '文本',
  column3: '文本',
  column4: '文本',
}))

const DEFAULT_TOOLBAR_ACTIONS = [
  { key: 'create', label: '按钮' },
  { key: 'batch', label: '按钮' },
  { key: 'report', label: '导出报表' },
  { key: 'download', label: '批量下载' },
  { key: 'import', label: '导入' },
  { key: 'export', label: '导出', dropdown: true },
  { key: 'print', label: '打印' },
  { key: 'sort', label: '排序查询' },
]

const DEFAULT_ROW_ACTIONS = [
  { key: 'edit', label: '按钮' },
  { key: 'detail', label: '按钮' },
]

const DEFAULT_FOOTER_ACTIONS = [
  { key: 'secondary', label: '按钮', variant: 'default' },
  { key: 'primary', label: '按钮', variant: 'primary' },
]

function DropdownIcon() {
  return <span className="ds-regular-list-template__dropdown-icon" aria-hidden="true" />
}

function renderButton(action, index, className = '') {
  if (!action) return null
  if (action.node) return action.node

  return (
    <DSButton
      className={className}
      variant={action.variant || 'default'}
      size={action.size || 'default'}
      danger={action.danger}
      disabled={action.disabled}
      rightIcon={action.dropdown ? <DropdownIcon /> : action.rightIcon}
      key={action.key || action.label || index}
      onClick={action.onClick}
    >
      {action.label}
    </DSButton>
  )
}

export default function DSRegularListTemplate({
  tabs = DEFAULT_TABS,
  tabVariant = 'section',
  activeTab = DEFAULT_TABS[0].key,
  onTabChange,
  metaLabel = '标题：',
  metaValue = '选项',
  onMetaClick,
  notice = '此处是描述文本',
  noticeNode,
  filterProps = {},
  toolbarActions = DEFAULT_TOOLBAR_ACTIONS,
  tableTools,
  tableProps = {},
  pagination = {
    total: 100,
    totalPages: 10,
    current: 1,
    pageSize: 10,
  },
  footerActions = DEFAULT_FOOTER_ACTIONS,
  inset,
  headerHeight = 52,
  headerInset = 16,
  contentGap = 8,
  tableGap,
  toolbarGap = 4,
  className = '',
  flush = false,
}) {
  const mergedTableProps = {
    columns: DEFAULT_COLUMNS,
    data: DEFAULT_DATA,
    rowKey: 'id',
    selectable: true,
    showIndex: true,
    actions: DEFAULT_ROW_ACTIONS,
    actionsMaxVisible: 2,
    actionFixed: true,
    minWidth: 1196,
    ...tableProps,
  }

  const mergedFilterProps = {
    fields: DEFAULT_FIELDS,
    collapsedRows: 1,
    defaultExpanded: true,
    ...filterProps,
  }

  return (
    <section
      className={['ds-regular-list-template', flush ? 'ds-regular-list-template--flush' : '', className].filter(Boolean).join(' ')}
      style={{
        '--ds-regular-list-content-gap': `${contentGap}px`,
        '--ds-regular-list-table-gap': `${tableGap ?? contentGap}px`,
        '--ds-regular-list-toolbar-gap': `${toolbarGap}px`,
        '--ds-regular-list-header-height': `${headerHeight}px`,
        '--ds-regular-list-header-inset': `${headerInset}px`,
        ...(inset == null ? {} : { '--ds-regular-list-inset': `${inset}px` }),
      }}
    >
      {(tabs.length > 0 || metaLabel || metaValue) && (
        <header className="ds-regular-list-template__header">
          {tabs.length > 0 && (
            <DSTabs
              className="ds-regular-list-template__tabs"
              variant={tabVariant}
              items={tabs}
              activeKey={activeTab}
              onChange={onTabChange}
            />
          )}
          {(metaLabel || metaValue) && (
            <button className="ds-regular-list-template__meta" type="button" onClick={onMetaClick}>
              <span>{metaLabel}</span>
              <strong>{metaValue}</strong>
              <DropdownIcon />
            </button>
          )}
        </header>
      )}

      {notice && (
        <div className="ds-regular-list-template__notice" role="status">
          <span className="ds-regular-list-template__info-icon" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      )}

      <div className="ds-regular-list-template__content">
        {noticeNode}
        {filterProps === false ? null : <DSFilterBar {...mergedFilterProps} />}

        <div className="ds-regular-list-template__toolbar">
          <div className="ds-regular-list-template__toolbar-actions">
            {toolbarActions.map((action, index) => renderButton(action, index))}
          </div>
          {tableTools === false ? null : (tableTools || (
            <div className="ds-regular-list-template__table-tools" aria-label="表格工具">
              <button className="ds-regular-list-template__tool is-fullscreen" type="button" aria-label="全屏表格" />
              <button className="ds-regular-list-template__tool is-columns" type="button" aria-label="列设置" />
            </div>
          ))}
        </div>

        <div className="ds-regular-list-template__table">
          <DSDataTable
            {...mergedTableProps}
            variant="lowcode"
            showToolbar={false}
            pagination={false}
          />
        </div>
      </div>

      <footer className="ds-regular-list-template__footer">
        {pagination && <DSPagination className="ds-regular-list-template__pagination" {...pagination} />}
        <div className="ds-regular-list-template__footer-actions">
          {footerActions.map((action, index) => renderButton(action, index, 'ds-regular-list-template__footer-button'))}
        </div>
      </footer>
    </section>
  )
}
