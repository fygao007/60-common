import './index.css'

export default function DSAlert({
  tone = 'info',
  title,
  children,
  action,
  className = '',
  ...props
}) {
  const classes = [
    'ds-alert',
    `ds-alert--${tone}`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <section className={classes} role="status" {...props}>
      <span className="ds-alert__icon" aria-hidden="true" />
      <div className="ds-alert__content">
        {title ? <strong className="ds-alert__title">{title}</strong> : null}
        {children ? <div className="ds-alert__description">{children}</div> : null}
      </div>
      {action ? <div className="ds-alert__action">{action}</div> : null}
    </section>
  )
}
