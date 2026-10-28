import './index.css'

export function DSCheckbox({
  label,
  checked = false,
  indeterminate = false,
  disabled = false,
  name,
  value,
  className = '',
  onChange,
  ...props
}) {
  const classes = [
    'ds-checkbox',
    checked && 'is-checked',
    indeterminate && 'is-indeterminate',
    disabled && 'is-disabled',
    className,
  ].filter(Boolean).join(' ')

  return (
    <label className={classes}>
      <input
        className="ds-checkbox__input"
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        ref={(node) => {
          if (node) node.indeterminate = indeterminate
        }}
        onChange={disabled ? undefined : onChange}
        {...props}
      />
      <span className="ds-checkbox__mark" aria-hidden="true" />
      {label !== undefined && label !== null ? <span className="ds-checkbox__label">{label}</span> : null}
    </label>
  )
}

export default DSCheckbox
