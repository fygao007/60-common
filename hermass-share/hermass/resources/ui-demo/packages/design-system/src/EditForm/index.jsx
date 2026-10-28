import DSGroupTitle from '../GroupTitle'
import './index.css'

export default function DSEditForm({
  columns = 1,
  children,
  className = '',
  ...props
}) {
  const resolvedColumns = Number(columns) === 2 ? 2 : 1
  const classes = [
    'ds-edit-form',
    `ds-edit-form--${resolvedColumns}-column`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} {...props}>
      <div className="ds-edit-form__grid">{children}</div>
    </div>
  )
}

export function DSEditField({
  label,
  required = false,
  help,
  error,
  fullWidth = false,
  align = 'center',
  htmlFor,
  children,
  className = '',
  ...props
}) {
  const classes = [
    'ds-edit-field',
    fullWidth && 'ds-edit-field--full',
    align === 'start' && 'ds-edit-field--start',
    error && 'ds-edit-field--error',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} {...props}>
      <label className="ds-edit-field__label" htmlFor={htmlFor}>
        {required ? <b aria-hidden="true">*</b> : null}
        <span>{label}</span>
      </label>
      <div className="ds-edit-field__content">
        {children}
        {error || help ? (
          <span className="ds-edit-field__message">{error || help}</span>
        ) : null}
      </div>
    </div>
  )
}

export function DSFormGroup({
  title,
  extra,
  children,
  level = 2,
  className = '',
  ...props
}) {
  return (
    <section className={['ds-form-group', className].filter(Boolean).join(' ')} {...props}>
      <DSGroupTitle title={title} extra={extra} level={level} />
      <div className="ds-form-group__content">{children}</div>
    </section>
  )
}
