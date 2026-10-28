/**
 * AI 通用组件 · 打字机 / 草稿标 / 置信度条（PRD E 统一 AI 视觉标记）
 * 所有"拟真 AI 产物"(成长报告、问答、发展建议、抽取候选)统一走这些组件,
 * 杜绝各页自造打字机/草稿标/置信度条的内联实现。
 *
 * 拟真约定:不接真 LLM。文本由调用方(引擎/页面模板)生成,组件只负责呈现。
 */
import { useState, useEffect, useRef } from 'react'
import { DSTag } from '@wisedu/design-system'

/**
 * 流式打字机:逐字显示 text,完成后保留光标闪烁。
 * @param {string}  text     要显示的完整文本
 * @param {number}  speed    每字毫秒(默认 28)
 * @param {boolean} done     外部强制完成(跳过动画)
 * @param {number}  delay    开始前延迟毫秒(模拟"思考")
 */
export function AITypewriter({ text = '', speed = 28, done = false, delay = 300, className = '' }) {
  const [shown, setShown] = useState('')
  const [started, setStarted] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    let startTimer
    if (delay > 0) {
      startTimer = setTimeout(() => setStarted(true), delay)
    } else {
      setStarted(true)
    }
    return () => { clearTimeout(startTimer); clearInterval(timer.current) }
  }, [delay])

  useEffect(() => {
    if (!started) return
    if (done) { setShown(text); clearInterval(timer.current); return }
    clearInterval(timer.current)
    let i = Math.min(shown.length, text.length)
    timer.current = setInterval(() => {
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(timer.current)
    }, speed)
    return () => clearInterval(timer.current)
    // text 变化才重跑动画
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, started, done])

  const fully = shown.length >= text.length
  return (
    <span className={`aiw-typewriter ${className}`}>
      <span className="aiw-typewriter__text">{shown}</span>
      <span className={`aiw-typewriter__cursor ${fully ? 'is-blink' : ''}`}>▍</span>
    </span>
  )
}

/** AI 草稿标:标记由 AI 生成、待人工确认的内容 */
export function AIBadge({ children = 'AI 草稿', tone = 'warning' }) {
  return (
    <span className="aiw-badge">
      <DSTag tone={tone} size="small">{children}</DSTag>
    </span>
  )
}

/**
 * 置信度条:展示 AI 抽取/归因结论的可信度。
 * @param {number} value 0~1 的置信度
 */
export function ConfidenceBar({ value = 0, label = 'AI 置信度' }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div className="aiw-confidence">
      <span className="aiw-confidence__label">{label}</span>
      <div className="aiw-confidence__bar">
        <div className="aiw-confidence__fill" style={{ width: `${pct}%` }} />
      </div>
      <strong className="aiw-confidence__value">{pct}%</strong>
    </div>
  )
}
