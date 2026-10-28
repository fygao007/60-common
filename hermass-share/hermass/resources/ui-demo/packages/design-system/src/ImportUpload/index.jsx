import DSButton from '../Button'
import './index.css'

export default function DSImportUpload({
  title = '拖拽文件到此处，或点击上传',
  description = '支持 .xlsx / .xls 文件，单个文件不超过 20MB。',
  file,
  accept = '.xlsx,.xls',
  templateText = '下载导入模板',
  onTemplateDownload,
  onChange,
  className = '',
}) {
  return (
    <section className={['ds-import-upload', className].filter(Boolean).join(' ')} aria-label="上传文件">
      <div className="ds-import-upload__drop">
        <input type="file" accept={accept} aria-label="上传文件" onChange={onChange} />
        <div className="ds-import-upload__icon" aria-hidden="true">↑</div>
        <strong>{file?.name || title}</strong>
        <span>{file ? `${file.size || '-'} · 已选择` : description}</span>
      </div>
      <div className="ds-import-upload__tips">
        <div>
          <strong>导入说明</strong>
          <span>请先下载模板并按字段要求维护数据，系统会在下一步自动识别表头。</span>
        </div>
        <DSButton variant="default" onClick={onTemplateDownload}>{templateText}</DSButton>
      </div>
    </section>
  )
}
