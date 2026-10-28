import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSAnchor,
  DSDataTable,
  DSModal,
  DSSubPageHeader,
  DSReadOnlyForm,
  DSReadOnlyField,
  DSButton,
} from '@wisedu/design-system'
import { SourceEditNote } from '../../shared/components'
import { STAFF_FIELDS, staffFieldItem } from '../../shared/standard-basic-info-fields'
import './basic-info.css'

const NAV_GROUPS = [
  { title: '个人信息', items: [{ key: 'base', label: '基本信息' }, { key: 'education', label: '学习信息' }, { key: 'title', label: '职称信息' }] },
  { title: '个人发展', items: [{ key: 'growth', label: '个人发展规划' }, { key: 'field', label: '专业领域' }, { key: 'skill', label: '专业特长' }] },
  { title: '资格证书信息', items: [{ key: 'teacher-cert', label: '高等学校教师资格证书' }, { key: 'double-teacher', label: '双师型教师认定' }, { key: 'skill-level', label: '技能等级证书' }, { key: 'industry-cert', label: '行业资质证书' }, { key: 'career-cert', label: '职业资格证书' }] },
  { title: '师德师风', items: [{ key: 'ethics', label: '师德师风考核结果' }] },
]

const GROUPS = [
  {
    key: 'base', title: '基本信息', source: '人事系统', items: [
      staffFieldItem(STAFF_FIELDS.name, '金晓智'), staffFieldItem(STAFF_FIELDS.employeeNumber, '1112131'), staffFieldItem(STAFF_FIELDS.gender, '女'), staffFieldItem(STAFF_FIELDS.age, 36),
      staffFieldItem(STAFF_FIELDS.birthDate, '1990-02-14'), staffFieldItem(STAFF_FIELDS.ethnicity, '汉族'), staffFieldItem(STAFF_FIELDS.politicalAffiliation, '中国共产党党员'),
      staffFieldItem(STAFF_FIELDS.organization, '信息中心'), staffFieldItem(STAFF_FIELDS.schoolEntryDate, '2025-09-01'), staffFieldItem(STAFF_FIELDS.primaryPosition, '专业技术岗'),
      staffFieldItem(STAFF_FIELDS.teacherType, '教学科研型', { full: true }),
    ],
  },
  { key: 'field', title: '专业领域', source: '教学档案袋维护', items: [{ label: '专业领域', value: '主要从事人工智能与软件工程、智慧教学平台建设、职业教育数字化等领域的教学与研究。关注人工智能技术与课程建设、教学评价和学习分析的深度融合。', full: true, align: 'start' }] },
  { key: 'skill', title: '专业特长', source: '教学档案袋维护', items: [{ label: '专业特长', value: '擅长课程资源体系建设、项目化教学设计与产教融合实践指导。能够将企业真实项目转化为教学任务，组织学生完成需求分析、方案设计、开发实施和成果评价。', full: true, align: 'start' }] },
  { key: 'growth', title: '个人成长规划', source: '教学档案袋维护', items: [{ label: '个人成长规划', value: '围绕智慧教学、课程资源建设和产教融合实践持续提升专业能力。计划完成省级精品课程建设，深化校企协同育人项目，持续沉淀课程设计、教学反思与学生发展证据，完善教学档案袋核心材料。', full: true, align: 'start' }] },
  { key: 'education', title: '学历信息', source: '人事系统、档案袋', items: [staffFieldItem(STAFF_FIELDS.highestEducation, '研究生'), staffFieldItem(STAFF_FIELDS.highestDegree, '工学硕士'), staffFieldItem(STAFF_FIELDS.graduateSchool, '华南理工大学'), staffFieldItem(STAFF_FIELDS.majorStudied, '计算机科学', { full: true })] },
  { key: 'title', title: '职称信息', source: '人事系统', items: [staffFieldItem(STAFF_FIELDS.professionalTitle, '副教授'), staffFieldItem(STAFF_FIELDS.professionalTitleLevel, '教授系列副高')] },
  { key: 'teacher-cert', title: '高等学校教师资格证书', source: '人事系统', items: [{ label: '教师资格证种类', value: '高等学校教师资格证' }, { label: '任教学科', value: '计算机科学与技术' }, { label: '发证日期', value: '2016-09-01' }, { label: '发证单位', value: '广东省教育厅' }, { label: '证书编号', value: '201544017***0008' }, { label: '备注', value: '' }, { label: '附件', value: '教师资格证.pdf', full: true }] },
  { key: 'double-teacher', title: '双师型教师认定', source: '人事系统', items: [{ label: '认定专业大类', value: '电子信息大类' }, { label: '认定专业', value: '软件技术' }, { label: '双师等级', value: '高级' }, { label: '认定中心', value: '广东省职业教育双师型教师认定中心' }, { label: '认定年份', value: '2024' }, { label: '认定通过时间', value: '2024-06-15' }, { label: '发证时间', value: '2024-06-30' }, { label: '发证单位', value: '广东省教育厅职教处' }, { label: '证书编号', value: 'SZ-SS-2024-0231' }, { label: '有效期', value: '2024-06-30 至 2029-06-29' }, { label: '备注', value: '' }, { label: '附件', value: '双师型认定.pdf' }] },
  { key: 'skill-level', title: '技能等级证书', source: '人事系统', items: [{ label: '证书名称', value: '软件设计师' }, { label: '工种名称', value: '软件开发' }, { label: '技术等级', value: '中级' }, { label: '取得途径', value: '考试取得' }, { label: '取得日期', value: '2022-11-20' }, { label: '发证日期', value: '2022-12-15' }, { label: '发证单位', value: '人社部职业技能鉴定中心' }, { label: '证书编号', value: 'SC-2022-5567' }, { label: '备注', value: '' }, { label: '附件', value: '技能等级证书.pdf' }] },
  { key: 'industry-cert', title: '行业资质证书', source: '人事系统', items: [{ label: '行业资质名称', value: '信息系统项目管理师' }, { label: '行业类别', value: '信息技术服务' }, { label: '证书等级', value: '高级' }, { label: '发证单位', value: '中国通信工业协会' }, { label: '取得时间', value: '2019-03' }, { label: '证书编号', value: 'RC-2019-1142' }, { label: '是否注册类证书', value: '否' }, { label: '注册类证书有效期', value: '' }, { label: '当前状态', value: '有效' }, { label: '附件', value: '行业资质证.pdf' }] },
  { key: 'career-cert', title: '职业资格证书', source: '人事系统', items: [{ label: '职（执）业资格名称', value: '网络工程师' }, { label: '等级', value: '中级' }, { label: '取得途径', value: '考试取得' }, { label: '其他取得途径', value: '' }, { label: '取得时间', value: '2021-10-16' }, { label: '发证时间', value: '2021-12-01' }, { label: '发证单位', value: '工业和信息化部教育与考试中心' }, { label: '证书编号', value: 'ZG-2021-8392' }, { label: '备注', value: '' }, { label: '附件', value: '职业资格证书.pdf' }] },
  { key: 'ethics', title: '师德师风考核结果', source: '人事系统', items: [{ label: '考核学年', value: '2025—2026学年' }, { label: '考核结果', value: '优秀' }] },
]

const GROUPS_BY_KEY = GROUPS.reduce((map, group) => { map[group.key] = group; return map }, {})
const CONTENT_GROUPS = NAV_GROUPS.map((navGroup) => ({ title: navGroup.title, items: navGroup.items.map((item) => GROUPS_BY_KEY[item.key]).filter(Boolean) }))
const LARGE_TEXT_GROUP_KEYS = new Set(['growth', 'field', 'skill'])

const EDUCATION_COLUMNS = [
  { key: 'education', dataIndex: 'education', title: '学历信息', minWidth: 130 },
  { key: 'degree', dataIndex: 'degree', title: '学位类型', minWidth: 140 },
  { key: 'school', dataIndex: 'school', title: '毕业院校', minWidth: 180 },
  { key: 'major', dataIndex: 'major', title: '毕业专业', minWidth: 180 },
  { key: 'overseas', dataIndex: 'overseas', title: '海外学习经历', minWidth: 160 },
]

const EDUCATION_DATA = [
  { id: 'undergraduate', education: '本科', degree: '工学学士', school: '深圳大学', major: '计算机科学与技术', overseas: '无' },
  { id: 'graduate', education: '研究生', degree: '工学硕士', school: '华南理工大学', major: '软件工程', overseas: '无' },
]

const TABLE_SECTION_CONFIG = {
  'teacher-cert': { minWidth: 1040, sortKey: 'issueDate', columns: [{ key: 'type', dataIndex: 'type', title: '资格证种类', minWidth: 180 }, { key: 'subject', dataIndex: 'subject', title: '任教学科', minWidth: 180 }, { key: 'issueDate', dataIndex: 'issueDate', title: '发证日期', minWidth: 130 }, { key: 'issuer', dataIndex: 'issuer', title: '发证单位', minWidth: 180 }, { key: 'number', dataIndex: 'number', title: '证书编号', minWidth: 190 }, { key: 'attachment', dataIndex: 'attachment', title: '附件', minWidth: 160 }], data: [{ id: 'tc-2024', type: '高等学校教师资格证', subject: '软件工程', issueDate: '2024-10-18', issuer: '广东省教育厅', number: '202444017***0218', attachment: '教师资格证-2024.pdf' }, { id: 'tc-2020', type: '高等学校教师资格证', subject: '计算机应用技术', issueDate: '2020-09-22', issuer: '广东省教育厅', number: '202044017***0136', attachment: '教师资格证-2020.pdf' }, { id: 'tc-2016', type: '高等学校教师资格证', subject: '计算机科学与技术', issueDate: '2016-09-01', issuer: '广东省教育厅', number: '201544017***0008', attachment: '教师资格证-2016.pdf' }] },
  'double-teacher': { minWidth: 1240, sortKey: 'approvedDate', columns: [{ key: 'category', dataIndex: 'category', title: '认定专业大类', minWidth: 160 }, { key: 'major', dataIndex: 'major', title: '认定专业', minWidth: 150 }, { key: 'level', dataIndex: 'level', title: '双师等级', minWidth: 110 }, { key: 'year', dataIndex: 'year', title: '认定年份', minWidth: 110 }, { key: 'approvedDate', dataIndex: 'approvedDate', title: '认定通过时间', minWidth: 150 }, { key: 'issuer', dataIndex: 'issuer', title: '发证单位', minWidth: 210 }, { key: 'validity', dataIndex: 'validity', title: '有效期', minWidth: 220 }, { key: 'number', dataIndex: 'number', title: '证书编号', minWidth: 180 }, { key: 'attachment', dataIndex: 'attachment', title: '附件', minWidth: 170 }], data: [{ id: 'dt-2024', category: '电子信息大类', major: '软件技术', level: '高级', year: '2024', approvedDate: '2024-06-15', issuer: '广东省教育厅职教处', validity: '2024-06-30 至 2029-06-29', number: 'SZ-SS-2024-0231', attachment: '双师型认定-2024.pdf' }, { id: 'dt-2021', category: '电子信息大类', major: '计算机网络技术', level: '中级', year: '2021', approvedDate: '2021-07-08', issuer: '深圳市教育局', validity: '2021-07-20 至 2024-07-19', number: 'SZ-SS-2021-0108', attachment: '双师型认定-2021.pdf' }, { id: 'dt-2018', category: '电子信息大类', major: '软件技术', level: '初级', year: '2018', approvedDate: '2018-05-12', issuer: '深圳职业技术学院', validity: '2018-06-01 至 2021-05-31', number: 'SZ-SS-2018-0066', attachment: '双师型认定-2018.pdf' }] },
  'skill-level': { minWidth: 1220, sortKey: 'acquiredDate', columns: [{ key: 'name', dataIndex: 'name', title: '证书名称', minWidth: 170 }, { key: 'trade', dataIndex: 'trade', title: '工种名称', minWidth: 150 }, { key: 'level', dataIndex: 'level', title: '技术等级', minWidth: 110 }, { key: 'route', dataIndex: 'route', title: '取得途径', minWidth: 120 }, { key: 'acquiredDate', dataIndex: 'acquiredDate', title: '取得日期', minWidth: 130 }, { key: 'issuer', dataIndex: 'issuer', title: '发证单位', minWidth: 210 }, { key: 'number', dataIndex: 'number', title: '证书编号', minWidth: 170 }, { key: 'attachment', dataIndex: 'attachment', title: '附件', minWidth: 160 }], data: [{ id: 'sl-2025', name: '人工智能训练师', trade: '人工智能训练', level: '高级', route: '技能认定', acquiredDate: '2025-03-18', issuer: '广东省职业技能鉴定中心', number: 'AI-2025-0318', attachment: '人工智能训练师.pdf' }, { id: 'sl-2023', name: '大数据工程技术人员', trade: '大数据分析', level: '中级', route: '考试取得', acquiredDate: '2023-11-12', issuer: '工业和信息化部教育与考试中心', number: 'BD-2023-1162', attachment: '大数据工程师.pdf' }, { id: 'sl-2022', name: '软件设计师', trade: '软件开发', level: '中级', route: '考试取得', acquiredDate: '2022-11-20', issuer: '人社部职业技能鉴定中心', number: 'SC-2022-5567', attachment: '软件设计师.pdf' }, { id: 'sl-2019', name: '网络管理员', trade: '计算机网络', level: '高级工', route: '培训认定', acquiredDate: '2019-08-16', issuer: '深圳市职业技能鉴定中心', number: 'NW-2019-0816', attachment: '网络管理员.pdf' }] },
  'industry-cert': { minWidth: 1180, sortKey: 'acquiredDate', columns: [{ key: 'name', dataIndex: 'name', title: '行业资质名称', minWidth: 210 }, { key: 'category', dataIndex: 'category', title: '行业类别', minWidth: 160 }, { key: 'level', dataIndex: 'level', title: '证书等级', minWidth: 110 }, { key: 'acquiredDate', dataIndex: 'acquiredDate', title: '取得时间', minWidth: 130 }, { key: 'issuer', dataIndex: 'issuer', title: '发证单位', minWidth: 210 }, { key: 'number', dataIndex: 'number', title: '证书编号', minWidth: 170 }, { key: 'status', dataIndex: 'status', title: '当前状态', minWidth: 110 }, { key: 'attachment', dataIndex: 'attachment', title: '附件', minWidth: 160 }], data: [{ id: 'ic-2024', name: '信息系统项目管理师', category: '信息技术服务', level: '高级', acquiredDate: '2024-11-09', issuer: '工业和信息化部教育与考试中心', number: 'PM-2024-1109', status: '有效', attachment: '项目管理师.pdf' }, { id: 'ic-2022', name: '信息安全工程师', category: '网络安全', level: '中级', acquiredDate: '2022-05-28', issuer: '中国信息安全评测中心', number: 'IS-2022-0528', status: '有效', attachment: '信息安全工程师.pdf' }, { id: 'ic-2019', name: '信息系统项目管理师', category: '信息技术服务', level: '高级', acquiredDate: '2019-03-16', issuer: '中国通信工业协会', number: 'RC-2019-1142', status: '已换证', attachment: '行业资质证-2019.pdf' }] },
  ethics: { minWidth: 1080, sortKey: 'year', columns: [{ key: 'schoolYear', dataIndex: 'schoolYear', title: '考核学年', minWidth: 150 }, { key: 'year', dataIndex: 'year', title: '考核年度', minWidth: 110 }, { key: 'date', dataIndex: 'date', title: '考核开展时间', minWidth: 150 }, { key: 'result', dataIndex: 'result', title: '考核结果', minWidth: 110 }, { key: 'exception', dataIndex: 'exception', title: '考核异常原因', minWidth: 220 }, { key: 'remark', dataIndex: 'remark', title: '备注', minWidth: 250 }], data: [{ id: 'ethics-2025', schoolYear: '2025—2026学年', year: '2025', date: '2026-01-15', result: '优秀', exception: '-', remark: '年度师德考核优秀' }, { id: 'ethics-2024', schoolYear: '2024—2025学年', year: '2024', date: '2025-01-12', result: '优秀', exception: '-', remark: '获评校级师德先进个人' }, { id: 'ethics-2023', schoolYear: '2023—2024学年', year: '2023', date: '2024-01-10', result: '合格', exception: '-', remark: '-' }, { id: 'ethics-2022', schoolYear: '2022—2023学年', year: '2022', date: '2023-01-11', result: '合格', exception: '-', remark: '-' }, { id: 'ethics-2021', schoolYear: '2021—2022学年', year: '2021', date: '2022-01-13', result: '合格', exception: '-', remark: '-' }] },
}

const CERTIFICATE_DETAIL_KEYS = new Set(['teacher-cert', 'double-teacher', 'skill-level', 'industry-cert'])

const ANCHOR_ITEMS = NAV_GROUPS.map((group) => ({
  key: `${group.items[0].key}-group`,
  href: `#${group.items[0].key}`,
  title: group.title,
  children: group.items.map((item) => ({ key: item.key, href: `#${item.key}`, title: item.label })),
}))

function activeKeyFromHash() {
  if (typeof window === 'undefined') return 'base'
  const key = window.location.hash.replace(/^#/, '')
  return GROUPS.some((group) => group.key === key) ? key : 'base'
}

function FieldCell({ item }) {
  return (
    <DSReadOnlyField align={item.align} emptyText="" fullWidth={item.full} key={item.label} label={item.label} value={item.value} />
  )
}

function AttachmentLink({ filename }) {
  if (!filename) return '-'
  const content = encodeURIComponent(`${filename}\n教学档案袋示例附件`)
  return (
    <a className="bi-attachment-link" href={`data:text/plain;charset=utf-8,${content}`} download={filename}>
      {filename}
    </a>
  )
}

function EducationTable() {
  return (
    <DSDataTable
      title="学历信息"
      columns={EDUCATION_COLUMNS}
      data={EDUCATION_DATA}
      rowKey="id"
      selectable={false}
      showToolbar={false}
      tableTools={false}
      minWidth={820}
      className="bi-square-table"
    />
  )
}

function RecordTable({ group, config }) {
  const [detail, setDetail] = useState(null)
  const data = [...config.data].sort((left, right) => String(right[config.sortKey]).localeCompare(String(left[config.sortKey])))
  const showDetailAction = CERTIFICATE_DETAIL_KEYS.has(group.key)

  return (
    <>
      <DSDataTable
        title={group.title}
        columns={config.columns}
        data={data}
        rowKey="id"
        selectable={false}
        showToolbar={false}
        tableTools={false}
        minWidth={config.minWidth}
        className="bi-square-table"
        actions={showDetailAction ? [{ key: 'detail', label: '详情', onClick: setDetail }] : []}
        actionsMaxVisible={1}
      />
      <DSModal
        open={Boolean(detail)}
        title={`${group.title}详情`}
        size="large"
        okText="关闭"
        showCancel={false}
        onOk={() => setDetail(null)}
        onCancel={() => setDetail(null)}
      >
        <DSReadOnlyForm columns={2}>
          {detail ? config.columns.map((column) => (
            <DSReadOnlyField
              align="start"
              fullWidth={['issuer', 'validity', 'attachment'].includes(column.key)}
              key={column.key}
              label={column.title}
              value={column.key === 'attachment' ? undefined : detail[column.dataIndex]}
            >
              {column.key === 'attachment' ? <AttachmentLink filename={detail[column.dataIndex]} /> : undefined}
            </DSReadOnlyField>
          )) : null}
        </DSReadOnlyForm>
      </DSModal>
    </>
  )
}

function LargeTextDisplay({ group }) {
  const item = group.items[0]
  return (
    <DSReadOnlyForm columns={2}>
      <DSReadOnlyField align="start" fullWidth label={item.label}>
        <p className="bi-large-text-copy">{item.value}</p>
      </DSReadOnlyField>
    </DSReadOnlyForm>
  )
}

function InfoSection({ group, onEdit }) {
  const tableConfig = TABLE_SECTION_CONFIG[group.key]

  return (
    <section className="bi-section" id={group.key}>
      <div className="bi-section-head">
        <h2 className="bi-section-title"><span>{group.title}</span></h2>
        <SourceEditNote source={group.source} onEdit={onEdit} />
      </div>
      {group.key === 'education' ? <EducationTable />
        : tableConfig ? <RecordTable group={group} config={tableConfig} />
          : LARGE_TEXT_GROUP_KEYS.has(group.key) ? <LargeTextDisplay group={group} />
            : <DSReadOnlyForm columns={2}>{group.items.map((item) => <FieldCell item={item} key={item.label} />)}</DSReadOnlyForm>}
    </section>
  )
}

function InfoPrimaryGroup({ group, onEdit, onEthicsOpen }) {
  return (
    <section className="bi-primary-group" aria-label={group.title}>
      <div className="bi-primary-group__header">
        <h2 className="bi-primary-group__title">{group.title}</h2>
        {group.title === '师德师风' ? <DSButton size="small" variant="default" onClick={onEthicsOpen}>师德师风承诺书</DSButton> : null}
      </div>
      <div className="bi-primary-group__body">
        {group.items.map((item) => <InfoSection group={item} key={item.key} onEdit={onEdit} />)}
      </div>
    </section>
  )
}

function BasicInfoPage() {
  const [activeKey, setActiveKey] = useState(activeKeyFromHash)
  const [ethicsOpen, setEthicsOpen] = useState(false)

  useEffect(() => {
    const update = () => setActiveKey(activeKeyFromHash())
    window.addEventListener('hashchange', update)
    update()
    return () => window.removeEventListener('hashchange', update)
  }, [])

  useEffect(() => {
    if (activeKey !== 'ethics') return
    try {
    } catch (e) {}
  }, [activeKey])

  const onEdit = () => {
    if (window.__renderBasicInfoDrawer) {
      window.__renderBasicInfoDrawer(document.getElementById('biDrawerHost'), {
        onClose: () => window.__unmountBasicInfoDrawer && window.__unmountBasicInfoDrawer(document.getElementById('biDrawerHost')),
      })
    }
  }
  const onBack = () => { window.location.href = 't-overview.html' }

  return (
    <main className="bi-page" data-ds-business-page="basic-info">
      <div className="bi-content-card">
        <DSSubPageHeader className="bi-top-header" title="基本信息" backLabel="返回" onBack={onBack} surface={false} />
        <div className="bi-detail-layout">
          <div className="bi-main">
            {CONTENT_GROUPS.map((group) => <InfoPrimaryGroup group={group} key={group.title} onEdit={onEdit} onEthicsOpen={() => setEthicsOpen(true)} />)}
          </div>
          <aside className="bi-anchor-panel" aria-label="档案信息锚点">
            <DSAnchor activeKey={activeKey} items={ANCHOR_ITEMS} bordered aria-label="档案信息锚点" />
          </aside>
        </div>
      </div>
      <div id="biDrawerHost" />
    </main>
  )
}

createRoot(document.getElementById('app')).render(<BasicInfoPage />)
