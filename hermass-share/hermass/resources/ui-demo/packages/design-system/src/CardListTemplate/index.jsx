import DSButton from '../Button'
import DSCard from '../Card'
import DSFilterBar from '../FilterBar'
import DSPagination from '../Pagination'
import DSTabs from '../Tabs'
import './index.css'

const DEFAULT_TABS = [
  { key: 'all', label: '选项' },
  { key: 'other', label: '选项' },
]

const DEFAULT_FIELDS = [
  {
    key: 'name',
    label: '评价方案名称',
    placeholder: '请输入',
  },
  {
    key: 'status',
    label: '启用状态',
    placeholder: '请选择',
    type: 'select',
    options: [
      { label: '全部', value: 'all' },
      { label: '已发布', value: 'published' },
      { label: '未发布', value: 'draft' },
    ],
  },
]

const DEFAULT_TOOLBAR_ACTIONS = [
  { key: 'create', label: '按钮', variant: 'primary' },
  { key: 'action', label: '按钮' },
  { key: 'report', label: '导出报表' },
  { key: 'download', label: '批量下载' },
  { key: 'import', label: '导入' },
  { key: 'export', label: '导出', dropdown: true },
  { key: 'sort', label: '排序查询' },
]

const DEFAULT_CARDS = Array.from({ length: 6 }, (_, index) => {
  const published = index % 3 !== 0
  return {
    id: index + 1,
    title: '教师数据中心',
    status: published ? '已发布' : '未发布',
    statusTone: published ? 'success' : 'neutral',
    updatedAt: '2025-06-03 00:00:00',
    administrator: published ? '张老师、李老师、王老师、赵老师' : '-',
    notice: index % 3 === 1
      ? { content: '对象未设置完整', actionLabel: '设置对象' }
      : null,
  }
})

function DropdownIcon() {
  return <span className="ds-card-list-template__dropdown-icon" aria-hidden="true" />
}

function renderButton(action, index) {
  if (!action) return null
  if (action.node) return action.node

  return (
    <DSButton
      danger={action.danger}
      disabled={action.disabled}
      key={action.key || action.label || index}
      onClick={action.onClick}
      rightIcon={action.dropdown ? <DropdownIcon /> : action.rightIcon}
      size={action.size || 'default'}
      variant={action.variant || 'default'}
    >
      {action.label}
    </DSButton>
  )
}

function getDefaultActions(card, onCardAction) {
  const published = card.status === '已发布' || card.statusTone === 'success'

  return [
    { key: 'delete', label: '删除', onClick: () => onCardAction?.('delete', card) },
    { key: 'visit', label: '访问', onClick: () => onCardAction?.('visit', card) },
    {
      key: published ? 'unpublish' : 'publish',
      label: published ? '取消发布' : '发布',
      onClick: () => onCardAction?.(published ? 'unpublish' : 'publish', card),
    },
    { key: 'edit', label: '编辑', onClick: () => onCardAction?.('edit', card) },
  ]
}

function renderDefaultCard(card, index, onCardAction) {
  return (
    <DSCard
      actionAppearance="button"
      actionLimit={4}
      actions={card.actions || getDefaultActions(card, onCardAction)}
      fields={card.fields || [
        { key: 'updatedAt', label: '最近修改时间：', value: card.updatedAt || '-' },
        { key: 'administrator', label: '管理员：', value: card.administrator || '-' },
      ]}
      key={card.id || card.key || index}
      notice={card.notice && {
        ...card.notice,
        onAction: card.notice.onAction || (() => onCardAction?.('configure', card)),
      }}
      status={card.status}
      statusTone={card.statusTone}
      title={card.title}
      variant="list-item"
    >
      {card.children}
    </DSCard>
  )
}

export default function DSCardListTemplate({
  tabs = DEFAULT_TABS,
  activeTab = DEFAULT_TABS[0].key,
  onTabChange,
  metaLabel = '标题：',
  metaValue = '选项',
  onMetaClick,
  filterProps = {},
  toolbarActions = DEFAULT_TOOLBAR_ACTIONS,
  tableTools,
  cards = DEFAULT_CARDS,
  renderCard,
  onCardAction,
  empty,
  pagination = {
    total: 100,
    totalPages: 10,
    current: 1,
    pageSize: 10,
  },
  className = '',
}) {
  const mergedFilterProps = {
    fields: DEFAULT_FIELDS,
    collapsedRows: 1,
    defaultExpanded: true,
    showExpand: false,
    showMore: false,
    ...filterProps,
  }

  const hasTabs = tabs && tabs.length > 0

  return (
    <section className={['ds-card-list-template', className].filter(Boolean).join(' ')}>
      {hasTabs ? (
        <header className="ds-card-list-template__header">
          <DSTabs
            activeKey={activeTab}
            className="ds-card-list-template__tabs"
            items={tabs}
            onChange={onTabChange}
            variant="section"
          />
          {(metaLabel || metaValue) && (
            <button className="ds-card-list-template__meta" type="button" onClick={onMetaClick}>
              <span>{metaLabel}</span>
              <strong>{metaValue}</strong>
              <DropdownIcon />
            </button>
          )}
        </header>
      ) : null}

      <div className="ds-card-list-template__content">
        {filterProps !== false && <DSFilterBar {...mergedFilterProps} />}

        <div className="ds-card-list-template__toolbar">
          <div className="ds-card-list-template__toolbar-actions">
            {toolbarActions.map((action, index) => renderButton(action, index))}
          </div>
          {tableTools || (
            <div className="ds-card-list-template__tools" aria-label="卡片列表工具">
              <button className="ds-card-list-template__tool is-fullscreen" type="button" aria-label="全屏" />
              <button className="ds-card-list-template__tool is-columns" type="button" aria-label="显示设置" />
            </div>
          )}
        </div>

        <div className="ds-card-list-template__grid">
          {cards.length
            ? cards.map((card, index) => (
              renderCard
                ? renderCard(card, index)
                : renderDefaultCard(card, index, onCardAction)
            ))
            : empty || <div className="ds-card-list-template__empty">暂无卡片数据</div>}
        </div>
      </div>

      {pagination && (
        <footer className="ds-card-list-template__footer">
          <DSPagination className="ds-card-list-template__pagination" {...pagination} />
        </footer>
      )}
    </section>
  )
}
