import { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import './index.css'

export function DSInput({ className = '', ...props }) {
  return <input className={['ds-input', className].filter(Boolean).join(' ')} {...props} />
}

function normalizeOptions(options) {
  return options.map((option) => {
    if (typeof option === 'string') {
      return { value: option, label: option }
    }

    return option
  })
}

function getOptionValue(option) {
  return option?.value ?? option?.label
}

export function DSSelect({
  options = [],
  className = '',
  children,
  value,
  defaultValue,
  placeholder = '请选择',
  multiple = false,
  searchable = false,
  clearable = false,
  disabled = false,
  error = false,
  open: controlledOpen,
  native = false,
  portal = false,
  name,
  onChange,
  onOpenChange,
  ...props
}) {
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options])
  const initialValue = multiple ? defaultValue || [] : defaultValue
  const [internalValue, setInternalValue] = useState(initialValue)
  const [internalOpen, setInternalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selectRef = useRef(null)
  // portal 模式：下拉面板固定到 body，避免被表格滚动容器裁剪
  const portalDropdownId = useMemo(() => `ds-select-portal-${Math.random().toString(36).slice(2)}`, [])
  const [portalStyle, setPortalStyle] = useState(null)

  const currentValue = value !== undefined ? value : internalValue
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const selectedValues = multiple ? (Array.isArray(currentValue) ? currentValue : []) : [currentValue].filter(Boolean)
  const selectedOptions = normalizedOptions.filter((option) => selectedValues.includes(getOptionValue(option)))
  const hasValue = selectedValues.length > 0
  const filteredOptions = searchable && query
    ? normalizedOptions.filter((option) => String(option.label).toLowerCase().includes(query.toLowerCase()))
    : normalizedOptions

  const setOpen = (nextOpen) => {
    if (disabled) return
    if (controlledOpen === undefined) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event) => {
      const trigger = selectRef.current
      // portal 模式下下拉面板挂在 body，需额外排除它
      const dropdown = portal ? document.getElementById(portalDropdownId) : null
      if (trigger?.contains(event.target)) return
      if (dropdown?.contains(event.target)) return
      setOpen(false)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, portal, portalDropdownId])

  // portal 模式：根据触发器位置计算下拉面板的 fixed 坐标
  useLayoutEffect(() => {
    if (!isOpen) {
      setPortalStyle(null)
      return undefined
    }
    if (!portal) return undefined

    const update = () => {
      const trigger = selectRef.current?.querySelector('.ds-select__trigger')
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      setPortalStyle({ position: 'fixed', top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 180) })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [isOpen, portal])

  if (children || native) {
    return (
      <select
        className={['ds-select', className].filter(Boolean).join(' ')}
        disabled={disabled}
        name={name}
        value={value}
        defaultValue={defaultValue}
        multiple={multiple}
        onChange={onChange}
        {...props}
      >
        {children ||
          options.map((option) => {
            const item = typeof option === 'string' ? { value: option, label: option } : option
            return (
              <option value={item.value} key={item.value} disabled={item.disabled}>
                {item.label}
              </option>
            )
          })}
      </select>
    )
  }

  const commitValue = (nextValue, option) => {
    if (value === undefined) setInternalValue(nextValue)
    onChange?.(nextValue, option)
  }

  const toggleOption = (option) => {
    if (option.disabled) return
    const optionValue = getOptionValue(option)
    if (multiple) {
      const nextValue = selectedValues.includes(optionValue)
        ? selectedValues.filter((item) => item !== optionValue)
        : [...selectedValues, optionValue]
      commitValue(nextValue, option)
      return
    }

    commitValue(optionValue, option)
    setOpen(false)
  }

  const clearValue = (event) => {
    event.stopPropagation()
    commitValue(multiple ? [] : undefined)
    setQuery('')
  }

  const removeTag = (event, optionValue) => {
    event.stopPropagation()
    const nextValue = selectedValues.filter((item) => item !== optionValue)
    commitValue(nextValue)
  }

  const classes = [
    'ds-select',
    'ds-select--custom',
    multiple && 'ds-select--multiple',
    searchable && 'ds-select--searchable',
    isOpen && 'is-open',
    hasValue && 'has-value',
    disabled && 'is-disabled',
    error && 'is-error',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} ref={selectRef} {...props}>
      {name && multiple && selectedValues.map((item) => <input type="hidden" name={name} value={item} key={item} />)}
      {name && !multiple && hasValue && <input type="hidden" name={name} value={selectedValues[0]} />}
      <button
        className="ds-select__trigger"
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setOpen(!isOpen)}
      >
        <span className="ds-select__value">
          {!multiple && searchable && isOpen ? (
            <input
              className="ds-select__search"
              value={query}
              placeholder={hasValue ? selectedOptions[0]?.label : placeholder}
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
              onClick={(event) => event.stopPropagation()}
            />
          ) : multiple && hasValue ? (
            <span className="ds-select__tags">
              {selectedOptions.map((option) => (
                <span className="ds-select__tag" key={getOptionValue(option)}>
                  <span>{option.label}</span>
                  <span aria-hidden="true" onClick={(event) => removeTag(event, getOptionValue(option))}>×</span>
                </span>
              ))}
            </span>
          ) : hasValue ? (
            <span className="ds-select__text">{selectedOptions[0]?.label}</span>
          ) : (
            <span className="ds-select__placeholder">{placeholder}</span>
          )}
        </span>
        {clearable && hasValue && !disabled && (
          <span className="ds-select__clear" role="button" tabIndex={-1} aria-label="清除" onClick={clearValue}>×</span>
        )}
        <span className="ds-select__arrow" aria-hidden="true">⌄</span>
      </button>
      {isOpen && (() => {
        const dropdown = (
          <div
            id={portal ? portalDropdownId : undefined}
            className="ds-select__dropdown"
            role="listbox"
            aria-multiselectable={multiple || undefined}
            style={portal ? portalStyle : undefined}
          >
            {filteredOptions.map((option) => {
              const optionValue = getOptionValue(option)
              const selected = selectedValues.includes(optionValue)
              return (
                <button
                  className={['ds-select__option', selected && 'is-selected', option.disabled && 'is-disabled'].filter(Boolean).join(' ')}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  key={optionValue}
                  onClick={() => toggleOption(option)}
                >
                  <span>{option.label}</span>
                  {selected && <span className="ds-select__check" aria-hidden="true">✓</span>}
                </button>
              )
            })}
            {filteredOptions.length === 0 && <div className="ds-select__empty">无匹配数据</div>}
          </div>
        )
        return portal ? createPortal(dropdown, document.body) : dropdown
      })()}
    </div>
  )
}

export function DSTextarea({ className = '', ...props }) {
  return <textarea className={['ds-textarea', className].filter(Boolean).join(' ')} {...props} />
}

export default function DSField({
  label,
  required = false,
  help,
  error,
  children,
  className = '',
  labelClassName = '',
}) {
  const classes = ['ds-field', error && 'ds-field--error', className].filter(Boolean).join(' ')

  return (
    <label className={classes}>
      {label && (
        <span className={['ds-field__label', labelClassName].filter(Boolean).join(' ')}>
          {required && <b aria-hidden="true">*</b>}
          {label}
        </span>
      )}
      {children}
      {(error || help) && <span className="ds-field__message">{error || help}</span>}
    </label>
  )
}
