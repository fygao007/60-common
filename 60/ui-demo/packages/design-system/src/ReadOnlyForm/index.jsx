import './index.css'

function isEmptyValue(value) {
  return value === undefined || value === null || value === ''
}

export function DSReadOnlyField({
  label,
  value,
  children,
  required = false,
  fullWidth = false,
  align = 'center',
  emptyText = '-',
  labelSpan = 1,
  valueSpan,
  className = '',
  ...props
}) {
  const classes = [
    'ds-readonly-field',
    fullWidth && 'ds-readonly-field--full',
    align === 'start' && 'ds-readonly-field--start',
    className,
  ].filter(Boolean).join(' ')
  const style = {
    '--ds-readonly-label-span': labelSpan,
    '--ds-readonly-value-span': valueSpan || (fullWidth ? 3 : 1),
    ...props.style,
  }
  const content = children ?? (isEmptyValue(value) ? (
    <span className="ds-readonly-field__placeholder">{emptyText}</span>
  ) : value)

  return (
    <div className={classes} {...props} style={style}>
      <span className="ds-readonly-field__label">
        {required ? <b aria-hidden="true">*</b> : null}
        <span>{label}</span>
      </span>
      <div className="ds-readonly-field__content">{content}</div>
    </div>
  )
}

export default function DSReadOnlyForm({
  columns = 2,
  labelWidth = 150,
  items = [],
  bordered = true,
  children,
  className = '',
  ...props
}) {
  const resolvedColumns = [1, 2, 3].includes(Number(columns)) ? Number(columns) : 2
  const style = {
    '--ds-readonly-label-width': `${Number(labelWidth) || 150}px`,
    ...props.style,
  }
  const classes = [
    'ds-readonly-form',
    `ds-readonly-form--${resolvedColumns}-column`,
    !bordered && 'ds-readonly-form--borderless',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} {...props} style={style}>
      <div className="ds-readonly-form__grid">
        {children || items.map((item) => (
          <DSReadOnlyField
            align={item.align}
            className={item.className}
            emptyText={item.emptyText}
            fullWidth={item.fullWidth}
            key={item.key || item.label}
            label={item.label}
            labelSpan={item.labelSpan}
            required={item.required}
            value={item.value}
            valueSpan={item.valueSpan || (item.fullWidth ? resolvedColumns * 2 - 1 : undefined)}
          >
            {item.children}
          </DSReadOnlyField>
        ))}
      </div>
    </div>
  )
}
