import { useEffect, useMemo, useRef, useState } from 'react'
import './index.css'

const weekLabels = ['一', '二', '三', '四', '五', '六', '日']
const monthLabels = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''))
  if (!match) return undefined
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? undefined : date
}

function getMonthDays(viewDate) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - startOffset)
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

function yearRangeStart(year) {
  return Math.floor((year - 2020) / 12) * 12 + 2020
}

export default function DSDatePicker({
  value,
  defaultValue,
  placeholder = '请选择日期',
  clearable = false,
  disabled = false,
  error = false,
  className = '',
  onChange,
  ...props
}) {
  const pickerRef = useRef(null)
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const currentValue = value !== undefined ? value : internalValue
  const selectedDate = useMemo(() => parseDate(currentValue), [currentValue])
  const [viewDate, setViewDate] = useState(selectedDate || new Date())
  const [draftValue, setDraftValue] = useState(currentValue || '')
  const [panelMode, setPanelMode] = useState('date')
  const todayValue = formatDate(new Date())

  useEffect(() => {
    if (!open) return
    setDraftValue(currentValue || '')
    setViewDate(selectedDate || new Date())
    setPanelMode('date')
  }, [open, currentValue, selectedDate])

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

  const clearValue = (event) => {
    event.stopPropagation()
    commitValue(undefined)
    setDraftValue('')
    setOpen(false)
  }

  const selectDraftDate = (date) => {
    setDraftValue(formatDate(date))
    setViewDate(date)
  }

  const useToday = () => {
    const now = new Date()
    setDraftValue(formatDate(now))
    setViewDate(now)
  }

  const confirmValue = () => {
    if (draftValue) commitValue(draftValue)
    setOpen(false)
  }

  const renderPanelBody = () => {
    if (panelMode === 'year') {
      const start = yearRangeStart(viewDate.getFullYear())
      return (
        <>
          <div className="ds-date-picker__header">
            <button className="ds-date-picker__nav" type="button" aria-label="上一组年份" onClick={() => setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1))}>«</button>
            <span className="ds-date-picker__title">{start} 年 - {start + 11} 年</span>
            <button className="ds-date-picker__nav" type="button" aria-label="下一组年份" onClick={() => setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1))}>»</button>
          </div>
          <div className="ds-date-picker__year-grid">
            {Array.from({ length: 12 }, (_, index) => start + index).map((year) => (
              <button
                className={['ds-date-picker__cell', year === viewDate.getFullYear() && 'is-selected'].filter(Boolean).join(' ')}
                type="button"
                key={year}
                onClick={() => {
                  setViewDate(new Date(year, viewDate.getMonth(), 1))
                  setPanelMode('month')
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </>
      )
    }

    if (panelMode === 'month') {
      const currentMonthValue = `${viewDate.getFullYear()}-${pad(viewDate.getMonth() + 1)}`
      return (
        <>
          <div className="ds-date-picker__header">
            <button className="ds-date-picker__nav" type="button" aria-label="上一年" onClick={() => setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1))}>«</button>
            <button className="ds-date-picker__title-button" type="button" onClick={() => setPanelMode('year')}>{viewDate.getFullYear()} 年</button>
            <button className="ds-date-picker__nav" type="button" aria-label="下一年" onClick={() => setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1))}>»</button>
          </div>
          <div className="ds-date-picker__month-grid">
            {monthLabels.map((label, index) => {
              const monthValue = `${viewDate.getFullYear()}-${pad(index + 1)}`
              return (
                <button
                  className={['ds-date-picker__cell', monthValue === currentMonthValue && 'is-selected'].filter(Boolean).join(' ')}
                  type="button"
                  key={label}
                  onClick={() => {
                    setViewDate(new Date(viewDate.getFullYear(), index, 1))
                    setPanelMode('date')
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </>
      )
    }

    return (
      <>
        <div className="ds-date-picker__header">
          <button className="ds-date-picker__nav" type="button" aria-label="上个月" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>‹</button>
          <button className="ds-date-picker__title-button" type="button" onClick={() => setPanelMode('month')}>{viewDate.getFullYear()} 年 {viewDate.getMonth() + 1} 月</button>
          <button className="ds-date-picker__nav" type="button" aria-label="下个月" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>›</button>
        </div>
        <div className="ds-date-picker__grid">
          {weekLabels.map((label) => <span className="ds-date-picker__week" key={label}>{label}</span>)}
          {days.map((date) => {
            const dateValue = formatDate(date)
            return (
              <button
                className={[
                  'ds-date-picker__day',
                  date.getMonth() !== currentMonth && 'is-muted',
                  dateValue === todayValue && 'is-today',
                  dateValue === draftValue && 'is-selected',
                ].filter(Boolean).join(' ')}
                type="button"
                key={dateValue}
                onClick={() => selectDraftDate(date)}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
        <div className="ds-date-picker__footer">
          <button className="ds-date-picker__link" type="button" onClick={useToday}>今天</button>
          <button className="ds-date-picker__confirm" type="button" onClick={confirmValue}>确定</button>
        </div>
      </>
    )
  }

  const classes = [
    'ds-date-picker',
    open && 'is-open',
    currentValue && 'has-value',
    disabled && 'is-disabled',
    error && 'is-error',
    className,
  ].filter(Boolean).join(' ')

  const days = getMonthDays(viewDate)
  const currentMonth = viewDate.getMonth()

  return (
    <div className={classes} ref={pickerRef} {...props}>
      <button
        className="ds-date-picker__trigger"
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className={currentValue ? 'ds-date-picker__text' : 'ds-date-picker__placeholder'}>{currentValue || placeholder}</span>
        {clearable && currentValue && !disabled && <span className="ds-date-picker__clear" role="button" tabIndex={-1} aria-label="清除" onClick={clearValue} />}
        <span className="ds-date-picker__calendar" aria-hidden="true" />
      </button>
      {open && (
        <div className="ds-date-picker__panel">
          {renderPanelBody()}
        </div>
      )}
    </div>
  )
}
