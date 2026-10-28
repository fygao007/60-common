import { createRoot } from 'react-dom/client'
import { useEffect, useState, useMemo } from 'react'
import {
  DSCard,
  DSTag,
  DSButton,
  DSSelect,
  DSEChartBase,
  buildChartOption,
  DS_COLOR_SCHEMES,
} from '@wisedu/design-system'
import './p-review.css'

const avatarIcon = 'https://picsum.photos/seed/teacher-zhangwei/100/140'

// 业绩纵览数据 - 用于业绩卡
const PERFORMANCE_ITEMS = [
  { id: 'teaching', color: 'blue', label: '教学工作量', value: '288', unit: '学时' },
  { id: 'evaluation', color: 'cyan', label: '学生评教均分', value: '4.78', unit: '/5' },
  { id: 'research', color: 'purple', label: '科研经费', value: '42.6', unit: '万元' },
  { id: 'paper', color: 'green', label: '发表论文', value: '6', unit: '篇' },
  { id: 'guidance', color: 'orange', label: '指导学生', value: '18', unit: '人' },
  { id: 'award', color: 'pink', label: '获奖成果', value: '3', unit: '项' },
]

// 课程建设统计 - 横向条形（每行独立颜色）
const COURSE_STATS = [
  { name: '国家级', value: 2, percent: 16.7, color: 'blue' },
  { name: '省部级', value: 3, percent: 25.0, color: 'cyan' },
  { name: '校级', value: 1, percent: 7.2, color: 'orange' },
  { name: '院级', value: 4, percent: 50.0, color: 'violet' },
]

// 指导学生统计 - 比例卡片
const GUIDANCE_STATS = [
  { name: '专科生', percent: 45, count: 45, unit: '门' },
  { name: '本科生', percent: 55, count: 55, unit: '人' },
]

// 教研与学术统计 - 2x2 彩色统计卡片
const RESEARCH_STATS = [
  { id: 'project', color: 'purple', name: '教研项目', value: 12, unit: '项', percent: 33.3 },
  { id: 'research', color: 'cyan', name: '科研项目', value: 8, unit: '项', percent: 22.2 },
  { id: 'paper', color: 'pink', name: '论文/著作', value: 10, unit: '项', percent: 27.8 },
  { id: 'award', color: 'blue', name: '获奖成果', value: 6, unit: '项', percent: 16.7 },
]

const PERIOD_OPTIONS = [
  { value: '3y', label: '近3年' },
  { value: '5y', label: '近5年' },
  { value: 'all', label: '全部' },
]

const PERIOD_FACTORS = {
  '3y': 0.72,
  '5y': 1,
  all: 1.4,
}

// 学期课程 - 按学期分组的课程列表
const COURSES_BY_TERM = {
  '2025-2026-spring': [
    { id: 'c1', name: '汽车构造与原理', totalHours: 48, remainingHours: 12 },
    { id: 'c2', name: '新能源汽车技术', totalHours: 40, remainingHours: 8 },
    { id: 'c3', name: '汽车电气系统检修', totalHours: 40, remainingHours: 20 },
    { id: 'c4', name: '汽车故障诊断实训', totalHours: 32, remainingHours: 16 },
  ],
  '2024-2025-fall': [
    { id: 'c5', name: '汽车底盘构造', totalHours: 40, remainingHours: 0 },
    { id: 'c6', name: '汽车发动机原理', totalHours: 48, remainingHours: 0 },
    { id: 'c7', name: '汽车运用工程', totalHours: 40, remainingHours: 0 },
  ],
  '2024-2025-spring': [
    { id: 'c8', name: '汽车营销学', totalHours: 32, remainingHours: 0 },
    { id: 'c9', name: '汽车保险与理赔', totalHours: 32, remainingHours: 0 },
  ],
}

const TERM_OPTIONS = [
  { value: '2025-2026-spring', label: '2025-2026学年春季学期' },
  { value: '2024-2025-fall', label: '2024-2025学年秋季学期' },
  { value: '2024-2025-spring', label: '2024-2025学年春季学期' },
]

// 档案完整度原始数据
const COMPLETENESS_DATA = [
  ['基本信息', 10, 10],
  ['学历与资格', 9, 10],
  ['教学信息', 18, 20],
  ['企业实践', 8, 10],
  ['成果与荣誉', 15, 17],
  ['进修培训', 7, 8],
  ['社会服务', 6, 9],
  ['任职情况', 5, 6],
  ['其他教育工作', 8, 10],
]

// 计算完整度
const COMPLETED_FIELD_COUNT = COMPLETENESS_DATA.reduce((total, [, completed]) => total + completed, 0)
const REQUIRED_FIELD_COUNT = COMPLETENESS_DATA.reduce((total, [, , required]) => total + required, 0)
const COMPLETENESS_RATE = Math.round((COMPLETED_FIELD_COUNT / REQUIRED_FIELD_COUNT) * 100)
// 完整度环形图：半径 52，旋转 -90° 让起点在顶部
const CIRCUMFERENCE = 2 * Math.PI * 52

// === Mock 数据：考核批次（用于待办卡片） ===
const AUDIT_BATCHES_TODO = [
  {
    id: 'batch-2026-spring',
    name: '2026 春季学期教学档案考核',
    endDate: '2026-07-10',
    status: '提交中',
  },
]

function PanelTitle({ children, suffix }) {
  return (
    <div className="th-panel-title">
      <h2>{children}</h2>
      {suffix ? <span>{suffix}</span> : null}
    </div>
  )
}

// 需求系统联动：iframe 内点击区块时通知父窗口展示需求
const isInIframe = typeof window !== 'undefined' && window.parent !== window
function notifyFocus(focusId) {
  if (isInIframe) window.parent.postMessage({ type: 'focus-click', focusId }, '*')
}

// 焦点徽标组件（仅在 iframe 内渲染）
function FocusBadge({ focusId, number }) {
  if (!isInIframe) return null
  return (
    <span
      className="th-focus-badge"
      onClick={(e) => {
        e.stopPropagation()
        notifyFocus(focusId)
      }}
    >
      {number}
    </span>
  )
}

function ProfessionalLeaderHome() {
  // 从父窗口接收的焦点编号映射 { focusId: number }
  const [focusNumbers, setFocusNumbers] = useState({})

  // 监听父窗口下发的焦点编号
  useEffect(() => {
    if (!isInIframe) return
    function handleMessage(e) {
      if (e.data && e.data.type === 'focus-numbers') {
        setFocusNumbers(e.data.numbers || {})
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const [period, setPeriod] = useState('5y')
  const periodFactor = PERIOD_FACTORS[period]

  // 学期课程：当前学期与筛选
  const [term, setTerm] = useState('2025-2026-spring')
  const termCourses = COURSES_BY_TERM[term] || []

  const courseChartOption = useMemo(() => buildChartOption({
    type: 'barHorizontal',
    data: COURSE_STATS.map((item) => ({
      name: item.name,
      value: Math.max(1, Math.round(item.value * periodFactor)),
    })),
    unit: '门',
    palette: 'mixed',
  }), [periodFactor])

  const guidanceChartOption = useMemo(() => buildChartOption({
    type: 'pieCallout',
    data: GUIDANCE_STATS.map((item) => ({
      name: item.name,
      value: Math.round(item.count * periodFactor),
    })),
    unit: '人',
    palette: 'mixed',
    totalLabel: '学生总数',
  }), [periodFactor])

  // 待办批次（仅展示"提交中"状态）
  const todoBatch = useMemo(() => {
    return AUDIT_BATCHES_TODO.find((batch) => batch.status === '提交中')
  }, [])

  return (
    <main className="th-page" data-ds-business-page="p-review">
      {/* 待办卡片区块：仅在 iframe 内且父窗口下发编号时渲染徽标 */}
      {todoBatch && (
        <section
          className="th-grid th-todo-grid"
          aria-label="待办事项"
          data-focus="t-home-todo"
          onClick={() => notifyFocus('t-home-todo')}
          style={focusNumbers['t-home-todo'] ? { position: 'relative' } : undefined}
        >
          {focusNumbers['t-home-todo'] && <FocusBadge focusId="t-home-todo" number={focusNumbers['t-home-todo']} />}
          <DSCard className="th-card th-todo-card" layout="long">
            <div className="th-todo-card__content">
              <div className="th-todo-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 3a6 6 0 0 0-6 6v3.6l-1.4 2.9a.6.6 0 0 0 .54.86h13.72a.6.6 0 0 0 .54-.86L18 12.6V9a6 6 0 0 0-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div className="th-todo-card__copy">
                <strong>{todoBatch.name}</strong>
                <DSTag tone="warning">待提交</DSTag>
              </div>
              <DSButton
                size="small"
                onClick={() => {
                  window.location.href = '../t-submission/t-submission.html'
                }}
              >
                去提交
              </DSButton>
            </div>
          </DSCard>
        </section>
      )}

      <section
        className="th-grid th-top-grid"
        aria-label="基本信息与业绩纵览"
        data-focus="t-home-profile"
        onClick={() => notifyFocus('t-home-profile')}
        style={focusNumbers['t-home-profile'] ? { position: 'relative' } : undefined}
      >
        {focusNumbers['t-home-profile'] && <FocusBadge focusId="t-home-profile" number={focusNumbers['t-home-profile']} />}
        <DSCard className="th-card th-profile-card" layout="long">
          <div className="th-profile-card__avatar">
            <img src={avatarIcon} alt="张伟头像" />
          </div>
          <div className="th-profile-card__info">
            <div className="th-profile-card__name">
              <h1>张伟</h1>
              <DSTag tone="primary">教学科研型教授</DSTag>
            </div>
            <p>20261231</p>
            <p>汽车学院</p>
          </div>
        </DSCard>

        <DSCard className="th-card th-performance-card" layout="long">
          <PanelTitle suffix="（本学年）">业绩纵览</PanelTitle>
          <div className="th-performance-list">
            {PERFORMANCE_ITEMS.map((item) => (
              <div className="th-performance-item" key={item.id}>
                <span className="th-performance-item__label">{item.label}</span>
                <strong className="th-performance-item__value">{item.value}<small>{item.unit}</small></strong>
              </div>
            ))}
          </div>
        </DSCard>
      </section>

      <DSCard
        className="th-card th-stats-card"
        layout="long"
        data-focus="t-home-stats"
        onClick={() => notifyFocus('t-home-stats')}
        style={focusNumbers['t-home-stats'] ? { position: 'relative' } : undefined}
      >
        {focusNumbers['t-home-stats'] && <FocusBadge focusId="t-home-stats" number={focusNumbers['t-home-stats']} />}
        <div className="th-stats-card__content">
          <div className="th-stats-card__head">
            <PanelTitle>教学建设成果</PanelTitle>
            <DSSelect
              className="th-stats-card__filter"
              aria-label="统计周期"
              value={period}
              options={PERIOD_OPTIONS}
              onChange={setPeriod}
            />
          </div>

          <div className="th-stats-grid">
            <div className="th-stat-block">
              <h3 className="th-stat-block__title">课程建设统计</h3>
              <DSEChartBase
                className="th-stat-block__chart"
                option={courseChartOption}
                aria-label="课程建设统计横向柱状图"
              />
            </div>

            <div className="th-stat-block">
              <h3 className="th-stat-block__title">指导学生统计</h3>
              <DSEChartBase
                className="th-stat-block__chart"
                option={guidanceChartOption}
                aria-label="指导学生统计环形图"
              />
            </div>

            <div className="th-stat-block">
              <h3 className="th-stat-block__title">教研与学术统计</h3>
              <div className="th-stat-card-grid">
                {RESEARCH_STATS.map((item) => {
                  const colorScheme = DS_COLOR_SCHEMES[item.color]
                  const value = Math.max(1, Math.round(item.value * periodFactor))
                  return (
                    <div
                      className="th-stat-card"
                      style={{ backgroundColor: colorScheme.bg, color: colorScheme.text }}
                      key={item.id}
                    >
                      <span className="th-stat-card__name">{item.name}</span>
                      <div className="th-stat-card__bottom">
                        <span className="th-stat-card__value">{value}<small>{item.unit}</small></span>
                        <span className="th-stat-card__percent">占比 {item.percent}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </DSCard>

      <section className="th-grid th-bottom-grid" aria-label="学期课程与档案袋完整度分析">
        <DSCard
          className="th-card th-courses-card"
          layout="long"
          data-focus="t-home-courses"
          onClick={() => notifyFocus('t-home-courses')}
          style={focusNumbers['t-home-courses'] ? { position: 'relative' } : undefined}
        >
          {focusNumbers['t-home-courses'] && <FocusBadge focusId="t-home-courses" number={focusNumbers['t-home-courses']} />}
          <div className="th-courses-head">
            <PanelTitle>学期课程</PanelTitle>
            <DSSelect
              className="th-courses-filter"
              aria-label="学期筛选"
              value={term}
              options={TERM_OPTIONS}
              onChange={setTerm}
            />
          </div>
          <div className="th-course-table" role="list">
            <div className="th-course-row th-course-row--head" aria-hidden="true">
              <span>课程名称</span>
              <span>总课时</span>
              <span>剩余课时</span>
              <span>操作</span>
            </div>
            {termCourses.map((course) => (
              <div className="th-course-row" role="listitem" key={course.id}>
                <strong>{course.name}</strong>
                <span>{course.totalHours}</span>
                <span>{course.remainingHours}</span>
                <span className="th-course-row__action">
                  <DSButton
                    variant="text"
                    size="small"
                    onClick={() => {
                      window.location.href = `../course-detail/course-detail.html?courseId=${course.id}&term=${term}`
                    }}
                  >
                    详情
                  </DSButton>
                </span>
              </div>
            ))}
          </div>
        </DSCard>

        <DSCard
          className="th-card th-completeness-card"
          layout="long"
          data-focus="t-home-completeness"
          onClick={() => notifyFocus('t-home-completeness')}
          style={focusNumbers['t-home-completeness'] ? { position: 'relative' } : undefined}
        >
          {focusNumbers['t-home-completeness'] && <FocusBadge focusId="t-home-completeness" number={focusNumbers['t-home-completeness']} />}
          <PanelTitle>档案袋完整度分析</PanelTitle>
          <div className="th-completeness-card__content">
            <div className="th-completeness-summary">
              <div className="th-completeness-ring" aria-label={`档案应填字段完整度${COMPLETENESS_RATE}%`}>
                <svg className="th-completeness-ring__svg" viewBox="0 0 120 120">
                  <circle className="th-completeness-ring__track" cx="60" cy="60" r="52" />
                  <circle
                    className="th-completeness-ring__value"
                    cx="60" cy="60" r="52"
                    style={{ strokeDasharray: `${(COMPLETENESS_RATE / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}` }}
                  />
                </svg>
                <div className="th-completeness-ring__center">
                  <strong>{COMPLETENESS_RATE}%</strong>
                  <span>字段完整度</span>
                </div>
              </div>
            </div>
            <div className="th-completeness-detail">
              <div className="th-completeness-list">
                {COMPLETENESS_DATA.map(([label, completed, required]) => {
                  const value = Math.round((completed / required) * 100)
                  return (
                  <div className="th-completeness-item" key={label}>
                    <span>{label}</span>
                    <i><b style={{ width: `${value}%` }} /></i>
                    <strong>{value}%</strong>
                  </div>
                  )
                })}
              </div>
            </div>
          </div>
        </DSCard>
      </section>
    </main>
  )
}

createRoot(document.getElementById('app')).render(<ProfessionalLeaderHome />)
