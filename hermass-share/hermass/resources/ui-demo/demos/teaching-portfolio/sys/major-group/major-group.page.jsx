import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSDoubleEditModal,
  DSEditField,
  DSImportUpload,
  DSInput,
  DSModal,
  DSRegularListTemplate,
  DSSelect,
  DSSwitch,
  DSTabs,
  DSTag,
} from '@wisedu/design-system'
import './major-group.css'

const statusTone = {
  已启用: 'success',
  进行中: 'primary',
  待发布: 'primary',
  草稿: 'neutral',
  待完善: 'warning',
  已停用: 'neutral',
}

const collegeOptions = [
  '电子与通信工程学院',
  '人工智能学院',
  '机电工程学院',
]

const majorDictionaryOptions = [
  '电子信息工程技术',
  '通信工程',
  '物联网应用技术',
  '人工智能技术应用',
  '大数据技术',
  '软件技术',
  '智能制造技术',
  '工业机器人技术',
  '机电一体化技术',
]

// 专业数据（mock）
const initialMajors = [
  { id: 'm-01', college: '电子与通信工程学院', major: '电子信息工程技术', leader: '张明', maintainers: ['李华', '王强'] },
  { id: 'm-02', college: '电子与通信工程学院', major: '通信工程', leader: '李华', maintainers: ['张明'] },
  { id: 'm-03', college: '电子与通信工程学院', major: '物联网应用技术', leader: '王强', maintainers: ['李华'] },
  { id: 'm-04', college: '人工智能学院', major: '人工智能技术应用', leader: '陈伟', maintainers: ['刘芳', '赵敏'] },
  { id: 'm-05', college: '人工智能学院', major: '大数据技术', leader: '刘芳', maintainers: ['陈伟'] },
  { id: 'm-06', college: '人工智能学院', major: '软件技术', leader: '赵敏', maintainers: ['刘芳'] },
  { id: 'm-07', college: '机电工程学院', major: '智能制造技术', leader: '周涛', maintainers: ['吴刚', '孙丽'] },
  { id: 'm-08', college: '机电工程学院', major: '工业机器人技术', leader: '吴刚', maintainers: ['周涛'] },
  { id: 'm-09', college: '机电工程学院', major: '机电一体化技术', leader: '孙丽', maintainers: ['吴刚'] },
]

// 专业负责人字典（mock）
const leaderOptions = [
  '陈立群', '王晓东', '刘建国', '张明', '李华', '王强',
  '陈伟', '刘芳', '赵敏', '周涛', '吴刚', '孙丽',
  '钱学军', '孙志杰', '朱红梅', '杨光',
]

const initialMajorGroups = [
  {
    id: 'mg-01',
    name: '电子信息专业群',
    code: 'MG-EI-2026',
    college: '电子与通信工程学院',
    leader: '陈立群',
    majors: '电子信息工程技术、通信工程、物联网应用技术',
    status: '已启用',
    createdAt: '2026-06-01',
    references: { teachers: 86, courses: 4 },
  },
  {
    id: 'mg-02',
    name: '人工智能技术应用专业群',
    code: 'MG-AI-2026',
    college: '人工智能学院',
    leader: '王晓东',
    majors: '人工智能技术应用、大数据技术、软件技术',
    status: '已启用',
    createdAt: '2026-05-18',
    references: { teachers: 54, courses: 4 },
  },
  {
    id: 'mg-03',
    name: '智能制造专业群',
    code: 'MG-IM-2026',
    college: '机电工程学院',
    leader: '刘建国',
    majors: '智能制造技术、工业机器人技术、数字化设计与制造技术',
    status: '已停用',
    createdAt: '2026-06-12',
    references: { teachers: 0, courses: 0 },
  },
]

function nextMajorGroupCode(list) {
  return `MG-NEW-${String(list.length + 1).padStart(2, '0')}`
}

function createMajorGroupDraft(list) {
  const timestamp = Date.now()
  return {
    id: `mg-${timestamp}`,
    name: '新专业群',
    code: nextMajorGroupCode(list),
    college: collegeOptions[0],
    leader: '',
    majors: '',
    status: '已启用',
    createdAt: new Date().toISOString().slice(0, 10),
    references: { teachers: 0, courses: 0 },
  }
}

function MajorGroupWorkbench() {
  const [activeTab, setActiveTab] = useState('major-group')
  const [groups, setGroups] = useState(initialMajorGroups)
  const [majors, setMajors] = useState(initialMajors)
  const [groupFilters, setGroupFilters] = useState({ keyword: '', college: '全部学院' })
  const [majorFilters, setMajorFilters] = useState({ keyword: '' })
  const [editor, setEditor] = useState({ open: false, mode: 'create', draft: null })
  const [leaderEditor, setLeaderEditor] = useState({ open: false, draft: null })
  const [majorCreator, setMajorCreator] = useState({ open: false, college: '', major: '', leader: '', maintainers: [] })
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [deleteConfig, setDeleteConfig] = useState(null)
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 1600)
  }
  const change = (field, value) => setEditor((current) => ({
    ...current,
    draft: current.draft ? { ...current.draft, [field]: value } : current.draft,
  }))
  const openCreate = () => setEditor({ open: true, mode: 'create', draft: createMajorGroupDraft(groups) })
  const openEdit = (record) => setEditor({ open: true, mode: 'edit', draft: { ...record } })
  const closeEditor = () => setEditor({ open: false, mode: 'create', draft: null })

  const openLeaderEdit = (record) => setLeaderEditor({ open: true, draft: { ...record } })
  const closeLeaderEditor = () => setLeaderEditor({ open: false, draft: null })
  const saveLeader = () => {
    const draft = leaderEditor.draft
    if (!draft) return
    setMajors((current) => current.map((item) => (item.id === draft.id ? { ...item, leader: draft.leader, maintainers: draft.maintainers || [] } : item)))
    closeLeaderEditor()
    notify('专业负责人已保存')
  }

  const openMajorCreate = () => setMajorCreator({ open: true, college: '', major: '', leader: '', maintainers: [] })
  const closeMajorCreate = () => setMajorCreator({ open: false, college: '', major: '', leader: '', maintainers: [] })
  const saveMajor = () => {
    if (!majorCreator.college) {
      notify('请选择单位')
      return
    }
    if (!majorCreator.major) {
      notify('请选择专业')
      return
    }
    if (!majorCreator.leader) {
      notify('请选择专业负责人')
      return
    }
    if (majors.some((item) => item.college === majorCreator.college && item.major === majorCreator.major)) {
      notify('该单位已存在此专业')
      return
    }
    setMajors((current) => [{
      id: `m-${Date.now()}`,
      college: majorCreator.college,
      major: majorCreator.major,
      leader: majorCreator.leader,
      maintainers: majorCreator.maintainers,
    }, ...current])
    closeMajorCreate()
    notify('专业已新增')
  }

  const confirmImport = () => {
    if (!importFile) {
      notify('请先选择专业人员清单')
      return
    }
    setMajors((current) => current.map((item, index) => (
      index < 3 ? { ...item, maintainers: Array.from(new Set([...(item.maintainers || []), leaderOptions[index + 1]])) } : item
    )))
    setImportOpen(false)
    setImportFile(null)
    notify('专业人员清单导入成功，共更新 3 条记录')
  }

  const save = () => {
    const draft = editor.draft
    if (!draft?.name?.trim()) {
      notify('专业群名称不能为空')
      return
    }
    if (!draft?.code?.trim()) {
      notify('专业群编码不能为空')
      return
    }
    setGroups((current) => (
      editor.mode === 'create'
        ? [draft, ...current]
        : current.map((item) => (item.id === draft.id ? draft : item))
    ))
    closeEditor()
    notify(editor.mode === 'create' ? '专业群已新增' : '专业群已保存')
  }

  const requestDelete = (record) => {
    const hasReferences = record.references?.teachers > 0 || record.references?.courses > 0
    setDeleteConfig({ mode: hasReferences ? 'blocked' : 'normal', record })
  }
  const confirmDelete = () => {
    if (deleteConfig?.mode === 'normal') {
      setGroups((current) => current.filter((item) => item.id !== deleteConfig.record.id))
      notify('专业群已删除')
    }
    setDeleteConfig(null)
  }

  // 专业群筛选（去掉状态）
  const filteredGroups = useMemo(() => groups.filter((row) => {
    const keyword = groupFilters.keyword.trim().toLowerCase()
    if (keyword && !`${row.name}${row.code}`.toLowerCase().includes(keyword)) return false
    if (groupFilters.college !== '全部学院' && row.college !== groupFilters.college) return false
    return true
  }), [groupFilters, groups])

  // 专业筛选（只有专业搜索）
  const filteredMajors = useMemo(() => majors.filter((row) => {
    const keyword = majorFilters.keyword.trim().toLowerCase()
    if (keyword && !`${row.major}${row.college}`.toLowerCase().includes(keyword)) return false
    return true
  }), [majorFilters, majors])

  const groupFilterProps = useMemo(() => ({
    fields: [
      { key: 'keyword', label: '名称/编码', placeholder: '搜索专业群或编码', controlledValue: groupFilters.keyword, onChange: (event) => setGroupFilters((current) => ({ ...current, keyword: event.target.value })) },
      { key: 'college', label: '所属学院', type: 'select', options: ['全部学院', ...collegeOptions], controlledValue: groupFilters.college, onChange: (value) => setGroupFilters((current) => ({ ...current, college: value })) },
    ],
    showExpand: false,
    showMore: false,
    onSearch: () => notify('已按当前条件查询'),
    onReset: () => setGroupFilters({ keyword: '', college: '全部学院' }),
  }), [groupFilters])

  const majorFilterProps = useMemo(() => ({
    fields: [
      { key: 'keyword', label: '专业', placeholder: '搜索专业名称', controlledValue: majorFilters.keyword, onChange: (event) => setMajorFilters((current) => ({ ...current, keyword: event.target.value })) },
    ],
    showExpand: false,
    showMore: false,
    onSearch: () => notify('已按当前条件查询'),
    onReset: () => setMajorFilters({ keyword: '' }),
  }), [majorFilters])

  // 专业群表格列（加负责人）
  const groupColumns = [
    { key: 'name', dataIndex: 'name', title: '专业群名称', width: 200, fixed: 'left' },
    { key: 'code', dataIndex: 'code', title: '专业群编码', width: 140 },
    { key: 'college', dataIndex: 'college', title: '所属学院', width: 190 },
    { key: 'leader', dataIndex: 'leader', title: '专业群负责人', width: 120 },
    { key: 'majors', dataIndex: 'majors', title: '包含专业', width: 280 },
    { key: 'status', dataIndex: 'status', title: '状态', width: 100, render: (value) => <DSTag tone={statusTone[value] || 'neutral'}>{value}</DSTag> },
    { key: 'createdAt', dataIndex: 'createdAt', title: '创建时间', width: 120 },
  ]

  // 专业表格列（学院、专业、专业负责人）
  const majorColumns = [
    { key: 'college', dataIndex: 'college', title: '单位名称', width: 200, fixed: 'left' },
    { key: 'major', dataIndex: 'major', title: '专业名称', width: 200 },
    { key: 'leader', dataIndex: 'leader', title: '专业负责人', width: 120 },
    { key: 'maintainers', dataIndex: 'maintainers', title: '专业人员', width: 220, render: (value = []) => value.join('、') || '-' },
  ]

  const tabItems = [
    { key: 'major-group', label: '专业群' },
    { key: 'major', label: '专业' },
  ]

  return (
    <>
      <DSTabs items={tabItems} activeKey={activeTab} variant="section" onChange={setActiveTab} />

      {activeTab === 'major-group' && (
        <DSRegularListTemplate
          activeTab="all"
          className="sys-admin-major-group-list-table"
          footerActions={[]}
          flush
          metaLabel=""
          metaValue=""
          notice=""
          pagination={{ total: filteredGroups.length, totalPages: 1, current: 1, pageSize: 10 }}
          summary=""
          tabs={[]}
          tableTools={<></>}
          toolbarActions={[
            { key: 'create', label: '新增', variant: 'primary', onClick: openCreate },
          ]}
          filterProps={groupFilterProps}
          tableProps={{
            actions: [
              { key: 'edit', label: '编辑', onClick: openEdit },
              { key: 'delete', label: '删除', danger: true, onClick: requestDelete },
            ],
            actionsMaxVisible: 2,
            bordered: false,
            columns: groupColumns,
            data: filteredGroups,
            minWidth: 1000,
            rowKey: 'id',
            selectable: false,
            showIndex: true,
          }}
        />
      )}

      {activeTab === 'major' && (
        <DSRegularListTemplate
          activeTab="all"
          className="sys-admin-major-list-table"
          footerActions={[]}
          flush
          metaLabel=""
          metaValue=""
          notice=""
          pagination={{ total: filteredMajors.length, totalPages: 1, current: 1, pageSize: 10 }}
          summary=""
          tabs={[]}
          tableTools={<></>}
          toolbarActions={[
            { key: 'create', label: '新增', variant: 'primary', onClick: openMajorCreate },
            { key: 'import', label: '导入名单', variant: 'default', onClick: () => setImportOpen(true) },
          ]}
          filterProps={majorFilterProps}
          tableProps={{
            actions: [
              { key: 'edit-leader', label: '编辑', onClick: openLeaderEdit },
            ],
            actionsMaxVisible: 2,
            bordered: false,
            columns: majorColumns,
            data: filteredMajors,
            minWidth: 820,
            rowKey: 'id',
            selectable: false,
            showIndex: true,
          }}
        />
      )}

      <DSDoubleEditModal
        open={majorCreator.open}
        title="新增专业"
        okText="保存"
        onCancel={closeMajorCreate}
        onOk={saveMajor}
      >
        <DSEditField label="单位名称" required>
          <DSSelect
            searchable
            portal
            options={collegeOptions}
            value={majorCreator.college}
            placeholder="请选择单位"
            onChange={(value) => setMajorCreator((current) => ({ ...current, college: value }))}
          />
        </DSEditField>
        <DSEditField label="专业名称" required>
          <DSSelect
            searchable
            portal
            options={majorDictionaryOptions}
            value={majorCreator.major}
            placeholder="请选择专业"
            onChange={(value) => setMajorCreator((current) => ({ ...current, major: value }))}
          />
        </DSEditField>
        <DSEditField label="专业负责人" required>
          <DSSelect
            searchable
            portal
            options={leaderOptions}
            value={majorCreator.leader}
            placeholder="请选择专业负责人"
            onChange={(value) => setMajorCreator((current) => ({
              ...current,
              leader: value,
              maintainers: current.maintainers.filter((name) => name !== value),
            }))}
          />
        </DSEditField>
        <DSEditField label="专业人员" fullWidth className="sys-admin-maintainers-field">
          <DSSelect
            multiple
            searchable
            portal
            options={leaderOptions.filter((name) => name !== majorCreator.leader)}
            value={majorCreator.maintainers}
            placeholder="请选择专业人员，可多选"
            onChange={(values) => setMajorCreator((current) => ({ ...current, maintainers: values }))}
          />
        </DSEditField>
      </DSDoubleEditModal>

      <DSDoubleEditModal
        open={editor.open}
        title={editor.mode === 'edit' ? '编辑专业群' : '新增专业群'}
        okText="保存"
        onCancel={closeEditor}
        onOk={save}
      >
        {editor.draft ? (
          <>
            <DSEditField label="专业群名称" required>
              <DSInput value={editor.draft.name} placeholder="请输入专业群名称" onChange={(event) => change('name', event.target.value)} />
            </DSEditField>
            <DSEditField label="专业群编码" required>
              <DSInput value={editor.draft.code} placeholder="请输入专业群编码" onChange={(event) => change('code', event.target.value)} />
            </DSEditField>
            <DSEditField label="所属学院" required>
              <DSSelect options={collegeOptions} value={editor.draft.college} onChange={(value) => change('college', value)} />
            </DSEditField>
            <DSEditField label="专业群负责人">
              <DSSelect
                searchable
                portal
                options={leaderOptions}
                value={editor.draft.leader || ''}
                placeholder="请选择或筛选专业群负责人"
                onChange={(value) => change('leader', value)}
              />
            </DSEditField>
            <DSEditField label="包含专业" fullWidth>
              <DSSelect
                multiple
                searchable
                portal
                options={majorDictionaryOptions}
                value={editor.draft.majors ? editor.draft.majors.split('、').filter(Boolean) : []}
                placeholder="请选择专业字典项"
                onChange={(values) => change('majors', values.join('、'))}
              />
            </DSEditField>
            <DSEditField label="状态">
              <DSSwitch
                checked={editor.draft.status === '已启用'}
                checkedText="启用"
                uncheckedText="停用"
                onChange={(checked) => change('status', checked ? '已启用' : '已停用')}
              />
            </DSEditField>
          </>
        ) : null}
      </DSDoubleEditModal>

      <DSDoubleEditModal
        open={leaderEditor.open}
        title="编辑专业负责人"
        okText="保存"
        onCancel={closeLeaderEditor}
        onOk={saveLeader}
      >
        {leaderEditor.draft ? (
          <>
            <DSEditField label="学院">
              <DSInput value={leaderEditor.draft.college} disabled />
            </DSEditField>
            <DSEditField label="专业">
              <DSInput value={leaderEditor.draft.major} disabled />
            </DSEditField>
            <DSEditField label="专业负责人" required>
              <DSSelect
                searchable
                portal
                options={leaderOptions}
                value={leaderEditor.draft.leader || ''}
                placeholder="请选择专业负责人"
                onChange={(value) => setLeaderEditor((current) => ({
                  ...current,
                  draft: current.draft ? { ...current.draft, leader: value } : current.draft,
                }))}
              />
            </DSEditField>
            <DSEditField label="专业人员" fullWidth className="sys-admin-maintainers-field">
              <DSSelect
                multiple
                searchable
                portal
                options={leaderOptions.filter((name) => name !== leaderEditor.draft.leader)}
                value={leaderEditor.draft.maintainers || []}
                placeholder="请选择专业人员，可多选"
                onChange={(values) => setLeaderEditor((current) => ({
                  ...current,
                  draft: current.draft ? { ...current.draft, maintainers: values } : current.draft,
                }))}
              />
            </DSEditField>
          </>
        ) : null}
      </DSDoubleEditModal>

      <DSModal
        open={importOpen}
        title="导入专业人员清单"
        description="请使用模板维护单位、专业、专业负责人及专业人员。"
        okText="确认导入"
        onCancel={() => { setImportOpen(false); setImportFile(null) }}
        onOk={confirmImport}
      >
        <DSImportUpload
          file={importFile}
          title="上传专业人员清单"
          description="支持 .xlsx / .xls 文件，单个文件不超过 20MB。"
          templateText="下载专业人员导入模板"
          onChange={(event) => setImportFile(event.target.files?.[0] || null)}
          onTemplateDownload={() => notify('专业人员导入模板已下载')}
        />
      </DSModal>

      <DSModal
        open={Boolean(deleteConfig)}
        title={deleteConfig?.mode === 'blocked' ? '不可删除' : '确认删除专业群'}
        description={deleteConfig?.mode === 'blocked'
          ? `专业群「${deleteConfig?.record?.name}」已被教师或课程引用。`
          : `删除「${deleteConfig?.record?.name}」后不可恢复。`}
        okText={deleteConfig?.mode === 'blocked' ? '我知道了' : '确认删除'}
        danger={deleteConfig?.mode !== 'blocked'}
        showCancel={deleteConfig?.mode !== 'blocked'}
        onCancel={() => setDeleteConfig(null)}
        onOk={deleteConfig?.mode === 'blocked' ? () => setDeleteConfig(null) : confirmDelete}
      >
        <p className="sys-admin-muted">
          {deleteConfig?.mode === 'blocked'
            ? '当前专业群存在教师归属或课程关联，只允许停用，不允许直接删除。'
            : '删除前会再次校验教师归属和课程引用。'}
        </p>
      </DSModal>

      {toast ? <div className="sys-admin-status" role="status">{toast}</div> : null}
    </>
  )
}

function MajorGroupPage() {
  return (
    <main className="sys-admin-page sys-admin-page--major-group" data-ds-business-page="major-group">
      <MajorGroupWorkbench />
    </main>
  )
}

createRoot(document.getElementById('app')).render(<MajorGroupPage />)
