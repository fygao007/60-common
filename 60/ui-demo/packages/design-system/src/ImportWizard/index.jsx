import DSButton from '../Button'
import DSImportMappingTable from '../ImportMappingTable'
import DSImportResult from '../ImportResult'
import DSImportSteps from '../ImportSteps'
import DSImportUpload from '../ImportUpload'
import DSImportValidationPanel from '../ImportValidationPanel'
import './index.css'

const defaultSteps = [
  { title: '上传文件', description: '选择方案 Excel 模板' },
  { title: '字段映射', description: '匹配分组与条款字段' },
  { title: '数据校验', description: '校验通过后生成方案' },
  { title: '导入完成', description: '查看导入结果' },
]

export default function DSImportWizard({
  title = '智能导入',
  steps = defaultSteps,
  current = 0,
  file,
  mappingRows,
  mappingOptions,
  validationItems,
  result,
  onFileChange,
  onTemplateDownload,
  onMappingChange,
  onPrevious,
  onNext,
  onCancel,
  footer,
  className = '',
}) {
  const classes = ['ds-import-wizard', 'ds-card', className].filter(Boolean).join(' ')
  const isFirst = current === 0
  const isLast = current >= steps.length - 1

  const renderContent = () => {
    if (current === 0) {
      return <DSImportUpload file={file} onChange={onFileChange} onTemplateDownload={onTemplateDownload} />
    }

    if (current === 1) {
      return <DSImportMappingTable rows={mappingRows} targetOptions={mappingOptions} onChange={onMappingChange} />
    }

    if (current === 2) {
      return <DSImportValidationPanel items={validationItems} {...result?.validation} />
    }

    return <DSImportResult {...result} />
  }

  return (
    <section className={classes} aria-label={title}>
      <header className="ds-import-wizard__header">
        <h3>{title}</h3>
        <span>{steps.length} 步完成</span>
      </header>
      <DSImportSteps steps={steps} current={current} />
      {renderContent()}
      <footer className="ds-import-wizard__footer">
        {footer || (
          <>
            <DSButton variant="default" onClick={isFirst ? onCancel : onPrevious}>{isFirst ? '取消' : '上一步'}</DSButton>
            {!isLast && <DSButton onClick={onNext}>下一步</DSButton>}
          </>
        )}
      </footer>
    </section>
  )
}
