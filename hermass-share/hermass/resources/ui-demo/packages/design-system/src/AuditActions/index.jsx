import DSButton from '../Button'
import './index.css'

const defaultActions = [
  { key: 'pass', label: '通过' },
  { key: 'reject', label: '不通过' },
  { key: 'return', label: '退回' },
  { key: 'detail', label: '详情' },
]

export default function DSAuditActions({ actions = defaultActions, record, onAction, className = '' }) {
  const classes = ['ds-audit-actions', className].filter(Boolean).join(' ')

  return (
    <span className={classes}>
      {actions.map((action) => {
        const disabled = typeof action.disabled === 'function' ? action.disabled(record) : action.disabled
        return (
          <DSButton
            variant="link"
            danger={action.danger}
            disabled={disabled}
            key={action.key || action.label}
            onClick={() => {
              action.onClick?.(record, action)
              onAction?.(action.key || action.label, record, action)
            }}
          >
            {action.label}
          </DSButton>
        )
      })}
    </span>
  )
}
