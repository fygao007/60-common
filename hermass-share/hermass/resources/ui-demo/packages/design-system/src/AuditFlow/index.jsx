import './index.css'

const statusOrder = ['finish', 'process', 'wait', 'error', 'reject', 'disabled']

function resolveStatus(item, index, currentIndex, fallbackStatus) {
  if (item.status && statusOrder.includes(item.status)) return item.status
  if (typeof currentIndex === 'number') {
    if (index < currentIndex) return 'finish'
    if (index === currentIndex) return fallbackStatus || 'process'
    return 'wait'
  }
  return 'wait'
}

function nodeIcon(status, index, isRejected, isRejectedFrom) {
  if (status === 'finish') return '✓'
  if (status === 'error' || status === 'reject') return isRejectedFrom ? '!' : '×'
  if (isRejected) return '↩'
  return index + 1
}

export default function DSAuditFlow({
  items = [],
  current = 0,
  status = 'process',
  title = '审核流程',
  description,
  showAssignee = true,
  direction = 'horizontal',
  className = '',
}) {
  const classes = ['ds-audit-flow', `ds-audit-flow--${direction}`, className].filter(Boolean).join(' ')

  const rejectedIndex = items.findIndex((item) => item.status === 'reject')
  const rejectedFromIndex = items.findIndex((item) => item.status === 'error')

  const richItems = items.map((item, index) => {
    const itemStatus = resolveStatus(item, index, current, status)
    const isRejected = rejectedIndex >= 0 && index > rejectedIndex
    const isRejectedFrom = rejectedFromIndex === index
    return { ...item, _status: itemStatus, _index: index, _isRejected: isRejected, _isRejectedFrom: isRejectedFrom }
  })

  return (
    <section className={classes}>
      {(title || description) && (
        <header className="ds-audit-flow__header">
          {title && <h3 className="ds-audit-flow__title">{title}</h3>}
          {description && <p className="ds-audit-flow__desc">{description}</p>}
        </header>
      )}

      <ol className="ds-audit-flow__track">
        {richItems.map((item) => {
          const itemClasses = [
            'ds-audit-flow__node',
            `is-${item._status}`,
            item._isRejected && 'is-rejected-after',
            item._isRejectedFrom && 'is-rejected-source',
          ]
            .filter(Boolean)
            .join(' ')

          const tag = item.tag || (
            item._status === 'finish' ? '已通过' :
            item._status === 'process' ? '审核中' :
            item._status === 'error' ? '已退回' :
            item._status === 'reject' ? '不通过' :
            item._status === 'disabled' ? '跳过' : '未开始'
          )

          return (
            <li className={itemClasses} key={item.key || item.title || item._index}>
              <div className="ds-audit-flow__connector" aria-hidden="true" />
              <div className="ds-audit-flow__icon">
                {nodeIcon(item._status, item._index, item._isRejected, item._isRejectedFrom)}
              </div>
              <div className="ds-audit-flow__body">
                <div className="ds-audit-flow__title-row">
                  <strong className="ds-audit-flow__name">{item.title}</strong>
                  <span className={`ds-audit-flow__tag ${item._status === 'reject' ? 'is-danger' : ''}`}>{tag}</span>
                </div>
                {showAssignee && item.assignee && (
                  <span className="ds-audit-flow__assignee">{item.assignee}</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
