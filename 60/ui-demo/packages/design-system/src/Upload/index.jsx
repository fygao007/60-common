import { useId, useRef, useState } from 'react'
import './index.css'

const EMPTY_FILES = []

function getFileKey(file) {
  return file.uid ?? file.id ?? `${file.name}-${file.lastModified ?? file.size ?? ''}`
}

function formatFileSize(size) {
  if (!Number.isFinite(size)) return ''
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(size < 10240 ? 1 : 0)}KB`
  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

function normalizeFile(file, status) {
  return {
    uid: getFileKey(file),
    name: file.name,
    size: file.size,
    type: file.type,
    raw: file.raw ?? file,
    status: file.status ?? status,
    percent: file.percent ?? (status === 'done' ? 100 : 0),
    url: file.url,
    thumbnail: file.thumbnail,
    response: file.response,
    error: file.error,
    ...file,
  }
}

function matchesAccept(file, accept) {
  if (!accept) return true
  const fileName = file.name?.toLocaleLowerCase() ?? ''
  const fileType = file.type?.toLocaleLowerCase() ?? ''
  return accept.split(',').some((rawRule) => {
    const rule = rawRule.trim().toLocaleLowerCase()
    if (!rule) return false
    if (rule.startsWith('.')) return fileName.endsWith(rule)
    if (rule.endsWith('/*')) return fileType.startsWith(rule.slice(0, -1))
    return fileType === rule
  })
}

function UploadTrigger({
  mode,
  accept,
  multiple,
  disabled,
  uploadText,
  description,
  inputId,
  inputRef,
  dragging,
  onInputChange,
  onDragEnter,
  onDragLeave,
  onDrop,
  onPaste,
  onActivate,
}) {
  const handleKeyDown = (event) => {
    if (disabled || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    onActivate()
  }

  if (mode === 'button') {
    return (
      <div className="ds-upload__button-wrap">
        <input
          id={inputId}
          ref={inputRef}
          className="ds-upload__input"
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={onInputChange}
        />
        <label
          className="ds-upload__button"
          htmlFor={inputId}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onKeyDown={handleKeyDown}
        >
          <span className="ds-upload__button-icon" aria-hidden="true" />
          <span>{uploadText}</span>
        </label>
        {description ? <span className="ds-upload__button-description">{description}</span> : null}
      </div>
    )
  }

  return (
    <label
      className={[
        'ds-upload__dragger',
        dragging && 'is-dragging',
        disabled && 'is-disabled',
      ].filter(Boolean).join(' ')}
      htmlFor={inputId}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onDragEnter={onDragEnter}
      onDragOver={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onPaste={onPaste}
      onKeyDown={handleKeyDown}
    >
      <input
        id={inputId}
        ref={inputRef}
        className="ds-upload__input"
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={onInputChange}
      />
      <span className="ds-upload__dragger-icon" aria-hidden="true" />
      <span className="ds-upload__dragger-title">
        拖拽至此处，或点击<span>{uploadText}</span>
      </span>
      {description ? <span className="ds-upload__dragger-description">{description}</span> : null}
    </label>
  )
}

function FileActions({
  file,
  disabled,
  onPreview,
  onDownload,
  onRemove,
}) {
  if (file.status === 'uploading') {
    return (
      <button
        className="ds-upload__action ds-upload__action--remove"
        type="button"
        disabled={disabled}
        aria-label={`取消上传${file.name}`}
        onClick={() => onRemove(file, 'cancel')}
      />
    )
  }

  return (
    <span className="ds-upload__actions">
      {onPreview ? (
        <button
          className="ds-upload__action ds-upload__action--preview"
          type="button"
          disabled={disabled}
          aria-label={`预览${file.name}`}
          onClick={() => onPreview(file)}
        />
      ) : null}
      {onDownload ? (
        <button
          className="ds-upload__action ds-upload__action--download"
          type="button"
          disabled={disabled}
          aria-label={`下载${file.name}`}
          onClick={() => onDownload(file)}
        />
      ) : null}
      <button
        className="ds-upload__action ds-upload__action--remove"
        type="button"
        disabled={disabled}
        aria-label={`删除${file.name}`}
        onClick={() => onRemove(file, 'remove')}
      />
    </span>
  )
}

function TextFileList({
  files,
  disabled,
  onPreview,
  onDownload,
  onRemove,
  onRetry,
}) {
  if (!files.length) return null

  return (
    <div className="ds-upload__text-list">
      {files.map((file) => (
        <div
          className={[
            'ds-upload__text-item',
            `is-${file.status ?? 'done'}`,
          ].join(' ')}
          key={getFileKey(file)}
        >
          <div className="ds-upload__text-main">
            <span className="ds-upload__file-icon" aria-hidden="true" />
            <span className="ds-upload__file-name">{file.name}</span>
            {file.size !== undefined ? (
              <span className="ds-upload__file-size">{formatFileSize(file.size)}</span>
            ) : null}
          </div>
          {file.status === 'error' ? (
            <button
              className="ds-upload__retry"
              type="button"
              disabled={disabled}
              onClick={() => onRetry(file)}
            >
              重新上传
            </button>
          ) : (
            <FileActions
              file={file}
              disabled={disabled}
              onPreview={onPreview}
              onDownload={onDownload}
              onRemove={onRemove}
            />
          )}
          {file.status === 'uploading' ? (
            <span className="ds-upload__progress">
              <span style={{ width: `${Math.max(0, Math.min(100, file.percent ?? 0))}%` }} />
            </span>
          ) : null}
          {file.status === 'error' && file.error ? (
            <span className="ds-upload__error">{String(file.error.message ?? file.error)}</span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function PictureFileList({
  files,
  disabled,
  onPreview,
  onRemove,
  onRetry,
}) {
  if (!files.length) return null

  return (
    <div className="ds-upload__picture-list">
      {files.map((file) => (
        <article
          className={[
            'ds-upload__picture-item',
            `is-${file.status ?? 'done'}`,
          ].join(' ')}
          key={getFileKey(file)}
        >
          {file.status === 'uploading' ? (
            <div className="ds-upload__picture-progress">
              <span className="ds-upload__progress">
                <span style={{ width: `${Math.max(0, Math.min(100, file.percent ?? 0))}%` }} />
              </span>
              <button type="button" disabled={disabled} onClick={() => onRemove(file, 'cancel')}>
                取消上传
              </button>
            </div>
          ) : file.status === 'error' ? (
            <div className="ds-upload__picture-error">
              <span aria-hidden="true" />
              <button type="button" disabled={disabled} onClick={() => onRetry(file)}>重新上传</button>
            </div>
          ) : file.thumbnail || file.url ? (
            <button
              className="ds-upload__picture-preview"
              type="button"
              disabled={disabled}
              aria-label={`预览${file.name}`}
              onClick={() => onPreview?.(file)}
            >
              <img src={file.thumbnail ?? file.url} alt={file.name} />
            </button>
          ) : (
            <div className="ds-upload__picture-file">
              <span className="ds-upload__picture-file-icon" aria-hidden="true" />
              <strong title={file.name}>{file.name}</strong>
              <span>{formatFileSize(file.size)}</span>
            </div>
          )}
          {file.status !== 'uploading' ? (
            <button
              className="ds-upload__picture-remove"
              type="button"
              disabled={disabled}
              aria-label={`删除${file.name}`}
              onClick={() => onRemove(file, 'remove')}
            />
          ) : null}
        </article>
      ))}
    </div>
  )
}

export default function DSUpload({
  files,
  defaultFiles = EMPTY_FILES,
  mode = 'button',
  listType = 'text',
  draggerSize = listType === 'picture-card' ? 'compact' : 'large',
  accept,
  multiple = false,
  maxCount,
  disabled = false,
  uploadText = mode === 'button' ? '上传附件' : '上传',
  description,
  request,
  beforeUpload,
  className = '',
  onChange,
  onPreview,
  onDownload,
  onRemove,
  onRetry,
  onCancel,
  ...props
}) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [internalFiles, setInternalFiles] = useState(() => defaultFiles.map((file) => normalizeFile(file, 'done')))
  const [dragging, setDragging] = useState(false)
  const currentFiles = files !== undefined ? files : internalFiles
  const filesRef = useRef(currentFiles)
  filesRef.current = currentFiles

  const commitFiles = (nextFiles, meta) => {
    filesRef.current = nextFiles
    if (files === undefined) setInternalFiles(nextFiles)
    onChange?.(nextFiles, meta)
  }

  const updateFile = (key, patch, meta) => {
    const nextFiles = filesRef.current.map((file) => (
      getFileKey(file) === key ? { ...file, ...patch } : file
    ))
    commitFiles(nextFiles, meta)
  }

  const runRequest = async (uploadFile) => {
    if (!request) return
    const key = getFileKey(uploadFile)
    try {
      const response = await request(uploadFile.raw, {
        onProgress(percent) {
          updateFile(key, { status: 'uploading', percent }, { action: 'progress', file: uploadFile })
        },
      })
      updateFile(key, { status: 'done', percent: 100, response }, { action: 'success', file: uploadFile })
    } catch (error) {
      updateFile(key, { status: 'error', error }, { action: 'error', file: uploadFile })
    }
  }

  const addFiles = async (fileList, source) => {
    if (disabled || !fileList.length) return
    const latestFiles = filesRef.current
    const acceptedFiles = []
    for (const rawFile of fileList) {
      if (!matchesAccept(rawFile, accept)) continue
      const accepted = beforeUpload ? await beforeUpload(rawFile, latestFiles) : true
      if (accepted !== false) acceptedFiles.push(normalizeFile(rawFile, request ? 'uploading' : 'done'))
    }
    if (!acceptedFiles.length) return

    const availableCount = maxCount === undefined
      ? acceptedFiles.length
      : Math.max(0, maxCount - latestFiles.length)
    const nextAddedFiles = acceptedFiles.slice(0, availableCount)
    if (!nextAddedFiles.length) return

    const nextFiles = multiple
      ? [...latestFiles, ...nextAddedFiles]
      : [...latestFiles.slice(0, Math.max(0, (maxCount ?? 1) - 1)), nextAddedFiles[0]]
    commitFiles(nextFiles, { action: 'add', files: nextAddedFiles, source })
    nextAddedFiles.forEach(runRequest)
  }

  const handleInputChange = (event) => {
    addFiles(Array.from(event.target.files ?? EMPTY_FILES), 'select')
    event.target.value = ''
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    addFiles(Array.from(event.dataTransfer.files ?? EMPTY_FILES), 'drop')
  }

  const handlePaste = (event) => {
    const pastedFiles = Array.from(event.clipboardData.files ?? EMPTY_FILES)
    if (pastedFiles.length) {
      event.preventDefault()
      addFiles(pastedFiles, 'paste')
    }
  }

  const removeFile = async (file, action) => {
    if (disabled) return
    const allowed = onRemove ? await onRemove(file, action) : true
    if (allowed === false) return
    if (action === 'cancel') onCancel?.(file)
    commitFiles(
      filesRef.current.filter((item) => getFileKey(item) !== getFileKey(file)),
      { action, file },
    )
  }

  const retryFile = (file) => {
    onRetry?.(file)
    if (!request) return
    updateFile(getFileKey(file), { status: 'uploading', percent: 0, error: undefined }, { action: 'retry', file })
    runRequest({ ...file, status: 'uploading', percent: 0 })
  }

  const canAdd = maxCount === undefined || currentFiles.length < maxCount
  const classes = [
    'ds-upload',
    `ds-upload--${mode}`,
    `ds-upload--${listType}`,
    `ds-upload--${draggerSize}`,
    disabled && 'is-disabled',
    className,
  ].filter(Boolean).join(' ')

  return (
    <section className={classes} {...props}>
      {canAdd ? (
        <UploadTrigger
          mode={mode}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          uploadText={uploadText}
          description={description}
          inputId={inputId}
          inputRef={inputRef}
          dragging={dragging}
          onInputChange={handleInputChange}
          onDragEnter={(event) => {
            event.preventDefault()
            if (!disabled) setDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false)
          }}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onActivate={() => inputRef.current?.click()}
        />
      ) : null}
      {listType === 'picture-card' ? (
        <PictureFileList
          files={currentFiles}
          disabled={disabled}
          onPreview={onPreview}
          onRemove={removeFile}
          onRetry={retryFile}
        />
      ) : (
        <TextFileList
          files={currentFiles}
          disabled={disabled}
          onPreview={onPreview}
          onDownload={onDownload}
          onRemove={removeFile}
          onRetry={retryFile}
        />
      )}
    </section>
  )
}
