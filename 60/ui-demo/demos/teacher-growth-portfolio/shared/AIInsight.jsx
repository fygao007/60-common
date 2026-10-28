/**
 * AIInsight · 全站统一的 AI 洞察条组件（PRD E2）
 *
 * 传入 buildInsight(kind, ctx) 返回的 insight 对象，渲染：
 *   - 一句话结论（随底座数据变化，非写死）
 *   - 「取数依据」抽屉：用了哪些指标/模型/规则（与"数据可溯"约定一致）
 *
 * 所有诊断/看板/画像页统一挂载此组件，杜绝各页自造。
 */
import { useState } from 'react'
import { DSCard, DSTag, DSButton, DSDrawer } from '@wisedu/design-system'

const REF_LABEL = {
  engine: '引擎',
  model: '模型',
  rule: '规则',
  data: '数据',
}

export default function AIInsight({ insight, className = '' }) {
  const [open, setOpen] = useState(false)
  if (!insight) return null
  return (
    <>
      <DSCard className={`aii-card ${className}`} layout="long">
        <div className="aii-row">
          <DSTag tone="primary" size="small">AI 洞察</DSTag>
          <span className="aii-text">{insight.text}</span>
          <DSButton variant="link" size="small" onClick={() => setOpen(true)}>取数依据</DSButton>
        </div>
      </DSCard>

      <DSDrawer
        className="aii-drawer"
        open={open}
        title="AI 洞察取数依据"
        size="medium"
        onClose={() => setOpen(false)}
        footer={<DSButton variant="outline" onClick={() => setOpen(false)}>关闭</DSButton>}
      >
        <div className="aii-drawer-body">
          <div className="aii-conclusion">
            <span className="aii-conclusion-label">洞察结论</span>
            <p>{insight.text}</p>
          </div>
          <div className="aii-refs">
            <span className="aii-refs-label">结论基于</span>
            <div className="aii-refs-list">
              {(insight.refs || []).map((r, i) => (
                <div key={i} className="aii-ref-item">
                  <DSTag tone="info" size="small">{REF_LABEL[r.kind] || r.kind}</DSTag>
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="aii-note">所有结论由统一底座（computeScore / 规则引擎）算出，改一条指标权重或规则阈值，本洞察文案中的数字会同步变化。</p>
        </div>
      </DSDrawer>
    </>
  )
}
