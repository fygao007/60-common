import { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSCard,
  DSButton,
  DSChartCard,
} from '@wisedu/design-system'
import './l-dash.css'

// ===== 数据模型(内部自洽对账) =====

// 关键指标(业绩纵览形式:label + 大数值 + 单位 + 副说明)
const KPI_ITEMS = [
  { id: 'teacher', label: '纳入统计教师', value: '246', unit: '人', compare: '副高及以上 156 人' },
  { id: 'completeness', label: '学院平均完整度', value: '83', unit: '%', compare: '环比 +6%' },
  { id: 'archive', label: '本学年归档材料', value: '4,820', unit: '份', compare: '自动归集 52%' },
  { id: 'todo', label: '待审核档案', value: '38', unit: '份', compare: '3 个批次进行中' },
  { id: 'warning', label: '完整度预警', value: '12', unit: '人', compare: '低于 70%' },
  { id: 'batch', label: '考核批次', value: '2', unit: '个', compare: '本学期' },
]

// 档案完整度低的老师名单(前 5 名)
const LOW_COMPLETENESS_TEACHERS = [
  { name: '张三', profession: '通信工程', completeness: 45, status: '待提交' },
  { name: '李四', profession: '电子信息工程', completeness: 52, status: '驳回待改' },
  { name: '王五', profession: '物联网应用技术', completeness: 61, status: '待提交' },
  { name: '赵六', profession: '微电子技术', completeness: 68, status: '待提交' },
  { name: '钱七', profession: '集成电路技术', completeness: 69, status: '审核中' },
]

// 全院归档进度总览(分段求和 = KPI 教师总数 246)
const ARCHIVE_STATS = [
  { value: '246人', label: '已覆盖教师' },
  { value: '83%', label: '平均完整度' },
  { value: '12人', label: '需关注', risk: true },
]
const ARCHIVE_SEGMENTS = [
  { label: '完整度≥90%', value: 98, status: 'excellent' },
  { label: '70%-90%', value: 124, status: 'good' },
  { label: '60%-70%', value: 24, status: 'attention' },
  { label: '<60%需关注', value: 12, status: 'risk' },
]

// 各专业档案完整度排名(低于 75% 标红)
const PROFESSION_COMPLETENESS = [
  { name: '通信工程', value: 92 },
  { name: '电子信息工程', value: 88 },
  { name: '物联网应用技术', value: 84 },
  { name: '微电子技术', value: 79 },
  { name: '集成电路技术', value: 71, color: '#FF454D' }, // 低于 75% 警示
]

// 完整度趋势(近 4 学期)
const COMPLETENESS_TREND = [
  { name: '学院均值', values: [71, 76, 82, 83] },
]
const TREND_XAXIS = ['2024秋', '2025春', '2025秋', '2026春']

// 教师结构分布(职称求和 = 学历求和 = KPI 教师总数 246)
const STAFF_TITLE = [
  { name: '正高级', value: 24 },
  { name: '副高级', value: 68 },
  { name: '中级', value: 112 },
  { name: '初级', value: 42 },
]
const STAFF_DEGREE = [
  { name: '博士', value: 56 },
  { name: '硕士', value: 142 },
  { name: '学士', value: 48 },
]
const STAFF_AWARD = [
  { name: '国家级', value: 8 },
  { name: '省级', value: 32 },
  { name: '校级', value: 68 },
]

// ===== 组件 =====

function PanelTitle({ children, suffix }) {
  return (
    <div className="ld-panel-title">
      <h2>{children}</h2>
      {suffix ? <span>{suffix}</span> : null}
    </div>
  )
}

function LDashPage() {
  // 通知 toast
  const [notice, setNotice] = useState('')
  const noticeTimerRef = useRef(null)
  const showNotice = (message) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current)
    setNotice(message)
    noticeTimerRef.current = setTimeout(() => setNotice(''), 1800)
  }

  // 职称结构总数(用于 donut 的 total)
  const staffTitleTotal = useMemo(() => STAFF_TITLE.reduce((s, i) => s + i.value, 0), [])

  return (
    <main className="ld-page" data-ds-business-page="l-dash">
      {/* 页头 */}
      <header className="ld-header">
        <div className="ld-header__identity">
          <h1>教师教学画像</h1>
          <dl>
            <div><dt>学院</dt><dd>电子与通信工程学院</dd></div>
            <div><dt>院长</dt><dd>李建国</dd></div>
            <div><dt>数据更新</dt><dd>2026-07-09 15:30</dd></div>
          </dl>
        </div>
      </header>

      {/* 关键指标（业绩纵览形式） */}
      <DSCard className="ld-section-card" layout="long" padded={false}>
        <div className="ld-section-head">
          <PanelTitle>关键指标</PanelTitle>
        </div>
        <div className="ld-kpi-list">
          {KPI_ITEMS.map((item) => (
            <div className="ld-kpi-item" key={item.id}>
              <span className="ld-kpi-item__label">{item.label}</span>
              <strong className="ld-kpi-item__value">{item.value}<small>{item.unit}</small></strong>
              <span className="ld-kpi-item__compare">{item.compare}</span>
            </div>
          ))}
        </div>
      </DSCard>

      {/* 档案完整度低名单 + 归档进度总览 */}
      <div className="ld-chart-grid ld-care-grid">
        <DSCard className="ld-card ld-care-card" layout="long" padded={false}>
          <div className="ld-card-head">
            <h3 className="ld-card-title">档案完整度低名单<span className="ld-care-card__hint">{LOW_COMPLETENESS_TEACHERS.length} 人需关注</span></h3>
          </div>
          <div className="ld-care-list">
            {LOW_COMPLETENESS_TEACHERS.map((item) => (
              <div className="ld-care-row" key={item.name}>
                <span className="ld-care-row__status" aria-hidden="true" />
                <strong>{item.name}</strong>
                <span>{item.profession}</span>
                <span>{item.completeness}%</span>
                <DSButton variant="link" size="small" onClick={() => showNotice(`${item.name}的档案详情`)}>
                  查看详情
                </DSButton>
              </div>
            ))}
          </div>
        </DSCard>

        <DSCard className="ld-card ld-health-card" layout="long" padded={false}>
          <div className="ld-card-head">
            <h3 className="ld-card-title">全院归档进度总览</h3>
          </div>
          <div className="ld-health-stats">
            {ARCHIVE_STATS.map((stat, idx) => (
              <div className={`ld-health-stat${stat.risk ? ' ld-health-stat--risk' : ''}`} key={idx}>
                <strong className="ld-health-stat__value">{stat.value}</strong>
                <span className="ld-health-stat__label">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="ld-health-bar">
            {ARCHIVE_SEGMENTS.map((seg, idx) => {
              const total = ARCHIVE_SEGMENTS.reduce((s, i) => s + i.value, 0)
              const percent = ((seg.value / total) * 100).toFixed(1)
              const colorMap = { excellent: '#1FB09D', good: '#3167FF', attention: '#FF913B', risk: '#FA5151' }
              return (
                <div
                  key={idx}
                  className="ld-health-bar__segment"
                  style={{ width: `${percent}%`, backgroundColor: colorMap[seg.status] }}
                  aria-label={`${seg.label}: ${seg.value}人 (${percent}%)`}
                />
              )
            })}
          </div>
          <div className="ld-health-legend">
            {ARCHIVE_SEGMENTS.map((seg, idx) => {
              const colorMap = { excellent: '#1FB09D', good: '#3167FF', attention: '#FF913B', risk: '#FA5151' }
              return (
                <div className="ld-health-legend__item" key={idx}>
                  <span className="ld-health-legend__dot" style={{ backgroundColor: colorMap[seg.status] }} aria-hidden="true" />
                  <span className="ld-health-legend__label">{seg.label}</span>
                  <span className="ld-health-legend__value">{seg.value}人</span>
                </div>
              )
            })}
          </div>
          <div className="ld-health-action">
            <DSButton variant="link" size="small" onClick={() => showNotice('归档进度详情')}>查看详情</DSButton>
          </div>
        </DSCard>
      </div>

      {/* 各专业档案完整度排名 */}
      <DSCard className="ld-section-card" layout="long" padded={false}>
        <div className="ld-section-head">
          <PanelTitle>各专业档案完整度排名</PanelTitle>
        </div>
        <div className="ld-chart-grid">
          <DSChartCard
            className="ld-chart-card"
            title="各专业完整度"
            type="barHorizontal"
            data={PROFESSION_COMPLETENESS}
            unit="%"
            palette="mixed"
          />
          <DSChartCard
            className="ld-chart-card"
            title="学院完整度趋势"
            type="line"
            data={COMPLETENESS_TREND}
            xAxisData={TREND_XAXIS}
            unit="%"
            palette="mixed"
          />
        </div>
      </DSCard>

      {/* 教师结构分布 */}
      <DSCard className="ld-section-card" layout="long" padded={false}>
        <div className="ld-section-head">
          <PanelTitle>教师结构分布</PanelTitle>
        </div>
        <div className="ld-chart-grid ld-chart-grid--3">
          <DSChartCard
            className="ld-chart-card"
            title="职称结构"
            type="donut"
            palette="mixed"
            total={staffTitleTotal}
            totalLabel="人"
            unit="人"
            data={STAFF_TITLE}
          />
          <DSChartCard
            className="ld-chart-card"
            title="学历学位"
            type="barHorizontal"
            palette="mixed"
            unit="人"
            data={STAFF_DEGREE}
          />
          <DSChartCard
            className="ld-chart-card"
            title="获奖等级"
            type="pieCallout"
            palette="mixed"
            unit="项"
            data={STAFF_AWARD}
          />
        </div>
      </DSCard>

      {/* 通知 toast */}
      {notice ? <div className="ld-notice" role="status">{notice}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<LDashPage />)