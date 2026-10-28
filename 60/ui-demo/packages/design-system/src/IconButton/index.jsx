import './index.css'

const iconMap = {
  refresh: (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13 7a5 5 0 1 0-1.46 3.54" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 3v4H9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  fullscreen: (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3H3v3M10 3h3v3M6 13H3v-3M10 13h3v-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3v10M3 8h10" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
}

export default function DSIconButton({
  icon = 'refresh',
  label,
  children,
  className = '',
  htmlType = 'button',
  ...restProps
}) {
  const classes = ['ds-icon-button', className].filter(Boolean).join(' ')
  const iconNode = children || iconMap[icon] || iconMap.refresh

  return (
    <button className={classes} type={htmlType} aria-label={label || icon} {...restProps}>
      {iconNode}
    </button>
  )
}
