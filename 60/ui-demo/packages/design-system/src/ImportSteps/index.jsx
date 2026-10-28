import './index.css'

const defaultSteps = [
  { key: 'upload', title: '上传文件', description: '选择 Excel 文件' },
  { key: 'mapping', title: '字段映射', description: '匹配导入字段' },
  { key: 'validate', title: '数据校验', description: '处理异常数据' },
  { key: 'finish', title: '导入完成', description: '查看导入结果' },
]

export default function DSImportSteps({ steps = defaultSteps, current = 0, className = '' }) {
  return (
    <ol className={['ds-import-steps', className].filter(Boolean).join(' ')}>
      {steps.map((step, index) => {
        const status = index < current ? 'is-finished' : index === current ? 'is-current' : ''
        return (
          <li className={['ds-import-steps__item', status].filter(Boolean).join(' ')} key={step.key || step.title}>
            <i>{index < current ? '✓' : index + 1}</i>
            <span>
              <strong>{step.title}</strong>
              {step.description && <em>{step.description}</em>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
