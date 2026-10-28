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
import './training.css'

const SECTIONS = [
  {
    key: 'training-record',
    title: '培训记录',
    source: '教务系统',
    columns: ['培训年度', '开始时间', '结束时间', '学时', '培训名称', '培训级别', '培训方式', '培训国家', '培训地点', '培训学时', '组织单位', '附件'],
    rows: [
      ['2025', '2025-07-10', '2025-07-24', '120', '职业教育教学创新研修', '国家级', '集中培训', '中国', '北京', '120', '教育部职业院校教师素质提高计划', '结业证书.pdf'],
      ['2024', '2024-03-15', '2024-03-22', '40', '人工智能赋能教学能力提升', '省级', '线上培训', '中国', '深圳', '40', '广东省教育厅', '学时证明.pdf'],
    ],
  },
  {
    key: 'visiting-scholar',
    title: '访学情况',
    source: '人事系统',
    columns: ['开始日期', '结束日期', '国家地区', '访学机构', '项目名称', '组织单位', '备注', '附件'],
    rows: [
      ['2024-09-01', '2025-03-01', '美国', '麻省理工学院', '国家公派访问学者项目', '国家留学基金管理委员会', '研究方向为学习分析技术', '邀请函.pdf'],
      ['2022-02-15', '2022-08-15', '中国香港', '香港理工大学', '教育部青年骨干教师访学计划', '教育部', '校企合作课题研究', '结题报告.pdf'],
    ],
  },
  {
    key: 'degree-pursuit',
    title: '攻读学位情况',
    source: '人事系统',
    columns: ['毕业院校', '所学专业', '学制', '学习形式', '教育类别', '是否师范生', '学历', '学位', '学科门类', '入学日期', '毕业日期', '学位授予日期', '学位授予单位', '学历授予国家', '学位授予国家', '备注', '附件'],
    rows: [
      ['华南师范大学', '教育技术学', '4年', '全日制', '普通高等教育', '是', '博士研究生', '教育学博士', '教育学', '2018-09-01', '2022-06-30', '2022-06-25', '华南师范大学', '中国', '中国', '研究方向：学习分析与教育数据挖掘', '学位证.pdf'],
      ['华中师范大学', '计算机科学与技术', '3年', '全日制', '普通高等教育', '否', '硕士研究生', '工学硕士', '工学', '2014-09-01', '2017-06-30', '2017-06-20', '华中师范大学', '中国', '中国', '-', '学历证.pdf'],
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
  if (typeof window === 'undefined') return 'training-record'
  const key = window.location.hash.replace(/^#/, '')
  return SECTION_DATA[key] ? key : 'training-record'
}

function TrainingSection({ section }) {
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

function TrainingPage() {
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
    <main className="ah-page" data-ds-business-page="training">
      <div className="ah-content-card">
        <DSSubPageHeader className="ah-top-header" title="进修（访学）培训" backLabel="返回" onBack={onBack} surface={false} />
        <div className="ah-detail-layout">
          <div className="ah-main" ref={mainRef}>
            {SECTIONS.map((section) => <TrainingSection section={section} key={section.key} />)}
          </div>
          <aside className="ah-anchor-panel" aria-label="进修访学培训锚点">
            <DSAnchor activeKey={activeKey} items={ANCHOR_ITEMS} bordered aria-label="进修访学培训锚点" />
          </aside>
        </div>
      </div>
    </main>
  )
}

createRoot(document.getElementById('app')).render(<TrainingPage />)
