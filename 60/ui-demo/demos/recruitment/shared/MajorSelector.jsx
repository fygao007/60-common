import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { DSEditField, DSInput, DSLinkButton, DSTag } from '@wisedu/design-system'

/**
 * 结构化专业选择器
 * - 三层级: 学科门类 → 学科 → 专业
 * - 支持代码/名称/旧名称搜索
 * - 支持多选专业及选择专业大类
 * - 已选项显示"专业名称(代码)"
 * - 本科/研究生/大专分别保存
 * - 支持年度/启用状态/旧代码提醒
 */
export default function MajorSelector({ value = [], onChange, level = 'undergraduate', error, disabled, showCatalogYear = true }) {
  const MOCK = (typeof window !== 'undefined' && window.RecruitmentMock) || {}
  const catalog = MOCK.MAJOR_CATALOG?.[level]
  const categories = catalog?.categories || []
  const catalogYear = catalog?.year || '2026'
  const catalogEnabled = catalog?.enabled !== false

  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDiscipline, setSelectedDiscipline] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const wrapperRef = useRef(null)

  // 扁平化所有专业(用于搜索)
  const allMajors = useMemo(() => {
    const list = []
    categories.forEach(cat => {
      cat.disciplines.forEach(disc => {
        disc.majors.forEach(major => {
          list.push({ ...major, categoryName: cat.name, disciplineName: disc.name })
        })
      })
    })
    return list
  }, [categories])

  // 搜索过滤
  const filteredMajors = useMemo(() => {
    if (!searchText.trim()) return []
    const kw = searchText.trim().toLowerCase()
    return allMajors.filter(m =>
      m.code.toLowerCase().includes(kw) ||
      m.name.toLowerCase().includes(kw) ||
      (m.oldNames || []).some(n => n.toLowerCase().includes(kw))
    )
  }, [allMajors, searchText])

  // 当前学科下的专业
  const currentDisciplineMajors = useMemo(() => {
    if (!selectedCategory || !selectedDiscipline) return []
    const cat = categories.find(c => c.code === selectedCategory)
    if (!cat) return []
    const disc = cat.disciplines.find(d => d.code === selectedDiscipline)
    return disc?.majors || []
  }, [categories, selectedCategory, selectedDiscipline])

  // 当前学科选项
  const disciplineOptions = useMemo(() => {
    if (!selectedCategory) return []
    const cat = categories.find(c => c.code === selectedCategory)
    return cat?.disciplines || []
  }, [categories, selectedCategory])

  // 已选专业代码集合
  const selectedCodes = useMemo(() => new Set(value.map(v => v.code)), [value])

  // 选择/取消专业
  const toggleMajor = useCallback((major) => {
    if (disabled) return
    const newVal = selectedCodes.has(major.code)
      ? value.filter(v => v.code !== major.code)
      : [...value, { code: major.code, name: major.name }]
    onChange(newVal)
  }, [value, selectedCodes, onChange, disabled])

  // 选择整个学科
  const selectDiscipline = useCallback(() => {
    if (disabled || !selectedCategory || !selectedDiscipline) return
    const cat = categories.find(c => c.code === selectedCategory)
    const disc = cat?.disciplines.find(d => d.code === selectedDiscipline)
    if (!disc) return
    const newItems = disc.majors
      .filter(m => !selectedCodes.has(m.code))
      .map(m => ({ code: m.code, name: m.name }))
    onChange([...value, ...newItems])
  }, [categories, selectedCategory, selectedDiscipline, value, selectedCodes, onChange, disabled])

  // 删除单项
  const removeMajor = useCallback((code) => {
    if (disabled) return
    onChange(value.filter(v => v.code !== code))
  }, [value, onChange, disabled])

  // 点击外部关闭
  useEffect(() => {
    if (!dropdownOpen) return
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  const categoryOptions = categories.map(c => ({ value: c.code, label: c.name }))
  const discOptions = disciplineOptions.map(d => ({ value: d.code, label: d.name }))

  // 导出文本
  const displayText = value.map(v => `${v.name}(${v.code})`).join('；') || ''

  const levelLabel = {
    undergraduate: '本科',
    postgraduate: '研究生',
    college: '大专'
  }[level] || '专业'

  return (
    <div className="major-selector" ref={wrapperRef}>
      {/* 年度和启用状态提示 */}
      {showCatalogYear ? (
        <div className="major-selector__meta">
          <span className="major-selector__year">专业目录年度：{catalogYear}</span>
          {!catalogEnabled && <span className="major-selector__disabled-hint">（已停用）</span>}
        </div>
      ) : null}

      <div className={`major-selector__input ${disabled ? 'is-disabled' : ''}`} onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}>
        <div className="major-selector__tags">
          {value.length === 0 && <span className="major-selector__placeholder">请选择{levelLabel}专业(支持代码/名称搜索)</span>}
          {value.map(v => (
            <DSTag key={v.code} tone="primary" className="major-selector__tag">
              {v.name}({v.code})
              {!disabled && (
                <DSLinkButton className="major-selector__tag-remove" onClick={(e) => { e.stopPropagation(); removeMajor(v.code) }}>×</DSLinkButton>
              )}
            </DSTag>
          ))}
        </div>
        <DSLinkButton className="major-selector__toggle" onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}>⌄</DSLinkButton>
      </div>
      {error && <span className="major-selector__error">{error}</span>}
      {dropdownOpen && (
        <div className="major-selector__dropdown">
          <div className="major-selector__search">
            <DSInput
              value={searchText}
              placeholder="输入代码、专业名称或旧专业名称搜索"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          {searchText.trim() ? (
            <div className="major-selector__results">
              {filteredMajors.length === 0 ? <span className="major-selector__empty">无匹配专业</span> : null}
              {filteredMajors.slice(0, 20).map(major => (
                <div
                  key={major.code}
                  className={`major-selector__item ${selectedCodes.has(major.code) ? 'is-selected' : ''}`}
                  onClick={() => toggleMajor(major)}
                >
                  <span className="major-selector__item-name">{major.name}({major.code})</span>
                  <span className="major-selector__item-path">{major.categoryName} / {major.disciplineName}</span>
                  {major.oldNames && major.oldNames.length > 0 && (
                    <span className="major-selector__item-old" title="该专业有旧名称，搜索时也可使用旧名称匹配">
                      ⓘ 旧称: {major.oldNames.join('、')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="major-selector__cascade">
              <div className="major-selector__column">
                <div className="major-selector__column-title">学科门类</div>
                {categoryOptions.map(c => (
                  <div
                    key={c.value}
                    className={`major-selector__column-item ${selectedCategory === c.value ? 'is-active' : ''}`}
                    onClick={() => { setSelectedCategory(c.value); setSelectedDiscipline('') }}
                  >{c.label}</div>
                ))}
              </div>
              <div className="major-selector__column">
                <div className="major-selector__column-title">学科</div>
                {discOptions.map(d => (
                  <div
                    key={d.value}
                    className={`major-selector__column-item ${selectedDiscipline === d.value ? 'is-active' : ''}`}
                    onClick={() => setSelectedDiscipline(d.value)}
                  >{d.label}</div>
                ))}
              </div>
              <div className="major-selector__column major-selector__column--wide">
                <div className="major-selector__column-title">
                  专业
                  {selectedDiscipline ? <DSLinkButton className="major-selector__select-all" onClick={selectDiscipline}>全选本学科</DSLinkButton> : null}
                </div>
                {currentDisciplineMajors.map(major => (
                  <div
                    key={major.code}
                    className={`major-selector__item ${selectedCodes.has(major.code) ? 'is-selected' : ''}`}
                    onClick={() => toggleMajor(major)}
                  >
                    <span className="major-selector__item-name">{major.name}({major.code})</span>
                    {major.oldNames && major.oldNames.length > 0 && (
                      <span className="major-selector__item-old" title="该专业有旧名称，搜索时也可使用旧名称匹配">
                        ⓘ 旧称: {major.oldNames.join('、')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {displayText && !dropdownOpen && <div className="major-selector__summary">{displayText}</div>}
    </div>
  )
}

/**
 * 将专业数组格式化为规范文本
 * @param {Array<{code: string, name: string}>} majors - 专业数组
 * @returns {string} 格式化后的文本，如"电子信息工程(B080701)、通信工程(B080703)"
 */
export function formatMajorsText(majors) {
  if (!majors || majors.length === 0) return '-'
  return majors.map(m => `${m.name}(${m.code})`).join('、')
}
