import './index.css'

export default function DSSwitch({
  checked = false,
  checkedText = '启用',
  uncheckedText = '停用',
  disabled = false,
  onChange,
  className = '',
}) {
  const classes = ['ds-switch', checked && 'is-checked', disabled && 'is-disabled', className].filter(Boolean).join(' ')

  return (
    <button
      aria-checked={checked}
      className={classes}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      role="switch"
      type="button"
    >
      <span className="ds-switch__label ds-switch__label--off">{uncheckedText}</span>
      <span className="ds-switch__core" aria-hidden="true" />
      <span className="ds-switch__label ds-switch__label--on">{checkedText}</span>
    </button>
  )
}
