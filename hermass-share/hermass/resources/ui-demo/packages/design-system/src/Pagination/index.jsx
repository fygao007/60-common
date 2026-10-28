import { useState, useEffect } from 'react'
import './index.css'

export default function DSPagination({
  total = 0,
  totalPages,
  current = 1,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  className = '',
  onChange,
  onPageSizeChange,
}) {
  const [innerCurrent, setInnerCurrent] = useState(current)
  const [innerPageSize, setInnerPageSize] = useState(pageSize)

  useEffect(() => setInnerCurrent(current), [current])
  useEffect(() => setInnerPageSize(pageSize), [pageSize])

  const safeTotalPages = Math.max(1, totalPages ?? (Math.ceil(total / innerPageSize) || 1))

  const go = (page) => {
    const next = Math.max(1, Math.min(page, safeTotalPages))
    if (next === innerCurrent) return
    setInnerCurrent(next)
    onChange?.(next, innerPageSize)
  }

  const handleSizeChange = (size) => {
    const nextSize = Number(size)
    setInnerPageSize(nextSize)
    onPageSizeChange?.(nextSize)
    const newTotalPages = Math.max(1, Math.ceil(total / nextSize) || 1)
    const nextCurrent = innerCurrent > newTotalPages ? newTotalPages : innerCurrent
    if (nextCurrent !== innerCurrent) setInnerCurrent(nextCurrent)
    onChange?.(nextCurrent, nextSize)
  }

  const classes = ['ds-pagination', className].filter(Boolean).join(' ')

  return (
    <footer className={classes}>
      <span>共 {total} 条</span>
      <span>共 {safeTotalPages} 页</span>
      <button
        className="ds-link-button"
        type="button"
        disabled={innerCurrent <= 1}
        onClick={() => go(innerCurrent - 1)}
      >上一页</button>
      <strong className="ds-pagination__current">{innerCurrent}</strong>
      <button
        className="ds-link-button"
        type="button"
        disabled={innerCurrent >= safeTotalPages}
        onClick={() => go(innerCurrent + 1)}
      >下一页</button>
      <label className="ds-pagination__jump">
        跳至
        <input
          className="ds-input"
          value={innerCurrent}
          onChange={(e) => go(Number(e.target.value))}
          onKeyDown={(e) => { if (e.key === 'Enter') go(Number(e.target.value)) }}
        />
        页
      </label>
      <select
        className="ds-select"
        value={innerPageSize}
        onChange={(e) => handleSizeChange(e.target.value)}
      >
        {pageSizeOptions.map((option) => (
          <option value={option} key={option}>{option} 条/页</option>
        ))}
      </select>
    </footer>
  )
}
