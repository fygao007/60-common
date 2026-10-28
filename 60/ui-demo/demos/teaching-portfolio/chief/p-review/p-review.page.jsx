import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { DSButton, DSCard, DSModal, DSReadOnlyForm, DSTag } from '@wisedu/design-system'
import './p-review.css'

const KPI_ITEMS = [
  { icon: 'teachers', label: '专任教师', value: '8', unit: '人', note: '含校外兼职 1 人' },
  { icon: 'students', label: '专业学生', value: '480', unit: '人', note: '生师比 15 : 1' },
  { icon: 'dual', label: '双师型占比', value: '70', unit: '%', note: '较上学年 ↑3%' },
  { icon: 'projects', label: '在研项目', value: '1', unit: '项', note: '横向 1' },
  { icon: 'awards', label: '本学年获奖', value: '4', unit: '项', note: '省级 2 · 校级 2' },
]

const TITLE_LEGEND = [
  { label: '正高级', value: 1, percent: '12%', tone: 'primary' },
  { label: '副高级', value: 2, percent: '25%', tone: 'info' },
  { label: '中级', value: 4, percent: '50%', tone: 'success' },
  { label: '初级', value: 1, percent: '13%', tone: 'muted' },
]

const ROLE_ROWS = [
  { label: '教学型', value: 3, width: '37.5%' },
  { label: '教学科研型', value: 2, width: '25%' },
  { label: '青年教师', value: 2, width: '25%' },
  { label: '骨干 / 主任', value: 1, width: '12.5%' },
]

const DEGREE_ROWS = [
  { label: '博士', value: 3, width: '37.5%' },
  { label: '硕士', value: 4, width: '50%' },
  { label: '学士', value: 1, width: '12.5%' },
]

const AWARD_LEVELS = [
  { label: '省级', value: 2, percent: '50%', tone: 'success' },
  { label: '校级', value: 2, percent: '50%', tone: 'warning' },
]

const AWARD_SEGMENTS = [
  { key: 'province', tone: 'success', dash: 125.7, offset: 0 },
  { key: 'school', tone: 'warning', dash: 125.7, offset: -125.7 },
]

const ACHIEVEMENTS = [
  {
    id: 'ideology',
    type: 'sz',
    typeLabel: '课程思政',
    title: '《嵌入式系统开发》课程思政案例集',
    owner: '金晓智',
    detail: '案例完整、可直接复用，适合作为专业课程思政共建样板。',
  },
  {
    id: 'competition',
    type: 'cs',
    typeLabel: '竞赛',
    title: '2025 省级职业技能大赛 · 二等奖材料',
    owner: '金晓智',
    detail: '含备赛方案与指导记录，可沉淀为专业竞赛培训资料。',
  },
  {
    id: 'course',
    type: 'kc',
    typeLabel: '课程建设',
    title: '《数字电路》精品在线开放课程',
    owner: '赵敏',
    detail: '课程资源体系完整，可供专业内课程建设与教研活动共享借鉴。',
  },
]

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'sz', label: '课程思政' },
  { key: 'cs', label: '竞赛' },
  { key: 'kc', label: '课程建设' },
]

const CARE_ITEMS = [
  { name: '刘骁', detail: '青年教师 · 档案 79% · 课程材料不完整' },
]

function SectionTitle({ title, meta, action, tone = 'primary' }) {
  return (
    <div className="pr-section-title">
      <span className={`pr-section-title__bar pr-tone-${tone}`} aria-hidden="true" />
      <h2>{title}</h2>
      {meta ? <span className="pr-section-title__meta">{meta}</span> : null}
      {action ? <DSButton className="pr-section-title__action" variant="link" size="small">{action} →</DSButton> : null}
    </div>
  )
}

function MetricIcon({ name }) {
  const icons = {
    teachers: (
      <g>
        <circle cx="8" cy="8" r="3.5" />
        <circle cx="16" cy="8" r="3.5" />
        <path d="M2 20v-1.5a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5V20" />
        <path d="M16 13.5a5 5 0 0 1 5 5V20" />
      </g>
    ),
    students: (
      <g>
        <circle cx="12" cy="7" r="3.5" />
        <circle cx="5" cy="9" r="2.8" />
        <circle cx="19" cy="9" r="2.8" />
        <path d="M5 20v-1.2c0-2.4 1.6-4.3 3.8-4.7l2.2-.3" />
        <path d="M19 20v-1.2c0-2.4-1.6-4.3-3.8-4.7l-2.2-.3" />
        <path d="M7.5 21v-1.8a4.5 4.5 0 0 1 9 0V21" />
      </g>
    ),
    dual: (
      <g>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" fill="var(--ds-color-primary-light)" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 7v5M9 12h6" stroke="currentColor" strokeWidth="2" fill="none" />
      </g>
    ),
    projects: (
      <g>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" fill="var(--ds-color-primary-light)" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
      </g>
    ),
    awards: (
      <g>
        <path d="M7 3h10v7a5 5 0 0 1-10 0V3z" />
        <path d="M12 15v5M8 20h8" />
        <path d="M5 5a4 4 0 0 0 4 4M19 5a4 4 0 0 1-4 4" />
      </g>
    ),
  }
  return (
    <svg className="pr-metric__svg" viewBox="0 0 24 24" aria-hidden="true">
      <g fill="currentColor">
        {icons[name]}
      </g>
    </svg>
  )
}

function MetricCard({ item }) {
  return (
    <DSCard className="pr-metric" padded={false}>
      <div className="pr-metric__label"><span className="pr-metric__ic"><MetricIcon name={item.icon} /></span>{item.label}</div>
      <strong>{item.value}<small>{item.unit}</small></strong>
      <p>{item.note}</p>
    </DSCard>
  )
}

function DonutChart() {
  return (
    <div className="pr-donut" aria-label="职称结构：正高级1人，副高级2人，中级4人，初级1人" role="img">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="pr-donut__track" cx="60" cy="60" r="40" />
        <g className="pr-donut__segments" transform="rotate(-90 60 60)">
          <circle className="pr-donut__segment pr-donut__segment--primary" cx="60" cy="60" r="40" strokeDasharray="30.2 251.3" />
          <circle className="pr-donut__segment pr-donut__segment--info" cx="60" cy="60" r="40" strokeDasharray="62.8 251.3" strokeDashoffset="-30.2" />
          <circle className="pr-donut__segment pr-donut__segment--success" cx="60" cy="60" r="40" strokeDasharray="125.7 251.3" strokeDashoffset="-93" />
          <circle className="pr-donut__segment pr-donut__segment--muted" cx="60" cy="60" r="40" strokeDasharray="32.6 251.3" strokeDashoffset="-218.7" />
        </g>
      </svg>
      <span><strong>8</strong><small>人</small></span>
    </div>
  )
}

function AwardDonut({ total, segments, ariaLabel }) {
  return (
    <div className="pr-donut" aria-label={ariaLabel} role="img">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="pr-donut__track" cx="60" cy="60" r="40" />
        <g className="pr-donut__segments" transform="rotate(-90 60 60)">
          {segments.map((seg) => (
            <circle
              key={seg.key}
              className={`pr-donut__segment pr-donut__segment--${seg.tone}`}
              cx="60" cy="60" r="40"
              strokeDasharray={`${seg.dash} 251.3`}
              strokeDashoffset={seg.offset}
            />
          ))}
        </g>
      </svg>
      <span><strong>{total}</strong><small>项</small></span>
    </div>
  )
}

function BarList({ items, tone = 'primary' }) {
  return (
    <div className="pr-bars">
      {items.map((item) => (
        <div className="pr-bar-row" key={item.label}>
          <span>{item.label}</span>
          <div className="pr-bar-row__track"><i className={`pr-tone-${tone}`} style={{ width: item.width }} /></div>
          <strong>{item.value}<small>人</small></strong>
        </div>
      ))}
    </div>
  )
}

function AchievementCard({ item, onOpen }) {
  const tagTone = { sz: 'warning', cs: 'success', kc: 'primary', sh: 'info' }[item.type]
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen(item)
    }
  }

  return (
    <article className="pr-achievement" role="button" tabIndex={0} onClick={() => onOpen(item)} onKeyDown={handleKeyDown}>
      <h3>{item.title}</h3>
      <div className="pr-achievement__meta">
        <DSTag color={tagTone}>{item.typeLabel}</DSTag>
        <span className="pr-owner">{item.owner}</span>
      </div>
      <span className="pr-achievement__view">查看详情 →</span>
    </article>
  )
}

function PReviewPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeAchievement, setActiveAchievement] = useState(null)

  const visibleAchievements = ACHIEVEMENTS.filter((item) => activeFilter === 'all' || item.type === activeFilter)

  const tagToneOf = (type) => ({ sz: 'warning', cs: 'success', kc: 'primary', sh: 'info' }[type])

  return (
    <main className="pr-page" data-ds-business-page="p-review">
      <section className="pr-metrics" aria-label="专业概览">
        {KPI_ITEMS.map((item) => <MetricCard item={item} key={item.label} />)}
      </section>

      <DSCard className="pr-section-card" layout="long" padded={false}>
        <SectionTitle title="专业人员统计" meta="共 8 人 · 嵌入式技术与应用" />
        <div className="pr-stat-grid">
          <section className="pr-stat-panel">
            <h3>职称结构 <span>正高级 ~ 初级</span></h3>
            <div className="pr-title-chart">
              <DonutChart />
              <div className="pr-legend">
                {TITLE_LEGEND.map((item) => (
                  <div key={item.label}>
                    <i className={`pr-tone-${item.tone}`} />
                    <span>{item.label}</span><strong>{item.value}</strong><small>{item.percent}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="pr-stat-panel">
            <h3>岗位梯队 <span>按岗位类型</span></h3>
            <BarList items={ROLE_ROWS} />
          </section>
          <section className="pr-stat-panel">
            <h3>学历学位 <span>最高学位</span></h3>
            <BarList items={DEGREE_ROWS} tone="success" />
            <div className="pr-degree-summary"><span>研究生学历</span><strong>87.5%</strong></div>
          </section>
          <section className="pr-stat-panel">
            <h3>获奖等级 <span>本学年 4 项</span></h3>
            <div className="pr-title-chart">
              <AwardDonut total="4" segments={AWARD_SEGMENTS} ariaLabel="获奖等级：省级2项，校级2项" />
              <div className="pr-legend">
                {AWARD_LEVELS.map((item) => (
                  <div key={item.label}>
                    <i className={`pr-tone-${item.tone}`} />
                    <span>{item.label}</span><strong>{item.value}</strong><small>{item.percent}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </DSCard>

      <DSCard className="pr-section-card pr-achievement-section" layout="long" padded={false}>
        <SectionTitle title="标志性成果 · 可推广" />
        <div className="pr-filters" role="group" aria-label="成果类型筛选">
          {FILTERS.map((filter) => (
            <DSButton
              className={activeFilter === filter.key ? 'is-active' : ''}
              key={filter.key}
              size="small"
              variant={activeFilter === filter.key ? 'primary' : 'default'}
              rounded
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </DSButton>
          ))}
        </div>
        <div className="pr-achievement-grid">
          {visibleAchievements.map((item) => (
            <AchievementCard item={item} onOpen={setActiveAchievement} key={item.id} />
          ))}
        </div>
      </DSCard>

      <div className="pr-dual-grid">
        <DSCard className="pr-section-card" layout="long" padded={false}>
          <SectionTitle title="需带一把" meta="1 人需关注" action="数据采集督促" tone="warning" />
          <div className="pr-care-list">
            <p>青年教师成长 / 档案补全</p>
            {CARE_ITEMS.map((item) => (
              <div className="pr-care-item" key={item.name}>
                <i aria-hidden="true" /><strong>{item.name}</strong><span>{item.detail}</span>
                <DSButton className="pr-care-item__action" variant="link" size="small">详情</DSButton>
              </div>
            ))}
          </div>
        </DSCard>
        <DSCard className="pr-section-card pr-health-card" layout="long" padded={false}>
          <SectionTitle title="数据采集健康度" tone="success" />
          <div className="pr-health-panel">
            <div className="pr-health-panel__stats">
              <span><b>8</b><small>已覆盖（人）</small></span>
              <span><b className="pr-health-panel__warning">1</b><small>需关注</small></span>
              <span><b>91%</b><small>平均完整度</small></span>
            </div>
            <div className="pr-health__bar" title="完整度分布：良好75%，需完善25%">
              <i className="pr-tone-success" style={{ width: '75%' }} />
              <i className="pr-tone-warning" style={{ width: '25%' }} />
            </div>
            <div className="pr-health-panel__footer">
              <span>完整度分布</span>
              <DSButton className="pr-health__action" variant="link" size="small">查看名单</DSButton>
            </div>
          </div>
        </DSCard>
      </div>

      <DSModal
        open={Boolean(activeAchievement)}
        title={activeAchievement?.title}
        onCancel={() => setActiveAchievement(null)}
        onOk={() => setActiveAchievement(null)}
        okText="关闭"
        showCancel={false}
      >
        {activeAchievement ? (
          <DSReadOnlyForm
            columns={1}
            labelWidth={88}
            items={[
              { label: '成果类型', value: <DSTag color={tagToneOf(activeAchievement.type)}>{activeAchievement.typeLabel}</DSTag> },
              { label: '负责人', value: activeAchievement.owner },
              { label: '内容说明', value: activeAchievement.detail, fullWidth: true },
            ]}
          />
        ) : null}
      </DSModal>

    </main>
  )
}

createRoot(document.getElementById('app')).render(<PReviewPage />)
