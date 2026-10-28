import { createRoot } from 'react-dom/client'
import { useMemo, useState } from 'react'
import {
  DSButton,
  DSCard,
  DSCardListTemplate,
  DSEditField,
  DSEditForm,
  DSEmptyState,
  DSInput,
  DSModal,
  DSSelect,
} from '@wisedu/design-system'
import { defineOntologyFields } from '@wisedu/hr-domain/fields'
import './vote-project.css'

const PAGE_GENERATION_CONTRACT = 'v1'

// 字段一律回溯 ontology 单源（AGENTS.md 字段铁律），页面只声明展示约束
const FIELDS = Object.fromEntries(
  defineOntologyFields([
    { fieldRef: 'Business.vote.voteProjectName', product: { width: 240 } },
    { fieldRef: 'Business.vote.voteObjectCount', product: { width: 110, align: 'right' } },
    { fieldRef: 'Business.vote.reviewStatus', product: { width: 110 } },
    { fieldRef: 'Business.vote.voteMode', product: { width: 110 } },
    { fieldRef: 'Business.vote.votePeriod', product: { width: 200 } },
  ]).map((field) => [field.fieldRef, field]),
)

const FEATURE_LABELS = (typeof window !== 'undefined' && window.VoteAppFrame && window.VoteAppFrame.FEATURE_LABELS) || {}

// 状态语义映射：一律落在设计系统六色内（灰/蓝/绿/橙/红/青）
const STATUS_TONE = { 未开启: 'gray', 投票中: 'blue', 已完成: 'teal', 已关闭: 'gray' }
const STATUS_OPTIONS = ['未开启', '投票中', '已完成', '已关闭']
const MODE_OPTIONS = ['表决', '打分']

const INITIAL_PROJECTS = [
  { id: 'vp-2026-1', name: '2026年度专业技术职务评聘（第一轮）', objectCount: 42, status: '投票中', mode: '表决', period: '2026-10-08 至 10-10', closed: false },
  { id: 'vp-2026-2', name: '2026年教学科研型岗位聘任评议', objectCount: 28, status: '未开启', mode: '打分', period: '待开启', closed: false },
  { id: 'vp-2026-3', name: '2026年高层次人才引进评审', objectCount: 16, status: '已完成', mode: '表决', period: '2026-09-20 至 09-22', closed: false },
  { id: 'vp-2025-8', name: '2025年度辅导员岗位聘期考核评议', objectCount: 35, status: '已关闭', mode: '打分', period: '2025-11-10 至 11-12', closed: true },
  { id: 'vp-2025-7', name: '2025年行政管理岗位晋升评议', objectCount: 21, status: '已关闭', mode: '表决', period: '2025-09-15 至 09-17', closed: true },
]

function VoteProjectPage() {
  const [tab, setTab] = useState('open')
  const [draftFilters, setDraftFilters] = useState({ keyword: '', status: '' })
  const [filters, setFilters] = useState({ keyword: '', status: '' })
  const [projects, setProjects] = useState(INITIAL_PROJECTS)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', mode: '表决' })
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2000)
  }

  const visible = useMemo(() => projects.filter((project) => {
    if (tab === 'open' && project.closed) return false
    if (filters.keyword && !project.name.includes(filters.keyword.trim())) return false
    if (filters.status && project.status !== filters.status) return false
    return true
  }), [projects, tab, filters])

  const openCreate = (preset) => {
    setForm(preset || { name: '', mode: '表决' })
    setEditing({ mode: preset ? 'template' : 'create' })
  }

  const submit = () => {
    if (!form.name.trim()) {
      notify('请输入投票项目名称')
      return
    }
    setProjects((previous) => [{
      id: `vp-${Date.now()}`,
      name: form.name.trim(),
      objectCount: 0,
      status: '未开启',
      mode: form.mode,
      period: '待开启',
      closed: false,
    }, ...previous])
    setEditing(null)
    notify(editing && editing.mode === 'template' ? '已按模板创建投票项目' : '已创建投票项目')
  }

  const renderCard = (card) => {
    const project = card.project
    return (
      <DSCard
        key={project.id}
        className="vp-card"
        title={project.name}
        status={project.status}
        statusTone={STATUS_TONE[project.status] || 'gray'}
        fields={[
          { label: FIELDS['Business.vote.voteObjectCount'].label, value: `${project.objectCount} 人` },
          { label: FIELDS['Business.vote.voteMode'].label, value: project.mode },
          { label: FIELDS['Business.vote.votePeriod'].label, value: project.period },
        ]}
        actions={[
          { key: 'config', label: '配置', onClick: () => notify(`进入《${project.name}》配置`) },
          { key: 'copy', label: '复制', onClick: () => notify(`已复制《${project.name}》`) },
          { key: 'delete', label: '删除', danger: true, onClick: () => notify('已删除（演示）') },
        ]}
        onClick={() => notify(`打开《${project.name}》`)}
      />
    )
  }

  return (
    <main className="vote-project-page" data-ds-business-page="vote-project">
      <DSCardListTemplate
        className="vp-shell"
        tabs={[{ key: 'open', label: '未关闭项目' }, { key: 'all', label: '全部项目' }]}
        activeTab={tab}
        onTabChange={setTab}
        metaLabel=""
        metaValue=""
        filterProps={{
          fields: [
            {
              key: 'keyword',
              label: FIELDS['Business.vote.voteProjectName'].label,
              placeholder: '请输入项目名称',
              controlledValue: draftFilters.keyword,
              onChange: (event) => setDraftFilters((previous) => ({ ...previous, keyword: event.target?.value ?? event })),
            },
            {
              key: 'status',
              label: FIELDS['Business.vote.reviewStatus'].label,
              type: 'select',
              options: [{ label: '全部', value: '' }, ...STATUS_OPTIONS.map((item) => ({ label: item, value: item }))],
              controlledValue: draftFilters.status,
              onChange: (value) => setDraftFilters((previous) => ({ ...previous, status: value })),
            },
          ],
          collapsedRows: 1,
          showExpand: false,
          showMore: false,
          onSearch: () => setFilters(draftFilters),
          onReset: () => {
            const empty = { keyword: '', status: '' }
            setDraftFilters(empty)
            setFilters(empty)
          },
        }}
        toolbarActions={[
          { key: 'create', label: '新增投票项目', variant: 'primary', onClick: () => openCreate(null) },
          { key: 'template', label: '使用模板创建', onClick: () => openCreate({ name: '2026年度专业技术职务评聘（按模板）', mode: '表决' }) },
        ]}
        tableTools={<span />}
        cards={visible.map((project) => ({ id: project.id, project }))}
        renderCard={renderCard}
        empty={<DSEmptyState title="暂无符合条件的投票项目" />}
        pagination={{ total: visible.length, totalPages: 1, current: 1, pageSize: 12 }}
      />

      <DSModal
        open={Boolean(editing)}
        title={editing && editing.mode === 'template' ? '使用模板创建投票项目' : '新增投票项目'}
        okText="保存"
        cancelText="取消"
        onOk={submit}
        onCancel={() => setEditing(null)}
      >
        <DSEditForm columns={1}>
          <DSEditField label={FIELDS['Business.vote.voteProjectName'].label} required htmlFor="vp-project-name">
            <DSInput
              id="vp-project-name"
              value={form.name}
              placeholder="请输入投票项目名称"
              onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
            />
          </DSEditField>
          <DSEditField label={FIELDS['Business.vote.voteMode'].label} required htmlFor="vp-project-mode">
            <DSSelect
              id="vp-project-mode"
              value={form.mode}
              options={MODE_OPTIONS.map((item) => ({ label: item, value: item }))}
              onChange={(value) => setForm((previous) => ({ ...previous, mode: value }))}
            />
          </DSEditField>
        </DSEditForm>
      </DSModal>

      {toast ? <div className="vp-toast" role="status" aria-live="polite">{toast}</div> : null}
    </main>
  )
}

VoteProjectPage.FEATURE_LABELS = FEATURE_LABELS
createRoot(document.getElementById('app')).render(<VoteProjectPage />)
