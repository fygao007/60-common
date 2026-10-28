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
    key: 'second-classroom', title: '第二课堂教学', source: '教务系统',
    columns: ['活动名称', '类型', '学生群体', '学时', '时间', '人数', '成果', '备注', '附件'],
    rows: [
      ['电子设计竞赛兴趣小组', '学科竞赛', '电子与通信工程学院学生', '60', '2025-03-15', '30', '获省级二等奖2项', '每周一次辅导', '活动记录.pdf'],
      ['人工智能编程拓展班', '学术讲座', '全院学生', '24', '2024-11-08', '50', '参与竞赛获奖', '', '活动总结.pdf'],
    ],
  },
  {
    key: 'graduation-design', title: '毕业设计指导', source: '教务系统',
    columns: ['学生名称', '学生人数', '课题名称', '课题编号', '指导类型', '指导开始日期', '指导结束时间', '成果形式', '成绩'],
    rows: [
      ['张明等4人', '4', '基于学习画像的课程推荐系统设计', 'BS202500118', '毕业设计指导', '2025-01-06', '2025-06-15', '系统实现', '88'],
      ['李华等4人', '4', '高职课堂行为数据采集与分析', 'BS202400205', '毕业设计指导', '2024-01-08', '2024-06-10', '论文+系统', '92'],
    ],
  },
  {
    key: 'other-teaching', title: '其他教育教学工作', source: '教务系统',
    columns: ['工作名称', '类型', '工作内容', '时间', '参与人员', '成果', '备注', '附件'],
    rows: [
      ['专业人才培养方案修订', '课程建设', '参与人工智能技术应用专业人才培养方案修订', '2024-06-20', '金晓智、张远', '形成新版人才培养方案', '获校级优秀', '方案定稿.pdf'],
      ['教材编写', '教材建设', '参与《数据结构项目化教程》编写', '2024-03-10', '金晓智等3人', '出版规划教材1部', '主编', '教材样章.pdf'],
    ],
  },
]

const SECTION_DATA = SECTIONS.reduce((result, section) => ({ ...result, [section.key]: section }), {})

const ANCHOR_ITEMS = SECTIONS.map((section) => ({ key: section.key, href: `#${section.key}`, title: section.title }))

const DETAIL_FULL_WIDTH_FIELDS = new Set()

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
  if (typeof window === 'undefined') return 'second-classroom'
  const key = window.location.hash.replace(/^#/, '')
  return SECTION_DATA[key] ? key : 'second-classroom'
}

function OtherEduSection({ section }) {
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

function OtherEducationPage() {
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

  return (
    <main className="ah-page" data-ds-business-page="other-education">
      <div className="ah-content-card">
        <DSSubPageHeader className="ah-top-header" title="其他教育工作" backLabel="返回" onBack={onBack} surface={false} />
        <div className="ah-detail-layout">
          <div className="ah-main" ref={mainRef}>
            {SECTIONS.map((section) => <OtherEduSection section={section} key={section.key} />)}
          </div>
          <aside className="ah-anchor-panel" aria-label="其他教育工作锚点">
            <DSAnchor activeKey={activeKey} items={ANCHOR_ITEMS} bordered aria-label="其他教育工作锚点" />
          </aside>
        </div>
      </div>
    </main>
  )
}

createRoot(document.getElementById('app')).render(<OtherEducationPage />)
