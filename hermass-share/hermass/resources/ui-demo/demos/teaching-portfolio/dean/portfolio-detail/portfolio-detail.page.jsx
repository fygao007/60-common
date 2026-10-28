import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSAnchor,
  DSButton,
  DSDrawer,
  DSDataTable,
  DSReadOnlyField,
  DSReadOnlyForm,
  DSSubPageHeader,
  DSTabs,
} from '@wisedu/design-system'
import { TeachingInfoPage } from '../t-overview/teaching-info.page.jsx'
import { STAFF_FIELDS, staffFieldItem } from '../../shared/standard-basic-info-fields'
import '../t-overview/teaching-info.css'
import './portfolio-detail.css'

// 抽屉顶部一级分组页签：复用 teacher 的 8 张子页
const ARCHIVE_TABS = [
  { key: 'teaching-info', label: '教学信息', empty: true },
]

// 教师主数据（用 code 匹配 URL 参数）
const TEACHER_MAP = {
  T20210315: { name: '金晓智', code: 'T20210315', filled: 9, total: 9 },
  T20190472: { name: '王芳', code: 'T20190472', filled: 8, total: 9 },
  T20200819: { name: '张磊', code: 'T20200819', filled: 7, total: 9 },
  T20211203: { name: '刘洋', code: 'T20211203', filled: 9, total: 9 },
  T20220714: { name: '陈晨', code: 'T20220714', filled: 6, total: 9 },
  T20230528: { name: '赵敏', code: 'T20230528', filled: 5, total: 9 },
  T20230901: { name: '孙颖', code: 'T20230901', filled: 4, total: 9 },
  T20180317: { name: '周强', code: 'T20180317', filled: 8, total: 9 },
  T20170625: { name: '吴蔚', code: 'T20170625', filled: 9, total: 9 },
  T20221019: { name: '郑昊', code: 'T20221019', filled: 7, total: 9 },
  T20231102: { name: '冯雪', code: 'T20231102', filled: 6, total: 9 },
  T20201208: { name: '褚伟', code: 'T20201208', filled: 8, total: 9 },
}

// ========== 抽屉 7 个一级分组数据 ==========

// 分组1：基本信息（表单）
const BASIC_INFO_GROUPS = [
  {
    key: 'base', title: '基本信息', source: '人事系统', items: [
      staffFieldItem(STAFF_FIELDS.name, '金晓智'), staffFieldItem(STAFF_FIELDS.employeeNumber, 'T20210315'), staffFieldItem(STAFF_FIELDS.gender, '女'), staffFieldItem(STAFF_FIELDS.age, 36),
      staffFieldItem(STAFF_FIELDS.birthDate, '1990-02-14'), staffFieldItem(STAFF_FIELDS.ethnicity, '汉族'), staffFieldItem(STAFF_FIELDS.politicalAffiliation, '中国共产党党员'),
      staffFieldItem(STAFF_FIELDS.organization, '电子与通信工程系'), staffFieldItem(STAFF_FIELDS.schoolEntryDate, '2015-09-01'), staffFieldItem(STAFF_FIELDS.primaryPosition, '专业技术岗'),
      staffFieldItem(STAFF_FIELDS.teacherType, '教学科研型', { full: true }),
    ],
  },
  {
    key: 'education', title: '学历信息', source: '人事系统', items: [
      staffFieldItem(STAFF_FIELDS.highestEducation, '研究生'), staffFieldItem(STAFF_FIELDS.highestDegree, '工学硕士'),
      staffFieldItem(STAFF_FIELDS.graduateSchool, '华南理工大学'), staffFieldItem(STAFF_FIELDS.majorStudied, '信息与通信工程'),
      { label: '海外学习经历', value: '2023-10 至 2024-04，英国伦敦大学学院访学', full: true },
    ],
  },
  {
    key: 'title', title: '职称信息', source: '人事系统', items: [
      staffFieldItem(STAFF_FIELDS.professionalTitle, '副教授'), staffFieldItem(STAFF_FIELDS.professionalTitleLevel, '教授系列副高'),
    ],
  },
  {
    key: 'field', title: '专业领域与特长', source: '人事系统', items: [
      { label: '专业领域', value: '主要从事人工智能与软件工程、智慧教学平台建设、职业教育数字化等领域的教学与研究。', full: true, align: 'start' },
      { label: '专业特长', value: '擅长课程资源体系建设、项目化教学设计与产教融合实践指导。', full: true, align: 'start' },
    ],
  },
  {
    key: 'teacher-cert', title: '教师资格与证书', source: '人事系统', items: [
      { label: '教师资格证种类', value: '高等学校教师资格证' }, { label: '任教学科', value: '计算机科学与技术' },
      { label: '双师等级', value: '高级' }, { label: '双师认定年份', value: '2024' },
      { label: '技能等级证书', value: '软件设计师（中级）', full: true },
    ],
  },
]

const ENTERPRISE_PRACTICE_SECTIONS = [
  {
    key: 'practice', title: '企业实践', columns: ['企业名称', '所属行业', '实践开始时间', '实践结束时间', '实践内容'],
    rows: [
      ['联科精密电子股份有限公司', '科技行业', '2025-01-01', '2025-02-01', '参与智能硬件测试流程、生产现场工艺诊断与岗位能力调研。'],
      ['深圳云启工业互联网有限公司', '科技行业', '2024-07-01', '2024-08-30', '参与工业互联网平台项目调研，了解设备数据采集与边缘网关配置。'],
    ],
  },
]

const ACHIEVEMENTS_SECTIONS = [
  {
    key: 'teaching-project', title: '教研项目', columns: ['项目名称', '项目类型', '开始时间', '结束时间', '本人角色'],
    rows: [['高职数据结构课程项目化教学改革', '校级教改', '2025-03-01', '2025-12-31', '主持']],
  },
  {
    key: 'award', title: '获奖', columns: ['获奖成果名称', '奖励名称', '获奖级别', '获奖日期', '颁奖单位'],
    rows: [
      ['职业教育智能学习分析平台建设', '广东省教学成果奖', '省级二等奖', '2025-09-10', '广东省教育厅'],
      ['课程画像驱动的教学改进实践', '深圳市教育教学创新奖', '市级一等奖', '2024-12-20', '深圳市教育局'],
    ],
  },
  {
    key: 'paper', title: '论文', columns: ['论文名称', '刊物名称', '刊物级别', '发表日期', '本人排名'],
    rows: [['基于学习画像的高职课程质量改进研究', '职业技术教育', '中文核心', '2025-04-12', '1/4']],
  },
]

const TRAINING_SECTIONS = [
  {
    key: 'training', title: '培训', columns: ['培训名称', '培训级别', '培训年度', '学时', '组织单位'],
    rows: [['高等职业教育教学能力提升培训', '国家级', '2025', '40', '教育部']],
  },
  {
    key: 'visit', title: '访学', columns: ['访学机构', '国家地区', '开始日期', '结束日期', '项目名称'],
    rows: [['英国伦敦大学学院', '英国', '2023-10-01', '2024-04-30', '智慧教育技术应用研究']],
  },
]

const SOCIAL_SERVICE_SECTIONS = [
  {
    key: 'tech-service', title: '技术服务', columns: ['项目名称', '合作类型', '合作级别', '合作开始日期', '合作结束日期'],
    rows: [['中小企业数字化转型咨询', '横向课题', '市级', '2024-05-01', '2024-12-31']],
  },
  {
    key: 'expert', title: '专家聘任', columns: ['任职机构名称', '任职类型', '任职级别', '入选日期'],
    rows: [['广东省职业教育评审专家库', '评审专家', '省级', '2024-03-01']],
  },
]

const APPOINTMENT_SECTIONS = [
  {
    key: 'head-teacher', title: '担任班主任情况', columns: ['服务名称', '服务单位', '时间', '内容'],
    rows: [['2024级软件技术1班班主任', '深圳职业技术大学', '2024-09 至 2025-07', '负责班级日常管理与学风建设']],
  },
  {
    key: 'mentor-new-teacher', title: '指导新教师情况', columns: ['新教师名称', '指导周期', '指导开始日期', '指导结束日期'],
    rows: [['李敏', '一年', '2024-09-01', '2025-08-31']],
  },
]

const OTHER_EDUCATION_SECTIONS = [
  {
    key: 'second-classroom', title: '第二课堂教学', columns: ['活动名称', '类型', '时间', '人数', '成果'],
    rows: [['软件技术社团指导', '社团活动', '2024-09 至 2025-06', '30', '获校级优秀社团']],
  },
  {
    key: 'graduation-design', title: '毕业设计指导', columns: ['学生名称', '课题名称', '指导类型', '成果形式', '成绩'],
    rows: [['陈晨', '基于Vue的教务管理系统设计与实现', '毕业设计', '应用系统', '优秀']],
  },
]

// 7 个一级分组元数据
const MORE_SECTIONS = [
  { key: 'basic-info', title: '基本信息', kind: 'form', data: BASIC_INFO_GROUPS },
  { key: 'enterprise-practice', title: '企业实践', kind: 'table', data: ENTERPRISE_PRACTICE_SECTIONS },
  { key: 'achievements-honors', title: '成果与荣誉', kind: 'table', data: ACHIEVEMENTS_SECTIONS },
  { key: 'training', title: '进修（访学）培训', kind: 'table', data: TRAINING_SECTIONS },
  { key: 'social-service', title: '社会服务与影响力', kind: 'table', data: SOCIAL_SERVICE_SECTIONS },
  { key: 'appointment', title: '任职情况', kind: 'table', data: APPOINTMENT_SECTIONS },
  { key: 'other-education', title: '其他教育工作', kind: 'table', data: OTHER_EDUCATION_SECTIONS },
]

const MORE_ANCHOR_ITEMS = MORE_SECTIONS.map((section) => ({
  key: section.key,
  href: `#${section.key}`,
  title: section.title,
  children: section.data.map((sub) => ({ key: sub.key, href: `#${sub.key}`, title: sub.title })),
}))

function buildTableColumns(section) {
  const cols = section.columns.map((title, index) => ({
    key: `col-${index}`, dataIndex: `col-${index}`, title,
    minWidth: title.length >= 6 ? 160 : 120,
  }))
  cols.push({ key: 'action', dataIndex: 'action', title: '操作', width: 120 })
  return cols
}

function buildTableData(section) {
  return section.rows.map((row, rowIndex) => row.reduce((record, value, columnIndex) => ({
    ...record, [`col-${columnIndex}`]: value,
  }), { id: `${section.key}-${rowIndex}`, action: '详情' }))
}

function FormGroupSection({ groups }) {
  return (
    <div className="pd-more-form-groups">
      {groups.map((group) => (
        <div className="pd-more-sub-section" id={group.key} key={group.key}>
          <div className="pd-more-sub-head">
            <h4 className="pd-more-sub-title">{group.title}</h4>
            <span className="pd-more-source">来源：{group.source}</span>
          </div>
          <DSReadOnlyForm columns={2}>
            {group.items.map((item) => (
              <DSReadOnlyField key={item.label} label={item.label} value={item.value} fullWidth={item.full} align={item.align || 'start'} />
            ))}
          </DSReadOnlyForm>
        </div>
      ))}
    </div>
  )
}

function TableGroupSection({ sections }) {
  return (
    <div className="pd-more-table-groups">
      {sections.map((section) => (
        <div className="pd-more-sub-section" id={section.key} key={section.key}>
          <div className="pd-more-sub-head"><h4 className="pd-more-sub-title">{section.title}</h4></div>
          <DSDataTable
            columns={buildTableColumns(section)} data={buildTableData(section)} rowKey="id"
            selectable={false} showToolbar={false} tableTools={false}
            className="pd-more-table" minWidth={720}
          />
        </div>
      ))}
    </div>
  )
}

// 查看更多 · 全屏大抽屉（顶部一级分组页签 + 复用 teacher 子页）
function ViewMoreDrawer({ open, teacherName, onClose }) {
  const [activeKey, setActiveKey] = useState(ARCHIVE_TABS[0].key)
  const active = ARCHIVE_TABS.find((tab) => tab.key === activeKey) || ARCHIVE_TABS[0]
  const ActiveComp = active.Comp

  return (
    <DSDrawer open={open} title={`${teacherName} · 教学档案详情`} width="100vw" placement="right" showFooter={false} onClose={onClose} className="pd-more-drawer is-more-drawer" bodyPadding="none">
      <div className="pd-more-tabs">
        <DSTabs items={ARCHIVE_TABS.map(({ key, label }) => ({ key, label }))} activeKey={activeKey} onChange={setActiveKey} />
      </div>
      <div className="pd-more-pane">
        {active.empty ? <div className="pd-more-empty">暂无数据</div> : (ActiveComp ? <ActiveComp hideHeader /> : null)}
      </div>
    </DSDrawer>
  )
}

function PortfolioDetailPage() {
  const teacherCode = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('teacher')
  }, [])

  const teacher = TEACHER_MAP[teacherCode] || Object.values(TEACHER_MAP)[0]
  const [moreOpen, setMoreOpen] = useState(false)
  const completionRate = Math.round((teacher.filled / teacher.total) * 100)

  const onBack = () => { window.location.href = '../p-board/p-board.html' }

  return (
    <main className="pd-page pd-page--detail" data-ds-business-page="portfolio-detail">
      <DSSubPageHeader
        className="pd-top-header"
        title={`${teacher.name} ${teacher.code} · 档案完成率 ${completionRate}%`}
        backLabel="返回"
        onBack={onBack}
        surface={false}
        actions={<DSButton variant="default" onClick={() => setMoreOpen(true)}>查看更多</DSButton>}
      />
      {/* 复用 teaching-info 主体内容（只读） */}
      <TeachingInfoPage className="pd-teaching-info" pageId="portfolio-detail-teaching-info" hideHeader />
      {/* 查看更多 · 全屏大抽屉 */}
      <ViewMoreDrawer open={moreOpen} teacherName={teacher.name} onClose={() => setMoreOpen(false)} />
    </main>
  )
}

createRoot(document.getElementById('app')).render(<PortfolioDetailPage />)
