import DSLinkButton from '../LinkButton'
import './index.css'

export default function DSLinkButtonGroup({
  items,
  children,
  className = '',
  'aria-label': ariaLabel = '链接按钮组',
  ...restProps
}) {
  const classes = ['ds-link-button-group', className].filter(Boolean).join(' ')
  const groupChildren = items
    ? items.map(({ key, label, children: itemChildren, ...buttonProps }, index) => (
        <DSLinkButton key={key || label || index} {...buttonProps}>
          {label || itemChildren || '链接'}
        </DSLinkButton>
      ))
    : children

  return (
    <div className={classes} role="group" aria-label={ariaLabel} {...restProps}>
      {groupChildren}
    </div>
  )
}
