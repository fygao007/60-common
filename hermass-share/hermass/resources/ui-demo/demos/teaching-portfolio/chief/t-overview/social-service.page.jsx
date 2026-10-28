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
import './social-service.css'

const SECTIONS = [
  {
    key: 'tech-transfer',
    title: '科技成果转化',
    source: '科研系统',
    columns: ['成果名称', '成果所属单位', '合同编号', '合同名称', '转化方式', '受让单位', '合同金额', '签约日期'],
    rows: [
      ['职业教育智能学习分析平台', '深圳职业技术大学', 'ZH20250031', '技术成果转化协议', '转让', '深圳智教科技有限公司', '80万元', '2025-05-18'],
      ['课程画像数据采集装置', '深圳职业技术大学', 'ZH20240042', '专利实施许可合同', '许可', '广州数智教育研究院', '40万元', '2024-09-10'],
    ],
  },
  {
    key: 'school-enterprise',
    title: '校企合作（产教融合）',
    source: '教务系统',
    columns: ['项目名称', '合作类型', '合作级别', '状态', '合作开始日期', '合作结束日期', '备注', '附件'],
    rows: [
      ['人工智能专业产教融合基地建设', '共建实训基地', '省级', '进行中', '2024-03-01', '2026-12-31', '共建课程与师资', '合作协议.pdf'],
      ['华为ICT学院合作项目', '共建专业', '校级', '已完成', '2022-09-01', '2024-08-31', '联合培养学生120人', '验收报告.pdf'],
    ],
  },
  {
    key: 'academic-position',
    title: '重要学术任职情况',
    source: '教务系统',
    columns: ['任职机构名称', '任职类型', '任职级别', '任职职务', '任职开始日期', '任职结束时间', '备注', '附件'],
    rows: [
      ['广东省高等职业教育教学指导委员会', '学术团体', '省级', '委员', '2023-06-01', '2026-05-31', '计算机类专业分委会', '聘书.pdf'],
      ['中国职业技术教育学会', '学术团体', '国家级', '会员', '2022-01-01', '2025-12-31', '-', '会员证.pdf'],
    ],
  },
  {
    key: 'expert-pool',
    title: '入选专家库情况',
    source: '人事系统',
    columns: ['专家库名称', '领域', '级别', '入选日期', '审批单位', '专家编号', '参与评审次数', '附件'],
    rows: [
      ['广东省科技计划项目评审专家库', '教育技术', '省级', '2023-03-15', '广东省科技厅', 'GD20231105', '12', '专家证.pdf'],
      ['深圳市职业教育智库', '计算机教育', '市级', '2022-09-01', '深圳市教育局', 'SZ20220887', '3', '聘书.pdf'],
    ],
  },
  {
    key: 'training-lecture',
    title: '对外培训、讲座情况',
    source: '人事系统',
    columns: ['活动名称', '类型', '主办单位', '地点', '对象人群', '时间', '时长', '参与人数', '备注', '附件'],
    rows: [
      ['职业教育数字化转型专题讲座', '学术讲座', '深圳市教育局', '深圳', '职业院校教师', '2025-04-20 14:00', '3小时', '120', '主题报告', '课件.pdf'],
      ['人工智能赋能教学应用培训', '社会培训', '广东省教育厅', '广州', '企业培训师', '2024-11-12 09:00', '3小时', '60', '实操工作坊', '培训资料.pdf'],
    ],
  },
  {
    key: 'competition-judge',
    title: '担任大赛裁判情况',
    source: '人事系统',
    columns: ['赛事名称', '赛事级别', '担任角色', '主办单位', '时间', '地点', '参赛规模', '备注', '附件'],
    rows: [
      ['全国职业院校技能大赛软件测试赛项', '国家级', '裁判', '教育部', '2025-08-20', '成都', '800人', '执裁裁判', '聘书.pdf'],
      ['广东省大学生程序设计竞赛', '省级', '技术裁判', '广东省教育厅', '2024-11-10', '深圳', '500人', '技术裁判', '聘书.pdf'],
    ],
  },
]

const SECTION_DATA = SECTIONS.reduce((result, section) => ({ ...result, [section.key]: section }), {})

const ANCHOR_ITEMS = SECTIONS.map((section) => ({
  key: section.key,
  href: `#${section.key}`,
  title: section.title,
}))

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
  if (typeof window === 'undefined') return 'tech-transfer'
  const key = window.location.hash.replace(/^#/, '')
  return SECTION_DATA[key] ? key : 'tech-transfer'
}

function ServiceSection({ section }) {
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

function SocialServicePage() {
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
    if (!main) return undefined

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
    <main className="ah-page" data-ds-business-page="social-service">
      <div className="ah-content-card">
        <DSSubPageHeader className="ah-top-header" title="社会服务与影响力" backLabel="返回" onBack={onBack} surface={false} />
        <div className="ah-detail-layout">
          <div className="ah-main" ref={mainRef}>
            {SECTIONS.map((section) => <ServiceSection section={section} key={section.key} />)}
          </div>
          <aside className="ah-anchor-panel" aria-label="社会服务与影响力锚点">
            <DSAnchor activeKey={activeKey} items={ANCHOR_ITEMS} bordered aria-label="社会服务与影响力锚点" />
          </aside>
        </div>
      </div>
    </main>
  )
}

createRoot(document.getElementById('app')).render(<SocialServicePage />)
