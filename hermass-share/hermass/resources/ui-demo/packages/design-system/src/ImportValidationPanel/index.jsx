import DSTag from '../Tag'
import './index.css'

const defaultItems = [
  { row: 2, field: '姓名', message: '不能为空', level: 'error' },
  { row: 5, field: '手机号', message: '格式可能不正确', level: 'warning' },
]

const levelMap = {
  error: { label: '错误', color: 'danger' },
  warning: { label: '警告', color: 'warning' },
  success: { label: '通过', color: 'success' },
}

export default function DSImportValidationPanel({
  items = defaultItems,
  total = 0,
  passed = 0,
  failed = items.filter((item) => item.level === 'error').length,
  className = '',
}) {
  return (
    <section className={['ds-import-validation', className].filter(Boolean).join(' ')} aria-label="校验结果">
      <div className="ds-import-validation__summary">
        <div><strong>{total}</strong><span>总数据</span></div>
        <div><strong>{passed}</strong><span>通过</span></div>
        <div><strong>{failed}</strong><span>异常</span></div>
      </div>
      <div className="ds-import-validation__list">
        {items.map((item, index) => {
          const level = levelMap[item.level] || levelMap.warning
          return (
            <div className="ds-import-validation__item" key={`${item.row}-${item.field}-${index}`}>
              <DSTag color={level.color}>{level.label}</DSTag>
              <span>第 {item.row} 行</span>
              <strong>{item.field}</strong>
              <em>{item.message}</em>
            </div>
          )
        })}
      </div>
    </section>
  )
}
