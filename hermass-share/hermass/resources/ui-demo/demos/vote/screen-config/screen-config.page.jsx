import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import {
  DSAlert,
  DSButton,
  DSEditField,
  DSEditForm,
  DSFormGroup,
  DSInput,
  DSTextarea,
  DSUpload,
} from '@wisedu/design-system'
import { defineOntologyFields } from '@wisedu/hr-domain/fields'
import './screen-config.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 字段一律回溯 ontology 单源（AGENTS.md 字段铁律），页面只声明展示约束
const F = Object.fromEntries(
  defineOntologyFields([
    'Business.vote.screenTitle',
    'Business.vote.welcomeWords',
    'Business.vote.startWords',
    'Business.vote.endWords',
    'Business.vote.startCountdown',
    'Business.vote.endCountdown',
    'Business.vote.screenBackground',
  ]).map((field) => [field.fieldRef, field]),
)

const DEFAULT_VALUES = {
  title: '2026年度专业技术职务评聘',
  welcome: '欢迎各位评委参加本轮评审',
  startWords: '投票即将开始',
  endWords: '本轮投票已结束，感谢参与',
  startCountdown: '5',
  endCountdown: '10',
}

function goPreview() {
  const frame = typeof window !== 'undefined' ? window.VoteAppFrame : null
  const href = frame && frame.route ? frame.route('screen-preview') : '../screen-preview/screen-preview.html'
  window.open(href, '_blank', 'noopener')
}

function ScreenConfigPage() {
  const [values, setValues] = useState(DEFAULT_VALUES)
  const [files, setFiles] = useState([])
  const [feedback, setFeedback] = useState(null)

  const update = (key, value) => setValues((previous) => ({ ...previous, [key]: value }))

  const showFeedback = (tone, message) => {
    setFeedback({ tone, message })
    window.setTimeout(() => setFeedback(null), 2400)
  }

  const save = () => {
    if (!values.title.trim()) {
      showFeedback('error', '大屏标题不能为空。')
      return
    }
    const start = Number(values.startCountdown)
    const end = Number(values.endCountdown)
    if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || end < 0) {
      showFeedback('error', '倒计时需为不小于 0 的整数秒。')
      return
    }
    showFeedback('success', '大屏配置已保存。')
  }

  return (
    <main className="screen-config-page" data-ds-business-page="screen-config">
      <div className="sc-form-wrap">
        <div className="sc-groups">
          <DSFormGroup id="screen-text" title="大屏文案" className="sc-group">
            <DSEditForm columns={1} className="sc-edit-form" style={{ '--ds-edit-modal-single-width': '100%' }}>
              <DSEditField className="sc-field" label={F['Business.vote.screenTitle'].label} required htmlFor="sc-title">
                <DSInput id="sc-title" value={values.title} placeholder="请输入大屏标题" onChange={(event) => update('title', event.target.value)} />
              </DSEditField>
              <DSEditField className="sc-field sc-field--block" label={F['Business.vote.welcomeWords'].label} htmlFor="sc-welcome">
                <DSTextarea id="sc-welcome" className="sc-textarea" rows={2} value={values.welcome} placeholder="请输入欢迎语" onChange={(event) => update('welcome', event.target.value)} />
              </DSEditField>
              <DSEditField className="sc-field" label={F['Business.vote.startWords'].label} htmlFor="sc-start-words">
                <DSInput id="sc-start-words" value={values.startWords} placeholder="请输入开始提示语" onChange={(event) => update('startWords', event.target.value)} />
              </DSEditField>
              <DSEditField className="sc-field" label={F['Business.vote.endWords'].label} htmlFor="sc-end-words">
                <DSInput id="sc-end-words" value={values.endWords} placeholder="请输入结束提示语" onChange={(event) => update('endWords', event.target.value)} />
              </DSEditField>
            </DSEditForm>
          </DSFormGroup>

          <DSFormGroup id="screen-countdown" title="倒计时设置" className="sc-group">
            <DSEditForm columns={1} className="sc-edit-form" style={{ '--ds-edit-modal-single-width': '100%' }}>
              <DSEditField className="sc-field" label={F['Business.vote.startCountdown'].label} htmlFor="sc-start-countdown" help="开始提示语展示后进入投票的等待秒数">
                <span className="sc-input-with-suffix">
                  <DSInput id="sc-start-countdown" type="number" value={values.startCountdown} onChange={(event) => update('startCountdown', event.target.value)} />
                  <span className="sc-input-suffix">秒</span>
                </span>
              </DSEditField>
              <DSEditField className="sc-field" label={F['Business.vote.endCountdown'].label} htmlFor="sc-end-countdown" help="结束提示语展示后关闭投票的等待秒数">
                <span className="sc-input-with-suffix">
                  <DSInput id="sc-end-countdown" type="number" value={values.endCountdown} onChange={(event) => update('endCountdown', event.target.value)} />
                  <span className="sc-input-suffix">秒</span>
                </span>
              </DSEditField>
            </DSEditForm>
          </DSFormGroup>

          <DSFormGroup id="screen-bg" title="大屏背景" className="sc-group">
            <DSEditForm columns={1} className="sc-edit-form" style={{ '--ds-edit-modal-single-width': '100%' }}>
              <DSEditField className="sc-field sc-field--block" label={F['Business.vote.screenBackground'].label} htmlFor="sc-bg" help="建议 1920×1080，单张不超过 5MB">
                <DSUpload
                  mode="button"
                  listType="picture-card"
                  accept=".jpg,.jpeg,.png"
                  maxCount={1}
                  uploadText="上传背景图"
                  description="支持 JPG / PNG 格式"
                  files={files}
                  onChange={setFiles}
                />
              </DSEditField>
            </DSEditForm>
          </DSFormGroup>
        </div>
      </div>

      <div className="sc-footer">
        <DSButton variant="primary" onClick={save}>保存</DSButton>
        <DSButton variant="default" onClick={goPreview}>预览大屏</DSButton>
      </div>

      {feedback ? (
        <DSAlert className="sc-feedback" tone={feedback.tone} aria-live="polite">
          {feedback.message}
        </DSAlert>
      ) : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<ScreenConfigPage />)
