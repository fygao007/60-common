import { createRoot } from 'react-dom/client'
import { useMemo, useState } from 'react'
import {
  DSAlert,
  DSButton,
  DSEditField,
  DSEditForm,
  DSFormGroup,
  DSModal,
  DSReadOnlyField,
  DSReadOnlyForm,
  DSSteps,
  DSTextarea,
} from '@wisedu/design-system'
import { defineOntologyFields } from '@wisedu/hr-domain/fields'
import './project-status.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 字段一律回溯 ontology 单源（AGENTS.md 字段铁律），页面只声明展示约束
const FIELDS = Object.fromEntries(
  defineOntologyFields([
    'Business.vote.voteProjectName',
    'Business.vote.voteMode',
    'Business.vote.votePeriod',
    'Business.vote.projectStatus',
    'Business.vote.projectStatusNote',
    'Business.vote.submittedCount',
    'Business.vote.pendingCount',
    'Business.vote.completeRate',
  ]).map((field) => [field.fieldRef, field]),
)

const STEPS = [
  { key: 'pending', title: '未开启', description: '等待开启投票' },
  { key: 'voting', title: '投票中', description: '评委正在投票' },
  { key: 'done', title: '已完成', description: '投票结果已生成' },
  { key: 'closed', title: '已关闭', description: '项目归档留痕' },
]

const STATUS_INDEX = { 未开启: 0, 投票中: 1, 已完成: 2, 已关闭: 3 }
const NEXT_ACTION = {
  未开启: { label: '开启投票', to: '投票中', tip: '投票已开启，评委可进入投票端。' },
  投票中: { label: '结束投票', to: '已完成', tip: '投票已结束，系统开始统计结果。' },
  已完成: { label: '关闭项目', to: '已关闭', tip: '项目已关闭并归档。' },
}

const PROJECT = {
  name: '2026年度专业技术职务评聘（第一轮）',
  mode: '表决',
  period: '2026-10-08 至 10-10',
}

function ProjectStatusPage() {
  const [status, setStatus] = useState('投票中')
  const [note, setNote] = useState('评委应在本轮投票截止前完成全部对象的表决。')
  const [feedback, setFeedback] = useState(null)
  const [confirming, setConfirming] = useState(false)

  const current = STATUS_INDEX[status] ?? 0
  const action = NEXT_ACTION[status]

  const progress = useMemo(() => ({
    submitted: 18,
    pending: 6,
    rate: status === '未开启' ? '0%' : '75%',
  }), [status])

  const showFeedback = (tone, message) => {
    setFeedback({ tone, message })
    window.setTimeout(() => setFeedback(null), 2400)
  }

  const runAction = () => {
    if (!action) return
    setStatus(action.to)
    setConfirming(false)
    showFeedback('success', action.tip)
  }

  return (
    <main className="project-status-page" data-ds-business-page="project-status">
      <div className="pst-form-wrap">
        <div className="pst-groups">
          <DSFormGroup id="status-steps" title={FIELDS['Business.vote.projectStatus'].label} className="pst-group">
            <DSSteps items={STEPS} current={current} className="pst-steps" />
          </DSFormGroup>

          <DSFormGroup id="status-base" title="项目信息" className="pst-group">
            <DSReadOnlyForm columns={2} labelWidth={110}>
              <DSReadOnlyField label={FIELDS['Business.vote.voteProjectName'].label} value={PROJECT.name} fullWidth />
              <DSReadOnlyField label={FIELDS['Business.vote.voteMode'].label} value={PROJECT.mode} />
              <DSReadOnlyField label={FIELDS['Business.vote.votePeriod'].label} value={PROJECT.period} />
            </DSReadOnlyForm>
          </DSFormGroup>

          <DSFormGroup id="status-progress" title="投票进度概览" className="pst-group">
            <DSReadOnlyForm columns={3} labelWidth={110}>
              <DSReadOnlyField label={FIELDS['Business.vote.submittedCount'].label} value={`${progress.submitted} 人`} />
              <DSReadOnlyField label={FIELDS['Business.vote.pendingCount'].label} value={`${progress.pending} 人`} />
              <DSReadOnlyField label={FIELDS['Business.vote.completeRate'].label} value={progress.rate} />
            </DSReadOnlyForm>
          </DSFormGroup>

          <DSFormGroup id="status-note" title={FIELDS['Business.vote.projectStatusNote'].label} className="pst-group">
            <DSEditForm columns={1} className="pst-edit-form" style={{ '--ds-edit-modal-single-width': '100%' }}>
              <DSEditField
                className="pst-field pst-field--block"
                label={FIELDS['Business.vote.projectStatusNote'].label}
                htmlFor="project-status-note"
                help="状态说明会同步展示在项目卡片与投票进度页"
              >
                <DSTextarea
                  id="project-status-note"
                  className="pst-textarea"
                  rows={3}
                  value={note}
                  placeholder="请输入状态说明"
                  onChange={(event) => setNote(event.target.value)}
                />
              </DSEditField>
            </DSEditForm>
          </DSFormGroup>
        </div>
      </div>

      <div className="pst-footer">
        {action ? (
          <DSButton variant="primary" onClick={() => setConfirming(true)}>{action.label}</DSButton>
        ) : (
          <DSButton variant="default" disabled>项目已关闭</DSButton>
        )}
        <DSButton variant="default" onClick={() => showFeedback('success', '状态说明已保存。')}>保存说明</DSButton>
      </div>

      <DSModal
        open={confirming}
        title={action ? action.label : ''}
        okText="确认"
        cancelText="取消"
        onOk={runAction}
        onCancel={() => setConfirming(false)}
      >
        <p className="pst-confirm-text">
          {action ? `确认执行「${action.label}」？执行后项目状态将变更为「${action.to}」。` : ''}
        </p>
      </DSModal>

      {feedback ? (
        <DSAlert className="pst-feedback" tone={feedback.tone} aria-live="polite">
          {feedback.message}
        </DSAlert>
      ) : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<ProjectStatusPage />)
