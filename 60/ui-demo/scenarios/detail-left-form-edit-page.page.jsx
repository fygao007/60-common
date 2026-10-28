import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import {
  DSButton,
  DSButtonGroup,
  DSCheckbox,
  DSInput,
  DSRadioGroup,
  DSSelect,
  DSSubPageHeader,
  DSSwitch,
} from '@wisedu/design-system'
import './detail-left-form-edit-page.css'

const choices = [
  { value: 'option-1', label: '多选项' },
  { value: 'option-2', label: '多选项' },
  { value: 'option-3', label: '多选项' },
  { value: 'option-4', label: '多选项' },
  { value: 'option-5', label: '多选项' },
]
const radioChoices = [
  { value: 'option-1', label: '单选项' },
  { value: 'option-2', label: '单选项' },
  { value: 'option-3', label: '单选项' },
  { value: 'option-4', label: '单选项' },
  { value: 'option-5', label: '单选项' },
]

function FormRow({ required = false, label, note, children, error }) {
  return <div className="detail-left-edit__row">
    <div className="detail-left-edit__label" title={label}>{required ? <b aria-hidden="true">*</b> : null}<span>{label}</span></div>
    <div className="detail-left-edit__control">{children}{error ? <span className="detail-left-edit__error">{error}</span> : null}</div>
    <p className="detail-left-edit__note">{note}</p>
  </div>
}

function DetailLeftFormEditPage() {
  const [checked, setChecked] = useState(['option-1', 'option-2'])
  const back = () => window.history.back()
  const toggle = (value) => setChecked((items) => items.includes(value) ? items.filter((item) => item !== value) : [...items, value])

  return <main className="detail-left-edit">
    <div className="detail-left-edit__shell">
      <DSSubPageHeader className="detail-left-edit__header" surface={false} title="标题" onBack={back} />
      <div className="detail-left-edit__content">
        <div className="detail-left-edit__form" aria-label="居左单列表单">
          <FormRow required label="查重方式" error="报错原因" note="限制学生可重新检测的次数。新批次是否认为是首检，结合參数【新开启批次是否承接以往查重结果】配置">
            <DSSelect error options={[]} placeholder="请选择" />
          </FormRow>
          <FormRow label="查重标准设置维度" note="设罝按实践成果申请学位的学生进行匿名性检查需要使用的附件(word/pdf)，请先设置好环节附件后再进行选择">
            <div className="detail-left-edit__choices">{choices.map((item) => <DSCheckbox key={item.value} label={item.label} checked={checked.includes(item.value)} onChange={() => toggle(item.value)} />)}</div>
          </FormRow>
          <FormRow label="重新检测次数设置" note="设罝按实践成果申请学位的学生进行匿名性检查需要使用的附件(word/pdf)，请先设置好环节附">
            <DSSelect options={[]} placeholder="请选择" />
          </FormRow>
          <FormRow required label="论文格式检查" note="设置为是，在线查重结果会自动确认，学生即可查看">
            <DSSwitch checked checkedText="" uncheckedText="" />
          </FormRow>
          <FormRow required label="修改查重结果是否需上传材料" note="选择是，若管理端修改查重结果需补充上传证明材料">
            <DSRadioGroup defaultValue="option-1" name="upload-material" options={radioChoices} />
          </FormRow>
          <FormRow required label="名称过长非常之长不要换行直接有..." note="设置按实践成果申请学位的学生进行匿名性检查需要使用的附件(word/pdf)，请先设置好环节附件后再进行选择设置按实践成果申请学位的学生进行匿名性检查需要使用的附件(word/pdf)，请先...">
            <DSInput placeholder="请输入" />
          </FormRow>
        </div>
        <div className="detail-left-edit__inline-actions"><DSButtonGroup aria-label="表单操作"><DSButton variant="primary" onClick={() => window.alert('已保存')}>主按钮</DSButton><DSButton variant="default" onClick={back}>次按钮</DSButton></DSButtonGroup></div>
      </div>
    </div>
  </main>
}

createRoot(document.getElementById('app')).render(<DetailLeftFormEditPage />)
