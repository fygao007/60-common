import { useState } from 'react'
import DSButton from '../Button'
import DSField, { DSInput, DSSelect } from '../Field'
import './index.css'

function MoreIcon() {
  return <span aria-hidden="true">...</span>
}

function ChevronIcon({ expanded }) {
  return <span className="ds-filter-area__chevron" aria-hidden="true">{expanded ? '⌃' : '⌄'}</span>
}

function renderControl(field) {
  if (field.render) return field.render(field)

  if (field.type === 'select') {
    return (
      <DSSelect
        options={field.options || []}
        placeholder={field.placeholder || '请选择'}
        defaultValue={field.value ?? field.defaultValue ?? field.options?.[0]?.value ?? field.options?.[0]}
        value={field.controlledValue}
        clearable={field.clearable}
        searchable={field.searchable}
        native={field.native}
        onChange={field.onChange}
      />
    )
  }

  return (
    <DSInput
      placeholder={field.placeholder || '请输入'}
      defaultValue={field.value ?? field.defaultValue}
      value={field.controlledValue}
      onChange={field.onChange}
    />
  )
}

export default function DSFilterBar({
  tabs = [],
  activeTab,
  onTabChange,
  fields = [],
  collapsedRows = 1,
  defaultExpanded = false,
  onSearch,
  onReset,
  onMore,
  className = '',
  showMore = true,
  showExpand = true,
  moreLabel = '更多筛选',
  searchLabel = '查询',
  resetLabel = '重置',
  density = 'default',
  columns,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const visibleFields = expanded ? fields : fields.filter((field, index) => {
    const row = field.row || Math.floor(index / 4) + 1
    return row <= collapsedRows
  })
  const hasOverflow = fields.length > visibleFields.length
  const currentTab = activeTab ?? tabs.find((tab) => tab.active)?.key ?? tabs[0]?.key
  const classes = [
    'ds-filter-area',
    density === 'compact' && 'ds-filter-area--compact',
    className,
  ].filter(Boolean).join(' ')

  return (
    <section
      className={classes}
      aria-label="筛选区域"
      style={columns ? { '--ds-filter-columns': columns } : undefined}
    >
      {tabs.length > 0 && (
        <div className="ds-filter-area__tabs" role="tablist" aria-label="筛选分组">
          {tabs.map((tab) => {
            const selected = tab.key === currentTab
            return (
              <button
                className={['ds-filter-area__tab', selected && 'is-active'].filter(Boolean).join(' ')}
                type="button"
                role="tab"
                aria-selected={selected}
                key={tab.key}
                onClick={() => onTabChange?.(tab.key, tab)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      )}

      <div className="ds-filter-area__panel">
        <div className="ds-filter-area__fields">
          {visibleFields.map((field, index) => (
            <DSField
              className={[
                'ds-filter-area__field',
                field.span === 2 && 'ds-filter-area__field--span-2',
                field.span === 3 && 'ds-filter-area__field--span-3',
                field.span === 4 && 'ds-filter-area__field--span-4',
              ].filter(Boolean).join(' ')}
              labelClassName="ds-filter-area__label"
              label={field.label}
              key={field.key || `${field.label}-${index}`}
            >
              {renderControl(field)}
            </DSField>
          ))}
        </div>

        <div className="ds-filter-area__actions">
          {showMore && (
            <DSButton
              className="ds-filter-area__more"
              variant="default"
              iconOnly
              aria-label={moreLabel}
              title={moreLabel}
              onClick={onMore}
            >
              <MoreIcon />
            </DSButton>
          )}
          <DSButton variant="default" onClick={onReset}>{resetLabel}</DSButton>
          <DSButton onClick={onSearch}>{searchLabel}</DSButton>
          {showExpand && hasOverflow && (
            <DSButton
              className="ds-filter-area__expand"
              variant="link"
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
              rightIcon={<ChevronIcon expanded={expanded} />}
            >
              {expanded ? '收起' : '展开'}
            </DSButton>
          )}
        </div>
      </div>
    </section>
  )
}
