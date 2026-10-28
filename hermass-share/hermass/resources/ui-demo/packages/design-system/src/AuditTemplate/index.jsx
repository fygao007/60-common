import DSButton from '../Button'
import DSFilterBar from '../FilterBar'
import DSDataTable from '../DataTable'
import DSAuditStatusTabs from '../AuditStatusTabs'
import './index.css'

const defaultStatusTabs = [
  { key: 'pending', label: '待审核', count: 9 },
  { key: 'approved', label: '已审核' },
  { key: 'all', label: '全部' },
]

export default function DSAuditTemplate({
  title = '审核管理',
  description = '用于待审核、已审核、全部等审核业务列表场景。',
  // 与 RegularListTemplate 保持一致的说明条：用于声明本期未启用的能力等边界信息。
  notice = '',
  statusTabs = defaultStatusTabs,
  activeStatus = 'pending',
  // DSFilterBar 默认档的标签轨道只有 72px，装不下"配置生命周期状态"这类中文长标签，
  // 会把整行筛选挤出容器（实测 160px）。审核列表的筛选字段名由业务字典决定、通常偏长，
  // 因此默认与常规列表页一致走紧凑档（标签轨道 94px / 14px 字号）；需要宽松档可显式传 'default'。
  filterDensity = 'compact',
  // 紧凑档字段格为 minmax(180px,1fr)，而单字段最小内容宽 = 94px 标签 + 8px 间距 +
  // 控件最小宽（输入 160px / 日期 180px）≈ 262–282px。列数过多时控件会越格压住下一个标签，
  // 因此暴露出列数透传，由页面按最长标签与控件类型选择能容纳的最小列数。
  filterColumns,
  // DSFilterBar 默认 collapsedRows=1，且折叠行数按「每行 4 个字段」的固定假设计算
  // （Math.floor(index/4)+1），与 columns 无关：3 列布局下第 4 个字段会落在视觉第 2 行
  // 却仍被当作第 1 行显示，第 5 个起被折叠到「展开」里。审核列表字段由业务字典决定、
  // 首屏通常需要全部可见，故与 RegularListTemplate 一致暴露 defaultExpanded，默认保持 false。
  filterDefaultExpanded = false,
  filters = [],
  columns = [],
  data = [],
  rowKey = 'id',
  emptyText,
  emptyRender,
  // 批量确认未启用的场景（如第一期以空动作覆盖默认批量按钮）可将 selectable 置 false，
  // 避免出现"可勾选但无批量动作"的假象。默认 true，保持既有行为。
  selectable = true,
  selectedKeys = [],
  batchActions,
  rowActions,
  pagination,
  onSearch,
  onReset,
  onStatusChange,
  className = '',
}) {
  const classes = ['ds-audit-template', className].filter(Boolean).join(' ')
  const defaultBatchActions = (
    <>
      <DSButton variant="default">导出</DSButton>
      <DSButton variant="default">批量通过</DSButton>
      <DSButton variant="default">批量退回</DSButton>
    </>
  )
  const defaultRowActions = [
    { key: 'pass', label: '通过' },
    { key: 'reject', label: '不通过' },
    { key: 'return', label: '退回' },
    { key: 'detail', label: '详情' },
  ]

  return (
    <div className={classes}>
      <header className="ds-audit-template__header">
        <div>
          <h1 className="ds-page-title">{title}</h1>
          {description && <p className="ds-page-desc">{description}</p>}
        </div>
      </header>

      <DSAuditStatusTabs items={statusTabs} activeKey={activeStatus} onChange={onStatusChange} />

      {notice ? (
        <div className="ds-audit-template__notice" role="status">
          <span className="ds-audit-template__info-icon" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      ) : null}

      {filters.length > 0 && (
        <DSFilterBar
          density={filterDensity}
          columns={filterColumns}
          defaultExpanded={filterDefaultExpanded}
          fields={filters}
          onSearch={onSearch}
          onReset={onReset}
        />
      )}

      <DSDataTable
        title="审核列表"
        summary={`共 ${pagination?.total ?? data.length} 条记录${selectedKeys.length ? `，已选 ${selectedKeys.length} 条` : ''}`}
        columns={columns}
        data={data}
        rowKey={rowKey}
        selectable={selectable}
        selectedKeys={selectedKeys}
        emptyText={emptyText}
        emptyRender={emptyRender}
        actions={rowActions || defaultRowActions}
        toolbarActions={batchActions || defaultBatchActions}
        pagination={pagination}
      />
    </div>
  )
}
