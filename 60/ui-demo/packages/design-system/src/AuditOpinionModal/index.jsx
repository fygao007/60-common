import DSField, { DSTextarea } from '../Field'
import DSModal from '../Modal'
import './index.css'

const titleMap = {
  pass: '审核通过',
  reject: '审核不通过',
  return: '退回修改',
}

export default function DSAuditOpinionModal({
  open = false,
  type = 'pass',
  title,
  record,
  opinionLabel = '审核意见',
  opinionPlaceholder = '请输入审核意见',
  opinionRequired = type !== 'pass',
  // 受控意见：审核意见需要参与"退回必须填写意见"这类校验时，业务侧必须能读到输入值，
  // 因此提供 opinion / onOpinionChange；两者都省略时保持原生非受控行为。
  opinion,
  onOpinionChange,
  opinionRows = 4,
  size,
  okText = '提交',
  cancelText = '取消',
  okDisabled = false,
  children,
  onOk,
  onCancel,
}) {
  const opinionControlled = typeof onOpinionChange === 'function'
  return (
    <DSModal
      open={open}
      title={title || titleMap[type] || '审核处理'}
      size={size}
      okText={okText}
      cancelText={cancelText}
      okDisabled={okDisabled}
      onOk={onOk}
      onCancel={onCancel}
      className="ds-audit-opinion-modal"
    >
      {record && (
        <div className="ds-audit-opinion-modal__summary">
          <span>审核对象</span>
          <strong>{record.name || record.title || record.auditTitle || '-'}</strong>
        </div>
      )}
      {children}
      <DSField label={opinionLabel} required={opinionRequired}>
        <DSTextarea
          placeholder={opinionPlaceholder}
          rows={opinionRows}
          {...(opinionControlled
            ? { value: opinion ?? '', onChange: (event) => onOpinionChange(event?.target?.value ?? '') }
            : {})}
        />
      </DSField>
    </DSModal>
  )
}
