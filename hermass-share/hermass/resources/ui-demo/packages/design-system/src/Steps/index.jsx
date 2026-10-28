import './index.css'

const defaultItems = [
  { key: 'base', title: '基础信息', description: '填写基础资料' },
  { key: 'material', title: '材料上传', description: '上传附件材料' },
  { key: 'confirm', title: '信息确认', description: '确认提交内容' },
  { key: 'finish', title: '完成', description: '查看处理结果' },
]

function getStatus(index, current, status) {
  if (index < current) return 'finish'
  if (index === current) return status
  return 'wait'
}

export default function DSSteps({
  items = defaultItems,
  current = 0,
  status = 'process',
  direction = 'horizontal',
  size = 'default',
  variant = 'default',
  clickable = false,
  onChange,
  className = '',
}) {
  const classes = [
    'ds-steps',
    `ds-steps--${direction}`,
    size === 'small' && 'ds-steps--small',
    variant === 'dot' && 'ds-steps--dot',
    clickable && 'is-clickable',
    className,
  ].filter(Boolean).join(' ')

  return (
    <ol className={classes}>
      {items.map((item, index) => {
        const itemStatus = item.status || getStatus(index, current, status)
        const itemClasses = ['ds-steps__item', `is-${itemStatus}`].filter(Boolean).join(' ')
        const canClick = clickable && !item.disabled

        return (
          <li className={itemClasses} key={item.key || item.title || index}>
            <button
              className="ds-steps__node"
              type="button"
              disabled={!canClick}
              aria-current={index === current ? 'step' : undefined}
              onClick={() => canClick && onChange?.(index, item)}
            >
              <span className="ds-steps__icon" aria-hidden="true">
                {variant === 'dot' ? '' : itemStatus === 'finish' ? '✓' : itemStatus === 'error' ? '!' : index + 1}
              </span>
              <span className="ds-steps__content">
                <strong>{item.title}</strong>
                {item.description && <em>{item.description}</em>}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
