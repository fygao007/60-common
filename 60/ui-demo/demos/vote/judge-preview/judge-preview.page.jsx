import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import {
  DSAuditOpinionModal,
  DSButton,
  DSRadioGroup,
  DSTag,
} from '@wisedu/design-system'
import { defineOntologyFields } from '@wisedu/hr-domain/fields'
import './judge-preview.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 字段一律回溯 ontology 单源（AGENTS.md 字段铁律），页面只声明展示约束
const F = Object.fromEntries(
  defineOntologyFields([
    'StaffBasicInformation.xm',
    'Business.vote.proposedPosition',
    'Business.vote.voteOpinion',
  ]).map((field) => [field.fieldRef, field]),
)

const CHOICE_OPTIONS = [
  { label: '同意', value: 'agree' },
  { label: '不同意', value: 'disagree' },
  { label: '弃权', value: 'abstain' },
]

const BASE_ROWS = [
  { id: 'c-01', name: '马新华', position: '教授', choice: 'agree' },
  { id: 'c-02', name: '陈立群', position: '副教授', choice: '' },
  { id: 'c-03', name: '林静怡', position: '副教授', choice: '' },
  { id: 'c-04', name: '何志远', position: '讲师', choice: '' },
]

function JudgePreviewPage() {
  const [rows, setRows] = useState(BASE_ROWS)
  const [opinionOpen, setOpinionOpen] = useState(false)
  const [opinion, setOpinion] = useState('')
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  const setChoice = (id, choice) => {
    setRows((previous) => previous.map((row) => (row.id === id ? { ...row, choice } : row)))
  }

  const decided = rows.filter((row) => row.choice).length

  const submit = () => {
    const missing = rows.filter((row) => !row.choice)
    if (missing.length) {
      notify(`还有 ${missing.length} 位对象未表决，请完成后提交`)
      return
    }
    notify('投票已提交，感谢参与')
  }

  return (
    <main className="judge-preview-page" data-ds-business-page="judge-preview">
      <header className="jp-header">
        <div className="jp-header-main">
          <h2 className="jp-project">2026年度专业技术职务评聘（第一轮）</h2>
          <p className="jp-judge">评委：马新华 · 理工组</p>
        </div>
        <div className="jp-header-meta">
          <span className="jp-meta-item">待表决 <strong>{rows.length - decided}</strong> 位</span>
          <span className="jp-meta-item">已表决 <strong>{decided}</strong> 位</span>
          <DSTag tone="blue">表决投票</DSTag>
        </div>
      </header>

      <section className="jp-board">
        {rows.map((row) => (
          <article className="jp-card" key={row.id}>
            <header className="jp-card-head">
              <span className="jp-card-name">{row.name}</span>
              <span className="jp-card-position">{row.position}</span>
              {row.choice ? <DSTag tone="green">已表决</DSTag> : <DSTag tone="gray">待表决</DSTag>}
            </header>
            <DSRadioGroup
              name={`judge-${row.id}`}
              options={CHOICE_OPTIONS}
              value={row.choice}
              onChange={(value) => setChoice(row.id, value)}
            />
          </article>
        ))}
      </section>

      <footer className="jp-footer">
        <span className="jp-footer-tip">请对全部评审对象逐一表决后再提交；提交后不可修改。</span>
        <div className="jp-footer-actions">
          <DSButton variant="default" onClick={() => setOpinionOpen(true)}>填写投票意见</DSButton>
          <DSButton variant="primary" onClick={submit}>提交投票</DSButton>
        </div>
      </footer>

      <DSAuditOpinionModal
        open={opinionOpen}
        type="pass"
        title="填写投票意见"
        opinion={opinion}
        onOpinionChange={setOpinion}
        opinionLabel="投票意见"
        opinionPlaceholder="请输入本轮投票的整体意见（选填）"
        opinionRequired={false}
        okText="保存意见"
        cancelText="取消"
        onOk={() => {
          setOpinionOpen(false)
          notify(opinion.trim() ? '投票意见已保存' : '已跳过意见填写')
        }}
        onCancel={() => setOpinionOpen(false)}
      />

      {toast ? <div className="jp-toast" role="status" aria-live="polite">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<JudgePreviewPage />)
