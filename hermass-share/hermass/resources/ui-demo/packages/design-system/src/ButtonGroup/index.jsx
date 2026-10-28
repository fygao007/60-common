import { Children, cloneElement, isValidElement } from 'react'
import DSButton from '../Button'
import './index.css'

export default function DSButtonGroup({
  items,
  children,
  variant = 'default',
  size = 'large',
  block = false,
  className = '',
  'aria-label': ariaLabel = '按钮组',
  ...restProps
}) {
  const groupChildren = items
    ? items.map(({ key, label, children: itemChildren, ...buttonProps }, index) => (
        <DSButton key={key || label || index} variant={variant} size={size} {...buttonProps}>
          {label || itemChildren || '按钮'}
        </DSButton>
      ))
    : children

  const classes = ['ds-button-group', block && 'ds-button-group--block', className].filter(Boolean).join(' ')

  return (
    <div className={classes} role="group" aria-label={ariaLabel} {...restProps}>
      {Children.map(groupChildren, (child) => {
        if (!isValidElement(child)) {
          return child
        }

        return cloneElement(child, {
          className: ['ds-button-group__item', child.props.className].filter(Boolean).join(' '),
          size: child.props.size || size,
          variant: child.props.variant || variant,
        })
      })}
    </div>
  )
}
