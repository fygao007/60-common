/**
 * 人才履历图 · 共享组件（PRD E1 履历图 + AI 成长叙事）
 *
 * 数据源:engine teachers[].careerEvents(含 dimensionId→5维着色、evidenceRef 佐证);
 * AI 叙事:engine buildCareerNarrative(非写死,随数据变化),经 AITypewriter 流式呈现。
 *
 * 挂载:t-portrait 顶部、t-workbench、d-archive/hr-archive 教师详情(只读)
 * variant: 'full'(履历+叙事) | 'timeline-only'(仅履历)
 */
import { useState, useMemo } from 'react'
import { DSCard, DSTag } from '@wisedu/design-system'
import {
  teachers,
  DIMENSIONS_5,
  buildCareerNarrative,
} from './portfolio-foundation.js'
import { AITypewriter } from './ai-widgets.jsx'

const DIM_NAME = Object.fromEntries(DIMENSIONS_5.map((d) => [d.id, d]))

function nodeTypeLabel(t) {
  return ({
    entry: '入职', degree: '学历', title: '职称', practice: '实践',
    project: '项目', award: '获奖', training: '培训', certificate: '证书', course: '课程',
  })[t] || t
}

export default function CareerTimeline({ teacherId, variant = 'full', narrative = true }) {
  const [activeEvt, setActiveEvt] = useState(null)
  const teacher = useMemo(() => teachers.find((t) => t.id === teacherId), [teacherId])
  const narr = useMemo(
    () => (variant === 'full' ? buildCareerNarrative(teacherId) : null),
    [teacherId, variant]
  )
  if (!teacher) return null
  const events = [...(teacher.careerEvents || [])].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="ct-wrap" data-variant={variant}>
      {/* 履历时间轴 */}
      <div className="ct-timeline">
        <div className="ct-spine" />
        {events.map((evt, i) => {
          const dim = DIM_NAME[evt.dimensionId] || { name: '其他', id: evt.dimensionId }
          const isActive = activeEvt?.date === evt.date && activeEvt?.title === evt.title
          return (
            <div
              key={i}
              className={`ct-node ct-dim-${dim.id} ${isActive ? 'is-active' : ''}`}
              onClick={() => setActiveEvt(isActive ? null : evt)}
            >
              <span className="ct-dot" title={dim.name} />
              <div className="ct-node__card">
                <div className="ct-node__head">
                  <span className="ct-node__date">{evt.date}</span>
                  <DSTag tone="muted" size="small">{nodeTypeLabel(evt.type)}</DSTag>
                </div>
                <div className="ct-node__title">{evt.title}</div>
                <span className="ct-node__dim">{dim.name}维度</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 节点佐证抽屉(点击展开) */}
      {activeEvt && (
        <div className="ct-evidence">
          <div className="ct-evidence__head">
            <strong>{activeEvt.title}</strong>
            <DSTag tone="primary" size="small">{activeEvt.date}</DSTag>
          </div>
          <div className="ct-evidence__row">
            <span className="ct-evidence__label">数据血液</span>
            <span>{activeEvt.evidenceRef || '无关联佐证'}</span>
          </div>
          <div className="ct-evidence__row">
            <span className="ct-evidence__label">关联维度</span>
            <span>{DIM_NAME[activeEvt.dimensionId]?.name || activeEvt.dimensionId}</span>
          </div>
        </div>
      )}

      {/* AI 成长叙事(随 careerEvents/评分变化) */}
      {narrative && narr && (
        <div className="ct-narrative">
          <div className="ct-narrative__head">
            <DSTag tone="primary" size="small">AI 成长叙事</DSTag>
            <span className="ct-narrative__note">基于履历节点 + 评分引擎生成</span>
          </div>
          <AITypewriter text={narr.text} speed={22} delay={400} />
        </div>
      )}
    </div>
  )
}
