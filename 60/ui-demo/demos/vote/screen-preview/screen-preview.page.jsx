import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import {
  DSButton,
  DSTag,
} from '@wisedu/design-system'
import { defineOntologyFields } from '@wisedu/hr-domain/fields'
import './screen-preview.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 字段一律回溯 ontology 单源（AGENTS.md 字段铁律），页面只声明展示约束
const F = Object.fromEntries(
  defineOntologyFields([
    'Business.vote.screenTitle',
    'Business.vote.welcomeWords',
    'Business.vote.endWords',
    'Business.vote.screenBackground',
  ]).map((field) => [field.fieldRef, field]),
)

const CANDIDATES = [
  { id: 'c-01', name: '陈立群', position: '副教授', votes: 21 },
  { id: 'c-02', name: '马新华', position: '教授', votes: 19 },
  { id: 'c-03', name: '林静怡', position: '副教授', votes: 12 },
  { id: 'c-04', name: '何志远', position: '讲师', votes: 8 },
]

const TOTAL = 24

function formatClock(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function ScreenPreviewPage() {
  const [seconds, setSeconds] = useState(522)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => {
      setSeconds((value) => (value > 0 ? value - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running])

  return (
    <main className="screen-preview-page" data-ds-business-page="screen-preview">
      <div className="sp-toolbar">
        <span className="sp-toolbar-label">大屏预览（按 16:9 等比缩放，投影前请核对文案与倒计时）</span>
        <div className="sp-toolbar-actions">
          <DSButton variant="default" onClick={() => setRunning((value) => !value)}>
            {running ? '暂停倒计时' : '继续倒计时'}
          </DSButton>
          <DSButton variant="primary" onClick={() => setSeconds(522)}>重置</DSButton>
        </div>
      </div>

      <section className="sp-stage">
        <header className="sp-header">
          <h1 className="sp-title">{F['Business.vote.screenTitle'].label && '2026年度专业技术职务评聘'}</h1>
          <p className="sp-welcome">欢迎各位评委参加本轮评审</p>
        </header>

        <div className="sp-board">
          <ul className="sp-list">
            {CANDIDATES.map((item, index) => (
              <li className="sp-item" key={item.id}>
                <span className="sp-rank">{index + 1}</span>
                <span className="sp-name">{item.name}</span>
                <span className="sp-position">{item.position}</span>
                <span className="sp-bar">
                  <i className="sp-bar-fill" style={{ width: `${Math.round((item.votes / TOTAL) * 100)}%` }} />
                </span>
                <span className="sp-count">{item.votes} 票</span>
              </li>
            ))}
          </ul>
        </div>

        <footer className="sp-footer">
          <span className="sp-countdown">投票截止倒计时 {formatClock(seconds)}</span>
          <DSTag tone="blue">投票进行中</DSTag>
        </footer>
      </section>
    </main>
  )
}

createRoot(document.getElementById('app')).render(<ScreenPreviewPage />)
