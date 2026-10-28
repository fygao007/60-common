import { useEffect, useRef, useState } from 'react'
import { DSTimePicker } from '@wisedu/design-system'
import './datetime-field.css'

// 日期时间选择器（单源）：DS 只有 DatePicker / TimePicker，此处组合成「下拉弹窗常驻日历 + 时间」的日期时间控件。
// 值格式统一为 `YYYY-MM-DD HH:mm`，与招聘计划/招聘种类的报名时间口径一致。

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

export default function DateTimeField({ value = '', placeholder = '请选择', onChange, disabled = false }) {
  const pickerRef = useRef(null)
  const [open, setOpen] = useState(false)

  const parts = String(value || '').split(' ')
  const parsedDate = parseDate(parts[0])
  const [viewDate, setViewDate] = useState(parsedDate || new Date())
  const [datePart, setDatePart] = useState(parts[0] && /^\d{4}-\d{2}-\d{2}$/.test(parts[0]) ? parts[0] : '')
  const [timePart, setTimePart] = useState(parts[1] && /^\d{2}:\d{2}(?::\d{2})?$/.test(parts[1]) ? parts[1].slice(0, 5) : '00:00')
  const [panelMode, setPanelMode] = useState('date')

  useEffect(() => {
    const newParts = String(value || '').split(' ')
    setDatePart(newParts[0] && /^\d{4}-\d{2}-\d{2}$/.test(newParts[0]) ? newParts[0] : '')
    setTimePart(newParts[1] && /^\d{2}:\d{2}(?::\d{2})?$/.test(newParts[1]) ? newParts[1].slice(0, 5) : '00:00')
    if (newParts[0]) {
      const p = parseDate(newParts[0])
      if (p) setViewDate(p)
    }
  }, [value])

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const useToday = () => {
    const now = new Date()
    setDatePart(formatDate(now))
    setViewDate(now)
  }

  const selectDraftDate = (date) => {
    setDatePart(formatDate(date))
    setViewDate(date)
  }

  const confirm = () => {
    if (!datePart) {
      onChange('')
    } else {
      onChange(`${datePart} ${timePart || '00:00'}`)
    }
    setOpen(false)
  }

  const clear = () => {
    onChange('')
    setOpen(false)
  }

  const days = getMonthDays(viewDate)
  const currentMonth = viewDate.getMonth()
  const todayValue = formatDate(new Date())

  const renderPanelBody = () => {
    if (panelMode === 'year') {
      const start = yearRangeStart(viewDate.getFullYear())
      return (
        <>
          <div className="ds-date-picker__header">
            <button className="ds-date-picker__nav" type="button" aria-label="上一组年份" onClick={() => setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1))}>«</button>
            <span className="ds-date-picker__title-button" onClick={() => setPanelMode('month')}>{start} 年 - {start + 11} 年</span>
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
                  dateValue === datePart && 'is-selected',
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
        </div>
      </>
    )
  }

  const classes = ['ds-date-picker', open && 'is-open', value && 'has-value', disabled && 'is-disabled'].filter(Boolean).join(' ')
  const displayText = value || placeholder

  return (
    <div className={classes} ref={pickerRef}>
      <button
        className="ds-date-picker__trigger"
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className={value ? 'ds-date-picker__text' : 'ds-date-picker__placeholder'}>
          {displayText}
        </span>
        <span className="ds-date-picker__calendar" aria-hidden />
      </button>
      {open && (
        <div className="dtf-panel">
          <div className="dtf-panel__body">
            <div className="dtf-panel__date">
              {renderPanelBody()}
            </div>
            <div className="dtf-panel__time">
              <div className="dtf-panel__time-label">时间</div>
              <DSTimePicker value={timePart} onChange={setTimePart} />
            </div>
          </div>
          <div className="dtf-panel__footer">
            <button className="ds-date-picker__link" type="button" onClick={clear}>清除</button>
            <button className="ds-date-picker__confirm" type="button" onClick={confirm}>确定</button>
          </div>
        </div>
      )}
    </div>
  )
}
