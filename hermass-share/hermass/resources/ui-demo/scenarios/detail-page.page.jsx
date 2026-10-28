import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { DSButton, DSButtonGroup, DSReadOnlyForm, DSSubPageHeader, DSTabs } from '@wisedu/design-system'
import './detail-page.css'

const tabs = [{ key: 'basic', label: '基本信息' }, { key: 'supplement', label: '补充信息' }, { key: 'record', label: '处理记录' }]
const basicInformation = [
  { key: 'name', label: '对象名称', value: '示例对象名称' }, { key: 'code', label: '对象编码', value: 'DEMO-20261011' },
  { key: 'organization', label: '所属单位', value: '示例单位 · 示例部门' }, { key: 'owner', label: '负责人', value: '示例负责人' },
  { key: 'createdAt', label: '创建时间', value: '2026-10-11 09:00:00' }, { key: 'updatedAt', label: '更新时间', value: '2026-10-11 16:00:00' },
]
const supplementInformation = [
  { key: 'category', label: '所属分类', value: '示例分类' }, { key: 'source', label: '数据来源', value: '系统录入' },
  { key: 'remark', label: '备注说明', value: '此处承载业务对象的补充说明；内容较长时在当前详情页连续阅读。', fullWidth: true, align: 'start' },
]
const recordInformation = [
  { key: 'submittedAt', label: '提交时间', value: '2026-10-10 14:30:00' }, { key: 'operator', label: '处理人员', value: '示例用户' },
  { key: 'result', label: '处理结果', value: '已完成' },
  { key: 'recordRemark', label: '处理意见', value: '处理记录作为详情页的独立页签展示。', fullWidth: true, align: 'start' },
]
const sectionByTab = {
  basic: { title: '基本信息', items: basicInformation, columns: 3 },
  supplement: { title: '补充信息', items: supplementInformation, columns: 2 },
  record: { title: '处理记录', items: recordInformation, columns: 2 },
}

function DetailPage() {
  const [activeTab, setActiveTab] = useState('basic')
  const section = sectionByTab[activeTab]
  const back = () => window.history.back()
  return <main className="detail-page">
    <div className="detail-page__shell">
      <DSSubPageHeader actions={<DSButton variant="default" onClick={back}>返回列表</DSButton>} className="detail-page__header" surface={false} title="对象详情" />
      <DSTabs activeKey={activeTab} className="detail-page__tabs" items={tabs} onChange={setActiveTab} />
      <div className="detail-page__content"><section className="detail-page__section"><h2 className="detail-page__section-title">{section.title}</h2><DSReadOnlyForm columns={section.columns} items={section.items} labelWidth={110} /></section></div>
      <footer className="detail-page__footer"><DSButtonGroup aria-label="详情页操作"><DSButton variant="default" onClick={back}>返回</DSButton></DSButtonGroup></footer>
    </div>
  </main>
}

createRoot(document.getElementById('app')).render(<DetailPage />)
