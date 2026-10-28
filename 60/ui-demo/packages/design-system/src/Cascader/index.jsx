import { useEffect, useMemo, useRef, useState } from 'react'
import './index.css'

function findPath(options, value, path = []) {
  for (const option of options) {
    const nextPath = [...path, option]
    if (option.value === value) return nextPath
    if (option.children) {
      const matched = findPath(option.children, value, nextPath)
      if (matched.length) return matched
    }
  }

  return []
}

function flattenLeaves(options, path = []) {
  return options.flatMap((option) => {
    const nextPath = [...path, option]
    if (option.children?.length) return flattenLeaves(option.children, nextPath)
    return [{ option, path: nextPath }]
  })
}

export default function DSCascader({
  options = [],
  value,
  defaultValue,
  placeholder = '请选择',
  disabled = false,
  error = false,
  clearable = false,
  searchable = false,
  className = '',
  onChange,
  ...props
}) {
  const cascaderRef = useRef(null)
  const initialPath = useMemo(() => findPath(options, defaultValue), [options, defaultValue])
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [activePath, setActivePath] = useState(initialPath)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const currentValue = value !== undefined ? value : internalValue
  const selectedPath = useMemo(() => findPath(options, currentValue), [options, currentValue])
  const displayPath = selectedPath.length ? selectedPath : activePath
  const hasValue = selectedPath.length > 0
  const leafOptions = useMemo(() => flattenLeaves(options), [options])
  const filteredLeaves = query
    ? leafOptions.filter((item) => item.path.map((node) => node.label).join(' / ').includes(query))
    : []

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!cascaderRef.current?.contains(event.target)) setOpen(false)
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

  const commitPath = (path) => {
    const leaf = path[path.length - 1]
    if (!leaf || leaf.disabled || leaf.children?.length) return
    if (value === undefined) setInternalValue(leaf.value)
    setActivePath(path)
    setOpen(false)
    setQuery('')
    onChange?.(leaf.value, path)
  }

  const clearValue = (event) => {
    event.stopPropagation()
    if (value === undefined) setInternalValue(undefined)
    setActivePath([])
    setQuery('')
    onChange?.(undefined, [])
  }

  const getColumns = () => {
    const columns = [options]
    let currentOptions = options
    activePath.forEach((active) => {
      const current = currentOptions.find((option) => option.value === active.value)
      if (current?.children?.length) {
        columns.push(current.children)
        currentOptions = current.children
      }
    })
    return columns
  }

  const classes = [
    'ds-cascader',
    open && 'is-open',
    hasValue && 'has-value',
    disabled && 'is-disabled',
    error && 'is-error',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} ref={cascaderRef} {...props}>
      <button
        className="ds-cascader__trigger"
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className={hasValue ? 'ds-cascader__text' : 'ds-cascader__placeholder'}>
          {hasValue ? selectedPath.map((item) => item.label).join(' / ') : placeholder}
        </span>
        {clearable && hasValue && !disabled && (
          <span className="ds-cascader__clear" role="button" tabIndex={-1} aria-label="清除" onClick={clearValue} />
        )}
        <span className="ds-cascader__arrow" aria-hidden="true" />
      </button>
      {open && (
        <div className="ds-cascader__popup">
          {searchable && (
            <div className="ds-cascader__search-wrap">
              <input
                className="ds-cascader__search"
                value={query}
                placeholder="搜索选项"
                autoFocus
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          )}
          {query ? (
            <div className="ds-cascader__search-list" role="listbox">
              {filteredLeaves.map((item) => (
                <button
                  className="ds-cascader__search-option"
                  type="button"
                  key={item.option.value}
                  onClick={() => commitPath(item.path)}
                >
                  {item.path.map((node) => node.label).join(' / ')}
                </button>
              ))}
              {filteredLeaves.length === 0 && <div className="ds-cascader__empty">无匹配数据</div>}
            </div>
          ) : (
            <div className="ds-cascader__columns">
              {getColumns().map((column, columnIndex) => (
                <div className="ds-cascader__column" role="listbox" key={columnIndex}>
                  {column.map((option) => {
                    const path = [...activePath.slice(0, columnIndex), option]
                    const selected = displayPath[columnIndex]?.value === option.value
                    return (
                      <button
                        className={[
                          'ds-cascader__option',
                          selected && 'is-selected',
                          option.disabled && 'is-disabled',
                          option.children?.length && 'has-children',
                        ].filter(Boolean).join(' ')}
                        type="button"
                        disabled={option.disabled}
                        key={option.value}
                        onMouseEnter={() => !option.disabled && setActivePath(path)}
                        onClick={() => (option.children?.length ? setActivePath(path) : commitPath(path))}
                      >
                        <span>{option.label}</span>
                        {option.children?.length ? <span className="ds-cascader__option-arrow" aria-hidden="true" /> : null}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
