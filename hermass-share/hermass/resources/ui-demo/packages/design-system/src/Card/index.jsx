import { useState } from 'react'
import './index.css'

function isInteractiveTarget(target) {
  return Boolean(target?.closest?.('a, button, input, select, textarea, [role="button"], [role="menuitem"]'))
}

function CardAction({ action, appearance = 'link', onDone }) {
  const {
    label,
    children,
    appearance: actionAppearance,
    danger = false,
    disabled = false,
    icon,
    onClick,
    ...buttonProps
  } = action

  return (
    <button
      className={[
        'ds-card-component__action',
        `ds-card-component__action--${actionAppearance || appearance}`,
        danger && 'ds-card-component__action--danger',
      ].filter(Boolean).join(' ')}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.(event, action)
        onDone?.()
      }}
      type="button"
      {...buttonProps}
    >
      {icon ? <span className="ds-card-component__action-icon" aria-hidden="true">{icon}</span> : null}
      <span>{label || children || '操作'}</span>
    </button>
  )
}

function CardActions({
  actions,
  actionLimit,
  appearance,
  moreLabel,
  menuOpen,
  onMenuOpenChange,
}) {
  if (!actions.length) return null

  const hasOverflow = actions.length > actionLimit
  const visibleCount = hasOverflow ? Math.max(actionLimit - 1, 0) : actions.length
  const visibleActions = actions.slice(0, visibleCount)
  const overflowActions = actions.slice(visibleCount)

  return (
    <div
      className="ds-card-component__actions"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onMenuOpenChange(false)
      }}
      role="group"
      aria-label="卡片操作"
    >
      {visibleActions.map((action, index) => (
        <CardAction
          action={action}
          appearance={appearance}
          key={action.key || action.label || index}
        />
      ))}
      {hasOverflow ? (
        <div className="ds-card-component__more">
          <button
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className={[
              'ds-card-component__more-trigger',
              `ds-card-component__action--${appearance}`,
            ].join(' ')}
            onClick={(event) => {
              event.stopPropagation()
              onMenuOpenChange(!menuOpen)
            }}
            type="button"
          >
            <span>{moreLabel}</span>
            <span aria-hidden="true">⌄</span>
          </button>
          {menuOpen ? (
            <div className="ds-card-component__menu" role="menu">
              {overflowActions.map((action, index) => (
                <CardAction
                  action={{ ...action, role: 'menuitem' }}
                  appearance={appearance}
                  key={action.key || action.label || index}
                  onDone={() => onMenuOpenChange(false)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function CardFields({ fields }) {
  if (!fields?.length) return null

  return (
    <dl className="ds-card-component__fields">
      {fields.map((field, index) => (
        <div className="ds-card-component__field" key={field.key || field.label || index}>
          <dt>{field.label}</dt>
          <dd title={field.title || (typeof field.value === 'string' ? field.value : undefined)}>
            {field.value ?? '-'}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function CardNotice({ notice }) {
  if (!notice) return null
  const config = typeof notice === 'string' ? { content: notice } : notice
  const {
    actionLabel,
    content,
    onAction,
    tone = 'warning',
  } = config

  return (
    <div className={`ds-card-component__notice ds-card-component__notice--${tone}`} role="status">
      <span className="ds-card-component__notice-icon" aria-hidden="true" />
      <span className="ds-card-component__notice-content">{content}</span>
      {actionLabel ? (
        <button
          className="ds-card-component__notice-action"
          onClick={(event) => {
            event.stopPropagation()
            onAction?.(event, config)
          }}
          type="button"
        >
          <span>{actionLabel}</span>
          <span className="ds-card-component__notice-arrow" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

export default function DSCard({
  title,
  tag,
  status,
  statusTone = 'neutral',
  extra,
  children,
  fields,
  notice,
  actions = [],
  actionLimit = 3,
  actionAppearance = 'link',
  actionsPlacement = 'footer',
  actionDisplay = 'always',
  moreLabel = '更多',
  padded = true,
  layout = 'short',
  variant = 'default',
  switchable = false,
  enabled = false,
  enabledText = '启用',
  disabledText = '停用',
  switchDisabled = false,
  onEnabledChange,
  selectable = false,
  selected = false,
  selection = 'light',
  selectedLabel = '当前选择',
  onSelect,
  media,
  image,
  imageAlt = '',
  mediaBadge,
  footer,
  disabled = false,
  className = '',
  onClick,
  onKeyDown,
  ...restProps
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const hasHeader = Boolean(title || tag || status || extra || (actionsPlacement === 'header' && actions.length) || switchable)
  const titleText = typeof title === 'string' ? title : undefined
  const statusConfig = status && typeof status === 'object' && 'label' in status
    ? status
    : { label: status, tone: statusTone }
  const selectionMode = selectable ? selection : 'none'
  const cardMedia = image
    ? <img className="ds-card-component__image" src={image} alt={imageAlt} />
    : media
  const classes = [
    'ds-card',
    'ds-card-component',
    `ds-card-component--${layout}`,
    variant !== 'default' && `ds-card-component--${variant}`,
    !hasHeader && 'ds-card-component--headerless',
    padded && 'ds-card-component--padded',
    actionDisplay === 'hover' && 'ds-card-component--hover-actions',
    switchable && 'ds-card-component--switchable',
    enabled && 'is-enabled',
    selectable && 'is-selectable',
    selected && 'is-selected',
    selectionMode !== 'none' && `ds-card-component--selection-${selectionMode}`,
    disabled && 'is-disabled',
    className,
  ].filter(Boolean).join(' ')

  const cardActions = (
    <CardActions
      actions={actions}
      actionLimit={Math.max(1, actionLimit)}
      appearance={actionAppearance}
      menuOpen={menuOpen}
      moreLabel={moreLabel}
      onMenuOpenChange={setMenuOpen}
    />
  )

  return (
    <section
      aria-checked={selectable ? selected : undefined}
      aria-disabled={disabled || undefined}
      className={classes}
      onClick={(event) => {
        onClick?.(event)
        if (!selectable || disabled || event.defaultPrevented || isInteractiveTarget(event.target)) return
        onSelect?.(!selected, event)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (!selectable || disabled || event.defaultPrevented) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect?.(!selected, event)
        }
      }}
      role={selectable ? 'checkbox' : undefined}
      tabIndex={selectable && !disabled ? 0 : undefined}
      {...restProps}
    >
      {selected && selectionMode === 'prominent' ? (
        <span className="ds-card-component__selected-label">{selectedLabel}</span>
      ) : null}
      {hasHeader ? (
        <header className="ds-card-component__header">
          <div className="ds-card-component__heading">
            {title ? (
              <strong className="ds-card-component__title" title={titleText}>
                {title}
              </strong>
            ) : null}
            {tag ? (
              <span className="ds-card-component__tag" title={typeof tag === 'string' ? tag : undefined}>
                {tag}
              </span>
            ) : null}
            {statusConfig.label ? (
              <span
                className={`ds-card-component__status ds-card-component__status--${statusConfig.tone || statusTone}`}
                title={typeof statusConfig.label === 'string' ? statusConfig.label : undefined}
              >
                {statusConfig.label}
              </span>
            ) : null}
          </div>
          <div className="ds-card-component__header-extra">
            {extra ? <div className="ds-card-component__extra">{extra}</div> : null}
            {actionsPlacement === 'header' ? cardActions : null}
            {switchable ? (
              <button
                aria-checked={enabled}
                className="ds-card-component__switch"
                disabled={switchDisabled || disabled}
                onClick={(event) => {
                  event.stopPropagation()
                  onEnabledChange?.(!enabled, event)
                }}
                role="switch"
                type="button"
              >
                <span>{enabled ? enabledText : disabledText}</span>
                <span className="ds-card-component__switch-core" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </header>
      ) : null}
      <div className="ds-card-component__body">
        {cardMedia ? (
          <div className="ds-card-component__media">
            {cardMedia}
            {mediaBadge ? <span className="ds-card-component__media-badge">{mediaBadge}</span> : null}
          </div>
        ) : null}
        <div className="ds-card-component__content">
          <CardFields fields={fields} />
          {children}
          <CardNotice notice={notice} />
        </div>
      </div>
      {(actionsPlacement === 'footer' && actions.length) || footer ? (
        <footer className="ds-card-component__footer">
          {footer ? <div className="ds-card-component__footer-content">{footer}</div> : null}
          {actionsPlacement === 'footer' ? cardActions : null}
        </footer>
      ) : null}
    </section>
  )
}
