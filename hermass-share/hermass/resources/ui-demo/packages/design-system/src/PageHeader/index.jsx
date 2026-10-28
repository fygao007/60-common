import './index.css'

export default function DSPageHeader({ title, description, actions, children, className = '' }) {
  return (
    <header className={['ds-page-header', className].filter(Boolean).join(' ')}>
      <div className="ds-page-header__main">
        <div>
          {title && <h1 className="ds-page-title">{title}</h1>}
          {description && <p className="ds-page-desc">{description}</p>}
        </div>
        {actions && <div className="ds-page-header__actions">{actions}</div>}
      </div>
      {children && <div className="ds-page-header__extra">{children}</div>}
    </header>
  )
}
