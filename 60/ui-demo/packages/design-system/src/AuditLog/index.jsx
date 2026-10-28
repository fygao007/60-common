import './index.css'

const typeMeta = {
  submit: { label: '提交', tone: 'primary' },
  resubmit: { label: '重新提交', tone: 'primary' },
  pass: { label: '通过', tone: 'success' },
  reject: { label: '退回', tone: 'warning' },
  reject_back: { label: '退回', tone: 'warning' },
  fail: { label: '不通过', tone: 'danger' },
  countersign: { label: '会签', tone: 'info' },
  pending: { label: '待审核', tone: 'neutral' },
  transfer: { label: '转办', tone: 'info' },
}

function getMeta(type, customLabel) {
  const meta = typeMeta[type] || { label: type || '操作', tone: 'neutral' }
  return { label: customLabel || meta.label, tone: meta.tone }
}

function formatOperator(operatorLabel, item) {
  if (item.operator) return item.operator
  if (item.submitter) return item.submitter
  if (item.assignee) return item.assignee
  return operatorLabel || '—'
}

export default function DSAuditLog({
  items = [],
  title = '审核日志',
  description,
  direction = 'vertical',
  showLatestFirst = false,
  className = '',
}) {
  const classes = ['ds-audit-log', `ds-audit-log--${direction}`, className].filter(Boolean).join(' ')
  const ordered = showLatestFirst ? [...items].reverse() : items

  return (
    <section className={classes}>
      {(title || description) && (
        <header className="ds-audit-log__header">
          {title && <h3 className="ds-audit-log__title">{title}</h3>}
          {description && <p className="ds-audit-log__desc">{description}</p>}
        </header>
      )}

      <ol className="ds-audit-log__list">
        {ordered.map((item, index) => {
          const meta = getMeta(item.type, item.label)
          const operatorLabel = item.role || (
            item.type === 'submit' || item.type === 'resubmit' ? '提交人' : '审核人'
          )

          return (
            <li
              className={`ds-audit-log__item ds-audit-log__item--${meta.tone} ${index === ordered.length - 1 ? 'is-last' : ''}`}
              key={item.key || `${item.title}-${index}`}
            >
              <div className="ds-audit-log__dot" aria-hidden="true">
                <span className="ds-audit-log__dot-inner" />
              </div>
              <div className="ds-audit-log__line" aria-hidden="true" />

              <div className="ds-audit-log__panel">
                <div className="ds-audit-log__head">
                  <span className="ds-audit-log__stage">{item.stage || item.title}</span>
                  <span className={`ds-audit-log__status is-${meta.tone}`}>{meta.label}</span>
                  {item.countersign && (
                    <span className="ds-audit-log__extra">{item.countersign}人会签</span>
                  )}
                </div>

                <div className="ds-audit-log__meta">
                  <span className="ds-audit-log__meta-item">{item.timeLabel || '提交时间'}：{item.time || '—'}</span>
                  <span className="ds-audit-log__meta-item">{operatorLabel}：{formatOperator(operatorLabel, item)}</span>
                </div>

                {item.remark && (
                  <div className="ds-audit-log__remark">
                    {item.remarkLabel || '退回原因'}：{item.remark}
                  </div>
                )}

                {item.opinion && (
                  <div className="ds-audit-log__opinion">意见：{item.opinion}</div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
