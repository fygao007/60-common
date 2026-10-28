import { useState } from 'react'
import DSButton from '../Button'
import DSEmptyState from '../EmptyState'
import DSTag, { getProcessStatusTone } from '../Tag'
import './index.css'

const EVENT_PRESENTATION = {
  created: { title: '个人申请', status: '提交' },
  submitted: { title: '个人申请', status: '提交', timeLabel: '提交时间' },
  returned: { title: '院系领导审核', status: '退回', timeLabel: '提交时间', opinionFromLabel: true },
  published: { title: '校级审核', status: '通过' },
  withdrawn: { title: '个人申请', status: '撤回', timeLabel: '撤回时间' },
  archived: { title: '方案归档', status: '已完成' },
  superseded: { title: '版本切换', status: '已完成' },
  'analysis-failed': { title: '初次分析', status: '不通过' },
  'analysis-retry': { title: '初次分析', status: '办理完成' },
}

function stageStatus(item) {
  return item.status || EVENT_PRESENTATION[item.type]?.status || item.type || '未开始'
}

function stageTitle(item) {
  return item.title || EVENT_PRESENTATION[item.type]?.title || item.label || '流程节点'
}

function stageOpinion(item) {
  if (item.opinion) return item.opinion
  if (!EVENT_PRESENTATION[item.type]?.opinionFromLabel) return ''
  return String(item.label || '').match(/[：:]\s*(.+)$/)?.[1] || ''
}

const TONE_MARK = { success: '✓', teal: '✓', warning: '!', danger: '×' }

function nodeTone(item, current) {
  return item.tone || getProcessStatusTone(stageStatus(item)) || (current ? 'primary' : 'neutral')
}

// 流程图节点：序号/结果标记 + 环节名 + 状态圆点文字 + 可选办理信息
function FlowNode({ item, order = 1, current = false }) {
  const status = stageStatus(item)
  const tone = nodeTone(item, current)
  const opinion = stageOpinion(item)
  return (
    <article className={`ds-process-dynamics__flow-node is-${tone}${current ? ' is-current' : ''}`}>
      <span className="ds-process-dynamics__flow-mark" aria-hidden="true">{TONE_MARK[tone] || order}</span>
      <div className="ds-process-dynamics__flow-body">
        <div className="ds-process-dynamics__flow-head">
          <strong className="ds-process-dynamics__flow-title">{stageTitle(item)}</strong>
          <span className="ds-process-dynamics__flow-state"><i aria-hidden="true" />{status}</span>
        </div>
        {item.condition ? <p className="ds-process-dynamics__flow-meta">{item.condition}</p> : null}
        {item.operator ? <p className="ds-process-dynamics__flow-meta">操作人：{item.operator}</p> : null}
        {item.time || item.at ? <p className="ds-process-dynamics__flow-meta">操作时间：{item.time || item.at}</p> : null}
        {opinion ? <p className="ds-process-dynamics__flow-meta">审核意见：{opinion}</p> : null}
      </div>
    </article>
  )
}

// 分叉 / 汇聚连线：与节点行共用同一套网格列，保证支线正对节点中心
function rowTone(tones = []) {
  if (!tones.length) return 'neutral'
  if (tones.every((tone) => tone === 'success' || tone === 'teal')) return 'success'
  if (tones.includes('danger')) return 'danger'
  if (tones.some((tone) => tone === 'primary')) return 'primary'
  return 'neutral'
}

function edgeOf(index, count) {
  if (count === 1) return 'both'
  if (index === 0) return 'first'
  if (index === count - 1) return 'last'
  return 'mid'
}

function LinkSlot({ kind, tone, index, count, bar }) {
  return (
    <span className={`ds-process-dynamics__flow-slot is-${kind}`} data-tone={tone} data-edge={edgeOf(index, count)}>
      <i className="ds-process-dynamics__flow-seg" aria-hidden="true" />
      {bar ? <i className="ds-process-dynamics__flow-bar" aria-hidden="true" /> : null}
    </span>
  )
}

function FlowLink({ upperTones = [], lowerTones = [] }) {
  const upperCount = Math.max(upperTones.length, 1)
  const lowerCount = Math.max(lowerTones.length, 1)
  if (upperCount <= 1 && lowerCount <= 1) {
    return <div className="ds-process-dynamics__flow-link is-straight" data-tone={rowTone(upperTones)} aria-hidden="true" />
  }
  // 每条支线跟随自己节点的状态着色；横杆画在「列数较多」的那一行上，才能覆盖所有支线中心
  return (
    <div className="ds-process-dynamics__flow-link is-split" data-tone={rowTone(upperTones)} aria-hidden="true">
      <div className="ds-process-dynamics__flow-grid">
        {upperTones.map((tone, index) => (
          <LinkSlot kind="up" tone={tone} index={index} count={upperCount} bar={upperCount > lowerCount} key={`up-${index}`} />
        ))}
      </div>
      <div className="ds-process-dynamics__flow-grid">
        {lowerTones.map((tone, index) => (
          <LinkSlot kind="down" tone={tone} index={index} count={lowerCount} bar={upperCount <= lowerCount} key={`down-${index}`} />
        ))}
      </div>
    </div>
  )
}

function Timeline({ items, currentId }) {
  const [expanded, setExpanded] = useState(() => new Set(items
    .filter((item) => item.expanded || !['待审核', '未开始', '待提交'].includes(stageStatus(item)))
    .map((item) => item.id)))

  return (
    <ol className="ds-process-dynamics__timeline">
      {items.map((item, index) => {
        const id = item.id || `${stageTitle(item)}-${index}`
        const current = item.current || id === currentId
        const status = stageStatus(item)
        const opinion = stageOpinion(item)
        const hasDetails = Boolean(item.operator || item.time || item.at || opinion)
        const isExpanded = expanded.has(id)
        return (
          <li className={`ds-process-dynamics__event${current ? ' is-current' : ''}`} key={id}>
            <span className="ds-process-dynamics__dot" aria-hidden="true" />
            <details
              className="ds-process-dynamics__details"
              open={isExpanded}
              onToggle={(event) => {
                const next = new Set(expanded)
                if (event.currentTarget.open) next.add(id)
                else next.delete(id)
                setExpanded(next)
              }}
            >
              <summary className="ds-process-dynamics__summary">
                <strong>{stageTitle(item)}</strong>
                <DSTag className="ds-process-dynamics__status" tone={item.tone || getProcessStatusTone(status)}>{status}</DSTag>
              </summary>
              {hasDetails ? (
                <div className="ds-process-dynamics__event-body">
                  {item.operator ? <p><span>{item.operatorLabel || '操作人'}</span>{item.operator}</p> : null}
                  {item.time || item.at ? <p><span>{item.timeLabel || EVENT_PRESENTATION[item.type]?.timeLabel || '操作时间'}</span>{item.time || item.at}</p> : null}
                  {opinion ? <p><span>{item.opinionLabel || '审核意见'}</span>{opinion}</p> : null}
                </div>
              ) : null}
            </details>
          </li>
        )
      })}
    </ol>
  )
}

function FlowGraph({ rows, items, currentId }) {
  const graphRows = rows?.length ? rows : items.slice().reverse().map((item) => ({ nodes: [item] }))
  const columnCount = Math.max(1, ...graphRows.map((row) => row.nodes?.length || 0))
  const toneOf = (node) => nodeTone(node, node.current || node.id === currentId)

  return (
    <div className="ds-process-dynamics__flow" style={{ '--ds-process-columns': columnCount }}>
      {graphRows.map((row, rowIndex) => {
        const nodes = row.nodes || []
        const nextNodes = graphRows[rowIndex + 1]?.nodes || []
        return (
          <div className="ds-process-dynamics__flow-level" key={row.id || rowIndex}>
            <div className={`ds-process-dynamics__flow-row${nodes.length > 1 ? ' is-branch' : ''}`}>
              {nodes.map((node, nodeIndex) => (
                <FlowNode
                  item={node}
                  order={rowIndex + 1}
                  current={node.current || node.id === currentId}
                  key={node.id || nodeIndex}
                />
              ))}
            </div>
            {nextNodes.length ? (
              <FlowLink upperTones={nodes.map(toneOf)} lowerTones={nextNodes.map(toneOf)} />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Shared process history for embedded detail panels and table drawers.
 * `items` are ordered newest-first for timelines; `graphRows` are ordered top-to-bottom.
 */
export default function DSProcessDynamics({
  items = [],
  graphRows,
  view = 'timeline',
  currentId,
  onViewGraph,
  title = '流程动态',
  showHeader = true,
  emptyTitle = '暂无流程记录',
  emptyDescription = '当前记录尚无流程动态。',
  className = '',
}) {
  const classes = ['ds-process-dynamics', className].filter(Boolean).join(' ')
  return (
    <section className={classes} aria-label={title}>
      {showHeader ? (
        <header className="ds-process-dynamics__header">
          <h2>{title}</h2>
          {view === 'timeline' && onViewGraph ? (
            <DSButton variant="link" size="small" onClick={onViewGraph}>查看流程图</DSButton>
          ) : null}
        </header>
      ) : null}
      {!items.length ? (
        <DSEmptyState compact type="data" title={emptyTitle} description={emptyDescription} />
      ) : view === 'graph' ? (
        <FlowGraph rows={graphRows} items={items} currentId={currentId} />
      ) : (
        <Timeline items={items} currentId={currentId} />
      )}
    </section>
  )
}
