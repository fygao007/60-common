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
import './global-set.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 字段一律回溯 ontology 单源（AGENTS.md 字段铁律），页面只声明展示约束
const F = Object.fromEntries(
  defineOntologyFields([
    'Business.vote.systemDisplayName',
    'Business.vote.systemLogo',
    'Business.vote.loginWelcome',
    'Business.vote.homeWelcome',
  ]).map((field) => [field.fieldRef, field]),
)

const DEFAULT_VALUES = {
  displayName: '在线投票应用',
  loginWelcome: '欢迎使用在线投票应用',
  homeWelcome: '请选择或创建投票项目后开始评审',
}

function GlobalSetPage() {
  const [values, setValues] = useState(DEFAULT_VALUES)
  const [logoFiles, setLogoFiles] = useState([])
  const [feedback, setFeedback] = useState(null)

  const update = (key, value) => setValues((previous) => ({ ...previous, [key]: value }))

  const showFeedback = (tone, message) => {
    setFeedback({ tone, message })
    window.setTimeout(() => setFeedback(null), 2400)
  }

  const save = () => {
    if (!values.displayName.trim()) {
      showFeedback('error', '系统名称不能为空。')
      return
    }
    showFeedback('success', '全局设置已保存。')
  }

  return (
    <main className="global-set-page" data-ds-business-page="global-set">
      <div className="gs-form-wrap">
        <div className="gs-groups">
          <DSFormGroup id="global-brand" title="品牌信息" className="gs-group">
            <DSEditForm columns={1} className="gs-edit-form" style={{ '--ds-edit-modal-single-width': '100%' }}>
              <DSEditField className="gs-field" label={F['Business.vote.systemDisplayName'].label} required htmlFor="gs-name">
                <DSInput id="gs-name" value={values.displayName} placeholder="请输入系统名称" onChange={(event) => update('displayName', event.target.value)} />
              </DSEditField>
              <DSEditField className="gs-field gs-field--block" label={F['Business.vote.systemLogo'].label} htmlFor="gs-logo" help="建议 240×240 透明底 PNG，单张不超过 1MB">
                <DSUpload
                  mode="button"
                  listType="picture-card"
                  accept=".png,.jpg,.jpeg,.svg"
                  maxCount={1}
                  uploadText="上传 LOGO"
                  description="支持 PNG / JPG / SVG 格式"
                  files={logoFiles}
                  onChange={setLogoFiles}
                />
              </DSEditField>
            </DSEditForm>
          </DSFormGroup>

          <DSFormGroup id="global-welcome" title="欢迎语" className="gs-group">
            <DSEditForm columns={1} className="gs-edit-form" style={{ '--ds-edit-modal-single-width': '100%' }}>
              <DSEditField className="gs-field" label={F['Business.vote.loginWelcome'].label} htmlFor="gs-login-welcome">
                <DSInput id="gs-login-welcome" value={values.loginWelcome} placeholder="请输入登录欢迎语" onChange={(event) => update('loginWelcome', event.target.value)} />
              </DSEditField>
              <DSEditField className="gs-field gs-field--block" label={F['Business.vote.homeWelcome'].label} htmlFor="gs-home-welcome">
                <DSTextarea id="gs-home-welcome" className="gs-textarea" rows={2} value={values.homeWelcome} placeholder="请输入首页欢迎语" onChange={(event) => update('homeWelcome', event.target.value)} />
              </DSEditField>
            </DSEditForm>
          </DSFormGroup>
        </div>
      </div>

      <div className="gs-footer">
        <DSButton variant="primary" onClick={save}>保存</DSButton>
      </div>

      {feedback ? (
        <DSAlert className="gs-feedback" tone={feedback.tone} aria-live="polite">
          {feedback.message}
        </DSAlert>
      ) : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<GlobalSetPage />)
