import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSAnchor,
  DSDataTable,
  DSModal,
  DSReadOnlyField,
  DSReadOnlyForm,
  DSSubPageHeader,
} from '@wisedu/design-system'
import { SourceEditNote } from '../../shared/components'
import './achievements-honors.css'

const SECTIONS = [
  {
    key: 'teaching-project', title: '教研项目', source: '教务系统',
    columns: ['项目名称', '开始时间', '结束时间', '项目类型', '学科领域', '经费额', '委托单位', '本人角色', '总人数', '本人排名'],
    rows: [
      ['高职数据结构课程项目化教学改革', '2025-03-01', '2025-12-31', '校级教改', '计算机教育', '8万元', '深圳职业技术大学', '主持', '5', '1'],
      ['人工智能导论混合式教学资源建设', '2024-09-01', '2025-06-30', '课程改革', '人工智能', '4万元', '信息学院', '骨干成员', '6', '2'],
    ],
  },
  {
    key: 'research-project', title: '科研项目', source: '科研系统',
    columns: ['项目名称', '项目类别', '立项日期', '项目级别', '项目状态', '项目来源', '合同编号', '合同经费', '配套经费', '结项日期', '科研大类', '项目分类', '角色', '完成单位排名', '实际支出金额', '到账经费', '成员人数', '学科领域', '项目批准号', '项目委托单位', '项目类型', '本人排名', '备注', '附件'],
    rows: [
      ['职业教育智能学习分析关键技术研究', '纵向项目', '2025-01-10', '国家级', '在研', '教育部', 'KY20250118', '48万元', '12万元', '-', '教育技术', '应用研究', '负责人', '1', '18万元', '36万元', '8', '职业教育数字化', 'MOE-2025-0118', '教育部', '重点项目', '1', '按计划推进', '项目任务书.pdf'],
      ['面向课程画像的教学质量评价模型', '横向项目', '2024-05-16', '校级', '已结项', '企业委托', 'HX20240532', '20万元', '0万元', '2025-04-30', '计算机应用', '技术开发', '项目骨干', '1', '20万元', '20万元', '5', '学习分析', 'SZPU-2024-0532', '深圳市智慧教育科技有限公司', '一般项目', '2', '已完成验收', '结项报告.pdf'],
    ],
  },
  {
    key: 'paper', title: '论文', source: '科研系统',
    columns: ['科研大类', '论文名称', '关键字', '发表日期', '字数', '刊物名称', '刊物级别', 'ISSN', '影响因子', 'SCI学科IF排名', '学校排名', '排名', '是否通讯作者', '收录说明', '论文类型', '成员人数', '本人排名', '是否发表', '卷号', '学科领域', '本人角色', '备注', '附件'],
    rows: [
      ['教育技术', '基于学习画像的高职课程质量改进研究', '学习分析；课程画像', '2025-04-12', '8500', '职业技术教育', '中文核心', '1008-3219', '2.1', 'Q2', 'A类', '1/4', '是', 'CSSCI扩展版', '期刊论文', '4', '1', '是', '46(12)', '职业教育数字化', '第一作者', '已正式发表', '论文全文.pdf'],
      ['计算机教育', '项目化教学中过程性数据采集模型构建', '项目化教学；数据采集', '2024-11-08', '7200', '计算机教育', '核心', '1672-5913', '1.6', 'Q3', 'B类', '2/5', '否', '中国知网收录', '期刊论文', '5', '2', '是', '24(11)', '学习分析', '共同作者', '-', '论文全文.pdf'],
    ],
  },
  {
    key: 'patent', title: '专利', source: '科研系统',
    columns: ['专利编号', '科研成果类型', '专利名称', '专利类型', '专利状态', '申请人', '申请日期', '专利权人', '是否本校专利', '专利简介', '国家地区', '专利有效期', '备注', '附件'],
    rows: [
      ['ZL202410218766.3', '应用成果', '一种课堂学习行为数据采集装置', '实用新型', '已授权', '金晓智等', '2024-03-22', '深圳职业技术大学', '是', '用于采集与分析课堂学习行为数据', '中国', '2034-03-21', '正常有效', '专利证书.pdf'],
      ['CN202510034218.4', '应用成果', '面向课程画像的资源推荐方法', '发明专利', '实审中', '金晓智等', '2025-01-18', '深圳职业技术大学', '是', '基于课程画像匹配个性化学习资源', '中国', '-', '进入实质审查', '受理通知书.pdf'],
    ],
  },
  {
    key: 'book', title: '著作', source: '科研系统',
    columns: ['著作名称', '著作英文名称', '出版社名称', '出版社级别', '出版社所在国家地区', '出版日期', 'ISBN号', '字数', '类别', '版次', '学校属名', '第一作者', '著作简介', '一级学科', '学科门类', '成果所属单位', '备注', '附件'],
    rows: [
      ['职业教育数字化课程建设实践', 'Practice of Digital Curriculum Construction in Vocational Education', '电子工业出版社', '国家级出版社', '中国', '2025-06-01', '9787121489062', '18万字', '教材专著', '1', '是', '金晓智', '系统介绍职业教育数字化课程建设方法与案例', '教育学', '教育学', '信息学院', '第一版', '著作封面.pdf'],
    ],
  },
  {
    key: 'award', title: '获奖', source: '科研系统',
    columns: ['获奖成果名称', '奖励名称', '类型', '获奖级别', '成果获奖等级', '奖励文号', '获奖日期', '获奖金额', '颁奖单位', '一级学科', '学科门类', '成果形式', '单位排名', '所属单位', '备注', '附件'],
    rows: [
      ['职业教育智能学习分析平台建设', '广东省教学成果奖', '教学成果', '省级', '二等奖', '粤教成〔2025〕18号', '2025-09-10', '3万元', '广东省教育厅', '教育学', '教育学', '平台与研究报告', '1', '信息学院', '第一完成人', '获奖证书.pdf'],
      ['课程画像驱动的教学改进实践', '深圳市教育教学创新奖', '教学改革', '市级', '一等奖', '深教〔2024〕56号', '2024-12-20', '0万元', '深圳市教育局', '教育学', '教育学', '教学案例', '1', '信息学院', '团队成果', '表彰文件.pdf'],
    ],
  },
  {
    key: 'student-award', title: '指导学生参赛获奖', source: '教务系统',
    columns: ['奖项名称', '级别', '等级', '获奖日期', '颁奖单位', '指导学生', '所属单位', '单位排名', '备注', '附件'],
    rows: [
      ['全国职业院校技能大赛软件测试赛项', '国家级', '二等奖', '2025-08-20', '教育部', '陈晨等4人', '信息学院', '1', '团队赛', '获奖证书.pdf'],
      ['广东省大学生程序设计竞赛', '省级', '一等奖', '2024-11-10', '广东省教育厅', '林可等3人', '信息学院', '1', '团队赛', '获奖证书.pdf'],
    ],
  },
]

const SECTION_DATA = SECTIONS.reduce((result, section) => ({ ...result, [section.key]: section }), {})

const ANCHOR_ITEMS = SECTIONS.map((section) => ({ key: section.key, href: `#${section.key}`, title: section.title }))

const DETAIL_FULL_WIDTH_FIELDS = new Set([
  '项目名称',
  '论文名称',
  '专利名称',
  '专利简介',
  '著作名称',
  '著作英文名称',
  '著作简介',
  '获奖成果名称',
  '奖项名称',
  '备注',
  '附件',
])

function buildColumns(section) {
  return section.columns.map((title, index) => ({
    key: `field-${index}`,
    dataIndex: `field-${index}`,
    title,
    minWidth: title.length >= 8 ? 190 : 140,
  }))
}

function buildData(section) {
  return section.rows.map((row, rowIndex) => row.reduce((record, value, columnIndex) => ({
    ...record,
    [`field-${columnIndex}`]: value,
  }), { id: `${section.key}-${rowIndex}` }))
}

function activeKeyFromHash() {
  if (typeof window === 'undefined') return 'teaching-project'
  const key = window.location.hash.replace(/^#/, '')
  return SECTION_DATA[key] ? key : 'teaching-project'
}

function AchievementSection({ section }) {
  const [detail, setDetail] = useState(null)
  const columns = buildColumns(section)
  const data = buildData(section)

  return (
    <>
      <section className="ah-section" id={section.key} data-section-key={section.key}>
        <div className="ah-section-head">
          <h3 className="ah-section-title">{section.title}</h3>
          <SourceEditNote source={section.source} className="ah-source-note" />
        </div>
        <DSDataTable
          title={`${section.title}明细`}
          columns={columns}
          data={data}
          rowKey="id"
          selectable={false}
          showToolbar={false}
          tableTools={false}
          className="ah-square-table"
          minWidth={Math.max(880, columns.length * 150)}
          actions={[{ key: 'detail', label: '详情', onClick: setDetail }]}
          actionsMaxVisible={1}
        />
      </section>
      <DSModal
        open={Boolean(detail)}
        title={`${section.title}详情`}
        size="large"
        okText="关闭"
        showCancel={false}
        onOk={() => setDetail(null)}
        onCancel={() => setDetail(null)}
      >
        <DSReadOnlyForm columns={2}>
          {detail ? columns.map((column) => (
            <DSReadOnlyField
              align="start"
              fullWidth={DETAIL_FULL_WIDTH_FIELDS.has(column.title)}
              key={column.key}
              label={column.title}
              value={detail[column.dataIndex]}
            />
          )) : null}
        </DSReadOnlyForm>
      </DSModal>
    </>
  )
}

function AchievementsHonorsPage() {
  const [activeKey, setActiveKey] = useState(activeKeyFromHash)
  const mainRef = useRef(null)

  useEffect(() => {
    const update = () => setActiveKey(activeKeyFromHash())
    window.addEventListener('hashchange', update)
    update()
    return () => window.removeEventListener('hashchange', update)
  }, [])

  useEffect(() => {
    const main = mainRef.current
    if (!main) return

    const updateFromScroll = () => {
      const sections = Array.from(main.querySelectorAll('[data-section-key]'))
      const mainBox = main.getBoundingClientRect()
      const atBottom = main.scrollTop + main.clientHeight >= main.scrollHeight - 2
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

  return (
    <main className="ah-page" data-ds-business-page="achievements-honors">
      <div className="ah-content-card">
        <DSSubPageHeader className="ah-top-header" title="成果与荣誉" backLabel="返回" onBack={onBack} surface={false} />
        <div className="ah-detail-layout">
          <div className="ah-main" ref={mainRef}>
            {SECTIONS.map((section) => <AchievementSection section={section} key={section.key} />)}
          </div>
          <aside className="ah-anchor-panel" aria-label="成果与荣誉锚点">
            <DSAnchor activeKey={activeKey} items={ANCHOR_ITEMS} bordered aria-label="成果与荣誉锚点" />
          </aside>
        </div>
      </div>
    </main>
  )
}

createRoot(document.getElementById('app')).render(<AchievementsHonorsPage />)
