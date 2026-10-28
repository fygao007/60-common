import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSAnchor,
  DSButton,
  DSDataTable,
  DSDoubleEditModal,
  DSEditField,
  DSInput,
  DSModal,
  DSReadOnlyField,
  DSReadOnlyForm,
  DSSubPageHeader,
  DSTextarea,
} from '@wisedu/design-system'
import './major-construction.css'

// ========== 数据定义 ==========

const SECTIONS = [
  { key: 'basic-info', title: '专业群基本信息' },
  { key: 'construction-idea', title: '专业群建设理念' },
  { key: 'team-building', title: '队伍建设' },
  { key: 'main-results', title: '主要成果' },
  { key: 'related-work', title: '相关工作' },
  { key: 'construction-experience', title: '专业群建设经验' },
]

const ANCHOR_ITEMS = SECTIONS.map((section) => ({
  key: section.key,
  href: `#${section.key}`,
  title: section.title,
}))

// 分组1：专业群基本信息（两列详情表单）
const BASIC_INFO_FIELDS = [
  { key: 'name', label: '专业群名称', value: '软件技术专业群' },
  { key: 'code', label: '专业群代码', value: 'SZPT-MAJOR-001' },
  { key: 'college', label: '所属学院', value: '电子与通信工程学院' },
  { key: 'leader', label: '专业群负责人', value: '金晓智' },
  { key: 'period', label: '建设周期', value: '2024-2027' },
  { key: 'level', label: '专业群层级', value: '省级高水平专业群' },
  { key: 'majors', label: '包含专业', value: '软件技术、人工智能技术应用、大数据技术、云计算技术应用', full: true },
  { key: 'industry', label: '服务产业领域', value: '软件与信息服务、人工智能、大数据与云计算' },
  { key: 'status', label: '建设状态', value: '建设中' },
  { key: 'intro', label: '专业群简介', value: '软件技术专业群以软件技术为核心，整合人工智能、大数据、云计算等新兴技术领域，面向软件与信息服务产业，培养具有软件开发、数据分析、智能应用设计能力的高素质技术技能人才。专业群坚持产教融合、校企合作，构建"平台+模块+方向"的课程体系，形成"基础共享、核心分立、拓展互选"的专业群课程结构。', full: true, align: 'start' },
]

// 分组2：专业群建设理念（表格展示）
const IDEA_COLUMNS = [
  { key: 'title', dataIndex: 'title', title: '建设理念标题', minWidth: 180 },
  { key: 'content', dataIndex: 'content', title: '建设理念内容', minWidth: 280 },
  { key: 'goal', dataIndex: 'goal', title: '建设目标', minWidth: 180 },
  { key: 'approach', dataIndex: 'approach', title: '建设思路', minWidth: 180 },
  { key: 'positioning', dataIndex: 'positioning', title: '特色定位', minWidth: 150 },
  { key: 'service', dataIndex: 'service', title: '服务面向', minWidth: 150 },
]

const IDEA_DATA = [
  { id: 'idea-1', title: '产教深度融合', content: '以产业需求为导向，校企协同制定人才培养方案', goal: '建成省级产教融合示范基地', approach: '引入企业真实项目，共建实训基地', positioning: '区域软件产业服务高地', service: '深圳软件产业' },
  { id: 'idea-2', title: '课程体系重构', content: '构建平台+模块+方向的课程体系', goal: '形成可推广的专业群课程模式', approach: '基础共享、核心分立、拓展互选', positioning: '模块化课程体系', service: '职业教育改革' },
]

// 分组3：队伍建设（表单展示）
// 2 列网格：普通字段成对占一行，fullWidth 字段独占整行。
// 因此普通字段必须两两配对，fullWidth 字段必须排在所有普通字段之后。
const TEAM_FIELDS = [
  { key: 'team-name', label: '团队名称', value: '软件技术专业群教学团队' },
  { key: 'team-leader', label: '团队负责人', value: '金晓智' },
  { key: 'double-teacher-count', label: '双师型教师数量', value: '18人' },
  { key: 'key-teacher-count', label: '骨干教师数量', value: '8人' },
  // 以上 4 个普通字段两两配对，占 2 行
  { key: 'team-members', label: '团队成员', value: '32人（含校内外成员，含企业导师6人）', full: true },
  { key: 'enterprise-mentor-count', label: '企业导师数量', value: '来自腾讯、华为、深信服等企业，共6人', full: true },
  { key: 'team-measures', label: '团队建设举措', value: '实施"双师型"教师培养计划，建立企业实践轮训机制，开展教学能力提升培训，组织教师参加技能竞赛和教学比赛。', full: true, align: 'start' },
  { key: 'teacher-training', label: '师资培养情况', value: '每年安排2-3名教师到企业实践，定期开展教学研讨和课程建设培训，鼓励教师攻读博士学位和参加学术交流。', full: true, align: 'start' },
  { key: 'team-effect', label: '团队建设成效', value: '团队获评省级优秀教学团队，双师型教师占比达56%，骨干教师主持省级教改项目3项，企业导师参与课程开发12门。', full: true, align: 'start' },
]

// 分组4：主要成果（表格展示，支持新增/编辑/删除）
const RESULT_COLUMNS = [
  { key: 'name', dataIndex: 'name', title: '成果名称', minWidth: 200 },
  { key: 'type', dataIndex: 'type', title: '成果类型', minWidth: 120 },
  { key: 'level', dataIndex: 'level', title: '成果级别', minWidth: 100 },
  { key: 'leader', dataIndex: 'leader', title: '负责人', minWidth: 100 },
  { key: 'date', dataIndex: 'date', title: '完成时间', minWidth: 120 },
  { key: 'intro', dataIndex: 'intro', title: '成果简介', minWidth: 200 },
  { key: 'material', dataIndex: 'material', title: '支撑材料', minWidth: 150 },
]

const RESULT_DATA = [
  { id: 'result-1', name: '省级精品在线开放课程', type: '课程', level: '省级', leader: '金晓智', date: '2024-06', intro: '《软件工程实践》课程获评省级精品在线开放课程', material: '课程建设报告.pdf' },
  { id: 'result-2', name: '全国职业院校技能大赛一等奖', type: '竞赛', level: '国家级', leader: '李敏', date: '2024-05', intro: '指导学生获全国职业院校技能大赛"软件测试"赛项一等奖', material: '获奖证书.pdf' },
  { id: 'result-3', name: '省级教学成果奖二等奖', type: '成果奖', level: '省级', leader: '金晓智', date: '2023-12', intro: '"产教融合背景下软件技术专业群课程体系重构与实践"获省级教学成果奖二等奖', material: '成果奖申报书.pdf' },
]

// 分组5：相关工作（大文本）
const RELATED_WORK_CONTENT = `专业群建设工作涉及多个方面：

1. 课程建设：主持省级精品在线开放课程1门，校级精品课程3门，参与国家级专业教学资源库建设。

2. 实训基地建设：牵头建设软件技术实训中心，引入企业真实项目，建成产教融合实训基地。

3. 校企合作：与腾讯、华为等企业建立合作关系，开展订单班培养、企业导师进课堂、学生顶岗实习等合作项目。

4. 教学研究：主持省级教改项目2项，发表教学改革论文5篇，参与编写教材3部。

5. 社会服务：为企业提供技术咨询和培训服务，年培训企业员工200余人次。

6. 学生培养：指导学生参加技能竞赛获省级以上奖项8项，毕业生就业率达98%以上。`

// 分组6：专业群建设经验（表格展示，支持新增/编辑/删除）
const EXPERIENCE_COLUMNS = [
  { key: 'title', dataIndex: 'title', title: '经验标题', minWidth: 180 },
  { key: 'type', dataIndex: 'type', title: '经验类型', minWidth: 120 },
  { key: 'date', dataIndex: 'date', title: '总结时间', minWidth: 120 },
  { key: 'content', dataIndex: 'content', title: '经验内容', minWidth: 250 },
  { key: 'problem', dataIndex: 'problem', title: '存在问题', minWidth: 180 },
  { key: 'measure', dataIndex: 'measure', title: '改进措施', minWidth: 180 },
  { key: 'value', dataIndex: 'value', title: '推广价值', minWidth: 150 },
]

const EXPERIENCE_DATA = [
  { id: 'exp-1', title: '产教融合实训基地建设经验', type: '基地建设', date: '2024-06', content: '引入企业真实项目，建立"项目驱动、任务导向"的实训模式，学生参与企业项目开发，提升实践能力。', problem: '企业项目更新不及时，部分项目难度过高', measure: '建立项目筛选机制，定期更新项目库，设置难度梯度', value: '可推广至其他专业群' },
  { id: 'exp-2', title: '双师型教师培养经验', type: '师资建设', date: '2024-03', content: '建立企业实践轮训机制，教师每2年到企业实践1个月，参与企业项目开发，提升实践能力。', problem: '企业实践时间不足，部分教师参与度低', measure: '延长实践时间至2个月，建立激励机制，将实践成果纳入考核', value: '适用于工科类专业群' },
]

// ========== 组件定义 ==========

function SectionHeader({ title, onEdit }) {
  return (
    <>
      <div className="ah-section-head">
        <h3 className="ah-section-title">{title}</h3>
      </div>
      <div className="mc-content-action">
        <DSButton variant="default" onClick={onEdit}>编辑</DSButton>
      </div>
    </>
  )
}

// 分组1：专业群基本信息
function BasicInfoSection({ onEdit }) {
  return (
    <section className="ah-section" id="basic-info" data-section-key="basic-info">
      <SectionHeader title="专业群基本信息" onEdit={onEdit} />
      <DSReadOnlyForm columns={2}>
        {BASIC_INFO_FIELDS.map((field) => (
          <DSReadOnlyField
            key={field.key}
            label={field.label}
            value={field.value}
            fullWidth={field.full}
            align={field.align || 'start'}
          />
        ))}
      </DSReadOnlyForm>
    </section>
  )
}

// 分组2：专业群建设理念（表格）
function IdeaSection({ data, onAdd, onEdit, onDelete }) {
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleEditOpen = (row) => {
    setEditItem(row)
    setEditForm(row)
  }

  const handleEditSave = () => {
    onEdit(editForm)
    setEditItem(null)
    setEditForm({})
  }

  return (
    <>
      <section className="ah-section" id="construction-idea" data-section-key="construction-idea">
        <div className="ah-section-head">
          <h3 className="ah-section-title">专业群建设理念</h3>
        </div>
        <div className="mc-content-action">
          <DSButton variant="default" onClick={onAdd}>新增</DSButton>
        </div>
        <DSDataTable
          title="建设理念明细"
          columns={IDEA_COLUMNS}
          data={data}
          rowKey="id"
          selectable={false}
          showToolbar={false}
          tableTools={false}
          className="ah-square-table"
          minWidth={1100}
          actions={[
            { key: 'edit', label: '编辑', onClick: handleEditOpen },
            { key: 'delete', label: '删除', onClick: (row) => setDeleteConfirm(row) },
          ]}
          actionsMaxVisible={2}
        />
      </section>
      {/* 编辑弹窗 */}
      <DSDoubleEditModal
        open={Boolean(editItem)}
        title="编辑建设理念"
        okText="保存"
        onOk={handleEditSave}
        onCancel={() => { setEditItem(null); setEditForm({}) }}
      >
        {editItem ? IDEA_COLUMNS.map((col) => (
          <DSEditField key={col.key} label={col.title} fullWidth={['content', 'approach'].includes(col.key)} align="start">
            {['content', 'approach'].includes(col.key) ? (
              <DSTextarea
                rows={4}
                value={editForm[col.dataIndex] || ''}
                onChange={(e) => setEditForm({ ...editForm, [col.dataIndex]: e.target.value })}
              />
            ) : (
              <DSInput
                value={editForm[col.dataIndex] || ''}
                onChange={(e) => setEditForm({ ...editForm, [col.dataIndex]: e.target.value })}
              />
            )}
          </DSEditField>
        )) : null}
      </DSDoubleEditModal>
      {/* 删除确认弹窗 */}
      <DSModal
        open={Boolean(deleteConfirm)}
        title="确认删除"
        okText="确认删除"
        cancelText="取消"
        onOk={() => { onDelete(deleteConfirm); setDeleteConfirm(null) }}
        onCancel={() => setDeleteConfirm(null)}
      >
        <p>确定要删除该建设理念吗？此操作不可恢复。</p>
      </DSModal>
    </>
  )
}

// 分组3：队伍建设（表单）
function TeamSection({ onEdit }) {
  return (
    <section className="ah-section" id="team-building" data-section-key="team-building">
      <SectionHeader title="队伍建设" onEdit={onEdit} />
      <DSReadOnlyForm columns={2}>
        {TEAM_FIELDS.map((field) => (
          <DSReadOnlyField
            key={field.key}
            label={field.label}
            value={field.value}
            fullWidth={field.full}
            align={field.align || 'start'}
          />
        ))}
      </DSReadOnlyForm>
    </section>
  )
}

// 分组4：主要成果（表格，支持新增/删除）
function ResultSection({ data, onAdd, onEdit, onDelete }) {
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleEditOpen = (row) => {
    setEditItem(row)
    setEditForm(row)
  }

  const handleEditSave = () => {
    onEdit(editForm)
    setEditItem(null)
    setEditForm({})
  }

  return (
    <>
      <section className="ah-section" id="main-results" data-section-key="main-results">
        <div className="ah-section-head">
          <h3 className="ah-section-title">主要成果</h3>
        </div>
        <div className="mc-content-action">
          <DSButton variant="default" onClick={onAdd}>新增</DSButton>
        </div>
        <DSDataTable
          title="主要成果明细"
          columns={RESULT_COLUMNS}
          data={data}
          rowKey="id"
          selectable={false}
          showToolbar={false}
          tableTools={false}
          className="ah-square-table"
          minWidth={1100}
          actions={[
            { key: 'edit', label: '编辑', onClick: handleEditOpen },
            { key: 'delete', label: '删除', onClick: (row) => setDeleteConfirm(row) },
          ]}
          actionsMaxVisible={2}
        />
      </section>
      {/* 编辑弹窗 */}
      <DSDoubleEditModal
        open={Boolean(editItem)}
        title="编辑成果"
        okText="保存"
        onOk={handleEditSave}
        onCancel={() => { setEditItem(null); setEditForm({}) }}
      >
        {editItem ? RESULT_COLUMNS.map((col) => (
          <DSEditField key={col.key} label={col.title} fullWidth={['intro', 'material'].includes(col.key)} align="start">
            {col.key === 'intro' ? (
              <DSTextarea
                rows={4}
                value={editForm[col.dataIndex] || ''}
                onChange={(e) => setEditForm({ ...editForm, [col.dataIndex]: e.target.value })}
              />
            ) : (
              <DSInput
                value={editForm[col.dataIndex] || ''}
                onChange={(e) => setEditForm({ ...editForm, [col.dataIndex]: e.target.value })}
              />
            )}
          </DSEditField>
        )) : null}
      </DSDoubleEditModal>
      {/* 删除确认弹窗 */}
      <DSModal
        open={Boolean(deleteConfirm)}
        title="确认删除"
        okText="确认删除"
        cancelText="取消"
        onOk={() => { onDelete(deleteConfirm); setDeleteConfirm(null) }}
        onCancel={() => setDeleteConfirm(null)}
      >
        <p>确定要删除该成果吗？此操作不可恢复。</p>
      </DSModal>
    </>
  )
}

// 分组5：相关工作（大文本）
function RelatedWorkSection({ content, onEdit }) {
  return (
    <section className="ah-section" id="related-work" data-section-key="related-work">
      <SectionHeader title="相关工作" onEdit={onEdit} />
      <div className="mc-large-text">
        <p>{content}</p>
      </div>
    </section>
  )
}

// 分组6：专业群建设经验（表格，支持新增/删除）
function ExperienceSection({ data, onAdd, onEdit, onDelete }) {
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleEditOpen = (row) => {
    setEditItem(row)
    setEditForm(row)
  }

  const handleEditSave = () => {
    onEdit(editForm)
    setEditItem(null)
    setEditForm({})
  }

  return (
    <>
      <section className="ah-section" id="construction-experience" data-section-key="construction-experience">
        <div className="ah-section-head">
          <h3 className="ah-section-title">专业群建设经验</h3>
        </div>
        <div className="mc-content-action">
          <DSButton variant="default" onClick={onAdd}>新增</DSButton>
        </div>
        <DSDataTable
          title="建设经验明细"
          columns={EXPERIENCE_COLUMNS}
          data={data}
          rowKey="id"
          selectable={false}
          showToolbar={false}
          tableTools={false}
          className="ah-square-table"
          minWidth={1200}
          actions={[
            { key: 'edit', label: '编辑', onClick: handleEditOpen },
            { key: 'delete', label: '删除', onClick: (row) => setDeleteConfirm(row) },
          ]}
          actionsMaxVisible={2}
        />
      </section>
      {/* 编辑弹窗 */}
      <DSDoubleEditModal
        open={Boolean(editItem)}
        title="编辑建设经验"
        okText="保存"
        onOk={handleEditSave}
        onCancel={() => { setEditItem(null); setEditForm({}) }}
      >
        {editItem ? EXPERIENCE_COLUMNS.map((col) => (
          <DSEditField key={col.key} label={col.title} fullWidth={['content', 'problem', 'measure'].includes(col.key)} align="start">
            {['content', 'problem', 'measure'].includes(col.key) ? (
              <DSTextarea
                rows={4}
                value={editForm[col.dataIndex] || ''}
                onChange={(e) => setEditForm({ ...editForm, [col.dataIndex]: e.target.value })}
              />
            ) : (
              <DSInput
                value={editForm[col.dataIndex] || ''}
                onChange={(e) => setEditForm({ ...editForm, [col.dataIndex]: e.target.value })}
              />
            )}
          </DSEditField>
        )) : null}
      </DSDoubleEditModal>
      {/* 删除确认弹窗 */}
      <DSModal
        open={Boolean(deleteConfirm)}
        title="确认删除"
        okText="确认删除"
        cancelText="取消"
        onOk={() => { onDelete(deleteConfirm); setDeleteConfirm(null) }}
        onCancel={() => setDeleteConfirm(null)}
      >
        <p>确定要删除该建设经验吗？此操作不可恢复。</p>
      </DSModal>
    </>
  )
}

// ========== 编辑弹窗 ==========

function BasicInfoEditor({ open, onClose, onSave }) {
  const [fields, setFields] = useState(BASIC_INFO_FIELDS)

  useEffect(() => {
    if (open) setFields(BASIC_INFO_FIELDS)
  }, [open])

  return (
    <DSDoubleEditModal
      open={open}
      title="编辑专业群基本信息"
      okText="保存"
      onOk={() => onSave(fields)}
      onCancel={() => onClose()}
    >
      {fields.map((field) => (
        <DSEditField key={field.key} label={field.label} fullWidth={field.full} align={field.align || 'start'}>
          {field.full && field.align === 'start' ? (
            <DSTextarea
              rows={4}
              value={field.value}
              onChange={(e) => setFields(fields.map(f => f.key === field.key ? { ...f, value: e.target.value } : f))}
            />
          ) : (
            <DSInput
              value={field.value}
              onChange={(e) => setFields(fields.map(f => f.key === field.key ? { ...f, value: e.target.value } : f))}
            />
          )}
        </DSEditField>
      ))}
    </DSDoubleEditModal>
  )
}

function TeamEditor({ open, onClose, onSave }) {
  const [fields, setFields] = useState(TEAM_FIELDS)

  useEffect(() => {
    if (open) setFields(TEAM_FIELDS)
  }, [open])

  return (
    <DSDoubleEditModal
      open={open}
      title="编辑队伍建设"
      okText="保存"
      onOk={() => onSave(fields)}
      onCancel={() => onClose()}
    >
      {fields.map((field) => (
        <DSEditField key={field.key} label={field.label} fullWidth={field.full} align={field.align || 'start'}>
          {field.full && field.align === 'start' ? (
            <DSTextarea
              rows={4}
              value={field.value}
              onChange={(e) => setFields(fields.map(f => f.key === field.key ? { ...f, value: e.target.value } : f))}
            />
          ) : (
            <DSInput
              value={field.value}
              onChange={(e) => setFields(fields.map(f => f.key === field.key ? { ...f, value: e.target.value } : f))}
            />
          )}
        </DSEditField>
      ))}
    </DSDoubleEditModal>
  )
}

function RelatedWorkEditor({ open, content, onClose, onSave }) {
  const [value, setValue] = useState(content)

  useEffect(() => {
    if (open) setValue(content)
  }, [open, content])

  return (
    <DSDoubleEditModal
      open={open}
      title="编辑相关工作"
      okText="保存"
      onOk={() => onSave(value)}
      onCancel={() => onClose()}
    >
      <DSEditField label="相关工作内容" fullWidth align="start">
        <DSTextarea
          rows={16}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </DSEditField>
    </DSDoubleEditModal>
  )
}

// ========== 主页面 ==========

function MajorConstructionPage() {
  const [activeKey, setActiveKey] = useState('basic-info')
  const [relatedWorkContent, setRelatedWorkContent] = useState(RELATED_WORK_CONTENT)

  const [basicInfoEditor, setBasicInfoEditor] = useState(false)
  const [teamEditor, setTeamEditor] = useState(false)
  const [relatedWorkEditor, setRelatedWorkEditor] = useState(false)

  const mainRef = useRef(null)

  // 滚动同步锚点高亮
  useEffect(() => {
    const main = mainRef.current
    if (!main) return

    const updateFromScroll = () => {
      const sections = Array.from(main.querySelectorAll('[data-section-key]'))
      const mainBox = main.getBoundingClientRect()
      const scrollable = main.scrollHeight > main.clientHeight + 1
      const atBottom = scrollable && main.scrollTop + main.clientHeight >= main.scrollHeight - 2
      const current = atBottom ? sections[sections.length - 1] : sections.reduce((latest, section) => {
        const sectionTop = section.getBoundingClientRect().top - mainBox.top
        if (sectionTop <= 64) return section
        return latest
      }, sections[0])
      const nextKey = current?.getAttribute('data-section-key')
      if (nextKey) setActiveKey(nextKey)
    }

    main.addEventListener('scroll', updateFromScroll, { passive: true })
    updateFromScroll()
    return () => main.removeEventListener('scroll', updateFromScroll)
  }, [])

  const onBack = () => { window.location.href = 't-overview.html' }

  // 编辑保存（示例：仅打印，实际应调用 API）
  const handleBasicInfoSave = (fields) => {
    console.log('保存专业群基本信息:', fields)
    setBasicInfoEditor(false)
  }

  const handleTeamSave = (fields) => {
    console.log('保存队伍建设:', fields)
    setTeamEditor(false)
  }

  const handleRelatedWorkSave = (content) => {
    setRelatedWorkContent(content)
    setRelatedWorkEditor(false)
  }

  // 新增/编辑/删除（示例：仅打印，实际应调用 API）
  const handleIdeaAdd = () => {
    console.log('新增建设理念（示例：应打开新增弹窗）')
  }

  const handleIdeaEdit = (item) => {
    console.log('编辑建设理念:', item)
  }

  const handleIdeaDelete = (item) => {
    console.log('删除建设理念:', item)
  }

  const handleResultAdd = () => {
    console.log('新增成果（示例：应打开新增弹窗）')
  }

  const handleResultEdit = (item) => {
    console.log('编辑成果:', item)
  }

  const handleResultDelete = (item) => {
    console.log('删除成果:', item)
  }

  const handleExperienceAdd = () => {
    console.log('新增建设经验（示例：应打开新增弹窗）')
  }

  const handleExperienceEdit = (item) => {
    console.log('编辑建设经验:', item)
  }

  const handleExperienceDelete = (item) => {
    console.log('删除建设经验:', item)
  }

  return (
    <main className="ah-page" data-ds-business-page="major-construction">
      <div className="ah-content-card">
        <DSSubPageHeader
          className="ah-top-header"
          title="专业群建设"
          backLabel="返回"
          onBack={onBack}
          surface={false}
        />
        <div className="ah-detail-layout">
          <div className="ah-main" ref={mainRef}>
            <BasicInfoSection onEdit={() => setBasicInfoEditor(true)} />
            <IdeaSection
              data={IDEA_DATA}
              onAdd={handleIdeaAdd}
              onEdit={handleIdeaEdit}
              onDelete={handleIdeaDelete}
            />
            <TeamSection onEdit={() => setTeamEditor(true)} />
            <ResultSection
              data={RESULT_DATA}
              onAdd={handleResultAdd}
              onEdit={handleResultEdit}
              onDelete={handleResultDelete}
            />
            <RelatedWorkSection
              content={relatedWorkContent}
              onEdit={() => setRelatedWorkEditor(true)}
            />
            <ExperienceSection
              data={EXPERIENCE_DATA}
              onAdd={handleExperienceAdd}
              onEdit={handleExperienceEdit}
              onDelete={handleExperienceDelete}
            />
          </div>
          <aside className="ah-anchor-panel" aria-label="专业群建设锚点">
            <DSAnchor activeKey={activeKey} items={ANCHOR_ITEMS} bordered aria-label="专业群建设锚点" />
          </aside>
        </div>
      </div>

      <BasicInfoEditor
        open={basicInfoEditor}
        onClose={() => setBasicInfoEditor(false)}
        onSave={handleBasicInfoSave}
      />
      <TeamEditor
        open={teamEditor}
        onClose={() => setTeamEditor(false)}
        onSave={handleTeamSave}
      />
      <RelatedWorkEditor
        open={relatedWorkEditor}
        content={relatedWorkContent}
        onClose={() => setRelatedWorkEditor(false)}
        onSave={handleRelatedWorkSave}
      />
    </main>
  )
}

createRoot(document.getElementById('app')).render(<MajorConstructionPage />)
