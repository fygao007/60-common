import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import {
  DSButton,
  DSButtonGroup,
  DSEditField,
  DSEditForm,
  DSFormGroup,
  DSInput,
  DSSelect,
  DSSubPageHeader,
  DSTabs,
  DSTextarea,
} from '@wisedu/design-system'
import './detail-page-settings.css'

const tabs = [
  { key: 'basic', label: '基本设置' },
  { key: 'display', label: '展示设置' },
  { key: 'fields', label: '字段设置' },
]

function BasicSettings() {
  return <DSFormGroup title="基本信息">
    <DSEditForm columns={2}>
      <DSEditField required label="页面名称" htmlFor="page-name"><DSInput id="page-name" defaultValue="对象详情" /></DSEditField>
      <DSEditField required label="页面编码" htmlFor="page-code"><DSInput id="page-code" defaultValue="object-detail" /></DSEditField>
      <DSEditField label="所属分类" htmlFor="page-category"><DSSelect id="page-category" defaultValue="业务详情" options={[{ value: 'business', label: '业务详情' }, { value: 'archive', label: '档案详情' }]} /></DSEditField>
      <DSEditField label="默认页签" htmlFor="default-tab"><DSSelect id="default-tab" defaultValue="basic" options={[{ value: 'basic', label: '基本信息' }, { value: 'supplement', label: '补充信息' }]} /></DSEditField>
      <DSEditField label="页面说明" htmlFor="page-description" fullWidth align="start"><DSTextarea id="page-description" rows={3} defaultValue="用于查看业务对象的完整信息，并按页签展示分类内容。" /></DSEditField>
    </DSEditForm>
  </DSFormGroup>
}

function DisplaySettings() {
  return <DSFormGroup title="展示方式">
    <DSEditForm columns={2}>
      <DSEditField label="内容布局" htmlFor="content-layout"><DSSelect id="content-layout" defaultValue="group" options={[{ value: 'group', label: '分组展示' }, { value: 'plain', label: '连续展示' }]} /></DSEditField>
      <DSEditField label="字段列数" htmlFor="field-columns"><DSSelect id="field-columns" defaultValue="3" options={[{ value: '2', label: '两列' }, { value: '3', label: '三列' }]} /></DSEditField>
      <DSEditField label="空值展示" htmlFor="empty-value"><DSInput id="empty-value" defaultValue="--" /></DSEditField>
      <DSEditField label="返回地址" htmlFor="back-route"><DSInput id="back-route" defaultValue="返回列表页" /></DSEditField>
    </DSEditForm>
  </DSFormGroup>
}

function FieldSettings() {
  return <DSFormGroup title="字段范围">
    <DSEditForm columns={2}>
      <DSEditField label="基础字段组" htmlFor="basic-group"><DSInput id="basic-group" defaultValue="基本信息" /></DSEditField>
      <DSEditField label="扩展字段组" htmlFor="extra-group"><DSInput id="extra-group" defaultValue="补充信息" /></DSEditField>
      <DSEditField label="处理记录组" htmlFor="record-group"><DSInput id="record-group" defaultValue="处理记录" /></DSEditField>
      <DSEditField label="字段配置方式" htmlFor="field-mode"><DSSelect id="field-mode" defaultValue="manual" options={[{ value: 'manual', label: '手动配置' }, { value: 'reference', label: '引用字段模型' }]} /></DSEditField>
    </DSEditForm>
  </DSFormGroup>
}

function DetailPageSettings() {
  const [activeTab, setActiveTab] = useState('basic')
  const content = activeTab === 'basic' ? <BasicSettings /> : activeTab === 'display' ? <DisplaySettings /> : <FieldSettings />
  const back = () => window.history.back()
  return <main className="detail-settings-page">
    <div className="detail-settings-page__shell">
      <DSSubPageHeader title="详情页设置" actions={<DSButton variant="default" onClick={back}>返回列表</DSButton>} className="detail-settings-page__header" surface={false} />
      <DSTabs activeKey={activeTab} className="detail-settings-page__tabs" items={tabs} onChange={setActiveTab} />
      <div className="detail-settings-page__content">{content}</div>
      <footer className="detail-settings-page__footer"><DSButtonGroup aria-label="详情页设置操作"><DSButton variant="default" onClick={back}>取消</DSButton><DSButton onClick={() => window.alert('设置已保存')}>保存</DSButton></DSButtonGroup></footer>
    </div>
  </main>
}

createRoot(document.getElementById('app')).render(<DetailPageSettings />)
