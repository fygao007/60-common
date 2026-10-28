import './index.css'

export default function DSGroupTitle({
  title,
  leading,
  extra,
  children,
  level = 1,
  className = '',
  ...props
}) {
  const content = title ?? children
  const classes = ['ds-group-title', className].filter(Boolean).join(' ')

  return (
    <div className={classes} role="heading" aria-level={level} {...props}>
      <div className="ds-group-title__main">
        {leading && <span className="ds-group-title__leading">{leading}</span>}
        <span className="ds-group-title__text" title={typeof content === 'string' ? content : undefined}>
          {content}
        </span>
      </div>
      {extra && <div className="ds-group-title__extra">{extra}</div>}
    </div>
  )
}
