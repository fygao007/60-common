import './index.css'

function DefaultBackIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M4.5666184640625005 6.416479784374999H11.6669521640625V7.583146584375H4.5666184640625005L7.6956181640625 10.712146784375L6.8707852640625 11.536979684375L2.3336181640625 6.999813084375L6.8707852640625 2.462646484375L7.6956181640625 3.287479874375L4.5666184640625005 6.416479784374999Z"
        fill="currentColor"
      />
    </svg>
  )
}

function clampHeadingLevel(level) {
  const value = Number(level)
  if (!Number.isFinite(value)) return 1
  return Math.min(6, Math.max(1, Math.trunc(value)))
}

export default function DSSubPageHeader({
  title,
  backLabel = '返回',
  showBack = true,
  showDivider = showBack,
  backHref,
  backIcon,
  onBack,
  actions,
  children,
  className = '',
  titleClassName = '',
  level = 1,
  surface = true,
  backProps = {},
  ...restProps
}) {
  const HeadingTag = `h${clampHeadingLevel(level)}`
  const classes = [
    'ds-sub-page-header',
    surface && 'ds-sub-page-header--surface',
    className,
  ].filter(Boolean).join(' ')
  const iconNode = backIcon ?? <DefaultBackIcon />
  const handleBack = (event) => {
    backProps.onClick?.(event)
    if (event.defaultPrevented) return
    if (onBack) {
      onBack(event)
      return
    }
    if (!backHref && typeof window !== 'undefined') window.history.back()
  }
  const sharedBackProps = {
    ...backProps,
    className: ['ds-sub-page-header__back', backProps.className].filter(Boolean).join(' '),
    'aria-label': backProps['aria-label'] || backLabel,
    onClick: handleBack,
  }

  return (
    <header className={classes} {...restProps}>
      {showBack ? (
        backHref ? (
          <a href={backHref} {...sharedBackProps}>
            <span className="ds-sub-page-header__back-icon">{iconNode}</span>
            <span className="ds-sub-page-header__back-label">{backLabel}</span>
          </a>
        ) : (
          <button type="button" {...sharedBackProps} onClick={handleBack}>
            <span className="ds-sub-page-header__back-icon">{iconNode}</span>
            <span className="ds-sub-page-header__back-label">{backLabel}</span>
          </button>
        )
      ) : null}
      {showDivider ? <span className="ds-sub-page-header__divider" aria-hidden="true" /> : null}
      <div className="ds-sub-page-header__title-wrap">
        <HeadingTag className={['ds-sub-page-header__title', titleClassName].filter(Boolean).join(' ')} title={typeof title === 'string' ? title : undefined}>
          {title}
        </HeadingTag>
        {children ? <div className="ds-sub-page-header__content">{children}</div> : null}
      </div>
      {actions ? <div className="ds-sub-page-header__actions">{actions}</div> : null}
    </header>
  )
}
