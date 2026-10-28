import { useEffect, useId, useRef } from 'react'
import DSButton from '../Button'
import { EDIT_OVERLAY_SPEC } from '../edit-overlay-spec.generated'
import './index.css'

const sizeMap = {
  small: 480,
  medium: EDIT_OVERLAY_SPEC.templates.singleModal.width,
  large: 800,
  wide: EDIT_OVERLAY_SPEC.templates.doubleModal.width,
}

function getFocusableElements(container) {
  if (!container) return []
  return [...container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((element) => element.offsetParent !== null)
}

export default function DSModal({
  open = false,
  title = '提示',
  description,
  titleIcon,
  children,
  footer,
  size = 'medium',
  width,
  height,
  maxHeight = 'calc(100vh - 48px)',
  okText = '确定',
  cancelText = '取消',
  okVariant = 'primary',
  danger = false,
  confirmLoading = false,
  okDisabled = false,
  cancelDisabled = false,
  showCancel = true,
  showClose = true,
  showFooter = true,
  maskClosable = true,
  keyboard = true,
  bodyPadding = 'default',
  role = 'dialog',
  onOk,
  onCancel,
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
  const dialogRef = useRef(null)
  const lastFocusedRef = useRef(null)
  const wasOpenRef = useRef(false)
  const onCancelRef = useRef(onCancel)
  const afterOpenRef = useRef(afterOpen)
  const afterCloseRef = useRef(afterClose)
  const keyboardRef = useRef(keyboard)
  const confirmLoadingRef = useRef(confirmLoading)

  onCancelRef.current = onCancel
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

    const focusable = getFocusableElements(dialogRef.current)
    ;(focusable[0] || dialogRef.current)?.focus?.()
    afterOpenRef.current?.()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && keyboardRef.current && !confirmLoadingRef.current) {
        event.preventDefault()
        onCancelRef.current?.()
        return
      }

      if (event.key !== 'Tab') return
      const elements = getFocusableElements(dialogRef.current)
      if (!elements.length) {
        event.preventDefault()
        dialogRef.current?.focus()
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
    'ds-modal',
    `ds-modal--${sizeMap[size] ? size : 'medium'}`,
    bodyPadding === 'none' && 'ds-modal--body-flush',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const overlayClasses = ['ds-modal__overlay', overlayClassName].filter(Boolean).join(' ')

  const handleMaskClick = (event) => {
    if (event.target === event.currentTarget && maskClosable && !confirmLoading) {
      onCancel?.()
    }
  }

  return (
    <div className={overlayClasses} role="presentation" onClick={handleMaskClick}>
      <section
        {...dialogProps}
        ref={dialogRef}
        className={classes}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        style={{ width: resolvedWidth, height, maxHeight }}
      >
        <header className="ds-modal__header">
          {titleIcon ? <span className="ds-modal__title-icon" aria-hidden="true">{titleIcon}</span> : null}
          <div className="ds-modal__heading">
            <h3 id={titleId}>{title}</h3>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          {showClose ? (
            <button
              className="ds-modal__close"
              type="button"
              aria-label="关闭"
              disabled={confirmLoading}
              onClick={onCancel}
            >
              <svg aria-hidden="true" viewBox="0 0 16 16">
                <path d="M7.057 8 1.862 2.805l.943-.943L8 7.057l5.195-5.195.943.943L8.943 8l5.195 5.195-.943.943L8 8.943l-5.195 5.195-.943-.943L7.057 8Z" />
              </svg>
            </button>
          ) : null}
        </header>
        <div className="ds-modal__body">{children}</div>
        {showFooter && footer !== null ? (
          <footer className="ds-modal__footer">
            {footer !== undefined ? footer : (
              <>
                {showCancel ? (
                  <DSButton
                    {...cancelButtonProps}
                    variant={cancelButtonProps.variant || 'default'}
                    disabled={cancelDisabled || confirmLoading || cancelButtonProps.disabled}
                    onClick={onCancel}
                  >
                    {cancelText}
                  </DSButton>
                ) : null}
                <DSButton
                  {...okButtonProps}
                  variant={okVariant}
                  danger={danger}
                  loading={confirmLoading}
                  disabled={okDisabled || okButtonProps.disabled}
                  onClick={onOk}
                >
                  {okText}
                </DSButton>
              </>
            )}
          </footer>
        ) : null}
      </section>
    </div>
  )
}
