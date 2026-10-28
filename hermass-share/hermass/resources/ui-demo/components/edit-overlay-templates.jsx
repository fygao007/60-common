import '../packages/design-system/src/base.css'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import DSButton from '../packages/design-system/src/Button'
import DSDatePicker from '../packages/design-system/src/DatePicker'
import {
  DSDoubleEditModal,
  DSLargeModalTemplate,
  DSGroupedEditDrawer,
  DSSingleEditModal,
  DSWideModalTemplate,
} from '../packages/design-system/src/EditOverlayTemplates'
import DSEditForm, {
  DSEditField,
  DSFormGroup,
} from '../packages/design-system/src/EditForm'
import {
  DSInput,
  DSSelect,
  DSTextarea,
} from '../packages/design-system/src/Field'
import DSRichTextEditor from '../packages/design-system/src/RichTextEditor'
import DSSwitch from '../packages/design-system/src/Switch'
import DSTimePicker from '../packages/design-system/src/TimePicker'
import { EDIT_OVERLAY_SPEC } from '../packages/design-system/src/edit-overlay-spec.generated'
import './edit-overlay-templates.css'

const typeOptions = [
  { value: 'teaching', label: '教学活动' },
  { value: 'research', label: '科研活动' },
]

const statusOptions = [
  { value: 'enabled', label: '启用' },
  { value: 'disabled', label: '停用' },
]

const unitOptions = [
  { value: 'computer', label: '计算机学院' },
  { value: 'design', label: '设计学院' },
]

function DateRangeControl() {
  return (
    <div className="preview-range-control">
      <DSInput aria-label="开始日期" defaultValue="2026-06-15" type="date" />
      <span aria-hidden="true">至</span>
      <DSInput aria-label="结束日期" defaultValue="2026-06-30" type="date" />
    </div>
  )
}

function TimeRangeControl() {
  return (
    <div className="preview-range-control">
      <DSInput aria-label="开始时间" defaultValue="09:00" type="time" />
      <span aria-hidden="true">至</span>
      <DSInput aria-label="结束时间" defaultValue="18:00" type="time" />
    </div>
  )
}

function SingleModalFields() {
  const [enabled, setEnabled] = useState(true)

  return (
    <>
      <DSEditField htmlFor="single-name" label="名称" required>
        <DSInput id="single-name" placeholder="请输入" />
      </DSEditField>
      <DSEditField label="类型">
        <DSSelect options={typeOptions} placeholder="请选择" />
      </DSEditField>
      <DSEditField label="是否启用">
        <DSSwitch checked={enabled} checkedText="" onChange={setEnabled} uncheckedText="" />
      </DSEditField>
      <DSEditField label="开始时间">
        <DSTimePicker defaultValue="09:00" />
      </DSEditField>
      <DSEditField label="开始日期">
        <DSDatePicker defaultValue="2026-06-15" />
      </DSEditField>
      <DSEditField htmlFor="single-datetime" label="日期时间">
        <DSInput id="single-datetime" defaultValue="2026-06-15T09:00" type="datetime-local" />
      </DSEditField>
      <DSEditField label="日期范围">
        <DateRangeControl />
      </DSEditField>
      <DSEditField label="时间范围">
        <TimeRangeControl />
      </DSEditField>
      <DSEditField htmlFor="single-owner" label="负责人">
        <DSInput id="single-owner" placeholder="请输入" />
      </DSEditField>
    </>
  )
}

function DoubleModalFields() {
  return (
    <>
      <DSEditField htmlFor="double-name" label="名称" required>
        <DSInput id="double-name" placeholder="请输入" />
      </DSEditField>
      <DSEditField htmlFor="double-code" label="编码">
        <DSInput id="double-code" placeholder="请输入" />
      </DSEditField>
      <DSEditField label="类型">
        <DSSelect options={typeOptions} placeholder="请选择" />
      </DSEditField>
      <DSEditField htmlFor="double-owner" label="负责人">
        <DSInput id="double-owner" placeholder="请输入" />
      </DSEditField>
      <DSEditField label="开始日期">
        <DSDatePicker defaultValue="2026-06-15" />
      </DSEditField>
      <DSEditField label="结束日期">
        <DSDatePicker defaultValue="2026-06-30" />
      </DSEditField>
      <DSEditField label="所属单位">
        <DSSelect options={unitOptions} placeholder="请选择" />
      </DSEditField>
      <DSEditField label="状态">
        <DSSelect defaultValue="enabled" options={statusOptions} />
      </DSEditField>
      <DSEditField htmlFor="double-sort" label="排序">
        <DSInput defaultValue="1" id="double-sort" type="number" />
      </DSEditField>
      <DSEditField htmlFor="double-remark" label="备注">
        <DSInput id="double-remark" placeholder="请输入" />
      </DSEditField>
    </>
  )
}

function GroupedDrawerFields() {
  const [publicVisible, setPublicVisible] = useState(true)

  return (
    <>
      <DSFormGroup title="基本信息">
        <DSEditForm columns={1}>
          <DSEditField htmlFor="drawer-name" label="活动名称" required>
            <DSInput id="drawer-name" placeholder="请输入" />
          </DSEditField>
          <DSEditField label="活动类型">
            <DSSelect options={typeOptions} placeholder="请选择" />
          </DSEditField>
          <DSEditField label="活动时间" required>
            <DateRangeControl />
          </DSEditField>
          <DSEditField label="是否公开">
            <DSSwitch checked={publicVisible} checkedText="" onChange={setPublicVisible} uncheckedText="" />
          </DSEditField>
        </DSEditForm>
      </DSFormGroup>
      <DSFormGroup title="详细说明">
        <DSEditForm columns={1}>
          <DSEditField align="start" htmlFor="drawer-summary" label="活动摘要">
            <DSTextarea id="drawer-summary" placeholder="请输入" rows={3} />
          </DSEditField>
          <DSEditField align="start" label="活动详情">
            <DSRichTextEditor className="preview-richtext" placeholder="请输入活动详细说明" />
          </DSEditField>
        </DSEditForm>
      </DSFormGroup>
    </>
  )
}

function Metric({ label, value }) {
  return (
    <div className="preview-metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function PreviewApp() {
  const [activeTemplate, setActiveTemplate] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const { shared, templates } = EDIT_OVERLAY_SPEC

  const close = () => {
    if (!submitting) setActiveTemplate(null)
  }

  const submit = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setActiveTemplate(null)
      setMessage('信息已保存')
      window.setTimeout(() => setMessage(''), 1800)
    }, 800)
  }

  return (
    <main className="preview-page ds-scope">
      <header className="preview-page__head">
        <h1>编辑弹层模板</h1>
        <p>页面直接运行组件库 React 实现；尺寸、间距和交互读取同一份机器规范。</p>
      </header>

      <section aria-label="模板预览" className="preview-template-grid">
        <article className="preview-card">
          <h2>单列编辑弹窗</h2>
          <p>{templates.singleModal.width} × {templates.singleModal.height}，适合字段较少但控件类型丰富的集中编辑。</p>
          <DSButton data-preview-trigger="single" onClick={() => setActiveTemplate('single')}>打开模板</DSButton>
        </article>
        <article className="preview-card">
          <h2>双列编辑弹窗</h2>
          <p>{templates.doubleModal.width} × {templates.doubleModal.height}，空间不足时由 DSEditForm 自动退化为单列。</p>
          <DSButton data-preview-trigger="double" onClick={() => setActiveTemplate('double')} variant="default">打开模板</DSButton>
        </article>
        <article className="preview-card">
          <h2>大尺寸弹窗</h2>
          <p>{templates.largeModal.width} × {templates.largeModal.height}，适合连续浏览的长内容或复杂配置。</p>
          <DSButton data-preview-trigger="large" onClick={() => setActiveTemplate('large')} variant="default">打开模板</DSButton>
        </article>
        <article className="preview-card">
          <h2>宽尺寸弹窗</h2>
          <p>{templates.wideModal.width} × {templates.wideModal.height}，适合双列字段或需要横向对照的内容。</p>
          <DSButton data-preview-trigger="wide" onClick={() => setActiveTemplate('wide')} variant="default">打开模板</DSButton>
        </article>
        <article className="preview-card">
          <h2>带分组抽屉</h2>
          <p>右侧 {templates.groupedDrawer.width}px，分组间距 {templates.groupedDrawer.groupGap}px，标题栏与底栏固定。</p>
          <DSButton data-preview-trigger="drawer" onClick={() => setActiveTemplate('drawer')} variant="default">打开模板</DSButton>
        </article>
      </section>

      <section className="preview-spec-panel">
        <h2>机器规范中的共同规则</h2>
        <div className="preview-metric-grid">
          <Metric label="弹层内容水平边距" value={`${shared.surfacePaddingX}px`} />
          <Metric label="标签宽度与控件间距" value={`${shared.labelWidth}px + ${shared.labelControlGap}px`} />
          <Metric label="输入控件与按钮高度" value={`${shared.controlHeight}px`} />
          <Metric label="标题栏与底部操作栏" value={`${shared.headerHeight}px`} />
        </div>
      </section>

      <DSSingleEditModal
        confirmLoading={submitting}
        onCancel={close}
        onOk={submit}
        open={activeTemplate === 'single'}
        title="单列编辑弹窗"
      >
        <DSEditForm columns={1}><SingleModalFields /></DSEditForm>
      </DSSingleEditModal>

      <DSDoubleEditModal
        confirmLoading={submitting}
        onCancel={close}
        onOk={submit}
        open={activeTemplate === 'double'}
        title="双列编辑弹窗"
      >
        <DoubleModalFields />
      </DSDoubleEditModal>

      <DSLargeModalTemplate
        confirmLoading={submitting}
        onCancel={close}
        onOk={submit}
        open={activeTemplate === 'large'}
        title="大尺寸弹窗"
      >
        <DSEditForm columns={1}><SingleModalFields /></DSEditForm>
      </DSLargeModalTemplate>

      <DSWideModalTemplate
        confirmLoading={submitting}
        onCancel={close}
        onOk={submit}
        open={activeTemplate === 'wide'}
        title="宽尺寸弹窗"
      >
        <DSEditForm columns={2}><DoubleModalFields /></DSEditForm>
      </DSWideModalTemplate>

      <DSGroupedEditDrawer
        confirmLoading={submitting}
        onClose={close}
        onOk={submit}
        open={activeTemplate === 'drawer'}
        title="编辑活动信息"
      >
        <GroupedDrawerFields />
      </DSGroupedEditDrawer>

      {message ? <div className="preview-toast" role="status">{message}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<PreviewApp />)
