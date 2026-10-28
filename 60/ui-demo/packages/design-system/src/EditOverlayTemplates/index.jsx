import DSDrawer from '../Drawer'
import DSEditForm, { DSFormGroup } from '../EditForm'
import DSModal from '../Modal'
import { EDIT_OVERLAY_SPEC } from '../edit-overlay-spec.generated'
import './index.css'

const {
  singleModal,
  doubleModal,
  largeModal,
  wideModal,
  groupedDrawer,
} = EDIT_OVERLAY_SPEC.templates

function mergeClassName(base, className) {
  return [base, className].filter(Boolean).join(' ')
}

export function DSSingleEditModal({
  children,
  className = '',
  width: ignoredWidth,
  height: ignoredHeight,
  size: ignoredSize,
  ...props
}) {
  return (
    <DSModal
      {...props}
      className={mergeClassName('ds-single-edit-modal', className)}
      data-template-kind="single-modal"
      size="medium"
      width={singleModal.width}
      height={singleModal.height}
    >
      <DSEditForm columns={singleModal.columns}>{children}</DSEditForm>
    </DSModal>
  )
}

export function DSDoubleEditModal({
  children,
  className = '',
  width: ignoredWidth,
  height: ignoredHeight,
  size: ignoredSize,
  ...props
}) {
  return (
    <DSModal
      {...props}
      className={mergeClassName('ds-double-edit-modal', className)}
      data-template-kind="double-modal"
      size="wide"
      width={doubleModal.width}
      height={doubleModal.height}
    >
      <DSEditForm columns={doubleModal.columns}>{children}</DSEditForm>
    </DSModal>
  )
}

export function DSLargeModalTemplate({
  children,
  className = '',
  width: ignoredWidth,
  height: ignoredHeight,
  size: ignoredSize,
  ...props
}) {
  return <DSModal {...props} className={mergeClassName('ds-large-modal-template', className)} data-template-kind="large-modal" size="large" width={largeModal.width} height={largeModal.height}>{children}</DSModal>
}

export function DSWideModalTemplate({
  children,
  className = '',
  width: ignoredWidth,
  height: ignoredHeight,
  size: ignoredSize,
  ...props
}) {
  return <DSModal {...props} className={mergeClassName('ds-wide-modal-template', className)} data-template-kind="wide-modal" size="wide" width={wideModal.width} height={wideModal.height}>{children}</DSModal>
}

function renderGroups(groups) {
  return groups.map((group) => (
    <DSFormGroup
      extra={group.extra}
      key={group.key || group.title}
      level={group.level}
      title={group.title}
    >
      {group.content}
    </DSFormGroup>
  ))
}

export function DSGroupedEditDrawer({
  children,
  groups,
  className = '',
  width: ignoredWidth,
  size: ignoredSize,
  ...props
}) {
  return (
    <DSDrawer
      {...props}
      className={mergeClassName('ds-grouped-edit-drawer', className)}
      data-template-kind="grouped-drawer"
      size="medium"
      width={groupedDrawer.width}
    >
      <div className="ds-grouped-edit-drawer__groups">
        {groups ? renderGroups(groups) : children}
      </div>
    </DSDrawer>
  )
}
