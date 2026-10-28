import { useEffect, useMemo, useRef, useState } from 'react'
import './index.css'

function pad(value) {
  return String(value).padStart(2, '0')
}

function parseTime(value, showSecond) {
  const parts = String(value || '').split(':')
  return {
    hour: parts[0] || '09',
    minute: parts[1] || '00',
    second: showSecond ? parts[2] || '00' : undefined,
  }
}

function formatTime(parts, showSecond) {
  return showSecond ? `${parts.hour}:${parts.minute}:${parts.second}` : `${parts.hour}:${parts.minute}`
}

function timeOptions(max, step = 1) {
  const values = []
  for (let index = 0; index <= max; index += step) values.push(pad(index))
  return values
}

export default function DSTimePicker({
  value,
  defaultValue,
  placeholder = '请选择时间',
  clearable = false,
  disabled = false,
  error = false,
  showSecond = false,
  minuteStep = 1,
  secondStep = 1,
  className = '',
  onChange,
  ...props
}) {
  const pickerRef = useRef(null)
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const currentValue = value !== undefined ? value : internalValue
  const initialParts = useMemo(() => parseTime(currentValue, showSecond), [currentValue, showSecond])
  const [draft, setDraft] = useState(initialParts)

  useEffect(() => {
    if (open) setDraft(parseTime(currentValue, showSecond))
  }, [open, currentValue, showSecond])

  useEffect(() => {
    if (!open) return
    window.requestAnimationFrame(() => {
      pickerRef.current?.querySelectorAll('.ds-time-picker__column').forEach((column) => {
        column.querySelector('.ds-time-picker__option.is-selected')?.scrollIntoView({ block: 'center' })
      })
    })
  }, [open, draft])

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false)
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
  }, [open])

  const commitValue = (nextValue) => {
    if (value === undefined) setInternalValue(nextValue)
    onChange?.(nextValue)
  }

  const confirmValue = () => {
    const nextValue = formatTime(draft, showSecond)
    commitValue(nextValue)
    setOpen(false)
  }

  const clearValue = (event) => {
    event.stopPropagation()
    commitValue(undefined)
    setOpen(false)
  }

  const useNow = () => {
    const now = new Date()
    setDraft({
      hour: pad(now.getHours()),
      minute: pad(now.getMinutes()),
      second: showSecond ? pad(now.getSeconds()) : undefined,
    })
  }

  const classes = [
    'ds-time-picker',
    open && 'is-open',
    currentValue && 'has-value',
    disabled && 'is-disabled',
    error && 'is-error',
    className,
  ].filter(Boolean).join(' ')

  const columns = [
    ['hour', timeOptions(23)],
    ['minute', timeOptions(59, minuteStep)],
    ...(showSecond ? [['second', timeOptions(59, secondStep)]] : []),
  ]

  return (
    <div className={classes} ref={pickerRef} {...props}>
      <button
        className="ds-time-picker__trigger"
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className={currentValue ? 'ds-time-picker__text' : 'ds-time-picker__placeholder'}>{currentValue || placeholder}</span>
        {clearable && currentValue && !disabled && <span className="ds-time-picker__clear" role="button" tabIndex={-1} aria-label="清除" onClick={clearValue} />}
        <span className="ds-time-picker__clock" aria-hidden="true" />
      </button>
      {open && (
        <div className={['ds-time-picker__panel', showSecond && 'ds-time-picker__panel--seconds'].filter(Boolean).join(' ')}>
          <div className="ds-time-picker__columns">
            {columns.map(([key, values]) => (
              <div className="ds-time-picker__column" role="listbox" key={key}>
                {values.map((item) => (
                  <button
                    className={['ds-time-picker__option', draft[key] === item && 'is-selected'].filter(Boolean).join(' ')}
                    type="button"
                    role="option"
                    aria-selected={draft[key] === item}
                    key={item}
                    onClick={() => setDraft((current) => ({ ...current, [key]: item }))}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="ds-time-picker__footer">
            <button className="ds-time-picker__link" type="button" onClick={useNow}>此刻</button>
            <button className="ds-time-picker__confirm" type="button" onClick={confirmValue}>确定</button>
          </div>
        </div>
      )}
    </div>
  )
}
