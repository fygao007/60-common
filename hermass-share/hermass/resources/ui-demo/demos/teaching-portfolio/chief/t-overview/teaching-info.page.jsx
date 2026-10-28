import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSSubPageHeader,
  DSButton,
  DSButtonGroup,
  DSSelect,
  DSReadOnlyForm,
  DSReadOnlyField,
  DSInput,
  DSSingleEditModal,
  DSEditField,
  DSTextarea,
  DSUpload,
  DSIconButton,
} from '@wisedu/design-system'
import { SourceEditNote } from '../../shared/components'
import './teaching-info.css'

function generateSemesterOptions() {
  const options = []
  const currentYear = new Date().getFullYear()
  const isFall = (new Date().getMonth() + 1) >= 9 || (new Date().getMonth() + 1) <= 1
  const currentSemesterValue = isFall ? `${currentYear}-${currentYear + 1}-fall` : `${currentYear - 1}-${currentYear}-spring`

  for (let yearOffset = 0; yearOffset < 5; yearOffset++) {
    const year = currentYear - yearOffset
    options.push({ value: `${year}-${year + 1}-fall`, label: `${year}-${year + 1}学年 秋季学期` })
    options.push({ value: `${year - 1}-${year}-spring`, label: `${year - 1}-${year}学年 春季学期` })
  }
  return { options, defaultValue: currentSemesterValue }
}

const SEMESTER_CONFIG = generateSemesterOptions()

const BASE_COURSES = [
  { id: 'data-structure', name: '数据结构与算法', tags: ['汽车智能技术', '88学时', '6学分'], code: 'CS20260101', sequence: '01', owner: '汽车智能技术学院', teachingForm: '线下授课', category: '专业核心课', nature: '必修', className: '202406', credits: 6, hours: 88, students: 19, examType: '闭卷考试', teachingMode: '讲授+实践', status: '进行中' },
  { id: 'auto-engineering', name: '汽车工程', tags: ['汽车工程', '64学时', '6学分'], code: 'AE20260203', sequence: '02', owner: '汽车工程学院', teachingForm: '线下授课', category: '专业基础课', nature: '选修', className: '202405', credits: 6, hours: 64, students: 36, examType: '开卷考试', teachingMode: '讲授', status: '进行中' },
  { id: 'auto-structure', name: '汽车结构讲解', tags: ['汽车工程', '64学时', '6学分'], code: 'AE20260312', sequence: '03', owner: '汽车工程学院', teachingForm: '线下授课', category: '专业基础课', nature: '必修', className: '202404', credits: 6, hours: 64, students: 42, examType: '课程论文', teachingMode: '讲授+实验', status: '已开课' },
  { id: 'new-energy', name: '新能源汽车技术', tags: ['新能源汽车工程技术', '72学时', '5学分'], code: 'NE20260408', sequence: '04', owner: '新能源汽车学院', teachingForm: '混合式教学', category: '专业核心课', nature: '必修', className: '202403', credits: 5, hours: 72, students: 38, examType: '项目考核', teachingMode: '讲授+项目', status: '进行中' },
  { id: 'intelligent-connected', name: '智能网联汽车基础', tags: ['智能网联汽车技术', '48学时', '3学分'], code: 'IC20260516', sequence: '05', owner: '智能网联学院', teachingForm: '线下授课', category: '专业拓展课', nature: '选修', className: '202402', credits: 3, hours: 48, students: 31, examType: '闭卷考试', teachingMode: '讲授', status: '已开课' },
]

const COURSES_BY_SEMESTER = {
  '2026-2027-fall': BASE_COURSES,
  '2026-2027-spring': BASE_COURSES.slice(0, 4).map((c, i) => ({ ...c, id: `${c.id}-spring`, className: `20250${i + 1}`, status: i < 2 ? '已结课' : '进行中' })),
  '2025-2026-fall': BASE_COURSES.slice(0, 3).map((c, i) => ({ ...c, id: `2025fall-${c.id}`, className: `20240${i + 1}`, status: '已归档' })),
}

const TEACHING_PLANS_BY_COURSE = {
  'data-structure': [
    { id: 'plan-1', date: '2026-09-02', week: '第1周', weekday: '周一', hours: 2, teachingType: '理论讲授', teachingMethod: '课堂讲授', content: '课程导入：数据结构概述、算法复杂度分析基础', location: '教学楼A301', tools: '多媒体课件、在线编程平台', resources: [], reflection: '', ideology: '' },
    { id: 'plan-2', date: '2026-09-05', week: '第1周', weekday: '周四', hours: 2, teachingType: '实践操作', teachingMethod: '实验指导', content: '线性表基础：顺序表与链表的实现', location: '实验楼B201', tools: 'IDE、代码调试工具', resources: ['实验指导书.pdf'], reflection: '学生链表指针操作理解较慢，下次需增加图示讲解', ideology: '培养严谨的编程习惯和代码质量意识' },
    { id: 'plan-3', date: '2026-09-09', week: '第2周', weekday: '周一', hours: 2, teachingType: '理论讲授', teachingMethod: '课堂讲授', content: '栈与队列：概念、实现与应用场景', location: '教学楼A301', tools: '多媒体课件', resources: [], reflection: '', ideology: '' },
  ],
  'auto-engineering': [{ id: 'ae-1', date: '2026-09-03', week: '第1周', weekday: '周二', hours: 2, teachingType: '理论讲授', teachingMethod: '课堂讲授', content: '汽车工程概论：汽车发展史与基本构造', location: '教学楼C102', tools: '多媒体课件、实物模型', resources: [], reflection: '', ideology: '' }],
}

const DEFAULT_TEACHING_PLANS = [{ id: 'default-1', date: '2026-09-01', week: '第1周', weekday: '周一', hours: 2, teachingType: '', teachingMethod: '', content: '', location: '', tools: '', resources: [], reflection: '', ideology: '' }]

const TABS = [
  { key: 'courseInfo', label: '课程信息' },
  { key: 'design', label: '课程设计与实施' },
  { key: 'ideology', label: '课程思政' },
  { key: 'care', label: '教师关爱学生情况' },
  { key: 'effect', label: '教学效果' },
  { key: 'evaluation', label: '教学评价' },
  { key: 'reflection', label: '课程反思' },
  { key: 'summary', label: '课程总结' },
  { key: 'materials', label: '课程资料' },
]

const TEACHING_TYPE_OPTIONS = [{ value: 'theory', label: '理论讲授' }, { value: 'practice', label: '实践操作' }, { value: 'experiment', label: '实验教学' }, { value: 'discussion', label: '课堂讨论' }, { value: 'project', label: '项目指导' }]
const TEACHING_METHOD_OPTIONS = [{ value: 'lecture', label: '课堂讲授' }, { value: 'experiment', label: '实验指导' }, { value: 'case', label: '案例教学' }, { value: 'flipped', label: '翻转课堂' }, { value: 'group', label: '分组讨论' }]
const TOOL_OPTIONS = [{ value: 'ppt', label: '多媒体课件' }, { value: 'online', label: '在线编程平台' }, { value: 'ide', label: 'IDE开发环境' }, { value: 'video', label: '教学视频' }, { value: 'model', label: '实物模型' }]

function CourseCard({ course, selected, onSelect }) {
  return (
    <a
      aria-current={selected ? 'true' : undefined}
      className={selected ? 'ti-course-card is-active' : 'ti-course-card'}
      href={`#${course.id}`}
      onClick={(event) => { event.preventDefault(); onSelect(course.id) }}
    >
      <h2>{course.name}</h2>
      <div className="ti-course-tags">{course.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      {selected ? (
        <dl className="ti-course-fields">
          <div><dt>课程号</dt><dd>{course.code}</dd></div>
          <div><dt>承担单位</dt><dd>{course.owner}</dd></div>
          <div><dt>课程性质</dt><dd>{course.nature}</dd></div>
        </dl>
      ) : null}
    </a>
  )
}

function CourseInfoPanel({ course }) {
  return (
    <section className="ti-section">
      <div className="ti-section-head">
        <h3>课程信息</h3>
        <SourceEditNote className="ti-source-note" source="教务系统" />
      </div>
      <DSReadOnlyForm columns={2}>
        <DSReadOnlyField label="课程号" value={course.code} />
        <DSReadOnlyField label="课程名" value={course.name} />
        <DSReadOnlyField label="课序号" value={course.sequence} />
        <DSReadOnlyField label="承担单位" value={course.owner} />
        <DSReadOnlyField label="授课形式" value={course.teachingForm} />
        <DSReadOnlyField label="课程类别" value={course.category} />
        <DSReadOnlyField label="课程性质" value={course.nature} />
        <DSReadOnlyField label="授课班级" value={course.className} />
        <DSReadOnlyField label="学分" value={course.credits} />
        <DSReadOnlyField label="学时" value={course.hours} />
        <DSReadOnlyField label="选课人数" value={course.students} />
        <DSReadOnlyField label="考试类型" value={course.examType} />
        <DSReadOnlyField fullWidth label="教学方式" value={course.teachingMode} />
        <DSReadOnlyField fullWidth label="附件" value="-" />
      </DSReadOnlyForm>
    </section>
  )
}

function TeachingPlanCard({ plan, onEdit }) {
  const isFilled = plan.content && plan.content.trim().length > 0
  const [expanded, setExpanded] = useState(!isFilled)

  return (
    <article className="ti-plan-card">
      <header className="ti-plan-card__head" onClick={() => setExpanded(!expanded)}>
        <div className="ti-plan-grid-4--compact">
          <span><span className="ti-plan-grid-4__name">上课日期：</span><span className="ti-num">{plan.date}</span></span>
          <span><span className="ti-plan-grid-4__name">周次：</span>{plan.week}</span>
          <span><span className="ti-plan-grid-4__name">星期：</span>{plan.weekday}</span>
          <span><span className="ti-plan-grid-4__name">学时：</span><span className="ti-num">{plan.hours}</span></span>
        </div>
        <DSButton
          aria-expanded={expanded}
          aria-label={expanded ? '收起详情' : '展开详情'}
          className="ti-plan-card__toggle"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          variant="text"
          size="small"
        >
          <span className="ti-plan-card__arrow">{expanded ? '▼' : '▶'}</span>
        </DSButton>
      </header>
      {expanded ? (
        <div className="ti-plan-card__body">
          <dl className="ti-plan-fields">
            <div><dt>教学类型</dt><dd>{plan.teachingType || '-'}</dd></div>
            <div><dt>教学方式</dt><dd>{plan.teachingMethod || '-'}</dd></div>
            <div className="ti-full-width"><dt>上课内容</dt><dd>{plan.content || '-'}</dd></div>
            <div><dt>上课地点</dt><dd>{plan.location || '-'}</dd></div>
            <div><dt>信息化教学工具</dt><dd>{plan.tools || '-'}</dd></div>
            <div className="ti-full-width"><dt>课程资源</dt><dd>{plan.resources.length > 0 ? plan.resources.join(', ') : '-'}</dd></div>
            <div className="ti-full-width"><dt>教学随笔</dt><dd>{plan.reflection || '-'}</dd></div>
            <div className="ti-full-width"><dt>课程思政</dt><dd>{plan.ideology || '-'}</dd></div>
          </dl>
          <div className="ti-plan-card__actions">
            <DSButton size="small" variant="secondary" onClick={() => onEdit(plan)}>编辑</DSButton>
          </div>
        </div>
      ) : null}
    </article>
  )
}

function TeachingPlanEditModal({ plan, isNew, open, onClose, onSave }) {
  const [form, setForm] = useState(plan || {})

  useEffect(() => { if (plan) setForm(plan) }, [plan])

  const handleSubmit = () => { onSave(form); onClose() }
  const updateField = (key, value) => { setForm(prev => ({ ...prev, [key]: value })) }

  if (!plan) return null

  return (
    <DSSingleEditModal open={open} title={isNew ? '新增教学实施' : `编辑教学实施 - ${plan.date}`} onOk={handleSubmit} onCancel={onClose} okText="保存" cancelText="取消">
      <div className="ti-modal-sync-info">
        <span>{plan.date}</span>
        <span>{plan.week}</span>
        <span>{plan.weekday}</span>
        <span>{plan.hours}学时</span>
      </div>
      <DSEditField label="教学类型"><DSSelect options={TEACHING_TYPE_OPTIONS} value={form.teachingType} onChange={(val) => updateField('teachingType', val)} placeholder="请选择" /></DSEditField>
      <DSEditField label="教学方式"><DSSelect options={TEACHING_METHOD_OPTIONS} value={form.teachingMethod} onChange={(val) => updateField('teachingMethod', val)} placeholder="请选择" /></DSEditField>
      <DSEditField label="上课内容" align="start"><DSTextarea value={form.content} onChange={(e) => updateField('content', e.target.value)} placeholder="请输入本次课的核心内容" rows={3} /></DSEditField>
      <DSEditField label="上课地点"><DSInput value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="请输入" /></DSEditField>
      <DSEditField label="信息化教学工具"><DSSelect options={TOOL_OPTIONS} value={form.tools} onChange={(val) => updateField('tools', val)} placeholder="请选择" /></DSEditField>
      <DSEditField label="课程资源"><DSUpload /></DSEditField>
      <DSEditField label="教学随笔" align="start"><DSTextarea value={form.reflection} onChange={(e) => updateField('reflection', e.target.value)} placeholder="请输入课后反思/随笔" rows={4} /></DSEditField>
      <DSEditField label="课程思政" align="start"><DSTextarea value={form.ideology} onChange={(e) => updateField('ideology', e.target.value)} placeholder="请输入课程思政内容" rows={3} /></DSEditField>
    </DSSingleEditModal>
  )
}

function BasicInfoEditModal({ open, field, value, title, onClose, onSave }) {
  const [text, setText] = useState(value || '')

  useEffect(() => { setText(value || '') }, [value, open])

  const handleOk = () => { onSave(field, text); onClose() }

  return (
    <DSSingleEditModal open={open} title={`编辑${title}`} onOk={handleOk} onCancel={onClose} okText="保存" cancelText="取消">
      <DSEditField label={title} align="start"><DSTextarea value={text} onChange={(e) => setText(e.target.value)} placeholder={`请输入${title}`} rows={8} /></DSEditField>
    </DSSingleEditModal>
  )
}

function DesignTab({ course, courseContentData, onContentUpdate }) {
  const courseKey = `${course.id}-design`
  const plans = courseContentData[courseKey]?.teachingPlans || TEACHING_PLANS_BY_COURSE[course.id] || DEFAULT_TEACHING_PLANS
  const basicTexts = courseContentData[courseKey]?.basicInfo || {
    way: '采用"项目驱动 + 理论实践一体化"的教学方式，以真实工程任务为主线，结合课堂讲授、分组研讨、上机实操与过程评价，讲练结合、边学边做。',
    goal: '通过本课程学习，学生能够理解数据结构与算法的核心概念，掌握常用数据结构的实现方法，能够分析和设计基本算法，具备解决实际问题的编程能力。',
    plan: '以数据结构核心知识为主轴，按"线性结构—受限结构—非线性结构—经典算法"组织教学，每周理论 2 课时 + 实践 2 课时，穿插阶段测评与综合项目实战。',
    analysis: '学生基础差异较明显，部分学生具备较强动手能力，但理论迁移和规范表达仍需强化。课程采用分层任务、过程反馈和案例演示提升参与度。',
    innovation: '围绕在线精品课程建设和产教融合要求，引入企业真实任务、课堂即时反馈和学习数据分析，持续优化教学活动设计与评价方式。',
  }

  const [editingPlan, setEditingPlan] = useState(null)
  const [isNewPlan, setIsNewPlan] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [basicInfoOpen, setBasicInfoOpen] = useState(false)
  const [basicInfoEditing, setBasicInfoEditing] = useState({ field: null, title: '' })

  const openBasicInfoEdit = (field, title) => { setBasicInfoEditing({ field, title }); setBasicInfoOpen(true) }
  const saveBasicInfo = (field, value) => {
    onContentUpdate(courseKey, { basicInfo: { ...basicTexts, [field]: value } })
  }

  const total = plans.length
  const completed = plans.filter(p => p.content && p.content.trim()).length
  const pendingReflection = plans.filter(p => !p.reflection || !p.reflection.trim()).length

  const handleEditPlan = (plan) => { setEditingPlan(plan); setIsNewPlan(false); setModalOpen(true) }
  const handleAddPlan = () => {
    setEditingPlan({ id: `plan-${Date.now()}`, date: '待补充', teachingType: '', teachingMethod: '', content: '', location: '', tools: '', resources: [], reflection: '', ideology: '' })
    setIsNewPlan(true)
    setModalOpen(true)
  }
  const savePlan = (updatedPlan) => {
    const exists = plans.some((p) => p.id === updatedPlan.id)
    const updatedPlans = exists
      ? plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
      : [updatedPlan, ...plans]
    onContentUpdate(courseKey, { teachingPlans: updatedPlans })
    setIsNewPlan(false)
  }

  return (
    <>
      <section className="ti-section">
        <div className="ti-section-head"><h3>基本信息</h3></div>
        <div className="ti-base-group">
          <div className="ti-base-group__head">
            <span className="ti-base-group__title">教学方式</span>
            <DSButton size="small" variant="secondary" onClick={() => openBasicInfoEdit('way', '教学方式')}>编辑</DSButton>
          </div>
          <div className="ti-base-group__body">{basicTexts.way}</div>
        </div>
        <div className="ti-base-group">
          <div className="ti-base-group__head">
            <span className="ti-base-group__title">教学目标</span>
            <DSButton size="small" variant="secondary" onClick={() => openBasicInfoEdit('goal', '教学目标')}>编辑</DSButton>
          </div>
          <div className="ti-base-group__body">{basicTexts.goal}</div>
        </div>
        <div className="ti-base-group">
          <div className="ti-base-group__head">
            <span className="ti-base-group__title">教学实施</span>
            <DSButton size="small" variant="secondary" onClick={() => openBasicInfoEdit('plan', '教学实施')}>编辑</DSButton>
          </div>
          <div className="ti-base-group__body">{basicTexts.plan}</div>
        </div>
        <div className="ti-base-group">
          <div className="ti-base-group__head">
            <span className="ti-base-group__title">学情分析</span>
            <DSButton size="small" variant="secondary" onClick={() => openBasicInfoEdit('analysis', '学情分析')}>编辑</DSButton>
          </div>
          <div className="ti-base-group__body">{basicTexts.analysis}</div>
        </div>
      </section>
      <section className="ti-section">
        <div className="ti-section-head"><h3>教学实施</h3><DSButton className="ti-section-edit" variant="secondary" size="small" onClick={handleAddPlan}>新增</DSButton></div>
        <div className="ti-plan-list">
          {plans.map((plan) => <TeachingPlanCard key={plan.id} plan={plan} onEdit={handleEditPlan} />)}
        </div>
      </section>
      <section className="ti-section">
        <div className="ti-section-head">
          <h3>教学改革与创新</h3>
          <DSButton variant="secondary" size="small" onClick={() => openBasicInfoEdit('innovation', '教学改革与创新')}>编辑</DSButton>
        </div>
        <div className="ti-display-box ti-display-box--large">
          <span>{basicTexts.innovation}</span>
        </div>
      </section>
      <section className="ti-section">
        <div className="ti-section-head"><h3>附件</h3><DSButton variant="secondary" size="small">编辑</DSButton></div>
        <div className="ti-upload-row">
          <div className="ti-upload-box"><span className="ti-upload-icon">□</span><span>拖拽至此处，或点击<span className="ti-upload-link">上传</span></span></div>
        </div>
      </section>
      <TeachingPlanEditModal plan={editingPlan} isNew={isNewPlan} open={modalOpen} onClose={() => setModalOpen(false)} onSave={savePlan} />
      <BasicInfoEditModal open={basicInfoOpen} field={basicInfoEditing.field} title={basicInfoEditing.title} value={basicInfoEditing.field ? basicTexts[basicInfoEditing.field] : ''} onClose={() => setBasicInfoOpen(false)} onSave={saveBasicInfo} />
    </>
  )
}

function buildSectionText(section, course, content) {
  const stored = content?.[`${course.id}-${section.tabKey}`]?.[section.key]
  if (stored) return stored

  const courseName = course.name
  const textMap = {
    goal: `通过${courseName}学习，学生能够理解课程关键概念，掌握常用方法与操作流程，能够在真实或仿真的任务场景中完成问题分析、方案设计、结果验证和反思优化。`,
    'student-help': `本学期针对学习困难学生建立辅导清单，安排课后答疑、作业反馈和阶段性跟踪，重点帮助学生补齐基础概念和实践步骤。`,
    'student-case': `针对实践能力较强但表达薄弱的学生，采用"操作展示 + 复盘说明"的方式进行个性化指导，帮助其提升项目汇报和文档表达能力。`,
    'student-evaluation': `学生评价总体良好，认为课程案例贴近专业应用，课堂任务清晰，建议继续增加真实项目素材和课堂练习讲评。`,
    'supervisor-evaluation': `督导评价认为课程目标明确，教学组织有序，互动充分，建议进一步完善过程性评价证据链。`,
    'peer-evaluation': `同行评价认为课程内容与专业能力培养匹配，项目任务设计较完整，可继续强化跨课程资源共享。`,
    'teaching-reflection': `本轮教学中，学生对任务背景理解较快，但在方案比较和结果表达方面仍有不足。后续将增加示例讲评和分层任务。`,
    optimization: `下一轮课程将优化课前导学材料，增加课堂即时检测，完善小组任务分工和评价规则，提高学习过程可见性。`,
    'course-summary': `${courseName}已完成本阶段教学任务，课程资料、课堂记录、学生作业和教学反思已归档。整体达成度较好，后续继续围绕项目案例和评价方式优化。`,
    'ideology-content': `结合${courseName}的严谨性与工程规范，融入工匠精神、职业道德与安全规范意识，引导学生在方案设计与实现中养成精益求精、诚信协作的职业素养，实现价值塑造与知识传授、能力培养的有机统一。`,
  }
  return textMap[section.key] || `${courseName}围绕课程目标完成教学设计、课堂实施和过程材料归档。`
}

function TextPanel({ compact, large, course, section, content, onEdit }) {
  const text = buildSectionText(section, course, content)
  const isEditable = section.editable === true
  return (
    <div className={compact ? 'ti-display-box ti-display-box--compact' : large ? 'ti-display-box ti-display-box--large' : 'ti-display-box'}>
      <span>{text}</span>
    </div>
  )
}

function EditableTextSection({ title, section, course, content, onEdit }) {
  const text = buildSectionText(section, course, content)
  return (
    <section className="ti-section">
      <div className="ti-section-head">
        <h3>{title}</h3>
        {section.editable && <DSButton variant="secondary" size="small" onClick={() => onEdit(section)}>编辑</DSButton>}
      </div>
      <div className="ti-display-box ti-display-box--large">
        <span>{text}</span>
      </div>
    </section>
  )
}

function DictPanel() {
  const elements = ['工匠精神', '职业道德', '创新精神', '劳动精神', '安全规范意识']
  return <div className="ti-display-box"><span>{elements.join('、')}</span></div>
}

function UploadPanel() {
  return (
    <div className="ti-upload-row">
      <div className="ti-upload-box"><span className="ti-upload-icon">□</span><span>拖拽至此处，或点击<span className="ti-upload-link">上传</span></span></div>
      <div className="ti-file-card"><span className="ti-file-icon">PDF</span><strong>课件.pdf</strong><span>3.6KB</span></div>
    </div>
  )
}

function MetricsPanel({ course }) {
  return (
    <DSReadOnlyForm columns={2}>
      <DSReadOnlyField label="上课率" value={course.id === 'data-structure' ? '98%' : '96%'} />
      <DSReadOnlyField label="平均成绩" value={course.id === 'data-structure' ? '--' : '86.5'} />
    </DSReadOnlyForm>
  )
}

function CourseMaterialsPanel() {
  return <DSUpload><DSButton variant="secondary">上传附件</DSButton></DSUpload>
}

function OtherTabContent({ tabKey, course, content, onEdit }) {
  const sections = {
    ideology: [
      { key: 'ideology-element', title: '思政元素', kind: 'dict', tabKey, editable: false },
      { key: 'ideology-content', title: '思政教学内容', kind: 'text', large: true, tabKey, editable: true }
    ],
    care: [
      { key: 'goal', title: '课程目标', source: '教务系统', kind: 'text', large: true, tabKey },
      { key: 'student-help', title: '辅导学生', kind: 'text', large: true, tabKey, editable: true },
      { key: 'student-case', title: '个性化案例', kind: 'text', large: true, tabKey, editable: true }
    ],
    effect: [
      { key: 'teaching-info', title: '教学信息', source: '教务系统', kind: 'metrics' },
      { key: 'representative-homework', title: '学生代表性作业', kind: 'upload' }
    ],
    evaluation: [
      { key: 'student-evaluation', title: '学生评价', source: '教务系统', kind: 'text', large: true, tabKey },
      { key: 'supervisor-evaluation', title: '督导评价', source: '教务系统', kind: 'text', large: true, tabKey },
      { key: 'peer-evaluation', title: '同行评价', source: '教务系统', kind: 'text', large: true, tabKey }
    ],
    reflection: [
      { key: 'teaching-reflection', title: '教学反思', kind: 'text', large: true, tabKey, editable: true },
      { key: 'optimization', title: '优化措施', kind: 'text', large: true, tabKey, editable: true }
    ],
    summary: [
      { key: 'course-summary', title: '课程总结', kind: 'text', large: true, tabKey, editable: true },
      { key: 'summary-file', title: '课程总结附件', kind: 'files' }
    ],
  }

  const tabSections = sections[tabKey] || []

  return tabSections.map((section) => (
    <section className="ti-section" key={section.key}>
      <div className="ti-section-head">
        <h3>{section.title}</h3>
        <SourceEditNote className="ti-source-note" source={section.source} />
        {section.editable && <DSButton variant="secondary" size="small" onClick={() => onEdit(section)}>编辑</DSButton>}
      </div>
      {section.kind === 'files' || section.kind === 'upload' ? <UploadPanel /> : null}
      {section.kind === 'metrics' ? <MetricsPanel course={course} /> : null}
      {section.kind === 'dict' ? <DictPanel /> : null}
      {section.kind === 'text' ? <TextPanel compact={section.compact} course={course} large={section.large} section={section} content={content} onEdit={onEdit} /> : null}
    </section>
  ))
}

export function TeachingInfoPage({ className = '', onBack: onBackProp, pageId = 'teaching-info', hideHeader = false, readOnly = false }) {
  const [selectedSemester, setSelectedSemester] = useState(SEMESTER_CONFIG.defaultValue)
  const courses = COURSES_BY_SEMESTER[selectedSemester] || BASE_COURSES

  const [searchQuery, setSearchQuery] = useState('')
  const [courseContentData, setCourseContentData] = useState({})

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses
    return courses.filter((course) => course.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [courses, searchQuery])

  const [selectedCourseId, setSelectedCourseId] = useState(filteredCourses[0]?.id || BASE_COURSES[0].id)
  const [activeTab, setActiveTab] = useState('courseInfo')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [editingText, setEditingText] = useState('')

  const selectedCourse = useMemo(
    () => filteredCourses.find((course) => course.id === selectedCourseId) || filteredCourses[0] || BASE_COURSES[0],
    [filteredCourses, selectedCourseId],
  )

  const onBack = onBackProp || (() => { window.location.href = 't-overview.html' })

  const changeSemester = (nextSemester) => {
    const nextCourses = COURSES_BY_SEMESTER[nextSemester] || BASE_COURSES
    setSelectedSemester(nextSemester)
    setSearchQuery('')
    setSelectedCourseId(nextCourses[0]?.id || BASE_COURSES[0].id)
  }

  const handleEditSection = (section) => {
    const contentKey = `${selectedCourse.id}-${section.tabKey}`
    const currentText = courseContentData[contentKey]?.[section.key] || buildSectionText(section, selectedCourse, courseContentData)
    setEditingSection(section)
    setEditingText(currentText)
    setEditModalOpen(true)
  }

  const saveEditedSection = () => {
    if (!editingSection) return
    const contentKey = `${selectedCourse.id}-${editingSection.tabKey}`
    setCourseContentData(prev => ({
      ...prev,
      [contentKey]: { ...(prev[contentKey] || {}), [editingSection.key]: editingText }
    }))
    setEditModalOpen(false)
  }

  const handleContentUpdate = (key, data) => {
    setCourseContentData(prev => ({ ...prev, [key]: { ...(prev[key] || {}), ...data } }))
  }

  return (
    <main className={['ti-page', className].filter(Boolean).join(' ')} data-ds-business-page={pageId}>
      <div className="ti-content-card">
        {!hideHeader && (
          <DSSubPageHeader className="ti-top-header" title="教育教学信息" backLabel="返回" onBack={onBack} surface={false} />
        )}
        <div className="ti-layout">
          <aside className="ti-course-pane" aria-label="授课课程">
            <div className="ti-filter-head">
              <DSSelect className="ti-semester-select" options={SEMESTER_CONFIG.options} value={selectedSemester} onChange={changeSemester} />
            </div>
            <div className="ti-search-box">
              <DSInput className="ti-search-input" placeholder="搜索课程名称" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <DSIconButton className="ti-search-btn" label="搜索" onClick={() => {}}>
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="16" height="16">
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </DSIconButton>
            </div>
            <div className="ti-course-list">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <CourseCard course={course} key={course.id} onSelect={setSelectedCourseId} selected={course.id === selectedCourseId} />
                ))
              ) : <div className="ti-empty-state">未找到相关课程</div>}
            </div>
          </aside>
          <section className="ti-detail-pane" aria-label={`${selectedCourse.name}教学信息`}>
            <div className="ti-tabs-wrap">
              <DSButtonGroup aria-label="课程内容页签" className="ti-tab-segments" size="small">
                {TABS.map((tab) => (
                  <DSButton aria-pressed={tab.key === activeTab} className={tab.key === activeTab ? 'ti-tab-segment is-active' : 'ti-tab-segment'} key={tab.key} onClick={() => setActiveTab(tab.key)} variant="text">
                    {tab.label}
                  </DSButton>
                ))}
              </DSButtonGroup>
            </div>
            <div className="ti-tab-body">
              {activeTab === 'courseInfo' ? <CourseInfoPanel course={selectedCourse} /> : null}
              {activeTab === 'design' ? <DesignTab course={selectedCourse} courseContentData={courseContentData} onContentUpdate={handleContentUpdate} /> : null}
              {activeTab === 'materials' ? <CourseMaterialsPanel course={selectedCourse} readOnly={readOnly} /> : null}
              {activeTab !== 'courseInfo' && activeTab !== 'design' && activeTab !== 'materials' ? <OtherTabContent tabKey={activeTab} course={selectedCourse} content={courseContentData} onEdit={handleEditSection} /> : null}
            </div>
          </section>
        </div>
      </div>

      <DSSingleEditModal open={editModalOpen} title={`编辑${editingSection?.title}`} onOk={saveEditedSection} onCancel={() => setEditModalOpen(false)} okText="保存" cancelText="取消">
        <DSEditField label={editingSection?.title} align="start">
          <DSTextarea value={editingText} onChange={(e) => setEditingText(e.target.value)} placeholder={`请输入${editingSection?.title}`} rows={8} />
        </DSEditField>
      </DSSingleEditModal>
    </main>
  )
}

const teachingInfoRoot = document.getElementById('app')
if (teachingInfoRoot?.dataset.entry === 'teaching-info') {
  createRoot(teachingInfoRoot).render(<TeachingInfoPage />)
}
