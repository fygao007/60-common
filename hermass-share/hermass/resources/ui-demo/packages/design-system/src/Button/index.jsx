import './index.css'

const variantMap = {
  primary: 'ds-button--primary',
  default: 'ds-button--default',
  text: 'ds-button--text',
  ghost: 'ds-button--ghost',
  link: 'ds-button--link',
  ai: 'ds-button--ai',
}

const sizeMap = {
  small: 'ds-button--small',
  default: 'ds-button--default-size',
  large: 'ds-button--large',
}

export default function DSButton({
  variant = 'primary',
  size = 'default',
  danger = false,
  rounded = false,
  iconOnly = false,
  block = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children = '按钮',
  className = '',
  htmlType = 'button',
  ...restProps
}) {
  const classes = [
    'ds-button',
    variantMap[variant] || variantMap.primary,
    sizeMap[size] || sizeMap.default,
    danger && 'ds-button--danger',
    rounded && 'ds-button--rounded',
    iconOnly && 'ds-button--icon-only',
    block && 'ds-button--block',
    loading && 'ds-button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} type={htmlType} disabled={disabled || loading} {...restProps}>
      {loading && <span className="ds-button__spinner" aria-hidden="true" />}
      {!loading && leftIcon && <span className="ds-button__icon">{leftIcon}</span>}
      {!iconOnly && <span className="ds-button__label">{children}</span>}
      {iconOnly && !loading && (leftIcon || children)}
      {!loading && rightIcon && !iconOnly && <span className="ds-button__icon">{rightIcon}</span>}
    </button>
  )
}
