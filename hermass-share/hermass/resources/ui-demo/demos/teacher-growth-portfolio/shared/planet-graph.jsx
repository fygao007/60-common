import { useMemo, useState } from 'react'
import { DSButton, DSEChartBase, DSSelect, DSTag } from '@wisedu/design-system'
import './planet-graph.css'

const ROLE_META = {
  teacher: {
    title: '教师成长关系图谱',
    subtitle: '个人发展路径与协作网络',
    accent: '#6c5ce7',
    views: ['people', 'team', 'major'],
    defaultView: 'people',
  },
  dean: {
    title: '学院师资关系图谱',
    subtitle: '学院内专业群、团队与教师协作关系',
    accent: '#2563eb',
    views: ['major', 'team', 'people'],
    defaultView: 'major',
  },
  hr: {
    title: '全校师资关系图谱',
    subtitle: '全校产业、专业群、团队与人才关系',
    accent: '#0f8c81',
    views: ['industry', 'team', 'people'],
    defaultView: 'industry',
  },
  leader: {
    title: '学校办学关系图谱',
    subtitle: '产业—专业群—团队—人才的战略支撑关系',
    accent: '#7c3aed',
    views: ['industry', 'major', 'team'],
    defaultView: 'industry',
  },
  'team-leader': {
    title: '团队协同关系图谱',
    subtitle: '团队内成员协作与成果合作关系',
    accent: '#d97706',
    views: ['team', 'people', 'major'],
    defaultView: 'team',
  },
}

const VIEW_LABELS = {
  industry: '产业图谱',
  team: '团队图谱',
  major: '专业群及岗位图谱',
  people: '人员关系图谱',
}

const VIEW_DATA = {
  industry: {
    title: '产业—专业群支撑关系',
    core: [
      ['电子信息产业', 24, 42, '#f59e0b'],
      ['智能制造产业', 52, 58, '#10b981'],
      ['现代服务产业', 78, 52, '#ef4444'],
    ],
    sat: ['电子信息专业群', '集成电路专业群', '智能制造专业群', '数字商贸专业群', '人工智能技术', '工业机器人', '数字营销', '产教融合基地'],
  },
  team: {
    title: '跨团队协同关系',
    core: [
      ['智能感知创新团队', 27, 48, '#6366f1'],
      ['智能制造技术团队', 52, 45, '#06b6d4'],
      ['数字商贸创新团队', 76, 58, '#8b5cf6'],
    ],
    sat: ['课程共建', '联合科研', '师资共享', '企业导师', '实训基地', '成果转化', '青年教师培养', '技能竞赛'],
  },
  major: {
    title: '专业群—关键岗位匹配关系',
    core: [
      ['电子信息专业群', 28, 48, '#f59e0b'],
      ['智能制造专业群', 52, 43, '#10b981'],
      ['数字商贸专业群', 76, 57, '#ef4444'],
    ],
    sat: ['嵌入式技术岗', '人工智能教学岗', '芯片设计岗', '工业机器人岗', '数字孪生岗', '数字营销岗', '课程负责人', '产业导师'],
  },
  people: {
    title: '教师人才协作关系',
    core: [
      ['张明 · 副教授', 28, 48, '#6366f1'],
      ['周锐 · 教授', 52, 43, '#06b6d4'],
      ['赵敏 · 副教授', 76, 57, '#8b5cf6'],
    ],
    sat: ['陈晓 · 讲师', '李然 · 副教授', '王琳 · 讲师', '共同授课', '联合项目', '师徒关系', '同一团队', '成果合作'],
  },
}

function buildOption(view, accent) {
  const cfg = VIEW_DATA[view]
  const nodes = []
  const links = []
  cfg.core.forEach((c, i) => {
    nodes.push({
      id: `c${i}`,
      name: c[0],
      x: c[1],
      y: c[2],
      symbolSize: 46,
      itemStyle: {
        color: c[3],
        shadowBlur: 18,
        shadowColor: `${c[3]}66`,
      },
      label: { show: true, position: 'top', color: '#1f2937', fontSize: 13, fontWeight: 600 },
    })
  })
  cfg.sat.forEach((name, i) => {
    const parent = i % 3
    const angle = i * 1.9 + parent * 0.7
    const c = cfg.core[parent]
    const color = i % 3 === 0 ? '#0ea5e9' : '#3b82f6'
    nodes.push({
      id: `s${i}`,
      name,
      x: c[1] + Math.cos(angle) * (12 + (i % 2) * 5),
      y: c[2] + Math.sin(angle) * (16 + (i % 3) * 3),
      symbolSize: 16 + (i % 3) * 3,
      itemStyle: {
        color,
        shadowBlur: 10,
        shadowColor: `${color}55`,
      },
      label: { show: true, position: i % 2 ? 'right' : 'left', color: '#4b5563', fontSize: 10 },
    })
    links.push({ source: `c${parent}`, target: `s${i}` })
  })
  links.push({ source: 'c0', target: 'c1' }, { source: 'c1', target: 'c2' })
  return {
    backgroundColor: 'transparent',
    animationDuration: 900,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#1f2937' },
    },
    series: [{
      type: 'graph',
      layout: 'none',
      roam: true,
      draggable: true,
      data: nodes,
      links,
      lineStyle: { color: '#9ca3af', width: 1.2, opacity: 0.55, curveness: 0.06 },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { width: 2.5, opacity: 1 },
        itemStyle: { shadowBlur: 28 },
      },
      coordinateSystem: null,
      left: '2%',
      top: '5%',
      right: '2%',
      bottom: '5%',
    }],
  }
}

export default function PlanetGraph({ role = 'teacher' }) {
  const meta = ROLE_META[role] || ROLE_META.teacher
  const views = meta.views.map((v) => ({ value: v, label: VIEW_LABELS[v] }))
  const [view, setView] = useState(meta.defaultView)
  const [selected, setSelected] = useState(null)
  const [ai, setAi] = useState(false)

  const option = useMemo(() => buildOption(view, meta.accent), [view, meta.accent])
  const cfg = VIEW_DATA[view]

  return (
    <main className="pg-page" data-ds-business-page="relationship-graph" data-pg-role={role}>
      <header>
        <div>
          <span>TEACHER GROWTH RELATIONSHIP INTELLIGENCE</span>
          <h1>{meta.title}</h1>
          <p>{meta.subtitle}</p>
        </div>
        <div>
          <DSSelect value={view} options={views} onChange={(v) => { setView(v); setSelected(null) }} />
          <DSButton variant="outline" onClick={() => setAi((v) => !v)}>AI 发现关系机会</DSButton>
        </div>
      </header>
      <section className="pg-space">
        <div className="pg-grid" />
        <div className="pg-title"><i /><strong>{cfg.title}</strong><i /></div>
        <DSEChartBase option={option} className="pg-chart" onEvents={{ click: (p) => setSelected(p.data) }} />
        <div className="pg-status">
          <span><i className="is-cyan" />核心关系 {cfg.core.length}</span>
          <span><i className="is-blue" />关联节点 {cfg.sat.length}</span>
          <span><i className="is-green" />今日更新</span>
        </div>
        {selected && (
          <aside>
            <button onClick={() => setSelected(null)}>×</button>
            <small>SELECTED NODE</small>
            <h2>{selected.name}</h2>
            <DSTag tone="primary">关系节点</DSTag>
            <dl>
              <div><dt>直接关联</dt><dd>3 条</dd></div>
              <div><dt>间接关联</dt><dd>8 条</dd></div>
              <div><dt>数据可信度</dt><dd>92%</dd></div>
            </dl>
            <p>点击关联节点可继续追溯完整链路；拖拽节点可调整观察位置。</p>
            <DSButton size="small">查看业务详情</DSButton>
          </aside>
        )}
        {ai && (
          <div className="pg-ai">
            <DSTag tone="primary">AI 草稿</DSTag>
            <strong>发现 3 个潜在协同机会</strong>
            <p>智能制造专业群与电子信息专业群之间存在岗位能力互补，可围绕“数字孪生”组建跨专业课程团队。</p>
            <span>依据：岗位能力标签、近三年成果合作、团队成员画像 · 置信度 86%</span>
            <div>
              <DSButton size="small" variant="outline">取数依据</DSButton>
              <DSButton size="small">确认生成建议</DSButton>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
