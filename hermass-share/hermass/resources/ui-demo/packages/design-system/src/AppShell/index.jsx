import DSIconButton from '../IconButton'
import './index.css'

export default function DSAppShell({
  logo = (
    <>
      Wisedu
      <br />
      系统
    </>
  ),
  navItems = [],
  tabs = [],
  activeNav,
  activeTab,
  sectionTabs = [],
  activeSectionTab,
  onSectionTabChange,
  actions,
  children,
  className = '',
}) {
  const classes = ['ds-app-shell', 'ds-scope', className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <aside className="ds-app-shell__nav" aria-label="主导航">
        <div className="ds-app-shell__logo">{logo}</div>
        <div className="ds-app-shell__nav-list">
          {navItems.map((item) => (
            <button
              className={['ds-app-shell__nav-item', (item.key || item.label) === activeNav && 'is-active'].filter(Boolean).join(' ')}
              type="button"
              key={item.key || item.label}
            >
              {item.icon && <span className="ds-app-shell__nav-icon">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="ds-app-shell__main">
        <nav className="ds-app-shell__tabs" aria-label="顶部页签">
          {tabs.map((tab) => (
            <button
              className={['ds-app-shell__tab', (tab.key || tab.label) === activeTab && 'is-active'].filter(Boolean).join(' ')}
              type="button"
              key={tab.key || tab.label}
            >
              {tab.label}
              {tab.closable !== false && <span aria-hidden="true">×</span>}
            </button>
          ))}
          <div className="ds-app-shell__actions">
            {actions || (
              <>
                <DSIconButton icon="refresh" label="刷新" />
                <DSIconButton icon="fullscreen" label="全屏" />
              </>
            )}
          </div>
        </nav>
        <main className="ds-app-shell__content ds-page">
          {sectionTabs.length > 1 && (
            <header className="ds-app-shell__section-header">
              <div className="ds-app-shell__section-tabs" aria-label="一级页签">
                {sectionTabs.map((tab) => {
                  const key = tab.key || tab.label
                  return (
                    <button
                      className={['ds-app-shell__section-tab', key === activeSectionTab && 'is-active'].filter(Boolean).join(' ')}
                      type="button"
                      key={key}
                      onClick={() => onSectionTabChange?.(key, tab)}
                    >
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
              <div className="ds-app-shell__section-header-spacer" />
            </header>
          )}
          {children}
        </main>
      </section>
    </div>
  )
}
