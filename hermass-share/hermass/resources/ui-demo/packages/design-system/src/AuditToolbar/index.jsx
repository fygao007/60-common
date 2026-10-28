import DSButton from '../Button'
import './index.css'

export default function DSAuditToolbar({
  title = '审核列表',
  total = 0,
  selectedCount = 0,
  actions,
  onExport,
  onBatchPass,
  onBatchReturn,
  className = '',
}) {
  const defaultActions = (
    <>
      <DSButton variant="default" onClick={onExport}>导出</DSButton>
      <DSButton variant="default" disabled={!selectedCount} onClick={onBatchPass}>批量通过</DSButton>
      <DSButton variant="default" disabled={!selectedCount} onClick={onBatchReturn}>批量退回</DSButton>
    </>
  )

  return (
    <div className={['ds-audit-toolbar', className].filter(Boolean).join(' ')}>
      <div className="ds-audit-toolbar__title">
        <strong>{title}</strong>
        <span>共 {total} 条记录{selectedCount ? `，已选 ${selectedCount} 条` : ''}</span>
      </div>
      <div className="ds-audit-toolbar__actions">{actions || defaultActions}</div>
    </div>
  )
}
