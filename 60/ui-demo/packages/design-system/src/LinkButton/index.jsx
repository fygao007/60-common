import DSButton from '../Button'
import './index.css'

export default function DSLinkButton({
  danger = false,
  disabled = false,
  loading = false,
  children = '链接',
  className = '',
  ...restProps
}) {
  const classes = ['ds-link-button', className].filter(Boolean).join(' ')

  return (
    <DSButton
      variant="link"
      danger={danger}
      disabled={disabled}
      loading={loading}
      className={classes}
      {...restProps}
    >
      {children}
    </DSButton>
  )
}
