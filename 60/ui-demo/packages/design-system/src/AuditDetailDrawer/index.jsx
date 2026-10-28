import DSDrawer from '../Drawer'
import DSTag from '../Tag'
import './index.css'

const defaultFields = [
  { key: 'name', label: '名称' },
  { key: 'type', label: '业务类型' },
  { key: 'department', label: '提交部门' },
  { key: 'submitter', label: '提交人' },
  { key: 'submittedAt', label: '提交时间' },
  { key: 'status', label: '审核状态', render: (value) => <DSTag color="primary">{value || '待审核'}</DSTag> },
]

export default function DSAuditDetailDrawer({
  open = false,
  title = '审核详情',
  record = {},
  fields = defaultFields,
  extra,
  footer,
  width = 560,
  onClose,
}) {
  return (
    <DSDrawer open={open} title={title} width={width} footer={footer} onClose={onClose}>
      <dl className="ds-audit-detail-drawer__list">
        {fields.map((field) => {
          const value = record[field.key]
          return (
            <div className="ds-audit-detail-drawer__item" key={field.key || field.label}>
              <dt>{field.label}</dt>
              <dd>{field.render ? field.render(value, record) : value || '-'}</dd>
            </div>
          )
        })}
      </dl>
      {extra && <div className="ds-audit-detail-drawer__extra">{extra}</div>}
    </DSDrawer>
  )
}
