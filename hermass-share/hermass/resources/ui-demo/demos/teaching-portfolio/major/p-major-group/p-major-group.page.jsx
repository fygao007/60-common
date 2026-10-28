import { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSCard,
  DSSelect,
  DSChartCard,
  DSButton,
  DSSegmentBarCard,
} from '@wisedu/design-system'
import './p-major-group.css'

// 迁自 p-review：群内人数统计三图数据（职称结构 / 学历学位 / 获奖等级）
const STAFF_TITLE = [
  { name: '正高级', value: 4 },
  { name: '副高级', value: 7 },
  { name: '中级', value: 10 },
  { name: '初级', value: 3 },
]
const STAFF_DEGREE = [
  { name: '博士', value: 8 },
  { name: '硕士', value: 13 },
  { name: '学士', value: 3 },
]
const STAFF_AWARD = [
  { name: '国家级', value: 1 },
  { name: '省级', value: 5 },
  { name: '校级', value: 6 },
]

// 迁自 p-review：6 项 KPI 指标卡数据（替换原 4 项 DSColorStatCard，去重）
// 年度获奖文案从 STAFF_AWARD 派生，避免与图表数据漂移
const KPI_ITEMS = [
  { id: 'teacher', color: 'blue', label: '专任教师', value: '24', unit: '人', compare: '副高及以上 17 人' },
  { id: 'major', color: 'cyan', label: '所含专业', value: '4', unit: '个', compare: '4 个招生方向' },
  { id: 'student', color: 'green', label: '专业群学生', value: '1860', unit: '人', compare: '生师比 18.8 : 1' },
  { id: 'dual', color: 'orange', label: '双师型占比', value: '75', unit: '%', compare: '较上年 ↑ 4%' },
  { id: 'training', color: 'purple', label: '进修培训', value: '22', unit: '人次', compare: '访学 3 · 培训 19' },
  { id: 'award', color: 'pink', label: '年度获奖', value: `${STAFF_AWARD.reduce((s, i) => s + i.value, 0)}`, unit: '项', compare: `国家级 ${STAFF_AWARD[0].value} · 省级 ${STAFF_AWARD[1].value} · 校级 ${STAFF_AWARD[2].value}` },
]

// 需带一把 + 数据采集健康度数据
// 三人完成度差异化，且都低于健康度达标线（85%）
const CARE_ITEMS = [
  { name: '刘晓', detail: '档案完成度 23%' },
  { name: '赵敏', detail: '档案完成度 18%' },
  { name: '金晓智', detail: '档案完成度 31%' },
]

const HEALTH_STATS = [
  { value: '24人', label: '已覆盖教师' },
  { value: '89%', label: '完成率' },
  { value: '3人', label: '需关注教师', risk: true },
]

// 四档分布求和 = 24（与已覆盖教师数对账），末档"70%以下" = 3（与需关注教师数、CARE_ITEMS.length 对账）
const HEALTH_SEGMENTS = [
  { label: '完成85%以上', value: 3, status: 'excellent' },
  { label: '70%-85%', value: 13, status: 'good' },
  { label: '60%-70%', value: 5, status: 'attention' },
  { label: '70%以下(需关注)', value: 3, status: 'risk' },
]

const PERIODS = [
  { key: '1', label: '近1年' },
  { key: '3', label: '近3年' },
  { key: '5', label: '近5年' },
]

// 各周期的数据缩放系数（对齐 t-home 的 PERIOD_FACTORS：切周期数据真变）
const PERIOD_FACTORS = {
  '1': 0.32,
  '3': 0.72,
  '5': 1,
}

// 周期对应的 X 轴年份与年数（近1年=过去4学期，近3年=3个点，近5年=5个点）
const PERIOD_XAXIS = {
  '1': ['2024秋', '2025春', '2025秋', '2026春'],
  '3': ['2024', '2025', '2026'],
  '5': ['2022', '2023', '2024', '2025', '2026'],
}

// 专业数据：招生趋势用 mixed 分类色，下滑专业（嵌入式）用警示色突出
// students 四项求和 = 1860（与 KPI「专业群学生」对账）；faculty 四项求和 = 24（与 KPI「专任教师」/STAFF_* 对账）
const PROFESSIONS = [
  { key: 'embedded', label: '嵌入式技术', color: '#FF454D', enrollment: [126, 121, 109, 96, 88], students: 485, faculty: 7 },
  { key: 'iot', label: '物联网应用', color: '#6D77F7', enrollment: [104, 112, 118, 124, 130], students: 545, faculty: 7 },
  { key: 'chip', label: '集成电路技术', color: '#2ED2CC', enrollment: [88, 96, 103, 110, 118], students: 460, faculty: 5 },
  { key: 'network', label: '计算机网络', color: '#FDBA4B', enrollment: [96, 93, 89, 84, 80], students: 370, faculty: 5 },
]

const MAJOR_OPTIONS = [{ key: 'all', label: '全部专业' }, ...PROFESSIONS.map((item) => ({ key: item.key, label: item.label }))]
const PERIOD_SELECT_OPTIONS = PERIODS.map((item) => ({ value: item.key, label: item.label }))
const MAJOR_SELECT_OPTIONS = MAJOR_OPTIONS.map((item) => ({ value: item.key, label: item.label }))

// 风险警示色：与 PROFESSIONS 下滑专业保持一致（DS Charts 内部按字面色值渲染，无法直接吃 CSS 变量）
const DS_COLOR_RISK = '#FF454D'

// 教学闭环 7 节点完成率：阈值 <85% 标红（不再逐项手写颜色，改一处阈值全部生效）
const CLOSE_LOOP = [
  { name: '课程目标', value: 96 },
  { name: '课程设计', value: 92 },
  { name: '学生关爱', value: 87 },
  { name: '教学效果', value: 84 },
  { name: '教学评价', value: 81 },
  { name: '课程总结', value: 72 },
  { name: '课程反思', value: 68 },
]

// 基准增长率（近5年年度趋势），切周期按系数缩放
const BASE = {
  cooperation: [9, 13, 17, 20, 23],        // 校企合作项目数
}

function PanelTitle({ children, suffix }) {
  return (
    <div className="pmg-panel-title">
      <h2>{children}</h2>
      {suffix ? <span>{suffix}</span> : null}
    </div>
  )
}

function PMajorGroupPage() {
  const [period, setPeriod] = useState('5')
  const [major, setMajor] = useState('all')

  const xAxis = PERIOD_XAXIS[period]

  // 通知 toast（需带一把 / 数据采集健康度 的查看详情）
  const [notice, setNotice] = useState('')
  const noticeTimerRef = useRef(null)
  const showNotice = (message) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current)
    setNotice(message)
    noticeTimerRef.current = setTimeout(() => setNotice(''), 1800)
  }

  const scopedProfessions = useMemo(
    () => (major === 'all' ? PROFESSIONS : PROFESSIONS.filter((item) => item.key === major)),
    [major],
  )

  const periodFactor = PERIOD_FACTORS[period]

  // 群内人数统计三图：按 periodFactor 缩放（切周期数据真变）
  const scaledStaffTitle = useMemo(
    () => STAFF_TITLE.map((item) => ({ ...item, value: Math.max(1, Math.round(item.value * periodFactor)) })),
    [periodFactor],
  )
  const scaledStaffDegree = useMemo(
    () => STAFF_DEGREE.map((item) => ({ ...item, value: Math.max(1, Math.round(item.value * periodFactor)) })),
    [periodFactor],
  )
  const scaledStaffAward = useMemo(
    () => STAFF_AWARD.map((item) => ({ ...item, value: Math.max(1, Math.round(item.value * periodFactor)) })),
    [periodFactor],
  )
  const scaledStaffTotal = useMemo(
    () => scaledStaffTitle.reduce((sum, item) => sum + item.value, 0),
    [scaledStaffTitle],
  )

  // 成果结构与趋势分析三图：按 periodFactor 缩放
  const scaledOutcomeData = useMemo(
    () => [
      { name: '论文', value: Math.max(1, Math.round(38 * periodFactor)) },
      { name: '专利', value: Math.max(1, Math.round(25 * periodFactor)) },
      { name: '课题', value: Math.max(1, Math.round(24 * periodFactor)) },
      { name: '教材', value: Math.max(1, Math.round(9 * periodFactor)) },
    ],
    [periodFactor],
  )
  const scaledCrossData = useMemo(
    () => [
      { name: '论文', values: [16, 12, 8, 2].map((v) => Math.max(1, Math.round(v * periodFactor))) },
      { name: '专利', values: [14, 7, 3, 1].map((v) => Math.max(1, Math.round(v * periodFactor))) },
      { name: '课题', values: [11, 7, 5, 1].map((v) => Math.max(1, Math.round(v * periodFactor))) },
      { name: '教材', values: [4, 3, 2, 0].map((v) => Math.max(0, Math.round(v * periodFactor))) },
    ],
    [periodFactor],
  )
  const scaledAwardData = useMemo(
    () => [
      { name: '国家级', values: [2, 1, 1, 0].map((v) => Math.max(0, Math.round(v * periodFactor))) },
      { name: '省级', values: [5, 4, 3, 2].map((v) => Math.max(1, Math.round(v * periodFactor))) },
      { name: '校级', values: [8, 6, 4, 6].map((v) => Math.max(1, Math.round(v * periodFactor))) },
    ],
    [periodFactor],
  )

  // 师生比（横向柱状）：生师比，超 80 警示（students/faculty 已对账 KPI 总数，比值量级 ~77）
  const ratioData = scopedProfessions.map((item) => {
    const ratio = Number((item.students / item.faculty).toFixed(1))
    return { name: item.label, value: ratio, color: ratio >= 80 ? '#FF454D' : undefined }
  })

  return (
    <main className="pmg-page" data-ds-business-page="p-major-group">
      <header className="pmg-header">
        <div className="pmg-header__identity">
          <h1>电子信息专业群统计分析</h1>
          <dl>
            <div><dt>专业群带头人</dt><dd>陈立群</dd></div>
            <div><dt>所属院系</dt><dd>电子与通信工程学院</dd></div>
            <div><dt>群内专业</dt><dd>4个</dd></div>
            <div><dt>数据更新</dt><dd>2026-07-03 09:30</dd></div>
          </dl>
        </div>
        <div className="pmg-header__controls">
          <div className="pmg-filter">
            <span>分析周期</span>
            <DSSelect
              aria-label="分析周期"
              className="pmg-filter__select"
              options={PERIOD_SELECT_OPTIONS}
              value={period}
              onChange={setPeriod}
            />
          </div>
        </div>
      </header>

      <DSCard className="pmg-section-card pmg-kpi-card" layout="long" padded={false}>
        <div className="pmg-section-head">
          <PanelTitle suffix="（专业群概览）">关键指标</PanelTitle>
        </div>
        <div className="pmg-kpi-list">
          {KPI_ITEMS.map((item) => (
            <div className="pmg-kpi-item" key={item.id}>
              <span className="pmg-kpi-item__label">{item.label}</span>
              <strong className="pmg-kpi-item__value">{item.value}<small>{item.unit}</small></strong>
              {item.compare ? <span className="pmg-kpi-item__compare">{item.compare}</span> : null}
            </div>
          ))}
        </div>
      </DSCard>

      {/* 需带一把 + 数据采集健康度：紧跟关键指标，关注群体中需带动的教师 */}
      <div className="pmg-chart-grid pmg-care-grid">
        <DSCard className="pmg-card pmg-care-card" layout="long" padded={false}>
          <div className="pmg-card-head">
            <h3 className="pmg-card-title">需带一把<span className="pmg-care-card__hint">{CARE_ITEMS.length} 人需关注</span></h3>
          </div>
          <div className="pmg-care-list">
            {CARE_ITEMS.map((item) => (
              <div className="pmg-care-row" key={item.name}>
                <span className="pmg-care-row__status" aria-hidden="true" />
                <strong>{item.name}</strong>
                <span>{item.detail}</span>
                <DSButton variant="link" size="small" onClick={() => showNotice(`${item.name}的档案详情`)}>查看详情</DSButton>
              </div>
            ))}
          </div>
        </DSCard>

        <DSCard className="pmg-card pmg-health-card" layout="long" padded={false}>
          <DSSegmentBarCard
            title="数据采集健康度"
            actionLabel="查看详情"
            onAction={() => showNotice('数据采集健康度详情')}
            stats={HEALTH_STATS}
            segments={HEALTH_SEGMENTS}
          />
        </DSCard>
      </div>

      <DSCard className="pmg-section-card pmg-sec--g1" layout="long" padded={false}>
        <div className="pmg-section-head pmg-section-head--with-filter">
          <PanelTitle suffix="识别各专业招生与师资配置的趋势差异">群内专业结构分析</PanelTitle>
          <div className="pmg-filter pmg-filter--inline">
            <span>专业筛选</span>
            <DSSelect
              aria-label="专业筛选"
              className="pmg-filter__select pmg-filter__select--major"
              options={MAJOR_SELECT_OPTIONS}
              value={major}
              onChange={setMajor}
            />
          </div>
        </div>
        <div className="pmg-chart-grid">
          <DSChartCard
            className="pmg-chart-card"
            title={major === 'all' ? '各专业招生规模趋势' : `招生规模趋势 · ${MAJOR_OPTIONS.find((i) => i.key === major)?.label}`}
            type="line"
            data={scopedProfessions.map((item) => ({ name: item.label, values: item.enrollment.slice(-xAxis.length), color: item.color }))}
            xAxisData={xAxis}
            unit="人"
            palette="mixed"
          />
          <DSChartCard
            className="pmg-chart-card"
            title="各专业师生比（生:师）"
            type="barHorizontal"
            data={ratioData}
            unit=":1"
            palette="mixed"
          />
        </div>
      </DSCard>

      <DSCard className="pmg-section-card pmg-sec--g2" layout="long" padded={false}>
        <div className="pmg-section-head">
          <PanelTitle suffix="关注职称梯队、学历结构与获奖分布">群内人数统计</PanelTitle>
        </div>
        <div className="pmg-chart-grid pmg-chart-grid--3">
          <DSChartCard className="pmg-chart-card" title="职称结构" type="donut" palette="mixed" total={scaledStaffTotal} totalLabel="人" unit="人" data={scaledStaffTitle} />
          <DSChartCard className="pmg-chart-card" title="学历学位" type="barVertical" palette="mixed" unit="人" data={scaledStaffDegree} />
          <DSChartCard className="pmg-chart-card" title="获奖等级" type="donutCallout" palette="mixed" unit="项" data={scaledStaffAward} />
        </div>
      </DSCard>

      <DSCard className="pmg-section-card pmg-sec--g3" layout="long" padded={false}>
        <div className="pmg-section-head">
          <PanelTitle suffix="观察成果类型结构、职称贡献与获奖分布">成果结构与趋势分析</PanelTitle>
        </div>
        <div className="pmg-chart-grid pmg-chart-grid--3">
          <DSChartCard className="pmg-chart-card" title="成果类型结构" type="barHorizontal" unit="项" palette="mixed" data={scaledOutcomeData} />
          <DSChartCard className="pmg-chart-card" title="职称 × 成果类型交叉" type="barVertical" palette="mixed" xAxisData={['正高', '副高', '中级', '初级']} data={scaledCrossData} />
          <DSChartCard className="pmg-chart-card" title="获奖情况" type="barVertical" palette="mixed" xAxisData={['技能大赛', '教学能力', '教学成果', '其它']} data={scaledAwardData} />
        </div>
      </DSCard>

      {/* 末尾：两张独立卡片，不加分组标题 */}
      <div className="pmg-chart-grid pmg-loose-grid">
        <DSChartCard className="pmg-chart-card" title="教学闭环7节点完成率" type="barHorizontal" unit="%" palette="mixed" data={CLOSE_LOOP.map((item) => ({ name: item.name, value: item.value, color: item.value < 85 ? DS_COLOR_RISK : undefined }))} />
        <DSChartCard className="pmg-chart-card" title="校企合作项目趋势" type="line" data={[{ name: '合作项目数', values: BASE.cooperation.slice(-xAxis.length) }]} xAxisData={xAxis} unit="个" palette="mixed" />
      </div>

      {notice ? <div className="pmg-notice" role="status">{notice}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<PMajorGroupPage />)
