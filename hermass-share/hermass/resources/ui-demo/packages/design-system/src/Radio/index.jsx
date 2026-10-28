import { useState } from 'react'
import './index.css'

function normalizeOptions(options) {
  return options.map((option) => {
    if (typeof option === 'string') {
      return { value: option, label: option }
    }

    return option
  })
}

export function DSRadio({
  label,
  value,
  checked = false,
  disabled = false,
  name,
  className = '',
  onChange,
  ...props
}) {
  const classes = [
    'ds-radio',
    checked && 'is-checked',
    disabled && 'is-disabled',
    className,
  ].filter(Boolean).join(' ')

  return (
    <label className={classes}>
      <input
        className="ds-radio__input"
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        {...props}
      />
      <span className="ds-radio__mark" aria-hidden="true" />
      <span className="ds-radio__label">{label}</span>
    </label>
  )
}

export default function DSRadioGroup({
  options = [],
  value,
  defaultValue,
  name,
  disabled = false,
  error = false,
  vertical = false,
  className = '',
  onChange,
  ...props
}) {
  const normalizedOptions = normalizeOptions(options)
  const [internalValue, setInternalValue] = useState(defaultValue)
  const currentValue = value !== undefined ? value : internalValue

  const classes = [
    'ds-radio-group',
    vertical && 'ds-radio-group--vertical',
    error && 'is-error',
    disabled && 'is-disabled',
    className,
  ].filter(Boolean).join(' ')

  const commitValue = (nextValue, option, event) => {
    if (value === undefined) setInternalValue(nextValue)
    onChange?.(nextValue, option, event)
  }

  return (
    <div className={classes} role="radiogroup" {...props}>
      {normalizedOptions.map((option) => {
        const optionDisabled = disabled || option.disabled
        return (
          <DSRadio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            checked={currentValue === option.value}
            disabled={optionDisabled}
            onChange={(event) => commitValue(option.value, option, event)}
          />
        )
      })}
    </div>
  )
}
