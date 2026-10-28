import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSButton,
  DSDataTable,
  DSEditField,
  DSInput,
  DSModal,
  DSRegularListTemplate,
  DSSelect,
  DSSingleEditModal,
  DSTag,
} from '@wisedu/design-system'
import './audit-config.css'

/* ═══════════════ 流程定义管理列表 ═══════════════ */

const statusTone = {
  未发布: 'warning',
  已发布: 'success',
}

const sourceTone = {
  线下: 'warning',
  线上: 'success',
}

const flowTypeOptions = ['钉钉风格流程图', '飞龙流程图', 'oa流程图', '普通风格流程图']
const appOptions = ['教学档案袋', '人事系统', '教务系统', '组织机构', '数据采集']

const initialFlows = [
  { id: 'flow-01', name: '学期教学档案考核（标准）', key: 'term_archive_audit__tp', category: '考核审核', isStateMachine: true, designerFormat: 'json', flowType: '钉钉风格流程图', app: '教学档案袋', module: '-', status: '已发布', source: '线下', version: 6, versionActive: true, publishTime: '2026-06-15 09:30:00', createTime: '2026-05-01 10:00:00' },
  { id: 'flow-02', name: '双高专业群支撑材料考核', key: 'double_high_audit__tp', category: '考核审核', isStateMachine: true, designerFormat: 'json', flowType: '钉钉风格流程图', app: '教学档案袋', module: '-', status: '已发布', source: '线下', version: 3, versionActive: true, publishTime: '2026-06-10 14:20:00', createTime: '2026-04-15 09:30:00' },
  { id: 'flow-03', name: '青年教师教学成长考核', key: 'young_teacher_audit__tp', category: '考核审核', isStateMachine: true, designerFormat: 'json', flowType: '钉钉风格流程图', app: '教学档案袋', module: '-', status: '已发布', source: '线下', version: 2, versionActive: true, publishTime: '2026-05-20 11:00:00', createTime: '2026-03-10 08:45:00' },
  { id: 'flow-04', name: '教学档案袋提交流程', key: 'archive_submit__tp', category: '材料提交', isStateMachine: true, designerFormat: 'json', flowType: '钉钉风格流程图', app: '教学档案袋', module: '-', status: '已发布', source: '线下', version: 8, versionActive: true, publishTime: '2026-01-10 16:00:00', createTime: '2025-12-01 09:00:00' },
  { id: 'flow-05', name: '成果认定审核流程', key: 'achievement_audit__tp', category: '成果认定', isStateMachine: true, designerFormat: 'json', flowType: '飞龙流程图', app: '教学档案袋', module: '-', status: '未发布', source: '线下', version: 1, versionActive: true, publishTime: '', createTime: '2026-06-20 10:30:00' },
  { id: 'flow-06', name: '职称评审材料审核流程', key: 'title_review_audit__tp', category: '职称评审', isStateMachine: true, designerFormat: 'json', flowType: '钉钉风格流程图', app: '教学档案袋', module: '-', status: '已发布', source: '线下', version: 4, versionActive: true, publishTime: '2026-04-01 09:00:00', createTime: '2026-02-15 14:00:00' },
  { id: 'flow-07', name: '教学档案袋归档流程', key: 'archive_filing__tp', category: '归档管理', isStateMachine: false, designerFormat: 'flowlong', flowType: '飞龙流程图', app: '教学档案袋', module: '-', status: '已发布', source: '线下', version: 5, versionActive: true, publishTime: '2026-03-15 10:00:00', createTime: '2026-01-20 11:30:00' },
  { id: 'flow-08', name: '教学信息变更审批流程', key: 'teaching_info_change__tp', category: '信息变更', isStateMachine: true, designerFormat: 'json', flowType: '钉钉风格流程图', app: '教学档案袋', module: '-', status: '已发布', source: '线下', version: 2, versionActive: true, publishTime: '2026-02-28 15:30:00', createTime: '2026-01-05 09:15:00' },
  { id: 'flow-09', name: '教学档案袋数据补正流程', key: 'data_correction__tp', category: '数据补正', isStateMachine: false, designerFormat: 'flowlong', flowType: '飞龙流程图', app: '教学档案袋', module: '-', status: '未发布', source: '线下', version: 1, versionActive: true, publishTime: '', createTime: '2026-06-25 08:00:00' },
  { id: 'flow-10', name: '教学档案袋批量导入审核流程', key: 'batch_import_audit__tp', category: '批量导入', isStateMachine: true, designerFormat: 'json', flowType: '钉钉风格流程图', app: '教学档案袋', module: '-', status: '已发布', source: '线下', version: 3, versionActive: true, publishTime: '2026-05-10 14:00:00', createTime: '2026-04-01 10:00:00' },
]

function notify(setMessage, text) {
  setMessage(text)
  window.setTimeout(() => setMessage(''), 1800)
}

function FlowDefinitionWorkbench() {
  const [flows, setFlows] = useState(initialFlows)
  const [filters, setFilters] = useState({ name: '', key: '', status: '全部', app: '全部', module: '全部' })
  const [editor, setEditor] = useState({ open: false, mode: 'create', draft: null })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [publishTarget, setPublishTarget] = useState(null)
  const [messageText, setMessageText] = useState('')

  const showMessage = (text) => notify(setMessageText, text)

  const openCreate = () => setEditor({
    open: true,
    mode: 'create',
    draft: {
      id: `flow-${Date.now()}`,
      name: '',
      key: '',
      category: '默认',
      isStateMachine: true,
      designerFormat: 'json',
      flowType: '钉钉风格流程图',
      app: '',
      module: '-',
      status: '未发布',
      source: '线下',
      version: 1,
      versionActive: true,
      publishTime: '',
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    },
  })

  const openEdit = (record) => setEditor({ open: true, mode: 'edit', draft: { ...record } })
  const closeEditor = () => setEditor({ open: false, mode: 'create', draft: null })

  const changeDraft = (field, value) => setEditor((current) => ({
    ...current,
    draft: current.draft ? { ...current.draft, [field]: value } : current.draft,
  }))

  const saveDraft = () => {
    const { draft, mode } = editor
    if (!draft?.name?.trim()) {
      showMessage('流程名称不能为空')
      return
    }
    if (!draft?.key?.trim()) {
      showMessage('流程标识不能为空')
      return
    }
    setFlows((current) => (
      mode === 'create'
        ? [draft, ...current]
        : current.map((item) => (item.id === draft.id ? draft : item))
    ))
    closeEditor()
    showMessage(mode === 'create' ? '流程已新增' : '流程已保存')
  }

  const requestDelete = (record) => setDeleteTarget(record)
  const confirmDelete = () => {
    if (deleteTarget) {
      setFlows((current) => current.filter((item) => item.id !== deleteTarget.id))
      showMessage('流程已删除')
    }
    setDeleteTarget(null)
  }

  const requestPublish = (record) => {
    if (record.status === '已发布') {
      showMessage('该流程已发布')
      return
    }
    setPublishTarget(record)
  }
  const confirmPublish = () => {
    if (publishTarget) {
      setFlows((current) => current.map((item) => (
        item.id === publishTarget.id
          ? { ...item, status: '已发布', publishTime: new Date().toISOString().slice(0, 19).replace('T', ' ') }
          : item
      )))
      showMessage('流程已发布')
    }
    setPublishTarget(null)
  }

  const filtered = useMemo(() => flows.filter((row) => {
    if (filters.name && !row.name.toLowerCase().includes(filters.name.toLowerCase())) return false
    if (filters.key && !row.key.toLowerCase().includes(filters.key.toLowerCase())) return false
    if (filters.status !== '全部' && row.status !== filters.status) return false
    if (filters.app !== '全部' && row.app !== filters.app) return false
    if (filters.module !== '全部' && row.module !== filters.module) return false
    return true
  }), [filters, flows])

  const filterProps = useMemo(() => ({
    fields: [
      { key: 'name', label: '流程名称', placeholder: '流程名称', controlledValue: filters.name, onChange: (event) => setFilters((current) => ({ ...current, name: event.target.value })) },
      { key: 'key', label: '流程标识', placeholder: '流程标识', controlledValue: filters.key, onChange: (event) => setFilters((current) => ({ ...current, key: event.target.value })) },
      { key: 'status', label: '发布状态', type: 'select', options: ['全部', '未发布', '已发布'], controlledValue: filters.status, onChange: (value) => setFilters((current) => ({ ...current, status: value })) },
      { key: 'app', label: '所属应用', type: 'select', options: ['全部', ...appOptions], controlledValue: filters.app, onChange: (value) => setFilters((current) => ({ ...current, app: value })) },
      { key: 'module', label: '所属模块', type: 'select', options: ['全部'], controlledValue: filters.module, onChange: (value) => setFilters((current) => ({ ...current, module: value })) },
    ],
    showExpand: false,
    showMore: false,
    onSearch: () => showMessage('已按当前条件查询'),
    onReset: () => setFilters({ name: '', key: '', status: '全部', app: '全部', module: '全部' }),
  }), [filters])

  const columns = [
    { key: 'name', dataIndex: 'name', title: '流程名称', width: 200, fixed: 'left', render: (value) => <b>{value}</b> },
    { key: 'key', dataIndex: 'key', title: '流程标识', width: 200 },
    { key: 'category', dataIndex: 'category', title: '流程分类', width: 150 },
    { key: 'isStateMachine', dataIndex: 'isStateMachine', title: '是否状态机', width: 150, render: (value) => value ? '是' : '否' },
    { key: 'designerFormat', dataIndex: 'designerFormat', title: '设计器数据格式', width: 150 },
    { key: 'flowType', dataIndex: 'flowType', title: '流程图类型', width: 150 },
    { key: 'app', dataIndex: 'app', title: '所属应用', width: 150 },
    { key: 'module', dataIndex: 'module', title: '所属模块', width: 120 },
    { key: 'status', dataIndex: 'status', title: '发布状态', width: 120, render: (value) => <DSTag tone={statusTone[value] || 'neutral'}>{value}</DSTag> },
    { key: 'source', dataIndex: 'source', title: '流程来源', width: 100, render: (value) => <DSTag tone={sourceTone[value] || 'neutral'}>{value}</DSTag> },
    { key: 'version', title: '流程主版本', width: 140, render: (_, record) => (
      <span className="flow-version-tags">
        <DSTag tone="primary">V:{record.version}</DSTag>
        {record.versionActive && <DSTag tone="success">激活</DSTag>}
      </span>
    ) },
    { key: 'publishTime', dataIndex: 'publishTime', title: '发布时间', width: 170 },
    { key: 'createTime', dataIndex: 'createTime', title: '创建时间', width: 170 },
  ]

  const actions = useMemo(() => [
    { key: 'edit', label: '编辑', onClick: openEdit },
    { key: 'delete', label: '删除', danger: true, onClick: requestDelete },
    { key: 'publish', label: '发布', onClick: requestPublish, disabled: (record) => record.status === '已发布' },
    { key: 'versionManage', label: '版本管理', disabled: (record) => record.status === '未发布' },
  ], [])

  return (
    <>
      <DSRegularListTemplate
        activeTab="all"
        className="flow-definition-list"
        flush
        metaLabel=""
        metaValue=""
        notice=""
        pagination={{ total: filtered.length, totalPages: 1, current: 1, pageSize: 10 }}
        summary=""
        tabs={[]}
        tableTools={false}
        footerActions={[]}
        toolbarActions={[{ key: 'create', label: '新增流程', variant: 'primary', onClick: openCreate }]}
        filterProps={filterProps}
        tableProps={{
          actions,
          actionsMaxVisible: 4,
          bordered: false,
          columns,
          data: filtered,
          minWidth: 2200,
          rowKey: 'id',
          selectable: false,
          showIndex: false,
        }}
      />

      {messageText ? <div className="sys-admin-status" role="status">{messageText}</div> : null}

      <DSSingleEditModal
        open={editor.open}
        title={`${editor.mode === 'create' ? '新增' : '编辑'}流程`}
        onCancel={closeEditor}
        onOk={saveDraft}
      >
        <DSEditField label="流程名称" required>
          <DSInput value={editor.draft?.name || ''} placeholder="请输入流程名称" onChange={(event) => changeDraft('name', event.target.value)} />
        </DSEditField>
        <DSEditField label="流程标识" required>
          <DSInput value={editor.draft?.key || ''} placeholder="请输入流程标识" onChange={(event) => changeDraft('key', event.target.value)} />
        </DSEditField>
        <DSEditField label="流程分类">
          <DSSelect options={['默认']} value={editor.draft?.category || '默认'} onChange={(value) => changeDraft('category', value)} />
        </DSEditField>
        <DSEditField label="是否状态机">
          <DSSelect options={['是', '否']} value={editor.draft?.isStateMachine ? '是' : '否'} onChange={(value) => changeDraft('isStateMachine', value === '是')} />
        </DSEditField>
        <DSEditField label="设计器数据格式">
          <DSSelect options={['json', 'flowlong']} value={editor.draft?.designerFormat || 'json'} onChange={(value) => changeDraft('designerFormat', value)} />
        </DSEditField>
        <DSEditField label="流程图类型">
          <DSSelect options={flowTypeOptions} value={editor.draft?.flowType || '钉钉风格流程图'} onChange={(value) => changeDraft('flowType', value)} />
        </DSEditField>
        <DSEditField label="所属应用">
          <DSSelect searchable options={appOptions} value={editor.draft?.app || ''} placeholder="请选择所属应用" onChange={(value) => changeDraft('app', value)} />
        </DSEditField>
        <DSEditField label="流程来源">
          <DSSelect options={['线下', '线上']} value={editor.draft?.source || '线下'} onChange={(value) => changeDraft('source', value)} />
        </DSEditField>
      </DSSingleEditModal>

      <DSModal
        open={Boolean(deleteTarget)}
        title="确认删除"
        danger
        okText="删除"
        onCancel={() => setDeleteTarget(null)}
        onOk={confirmDelete}
      >
        <p className="sys-admin-muted">删除流程"{deleteTarget?.name}"后无法恢复，请确认是否继续。</p>
      </DSModal>

      <DSModal
        open={Boolean(publishTarget)}
        title="确认发布"
        okText="确认发布"
        onCancel={() => setPublishTarget(null)}
        onOk={confirmPublish}
      >
        <p className="sys-admin-muted">发布流程"{publishTarget?.name}"后，相关业务将立即生效。</p>
      </DSModal>
    </>
  )
}

function FlowDefinitionPage() {
  return (
    <main className="sys-admin-page sys-admin-page--flow-definition" data-ds-business-page="audit-config">
      <FlowDefinitionWorkbench />
    </main>
  )
}

createRoot(document.getElementById('app')).render(<FlowDefinitionPage />)