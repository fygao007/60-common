import { DSButton } from '@wisedu/design-system'

export function SourceEditNote({ source, onEdit, editable = true, className = '' }) {
  if (!source) return null
  const cls = [className, 'shared-source-note'].filter(Boolean).join(' ')
  return (
    <span className={cls}>
      数据来源于<strong>{source}</strong>，
      {editable && (
        <DSButton variant="link" size="small" onClick={onEdit}>
          去纠错或补录
        </DSButton>
      )}
    </span>
  )
}

export function StatCards({ stats, className = '', itemClassName = '' }) {
  if (!stats?.length) return null
  const cls = className || 'shared-stats'
  const itemCls = itemClassName || 'shared-stat-card'
  return (
    <div className={cls}>
      {stats.slice(0, 5).map((stat) => (
        <div className={itemCls} key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  )
}

export function DataGrid({ columns, rows, ariaLabel = '数据表格', className = '', rowClassName = '', headRowClassName = '', cellClassName = '' }) {
  const cls = className || 'shared-data-grid'
  const rowCls = rowClassName || 'shared-data-grid__row'
  const headRowCls = headRowClassName || 'shared-data-grid__row shared-data-grid__row--head'
  const cellCls = cellClassName || 'shared-data-grid__cell'
  return (
    <div className={cls} role="table" aria-label={ariaLabel}>
      <div className={headRowCls} role="row">
        {columns.map((column) => (
          <div className={cellCls} role="columnheader" key={column}>
            {column}
          </div>
        ))}
      </div>
      {rows.map((row, index) => (
        <div className={rowCls} role="row" key={`${row[0]}-${index}`}>
          {columns.map((column, cellIndex) => (
            <div className={cellCls} role="cell" key={`${column}-${cellIndex}`}>
              {row[cellIndex] || '--'}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function FocusIcon({ className = '' }) {
  const cls = className || 'shared-focus-icon'
  return (
    <svg className={cls} xmlns="http://www.w3.org/2000/svg" fill="none" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7.584,0.584L7.584,2.37C9.699,2.637,11.364,4.303,11.631,6.417L13.417,6.417L13.417,7.584L11.631,7.584C11.364,9.699,9.699,11.364,7.584,11.631L7.584,13.417L6.417,13.417L6.417,11.631C4.302,11.364,2.637,9.699,2.37,7.584L0.584,7.584L0.584,6.417L2.37,6.417C2.637,4.302,4.302,2.637,6.417,2.37L6.417,0.584L7.584,0.584ZM7,3.5C5.068,3.5,3.5,5.068,3.5,7C3.5,8.932,5.068,10.5,7,10.5C8.932,10.5,10.5,8.932,10.5,7C10.5,5.068,8.932,3.5,7,3.5ZM7,5.834C7.645,5.834,8.167,6.356,8.167,7C8.167,7.644,7.645,8.166,7,8.166C6.355,8.166,5.833,7.644,5.833,7C5.833,6.356,6.355,5.834,7,5.834Z" fill="currentColor" />
    </svg>
  )
}

export function SectionTitle({ title, source, onEdit, className = '', titleClassName = '' }) {
  const cls = className || 'shared-section-head'
  const titleCls = titleClassName || 'shared-section-title'
  return (
    <div className={cls}>
      <h2 className={titleCls}>
        <span>{title}</span>
      </h2>
      <SourceEditNote source={source} onEdit={onEdit} />
    </div>
  )
}

export function ArchiveCard({ card, classNamePrefix = 'shared-archive-card' }) {
  const elementClass = (element) => `${classNamePrefix}__${element}`

  return (
    <a className={classNamePrefix} href={card.href} aria-label={`查看${card.title}详情`}>
      <span className={elementClass('inner')}>
        <span className={elementClass('title')}>{card.title}</span>
        <span className={elementClass('desc')}>{card.desc}</span>
        <span className={elementClass('line')} aria-hidden="true" />
        <span className={elementClass('foot')}>
          <span className={elementClass('count')}>
            <b>{card.count}</b> 条
          </span>
          <span className={elementClass('link')}>查看详情</span>
        </span>
      </span>
    </a>
  )
}
