import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import {
  DSAlert,
  DSButton,
  DSEditField,
  DSEditForm,
  DSFormGroup,
  DSModal,
  DSSwitch,
  DSTextarea,
} from '@wisedu/design-system'
import { defineOntologyFields } from '@wisedu/hr-domain/fields'
import './promise-set.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 字段一律回溯 ontology 单源（AGENTS.md 字段铁律），页面只声明展示约束
const FIELDS = Object.fromEntries(
  defineOntologyFields([
    'Business.vote.promiseEnabled',
    'Business.vote.promiseContent',
    'Business.vote.signatureEnabled',
  ]).map((field) => [field.fieldRef, field]),
)

const DEFAULT_PROMISE = [
  '本人郑重承诺：',
  '一、所填报的评审材料真实、准确、完整，无弄虚作假、无学术不端行为；',
  '二、严格遵守评审纪律与回避要求，不向任何评委打探、说情或施加影响；',
  '三、自觉接受组织监督，如违反上述承诺，自愿接受取消参评资格等处理。',
].join('\n')

function PromiseSetPage() {
  const [enabled, setEnabled] = useState(true)
  const [signature, setSignature] = useState(true)
  const [content, setContent] = useState(DEFAULT_PROMISE)
  const [previewing, setPreviewing] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (tone, message) => {
    setFeedback({ tone, message })
    window.setTimeout(() => setFeedback(null), 2400)
  }

  const save = () => {
    if (enabled && !content.trim()) {
      showFeedback('error', '启用承诺书时正文不能为空。')
      return
    }
    showFeedback('success', enabled ? '承诺书设置已保存。' : '已关闭承诺书，参评人无需签署。')
  }

  return (
    <main className="promise-set-page" data-ds-business-page="promise-set">
      <div className="ps-form-wrap">
        <div className="ps-groups">
          <DSFormGroup id="promise-switch" title="承诺书开关" className="ps-group">
            <DSEditForm columns={1} className="ps-edit-form" style={{ '--ds-edit-modal-single-width': '100%' }}>
              <DSEditField
                className="ps-field"
                label={FIELDS['Business.vote.promiseEnabled'].label}
                htmlFor="promise-set-enabled"
                help="关闭后参评人提交材料时不再要求签署承诺书"
              >
                <DSSwitch
                  checked={enabled}
                  checkedText="启用"
                  uncheckedText="停用"
                  onChange={setEnabled}
                />
              </DSEditField>

              <DSEditField
                className="ps-field"
                label={FIELDS['Business.vote.signatureEnabled'].label}
                htmlFor="promise-set-signature"
                help="启用后参评人须手写电子签名确认"
              >
                <DSSwitch
                  checked={signature}
                  checkedText="需要"
                  uncheckedText="不需要"
                  disabled={!enabled}
                  onChange={setSignature}
                />
              </DSEditField>
            </DSEditForm>
          </DSFormGroup>

          <DSFormGroup id="promise-body" title="承诺书正文" className="ps-group">
            <DSEditForm columns={1} className="ps-edit-form" style={{ '--ds-edit-modal-single-width': '100%' }}>
              <DSEditField
                className="ps-field ps-field--block"
                label={FIELDS['Business.vote.promiseContent'].label}
                htmlFor="promise-set-content"
                help="参评人在提交材料前需逐条确认本承诺内容"
              >
                <DSTextarea
                  id="promise-set-content"
                  className="ps-textarea"
                  rows={8}
                  disabled={!enabled}
                  value={content}
                  placeholder="请输入承诺书正文"
                  onChange={(event) => setContent(event.target.value)}
                />
                <div className="ps-inline-actions">
                  <DSButton variant="default" disabled={!enabled} onClick={() => setPreviewing(true)}>预览承诺书</DSButton>
                  <DSButton variant="text" disabled={!enabled} onClick={() => setContent(DEFAULT_PROMISE)}>恢复默认模板</DSButton>
                </div>
              </DSEditField>
            </DSEditForm>
          </DSFormGroup>
        </div>
      </div>

      <div className="ps-footer">
        <DSButton variant="primary" onClick={save}>保存</DSButton>
      </div>

      <DSModal
        open={previewing}
        title="承诺书预览"
        okText="关闭"
        cancelText="返回修改"
        onOk={() => setPreviewing(false)}
        onCancel={() => setPreviewing(false)}
      >
        <pre className="ps-preview">{content}</pre>
        {signature ? <p className="ps-preview-sign">参评人签名：______________</p> : null}
      </DSModal>

      {feedback ? (
        <DSAlert className="ps-feedback" tone={feedback.tone} aria-live="polite">
          {feedback.message}
        </DSAlert>
      ) : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<PromiseSetPage />)
