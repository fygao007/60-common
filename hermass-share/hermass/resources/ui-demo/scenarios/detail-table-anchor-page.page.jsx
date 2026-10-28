import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import {
  DSAnchor,
  DSButton,
  DSButtonGroup,
  DSDataTable,
  DSDatePicker,
  DSGroupTitle,
  DSInput,
  DSSelect,
  DSSubPageHeader,
  DSSwitch,
  DSTag,
  DSTimePicker,
} from '@wisedu/design-system'
import './detail-table-anchor-page.css'

const sections = [
  {
    key: 'form-group',
    title: '分组标题',
    href: '#form-one',
    children: [
      { key: 'subform-one', title: '标题名称', href: '#subform-one' },
      { key: 'subform-two', title: '标题名称', href: '#subform-two' },
    ],
  },
  { key: 'table-group', title: '分组标题', href: '#detail-table' },
]

const anchorItems = sections.flatMap((section) => [section, ...(section.children || [])])

const fieldKinds = ['input', 'switch', 'select', 'select', 'time', 'time-range', 'date', 'date-range', 'date']
const rows = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: index === 9 ? '文本' : 'JAVA基础入门',
  isbn: index === 9 ? '文本' : '98765757',
  type: index === 9 ? '文本' : '出版教材',
  date: index === 9 ? '文本' : '2022年7月',
  status: '待院系审核',
}))

function FieldControl({ kind }) {
  if (kind === 'input') return <DSInput className="detail-control" placeholder="请输入" />
  if (kind === 'switch') return <DSSwitch className="detail-switch" checkedText="" uncheckedText="" />
  if (kind === 'select') return <DSSelect className="detail-control" placeholder="请选择" options={[]} />
  if (kind === 'time') return <DSTimePicker className="detail-control" placeholder="请选择时间" />
  if (kind === 'time-range') return <div className="detail-range"><DSTimePicker className="detail-control" placeholder="开始时间" /><img src="./asset/icons/svg_a5c0e734.svg" alt="" /><DSTimePicker className="detail-control" placeholder="结束时间" /></div>
  if (kind === 'date-range') return <div className="detail-range"><DSDatePicker className="detail-control" placeholder="开始日期" /><img src="./asset/icons/svg_5fe6cd74.svg" alt="" /><DSDatePicker className="detail-control" placeholder="结束日期" /></div>
  return <DSDatePicker className="detail-control" placeholder="请选择日期" />
}

function FormSection({ id, fieldIdPrefix }) {
  return <section className="detail-form-subsection" id={id}>
    <DSGroupTitle className="detail-form-subtitle" title="标题名称" level={2} leading={<span className="detail-subtitle-mark" />} />
    <div className="detail-form-grid">
      {fieldKinds.map((kind, index) => <label className="detail-form-field" id={`${fieldIdPrefix}-${index + 1}`} key={`${fieldIdPrefix}-${index}`}>
        <span className="detail-form-field__label">标题名称</span>
        <span className="detail-form-field__control"><FieldControl kind={kind} /></span>
      </label>)}
    </div>
  </section>
}

function DetailTableAnchorPage() {
  const [activeAnchor, setActiveAnchor] = useState(() => (
    anchorItems.find((item) => item.href === window.location.hash)?.key || sections[0].key
  ))
  const back = () => window.history.back()
  return <main className="detail-table-anchor-page">
    <DSSubPageHeader className="detail-table-anchor-page__header" backLabel="返回" onBack={back} title="这里展示标题">
      <span className="detail-table-anchor-page__subtitle">副标题</span>
    </DSSubPageHeader>
    <div className="detail-table-anchor-page__body">
      <div className="detail-table-anchor-page__content">
        <section className="detail-form-section" id="form-one">
          <DSGroupTitle className="detail-group-title" title="分组标题" leading={<img src="./asset/icons/svg_ffe2a7f6.svg" alt="" />} />
          <FormSection id="subform-one" fieldIdPrefix="field-1" />
          <FormSection id="subform-two" fieldIdPrefix="field-2" />
        </section>
        <section className="detail-table-section" id="detail-table">
          <DSGroupTitle className="detail-group-title" title="分组标题" leading={<img src="./asset/icons/svg_ffe2a7f6.svg" alt="" />} />
          <DSDataTable
            className="detail-data-table"
            columns={[
              { key: 'name', dataIndex: 'name', title: '教材名称', width: 220 },
              { key: 'isbn', dataIndex: 'isbn', title: 'ISBN', width: 140 },
              { key: 'type', dataIndex: 'type', title: '教材类型', width: 140 },
              { key: 'date', dataIndex: 'date', title: '出版年月', width: 140 },
              { key: 'status', dataIndex: 'status', title: '审核状态', width: 150, render: (value) => <DSTag tone="blue">{value}</DSTag> },
            ]}
            data={rows}
            rowKey="id"
            showToolbar={false}
            selectable
            showIndex
            actions={[{ key: 'first', label: '按钮' }, { key: 'second', label: '按钮' }]}
            actionFixed
            minWidth={1054}
          />
        </section>
      </div>
      <aside className="detail-table-anchor-page__anchor">
        <DSAnchor className="detail-anchor" items={sections} activeKey={activeAnchor} direction="vertical" bordered offset aria-label="分组锚点" onChange={setActiveAnchor} />
      </aside>
    </div>
    <footer className="detail-table-anchor-page__footer">
      <DSButtonGroup aria-label="详情操作">
        <DSButton variant="primary">按钮</DSButton>
        <DSButton variant="default">按钮</DSButton>
      </DSButtonGroup>
    </footer>
  </main>
}

createRoot(document.getElementById('app')).render(<DetailTableAnchorPage />)
