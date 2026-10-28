import { useEffect, useId, useRef } from 'react'
import DSButton from '../Button'
import { EDIT_OVERLAY_SPEC } from '../edit-overlay-spec.generated'
import './index.css'

const sizeMap = {
  medium: EDIT_OVERLAY_SPEC.templates.groupedDrawer.width,
  large: 900,
}

function getFocusableElements(container) {
  if (!container) return []
  return [...container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])'
  )].filter((element) => element.offsetParent !== null)
}

export default function DSDrawer({
  open = false,
  title = '详情',
  description,
  children,
  footer,
  size = 'medium',
  width,
  placement = 'right',
  okText = '确定',
  cancelText = '取消',
  confirmLoading = false,
  okDisabled = false,
  cancelDisabled = false,
  showCancel = true,
  showClose = true,
  showFooter = true,
  maskClosable = true,
  keyboard = true,
  bodyPadding = 'default',
  onOk,
  onClose,
  afterOpen,
  afterClose,
  okButtonProps = {},
  cancelButtonProps = {},
  overlayClassName = '',
  className = '',
  ...dialogProps
}) {
  const titleId = useId()
  const descriptionId = useId()
  const drawerRef = useRef(null)
  const lastFocusedRef = useRef(null)
  const wasOpenRef = useRef(false)
  const onCloseRef = useRef(onClose)
  const afterOpenRef = useRef(afterOpen)
  const afterCloseRef = useRef(afterClose)
  const keyboardRef = useRef(keyboard)
  const confirmLoadingRef = useRef(confirmLoading)

  onCloseRef.current = onClose
  afterOpenRef.current = afterOpen
  afterCloseRef.current = afterClose
  keyboardRef.current = keyboard
  confirmLoadingRef.current = confirmLoading

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        lastFocusedRef.current?.focus?.()
        afterCloseRef.current?.()
      }
      wasOpenRef.current = false
      return undefined
    }

    wasOpenRef.current = true
    lastFocusedRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusable = getFocusableElements(drawerRef.current)
    ;(focusable[0] || drawerRef.current)?.focus?.()
    afterOpenRef.current?.()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && keyboardRef.current && !confirmLoadingRef.current) {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }

      if (event.key !== 'Tab') return
      const elements = getFocusableElements(drawerRef.current)
      if (!elements.length) {
        event.preventDefault()
        drawerRef.current?.focus()
        return
      }
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  const resolvedWidth = width ?? sizeMap[size] ?? sizeMap.medium
  const classes = [
    'ds-drawer',
    `ds-drawer--${placement}`,
    `ds-drawer--${sizeMap[size] ? size : 'medium'}`,
    bodyPadding === 'none' && 'ds-drawer--body-flush',
    className,
  ].filter(Boolean).join(' ')
  const overlayClasses = ['ds-drawer__overlay', overlayClassName].filter(Boolean).join(' ')
  const hasDefaultEditFooter = typeof onOk === 'function'
  const shouldRenderFooter = showFooter && footer !== null

  const handleMaskClick = (event) => {
    if (event.target === event.currentTarget && maskClosable && !confirmLoading) {
      onClose?.()
    }
  }

  return (
    <div className={overlayClasses} role="presentation" onClick={handleMaskClick}>
      <aside
        {...dialogProps}
        ref={drawerRef}
        className={classes}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        style={{ width: resolvedWidth }}
      >
        <header className="ds-drawer__header">
          <div className="ds-drawer__heading">
            <h3 id={titleId}>{title}</h3>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          {showClose ? (
            <button
              className="ds-drawer__close"
              type="button"
              aria-label="关闭"
              disabled={confirmLoading}
              onClick={onClose}
            >
              <svg aria-hidden="true" viewBox="0 0 16 16">
                <path d="M7.057 8 1.862 2.805l.943-.943L8 7.057l5.195-5.195.943.943L8.943 8l5.195 5.195-.943.943L8 8.943l-5.195 5.195-.943-.943L7.057 8Z" />
              </svg>
            </button>
          ) : null}
        </header>
        <div className="ds-drawer__body">{children}</div>
        {shouldRenderFooter ? (
          <footer className="ds-drawer__footer">
            {footer !== undefined ? footer : hasDefaultEditFooter ? (
              <>
                {showCancel ? (
                  <DSButton
                    {...cancelButtonProps}
                    variant={cancelButtonProps.variant || 'default'}
                    disabled={cancelDisabled || confirmLoading || cancelButtonProps.disabled}
                    onClick={onClose}
                  >
                    {cancelText}
                  </DSButton>
                ) : null}
                <DSButton
                  {...okButtonProps}
                  variant={okButtonProps.variant || 'primary'}
                  loading={confirmLoading}
                  disabled={okDisabled || okButtonProps.disabled}
                  onClick={onOk}
                >
                  {okText}
                </DSButton>
              </>
            ) : (
              <DSButton variant="default" disabled={confirmLoading} onClick={onClose}>
                关闭
              </DSButton>
            )}
          </footer>
        ) : null}
      </aside>
    </div>
  )
}
