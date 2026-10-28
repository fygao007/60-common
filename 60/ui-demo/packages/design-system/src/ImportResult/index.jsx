import DSButton from '../Button'
import './index.css'

export default function DSImportResult({
  status = 'success',
  title = '导入完成',
  description = '数据已成功导入系统。',
  total = 0,
  success = 0,
  failed = 0,
  onView,
  onAgain,
  className = '',
}) {
  return (
    <section className={['ds-import-result', `ds-import-result--${status}`, className].filter(Boolean).join(' ')}>
      <div className="ds-import-result__icon" aria-hidden="true">{status === 'success' ? '✓' : '!'}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="ds-import-result__stats">
        <span>总数 <strong>{total}</strong></span>
        <span>成功 <strong>{success}</strong></span>
        <span>失败 <strong>{failed}</strong></span>
      </div>
      <footer>
        <DSButton variant="default" onClick={onAgain}>继续导入</DSButton>
        <DSButton onClick={onView}>查看数据</DSButton>
      </footer>
    </section>
  )
}
