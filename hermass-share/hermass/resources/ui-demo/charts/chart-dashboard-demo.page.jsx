/**
 * 图表规范演示页面
 * 展示如何通过 chart config 自动生成统一风格的图表卡片
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSChartCard,
  DSDashboardGrid,
  DSDashboardGridItem,
  DSTableStatCard,
  DSSegmentBarCard,
  DSColorStatCard,
  DSCard,
  DSTag,
  DSButton,
  DSSelect,
  DSEChartBase,
  buildChartOption,
  DS_COLOR_SCHEMES,
} from '@wisedu/design-system'
import KpiCard from './chart-dashboard-demo/legacy/kpi-card'
import './chart-dashboard-demo.css'
import './chart-dashboard-demo/legacy/kpi-card.css'

// 示例图表配置（简化版，去掉 icon、subtitle、updateTime）
const chartConfigs = [
  // 1. 职称结构 - donut
  {
    id: 'titleStructure',
    title: '职称结构',
    type: 'donut',
    size: 'small',
    total: 24,
    unit: '人',
    palette: 'mixed',
    data: [
      { name: '正高级', value: 4 },
      { name: '副高级', value: 7 },
      { name: '中级', value: 10 },
      { name: '初级', value: 3 },
    ],
    insight: '高级职称教师占比 45.8%，专业群师资结构较稳定。',
  },

  // 2. 学历结构 - barHorizontal
  {
    id: 'educationStructure',
    title: '学历结构',
    type: 'barHorizontal',
    size: 'small',
    unit: '人',
    data: [
      { name: '博士', value: 8 },
      { name: '硕士', value: 12 },
      { name: '本科', value: 4 },
    ],
    insight: '硕博学历占比 83.3%，师资学历层次较高。',
  },

  // 3. 教学成果趋势 - areaLine
  {
    id: 'teachingTrend',
    title: '教学成果趋势',
    type: 'areaLine',
    size: 'wide',
    unit: '项',
    xAxisData: ['2020', '2021', '2022', '2023', '2024'],
    data: [
      { name: '教学成果', values: [12, 18, 24, 32, 45] },
    ],
    insight: '教学成果年均增长 31.2%，呈持续上升趋势。',
  },

  // 4. 档案袋完成度 - progressRing
  {
    id: 'portfolioCompletion',
    title: '档案袋完成度',
    type: 'progressRing',
    size: 'mini',
    data: [{ value: 78 }],
    insight: '整体完成度 78%，建议加强督促。',
  },

  // 5. 课程数量排名 - rankBar
  {
    id: 'courseRank',
    title: '课程数量排名',
    type: 'rankBar',
    size: 'medium',
    unit: '门',
    top: 5,
    data: [
      { name: '张教授', value: 12 },
      { name: '李教授', value: 10 },
      { name: '王副教授', value: 8 },
      { name: '刘副教授', value: 7 },
      { name: '陈讲师', value: 6 },
    ],
    insight: '张教授课程数量最多，教学任务饱满。',
  },

  // 6. 获奖等级分布 - donut
  {
    id: 'awardDistribution',
    title: '获奖等级分布',
    type: 'donut',
    size: 'small',
    total: 18,
    unit: '项',
    palette: 'mixed',
    data: [
      { name: '国家级', value: 2 },
      { name: '省级', value: 5 },
      { name: '校级', value: 11 },
    ],
    insight: '省级以上获奖占比 38.9%，成果质量较高。',
  },

  // 7. 教学评价趋势 - line
  {
    id: 'evaluationTrend',
    title: '教学评价趋势',
    type: 'line',
    size: 'medium',
    unit: '分',
    xAxisData: ['2022春', '2022秋', '2023春', '2023秋', '2024春'],
    data: [
      { name: '平均评分', values: [88, 90, 92, 91, 94] },
    ],
    insight: '教学评分稳步提升，平均达 94 分。',
  },

  // 8. 能力画像 - radar
  {
    id: 'abilityProfile',
    title: '能力画像',
    type: 'radar',
    size: 'medium',
    indicators: [
      { name: '教学能力', max: 100 },
      { name: '科研能力', max: 100 },
      { name: '社会服务', max: 100 },
      { name: '团队协作', max: 100 },
      { name: '创新能力', max: 100 },
      { name: '师德师风', max: 100 },
    ],
    data: [
      { name: '综合能力', values: [92, 78, 70, 88, 75, 95] },
    ],
    insight: '师德师风和教学能力突出，科研和社会服务有提升空间。',
  },

  // 9. 教师学院分布 - pie
  {
    id: 'collegeDistribution',
    title: '教师学院分布',
    type: 'pie',
    size: 'small',
    total: 24,
    unit: '人',
    palette: 'mixed',
    data: [
      { name: '电信学院', value: 8 },
      { name: '机电学院', value: 6 },
      { name: '计算机学院', value: 5 },
      { name: '材料学院', value: 3 },
      { name: '其他', value: 2 },
    ],
    insight: '电信学院教师占比 33.3%，为师资规模最大学院。',
  },

  // 10. 引导线环形图 - donutCallout
  {
    id: 'donutCalloutDemo',
    title: '引导线环形图',
    type: 'donutCallout',
    size: 'wide',
    palette: 'mixed',
    unit: '人',
    data: [
      { name: '图例1', value: 45 },
      { name: '图例2', value: 45 },
      { name: '图例3', value: 45 },
      { name: '图例4', value: 45 },
      { name: '图例5', value: 45 },
    ],
    insight: '适用于需要直接标注分类名称、占比和数量的结构类统计。',
  },

  // 11. 竖向柱状图 - barVertical
  {
    id: 'annualAchievement',
    title: '近五年教学成果',
    type: 'barVertical',
    size: 'medium',
    unit: '项',
    palette: 'mixed',
    xAxisData: ['2020', '2021', '2022', '2023', '2024'],
    data: [
      { name: '教学成果', values: [12, 18, 24, 32, 45] },
    ],
    insight: '教学成果数量持续增长，2024 年达到峰值 45 项。',
  },

  // 12. 多折线图 - line（多条趋势对比）
  {
    id: 'multiTrend',
    title: '教学与科研趋势对比',
    type: 'line',
    size: 'wide',
    unit: '项',
    palette: 'mixed',
    xAxisData: ['2020', '2021', '2022', '2023', '2024'],
    data: [
      { name: '教学成果', values: [12, 18, 24, 32, 45] },
      { name: '科研成果', values: [20, 22, 28, 30, 38] },
      { name: '社会服务', values: [8, 11, 15, 18, 24] },
    ],
    insight: '三条趋势线均呈上升趋势，教学成果增长最快。',
  },
]

// 统计各图表类型的卡片数量
const typeStats = chartConfigs.reduce((acc, config) => {
  acc[config.type] = (acc[config.type] || 0) + 1
  return acc
}, {})

const TYPE_LABELS = {
  donut: '环形图',
  donutCallout: '引导线环形图',
  pie: '饼状图',
  barHorizontal: '横向柱状',
  barVertical: '竖向柱状',
  line: '折线图',
  areaLine: '面积折线',
  rankBar: '排名柱状',
  progressRing: '进度环',
  radar: '雷达图',
}

// 表格统计数据
const tableColumns = [
  { key: 'name', label: '统计项目' },
  { key: 'count', label: '数量' },
  { key: 'percent', label: '占比' },
  { key: 'status', label: '状态' },
  { key: 'note', label: '说明' },
]

const tableData = [
  { name: '正高级', count: '4人', percent: '16.7%', status: 'normal', note: '高层次教师占比较稳定' },
  { name: '副高级', count: '7人', percent: '29.2%', status: 'normal', note: '骨干教师支撑充分' },
  { name: '中级', count: '10人', percent: '41.7%', status: 'attention', note: '中青年教师占比较高' },
  { name: '初级', count: '3人', percent: '12.5%', status: 'normal', note: '梯队补充合理' },
]

// 条形占比数据
const segmentStats = [
  { value: '24人', label: '已覆盖' },
  { value: '89%', label: '完成率' },
  { value: '3人', label: '需关注' },
]

const segmentData = [
  { label: '完成85%以上', value: 5, status: 'excellent' },
  { label: '70%-85%', value: 16, status: 'good' },
  { label: '50%-70%', value: 14, status: 'attention' },
  { label: '70%以下', value: 2, status: 'risk' },
]

// ===== 教师首页卡片示例（从 teacher/t-home 复制，th-demo- 前缀）=====

const TH_DEMO_AVATAR = 'https://picsum.photos/seed/teacher-zhangwei/100/140'

// 业绩纵览数据
const TH_DEMO_PERFORMANCE_ITEMS = [
  { id: 'teaching', color: 'blue', label: '教学工作量', value: '288', unit: '学时' },
  { id: 'evaluation', color: 'cyan', label: '学生评教均分', value: '4.78', unit: '/5' },
  { id: 'research', color: 'purple', label: '科研经费', value: '42.6', unit: '万元' },
  { id: 'paper', color: 'green', label: '发表论文', value: '6', unit: '篇' },
  { id: 'guidance', color: 'orange', label: '指导学生', value: '18', unit: '人' },
  { id: 'award', color: 'pink', label: '获奖成果', value: '3', unit: '项' },
]

// 课程建设统计
const TH_DEMO_COURSE_STATS = [
  { name: '国家级', value: 2, percent: 16.7 },
  { name: '省部级', value: 3, percent: 25.0 },
  { name: '校级', value: 1, percent: 7.2 },
  { name: '院级', value: 4, percent: 50.0 },
]

// 指导学生统计
const TH_DEMO_GUIDANCE_STATS = [
  { name: '专科生', percent: 45, count: 45 },
  { name: '本科生', percent: 55, count: 55 },
]

// 教研与学术统计
const TH_DEMO_RESEARCH_STATS = [
  { id: 'project', color: 'purple', name: '教研项目', value: 12, unit: '项', percent: 33.3 },
  { id: 'research', color: 'cyan', name: '科研项目', value: 8, unit: '项', percent: 22.2 },
  { id: 'paper', color: 'pink', name: '论文/著作', value: 10, unit: '项', percent: 27.8 },
  { id: 'award', color: 'blue', name: '获奖成果', value: 6, unit: '项', percent: 16.7 },
]

// 学期课程
const TH_DEMO_COURSES_BY_TERM = {
  '2025-2026-spring': [
    { id: 'c1', name: '汽车构造与原理', totalHours: 48, remainingHours: 12 },
    { id: 'c2', name: '新能源汽车技术', totalHours: 40, remainingHours: 8 },
    { id: 'c3', name: '汽车电气系统检修', totalHours: 40, remainingHours: 20 },
    { id: 'c4', name: '汽车故障诊断实训', totalHours: 32, remainingHours: 16 },
  ],
}

const TH_DEMO_TERM_OPTIONS = [
  { value: '2025-2026-spring', label: '2025-2026学年春季学期' },
]

// 档案完整度
const TH_DEMO_COMPLETENESS_DATA = [
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

const TH_DEMO_COMPLETED = TH_DEMO_COMPLETENESS_DATA.reduce((t, [, c]) => t + c, 0)
const TH_DEMO_REQUIRED = TH_DEMO_COMPLETENESS_DATA.reduce((t, [, , r]) => t + r, 0)
const TH_DEMO_RATE = Math.round((TH_DEMO_COMPLETED / TH_DEMO_REQUIRED) * 100)
const TH_DEMO_CIRCUMFERENCE = 2 * Math.PI * 52

function ThDemoPanelTitle({ children, suffix }) {
  return (
    <div className="th-demo-panel-title">
      <h2>{children}</h2>
      {suffix ? <span>{suffix}</span> : null}
    </div>
  )
}

function TeacherHomeCards() {
  const courseChartOption = buildChartOption({
    type: 'barHorizontal',
    data: TH_DEMO_COURSE_STATS.map((item) => ({ name: item.name, value: item.value })),
    unit: '门',
    palette: 'mixed',
  })

  const guidanceChartOption = buildChartOption({
    type: 'pieCallout',
    data: TH_DEMO_GUIDANCE_STATS.map((item) => ({ name: item.name, value: item.count })),
    unit: '人',
    palette: 'mixed',
    totalLabel: '学生总数',
  })

  return (
    <section className="chart-demo-page__section">
      <h2 className="chart-demo-page__section-title">教师首页卡片示例</h2>
      <div className="th-demo-page" style={{ gap: 'var(--ds-space-4)' }}>
        {/* 待办卡 */}
        <DSCard className="th-demo-card th-demo-todo-card" layout="long">
          <div className="th-demo-todo-card__content">
            <div className="th-demo-todo-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3a6 6 0 0 0-6 6v3.6l-1.4 2.9a.6.6 0 0 0 .54.86h13.72a.6.6 0 0 0 .54-.86L18 12.6V9a6 6 0 0 0-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="th-demo-todo-card__copy">
              <strong>2026 春季学期教学档案考核</strong>
              <DSTag tone="warning">待提交</DSTag>
            </div>
            <DSButton size="small">去提交</DSButton>
          </div>
        </DSCard>

        {/* 个人信息 + 业绩纵览 */}
        <div className="th-demo-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--ds-space-4)' }}>
          <DSCard className="th-demo-card th-demo-profile-card" layout="long">
            <div className="th-demo-profile-card__avatar">
              <img src={TH_DEMO_AVATAR} alt="教师头像" />
            </div>
            <div className="th-demo-profile-card__info">
              <div className="th-demo-profile-card__name">
                <h1>张伟</h1>
                <DSTag tone="primary">教学科研型教授</DSTag>
              </div>
              <p>20261231</p>
              <p>汽车学院</p>
            </div>
          </DSCard>

          <DSCard className="th-demo-card th-demo-performance-card" layout="long">
            <ThDemoPanelTitle suffix="（本学年）">业绩纵览</ThDemoPanelTitle>
            <div className="th-demo-performance-list">
              {TH_DEMO_PERFORMANCE_ITEMS.map((item) => (
                <div className="th-demo-performance-item" key={item.id}>
                  <span className="th-demo-performance-item__label">{item.label}</span>
                  <strong className="th-demo-performance-item__value">{item.value}<small>{item.unit}</small></strong>
                </div>
              ))}
            </div>
          </DSCard>
        </div>

        {/* 教学建设成果 */}
        <DSCard className="th-demo-card th-demo-stats-card" layout="long">
          <div className="th-demo-stats-card__content">
            <div className="th-demo-stats-card__head">
              <ThDemoPanelTitle>教学建设成果</ThDemoPanelTitle>
            </div>
            <div className="th-demo-stats-grid">
              <div className="th-demo-stat-block">
                <h3 className="th-demo-stat-block__title">课程建设统计</h3>
                <DSEChartBase className="th-demo-stat-block__chart" option={courseChartOption} />
              </div>
              <div className="th-demo-stat-block">
                <h3 className="th-demo-stat-block__title">指导学生统计</h3>
                <DSEChartBase className="th-demo-stat-block__chart" option={guidanceChartOption} />
              </div>
              <div className="th-demo-stat-block">
                <h3 className="th-demo-stat-block__title">教研与学术统计</h3>
                <div className="th-demo-stat-card-grid">
                  {TH_DEMO_RESEARCH_STATS.map((item) => {
                    const colorScheme = DS_COLOR_SCHEMES[item.color]
                    return (
                      <div className="th-demo-stat-card" key={item.id} style={{ backgroundColor: colorScheme.bg, color: colorScheme.text }}>
                        <span className="th-demo-stat-card__name">{item.name}</span>
                        <div className="th-demo-stat-card__bottom">
                          <span className="th-demo-stat-card__value">{item.value}<small>{item.unit}</small></span>
                          <span className="th-demo-stat-card__percent">占比 {item.percent}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </DSCard>

        {/* 学期课程 + 档案完整度 */}
        <div className="th-demo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-space-4)' }}>
          <DSCard className="th-demo-card th-demo-courses-card" layout="long">
            <div className="th-demo-courses-head">
              <ThDemoPanelTitle>学期课程</ThDemoPanelTitle>
            </div>
            <div className="th-demo-course-table" role="list">
              <div className="th-demo-course-row th-demo-course-row--head" aria-hidden="true">
                <span>课程名称</span>
                <span>总课时</span>
                <span>剩余课时</span>
                <span>操作</span>
              </div>
              {TH_DEMO_COURSES_BY_TERM['2025-2026-spring'].map((course) => (
                <div className="th-demo-course-row" role="listitem" key={course.id}>
                  <strong>{course.name}</strong>
                  <span>{course.totalHours}</span>
                  <span>{course.remainingHours}</span>
                  <span className="th-demo-course-row__action">
                    <DSButton variant="text" size="small">查看</DSButton>
                  </span>
                </div>
              ))}
            </div>
          </DSCard>

          <DSCard className="th-demo-card th-demo-completeness-card" layout="long">
            <ThDemoPanelTitle>档案袋完整度分析</ThDemoPanelTitle>
            <div className="th-demo-completeness-card__content">
              <div className="th-demo-completeness-summary">
                <div className="th-demo-completeness-ring" aria-label={`档案应填字段完整度${TH_DEMO_RATE}%`}>
                  <svg className="th-demo-completeness-ring__svg" viewBox="0 0 120 120">
                    <circle className="th-demo-completeness-ring__track" cx="60" cy="60" r="52" />
                    <circle className="th-demo-completeness-ring__value" cx="60" cy="60" r="52" style={{ strokeDasharray: `${(TH_DEMO_RATE / 100) * TH_DEMO_CIRCUMFERENCE} ${TH_DEMO_CIRCUMFERENCE}` }} />
                  </svg>
                  <div className="th-demo-completeness-ring__center">
                    <strong>{TH_DEMO_RATE}%</strong>
                    <span>字段完整度</span>
                  </div>
                </div>
              </div>
              <div className="th-demo-completeness-detail">
                <div className="th-demo-completeness-list">
                  {TH_DEMO_COMPLETENESS_DATA.map(([label, completed, required]) => {
                    const value = Math.round((completed / required) * 100)
                    return (
                      <div className="th-demo-completeness-item" key={label}>
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
        </div>
      </div>
    </section>
  )
}

function ChartDashboardDemo() {
  const totalCards = chartConfigs.length
  const totalTypes = Object.keys(typeStats).length

  return (
    <div className="chart-demo-page" data-ds-business-page="chart-dashboard-demo">
      <header className="chart-demo-page__header">
        <h1 className="chart-demo-page__title">图表规范演示</h1>
        <p className="chart-demo-page__subtitle">
          教学档案袋 / 高校人事系统统一图表组件体系
        </p>
      </header>

      {/* 顶部 KPI 统计卡片 */}
      <section className="chart-demo-page__section">
        <div className="chart-demo-page__kpi-grid">
          <KpiCard icon="total" label="示例卡片总数" value={totalCards} accent />
          <KpiCard icon="types" label="图表类型数" value={totalTypes} />
          <KpiCard icon="donut" label="环形图" value={typeStats.donut || 0} />
          <KpiCard icon="barHorizontal" label="横向柱状" value={typeStats.barHorizontal || 0} />
          <KpiCard icon="areaLine" label="面积折线" value={typeStats.areaLine || 0} />
          <KpiCard icon="progressRing" label="进度环" value={typeStats.progressRing || 0} />
          <KpiCard icon="rankBar" label="排名柱状" value={typeStats.rankBar || 0} />
          <KpiCard icon="line" label="折线图" value={typeStats.line || 0} />
          <KpiCard icon="radar" label="雷达图" value={typeStats.radar || 0} />
          <KpiCard icon="pie" label="饼状图" value={typeStats.pie || 0} />
        </div>
      </section>

      {/* 彩色统计卡片 */}
      <section className="chart-demo-page__section">
        <h2 className="chart-demo-page__section-title">彩色统计卡片</h2>
        <DSColorStatCard
          items={[
            { id: 'project', color: 'purple', label: '省部级以上项目', value: '9,999', unit: '个', compare: '9,999', icon: 'project' },
            { id: 'award', color: 'cyan', label: '国家级奖项', value: '9,999', unit: '项', compare: '9,999', icon: 'award' },
            { id: 'person', color: 'blue', label: '高层次人才', value: '9,999', unit: '人', compare: '9,999', icon: 'person' },
            { id: 'chart', color: 'green', label: '科研项目', value: '9,999', unit: '项', compare: '9,999', icon: 'chart' },
            { id: 'book', color: 'deepPurple', label: '出版著作', value: '9,999', unit: '部', compare: '9,999', icon: 'book' },
            { id: 'money', color: 'pink', label: '科研经费', value: '9,999', unit: '万', compare: '9,999', icon: 'money' },
            { id: 'time', color: 'orange', label: '教学课时', value: '9,999', unit: '时', compare: '9,999', icon: 'time' },
          ]}
        />
      </section>

      {/* 核心图表类型 */}
      <section className="chart-demo-page__section">
        <h2 className="chart-demo-page__section-title">核心图表类型</h2>
        <DSDashboardGrid columns={6} gap={20}>
          <DSDashboardGridItem size="small">
            <DSChartCard {...chartConfigs[0]} />
          </DSDashboardGridItem>

          <DSDashboardGridItem size="small">
            <DSChartCard {...chartConfigs[1]} />
          </DSDashboardGridItem>

          <DSDashboardGridItem size="wide">
            <DSChartCard {...chartConfigs[2]} />
          </DSDashboardGridItem>

          <DSDashboardGridItem size="mini">
            <DSChartCard {...chartConfigs[3]} />
          </DSDashboardGridItem>

          <DSDashboardGridItem size="medium">
            <DSChartCard {...chartConfigs[4]} />
          </DSDashboardGridItem>

          <DSDashboardGridItem size="small">
            <DSChartCard {...chartConfigs[5]} />
          </DSDashboardGridItem>

          <DSDashboardGridItem size="medium">
            <DSChartCard {...chartConfigs[6]} />
          </DSDashboardGridItem>

          <DSDashboardGridItem size="medium">
            <DSChartCard {...chartConfigs[7]} />
          </DSDashboardGridItem>

          <DSDashboardGridItem size="small">
            <DSChartCard {...chartConfigs[8]} />
          </DSDashboardGridItem>
        </DSDashboardGrid>
      </section>

      {/* 引导线环形图(独立整行) */}
      <section className="chart-demo-page__section">
        <h2 className="chart-demo-page__section-title">引导线环形图</h2>
        <DSDashboardGrid columns={6} gap={20}>
          <DSDashboardGridItem size="wide">
            <DSChartCard {...chartConfigs[9]} />
          </DSDashboardGridItem>
        </DSDashboardGrid>
      </section>

      {/* 竖向柱状图与多折线图 */}
      <section className="chart-demo-page__section">
        <h2 className="chart-demo-page__section-title">柱状图与折线图</h2>
        <DSDashboardGrid columns={6} gap={20}>
          <DSDashboardGridItem size="medium">
            <DSChartCard {...chartConfigs[10]} />
          </DSDashboardGridItem>

          <DSDashboardGridItem size="wide">
            <DSChartCard {...chartConfigs[11]} />
          </DSDashboardGridItem>
        </DSDashboardGrid>
      </section>

      {/* 表格形式统计 */}
      <section className="chart-demo-page__section">
        <h2 className="chart-demo-page__section-title">表格形式统计</h2>
        <DSDashboardGrid columns={6} gap={20}>
          <DSDashboardGridItem size="wide">
            <DSTableStatCard
              title="职称结构明细"
              columns={tableColumns}
              data={tableData}
            />
          </DSDashboardGridItem>
        </DSDashboardGrid>
      </section>

      {/* 条形占比统计 */}
      <section className="chart-demo-page__section">
        <h2 className="chart-demo-page__section-title">条形占比统计</h2>
        <DSDashboardGrid columns={6} gap={20}>
          <DSDashboardGridItem size="full">
            <DSSegmentBarCard
              title="数据采集健康度"
              actionLabel="查看详情"
              stats={segmentStats}
              segments={segmentData}
            />
          </DSDashboardGridItem>
        </DSDashboardGrid>
      </section>

      {/* 教师首页卡片示例 */}
      <TeacherHomeCards />

      {/* 配置说明 */}
      <section className="chart-demo-page__section">
        <h2 className="chart-demo-page__section-title">配置说明</h2>
        <div className="chart-demo-page__config-guide">
          <h3>业务页面只需维护 chart config</h3>
          <pre className="chart-demo-page__code">
{`{
  id: 'titleStructure',
  title: '职称结构',
  type: 'donut',
  size: 'small',
  total: 24,
  unit: '人',
  data: [
    { name: '正高级', value: 4 },
    { name: '副高级', value: 7 },
    { name: '中级', value: 10 },
    { name: '初级', value: 3 }
  ],
  insight: '高级职称教师占比 45.8%，专业群师资结构较稳定。'
}`}
          </pre>
          <p className="chart-demo-page__config-note">
            禁止业务页面直接手写 ECharts series、xAxis、yAxis、grid、tooltip、legend、itemStyle、label。
            这些由 buildChartOption 统一生成。
          </p>
        </div>
      </section>
    </div>
  )
}

export default ChartDashboardDemo

createRoot(document.getElementById('app')).render(<ChartDashboardDemo />)