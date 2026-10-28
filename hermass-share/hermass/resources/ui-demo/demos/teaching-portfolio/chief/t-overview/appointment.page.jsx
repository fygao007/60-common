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
    key: 'head-teacher', title: '担任班主任情况', source: '教务系统',
    columns: ['服务名称', '服务类型', '服务单位', '时间', '内容', '影响范围', '备注', '附件'],
    rows: [
      ['2024级软件技术1班班主任', '班主任', '深圳职业技术大学', '2024-09 至 2025-07', '负责班级日常管理与学风建设', '班级45名学生，获评优秀班集体', '所带班级获校级优秀班集体', '班主任聘书.pdf'],
      ['2022级人工智能技术应用班班主任', '班主任', '深圳职业技术大学', '2022-09 至 2023-07', '负责班级日常管理与就业指导', '班级41名学生', '', '班主任聘书.pdf'],
    ],
  },
  {
    key: 'postgraduate-supervisor', title: '担任研究生导师情况', source: '研究生系统',
    columns: ['导师类型', '所属学科', '研究生人数', '任职开始时间', '任职结束时间'],
    rows: [
      ['硕士研究生导师', '电子信息', '2', '2023-09-01', '2026-06-30'],
    ],
  },
  {
    key: 'mentor-new-teacher', title: '指导新教师情况', source: '人事系统',
    columns: ['新教师名称', '指导周期', '指导内容', '指导开始日期', '指导结束日期', '新教师考核结果', '所属学院', '备注', '附件'],
    rows: [
      ['李敏', '一年', '指导教学工作规范与课程设计', '2024-09-01', '2025-08-31', '合格', '信息学院', '考核合格，超额完成指导任务', '指导记录.pdf'],
      ['王莉', '一年', '指导课堂教学与教学档案建设', '2023-09-01', '2024-08-31', '优秀', '信息学院', '获评优秀指导教师', '指导总结.pdf'],
    ],
  },
]

const SECTION_DATA = SECTIONS.reduce((result, section) => ({ ...result, [section.key]: section }), {})

const ANCHOR_ITEMS = SECTIONS.map((section) => ({ key: section.key, href: `#${section.key}`, title: section.title }))

// 本页字段值均较短（详见各 section 的 rows），不需要 fullWidth 跨列展示；
// 若后续接入更长的文本字段，注意 fullWidth 字段必须落在 2 列网格的行首（前面已消耗的字段数为偶数），
// 否则会触发 CSS Grid 自动换行错位（label/content 与后续字段串行）。
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
  if (typeof window === 'undefined') return 'head-teacher'
  const key = window.location.hash.replace(/^#/, '')
  return SECTION_DATA[key] ? key : 'head-teacher'
}

function AppointmentSection({ section }) {
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

function AppointmentPage() {
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
      // 内容较短、无需滚动时 scrollHeight === clientHeight，须排除该情形，
      // 否则会一直判定为"已到底部"，首次加载就错误高亮最后一个锚点。
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
    <main className="ah-page" data-ds-business-page="appointment">
      <div className="ah-content-card">
        <DSSubPageHeader className="ah-top-header" title="任职情况" backLabel="返回" onBack={onBack} surface={false} />
        <div className="ah-detail-layout">
          <div className="ah-main" ref={mainRef}>
            {SECTIONS.map((section) => <AppointmentSection section={section} key={section.key} />)}
          </div>
          <aside className="ah-anchor-panel" aria-label="任职情况锚点">
            <DSAnchor activeKey={activeKey} items={ANCHOR_ITEMS} bordered aria-label="任职情况锚点" />
          </aside>
        </div>
      </div>
    </main>
  )
}

createRoot(document.getElementById('app')).render(<AppointmentPage />)
